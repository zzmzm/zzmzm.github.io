#!/usr/bin/env python3
"""Loopback-only rehearsal origin, not a login service or a production app."""
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json


class Origin(BaseHTTPRequestHandler):
    def reply(self, status, data):
        body = json.dumps(data).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        self.reply(200, {"origin": "existing-app", "path": self.path})

    def do_POST(self):
        try:
            size = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self.reply(400, {"error": "invalid content length"})
            return
        if not 0 <= size <= 65536:
            self.reply(413, {"error": "rehearsal limit is 64 KiB"})
            return
        body = self.rfile.read(size)
        self.reply(200, {"origin": "existing-app", "received_bytes": len(body)})


if __name__ == "__main__":
    ThreadingHTTPServer(("127.0.0.1", 29900), Origin).serve_forever()
