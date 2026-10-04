package com.ispusulasi.backend.scan;

import com.ispusulasi.backend.job.Job;
import com.ispusulasi.backend.job.JobRepository;
import com.ispusulasi.backend.profile.Profile;
import com.ispusulasi.backend.profile.ProfileRepository;
import com.ispusulasi.backend.scanrun.ScanRun;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
class UserScanServiceIT {

    @Autowired
    UserScanService scanService;
    @Autowired
    ProfileRepository profileRepository;
    @Autowired
    JobRepository jobRepository;

    @Test
    void uctan_uca_tarama_kaydeder() {
        // Test icin kankam (user 13) profilini daralt -> az istek (1 sorgu x 1 lokasyon)
        Profile p = profileRepository.findByUserId(13).orElseThrow();
        p.setTargetRoles(List.of("Python Developer"));
        p.setTargetLevels(List.of("Junior"));
        p.setSearchLocations(List.of("Turkey"));
        p.setUpdatedAt(LocalDateTime.now());
        profileRepository.save(p);

        ScanRun run = scanService.scanUser(13);

        System.out.printf(">>> ScanRun: status=%s scanned=%d new=%d matched=%d%n",
                run.getStatus(), run.getJobsScanned(), run.getJobsNew(), run.getJobsSent());

        List<Job> jobs = jobRepository.findByUserIdOrderByScoreDescCreatedAtDesc(13);
        jobs.stream().limit(6).forEach(j -> System.out.printf(
                " - [skor %d] %s @ %s | %s%n",
                j.getScore(), j.getTitle(), j.getCompany(), j.getLocation()));

        assertEquals("completed", run.getStatus());
    }
}
