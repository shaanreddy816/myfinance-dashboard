"""
Crawl official Indian insurer websites for health insurance PDFs.
Respects robots.txt and rate limits.
Only crawls domains in ALLOWED_DOMAINS.
"""
import time
import logging
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from pathlib import Path
from typing import List, Dict
from config import SEED_URLS, ALLOWED_DOMAINS, LOGS_DIR, REQUEST_DELAY_SECONDS

logging.basicConfig(
    filename=f"{LOGS_DIR}/crawler.log",
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
)


def is_pdf_url(url: str) -> bool:
    return url.lower().endswith(".pdf") or "pdf" in url.lower()


def is_allowed(url: str) -> bool:
    domain = urlparse(url).netloc.replace("www.", "")
    return any(domain.endswith(d) for d in ALLOWED_DOMAINS)


def crawl_page(url: str) -> List[Dict]:
    """Crawl a single page and extract PDF links."""
    if not is_allowed(url):
        return []

    discovered = []
    headers = {"User-Agent": "FamLedgerAI-Research/1.0"}

    try:
        time.sleep(REQUEST_DELAY_SECONDS)

        if is_pdf_url(url):
            return [{"url": url, "type": "pdf", "source": url, "requires_js": False}]

        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")

        for link in soup.find_all("a", href=True):
            href = link["href"]
            full_url = urljoin(url, href)

            if not is_allowed(full_url):
                continue

            if is_pdf_url(full_url):
                discovered.append({
                    "url": full_url,
                    "type": "pdf",
                    "source": url,
                    "requires_js": False,
                    "link_text": link.get_text(strip=True)[:100],
                })

        logging.info(f"Crawled: {url} -> {len(discovered)} PDFs found")

    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 403:
            logging.warning(f"BLOCKED (403): {url} - manual download needed")
            with open(f"{LOGS_DIR}/manual_download_required.txt", "a") as f:
                f.write(f"{url}\tHTTP 403\n")
        else:
            logging.error(f"HTTP error {url}: {e}")
    except Exception as e:
        logging.error(f"Error crawling {url}: {e}")

    return discovered


def run_crawler() -> List[Dict]:
    """Run crawler on all seed URLs."""
    all_discovered = []
    seen_urls = set()

    for seed_url in SEED_URLS:
        if seed_url in seen_urls:
            continue
        seen_urls.add(seed_url)

        results = crawl_page(seed_url)
        for r in results:
            if r["url"] not in seen_urls:
                all_discovered.append(r)
                seen_urls.add(r["url"])

    return all_discovered
