const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync('index.html', 'utf8');
const elements = new Map();
function element(key) {
  if (!elements.has(key)) elements.set(key, {
    value: '', style: {}, clientWidth: 600, dataset: {}, checked: true,
    attributes:{},setAttribute(name,value){this.attributes[name]=value;},
    getBoundingClientRect(){return {left:0,top:0,width:parseFloat(this.style.width)||100,height:parseFloat(this.style.height)||100};},
    setPointerCapture(){},contains(target){return target===this;},
    classList: {values:new Set(),add(v){this.values.add(v);},remove(v){this.values.delete(v);},toggle(v,active){if(active)this.values.add(v);else this.values.delete(v);},contains(v){return this.values.has(v);}}, events: {}, addEventListener(type, fn){this.events[type]=fn;}, click(){},
    closest(){return element(key+'-parent');}, querySelector(){return element(key+'-child');}, querySelectorAll(){return []}
  });
  return elements.get(key);
}
for (const tag of html.matchAll(/<(?:input|select)[^>]*id="([^"]+)"[^>]*>/g)) {
  element(tag[1]).value = tag[0].match(/value="([^"]*)"/)?.[1] || '';
}
element('borderMode').value = 'equal';
element('aiRoomStyle').value = 'swiss';
const handles=['nw','ne','sw','se'].map(corner=>{const node=element('handle-'+corner);node.dataset.corner=corner;return node;});
const modes=['none','equal','passepartout'].map(mode=>{const node=element('mode-'+mode);node.dataset.borderMode=mode;return node;});
function queryAll(selector) {return selector === '.resize-handle' ? handles : selector === '[data-border-mode]' ? modes : [];}
let output;
class FakeImage {set src(value){this.width=600;this.height=800;if(this.onload)this.onload();}}
const windowEvents={};
const context = vm.createContext({
  document: { getElementById:element, querySelector:element, querySelectorAll:queryAll, createElement:()=>element('link') },
  window:{addEventListener(type,fn){windowEvents[type]=fn;}}, URL:{createObjectURL(blob){if(blob.content!==undefined)output=blob.content; return 'blob:test';},revokeObjectURL(){}},
  Image:FakeImage,setTimeout(){},btoa:value=>Buffer.from(value,'binary').toString('base64'),
  Blob:class{constructor(parts){this.content=parts.join('');}}, alert(message){throw Error(message);}, console
});
const source = html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
vm.runInContext(source, context);
const run = code => vm.runInContext(code, context);
function near(actual, expected) { assert.ok(Math.abs(actual-expected)<1e-7, `${actual} != ${expected}`); }
function execute(withPhoto=false, sourceW=600, sourceH=800, scriptOverride=null) {
  if(scriptOverride){run('calcAndRender()');output=scriptOverride;}else run('calcAndRender(); downloadPhotoshopScript()');
  const layout=run('getPrintLayout()');
  const makeUnit=v=>({as(){return v;}});
  const photo={x:0,y:0,w:sourceW,h:sourceH,
    get bounds(){return [this.x,this.y,this.x+this.w,this.y+this.h].map(makeUnit);},
    resize(x,y){near(x,y); this.w*=x/100;this.h*=y/100;},
    translate(x,y){this.x+=x.value;this.y+=y.value;}
  };
  const temporaryFiles=[];
  function PSFile(path){
    this.path=path;this.data=[];temporaryFiles.push(this);
    this.open=mode=>{assert.equal(mode,'w');return true;};
    this.write=value=>{assert.equal(this.encoding,'BINARY');this.data.push(Buffer.from(value,'binary'));return true;};
    this.close=()=>true;
    this.remove=()=>{this.removed=true;return true;};
  }
  let dialogs=0;
  PSFile.openDialog=()=>{dialogs++;return withPhoto?{}:null;};
  const layers=[];
  const doc={selection:{select(){},fill(){},deselect(){}},guides:{add(){}},artLayers:{add(){const l={};layers.push(l);return l;}}};
  const ps={app:{bringToFront(){},preferences:{rulerUnits:'original'},documents:{add(){return doc;}}},
    Units:{PIXELS:1}, NewDocumentMode:{RGB:1}, DocumentFill:{WHITE:1}, Direction:{VERTICAL:1,HORIZONTAL:2},
    UnitValue:function(v){this.value=v;}, SolidColor:function(){this.rgb={};},
    File:PSFile,Folder:{temp:{fsName:'/tmp'}},
    ActionDescriptor:function(){this.putPath=()=>{};},charIDToTypeID:x=>x,
    executeAction(id){assert.equal(id,'Plc ');doc.activeLayer=photo;}, DialogModes:{NO:1},AnchorPosition:{MIDDLECENTER:1},
    alert(message){throw Error(message);}
  };
  vm.runInNewContext(output.replace(/^#target.*$/m,''),ps);
  near(ps.imgWidthMM,layout.imageWidth); near(ps.imgHeightMM,layout.imageHeight);
  near(ps.imgLeftMM,ps.cutLeftMM+layout.left); near(ps.imgTopMM,ps.cutTopMM+layout.top);
  near(ps.paperW,layout.paper?layout.paper.w:layout.width+30);
  near(ps.paperH,layout.paper?layout.paper.h:layout.height+30);
  const scale=parseFloat(element('frameInner').style.width)/layout.width;
  near(parseFloat(element('imageArea').style.width)/scale,layout.imageWidth);
  near(parseFloat(element('imageArea').style.height)/scale,layout.imageHeight);
  near(parseFloat(element('imageArea').style.left)/scale,layout.left);
  near(parseFloat(element('imageArea').style.top)/scale,layout.top);
  for(const [l,t,r,b] of ps.cropMarkRects||[]) {
    assert.ok(r<=ps.cutLeftMM||l>=ps.cutLeftMM+layout.width||b<=ps.cutTopMM||t>=ps.cutTopMM+layout.height);
  }
  if(withPhoto) {
    near(photo.w/photo.h,sourceW/sourceH);
    assert.ok(photo.w<=ps.imageWidthPx+1e-7&&photo.h<=ps.imageHeightPx+1e-7);
    near(photo.x+photo.w/2,(ps.selRegion[0][0]+ps.selRegion[1][0])/2);
    assert.equal(ps.app.preferences.rulerUnits,'original');
    assert.ok(!output.includes('RvlS'), 'no clipping mask may hide image edges');
  }
  return {layout, script:output, ps, temporaryFiles, dialogs};
}
assert.equal(run('state.showFrame'),false);
near(run('Number(els.bTop.value)'),10);
let result=execute(true);
assert.equal(result.layout.paper.name,'A2');
near(result.layout.width,420);near(result.layout.height,594);
near(result.layout.imageWidth,400);near(result.layout.imageHeight,400*4/3);
near(result.layout.left,10);near(result.layout.top,(594-400*4/3)/2);
assert.equal(result.ps.cropMarkRects,undefined);
const defaultScript=result.script;
fs.writeFileSync('/tmp/PS_A2_1cm_ohne_Beschnitt.jsx',defaultScript);
run('els.bTop.value=20');result=execute(true);
near(result.layout.imageWidth,380);near(result.layout.imageHeight,380*4/3);
near(result.layout.left,20);
fs.writeFileSync('/tmp/PS_A2_2cm_ohne_Beschnitt.jsx',result.script);
const twoCM=result.script;
run('els.showFrame.checked=true');element('chkShowFrame').events.change();
assert.equal(execute().script,twoCM,'frame toggle must not change export');
run('els.showFrame.checked=false');element('chkShowFrame').events.change();
run('els.bTop.value=27.5'); result=execute(true);near(result.layout.left,27.5);
run("state.imgW_PX=200;state.imgH_PX=800;els.bTop.value=20");
result=execute(true,200,800);near(result.layout.imageWidth/result.layout.imageHeight,0.25);
assert.ok(result.layout.left>=20&&result.layout.top>=20);
run("state.imgW_PX=800;state.imgH_PX=200");
result=execute(true,800,200);near(result.layout.imageWidth/result.layout.imageHeight,4);
run("state.imgW_PX=0;state.imgH_PX=0;els.bTop.value=3");
result=execute(true);
near(result.layout.width,420);near(result.layout.height,594);
near(result.layout.imageWidth,414);near(result.layout.imageHeight,552);
fs.writeFileSync('/tmp/PS_Print_30x40_3mm.jsx',result.script);
assert.ok(!html.includes('outputSizing'), 'there must be no contradictory output-mode selector');
for(const [w,h,name] of [[10,15,'A5'],[18,24,'A4'],[20,30,'A3'],[30,40,'A2']]) {
 run(`els.inWidth.value=${w};els.inHeight.value=${h};els.bTop.value=10`);
 result=execute();assert.equal(result.layout.paper.name,name);
 near(result.layout.imageWidth/result.layout.imageHeight,w/h);
}
run("state.orientation='landscape';els.inWidth.value=30;els.inHeight.value=40");
result=execute();near(result.layout.width,594);near(result.layout.height,420);
near(result.layout.imageWidth/result.layout.imageHeight,4/3);
run("els.borderMode.value='passepartout';els.bTop.value=10;els.bBottom.value=40");
result=execute();near(result.layout.bottom-result.layout.top,30);
run("state.orientation='portrait';els.borderMode.value='equal';els.bTop.value=210;calcAndRender()");
assert.equal(run('getPrintLayout().valid'),false);assert.equal(element('btnDownloadScript').disabled,true);
assert.throws(()=>run('downloadPhotoshopScript()'), /Rand verkleinern/);
run('els.bTop.value=-1;calcAndRender()');assert.equal(run('getPrintLayout().valid'),false);
run("window.applyPreset('mm',20)");near(run('Number(els.bTop.value)'),20);
assert.ok(/object-fit:\s*contain/.test(html));
assert.equal(html,fs.readFileSync('HTML Script/print-mockup generator V14.html','utf8'));
// Manual image scale must shrink proportionally, remain centered and reach JSX unchanged.
run("state.productType='print';state.orientation='portrait';state.imgSrc='blob:test';state.imgW_PX=600;state.imgH_PX=800;els.inWidth.value=30;els.inHeight.value=40;els.borderMode.value='equal';els.bTop.value=10;state.userScale=1");
const maxLayout=execute(true).layout;
run('setImageScale(0.6)');
let scaled=execute(true).layout;
near(scaled.imageWidth,maxLayout.imageWidth*0.6);near(scaled.imageHeight,maxLayout.imageHeight*0.6);
near(scaled.left+scaled.imageWidth/2,maxLayout.width/2);near(scaled.top+scaled.imageHeight/2,maxLayout.height/2);
run('setImageScale(2)');near(run('state.userScale'),1);
run('setImageScale(-1)');near(run('state.userScale'),0.1);
run('setImageScale(0.55)');
element('borderSizeTop').events.input();near(run('state.userScale'),1);
run('setImageScale(0.55)');
element('framePreset').events.change({target:{value:'18x24'}});near(run('state.userScale'),1);
run('setImageScale(0.55)');modes[2].events.click();near(run('state.userScale'),1);assert.equal(run('els.borderMode.value'),'passepartout');
// Pointer projection on an actual registered corner handler, with a fixed image centre.
run("els.borderMode.value='equal';els.bTop.value=10;setImageScale(1)");
let box=element('imageArea').getBoundingClientRect();
handles[3].events.pointerdown({button:0,pointerId:1,clientX:box.width,clientY:box.height,preventDefault(){},stopPropagation(){}});
handles[3].events.pointermove({clientX:box.width*0.75,clientY:box.height*0.75,preventDefault(){}});
near(run('state.userScale'),0.5);
handles[3].events.pointerup();
handles[3].events.keydown({key:'End',preventDefault(){},stopPropagation(){}});near(run('state.userScale'),1);
run("state.imgSrc=null;state.imgW_PX=0;state.imgH_PX=0;state.userScale=1");
// All offered reference formats plus fractional and oversized custom formats.
const presetMarkup=html.match(/<select id="framePreset"[\s\S]*?<\/select>/)[0];
const formats=[...presetMarkup.matchAll(/value="(\d+(?:\.\d+)?x\d+(?:\.\d+)?)"/g)].map(match=>match[1].split('x').map(Number));
formats.push([17.3,28.7],[65,82]);
const borderChoices=[['none','mm',0],['equal','mm',3],['equal','mm',10],['equal','mm',20],['equal','equal',0.03],['equal','equal',0.05],['equal','equal',0.08],['passepartout','pp','galerie'],['passepartout','pp','elegant'],['passepartout','pp','museum']];
let combinations=0;
for(const product of ['print','canvas']) for(const [w,h] of formats) for(const orientation of ['portrait','landscape','square']) for(const [srcW,srcH] of [[600,800],[800,600],[800,800],[200,800]]) for(const [mode,preset,value] of borderChoices) {
  run(`state.productType='${product}';state.orientation='${orientation}';state.imgW_PX=${srcW};state.imgH_PX=${srcH};els.inWidth.value=${w};els.inHeight.value=${h};els.borderMode.value='${mode}';window.applyPreset('${preset}',${JSON.stringify(value)})`);
  const {layout,ps}=execute(true,srcW,srcH);
  assert.equal(layout.valid,true);
  near(layout.imageWidth/layout.imageHeight,srcW/srcH);
  assert.ok(layout.left>=-1e-7&&layout.top>=-1e-7&&layout.right>=-1e-7&&layout.bottom>=-1e-7);
  const minimum=product==='canvas'||mode==='none'?0:Number(element('borderSizeTop').value);
  assert.ok(layout.left>=minimum-1e-7&&layout.top>=minimum-1e-7);
  assert.ok(layout.imageWidth<=layout.width+1e-7&&layout.imageHeight<=layout.height+1e-7);
  // Independently verify the selected paper fits and no smaller A-paper would fit.
  const [refW,refH]=run('Object.values(getVisualDimensions())');
  const bleed=product==='canvas'?80:0;
  const reqW=refW*10+bleed,reqH=refH*10+bleed;
  const standard=[[148,210],[210,297],[297,420],[420,594]];
  const first=standard.find(([pw,ph])=>(reqW<=pw&&reqH<=ph)||(reqW<=ph&&reqH<=pw));
  if(first) near(Math.min(ps.paperW,ps.paperH),first[0]);
  else assert.equal(layout.paper.name,'Benutzerdefiniert');
  combinations++;
}
console.log(`PASS: ${combinations} format/orientation/image-ratio/border/product combinations; full-image Photoshop placement, A-paper selection, preview/export equality, frame-toggle invariance, pointer/keyboard scaling, scale reset and invalid inputs.`);

async function verifyV14() {
  run("state.productType='print';state.orientation='portrait';state.userScale=0.8;state.imgW_PX=600;state.imgH_PX=800;els.inWidth.value=30;els.inHeight.value=40;els.borderMode.value='equal';els.bTop.value=10");
  for(const length of [1,2,3,12287,12288,12289,24577,65537]) {
    const bytes=Buffer.from(Array.from({length},(_,i)=>(i*71+19)%256));
    context.imageBuffer=bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength);
    run("emitPhotoshopScript(getPrintLayout(),{productType:'print',matColor:'#ffffff',fileName:'test',border:10,scale:0.8},encodeImageChunks(imageBuffer),'jpg')");
    const result=execute(true,600,800,output);
    assert.equal(result.dialogs,0,'embedded exports must not prompt for the image again');
    assert.equal(result.temporaryFiles.length,1);
    assert.deepEqual(Buffer.concat(result.temporaryFiles[0].data),bytes,'original bytes must survive unchanged');
    assert.equal(result.temporaryFiles[0].removed,true,'temporary image must be cleaned up');
  }
  const fakeFile={name:'test-original.jpg',type:'image/jpeg',arrayBuffer:async()=>new Uint8Array([0,255,37,128]).buffer};
  let prevented=0;
  const event={target:element('dropzone'),dataTransfer:{types:['Files'],files:[fakeFile]},preventDefault(){prevented++;}};
  element('dropzone').events.dragenter(event);element('dropzone').events.dragover(event);
  assert.equal(element('dropzone').classList.contains('is-dragging'),true);
  element('dropzone').events.drop(event);
  assert.equal(element('dropzone').classList.contains('is-dragging'),false);
  assert.equal(run('state.sourceFile'),fakeFile);
  assert.equal(run('state.originalName'),'test-original.jpg');
  windowEvents.drop({...event,target:{}});assert.ok(element('imageStatus').innerText.includes('Vorschau'));
  element('dropzone').events.drop({...event,dataTransfer:{types:['Files'],files:[fakeFile,fakeFile]}});
  assert.ok(element('imageStatus').innerText.includes('jeweils ein Bild'));
  element('dropzone').events.drop({...event,dataTransfer:{types:['Files'],files:[{name:'test.txt',type:'text/plain'}]}});
  assert.equal(run('state.sourceFile'),fakeFile,'bad drops must preserve the last valid original');
  const pending=run('downloadPhotoshopScript()');
  assert.equal(run('state.exporting'),true);
  // Changing UI while reading a large file must not change the captured export settings.
  run("state.matColor='#1a1a1a';state.fileName='changed';els.inWidth.value=18;els.inHeight.value=24");
  await pending;
  assert.equal(run('state.exporting'),false);
  assert.ok(output.includes('var borderColor = "ffffff"'));
  assert.ok(output.includes('var targetWidthMM = 420;'));
  assert.match(output,/embeddedImageChunks = \[\s*"AP8lgA=="\s*\]/);
  assert.ok(prevented>=3);
  console.log('PASS V14: drag/drop & replacement, invalid/multiple drops, embedded original roundtrip over chunk/padding boundaries, no extra image dialog, cleanup, asynchronous export snapshot.');
}
verifyV14().catch(error=>{console.error(error);process.exitCode=1;});
