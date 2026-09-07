const ORIGINAL_ORIGIN = 'https://oculivo.rcruz187.chatgpt.site'

function cleanHeaders(headers) {
  const out = new Headers(headers)
  for (const h of [
    'content-security-policy',
    'content-security-policy-report-only',
    'x-frame-options',
    'cross-origin-opener-policy',
    'cross-origin-resource-policy'
  ]) out.delete(h)
  out.set('cache-control', 'no-store')
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

async function fetchOriginal(url, request) {
  const headers = new Headers(request.headers)
  for (const h of ['host','cf-connecting-ip','cf-ipcountry','cf-ray','cf-visitor']) headers.delete(h)
  return fetch(url, { method: request.method, headers, redirect: 'follow' })
}

export default {
  async fetch(request, env) {
    const incoming = new URL(request.url)

    if (incoming.pathname === '/demo' || incoming.pathname === '/demo/') {
      return Response.redirect('https://taxrescrm.app/book?product=oculivo', 302)
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

    // SEO-controlled routes must come from the versioned Astro build rather than
    // the legacy design proxy so robots, sitemap, and nationwide pages stay
    // deterministic and deploy with this repository.
    if (
      incoming.pathname === '/robots.txt' ||
      incoming.pathname === '/sitemap.xml' ||
      incoming.pathname === '/locations' ||
      incoming.pathname === '/locations/' ||
      incoming.pathname.startsWith('/locations/')
    ) {
      return env.ASSETS.fetch(request)
    }

    try {
      const target = new URL(ORIGINAL_ORIGIN)
      target.pathname = incoming.pathname
      target.search = incoming.search
      const upstream = await fetchOriginal(target.toString(), request)

      if (upstream.ok) {
        const type = upstream.headers.get('content-type') || ''

        if (type.includes('text/html')) {
          let html = await upstream.text()

          const links = [...html.matchAll(/<link\b[^>]*rel=(['"])stylesheet\1[^>]*href=(['"])([^'"]+)\2[^>]*>/gi)]
          for (const match of links) {
            try {
              const cssUrl = new URL(match[3], upstream.url)
              const cssRes = await fetch(cssUrl.toString(), { redirect: 'follow' })
              if (cssRes.ok) {
                const css = rewriteCss(await cssRes.text(), cssRes.url)
                html = html.replace(match[0], '<style data-oculivo-original="' + cssUrl.pathname + '">' + css + '</style>')
              }
            } catch {}
          }

          const original = new URL(ORIGINAL_ORIGIN)
          html = html
            .replaceAll(original.origin, '')
            .replace(/<base\b[^>]*>/gi, '')

          return new Response(html, {
            status: upstream.status,
            statusText: upstream.statusText,
            headers: cleanHeaders(upstream.headers)
          })
        }

        if (type.includes('text/css')) {
          const css = rewriteCss(await upstream.text(), upstream.url)
          const headers = cleanHeaders(upstream.headers)
          headers.set('content-type', 'text/css; charset=utf-8')
          return new Response(css, { status: upstream.status, headers })
        }

        return new Response(upstream.body, {
          status: upstream.status,
          statusText: upstream.statusText,
          headers: cleanHeaders(upstream.headers)
        })
      }
    } catch {}

    return env.ASSETS.fetch(request)
  }
}
