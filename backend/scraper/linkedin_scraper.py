"""LinkedIn iş ilanı scraper'ı — Selenium tabanlı.

Mevcut scraper.py'nin fonksiyonelliği birebir korunmuş:
- 24 saatlik filtre (f_TPR=r86400)
- Sign-in modal kapatma
- Açıklama + başvuran sayısı çekme
- Random delay'ler (insanımsı davranış)

Single-user varsayımı kaldırıldı; `search_location` ve `jobs_per_query` parametre.
"""

import logging

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from scraper.selenium_driver import build_driver, delay, dismiss_signin_modal

logger = logging.getLogger(__name__)


def scrape_jobs(
    queries: list[str],
    *,
    search_location: str,
    jobs_per_query: int,
) -> list[dict]:
    """Verilen sorgular için LinkedIn'i tara. Her ilana 'source_query' eklenir."""
    driver = build_driver()
    all_jobs: list[dict] = []

    try:
        for query in queries:
            logger.info("Searching: '%s...'", query[:80])
            jobs = _scrape_query(driver, query, search_location, jobs_per_query)
            logger.info("  → %d jobs found", len(jobs))
            for job in jobs:
                job["source_query"] = query
            all_jobs.extend(jobs)
            delay(3, 7)
    finally:
        driver.quit()

    return all_jobs


def _scrape_query(
    driver: webdriver.Chrome,
    query: str,
    search_location: str,
    jobs_per_query: int,
) -> list[dict]:
    location_param = (
        f"&location={search_location.replace(' ', '%20')}" if search_location else ""
    )
    url = (
        "https://www.linkedin.com/jobs/search/"
        f"?keywords={query.replace(' ', '%20')}"
        f"{location_param}"
        "&f_TPR=r86400"   # son 24 saat
        "&sortBy=DD"
    )

    driver.get(url)
    delay(3, 5)
    dismiss_signin_modal(driver)

    try:
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "jobs-search__results-list"))
        )
    except Exception:
        logger.warning("Sonuç listesi yüklenemedi: '%s'", query)
        return []

    cards = driver.find_elements(
        By.CSS_SELECTOR, "ul.jobs-search__results-list li"
    )[:jobs_per_query]

    jobs: list[dict] = []
    for card in cards:
        try:
            job = _extract_card(driver, card)
            if job:
                jobs.append(job)
                delay(1, 3)
        except Exception as exc:
            logger.debug("Kart parse hatası: %s", exc)

    return jobs


def _extract_job_id(url: str) -> str:
    try:
        return url.split("/view/")[1].split("/")[0].split("?")[0]
    except IndexError:
        return url


def _extract_card(driver: webdriver.Chrome, card) -> dict | None:
    try:
        link_el = card.find_element(By.CSS_SELECTOR, "a.base-card__full-link")
        title = link_el.get_attribute("aria-label") or link_el.text.strip()
        link = link_el.get_attribute("href").split("?")[0]
        job_id = _extract_job_id(link)
    except Exception:
        return None

    try:
        company = card.find_element(
            By.CSS_SELECTOR, "h4.base-search-card__subtitle"
        ).text.strip()
    except Exception:
        company = "Unknown"

    try:
        location = card.find_element(
            By.CSS_SELECTOR, "span.job-search-card__location"
        ).text.strip()
    except Exception:
        location = ""

    try:
        posted_at = card.find_element(
            By.CSS_SELECTOR,
            "time.job-search-card__listdate, time.job-search-card__listdate--new",
        ).get_attribute("datetime") or card.find_element(
            By.CSS_SELECTOR, "time"
        ).text.strip()
    except Exception:
        posted_at = ""

    description, applicants = _get_description_and_applicants(driver, link)

    return {
        "id": job_id,
        "title": title,
        "company": company,
        "location": location,
        "posted_at": posted_at,
        "applicants": applicants,
        "link": link,
        "description": description,
    }


def _get_description_and_applicants(
    driver: webdriver.Chrome, job_url: str
) -> tuple[str, str]:
    """İlan sayfasını yeni sekmede açıp açıklama + başvuran sayısı çek."""
    description = ""
    applicants = ""

    try:
        driver.execute_script("window.open('');")
        driver.switch_to.window(driver.window_handles[-1])
        driver.get(job_url)
        delay(2, 4)
        dismiss_signin_modal(driver)

        # Açıklama
        try:
            desc_el = WebDriverWait(driver, 8).until(
                EC.presence_of_element_located(
                    (By.CSS_SELECTOR, "div.show-more-less-html__markup")
                )
            )
            description = desc_el.text.strip()[:3000]
        except Exception:
            try:
                description = driver.find_element(
                    By.CLASS_NAME, "description__text"
                ).text.strip()[:3000]
            except Exception:
                pass

        # Başvuran sayısı — birden fazla selector dene (LinkedIn class'ları değişebiliyor)
        for selector in [
            "span.num-applicants__caption",
            "figcaption.num-applicants__caption",
            "span.jobs-unified-top-card__applicant-count",
            "span[class*='applicant']",
        ]:
            try:
                applicants = driver.find_element(By.CSS_SELECTOR, selector).text.strip()
                if applicants:
                    break
            except Exception:
                continue

    finally:
        driver.close()
        driver.switch_to.window(driver.window_handles[0])

    return description, applicants
