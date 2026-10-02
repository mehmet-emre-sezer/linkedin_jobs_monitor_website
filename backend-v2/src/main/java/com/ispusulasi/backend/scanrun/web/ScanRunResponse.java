package com.ispusulasi.backend.scanrun.web;

import java.time.LocalDateTime;

public record ScanRunResponse(
        Integer id,
        LocalDateTime startedAt,
        LocalDateTime finishedAt,
        String status,
        int jobsScanned,
        int jobsNew,
        int jobsSent
) {}
