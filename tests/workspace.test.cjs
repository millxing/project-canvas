const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const source=fs.readFileSync(require('node:path').join(__dirname,'../app.js'),'utf8');
function fn(name){const start=source.indexOf(`function ${name}(`);assert.ok(start>=0);const end=source.indexOf('\nfunction ',start+1);return source.slice(start,end<0?undefined:end);}
function setup(){
 const context=vm.createContext({state:{folders:['Work','Personal','Ideas'],projects:[{id:'a',title:'Active',folder:'Work',html:'<p>Note</p>',onCanvas:true,archived:false,x:120,y:80,width:300,height:230,updated:1},{id:'b',title:'Archived',folder:'Work',archived:true,updated:1}]},selected:null,lastUndo:null,view:'canvas',query:'',Date,Set,Number,window:{confirm:()=>false,prompt:()=>null},changed(){},toast(){},closeEditor(){context.selected=null;},refreshFolderPicker(){},$:()=>({value:''}),plain:x=>x,colors:[{value:"#f9dcd9"}],backgrounds:[{value:'#eef2f5'}],icons:{book:true},sanitize:x=>x});
 context.showDialog=options=>{if(options.inputLabel){const input=context.window.prompt();if(input!==null)options.onConfirm(input);}else if(context.window.confirm())options.onConfirm();};
 for(const name of ['project','activeProjects','filtered','renameFolder','reorderFolder','deleteProject','restoreProject','permanentlyDelete','validate'])vm.runInContext(fn(name),context);
 return context;
}
test('Trash retains note and geometry, excludes active lists, and restores original placement',()=>{
 const c=setup();c.deleteProject('a');assert.equal(c.state.projects.length,2);assert.ok(c.project('a').deletedAt);assert.equal(c.activeProjects().length,0);assert.equal(c.filtered().length,0);c.view='trash';assert.equal(c.filtered()[0].id,'a');
 const reloaded=JSON.parse(JSON.stringify(c.state));assert.ok(c.validate({...reloaded,version:1}).projects[0].deletedAt);
 c.restoreProject('a');assert.equal(c.project('a').deletedAt,null);assert.equal(c.project('a').html,'<p>Note</p>');assert.equal(c.project('a').x,120);assert.equal(c.project('a').folder,'Work');assert.equal(c.project('a').onCanvas,true);
});
test('Restoring an archived project returns it to Archive',()=>{const c=setup();c.deleteProject('b');c.restoreProject('b');assert.equal(c.project('b').archived,true);c.view='archive';assert.equal(c.filtered()[0].id,'b');});
test('Permanent deletion requires confirmation and never removes active projects',()=>{const c=setup();c.deleteProject('a');c.permanentlyDelete(['a','b']);assert.equal(c.state.projects.length,2);c.window.confirm=()=>true;c.permanentlyDelete(['a','b']);assert.equal(c.state.projects.length,1);assert.equal(c.project('b').title,'Archived');assert.equal(c.lastUndo,null);});
test('Folder rename preserves order and updates active, archived, and trashed assignments',()=>{const c=setup();c.deleteProject('a');c.view='folder:Work';c.window.prompt=()=> 'Client work';c.renameFolder('Work');assert.deepEqual([...c.state.folders],['Client work','Personal','Ideas']);assert.equal(c.project('a').folder,'Client work');assert.equal(c.project('b').folder,'Client work');assert.equal(c.view,'folder:Client work');});
test('Folder name collisions and cancelled renames preserve data',()=>{const c=setup();c.window.prompt=()=> 'Personal';c.renameFolder('Work');assert.equal(c.state.folders[0],'Work');c.window.prompt=()=>null;c.renameFolder('Work');assert.equal(c.project('a').folder,'Work');});
test('Reordering folders changes only their order',()=>{const c=setup();c.reorderFolder('Ideas',0);assert.deepEqual([...c.state.folders],['Ideas','Work','Personal']);assert.equal(c.project('a').folder,'Work');c.reorderFolder('Ideas',2);assert.deepEqual([...c.state.folders],['Work','Personal','Ideas']);});

test('New project cards keep the same dimensions after tidying, inside and outside the hot zone',()=>{
 const c=setup();
 Object.assign(c,{zoom:1,crypto:require('node:crypto').webcrypto,openEditor(){},document:{createRange:()=>({selectNodeContents(){}})}});
 c.window.getSelection=()=>({removeAllRanges(){},addRange(){}});
 c.$=()=>({value:'',clientWidth:1200,scrollTo(){},focus(){}});
 c.state.hotZone={x:40,y:20,w:0,h:0};
 vm.runInContext(source.slice(source.indexOf('const GRID='),source.indexOf('function hotCards(')),c);
 for(const name of ['hotCards','zoneRect','nextZ','createProject','tidy'])vm.runInContext(fn(name),c);
 for(const hot of [false,true]){
  c.createProject();
  const p=c.state.projects.at(-1);p.hot=hot;
  const before=[p.width,p.height];
  c.tidy();
  assert.deepEqual([p.width,p.height],before,'Tidy must not resize a new card');
  assert.deepEqual(before,[300,240]);
 }
});
