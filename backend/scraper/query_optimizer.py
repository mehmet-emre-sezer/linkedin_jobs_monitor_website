"""LLM tabanlı sorgu optimizasyonu.

Mevcut query_optimizer.py'nin birebir aynı mantığı:
- Run başına 3-7 ilan, %60+ precision hedef
- Düşük precision sorguları daralt, yüksekleri koru/benzer ekle
- 5 sorgu sınırı

Tek fark: history JSON dosyası yerine DB'den/caller'dan parametre olarak gelir.
"""

import json
import logging

from scraper.llm import ask

logger = logging.getLogger(__name__)


OPTIMIZER_PROMPT = """Sen bir iş arama sorgu optimizasyon uzmanısın.

Aşağıda LinkedIn iş arama sisteminin geçmiş performans verileri var.
Her sorgu için: kaç ilan bulundu, kaçı eşiği geçti ve precision oranı gösteriliyor.

Geçmiş Performans:
{history_summary}

Mevcut Sorgular:
{current_queries}

Görevin:
- En önemli metrik PRECISION'dır: eşiği geçen ilan sayısı / toplam ilan sayısı
- Ortalama skoru değil, precision'ı maksimize et — çok ilan getirmek değil, doğru ilan getirmek önemli
- İdeal sorgu: run başına 3-7 ilan getirir, bunların %60'ı+ eşiği geçer
- Çok az ilan getiren sorgu (0-1): çok spesifik, biraz genişlet
- Çok fazla ilan getiren sorgu (10+): çok geniş, daha spesifik hale getir
- Düşük precision'lı sorguları kaldır veya daralt
- Yüksek precision'lı sorguların yapısını koru veya benzerlerini ekle
- Sorgu sayısını 5 ile sınırla
- LinkedIn boolean syntax kullan: AND, OR, NOT, "tırnak içi exact match"

SADECE geçerli JSON döndür, başka hiçbir şey yazma:
{{
  "analysis": "kısa analiz: hangi sorgular iyi/kötü çalıştı ve neden",
  "queries": [
    "optimize edilmiş sorgu 1",
    "optimize edilmiş sorgu 2",
    "optimize edilmiş sorgu 3",
    "optimize edilmiş sorgu 4",
    "optimize edilmiş sorgu 5"
  ]
}}"""


def build_history_summary(query_stats: list[dict], score_threshold: int) -> str:
    """Sorgu performansını precision odaklı özetler.

    query_stats: [{"query": str, "total_jobs": int, "passed": int,
                   "scores": list[int], "runs": int}, ...]
    """
    lines: list[str] = []
    for stat in query_stats:
        q     = stat["query"][:80]
        total = stat["total_jobs"]
        passed = stat["passed"]
        runs   = stat["runs"]
        scores = stat["scores"]

        avg         = round(sum(scores) / len(scores), 1) if scores else 0
        precision   = round(passed / total * 100, 1) if total > 0 else 0
        avg_per_run = round(total / runs, 1) if runs > 0 else 0

        if precision >= 60 and 3 <= avg_per_run <= 7:
            tag = "✅ İyi"
        elif avg_per_run > 10:
            tag = "⚠️ Çok geniş"
        elif avg_per_run < 2:
            tag = "⚠️ Çok dar"
        elif precision < 30:
            tag = "❌ Düşük precision"
        else:
            tag = "🔸 Orta"

        lines.append(
            f'Sorgu: "{q}"\n'
            f"  {tag} | Run başına ilan: {avg_per_run} | "
            f"Precision: %{precision} | Ortalama skor: {avg}"
        )

    _ = score_threshold  # şu an doğrudan kullanılmıyor; istenirse line'larda gösterilebilir
    return "\n\n".join(lines)


def optimize_queries(
    current_queries: list[str],
    query_stats: list[dict],
    score_threshold: int,
) -> tuple[list[str], str] | None:
    """LLM ile sorguları yeniden üret.

    Returns: (new_queries, analysis) tuple veya None (hata).
    """
    history_summary = build_history_summary(query_stats, score_threshold)

    prompt = OPTIMIZER_PROMPT.format(
        history_summary=history_summary,
        current_queries=json.dumps(current_queries, ensure_ascii=False, indent=2),
    )

    try:
        raw = ask(prompt, expect_json=True)
        result = json.loads(raw)
        new_queries = [str(q).strip() for q in result["queries"] if q]
        analysis = str(result.get("analysis", ""))
        return new_queries, analysis
    except Exception as exc:
        logger.error("Sorgu optimizasyonu başarısız: %s", exc)
        return None
