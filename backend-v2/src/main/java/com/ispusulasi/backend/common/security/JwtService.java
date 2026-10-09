package com.ispusulasi.backend.common.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    // Amaca ozel token turleri
    public static final String PURPOSE_EMAIL_VERIFICATION = "email_verification";
    public static final String PURPOSE_PASSWORD_RESET = "password_reset";
    public static final String PURPOSE_TELEGRAM_LINK = "telegram_link";

    private final SecretKey key;
    private final long expirationMs;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms}") long expirationMs) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    public String generateToken(String email) {
        Date now = new Date();
        return Jwts.builder()
                .subject(email)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expirationMs))
                .signWith(key)
                .compact();
    }

    public String extractEmail(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    /** Amaca ozel kisa omurlu token (email dogrulama / parola sifirlama). */
    public String generatePurposeToken(Integer userId, String purpose, long expireMinutes) {
        Date now = new Date();
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("purpose", purpose)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expireMinutes * 60_000))
                .signWith(key)
                .compact();
    }

    /** Token'i dogrula; amaci eslesmiyorsa hata. Basariliysa userId doner. */
    public Integer parsePurposeToken(String token, String expectedPurpose) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        if (!expectedPurpose.equals(claims.get("purpose", String.class))) {
            throw new IllegalArgumentException("Token amacı uyuşmuyor");
        }
        return Integer.valueOf(claims.getSubject());
    }
}