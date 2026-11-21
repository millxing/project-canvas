const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const fflate=require('../vendor/fflate.js');
const context=vm.createContext({fflate,TextDecoder,Uint8Array});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../bear-package.js'),'utf8'),context);
const reader=context.BearPackage;
const utf8=text=>new TextEncoder().encode(text);
function fixture(extra={}){return fflate.zipSync({'My note.textbundle/text.md':utf8('# My note\n\n**Bold**\n\n![Image](assets/photo%20one.png)'), 'My note.textbundle/assets/photo one.png':new Uint8Array([137,80,78,71,13,10,26,10]),...extra});}
test('Reads real compressed Bear TextBundle structure and keeps image bytes',()=>{
 const notes=reader.parse(fixture(),'My note.bear');assert.equal(notes.length,1);assert.equal(notes[0].title,'My note');assert.match(notes[0].markdown,/\*\*Bold\*\*/);
 assert.equal(reader.assetPath(notes[0].markdownPath,'assets/photo%20one.png'),'My note.textbundle/assets/photo one.png');
 assert.equal(reader.imageType(notes[0].assets.get('My note.textbundle/assets/photo one.png')),'image/png');
});
test('Rejects unsafe and ambiguous package paths before import',()=>{
 assert.throws(()=>reader.parse(fflate.zipSync({'../text.md':utf8('secret')}),'bad.bear'),/unsafe/);
 assert.throws(()=>reader.parse(fflate.zipSync({'a/text.md':utf8('one'),'a//text.md':utf8('two')}),'bad.bear'),/duplicate/);
 assert.equal(reader.assetPath('text.md','../../../outside.png'),null);assert.equal(reader.assetPath('text.md','https://example.com/photo.png'),null);
});
test('Rejects invalid archives and packages without note text',()=>{
 assert.throws(()=>reader.parse(utf8('not a zip'),'fake.bear'));
 assert.throws(()=>reader.parse(fflate.zipSync({'info.json':utf8('{}')}),'empty.bear'),/text.md/);
});
test('Lists non-image attachments for explicit warnings without loading their contents',()=>{
 const note=reader.parse(fixture({'My note.textbundle/assets/spec.pdf':utf8('pdf contents')}),'My note.bear')[0];
 assert.ok(note.paths.has('My note.textbundle/assets/spec.pdf'));assert.equal(note.assets.has('My note.textbundle/assets/spec.pdf'),false);
});
test('Checks declared decompressed size before unpacking a large entry',()=>{
 const zip=fixture();const view=new DataView(zip.buffer,zip.byteOffset,zip.byteLength);
 for(let i=0;i+46<zip.length;i++)if(view.getUint32(i,true)===0x02014b50){view.setUint32(i+24,100_000_001,true);break;}
 assert.throws(()=>reader.parse(zip,'oversized.bear'),/limit/);
});
