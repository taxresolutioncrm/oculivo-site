import assert from 'node:assert/strict'
import worker from '../src/worker.js'

const webhook='https://mpxgxfqdbquzkrvvejkh.supabase.co/functions/v1/oculivo-demo-intake'
const env={OCULIVO_LEAD_WEBHOOK_URL:webhook,OCULIVO_LEAD_WEBHOOK_SECRET:'test-secret',ASSETS:{fetch:async()=>new Response('native demo page',{status:200})}}
const payload={
 request_id:'bcb61f21-1db7-490a-a82a-451ce1d5c022',
 name:'Website Lead',email:'lead@example.com',practice:'Sample Vision Center',
 specialty:'optometry',locations:'1',message:'Interested in scheduling.',
 consent:'yes',website:'',utm_source:'google'
}
const make=(body=payload,origin='https://oculivo.com')=>new Request('https://oculivo.com/api/demo-request',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(body)})
const originalFetch=globalThis.fetch
let forwarded=null
globalThis.fetch=async(url,options)=>{forwarded={url:String(url),headers:options.headers,payload:JSON.parse(options.body)};return new Response(JSON.stringify({ok:true}),{status:200,headers:{'content-type':'application/json'}})}
try{
 let r=await worker.fetch(make(),env,{waitUntil:()=>{}})
 assert.equal(r.status,200)
 assert.equal((await r.json()).ok,true)
 assert.equal(forwarded.url,webhook)
 assert.equal(forwarded.headers.authorization,'Bearer test-secret')
 assert.equal(forwarded.payload.product,'oculivo')
 assert.equal(forwarded.payload.source,'oculivo.com')
 assert.equal(forwarded.payload.event,'demo_request')
 assert.equal(forwarded.payload.request_id,payload.request_id)
 assert.equal(forwarded.payload.contact.email,'lead@example.com')
 console.log('PASS: Oculivo native demo submits authorized, product-scoped lead to trusted webhook')
 forwarded=null
 r=await worker.fetch(make(payload,'https://attacker.invalid'),env,{waitUntil:()=>{}})
 assert.equal(r.status,403);assert.equal(forwarded,null)
 console.log('PASS: forged cross-origin form submission rejected')
 r=await worker.fetch(make({...payload,email:'invalid'}),env,{waitUntil:()=>{}})
 assert.equal(r.status,400);assert.equal(forwarded,null)
 console.log('PASS: invalid email does not reach backend')
 r=await worker.fetch(make({...payload,request_id:'not-uuid'}),env,{waitUntil:()=>{}})
 assert.equal(r.status,400);assert.equal(forwarded,null)
 console.log('PASS: invalid idempotency key rejected')
 r=await worker.fetch(make(),{...env,OCULIVO_LEAD_WEBHOOK_SECRET:''},{waitUntil:()=>{}})
 assert.equal(r.status,503);assert.equal(forwarded,null)
 console.log('PASS: missing secret fails closed')
 globalThis.fetch=async()=>new Response('unavailable',{status:503})
 r=await worker.fetch(make(),env,{waitUntil:()=>{}})
 assert.equal(r.status,502)
 assert.equal((await r.json()).ok,false)
 console.log('PASS: upstream failure never produces fake lead success')
 r=await worker.fetch(new Request('https://oculivo.com/demo/'),env,{waitUntil:()=>{}})
 assert.equal(r.status,200)
 assert.equal(await r.text(),'native demo page')
 console.log('PASS: /demo/ serves first-party assets rather than redirecting visitors')
 r=await worker.fetch(new Request('https://oculivo.com/'),env,{waitUntil:()=>{}})
 assert.equal(r.status,200)
 assert.equal(await r.text(),'native demo page')
 console.log('PASS: homepage now uses first-party assets, not a legacy upstream proxy')
}finally{globalThis.fetch=originalFetch}
