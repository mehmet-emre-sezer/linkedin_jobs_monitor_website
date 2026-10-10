package com.ispusulasi.backend.errorlog;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.time.LocalDateTime;

/** Hata kayitlarini DB'ye yazar. Kayit basarisiz olsa bile ana akisi ASLA bozmaz. */
@Service
public class ErrorLogService {

    private static final Logger log = LoggerFactory.getLogger(ErrorLogService.class);
    private static final int MAX_MESSAGE = 1000;
    private static final int MAX_STACK = 8000;

    private final ErrorLogRepository repository;

    public ErrorLogService(ErrorLogRepository repository) {
        this.repository = repository;
    }

    public void record(String severity, String source, Integer userId, String message, Throwable cause) {
        try {
            repository.save(new ErrorLog(
                    LocalDateTime.now(),
                    severity,
                    source,
                    userId,
                    truncate(message == null ? "(mesaj yok)" : message, MAX_MESSAGE),
                    cause == null ? null : truncate(stackToString(cause), MAX_STACK)));
        } catch (Exception e) {
            // Hata loglamanin kendisi patlarsa sadece konsola yaz, akisi bozma.
            log.warn("Hata kaydedilemedi: {}", e.getMessage());
        }
    }

    private static String truncate(String s, int max) {
        return s.length() <= max ? s : s.substring(0, max);
    }

    private static String stackToString(Throwable t) {
        StringWriter sw = new StringWriter();
        t.printStackTrace(new PrintWriter(sw));
        return sw.toString();
    }
}
