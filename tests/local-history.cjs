const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {IDBFactory}=require('fake-indexeddb');
const digest=async bytes=>require('node:crypto').createHash('sha256').update(Buffer.from(bytes)).digest('hex');
const source=fs.readFileSync('index.html','utf8').split('// LOCAL_HISTORY_STORE_START')[1].split('// LOCAL_HISTORY_STORE_END')[0];
const factory=vm.runInNewContext('//'+source+';createLocalHistoryStore',{TextEncoder,Set,Date});
const snapshot=(name='A',settings={border:3},kind='print')=>({kind,name,settings,original:{name:'original.png'},scene:null,summary:'40 × 50 cm',thumbnail:new Blob(['small']),blobs:{art:new Blob([Uint8Array.from([0,255,128,10])],{type:'image/png'})}});
test('history survives another connection and preserves exact original bytes',async()=>{
 const idb=new IDBFactory(),first=factory(idb,digest),saved=await first.save(snapshot());
 const reopened=factory(idb,digest),entry=await reopened.snapshot(saved.id);
 assert.deepEqual([...new Uint8Array(await entry.blobs.art.arrayBuffer())],[0,255,128,10]);assert.equal(entry.blobs.art.type,'image/png');assert.equal(entry.settings.border,3);
});
test('identical states deduplicate, renamed titles survive auto-save, variants share original assets',async()=>{
 const store=factory(new IDBFactory(),digest),a=await store.save(snapshot());
 await store.rename(a.id,'Mein Print');await store.save(snapshot());assert.equal((await store.list()).length,1);assert.equal((await store.get(a.id)).name,'Mein Print');
 const b=await store.save(snapshot('B',{border:20}));assert.notEqual(a.id,b.id);assert.equal((await store.list()).length,2);assert.equal(await store.bytes(),4);
 await store.remove(a.id);assert.equal(await store.bytes(),4);assert.equal((await store.snapshot(b.id)).blobs.art.size,4);
 await store.remove(b.id);assert.equal(await store.bytes(),0);
});
test('mockup source and HEIC display copy are retained and print deletion cannot orphan them',async()=>{
 const store=factory(new IDBFactory(),digest),print=await store.save(snapshot());const room=snapshot('Raum',{},'mockup');room.scene={mode:'own',zoom:1.8,center:{x:.3,y:.4},calibrated:true,planeW:2000};room.blobs.room=new Blob(['converted JPEG']);room.blobs.roomOriginal=new Blob(['raw HEIC']);
 const saved=await store.save(room);await store.remove(print.id);const reopened=await store.snapshot(saved.id);assert.equal(await reopened.blobs.room.text(),'converted JPEG');assert.equal(await reopened.blobs.roomOriginal.text(),'raw HEIC');assert.equal(reopened.scene.zoom,1.8);assert.equal(reopened.scene.planeW,2000);
});
test('concurrent saves and delete retain shared assets',async()=>{
 const store=factory(new IDBFactory(),digest);const entries=await Promise.all(Array.from({length:12},(_,i)=>store.save(snapshot('Print '+i,{border:i}))));assert.equal((await store.list()).length,12);assert.equal(await store.bytes(),4);
 await Promise.all(entries.slice(0,11).map(e=>store.remove(e.id)));assert.equal((await store.list()).length,1);assert.equal((await store.snapshot(entries[11].id)).blobs.art.size,4);
});
test('storage failure never reports success or partially commits an entry',async()=>{
 const store=factory(new IDBFactory(),async()=>{throw Error('read-failed');});await assert.rejects(store.save(snapshot()),/read-failed/);assert.equal((await store.list()).length,0);
 await assert.rejects(factory(null,digest).save(snapshot()),/storage-unavailable/);
});
