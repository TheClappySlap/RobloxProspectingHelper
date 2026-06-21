"""Tiny threaded static dev server for the Prospecting Build Planner.

Why this exists:
  * ES modules need http:// (not file://).
  * THREADED so the browser's many parallel module/data requests load instantly
    (a single-threaded server serialized them — slow once the app grew).
  * no-cache so your edits show up on reload (fast 304s for unchanged files).
  * Auto-picks a FREE port starting at 5500, so a second instance never collides
    with one already running (that collision was the "race condition").
  * Opens the browser itself, only AFTER the socket is listening — no more
    "opened too early / connection refused" race.

The optimizer runs entirely in the browser (JS), so this server is pure static —
no Python optimizer import, no /api endpoints.

Usage:  py serve.py [port] [--no-browser]
"""
import http.server
import sys
import threading
import webbrowser

args = [a for a in sys.argv[1:] if not a.startswith("-")]
NO_BROWSER = "--no-browser" in sys.argv
START_PORT = int(args[0]) if args else 5500


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # revalidate-every-time: changed files re-fetch (200), unchanged 304 fast.
        self.send_header("Cache-Control", "no-cache, must-revalidate")
        super().end_headers()

    def log_message(self, *a):
        pass  # keep the console quiet


class DevServer(http.server.ThreadingHTTPServer):
    daemon_threads = True
    allow_reuse_address = False  # detect a busy port instead of stealing it


def serve(start, tries=20):
    for port in range(start, start + tries):
        try:
            return DevServer(("127.0.0.1", port), Handler), port
        except OSError:
            continue
    raise SystemExit(f"No free port found in {start}..{start + tries - 1}.")


if __name__ == "__main__":
    httpd, port = serve(START_PORT)
    url = f"http://localhost:{port}/"
    print(f"Prospecting Build Planner — serving {url} (threaded, no-cache)")
    if port != START_PORT:
        print(f"(port {START_PORT} was busy — using {port})")
    if not NO_BROWSER:
        # Socket is already listening, so opening the browser now is race-free.
        threading.Timer(0.3, lambda: webbrowser.open(url)).start()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
