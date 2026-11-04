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
    showModal(){this.open=true;},close(){this.open=false;},
    classList: {values:new Set(),add(v){this.values.add(v);},remove(v){this.values.delete(v);},toggle(v,active){if(active)this.values.add(v);else this.values.delete(v);},contains(v){return this.values.has(v);}}, events: {}, addEventListener(type, fn){this.events[type]=fn;}, click(){},
    closest(){return element(key+'-parent');}, querySelector(){return element(key+'-child');}, querySelectorAll(){return []}
  });
  return elements.get(key);
}
for (const tag of html.matchAll(/<(?:input|select)[^>]*id="([^"]+)"[^>]*>/g)) {
  element(tag[1]).value = tag[0].match(/value="([^"]*)"/)?.[1] || '';
}
element('borderMode').value = 'equal';
element('framePreset').options = [...html.match(/<select id="framePreset"[\s\S]*?<\/select>/)[0].matchAll(/<option value="([^"]+)"/g)].map(match=>({value:match[1]}));
element('aiRoomStyle').value = 'swiss';
const handles=['nw','ne','sw','se'].map(corner=>{const node=element('handle-'+corner);node.dataset.corner=corner;return node;});
const modes=['none','equal','passepartout'].map(mode=>{const node=element('mode-'+mode);node.dataset.borderMode=mode;return node;});
const products=['print','canvas'].map(type=>{const node=element('product-'+type);node.dataset.type=type;return node;});
function queryAll(selector) {return selector === '#productTypeSelector .chip-toggle' ? products : selector === '.resize-handle' ? handles : selector === '[data-border-mode]' ? modes : [];}
let output;
let clipboardText, clipboardFails=false;
class FakeImage {set src(value){this.width=600;this.height=800;if(this.onload)this.onload();}}
const windowEvents={};
const context = vm.createContext({
  document: { getElementById:element, querySelector:element, querySelectorAll:queryAll, createElement:()=>element('link') },
  window:{addEventListener(type,fn){windowEvents[type]=fn;}}, URL:{createObjectURL(blob){if(blob.content!==undefined)output=blob.content; return 'blob:test';},revokeObjectURL(){}},
  Image:FakeImage,setTimeout(){},btoa:value=>Buffer.from(value,'binary').toString('base64'),
  navigator:{clipboard:{async writeText(value){if(clipboardFails)throw Error('Clipboard unavailable');clipboardText=value;}}},
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
assert.equal(run('state.fitToFormat'),true,'new sessions use the finished end size');
let initial=execute(true);
near(initial.layout.width,300);near(initial.layout.height,400);
assert.equal(element('formatLabel').innerText,'Fertiges Endmass:');
assert.equal(element('btnFitFormat').attributes['aria-pressed'],'true');
// The user's 40 x 50 cm frame: exact print, uncut original, A2 and four continuous cut guides.
run("state.imgSrc='blob:end-size';state.imgW_PX=4000;state.imgH_PX=5000");
element('framePreset').events.change({target:{value:'40x50'}});modes[0].events.click();
let exact=execute(true,4000,5000);
near(exact.layout.width,400);near(exact.layout.height,500);
near(exact.layout.imageWidth,400);near(exact.layout.imageHeight,500);
near(exact.layout.left,0);near(exact.layout.top,0);
assert.equal(exact.layout.paper.name,'A2');near(exact.ps.paperW,420);near(exact.ps.paperH,594);
near(exact.ps.cutLeftMM,10);near(exact.ps.cutTopMM,47);
assert.equal(exact.ps.cropMarkRects.length,4);
assert.ok(element('link').download.includes('_40x50cm_auf_A2_0mm_100pct.jsx'));
const expectedMarks=[[9.8,0,10,594],[410,0,410.2,594],[0,46.8,420,47],[0,547,420,547.2]];
exact.ps.cropMarkRects.forEach((rect,i)=>rect.forEach((v,j)=>near(v,expectedMarks[i][j])));
assert.equal(element('recapFrame').innerText,'40 × 50 cm');
assert.equal(element('recapImage').innerText,'40 × 50 cm');
run("els.showFrame.checked=true");element('chkShowFrame').events.change();assert.equal(execute().script,exact.script);
run("els.showFrame.checked=false");element('chkShowFrame').events.change();
run('setImageScale(0.5)');element('btnResetScale').events.click();
assert.equal(run('state.fitToFormat'),true);near(run('getPrintLayout().width'),400);
assert.equal(element('btnResetScale').disabled,true);
assert.equal(element('btnResetScale').innerText,'Bild maximal einpassen');
modes[1].events.click();run('els.bTop.value=10');exact=execute(true,4000,5000);
near(exact.layout.width,400);near(exact.layout.height,500);near(exact.layout.imageWidth,380);near(exact.layout.imageHeight,475);
near(exact.layout.left,10);near(exact.layout.top,12.5);assert.equal(exact.ps.cropMarkRects.length,4);
run('state.imgW_PX=6000;state.imgH_PX=4000');exact=execute(true,6000,4000);
near(exact.layout.imageWidth/exact.layout.imageHeight,1.5);near(exact.layout.width,400);near(exact.layout.height,500);
// Mode choices are explicit; resetting scale and switching products preserve the choice.
element('btnFillPaper').events.click();
assert.equal(run('state.fitToFormat'),false);near(run('getPrintLayout().width'),420);
assert.equal(element('btnFillPaper').attributes['aria-pressed'],'true');
products[1].events.click();assert.equal(element('printSizingControls').hidden,true);
products[0].events.click();assert.equal(run('state.fitToFormat'),false);
element('btnFitFormat').events.click();products[1].events.click();products[0].events.click();
assert.equal(run('state.fitToFormat'),true);assert.equal(element('printSizingControls').hidden,false);
element('framePreset').events.change({target:{value:'20x20'}});near(run('getPrintLayout().width'),200);
assert.equal(run('state.fitToFormat'),true);
run("state.orientation='portrait';els.inWidth.value=42;els.inHeight.value=59.4;els.borderMode.value='none'");
exact=execute();assert.equal(exact.ps.cropMarkRects,undefined);
assert.ok(element('printInfo').innerText.includes('kein Zuschnitt nötig'));
console.log('PASS finished end size: 40 × 50 cm on A2 with four edge-to-edge cut guides, internal borders, original ratios, visible dimensions, frame invariance, explicit modes, scale reset and product transitions.');
// Model all cut orders, clipping the ink to the sheet left after every cut.
function cutOrders(sides){return sides.length?sides.flatMap((side,i)=>cutOrders(sides.filter((_,j)=>i!==j)).map(rest=>[side,...rest])):[[]];}
let trimmingCases=0;
for(const [width,height,pw,ph] of [[400,500,420,594],[500,400,594,420],[100,150,148,210],[180,240,210,297],[210,300,297,420],[148,180,148,210],[100,210,148,210],[148,210,148,210],[419.9,593.9,420,594]]){
 const left=(pw-width)/2,top=(ph-height)/2,right=left+width,bottom=top+height;
 const marks=run(`getCropMarks(${JSON.stringify({width,height,paper:{w:pw,h:ph}})})`);
 const sides=[...(left>0?['left','right']:[]),...(top>0?['top','bottom']:[])];
 assert.equal(marks.length,sides.length,'only edges that actually need cutting receive a guide');
 for(const [l,t,r,b]of marks){assert.ok(l>=0&&t>=0&&r<=pw&&b<=ph&&r>l&&b>t);assert.ok(r<=left||l>=right||b<=top||t>=bottom,'no ink in the finished print');}
 for(const order of cutOrders(sides)){
  const sheet={l:0,t:0,r:pw,b:ph};
  for(const side of order){
   const visible=marks.map(([l,t,r,b])=>[Math.max(sheet.l,l),Math.max(sheet.t,t),Math.min(sheet.r,r),Math.min(sheet.b,b)]).filter(([l,t,r,b])=>r>l&&b>t);
   const match=visible.find(([l,t,r,b])=>side==='left'?Math.abs(r-left)<1e-7&&t===sheet.t&&b===sheet.b:side==='right'?Math.abs(l-right)<1e-7&&t===sheet.t&&b===sheet.b:side==='top'?Math.abs(b-top)<1e-7&&l===sheet.l&&r===sheet.r:Math.abs(t-bottom)<1e-7&&l===sheet.l&&r===sheet.r);
   assert.ok(match,`guide survives prior cuts: ${width}x${height} on ${pw}x${ph}, ${order.join(' → ')}, ${side}`);
   if(side==='left')sheet.l=left;else if(side==='right')sheet.r=right;else if(side==='top')sheet.t=top;else sheet.b=bottom;
  }
  near(sheet.r-sheet.l,width);near(sheet.b-sheet.t,height);trimmingCases++;
 }
}
console.log(`PASS continuous cut guides: ${trimmingCases} trimming sequences, A5–A2, landscape, one-axis/full sheet and thin offcuts; paper-edge coverage, exact end size and no ink inside the print.`);
// Preview modes show the same job, with the complete sheet and exact exported marks.
assert.equal(run('state.previewMode'),'print');
function previewMarks() {
  return [...element('sheetMarks').innerHTML.matchAll(/<rect x="([^"]+)" y="([^"]+)" width="([^"]+)" height="([^"]+)"/g)]
    .map(([,x,y,w,h])=>[+x,+y,+x+(+w),+y+(+h)]);
}
run("state.imgSrc='blob:preview';state.imgW_PX=4000;state.imgH_PX=3000;state.orientation='landscape';state.fitToFormat=true;els.inWidth.value=40;els.inHeight.value=30;els.borderMode.value='equal';els.bTop.value=10;state.userScale=.8;state.showFrame=true");
const finished=execute(true,4000,3000), job=JSON.stringify(finished.layout), qualityBefore=run('getPrintQuality(getPrintLayout()).effectivePpi');
assert.equal(element('sheetMarks').hidden,true);
element('btnPreviewSheet').events.click();
const sheet=execute(true,4000,3000);
assert.equal(JSON.stringify(sheet.layout),job);
assert.equal(sheet.script,finished.script,'the display choice must never change the Photoshop job');
assert.equal(run('state.showFrame'),true);
assert.equal(element('btnPreviewSheet').attributes['aria-pressed'],'true');
assert.equal(element('btnPreviewPrint').attributes['aria-pressed'],'false');
assert.ok(element('frameOuter').className.includes('is-sheet'));
near(parseFloat(element('frameOuter').style.padding),0);
let previewScale=parseFloat(element('frameInner').style.width)/400;
near(parseFloat(element('frameOuter').style.width)/previewScale,594);
near(parseFloat(element('frameOuter').style.height)/previewScale,420);
assert.equal(element('sheetMarks').hidden,false);
assert.ok(element('sheetOffcut').innerHTML.includes('offcutHatch'));
assert.ok(element('previewHelp').innerText.includes('nur Vorschau'));
assert.ok(html.includes('id="sheetOffcut" class="sheet-overlay" data-html2canvas-ignore="true"'),'offcut hatching must never enter the PNG');
assert.equal(previewMarks().length,4);
previewMarks().forEach((rect,i)=>rect.forEach((v,j)=>near(v,sheet.ps.cropMarkRects[i][j])));
near(run('getPrintQuality(getPrintLayout()).effectivePpi'),qualityBefore);
// Scaling and keyboard interaction still work on the sheet without changing its size.
handles[3].events.keydown({key:'ArrowLeft',preventDefault(){},stopPropagation(){}});
near(run('state.userScale'),.79);
near(run('getPrintLayout().width'),400);
near(parseFloat(element('frameOuter').style.width)/ (parseFloat(element('frameInner').style.width)/400),594);
element('btnPreviewPrint').events.click();
assert.equal(element('sheetMarks').hidden,true);assert.equal(element('sheetMarks').innerHTML,'');
assert.equal(element('sheetOffcut').hidden,true);
assert.ok(!element('frameOuter').className.includes('is-print'),'the selected frame reappears');
near(run('state.userScale'),.79);
element('btnPreviewSheet').events.click();
products[1].events.click();assert.equal(element('previewControls').hidden,true);assert.equal(element('sheetMarks').hidden,true);
products[0].events.click();assert.equal(run('state.previewMode'),'sheet');assert.equal(element('previewControls').hidden,false);
run("state.fitToFormat=false;calcAndRender()");
assert.equal(previewMarks().length,0);assert.equal(element('sheetOffcut').innerHTML,'');
assert.ok(element('previewHelp').innerText.includes('Kein Papierrest'));
run("state.fitToFormat=true;els.bTop.value=500;calcAndRender()");
assert.equal(element('sheetMarks').hidden,true);assert.equal(element('sheetOffcut').hidden,true);assert.ok(element('previewHelp').innerText.includes('verkleinern'));
run("state.previewMode='print';state.showFrame=false;els.showFrame.checked=false");
console.log('PASS preview switch: 40 × 30 cm on full A2, unchanged job/quality, matching crop marks, preview-only offcut, frame restoration, live scaling, canvas, whole sheet and invalid borders.');
// Existing paper-utilisation behaviour remains available explicitly.
run("state.fitToFormat=false;state.orientation='portrait';state.imgSrc=null;state.imgW_PX=0;state.imgH_PX=0;els.inWidth.value=30;els.inHeight.value=40;els.borderMode.value='equal';els.bTop.value=10;state.userScale=1");
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
for(const [product,fitToFormat] of [['print',false],['print',true],['canvas',false]]) for(const [w,h] of formats) for(const orientation of ['portrait','landscape','square']) for(const [srcW,srcH] of [[600,800],[800,600],[800,800],[200,800]]) for(const [mode,preset,value] of borderChoices) {
  run(`state.productType='${product}';state.fitToFormat=${fitToFormat};state.orientation='${orientation}';state.imgW_PX=${srcW};state.imgH_PX=${srcH};els.inWidth.value=${w};els.inHeight.value=${h};els.borderMode.value='${mode}';window.applyPreset('${preset}',${JSON.stringify(value)})`);
  run(`state.previewMode='${combinations%2 ? 'sheet' : 'print'}'`);
  const {layout,ps}=execute(true,srcW,srcH);
  if(product==='print'&&combinations%2) {
    const scale=parseFloat(element('frameInner').style.width)/layout.width;
    near(parseFloat(element('frameOuter').style.width)/scale,layout.paper.w);
    near(parseFloat(element('frameOuter').style.height)/scale,layout.paper.h);
    const displayed=previewMarks(), exported=ps.cropMarkRects||[];
    assert.equal(displayed.length,exported.length);
    displayed.forEach((rect,i)=>rect.forEach((v,j)=>near(v,exported[i][j])));
  }
  assert.equal(layout.valid,true);
  const dims=run('getVisualDimensions()');
  near(layout.width,product==='canvas'||fitToFormat?dims.w*10:layout.paper.w);
  near(layout.height,product==='canvas'||fitToFormat?dims.h*10:layout.paper.h);
  if(product==='print'&&fitToFormat&&layout.paper.w-layout.width>=12&&layout.paper.h-layout.height>=12)assert.equal(ps.cropMarkRects.length,4);
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
  const quality=run('getPrintQuality(getPrintLayout())');
  near(quality.effectivePpi,Math.min(srcW*25.4/layout.imageWidth,srcH*25.4/layout.imageHeight));
  assert.ok(quality.requiredWidth>=layout.imageWidth/25.4*300-1e-7);
  assert.ok(quality.requiredHeight>=layout.imageHeight/25.4*300-1e-7);
  assert.ok(quality.requiredWidth<layout.imageWidth/25.4*300+1+1e-7);
  combinations++;
}
console.log(`PASS: ${combinations} format/orientation/image-ratio/border/product combinations; full-image Photoshop placement, A-paper selection, preview/export equality, frame-toggle invariance, pointer/keyboard scaling, scale reset and invalid inputs.`);

// Resolution uses actual image millimetres, never paper dimensions or document ppi.
let quality=run('getPrintQuality({valid:true,imageWidth:101.6,imageHeight:152.4},1200,1800)');
near(quality.effectivePpi,300);assert.equal(quality.level,'good');
assert.equal(quality.requiredWidth,1200);assert.equal(quality.requiredHeight,1800);
near(quality.maxWidth,101.6);near(quality.maxHeight,152.4);
assert.equal(run('getPrintQuality({valid:true,imageWidth:101.6,imageHeight:152.4},600,900).level'),'caution');
assert.equal(run('getPrintQuality({valid:true,imageWidth:101.6,imageHeight:152.4},599,900).level'),'low');
assert.equal(run('getPrintQuality({valid:true,imageWidth:101.6,imageHeight:152.4},1199,1800).level'),'caution');
// Both axes matter, and fractional requirements must be rounded UP.
near(run('getPrintQuality({valid:true,imageWidth:101.6,imageHeight:152.4},1200,600).effectivePpi'),100);
assert.equal(run('getPrintQuality({valid:true,imageWidth:100,imageHeight:100},2000,2000).requiredWidth'),1182);
run("state.imgSrc='blob:quality';state.imgW_PX=1200;state.imgH_PX=1800;renderPrintQuality({valid:true,imageWidth:101.601,imageHeight:152.4})");
assert.ok(element('qualityStatus').innerText.includes('Unter der Empfehlung · 299,9 ppi'));
for(const expression of [
  'getPrintQuality({valid:false,imageWidth:100,imageHeight:100},1000,1000)',
  'getPrintQuality({valid:true,imageWidth:0,imageHeight:100},1000,1000)',
  'getPrintQuality({valid:true,imageWidth:100,imageHeight:100},0,1000)',
  'getPrintQuality({valid:true,imageWidth:100,imageHeight:100},NaN,1000)',
  'getPrintQuality({valid:true,imageWidth:Infinity,imageHeight:100},1000,1000)'
]) assert.equal(run(expression),null);
run("state.productType='print';state.orientation='portrait';state.imgSrc='blob:quality';state.imgW_PX=600;state.imgH_PX=800;state.userScale=1;state.showFrame=false;els.inWidth.value=30;els.inHeight.value=40;els.borderMode.value='equal';els.bTop.value=10;calcAndRender()");
const lowResolutionLayout=run('getPrintLayout()');
quality=run('getPrintQuality(getPrintLayout())');near(quality.effectivePpi,38.1);
assert.equal(element('printQuality').dataset.level,'low');assert.equal(element('printQuality').hidden,false);
assert.equal(element('qualityDetails').hidden,false);
assert.equal(element('qualityOriginal').innerText,'600 × 800 px');
assert.equal(element('qualityRequired').innerText,'4.725 × 6.300 px');
assert.equal(element('qualityMaxSize').innerText,'5 × 6,7 cm');
assert.ok(element('qualityStatus').innerText.includes('Auflösung niedrig'));
assert.equal(element('btnDownloadScript').disabled,false,'low resolution must not block export');
run('setImageScale(0.5)');
near(run('getPrintQuality(getPrintLayout()).effectivePpi'),quality.effectivePpi*2);
assert.equal(element('dpiInfo').innerText,'76,2 ppi im Druck');
run('state.userScale=1;state.imgW_PX=6000;state.imgH_PX=8000;calcAndRender()');
const highResolutionLayout=run('getPrintLayout()');
assert.equal(JSON.stringify(highResolutionLayout.paper),JSON.stringify(lowResolutionLayout.paper),'pixel count must not change paper');
for(const key of ['width','height','left','right','top','bottom','imageWidth','imageHeight']) near(highResolutionLayout[key],lowResolutionLayout[key]);
assert.equal(element('printQuality').dataset.level,'good');
assert.ok(element('qualityStatus').innerText.includes('Auflösung ausreichend'));
const highPpi=run('getPrintQuality(getPrintLayout()).effectivePpi');
run('state.showFrame=true;calcAndRender()');near(run('getPrintQuality(getPrintLayout()).effectivePpi'),highPpi);
run('els.bTop.value=20;calcAndRender()');assert.ok(run('getPrintQuality(getPrintLayout()).effectivePpi')>highPpi);
run("state.imgW_PX=3000;state.imgH_PX=4000;els.bTop.value=10;calcAndRender()");
assert.equal(element('printQuality').dataset.level,'caution');
// Invalid borders clear the previous ppi and suppress misleading source requirements.
run('els.bTop.value=210;calcAndRender()');
assert.equal(element('qualityDetails').hidden,true);assert.equal(element('printQuality').dataset.level,'neutral');
assert.equal(element('dpiInfo').innerText,'Auflösung nicht berechenbar');
run('state.imgSrc=null;calcAndRender()');assert.equal(element('printQuality').hidden,true);
assert.equal(element('dpiInfo').innerText,'Masse nach dem Hochladen');
console.log('PASS resolution: known ppi and thresholds, rounded pixel requirements, all layouts, live scaling/borders/frame invariance, stable paper choice, missing/invalid data and non-blocking warnings.');

// Suggestions are frame END sizes, with borders, rather than an A-sheet enlarged to fill.
function setupSuggestion(w=2400,h=3200,orientation='portrait',mode='equal',top=10,bottom=10,product='print') {
  run(`state.productType='${product}';state.orientation='${orientation}';state.imgSrc='blob:suggestion';state.sourceFile=null;state.imgW_PX=${w};state.imgH_PX=${h};state.userScale=1;state.fitToFormat=false;els.inWidth.value=30;els.inHeight.value=40;els.borderMode.value='${mode}';els.bTop.value=${top};els.bBottom.value=${bottom};calcAndRender()`);
}
setupSuggestion();
const beforeSuggestion=run('JSON.stringify({state,layout:getPrintLayout(),width:els.inWidth.value,height:els.inHeight.value,border:els.bTop.value})');
let suggestion=run('getFormatRecommendation()');
assert.equal(suggestion.value,'21x30');assert.equal(suggestion.layout.paper.name,'A3');
near(suggestion.layout.width,210);near(suggestion.layout.height,300);
near(suggestion.layout.imageWidth,190);near(suggestion.quality.effectivePpi,2400*25.4/190);
assert.equal(run('JSON.stringify({state,layout:getPrintLayout(),width:els.inWidth.value,height:els.inHeight.value,border:els.bTop.value})'),beforeSuggestion,'proposing must not mutate current settings');
assert.ok(element('qualitySourceSummary').innerText.includes('2.400 × 3.200 px'));
assert.equal(element('btnApplySuggestion').hidden,false);
element('btnApplySuggestion').events.click();
assert.equal(run('state.fitToFormat'),true);assert.equal(element('framePreset').value,'21x30');
let adopted=execute(true,2400,3200);
near(adopted.layout.width,210);near(adopted.layout.height,300);
near(adopted.ps.paperW,297);near(adopted.ps.paperH,420);
near(adopted.ps.cutLeftMM,43.5);near(adopted.ps.cutTopMM,60);
assert.ok(adopted.ps.cropMarkRects.length>0,'exact frame on a larger A-sheet needs cut marks');
assert.equal(element('qualityChoices').hidden,true);assert.equal(element('printQuality').dataset.level,'good');
assert.ok(element('printInfo').innerText.includes('21 × 30 cm inklusive Rand'));
assert.equal(element('btnResetScale').disabled,true);
run('setImageScale(0.5)');element('btnResetScale').events.click();
assert.equal(run('state.fitToFormat'),true);near(run('getPrintLayout().width'),210);
element('btnFillPaper').events.click();
assert.equal(run('state.fitToFormat'),false);near(run('getPrintLayout().width'),297);
// Sometimes the selected frame already suffices once printed at its exact end size.
setupSuggestion(3400,4800);suggestion=run('getFormatRecommendation()');assert.equal(suggestion.value,'30x40');
// Preserve landscape and genuine square frame entries.
setupSuggestion(3200,2400,'landscape');suggestion=run('getFormatRecommendation()');
near(suggestion.reference.w,30);near(suggestion.reference.h,21);
setupSuggestion(2400,2400,'square');suggestion=run('getFormatRecommendation()');
assert.equal(suggestion.value,'20x20');assert.equal(suggestion.layout.paper.name,'A4');
// No standard frame fits: use a conservative millimetre-rounded custom end size.
setupSuggestion(600,800);suggestion=run('getFormatRecommendation()');
assert.equal(suggestion.custom,true);near(suggestion.reference.w,7);near(suggestion.reference.h,8.7);
assert.equal(suggestion.layout.paper.name,'A5');assert.ok(element('suggestionDetail').innerText.includes('Kein Standardrahmen'));
run('applyFormatRecommendation()');adopted=execute(true,600,800);
near(adopted.layout.width,70);near(adopted.layout.height,87);
assert.ok(run('getPrintQuality(getPrintLayout()).effectivePpi')>=300);
assert.equal(element('customDimensions').style.display,'flex');
element('btnFillPaper').events.click();
suggestion=run('getFormatRecommendation()');near(suggestion.reference.w,7);near(suggestion.reference.h,8.7);
// Click uses the NEW image/border state, never the last rendered proposal.
setupSuggestion();run('state.imgW_PX=600;state.imgH_PX=800;applyFormatRecommendation()');
assert.equal(element('framePreset').value,'custom');near(run('getPrintLayout().width'),70);
setupSuggestion(1,1,'portrait','none',0,0);
assert.equal(run('getFormatRecommendation()'),null);assert.equal(element('btnApplySuggestion').hidden,true);
setupSuggestion(6000,8000);assert.equal(run('getFormatRecommendation()'),null);assert.equal(element('qualityChoices').hidden,true);
run('state.imgSrc=null;calcAndRender()');assert.equal(run('getFormatRecommendation()'),null);

let recommendationCases=0;
for(const product of ['print','canvas']) for(const orientation of ['portrait','landscape','square']) for(const [w,h] of [[600,800],[2400,3200],[3200,2400],[2400,2400],[1,1000]]) for(const [mode,top,bottom] of [['none',0,0],['equal',3,3],['equal',20,20],['passepartout',10,40]]) {
  setupSuggestion(w,h,orientation,mode,top,bottom,product);
  const proposed=run('getFormatRecommendation()');
  if (!proposed) continue;
  const minimum=product==='canvas'||mode==='none'?0:top;
  const minimumBottom=product==='canvas'||mode==='none'?0:mode==='equal'?top:bottom;
  assert.ok(proposed.layout.imageWidth<=w*25.4/300+1e-7);
  assert.ok(proposed.layout.imageHeight<=h*25.4/300+1e-7);
  assert.ok(proposed.layout.left>=minimum-1e-7&&proposed.layout.top>=minimum-1e-7);
  near(proposed.layout.bottom-proposed.layout.top,minimumBottom-minimum);
  assert.notEqual(proposed.layout.paper.name,'Benutzerdefiniert');
  if(!proposed.custom) {
    // Independently reject every larger listed frame: invalid space, low ppi or no A-paper.
    for(const option of element('framePreset').options) {
      if(option.value==='custom') continue;
      const dims=option.value.split('x').map(Number);
      if(orientation==='square'&&dims[0]!==dims[1]) continue;
      const [rw,rh]=orientation==='landscape'?[Math.max(...dims),Math.min(...dims)]:[Math.min(...dims),Math.max(...dims)];
      const bound=orientation==='square'?[40,40]:orientation==='landscape'?[40,30]:[30,40];
      if(rw>bound[0]||rh>bound[1]||rw*rh<=proposed.reference.w*proposed.reference.h) continue;
      const aw=rw*10-minimum*2,ah=rh*10-minimum-minimumBottom;
      const bleed=product==='canvas'?80:0;
      const paperFits=[[148,210],[210,297],[297,420],[420,594]].some(([pw,ph])=>(rw*10+bleed<=pw&&rh*10+bleed<=ph)||(rw*10+bleed<=ph&&rh*10+bleed<=pw));
      const ppi=Math.max(w*25.4/aw,h*25.4/ah);
      assert.ok(!(aw>0&&ah>0&&paperFits&&ppi>=300-1e-7),'a larger suitable frame was missed');
    }
  }
  run('applyFormatRecommendation()');
  const result=execute(true,w,h);
  near(result.layout.width,proposed.reference.w*10);near(result.layout.height,proposed.reference.h*10);
  near(result.layout.imageWidth,proposed.layout.imageWidth);near(result.layout.imageHeight,proposed.layout.imageHeight);
  assert.ok(run('getPrintQuality(getPrintLayout()).effectivePpi')>=300-1e-7);
  near(Number(element('borderSizeTop').value),top);near(Number(element('borderSizeBottom').value),bottom);
  recommendationCases++;
}
console.log(`PASS recommendations: ${recommendationCases} adopted frame/custom proposals across orientations, image ratios, borders and canvas; largest available frame, safe custom fallback, unchanged settings before adoption, stale-click safety, cut marks and preview/JSX agreement.`);
run('state.fitToFormat=false');

async function verifyPrintGuide() {
  setupSuggestion();
  const original=run('JSON.stringify({state,layout:getPrintLayout()})');
  element('btnPrintGuide').events.click();
  assert.equal(element('printGuide').open,true);
  assert.equal(element('guideSheet').innerText,'A2 · 42 × 59,4 cm');
  assert.equal(element('guideOrientation').innerText,'Hochformat');
  assert.ok(element('guidePaperStep').innerText.includes('stellt den Druckdialog nicht automatisch auf A2 um'));
  assert.ok(element('guideScaleStep').innerText.includes('100 %'));
  assert.ok(element('guideResolution').innerText.includes('2.400 × 3.200 px'));
  assert.ok(element('guideCanonArea').innerText.includes('41,32 × 58,6 cm'));
  assert.equal(run('JSON.stringify({state,layout:getPrintLayout()})'),original,'reading print instructions must not change the layout or source');
  run('applyFormatRecommendation()');
  assert.equal(element('guideSheet').innerText,'A3 · 29,7 × 42 cm','an open guide must track adopted recommendations');
  assert.equal(element('guideEnd').innerText,'21 × 30 cm');
  run('setOrientation("landscape");calcAndRender()');
  assert.equal(element('guideSheet').innerText,'A3 · 42 × 29,7 cm');
  assert.equal(element('guideOrientation').innerText,'Querformat');
  assert.ok(element('guideCanonArea').innerText.includes('41,2 × 29,02 cm'));
  setupSuggestion(600,800);run('applyFormatRecommendation()');
  assert.equal(element('guideSheet').innerText,'A5 · 14,8 × 21 cm');
  assert.equal(element('guideEnd').innerText,'7 × 8,7 cm');
  assert.ok(element('guideCanonFeed').innerText.includes('A5: oberen Einzug'));
  assert.ok(element('guideCanonArea').innerText.includes('14,12 × 20,2 cm'));
  await run('copyPrintGuide()');
  assert.ok(clipboardText.includes('Papier im Druckdialog: A5 · 14,8 × 21 cm'));
  assert.ok(clipboardText.includes('Endmass inkl. Rand: 7 × 8,7 cm'));
  assert.ok(clipboardText.includes('304,8 ppi'));
  assert.equal(element('guideCopyStatus').innerText,'Druck-Info kopiert.');
  element('guidePrinter').value='other';element('guidePrinter').events.change();
  assert.equal(element('guideCanon').hidden,true);assert.equal(element('guideCanonSources').hidden,true);
  assert.ok(!run('getPrintGuideText()').includes('Canon'),'other printers must not inherit Canon-specific feed restrictions');
  clipboardFails=true;await run('copyPrintGuide()');clipboardFails=false;
  assert.ok(element('guideCopyStatus').innerText.includes('nicht verfügbar'));
  assert.equal(element('btnCopyPrintGuide').innerText,'Als Textdatei laden');
  await run('copyPrintGuide()');
  assert.equal(element('link').download,'Print_Studio_DruckInfo.txt');
  assert.ok(output.includes('Papier im Druckdialog: A5'));
  assert.ok(!output.includes('Canon'));
  run('state.imgSrc=null;calcAndRender()');
  assert.equal(element('guideJobTitle').innerText,'Deine aktuelle Vorlage');
  assert.ok(element('guideResolution').innerText.includes('Noch kein Motiv'));
  run('els.bTop.value=100;calcAndRender()');
  assert.equal(element('guideJobTitle').innerText,'Bitte die Gestaltung korrigieren');
  assert.equal(element('guideImage').innerText,'—');
  assert.ok(run('getPrintGuideText()').includes('Nicht druckbereit'));
  element('btnDonePrintGuide').events.click();assert.equal(element('printGuide').open,false);
  setupSuggestion();element('btnPrintGuide').events.click();
  element('btnClosePrintGuide').events.click();assert.equal(element('printGuide').open,false);
  element('guidePrinter').value='canon';run('state.fitToFormat=false');
  console.log('PASS print guide: current paper/end/image dimensions, live recommendation updates, orientation, A5 feed and printable area, generic printer, copying/failure, template/invalid states and unchanged geometry.');
}

async function verifyV14() {
  await verifyPrintGuide();
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
  run("state.matColor='#1a1a1a';state.fileName='changed';state.imgW_PX=1200;state.imgH_PX=1600;els.inWidth.value=18;els.inHeight.value=24");
  await pending;
  assert.equal(run('state.exporting'),false);
  assert.ok(output.includes('var borderColor = "ffffff"'));
  assert.ok(output.includes('var targetWidthMM = 420;'));
  assert.ok(output.includes('// Source pixels: 600 x 800.'));
  assert.ok(output.includes('// Effective image resolution: 38.10 ppi; low.'));
  assert.ok(output.includes('// Recommended source for this image area at 300 ppi: 4725 x 6300 px.'));
  assert.match(output,/embeddedImageChunks = \[\s*"AP8lgA=="\s*\]/);
  assert.ok(prevented>=3);
  console.log('PASS V14: drag/drop & replacement, invalid/multiple drops, embedded original roundtrip over chunk/padding boundaries, no extra image dialog, cleanup, asynchronous export snapshot.');
}
verifyV14().catch(error=>{console.error(error);process.exitCode=1;});
