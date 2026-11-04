const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),zlib=require('node:zlib');
const {checkPayload}=require('../scripts/embed-heic.cjs');
const html=fs.readFileSync('index.html','utf8');
const encoded=html.match(/<script id="roomHeicDecoder"[^>]*>([^<]*)<\/script>/)[1];
const source=zlib.gunzipSync(Buffer.from(encoded,'base64'));
const withPayload=bytes=>html.replace(encoded,bytes.toString('base64'));
test('HEIC source verification accepts different gzip levels and platform headers',()=>{
 checkPayload(html);
 const alternate=zlib.gzipSync(source,{level:1});alternate[9]=255;
 assert.notEqual(alternate.toString('base64'),encoded);
 assert.doesNotThrow(()=>checkPayload(withPayload(alternate)));
});
test('HEIC source verification rejects changed code, corrupt data and changed library metadata',()=>{
 assert.throws(()=>checkPayload(withPayload(zlib.gzipSync(Buffer.concat([source,Buffer.from('\n// changed')])))),/out of date/);
 assert.throws(()=>checkPayload(withPayload(Buffer.from('corrupt'))),/out of date/);
 assert.throws(()=>checkPayload(html.replace('data-library="heic-to@1.6.7','data-library="heic-to@0.0.0')),/out of date/);
});
