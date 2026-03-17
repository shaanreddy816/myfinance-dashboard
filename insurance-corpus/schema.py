from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum


class DocumentType(str, Enum):
    POLICY_WORDING = "policy_wording"
    CIS = "customer_information_sheet"
    BROCHURE = "brochure"
    PROSPECTUS = "prospectus"
    POLICY_SCHEDULE = "policy_schedule"
    CLAIM_FORM = "claim_form"
    OTHER = "other"


class InsurerCategory(str, Enum):
    SAHI = "SAHI"
    GENERAL = "General"
    PSU = "PSU"


class FieldEvidence(BaseModel):
    value: Any
    page_number: Optional[int] = None
    section_heading: Optional[str] = None
    evidence_text: str
    confidence: float = Field(ge=0.0, le=1.0)


class DocumentMetadata(BaseModel):
    doc_id: str
    source_url: str
    source_domain: str
    file_name: str
    checksum: str
    insurer_name_raw: Optional[str] = None
    insurer_name_normalized: Optional[str] = None
    insurer_category: Optional[InsurerCategory] = None
    product_name: Optional[str] = None
    plan_variant: Optional[str] = None
    uin: Optional[str] = None
    document_type: DocumentType = DocumentType.OTHER
    document_reliability_rank: int = Field(ge=1, le=5, default=1)
    effective_date: Optional[str] = None
    language: str = "en"
    page_count: int = 0
    file_size_bytes: int = 0
    crawl_timestamp: str


class FinancialLimits(BaseModel):
    room_rent_limit_type: Optional[str] = None
    room_rent_limit_amount_inr: Optional[int] = None
    room_rent_limit_details: Optional[str] = None
    icu_limit_type: Optional[str] = None
    icu_limit_amount_inr: Optional[int] = None
    copay_present: Optional[bool] = None
    copay_percent: Optional[int] = None
    copay_conditions: List[str] = []
    disease_sub_limits_present: Optional[bool] = None
    disease_sub_limits_details: List[Dict] = []
    reasonable_and_customary_clause_present: Optional[bool] = None


class WaitingPeriods(BaseModel):
    initial_waiting_period_days: Optional[int] = None
    pre_existing_disease_waiting_years: Optional[int] = None
    specific_disease_waiting_years: Optional[int] = None
    maternity_waiting_years: Optional[int] = None


class QualityFlags(BaseModel):
    ocr_used: bool = False
    ocr_confidence: Optional[float] = None
    scanned_pdf: bool = False
    table_heavy_document: bool = False
    version_ambiguity: bool = False
    schedule_dependent_fields_present: bool = False
    manual_review_required: bool = False
    manual_review_reason: Optional[str] = None


class ExtractedDocument(BaseModel):
    document_metadata: DocumentMetadata
    financial_limits: FinancialLimits = FinancialLimits()
    waiting_periods: WaitingPeriods = WaitingPeriods()
    quality_flags: QualityFlags = QualityFlags()
    evidence: Dict[str, FieldEvidence] = {}
    extraction_confidence_overall: float = 0.0
    DISCLAIMER: str = (
        "This system performs document analysis for informational "
        "assistance only. It is not legal advice, claims approval "
        "advice, underwriting advice, or broker advice. Final coverage "
        "depends on the issued policy schedule, endorsements, insurer "
        "interpretation, and applicable regulations."
    )
