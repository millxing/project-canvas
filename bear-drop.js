/* Bear transfer inspector: local files and clipboard only; no server or library access. */
'use strict';
(()=>{
 const dialog=document.querySelector('#bear-dialog'),zone=document.querySelector('#bear-drop-zone');
 const status=document.querySelector('#bear-drop-status'),output=document.querySelector('#bear-drop-report');
 const copy=document.querySelector('#bear-drop-copy');let sequence=0,lastReport=null;
 const limit=500,maxText=1_000_000;
 const safeName=value=>String(value||'').split(/[\\/]/).pop();
 function textSummary(type,text){
  const result={type,characters:text.length};
  if(type==='text/html'||/^\s*(?:<!doctype html|<html|<h[1-6]|<p[ >])/i.test(text)){
   const doc=new DOMParser().parseFromString(text,'text/html');
   result.title=doc.querySelector('h1')?.textContent.trim().slice(0,200)||null;
   result.formatting={headings:doc.querySelectorAll('h1,h2,h3,h4,h5,h6').length,bold:doc.querySelectorAll('b,strong').length,italic:doc.querySelectorAll('i,em').length,lists:doc.querySelectorAll('ul,ol').length,links:doc.querySelectorAll('a[href]').length};
   result.images={embedded:0,localFileReferences:0,remoteReferences:0,relativeReferences:0};
   for(const image of doc.querySelectorAll('img')){
    const src=image.getAttribute('src')||'';
    const key=/^data:image\//i.test(src)?'embedded':/^file:/i.test(src)?'localFileReferences':/^https?:/i.test(src)?'remoteReferences':'relativeReferences';result.images[key]++;
   }
  }else if(type==='text/plain'){
   result.bearNoteLink=/^bear:\/\/x-callback-url\/open-note\?/i.test(text.trim());
   result.possibleTitle=text.split(/\r?\n/).find(line=>line.trim())?.replace(/^#{1,6}\s+/,'').slice(0,200)||null;
   result.markdownImages=(text.match(/!\[[^\]]*\]\(/g)||[]).length;
  }else if(type==='text/rtf')result.embeddedPictureMarkers=(text.match(/\\pict\b/g)||[]).length;
  return result;
 }
 function render(report){
  lastReport=report;output.textContent=JSON.stringify(report,null,2);copy.disabled=false;
  const embedded=report.strings.reduce((sum,item)=>sum+(item.images?.embedded||0),0);
  const imageFiles=report.files.filter(file=>file.type.startsWith('image/')).length;
  const packageImages=report.files.reduce((sum,file)=>sum+(file.zipEntries||[]).filter(name=>/\.(png|jpe?g|gif|webp|heic|svg)$/i.test(name)).length,0);
  status.textContent=`${report.method==='drop'?'Drop':'Paste'} received: ${report.types.length} format(s), ${report.files.length} file(s), ${report.entries.length} entry/entries, ${embedded} embedded image(s), ${imageFiles} image file(s)`+(packageImages?`, ${packageImages} image(s) listed inside packages.`:'.');
 }
 async function inspectFile(file,path){
  const result={name:file.name,path,type:file.type||'(unspecified)',bytes:file.size,readableData:false};
  let stage='read text';
  try{
  if(/\.(md|markdown|txt|html?|json)$/i.test(file.name)&&file.size<=maxText){
   const text=await file.text();result.content=textSummary(/\.html?$/i.test(file.name)?'text/html':'text/plain',text);
  }
  // ZIP central directory lists package members without unpacking or executing them.
  stage='read file bytes';
  const tail=new Uint8Array(await file.slice(Math.max(0,file.size-65557)).arrayBuffer());
  result.readableData=true;
  const view=new DataView(tail.buffer);let end=-1;
  for(let i=tail.length-22;i>=0;i--)if(view.getUint32(i,true)===0x06054b50){end=i;break;}
  if(end>=0){
   const size=view.getUint32(end+12,true),offset=view.getUint32(end+16,true);
   if(size<=2_000_000&&offset+size<=file.size){
    stage='read ZIP directory';
    const bytes=new Uint8Array(await file.slice(offset,offset+size).arrayBuffer()),directory=new DataView(bytes.buffer);const names=[];let pos=0;
    while(pos+46<=bytes.length&&directory.getUint32(pos,true)===0x02014b50&&names.length<limit){
     const length=directory.getUint16(pos+28,true),extra=directory.getUint16(pos+30,true),comment=directory.getUint16(pos+32,true);
     if(pos+46+length>bytes.length)break;
     names.push(new TextDecoder().decode(bytes.subarray(pos+46,pos+46+length)));pos+=46+length+extra+comment;
    }
    result.zipEntries=names;if(names.length===limit)result.listTruncated=true;
   }else result.packageNotice='Package listing exceeds the inspection limit or uses ZIP64.';
  }
  }catch(error){result.readError={stage,name:error.name,message:error.message};}
  return result;
 }
 async function receive(event){
  event.preventDefault();event.stopPropagation();zone.classList.remove('drag-over');
  const id=++sequence,transfer=event.dataTransfer||event.clipboardData;
  // Capture every handle and its metadata before awaiting any browser file reads.
  const report={method:event.type,serverFree:true,types:[...transfer.types],strings:[],items:[],entries:[],files:[],directories:[],warnings:[]};
  for(const type of report.types.filter(type=>type!=='Files')){
   try{report.strings.push(textSummary(type,transfer.getData(type)));}catch(error){report.warnings.push(type+': '+error.message);}
  }
  const entries=[],files=[...transfer.files],modern=[];
  for(const [index,item] of [...transfer.items].entries()){
   const info={index,kind:item.kind,type:item.type||'(unspecified)'};report.items.push(info);
   try{const file=item.getAsFile?.();if(file&&!files.some(f=>f.name===file.name&&f.size===file.size))files.push(file);}catch(error){info.getAsFileError={name:error.name,message:error.message};}
   try{const entry=item.webkitGetAsEntry?.();if(entry){entries.push(entry);report.entries.push({name:entry.name,isFile:entry.isFile,isDirectory:entry.isDirectory});}}catch(error){info.entryError={name:error.name,message:error.message};}
   if(item.kind==='file'&&item.getAsFileSystemHandle){
    try{modern.push(Promise.resolve(item.getAsFileSystemHandle()).then(handle=>({handle,index}),error=>({error,index})));}catch(error){info.handleError={name:error.name,message:error.message};}
   }
  }
  report.browserFileCount=transfer.files.length;
  // Preserve names, MIME types, and sizes even if every subsequent read fails.
  report.files=files.slice(0,limit).map(file=>({name:file.name,path:safeName(file.name),type:file.type||'(unspecified)',bytes:file.size,readableData:false}));
  output.textContent=JSON.stringify(report,null,2);status.textContent='Transfer received. Inspecting files…';copy.disabled=true;
  let seen=0;
  async function inspect(file,path){
   const result=await inspectFile(file,path),existing=report.files.findIndex(f=>f.name===file.name&&f.bytes===file.size);
   if(existing>=0){if(!report.files[existing].readableData)report.files[existing]=result;}else report.files.push(result);
  }
  async function walk(entry,path=''){
   if(id!==sequence||seen>=limit)return;
   seen++;const name=path+entry.name;
   try{
    if(entry.isDirectory){
     report.directories.push(name);const reader=entry.createReader();let batch;
     do{batch=await new Promise((resolve,reject)=>reader.readEntries(resolve,reject));for(const child of batch){await walk(child,name+'/');if(seen>=limit)break;}}while(batch.length&&seen<limit&&id===sequence);
    }else if(entry.isFile){
     // File objects from the drop are an independent route; entry.file() can fail for promised files.
     if(report.files.some(f=>f.name===entry.name&&f.readableData))return;
     const file=await new Promise((resolve,reject)=>entry.file(resolve,reject));await inspect(file,name);
    }
   }catch(error){report.warnings.push({stage:entry.isDirectory?'read directory entry':'resolve file entry',entry:name,name:error.name,message:error.message});}
  }
  for(const file of files.slice(0,limit))await inspect(file,safeName(file.name));
  for(const entry of entries)await walk(entry);
  for(const pending of modern){
   const {handle,error,index}=await pending;
   if(error){report.items[index].handleError={name:error.name,message:error.message};continue;}
   if(!handle)continue;
   report.items[index].fileSystemHandle={name:handle.name,kind:handle.kind};
   if(handle.kind==='file'&&!report.files.some(f=>f.name===handle.name&&f.readableData)){
    try{await inspect(await handle.getFile(),handle.name);}catch(error){report.warnings.push({stage:'read filesystem handle',entry:handle.name,name:error.name,message:error.message});}
   }
  }
  if(seen>=limit||files.length>limit)report.warnings.push('File listing stopped at 500 items.');
  if(!report.types.length&&!files.length&&!entries.length)report.warnings.push('The browser exposed no readable transfer data.');
  if(report.files.some(file=>file.readError))report.warnings.push('Some file metadata was received, but its bytes could not be read. See readError for the failing stage.');
  if(report.strings.some(item=>item.bearNoteLink))report.warnings.push('A Bear note link identifies a note but does not include its contents.');
  if(id===sequence)render(report);
 }
 document.querySelector('#bear-import').onclick=()=>{closeMenu();if(document.querySelector('#action-dialog').open)document.querySelector('#action-dialog').close();dialog.showModal();zone.focus();};
 document.querySelector('#bear-close').onclick=()=>dialog.close();
 document.querySelector('#bear-drop-clear').onclick=()=>{++sequence;lastReport=null;output.textContent='No transfer received yet.';status.textContent='Ready for a Bear note.';copy.disabled=true;zone.focus();};
 copy.onclick=async()=>{
  if(!lastReport)return;
  try{await navigator.clipboard.writeText(JSON.stringify(lastReport,null,2));status.textContent='Report copied. Paste it into this chat.';}
  catch{const range=document.createRange();range.selectNodeContents(output);const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);status.textContent='Report selected. Press Command+C (or Ctrl+C), then paste it into this chat.';}
 };
 zone.ondragover=event=>{event.preventDefault();if(event.dataTransfer)event.dataTransfer.dropEffect='copy';zone.classList.add('drag-over');};
 zone.ondragleave=()=>zone.classList.remove('drag-over');zone.ondrop=receive;
 dialog.addEventListener('paste',receive);
 // Prevent a drop elsewhere in this dialog from navigating away from the workspace.
 dialog.addEventListener('dragover',event=>event.preventDefault());
 dialog.addEventListener('drop',event=>event.preventDefault());
 dialog.addEventListener('close',()=>{++sequence;zone.classList.remove('drag-over');});
})();
