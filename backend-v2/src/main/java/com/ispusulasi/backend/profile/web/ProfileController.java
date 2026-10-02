package com.ispusulasi.backend.profile.web;

import com.ispusulasi.backend.profile.ProfileService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/me")
    public ProfileResponse myProfile(Authentication authentication) {
        return profileService.getByUserEmail(authentication.getName());
    }

    @PutMapping("/me")
    public ProfileResponse updateMyProfile(Authentication authentication,
                                           @RequestBody UpdateProfileRequest request) {
        return profileService.updateByUserEmail(authentication.getName(), request);
    }
}
