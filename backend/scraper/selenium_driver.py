"""Selenium driver yardımcıları.

Mevcut scraper koduyla birebir aynı — headless, anti-detection, sign-in modal kapatma.
"""

import random
import time

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By

from core.config import settings


def build_driver() -> webdriver.Chrome:
    """Headless Chrome — anti-detection ayarlarıyla."""
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

    # Container'da Dockerfile chromium yollarını verir; lokalde boş → Selenium Manager
    if settings.chrome_binary:
        options.binary_location = settings.chrome_binary

    if settings.chromedriver_path:
        driver = webdriver.Chrome(service=Service(settings.chromedriver_path), options=options)
    else:
        driver = webdriver.Chrome(options=options)
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
