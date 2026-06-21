"""SCRAPER_MODE'a göre selenium veya mock provider seçer.

Caller'lar (scan_user task) buradaki `scrape_jobs`'u çağırır;
hangi provider'ın çalıştığını bilmesine gerek yok.
"""

from core.config import settings


def scrape_jobs(queries: list[str]) -> list[dict]:
    """Mevcut ayarlara göre uygun provider'ı seç ve scrape et."""
    if settings.scraper_mode == "selenium":
        from scraper.linkedin_scraper import scrape_jobs as _real
        return _real(
            queries,
            search_location=settings.search_location,
            jobs_per_query=settings.jobs_per_query,
        )

    # default → mock
    from scraper.mock_provider import scrape_jobs as _mock
    return _mock(
        queries,
        search_location=settings.search_location,
        jobs_per_query=settings.jobs_per_query,
    )
