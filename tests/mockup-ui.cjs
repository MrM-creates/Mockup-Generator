const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8'),source=html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
const jpeg='data:image/jpeg;base64,'+Buffer.from([255,216,255,...Array(30).fill(0)]).toString('base64');
function setup({failHeic=false,idb}={}){
 const elements=new Map(),canvases=[],network=[],downloads=[];let nextFetch=async()=>new Response(JSON.stringify({quad:[{x:.2,y:.1},{x:.8,y:.1},{x:.8,y:.8},{x:.2,y:.8}],remaining:8,limit:10}));
 const make=id=>{if(elements.has(id))return elements.get(id);const classes=new Set();const n={id,value:'',checked:false,style:{},dataset:{},clientWidth:600,events:{},attributes:{},classList:{add:v=>classes.add(v),remove:v=>classes.delete(v),toggle(v,b){b?classes.add(v):classes.delete(v);}},setAttribute(k,v){this.attributes[k]=v;},addEventListener(k,v){this.events[k]=v;},querySelector(){return make(id+'-child');},querySelectorAll(){return [];},closest(){return make(id+'-parent');},getBoundingClientRect(){return {left:0,top:0,width:600,height:400};},showModal(){this.open=true;},close(){this.open=false;this.events.close?.();},removeEventListener(k,fn){if(this.events[k]===fn)delete this.events[k];},setPointerCapture(){},focus(){this.focused=true;},click(){this.clicked=true;},contains(t){return t===this;}};elements.set(id,n);return n;};
 let count=0;const create=tag=>{const n=make('created-'+tag+'-'+count++);if(tag==='canvas'){n.draws=[];n.commands=[];n.context=new Proxy({drawImage(...args){n.draws.push(args);}}, {get(t,k){return k in t?t[k]:(...args)=>{n.commands.push([k,...args]);};}});n.getContext=()=>n.context;n.toDataURL=()=>{n.encoded=true;return jpeg;};n.toBlob=cb=>cb(new Blob(['png']));canvases.push(n);}return n;};
 for(const tag of html.matchAll(/<(?:input|select)[^>]*id="([^"]+)"[^>]*>/g))make(tag[1]).value=tag[0].match(/value="([^"]*)"/)?.[1]||'';
 make('borderMode').value='equal';make('aiRoomStyle').value='swiss';make('roomStyle').value='swiss';make('framePreset').options=[{value:'30x40'}];
 const main=create('canvas');elements.set('roomCanvas',main);
 class FakeImage{constructor(){this.width=1600;this.height=1000;}set src(v){this.url=v;if(failHeic&&v==='blob:heic'){if(this.onerror)this.onerror();}else if(this.onload)this.onload();}}
 const handles=[0,1,2,3].map(i=>{const n=make('room-handle-'+i);n.dataset.roomCorner=String(i);return n;});
 const context=vm.createContext({document:{getElementById:make,querySelector:make,querySelectorAll:s=>s==='[data-room-corner]'?handles:[],createElement:create},window:{addEventListener(){}},location:{protocol:'http:'},Image:FakeImage,URL:{createObjectURL:blob=>{downloads.push(blob);return blob.type==='image/heic'?'blob:heic':'blob:local-room';},revokeObjectURL(){}},navigator:{clipboard:{writeText:async()=>{}}},setTimeout(){},requestAnimationFrame:fn=>fn(),AbortController,File,TextEncoder,Uint8Array,indexedDB:idb,atob,btoa,crypto:require('node:crypto').webcrypto,Blob,fetch:async(url,options)=>{network.push({url,options});return nextFetch(url,options);},console,alert(m){throw Error(m);}});
 vm.runInContext(source,context);const run=code=>vm.runInContext(code,context);
 run("state.imgSrc='blob:original-artwork';state.imgW_PX=4000;state.imgH_PX=5000;state.sourceFile={name:'private-original.jpg'};els.inWidth.value=40;els.inHeight.value=50;els.borderMode.value='equal';els.bTop.value=10;roomEl('roomDialog').open=true;room.ready=true;roomEl('roomAccessCode').value='local-test-access-code';roomEl('roomConsent').checked=true;");
 return {run,make,network,canvases,handles,downloads,setFetch:f=>{nextFetch=f;}};
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
test('virtual generation requires code and consent and sends no artwork or room photo',async()=>{
 const {run,make,network,setFetch}=setup();setFetch(async()=>new Response(JSON.stringify({image:jpeg,remaining:8,limit:10})));
 run("roomEl('roomConsent').checked=false;renderRoom()");await run('generateRoom()');assert.equal(network.length,0);
 run("roomEl('roomConsent').checked=true;roomEl('roomAccessCode').value='short';renderRoom()");await run('generateRoom()');assert.equal(network.length,0);
 run("roomEl('roomAccessCode').value='local-test-access-code';renderRoom()");await run('generateRoom()');assert.equal(network.length,1);
 const payload=JSON.parse(network[0].options.body);assert.equal(payload.mode,'virtual');assert.equal(payload.room,undefined);assert.equal(payload.consent,true);
 assert.ok(!JSON.stringify(payload).includes('original-artwork'));assert.ok(!JSON.stringify(payload).includes('private-original'));assert.ok(run('room.virtual'));assert.ok(make('roomServiceNote').innerText.includes('8 von 10'));
});
test('switching to an own photo cancels virtual generation and ignores the stale reply',async()=>{
 const {run,setFetch,network}=setup();run("room.virtual=roomNewScene(new Image(),'virtual-before');renderRoom()");
 let resolve;setFetch(()=>new Promise(r=>{resolve=r;}));const pending=run('generateRoom()');assert.equal(network.length,1);
 const center=run('room.virtual.center.x'),stage=run("roomEl('roomStage')");stage.events.keydown({key:'ArrowRight',target:{dataset:{}},preventDefault(){}});near(run('room.virtual.center.x'),center);
 run("setRoomMode('own')");assert.equal(network[0].options.signal.aborted,true);
 resolve(new Response(JSON.stringify({image:jpeg,remaining:7,limit:10})));await pending;
 assert.equal(run('room.mode'),'own');assert.equal(run('room.virtual.url'),'virtual-before');assert.equal(run('room.own'),null);
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
 assert.equal(run('room.mode'),'virtual');assert.equal(run('room.own'),previous);assert.ok(network.every(call=>!call.options?.body),'a switch to virtual may fetch metadata, never a room photo');
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
test('own-photo placement and reopen work without network, code or AI controls',async()=>{
 const {run,make,network}=setup();run("loadRoomFile({type:'image/png',size:10});roomEl('roomAccessCode').value='';roomEl('roomConsent').checked=false;roomEl('roomDialog').open=false");
 await run('openRoom()');assert.equal(network.length,0);assert.equal(make('roomGeneration').hidden,true);assert.equal(make('btnSaveRoom').disabled,false);assert.equal(make('btnGenerateRoom').disabled,true);
 run("roomEl('btnGenerateRoom').disabled=false");await run('generateRoom()');assert.equal(network.length,0,'own mode cannot invoke the provider even through a stale control');
 for(const name of ['roomCleanup','roomCompare','roomRemoveConsent','btnRemoveRoomObjects'])assert.ok(!html.includes('id="'+name+'"'));
 assert.ok(!source.includes('roomPhotoForAI'));assert.ok(!source.includes('removeRoomObjects'));
});
test('centering changes only position and retains known wall dimensions and print geometry',()=>{
 const {run,make,network}=setup();run("loadRoomFile({type:'image/png',size:10});beginRoomMeasure();roomEl('roomWallWidth').value=200;roomEl('roomWallHeight').value=150;applyRoomMeasure();room.own.center={x:.7,y:.3}");
 const before=JSON.stringify(run('getPrintLayout()')),quad=JSON.stringify(run('room.own.quad'));
 make('btnCenterRoom').events.click();near(run('room.own.center.x'),.5);near(run('room.own.center.y'),.5);
 assert.equal(run('room.own.planeW'),2000);assert.equal(run('room.own.planeH'),1500);assert.equal(run('room.own.calibrated'),true);assert.equal(JSON.stringify(run('room.own.quad')),quad);assert.equal(JSON.stringify(run('getPrintLayout()')),before);assert.equal(network.length,0);
});
function setupFile(options={}){
 const tools=setup(options);tools.run("els.framePreset.value='30x40';state.fileName='Foto';state.sourceFile=new File([new Uint8Array([0,255,17,128])],'exact.png',{type:'image/png'});state.imgW_PX=1600;state.imgH_PX=1000;els.chkLightBg.checked=false;els.chkTransparent.checked=true;var remembered=[];recentFiles.list=async()=>remembered;recentFiles.remember=async e=>{remembered=remembered.filter(x=>x.id!==e.id);remembered.push(e);return e;};var written=[];var fakeHandle={name:'Print.printstudio',queryPermission:async()=> 'granted',isSameEntry:async other=>other===fakeHandle,createWritable:async()=>({write:async blob=>written.push(blob),close:async()=>{},abort:async()=>{}}),getFile:async()=>new File([written.at(-1)],fakeHandle.name,{type:'application/json'})};var realConfirmReplace=fileConfirmReplace;var pickerCalls=0;window.showSaveFilePicker=()=>{pickerCalls++;return Promise.resolve(fakeHandle);};fileConfirmReplace=async()=>true;");return tools;
}
test('Save writes a chosen file, updates the same file, and Save As creates a separate variant',async()=>{
 const {run}=setupFile();assert.equal(run("fileDirty('print')"),true);assert.equal(await run("fileSave('print')"),true);assert.equal(run('pickerCalls'),1);assert.equal(run("fileDirty('print')"),false);assert.equal(run('remembered.length'),1);
 run('els.bTop.value=20;state.userScale=.73');assert.equal(run("fileDirty('print')"),true);await run("fileSave('print')");assert.equal(run('pickerCalls'),1);assert.equal(run('written.length'),2);assert.equal(run('remembered.length'),1);
 run("var secondWritten=[];var secondHandle={...fakeHandle,name:'Print-Variante.printstudio',isSameEntry:async other=>other===secondHandle,createWritable:async()=>({write:async blob=>secondWritten.push(blob),close:async()=>{},abort:async()=>{}})};window.showSaveFilePicker=()=>{pickerCalls++;return Promise.resolve(secondHandle)};");await run("fileSave('print',true)");assert.equal(run('pickerCalls'),2);assert.equal(run('secondWritten.length'),1);assert.equal(run('remembered.length'),2);assert.equal(run('written.length'),2);
});
test('file round-trip restores all print settings and byte-exact JSX without network',async()=>{
 const {run,make,network}=setupFile();
 run("state.frameStyle='frame-style-oak';state.showFrame=true;state.matColor='#f5f0e6';state.userScale=.73;state.fitToFormat=false;state.previewMode='sheet';els.framePreset.value='custom';els.inWidth.value=47;els.inHeight.value=62;els.borderMode.value='passepartout';els.bTop.value=20;els.bBottom.value=35;els.chkLightBg.checked=true;els.chkTransparent.checked=false;state.orientation='landscape';var beforeLayout=JSON.stringify(getPrintLayout());");
 await run("fileSave('print')");run("state.userScale=1;state.showFrame=false;state.fitToFormat=true;state.matColor='#ffffff';els.bTop.value=0;state.imgSrc=null;");await run('fileOpen(new File([written[0]],fakeHandle.name),fakeHandle)');
 assert.equal(run('JSON.stringify(getPrintLayout())'),run('beforeLayout'));assert.equal(run('state.frameStyle'),'frame-style-oak');assert.equal(run('state.showFrame'),true);assert.equal(run('state.previewMode'),'sheet');assert.equal(make('chkShowFrame').checked,true);assert.equal(make('borderSizeBottom').value,35);assert.equal(run("fileDirty('print')"),false);
 run('var emitted;emitPhotoshopScript=(layout,settings,chunks)=>{emitted={layout,settings,chunks}}');await run('downloadPhotoshopScript()');assert.deepEqual([...Buffer.from(run("emitted.chunks.join('')"),'base64')],[0,255,17,128]);assert.equal(JSON.stringify(run('emitted.layout')),run('beforeLayout'));assert.equal(network.length,0);
});
test('own and generated mockup files restore geometry without paid calls, image uploads or secrets',async()=>{
 const {run,network,setFetch}=setupFile();run("loadRoomFile(new File(['private-room'],'my-room.jpg',{type:'image/jpeg'}));beginRoomMeasure();roomEl('roomWallWidth').value=200;roomEl('roomWallHeight').value=150;applyRoomMeasure();room.own.center={x:.42,y:.35};");
 await run("fileSave('mockup')");const json=await run('written[0].text()');assert.ok(!json.includes('local-test-access-code'));assert.equal(JSON.parse(json).scene.planeW,2000);run('room.own=null');await run("fileOpen(new File([written[0]],'Mockup.printstudio'),fakeHandle)");assert.equal(run('room.mode'),'own');assert.equal(run('room.own.calibrated'),true);assert.equal(run('room.own.planeW'),2000);assert.equal(run('room.own.center.x'),.42);assert.equal(await run('room.own.sourceFile.text()'),'private-room');assert.equal(run("fileDirty('mockup')"),false);
 assert.equal(network.length,0);setFetch(async()=>new Response(JSON.stringify({ready:true,limit:10})));run("room.mode='virtual';room.virtual={...room.own,url:'data:image/jpeg;base64,YWJj',displayBlob:undefined,sourceFile:null,zoom:1.7};");await run("fileSave('mockup',true)");await run("fileOpen(new File([written.at(-1)],'Virtual.printstudio'),fakeHandle)");assert.equal(run('room.mode'),'virtual');assert.equal(run('room.virtual.zoom'),1.7);assert.equal(network.length,1);assert.ok(network.every(call=>!call.options?.body));await new Promise(resolve=>setImmediate(resolve));assert.equal(run('room.ready'),true);
});
test('cancel, missing write permission and disk failure keep changes unsaved and out of recents',async()=>{
 const {run}=setupFile();run("window.showSaveFilePicker=()=>Promise.reject(Object.assign(Error('cancel'),{name:'AbortError'}));");assert.equal(await run("fileSave('print')"),false);assert.equal(run('remembered.length'),0);assert.equal(run("fileDirty('print')"),true);
 run("window.showSaveFilePicker=()=>Promise.resolve(fakeHandle);fakeHandle.queryPermission=async()=> 'prompt';fakeHandle.requestPermission=async()=> 'denied';");assert.equal(await run("fileSave('print')"),false);assert.equal(run('remembered.length'),0);
 run("fakeHandle.queryPermission=async()=> 'granted';fakeHandle.createWritable=async()=>({write:async()=>{throw Error('disk-full')},abort:async()=>{}});");assert.equal(await run("fileSave('print')"),false);assert.equal(run('remembered.length'),0);assert.equal(run("fileDirty('print')"),true);
});
test('edits during a save stay dirty and a recent-list failure does not undo a successful file write',async()=>{
 const {run}=setupFile();run('var releaseWrite;fakeHandle.createWritable=async()=>({write:blob=>{written.push(blob);return new Promise(resolve=>releaseWrite=resolve)},close:async()=>{},abort:async()=>{}});');const saving=run("fileSave('print')");await new Promise(resolve=>setImmediate(resolve));run('els.bTop.value=27;releaseWrite()');assert.equal(await saving,true);assert.equal(run("fileDirty('print')"),true);assert.equal(JSON.parse(await run('written[0].text()')).settings.top,10);
 run("fakeHandle.createWritable=async()=>({write:async b=>written.push(b),close:async()=>{},abort:async()=>{}});recentFiles.remember=async()=>{throw Error('quota')};");assert.equal(await run("fileSave('print')"),true);assert.equal(run("fileDirty('print')"),false);assert.match(run("historyEl('historyFeedback').textContent"),/Datei gespeichert/);
});
test('exports and virtual generation never save documents or browser snapshots automatically',async()=>{
 const {run,setFetch}=setupFile();run("var legacyWrites=0;localHistory.save=async()=>{legacyWrites++};emitPhotoshopScript=()=>{};");await run('downloadPhotoshopScript()');assert.equal(run('remembered.length'),0);assert.equal(run('legacyWrites'),0);assert.equal(run("fileDirty('print')"),true);
 setFetch(async()=>new Response(JSON.stringify({image:jpeg,remaining:8,limit:10})));run("room.mode='virtual';roomEl('roomConsent').checked=true;renderRoom()");await run('generateRoom()');assert.equal(run('remembered.length'),0);assert.equal(run('legacyWrites'),0);assert.equal(run("fileDirty('mockup')"),true);
});
test('corrupt files, invalid geometry and unreadable images retain current work and file binding',async()=>{
 const {run}=setupFile();await run("fileSave('print')");const before=run('state.imgSrc'),session=run('fileSessions.print');assert.equal(await run("fileOpen(new File(['broken'],'bad.printstudio'))"),false);assert.equal(run('state.imgSrc'),before);assert.equal(run('fileSessions.print'),session);
 run("var broken=historyCapture('print');broken.settings.top=4000;");await assert.rejects(run('historyPrepare(broken)'),/layout/);run("broken.settings.top=10;roomImage=async()=>{throw Error('decode-failed')}");await assert.rejects(run('historyPrepare(broken)'),/decode-failed/);assert.equal(run('state.imgSrc'),before);
});
test('opening a recent reference reads current disk content and preserves work for missing or unapproved files',async()=>{
 const {run}=setupFile();await run("fileSave('print')");run('els.bTop.value=35');await run("fileSave('print')");run('els.bTop.value=2');await run('fileOpenRecent(remembered[0])');assert.equal(run('els.bTop.value'),35);
 const before=run('state.imgSrc');run("fakeHandle.getFile=async()=>{throw Error('NotFound')}");await run('fileOpenRecent(remembered[0])');assert.equal(run('state.imgSrc'),before);assert.match(run("historyEl('historyStatus').textContent"),/verschoben oder gelöscht/);
});
test('unsaved replacement can be cancelled, discarded or saved before opening another file',async()=>{
 const {run,make}=setupFile();run("roomEl('roomDialog').open=false");let pending=run('realConfirmReplace()');assert.equal(make('unsavedFileDialog').open,true);make('btnKeepEditing').onclick();assert.equal(await pending,false);assert.equal(run('written.length'),0);
 pending=run('realConfirmReplace()');make('btnDiscardChanges').onclick();assert.equal(await pending,true);assert.equal(run('written.length'),0);
 pending=run('realConfirmReplace()');await make('btnSaveBeforeOpen').onclick();assert.equal(await pending,true);assert.equal(run('written.length'),1);assert.equal(run("fileDirty('print')"),false);
});
test('browser download fallback is labelled and creates no phantom recent file; opening it adds a reference',async()=>{
 const {run,make,downloads}=setupFile();run('delete window.showSaveFilePicker');const saving=run("fileSave('print')");assert.equal(make('fileDownloadDialog').open,true);make('fileDownloadName').value='Mein Print';make('btnDownloadFileConfirm').onclick();assert.equal(await saving,true);assert.equal(run('remembered.length'),0);assert.equal(run('fileSessions.print.downloaded'),true);assert.match(make('printFileStatus').textContent,/Download erstellt/);
 const blob=downloads.find(b=>b.type==='application/json');assert.ok(blob);run(`var fallbackText=${JSON.stringify(await blob.text())}`);await run("fileOpen(new File([fallbackText],'Mein Print.printstudio'))");assert.equal(run('remembered.length'),1);assert.equal(run('remembered[0].handle'),null);assert.equal(run("fileDirty('print')"),false);
});
test('edits while registering an opened file remain unsaved',async()=>{
 const {run}=setupFile();await run("fileSave('print')");run('var finishRemember;recentFiles.remember=e=>new Promise(resolve=>{finishRemember=()=>resolve(e)});');const opening=run("fileOpen(new File([written[0]],'Print.printstudio'),fakeHandle)");await new Promise(resolve=>setImmediate(resolve));run('els.bTop.value=44;finishRemember()');await opening;assert.equal(run("fileDirty('print')"),true);
});
