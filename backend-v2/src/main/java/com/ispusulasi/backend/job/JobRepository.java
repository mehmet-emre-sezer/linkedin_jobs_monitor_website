package com.ispusulasi.backend.job;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface JobRepository extends JpaRepository<Job, Integer> {
    List<Job> findByUserIdOrderByScoreDescCreatedAtDesc(Integer userId);

    List<Job> findByUserIdAndLinkedinIdIn(Integer userId, Collection<String> linkedinIds);

    @Query("SELECT COALESCE(AVG(j.score), 0) FROM Job j WHERE j.userId = :userId")
    double averageScore(@Param("userId") Integer userId);

    @Query("SELECT COALESCE(MAX(j.score), 0) FROM Job j WHERE j.userId = :userId")
    int maxScore(@Param("userId") Integer userId);

    /** Kullaniciya ait toplam eslesen ilan sayisi (admin detay). */
    long countByUserId(Integer userId);

    /** Kullaniciya gonderilen (Telegram) ilan sayisi (admin detay). */
    long countByUserIdAndSentAtIsNotNull(Integer userId);
}
