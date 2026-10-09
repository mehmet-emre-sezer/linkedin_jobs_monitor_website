package com.ispusulasi.backend.profile;

import com.ispusulasi.backend.profile.web.ProfileResponse;
import com.ispusulasi.backend.profile.web.UpdateProfileRequest;
import com.ispusulasi.backend.user.User;
import com.ispusulasi.backend.user.UserRepository;
import com.ispusulasi.backend.user.UserService;
import com.ispusulasi.backend.user.web.RegisterRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class OnboardingAndDeleteIT {

    @Autowired UserService userService;
    @Autowired ProfileService profileService;
    @Autowired UserRepository userRepository;
    @Autowired ProfileRepository profileRepository;

    @Test
    void onboarding_tamamla_ve_hesap_sil_cascade() {
        String email = "del_" + System.currentTimeMillis() + "@test.com";
        userService.register(new RegisterRequest(email, "parola12345"));
        User user = userRepository.findByEmail(email).orElseThrow();

        // Profil olustur (PUT ile upsert)
        profileService.updateByUserEmail(email, new UpdateProfileRequest(
                "Test User", "ITU", 2025, "remote",
                List.of("Java"), List.of("Backend Developer"), List.of("Junior"), List.of("İstanbul")));

        // Onboarding tamamla
        ProfileResponse p = profileService.completeOnboarding(email);
        assertTrue(p.onboardingCompleted(), "onboarding tamamlandi olmaliydi");

        // Hesap sil -> user gider, profil de cascade ile gider
        userService.deleteAccount(email);
        assertTrue(userRepository.findByEmail(email).isEmpty(), "user silinmeliydi");
        assertTrue(profileRepository.findByUserId(user.getId()).isEmpty(), "profil cascade ile silinmeliydi");
    }
}
