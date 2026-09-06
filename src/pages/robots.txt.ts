export function GET() {
  return new Response('User-agent: *\nAllow: /\nSitemap: https://oculivo.com/sitemap.xml\n', {
    headers: { 'Content-Type': 'text/plain' }
  })
}
