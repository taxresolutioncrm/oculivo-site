import assert from 'node:assert/strict'
import {readFileSync,statSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import worker from '../src/worker.js'

let routeHits=[]
const env={
 ASSETS:{fetch:async request=>{
  const path=new URL(request.url).pathname
  routeHits.push(path)
  return new Response('asset:'+path,{status:200,headers:{'content-type':'text/plain'}})
 }}
}
const samples=[
 '/images/oculivo-hero.webp',
 '/images/oculivo-ophthalmology.webp',
 '/images/oculivo-optical.webp',
 '/images/oculivo-reception-team.webp',
 '/images/oculivo-dashboard-preview.webp',
 '/_astro/site.css',
 '/ophthalmology-software/',
 '/optical-management/',
 '/'
]
for(const path of samples){
 const request=new Request('https://oculivo.com'+path)
 const result=await worker.fetch(request,env,{waitUntil:()=>{}})
 assert.equal(result.status,200, 'Expected bundled asset status for '+path)
 assert.equal(await result.text(),'asset:'+path,'Must return directly from ASSETS, never proxy: '+path)
 assert.equal(routeHits.at(-1),path)
 console.log('PASS: local Cloudflare asset route '+path)
}
for(const name of ['hero','ophthalmology','optical','reception-team','optometry']){
 const file=fileURLToPath(new URL('../public/images/oculivo-'+name+'.webp',import.meta.url))
 const bytes=readFileSync(file)
 assert.equal(bytes.toString('ascii',0,4),'RIFF')
 assert.equal(bytes.toString('ascii',8,12),'WEBP')
 assert.equal(bytes.readUInt32LE(4)+8,bytes.length,'WebP must not be truncated '+name)
 assert.ok(statSync(file).size>80000)
 console.log('PASS: verified deployable WebP '+name)
}
console.log('PASS: Oculivo Worker serves all marketing photos from deployed static assets')
