import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')
const pagesRoot=path.join(root,'src','pages')
const files=[]
function walk(dir){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const full=path.join(dir,entry.name)
    if(entry.isDirectory())walk(full)
    else if(entry.name.endsWith('.astro'))files.push(full)
  }
}
walk(pagesRoot)

const routes=new Set(['/','/demo/','/app/'])
for(const file of files){
  let rel=path.relative(pagesRoot,file).replaceAll('\\','/')
  if(rel.includes('['))continue
  rel=rel.replace(/index\.astro$/,'').replace(/\.astro$/,'')
  const route='/'+rel
  routes.add(route.endsWith('/')?route:route+'/')
}

const states=fs.readFileSync(path.join(root,'src','data','states.ts'),'utf8')
for(const m of states.matchAll(/\['([^']+)'\s*,/g))routes.add(`/locations/${m[1]}/`)
const resources=fs.readFileSync(path.join(root,'src','data','seoResources.ts'),'utf8')
for(const m of resources.matchAll(/\bslug\s*:\s*'([^']+)'/g))routes.add(`/resources/${m[1]}/`)

const normalize=(href)=>{
  const clean=href.split('#')[0].split('?')[0]
  if(!clean)return '/'
  return clean.endsWith('/')?clean:clean+'/'
}
const missing=[]
for(const file of files){
  const src=fs.readFileSync(file,'utf8')
  for(const match of src.matchAll(/href=["'](\/[^"']*)["']/g)){
    const href=match[1]
    const route=normalize(href)
    if(!routes.has(route))missing.push(`${path.relative(root,file)} -> ${href}`)
  }
}
if(missing.length){
  console.error('FAIL: unresolved internal links:',[...new Set(missing)].join(', '))
  process.exit(1)
}
console.log(`PASS: ${files.length} Astro pages contain no unresolved internal links`)
