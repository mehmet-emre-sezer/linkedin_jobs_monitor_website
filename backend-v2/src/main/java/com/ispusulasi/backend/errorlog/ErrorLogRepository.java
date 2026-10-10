package com.ispusulasi.backend.errorlog;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface ErrorLogRepository extends JpaRepository<ErrorLog, Integer> {

    /** En son 100 hata (admin listesi). */
    List<ErrorLog> findTop100ByOrderByTimestampDesc();

    /** Son 24 saatteki hata sayisi (overview). */
    long countByTimestampAfter(LocalDateTime threshold);
}
