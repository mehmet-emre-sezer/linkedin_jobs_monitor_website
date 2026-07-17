"""SCRAPER_MODE'a göre selenium veya mock provider seçer.

Caller'lar (scan_user task) buradaki `scrape_jobs`'u çağırır;
hangi provider'ın çalıştığını bilmesine gerek yok.
"""

from core.config import settings


def scrape_jobs(queries: list[str], search_locations: list[str]) -> list[dict]:
    """Uygun provider'ı seç ve scrape et.

    search_locations kullanıcının şehirleri; boşsa global config'e (tek konum) düşer.
    """
    locations = [loc for loc in (search_locations or []) if loc.strip()]
    if not locations:
        locations = [settings.search_location]

    if settings.scraper_mode == "selenium":
        from scraper.linkedin_scraper import scrape_jobs as _real
        return _real(
            queries,
            search_locations=locations,
            jobs_per_query=settings.jobs_per_query,
        )

    # default → mock (konumu umursamıyor, ilkini yeter)
    from scraper.mock_provider import scrape_jobs as _mock
    return _mock(
        queries,
        search_location=locations[0],
        jobs_per_query=settings.jobs_per_query,
    )
