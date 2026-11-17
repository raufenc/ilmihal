#!/usr/bin/env python3
"""ilmihal.org yerel sunucusu — canlıdaki (Vercel) davranışı taklit eder.

- vercel.json'daki "rewrites" kurallarını uygular (/madde/1/1 → /index.html gibi).
- Belgelere vercel.json'daki Content-Security-Policy başlığını ekler
  (yalnız "upgrade-insecure-requests" çıkarılır; yerelde http kullanılır).
- Bulunamayan yol için 404.html'i 404 koduyla verir.
- Önbelleği kapatır; her istek diskteki son hâli getirir.

Çalıştırma: python3 tools/yeni-site/sunucu.py [port=8260]
"""
import json, os, re, sys, mimetypes, urllib.parse
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

KOK = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8260
mimetypes.add_type("text/javascript", ".mjs")
mimetypes.add_type("application/manifest+json", ".webmanifest")
mimetypes.add_type("image/webp", ".webp")
mimetypes.add_type("font/woff2", ".woff2")


def kurallar():
    """vercel.json her istekte yeniden okunur; düzenleme anında etkili olur."""
    try:
        vj = json.load(open(os.path.join(KOK, "vercel.json"), encoding="utf-8"))
    except Exception as e:  # bozuk JSON sunucuyu düşürmesin
        print("vercel.json okunamadı:", e)
        return [], ""
    yeniden = []
    for k in vj.get("rewrites", []):
        hedef = k["destination"]
        if hedef.startswith("http"):
            continue  # dış adrese vekillik yerelde yapılmaz
        kalip = re.escape(k["source"])
        kalip = re.sub(r":(\w+)\\\*", r"(?P<\1>.*)", kalip)   # :ad*  → her şey
        kalip = re.sub(r":(\w+)", r"(?P<\1>[^/]+)", kalip)     # :ad   → tek parça
        yeniden.append((re.compile("^" + kalip + "/?$"), hedef))
    csp = ""
    for blok in vj.get("headers", []):
        for h in blok.get("headers", []):
            if h["key"].lower() == "content-security-policy":
                csp = h["value"].replace("; upgrade-insecure-requests", "")
    return yeniden, csp


class Istek(SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=KOK, **k)

    def log_message(self, bicim, *a):
        if len(a) > 1 and str(a[1]).startswith(("4", "5")):
            sys.stderr.write("%s %s\n" % (a[1], a[0]))

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        if getattr(self, "_belge", False) and self._csp:
            self.send_header("Content-Security-Policy", self._csp)
        super().end_headers()

    def do_GET(self):
        yeniden, self._csp = kurallar()
        yol = urllib.parse.urlparse(self.path).path
        yerel = os.path.join(KOK, urllib.parse.unquote(yol).lstrip("/"))
        self._belge = False
        if os.path.isdir(yerel) and os.path.isfile(os.path.join(yerel, "index.html")):
            self._belge = True
            if not yol.endswith("/"):
                self.send_response(308)
                self.send_header("Location", yol + "/")
                self.end_headers()
                return
        elif os.path.isfile(yerel):
            self._belge = yerel.endswith(".html")
        else:
            for kalip, hedef in yeniden:
                if kalip.match(yol):
                    self.path = hedef
                    self._belge = hedef.endswith(".html")
                    break
            else:
                self._belge = True
                try:
                    govde = open(os.path.join(KOK, "404.html"), "rb").read()
                except OSError:
                    govde = b"404"
                self.send_response(404)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(govde)))
                self.end_headers()
                self.wfile.write(govde)
                return
        return super().do_GET()

    do_HEAD = do_GET


if __name__ == "__main__":
    print(f"ilmihal yerel sunucu: http://localhost:{PORT}/  (kök: {KOK})")
    # Birkaç başsız tarayıcı aynı anda yüzlerce modül isteyebilir; varsayılan kuyruk (5) bağlantıları düşürür
    ThreadingHTTPServer.request_queue_size = 256
    ThreadingHTTPServer.daemon_threads = True
    ThreadingHTTPServer(("127.0.0.1", PORT), Istek).serve_forever()
