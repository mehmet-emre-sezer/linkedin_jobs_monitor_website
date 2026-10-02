package com.ispusulasi.backend.scanrun;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ScanRunRepository extends JpaRepository<ScanRun, Integer> {
    List<ScanRun> findByUserIdOrderByStartedAtDesc(Integer userId);
}
