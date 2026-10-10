package com.ispusulasi.backend.admin.web;

public record AdminOverview(
        long totalUsers,
        long activeUsers,
        long registeredToday,
        long errorsLast24h
) {}
