package com.ispusulasi.backend.cv;

import java.util.List;

/** CV metninin LLM analizi sonucu (eski ParsedCv karsiligi). */
public record CvAnalysisResult(
        String profileSummary,
        String name,
        String university,
        Integer graduationYear,
        List<String> skills,
        List<String> queries
) {}
