# Indian Health Insurance Document Intelligence System

## Purpose
Downloads and analyzes official policy documents from all 28 Indian health insurance companies to build a training corpus for FamLedgerAI's insurance extraction engine.

## Architecture

```
insurance-corpus/
├── config.py          # Seed URLs, allowed domains, directory paths
├── schema.py          # Pydantic models for extracted data
├── crawler.py         # Crawl insurer websites for PDF links
├── downloader.py      # Download PDFs with retry + rate limiting
├── parser.py          # Extract text, tables, structure from PDFs
├── extractor.py       # Rules-based field extraction
├── main.py            # Pipeline orchestrator
├── requirements.txt   # Python dependencies
└── data/
    ├── raw/           # Downloaded PDFs by insurer
    ├── parsed/        # Structured text output
    ├── normalized/    # Extracted fields as JSON
    ├── failed/        # Failed downloads
    ├── review/        # Low-confidence extractions
    ├── logs/          # Crawler and downloader logs
    ├── train.jsonl    # Training split (70%)
    ├── val.jsonl      # Validation split (15%)
    └── test.jsonl     # Test split (15%)
```

## Quick Start

```bash
pip install -r requirements.txt
python main.py
```

## Covered Insurers (28)

### SAHIs (5)
Star Health, Care Health, Niva Bupa, ManipalCigna, Aditya Birla Health

### Private General (14)
HDFC ERGO, ICICI Lombard, Bajaj Allianz, Tata AIG, SBI General, Acko, Digit, Reliance General, IFFCO Tokio, Future Generali, Royal Sundaram, Kotak General, Chola MS, Liberty General

### PSU (4)
New India Assurance, United India, Oriental Insurance, National Insurance

## Ethical Crawling
- Respects rate limits (2s delay between requests)
- Only crawls allowed domains
- Identifies itself via User-Agent header
- Logs blocked URLs for manual download
