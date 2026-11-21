import base64
import hashlib
import http.client
import json
from pathlib import Path
import sqlite3
import sys
import tempfile
import threading
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from bear_import import BearLibrary, BearImportError
from start import make_server


class BearImportTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        db = sqlite3.connect(self.root / 'database.sqlite')
        db.executescript('''CREATE TABLE ZSFNOTE (Z_PK INTEGER PRIMARY KEY, ZUNIQUEIDENTIFIER TEXT, ZTITLE TEXT, ZTEXT TEXT, ZMODIFICATIONDATE REAL, ZHASIMAGES INTEGER, ZTRASHED INTEGER DEFAULT 0, ZPERMANENTLYDELETED INTEGER DEFAULT 0, ZENCRYPTED INTEGER DEFAULT 0, ZLOCKED INTEGER DEFAULT 0);
        CREATE TABLE ZSFNOTEFILE (ZNOTE INTEGER, ZUNIQUEIDENTIFIER TEXT, ZFILENAME TEXT, ZPERMANENTLYDELETED INTEGER DEFAULT 0, ZENCRYPTED INTEGER DEFAULT 0, ZUNUSED INTEGER DEFAULT 0);''')
        for i, (uid, title, extra) in enumerate([('fixture','Bear import fixture',''),('trash','Trashed','ZTRASHED'),('lock','Locked','ZLOCKED'),('encrypted','Encrypted','ZENCRYPTED')], 1):
            db.execute('INSERT INTO ZSFNOTE(Z_PK,ZUNIQUEIDENTIFIER,ZTITLE,ZTEXT,ZMODIFICATIONDATE,ZHASIMAGES) VALUES(?,?,?,?,?,?)', (i,uid,title,'# '+title+'\n\n## Heading\n\n**Bold** and *italic*\n\n- [x] Done\n- [ ] Next\n\n![Reference](fixture.png)\n',i,1))
            if extra:
                db.execute('UPDATE ZSFNOTE SET '+extra+'=1 WHERE Z_PK=?',(i,))
        db.execute('INSERT INTO ZSFNOTEFILE(ZNOTE,ZUNIQUEIDENTIFIER,ZFILENAME) VALUES(1,?,?)',('image-id','fixture.png'))
        db.commit();db.close()
        folder = self.root/'Local Files/Note Images/image-id'
        folder.mkdir(parents=True)
        # Real 1×1 PNG, not a reference to any user data.
        self.png = base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a0x8AAAAASUVORK5CYII=')
        (folder/'fixture.png').write_bytes(self.png)
        self.library = BearLibrary(self.root)

    def tearDown(self):
        self.temp.cleanup()

    def test_import_title_markdown_and_image_without_modifying_source(self):
        before = hashlib.sha256((self.root/'database.sqlite').read_bytes()).digest()
        result = self.library.note('fixture')
        self.assertEqual(result['title'],'Bear import fixture')
        self.assertIn('**Bold**',result['markdown'])
        self.assertEqual(base64.b64decode(result['images'][0]['src'].split(',')[1]),self.png)
        self.assertEqual(result['warnings'],[])
        self.assertEqual(before,hashlib.sha256((self.root/'database.sqlite').read_bytes()).digest())

    def test_search_and_exclusion(self):
        self.assertEqual([n['id'] for n in self.library.search()['notes']],['fixture'])
        self.assertEqual(self.library.search('unknown')['notes'],[])
        self.assertEqual(len(self.library.search('IMPORT')['notes']),1)
        for uid in ['trash','lock','encrypted','missing',"fixture' OR 1=1 --"]:
            with self.assertRaises(BearImportError):self.library.note(uid)

    def test_missing_and_path_traversal_are_not_embedded(self):
        (self.root/'Local Files/Note Images/image-id/fixture.png').unlink()
        result=self.library.note('fixture')
        self.assertEqual(result['images'],[])
        self.assertIn('missing',result['warnings'][0])
        outside=self.root/'outside.png';outside.write_bytes(self.png)
        with sqlite3.connect(self.root/'database.sqlite') as db:
            db.execute('UPDATE ZSFNOTEFILE SET ZFILENAME=?',('../../../outside.png',))
        self.assertEqual(self.library.note('fixture')['images'],[])

    def test_connection_enforces_read_only(self):
        db=self.library.connect()
        try:
            with self.assertRaises(sqlite3.OperationalError):db.execute('DELETE FROM ZSFNOTE')
        finally:db.close()

    def test_api_requires_same_origin_and_session_token(self):
        server=make_server(self.root,0,self.library)
        thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
        def request(method,path,headers=None,body=None):
            conn=http.client.HTTPConnection('127.0.0.1',server.server_port)
            conn.request(method,path,body,headers or {})
            result=conn.getresponse();data=result.read();conn.close()
            return result.status,json.loads(data)
        try:
            self.assertEqual(request('GET','/api/bear/session')[0],403)
            status,data=request('GET','/api/bear/session',{'X-Project-Canvas':'bear-import'})
            self.assertEqual(status,200)
            headers={'X-Project-Canvas':'bear-import','X-Bear-Token':data['token'],'Content-Type':'application/json'}
            self.assertEqual(request('POST','/api/bear/note',headers,json.dumps({'id':'fixture'}))[0],200)
            self.assertEqual(request('POST','/api/bear/search',{**headers,'Origin':'https://untrusted.example'},'{}')[0],403)
            self.assertEqual(request('POST','/api/bear/search',{**headers,'Host':'untrusted.example'},'{}')[0],403)
            self.assertEqual(request('POST','/api/bear/search',{**headers,'X-Bear-Token':'wrong'},'{}')[0],403)
        finally:server.shutdown();server.server_close();thread.join()


if __name__ == '__main__':unittest.main()
