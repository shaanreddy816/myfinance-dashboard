import os
import hashlib
import time
import requests
import logging
from pathlib import Path
from urllib.parse import urlparse
from config import (
    ALLOWED_DOMAINS, RAW_DIR, FAILED_DIR, LOGS_DIR,
    REQUEST_DELAY_SECONDS, REQUEST_TIMEOUT, MAX_RETRIES,
    MAX_FILE_SIZE_MB,
)

logging.basicConfig(
    filename=f"{LOGS_DIR}/downloader.log",
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
)


def is_allowed_domain(url: str) -> bool:
    domain = urlparse(url).netloc.replace("www.", "")
    return any(domain.endswith(d) for d in ALLOWED_DOMAINS)


def compute_checksum(filepath: str) -> str:
    sha256 = hashlib.sha256()
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            sha256.update(chunk)
    return sha256.hexdigest()


def download_pdf(url: str, insurer_id: str) -> dict:
    """Download a PDF from official insurer URL."""
    if not is_allowed_domain(url):
        return {"status": "blocked", "url": url, "reason": "domain not in allowed list"}

    headers = {
        "User-Agent": "FamLedgerAI-InsuranceResearch/1.0 (research@famledgerai.com)",
        "Accept": "application/pdf,*/*",
    }

    for attempt in range(MAX_RETRIES):
        try:
            time.sleep(REQUEST_DELAY_SECONDS)
            response = requests.get(url, headers=headers, timeout=REQUEST_TIMEOUT, stream=True)
            response.raise_for_status()

            content_type = response.headers.get("content-type", "")
            if "pdf" not in content_type and not url.endswith(".pdf"):
                return {"status": "skipped", "url": url, "reason": f"not a PDF: {content_type}"}

            content_length = int(response.headers.get("content-length", 0))
            if content_length > MAX_FILE_SIZE_MB * 1024 * 1024:
                return {"status": "skipped", "url": url, "reason": "file too large"}

            filename = url.split("/")[-1].split("?")[0]
            if not filename.endswith(".pdf"):
                filename += ".pdf"

            insurer_dir = Path(RAW_DIR) / insurer_id
            insurer_dir.mkdir(parents=True, exist_ok=True)
            filepath = insurer_dir / filename

            with open(filepath, "wb") as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)

            checksum = compute_checksum(str(filepath))
            file_size = os.path.getsize(str(filepath))
            logging.info(f"Downloaded: {url} -> {filepath}")

            return {
                "status": "success",
                "url": url,
                "filepath": str(filepath),
                "filename": filename,
                "checksum": checksum,
                "file_size_bytes": file_size,
                "insurer_id": insurer_id,
            }

        except requests.exceptions.HTTPError as e:
            if e.response.status_code in [403, 404]:
                _log_manual_download(url, insurer_id, f"HTTP {e.response.status_code}")
                return {"status": "manual_required", "url": url, "reason": str(e)}
            if attempt == MAX_RETRIES - 1:
                logging.error(f"Failed after {MAX_RETRIES}: {url} - {e}")
                return {"status": "failed", "url": url, "reason": str(e)}
            time.sleep(5 * (attempt + 1))

        except Exception as e:
            if attempt == MAX_RETRIES - 1:
                logging.error(f"Error: {url} - {e}")
                return {"status": "failed", "url": url, "reason": str(e)}
            time.sleep(3)

    return {"status": "failed", "url": url, "reason": "max retries"}


def _log_manual_download(url: str, insurer_id: str, reason: str):
    with open(f"{LOGS_DIR}/manual_download_required.txt", "a") as f:
        f.write(f"{insurer_id}\t{url}\t{reason}\n")
