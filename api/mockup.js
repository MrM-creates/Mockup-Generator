const {createService,MockupError}=require('../lib/mockup-service.cjs');
const MAX_BODY=1800000;
const service=createService();

async function readBody(req) {
  if(Number(req.headers['content-length']||0)>MAX_BODY)throw new MockupError(413,'size','Das Zimmerfoto ist zu gross. Bitte in der App neu auswählen.');
  if(req.body!==undefined) {
    const text=typeof req.body==='string'?req.body:JSON.stringify(req.body);
    if(Buffer.byteLength(text)>MAX_BODY)throw new MockupError(413,'size','Die Anfrage ist zu gross.');
    try{return typeof req.body==='string'?JSON.parse(text):req.body;}catch{throw new MockupError(400,'json','Die Anfrage ist nicht lesbar.');}
  }
  let size=0;const chunks=[];
  for await(const chunk of req){size+=chunk.length;if(size>MAX_BODY)throw new MockupError(413,'size','Die Anfrage ist zu gross.');chunks.push(chunk);}
  try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw new MockupError(400,'json','Die Anfrage ist nicht lesbar.');}
}
function createHandler(instance=service,env=process.env) {
  return async(req,res)=>{
    res.setHeader('Cache-Control','private, no-store');
    res.setHeader('Content-Type','application/json; charset=utf-8');
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Referrer-Policy','no-referrer');
    const send=(status,body)=>{res.statusCode=status;res.end(JSON.stringify(body));};
    try {
      if(req.method==='GET')return send(200,instance.status());
      if(req.method!=='POST'){res.setHeader('Allow','GET, POST');return send(405,{error:'Bitte die Mockup-Funktion in der App verwenden.',code:'method'});}
      const origin=req.headers.origin;
      const origins=['https://mockup-generator-sable.vercel.app',...(env.VERCEL_URL?[`https://${env.VERCEL_URL}`]:[])];
      const local=!env.VERCEL && origin && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
      if((origin&&!origins.includes(origin)&&!local)||req.headers['sec-fetch-site']==='cross-site')throw new MockupError(403,'origin','Bitte die Mockup-Funktion direkt in Print Studio öffnen.');
      if(!String(req.headers['content-type']||'').startsWith('application/json'))throw new MockupError(415,'content_type','Bitte die Anfrage über Print Studio senden.');
      const body=await readBody(req);
      const result=await instance.request(body,req.headers.authorization);
      send(200,result);
    }catch(error) {
      const known=error instanceof MockupError;
      send(known?error.status:500,{error:known?error.message:'Das Mockup konnte nicht verarbeitet werden. Bitte später erneut versuchen.',code:known?error.code:'server'});
    }
  };
}
module.exports=createHandler();
module.exports.createHandler=createHandler;
