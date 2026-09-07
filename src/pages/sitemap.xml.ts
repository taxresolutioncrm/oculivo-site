const urls = [
  '',
  'features/',
  'pricing/',
  'privacy/',
  'terms/',
  'demo/',
  'communications/',
  'optical/',
  'website-seo/',
  'solutions/optometry/',
  'solutions/ophthalmology/'
]

export function GET() {
  const body = '<?xml version="1.0" encoding="UTF-8"?>' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    urls.map((path) => '<url><loc>https://oculivo.com/' + path + '</loc></url>').join('') +
    '</urlset>'

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' }
  })
}
