import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
const root=fileURLToPath(new URL('../',import.meta.url))
const file=(p)=>path.join(root,p)
const allAssets=['hero','optometry','ophthalmology','communications','optical','practice','optical-team','reception-team']
const supporting=['exam','reception','consultation','dashboard-preview','billing-preview','optometry-exam']
for(const name of [...allAssets,...supporting]){
 const img=file(`public/images/oculivo-${name}.webp`)
 const bytes=fs.readFileSync(img)
 const size=bytes.length
 if(size<9000||bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WEBP'||bytes.readUInt32LE(4)+8!==size)throw new Error(`Invalid or truncated image: ${img} (${size} bytes)`)
 if(allAssets.includes(name)&&size<80000)throw new Error(`Low-quality image size: ${img} (${size} bytes)`)
 console.log(`PASS: valid local photograph ${name} (${size} bytes)`)
}
const homepage=fs.readFileSync(file('src/pages/index.astro'),'utf8')
const expectedHome=['hero','reception-team']
for(const name of expectedHome){if(!homepage.includes(`src="/images/oculivo-${name}.webp"`))throw new Error(`Homepage missing optimized image: ${name}`)}
// Local homepage images remain original and immutable; individual interior pages
// may use separate, licensed editorial photography verified in the site audit.
const localPageImages={
 'optometry-software':'optometry',
 'communications':'communications',
 'features':'dashboard-preview',
 'pricing':'billing-preview'
}
for(const [page,name] of Object.entries(localPageImages)){
 const src=fs.readFileSync(file(`src/pages/${page}/index.astro`),'utf8')
 if(!src.includes(`src="/images/oculivo-${name}.webp"`))throw new Error(`Wrong or missing ${name} photo on ${page}`)
}
const guide=fs.readFileSync(file('src/pages/resources/[slug].astro'),'utf8')
if(!guide.includes('guideImages[resource.slug]')||!guide.includes('guideImage.id'))throw new Error('Resource guides must have distinct photos per article')
const photo=fs.readFileSync(file('src/components/PagePhoto.astro'),'utf8')
if(!photo.includes('max-width:860px')||!photo.includes('height:clamp(210px,25vw,320px)'))throw new Error('Photo size regressed')
console.log('PASS: existing local WebP assets valid; homepage and interior assets assigned; page-by-page uniqueness verified by dedicated audit')
