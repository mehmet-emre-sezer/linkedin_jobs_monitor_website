package com.ispusulasi.backend.user.web;

import java.time.LocalDateTime;

public record UserResponse(
        Integer id,
        String email,
        boolean emailVerified,
        boolean admin,
        LocalDateTime createdAt
) {}