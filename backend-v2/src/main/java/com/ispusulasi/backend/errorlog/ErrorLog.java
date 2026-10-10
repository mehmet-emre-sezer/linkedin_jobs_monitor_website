package com.ispusulasi.backend.errorlog;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/** Sistem hatasi kaydi (tarama/skorlama/telegram vb.) — admin panelinde gosterilir. */
@Entity
@Table(name = "error_logs")
public class ErrorLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    /** error | warning | info */
    @Column(nullable = false)
    private String severity;

    /** scraper | scorer | telegram | database | auth */
    @Column(nullable = false)
    private String source;

    /** Sistemsel hata ise null. */
    @Column(name = "user_id")
    private Integer userId;

    @Column(nullable = false, length = 1000)
    private String message;

    @Column(name = "stack_trace", columnDefinition = "text")
    private String stackTrace;

    protected ErrorLog() {} // JPA

    public ErrorLog(LocalDateTime timestamp, String severity, String source,
                    Integer userId, String message, String stackTrace) {
        this.timestamp = timestamp;
        this.severity = severity;
        this.source = source;
        this.userId = userId;
        this.message = message;
        this.stackTrace = stackTrace;
    }

    public Integer getId() { return id; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public String getSeverity() { return severity; }
    public String getSource() { return source; }
    public Integer getUserId() { return userId; }
    public String getMessage() { return message; }
    public String getStackTrace() { return stackTrace; }
}
