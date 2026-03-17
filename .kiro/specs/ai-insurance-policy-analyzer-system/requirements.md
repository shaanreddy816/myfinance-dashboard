# Requirements Document

## Introduction

The AI Insurance Policy Analyzer System augments the existing deterministic insurance analysis pipeline in FamLedger AI with machine learning and LLM-based capabilities. The current pipeline relies entirely on regex-based field extraction, rule-based scoring, rule-based risk detection, and rule-based claim probability estimation. This feature introduces AI/ML at four key points in the pipeline: (1) LLM-powered field extraction to handle varied PDF formats, tables, and scanned documents, (2) AI-driven policy quality analysis that goes beyond weighted scoring rules, (3) ML-based claim approval probability prediction using historical patterns, and (4) intelligent, context-aware recommendations. The system operates as a hybrid — falling back to the existing deterministic pipeline when AI services are unavailable.

## Glossary

- **Pipeline_Orchestrator**: The service that coordinates the sequential execution of all analysis stages (upload → processing → classification → extraction → analysis → gap analysis → report generation)
- **AI_Field_Extractor**: The new LLM-powered service that extracts structured policy fields from unstructured PDF text, replacing or augmenting the regex-based FieldExtractorService
- **Regex_Field_Extractor**: The existing deterministic field extraction service that uses regex patterns to find policy fields like sum insured, room rent limits, co-payment, and waiting periods
- **AI_Scoring_Engine**: The new AI-powered service that evaluates policy quality using contextual understanding rather than only weighted scoring rules
- **Rules_Scoring_Engine**: The existing deterministic scoring service that calculates policy scores across seven weighted categories (coverage strength, claim friendliness, hidden clauses, network hospitals, premium fairness, restoration benefits, waiting period fairness)
- **ML_Claim_Predictor**: The new machine learning service that predicts claim approval probability using trained models and historical claim patterns
- **Rules_Claim_Estimator**: The existing deterministic claim probability service that estimates claim approval using weighted factor adjustments from a base CSR value
- **AI_Recommendation_Engine**: The new AI-powered service that generates personalized, context-aware policy improvement recommendations
- **ExtractedFields**: The shared data structure containing all extracted policy fields (insurer name, sum insured, premium, room rent limit, co-payment, waiting periods, exclusions, sub-limits, etc.)
- **PolicyScore**: The data structure containing total score (0-100), grade (A-F), and breakdown across seven scoring categories
- **ClaimProbability**: The data structure containing probability (0-100), confidence (0-100), and contributing factors
- **RiskAnalysis**: The data structure containing detected risks, overall risk level, and risk score
- **CoverageGapAnalysis**: The data structure containing current coverage, recommended coverage, gap amount, and recommendations
- **PolicySections**: The segmented text sections of a policy document (policy details, coverage, benefits, exclusions, terms, waiting periods, claim process, network hospitals)
- **Confidence_Score**: A numeric value (0-100) indicating the reliability of an AI-generated result
- **Fallback_Mode**: The operational state where the system uses the existing deterministic pipeline when AI services are unavailable or return low-confidence results

## Requirements

### Requirement 1: AI-Powered Field Extraction

**User Story:** As a user, I want the system to intelligently extract policy fields from any PDF format, so that I get accurate analysis even for policies with tables, unusual layouts, or scanned documents.

#### Acceptance Criteria

1. WHEN a policy document text and PolicySections are provided, THE AI_Field_Extractor SHALL extract all fields defined in the ExtractedFields interface using an LLM prompt with structured output parsing
2. WHEN the AI_Field_Extractor processes a document, THE AI_Field_Extractor SHALL return a Confidence_Score between 0 and 100 for the overall extraction
3. WHEN the AI_Field_Extractor returns a Confidence_Score below 60, THE Pipeline_Orchestrator SHALL fall back to the Regex_Field_Extractor for that document
4. WHEN the AI_Field_Extractor encounters a field it cannot extract, THE AI_Field_Extractor SHALL return null for that field rather than guessing a value
5. THE AI_Field_Extractor SHALL return results conforming to the existing ExtractedFields interface so that downstream services (scoring, risk detection, claim probability, gap analysis) require no changes
6. WHEN the AI_Field_Extractor extracts numeric fields (sum insured, premium, co-payment percentage, waiting periods, hospital count), THE AI_Field_Extractor SHALL validate that extracted values are within plausible ranges (sum insured: 50,000–5,00,00,000; premium: 1,000–50,00,000; co-payment: 0–50%; waiting periods: 0–1460 days; hospital count: 0–50,000)
7. IF the LLM API call fails or times out after 30 seconds, THEN THE Pipeline_Orchestrator SHALL fall back to the Regex_Field_Extractor and log the failure reason
8. WHEN both the AI_Field_Extractor and Regex_Field_Extractor produce results, THE Pipeline_Orchestrator SHALL use the result with the higher extractionConfidence value

### Requirement 2: AI-Powered Policy Quality Scoring

**User Story:** As a user, I want the system to provide an intelligent quality assessment of my policy, so that I understand nuanced strengths and weaknesses that simple rules might miss.

#### Acceptance Criteria

1. WHEN ExtractedFields and the full policy document text are provided, THE AI_Scoring_Engine SHALL generate a PolicyScore with total score (0-100), grade (A-F), and breakdown across the seven existing scoring categories
2. THE AI_Scoring_Engine SHALL return results conforming to the existing PolicyScore interface so that the report generator requires no changes
3. WHEN the AI_Scoring_Engine analyzes a policy, THE AI_Scoring_Engine SHALL include a natural language explanation for each scoring category describing the reasoning behind the assigned score
4. WHEN the AI_Scoring_Engine processes a policy, THE AI_Scoring_Engine SHALL return a Confidence_Score between 0 and 100 for the scoring result
5. WHEN the AI_Scoring_Engine returns a Confidence_Score below 50, THE Pipeline_Orchestrator SHALL fall back to the Rules_Scoring_Engine
6. IF the AI_Scoring_Engine API call fails or times out after 30 seconds, THEN THE Pipeline_Orchestrator SHALL fall back to the Rules_Scoring_Engine and log the failure reason

### Requirement 3: ML-Based Claim Approval Probability Prediction

**User Story:** As a user, I want the system to predict how likely my insurance claim is to be approved using machine learning, so that I get a more accurate probability estimate than rule-based calculations.

#### Acceptance Criteria

1. WHEN ExtractedFields, RiskAnalysis, and CSRData are provided, THE ML_Claim_Predictor SHALL return a ClaimProbability with probability (0-100), confidence (0-100), and contributing factors
2. THE ML_Claim_Predictor SHALL return results conforming to the existing ClaimProbability interface so that the report generator requires no changes
3. WHEN the ML_Claim_Predictor generates a prediction, THE ML_Claim_Predictor SHALL include at least three contributing factors with impact classification (positive, negative, neutral) and weightage
4. WHEN the ML_Claim_Predictor returns a confidence below 40, THE Pipeline_Orchestrator SHALL fall back to the Rules_Claim_Estimator
5. IF the ML_Claim_Predictor API call fails or times out after 30 seconds, THEN THE Pipeline_Orchestrator SHALL fall back to the Rules_Claim_Estimator and log the failure reason
6. THE ML_Claim_Predictor SHALL use the LLM to reason about claim probability based on policy features, insurer reputation, risk factors, and industry claim settlement patterns

### Requirement 4: AI-Powered Risk Detection

**User Story:** As a user, I want the system to detect hidden risks and problematic clauses in my policy using AI, so that I am aware of risks that pattern-matching rules might miss.

#### Acceptance Criteria

1. WHEN ExtractedFields and the full policy document text are provided, THE AI_Scoring_Engine SHALL detect risks and return a RiskAnalysis with risks array, overall risk level, and risk score (0-100)
2. THE AI_Scoring_Engine SHALL return results conforming to the existing RiskAnalysis interface so that downstream services require no changes
3. WHEN the AI_Scoring_Engine detects a risk, THE AI_Scoring_Engine SHALL classify the risk severity as Low, Medium, High, or Critical
4. WHEN the AI_Scoring_Engine detects a risk, THE AI_Scoring_Engine SHALL provide a title, description, impact statement, affected clause reference, and actionable recommendation for each risk
5. THE AI_Scoring_Engine SHALL detect all risk types supported by the existing Rules_Scoring_Engine (room rent cap, co-payment, PED waiting, specific disease waiting, disease sub-limits, limited network, limited restoration, zone restrictions, reasonable customary charges, maternity excluded, AYUSH excluded) plus additional risks identified from the policy text
6. IF the AI risk detection API call fails or times out after 30 seconds, THEN THE Pipeline_Orchestrator SHALL fall back to the existing RiskDetectionService and log the failure reason

### Requirement 5: AI-Powered Recommendations

**User Story:** As a user, I want personalized, context-aware recommendations for improving my insurance coverage, so that I receive actionable advice tailored to my specific policy and family situation.

#### Acceptance Criteria

1. WHEN ExtractedFields, RiskAnalysis, PolicyScore, ClaimProbability, and CoverageGapAnalysis are provided, THE AI_Recommendation_Engine SHALL generate a list of prioritized improvement recommendations
2. WHEN the AI_Recommendation_Engine generates recommendations, THE AI_Recommendation_Engine SHALL prioritize recommendations by impact (high, medium, low) based on the combined risk, score, and gap analysis
3. WHEN the AI_Recommendation_Engine generates a recommendation, THE AI_Recommendation_Engine SHALL include a title, detailed explanation, expected benefit, and estimated priority level for each recommendation
4. THE AI_Recommendation_Engine SHALL generate between 3 and 10 recommendations per policy analysis
5. IF the AI_Recommendation_Engine API call fails or times out after 30 seconds, THEN THE Pipeline_Orchestrator SHALL fall back to the existing deterministic recommendation generation in the ReportGeneratorService and log the failure reason

### Requirement 6: Hybrid Pipeline Orchestration

**User Story:** As a user, I want the system to seamlessly use AI when available and fall back to deterministic analysis when AI is unavailable, so that I always receive a complete analysis report.

#### Acceptance Criteria

1. THE Pipeline_Orchestrator SHALL execute the AI-enhanced pipeline stages in the same sequential order as the existing pipeline: upload → processing → classification → extraction → analysis → gap analysis → report generation
2. WHEN an AI service is used for a pipeline stage, THE Pipeline_Orchestrator SHALL record whether the AI or deterministic service was used for that stage in the PipelineResult metadata
3. WHEN the Pipeline_Orchestrator falls back to a deterministic service, THE Pipeline_Orchestrator SHALL include a fallback indicator in the stage status so the report can inform the user
4. THE Pipeline_Orchestrator SHALL complete the full pipeline within 60 seconds including all AI API calls
5. WHEN the pipeline completes, THE Pipeline_Orchestrator SHALL return a PipelineResult with the same structure as the existing pipeline so that the API route and UI components require no changes
6. THE Pipeline_Orchestrator SHALL support a configuration option to disable AI services and use only the deterministic pipeline

### Requirement 7: AI Service Configuration and API Integration

**User Story:** As a developer, I want a centralized configuration for AI service settings, so that I can manage API keys, model selection, and fallback thresholds in one place.

#### Acceptance Criteria

1. THE Pipeline_Orchestrator SHALL read AI configuration from environment variables (LLM API key, model name, temperature, max tokens)
2. WHEN the LLM API key environment variable is not set, THE Pipeline_Orchestrator SHALL use the deterministic pipeline for all stages without throwing an error
3. THE Pipeline_Orchestrator SHALL support configurable confidence thresholds for each AI service (field extraction: 60, scoring: 50, claim prediction: 40) via environment variables
4. WHEN an AI service returns a response, THE Pipeline_Orchestrator SHALL log the model used, token count, latency, and confidence score for observability
5. IF the configured LLM model is unavailable, THEN THE Pipeline_Orchestrator SHALL fall back to the deterministic pipeline and log a warning

### Requirement 8: AI-Enhanced Report Generation

**User Story:** As a user, I want the analysis report to clearly indicate which parts were analyzed by AI and which by rules, so that I understand the basis of each finding.

#### Acceptance Criteria

1. WHEN the report is generated, THE ReportGeneratorService SHALL include an analysis method indicator (AI or Deterministic) for each section of the report (field extraction, scoring, risk detection, claim probability, recommendations)
2. WHEN AI-generated content is included in the report, THE ReportGeneratorService SHALL display the Confidence_Score alongside the AI-generated section
3. WHEN the AI_Recommendation_Engine provides recommendations, THE ReportGeneratorService SHALL include the AI-generated recommendations in the report in place of the deterministic recommendations
4. THE ReportGeneratorService SHALL maintain the existing report structure (PolicyReport interface) so that the UI components require no changes
