package com.ispusulasi.backend.admin;

import com.ispusulasi.backend.admin.web.AdminOverview;
import com.ispusulasi.backend.admin.web.AdminUserItem;
import com.ispusulasi.backend.common.error.ForbiddenException;
import com.ispusulasi.backend.common.error.NotFoundException;
import com.ispusulasi.backend.job.JobRepository;
import com.ispusulasi.backend.profile.Profile;
import com.ispusulasi.backend.profile.ProfileRepository;
import com.ispusulasi.backend.scan.UserScanService;
import com.ispusulasi.backend.scanrun.ScanRunRepository;
import com.ispusulasi.backend.user.User;
import com.ispusulasi.backend.user.UserRepository;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final JobRepository jobRepository;
    private final ScanRunRepository scanRunRepository;
    private final UserScanService userScanService;

    public AdminService(UserRepository userRepository,
                        ProfileRepository profileRepository,
                        JobRepository jobRepository,
                        ScanRunRepository scanRunRepository,
                        UserScanService userScanService) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.jobRepository = jobRepository;
        this.scanRunRepository = scanRunRepository;
        this.userScanService = userScanService;
    }

    /** Cagiran kullanici admin degilse 403. */
    public void requireAdmin(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Kullanıcı bulunamadı: " + email));
        if (!user.isAdmin()) {
            throw new ForbiddenException("Bu işlem için yetkiniz yok");
        }
    }

    public AdminOverview getOverview() {
        return new AdminOverview(
                userRepository.count(),
                userRepository.countByEmailVerifiedTrue(),
                jobRepository.count(),
                scanRunRepository.count());
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
        return new AdminUserItem(
                user.getId(), user.getEmail(), user.isEmailVerified(), user.isAdmin(),
                user.getCreatedAt(), profile != null, telegramConnected);
    }
}
