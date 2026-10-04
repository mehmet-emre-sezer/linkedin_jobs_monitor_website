package com.ispusulasi.backend.job;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Collection;
import java.util.List;

public interface JobRepository extends JpaRepository<Job, Integer> {
    List<Job> findByUserIdOrderByScoreDescCreatedAtDesc(Integer userId);

    List<Job> findByUserIdAndLinkedinIdIn(Integer userId, Collection<String> linkedinIds);
}
