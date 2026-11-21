"""Read-only access to local Bear notes. Never modifies Bear's database or files."""
import base64
from contextlib import closing
from pathlib import Path
import sqlite3

BEAR_ROOT = Path.home() / 'Library/Group Containers/9K33E3U3T4.net.shinyfrog.bear/Application Data'
VISIBLE = 'COALESCE(ZTRASHED,0)=0 AND COALESCE(ZPERMANENTLYDELETED,0)=0 AND COALESCE(ZENCRYPTED,0)=0 AND COALESCE(ZLOCKED,0)=0'


class BearImportError(Exception):
    pass


class BearLibrary:
    def __init__(self, root=BEAR_ROOT):
        self.root = Path(root)

    def connect(self):
        path = self.root / 'database.sqlite'
        if not path.is_file():
            raise BearImportError('Bear’s local library was not found. Open Bear on this Mac and let your notes download first.')
        try:
            db = sqlite3.connect(path.as_uri() + '?mode=ro', timeout=3)
            db.row_factory = sqlite3.Row
            db.execute('PRAGMA query_only=ON')
            return db
        except sqlite3.Error as error:
            raise BearImportError('Could not read Bear’s library. Check this app’s access to your local Bear files.') from error

    def search(self, query=''):
        with closing(self.connect()) as db:
            rows = db.execute(f'''SELECT ZUNIQUEIDENTIFIER AS id, ZTITLE AS title,
                ZHASIMAGES AS images FROM ZSFNOTE WHERE {VISIBLE}
                AND instr(lower(COALESCE(ZTITLE,'')),lower(?))>0
                ORDER BY ZMODIFICATIONDATE DESC LIMIT 51''', (str(query)[:200],)).fetchall()
            return {'notes': [dict(row) for row in rows[:50]], 'more': len(rows) > 50}

    def note(self, note_id):
        if not isinstance(note_id, str) or not note_id or len(note_id) > 200:
            raise BearImportError('Choose a valid Bear note.')
        with closing(self.connect()) as db:
            row = db.execute(f'''SELECT Z_PK, ZUNIQUEIDENTIFIER, ZTITLE, ZTEXT FROM ZSFNOTE
                WHERE ZUNIQUEIDENTIFIER=? AND {VISIBLE}''', (note_id,)).fetchone()
            if row is None:
                raise BearImportError('This note is unavailable, locked, encrypted, or in Bear’s Trash.')
            markdown = row['ZTEXT'] or ''
            if len(markdown.encode('utf-8')) > 10_000_000:
                raise BearImportError('This note is too large to import (10 MB text limit).')
            files = db.execute('''SELECT ZUNIQUEIDENTIFIER, ZFILENAME FROM ZSFNOTEFILE
                WHERE ZNOTE=? AND COALESCE(ZPERMANENTLYDELETED,0)=0
                AND COALESCE(ZENCRYPTED,0)=0 AND COALESCE(ZUNUSED,0)=0''', (row['Z_PK'],)).fetchall()
            images, warnings, total = [], [], 0
            base = (self.root / 'Local Files').resolve()
            for attachment in files:
                uid, name = attachment['ZUNIQUEIDENTIFIER'], attachment['ZFILENAME']
                if not uid or not name:
                    continue
                data = None
                for folder in ['Note Images', 'Note Files']:
                    candidate = (base / folder / uid / name).resolve()
                    if not candidate.is_relative_to(base):
                        continue
                    if candidate.is_file():
                        size = candidate.stat().st_size
                        if size > 30_000_000 or total + size > 75_000_000:
                            warnings.append(f'Attachment too large: {name}')
                            break
                        raw = candidate.read_bytes()
                        mime = image_type(raw)
                        if mime:
                            data = 'data:' + mime + ';base64,' + base64.b64encode(raw).decode('ascii')
                            total += len(raw)
                        else:
                            warnings.append(f'Unsupported attachment: {name}')
                        break
                if data:
                    images.append({'id': uid, 'name': name, 'src': data})
                elif not any(name in warning for warning in warnings):
                    warnings.append(f'Attachment not downloaded or missing: {name}')
            return {'id': row['ZUNIQUEIDENTIFIER'], 'title': row['ZTITLE'] or 'Untitled Bear note',
                    'markdown': markdown, 'images': images, 'warnings': warnings}


def image_type(data):
    if data.startswith(b'\x89PNG\r\n\x1a\n'):
        return 'image/png'
    if data.startswith(b'\xff\xd8\xff'):
        return 'image/jpeg'
    if data[:6] in [b'GIF87a', b'GIF89a']:
        return 'image/gif'
    if data.startswith(b'RIFF') and data[8:12] == b'WEBP':
        return 'image/webp'
    return None
