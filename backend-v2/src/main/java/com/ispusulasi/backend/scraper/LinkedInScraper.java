package com.ispusulasi.backend.scraper;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static com.ispusulasi.backend.scraper.SeleniumDriverFactory.delay;
import static com.ispusulasi.backend.scraper.SeleniumDriverFactory.dismissSigninModal;

/**
 * LinkedIn is ilani scraper'i (eski linkedin_scraper.py karsiligi).
 * Her (lokasyon x sorgu) kombinasyonu icin son 24 saatteki ilanlari tarar.
 */
@Component
public class LinkedInScraper {

    private static final Logger log = LoggerFactory.getLogger(LinkedInScraper.class);
    private static final Pattern JOB_ID_DIGITS = Pattern.compile("(\\d{6,})");

    private final SeleniumDriverFactory driverFactory;

    public LinkedInScraper(SeleniumDriverFactory driverFactory) {
        this.driverFactory = driverFactory;
    }

    public List<ScrapedJob> scrapeJobs(List<String> queries, List<String> locations, int jobsPerQuery) {
        WebDriver driver = driverFactory.newDriver();
        List<ScrapedJob> all = new ArrayList<>();
        try {
            for (String location : locations) {
                for (String query : queries) {
                    log.info("Araniyor: '{}' @ '{}'", trim(query, 60), location);
                    List<ScrapedJob> jobs = scrapeQuery(driver, query, location, jobsPerQuery);
                    log.info("  -> {} ilan bulundu", jobs.size());
                    all.addAll(jobs);
                    delay(3, 7);
                }
            }
        } finally {
            driver.quit();
        }
        return all;
    }

    private List<ScrapedJob> scrapeQuery(WebDriver driver, String query, String location, int jobsPerQuery) {
        String locationParam = (location == null || location.isBlank())
                ? "" : "&location=" + location.replace(" ", "%20");
        String url = "https://www.linkedin.com/jobs/search/"
                + "?keywords=" + query.replace(" ", "%20")
                + locationParam
                + "&f_TPR=r86400"   // son 24 saat
                + "&sortBy=DD";

        try {
            driver.get(url);
        } catch (Exception e) {
            log.warn("Sayfa yuklenemedi (timeout): '{}'", trim(query, 60));
            return List.of();
        }

        delay(3, 5);
        dismissSigninModal(driver);

        try {
            new WebDriverWait(driver, Duration.ofSeconds(12)).until(
                    ExpectedConditions.presenceOfElementLocated(
                            By.cssSelector("ul.jobs-search__results-list li div.base-card")));
        } catch (Exception e) {
            log.warn("Sonuc/kart yuklenemedi (0 ilan olabilir): '{}'", trim(query, 60));
            return List.of();
        }
        delay(1, 2);

        List<WebElement> cards = driver.findElements(By.cssSelector("ul.jobs-search__results-list li"));
        List<ScrapedJob> jobs = new ArrayList<>();
        int limit = Math.min(cards.size(), jobsPerQuery);
        for (int i = 0; i < limit; i++) {
            try {
                ScrapedJob job = extractCard(driver, cards.get(i), query);
                if (job != null) {
                    jobs.add(job);
                    delay(1, 3);
                }
            } catch (Exception e) {
                log.debug("Kart parse hatasi: {}", e.getMessage());
            }
        }
        return jobs;
    }

    private ScrapedJob extractCard(WebDriver driver, WebElement card, String query) {
        String link = attr(card, "a.base-card__full-link", "href");
        if (link == null) return null;
        link = link.split("\\?")[0];

        String jobId = extractJobId(card, link);
        if (jobId.isEmpty()) return null;

        String title = text(card, "h3.base-search-card__title");
        if (title.isEmpty()) return null;

        String company = orDefault(text(card, "h4.base-search-card__subtitle"), "Unknown");
        String location = text(card, "span.job-search-card__location");
        String postedAt = attr(card, "time", "datetime");

        String[] detail = getDescriptionAndApplicants(driver, link);

        return new ScrapedJob(jobId, title, company, location, postedAt,
                detail[1], link, detail[0], query);
    }

    private String extractJobId(WebElement card, String url) {
        try {
            String urn = card.findElement(By.cssSelector("[data-entity-urn]"))
                    .getAttribute("data-entity-urn");
            if (urn != null) {
                String digits = urn.substring(urn.lastIndexOf(':') + 1);
                if (digits.matches("\\d+")) return digits;
            }
        } catch (Exception ignored) {
        }
        Matcher m = JOB_ID_DIGITS.matcher(url);
        return m.find() ? m.group(1) : "";
    }

    /** Ilan detay sayfasini yeni sekmede acip [description, applicants] doner. */
    private String[] getDescriptionAndApplicants(WebDriver driver, String jobUrl) {
        String description = "";
        String applicants = "";
        String original = driver.getWindowHandle();

        try {
            ((JavascriptExecutor) driver).executeScript("window.open('');");
            String newTab = driver.getWindowHandles().stream()
                    .filter(h -> !h.equals(original)).reduce((a, b) -> b).orElse(original);
            driver.switchTo().window(newTab);

            try {
                driver.get(jobUrl);
            } catch (Exception e) {
                return new String[]{"", ""};
            }

            delay(2, 4);
            dismissSigninModal(driver);

            try {
                WebElement desc = new WebDriverWait(driver, Duration.ofSeconds(8)).until(
                        ExpectedConditions.presenceOfElementLocated(
                                By.cssSelector("div.show-more-less-html__markup")));
                description = cut(desc.getText().strip(), 3000);
            } catch (Exception e) {
                try {
                    description = cut(driver.findElement(By.className("description__text"))
                            .getText().strip(), 3000);
                } catch (Exception ignored) {
                }
            }

            for (String selector : List.of(
                    "span.num-applicants__caption",
                    "figcaption.num-applicants__caption",
                    "span.jobs-unified-top-card__applicant-count",
                    "span[class*='applicant']")) {
                try {
                    String val = driver.findElement(By.cssSelector(selector)).getText().strip();
                    if (!val.isEmpty()) {
                        applicants = val;
                        break;
                    }
                } catch (Exception ignored) {
                }
            }
        } finally {
            driver.close();
            driver.switchTo().window(original);
        }
        return new String[]{description, applicants};
    }

    // --- kucuk yardimcilar ---
    private String text(WebElement parent, String css) {
        try {
            return parent.findElement(By.cssSelector(css)).getText().strip();
        } catch (Exception e) {
            return "";
        }
    }

    private String attr(WebElement parent, String css, String attribute) {
        try {
            return parent.findElement(By.cssSelector(css)).getAttribute(attribute);
        } catch (Exception e) {
            return null;
        }
    }

    private String orDefault(String value, String fallback) {
        return (value == null || value.isEmpty()) ? fallback : value;
    }

    private String cut(String s, int max) {
        return s.length() > max ? s.substring(0, max) : s;
    }

    private String trim(String s, int max) {
        return s.length() > max ? s.substring(0, max) : s;
    }
}
