/* Import dropped .bear packages entirely in this browser, including file:// sessions. */
'use strict';
(()=>{
 const dialog=document.querySelector('#bear-dialog'),zone=document.querySelector('#bear-drop-zone');
 const status=document.querySelector('#bear-drop-status'),details=document.querySelector('#bear-import-details');
 const input=document.querySelector('#bear-file'),choose=document.querySelector('#bear-choose');
 let busy=false,destination=null;
 marked.use({extensions:[
  {name:'bearUnderline',level:'inline',start:src=>src.indexOf('~'),tokenizer(src){const m=/^~(?!~)([^~\n]+)~(?!~)/.exec(src);if(m)return {type:'bearUnderline',raw:m[0],tokens:this.lexer.inlineTokens(m[1])};},renderer(token){return '<u>'+this.parser.parseInline(token.tokens)+'</u>';}},
  {name:'bearHighlight',level:'inline',start:src=>src.search(/==|::/),tokenizer(src){const m=/^(==|::)(.+?)\1/.exec(src);if(m)return {type:'bearHighlight',raw:m[0],tokens:this.lexer.inlineTokens(m[2])};},renderer(token){return '<mark>'+this.parser.parseInline(token.tokens)+'</mark>';}}
 ]});
 function emptyDestination(){
  const p=project(selected);if(!p||p.deletedAt||!['','Untitled project'].includes(p.title.trim()))return null;
  const doc=new DOMParser().parseFromString(p.html,'text/html');
  return !doc.body.textContent.trim()&&!doc.querySelector('img,[data-youtube],input,table,hr')?p.id:null;
 }
 function show(){
  closeMenu();destination=emptyDestination();if(document.querySelector('#action-dialog').open)document.querySelector('#action-dialog').close();
  status.textContent=destination?'The imported note will fill this empty project.':'Each imported note becomes a new project.';
  details.textContent='';if(!dialog.open)dialog.showModal();zone.focus();
 }
 function dataURL(bytes,mime){
  const chunks=[];for(let i=0;i<bytes.length;i+=32768)chunks.push(String.fromCharCode(...bytes.subarray(i,i+32768)));
  return 'data:'+mime+';base64,'+btoa(chunks.join(''));
 }
 function renderNote(note){
  const doc=new DOMParser().parseFromString(marked.parse(note.markdown,{gfm:true,breaks:true}),'text/html');
  const first=doc.body.firstElementChild;let title=note.title;
  if(first?.tagName==='H1'){title=first.textContent.trim()||title;first.remove();}
  let imageCount=0;const warnings=[];
  for(const img of doc.querySelectorAll('img')){
   const src=img.getAttribute('src')||'';
   if(/^data:image\/(png|jpeg|webp|gif);base64,[a-z0-9+/=\s]+$/i.test(src)){imageCount++;continue;}
   const path=BearPackage.assetPath(note.markdownPath,src),bytes=path&&note.assets.get(path),mime=bytes&&BearPackage.imageType(bytes);
   if(mime){img.src=dataURL(bytes,mime);if(!img.alt)img.alt=path.split('/').pop();imageCount++;}
   else{
    const label=img.alt||src.split('/').pop()||'image',missing=doc.createElement('span');
    missing.textContent='[Image unavailable: '+label+']';img.replaceWith(missing);
    warnings.push('Missing or unsupported image: '+label);
   }
  }
  for(const box of doc.querySelectorAll('li input[type="checkbox"]')){
   const list=box.closest('ul');if(list){list.setAttribute('data-checklist','true');box.removeAttribute('disabled');}
  }
  // Unsupported non-image attachments remain readable as labels; show an explicit warning.
  for(const link of doc.querySelectorAll('a[href]')){
   const href=link.getAttribute('href'),path=BearPackage.assetPath(note.markdownPath,href);
   if((path&&note.paths.has(path))||(!safeLink(href)&&!/^#/.test(href))){link.removeAttribute('href');warnings.push('Attachment or internal link was kept as text: '+(link.textContent||href));}
  }
  return {title:title.slice(0,500),html:sanitize(doc.body.innerHTML),imageCount,warnings:[...new Set(warnings)]};
 }
 async function importFiles(files){
  if(busy)return;busy=true;choose.disabled=true;zone.setAttribute('aria-busy','true');
  status.textContent='Unpacking your Bear note…';details.textContent='';
  const prepared=[],errors=[];
  try{
   for(const file of files){
    try{
     if(file.size>100_000_000)throw new Error('The package exceeds the 100 MB limit.');
     const notes=BearPackage.parse(new Uint8Array(await file.arrayBuffer()),file.name);
     prepared.push(...notes.map(renderNote));
    }catch(error){errors.push(file.name+': '+error.message);}
   }
   let lastId=null,totalImages=0;const warnings=[];
   for(const note of prepared){
    let p=destination&&emptyDestination()===destination?project(destination):null;
    if(!p){createProject();p=project(selected);}
    p.title=note.title;p.subtitle='';p.html=note.html;p.updated=Date.now();lastId=p.id;destination=null;
    totalImages+=note.imageCount;warnings.push(...note.warnings.map(w=>note.title+': '+w));
   }
   if(lastId){changed();openEditor(lastId);}
   const summary=prepared.length?`Imported ${prepared.length} note${prepared.length===1?'':'s'} with ${totalImages} image${totalImages===1?'':'s'}.`:'No notes were imported.';
   if(errors.length||warnings.length){
    status.textContent=summary+' See details below.';details.textContent=[...errors,...warnings].join('\n');
   }else{dialog.close();toast(summary);}
   if(!files.length)status.textContent='No readable Bear package arrived. Drag the whole note from Bear’s middle note list.';
  }finally{busy=false;choose.disabled=false;zone.removeAttribute('aria-busy');}
 }
 async function drop(event){
  event.preventDefault();event.stopImmediatePropagation();zone.classList.remove('drag-over');if(busy)return;
  const transfer=event.dataTransfer,files=[...transfer.files];
  const entries=[];
  // Get File objects synchronously first: entry.file() can fail for Bear’s promised files.
  for(const item of transfer.items){
   try{const file=item.getAsFile?.();if(file&&!files.some(f=>f.name===file.name&&f.size===file.size))files.push(file);}catch{}
   try{const entry=item.webkitGetAsEntry?.();if(entry?.isFile)entries.push(entry);}catch{}
  }
  if(!dialog.open)show();
  for(const entry of entries){if(files.some(f=>f.name===entry.name))continue;
   try{files.push(await new Promise((resolve,reject)=>entry.file(resolve,reject)));}catch(error){status.textContent='The browser could not read '+entry.name+': '+error.message;}
  }
  if(files.length)await importFiles(files);
  else status.textContent='No readable Bear package arrived. Drag the whole note from Bear’s middle note list.';
 }
 document.querySelector('#bear-import').onclick=show;
 document.querySelector('#bear-close').onclick=()=>{if(!busy)dialog.close();};
 dialog.addEventListener('cancel',event=>{if(busy)event.preventDefault();});
 choose.onclick=()=>input.click();input.onchange=async()=>{await importFiles([...input.files]);input.value='';};
 zone.ondragover=event=>{event.preventDefault();event.dataTransfer.dropEffect='copy';zone.classList.add('drag-over');};
 zone.ondragleave=()=>zone.classList.remove('drag-over');zone.ondrop=drop;
 dialog.addEventListener('dragover',event=>event.preventDefault());dialog.addEventListener('drop',event=>event.preventDefault());
 document.addEventListener('dragover',event=>{
  if(event.target.closest('#canvas-viewport,#note-body')&&[...event.dataTransfer.items].some(item=>item.kind==='file'))event.preventDefault();
 },true);
 document.addEventListener('drop',event=>{
  if(!event.target.closest('#canvas-viewport,#note-body'))return;
  const files=[...event.dataTransfer.files];
  if(files.some(file=>/\.(bear|zip)$/i.test(file.name)))drop(event);
 },true);
})();
