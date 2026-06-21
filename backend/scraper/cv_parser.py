"""CV'den profil ve LinkedIn sorguları üretme.

Mevcut setup.py'nin fonksiyonelliği birebir korunmuş.
Ekstra: yapılandırılmış field'lar (name, university, graduation_year, skills)
JSON yanıta eklendi — backend onboarding flow'u bunları profile'a dolduruyor.
"""

import json
import logging
from pathlib import Path

import pdfplumber

from scraper.llm import ask
from scraper.query_generator import EXAMPLE_QUERY

logger = logging.getLogger(__name__)


SETUP_PROMPT = """Bir CV metni verilecek. Bu CV'yi analiz ederek dört şey üret:

1. Aday profili: CV'deki tüm önemli bilgileri (beceriler, deneyim, projeler, eğitim, tercihler) içeren detaylı metin
2. LinkedIn arama sorguları: Adaya uygun 5 adet LinkedIn boolean arama sorgusu
3. Yapılandırılmış kişisel bilgiler: ad soyad, üniversite, mezuniyet yılı
4. Beceri listesi: CV'den çıkarılan teknik beceriler (en az 3, en fazla 20)

Sorgu kuralları:
- LinkedIn keyword alanına direkt yapıştırılabilir olmalı
- AND, OR, NOT ve "tırnak içi exact match" kullanabilirsin
- Her sorgu farklı bir açıdan arama yapmalı
- Junior/entry-level pozisyonları hedeflemeli
- Adayın güçlü alanlarına odaklan

Örnek sorgu formatı:
{example_query}

CV metni:
{cv_text}

SADECE geçerli JSON döndür, başka hiçbir şey yazma:
{{
  "candidate_profile": "adayın tüm önemli bilgilerini içeren detaylı metin",
  "queries": [
    "sorgu 1",
    "sorgu 2",
    "sorgu 3",
    "sorgu 4",
    "sorgu 5"
  ],
  "structured": {{
    "name": "Ad Soyad",
    "university": "Üniversite adı",
    "graduation_year": 2025,
    "skills": ["Skill1", "Skill2", "Skill3"]
  }}
}}"""


class ParsedCv:
    """LLM çıktısının yapılandırılmış hali. dict yerine attribute erişimi için."""

    def __init__(
        self,
        profile_summary: str,
        queries: list[str],
        name: str | None,
        university: str | None,
        graduation_year: int | None,
        skills: list[str],
    ):
        self.profile_summary = profile_summary
        self.queries = queries
        self.name = name
        self.university = university
        self.graduation_year = graduation_year
        self.skills = skills


def extract_text_from_pdf(pdf_path: Path | str) -> str:
    """PDF dosyasından düz metin çıkar."""
    logger.info("PDF okunuyor: %s", pdf_path)
    text_parts: list[str] = []
    with pdfplumber.open(str(pdf_path)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)

    text = "\n".join(text_parts).strip()
    if not text:
        raise ValueError("PDF'den metin çıkarılamadı. Taranmış görsel PDF olabilir.")

    logger.info("%d karakter metin çıkarıldı.", len(text))
    return text


def parse_cv_text(cv_text: str) -> ParsedCv:
    """LLM ile CV metninden tüm field'ları üret."""
    prompt = SETUP_PROMPT.format(cv_text=cv_text, example_query=EXAMPLE_QUERY)
    logger.info("LLM profil + sorgular + yapılandırılmış bilgi üretiyor...")
    raw = ask(prompt, expect_json=True)
    result = json.loads(raw)

    profile = str(result.get("candidate_profile", "")).strip()
    queries = [str(q).strip() for q in result.get("queries", []) if q]
    structured = result.get("structured") or {}

    return ParsedCv(
        profile_summary=profile,
        queries=queries,
        name=_clean_str(structured.get("name")),
        university=_clean_str(structured.get("university")),
        graduation_year=_clean_int(structured.get("graduation_year")),
        skills=[str(s).strip() for s in structured.get("skills", []) if s],
    )


def _clean_str(value) -> str | None:
    if not value:
        return None
    text = str(value).strip()
    return text or None


def _clean_int(value) -> int | None:
    try:
        return int(value) if value is not None else None
    except (ValueError, TypeError):
        return None
