package com.ispusulasi.backend.scan;

import com.ispusulasi.backend.errorlog.ErrorLogService;
import com.ispusulasi.backend.job.Job;
import com.ispusulasi.backend.job.JobRepository;
import com.ispusulasi.backend.notification.NotificationService;
import com.ispusulasi.backend.profile.Profile;
import com.ispusulasi.backend.profile.ProfileRepository;
import com.ispusulasi.backend.scanrun.ScanRun;
import com.ispusulasi.backend.scanrun.ScanRunRepository;
import com.ispusulasi.backend.scoring.JobScoringService;
import com.ispusulasi.backend.scoring.ScoreResult;
import com.ispusulasi.backend.scraper.LinkedInScraper;
import com.ispusulasi.backend.scraper.QueryBuilder;
import com.ispusulasi.backend.scraper.ScrapedJob;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Tek kullanici icin tarama akisi (eski scan_user.py karsiligi):
 * ScanRun olustur -> profil + sorgular -> LinkedIn tara -> dedupe ->
 * yeni ilanlari skorla + DB'ye yaz -> ScanRun bitir.
 * Telegram gonderimi adim 6'da eklenecek.
 */
@Service
public class UserScanService {

    private static final Logger log = LoggerFactory.getLogger(UserScanService.class);

    private final ProfileRepository profileRepository;
    private final JobRepository jobRepository;
    private final ScanRunRepository scanRunRepository;
    private final QueryBuilder queryBuilder;
    private final LinkedInScraper scraper;
    private final JobScoringService scoringService;
    private final NotificationService notificationService;
    private final ErrorLogService errorLogService;

    private final int scoreThreshold;
    private final int jobsPerQuery;

    public UserScanService(ProfileRepository profileRepository,
                           JobRepository jobRepository,
                           ScanRunRepository scanRunRepository,
                           QueryBuilder queryBuilder,
                           LinkedInScraper scraper,
                           JobScoringService scoringService,
                           NotificationService notificationService,
                           ErrorLogService errorLogService,
                           @Value("${app.scan.score-threshold}") int scoreThreshold,
                           @Value("${app.scan.jobs-per-query}") int jobsPerQuery) {
        this.profileRepository = profileRepository;
        this.jobRepository = jobRepository;
        this.scanRunRepository = scanRunRepository;
        this.queryBuilder = queryBuilder;
        this.scraper = scraper;
        this.scoringService = scoringService;
        this.notificationService = notificationService;
        this.errorLogService = errorLogService;
        this.scoreThreshold = scoreThreshold;
        this.jobsPerQuery = jobsPerQuery;
    }

    public ScanRun scanUser(Integer userId) {
        log.info("scanUser basladi user_id={}", userId);
        ScanRun run = createRun(userId);

        try {
            Profile profile = profileRepository.findByUserId(userId).orElse(null);
            if (profile == null) {
                log.warn("Tarama atlandi: profil yok (user_id={})", userId);
                return finishRun(run, "failed", 0, 0, 0);
            }

            List<String> queries = queryBuilder.buildQueries(
                    profile.getTargetRoles(), profile.getTargetLevels());
            if (queries.isEmpty()) {
                log.warn("Tarama atlandi: sorgu uretilemedi (user_id={})", userId);
                return finishRun(run, "failed", 0, 0, 0);
            }

            List<String> locations = profile.getSearchLocations();
            if (locations == null || locations.isEmpty()) {
                locations = List.of(""); // lokasyon yoksa global ara
            }

            List<ScrapedJob> all = scraper.scrapeJobs(queries, locations, jobsPerQuery);
            List<ScrapedJob> unique = dedupeByLinkedinId(all);
            List<ScrapedJob> newJobs = filterAlreadySeen(userId, unique);

            int sent = processJobs(profile, newJobs);

            notificationService.sendScanSummary(profile, unique.size(), newJobs.size(), sent);

            log.info("scanUser bitti user_id={} scanned={} new={} sent={}",
                    userId, unique.size(), newJobs.size(), sent);
            return finishRun(run, "completed", unique.size(), newJobs.size(), sent);

        } catch (Exception e) {
            log.error("Tarama hatasi user_id={}: {}", userId, e.getMessage());
            errorLogService.record("error", "scraper", userId,
                    "Tarama hatası: " + e.getMessage(), e);
            finishRun(run, "failed", 0, 0, 0);
            throw new RuntimeException("Tarama sirasinda hata", e);
        }
    }

    // ── yardimcilar ──────────────────────────────────────────────

    private ScanRun createRun(Integer userId) {
        ScanRun run = new ScanRun();
        run.setUserId(userId);
        run.setStatus("running");
        run.setStartedAt(LocalDateTime.now());
        run.setJobsScanned(0);
        run.setJobsNew(0);
        run.setJobsSent(0);
        return scanRunRepository.save(run);
    }

    private ScanRun finishRun(ScanRun run, String status, int scanned, int newJobs, int sent) {
        run.setStatus(status);
        run.setFinishedAt(LocalDateTime.now());
        run.setJobsScanned(scanned);
        run.setJobsNew(newJobs);
        run.setJobsSent(sent);
        return scanRunRepository.save(run);
    }

    /** Ayni linkedin_id birden cok sorguya dusmus olabilir; ilkini tut. */
    private List<ScrapedJob> dedupeByLinkedinId(List<ScrapedJob> jobs) {
        Map<String, ScrapedJob> byId = new LinkedHashMap<>();
        for (ScrapedJob job : jobs) {
            if (job.linkedinId() != null && !job.linkedinId().isEmpty()) {
                byId.putIfAbsent(job.linkedinId(), job);
            }
        }
        return new ArrayList<>(byId.values());
    }

    /** DB'de bu kullanici icin zaten kaydi olan ilanlari cikar. */
    private List<ScrapedJob> filterAlreadySeen(Integer userId, List<ScrapedJob> jobs) {
        if (jobs.isEmpty()) {
            return List.of();
        }
        List<String> ids = jobs.stream().map(ScrapedJob::linkedinId).toList();
        Set<String> existing = jobRepository.findByUserIdAndLinkedinIdIn(userId, ids).stream()
                .map(Job::getLinkedinId)
                .collect(Collectors.toSet());
        return jobs.stream().filter(j -> !existing.contains(j.linkedinId())).toList();
    }

    /** Her yeni ilani skorla, Job olarak kaydet, esik ustu olanlari Telegram'a gonder.
     *  Donus: gercekten gonderilen (sent) ilan sayisi. */
    private int processJobs(Profile profile, List<ScrapedJob> newJobs) {
        String candidateProfile = buildCandidateProfile(profile);
        int sentCount = 0;

        for (ScrapedJob job : newJobs) {
            ScoreResult score;
            try {
                score = scoringService.score(
                        candidateProfile, job.title(), job.company(), job.description());
            } catch (Exception e) {
                log.warn("Skorlama basarisiz, atlaniyor: {} ({})", job.title(), e.getMessage());
                continue; // bir sonraki taramada tekrar denensin (DB'ye yazma)
            }

            Job entity = new Job();
            entity.setUserId(profile.getUserId());
            entity.setLinkedinId(job.linkedinId());
            entity.setTitle(job.title());
            entity.setCompany(job.company());
            entity.setLocation(job.location());
            entity.setPostedAt(emptyToNull(job.postedAt()));
            entity.setApplicants(parseApplicants(job.applicants()));
            entity.setScore(score.score());
            entity.setSummary(score.reason());
            entity.setMatchedKeywords(score.matches());
            entity.setUrl(job.url() == null ? "" : job.url());
            entity.setCreatedAt(LocalDateTime.now());

            // Esik ustu ise Telegram'a gonder + gonderildiyse damgala
            if (score.score() >= scoreThreshold) {
                boolean delivered = notificationService.sendJobNotification(profile, entity);
                if (delivered) {
                    entity.setSentAt(LocalDateTime.now());
                    sentCount++;
                }
            }

            try {
                jobRepository.save(entity);
            } catch (DataIntegrityViolationException e) {
                log.debug("Duplicate ilan atlandi: {}", job.linkedinId());
            }
        }
        return sentCount;
    }

    /** Skorlama icin aday profili: manuel beceriler (+ ileride CV metni). */
    private String buildCandidateProfile(Profile profile) {
        List<String> parts = new ArrayList<>();
        if (profile.getSkills() != null && !profile.getSkills().isEmpty()) {
            parts.add("Beceriler: " + String.join(", ", profile.getSkills()));
        }
        if (profile.getTargetRoles() != null && !profile.getTargetRoles().isEmpty()) {
            parts.add("Hedef roller: " + String.join(", ", profile.getTargetRoles()));
        }
        if (profile.getCvText() != null && !profile.getCvText().isBlank()) {
            parts.add("CV:\n" + profile.getCvText().strip());
        }
        return String.join("\n\n", parts);
    }

    /** "26 başvuru" / "İlk 25 başvurandan biri olun" -> 26 / 25. Yoksa null. */
    private Integer parseApplicants(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        String digits = raw.replaceAll("\\D", "");
        return digits.isEmpty() ? null : Integer.parseInt(digits);
    }

    private String emptyToNull(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }
}
