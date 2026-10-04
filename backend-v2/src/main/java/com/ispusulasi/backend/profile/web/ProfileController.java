package com.ispusulasi.backend.profile.web;

import com.ispusulasi.backend.profile.ProfileService;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private static final long MAX_CV_BYTES = 10 * 1024 * 1024; // 10 MB

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

    @PostMapping(value = "/cv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ProfileResponse uploadCv(Authentication authentication,
                                    @RequestParam("file") MultipartFile file) throws IOException {
        validatePdf(file);
        return profileService.applyCv(
                authentication.getName(), file.getOriginalFilename(), file.getBytes());
    }

    private void validatePdf(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Dosya boş");
        }
        if (file.getSize() > MAX_CV_BYTES) {
            throw new IllegalArgumentException("Dosya 10MB'tan büyük olamaz");
        }
        String name = file.getOriginalFilename();
        if (name == null || !name.toLowerCase().endsWith(".pdf")) {
            throw new IllegalArgumentException("Sadece PDF dosyası kabul edilir");
        }
    }
}
