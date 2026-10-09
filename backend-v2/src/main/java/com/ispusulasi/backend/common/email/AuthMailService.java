package com.ispusulasi.backend.common.email;

import com.ispusulasi.backend.common.security.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Kimlik dogrulama mailleri: email dogrulama + parola sifirlama linkleri.
 * Eski email_service.py (send_verification_email / send_password_reset_email) karsiligi.
 */
@Service
public class AuthMailService {

    private static final String BRAND = "İş Pusulası";

    private final EmailClient emailClient;
    private final JwtService jwtService;
    private final String frontendUrl;
    private final long verifyExpireMinutes;
    private final long resetExpireMinutes;

    public AuthMailService(EmailClient emailClient,
                           JwtService jwtService,
                           @Value("${app.frontend.url}") String frontendUrl,
                           @Value("${app.email.verification-expire-minutes}") long verifyExpireMinutes,
                           @Value("${app.email.password-reset-expire-minutes}") long resetExpireMinutes) {
        this.emailClient = emailClient;
        this.jwtService = jwtService;
        this.frontendUrl = frontendUrl;
        this.verifyExpireMinutes = verifyExpireMinutes;
        this.resetExpireMinutes = resetExpireMinutes;
    }

    public void sendVerificationEmail(Integer userId, String to) {
        String token = jwtService.generatePurposeToken(
                userId, JwtService.PURPOSE_EMAIL_VERIFICATION, verifyExpireMinutes);
        String url = frontendUrl + "/verify-email?token=" + token;

        String html = """
                <h2>%s • Hoş geldin 👋</h2>
                <p>Hesabını aktifleştirmek için aşağıdaki butona tıkla:</p>
                <p><a href="%s" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px">E-postamı doğrula</a></p>
                <p>Veya bu linki tarayıcına yapıştır:<br><a href="%s">%s</a></p>
                <p>Bu link 24 saat içinde geçersiz olacak.</p>
                """.formatted(BRAND, url, url, url);

        emailClient.send(to, BRAND + " — E-postanı doğrula", html);
    }

    public void sendPasswordResetEmail(Integer userId, String to) {
        String token = jwtService.generatePurposeToken(
                userId, JwtService.PURPOSE_PASSWORD_RESET, resetExpireMinutes);
        String url = frontendUrl + "/reset-password?token=" + token;

        String html = """
                <h2>Parola sıfırlama</h2>
                <p>Parolanı sıfırlamak için aşağıdaki butona tıkla:</p>
                <p><a href="%s" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px">Parolamı sıfırla</a></p>
                <p>Veya bu linki tarayıcına yapıştır:<br><a href="%s">%s</a></p>
                <p>Bu link 1 saat içinde geçersiz olacak.</p>
                <p>Eğer bu işlemi sen başlatmadıysan bu maili görmezden gelebilirsin.</p>
                """.formatted(url, url, url);

        emailClient.send(to, BRAND + " — Parola sıfırlama", html);
    }
}
