package com.ispusulasi.backend.common.telegram;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * Telegram Bot API wrapper (eski telegram_bot.py karsiligi).
 * Token bos ise mock moda gecer: gercek istek atmaz, konsola yazar.
 */
@Component
public class TelegramClient {

    private static final Logger log = LoggerFactory.getLogger(TelegramClient.class);

    private final RestClient restClient;
    private final String token;
    private final boolean configured;

    public TelegramClient(@Value("${app.telegram.bot-token:}") String token) {
        this.token = token;
        this.configured = token != null && !token.isBlank();
        this.restClient = RestClient.builder().baseUrl("https://api.telegram.org").build();
    }

    public void sendMessage(String chatId, String text) {
        if (!configured) {
            log.info("TELEGRAM (mock) -> chat_id={}\n{}", chatId, text);
            return;
        }
        restClient.post()
                .uri("/bot{token}/sendMessage", token)
                .body(Map.of(
                        "chat_id", chatId,
                        "text", text,
                        "parse_mode", "Markdown",
                        "disable_web_page_preview", true))
                .retrieve()
                .toBodilessEntity();
    }
}
