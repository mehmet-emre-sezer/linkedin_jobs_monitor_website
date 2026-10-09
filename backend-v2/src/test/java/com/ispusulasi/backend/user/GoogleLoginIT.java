package com.ispusulasi.backend.user;

import com.ispusulasi.backend.common.error.UnauthorizedException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
class GoogleLoginIT {

    @Autowired
    UserService userService;

    @Test
    void gecersiz_google_token_reddedilir() {
        // Google'a gidip dogrulamaya calisir, gecersiz token -> UnauthorizedException
        assertThrows(UnauthorizedException.class,
                () -> userService.loginWithGoogle("sahte.google.token"));
    }
}
