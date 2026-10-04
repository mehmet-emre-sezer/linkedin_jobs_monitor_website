package com.ispusulasi.backend.common.llm;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.resilience.annotation.EnableResilientMethods;
import org.springframework.resilience.annotation.Retryable;
import org.springframework.web.client.HttpServerErrorException;

import static org.junit.jupiter.api.Assertions.assertEquals;

// Sadece Cfg yuklenir -> DB/JPA auto-config calismaz, Docker gerekmez
@SpringBootTest(classes = RetryIT.Cfg.class)
class RetryIT {

    @Autowired
    FlakyService flaky;

    @Test
    void uc_denemede_basarili_olur() {
        flaky.reset();

        String result = flaky.call();

        assertEquals("ok", result, "3. denemede basariyla donmeliydi");
        assertEquals(3, flaky.getAttempts(), "ilk 2 cagri 503 -> toplam 3 deneme beklenir");
    }

    @Configuration
    @EnableResilientMethods
    static class Cfg {
        @Bean
        FlakyService flakyService() {
            return new FlakyService();
        }
    }

    /** Ilk iki cagrida 503 firlatir, ucunculerde basarili doner. */
    static class FlakyService {
        private int attempts = 0;

        @Retryable(includes = HttpServerErrorException.class, maxRetries = 3, delay = 10)
        public String call() {
            attempts++;
            if (attempts < 3) {
                throw HttpServerErrorException.create(
                        HttpStatus.SERVICE_UNAVAILABLE, "busy", HttpHeaders.EMPTY, new byte[0], null);
            }
            return "ok";
        }

        int getAttempts() {
            return attempts;
        }

        void reset() {
            attempts = 0;
        }
    }
}
