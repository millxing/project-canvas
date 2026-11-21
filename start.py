"""Launch Project Canvas and its same-origin, read-only Bear import connection."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from functools import partial
from pathlib import Path
import json
import secrets
import sqlite3
import webbrowser
from bear_import import BearLibrary, BearImportError


class ProjectHandler(SimpleHTTPRequestHandler):
    def allowed_host(self):
        return self.headers.get('Host') == f'127.0.0.1:{self.server.server_port}'

    def api_allowed(self):
        origin = f'http://127.0.0.1:{self.server.server_port}'
        return (self.allowed_host()
                and self.headers.get('Origin', origin) == origin
                and self.headers.get('Sec-Fetch-Site', 'same-origin') in ['same-origin', 'none']
                and self.headers.get('X-Project-Canvas') == 'bear-import')

    def json_response(self, status, payload):
        body = json.dumps(payload).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if not self.allowed_host():
            return self.send_error(403)
        if self.path == '/api/bear/session':
            if not self.api_allowed():
                return self.json_response(403, {'error': 'Open Bear import from Project Canvas.'})
            return self.json_response(200, {'token': self.server.bear_token})
        if self.path.startswith('/api/'):
            return self.json_response(404, {'error': 'Unknown endpoint.'})
        super().do_GET()

    def do_POST(self):
        if not self.api_allowed() or not secrets.compare_digest(self.headers.get('X-Bear-Token', ''), self.server.bear_token):
            return self.json_response(403, {'error': 'Open Bear import from Project Canvas.'})
        try:
            length = int(self.headers.get('Content-Length', '0'))
            if not 0 < length <= 8192:
                return self.json_response(413, {'error': 'Request is too large.'})
            payload = json.loads(self.rfile.read(length))
            if not isinstance(payload, dict):
                raise ValueError('Invalid request.')
            if self.path == '/api/bear/search':
                result = self.server.bear_library.search(payload.get('query', ''))
            elif self.path == '/api/bear/note':
                result = self.server.bear_library.note(payload.get('id'))
            else:
                return self.json_response(404, {'error': 'Unknown endpoint.'})
            self.json_response(200, result)
        except BearImportError as error:
            self.json_response(400, {'error': str(error)})
        except (OSError, sqlite3.Error):
            self.json_response(503, {'error': 'Bear’s local library could not be read. Open Bear, let it finish syncing, and try again.'})
        except (ValueError, TypeError):
            self.json_response(400, {'error': 'Invalid import request.'})

    def log_message(self, format, *args):
        # Do not log titles, searches, or note identifiers.
        if not self.path.startswith('/api/'):
            super().log_message(format, *args)


def make_server(root, port=4173, library=None):
    server = ThreadingHTTPServer(('127.0.0.1', port), partial(ProjectHandler, directory=str(root)))
    server.bear_token = secrets.token_urlsafe(32)
    server.bear_library = library or BearLibrary()
    return server


if __name__ == '__main__':
    root = Path(__file__).resolve().parent
    address = 'http://127.0.0.1:4173'
    try:
        server = make_server(root)
    except OSError as error:
        print(f'Could not start Project Canvas: {error}\nClose another preview server using port 4173 and try again.')
        input('Press Return to close. ')
        raise SystemExit(1)
    print(f'Project Canvas is running at {address}\nKeep this window open while using the app. Press Control+C to stop.')
    webbrowser.open(address)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
