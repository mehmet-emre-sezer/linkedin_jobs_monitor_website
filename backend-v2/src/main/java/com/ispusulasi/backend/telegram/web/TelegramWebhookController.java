package com.ispusulasi.backend.telegram.web;

import com.ispusulasi.backend.common.telegram.TelegramClient;
import com.ispusulasi.backend.profile.ProfileService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

/**
 * Telegram bot webhook'u. Bot'a gelen /start <token> komutuyla kullanicinin
 * chat_id'sini profile'a baglar (eski api/telegram.py karsiligi).
 */
@RestController
@RequestMapping("/api/telegram")
public class TelegramWebhookController {

    private static final Logger log = LoggerFactory.getLogger(TelegramWebhookController.class);

    private static final String GREETING =
            "👋 Merhaba!\n\nBu bot iş ilanlarını sana iletmek için hazırlandı.\n"
            + "Bağlantıyı tamamlamak için site üzerinden gelen *özel link*e tıklamalısın.";
    private static final String SUCCESS =
            "✅ Hesabın bağlandı!\n\nBundan sonra sana uygun iş ilanları buraya gelecek.\nİyi şanslar 🚀";
    private static final String EXPIRED =
            "⚠️ Bu bağlantı geçersiz veya süresi dolmuş.\n\nLütfen siteden yeni bir link al ve tekrar dene.";

    private final ProfileService profileService;
    private final TelegramClient telegramClient;
    private final String webhookSecret;

    public TelegramWebhookController(ProfileService profileService,
                                     TelegramClient telegramClient,
                                     @Value("${app.telegram.webhook-secret:}") String webhookSecret) {
        this.profileService = profileService;
        this.telegramClient = telegramClient;
        this.webhookSecret = webhookSecret;
    }

    @PostMapping("/webhook")
    public Map<String, Boolean> webhook(
            @RequestBody Map<String, Object> update,
            @RequestHeader(value = "X-Telegram-Bot-Api-Secret-Token", required = false) String secret) {

        verifySecret(secret);

        Map<String, Object> message = asMap(update.get("message"));
        if (message == null) {
            return Map.of("ok", true);
        }

        String text = ((String) message.getOrDefault("text", "")).strip();
        Map<String, Object> chat = asMap(message.get("chat"));
        Object chatIdObj = chat == null ? null : chat.get("id");
        if (chatIdObj == null || text.isEmpty()) {
            return Map.of("ok", true);
        }
        String chatId = String.valueOf(chatIdObj);

        if (text.startsWith("/start")) {
            String reply = handleStart(text, chatId);
            try {
                telegramClient.sendMessage(chatId, reply);
            } catch (Exception e) {
                // Yanit gonderilemese bile webhook 200 donmeli (Telegram tekrar denemesin)
                log.warn("Webhook yaniti gonderilemedi chat_id={} err={}", chatId, e.getMessage());
            }
        }
        return Map.of("ok", true);
    }

    private String handleStart(String text, String chatId) {
        String[] parts = text.split("\\s+", 2);
        if (parts.length < 2 || parts[1].isBlank()) {
            return GREETING;
        }
        String token = parts[1].strip().split("\\s+")[0];
        try {
            profileService.linkTelegramChat(token, chatId);
            return SUCCESS;
        } catch (Exception e) {
            return EXPIRED;
        }
    }

    private void verifySecret(String secret) {
        if (webhookSecret == null || webhookSecret.isBlank()) {
            return; // secret ayarli degilse (lokal) dogrulama kapali
        }
        if (!webhookSecret.equals(secret)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid webhook secret");
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> asMap(Object value) {
        return (value instanceof Map) ? (Map<String, Object>) value : null;
    }
}
