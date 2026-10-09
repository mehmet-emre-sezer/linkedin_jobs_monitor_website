package com.ispusulasi.backend.common.email;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * Email gonderici (Resend HTTP API, eski email_service._send_email karsiligi).
 * API key bos ise mock moda gecer: gercek istek atmaz, konsola yazar.
 */
@Component
public class EmailClient {

    private static final Logger log = LoggerFactory.getLogger(EmailClient.class);

    private final RestClient restClient;
    private final String apiKey;
    private final String from;
    private final boolean configured;

    public EmailClient(@Value("${app.email.resend-api-key:}") String apiKey,
                       @Value("${app.email.from}") String from) {
        this.apiKey = apiKey;
        this.from = from;
        this.configured = apiKey != null && !apiKey.isBlank();
        this.restClient = RestClient.builder().baseUrl("https://api.resend.com").build();
    }

    public void send(String to, String subject, String html) {
        if (!configured) {
            log.info("EMAIL (mock) -> to={} | subject={}\n{}", to, subject, html);
            return;
        }
        restClient.post()
                .uri("/emails")
                .header("Authorization", "Bearer " + apiKey)
                .body(Map.of("from", from, "to", to, "subject", subject, "html", html))
                .retrieve()
                .toBodilessEntity();
    }
}
