import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const root=fileURLToPath(new URL('../',import.meta.url))
const read=p=>fs.readFileSync(path.join(root,p),'utf8')
const assert=(ok,message)=>{if(!ok)throw new Error(message);console.log('PASS: '+message)}
const entries=[]
const routes=[]
function scan(folder){
 for(const item of fs.readdirSync(path.join(root,folder),{withFileTypes:true})){
  const p=path.posix.join(folder,item.name)
  if(item.isDirectory())scan(p)
  else if(item.name.endsWith('.astro'))routes.push(p)
 }
}
scan('src/pages')
const home=read('src/pages/index.astro')
const homeSources=[...home.matchAll(/<img\s+src="([^"]+)"[^>]*>/g)].map(m=>m[1])
assert(homeSources.length===4,'Homepage has four specified photographs')
for(let i=0;i<homeSources.length;i++)entries.push({route:'/'+['hero','optometry','ophthalmology','optical'][i],source:homeSources[i]})
for(const route of routes){
 if(route==='src/pages/index.astro'||route.includes('[slug]'))continue
 const source=read(route)
 const photo=source.match(/<PagePhoto\s+src="([^"]+)"\s+alt="([^"]+)"/)
 if(photo){
  assert(photo[2].length>=32,'Contextual photo alt text on '+route)
  entries.push({route,source:photo[1]})
 }
 if(route.includes('/index.astro') && !route.includes('locations/[state]') && !route.includes('resources/[slug]')){
  assert(/<Base\s+title=/.test(source),'Page has search title '+route)
  assert(/\sdescription=/.test(source),'Page has search description '+route)
  assert(/<h1\b/.test(source),'Page has clear first-level heading '+route)
 }
}
const dynamic=read('src/pages/resources/[slug].astro')
const seo=read('src/data/seoResources.ts')
const slugs=[...seo.matchAll(/\bslug:'([^']+)'/g)].map(x=>x[1])
const mappings=[...dynamic.matchAll(/'([^']+)':\{id:(\d+),alt:'([^']+)'\}/g)].map(x=>({slug:x[1],id:Number(x[2]),alt:x[3]}))
assert(slugs.length===10&&mappings.length===slugs.length,'All ten generated editorial guides have explicit photo assignments')
assert(slugs.every(x=>mappings.some(m=>m.slug===x)),'Every generated guide has an article-specific photograph')
assert(dynamic.includes('if(!guideImage) throw new Error'),'Missing editorial assignments must fail build')
for(const m of mappings)entries.push({route:'/resources/'+m.slug+'/',source:'https://images.pexels.com/photos/'+m.id+'/pexels-photo-'+m.id+'.jpeg?auto=compress&cs=tinysrgb&w=1600&q=85'})
const seen=new Map()
for(const {route,source} of entries){
 if(seen.has(source))throw new Error('Duplicate photo between '+seen.get(source)+' and '+route+': '+source)
 seen.set(source,route)
 if(source.startsWith('/images/'))assert(fs.existsSync(path.join(root,'public',source)),'Local image exists: '+route)
 else assert(/^https:\/\/images\.pexels\.com\/photos\/(\d+)\/pexels-photo-\1\.jpeg\?auto=compress&cs=tinysrgb&w=1600&q=85$/.test(source),'Editorial image uses approved high-resolution Pexels URL: '+route)
}
assert(entries.length>=26,'Comprehensive photographic inventory covers all product pages and editorial guides')
assert(new Set(entries.map(x=>x.source)).size===entries.length,'ZERO duplicate photo assignments across all rendered routes')
const price=read('src/pages/pricing/index.astro')
assert(['$399','$599','$799'].every(x=>home.includes(x)&&price.includes(x)),'All three monthly pricing tiers match homepage and pricing page')
const shell=read('src/layouts/Base.astro')
assert(shell.includes('href="/oculivo-favicon.png"')&&shell.includes('oculivo-brand-logo.png'),'Shared header preserves approved Oculivo brand and favicon')
assert(shell.includes('href="/pricing/">Pricing</a>'),'Pricing linked from navigation')
const broken=[...routes.map(x=>[x,read(x)])].flatMap(([route,content])=>[...content.matchAll(/href="(\/(?!\/)[^"#?]*?)"/g)].filter(x=>x[1].includes('//')).map(x=>route+': '+x[1]))
assert(!broken.length,'No malformed internal URLs in authored pages')
const external=[...seen.keys()].filter(x=>x.startsWith('https://'))
if(process.env.CHECK_PHOTO_HTTP==='1'){
 // CI preflight: prevent another image-placeholder regression by confirming each
 // remote source returns an actual image before merge.
 const errors=[]
 let i=0
 async function worker(){
  while(i<external.length){
   const src=external[i++]
   try{
    const signal=AbortSignal.timeout(14000)
    const r=await fetch(src,{method:'GET',headers:{Range:'bytes=0-1023'},signal})
    const ct=r.headers.get('content-type')||''
    if(!r.ok||!ct.startsWith('image/'))errors.push(src+': '+r.status+' '+ct)
    else console.log('PASS: live editorial image '+new URL(src).pathname)
    await r.body?.cancel()
   }catch(e){errors.push(src+': '+(e?.message||e))}
  }
 }
 await Promise.all(Array.from({length:Math.min(5,external.length)},()=>worker()))
 assert(!errors.length,'All remote photo sources accessible as images: '+errors.join(' | '))
}
console.log('FINAL: '+entries.length+' unique photo placements; '+routes.length+' Astro pages and templates audited')
