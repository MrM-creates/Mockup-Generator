const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const api=require('../api/mockup.js');
const root=path.resolve(__dirname,'..');
const port=Number(process.env.PORT||4173);
http.createServer((req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(pathname==='/api/mockup')return api(req,res);
  const file=pathname==='/'||pathname==='/index.html'?'index.html':pathname==='/version.json'?'version.json':null;
  if(!file||req.method!=='GET'){res.statusCode=404;res.end('Not found');return;}
  res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type',file.endsWith('.json')?'application/json':'text/html; charset=utf-8');
  fs.createReadStream(path.join(root,file)).pipe(res);
}).listen(port,'127.0.0.1',()=>console.log(`Print Studio: http://127.0.0.1:${port} (nur lokal)`));
