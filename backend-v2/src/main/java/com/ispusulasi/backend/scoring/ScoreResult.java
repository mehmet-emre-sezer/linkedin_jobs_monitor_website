package com.ispusulasi.backend.scoring;

import java.util.List;

public record ScoreResult(
        int score,
        String reason,
        List<String> matches,
        List<String> mismatches
) {}
