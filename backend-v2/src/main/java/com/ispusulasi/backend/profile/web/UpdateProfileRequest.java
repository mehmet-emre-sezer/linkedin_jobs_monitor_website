package com.ispusulasi.backend.profile.web;

import java.util.List;

public record UpdateProfileRequest(
        String name,
        String university,
        Integer graduationYear,
        String workMode,
        List<String> skills,
        List<String> targetRoles,
        List<String> targetLevels,
        List<String> searchLocations
) {}
