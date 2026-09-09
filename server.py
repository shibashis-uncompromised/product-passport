"""Local preview server. Run: python3 server.py (no packages required)."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit, unquote
import os

ROOT = Path(__file__).resolve().parent
class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)
    def do_GET(self):
        self.route()
        super().do_GET()
    def do_HEAD(self):
        self.route()
        super().do_HEAD()
    def route(self):
        url = urlsplit(self.path)
        path = unquote(url.path)
        if path in ('/home', '/home/'):
            self.path = '/index.html'
        elif path.startswith(('/passport/', '/home/')):
            # Keep relative assets valid for the QR route, including trailing slashes.
            name = path.split('/assets/', 1)
            if len(name) == 2:
                self.path = '/assets/' + name[1]
            elif path.rsplit('/', 1)[-1] in ('styles.css', 'app.js', 'data.js'):
                self.path = '/' + path.rsplit('/', 1)[-1]
            else:
                self.path = '/index.html'
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        self.send_header('X-Content-Type-Options', 'nosniff')
        super().end_headers()

if __name__ == '__main__':
    port = int(os.environ.get('PASSPORT_PORT', '4387'))
    print(f'Passport preview: http://127.0.0.1:{port}', flush=True)
    ThreadingHTTPServer(('127.0.0.1', port), Handler).serve_forever()
