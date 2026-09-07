const ORIGINAL_ORIGIN = 'https://oculivo.rcruz187.chatgpt.site'

export default {
  async fetch(request, env) {
    const incoming = new URL(request.url)
    if (incoming.pathname === '/demo' || incoming.pathname === '/demo/') {
      return Response.redirect('https://taxrescrm.app/book?product=oculivo', 302)
    }
    try {
      const target = new URL(ORIGINAL_ORIGIN)
      target.pathname = incoming.pathname
      target.search = incoming.search

      const headers = new Headers(request.headers)
      headers.delete('host')
      headers.delete('cf-connecting-ip')
      headers.delete('cf-ipcountry')
      headers.delete('cf-ray')
      headers.delete('cf-visitor')
      headers.set('x-forwarded-host', incoming.hostname)

      const upstream = await fetch(new Request(target.toString(), {
        method: request.method,
        headers,
        redirect: 'follow'
      }))

      if (upstream.ok) {
        const outHeaders = new Headers(upstream.headers)
        outHeaders.set('cache-control', 'no-store')
        return new Response(upstream.body, {
          status: upstream.status,
          statusText: upstream.statusText,
          headers: outHeaders
        })
      }
    } catch {}

    return env.ASSETS.fetch(request)
  }
}
