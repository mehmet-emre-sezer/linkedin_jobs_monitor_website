"""LLM tabanlı iş ilanı puanlama.

Mevcut scorer.py'nin birebir aynısı — sadece sabit `CANDIDATE_PROFILE` yerine
parametre olarak kullanıcı profili alıyor.
"""

import hashlib
import json
import logging

from core.config import settings
from scraper.llm import ask

logger = logging.getLogger(__name__)


SCORING_PROMPT = """Bir adayın iş ilanlarını değerlendiriyorsun.

Aday profili:
{profile}

İş ilanı:
Başlık: {title}
Şirket: {company}
Açıklama:
{description}

KESİN KURAL — BAŞKA HİÇBİR FAKTÖRÜ DİKKATE ALMA:
Aşağıdakilerden biri varsa skor KESİNLİKLE 10 olacak, ilanın diğer özellikleri ne kadar iyi olursa olsun:
- 3 veya daha fazla yıl deneyim şartı (Required/Qualifications/Must have bölümünde)
- Senior / Lead / Principal / Manager ünvanı
- Birincil stack .NET, C#, Java, PHP, Ruby, Swift, Kotlin (Python olmadan)
- Yalnızca mobil geliştirme (iOS/Android)
- Yalnızca frontend (Python/backend olmadan)

DEĞERLENDİRME KURALLARI:
- "Required", "Qualifications", "Must have" bölümündeki eşleşmelere yüksek ağırlık ver
- "Nice to have", "Preferred", "Plus" bölümündeki eşleşmelere düşük ağırlık ver
- Zorunlu bölümde ciddi uyumsuzluk varsa skoru buna göre düşür
- Konum: Remote, Hybrid ve On-site hepsi kabul edilebilir

ÖRNEKLER:

Kötü eşleşme:
Başlık: Agentic AI Data Scientist
Sinyal: "At least 3+ years of work experience in Data Science" — Required bölümünde
Çıktı: {{"score": 10, "matches": [], "mismatches": ["Required: 3+ yıl deneyim şartı"], "reason": "Required bölümünde 3+ yıl deneyim şartı var, diskalifiye edildi"}}

Orta eşleşme:
Başlık: Junior AI Engineer
Sinyal: Node.js/TypeScript/Next.js birincil stack, LLM API kullanımı var, Python yok, Remote
Çıktı: {{"score": 72, "matches": ["Junior pozisyon", "Remote", "LLM API deneyimi"], "mismatches": ["Required: birincil stack Node.js/TypeScript, Python yok"], "reason": "Junior ve remote pozisyon, LLM deneyimi uyuşuyor ancak birincil stack Node.js/TypeScript"}}

İyi eşleşme:
Başlık: Jr. Data Scientist
Sinyal: Python (pandas, numpy, scikit-learn) Required, SQL, 1-2 yıl deneyim, Hybrid İstanbul
Çıktı: {{"score": 88, "matches": ["Required: Python", "Required: SQL", "1-2 yıl deneyim", "Hybrid İstanbul"], "mismatches": [], "reason": "Python ve data science odaklı, 1-2 yıl deneyim şartı uygun, hybrid İstanbul"}}

SADECE geçerli JSON döndür, başka hiçbir şey yazma:
{{"score": <sayı>, "matches": ["<Required veya Nice-to-have bölümünden somut eşleşmeler>"], "mismatches": ["<Required bölümündeki uyumsuzluklar>"], "reason": "<Türkçe: neden bu skoru verdin, tek cümle>"}}"""


def _mock_score(job: dict) -> dict:
    """Deterministik fake scoring — GROQ_API_KEY boşken e2e akışı çalışsın diye.

    Senior/.NET içeren başlıklara 10 (diskalifiye), gerisine 75-92 arası
    kararlı bir skor — başlığa göre tekrarlanabilir.
    """
    title = job.get("title", "").lower()
    if any(kw in title for kw in ["senior", ".net", "c#", "java ", "manager", "lead"]):
        return {"score": 10, "reason": "(mock) Senior/yanlış stack — diskalifiye",
                "matches": [], "mismatches": ["mock: senior/uyumsuz stack"]}
    seed = int(hashlib.md5(title.encode()).hexdigest()[:4], 16)
    score = 75 + (seed % 18)   # 75-92 arası
    return {"score": score, "reason": "(mock) profil ile uyumlu junior ilan",
            "matches": ["Python", "Junior"], "mismatches": []}


def score_job(job: dict, candidate_profile: str) -> dict | None:
    """İlanı LLM ile puanla.

    Returns: {"score": int, "reason": str, "matches": list, "mismatches": list}
    Hata olursa None döner — caller bir sonraki run'da tekrar denesin diye seen'e koymaz.
    """
    if not job.get("title", "").strip():
        logger.warning("Boş başlıklı ilan atlandı.")
        return None

    # GROQ_API_KEY yoksa deterministik mock — e2e akışı LLM olmadan da test edilebilsin
    if not settings.groq_api_key:
        return _mock_score(job)

    prompt = SCORING_PROMPT.format(
        profile=candidate_profile,
        title=job["title"],
        company=job["company"],
        description=job["description"] or "Açıklama mevcut değil.",
    )

    try:
        raw = ask(prompt, expect_json=True)
        result = json.loads(raw)
        return {
            "score":      int(result["score"]),
            "reason":     str(result["reason"]),
            "matches":    result.get("matches", []),
            "mismatches": result.get("mismatches", []),
        }
    except Exception as exc:
        logger.error("Scoring failed for '%s': %s", job.get("title", "?"), exc)
        return None
