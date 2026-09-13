const ORIGINAL_ORIGIN = 'https://oculivo.rcruz187.chatgpt.site'

function cleanHeaders(headers, cacheControl = 'public, max-age=300, s-maxage=900, stale-while-revalidate=86400') {
  const out = new Headers(headers)
  for (const h of [
    'content-security-policy',
    'content-security-policy-report-only',
    'x-frame-options',
    'cross-origin-opener-policy',
    'cross-origin-resource-policy'
  ]) out.delete(h)
  out.set('cache-control', cacheControl)
  return out
}

function currentPathFor(resolvedUrl) {
  const u = new URL(resolvedUrl)
  return u.pathname + u.search + u.hash
}

function rewriteCss(css, cssUrl) {
  css = css.replace(/url\((['"]?)([^'")]+)\1\)/g, (m, q, raw) => {
    if (/^(data:|blob:|#)/i.test(raw)) return m
    try {
      const resolved = new URL(raw, cssUrl)
      if (resolved.origin === new URL(ORIGINAL_ORIGIN).origin) {
        return 'url("' + currentPathFor(resolved) + '")'
      }
      return 'url("' + resolved.toString() + '")'
    } catch { return m }
  })
  css = css.replace(/@import\s+(?:url\()?(['"])([^'"]+)\1\)?/g, (m, q, raw) => {
    try {
      const resolved = new URL(raw, cssUrl)
      const href = resolved.origin === new URL(ORIGINAL_ORIGIN).origin ? currentPathFor(resolved) : resolved.toString()
      return '@import url("' + href + '")'
    } catch { return m }
  })
  return css
}

async function fetchOriginal(url, request, ttl = 900) {
  const headers = new Headers(request.headers)
  for (const h of ['host','cf-connecting-ip','cf-ipcountry','cf-ray','cf-visitor']) headers.delete(h)
  return fetch(url, {
    method: request.method,
    headers,
    redirect: 'follow',
    cf: request.method === 'GET' ? { cacheEverything: true, cacheTtl: ttl } : undefined
  })
}

export default {
  async fetch(request, env, ctx) {
    const incoming = new URL(request.url)

    if (incoming.pathname === '/demo' || incoming.pathname === '/demo/') {
      return Response.redirect('https://taxrescrm.app/book?product=oculivo', 302)
    }

    if (incoming.pathname === '/app' || incoming.pathname === '/app/' || incoming.pathname.startsWith('/app/')) {
      const target = new URL('https://app.oculivo.com')
      const suffix = incoming.pathname.replace(/^\/app\/?/, '/')
      target.pathname = suffix || '/'
      target.search = incoming.search
      target.hash = incoming.hash
      return Response.redirect(target.toString(), 302)
    }

    const canonicalRedirects = new Map([
      ['/solutions/optometry', '/optometry-software'],
      ['/solutions/optometry/', '/optometry-software'],
      ['/solutions/ophthalmology', '/ophthalmology-software'],
      ['/solutions/ophthalmology/', '/ophthalmology-software'],
      ['/optical', '/optical-management'],
      ['/optical/', '/optical-management']
    ])
    const canonicalTarget = canonicalRedirects.get(incoming.pathname)
    if (canonicalTarget) {
      return Response.redirect(new URL(canonicalTarget, incoming.origin).toString(), 301)
    }

    // Repository-owned routes and public assets must be served from this build.
    // This prevents the legacy origin from shadowing current pricing, SEO pages,
    // favicon/manifest files, and canonical product routes.
    const assetPaths = new Set([
      '/robots.txt',
      '/sitemap.xml',
      '/BingSiteAuth.xml',
      '/favicon.svg',
      '/site.webmanifest',
      '/features',
      '/features/',
      '/pricing',
      '/pricing/',
      '/privacy',
      '/privacy/',
      '/terms',
      '/terms/',
      '/communications',
      '/communications/',
      '/website-seo',
      '/website-seo/',
      '/optometry-software',
      '/optometry-software/',
      '/ophthalmology-software',
      '/ophthalmology-software/',
      '/optical-management',
      '/optical-management/'
    ])

    if (
      assetPaths.has(incoming.pathname) ||
      incoming.pathname === '/locations' ||
      incoming.pathname === '/locations/' ||
      incoming.pathname.startsWith('/locations/')
    ) {
      return env.ASSETS.fetch(request)
    }

    // Preserve the approved Oculivo design served by the existing origin, but
    // cache the transformed response at Cloudflare so repeat traffic does not
    // pay for an origin round trip on every request.
    if (request.method === 'GET') {
      const cache = caches.default
      const cached = await cache.match(request)
      if (cached) return cached
    }

    try {
      const target = new URL(ORIGINAL_ORIGIN)
      target.pathname = incoming.pathname
      target.search = incoming.search
      const upstream = await fetchOriginal(target.toString(), request, 900)

      if (upstream.ok) {
        const type = upstream.headers.get('content-type') || ''
        let response

        if (type.includes('text/html')) {
          let html = await upstream.text()
          const original = new URL(ORIGINAL_ORIGIN)

          // Keep stylesheet links instead of downloading + inlining every CSS
          // file on every HTML request. Origin URLs become same-host paths and
          // are served through this worker with independent long-lived caching.
          html = html
            .replaceAll(original.origin, '')
            .replace(/<base\b[^>]*>/gi, '')
            // Keep the approved proxied homepage design, but expose the current
            // repository pricing route in the primary navigation when the
            // legacy origin has not yet added it.
            .replace(
              /(<a\b[^>]*href=["']\/locations\/?["'][^>]*>\s*Nationwide\s*<\/a>)/i,
              (match) => /href=["']\/pricing\/?["']/i.test(html) ? match : '<a href="/pricing/">Pricing</a>' + match
            )

          const tracking = `
<meta name="msvalidate.01" content="BC8190C5D48F98C3E4C4A6EC29AA5CB3">\n<link rel="manifest" href="/site.webmanifest">
<link rel="icon" type="image/svg+xml" sizes="any" href="/favicon.svg">
<link rel="shortcut icon" href="/favicon.svg">
<script async src="https://www.googletagmanager.com/gtag/js?id=G-WR6GGVYLXX"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-WR6GGVYLXX');</script>
<script>(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,'clarity','script','yguz2tkhnt');</script>`
          if (/<\/head>/i.test(html)) html = html.replace(/<\/head>/i, tracking + '\n</head>')

          response = new Response(html, {
            status: upstream.status,
            statusText: upstream.statusText,
            headers: cleanHeaders(upstream.headers)
          })
        } else if (type.includes('text/css')) {
          const css = rewriteCss(await upstream.text(), upstream.url)
          const headers = cleanHeaders(upstream.headers, 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800')
          headers.set('content-type', 'text/css; charset=utf-8')
          response = new Response(css, { status: upstream.status, headers })
        } else {
          response = new Response(upstream.body, {
            status: upstream.status,
            statusText: upstream.statusText,
            headers: cleanHeaders(upstream.headers, 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800')
          })
        }

        if (request.method === 'GET') {
          ctx.waitUntil(caches.default.put(request, response.clone()))
        }
        return response
      }
    } catch {}

    return env.ASSETS.fetch(request)
  }
}
