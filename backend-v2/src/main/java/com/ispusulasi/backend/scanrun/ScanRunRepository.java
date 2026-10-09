package com.ispusulasi.backend.scanrun;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ScanRunRepository extends JpaRepository<ScanRun, Integer> {
    List<ScanRun> findByUserIdOrderByStartedAtDesc(Integer userId);

    @Query("SELECT COALESCE(SUM(s.jobsScanned), 0) FROM ScanRun s WHERE s.userId = :userId AND s.startedAt >= :since")
    int sumScannedSince(@Param("userId") Integer userId, @Param("since") LocalDateTime since);

    @Query("SELECT COALESCE(SUM(s.jobsSent), 0) FROM ScanRun s WHERE s.userId = :userId AND s.startedAt >= :since")
    int sumSentSince(@Param("userId") Integer userId, @Param("since") LocalDateTime since);
}
