"""LinkedIn arama sorgularını LLM ile üretir.

Mevcut query_generator.py'nin birebir aynısı — sabit `CANDIDATE_PROFILE`/
`SEARCH_QUERIES` yerine parametre olarak alıyor.
"""

import json
import logging

from scraper.llm import ask

logger = logging.getLogger(__name__)


GENERATOR_PROMPT = """Sen bir iş arama uzmanısın. Aşağıdaki aday profiline göre LinkedIn'de kullanılacak arama sorguları üreteceksin.

Aday Profili:
{profile}

Örnek sorgu formatı (LinkedIn boolean syntax):
{example_query}

Kurallar:
- Her sorgu LinkedIn keyword alanına direkt yapıştırılabilir olmalı
- AND, OR, NOT ve tırnak içi exact match kullanabilirsin
- Her sorgu farklı bir açıdan arama yapmalı (farklı rol kombinasyonları)
- Adayın güçlü olduğu alanlara odaklan
- Tüm sorgular junior/entry-level pozisyonları hedeflemeli
- 5 adet sorgu üret

SADECE geçerli JSON döndür, başka hiçbir şey yazma:
{{
  "queries": [
    "sorgu 1",
    "sorgu 2",
    "sorgu 3",
    "sorgu 4",
    "sorgu 5"
  ]
}}"""

EXAMPLE_QUERY = (
    '("Junior" OR "Entry Level" OR "Intern" OR "Graduate" OR "New Grad")'
    ' AND ("Data Scientist" OR "Machine Learning Engineer" OR "AI Engineer"'
    ' OR "Backend Developer" OR "Software Engineer")'
    ' AND (Python OR SQL OR API)'
)


def generate_queries(candidate_profile: str) -> list[str]:
    """LLM ile 5 LinkedIn boolean sorgu üret. Hata olursa boş liste."""
    prompt = GENERATOR_PROMPT.format(
        profile=candidate_profile,
        example_query=EXAMPLE_QUERY,
    )

    logger.info("LLM'den sorgular üretiliyor...")
    try:
        raw = ask(prompt, expect_json=True)
        result = json.loads(raw)
        queries = result["queries"]
        logger.info("%d sorgu üretildi.", len(queries))
        return [str(q).strip() for q in queries if q]
    except Exception as exc:
        logger.error("Sorgu üretimi başarısız: %s", exc)
        return []
