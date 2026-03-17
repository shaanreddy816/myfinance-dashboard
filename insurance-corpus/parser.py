import pdfplumber
import json
import re
from pathlib import Path
from typing import Dict, List, Optional
from config import PARSED_DIR

ANCHOR_PHRASES = [
    "Room Rent", "ICU", "Co-payment", "Co-Pay",
    "Waiting Period", "Pre-existing", "PED",
    "Sum Insured", "Total Premium", "Restoration",
    "No Claim Bonus", "Cumulative Bonus",
    "Pre-Hospitalization", "Post-Hospitalization",
    "Day Care", "AYUSH", "Ambulance", "Maternity",
    "Network Hospital", "Schedule of Benefits",
    "Exclusions", "Cashless", "Reimbursement",
    "Co-Payment", "Floater", "Family Floater",
]


def parse_pdf(filepath: str) -> Dict:
    """Extract text, tables, and structure from PDF."""
    result = {
        "filepath": filepath,
        "full_text": "",
        "pages": [],
        "tables": [],
        "section_headings": [],
        "anchor_phrases": {},
    }

    try:
        with pdfplumber.open(filepath) as pdf:
            all_text = []
            for page_num, page in enumerate(pdf.pages, 1):
                page_text = page.extract_text() or ""
                all_text.append(page_text)

                tables = page.extract_tables()
                for table in tables:
                    if table:
                        result["tables"].append({
                            "page_number": page_num,
                            "headers": table[0] if table else [],
                            "rows": table[1:] if len(table) > 1 else [],
                            "likely_type": _classify_table(table),
                        })

                for line in page_text.split("\n"):
                    line = line.strip()
                    if line and (line.isupper() or (len(line) < 80 and line.endswith(":"))):
                        result["section_headings"].append({
                            "text": line,
                            "page_number": page_num,
                        })

                result["pages"].append({
                    "page_number": page_num,
                    "text": page_text,
                    "has_table": len(tables) > 0,
                })

            result["full_text"] = "\n".join(all_text)

            for phrase in ANCHOR_PHRASES:
                pattern = re.compile(
                    rf"(.{{0,100}}{re.escape(phrase)}.{{0,200}})", re.IGNORECASE
                )
                matches = pattern.findall(result["full_text"])
                if matches:
                    result["anchor_phrases"][phrase] = matches[:3]

    except Exception as e:
        result["parse_error"] = str(e)
        result["manual_review_required"] = True

    return result


def _classify_table(table: List) -> str:
    if not table or not table[0]:
        return "other"
    headers = " ".join(str(h) for h in table[0] if h).lower()
    if any(w in headers for w in ["premium", "total premium", "e-f"]):
        return "premium_table"
    if any(w in headers for w in ["name", "gender", "dob", "age", "member"]):
        return "member_table"
    if any(w in headers for w in ["benefit", "plan", "covered", "section"]):
        return "benefits_table"
    if any(w in headers for w in ["disease", "condition", "limit", "sublimit"]):
        return "sub_limits_table"
    return "other"
