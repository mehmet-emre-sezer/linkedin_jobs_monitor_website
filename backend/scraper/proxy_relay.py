"""Yerel proxy relay — kimlik doğrulamalı upstream proxy'yi auth'suz hale getirir.

Chrome (`--headless=new`) inline proxy şifresini desteklemez, MV2 auth extension'ı
da headless'ta güvenilir yüklenmez. Bu relay 127.0.0.1'de dinler; Chrome ona
auth'suz bağlanır, relay ise upstream IPRoyal proxy'ye `Proxy-Authorization`
header'ı ekleyerek CONNECT tüneli açar. Bağımlılıksız, container'da da çalışır.
"""

import base64
import socket
import threading
from socketserver import StreamRequestHandler, ThreadingTCPServer

_relay_port: int | None = None
_relay_lock = threading.Lock()


def _pipe(src: socket.socket, dst: socket.socket) -> None:
    try:
        while True:
            data = src.recv(65536)
            if not data:
                break
            dst.sendall(data)
    except OSError:
        pass
    finally:
        for s in (src, dst):
            try:
                s.shutdown(socket.SHUT_RDWR)
            except OSError:
                pass


def _make_handler(up_host: str, up_port: int, auth_header: bytes):
    class RelayHandler(StreamRequestHandler):
        def handle(self) -> None:
            first = self.rfile.readline()
            if not first:
                return
            # İlk satırı ve kalan header'ları oku (boş satıra kadar)
            header_lines = [first]
            while True:
                line = self.rfile.readline()
                header_lines.append(line)
                if line in (b"\r\n", b"\n", b""):
                    break

            try:
                upstream = socket.create_connection((up_host, up_port), timeout=30)
            except OSError:
                return

            try:
                # Auth header'ı enjekte ederek isteği upstream'e ilet
                upstream.sendall(header_lines[0])
                upstream.sendall(auth_header)
                for line in header_lines[1:]:
                    upstream.sendall(line)

                # Çift yönlü boru
                t = threading.Thread(
                    target=_pipe, args=(self.connection, upstream), daemon=True
                )
                t.start()
                _pipe(upstream, self.connection)
                t.join(timeout=1)
            finally:
                try:
                    upstream.close()
                except OSError:
                    pass

    return RelayHandler


class _Relay(ThreadingTCPServer):
    daemon_threads = True
    allow_reuse_address = True


def ensure_relay(host: str, port: int, username: str, password: str) -> int:
    """Relay'i (bir kez) başlatır ve dinlediği yerel portu döndürür."""
    global _relay_port
    with _relay_lock:
        if _relay_port is not None:
            return _relay_port
        token = base64.b64encode(f"{username}:{password}".encode()).decode()
        auth_header = f"Proxy-Authorization: Basic {token}\r\n".encode()
        server = _Relay(
            ("127.0.0.1", 0), _make_handler(host, int(port), auth_header)
        )
        _relay_port = server.server_address[1]
        threading.Thread(target=server.serve_forever, daemon=True).start()
        return _relay_port
