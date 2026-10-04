package com.ispusulasi.backend.scraper;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertNotNull;

class LinkedInScraperIT {

    @Test
    void linkedin_gercek_tarama() {
        LinkedInScraper scraper = new LinkedInScraper(new SeleniumDriverFactory());

        List<ScrapedJob> jobs = scraper.scrapeJobs(
                List.of("Junior Python Developer"),
                List.of("Turkey"),
                3);

        System.out.println(">>> BULUNAN ILAN: " + jobs.size());
        for (ScrapedJob j : jobs) {
            System.out.printf(" - %s @ %s | %s | applicants=%s | desc=%d ch%n",
                    j.title(), j.company(), j.location(), j.applicants(),
                    j.description() == null ? 0 : j.description().length());
        }

        // Gozlem testi: LinkedIn 0 da donebilir (bot/selector/bolge). Cokmedigini dogrula.
        assertNotNull(jobs);
    }
}
