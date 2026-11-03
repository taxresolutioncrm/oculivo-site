
// Same-origin lead intake. The delivery target must be configured and verified
// before release; never report success without a 2xx response from that target.
async function handleOculivoDemoRequest(request, env) {
  const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}})
  if(request.method!=='POST')return json({ok:false,error:'Method not allowed'},405)
  if(new URL(request.url).origin!==request.headers.get('origin'))return json({ok:false,error:'Invalid request origin'},403)
  if(!String(request.headers.get('content-type')||'').toLowerCase().startsWith('application/json'))return json({ok:false,error:'JSON required'},415)
  const length=Number(request.headers.get('content-length')||0)
  if(length>8192)return json({ok:false,error:'Request too large'},413)
  let data
  try {
    const raw=await request.text()
    if(raw.length>8192)return json({ok:false,error:'Request too large'},413)
    data=JSON.parse(raw)
  }catch{return json({ok:false,error:'Invalid form data'},400)}
  if(!data || typeof data!=='object' || Array.isArray(data))return json({ok:false,error:'Invalid form data'},400)
  if(String(data.website||'').trim())return json({ok:true}) // honeypot, never forward spam
  const value=(key,max)=>String(data[key]||'').trim().slice(0,max)
  const name=value('name',120),email=value('email',254),practice=value('practice',160)
  const specialty=value('specialty',40),locations=value('locations',12),message=value('message',900)
  const validSpecialties=['optometry','ophthalmology','optical','multi-specialty','other']
  if(!name||!practice||!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!validSpecialties.includes(specialty)||data.consent!=='yes'){
    return json({ok:false,error:'Please complete the required fields using a valid email address.'},400)
  }
  if(!['1','2-5','6+'].includes(locations))return json({ok:false,error:'Invalid number of locations'},400)
  const endpoint=String(env.OCULIVO_LEAD_WEBHOOK_URL||'').trim()
  const secret=String(env.OCULIVO_LEAD_WEBHOOK_SECRET||'')
  if(!endpoint||!secret)return json({ok:false,error:'Online requests are temporarily unavailable.'},503)
  let target
  try{target=new URL(endpoint)}catch{return json({ok:false,error:'Online requests are temporarily unavailable.'},503)}
  if(target.protocol!=='https:'||target.username||target.password||target.hash)return json({ok:false,error:'Online requests are temporarily unavailable.'},503)
  const submission={
    product:'oculivo',source:'oculivo.com',event:'demo_request',
    contact:{name,email:email.toLowerCase(),practice,specialty,locations,message},
    attribution:{utm_source:value('utm_source',120),utm_medium:value('utm_medium',120),utm_campaign:value('utm_campaign',120),landing_path:value('landing_path',120)},
    consent:true,submitted_at:new Date().toISOString()
  }
  try{
    const response=await fetch(target.toString(),{
      method:'POST',headers:{'content-type':'application/json','authorization':'Bearer '+secret,'x-oculivo-event':'demo_request'},
      body:JSON.stringify(submission),redirect:'manual',signal:AbortSignal.timeout(12000)
    })
    if(!response.ok)return json({ok:false,error:'Unable to deliver the request. Please use the booking calendar instead.'},502)
    return json({ok:true})
  }catch{
    return json({ok:false,error:'Unable to deliver the request. Please use the booking calendar instead.'},502)
  }
}

const ORIGINAL_ORIGIN = 'https://oculivo.rcruz187.chatgpt.site'
const HOME_SCHEMA = JSON.stringify({
  '@context':'https://schema.org',
  '@graph':[
    {'@type':'Organization','@id':'https://oculivo.com/#organization','name':'Oculivo','url':'https://oculivo.com/','parentOrganization':{'@type':'Organization','name':'RomyLabs','url':'https://romylabs.com/'}},
    {'@type':'WebSite','@id':'https://oculivo.com/#website','url':'https://oculivo.com/','name':'Oculivo','publisher':{'@id':'https://oculivo.com/#organization'}}
  ]
})

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

function canonicalPublicUrl(incoming) {
  let pathname = incoming.pathname || '/'
  if (pathname !== '/' && !pathname.endsWith('/') && !/\.[a-z0-9]+$/i.test(pathname)) pathname += '/'
  return 'https://oculivo.com' + pathname
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

    if (incoming.hostname.toLowerCase() === 'www.oculivo.com') {
      const canonical = new URL(request.url)
      canonical.protocol = 'https:'
      canonical.hostname = 'oculivo.com'
      return Response.redirect(canonical.toString(), 301)
    }

    if (incoming.pathname === '/api/demo-request') {
      return handleOculivoDemoRequest(request, env)
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

    const assetPaths = new Set([
      '/robots.txt',
      '/sitemap.xml',
      '/BingSiteAuth.xml',
      '/favicon.svg',
      '/site.webmanifest',
      '/demo',
      '/demo/',
      '/features',
      '/features/',
      '/pricing',
      '/pricing/',
      '/security',
      '/security/',
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
      incoming.pathname.startsWith('/locations/') ||
      incoming.pathname === '/resources' ||
      incoming.pathname === '/resources/' ||
      incoming.pathname.startsWith('/resources/')
    ) {
      return env.ASSETS.fetch(request)
    }

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

          html = html
            .replaceAll(original.origin, '')
            .replace(/href=(["'])https:\/\/taxrescrm\.app\/book\?product=oculivo\1/gi,'href="/demo/"')
            .replace(/<base\b[^>]*>/gi, '')
            .replace(/<a\b[^>]*href=["']\/website-seo\/?["'][^>]*>\s*Website\s*\+\s*SEO\s*<\/a>/gi, '')
            .replace(
              /(<a\b[^>]*href=["']\/locations\/?["'][^>]*>\s*Nationwide\s*<\/a>)/ig,
              (match, _anchor, offset, whole) => {
                const before = whole.slice(Math.max(0, offset - 500), offset)
                return /href=["']\/pricing\/?["']/i.test(before) ? match : '<a href="/pricing/">Pricing</a>' + match
              }
            )

          // Preserve the approved design while aligning search snippets with the
          // actual high-intent optometry and ophthalmology software queries.
          if (incoming.pathname === '/' || incoming.pathname === '') {
            html=html.replace(/<title>[\\s\\S]*?<\\/title>/i,
              '<title>Optometry &amp; Ophthalmology Practice Management Software | Oculivo</title>')
            html=html.replace(/<meta\\s+[^>]*name=["']description["'][^>]*>/gi,'')
          }
          // Normalize public SEO signals inherited from the legacy origin.
          html = html
            .replace(/<meta\s+[^>]*name=["'](?:robots|googlebot|bingbot)["'][^>]*>/gi, '')
            .replace(/<link\s+[^>]*rel=["']canonical["'][^>]*>/gi, '')

          const trackingParts = []
          trackingParts.push('<link rel="canonical" href="' + canonicalPublicUrl(incoming) + '">')
          trackingParts.push('<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">')
          if (!/msvalidate\.01/i.test(html)) trackingParts.push('<meta name="msvalidate.01" content="BC8190C5D48F98C3E4C4A6EC29AA5CB3">')
          if (!/site\.webmanifest/i.test(html)) trackingParts.push('<link rel="manifest" href="/site.webmanifest">')
          if (!/href=["']\/favicon\.svg["']/i.test(html)) {
            trackingParts.push('<link rel="icon" type="image/svg+xml" sizes="any" href="/favicon.svg">')
            trackingParts.push('<link rel="shortcut icon" href="/favicon.svg">')
          }
          if (incoming.pathname === '/' || incoming.pathname === '') {
            trackingParts.push('<meta name="description" content="Oculivo connects optometry and ophthalmology scheduling, patient workflows, optical operations, billing and communications. Request a private software demo.">')
            if (!/oculivo\.com\/#organization/i.test(html)) trackingParts.push('<script type="application/ld+json">'+HOME_SCHEMA.replace(/<\/script/gi,'<\\/script')+'<\/script>')
          }
          if (!html.includes('G-WR6GGVYLXX')) {
            trackingParts.push('<script async src="https://www.googletagmanager.com/gtag/js?id=G-WR6GGVYLXX"><\/script>')
            trackingParts.push('<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag("js",new Date());gtag("config","G-WR6GGVYLXX");<\/script>')
          }
          if (!html.includes('yguz2tkhnt')) {
            trackingParts.push('<script>(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,"clarity","script","yguz2tkhnt");<\/script>')
          }
          if (!html.includes('oculivo_cta_click')) {
            trackingParts.push('<script>document.addEventListener("click",function(e){var a=e.target&&e.target.closest?e.target.closest("a"):null;if(!a)return;var h=a.getAttribute("href")||"",t=(a.textContent||"").trim().replace(/\\s+/g," ").slice(0,120),c="";if(h.indexOf("taxrescrm.app/book?product=oculivo")>-1||h==="/demo/"||h==="/demo")c="demo";else if(h==="/pricing/"||h==="/pricing")c="pricing";else if(h==="/app/"||h==="/app")c="app";if(!c)return;if(typeof window.gtag==="function")window.gtag("event","oculivo_cta_click",{cta_type:c,link_url:h,link_text:t,page_path:location.pathname});else{window.dataLayer=window.dataLayer||[];window.dataLayer.push({event:"oculivo_cta_click",cta_type:c,link_url:h,link_text:t,page_path:location.pathname})}},true);<\/script>')
          }
          const tracking = trackingParts.join('\n')
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
