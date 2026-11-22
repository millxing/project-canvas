/* Project Canvas — local storage, no build, no account. */
'use strict';
const $ = (s, root=document) => root.querySelector(s);
const icons = {
 layers:'<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/>',
 canvas:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="11" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="18" width="7" height="3" rx="1"/>',
 search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>',
 plus:'<path d="M12 5v14M5 12h14"/>', minus:'<path d="M5 12h14"/>',
 grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
 folder:'<path d="M3 7V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/>',
 archive:'<rect x="3" y="3" width="18" height="4" rx="1"/><path d="M5 7v13h14V7M9 11h6"/>',
 book:'<path d="M12 5C9 2 5 2 2 4v15c4-2 7-1 10 1 3-2 6-3 10-1V4c-3-2-7-2-10 1Zm0 0v15"/>',
 monitor:'<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M10 17v4m4-4v4"/>',
 phone:'<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M10 5h4m-3 14h2"/>',
 megaphone:'<path d="m4 10 15-6v16L4 14H2v-4h2Zm3 5 2 6h4l-2-5M19 10l3-1m-3 6 3 1"/>',
 users:'<circle cx="9" cy="7" r="4"/><path d="M2 21v-3a7 7 0 0 1 14 0v3H2Zm14-18a4 4 0 0 1 0 8m2 3a6 6 0 0 1 4 6v1"/>',
 bulb:'<path d="M9 18h6m-6 3h6M8 15c-5-4-3-12 4-12s9 8 4 12l-1 3H9l-1-3Z"/>',
 more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
 expand:'<path d="M14 3h7v7m0-7-7 7M10 21H3v-7m0 7 7-7"/>',
 close:'<path d="m6 6 12 12M6 18 18 6"/>',
 edit:'<path d="m15 4 5 5M3 21l5-1L21 7a2 2 0 0 0-5-5L3 15v6Z"/>',
 trash:'<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
 copy:'<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
 up:'<path d="m6 10 6-6 6 6M12 4v16"/>', down:'<path d="m6 14 6 6 6-6M12 4v16"/>',
 remove:'<path d="M9 4H4v16h5m5-12 4 4-4 4m-6-4h12"/>',
 restore:'<path d="M3 11a9 9 0 1 1 3 8M3 4v7h7m2-5v6l4 2"/>',
 download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
 upload:'<path d="M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5"/>',
 link:'<path d="m10 13 4-4M8 16l-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2 0 1-1a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0"/>',
 unlink:'<path d="m3 3 18 18M8 16l-1 1a4 4 0 0 1-6-6l2-2m10-2 1-1a4 4 0 0 1 6 6l-2 2M9 5l2 2m2 10 2 2"/>',
 video:'<rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3V9Z"/>',
 image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="1.5"/><path d="m3 16 6-5 4 4 3-3 5 5"/>',
 bold:'<path d="M6 3h7a5 5 0 0 1 0 10H6m0 0h8a4 4 0 0 1 0 8H6V3Z"/>',
 italic:'<path d="M10 3h10M4 21h10M15 3 9 21"/>',
 checklist:'<rect x="3" y="4" width="6" height="6" rx="1"/><path d="m4.5 7 1.2 1.2L8 5.5M13 7h8M13 17h8"/><rect x="3" y="14" width="6" height="6" rx="1"/>',
 list:'<path d="M9 6h12M9 12h12M9 18h12"/><circle cx="3" cy="6" r=".5"/><circle cx="3" cy="12" r=".5"/><circle cx="3" cy="18" r=".5"/>',
 heading:'<path d="M4 4v16M16 4v16M4 12h12m3 3 2-2v8"/>',
 text:'<path d="M4 4h16M12 4v17m-5 0h10"/>',
 palette:'<circle cx="8" cy="9" r=".7"/><circle cx="12" cy="6" r=".7"/><circle cx="17" cy="9" r=".7"/><path d="M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 1-4c-2-1 0-3 2-3h3a3 3 0 0 0 2-3 9 9 0 0 0-9-8Z"/>',
 menu:'<path d="M4 6h16M4 12h16M4 18h16"/>', check:'<path d="m5 12 4 4L20 5"/>',
 tidy:'<rect x="3" y="4" width="7" height="7" rx="1"/><rect x="14" y="4" width="7" height="7" rx="1"/><path d="M3 16h7m4 0h7M3 20h18"/>'
};
const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.book}</svg>`;
const escape = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const colors = [{name:'Rose',value:'#f9dcd9'},{name:'Butter',value:'#fff0bd'},{name:'Sage',value:'#dfeee2'},{name:'Sky',value:'#dce9fa'},{name:'Lilac',value:'#e9e1f8'},{name:'Paper',value:'#f9f9fb'}];
const backgrounds = [{name:'Mist',value:'#eef2f5'},{name:'Lavender',value:'#f0edf5'},{name:'Sage',value:'#edf2ed'},{name:'Sand',value:'#f3f0e9'},{name:'Rose',value:'#f5edef'}];
let state, db, selected=null, view='canvas', query='', toastTimer, lastUndo=null, editorRange=null;
let autoZoom=null, zoom=1, grid=window.innerWidth<1000, saveVersion=0, savedVersion=0, saveRunning=false, geometry=null;
const STORAGE_KEY='project-canvas-v1';
/* Hot zone: a movable, resizable rectangle marking projects being worked on now. Everything snaps to a 20px grid. */
const GRID=20, HOT_MIN_W=360, HOT_MIN_H=160, HOT_PAD=20;
const snap=v=>Math.round(v/GRID)*GRID;
const cardH=p=>p.minimized?76:p.height;
function hotCards(){return activeProjects().filter(p=>p.onCanvas&&p.hot);}
function zoneRect(){
 const z=state.hotZone;let x=z.x,y=z.y,r=z.x+Math.max(HOT_MIN_W,z.w),b=z.y+Math.max(HOT_MIN_H,z.h);
 for(const p of hotCards()){x=Math.min(x,p.x-HOT_PAD);y=Math.min(y,p.y-HOT_PAD);r=Math.max(r,p.x+p.width+HOT_PAD);b=Math.max(b,p.y+cardH(p)+HOT_PAD);}
 x=Math.max(0,x);y=Math.max(0,y);return {x,y,w:r-x,h:b-y};
}
function placeZone(zone){const r=zoneRect();zone.style.left=r.x+'px';zone.style.top=r.y+'px';zone.style.width=r.w+'px';zone.style.height=r.h+'px';}
function migrateHotZone(){
 if(!state.hotZone||!Number.isFinite(state.hotZone.x))migrateLegacyZone();
 if(!state.gridSnapped){ /* One time: put every existing card on the grid. */
  for(const p of state.projects){p.x=snap(p.x);p.y=snap(p.y);p.width=Math.max(220,snap(p.width));p.height=Math.max(160,snap(p.height));}
  state.gridSnapped=true;
 }
}
function migrateLegacyZone(){
 /* Older layout: a full-width band at the top, with other cards pushed below it. */
 const hot=state.projects.filter(p=>!p.archived&&!p.deletedAt&&p.onCanvas&&p.hot);
 const old=Math.max(130,hot.length?Math.max(...hot.map(p=>p.y+(p.minimized?76:p.height)))+22:0,state.hotHeight||0);
 for(const p of state.projects)if(!p.hot)p.y+=old;
 state.hotZone={x:0,y:0,w:state.hotWidth||0,h:state.hotHeight||0};delete state.hotHeight;delete state.hotWidth;
}
function seed(){
 const titles=['Website redesign','Mobile app','Product research','Marketing campaign','Team planning','Ideas'];
 const subs=['A thoughtful new home for our next chapter.','A simpler way to keep good ideas close.','Get closer to the people we’re building for.','Make something worth talking about.','Good work starts with a shared direction.','A home for the things that don’t fit anywhere yet.'];
 const notes=[
 '<h2>The direction</h2><p>A calmer, clearer website that makes it easy to understand what we do and where to go next.</p><h2>Next steps</h2><ul><li>Collect references and agree on a visual direction</li><li>Sketch the key pages</li><li>Review the first prototype together</li></ul><h2>Notes</h2><p>Keep the writing human. Give the important things room to breathe.</p>',
 '<h2>The idea</h2><p>Build a small, useful companion for capturing thoughts on the go.</p><h2>First release</h2><ul><li>A quick way to capture a note</li><li>Projects that are easy to find</li><li>A comfortable reading experience</li></ul><h2>Open questions</h2><p>What is the one thing this should do exceptionally well?</p>',
 '<h2>Overview</h2><p>Understand our users, identify the right opportunities, and make better decisions about what comes next.</p><h2>Key questions</h2><ul><li>Where does the current workflow get in the way?</li><li>What do people keep coming back for?</li><li>What would make their day a little easier?</li></ul><h2>Next steps</h2><ul><li>Talk to five people who use the product</li><li>Look for patterns across the conversations</li><li>Share a short summary with the team</li></ul><h2>Images &amp; references</h2><p>Paste an image here or use the image button above to add your references.</p><h2>Notes</h2><p>Start with curiosity. Leave room to be surprised.</p>',
 '<h2>The story</h2><p>A campaign built around useful ideas and real conversations.</p><h2>To explore</h2><ul><li>Choose one message we want people to remember</li><li>Plan the launch sequence</li><li>Collect feedback from the first week</li></ul>',
 '<h2>This quarter</h2><p>Make space for focused work, clear priorities, and a few ambitious ideas.</p><h2>For our next conversation</h2><ul><li>What matters most right now?</li><li>What can we stop doing?</li><li>Where would a little help go a long way?</li></ul>',
 '<h2>A place to begin</h2><p>Half-formed thoughts, unexpected connections, and things to come back to.</p><ul><li>A reading list for a rainy afternoon</li><li>A small creative experiment each week</li><li>Something useful that doesn’t exist yet</li></ul>'
 ];
 return {version:1,gridSnapped:true,hotZone:{x:40,y:20,w:0,h:0},folders:['Work','Personal','Ideas'],background:backgrounds[0].value,projects:titles.map((title,i)=>({id:crypto.randomUUID(),title,subtitle:subs[i],html:notes[i],folder:i===5?'Ideas':i===4?'Personal':'Work',color:colors[i].value,icon:['monitor','phone','book','megaphone','users','bulb'][i],onCanvas:true,archived:false,minimized:i===5,x:[38,350,675,60,390,710][i],y:[208,227,208,476,502,480][i],width:[278,290,278,290,280,262][i],height:[228,216,244,228,217,210][i],z:i+1,created:Date.now()-i*86400000,updated:Date.now()-i*86400000}))};
}
function safeLink(value){
 try{
  let text=String(value||'').trim();if(!text||/[\x00-\x1f\x7f]/.test(text))return '';
  if(!/^[a-z][a-z0-9+.-]*:/i.test(text))text='https://'+text;
  const url=new URL(text);
  if(!['http:','https:','mailto:'].includes(url.protocol)||url.username||url.password)return '';
  if(url.protocol==='mailto:'&&!url.pathname)return '';
  return url.href;
 }catch{return '';}
}
function youtubeId(value){
 try{
  const url=new URL(/^https?:\/\//i.test(String(value).trim())?String(value).trim():'https://'+String(value).trim());
  if(!['https:','http:'].includes(url.protocol)||url.username||url.password||url.port)return null;
  const host=url.hostname.toLowerCase();let id=null;
  if(['youtu.be','www.youtu.be'].includes(host))id=url.pathname.split('/')[1];
  else if(['youtube.com','www.youtube.com','m.youtube.com','music.youtube.com','youtube-nocookie.com','www.youtube-nocookie.com'].includes(host)){
   if(url.pathname==='/watch')id=url.searchParams.get('v');
   else if(/^\/(embed|shorts|live)\//.test(url.pathname))id=url.pathname.split('/')[2];
  }
  return id&&/^[a-zA-Z0-9_-]{11}$/.test(id)?id:null;
 }catch{return null;}
}
function videoPlaceholder(id,doc=document){
 const el=doc.createElement('div');el.setAttribute('data-youtube',id);el.setAttribute('contenteditable','false');el.textContent='YouTube video';return el;
}
function hydrateNoteMedia(body,readOnly=false){
 body.querySelectorAll('img').forEach(img=>{img.tabIndex=0;img.draggable=false;img.title='Click or right-click for image actions. Drag to move.';});
 body.querySelectorAll('a[href]').forEach(a=>{const url=safeLink(a.getAttribute('href'));if(url){a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.title='Open link in a new tab';}else a.removeAttribute('href');});
 body.querySelectorAll('[data-youtube]').forEach(wrapper=>{
  const id=wrapper.getAttribute('data-youtube');if(!/^[a-zA-Z0-9_-]{11}$/.test(id)||wrapper.dataset.videoReady)return;
  wrapper.setAttribute('contenteditable','false');wrapper.dataset.videoReady='true';wrapper.replaceChildren();
  if(location.protocol==='http:'||location.protocol==='https:'){
   const frame=document.createElement('iframe');frame.src=`https://www.youtube-nocookie.com/embed/${id}?rel=0`;
   frame.title='YouTube video player';frame.allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';frame.loading='lazy';wrapper.append(frame);
  }else{
   const hint=document.createElement('p');hint.className='video-hint';hint.textContent='For embedded playback, open the app using Start Project Canvas.command. You can watch this video on YouTube below.';wrapper.append(hint);
  }
  const controls=document.createElement('div');controls.className='video-controls';
  const link=document.createElement('a');link.href=`https://www.youtube.com/watch?v=${id}`;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Open on YouTube';controls.append(link);
  if(!readOnly){const remove=document.createElement('button');remove.type='button';remove.dataset.removeVideo='true';remove.textContent='Remove video';controls.append(remove);}
  wrapper.append(controls);
 });
}
function noteImageFilename(img){
 const type=img.src.match(/^data:image\/(png|jpeg|webp|gif);/i)?.[1]||'png';
 const name=(img.alt||'project-image').replace(/\.[a-z0-9]+$/i,'').replace(/[\\/:*?"<>|\x00-\x1f]/g,'-').trim().slice(0,100)||'project-image';
 return name+'.'+(type==='jpeg'?'jpg':type);
}
function saveNoteImage(img){
 const link=document.createElement('a');link.href=img.src;link.download=noteImageFilename(img);link.click();
}
async function copyNoteImage(img){
 try{
  if(!img.complete||!img.naturalWidth)throw new Error('Image is still loading.');
  if(!navigator.clipboard?.write||typeof ClipboardItem==='undefined')throw new Error('This browser cannot copy images directly. Use Save image instead.');
  const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;canvas.getContext('2d').drawImage(img,0,0);
  const png=new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Could not prepare the image.')),'image/png'));
  await navigator.clipboard.write([new ClipboardItem({'image/png':png})]);toast('Image copied.');
 }catch(error){toast(error.message||'Copy was blocked by the browser. Use Save image instead.');}
}
function openNoteImage(img){
 const match=img.src.match(/^data:(image\/(?:png|jpeg|webp|gif));base64,([a-z0-9+/=\s]+)$/i);if(!match)return;
 const bytes=Uint8Array.from(atob(match[2]),c=>c.charCodeAt(0));const url=URL.createObjectURL(new Blob([bytes],{type:match[1]}));
 window.open(url,'_blank','noopener,noreferrer');setTimeout(()=>URL.revokeObjectURL(url),60000);
}
function deleteNoteImage(img,body,update){
 const id=selected,parent=img.parentNode,next=img.nextSibling,saved=img.cloneNode(true);
 img.remove();update();toast('Image deleted.',()=>{
  const p=project(id);if(!p){toast('The project is no longer available.');return;}
  if(body.isConnected&&selected===id&&!p.deletedAt){
   if(parent.isConnected)parent.insertBefore(saved,next?.parentNode===parent?next:null);else body.append(saved);
   update();
  }else{
   const content=document.createElement('div');content.innerHTML=p.html;content.append(saved);p.html=sanitize(content.innerHTML);p.updated=Date.now();markDirty();if(selected===id)openEditor(id);
  }
  toast('Image restored.');
 },'Undo');
}
function moveNoteImage(img,direction,body,update){
 let block=img;while(block.parentElement!==body&&block.parentElement)block=block.parentElement;
 const target=direction<0?block.previousElementSibling:block.nextElementSibling;
 if(!target){toast(direction<0?'Image is already at the beginning.':'Image is already at the end.');return;}
 const unit=block.tagName==='P'&&!block.textContent.trim()&&block.querySelectorAll('img').length===1?block:img;
 if(direction<0)target.before(unit);else target.after(unit);update();
}
function noteImageMenu(img,body,update,readOnly,event){
 const rect=img.getBoundingClientRect();const x=event?.clientX||rect.left+20,y=event?.clientY||rect.top+20;
 const anchor={getBoundingClientRect:()=>({left:x,bottom:y})};
 menu(anchor,[['copy','Copy image',()=>copyNoteImage(img)],['download','Save image as…',()=>saveNoteImage(img)],['expand','Open image',()=>openNoteImage(img)],
 ...(!readOnly?[null,['up','Move image up',()=>moveNoteImage(img,-1,body,update)],['down','Move image down',()=>moveNoteImage(img,1,body,update)],null,['trash','Delete image',()=>deleteNoteImage(img,body,update),'danger']]:[])]);
}
function startNoteImageDrag(event,body,update){
 const img=event.target;if(img.tagName!=='IMG'||event.button!==0||event.ctrlKey)return;
 event.preventDefault();img.focus({preventScroll:true});const x=event.clientX,y=event.clientY;
 let dragged=false,drop=null,finished=false;const marker=document.createElement('div');marker.className='image-drop-marker';marker.hidden=true;document.body.append(marker);
 img.setPointerCapture(event.pointerId);
 img.onpointermove=e=>{
  if(!dragged&&Math.hypot(e.clientX-x,e.clientY-y)<6)return;
  dragged=true;closeMenu();img.classList.add('image-moving');drop=null;marker.hidden=true;
  const target=document.elementFromPoint(e.clientX,e.clientY);
  if(!target||target===img||!body.contains(target)||target.closest('[data-youtube]'))return;
  let range=document.caretRangeFromPoint?.(e.clientX,e.clientY);
  if(!range&&document.caretPositionFromPoint){const caret=document.caretPositionFromPoint(e.clientX,e.clientY);if(caret){range=document.createRange();range.setStart(caret.offsetNode,caret.offset);range.collapse(true);}}
  if(!range||!body.contains(range.startContainer)||img.contains(range.startContainer))return;
  drop=range;const rect=range.getBoundingClientRect();marker.style.left=(rect.height?rect.left:e.clientX)+'px';marker.style.top=(rect.height?rect.top:e.clientY)+'px';marker.style.height=Math.max(22,rect.height)+'px';marker.hidden=false;
 };
 const finish=cancelled=>{
  if(finished)return;finished=true;marker.remove();img.classList.remove('image-moving');img.onpointermove=null;img.onpointerup=null;img.onpointercancel=null;img.onlostpointercapture=null;
  if(dragged){img.dataset.suppressClick='true';setTimeout(()=>delete img.dataset.suppressClick,0);}
  if(!cancelled&&dragged&&drop&&body.contains(drop.startContainer)){drop.insertNode(img);update();}
 };
 img.onpointerup=()=>finish(false);img.onpointercancel=()=>finish(true);img.onlostpointercapture=()=>finish(true);
}
function restoreNoteRange(body,range){
 body.focus();if(range&&body.contains(range.commonAncestorContainer)){const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);}else placeCaret(body,true);
}
function editNoteLink(body,update){
 rememberRange();const range=editorRange?.cloneRange(),id=selected;
 const anchor=range?.startContainer.nodeType===1?range.startContainer:range?.startContainer.parentElement;
 const existing=anchor?.closest('a[href]');const link=existing&&body.contains(existing)?existing:[...body.querySelectorAll('a[href]')].find(a=>range&&!range.collapsed&&range.intersectsNode(a)&&range.toString()===a.textContent)||null;
 const text=link?link.textContent:range?.toString()||'';
 showDialog({title:link?'Edit link':'Insert link',inputLabel:'Web address',value:link?.getAttribute('href')||'',maxLength:2048,extraLabel:'Link text',extraValue:text,confirmLabel:link?'Save link':'Insert link',validateInput:value=>safeLink(value)?'':'Enter a valid http, https, or email address.',onConfirm:(value,label)=>{
  if(selected!==id||!body.isConnected)return;const url=safeLink(value);restoreNoteRange(body,range);
  if(link?.isConnected){link.href=url;if(label.trim()&&label!==text)link.textContent=label.trim();}
  else if(range&&!range.collapsed&&label===text)document.execCommand('createLink',false,url);
  else document.execCommand('insertHTML',false,`<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(label.trim()||url)}</a>`);
  update();
 }});
}
function insertYouTube(body,update){
 rememberRange();const range=editorRange?.cloneRange(),id=selected;
 showDialog({title:'Embed YouTube video',inputLabel:'YouTube URL',maxLength:2048,confirmLabel:'Embed video',message:'Paste a YouTube watch, share, Shorts, or live video URL.',validateInput:value=>youtubeId(value)?'':'Enter a valid YouTube video URL.',onConfirm:value=>{
  if(selected!==id||!body.isConnected)return;const video=youtubeId(value);restoreNoteRange(body,range);
  document.execCommand('insertHTML',false,videoPlaceholder(video).outerHTML+'<p><br><br></p>');update();
 }});
}
function sanitize(html){
 const doc=new DOMParser().parseFromString(String(html),'text/html');
 const allowed=new Set(['P','BR','DIV','H1','H2','H3','H4','H5','H6','STRONG','B','EM','I','U','DEL','S','MARK','SUP','SUB','HR','PRE','CODE','TABLE','THEAD','TBODY','TR','TH','TD','UL','OL','LI','BLOCKQUOTE','A','IMG','SPAN','INPUT']);
 function clean(node){
  for(const child of [...node.children]){
   if(child.tagName==='IFRAME'){const id=youtubeId(child.getAttribute('src'));if(id)child.replaceWith(videoPlaceholder(id,doc));else child.remove();continue;}
   if(child.tagName==='DIV'&&/^[a-zA-Z0-9_-]{11}$/.test(child.getAttribute('data-youtube')||'')){child.replaceWith(videoPlaceholder(child.getAttribute('data-youtube'),doc));continue;}
   if(['SCRIPT','STYLE','IFRAME','OBJECT','SVG','MATH','FORM'].includes(child.tagName)){child.remove();continue;}
   if(child.tagName==='INPUT'&&!(child.getAttribute('type')==='checkbox'&&child.parentElement?.tagName==='LI'&&child.parentElement.parentElement?.matches('ul[data-checklist="true"]'))){child.remove();continue;}
   clean(child);
   if(!allowed.has(child.tagName)){child.replaceWith(...child.childNodes);continue;}
   const href=child.getAttribute('href'),src=child.getAttribute('src'),alt=child.getAttribute('alt');
   const checklist=child.tagName==='UL'&&child.getAttribute('data-checklist')==='true';
   const taskText=child.tagName==='SPAN'&&child.hasAttribute('data-task-text');
   const checked=child.tagName==='INPUT'&&child.hasAttribute('checked');
   const start=child.tagName==='OL'?child.getAttribute('start'):null;
   const colspan=['TD','TH'].includes(child.tagName)?child.getAttribute('colspan'):null;
   const rowspan=['TD','TH'].includes(child.tagName)?child.getAttribute('rowspan'):null;
   for(const a of [...child.attributes])child.removeAttribute(a.name);
   if(start&&/^-?\d{1,6}$/.test(start))child.setAttribute('start',start);
   for(const [key,value] of [['colspan',colspan],['rowspan',rowspan]])if(value&&/^[1-9]\d?$/.test(value))child.setAttribute(key,value);
   if(checklist)child.setAttribute('data-checklist','true');
   if(taskText)child.setAttribute('data-task-text','');
   if(child.tagName==='INPUT'){child.setAttribute('type','checkbox');child.setAttribute('contenteditable','false');if(checked)child.setAttribute('checked','');}
   if(child.tagName==='A' && safeLink(href)){child.setAttribute('href',safeLink(href));child.setAttribute('target','_blank');child.setAttribute('rel','noopener noreferrer');}
   if(child.tagName==='IMG'){
    if(src && /^data:image\/(png|jpeg|webp|gif);base64,[a-z0-9+/=\s]+$/i.test(src)){child.setAttribute('src',src);child.setAttribute('alt',alt||'Project reference');}else child.remove();
   }
  }
 }
 clean(doc.body);normalizeChecklists(doc.body);return doc.body.innerHTML;
}
function normalizeChecklists(root){
 root.querySelectorAll('ul[data-checklist="true"]').forEach(list=>{
  list.querySelectorAll(':scope > li').forEach(item=>{
   const doc=item.ownerDocument;
   let checkbox=item.querySelector(':scope > input[type="checkbox"]');
   let text=item.querySelector(':scope > span[data-task-text]');
   if(!text){text=doc.createElement('span');text.setAttribute('data-task-text','');item.append(text);}
   for(const node of [...item.childNodes]){
    if(node===text||node===checkbox)continue;
    if(node.nodeType===1&&(node.matches('ul,ol')))continue;
    if(node.nodeType===1&&node.matches('input')){node.remove();continue;}
    text.append(node);
   }
   if(!text.hasChildNodes())text.append(doc.createElement('br'));
   if(!checkbox){checkbox=doc.createElement('input');checkbox.type='checkbox';item.prepend(checkbox);}
   checkbox.setAttribute('contenteditable','false');
   checkbox.setAttribute('aria-label',`Complete task: ${text.textContent.trim().slice(0,120)||'Untitled task'}`);
  });
 });
}
function placeCaret(element,atEnd=false){
 const range=document.createRange();range.selectNodeContents(element);range.collapse(!atEnd);
 const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);
}
function toggleChecklist(body){
 body.focus();let selection=window.getSelection();
 if(!selection.rangeCount||!body.contains(selection.anchorNode))placeCaret(body,true);
 selection=window.getSelection();let node=selection.anchorNode.nodeType===1?selection.anchorNode:selection.anchorNode.parentElement;
 let list=node.closest('ul,ol');if(list&&!body.contains(list))list=null;
 if(list?.matches('ul[data-checklist="true"]')){
  list.removeAttribute('data-checklist');
  list.querySelectorAll(':scope > li').forEach(item=>{
   item.querySelector(':scope > input[type="checkbox"]')?.remove();
   const text=item.querySelector(':scope > span[data-task-text]');if(text)text.replaceWith(...text.childNodes);
  });
  return;
 }
 if(!list){document.execCommand('insertUnorderedList');selection=window.getSelection();node=selection.anchorNode.nodeType===1?selection.anchorNode:selection.anchorNode.parentElement;list=node.closest('ul');}
 if(!list||!body.contains(list))return;
 if(list.tagName==='OL'){const ul=document.createElement('ul');ul.append(...list.childNodes);list.replaceWith(ul);list=ul;}
 list.setAttribute('data-checklist','true');normalizeChecklists(body);
 const text=list.querySelector('span[data-task-text]');if(text)placeCaret(text,true);
}
function leaveChecklistItem(item){
 const list=item.parentElement,after=list.cloneNode(false),paragraph=document.createElement('p');
 let sibling=item.nextSibling;while(sibling){const next=sibling.nextSibling;after.append(sibling);sibling=next;}
 const text=item.querySelector(':scope > span[data-task-text]');if(text)paragraph.append(...text.childNodes);
 if(!paragraph.textContent&&!paragraph.querySelector('img'))paragraph.replaceChildren(document.createElement('br'),document.createElement('br'));
 list.after(paragraph);if(after.hasChildNodes())paragraph.after(after);
 item.remove();if(!list.hasChildNodes())list.remove();placeCaret(paragraph);
}
function checklistKeydown(event,body,update){
 if(event.isComposing||event.target.closest('input,button,a[href],[contenteditable="false"]')||event.shiftKey||!['Enter','Backspace'].includes(event.key))return;
 const selection=window.getSelection();if(!selection.rangeCount)return;
 const range=selection.getRangeAt(0);const node=range.startContainer.nodeType===1?range.startContainer:range.startContainer.parentElement;
 const text=node.closest('span[data-task-text]'),item=text?.parentElement;
 if(!text||!body.contains(text)||!item.parentElement.matches('ul[data-checklist="true"]')||!text.contains(range.endContainer))return;
 if(event.key==='Backspace'){
  const prefix=range.cloneRange();prefix.selectNodeContents(text);prefix.setEnd(range.startContainer,range.startOffset);
  if(!range.collapsed||prefix.toString().length)return;
  event.preventDefault();leaveChecklistItem(item);update();return;
 }
 event.preventDefault();
 if(!text.textContent.trim()&&!text.querySelector('img')){leaveChecklistItem(item);update();return;}
 range.deleteContents();const tail=range.cloneRange();tail.setEnd(text,text.childNodes.length);
 const rest=tail.extractContents(),next=document.createElement('li'),nextText=document.createElement('span');
 nextText.setAttribute('data-task-text','');nextText.append(rest);next.append(nextText);item.after(next);
 normalizeChecklists(body);placeCaret(nextText);update();
}
function validate(raw){
 if(!raw || raw.version!==1 || !Array.isArray(raw.projects) || raw.projects.length>5000 || !Array.isArray(raw.folders))throw new Error('Choose a Project Canvas backup file.');
 const seen=new Set();const folders=[...new Set(raw.folders.map(f=>String(f).trim().slice(0,80)).filter(Boolean))].slice(0,200);
 return {version:1,folders,editorWidth:Number.isFinite(raw.editorWidth)?Math.max(320,Math.min(900,raw.editorWidth)):410,hotHeight:Number.isFinite(raw.hotHeight)?Math.max(0,raw.hotHeight):0,hotWidth:Number.isFinite(raw.hotWidth)?Math.max(0,raw.hotWidth):0,gridSnapped:!!raw.gridSnapped,hotZone:raw.hotZone&&Number.isFinite(raw.hotZone.x)&&Number.isFinite(raw.hotZone.y)?{x:Math.max(0,Math.min(20000,raw.hotZone.x)),y:Math.max(0,Math.min(20000,raw.hotZone.y)),w:Number.isFinite(raw.hotZone.w)?Math.max(0,Math.min(20000,raw.hotZone.w)):0,h:Number.isFinite(raw.hotZone.h)?Math.max(0,Math.min(20000,raw.hotZone.h)):0}:null,background:backgrounds.some(b=>b.value===raw.background)?raw.background:backgrounds[0].value,projects:raw.projects.map((p,i)=>{
  if(!p||typeof p.title!=='string'||typeof p.id!=='string'||seen.has(p.id))throw new Error('This backup contains invalid or duplicate projects.');seen.add(p.id);
  const number=(v,f,min,max)=>Number.isFinite(v)?Math.max(min,Math.min(max,v)):f;
  return {id:p.id,title:p.title.slice(0,500),subtitle:String(p.subtitle||'').slice(0,4000),html:sanitize(p.html||''),folder:folders.includes(p.folder)?p.folder:'',color:colors.some(c=>c.value===p.color)?p.color:colors[0].value,icon:icons[p.icon]?p.icon:'book',onCanvas:!!p.onCanvas,hot:!!p.hot,archived:!!p.archived,deletedAt:Number.isFinite(p.deletedAt)&&p.deletedAt>0?p.deletedAt:null,minimized:!!p.minimized,x:number(p.x,38,0,20000),y:number(p.y,8,0,20000),width:number(p.width,278,220,1000),height:number(p.height,228,160,1500),z:number(p.z,i+1,0,1000000),created:number(p.created,Date.now(),0,9999999999999),updated:number(p.updated,Date.now(),0,9999999999999)};
 })};
}
async function boot(){
 try{
  db=await new Promise((resolve,reject)=>{const r=indexedDB.open(STORAGE_KEY,1);r.onupgradeneeded=()=>r.result.createObjectStore('workspace');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
  const stored=await new Promise((resolve,reject)=>{const r=db.transaction('workspace').objectStore('workspace').get('state');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
  state=stored?validate(stored):seed();migrateHotZone();
 }catch(error){state=seed();migrateHotZone();db=null;$('#save-state').textContent='Storage unavailable — export a backup';$('#save-state').classList.add('error');}
 render();if(db)markDirty();
}
function markDirty(){
 saveVersion++;if(db){$('#save-state').textContent='Saving…';persist();}
}
async function persist(){
 if(!db||saveRunning||savedVersion===saveVersion)return;
 saveRunning=true;const revision=saveVersion;const snapshot=structuredClone(state);
 try{
  await new Promise((resolve,reject)=>{const tx=db.transaction('workspace','readwrite');tx.objectStore('workspace').put(snapshot,'state');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});
  savedVersion=revision;$('#save-state').classList.remove('error');$('#save-state').textContent='Saved on this browser';
 }catch(error){$('#save-state').classList.add('error');$('#save-state').textContent='Couldn’t save — export a backup';toast('Browser storage is full or unavailable. Export a backup to keep your work.');}
 saveRunning=false;if(saveVersion>revision)persist();
}
function project(id){return state.projects.find(p=>p.id===id);}
function activeProjects(){return state.projects.filter(p=>!p.archived&&!p.deletedAt);}
function filtered(){
 let list=state.projects.filter(p=>view==='trash'?!!p.deletedAt:!p.deletedAt&&(view==='archive'?p.archived:!p.archived));
 if(view==='canvas')list=list.filter(p=>p.onCanvas);
 if(view.startsWith('folder:'))list=list.filter(p=>p.folder===view.slice(7));
 if(query){const q=query.toLowerCase();list=list.filter(p=>`${p.title} ${p.subtitle} ${p.folder} ${plain(p.html)}`.toLowerCase().includes(q));}
 return list;
}
function plain(html){const d=document.createElement('div');d.innerHTML=html;return d.textContent||'';}
function date(ts){return new Date(ts).toLocaleDateString(undefined,{month:'short',day:'numeric'});}
function render(){
 document.documentElement.style.setProperty('--canvas',state.background);applyEditorWidth();renderSidebar();renderCanvas();
}
function editorWidthBounds(){
 const sidebar=$('#sidebar').getBoundingClientRect().width;
 return {min:320,max:Math.max(320,Math.min(900,window.innerWidth-sidebar-320))};
}
function applyEditorWidth(preferred=state.editorWidth||410){
 const {min,max}=editorWidthBounds();const width=Math.round(Math.max(min,Math.min(max,preferred)));
 document.documentElement.style.setProperty('--editor-width',width+'px');
 const divider=$('#editor-divider');divider.setAttribute('aria-valuemin',min);divider.setAttribute('aria-valuemax',max);divider.setAttribute('aria-valuenow',width);divider.setAttribute('aria-valuetext',`Note width ${width} pixels`);
 return width;
}
function saveEditorWidth(width){state.editorWidth=applyEditorWidth(width);markDirty();}
const divider=$('#editor-divider');
divider.onpointerdown=e=>{
 if(e.button!==0||window.innerWidth<=960)return;
 e.preventDefault();closeMenu();const startX=e.clientX,startWidth=$('#editor').getBoundingClientRect().width;
 let width=startWidth,finished=false;
 divider.setPointerCapture(e.pointerId);document.body.classList.add('resizing-editor');
 divider.onpointermove=event=>{width=applyEditorWidth(startWidth+startX-event.clientX);};
 const finish=()=>{
  if(finished)return;finished=true;divider.onpointermove=null;divider.onpointerup=null;divider.onpointercancel=null;divider.onlostpointercapture=null;
  document.body.classList.remove('resizing-editor');saveEditorWidth(width);
 };
 divider.onpointerup=finish;divider.onpointercancel=finish;divider.onlostpointercapture=finish;
};
divider.onkeydown=e=>{
 const current=Number(divider.getAttribute('aria-valuenow'));const step=e.shiftKey?50:20;
 const widths={ArrowLeft:current+step,ArrowRight:current-step,Home:410,End:editorWidthBounds().max};
 if(Object.hasOwn(widths,e.key)){e.preventDefault();saveEditorWidth(widths[e.key]);}
};
divider.ondblclick=()=>saveEditorWidth(410);
function renderSidebar(){
 const navs=[['canvas','canvas','Canvas',activeProjects().filter(p=>p.onCanvas).length],['all','book','All projects',activeProjects().length],['archive','archive','Archive',state.projects.filter(p=>p.archived&&!p.deletedAt).length],['trash','trash','Trash',state.projects.filter(p=>p.deletedAt).length]];
 $('#navigation').innerHTML=navs.map(([key,ic,label,n])=>`<button class="nav-item ${view===key?'active':''}" data-view="${key}">${icon(ic)}${label}<span class="count">${n}</span></button>`).join('');
 $('#folders').innerHTML=state.folders.map(f=>`<div class="folder-row"><button class="nav-item ${view==='folder:'+f?'active':''}" data-view="${escape('folder:'+f)}" title="Drag to reorder folder"><span class="folder-dot"></span><span class="folder-name">${escape(f)}</span><span class="count">${activeProjects().filter(p=>p.folder===f).length}</span></button><button class="icon-button folder-more" data-folder-menu="${escape(f)}" aria-label="Actions for folder ${escape(f)}" title="Rename, reorder, or delete folder">${icon('more')}</button></div>`).join('');
 document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>switchView(b.dataset.view));
 $('#folders').querySelectorAll('[data-folder-menu]').forEach(b=>b.onclick=()=>folderMenu(b.dataset.folderMenu,b));
 $('#folders').querySelectorAll('.folder-row').forEach(row=>{
  const button=row.querySelector('[data-view]');const name=button.dataset.view.slice(7);let didDrag=false;
  button.onclick=()=>{if(!didDrag)switchView('folder:'+name);};
  button.onpointerdown=e=>{
   if(e.button!==0)return;didDrag=false;let targetName=null,finished=false;
   const startX=e.clientX,startY=e.clientY;button.setPointerCapture(e.pointerId);
   const clearTargets=()=>$('#folders').querySelectorAll('.folder-drop').forEach(el=>el.classList.remove('folder-drop'));
   button.onpointermove=event=>{
    if(!didDrag&&Math.hypot(event.clientX-startX,event.clientY-startY)<6)return;
    didDrag=true;row.classList.add('folder-dragging');clearTargets();
    const target=document.elementFromPoint(event.clientX,event.clientY)?.closest('.folder-row');
    targetName=target?.querySelector('[data-view]').dataset.view.slice(7)||null;
    if(targetName&&targetName!==name)target.classList.add('folder-drop');
   };
   const finish=cancelled=>{
    if(finished)return;finished=true;button.onpointermove=null;button.onpointerup=null;button.onpointercancel=null;button.onlostpointercapture=null;row.classList.remove('folder-dragging');clearTargets();
    if(!cancelled&&didDrag&&targetName&&targetName!==name)reorderFolder(name,state.folders.indexOf(targetName));
   };
   button.onpointerup=()=>finish(false);button.onpointercancel=()=>finish(true);button.onlostpointercapture=()=>finish(true);
  };
 });
}
function folderMenu(name,anchor){
 const index=state.folders.indexOf(name);
 menu(anchor,[['edit','Rename folder',()=>renameFolder(name)],
 ...(index>0?[['up','Move up',()=>reorderFolder(name,index-1)]]:[]),
 ...(index<state.folders.length-1?[['down','Move down',()=>reorderFolder(name,index+1)]]:[]),
 null,['trash','Delete folder',()=>deleteFolder(name),'danger']]);
}
function renameFolder(name){
 if(!state.folders.includes(name))return;
 showDialog({title:'Rename folder',inputLabel:'Folder name',value:name,confirmLabel:'Save name',onConfirm:input=>{
  const index=state.folders.indexOf(name);if(index<0)return;
  const next=input.trim().slice(0,80);if(!next||next===name)return;
  if(state.folders.includes(next)){toast('That folder already exists.');return;}
  state.folders[index]=next;
  for(const p of state.projects){if(p.folder===name){p.folder=next;p.updated=Date.now();}}
  if(view==='folder:'+name)view='folder:'+next;
  changed();refreshFolderPicker();toast('Folder renamed.');
 }});
}
function reorderFolder(name,target){
 const index=state.folders.indexOf(name);if(index<0||!Number.isInteger(target))return;
 state.folders.splice(index,1);state.folders.splice(Math.max(0,Math.min(state.folders.length,target)),0,name);
 changed();refreshFolderPicker();
}
function refreshFolderPicker(){
 const picker=$('#project-folder');const p=project(selected);if(!picker||!p)return;
 picker.innerHTML='<option value="">Unfiled</option>'+state.folders.map(f=>`<option value="${escape(f)}">${escape(f)}</option>`).join('');
 picker.value=p.folder;
}
function deleteFolder(name){
 const index=state.folders.indexOf(name);if(index<0)return;
 const affected=state.projects.filter(p=>p.folder===name).map(p=>p.id);
 state.folders.splice(index,1);
 for(const id of affected){const p=project(id);p.folder='';p.updated=Date.now();}
 if(view==='folder:'+name){view='all';query='';$('#search').value='';}
 changed();refreshFolderPicker();
 toast(`Folder “${name}” deleted. Projects kept.`,()=>{
  if(!state.folders.includes(name))state.folders.splice(Math.min(index,state.folders.length),0,name);
  for(const id of affected){const p=project(id);if(p&&p.folder===''){p.folder=name;p.updated=Date.now();}}
  changed();refreshFolderPicker();toast('Folder restored.');
 });
}
function switchView(next){view=next;query='';$('#search').value='';closeMenu();$('#sidebar').classList.remove('open');render();}
function renderCanvas(){
 const canvasView=view==='canvas';const list=filtered();
 $('#view-heading').hidden=canvasView&&!query;
 $('.canvas-heading').classList.toggle('canvas-heading-compact',canvasView&&!query);
 const title=canvasView?'A little room to think.':view==='all'?'All your projects.':view==='archive'?'Room for what’s next.':view==='trash'?'Trash':view.slice(7);
 $('#view-title').textContent=query?'Search results':title;$('#project-count').textContent=`${list.length} project${list.length===1?'':'s'}`;
 $('#view-subtitle').textContent=query?`Matching “${query}” across your collection.`:canvasView?'Your projects, right where you left them.':view==='archive'?'Finished for now. Ready whenever you are.':view==='trash'?'Deleted projects stay here until you permanently remove them.':view==='all'?'A place for everything you’re working on.':'A few related things, together.';
 $('#canvas').hidden=!canvasView;$('#collection').hidden=canvasView;
 $('#empty-trash').hidden=view!=='trash';$('#empty-trash').disabled=!state.projects.some(p=>p.deletedAt);
 $('#tidy').disabled=!canvasView;$('#layout-toggle').hidden=!canvasView;$('.zoom-controls').style.visibility=canvasView&&!grid?'visible':'hidden';
 $('#canvas-hint').hidden=canvasView&&!grid;
 $('#canvas-hint').textContent=canvasView?(grid?'Use a card’s menu to change its order.':''):'Open a project to read, edit, or bring it to the canvas.';
 $('#layout-toggle').innerHTML=icon(grid?'canvas':'grid');$('#layout-toggle').title=grid?'Switch to free canvas':'Switch to grid layout';$('#layout-toggle').setAttribute('aria-label',$('#layout-toggle').title);
 $('#empty-state').hidden=list.length>0 || (canvasView&&!query);
 if(!list.length){$('#empty-state').innerHTML=`${icon(view==='trash'?'trash':view==='archive'?'archive':'book')}<h2>${query?'No projects found':view==='trash'?'Trash is empty':view==='archive'?'Nothing archived yet':'A little space for something new.'}</h2><p>${query?'Try another title, folder, or word from your notes.':view==='trash'?'Deleted projects appear here. Restore them whenever you need them.':view==='archive'?'Archive a project from its menu when you’re finished for now.':'Create a project or bring one back from All projects.'}</p>${query||view==='archive'||view==='trash'?'':'<button class="primary" id="empty-create">New project</button>'}`;if($('#empty-create'))$('#empty-create').onclick=createProject;}
 if(canvasView){
  const canvas=$('#canvas');canvas.className=grid?'grid-mode':'';canvas.style.zoom=grid?'1':String(zoom);
  const showZone=!grid&&!query,zr=showZone?zoneRect():{x:0,y:0,w:0,h:0};
  canvas.style.width=grid?'100%':Math.max(1040,zr.x+zr.w+45,...list.map(p=>p.x+p.width+45))+'px';
  canvas.style.height=grid?'auto':Math.max(650,zr.y+zr.h+70,...list.map(p=>p.y+cardH(p)+70))+'px';
  const sorted=[...list].sort((a,b)=>a.z-b.z);
  canvas.innerHTML=grid&&!query?`<div class="hot-zone hot-zone-flow">${sorted.filter(p=>p.hot).map(cardHTML).join('')}</div>${sorted.filter(p=>!p.hot).map(cardHTML).join('')}`:(showZone?`<div class="hot-zone" style="left:${zr.x}px;top:${zr.y}px;width:${zr.w}px;height:${zr.h}px"><div class="hot-grip" title="Drag to move the zone and its cards"></div><div class="hot-handle" role="separator" aria-orientation="horizontal" aria-label="Resize hot zone height" title="Drag to change the height. Double-click to fit its cards." tabindex="0"></div><div class="hot-handle-x" role="separator" aria-orientation="vertical" aria-label="Resize hot zone width" title="Drag to change the width. Double-click to fit its cards." tabindex="0"></div></div>`:'')+sorted.map(cardHTML).join('');
  const zoneEl=$('.hot-zone:not(.hot-zone-flow)',canvas);if(zoneEl)bindHotZone(zoneEl);
  canvas.querySelectorAll('.project-card').forEach(bindCard);
 }else{
  $('#collection').className='collection-list';
  $('#collection').innerHTML=`<div class="collection-head"><span>PROJECT</span><span class="row-folder">FOLDER</span><span class="row-date">${view==='trash'?'DELETED':'LAST EDITED'}</span><span></span></div>`+[...list].sort((a,b)=>view==='trash'?b.deletedAt-a.deletedAt:b.updated-a.updated).map(p=>`<div class="project-row" data-id="${escape(p.id)}" tabindex="0" role="button" aria-label="Open ${escape(p.title)}"><div class="row-title"><span class="folder-dot" style="background:${p.color}"></span><div><strong>${escape(p.title||'Untitled project')}</strong><p>${escape(p.subtitle)}</p></div></div><span class="row-folder">${escape(p.folder||'Unfiled')}</span><span class="row-date">${date(view==='trash'?p.deletedAt:p.updated)}</span><button class="row-action" data-restore="${escape(p.id)}">${p.deletedAt||p.archived?'Restore':p.onCanvas?'On canvas':'Show on canvas'}</button></div>`).join('');
  $('#collection').querySelectorAll('.project-row').forEach(row=>{row.onclick=e=>{if(!e.target.closest('[data-restore]'))openEditor(row.dataset.id);};row.onkeydown=e=>{if(e.key==='Enter'&&e.target===row)openEditor(row.dataset.id);};});
  $('#collection').querySelectorAll('[data-restore]').forEach(b=>b.onclick=()=>{const p=project(b.dataset.restore);if(p.deletedAt){restoreProject(p.id);return;}p.archived=false;p.onCanvas=true;changed();switchView('canvas');openEditor(p.id);toast('Project brought to the canvas.');});
 }
}
function cardHTML(p){
 const actions=`<div class="card-actions"><button class="icon-button" data-action="minimize" aria-label="${p.minimized?'Restore':'Minimize'} ${escape(p.title)}" title="${p.minimized?'Restore card':'Minimize card'}">${icon(p.minimized?'expand':'minus')}</button><button class="icon-button" data-action="menu" aria-label="Actions for ${escape(p.title)}" title="Project actions">${icon('more')}</button></div>`;
 return `<article class="project-card ${p.minimized?'minimized':''} ${p.id===selected?'selected':''}" data-id="${escape(p.id)}" style="left:${p.x}px;top:${p.y}px;width:${p.width}px;height:${p.height}px;background:${p.color};z-index:${p.z}" tabindex="0" aria-label="${escape(p.title)}. Enter to open. Arrow keys to move. Shift and arrow keys to resize."><div class="card-head">${icon(p.icon).replace('<svg ','<svg class="project-icon" ')}${p.minimized?`<span class="mini-title">${escape(p.title||'Untitled project')}</span>`:''}${actions}</div>${p.minimized?'':`<div class="card-content"><h2>${escape(p.title||'Untitled project')}</h2><p>${escape(p.subtitle)}</p></div><div class="card-bottom"><span class="tag">${escape(p.folder||'Unfiled')}</span><span class="card-date">${date(p.updated)}</span><button class="card-expand" data-action="expand" aria-label="Open ${escape(p.title)}" title="Open note">${icon('expand')}</button></div><div class="resize-handle" role="button" tabindex="0" aria-label="Resize ${escape(p.title)}. Use Shift and arrow keys on the card." title="Drag to resize"></div>`}</article>`;
}
function bindCard(el){
 const id=el.dataset.id;
 el.querySelector('[data-action="menu"]').onclick=e=>{e.stopPropagation();cardMenu(id,e.currentTarget);};
 el.querySelector('[data-action="minimize"]').onclick=e=>{e.stopPropagation();const p=project(id);p.minimized=!p.minimized;changed();};
 if(el.querySelector('[data-action="expand"]'))el.querySelector('[data-action="expand"]').onclick=()=>openEditor(id);
 if($('.card-content',el))$('.card-content',el).onclick=()=>openEditor(id);
 if($('.mini-title',el))$('.mini-title',el).onclick=()=>openEditor(id);
 el.ondblclick=e=>{if(!e.target.closest('button'))openEditor(id);};
 el.onkeydown=e=>{
  if(e.target!==el)return;if(e.key==='Enter'){openEditor(id);return;}
  const dirs={ArrowLeft:[-GRID,0],ArrowRight:[GRID,0],ArrowUp:[0,-GRID],ArrowDown:[0,GRID]};
  if(dirs[e.key]&&!grid){e.preventDefault();const p=project(id),[x,y]=dirs[e.key];if(e.shiftKey){p.width=Math.max(220,p.width+x);p.height=Math.max(160,p.height+y);}else{p.x=Math.max(0,p.x+x);p.y=Math.max(0,p.y+y);}changed();$(`[data-id="${CSS.escape(id)}"]`).focus();}
 };
 $('.card-head',el).onpointerdown=e=>{if(e.target.closest('button')||grid)return;startGeometry(e,el,'drag');};
 const handle=$('.resize-handle',el);if(handle)handle.onpointerdown=e=>startGeometry(e,el,'resize');
}
function startGeometry(e,el,kind){
 if(e.button!==0)return;e.preventDefault();closeMenu();const p=project(el.dataset.id);const target=e.currentTarget;
 geometry={id:p.id,kind,startX:e.clientX,startY:e.clientY,x:p.x,y:p.y,w:p.width,h:p.height,target,moved:false,over:false,ax:p.x,ay:p.y};
 p.z=nextZ();el.style.zIndex=p.z;target.setPointerCapture(e.pointerId);document.body.classList.add(kind==='drag'?'dragging':'resizing');
 target.onpointermove=ev=>{
  if(!geometry)return;const dx=(ev.clientX-geometry.startX)/zoom,dy=(ev.clientY-geometry.startY)/zoom;
  if(kind==='drag'){
   geometry.moved=true;geometry.ax=Math.max(0,snap(geometry.x+dx));geometry.ay=Math.max(0,snap(geometry.y+dy));el.style.left=geometry.ax+'px';el.style.top=geometry.ay+'px';
   const zone=$('.hot-zone');if(zone){const r=zone.getBoundingClientRect();geometry.over=ev.clientX>=r.left&&ev.clientX<=r.right&&ev.clientY>=r.top&&ev.clientY<=r.bottom;zone.classList.toggle('active',geometry.over);}
  }
  else{p.width=Math.max(220,Math.min(1000,snap(geometry.w+dx)));p.height=Math.max(160,Math.min(1500,snap(geometry.h+dy)));el.style.width=p.width+'px';el.style.height=p.height+'px';}
 };
 const end=()=>{
  target.onpointermove=null;target.onpointerup=null;target.onpointercancel=null;
  if(kind==='drag'&&geometry?.moved){
   const g=geometry;const wasHot=!!p.hot;p.x=g.ax;p.y=g.ay;p.hot=g.over;
   if(wasHot!==p.hot){const z=state.hotZone;if(p.hot){const r=zoneRect();z.x=r.x;z.y=r.y;}z.w=0;z.h=0;}
  }
  geometry=null;document.body.classList.remove('dragging','resizing');changed();};
 target.onpointerup=end;target.onpointercancel=end;
}
function toggleHot(p){
 const z=state.hotZone,r=zoneRect();
 if(!p.hot){const n=hotCards().length%5;p.hot=true;if(!grid){p.x=snap(r.x+HOT_PAD+n*GRID);p.y=snap(r.y+HOT_PAD+n*GRID);const nr=zoneRect();z.x=nr.x;z.y=nr.y;}}
 else{p.hot=false;if(!grid){p.x=snap(r.x+HOT_PAD);p.y=snap(r.y+r.h)+GRID;}}
 z.w=0;z.h=0;changed();toast(p.hot?'Added to the hot zone.':'Removed from the hot zone.');
}
function bindHotZone(zone){
 const z=state.hotZone;
 /* Move the zone and every card in it together. */
 $('.hot-grip',zone).onpointerdown=e=>{
  if(e.button!==0)return;e.preventDefault();e.stopPropagation();closeMenu();
  const grip=e.currentTarget,start=zoneRect(),sx=e.clientX,sy=e.clientY,hot=hotCards().map(p=>({p,x:p.x,y:p.y,el:$(`[data-id="${CSS.escape(p.id)}"]`)}));
  let dx=0,dy=0;grip.setPointerCapture(e.pointerId);document.body.classList.add('dragging');
  grip.onpointermove=ev=>{
   dx=Math.max(-start.x,snap((ev.clientX-sx)/zoom));dy=Math.max(-start.y,snap((ev.clientY-sy)/zoom));
   zone.style.left=start.x+dx+'px';zone.style.top=start.y+dy+'px';
   for(const h of hot)if(h.el){h.el.style.left=h.x+dx+'px';h.el.style.top=h.y+dy+'px';}
  };
  const end=()=>{grip.onpointermove=null;grip.onpointerup=null;grip.onpointercancel=null;document.body.classList.remove('dragging');
   z.x+=dx;z.y+=dy;for(const h of hot){h.p.x=h.x+dx;h.p.y=h.y+dy;}changed();};
  grip.onpointerup=end;grip.onpointercancel=end;
 };
 const resizer=(handle,axis)=>{
  const key=axis==='h'?'h':'w',min=axis==='h'?HOT_MIN_H:HOT_MIN_W;
  const set=value=>{z[key]=Math.max(min,snap(value));};
  const current=()=>zoneRect()[key];
  handle.onpointerdown=e=>{
   if(e.button!==0)return;e.preventDefault();e.stopPropagation();closeMenu();const start=axis==='h'?e.clientY:e.clientX,base=current();
   handle.setPointerCapture(e.pointerId);document.body.classList.add('resizing');
   handle.onpointermove=ev=>{set(base+((axis==='h'?ev.clientY:ev.clientX)-start)/zoom);placeZone(zone);};
   const end=()=>{handle.onpointermove=null;handle.onpointerup=null;handle.onpointercancel=null;document.body.classList.remove('resizing');changed();};
   handle.onpointerup=end;handle.onpointercancel=end;
  };
  handle.ondblclick=()=>{z[key]=0;changed();};
  handle.onkeydown=e=>{
   const grow=axis==='h'?'ArrowDown':'ArrowRight',shrink=axis==='h'?'ArrowUp':'ArrowLeft',step=e.shiftKey?100:GRID;
   if(e.key===grow||e.key===shrink){e.preventDefault();set(current()+(e.key===grow?step:-step));changed();}
   else if(e.key==='Home'){e.preventDefault();z[key]=0;changed();}
   else return;
   $(axis==='h'?'.hot-handle':'.hot-handle-x')?.focus();
  };
 };
 resizer($('.hot-handle',zone),'h');resizer($('.hot-handle-x',zone),'w');
}
function nextZ(){return Math.max(0,...state.projects.map(p=>p.z))+1;}
function changed(){markDirty();render();}
function createProject(){
 const existing=activeProjects().filter(p=>p.onCanvas),offset=existing.length%5;
 const p={id:crypto.randomUUID(),title:'Untitled project',subtitle:'',html:'',folder:view.startsWith('folder:')?view.slice(7):'Work',color:colors[existing.length%colors.length].value,icon:'book',onCanvas:true,archived:false,minimized:false,x:40+offset*40,y:(state.hotZone?snap(zoneRect().y+zoneRect().h):0)+GRID*2+offset*GRID,width:280,height:220,z:nextZ(),created:Date.now(),updated:Date.now()};
 if(!state.folders.includes(p.folder))p.folder='';state.projects.push(p);view='canvas';query='';$('#search').value='';changed();openEditor(p.id);$('#canvas-viewport').scrollTo(0,0);
 const title=$('#editor-title');title.focus();const range=document.createRange();range.selectNodeContents(title);const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);
}
function cardMenu(id,anchor){
 const p=project(id);if(p.deletedAt){menu(anchor,[['restore','Restore project',()=>restoreProject(id)],null,['trash','Delete permanently…',()=>permanentlyDelete([id]),'danger']]);return;}const entries=[['edit','Open & edit',()=>openEditor(id)],['bulb',p.hot?'Remove from hot zone':'Add to hot zone',()=>toggleHot(p)],['copy','Duplicate',()=>{const clone={...structuredClone(p),id:crypto.randomUUID(),title:p.title+' copy',x:p.x+28,y:p.y+28,z:nextZ(),created:Date.now(),updated:Date.now(),archived:false,onCanvas:true};state.projects.push(clone);changed();toast('Project duplicated.');}],null,
 ...(p.archived?[['restore','Restore project',()=>{p.archived=false;p.onCanvas=true;changed();closeEditor();toast('Project restored.');}]]:[['remove',p.onCanvas?'Remove from canvas':'Show on canvas',()=>{p.onCanvas=!p.onCanvas;changed();toast(p.onCanvas?'Project is on the canvas.':'Project kept in All projects.');}],['archive','Archive project',()=>{p.archived=true;changed();if(selected===id)closeEditor();toast('Project archived.');}]]),null,
 [grid?'up':'layers',grid?'Move earlier':'Bring to front',()=>{if(grid)moveOrder(p,-1);else{p.z=nextZ();changed();}}],
 [grid?'down':'layers',grid?'Move later':'Send to back',()=>{if(grid)moveOrder(p,1);else{const ordered=[p,...state.projects.filter(x=>x.id!==p.id).sort((a,b)=>a.z-b.z)];ordered.forEach((x,i)=>x.z=i+1);changed();}}],null,
 ['trash','Delete project',()=>deleteProject(id),'danger']];
 menu(anchor,entries);
}
function moveOrder(p,dir){const list=[...filtered()].sort((a,b)=>a.z-b.z);const i=list.indexOf(p),other=list[i+dir];if(other){[p.z,other.z]=[other.z,p.z];changed();}}
function deleteProject(id){
 const p=project(id);if(!p||p.deletedAt)return;
 p.deletedAt=Date.now();p.updated=p.deletedAt;if(selected===id)closeEditor();lastUndo=id;changed();
 toast('Project moved to Trash.',()=>restoreProject(id),'Undo');
}
function restoreProject(id){
 const p=project(id);if(!p||!p.deletedAt)return;
 p.deletedAt=null;p.updated=Date.now();if(lastUndo===id)lastUndo=null;
 if(selected===id)closeEditor();changed();toast(p.archived?'Project restored to Archive.':'Project restored.');
}
function permanentlyDelete(ids,emptyAll=false){
 const targets=state.projects.filter(p=>p.deletedAt&&ids.includes(p.id));if(!targets.length)return;
 const message=targets.length===1?`Permanently delete “${targets[0].title}”? This cannot be undone.`:`Permanently delete all ${targets.length} projects in Trash? This cannot be undone.`;
 showDialog({title:emptyAll?'Empty trash?':'Delete project permanently?',message,confirmLabel:'Delete permanently',danger:true,onConfirm:()=>{
  const removed=new Set(targets.map(p=>p.id));
  state.projects=state.projects.filter(p=>!p.deletedAt||!removed.has(p.id));
  if(removed.has(selected))closeEditor();if(removed.has(lastUndo))lastUndo=null;
  changed();toast(emptyAll?'Trash emptied.':'Project permanently deleted.');
 }});
}
function showDialog({title,message,inputLabel,value='',confirmLabel,onConfirm,danger=false,maxLength=80,extraLabel,extraValue='',validateInput}){
 closeMenu();const dialog=$('#action-dialog');if(dialog.open)dialog.close();
 dialog.innerHTML=`<form><h2 id="dialog-title">${escape(title)}</h2>${message?`<p>${escape(message)}</p>`:''}${inputLabel?`<label for="dialog-input">${escape(inputLabel)}</label><input id="dialog-input" name="value" value="${escape(value)}" maxlength="${maxLength}" required autocomplete="off">`:''}${extraLabel?`<label for="dialog-extra">${escape(extraLabel)}</label><input id="dialog-extra" value="${escape(extraValue)}" maxlength="500" autocomplete="off">`:''}<div class="dialog-actions"><button type="button" class="quiet" id="dialog-cancel">Cancel</button><button type="submit" class="primary ${danger?'destructive':''}">${escape(confirmLabel)}</button></div></form>`;
 $('#dialog-cancel').onclick=()=>dialog.close();
 $('form',dialog).onsubmit=e=>{e.preventDefault();const input=$('#dialog-input');if(input&&!input.value.trim()){input.setCustomValidity('Enter a value.');input.reportValidity();return;}const result=input?input.value:'';const error=validateInput?.(result);if(error){input.setCustomValidity(error);input.reportValidity();return;}const extra=$('#dialog-extra')?.value||'';dialog.close();onConfirm(result,extra);};
 const input=$('#dialog-input');if(input)input.oninput=()=>input.setCustomValidity('');
 dialog.showModal();if(input){input.focus();input.select();}else $('#dialog-cancel').focus();
}
function menu(anchor,entries){
 const pop=$('#popover');pop.innerHTML=entries.map((entry,i)=>entry?`<button class="menu-item ${entry[3]||''}" data-menu="${i}">${icon(entry[0])}${escape(entry[1])}</button>`:'<hr class="menu-separator">').join('');
 pop.querySelectorAll('[data-menu]').forEach(b=>b.onclick=()=>{const fn=entries[Number(b.dataset.menu)][2];closeMenu();fn();});positionMenu(anchor);
}
function positionMenu(anchor){const pop=$('#popover');pop.hidden=false;const rect=anchor.getBoundingClientRect();pop.style.left=Math.max(8,Math.min(rect.left,window.innerWidth-pop.offsetWidth-12))+'px';pop.style.top=Math.max(8,Math.min(rect.bottom+7,window.innerHeight-pop.offsetHeight-12))+'px';}
function closeMenu(){$('#popover').hidden=true;}
function openEditor(id){
 document.body.classList.add('editing');selected=id;const p=project(id);if(!p)return;closeMenu();renderCanvas();
 $('#editor-divider').hidden=false;applyEditorWidth();
 const editor=$('#editor');editor.hidden=false;editor.innerHTML=`<div class="editor-header" style="--note-color:${p.color}"><div class="editor-top"><span>${icon(p.icon)} &nbsp; PROJECT NOTE</span><div class="editor-tools"><button class="icon-button" id="editor-menu" aria-label="Project actions">${icon('more')}</button><button class="icon-button" id="close-editor" aria-label="Close project">${icon('close')}</button></div></div><div class="editor-title" id="editor-title" contenteditable="true" role="textbox" aria-label="Project title" data-placeholder="Untitled project">${escape(p.title)}</div><div class="editor-subtitle" id="editor-subtitle" contenteditable="true" role="textbox" aria-label="Project subheading" data-placeholder="Add a short description…">${escape(p.subtitle)}</div></div><div class="editor-meta"><select id="project-folder" aria-label="Project folder"><option value="">Unfiled</option>${state.folders.map(f=>`<option ${p.folder===f?'selected':''} value="${escape(f)}">${escape(f)}</option>`).join('')}</select><div class="swatches" aria-label="Project color">${colors.map(c=>`<button class="swatch ${c.value===p.color?'chosen':''}" style="background:${c.value}" data-color="${c.value}" title="${c.name}" aria-label="${c.name} card color" aria-pressed="${c.value===p.color}"></button>`).join('')}</div></div><div class="editor-toolbar" role="toolbar" aria-label="Note formatting"><button class="icon-button" data-command="bold" title="Bold" aria-label="Bold">${icon('bold')}</button><button class="icon-button" data-command="italic" title="Italic" aria-label="Italic">${icon('italic')}</button><span></span><button class="icon-button" data-command="heading" title="Heading" aria-label="Heading">${icon('heading')}</button><button class="icon-button" data-command="paragraph" title="Paragraph" aria-label="Paragraph">${icon('text')}</button><button class="icon-button" data-command="insertUnorderedList" title="Bullet list" aria-label="Bullet list">${icon('list')}</button><button class="icon-button" data-command="checklist" title="Checklist" aria-label="Checklist">${icon('checklist')}</button><span></span><button class="icon-button" id="add-image" title="Add images" aria-label="Add images">${icon('image')}</button><button class="icon-button" id="add-link" title="Insert or edit link" aria-label="Insert or edit link">${icon('link')}</button><button class="icon-button" id="remove-link" title="Remove link" aria-label="Remove link">${icon('unlink')}</button><button class="icon-button" id="add-video" title="Embed YouTube video" aria-label="Embed YouTube video">${icon('video')}</button></div><div class="note-body" id="note-body" contenteditable="true" role="textbox" aria-label="Project notes" aria-multiline="true" data-placeholder="Start with a thought. Add notes, bullets, and images…">${p.html}</div><div class="editor-footnote">Changes save automatically on this browser.</div>`;
 $('#close-editor').onclick=closeEditor;$('#editor-menu').onclick=e=>cardMenu(id,e.currentTarget);
 const update=()=>{normalizeChecklists($('#note-body'));hydrateNoteMedia($('#note-body'),!!p.deletedAt);p.title=$('#editor-title').textContent.slice(0,500);p.subtitle=$('#editor-subtitle').textContent.slice(0,4000);p.html=sanitize($('#note-body').innerHTML);p.updated=Date.now();markDirty();renderCanvas();};
 $('#editor-title').oninput=update;$('#editor-subtitle').oninput=update;$('#note-body').oninput=update;
 $('#note-body').onkeydown=e=>{
  const body=$('#note-body');if(e.target.tagName==='IMG'){
   if(['Enter','ContextMenu'].includes(e.key)||(e.shiftKey&&e.key==='F10')){e.preventDefault();noteImageMenu(e.target,body,update,!!p.deletedAt);return;}
   if(!p.deletedAt&&['Backspace','Delete'].includes(e.key)){e.preventDefault();deleteNoteImage(e.target,body,update);return;}
  }
  if(!p.deletedAt)checklistKeydown(e,body,update);
 };
 $('#note-body').oncontextmenu=e=>{if(e.target.tagName==='IMG'&&!e.shiftKey){e.preventDefault();noteImageMenu(e.target,$('#note-body'),update,!!p.deletedAt,e);}};
 $('#note-body').onpointerdown=e=>{if(!p.deletedAt)startNoteImageDrag(e,$('#note-body'),update);};
 $('#note-body').onchange=e=>{if(e.target.matches('input[type="checkbox"]')){if(p.deletedAt){e.target.checked=e.target.hasAttribute('checked');return;}e.target.toggleAttribute('checked',e.target.checked);update();}};
 for(const el of [$('#editor-title'),$('#editor-subtitle')]){el.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();(el.id==='editor-title'?$('#editor-subtitle'):$('#note-body')).focus();}};el.onpaste=e=>{e.preventDefault();document.execCommand('insertText',false,e.clipboardData.getData('text/plain'));};}
 $('#project-folder').onchange=e=>{p.folder=e.target.value;p.updated=Date.now();changed();};
 editor.querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>{p.color=b.dataset.color;$('.editor-header').style.setProperty('--note-color',p.color);editor.querySelectorAll('[data-color]').forEach(x=>{x.classList.toggle('chosen',x===b);x.setAttribute('aria-pressed',String(x===b));});changed();});
 editor.querySelectorAll('[data-command]').forEach(b=>{b.onmousedown=e=>e.preventDefault();b.onclick=()=>{const body=$('#note-body');body.focus();const cmd=b.dataset.command;const anchor=window.getSelection().anchorNode;const element=anchor?.nodeType===1?anchor:anchor?.parentElement;const task=element?.closest('ul[data-checklist="true"] > li');if(cmd==='checklist'||(cmd==='insertUnorderedList'&&task&&body.contains(task))){toggleChecklist(body);update();return;}if(['heading','paragraph'].includes(cmd)&&task&&body.contains(task))leaveChecklistItem(task);document.execCommand(cmd==='heading'||cmd==='paragraph'?'formatBlock':cmd,false,cmd==='heading'?'h2':cmd==='paragraph'?'p':null);update();};});
 $('#add-link').onmousedown=e=>e.preventDefault();$('#add-link').onclick=()=>editNoteLink($('#note-body'),update);
 $('#remove-link').onmousedown=e=>e.preventDefault();$('#remove-link').onclick=()=>{$('#note-body').focus();document.execCommand('unlink');update();};
 $('#add-video').onmousedown=e=>e.preventDefault();$('#add-video').onclick=()=>insertYouTube($('#note-body'),update);
 $('#add-image').onmousedown=e=>e.preventDefault();$('#add-image').onclick=()=>{rememberRange();$('#image-file').click();};
 $('#note-body').onpaste=async e=>{e.preventDefault();if(p.deletedAt)return;const files=[...e.clipboardData.files].filter(f=>f.type.startsWith('image/'));if(files.length){rememberRange();await insertImages(files);return;}const html=e.clipboardData.getData('text/html');if(html)document.execCommand('insertHTML',false,sanitize(html));else document.execCommand('insertText',false,e.clipboardData.getData('text/plain'));update();};
 $('#note-body').ondrop=async e=>{e.preventDefault();if(p.deletedAt)return;const files=[...e.dataTransfer.files].filter(f=>f.type.startsWith('image/'));if(files.length){$('#note-body').focus();editorRange=null;await insertImages(files);}else toast('Use paste to insert text into your note.');};
 $('#note-body').ondragover=e=>e.preventDefault();
 $('#note-body').addEventListener('click',e=>{if(e.target.tagName==='IMG'){e.preventDefault();if(e.target.dataset.suppressClick)return;e.target.focus({preventScroll:true});noteImageMenu(e.target,$('#note-body'),update,!!p.deletedAt,e);return;}const remove=e.target.closest('[data-remove-video]');if(remove&&!p.deletedAt){e.preventDefault();remove.closest('[data-youtube]').remove();update();return;}const link=e.target.closest('a[href]');if(link){e.preventDefault();window.open(link.href,'_blank','noopener,noreferrer');}});
 hydrateNoteMedia($('#note-body'),!!p.deletedAt);
 editorRange=null;
 if(p.deletedAt){
  editor.querySelectorAll('[contenteditable]').forEach(el=>el.setAttribute('contenteditable','false'));
  $('.editor-toolbar',editor).hidden=true;$('#project-folder').disabled=true;
  editor.querySelectorAll('[data-color],.note-body input[type="checkbox"]').forEach(b=>b.disabled=true);
  $('.editor-footnote',editor).textContent='This project is in Trash. Restore it from the project menu to edit.';
 }
 if(!grid && window.innerWidth>960){const list=filtered();const width=Math.max(1,...list.map(p=>p.x+p.width))+40;const available=$('#canvas-viewport').clientWidth;if(width*zoom>available){if(autoZoom===null)autoZoom={from:zoom,to:zoom};setZoom(Math.min(zoom,available/width));autoZoom.to=zoom;}}
}
function closeEditor(){document.body.classList.remove('editing');selected=null;if(autoZoom){const back=autoZoom;autoZoom=null;if(zoom===back.to&&back.from>zoom){zoom=back.from;$('#zoom-value').textContent=Math.round(zoom*100)+'%';}}$('#editor-divider').hidden=true;$('#editor').hidden=true;$('#editor').innerHTML='';editorRange=null;renderCanvas();}
function rememberRange(){const sel=window.getSelection();editorRange=sel.rangeCount&&$('#note-body').contains(sel.anchorNode)?sel.getRangeAt(0).cloneRange():null;}
async function imageData(file){
 if(file.size>25*1024*1024)throw new Error('Choose an image smaller than 25 MB.');
 if(!['image/png','image/jpeg','image/webp','image/gif'].includes(file.type))throw new Error('Choose a PNG, JPEG, WebP, or GIF image.');
 const url=URL.createObjectURL(file);
 try{const img=await new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(new Error('This image could not be read.'));i.src=url;});const scale=Math.min(1,1400/Math.max(img.naturalWidth,img.naturalHeight));const c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.naturalWidth*scale));c.height=Math.max(1,Math.round(img.naturalHeight*scale));c.getContext('2d').drawImage(img,0,0,c.width,c.height);return c.toDataURL(file.type==='image/png'?'image/png':'image/jpeg',.86);}finally{URL.revokeObjectURL(url);}
}
async function insertImages(files){
 const id=selected;const body=$('#note-body');if(!body)return;
 try{const data=await Promise.all(files.map(async f=>({src:await imageData(f),name:f.name})));if(selected!==id||!body.isConnected)return;body.focus();if(editorRange&&body.contains(editorRange.commonAncestorContainer)){const sel=window.getSelection();sel.removeAllRanges();sel.addRange(editorRange);}else{const r=document.createRange();r.selectNodeContents(body);r.collapse(false);const s=window.getSelection();s.removeAllRanges();s.addRange(r);}document.execCommand('insertHTML',false,data.map(d=>`<p><img src="${d.src}" alt="${escape(d.name||'Project reference')}"></p><p><br></p>`).join(''));body.dispatchEvent(new Event('input'));rememberRange();toast('Image added to your note.');}catch(error){toast(error.message);}
}
function toast(message,action,label='Undo'){
 clearTimeout(toastTimer);const el=$('#toast');el.innerHTML=`<span>${escape(message)}</span>${action?`<button>${escape(label)}</button>`:''}`;el.hidden=false;if(action)$('button',el).onclick=action;toastTimer=setTimeout(()=>el.hidden=true,action?12000:4500);
}
function tidy(){
 if(view!=='canvas')return;const available=$('#canvas-viewport').clientWidth/zoom-76;
 const step=320,columns2=Math.max(1,Math.floor((available+20)/step)),z=state.hotZone;z.w=0;z.h=0;
 const layout=(list,left,top)=>{let rowY=top;for(let i=0;i<list.length;i+=columns2){const row=list.slice(i,i+columns2);row.forEach((p,j)=>{p.x=left+j*step;p.y=rowY;p.width=300;if(!p.minimized)p.height=240;});rowY+=Math.ceil((Math.max(...row.map(cardH))+GRID)/GRID)*GRID;}return rowY;};
 const sorted=[...filtered()].sort((a,b)=>a.z-b.z);
 layout(sorted.filter(p=>p.hot),z.x+HOT_PAD,z.y+HOT_PAD);const r=zoneRect();
 layout(sorted.filter(p=>!p.hot),40,snap(r.y+r.h)+GRID);
 changed();toast('A little more breathing room.');
}
function setZoom(value){zoom=Math.max(.35,Math.min(1.5,value));$('#zoom-value').textContent=Math.round(zoom*100)+'%';renderCanvas();}
function fit(){const list=filtered();if(!list.length)return;const zr=zoneRect(),w=Math.max(zr.x+zr.w,...list.map(p=>p.x+p.width))+40,h=Math.max(zr.y+zr.h,...list.map(p=>p.y+cardH(p)))+45;const vp=$('#canvas-viewport');setZoom(Math.min(1,vp.clientWidth/w,vp.clientHeight/h));vp.scrollTo(0,0);}
function exportBackup(){
 const payload={...state,exportedAt:new Date().toISOString()};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=`project-canvas-${new Date().toLocaleDateString('en-CA')}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Backup downloaded, including your images.');
}
async function importBackup(file){
 if(!file)return;try{
  if(file.size>100*1024*1024)throw new Error('Choose a backup smaller than 100 MB.');
  const imported=validate(JSON.parse(await file.text()));
  const count=imported.projects.filter(p=>!p.deletedAt).length;
  showDialog({title:'Replace everything with this backup?',message:`This clears your canvas, folders, and Trash, then loads ${count} project${count===1?'':'s'} from the backup. Export a backup first if you want to keep what you have now.`,confirmLabel:'Replace everything',danger:true,onConfirm:()=>{
   state=imported;migrateHotZone();if(selected)closeEditor();view='canvas';query='';$('#search').value='';changed();refreshFolderPicker();toast(`Backup loaded. ${count} project${count===1?'':'s'} on your canvas.`);
  }});
 }catch(error){toast(error instanceof SyntaxError?'This file isn’t a valid JSON backup.':error.message);}
}
$('#brand-icon').innerHTML=icon('layers');$('#search-icon').innerHTML=icon('search');$('#new-project').innerHTML=icon('plus')+'New project';$('#tidy').innerHTML=icon('tidy')+'Tidy canvas';$('#canvas-settings').innerHTML=icon('palette');$('#add-folder').innerHTML=icon('plus');$('#backup-button').innerHTML=icon('download')+'Backups & help';$('#zoom-out').innerHTML=icon('minus');$('#zoom-in').innerHTML=icon('plus');$('#sidebar-toggle').innerHTML=icon('menu');
$('#empty-trash').onclick=()=>permanentlyDelete(state.projects.filter(p=>p.deletedAt).map(p=>p.id),true);
$('#new-project').onclick=createProject;$('#tidy').onclick=tidy;$('#fit').onclick=fit;
$('#zoom-out').onclick=()=>setZoom(zoom-.1);$('#zoom-in').onclick=()=>setZoom(zoom+.1);
$('#layout-toggle').onclick=()=>{grid=!grid;renderCanvas();};
$('#sidebar-toggle').onclick=()=>$('#sidebar').classList.toggle('open');
$('.brand').onclick=e=>{e.preventDefault();switchView('canvas');};
$('#search').oninput=e=>{query=e.target.value.trim();if(query&&view==='canvas')view='all';if(!query)view='canvas';render();};
$('#add-folder').onclick=()=>showDialog({title:'New folder',inputLabel:'Folder name',confirmLabel:'Create folder',onConfirm:input=>{
 const name=input.trim().slice(0,80);if(!name)return;if(state.folders.includes(name)){toast('That folder already exists.');return;}state.folders.push(name);changed();refreshFolderPicker();switchView('folder:'+name);
}});
$('#canvas-settings').onclick=e=>{const pop=$('#popover');pop.innerHTML='<h3>CANVAS COLOR</h3><div class="swatches">'+backgrounds.map(c=>`<button class="swatch ${state.background===c.value?'chosen':''}" style="background:${c.value}" data-background="${c.value}" aria-label="${c.name} canvas" title="${c.name}"></button>`).join('')+'</div>';pop.querySelectorAll('[data-background]').forEach(b=>b.onclick=()=>{state.background=b.dataset.background;closeMenu();changed();});positionMenu(e.currentTarget);};
$('#backup-button').onclick=e=>menu(e.currentTarget,[['download','Export backup',exportBackup],['upload','Import backup',()=>$('#import-file').click()],null,['book','How this works',()=>window.open('help.html','_blank','noopener')]]);
$('#import-file').onchange=async e=>{await importBackup(e.target.files[0]);e.target.value='';};
$('#image-file').onchange=async e=>{await insertImages([...e.target.files]);e.target.value='';};
document.addEventListener('pointerdown',e=>{if(!e.target.closest('#popover')&&!e.target.closest('[data-action="menu"]')&&!e.target.closest('#canvas-settings')&&!e.target.closest('#backup-button')&&!e.target.closest('#editor-menu'))closeMenu();});
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&($('#action-dialog').open||$('#bear-dialog')?.open))return;
 if(e.key==='Escape'&&!$('#popover').hidden){e.preventDefault();closeMenu();return;}
 if(e.key==='Escape'){closeMenu();if(selected)closeEditor();$('#sidebar').classList.remove('open');}
 if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('#search').focus();}
 if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='s'){e.preventDefault();persist();toast('Your changes save automatically.');}
 if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='z'&&!e.target.closest('input,[contenteditable]')&&lastUndo){e.preventDefault();restoreProject(lastUndo);}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)persist();});
window.addEventListener('resize',()=>{closeMenu();if(state)applyEditorWidth();});
boot();
