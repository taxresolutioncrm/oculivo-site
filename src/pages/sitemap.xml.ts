import { states } from '../data/states'
import { seoResources } from '../data/seoResources'

const urls = [
  '',
  'features/',
  'pricing/',
  'security/',
  'privacy/',
  'terms/',
  'communications/',
  'optical-management/',
  'website-seo/',
  'optometry-software/',
  'ophthalmology-software/',
  'locations/',
  'resources/',
  'resources/optometry-patient-recall-workflow/',
  'resources/optical-inventory-management-guide/',
  'resources/best-optometry-software-guide/',
  'resources/best-ophthalmology-software-guide/',
  'resources/cloud-based-optometry-software-guide/',
  'resources/ophthalmology-software-buyers-guide/',
  ...seoResources.map((resource) => `resources/${resource.slug}/`),
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
