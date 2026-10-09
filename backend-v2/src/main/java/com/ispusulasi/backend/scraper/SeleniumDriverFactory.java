package com.ispusulasi.backend.scraper;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Headless Chrome uretir: anti-detection, resimler kapali (bant/hiz tasarrufu),
 * opsiyonel IPRoyal proxy (auth'lu ise ProxyRelay uzerinden).
 * Eski Python build_driver() karsiligi.
 */
@Component
public class SeleniumDriverFactory {

    private static final String USER_AGENT =
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            + "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

    private final ProxyRelay proxyRelay;
    private final String proxyHost;
    private final int proxyPort;
    private final String proxyUsername;
    private final String proxyPassword;

    public SeleniumDriverFactory(ProxyRelay proxyRelay,
                                 @Value("${app.proxy.host:}") String proxyHost,
                                 @Value("${app.proxy.port:0}") int proxyPort,
                                 @Value("${app.proxy.username:}") String proxyUsername,
                                 @Value("${app.proxy.password:}") String proxyPassword) {
        this.proxyRelay = proxyRelay;
        this.proxyHost = proxyHost;
        this.proxyPort = proxyPort;
        this.proxyUsername = proxyUsername;
        this.proxyPassword = proxyPassword;
    }

    public WebDriver newDriver() {
        ChromeOptions options = new ChromeOptions();
        options.addArguments(
                "--headless=new",
                "--no-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--window-size=1920,1080",
                "--disable-blink-features=AutomationControlled",
                "user-agent=" + USER_AGENT);

        // Otomasyon izlerini gizle
        options.setExperimentalOption("excludeSwitches", List.of("enable-automation"));
        options.setExperimentalOption("useAutomationExtension", false);

        // Resimleri engelle (2 = block) -> GB tasarrufu + hiz
        options.setExperimentalOption("prefs",
                Map.of("profile.managed_default_content_settings.images", 2));

        // IPRoyal proxy (varsa). Auth'lu ise relay uzerinden, degilse dogrudan.
        if (proxyHost != null && !proxyHost.isBlank() && proxyPort > 0) {
            if (proxyUsername != null && !proxyUsername.isBlank()) {
                int relayPort = proxyRelay.ensureRelay(proxyHost, proxyPort, proxyUsername, proxyPassword);
                options.addArguments("--proxy-server=http://127.0.0.1:" + relayPort);
            } else {
                options.addArguments("--proxy-server=http://" + proxyHost + ":" + proxyPort);
            }
        }

        ChromeDriver driver = new ChromeDriver(options);
        driver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(45));
        driver.manage().timeouts().scriptTimeout(Duration.ofSeconds(30));

        // navigator.webdriver = undefined (bot tespitini zorlastir)
        driver.executeScript(
                "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})");

        return driver;
    }

    /** Insanimsi rastgele bekleme. */
    public static void delay(double minSeconds, double maxSeconds) {
        try {
            double seconds = ThreadLocalRandom.current().nextDouble(minSeconds, maxSeconds);
            Thread.sleep((long) (seconds * 1000));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    /** LinkedIn'in "Sign in to view" modal'ini kapat (yoksa sessizce gec). */
    public static void dismissSigninModal(WebDriver driver) {
        try {
            driver.findElement(By.cssSelector(
                    "button[data-tracking-control-name='public_jobs_contextual-sign-in-modal_modal_dismiss']"
            )).click();
            delay(1, 2);
        } catch (Exception ignored) {
            // modal yoksa sorun degil
        }
    }
}
