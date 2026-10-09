package com.ispusulasi.backend.dashboard;

import com.ispusulasi.backend.common.error.NotFoundException;
import com.ispusulasi.backend.dashboard.web.DashboardSummary;
import com.ispusulasi.backend.job.JobRepository;
import com.ispusulasi.backend.profile.Profile;
import com.ispusulasi.backend.profile.ProfileRepository;
import com.ispusulasi.backend.scanrun.ScanRunRepository;
import com.ispusulasi.backend.user.User;
import com.ispusulasi.backend.user.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class DashboardService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final ScanRunRepository scanRunRepository;
    private final JobRepository jobRepository;
    private final String nextScanAt;

    public DashboardService(UserRepository userRepository,
                            ProfileRepository profileRepository,
                            ScanRunRepository scanRunRepository,
                            JobRepository jobRepository,
                            @Value("${app.scan.next-scan-at}") String nextScanAt) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.scanRunRepository = scanRunRepository;
        this.jobRepository = jobRepository;
        this.nextScanAt = nextScanAt;
    }

    public DashboardSummary getSummary(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Kullanıcı bulunamadı: " + email));
        Integer userId = user.getId();

        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        int scannedThisWeek = scanRunRepository.sumScannedSince(userId, weekAgo);
        int sentThisWeek = scanRunRepository.sumSentSince(userId, weekAgo);

        int averageScore = (int) Math.round(jobRepository.averageScore(userId));
        int maxScore = jobRepository.maxScore(userId);

        Profile profile = profileRepository.findByUserId(userId).orElse(null);
        boolean telegramConnected = profile != null
                && profile.getTelegramChatId() != null
                && !profile.getTelegramChatId().isBlank();

        return new DashboardSummary(
                scannedThisWeek, sentThisWeek, averageScore, maxScore, nextScanAt, telegramConnected);
    }
}
