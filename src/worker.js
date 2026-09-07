const ORIGINAL_HOST = 'oculivo.com'
const ORIGINAL_MARKERS = ['Oculivo', 'Founding practice']

async function tryOrigin(request, targetUrl, extraHeaders = {}) {
  try {
    const incoming = new URL(request.url)
    const target = new URL(targetUrl)
    target.pathname = incoming.pathname
    target.search = incoming.search
    const headers = new Headers(request.headers)
    for (const [k, v] of Object.entries(extraHeaders)) headers.set(k, v)
    const upstream = await fetch(new Request(target.toString(), {
      method: request.method,
      headers,
      redirect: 'follow'
    }))
    if (!upstream.ok) return null

    const ct = upstream.headers.get('content-type') || ''
    if (ct.includes('text/html')) {
      const html = await upstream.text()
      if (!ORIGINAL_MARKERS.some((m) => html.includes(m))) return null
      const outHeaders = new Headers(upstream.headers)
      outHeaders.set('cache-control', 'no-store')
      return new Response(html, { status: upstream.status, headers: outHeaders })
    }
    return upstream
  } catch {
    return null
  }
}

export default {
  async fetch(request, env) {
    const candidates = [
      ['https://custom-domains.chatgpt.site', {
        'host': ORIGINAL_HOST,
        'x-forwarded-host': ORIGINAL_HOST,
        'x-original-host': ORIGINAL_HOST,
        'forwarded': 'host=' + ORIGINAL_HOST
      }],
      ['http://172.66.3.26', { 'host': ORIGINAL_HOST }],
      ['http://162.159.143.30', { 'host': ORIGINAL_HOST }]
    ]

    for (const [url, headers] of candidates) {
      const response = await tryOrigin(request, url, headers)
      if (response) return response
    }

    return env.ASSETS.fetch(request)
  }
}
