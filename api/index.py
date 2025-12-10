from http.server import BaseHTTPRequestHandler
import json
import sys
import os
import traceback

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Test 1: Can we import sys and os?
            test_info = {
                'status': 'testing',
                'python_version': sys.version,
                'cwd': os.getcwd(),
                'files': os.listdir('.')
            }

            # Test 2: Can we add backend to path?
            backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
            sys.path.insert(0, backend_path)
            test_info['backend_path'] = backend_path
            test_info['backend_exists'] = os.path.exists(backend_path)

            # Test 3: Try importing FastAPI app
            try:
                from app.main import app as fastapi_app
                test_info['fastapi_imported'] = True
                test_info['fastapi_routes'] = len(fastapi_app.routes)
            except Exception as import_error:
                test_info['fastapi_imported'] = False
                test_info['import_error'] = str(import_error)
                test_info['import_traceback'] = traceback.format_exc()

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(test_info, indent=2).encode())

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            error_info = {
                'error': str(e),
                'type': type(e).__name__,
                'traceback': traceback.format_exc()
            }
            self.wfile.write(json.dumps(error_info, indent=2).encode())

    def do_POST(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({'message': 'POST method test'}).encode())
