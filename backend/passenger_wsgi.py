import os
import sys
import traceback

# Ensure project root is in Python path for CloudLinux / cPanel Passenger
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lovekod_core.settings')

try:
    from lovekod_core.wsgi import application as _django_app
except Exception:
    _startup_err = traceback.format_exc()
    def application(environ, start_response):
        start_response('200 OK', [('Content-Type', 'text/html; charset=utf-8')])
        return [f"<h1>Startup Error</h1><pre>{_startup_err}</pre>".encode('utf-8')]
else:
    def application(environ, start_response):
        try:
            return _django_app(environ, start_response)
        except Exception:
            _run_err = traceback.format_exc()
            start_response('200 OK', [('Content-Type', 'text/html; charset=utf-8')])
            return [f"<h1>Runtime Error</h1><pre>{_run_err}</pre>".encode('utf-8')]
