// Embed the pinned decoder unchanged, apart from removing its ESM export.
// It runs only in a disposable worker; no CDN or photo upload is involved.
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const root=path.resolve(__dirname,'..');
const lib=fs.readFileSync(path.resolve(path.dirname(require.resolve('heic-to')),'../src/lib/libheif-without-unsafe-eval.js'),'utf8');
const worker=lib.replace(/export default buildLibheif\s*$/,'')+`
self.onmessage=async({data:file})=>{
 let decoder,images,lib;
 try {
  lib=await buildLibheif();decoder=new lib.HeifDecoder();images=decoder.decode(await file.arrayBuffer());
  if(!images.length)throw Error('decode');
  const image=images.find(i=>i.is_primary())||images[0],w=image.get_width(),h=image.get_height();
  if(w<1||h<1||w*h>60000000)throw Error('size');
  const pixels=new ImageData(w,h);
  const data=await new Promise((resolve,reject)=>image.display(pixels,d=>d?resolve(d):reject(Error('decode'))));
  const original=new OffscreenCanvas(w,h);original.getContext('2d').putImageData(data,0,0);
  const scale=Math.min(1,4096/Math.max(w,h));
  const output=new OffscreenCanvas(Math.max(1,Math.round(w*scale)),Math.max(1,Math.round(h*scale)));
  const ctx=output.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,output.width,output.height);ctx.drawImage(original,0,0,output.width,output.height);
  const blob=await output.convertToBlob({type:'image/jpeg',quality:.94});
  self.postMessage({blob});
 }catch(error){self.postMessage({error:error.message==='size'?'size':'decode'});}
 finally{if(images)images.forEach(i=>i.free());if(decoder?.decoder)lib.heif_context_free(decoder.decoder);}
};`;
const payload=zlib.gzipSync(worker,{level:9,mtime:0}).toString('base64');
const tag='<script id="roomHeicDecoder" type="application/octet-stream" data-library="heic-to@1.6.7;libheif@1.23.7;LGPL-3.0">'+payload+'</script>';
const file=path.join(root,'index.html');let html=fs.readFileSync(file,'utf8');
if(process.argv.includes('--check')){if(!html.includes(tag))throw Error('HEIC payload is out of date; run node scripts/embed-heic.cjs');console.log('HEIC payload matches pinned decoder and worker source.');process.exit(0);}
html=html.includes('id="roomHeicDecoder"')?html.replace(/<script id="roomHeicDecoder"[^>]*>[\s\S]*?<\/script>/,tag):html.replace('</body>',tag+'\n</body>');
fs.writeFileSync(file,html);fs.copyFileSync(file,path.join(root,'HTML Script/print-mockup generator V14.html'));
console.log('Embedded HEIC worker:',payload.length,'base64 bytes');
