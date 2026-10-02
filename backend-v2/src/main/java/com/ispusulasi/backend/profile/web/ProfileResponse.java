package com.ispusulasi.backend.profile.web;

import java.time.LocalDateTime;
import java.util.List;

public record ProfileResponse(
        Integer id,
        Integer userId,
        String name,
        String university,
        Integer graduationYear,
        String cvFilename,
        boolean onboardingCompleted,
        String workMode,
        List<String> skills,
        List<String> targetRoles,
        List<String> targetLevels,
        List<String> searchLocations,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
