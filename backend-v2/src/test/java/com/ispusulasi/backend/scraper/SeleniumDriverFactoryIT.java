package com.ispusulasi.backend.scraper;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.WebDriver;

import static org.junit.jupiter.api.Assertions.assertTrue;

class SeleniumDriverFactoryIT {

    @Test
    void headless_chrome_sayfa_acabiliyor() {
        SeleniumDriverFactory factory = new SeleniumDriverFactory(new ProxyRelay(), "", 0, "", "", "");
        WebDriver driver = factory.newDriver();
        try {
            driver.get("https://example.com");
            String title = driver.getTitle();
            System.out.println(">>> Sayfa basligi: " + title);
            assertTrue(title.contains("Example"), "example.com basligi beklenirdi");
        } finally {
            driver.quit();
        }
    }
}
