/* Pure Bear/TextBundle package reader. No filesystem, server, or network access. */
(function(root){
 'use strict';
 const maxPackage=100_000_000,maxExpanded=100_000_000,maxEntries=2000;
 function normalizePath(path){
  if(typeof path!=='string'||path.includes('\0')||/^[\\/]|^[a-z]:/i.test(path))throw new Error('The package contains an invalid path.');
  const parts=path.replace(/\\/g,'/').split('/');
  if(parts.includes('..'))throw new Error('The package contains an unsafe parent-directory path.');
  return parts.filter(part=>part&&part!=='.').join('/');
 }
 function parse(bytes,filename){
  if(bytes.length>maxPackage)throw new Error('This Bear package is too large (100 MB limit).');
  let expanded=0,count=0;const paths=new Set();
  const content=root.fflate.unzipSync(bytes,{filter(entry){
   count++;if(count>maxEntries)throw new Error('This package contains too many files.');
   const path=normalizePath(entry.name);if(paths.has(path))throw new Error('The package contains duplicate paths.');paths.add(path);
   expanded+=entry.originalSize;
   if(!Number.isSafeInteger(expanded)||expanded>maxExpanded)throw new Error('This package expands beyond the 100 MB limit.');
   if(entry.originalSize>30_000_000)throw new Error('An attachment exceeds the 30 MB limit.');
   return /(?:^|\/)text\.md$/i.test(entry.name)||/\.(png|jpe?g|gif|webp|heic|svg)$/i.test(entry.name);
  }});
  const files=new Map();
  for(const [path,data] of Object.entries(content)){
   const normalized=normalizePath(path);
   if(files.has(normalized))throw new Error('The package contains duplicate paths.');
   files.set(normalized,data);
  }
  const notes=[];
  for(const [path,data] of files){
   if(!/(?:^|\/)text\.md$/i.test(path))continue;
   if(data.length>10_000_000)throw new Error('The note text exceeds the 10 MB limit.');
   const directory=path.slice(0,path.lastIndexOf('/')+1);
   const title=(directory.replace(/\/$/,'').split('/').pop()||filename).replace(/\.(textbundle|bear|zip)$/i,'')||'Imported Bear note';
   const assets=new Map([...files].filter(([key])=>key.startsWith(directory)&&key!==path));
   notes.push({title,markdownPath:path,markdown:new TextDecoder('utf-8',{fatal:true}).decode(data),assets,paths});
  }
  if(!notes.length)throw new Error('This file does not contain a Bear TextBundle note (text.md). Drag the whole note from Bear’s note list.');
  return notes;
 }
 function assetPath(markdownPath,reference){
  if(/^[a-z][a-z0-9+.-]*:|^\/\//i.test(reference))return null;
  let decoded;try{decoded=decodeURIComponent(reference.split(/[?#]/)[0]);}catch{return null;}
  const parts=markdownPath.split('/');parts.pop();
  for(const segment of decoded.replace(/\\/g,'/').split('/')){
   if(!segment||segment==='.')continue;
   if(segment==='..'){if(!parts.length)return null;parts.pop();}else parts.push(segment);
  }
  return parts.join('/');
 }
 function imageType(bytes){
  if(bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71)return 'image/png';
  if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return 'image/jpeg';
  const head=new TextDecoder().decode(bytes.subarray(0,12));
  if(/^GIF8[79]a/.test(head))return 'image/gif';
  if(head.startsWith('RIFF')&&head.slice(8)==='WEBP')return 'image/webp';
  return null;
 }
 root.BearPackage={parse,assetPath,imageType,normalizePath};
})(typeof window==='undefined'?globalThis:window);
