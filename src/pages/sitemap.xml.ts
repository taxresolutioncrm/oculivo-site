const urls = ['','features/','pricing/','privacy/','terms/','solutions/optometry/','solutions/ophthalmology/']
export function GET() {
  const body = '<?xml version="1.0" encoding="UTF-8"?>' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    urls.map(p => '<url><loc>https://oculivo.com/' + p + '</loc></url>').join('') +
    '</urlset>'
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } })
}
