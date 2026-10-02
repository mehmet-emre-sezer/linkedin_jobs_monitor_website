package com.ispusulasi.backend.profile;

import com.ispusulasi.backend.common.error.NotFoundException;
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

    public ProfileService(ProfileRepository profileRepository, UserRepository userRepository) {
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
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
