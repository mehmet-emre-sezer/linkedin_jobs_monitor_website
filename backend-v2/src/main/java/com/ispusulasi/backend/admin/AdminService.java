package com.ispusulasi.backend.admin;

import com.ispusulasi.backend.admin.web.AdminErrorLog;
import com.ispusulasi.backend.admin.web.AdminOverview;
import com.ispusulasi.backend.admin.web.AdminUserDetail;
import com.ispusulasi.backend.admin.web.AdminUserItem;
import com.ispusulasi.backend.admin.web.FunnelStep;
import com.ispusulasi.backend.common.error.ForbiddenException;
import com.ispusulasi.backend.common.error.NotFoundException;
import com.ispusulasi.backend.errorlog.ErrorLogRepository;
import com.ispusulasi.backend.job.JobRepository;
import com.ispusulasi.backend.profile.Profile;
import com.ispusulasi.backend.profile.ProfileRepository;
import com.ispusulasi.backend.scan.UserScanService;
import com.ispusulasi.backend.user.User;
import com.ispusulasi.backend.user.UserRepository;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final JobRepository jobRepository;
    private final UserScanService userScanService;
    private final ErrorLogRepository errorLogRepository;

    public AdminService(UserRepository userRepository,
                        ProfileRepository profileRepository,
                        JobRepository jobRepository,
                        UserScanService userScanService,
                        ErrorLogRepository errorLogRepository) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.jobRepository = jobRepository;
        this.userScanService = userScanService;
        this.errorLogRepository = errorLogRepository;
    }

    /** Cagiran kullanici admin degilse 403. */
    public void requireAdmin(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Kullanıcı bulunamadı: " + email));
        if (!user.isAdmin()) {
            throw new ForbiddenException("Bu işlem için yetkiniz yok");
        }
    }

    /** Aktif sayilmak icin kullanicinin son gorulme suresi (gun). */
    private static final int ACTIVE_WINDOW_DAYS = 7;

    public AdminOverview getOverview() {
        long activeUsers = userRepository.countByLastSeenAtAfter(
                LocalDateTime.now().minusDays(ACTIVE_WINDOW_DAYS));
        long registeredToday = userRepository.countByCreatedAtAfter(
                LocalDate.now().atStartOfDay());
        long errorsLast24h = errorLogRepository.countByTimestampAfter(
                LocalDateTime.now().minusHours(24));
        return new AdminOverview(
                userRepository.count(),
                activeUsers,
                registeredToday,
                errorsLast24h);
    }

    /** Kayit -> dogrulama -> onboarding -> Telegram donusum hunisi. */
    public List<FunnelStep> getFunnel() {
        return List.of(
                new FunnelStep("Kayıt oldu", userRepository.count()),
                new FunnelStep("E-posta doğruladı", userRepository.countByEmailVerifiedTrue()),
                new FunnelStep("Onboarding bitirdi", profileRepository.countByOnboardingCompletedTrue()),
                new FunnelStep("Telegram bağladı", profileRepository.countByTelegramChatIdIsNotNull()));
    }

    public AdminUserDetail getUserDetail(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Kullanıcı bulunamadı: " + userId));
        Profile profile = profileRepository.findByUserId(userId).orElse(null);
        long totalScanned = jobRepository.countByUserId(userId);
        long totalSent = jobRepository.countByUserIdAndSentAtIsNotNull(userId);
        int averageScore = (int) Math.round(jobRepository.averageScore(userId));
        return new AdminUserDetail(
                user.getId(),
                user.getEmail(),
                profile != null ? profile.getName() : null,
                user.getCreatedAt(),
                user.getLastSeenAt(),
                user.getSubscription(),
                profile != null ? profile.getUniversity() : null,
                profile != null ? profile.getGraduationYear() : null,
                profile != null ? profile.getSkills() : List.of(),
                profile != null ? profile.getTelegramChatId() : null,
                totalScanned,
                totalSent,
                averageScore);
    }

    /** En son 100 hata kaydi (admin). */
    public List<AdminErrorLog> getErrors() {
        return errorLogRepository.findTop100ByOrderByTimestampDesc().stream()
                .map(e -> new AdminErrorLog(
                        e.getId(), e.getTimestamp(), e.getSeverity(), e.getSource(),
                        e.getUserId(), e.getMessage(), e.getStackTrace()))
                .toList();
    }

    public List<AdminUserItem> listUsers() {
        return userRepository.findAll(Sort.by(Sort.Direction.DESC, "id")).stream()
                .map(this::toItem)
                .toList();
    }

    /** Beat'i beklemeden bir kullaniciyi hemen tara (arka planda). */
    @Async
    public void triggerScan(Integer userId) {
        userScanService.scanUser(userId);
    }

    public boolean userExists(Integer userId) {
        return userRepository.existsById(userId);
    }

    private AdminUserItem toItem(User user) {
        Profile profile = profileRepository.findByUserId(user.getId()).orElse(null);
        boolean telegramConnected = profile != null
                && profile.getTelegramChatId() != null
                && !profile.getTelegramChatId().isBlank();
        String name = profile != null ? profile.getName() : null;
        return new AdminUserItem(
                user.getId(), user.getEmail(), name, user.isEmailVerified(), user.isAdmin(),
                user.getCreatedAt(), user.getLastSeenAt(), user.getSubscription(),
                profile != null, telegramConnected);
    }
}
