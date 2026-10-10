package com.ispusulasi.backend.admin.web;

import java.time.LocalDateTime;
import java.util.List;

/** Admin kullanici detayi: hesap + profil + is istatistikleri. */
public record AdminUserDetail(
        Integer id,
        String email,
        String name,
        LocalDateTime createdAt,
        LocalDateTime lastSeenAt,
        String subscription,
        String university,
        Integer graduationYear,
        List<String> skills,
        String telegramChatId,
        long totalJobsScanned,
        long totalJobsSent,
        int averageScore
) {}
