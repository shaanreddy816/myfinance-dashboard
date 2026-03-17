"""
Main pipeline runner.
Usage: python main.py
"""
import os
import json
import random
from pathlib import Path
from config import (
    DATA_DIR, RAW_DIR, PARSED_DIR, NORMALIZED_DIR,
    FAILED_DIR, REVIEW_DIR, LOGS_DIR, SEED_URLS,
)
from crawler import run_crawler
from downloader import download_pdf
from parser import parse_pdf
from extractor import extract_document


def setup_directories():
    for d in [RAW_DIR, PARSED_DIR, NORMALIZED_DIR, FAILED_DIR, REVIEW_DIR, LOGS_DIR]:
        Path(d).mkdir(parents=True, exist_ok=True)


def _guess_insurer_from_url(url: str) -> str:
    url_lower = url.lower()
    if "hdfcergo" in url_lower:
        return "hdfc_ergo"
    if "starhealth" in url_lower:
        return "star_health"
    if "nivabupa" in url_lower:
        return "niva_bupa"
    if "careinsurance" in url_lower:
        return "care_health"
    if "manipalcigna" in url_lower:
        return "manipal_cigna"
    if "adityabirla" in url_lower:
        return "aditya_birla"
    if "tataaig" in url_lower:
        return "tata_aig"
    if "sbigeneral" in url_lower:
        return "sbi_general"
    if "icicilombard" in url_lower:
        return "icici_lombard"
    if "newindia" in url_lower:
        return "new_india"
    if "uiic" in url_lower:
        return "united_india"
    return "unknown"


def _build_dataset(extractions: list):
    """Build train/val/test splits."""
    random.shuffle(extractions)
    n = len(extractions)
    train = extractions[: int(n * 0.7)]
    val = extractions[int(n * 0.7) : int(n * 0.85)]
    test = extractions[int(n * 0.85) :]

    for split_name, split_data in [("train", train), ("val", val), ("test", test)]:
        with open(f"{DATA_DIR}/{split_name}.jsonl", "w") as f:
            for item in split_data:
                f.write(json.dumps(item, default=str) + "\n")

    print(f"Dataset: {len(train)} train, {len(val)} val, {len(test)} test")


def run_pipeline():
    setup_directories()

    print("Step 1: Crawling official insurer pages...")
    discovered = run_crawler()

    # Also include direct PDF seed URLs
    for url in SEED_URLS:
        if url.endswith(".pdf"):
            discovered.append({
                "url": url,
                "type": "pdf",
                "source": "seed",
                "requires_js": False,
            })

    print(f"Found {len(discovered)} potential documents")

    results = {
        "downloaded": [],
        "failed": [],
        "manual_required": [],
        "extracted": [],
    }

    for item in discovered:
        url = item["url"]
        print(f"Downloading: {url[:80]}...")

        insurer_id = _guess_insurer_from_url(url)
        download_result = download_pdf(url, insurer_id)

        if download_result["status"] == "success":
            results["downloaded"].append(download_result)

            parsed = parse_pdf(download_result["filepath"])
            extracted = extract_document(parsed, download_result)

            doc_id = extracted["doc_id"]

            norm_path = Path(NORMALIZED_DIR) / f"{doc_id}.json"
            with open(norm_path, "w") as f:
                json.dump(extracted, f, indent=2, default=str)

            if extracted["quality_flags"].get("manual_review_required"):
                review_path = Path(REVIEW_DIR) / f"{doc_id}_review.json"
                with open(review_path, "w") as f:
                    json.dump(
                        {
                            "doc_id": doc_id,
                            "url": url,
                            "reason": extracted["quality_flags"].get(
                                "manual_review_reason", "low confidence"
                            ),
                            "confidence": extracted["extraction_confidence_overall"],
                        },
                        f,
                        indent=2,
                    )

            results["extracted"].append(extracted)
            print(
                f"  ✅ Extracted: confidence={extracted['extraction_confidence_overall']:.2f}"
            )

        elif download_result["status"] == "manual_required":
            results["manual_required"].append(download_result)
            print(f"  📋 Manual download needed: {download_result['reason']}")

        else:
            results["failed"].append(download_result)
            print(f"  ❌ Failed: {download_result['reason']}")

    _build_dataset(results["extracted"])

    print(f"\n📊 Pipeline Summary:")
    print(f"  Downloaded: {len(results['downloaded'])}")
    print(f"  Extracted:  {len(results['extracted'])}")
    print(f"  Failed:     {len(results['failed'])}")
    print(f"  Manual:     {len(results['manual_required'])}")
    print(f"\nManual downloads needed: {LOGS_DIR}/manual_download_required.txt")

    return results


if __name__ == "__main__":
    run_pipeline()
