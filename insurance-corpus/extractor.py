import re
import json
from typing import Dict, Optional, List
from schema import ExtractedDocument, DocumentMetadata
from config import NORMALIZED_DIR, REVIEW_DIR
from pathlib import Path
import datetime

INSURER_MAP = {
    "hdfc ergo": "HDFC ERGO General Insurance Company Limited",
    "star health": "Star Health and Allied Insurance Company Limited",
    "care health": "Care Health Insurance Limited",
    "niva bupa": "Niva Bupa Health Insurance Company Limited",
    "manipalcigna": "ManipalCigna Health Insurance Company Limited",
    "aditya birla health": "Aditya Birla Health Insurance Co. Limited",
    "icici lombard": "ICICI Lombard General Insurance Company Limited",
    "bajaj allianz": "Bajaj Allianz General Insurance Company Limited",
    "tata aig": "Tata AIG General Insurance Company Limited",
    "sbi general": "SBI General Insurance Company Limited",
    "new india": "The New India Assurance Company Limited",
    "united india": "United India Insurance Company Limited",
    "oriental": "The Oriental Insurance Company Limited",
    "national insurance": "National Insurance Company Limited",
    "acko": "Acko General Insurance Limited",
    "go digit": "Go Digit General Insurance Limited",
}

IRDAI_MAP = {
    "129": "Star Health and Allied Insurance Company Limited",
    "146": "HDFC ERGO General Insurance Company Limited",
    "137": "Care Health Insurance Limited",
    "190": "Niva Bupa Health Insurance Company Limited",
    "153": "Aditya Birla Health Insurance Co. Limited",
    "151": "ManipalCigna Health Insurance Company Limited",
    "115": "ICICI Lombard General Insurance Company Limited",
    "113": "Bajaj Allianz General Insurance Company Limited",
    "108": "Tata AIG General Insurance Company Limited",
    "144": "SBI General Insurance Company Limited",
    "157": "Acko General Insurance Limited",
    "158": "Go Digit General Insurance Limited",
    "101": "The New India Assurance Company Limited",
    "545": "United India Insurance Company Limited",
    "556": "The Oriental Insurance Company Limited",
    "58": "National Insurance Company Limited",
}


def parse_indian_amount(text: str) -> Optional[int]:
    cleaned = re.sub(r"[₹Rs\.\s,\/\-]", "", str(text))
    try:
        return int(cleaned)
    except ValueError:
        return None


def detect_insurer(full_text: str) -> Optional[str]:
    text_lower = full_text.lower()
    for keyword, name in INSURER_MAP.items():
        if keyword in text_lower:
            return name
    m = re.search(r"IRDAI\s*Reg(?:n)?\.?\s*[Nn]o\.?\s*:?\s*(\d+)", full_text, re.I)
    if m:
        return IRDAI_MAP.get(m.group(1))
    return None


def extract_document(parsed: Dict, download_meta: Dict) -> Dict:
    """Extract all fields from parsed PDF."""
    full_text = parsed.get("full_text", "")

    result = {
        "doc_id": download_meta.get("checksum", "")[:12],
        "source_url": download_meta.get("url", ""),
        "insurer_name_normalized": None,
        "product_name": None,
        "document_type": "other",
        "fields": {},
        "quality_flags": {
            "manual_review_required": False,
            "schedule_dependent_fields_present": False,
        },
        "extraction_confidence_overall": 0.0,
    }

    insurer = detect_insurer(full_text)
    if insurer:
        result["insurer_name_normalized"] = insurer
    else:
        result["quality_flags"]["manual_review_required"] = True
        result["quality_flags"]["manual_review_reason"] = "insurer not detected"

    def extract_field(patterns: List[str], field_name: str, transform=None):
        for pattern in patterns:
            m = re.search(pattern, full_text, re.I)
            if m:
                value = m.group(1).strip()
                if transform:
                    value = transform(value)
                if value is not None:
                    result["fields"][field_name] = {
                        "value": value,
                        "evidence": m.group(0)[:200],
                        "confidence": 0.9,
                    }
                    return

    extract_field([
        r"(?:received an amount of|has paid)\s*(?:Rs\.?|₹)\s*([\d,]+)",
        r"Total Premium\s*[:\-]\s*Rs\.?\s*([\d,]+)",
    ], "total_premium", parse_indian_amount)

    extract_field([
        r"Floater Sum Insured\s*[:\-]?\s*Rs\.?\s*([\d,]+)",
        r"Base sum Insured per insured.*?([\d,]+)",
        r"Sum Insured.*?(?:Rs\.?|₹)\s*([\d,]+)",
    ], "sum_insured", parse_indian_amount)

    extract_field([
        r"PED wait(?:ing)? period.*?(\d+)\s+Years",
        r"pre.?existing.*?waiting.*?(\d+)\s*years",
    ], "ped_waiting_years", int)

    extract_field([
        r"Room Rent\s*[:\-]?\s*(At Actuals|Single Private|[\d,]+.*?(?:per day|\/day)|[\d]+%)",
    ], "room_rent")

    extract_field([
        r"(?:co.?pay|copayment)\s*[:\-]?\s*(\d+)\s*%",
    ], "copayment_percent", int)

    extract_field([
        r"Pre.Hospitalization\s*[:\-]?\s*(\d+)\s*days",
    ], "pre_hospitalization_days", int)

    extract_field([
        r"Post.Hospitalization\s*[:\-]?\s*(\d+)\s*days",
    ], "post_hospitalization_days", int)

    # Calculate confidence
    core_fields = ["total_premium", "sum_insured", "room_rent"]
    extracted = sum(1 for f in core_fields if f in result["fields"])
    result["extraction_confidence_overall"] = (
        extracted / len(core_fields) + (0.3 if insurer else 0)
    ) / 1.3

    if result["extraction_confidence_overall"] < 0.5:
        result["quality_flags"]["manual_review_required"] = True

    return result
