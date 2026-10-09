package com.ispusulasi.backend.admin.web;

public record AdminOverview(
        long totalUsers,
        long verifiedUsers,
        long totalJobs,
        long totalScans
) {}
