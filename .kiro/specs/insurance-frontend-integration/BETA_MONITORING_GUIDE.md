# Beta Monitoring Guide - Quick Reference

**Purpose**: Quick reference for monitoring the insurance module during beta testing

---

## Quick Commands

### Generate Beta Report
```bash
cd famledgerai/famledgerai-v2
npx ts-node scripts/generate-beta-report.ts
```

### View Production Logs (Vercel)
```bash
vercel logs --follow
```

### Filter Beta Analytics Logs
```bash
vercel logs | grep "Beta Analytics"
```

---

## Key Metrics to Track

### 1. Upload Success Rate
**Target**: > 90%  
**Formula**: (Successful Uploads / Total Uploads) × 100

### 2. Extraction Accuracy
**Target**: > 85% for top 5 insurers  
**Measured by**: Number of critical fields extracted / 9 total fields

**Critical Fields**:
1. Policy Number
2. Sum Insured
3. Premium Amount
4. Policy Start Date
5. Policy End Date
6. Member Count
7. Room Rent Limit
8. Co-Payment
9. Waiting Periods

### 3. Processing Time
**Target**: < 10 seconds average  
**Measured by**: Total pipeline duration

### 4. Risk Detection
**Track**:
- Total risks detected
- Critical risks count
- High risks count
- Common risk types

### 5. Coverage Gap
**Track**:
- Average coverage gap percentage
- Average policy score

---

## Log Patterns

### Upload Started
```json
{
  "eventType": "upload_started",
  "timestamp": "2025-01-XX",
  "userId": "user-id",
  "data": {
    "fileName": "policy.pdf",
    "fileSize": 1234567,
    "fileSizeMB": "1.18"
  }
}
```

### Upload Summary
```json
{
  "uploadId": "policy-id",
  "timestamp": "2025-01-XX",
  "userId": "user-id",
  "status": "success",
  "extraction": {
    "insurerDetected": "HDFC ERGO",
    "insurerConfidence": 95,
    "totalFieldsExtracted": 8,
    "criticalFieldsMissing": ["roomRentLimit"]
  },
  "performance": {
    "totalDuration": 8500,
    "failedStages": []
  },
  "risks": {
    "totalRisks": 5,
    "criticalRisks": 1,
    "highRisks": 2
  },
  "policyScore": {
    "totalScore": 75,
    "grade": "B"
  }
}
```

### Extraction Details
```json
{
  "insurer": "HDFC ERGO",
  "policyNumber": "POL123456",
  "sumInsured": 500000,
  "premiumAmount": 15000,
  "policyStartDate": "2024-01-01",
  "policyEndDate": "2025-01-01",
  "memberCount": 4,
  "roomRentLimit": "NOT_EXTRACTED",
  "coPayment": 10,
  "waitingPeriods": {
    "initial": 30,
    "preExisting": 730,
    "specificDisease": 365
  },
  "extractionConfidence": 85
}
```

---

## Supabase Queries

### Recent Uploads (Last 7 Days)
```sql
SELECT 
  id,
  insurer_name,
  policy_number,
  sum_insured,
  premium_amount,
  created_at
FROM insurance_policies
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC
LIMIT 50;
```

### Extraction Accuracy by Insurer
```sql
SELECT 
  insurer_name,
  COUNT(*) as total_policies,
  COUNT(policy_number) as has_policy_number,
  COUNT(sum_insured) as has_sum_insured,
  COUNT(premium_amount) as has_premium_amount,
  COUNT(policy_start_date) as has_start_date,
  COUNT(policy_end_date) as has_end_date,
  COUNT(member_count) as has_member_count,
  COUNT(room_rent_limit) as has_room_rent,
  COUNT(co_payment_percentage) as has_copay,
  ROUND(AVG(
    CASE WHEN policy_number IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN sum_insured IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN premium_amount IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN policy_start_date IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN policy_end_date IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN member_count IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN room_rent_limit IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN co_payment_percentage IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN initial_waiting_period IS NOT NULL THEN 1 ELSE 0 END
  ) / 9.0 * 100, 1) as extraction_accuracy_pct
FROM insurance_policies
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY insurer_name
ORDER BY total_policies DESC;
```

### Processing Time Statistics
```sql
SELECT 
  COUNT(*) as total_analyses,
  ROUND(AVG(processing_time_ms) / 1000.0, 2) as avg_time_sec,
  ROUND(MIN(processing_time_ms) / 1000.0, 2) as min_time_sec,
  ROUND(MAX(processing_time_ms) / 1000.0, 2) as max_time_sec,
  ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY processing_time_ms) / 1000.0, 2) as median_time_sec,
  ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY processing_time_ms) / 1000.0, 2) as p95_time_sec
FROM insurance_analysis
WHERE generated_at > NOW() - INTERVAL '7 days';
```

### Policy Score Distribution
```sql
SELECT 
  CASE 
    WHEN (analysis_result->'policy_score'->>'totalScore')::int >= 90 THEN 'A (90-100)'
    WHEN (analysis_result->'policy_score'->>'totalScore')::int >= 80 THEN 'B (80-89)'
    WHEN (analysis_result->'policy_score'->>'totalScore')::int >= 70 THEN 'C (70-79)'
    WHEN (analysis_result->'policy_score'->>'totalScore')::int >= 60 THEN 'D (60-69)'
    ELSE 'F (<60)'
  END as grade,
  COUNT(*) as count,
  ROUND(AVG((analysis_result->'policy_score'->>'totalScore')::int), 1) as avg_score
FROM insurance_analysis
WHERE generated_at > NOW() - INTERVAL '7 days'
  AND analysis_result->'policy_score'->>'totalScore' IS NOT NULL
GROUP BY grade
ORDER BY grade;
```

### Risk Detection Summary
```sql
SELECT 
  COUNT(*) as total_analyses,
  SUM(jsonb_array_length(analysis_result->'risk_analysis'->'risks')) as total_risks,
  ROUND(AVG(jsonb_array_length(analysis_result->'risk_analysis'->'risks')), 1) as avg_risks_per_policy
FROM insurance_analysis
WHERE generated_at > NOW() - INTERVAL '7 days'
  AND analysis_result->'risk_analysis'->'risks' IS NOT NULL;
```

### Coverage Gap Statistics
```sql
SELECT 
  COUNT(*) as total_analyses,
  ROUND(AVG((analysis_result->'coverage_gap_analysis'->>'gapPercentage')::numeric), 1) as avg_gap_pct,
  ROUND(AVG((analysis_result->'coverage_gap_analysis'->>'currentCoverage')::numeric), 0) as avg_current_coverage,
  ROUND(AVG((analysis_result->'coverage_gap_analysis'->>'recommendedCoverage')::numeric), 0) as avg_recommended_coverage
FROM insurance_analysis
WHERE generated_at > NOW() - INTERVAL '7 days'
  AND analysis_result->'coverage_gap_analysis'->>'gapPercentage' IS NOT NULL;
```

---

## Daily Monitoring Checklist

### Morning Check (5 minutes)
- [ ] Run beta report script
- [ ] Check total uploads (yesterday)
- [ ] Check success rate (target: > 90%)
- [ ] Check for critical errors in logs
- [ ] Check average processing time (target: < 10s)

### Evening Check (5 minutes)
- [ ] Review extraction accuracy by insurer
- [ ] Check for new error patterns
- [ ] Review user feedback (if any)
- [ ] Update issue tracker

---

## Alert Thresholds

### Critical (Immediate Action Required)
- Upload success rate < 80%
- Average processing time > 20 seconds
- Critical bugs reported
- System downtime

### High (Action Within 24 Hours)
- Upload success rate < 90%
- Extraction accuracy < 80% for any insurer
- Average processing time > 15 seconds
- High-frequency bugs

### Medium (Action Within 3 Days)
- Extraction accuracy < 85% for any insurer
- Average processing time > 12 seconds
- UX confusion points reported
- Medium-frequency bugs

---

## Common Issues and Solutions

### Issue: Low Extraction Accuracy for Specific Insurer
**Diagnosis**: Check extraction details logs for that insurer  
**Solution**: May need insurer-specific extraction rules

### Issue: High Processing Time
**Diagnosis**: Check performance logs for slow stages  
**Solution**: May need to optimize specific pipeline stage

### Issue: Upload Failures
**Diagnosis**: Check error logs for error codes  
**Solution**: Review error handling and user guidance

### Issue: Missing Fields
**Diagnosis**: Check extraction details for specific fields  
**Solution**: May need to improve field detection patterns

---

## Contact Information

**Primary Contact**: _________  
**Email**: _________  
**Slack Channel**: _________  
**Issue Tracker**: _________

---

## Quick Links

- Beta Validation Plan: `.kiro/specs/insurance-frontend-integration/BETA_VALIDATION_PLAN.md`
- Beta Validation Checklist: `.kiro/specs/insurance-frontend-integration/BETA_VALIDATION_CHECKLIST.md`
- Final Checkpoint: `.kiro/specs/insurance-frontend-integration/FINAL_CHECKPOINT.md`
- Supabase Dashboard: https://supabase.com/dashboard
- Vercel Dashboard: https://vercel.com/dashboard

---

**Last Updated**: 2025-01-XX
