const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const source=fs.readFileSync(require('node:path').join(__dirname,'../bear-drop.js'),'utf8');
const context=vm.createContext({TextDecoder,DataView,Uint8Array,File,Blob});
vm.runInContext('const limit=500,maxText=1000000;'+source.slice(source.indexOf(' function textSummary('),source.indexOf(' function render('))+source.slice(source.indexOf(' async function inspectFile('),source.indexOf(' async function receive(')),context);
test('Plain-text diagnostics report a possible title and links without recording the full body',()=>{
 const result=context.textSummary('text/plain','# A Bear note\nPrivate body that must not appear in the report');
 assert.equal(result.possibleTitle,'A Bear note');assert.ok(!JSON.stringify(result).includes('Private body'));
 assert.equal(context.textSummary('text/plain','bear://x-callback-url/open-note?id=example').bearNoteLink,true);
});
test('Rich-text diagnostics count embedded picture markers',()=>{
 assert.equal(context.textSummary('text/rtf','{\\rtf1 {\\pict data} {\\pict more}}').embeddedPictureMarkers,2);
});
test('A dropped Bear ZIP package lists note and image members without unpacking them',async()=>{
 const names=['text.md','assets/reference.png'];const parts=[];
 for(const name of names){const bytes=Buffer.from(name);const header=Buffer.alloc(46);header.writeUInt32LE(0x02014b50);header.writeUInt16LE(bytes.length,28);parts.push(header,bytes);}
 const central=Buffer.concat(parts),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt32LE(central.length,12);end.writeUInt32LE(0,16);
 const result=await context.inspectFile(new File([central,end],'sample.bear'), 'sample.bear');
 assert.deepEqual(Array.from(result.zipEntries),names);assert.equal(result.name,'sample.bear');assert.ok(!('text' in result));
});
test('Empty and non-ZIP files do not crash package inspection',async()=>{
 const result=await context.inspectFile(new File([],'empty.bear'),'empty.bear');assert.equal(result.bytes,0);assert.equal(result.zipEntries,undefined);
});
test('Unreadable promised files retain their name, size, type, and exact failing stage',async()=>{
 const file={name:'Promised Bear note.textbundle',type:'',size:1234,slice(){return {arrayBuffer(){return Promise.reject(new DOMException('Malformed URI','EncodingError'));}};}};
 const result=await context.inspectFile(file,file.name);
 assert.equal(result.name,file.name);assert.equal(result.bytes,1234);assert.equal(result.readableData,false);
 assert.equal(result.readError.stage,'read file bytes');assert.equal(result.readError.name,'EncodingError');
});
test('Failed entry resolution still produces a report containing the original entry name',async()=>{
 const c=vm.createContext({TextDecoder,DataView,Uint8Array,File,Blob});
 const prelude=`const limit=500,maxText=1000000;let sequence=0;const zone={classList:{remove(){}}},output={},status={},copy={};const safeName=value=>value.split('/').pop();function render(report){globalThis.report=report;}`;
 const start=source.indexOf(' async function receive('),end=source.indexOf("\n document.querySelector('#bear-import')",start);
 vm.runInContext(prelude+source.slice(source.indexOf(' function textSummary('),source.indexOf(' function render('))+source.slice(source.indexOf(' async function inspectFile('),start)+source.slice(start,end),c);
 const entry={name:'My Bear note.bear',isFile:true,isDirectory:false,file(success,failure){failure(new DOMException('Malformed URI','EncodingError'));}};
 await c.receive({type:'drop',preventDefault(){},stopPropagation(){},dataTransfer:{types:['Files'],files:[],items:[{kind:'file',type:'',getAsFile(){return null;},webkitGetAsEntry(){return entry;}}]}});
 assert.equal(c.report.entries[0].name,'My Bear note.bear');assert.equal(c.report.items[0].kind,'file');
 assert.equal(c.report.warnings[0].stage,'resolve file entry');assert.equal(c.report.warnings[0].name,'EncodingError');
});
