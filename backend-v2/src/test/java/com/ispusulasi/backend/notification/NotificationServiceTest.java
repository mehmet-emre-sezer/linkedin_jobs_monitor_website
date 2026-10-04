package com.ispusulasi.backend.notification;

import com.ispusulasi.backend.common.telegram.TelegramClient;
import com.ispusulasi.backend.job.Job;
import com.ispusulasi.backend.profile.Profile;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class NotificationServiceTest {

    // Token bos -> TelegramClient mock modda (konsola yazar, gercek istek atmaz)
    private final NotificationService service = new NotificationService(new TelegramClient(""));

    @Test
    void chat_id_varsa_gonderir() {
        Profile profile = new Profile();
        profile.setUserId(1);
        profile.setTelegramChatId("123456");

        assertTrue(service.sendJobNotification(profile, sampleJob()));
    }

    @Test
    void chat_id_yoksa_gondermez() {
        Profile profile = new Profile();
        profile.setUserId(1);
        // telegramChatId null

        assertFalse(service.sendJobNotification(profile, sampleJob()));
    }

    private Job sampleJob() {
        Job job = new Job();
        job.setTitle("Junior Backend Developer");
        job.setCompany("Trendyol");
        job.setLocation("İstanbul");
        job.setScore(88);
        job.setSummary("Python ve SQL uyumlu, junior pozisyon");
        job.setMatchedKeywords(List.of("Python", "SQL"));
        job.setApplicants(26);
        job.setUrl("https://linkedin.com/jobs/123");
        return job;
    }
}
