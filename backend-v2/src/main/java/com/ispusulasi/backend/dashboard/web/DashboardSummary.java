package com.ispusulasi.backend.dashboard.web;

public record DashboardSummary(
        int scannedThisWeek,
        int sentThisWeek,
        int averageScore,
        int maxScore,
        String nextScanAt,
        boolean telegramConnected
) {}
