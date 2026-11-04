const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8'),source=html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
const jpeg='data:image/jpeg;base64,'+Buffer.from([255,216,255,...Array(30).fill(0)]).toString('base64');
function setup({failHeic=false}={}){
 const elements=new Map(),canvases=[],network=[];let nextFetch=async()=>new Response(JSON.stringify({quad:[{x:.2,y:.1},{x:.8,y:.1},{x:.8,y:.8},{x:.2,y:.8}],remaining:8,limit:10}));
 const make=id=>{if(elements.has(id))return elements.get(id);const classes=new Set();const n={id,value:'',checked:false,style:{},dataset:{},clientWidth:600,events:{},attributes:{},classList:{add:v=>classes.add(v),remove:v=>classes.delete(v),toggle(v,b){b?classes.add(v):classes.delete(v);}},setAttribute(k,v){this.attributes[k]=v;},addEventListener(k,v){this.events[k]=v;},querySelector(){return make(id+'-child');},querySelectorAll(){return [];},closest(){return make(id+'-parent');},getBoundingClientRect(){return {left:0,top:0,width:600,height:400};},showModal(){this.open=true;},close(){this.open=false;},setPointerCapture(){},focus(){this.focused=true;},click(){this.clicked=true;},contains(t){return t===this;}};elements.set(id,n);return n;};
 let count=0;const create=tag=>{const n=make('created-'+tag+'-'+count++);if(tag==='canvas'){n.draws=[];n.commands=[];n.context=new Proxy({drawImage(...args){n.draws.push(args);}}, {get(t,k){return k in t?t[k]:(...args)=>{n.commands.push([k,...args]);};}});n.getContext=()=>n.context;n.toDataURL=()=>{n.encoded=true;return jpeg;};n.toBlob=cb=>cb(new Blob(['png']));canvases.push(n);}return n;};
 for(const tag of html.matchAll(/<(?:input|select)[^>]*id="([^"]+)"[^>]*>/g))make(tag[1]).value=tag[0].match(/value="([^"]*)"/)?.[1]||'';
 make('borderMode').value='equal';make('aiRoomStyle').value='swiss';make('roomStyle').value='swiss';make('framePreset').options=[{value:'30x40'}];
 const main=create('canvas');elements.set('roomCanvas',main);
 class FakeImage{constructor(){this.width=1600;this.height=1000;}set src(v){this.url=v;if(failHeic&&v==='blob:heic'){if(this.onerror)this.onerror();}else if(this.onload)this.onload();}}
 const handles=[0,1,2,3].map(i=>{const n=make('room-handle-'+i);n.dataset.roomCorner=String(i);return n;});
 const context=vm.createContext({document:{getElementById:make,querySelector:make,querySelectorAll:s=>s==='[data-room-corner]'?handles:[],createElement:create},window:{addEventListener(){}},location:{protocol:'http:'},Image:FakeImage,URL:{createObjectURL:blob=>blob.type==='image/heic'?'blob:heic':'blob:local-room',revokeObjectURL(){}},navigator:{clipboard:{writeText:async()=>{}}},setTimeout(){},requestAnimationFrame:fn=>fn(),AbortController,crypto:require('node:crypto').webcrypto,Blob,fetch:async(url,options)=>{network.push({url,options});return nextFetch(url,options);},console,alert(m){throw Error(m);}});
 vm.runInContext(source,context);const run=code=>vm.runInContext(code,context);
 run("state.imgSrc='blob:original-artwork';state.imgW_PX=4000;state.imgH_PX=5000;state.sourceFile={name:'private-original.jpg'};els.inWidth.value=40;els.inHeight.value=50;els.borderMode.value='equal';els.bTop.value=10;roomEl('roomDialog').open=true;room.ready=true;roomEl('roomAccessCode').value='local-test-access-code';roomEl('roomConsent').checked=true;");
 return {run,make,network,canvases,handles,setFetch:f=>{nextFetch=f;}};
}
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
test('perspective mapping and inverse preserve all four corners and interior points',()=>{
 const {run}=setup();
 for(const q of [[{x:0,y:0},{x:1,y:0},{x:1,y:1},{x:0,y:1}],[{x:.2,y:.1},{x:.85,y:.25},{x:.7,y:.9},{x:.1,y:.75}]]){
  run(`var testQuad=${JSON.stringify(q)};var matrix=roomHomography(testQuad);var inverse=roomInverse(matrix)`);
  [[0,0],[1,0],[1,1],[0,1]].forEach(([x,y],i)=>{const p=run(`roomProject(matrix,${x},${y})`);near(p.x,q[i].x);near(p.y,q[i].y);});
  for(const [x,y]of [[.3,.2],[.7,.8],[.5,.5]]){const p=run(`var p=roomProject(matrix,${x},${y});roomProject(inverse,p.x,p.y)`);near(p.x,x);near(p.y,y);}
 }
 assert.equal(run('roomValidQuad([{x:0,y:0},{x:1,y:1},{x:1,y:0},{x:0,y:1}])'),false);
});
test('local room upload and calibrated physical placement never change or transmit the print',()=>{
 const {run,network,make,canvases}=setup();const before=JSON.stringify(run('getPrintLayout()'));
 run("loadRoomFile({type:'image/jpeg',size:100,name:'living-room.jpg'})");assert.equal(network.length,0);assert.equal(run('room.mode'),'own');
 assert.equal(JSON.stringify(run('getPrintLayout()')),before);
 run("beginRoomMeasure();roomEl('roomWallWidth').value=200;roomEl('roomWallHeight').value=150;applyRoomMeasure()");
 assert.equal(run('room.own.calibrated'),true);
 const projected=run('var inverse=roomInverse(roomHomography(room.own.quad));roomArtQuad().map(p=>roomProject(inverse,p.x,p.y))');
 near((projected[1].x-projected[0].x)*2000,400);near((projected[3].y-projected[0].y)*1500,500);
 const tex=canvases.find(c=>c.draws.some(a=>a[0]===make('previewImg')));assert.ok(tex,'foreground uses the loaded original, not an AI image');
 assert.equal(network.length,0);assert.equal(JSON.stringify(run('getPrintLayout()')),before);
 run("state.showFrame=true;state.thicknessMM=15;renderRoom()");const framed=run('var inv=roomInverse(roomHomography(room.own.quad));roomArtQuad().map(p=>roomProject(inv,p.x,p.y))');
 near((framed[1].x-framed[0].x)*2000,430);near((framed[3].y-framed[0].y)*1500,530);
 assert.equal(JSON.stringify(run('getPrintLayout()')),before);
});
test('consent and code gate AI; only a re-encoded room background can leave the browser',async()=>{
 const s=setup(),{run,make,network,canvases}=s;run("loadRoomFile({type:'image/png',size:200});room.ready=true;renderRoom()");
 await run('generateRoom()');assert.equal(network.length,0,'upload cleared consent');
 run("roomEl('roomConsent').checked=true;roomEl('roomAccessCode').value='short';renderRoom()");await run('generateRoom()');assert.equal(network.length,0);
 run("roomEl('roomAccessCode').value='local-test-access-code';renderRoom()");await run('generateRoom()');assert.equal(network.length,1);
 const payload=JSON.parse(network[0].options.body);assert.equal(payload.room,jpeg);assert.equal(payload.mode,'own');assert.equal(payload.consent,true);
 assert.ok(!JSON.stringify(payload).includes('original-artwork'));assert.ok(!JSON.stringify(payload).includes('private-original'));
 const copy=canvases.find(c=>c.encoded);assert.equal(copy.draws.length,1);assert.equal(copy.draws[0][0],run('room.own.image'));assert.notEqual(copy.draws[0][0],make('previewImg'));
 assert.equal(run('room.own.calibrated'),false);assert.ok(make('roomServiceNote').innerText.includes('8 von 10'));
});
test('a cancelled/stale AI reply never overwrites a newly selected room or mode',async()=>{
 const {run,setFetch,network}=setup();run("loadRoomFile({type:'image/jpeg',size:100});room.ready=true;roomEl('roomConsent').checked=true;renderRoom()");
 let resolve;setFetch(()=>new Promise(r=>{resolve=r;}));const pending=run('generateRoom()');assert.equal(network.length,1);
 const center=run('room.own.center.x'),stage=run("roomEl('roomStage')");
 stage.events.keydown({key:'ArrowRight',target:{dataset:{}},preventDefault(){}});near(run('room.own.center.x'),center);assert.equal(run("roomEl('btnRoomMeasure').disabled"),true);
 run("setRoomMode('virtual')");assert.equal(network[0].options.signal.aborted,true);
 resolve(new Response(JSON.stringify({quad:[{x:.1,y:.1},{x:.9,y:.1},{x:.9,y:.9},{x:.1,y:.9}],remaining:7,limit:10})));await pending;
 assert.equal(run('room.mode'),'virtual');assert.equal(run('room.virtual'),null);assert.equal(run('room.own.quad[0].x'),0);
});
test('keyboard/scale/calibration updates are local; PNG excludes interface guides',()=>{
 const {run,make,network}=setup();run("loadRoomFile({type:'image/jpeg',size:100})");const before=JSON.stringify(run('getPrintLayout()')),x=run('room.own.center.x');
 make('roomStage').events.keydown({key:'ArrowRight',target:{dataset:{}},preventDefault(){}});near(run('room.own.center.x'),x+.01);
 make('roomZoom').events.input({target:{value:'150'}});near(run('room.own.zoom'),1.5);assert.equal(network.length,0);
 run('beginRoomMeasure()');assert.equal(make('roomHandles').hidden,false);assert.equal(make('btnSaveRoom').disabled,true);
 run("roomEl('roomWallWidth').value=10;roomEl('roomWallHeight').value=10;applyRoomMeasure()");assert.equal(run('room.editing'),true);
 run("roomEl('roomWallWidth').value=200;roomEl('roomWallHeight').value=150;applyRoomMeasure();saveRoom()");assert.equal(make('roomHandles').hidden,true);
 assert.equal(JSON.stringify(run('getPrintLayout()')),before);assert.equal(network.length,0);assert.ok(make('roomStatus').innerText.includes('PNG gespeichert'));
});
test('Photos promised-file drags and drops anywhere in the dialog load locally',()=>{
 const {make,run,network}=setup(),dialog=make('roomDialog');let prevented=0,stopped=0;
 const event=dataTransfer=>({dataTransfer,preventDefault(){prevented++;},stopPropagation(){stopped++;}});
 const promised={types:['com.apple.pasteboard.promised-file-url'],files:[],items:[]};
 dialog.events.dragenter(event(promised));dialog.events.dragover(event(promised));
 assert.equal(promised.dropEffect,'copy');assert.equal(prevented,2);
 dialog.events.drop(event({files:[],items:[{kind:'file',getAsFile:()=>({name:'IMG_1234.JPG',type:'',size:120})}]}));
 assert.equal(run('room.mode'),'own');assert.equal(network.length,0);assert.equal(prevented,3);assert.equal(stopped,3);
 dialog.events.drop(event({files:[],items:[]}));assert.match(make('roomStatus').innerText,/keine Bilddatei.*⌘V/);
 dialog.events.drop(event({files:[{type:'image/png',size:5},{type:'image/png',size:5}]}));assert.match(make('roomStatus').innerText,/jeweils ein/);
});
test('Photos paste is local and never intercepts text fields or virtual-room mode',()=>{
 const {make,run,network}=setup(),dialog=make('roomDialog');let prevented=0;
 const event=editable=>({target:{closest:()=>editable?{}:null},clipboardData:{files:[],items:[{kind:'file',getAsFile:()=>({type:'image/png',size:100})}]},preventDefault(){prevented++;},stopPropagation(){}});
 dialog.events.paste(event(false));assert.equal(prevented,0);
 run("setRoomMode('own')");dialog.events.paste(event(true));assert.equal(prevented,0);
 dialog.events.paste(event(false));assert.equal(prevented,1);assert.ok(run('room.own'));assert.equal(network.length,0);
});
test('HEIC and untyped photos are decoded locally; empty and unsupported files keep the previous room',()=>{
 const {run,make,network}=setup();run("loadRoomFile({type:'image/heic',size:100,name:'IMG_1234.HEIC'})");assert.ok(run('room.own'));
 const original=run('room.own');run("loadRoomFile({type:'',size:0,name:'pending.jpg'})");assert.equal(run('room.own'),original);assert.match(make('roomStatus').innerText,/keine Bilddaten/);
 run("loadRoomFile({type:'',size:120,name:'bad.txt'})");assert.equal(run('room.own'),original);assert.equal(network.length,0);
});
test('unsupported HEIC converts locally and keeps print/source data unchanged',async()=>{
 const {run,make,network}=setup({failHeic:true});const before=JSON.stringify(run('getPrintLayout()'));
 run("roomConvertHeic=async(file,sequence)=>{if(file.type!=='image/heic')throw Error('wrong file');return new Blob(['jpeg'],{type:'image/jpeg'});};loadRoomFile({type:'image/heic',size:100,name:'room.heic'})");
 await new Promise(resolve=>setImmediate(resolve));
 assert.ok(run('room.own'));assert.match(make('roomStatus').innerText,/HEIC-Foto lokal vorbereitet/);
 assert.equal(JSON.stringify(run('getPrintLayout()')),before);assert.equal(run('state.sourceFile.name'),'private-original.jpg');assert.equal(network.length,0);
});
test('HEIC failures retain the previous room and stale conversion cannot reopen a closed/switched view',async()=>{
 const {run,make,network}=setup({failHeic:true});run("loadRoomFile({type:'image/png',size:100})");const previous=run('room.own');
 run("roomConvertHeic=async()=>{throw Error('decode');};loadRoomFile({type:'image/heic',size:100})");await new Promise(resolve=>setImmediate(resolve));
 assert.equal(run('room.own'),previous);assert.match(make('roomStatus').innerText,/konnte nicht vorbereitet/);
 run("var finishHeic;roomConvertHeic=()=>new Promise(resolve=>finishHeic=resolve);loadRoomFile({type:'image/heic',size:100});setRoomMode('virtual');finishHeic(new Blob(['jpeg'],{type:'image/jpeg'}))");await new Promise(resolve=>setImmediate(resolve));
 assert.equal(run('room.mode'),'virtual');assert.equal(run('room.own'),previous);assert.equal(network.length,0);
 run("setRoomMode('own');loadRoomFile({type:'image/heic',size:100});roomEl('btnDoneRoom').events.click();finishHeic(new Blob(['jpeg'],{type:'image/jpeg'}))");await new Promise(resolve=>setImmediate(resolve));assert.equal(run('room.own'),previous);assert.equal(make('roomDialog').open,false);
});
test('wall measurements show field guidance and enable apply only for two valid physical values',()=>{
 const {run,make}=setup();run("loadRoomFile({type:'image/png',size:10});beginRoomMeasure()");
 assert.equal(make('btnApplyRoomMeasure').disabled,true);assert.match(make('roomWallWidthHelp').innerText,/gemessene Breite/);assert.match(make('roomWallHeightHelp').innerText,/gemessene Höhe/);
 make('roomWallWidth').value='200';make('roomWallWidth').events.input();assert.equal(make('btnApplyRoomMeasure').disabled,true);
 make('roomWallHeight').value='20';make('roomWallHeight').events.input();assert.equal(make('roomWallHeight').attributes['aria-invalid'],'true');assert.match(make('roomWallHeightHelp').innerText,/mindestens/);
 make('roomWallHeight').value='150.5';make('roomWallHeight').events.input();assert.equal(make('btnApplyRoomMeasure').disabled,false);assert.equal(make('roomWallHeight').attributes['aria-invalid'],'false');
 run('applyRoomMeasure()');assert.equal(run('room.own.planeH'),1505);assert.equal(run('room.own.calibrated'),true);
});
test('object marking has keyboard and pointer paths, separate consent and no automatic network',()=>{
 const {run,make,network}=setup();run("loadRoomFile({type:'image/png',size:10});room.ready=true;roomToggleRemoval();roomAddRegion()");
 assert.equal(make('roomStage').focused,true);assert.equal(run('room.removing'),true);assert.equal(make('btnRemoveRoomObjects').disabled,true);
 const stage=make('roomStage'),x=run('room.regions[0].x'),width=run('room.regions[0].width');
 const key=(key,shiftKey=false)=>stage.events.keydown({key,shiftKey,target:{dataset:{}},preventDefault(){},stopPropagation(){}});
 key('ArrowRight');near(run('room.regions[0].x'),x+.01);key('ArrowRight',true);near(run('room.regions[0].width'),width+.05);
 run("roomEl('roomRemoveConsent').checked=true;renderRoom()");assert.equal(make('btnRemoveRoomObjects').disabled,false);key('ArrowDown');assert.equal(make('roomRemoveConsent').checked,false);
 const pointer=(x,y)=>({button:0,clientX:x,clientY:y,pointerId:1,target:{dataset:{}},preventDefault(){}});
 stage.events.pointerdown(pointer(300,200));stage.events.pointermove(pointer(420,300));stage.events.pointerup();assert.equal(run('room.regions.length'),2);near(run('room.regions[1].width'),.2);near(run('room.regions[1].height'),.25);
 key('Delete');assert.equal(run('room.regions.length'),1);key('Escape');assert.equal(run('room.removing'),false);assert.equal(network.length,0);
});
test('only background/marked regions are sent for removal; compare/reset keep calibration, position and print',async()=>{
 const {run,make,network,canvases,setFetch}=setup();run("loadRoomFile({type:'image/png',size:10});beginRoomMeasure();roomEl('roomWallWidth').value=200;roomEl('roomWallHeight').value=150;applyRoomMeasure();roomAddRegion();room.ready=true;roomEl('roomRemoveConsent').checked=true;renderRoom();roomImage=async()=>({width:1536,height:960})");
 const before=JSON.stringify(run('getPrintLayout()')),position=JSON.stringify(run('room.own.center')),quad=JSON.stringify(run('room.own.quad'));
 setFetch(async()=>new Response(JSON.stringify({image:'data:image/jpeg;base64,test',remaining:6,limit:10})));
 await run('removeRoomObjects()');
 assert.ok(run('room.own.edited'));const payload=JSON.parse(network[0].options.body);assert.equal(payload.mode,'remove');assert.equal(payload.editConsent,true);assert.equal(payload.room,jpeg);assert.ok(!JSON.stringify(payload).includes('original-artwork'));
 const prepared=canvases.find(c=>c.encoded);assert.equal(prepared.draws.length,1);assert.equal(prepared.draws[0][0],run('room.own.image'));
 const composite=run('room.own.edited');assert.ok(composite.commands.some(c=>c[0]==='clip'));assert.ok(composite.commands.some(c=>c[0]==='rect'));
 run('roomCompareOriginal(true)');assert.equal(run('roomBackground(room.own)'),run('room.own.image'));
 run('roomCompareOriginal(false)');assert.equal(run('roomBackground(room.own)'),composite);
 run('roomResetEdit()');assert.equal(run('room.own.edited'),null);assert.equal(JSON.stringify(run('room.own.center')),position);assert.equal(JSON.stringify(run('room.own.quad')),quad);assert.equal(run('room.own.calibrated'),true);assert.equal(JSON.stringify(run('getPrintLayout()')),before);
});
test('failed or stale object removal leaves the photo and original intact',async()=>{
 const {run,setFetch}=setup();run("loadRoomFile({type:'image/png',size:10});roomAddRegion();room.ready=true;roomEl('roomRemoveConsent').checked=true;renderRoom()");const original=run('room.own.image');
 setFetch(async()=>new Response(JSON.stringify({error:'no result'}),{status:502}));await run('removeRoomObjects()');assert.equal(run('room.own.edited'),undefined);assert.equal(run('room.own.image'),original);
 let resolve;setFetch(()=>new Promise(r=>resolve=r));const pending=run('removeRoomObjects()');run("setRoomMode('virtual')");resolve(new Response(JSON.stringify({image:'data:image/jpeg;base64,test'})));await pending;assert.equal(run('room.mode'),'virtual');assert.equal(run('room.own.edited'),undefined);
});
