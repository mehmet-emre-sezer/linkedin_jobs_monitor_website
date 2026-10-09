package com.ispusulasi.backend.user;

import com.ispusulasi.backend.common.security.JwtService;
import com.ispusulasi.backend.user.web.RegisterRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class AuthFlowIT {

    @Autowired
    UserService userService;
    @Autowired
    UserRepository userRepository;
    @Autowired
    JwtService jwtService;
    @Autowired
    PasswordEncoder passwordEncoder;

    @Test
    void email_dogrulama_akisi() {
        String email = "verify_" + System.currentTimeMillis() + "@test.com";
        userService.register(new RegisterRequest(email, "ilkParola123"));

        User before = userRepository.findByEmail(email).orElseThrow();
        assertFalse(before.isEmailVerified(), "kayitta dogrulanmamis olmali");

        String token = jwtService.generatePurposeToken(
                before.getId(), JwtService.PURPOSE_EMAIL_VERIFICATION, 60);
        userService.verifyEmail(token);

        assertTrue(userRepository.findByEmail(email).orElseThrow().isEmailVerified());
    }

    @Test
    void parola_sifirlama_akisi() {
        String email = "reset_" + System.currentTimeMillis() + "@test.com";
        userService.register(new RegisterRequest(email, "eskiParola123"));
        User user = userRepository.findByEmail(email).orElseThrow();

        String token = jwtService.generatePurposeToken(
                user.getId(), JwtService.PURPOSE_PASSWORD_RESET, 60);
        userService.resetPassword(token, "yeniParola456");

        String newHash = userRepository.findByEmail(email).orElseThrow().getPasswordHash();
        assertTrue(passwordEncoder.matches("yeniParola456", newHash), "yeni parola gecerli olmali");
        assertFalse(passwordEncoder.matches("eskiParola123", newHash), "eski parola gecersiz olmali");
    }

    @Test
    void yanlis_amac_token_reddedilir() {
        String email = "wrong_" + System.currentTimeMillis() + "@test.com";
        userService.register(new RegisterRequest(email, "parola12345"));
        User user = userRepository.findByEmail(email).orElseThrow();

        // parola sifirlama token'iyle email dogrulama denenirse hata
        String resetToken = jwtService.generatePurposeToken(
                user.getId(), JwtService.PURPOSE_PASSWORD_RESET, 60);
        assertThrows(IllegalArgumentException.class, () -> userService.verifyEmail(resetToken));
    }
}
