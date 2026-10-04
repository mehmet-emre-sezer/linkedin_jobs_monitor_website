package com.ispusulasi.backend.notification;

import com.ispusulasi.backend.common.telegram.TelegramClient;
import com.ispusulasi.backend.job.Job;
import com.ispusulasi.backend.profile.Profile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Kullaniciya Telegram uzerinden bildirim gonderir (eski notification_service.py).
 * Hata olursa sessizce loglar; tarama akisini kesmez.
 */
@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final TelegramClient telegram;

    public NotificationService(TelegramClient telegram) {
        this.telegram = telegram;
    }

    public boolean sendJobNotification(Profile profile, Job job) {
        return sendSilently(profile, formatJob(job));
    }

    public boolean sendScanSummary(Profile profile, int scanned, int newCount, int sent) {
        return sendSilently(profile, formatSummary(scanned, newCount, sent));
    }

    private boolean sendSilently(Profile profile, String text) {
        String chatId = profile.getTelegramChatId();
        if (chatId == null || chatId.isBlank()) {
            return false;
        }
        try {
            telegram.sendMessage(chatId, text);
            return true;
        } catch (Exception e) {
            log.warn("Telegram gonderimi basarisiz user_id={} err={}", profile.getUserId(), e.getMessage());
            return false;
        }
    }

    private String formatJob(Job job) {
        String keywords = (job.getMatchedKeywords() == null || job.getMatchedKeywords().isEmpty())
                ? "—"
                : String.join(", ", job.getMatchedKeywords().stream().map(this::esc).toList());
        String applicantsLine = job.getApplicants() != null
                ? "👥 " + job.getApplicants() + "+ başvuran\n" : "";

        return "🔥 *" + esc(job.getTitle()) + "*\n"
                + "🏢 " + esc(job.getCompany()) + "\n"
                + "📍 " + esc(job.getLocation()) + "\n"
                + (job.getPostedAt() != null ? "⏰ " + esc(job.getPostedAt()) + "\n" : "")
                + applicantsLine
                + "⭐ Puan: *" + job.getScore() + "/100*\n\n"
                + "🧠 " + esc(job.getSummary() == null ? "" : job.getSummary()) + "\n"
                + "✅ " + keywords + "\n"
                + "🔗 [İlana git](" + job.getUrl() + ")";
    }

    private String formatSummary(int scanned, int newCount, int sent) {
        return "✅ *Tarama tamamlandı*\n"
                + "Taranan: *" + scanned + "* | Yeni: *" + newCount + "* | Gönderilen: *" + sent + "*";
    }

    /** Telegram Markdown'da ozel karakterleri kacir. */
    private String esc(String text) {
        if (text == null) return "";
        return text.replace("_", "\\_")
                .replace("*", "\\*")
                .replace("[", "\\[")
                .replace("`", "\\`");
    }
}
