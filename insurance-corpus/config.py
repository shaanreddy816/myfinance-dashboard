from dataclasses import dataclass, field
from typing import List
import os

SEED_URLS = [
    # HDFC ERGO
    "https://www.hdfcergo.com/docs/default-source/downloads/policy-wordings/health/optima-secure-revision-pw.pdf",
    "https://www.hdfcergo.com/docs/default-source/downloads/policy-wordings/health/cis---myoptimasecure.pdf",
    "https://www.hdfcergo.com/health-insurance/optima-secure",
    # Niva Bupa
    "https://transactions.nivabupa.com/pages/doc/policy_wording/ReAssure-2.0-Policy-Wording.pdf",
    "https://otc.nivabupa.com/nivabupalogo/ReAssureBrochure2.0.pdf",
    # Aditya Birla
    "https://www.adityabirlacapital.com/healthinsurance/assets/pdf/active-one/product-information/policy-document.pdf",
    "https://www.adityabirlacapital.com/healthinsurance/assets/pdf/active-one/product-information/prospectus.pdf",
    # ManipalCigna
    "https://www.manipalcigna.com/documents/d/guest/prohealth-prime_p-a-plan_tnc",
    "https://www.manipalcigna.com/documents/d/guest/prohealth-select_v4_tnc",
    "https://www.manipalcigna.com/documents/20124/0/1-ProHealth-Prime_P-A-Plan-CIS-April-22-01.pdf",
    # SBI General
    "https://content.sbigeneral.in/uploads/434ecc86d2294cdaab1aab0dd84f14a1.pdf",
    # ICICI Lombard
    "https://www.icicilombard.com/docs/default-source/default-document-library/health-shield-360-retail_pw.pdf",
    "https://www.icicilombard.com/docs/default-source/default-document-library/health-booster_policy-wordings.pdf",
    "https://www.icicilombard.com/docs/default-source/policy-wordings-product-brochure/complete-health-insurance-(ihealth)-new.pdf",
    # New India
    "https://www.newindia.co.in/assets/docs/know-more/health/new-india-mediclaim-policy/PolicyClauseNewIndiaMediclaimPolicy.pdf",
    "https://www.newindia.co.in/assets/docs/know-more/health/new-india-mediclaim-policy/CIS-New-India-Mediclaim-Policy.pdf",
    # United India
    "https://www.uiic.co.in/web/sites/default/files/Policy-Document/Policy-Wordings-FMP.pdf",
    "https://uiic.co.in/web/sites/default/files/Policy-Document/CIS-FMP.pdf",
    # Star Health (download page - requires navigation)
    "https://www.starhealth.in/downloads/",
    # Care Health
    "https://www.careinsurance.com/health-insurance/policy-wordings.html",
    # Tata AIG
    "https://www.tataaig.com/downloads",
    # Regulators
    "https://irdai.gov.in/list-of-health-insurers",
    "https://irdai.gov.in/list-of-general-insurers",
]

ALLOWED_DOMAINS = [
    "hdfcergo.com", "nivabupa.com", "transactions.nivabupa.com",
    "otc.nivabupa.com", "careinsurance.com", "adityabirlacapital.com",
    "manipalcigna.com", "tataaig.com", "sbigeneral.in",
    "content.sbigeneral.in", "icicilombard.com", "newindia.co.in",
    "uiic.co.in", "starhealth.in", "irdai.gov.in", "policyholder.gov.in",
    "bajajallianz.com", "kotakgeneral.com",
]

DATA_DIR = "data"
RAW_DIR = f"{DATA_DIR}/raw"
PARSED_DIR = f"{DATA_DIR}/parsed"
NORMALIZED_DIR = f"{DATA_DIR}/normalized"
FAILED_DIR = f"{DATA_DIR}/failed"
REVIEW_DIR = f"{DATA_DIR}/review"
LOGS_DIR = f"{DATA_DIR}/logs"

REQUEST_DELAY_SECONDS = 2
REQUEST_TIMEOUT = 30
MAX_RETRIES = 3
MAX_FILE_SIZE_MB = 50
