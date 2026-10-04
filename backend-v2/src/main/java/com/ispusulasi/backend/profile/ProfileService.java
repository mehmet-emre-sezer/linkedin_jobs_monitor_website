package com.ispusulasi.backend.profile;

import com.ispusulasi.backend.common.error.NotFoundException;
import com.ispusulasi.backend.cv.CvAnalysisResult;
import com.ispusulasi.backend.cv.CvAnalysisService;
import com.ispusulasi.backend.cv.CvTextExtractor;
import com.ispusulasi.backend.profile.web.ProfileResponse;
import com.ispusulasi.backend.profile.web.UpdateProfileRequest;
import com.ispusulasi.backend.user.User;
import com.ispusulasi.backend.user.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final CvTextExtractor cvTextExtractor;
    private final CvAnalysisService cvAnalysisService;

    public ProfileService(ProfileRepository profileRepository,
                          UserRepository userRepository,
                          CvTextExtractor cvTextExtractor,
                          CvAnalysisService cvAnalysisService) {
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
        this.cvTextExtractor = cvTextExtractor;
        this.cvAnalysisService = cvAnalysisService;
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

        profile.setName(request.name());
        profile.setUniversity(request.university());
        profile.setGraduationYear(request.graduationYear());
        profile.setWorkMode(request.workMode() != null ? request.workMode() : "any");
        profile.setSkills(orEmpty(request.skills()));
        profile.setTargetRoles(orEmpty(request.targetRoles()));
        profile.setTargetLevels(orEmpty(request.targetLevels()));
        profile.setSearchLocations(orEmpty(request.searchLocations()));
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
