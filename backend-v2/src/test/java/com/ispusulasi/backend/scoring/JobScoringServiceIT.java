package com.ispusulasi.backend.scoring;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class JobScoringServiceIT {

    @Autowired
    JobScoringService scoringService;

    @Test
    void junior_python_ilani_yuksek_skor_alir() {
        ScoreResult r = scoringService.score(
                "Python, SQL ve pandas bilen yeni mezun. Backend ve veri analizine ilgili, 0-1 yıl deneyim.",
                "Junior Data Analyst",
                "Trendyol",
                "Python, SQL ve pandas ile veri analizi. Yeni mezunlar başvurabilir. Remote.");

        System.out.println(">>> JUNIOR skor=" + r.score() + " | reason=" + r.reason()
                + " | matches=" + r.matches());
        assertTrue(r.score() > 50, "junior python ilani 50 ustu beklenirdi");
    }

    @Test
    void senior_java_ilani_diskalifiye_olur() {
        ScoreResult r = scoringService.score(
                "Python, SQL bilen yeni mezun, 0-1 yıl deneyim.",
                "Senior Java Engineer",
                "SomeCorp",
                "5+ years experience required. Java, Spring Boot. Lead a team.");

        System.out.println(">>> SENIOR skor=" + r.score() + " | reason=" + r.reason());
        assertEquals(10, r.score(), "senior/java/5+ yil -> diskalifiye (10) beklenirdi");
    }
}
