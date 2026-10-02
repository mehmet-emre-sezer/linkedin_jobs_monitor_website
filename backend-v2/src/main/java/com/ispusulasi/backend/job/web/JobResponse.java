package com.ispusulasi.backend.job.web;

import java.time.LocalDateTime;
import java.util.List;

public record JobResponse(
        Integer id,
        String linkedinId,
        String title,
        String company,
        String location,
        String postedAt,
        Integer applicants,
        int score,
        String summary,
        List<String> matchedKeywords,
        String url,
        LocalDateTime createdAt
) {}
