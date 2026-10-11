package com.ispusulasi.backend.common.turnstile;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * Cloudflare Turnstile dogrulamasi (bot kayitlarini engeller).
 * Secret bos ise mock moda gecer: dogrulama atlanir (lokal/dev icin).
 */
@Component
public class TurnstileClient {

    private static final Logger log = LoggerFactory.getLogger(TurnstileClient.class);

    private final RestClient restClient;
    private final String secret;
    private final boolean configured;

    public TurnstileClient(@Value("${app.turnstile.secret-key:}") String secret) {
        this.secret = secret;
        this.configured = secret != null && !secret.isBlank();
        this.restClient = RestClient.builder()
                .baseUrl("https://challenges.cloudflare.com").build();
    }

    /** Token gecerli mi? Secret ayarli degilse hep true (lokal/dev: dogrulama atlanir). */
    public boolean verify(String token) {
        if (!configured) {
            return true;
        }
        if (token == null || token.isBlank()) {
            return false;
        }
        try {
            MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
            form.add("secret", secret);
            form.add("response", token);

            Map<?, ?> body = restClient.post()
                    .uri("/turnstile/v0/siteverify")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .retrieve()
                    .body(Map.class);

            return body != null && Boolean.TRUE.equals(body.get("success"));
        } catch (Exception e) {
            // Dogrulama servisine ulasilamadi: guvenli taraf -> reddet.
            log.warn("Turnstile dogrulamasi basarisiz (servis hatasi): {}", e.getMessage());
            return false;
        }
    }
}
