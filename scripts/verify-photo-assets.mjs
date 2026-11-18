import fs from 'node:fs'
import path from 'node:path'
const root=new URL('../',import.meta.url)
const images=['hero','exam','reception','optical','consultation']
for(const name of images){
 const pathname=path.join(new URL(root).pathname,'public','images',`oculivo-${name}.webp`)
 const file=fs.readFileSync(pathname)
 if(file.length<9000 || file.toString('ascii',0,4)!=='RIFF' || file.toString('ascii',8,12)!=='WEBP' || file.readUInt32LE(4)+8!==file.length){
  throw new Error(`Invalid or truncated image: ${pathname} (${file.length} bytes)`)
 }
 console.log(`PASS: verified complete local image oculivo-${name}.webp (${file.length} bytes)`)
}
const homepage=fs.readFileSync(new URL('../src/pages/index.astro',import.meta.url),'utf8')
if(!homepage.includes('src="/images/oculivo-hero.webp"') || homepage.includes('src="/oculivo-approved-hero.webp"')){
 throw new Error('Homepage hero is not connected to validated approved image')
}
for(const name of ['reception','consultation','optical']){
 if(!homepage.includes(`/images/oculivo-${name}.webp`))throw new Error(`Homepage is missing the local ${name} photograph`)
}
for(const [page,name] of [['optometry-software','exam'],['ophthalmology-software','consultation'],['optical-management','optical'],['communications','reception']]){
 const pageSource=fs.readFileSync(new URL(`../src/pages/${page}/index.astro`,import.meta.url),'utf8')
 if(!pageSource.includes(`src="/images/oculivo-${name}.webp"`))throw new Error(`Incorrect photograph on ${page}`)
}
console.log('PASS: approved Oculivo imagery matches routes and no incomplete hero is referenced')
