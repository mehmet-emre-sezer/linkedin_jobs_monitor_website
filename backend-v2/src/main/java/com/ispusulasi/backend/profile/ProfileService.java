package com.ispusulasi.backend.profile;

import com.ispusulasi.backend.common.error.NotFoundException;
import com.ispusulasi.backend.cv.CvAnalysisResult;
import com.ispusulasi.backend.cv.CvAnalysisService;
import com.ispusulasi.backend.cv.CvTextExtractor;
import com.ispusulasi.backend.profile.web.ProfileResponse;
import com.ispusulasi.backend.profile.web.UpdateProfileRequest;
import com.ispusulasi.backend.user.User;
import com.ispusulasi.backend.user.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.List;

@Service
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final CvTextExtractor cvTextExtractor;
    private final CvAnalysisService cvAnalysisService;
    private final String telegramBotUsername;
    private final long telegramLinkExpireMinutes;

    public ProfileService(ProfileRepository profileRepository,
                          UserRepository userRepository,
                          CvTextExtractor cvTextExtractor,
                          CvAnalysisService cvAnalysisService,
                          @Value("${app.telegram.bot-username}") String telegramBotUsername,
                          @Value("${app.telegram.link-expire-minutes}") long telegramLinkExpireMinutes) {
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
        this.cvTextExtractor = cvTextExtractor;
        this.cvAnalysisService = cvAnalysisService;
        this.telegramBotUsername = telegramBotUsername;
        this.telegramLinkExpireMinutes = telegramLinkExpireMinutes;
    }

    /** Onboarding'i tamamlandi olarak isaretle. */
    public ProfileResponse completeOnboarding(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Kullanıcı bulunamadı: " + email));
        Profile profile = profileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new NotFoundException("Bu kullanıcının profili yok"));

        profile.setOnboardingCompleted(true);
        profile.setUpdatedAt(LocalDateTime.now());
        return toResponse(profileRepository.save(profile));
    }

    /** Kullanici icin Telegram deep link uret: kisa opak token + t.me linki. */
    public String createTelegramLink(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Kullanıcı bulunamadı: " + email));

        Profile profile = profileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Profile created = new Profile();
                    created.setUserId(user.getId());
                    created.setOnboardingCompleted(false);
                    created.setWorkMode("any");
                    created.setCreatedAt(LocalDateTime.now());
                    return created;
                });

        String token = generateLinkToken();
        profile.setTelegramLinkToken(token);
        profile.setTelegramLinkExpiresAt(Instant.now().plus(telegramLinkExpireMinutes, ChronoUnit.MINUTES));
        profile.setUpdatedAt(LocalDateTime.now());
        profileRepository.save(profile);

        return "https://t.me/" + telegramBotUsername + "?start=" + token;
    }

    /** Bot'tan gelen /start <token> ile chat_id'yi profile'a kaydet (tek kullanimlik). */
    public void linkTelegramChat(String linkToken, String chatId) {
        Profile profile = profileRepository.findByTelegramLinkToken(linkToken)
                .orElseThrow(() -> new IllegalArgumentException("Geçersiz bağlantı"));

        Instant expiresAt = profile.getTelegramLinkExpiresAt();
        if (expiresAt == null || expiresAt.isBefore(Instant.now())) {
            throw new IllegalArgumentException("Bağlantının süresi dolmuş");
        }

        profile.setTelegramChatId(chatId);
        profile.setTelegramLinkToken(null);       // token tek kullanimlik
        profile.setTelegramLinkExpiresAt(null);
        profile.setUpdatedAt(LocalDateTime.now());
        profileRepository.save(profile);
    }

    private String generateLinkToken() {
        byte[] bytes = new byte[24];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    /** CV yukle: PDF'ten metin cikar -> Gemini ile analiz et -> Profile'i doldur. */
    public ProfileResponse applyCv(String email, String filename, byte[] pdfBytes) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Kullanıcı bulunamadı: " + email));

        String cvText = cvTextExtractor.extractText(pdfBytes);
        CvAnalysisResult analysis = cvAnalysisService.analyze(cvText);

        Profile profile = profileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Profile created = new Profile();
                    created.setUserId(user.getId());
                    created.setOnboardingCompleted(false);
                    created.setWorkMode("any");
                    created.setCreatedAt(LocalDateTime.now());
                    return created;
                });

        profile.setCvFilename(filename);
        profile.setCvText(analysis.profileSummary());
        if (analysis.name() != null) profile.setName(analysis.name());
        if (analysis.university() != null) profile.setUniversity(analysis.university());
        if (analysis.graduationYear() != null) profile.setGraduationYear(analysis.graduationYear());
        if (!analysis.skills().isEmpty()) profile.setSkills(analysis.skills());
        profile.setUpdatedAt(LocalDateTime.now());

        return toResponse(profileRepository.save(profile));
    }

    public ProfileResponse getByUserEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Kullanıcı bulunamadı: " + email));

        Profile profile = profileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new NotFoundException("Bu kullanıcının profili yok"));

        return toResponse(profile);
    }

    public ProfileResponse updateByUserEmail(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Kullanıcı bulunamadı: " + email));

        // Profil varsa onu guncelle, yoksa yeni olustur (upsert)
        Profile profile = profileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Profile created = new Profile();
                    created.setUserId(user.getId());
                    created.setOnboardingCompleted(false);
                    created.setCreatedAt(LocalDateTime.now());
                    return created;
                });

        // Kismi guncelleme: sadece gonderilen (null olmayan) alanlari degistir.
        // Boylece frontend basic / skills / search-preferences'i ayri ayri gonderebilir.
        if (request.name() != null) profile.setName(request.name());
        if (request.university() != null) profile.setUniversity(request.university());
        if (request.graduationYear() != null) profile.setGraduationYear(request.graduationYear());
        if (request.workMode() != null) profile.setWorkMode(request.workMode());
        if (request.skills() != null) profile.setSkills(request.skills());
        if (request.targetRoles() != null) profile.setTargetRoles(request.targetRoles());
        if (request.targetLevels() != null) profile.setTargetLevels(request.targetLevels());
        if (request.searchLocations() != null) profile.setSearchLocations(request.searchLocations());
        profile.setUpdatedAt(LocalDateTime.now());

        Profile saved = profileRepository.save(profile);
        return toResponse(saved);
    }

    private List<String> orEmpty(List<String> value) {
        return value != null ? value : List.of();
    }

    private ProfileResponse toResponse(Profile p) {
        return new ProfileResponse(
                p.getId(),
                p.getUserId(),
                p.getName(),
                p.getUniversity(),
                p.getGraduationYear(),
                p.getCvFilename(),
                p.isOnboardingCompleted(),
                p.getWorkMode(),
                p.getSkills(),
                p.getTargetRoles(),
                p.getTargetLevels(),
                p.getSearchLocations(),
                p.getCreatedAt(),
                p.getUpdatedAt()
        );
    }
}
