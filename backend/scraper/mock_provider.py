"""Lokal geliştirme için sahte iş ilanı üretici.

SCRAPER_MODE=mock olduğunda gerçek LinkedIn açılmaz, bunun yerine
deterministik bir mini set döner. End-to-end akışı (scrape → score → notify)
test etmek için yeterli.
"""

import hashlib

MOCK_JOBS = [
    {
        "title": "Junior ML Engineer",
        "company": "Bir teknoloji şirketi",
        "location": "İstanbul (Hibrit)",
        "applicants": "124 applicants",
        "description": (
            "Required: Python, scikit-learn, SQL. 0-2 yıl deneyim. "
            "Nice to have: PyTorch, NLP, AWS. Hybrid İstanbul ofis."
        ),
    },
    {
        "title": "Data Science Intern",
        "company": "Teknoloji A.Ş.",
        "location": "Ankara",
        "applicants": "89 applicants",
        "description": (
            "Required: Python, pandas, basic statistics. Stajyer / yeni mezun. "
            "Nice to have: Tableau, SQL. Remote-friendly."
        ),
    },
    {
        "title": "Junior Backend Developer (Python)",
        "company": "Yazılım A.Ş.",
        "location": "İstanbul (Remote)",
        "applicants": "200 applicants",
        "description": (
            "Required: Python, FastAPI veya Django, REST API geliştirme, "
            "PostgreSQL. 0-2 yıl deneyim. Hybrid/Remote."
        ),
    },
    {
        "title": "Senior .NET Developer",  # bilinçli olarak diskalifiye olacak
        "company": "Banka",
        "location": "İstanbul",
        "applicants": "45 applicants",
        "description": (
            "Required: 5+ yıl C# ve .NET deneyimi. Senior pozisyon. "
            "WPF, WCF, SQL Server."
        ),
    },
    {
        "title": "AI Engineer Trainee",
        "company": "Startup",
        "location": "İstanbul",
        "applicants": "56 applicants",
        "description": (
            "Required: Python, LLM/Generative AI ile ilgi. Stajyer / Trainee. "
            "Nice to have: LangChain, vector DB, prompt engineering."
        ),
    },
]


def scrape_jobs(
    queries: list[str],
    *,
    search_location: str,  # noqa: ARG001 - mock'ta kullanılmıyor
    jobs_per_query: int,
) -> list[dict]:
    """Sahte ilan listesi. Aynı imza, böylece factory transparan."""
    results: list[dict] = []
    for query in queries:
        for job in MOCK_JOBS[:jobs_per_query]:
            # ID query'den bağımsız — aynı ilan farklı sorgulardan gelse de tek sayılsın
            job_id = _deterministic_id(job["title"], job["company"])
            results.append({
                **job,
                "id": job_id,
                "link": f"https://example.com/job/{job_id}",
                "posted_at": "2026-06-12",
                "source_query": query,
            })
    return results


def _deterministic_id(*parts: str) -> str:
    """Aynı (query, title, company) tekrar gelirse aynı ID — dedupe testi için."""
    return hashlib.md5("|".join(parts).encode()).hexdigest()[:12]
