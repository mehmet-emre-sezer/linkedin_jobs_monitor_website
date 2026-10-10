package com.ispusulasi.backend.admin.web;

import java.time.LocalDateTime;

public record AdminUserItem(
        Integer id,
        String email,
        String name,
        boolean emailVerified,
        boolean admin,
        LocalDateTime createdAt,
        LocalDateTime lastSeenAt,
        String subscription,
        boolean hasProfile,
        boolean telegramConnected
) {}
