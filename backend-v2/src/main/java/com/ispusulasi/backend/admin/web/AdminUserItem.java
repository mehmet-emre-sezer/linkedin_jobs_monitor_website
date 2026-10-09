package com.ispusulasi.backend.admin.web;

import java.time.LocalDateTime;

public record AdminUserItem(
        Integer id,
        String email,
        boolean emailVerified,
        boolean admin,
        LocalDateTime createdAt,
        boolean hasProfile,
        boolean telegramConnected
) {}
