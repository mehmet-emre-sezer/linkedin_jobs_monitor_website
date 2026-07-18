"""Selenium driver yardımcıları.

Headless Chrome — anti-detection, resim kapalı (GB/hız), opsiyonel residential proxy.
Proxy user:pass ise auth yerel bir relay ile sağlanır (Chrome inline proxy
şifresini ve headless'ta auth extension'ını güvenilir desteklemez).
"""

import random
import time

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By

from core.config import settings
from scraper.proxy_relay import ensure_relay


def build_driver() -> webdriver.Chrome:
    """Headless Chrome — anti-detection, resim kapalı, opsiyonel residential proxy."""
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option("useAutomationExtension", False)
    options.add_argument(
        "user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    )

    # Resimleri engelle — GB tasarrufu + hız (metin kartları yine yüklenir)
    options.add_experimental_option(
        "prefs", {"profile.managed_default_content_settings.images": 2}
    )

    # Residential proxy (IPRoyal). Boşsa direkt bağlanır.
    if settings.proxy_host and settings.proxy_port:
        if settings.proxy_username:
            # Auth'lu proxy → yerel relay üzerinden (Chrome auth'suz bağlanır)
            relay_port = ensure_relay(
                settings.proxy_host,
                settings.proxy_port,
                settings.proxy_username,
                settings.proxy_password,
            )
            options.add_argument(f"--proxy-server=http://127.0.0.1:{relay_port}")
        else:
            options.add_argument(
                f"--proxy-server=http://{settings.proxy_host}:{settings.proxy_port}"
            )

    # Container'da Dockerfile chromium yollarını verir; lokalde boş → Selenium Manager
    if settings.chrome_binary:
        options.binary_location = settings.chrome_binary

    if settings.chromedriver_path:
        driver = webdriver.Chrome(service=Service(settings.chromedriver_path), options=options)
    else:
        driver = webdriver.Chrome(options=options)
    # Residential proxy yavaş olabiliyor; timeout olmazsa tek sayfa task'ı kilitler
    driver.set_page_load_timeout(45)
    driver.set_script_timeout(30)

    driver.execute_script(
        "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
    )
    return driver


def delay(min_s: float = 2, max_s: float = 5) -> None:
    """Rastgele bekleme — bot davranışı insanımsı görünsün."""
    time.sleep(random.uniform(min_s, max_s))


def dismiss_signin_modal(driver: webdriver.Chrome) -> None:
    """LinkedIn'in 'Sign in to view' modal'ını kapat."""
    try:
        button = driver.find_element(
            By.CSS_SELECTOR,
            "button[data-tracking-control-name='public_jobs_contextual-sign-in-modal_modal_dismiss']",
        )
        button.click()
        delay(1, 2)
    except Exception:
        pass  # modal yoksa sorun değil
