# Requirements Document

## Introduction

The AI Health Report Analysis feature enhances the existing health records module in FamLedgerAI with AI-powered lab report interpretation. When a user uploads a lab report PDF, the system extracts lab values using regex-based extraction (with Claude AI fallback for complex formats), then sends the extracted data to Claude for analysis. Claude returns a structured JSON response that explains results in simple, supportive language — grouping related markers, flagging borderline and out-of-range values, and suggesting actionable next steps. The feature builds on top of the existing health records page, health-records API routes, HealthReportModal component, UploadHealthRecord component, health_records table, and medical_observations table. No new database tables are introduced; the existing `ai_analysis` JSONB column on health_records and the medical_observations table are used to store all AI-generated data. The feature also adds health trend tracking using historical medical_observations and integrates into the dashboard sidebar navigation.

## Glossary

- **Health_Analysis_API**: The POST endpoint at `/api/health-records/analyze-report` that orchestrates PDF text extraction, lab value extraction, Claude AI analysis, and database persistence
- **Lab_Extractor**: The module at `src/lib/health/labExtractor.ts` that uses regex patterns to extract lab values from PDF text, supporting Indian lab report formats and standard Indian reference ranges
- **Health_Report_Prompt**: The system prompt exported from `src/lib/health/healthReportPrompt.ts` that instructs Claude to act as an AI Health Report Educator and Wellness Coach, returning structured JSON analysis
- **Analysis_Modal**: The `HealthAnalysisModal` React component that displays the AI analysis results in an expandable, section-based modal with status badges, health area accordions, trend charts, and disclaimer
- **Health_Records_Page**: The existing dashboard page at `/health-records` that displays uploaded health records with filtering, grid/timeline views, and upload functionality
- **ExtractedLabValue**: The TypeScript type representing a single extracted lab parameter with fields: test_name, value, numeric_value, unit, reference_range, reference_min, reference_max, status, and section
- **AI_Analysis_Response**: The structured JSON object returned by Claude containing: overall_summary, health_areas (with markers, explanations, actions), what_is_good, focus_next, doctor_follow_up, and disclaimer
- **Health_Score_Summary**: The traffic-light summary widget showing counts of green (normal), yellow (borderline), and red (out-of-range) parameters from the latest analysis
- **Trend_Data**: Historical parameter values from the medical_observations table used to render mini line charts and compute trend labels (Improving, Stable, Worsening)

## Requirements

### Requirement 1: AI System Prompt for Health Report Analysis

**User Story:** As a developer, I want a well-defined system prompt for Claude, so that the AI consistently returns structured, supportive health report explanations without diagnosing disease or creating fear.

#### Acceptance Criteria

1. THE Health_Report_Prompt SHALL instruct Claude to act as an AI Health Report Educator and Wellness Coach
2. THE Health_Report_Prompt SHALL prohibit Claude from diagnosing disease, prescribing medicine, replacing a doctor, or creating fear
3. THE Health_Report_Prompt SHALL instruct Claude to use supportive, motivating language in all explanations
4. THE Health_Report_Prompt SHALL instruct Claude to classify each marker into one of four categories: normal/in-range, borderline, out-of-range, or urgent review needed
5. THE Health_Report_Prompt SHALL instruct Claude to group related markers into health areas: sugar metabolism, cholesterol/heart, liver, kidney, thyroid, blood counts, vitamins, and inflammation
6. THE Health_Report_Prompt SHALL instruct Claude to return a JSON object conforming to the AI_Analysis_Response structure with fields: overall_summary, health_areas, what_is_good, focus_next, doctor_follow_up, and disclaimer
7. WHEN user_age or user_gender context is provided, THE Health_Report_Prompt SHALL instruct Claude to factor age and gender into reference range interpretation

### Requirement 2: Lab Value Extraction Engine

**User Story:** As a user, I want the system to automatically extract lab values from my uploaded PDF report, so that I do not have to manually enter each test result.

#### Acceptance Criteria

1. WHEN a PDF text string is provided, THE Lab_Extractor SHALL extract lab values and return an array of ExtractedLabValue objects
2. THE Lab_Extractor SHALL detect common Indian lab test names across categories: Blood Sugar (HbA1c, Fasting Glucose, PP Glucose), Cholesterol (Total, LDL, HDL, Triglycerides), Liver (SGOT, SGPT, Bilirubin), Kidney (Creatinine, Urea, eGFR), Thyroid (TSH, T3, T4), Blood Count/CBC (Hemoglobin, WBC, Platelets, RBC), Vitamins (D, B12, Iron, Ferritin), and Inflammation (ESR, CRP, Uric Acid)
3. THE Lab_Extractor SHALL include standard reference ranges for the Indian population for each supported test
4. WHEN a numeric value is extracted, THE Lab_Extractor SHALL classify the value status as normal, borderline, high, low, or critical by comparing against the reference range
5. WHEN a lab report contains reference range information alongside a test value, THE Lab_Extractor SHALL extract and store the report-provided reference_min and reference_max values
6. THE Lab_Extractor SHALL populate the section field of each ExtractedLabValue to indicate the health area grouping (sugar_metabolism, cholesterol_heart, liver, kidney, thyroid, blood_count, vitamins, inflammation)
7. FOR ALL valid PDF text inputs, extracting lab values then formatting them back to a structured representation then extracting again SHALL produce an equivalent set of ExtractedLabValue objects (round-trip property)

### Requirement 3: Health Report Analysis API

**User Story:** As a user, I want to upload a lab report PDF and receive an AI-powered analysis, so that I can understand my health results in simple language.

#### Acceptance Criteria

1. WHEN a POST request with a valid PDF buffer, filename, and health_record_id is received, THE Health_Analysis_API SHALL authenticate the user before processing
2. WHEN the PDF buffer is received, THE Health_Analysis_API SHALL extract text from the PDF using the existing pdf-parse library
3. WHEN PDF text is extracted, THE Health_Analysis_API SHALL run the Lab_Extractor to obtain ExtractedLabValue objects
4. WHEN the Lab_Extractor returns fewer than 3 ExtractedLabValue objects, THE Health_Analysis_API SHALL fall back to Claude for full text extraction instead of relying solely on regex
5. WHEN extracted values and optional user_age and user_gender context are available, THE Health_Analysis_API SHALL send the data to Claude (claude-sonnet-4-20250514, max_tokens: 3000) with the Health_Report_Prompt
6. WHEN Claude returns a valid JSON response, THE Health_Analysis_API SHALL parse the response into an AI_Analysis_Response object
7. WHEN the AI_Analysis_Response is obtained, THE Health_Analysis_API SHALL save the analysis to the health_records table by updating the ai_analysis JSONB column and setting is_analyzed to true
8. WHEN ExtractedLabValue objects are available, THE Health_Analysis_API SHALL save each value as a row in the medical_observations table with the corresponding health_record_id
9. IF Claude API call fails or times out, THEN THE Health_Analysis_API SHALL return the regex-extracted lab values with a basic summary instead of failing the entire request
10. IF the uploaded file is not a valid PDF or exceeds the size limit, THEN THE Health_Analysis_API SHALL return a descriptive error with an appropriate HTTP status code

### Requirement 4: Health Report Analysis Modal

**User Story:** As a user, I want to view my AI-analyzed health report in a clear, organized modal, so that I can easily understand which areas need attention and what actions to take.

#### Acceptance Criteria

1. WHEN the Analysis_Modal is opened with a health record and its AI_Analysis_Response, THE Analysis_Modal SHALL display an overall status card showing the overall_summary text
2. THE Analysis_Modal SHALL display each health area from the AI_Analysis_Response as an expandable accordion section with the area name, marker count, and overall area status
3. WHEN a health area accordion is expanded, THE Analysis_Modal SHALL show each marker with its value, status badge, plain-language explanation, and suggested actions
4. THE Analysis_Modal SHALL display status badges with colors: green for normal/in-range, yellow for borderline/needs attention, and red for out-of-range/urgent review needed
5. THE Analysis_Modal SHALL display a "What's Going Well" section listing positive findings from the what_is_good field
6. THE Analysis_Modal SHALL display a "Focus Areas" section listing items from the focus_next field
7. THE Analysis_Modal SHALL display a "Doctor Follow-up" section listing items from the doctor_follow_up field
8. THE Analysis_Modal SHALL display a disclaimer section at the bottom with the disclaimer text from the AI_Analysis_Response
9. WHEN the Analysis_Modal close button is activated, THE Analysis_Modal SHALL close and return focus to the Health_Records_Page

### Requirement 5: Health Records Page Enhancement

**User Story:** As a user, I want an enhanced health records page with a guided upload flow and health score summary, so that I can easily upload reports and see my overall health status at a glance.

#### Acceptance Criteria

1. WHEN the user initiates a new upload, THE Health_Records_Page SHALL present a guided flow: choose record type, upload PDF, enter basic info (date, hospital, family member), then trigger AI analysis
2. WHEN health records with AI analysis exist, THE Health_Records_Page SHALL display a Health_Score_Summary widget at the top showing counts of green (normal), yellow (borderline), and red (out-of-range/critical) parameters from the most recent analyzed report
3. THE Health_Records_Page SHALL display each record as a card showing record type icon, title, date, hospital name, family member name, and analysis status (Analyzed/Pending)
4. WHEN a record card with a completed analysis is clicked, THE Health_Records_Page SHALL open the Analysis_Modal with the cached AI_Analysis_Response from the record's ai_analysis column
5. WHEN a PDF upload and AI analysis completes successfully, THE Health_Records_Page SHALL automatically open the Analysis_Modal to display the results

### Requirement 6: Health Trends Visualization

**User Story:** As a user, I want to see trends for my health parameters over time, so that I can track whether my values are improving, stable, or worsening.

#### Acceptance Criteria

1. WHEN the Analysis_Modal is opened for a record, THE Analysis_Modal SHALL include a "Trends" section
2. WHEN a health parameter has 2 or more historical observations in the medical_observations table for the same user, THE Analysis_Modal SHALL display a mini line chart for that parameter using recharts
3. THE Analysis_Modal SHALL compute and display a trend label for each parameter with sufficient history: "Improving" when values move toward the normal range, "Stable" when values remain within a consistent band, or "Worsening" when values move away from the normal range
4. THE Analysis_Modal SHALL query the medical_observations table filtered by user_id, parameter_name, and ordered by observation_date to obtain Trend_Data

### Requirement 7: Navigation Integration

**User Story:** As a user, I want to access Health Records from the dashboard sidebar, so that I can navigate to the feature without searching for it.

#### Acceptance Criteria

1. THE Health_Records_Page SHALL be accessible from the dashboard sidebar navigation with a 🏥 icon and "Health Records" label
2. WHEN health records with out-of-range or critical parameters exist, THE sidebar navigation item SHALL display a badge count indicating the number of records needing attention

### Requirement 8: Data Persistence and Security

**User Story:** As a user, I want my health records and analysis data to be securely stored and isolated, so that only I can access my medical information.

#### Acceptance Criteria

1. THE health_records table SHALL enforce Row Level Security (RLS) policies so that users can only read, insert, update, and delete their own records
2. THE medical_observations table SHALL enforce Row Level Security (RLS) policies so that users can only read and insert observations belonging to their own health records
3. THE health_records table SHALL have an index on (user_id, report_date) for efficient date-ordered queries
4. THE medical_observations table SHALL have an index on (user_id, parameter_name, observation_date) for efficient trend queries
5. THE Health_Analysis_API SHALL verify that the health_record_id in the request belongs to the authenticated user before saving analysis results
6. THE system SHALL store AI analysis results in the existing ai_analysis JSONB column on the health_records table without adding new database tables
