package com.ispusulasi.backend.scan;

import com.ispusulasi.backend.profile.ProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Periyodik tarama tetikleyici (eski Celery Beat + schedule.py karsiligi).
 * Her aksam, taranabilir kullanicilari SIRAYLA tarar -> LinkedIn ban riski dusuk.
 */
@Component
public class ScanScheduler {

    private static final Logger log = LoggerFactory.getLogger(ScanScheduler.class);

    private final ProfileRepository profileRepository;
    private final UserScanService userScanService;

    public ScanScheduler(ProfileRepository profileRepository, UserScanService userScanService) {
        this.profileRepository = profileRepository;
        this.userScanService = userScanService;
    }

    @Scheduled(cron = "${app.scan.cron}")
    public void runDailyScans() {
        List<Integer> userIds = profileRepository.findScannableUserIds();
        log.info("Gunluk tarama basladi: {} kullanici", userIds.size());

        for (Integer userId : userIds) {
            try {
                userScanService.scanUser(userId);
            } catch (Exception e) {
                // Bir kullanici patlarsa digerleri devam etsin
                log.error("Kullanici taramasi basarisiz user_id={}: {}", userId, e.getMessage());
            }
        }

        log.info("Gunluk tarama bitti: {} kullanici islendi", userIds.size());
    }
}
