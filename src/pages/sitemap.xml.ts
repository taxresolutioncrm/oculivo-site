import { states } from '../data/states'

const urls = [
  '',
  'features/',
  'pricing/',
  'privacy/',
  'terms/',
  'demo/',
  'tour/',
  'communications/',
  'optical-management/',
  'website-seo/',
  'security/',
  'optometry-software/',
  'ophthalmology-software/',
  'locations/',
  ...states.map(([slug]) => `locations/${slug}/`)
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
