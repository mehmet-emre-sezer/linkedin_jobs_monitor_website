"""Groq API üzerinden LLM çağrısı yapan ortak modül.

scoring.py, cv_parser.py, query_generator.py ve query_optimizer.py buradan import eder.
"""

import logging

from groq import Groq

from core.config import settings

logger = logging.getLogger(__name__)


def _get_client() -> Groq:
    """Lazy client — modül import sırasında API key kontrolü yapmaz."""
    return Groq(api_key=settings.groq_api_key)


def ask(prompt: str, expect_json: bool = True) -> str:
    """Groq'a prompt gönderir, yanıtı string olarak döner.

    expect_json=True ise JSON parse hataları için temizlik de yapar.
    """
    response = _get_client().chat.completions.create(
        model=settings.groq_model,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
    )
    raw = (response.choices[0].message.content or "").strip()

    if not expect_json:
        return raw

    # Markdown code fence temizle
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    # Sadece { } arasını al
    start = raw.find("{")
    end   = raw.rfind("}") + 1
    if start != -1 and end > start:
        raw = raw[start:end]

    return raw
