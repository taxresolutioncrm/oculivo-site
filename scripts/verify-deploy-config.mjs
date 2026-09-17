import fs from 'node:fs'
const wrangler=fs.readFileSync(new URL('../wrangler.jsonc',import.meta.url),'utf8')
const astro=fs.readFileSync(new URL('../astro.config.mjs',import.meta.url),'utf8')
const worker=fs.readFileSync(new URL('../src/worker.js',import.meta.url),'utf8')
const checks=[
  [wrangler.includes('"main": "./src/worker.js"'),'Cloudflare worker entry points at src/worker.js'],
  [wrangler.includes('"directory": "./dist"')&&wrangler.includes('"binding": "ASSETS"'),'Cloudflare static assets bind the Astro dist directory'],
  [wrangler.includes('"run_worker_first": true'),'Cloudflare runs the Oculivo routing worker before static assets'],
  [wrangler.includes('"html_handling": "auto-trailing-slash"'),'Cloudflare HTML handling matches canonical trailing-slash routes'],
  [astro.includes("site: 'https://oculivo.com'")&&astro.includes('compressHTML: true'),'Astro canonical site and HTML compression remain configured'],
  [worker.includes('env.ASSETS.fetch(request)')&&worker.includes('https://oculivo.rcruz187.chatgpt.site'),'Worker preserves repository assets plus the approved legacy homepage origin']
]
let failed=false
for(const [ok,label] of checks){
  if(ok)console.log('PASS:',label)
  else{console.error('FAIL:',label);failed=true}
}
if(failed)process.exit(1)
