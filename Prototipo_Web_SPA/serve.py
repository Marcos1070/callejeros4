#!/usr/bin/env python3
"""
Servidor de desarrollo para Callejeros Río IV.

Uso:    python3 serve.py            (puerto 8000)
        python3 serve.py 8080       (otro puerto)
Abrir:  http://localhost:8000

Por qué usar esto en lugar de `python3 -m http.server`:
  * Envía "Cache-Control: no-store". El servidor estándar no manda cabeceras de caché y Chrome
    reutiliza módulos JS y CSS viejos tras una recarga normal: se ven cambios "que no funcionan"
    aunque el código ya esté corregido.
  * Escucha solo en 127.0.0.1 y se abre como "localhost", que el navegador trata como contexto
    seguro (habilita crypto.subtle, geolocalización, etc.). http://0.0.0.0:8000 NO es seguro.
"""
import http.server
import socketserver
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


class ReusableServer(socketserver.TCPServer):
    allow_reuse_address = True


if __name__ == "__main__":
    with ReusableServer(("127.0.0.1", PORT), NoCacheHandler) as httpd:
        print(f"Callejeros Río IV -> http://localhost:{PORT}   (Ctrl+C para detener)")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServidor detenido.")
