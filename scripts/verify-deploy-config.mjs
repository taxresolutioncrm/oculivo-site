import fs from 'node:fs'
const wrangler=fs.readFileSync(new URL('../wrangler.jsonc',import.meta.url),'utf8')
const astro=fs.readFileSync(new URL('../astro.config.mjs',import.meta.url),'utf8')
const worker=fs.readFileSync(new URL('../src/worker.js',import.meta.url),'utf8')
const checks=[
  [wrangler.includes('"main": "./src/worker.js"'),'Cloudflare worker entry points at src/worker.js'],
  [wrangler.includes('"directory": "./dist"')&&wrangler.includes('"binding": "ASSETS"'),'Cloudflare static assets bind the Astro dist directory'],
  [wrangler.includes('"run_worker_first": true'),'Cloudflare runs the Oculivo routing worker before static assets'],
  [wrangler.includes('"secrets"')&&wrangler.includes('"OCULIVO_LEAD_WEBHOOK_URL"')&&wrangler.includes('"OCULIVO_LEAD_WEBHOOK_SECRET"'),'Cloudflare release requires both private backend endpoint and bearer secret'],
  [wrangler.includes('"html_handling": "auto-trailing-slash"'),'Cloudflare HTML handling matches canonical trailing-slash routes'],
  [astro.includes("site: 'https://oculivo.com'")&&astro.includes('compressHTML: true'),'Astro canonical site and HTML compression remain configured'],
  [worker.includes('env.ASSETS.fetch(request)')&&worker.includes("'/'")&&worker.includes("'/index.html'"),'Worker serves the approved first-party homepage from repo assets']
]
let failed=false
for(const [ok,label] of checks){
  if(ok)console.log('PASS:',label)
  else{console.error('FAIL:',label);failed=true}
}
if(failed)process.exit(1)
