const {createHash, timingSafeEqual} = require('node:crypto');

class MockupError extends Error {
  constructor(status, code, message) { super(message); this.status=status; this.code=code; }
}
const styles = {
  swiss:'Bright contemporary Swiss interior, white plaster wall, oak parquet, white modular sideboard, one discreet plant.',
  gallery:'Quiet contemporary art gallery, white wall, polished concrete floor, soft gallery lighting.',
  midcentury:'Warm mid-century living room, walnut sideboard, restrained earth tones and natural daylight.',
  industrial:'Bright industrial loft, softly lit brick wall, dark timber floor, a restrained low sideboard.',
  scandi:'Light Scandinavian living room, pale timber, linen and restrained natural materials.'
};
function settings(env) {
  const limit=Number(env.MOCKUP_DAILY_LIMIT || 10);
  return {
    key:env.OPENAI_API_KEY, code:env.MOCKUP_ACCESS_CODE,
    redisUrl:env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL,
    redisToken:env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN,
    limit:Number.isInteger(limit)&&limit>=1&&limit<=50 ? limit : 10,
    namespace:/^[a-z0-9-]{1,64}$/.test(env.MOCKUP_QUOTA_NAMESPACE||'')?env.MOCKUP_QUOTA_NAMESPACE:env.VERCEL_ENV==='production'?'production':env.VERCEL_ENV==='preview'?'preview':'development'
  };
}
function configured(s) { return Boolean(s.key && s.code?.length>=12 && s.redisUrl && s.redisToken); }
function equalSecret(a,b) {
  const digest=s=>createHash('sha256').update(String(s)).digest();
  return timingSafeEqual(digest(a),digest(b));
}
async function boundedJSON(response,maxBytes) {
  let size=0; const chunks=[];
  for await(const chunk of response.body) {
    size+=chunk.length;
    if(size>maxBytes)throw new MockupError(502,'response_size','Die KI-Antwort war zu gross. Bitte ein neues Mockup versuchen.');
    chunks.push(Buffer.from(chunk));
  }
  try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}
  catch{throw new MockupError(502,'provider_response','Die KI hat keine lesbare Antwort geliefert. Bitte später erneut versuchen.');}
}
function validate(body) {
  if(body&&['own','remove'].includes(body.mode))throw new MockupError(410,'photo_mode_disabled','KI-Fotofunktionen werden nicht mehr angeboten. Bitte die App neu laden. Eigene Fotos werden lokal platziert.');
  if(!body||body.mode!=='virtual'||typeof body.id!=='string'||!/^[0-9a-f-]{36}$/i.test(body.id))throw new MockupError(400,'request','Die Anfrage ist ungültig. Bitte das Mockup erneut öffnen.');
  if(body.consent!==true)throw new MockupError(400,'consent','Bitte der KI-Verarbeitung zuerst zustimmen.');
  if(!Number.isFinite(body.width)||!Number.isFinite(body.height)||body.width<=0||body.height<=0||body.width>3000||body.height>3000)throw new MockupError(400,'dimensions','Die Printmasse sind ungültig. Bitte das Format prüfen.');
  if(!Object.hasOwn(styles,body.style))throw new MockupError(400,'style','Bitte einen der angebotenen Raumstile wählen.');
  if(Object.hasOwn(body,'room'))throw new MockupError(400,'room','Virtuelle Zimmer werden ohne Fotos erzeugt. Eigene Zimmerfotos bleiben lokal.');
}
// One atomic reservation across all function instances. Attempts stay charged against
// the daily ceiling after errors/timeouts: an upstream operation may already have run.
const RESERVE = `
if redis.call('EXISTS', KEYS[2]) == 1 then return {-2, 0} end
if redis.call('EXISTS', KEYS[3]) == 1 then return {-3, 0} end
local used = tonumber(redis.call('GET', KEYS[1]) or '0')
if used >= tonumber(ARGV[1]) then return {-1, used} end
redis.call('SET', KEYS[3], ARGV[2], 'EX', 285)
redis.call('SET', KEYS[2], 'reserved', 'EX', 172800)
used = redis.call('INCR', KEYS[1])
redis.call('EXPIRE', KEYS[1], 172800)
return {1, used}`;
const RELEASE = `if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) end return 0`;
const BAD_AUTH = `local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],120) end return n`;

function createService({env=process.env, fetcher=fetch, now=()=>new Date()}={}) {
  async function redis(s,command) {
    try {
      const url=new URL(s.redisUrl);
      if(url.protocol!=='https:')throw Error('redis-url');
      const response=await fetcher(url.href,{method:'POST',headers:{Authorization:`Bearer ${s.redisToken}`,'Content-Type':'application/json'},body:JSON.stringify(command),signal:AbortSignal.timeout(8000)});
      if(!response.ok)throw Error('redis-status');
      const result=await boundedJSON(response,8192);
      if(result.error||!Object.hasOwn(result,'result'))throw Error('redis-result');
      return result.result;
    }catch{throw new MockupError(503,'quota_unavailable','Der Tageszähler ist gerade nicht erreichbar. Es wurde keine neue KI-Anfrage gestartet. Bitte später erneut versuchen.');}
  }
  async function request(body,authorization) {
    const s=settings(env);
    if(!configured(s))throw new MockupError(503,'setup','Die KI-Einrichtung ist noch nicht abgeschlossen. Eigene Zimmerfotos kannst du bereits ohne KI verwenden.');
    if(typeof authorization!=='string'||authorization.length>512||!equalSecret(authorization,`Bearer ${s.code}`)) {
      const minute=Math.floor(now().getTime()/60000);
      const count=await redis(s,['EVAL',BAD_AUTH,'1',`printstudio:${s.namespace}:auth:${minute}`]);
      if(Number(count)>20)throw new MockupError(429,'access_limit','Zu viele falsche Zugangscodes. Bitte in einer Minute erneut versuchen.');
      throw new MockupError(401,'access','Der Zugangscode stimmt nicht. Bitte prüfen und erneut versuchen.');
    }
    validate(body);
    const date=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Zurich',year:'numeric',month:'2-digit',day:'2-digit'}).format(now());
    const prefix=`printstudio:${s.namespace}:mockup:v1`;
    const reservation=await redis(s,['EVAL',RESERVE,'3',`${prefix}:day:${date}`,`${prefix}:job:${body.id}`,`${prefix}:busy`,String(s.limit),body.id]);
    if(!Array.isArray(reservation)||![1,-1,-2,-3].includes(Number(reservation[0])))throw new MockupError(503,'quota_unavailable','Der Tageszähler liefert keinen gültigen Zustand. Es wurde keine KI-Anfrage gestartet.');
    if(Number(reservation[0])===-1)throw new MockupError(429,'daily_limit',`Das Tageslimit von ${s.limit} KI-Versuchen ist erreicht. Morgen kannst du weiterarbeiten. Dein vorhandenes Mockup bleibt nutzbar.`);
    if(Number(reservation[0])===-2)throw new MockupError(409,'duplicate','Diese Anfrage wurde bereits gestartet. Sie wird nicht erneut ausgeführt.');
    if(Number(reservation[0])===-3)throw new MockupError(429,'busy','Es läuft bereits eine KI-Anfrage. Bitte deren Abschluss abwarten.');
    const remaining=Math.max(0,s.limit-Number(reservation[1]));
    try {
      const input=`Generate exactly one photorealistic room photograph. ${styles[body.style]} Landscape composition, camera looking straight at a large empty wall. Furniture only in the bottom quarter, a clear blank wall in the central 65 percent of the photograph. Natural soft side lighting. No artwork, picture frame, poster, painting, text, watermark, people or placeholders on the wall. A real ${body.width/10} by ${body.height/10} cm print will be composited locally later; do not draw it.`;
      const apiBody={model:'gpt-6.1-sol',store:false,reasoning:{effort:'low'},max_output_tokens:4096,safety_identifier:'printstudio-'+createHash('sha256').update(s.code).digest('hex').slice(0,32),input};
      apiBody.tools=[{type:'image_generation',model:'gpt-image-2.5-sunburst',size:'1536x1024',quality:'medium',output_format:'jpeg',output_compression:80,background:'opaque',action:'generate'}];
      apiBody.tool_choice={type:'image_generation'};
      apiBody.max_tool_calls=1;
      const response=await fetcher('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${s.key}`,'Content-Type':'application/json'},body:JSON.stringify(apiBody),signal:AbortSignal.timeout(240000)});
      if(!response.ok) {
        if(response.status===429)throw new MockupError(503,'provider_limit','OpenAI hat gerade ein Kapazitäts- oder Guthabenlimit erreicht. Bitte API-Guthaben prüfen oder später erneut versuchen.');
        if(response.status===401||response.status===403)throw new MockupError(503,'provider_access','Der Server hat noch keinen gültigen OpenAI-Zugriff auf die benötigten Modelle. Bitte die Einrichtung prüfen.');
        throw new MockupError(502,'provider','Die KI konnte die Anfrage nicht abschliessen. Bitte später erneut versuchen.');
      }
      const result=await boundedJSON(response,4100000);
      if(result.status && result.status!=='completed')throw new MockupError(502,'incomplete','Die KI-Anfrage wurde nicht vollständig abgeschlossen. Bitte später erneut versuchen.');
      const images=(result.output||[]).filter(item=>item.type==='image_generation_call'&&typeof item.result==='string');
      if(images.length!==1||images[0].result.length>3700000||!/^[A-Za-z0-9+/]+={0,2}$/.test(images[0].result))throw new MockupError(502,'image','Die KI hat kein verwendbares Zimmerbild geliefert.');
      const bytes=Buffer.from(images[0].result,'base64');
      if(bytes[0]!==255||bytes[1]!==216||bytes[2]!==255)throw new MockupError(502,'image','Das erzeugte Zimmerbild hat ein unerwartetes Format.');
      const content={image:`data:image/jpeg;base64,${images[0].result}`};
      return {...content,remaining,limit:s.limit};
    }catch(error) {
      if(error instanceof MockupError)throw error;
      throw new MockupError(504,'timeout','Die KI-Anfrage wurde unterbrochen oder hat zu lange gedauert. Ein gestarteter Versuch zählt zum Tageslimit. Bitte nicht sofort mehrfach erneut starten.');
    }finally {
      try{await redis(s,['EVAL',RELEASE,'1',`${prefix}:busy`,body.id]);}catch{/* Expiring lock fails closed until its TTL elapses. */}
    }
  }
  return {status(){const s=settings(env);return {ready:configured(s),limit:s.limit,codeRequired:true};},request};
}
module.exports={createService,MockupError,settings,RESERVE,RELEASE,BAD_AUTH};
