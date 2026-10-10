package com.ispusulasi.backend.admin.web;

import java.time.LocalDateTime;

/** Admin panelinde gosterilen hata kaydi. */
public record AdminErrorLog(
        Integer id,
        LocalDateTime timestamp,
        String severity,
        String source,
        Integer userId,
        String message,
        String stackTrace
) {}
