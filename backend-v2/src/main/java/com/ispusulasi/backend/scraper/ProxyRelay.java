package com.ispusulasi.backend.scraper;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

/**
 * Yerel proxy relay: kimlik dogrulamali upstream proxy'yi (IPRoyal) auth'suz hale getirir.
 * Headless Chrome user:pass'li proxy'yi guvenilir desteklemiyor; bu relay 127.0.0.1'de
 * dinler, Chrome ona auth'suz baglanir, relay upstream'e Proxy-Authorization ekleyip
 * CONNECT tunelini acar. Eski proxy_relay.py karsiligi.
 */
@Component
public class ProxyRelay {

    private static final Logger log = LoggerFactory.getLogger(ProxyRelay.class);

    private volatile Integer relayPort;

    /** Relay'i (bir kez) baslatir ve dinledigi yerel portu dondurur. */
    public synchronized int ensureRelay(String upHost, int upPort, String username, String password) {
        if (relayPort != null) {
            return relayPort;
        }
        try {
            String token = Base64.getEncoder()
                    .encodeToString((username + ":" + password).getBytes(StandardCharsets.UTF_8));
            byte[] authHeader = ("Proxy-Authorization: Basic " + token + "\r\n")
                    .getBytes(StandardCharsets.US_ASCII);

            ServerSocket server = new ServerSocket(0, 50, InetAddress.getByName("127.0.0.1"));
            relayPort = server.getLocalPort();

            Thread acceptThread = new Thread(() -> acceptLoop(server, upHost, upPort, authHeader),
                    "proxy-relay-accept");
            acceptThread.setDaemon(true);
            acceptThread.start();

            log.info("Proxy relay baslatildi: 127.0.0.1:{} -> {}:{}", relayPort, upHost, upPort);
            return relayPort;
        } catch (Exception e) {
            throw new IllegalStateException("Proxy relay baslatilamadi", e);
        }
    }

    private void acceptLoop(ServerSocket server, String upHost, int upPort, byte[] authHeader) {
        while (!server.isClosed()) {
            try {
                Socket client = server.accept();
                Thread handler = new Thread(() -> handle(client, upHost, upPort, authHeader),
                        "proxy-relay-conn");
                handler.setDaemon(true);
                handler.start();
            } catch (Exception e) {
                if (!server.isClosed()) {
                    log.debug("Relay accept hatasi: {}", e.getMessage());
                }
            }
        }
    }

    private void handle(Socket client, String upHost, int upPort, byte[] authHeader) {
        try (client; Socket upstream = new Socket()) {
            upstream.connect(new java.net.InetSocketAddress(upHost, upPort), 30_000);

            InputStream clientIn = client.getInputStream();
            OutputStream upstreamOut = upstream.getOutputStream();

            // Chrome'un istek satirini + header'larini oku (bos satira kadar)
            byte[] firstLine = readLine(clientIn);
            if (firstLine.length == 0) {
                return;
            }
            upstreamOut.write(firstLine);     // ornek: CONNECT www.linkedin.com:443 HTTP/1.1
            upstreamOut.write(authHeader);    // auth header'i enjekte et
            byte[] line;
            while ((line = readLine(clientIn)).length > 0) {
                upstreamOut.write(line);
                if (isBlank(line)) break;     // bos satir = header sonu
            }
            upstreamOut.flush();

            // Cift yonlu boru: client <-> upstream
            Thread up = new Thread(() -> pipe(client, upstream));
            up.setDaemon(true);
            up.start();
            pipe(upstream, client);
            up.join(1000);
        } catch (Exception e) {
            log.debug("Relay baglanti hatasi: {}", e.getMessage());
        }
    }

    /** src -> dst yonunde veriyi aktarir. */
    private void pipe(Socket src, Socket dst) {
        try {
            InputStream in = src.getInputStream();
            OutputStream out = dst.getOutputStream();
            byte[] buffer = new byte[65536];
            int read;
            while ((read = in.read(buffer)) != -1) {
                out.write(buffer, 0, read);
                out.flush();
            }
        } catch (Exception ignored) {
            // baglanti kapandi
        } finally {
            try { dst.shutdownOutput(); } catch (Exception ignored) {}
        }
    }

    /** CRLF'e kadar bir satir okur (CRLF dahil). */
    private byte[] readLine(InputStream in) throws Exception {
        java.io.ByteArrayOutputStream buf = new java.io.ByteArrayOutputStream();
        int b;
        while ((b = in.read()) != -1) {
            buf.write(b);
            if (b == '\n') break;
        }
        return buf.toByteArray();
    }

    private boolean isBlank(byte[] line) {
        String s = new String(line, StandardCharsets.US_ASCII);
        return s.equals("\r\n") || s.equals("\n");
    }
}
