const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const source=fs.readFileSync(require('node:path').join(__dirname,'../app.js'),'utf8');
const context=vm.createContext({URL});
for(const name of ['safeLink','youtubeId']){const start=source.indexOf(`function ${name}(`),end=source.indexOf('\nfunction ',start+1);vm.runInContext(source.slice(start,end),context);}
test('Links normalize web addresses and support email',()=>{assert.equal(context.safeLink('example.com/docs'),'https://example.com/docs');assert.equal(context.safeLink('mailto:hello@example.com'),'mailto:hello@example.com');assert.equal(context.safeLink('http://127.0.0.1:4173'),'http://127.0.0.1:4173/');});
test('Unsafe link schemes and credential URLs are rejected',()=>{for(const value of ['javascript:alert(1)','data:text/html,example','file:///etc/passwd','https://user:password@example.com','https://example.com\n/path'])assert.equal(context.safeLink(value),'');});
test('YouTube share, watch, Shorts, live, and embed URLs identify the same video',()=>{for(const value of ['https://www.youtube.com/watch?v=M7lc1UVf-VE','https://youtu.be/M7lc1UVf-VE?t=30','youtube.com/shorts/M7lc1UVf-VE','https://www.youtube.com/live/M7lc1UVf-VE','https://www.youtube-nocookie.com/embed/M7lc1UVf-VE?rel=0'])assert.equal(context.youtubeId(value),'M7lc1UVf-VE');});
test('Only exact YouTube hosts and valid video IDs are accepted',()=>{for(const value of ['https://youtube.com.evil.example/watch?v=M7lc1UVf-VE','https://example.com/embed/M7lc1UVf-VE','https://evil@youtube.com/watch?v=M7lc1UVf-VE','https://youtu.be/not-an-id','https://www.youtube.com/playlist?list=test','javascript:alert(1)'])assert.equal(context.youtubeId(value),null);});
