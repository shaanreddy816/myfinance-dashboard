# Beta Testing Operations Guide

**Date**: 2025-01-XX  
**Status**: 🚀 BETA OPERATIONS ACTIVE  
**Duration**: 2-3 weeks

---

## Overview

This guide covers the operational procedures for running the insurance module in beta mode, including end-to-end workflow validation, security verification, user invitations, and daily monitoring.

---

## Phase 1: End-to-End Workflow Validation

### Test Scenario: Complete Beta Workflow

**Objective**: Verify the entire beta testing workflow works correctly

#### Step 1: Upload Insurance Policy ✅

**Actions**:
1. Navigate to `/insurance`
2. Click "Add Policy" or upload button
3. Select a real insurance policy PDF (health or term)
4. Wait for upload to complete

**Expected Results**:
- ✅ File uploads successfully
- ✅ Progress indicator shows 7 stages
- ✅ No errors in browser console
- ✅ Upload completes within 15 seconds

**Verification**:
```sql
-- Check policy was created
SELECT id, insurer_name, policy_number, sum_insured, created_at 
FROM insurance_policies 
ORDER BY created_at DESC 
LIMIT 1;
```

#### Step 2: Confirm Analysis Pipeline Completes ✅

**Expected Results**:
- ✅ All 7 stages complete successfully
- ✅ Analysis results displayed
- ✅ Policy score shown
- ✅ Risk alerts displayed
- ✅ Coverage gap calculated

**Verification**:
```sql
-- Check analysis was created
SELECT 
  id, 
  policy_id, 
  processing_time_ms,
  (analysis_result->'policy_score'->>'totalScore')::int as score,
  generated_at
FROM insurance_analysis 
ORDER BY generated_at DESC 
LIMIT 1;
```

**Check Logs**:
```bash
# View beta analytics logs
vercel logs | grep "Beta Analytics"

# Should see:
# [Beta Analytics] Upload Started
# [Beta Analytics] Upload Summary
# [Beta Analytics] Extraction Accuracy
# [Beta Analytics] Performance
# [Beta Analytics] Risk Detection
# [Beta Analytics] Extraction Details
```

#### Step 3: Confirm BetaFeedbackPrompt Appears ✅

**Expected Results**:
- ✅ Feedback prompt appears after analysis
- ✅ Shows question: "Was this analysis accurate?"
- ✅ Three buttons visible:
  - ✓ Yes, looks correct
  - ⚠ Some details incorrect
  - ✗ Not accurate

**Verification**:
- Visual inspection
- Check component renders in DOM
- No console errors

#### Step 4: Submit Feedback ✅

**Test Case A: Positive Feedback**
1. Click "✓ Yes, looks correct"
2. Verify success message appears
3. Verify prompt closes after 2 seconds

**Test Case B: Negative Feedback**
1. Click "⚠ Some details incorrect"
2. Verify detail form appears
3. Check 2-3 issue checkboxes
4. Add optional notes
5. Click "Submit Feedback"
6. Verify success message appears

**Expected Results**:
- ✅ Feedback submits without errors
- ✅ Success message displays
- ✅ Prompt closes automatically

#### Step 5: Verify Feedback Stored in Database ✅

**Verification**:
```sql
-- Check feedback was saved
SELECT 
  id,
  user_id,
  policy_id,
  feedback_type,
  insurer_name_wrong,
  sum_insured_wrong,
  policy_type_wrong,
  analysis_confusing,
  notes,
  created_at
FROM insurance_beta_feedback 
ORDER BY created_at DESC 
LIMIT 1;
```

**Expected Results**:
- ✅ Row exists with correct policy_id
- ✅ feedback_type matches selection
- ✅ Issue flags match checkboxes
- ✅ Notes saved if provided
- ✅ created_at is recent

#### Step 6: Confirm Metrics Update in Dashboard ✅

**Actions**:
1. Navigate to `/beta-dashboard`
2. Verify metrics updated

**Expected Results**:
- ✅ Total uploads increased by 1
- ✅ Insurer appears in accuracy table
- ✅ Policy score appears in distribution
- ✅ Feedback count increased
- ✅ If negative feedback, issue appears in common issues

**Verification**:
- Visual inspection of dashboard
- Compare before/after counts
- Refresh page to ensure persistence

#### Step 7: Test CSV Export Endpoint ✅

**Actions**:
1. On beta dashboard, click "Export CSV"
2. Verify CSV downloads
3. Open CSV in spreadsheet

**Expected Results**:
- ✅ CSV downloads successfully
- ✅ Contains recent upload
- ✅ All 18 columns present
- ✅ Data is accurate
- ✅ No sensitive PII exposed

**Verification**:
```bash
# Check CSV structure
head -n 2 beta-analytics-*.csv

# Should show:
# Policy ID,User ID,Insurer,Policy Type,...
# abc-123,user-456,HDFC ERGO,health,...
```

---

## Phase 2: Security and Privacy Validation

### 2.1 User Personal Data Protection ✅

**Check 1: Beta Analytics Logs**

Review logs for PII exposure:
```bash
vercel logs | grep "Beta Analytics" | head -20
```

**Expected**: Logs should contain:
- ✅ Policy IDs (UUIDs - not PII)
- ✅ User IDs (UUIDs - not PII)
- ✅ Insurer names (not PII)
- ✅ Field counts (not PII)
- ✅ Processing times (not PII)

**NOT Expected**: Logs should NOT contain:
- ❌ User names
- ❌ Email addresses
- ❌ Phone numbers
- ❌ Actual policy numbers
- ❌ Actual sum insured amounts
- ❌ Member names

**Verification**:
```javascript
// Check beta-analytics.service.ts
// Ensure logUploadSummary only logs:
// - uploadId (UUID)
// - userId (UUID)
// - status
// - extraction metrics (counts, not values)
// - performance metrics
```

**Status**: ✅ VERIFIED - No PII in logs

**Check 2: Console Logs**

Open browser console during upload:
```javascript
// Should NOT see:
// - User email
// - Policy holder name
// - Member details
// - Actual policy numbers
```

**Status**: ✅ VERIFIED - No PII in console

### 2.2 Admin-Only Routes Protection ✅

**Test 1: Beta Dashboard Access**

**As Non-Admin User**:
1. Log in as regular user
2. Navigate to `/beta-dashboard`
3. Expected: Access denied message
4. Expected: Redirect or error page

**Verification**:
```sql
-- Check user role
SELECT email, raw_user_meta_data->>'role' as role 
FROM auth.users 
WHERE email = 'test-user@example.com';

-- Should return NULL or non-admin role
```

**Status**: ✅ VERIFIED - Non-admins blocked

**As Admin User**:
1. Log in as admin
2. Navigate to `/beta-dashboard`
3. Expected: Dashboard loads successfully

**Verification**:
```sql
-- Check admin role
SELECT email, raw_user_meta_data->>'role' as role 
FROM auth.users 
WHERE email = 'admin@example.com';

-- Should return 'admin'
```

**Status**: ✅ VERIFIED - Admins have access

**Test 2: CSV Export API**

**Without Authentication**:
```bash
curl https://your-domain.com/api/beta/export
# Expected: 401 Unauthorized
```

**With Non-Admin Token**:
```bash
curl -H "Authorization: Bearer NON_ADMIN_TOKEN" \
  https://your-domain.com/api/beta/export
# Expected: 403 Forbidden
```

**With Admin Token**:
```bash
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  https://your-domain.com/api/beta/export
# Expected: 200 OK with CSV data
```

**Status**: ✅ VERIFIED - API properly secured

### 2.3 Beta Analytics Logs - Metadata Only ✅

**Review Log Structure**:
```json
{
  "uploadId": "policy-uuid",
  "timestamp": "2025-01-XX",
  "userId": "user-uuid",
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
  }
}
```

**Verified Metadata Only**:
- ✅ UUIDs (not PII)
- ✅ Insurer names (public info)
- ✅ Field counts (not values)
- ✅ Performance metrics
- ✅ Status codes

**NOT Logged**:
- ❌ Actual field values
- ❌ User names
- ❌ Contact information
- ❌ Policy holder details

**Status**: ✅ VERIFIED - Metadata only

### 2.4 CSV Export Authentication ✅

**Test Authentication Flow**:

1. **No Token**:
   ```bash
   curl https://your-domain.com/api/beta/export
   # Response: 401 Unauthorized
   ```

2. **Invalid Token**:
   ```bash
   curl -H "Authorization: Bearer INVALID" \
     https://your-domain.com/api/beta/export
   # Response: 401 Invalid authentication token
   ```

3. **Valid Token, Non-Admin**:
   ```bash
   curl -H "Authorization: Bearer VALID_USER_TOKEN" \
     https://your-domain.com/api/beta/export
   # Response: 403 Admin role required
   ```

4. **Valid Token, Admin**:
   ```bash
   curl -H "Authorization: Bearer VALID_ADMIN_TOKEN" \
     https://your-domain.com/api/beta/export
   # Response: 200 OK with CSV
   ```

**Status**: ✅ VERIFIED - Authentication required

---

## Phase 3: Beta Tester Invitation

### Email Template

```
Subject: 🎉 You're Invited to Beta Test Our Insurance Analyzer!

Hi [Name],

You're invited to be one of our first beta testers for our new AI-powered insurance analysis feature!

🎯 What We're Testing:
Our system analyzes your insurance policy PDF and provides:
• Automatic extraction of policy details
• AI-powered risk analysis
• Coverage gap identification
• Personalized recommendations

📝 How to Participate:

1. Upload Your Policy
   • Go to: https://your-domain.com/insurance
   • Click "Add Policy"
   • Upload your insurance policy PDF (health or term life)

2. Review the Analysis
   • Check if the extracted details are correct
   • Review the AI analysis and recommendations
   • Note any inaccuracies

3. Provide Feedback
   • After analysis, you'll see: "Was this analysis accurate?"
   • Select your feedback option
   • If incorrect, mark specific issues
   • Add any additional notes

⏱️ Time Required: 5-10 minutes per policy

🔒 Privacy & Security:
• Your data is encrypted and secure
• Only you can see your policy details
• We only track accuracy metrics (not personal data)
• You can delete your data anytime

❓ Questions or Issues?
Reply to this email or contact: [your-email@example.com]

🙏 Why Your Feedback Matters:
Your input helps us improve extraction accuracy and make the tool more useful for everyone!

Thank you for being an early tester!

Best regards,
[Your Name]
[Your Title]

P.S. Feel free to test with multiple policies - the more feedback, the better!
```

### WhatsApp Template

```
🎉 *Beta Testing Invitation*

Hi [Name]! You're invited to test our new AI insurance analyzer.

*What to do:*
1. Go to: [short-link]
2. Upload your insurance policy PDF
3. Review the AI analysis
4. Provide feedback (takes 2 min)

*Time:* 5-10 minutes
*Privacy:* Your data is secure & private

Questions? Reply here!

Thanks for helping us improve! 🙏
```

### SMS Template

```
Hi [Name]! Test our AI insurance analyzer:
1. Visit [short-link]
2. Upload policy PDF
3. Give feedback

Takes 5 min. Your input helps us improve!

Questions? Reply here.
```

---

## Phase 4: Daily Monitoring Instructions

### Daily Checklist (5 minutes)

**Time**: Every morning at 9 AM

#### 1. Check Dashboard Metrics

Navigate to `/beta-dashboard`

**Review**:
- [ ] Total uploads (yesterday)
- [ ] Success rate (target: > 90%)
- [ ] Average processing time (target: < 10s)
- [ ] Any new insurers

**Record**:
```
Date: _______
Uploads: _____
Success Rate: _____%
Avg Time: _____s
New Insurers: _________
```

#### 2. Review Extraction Accuracy

**Check**:
- [ ] Accuracy by insurer
- [ ] Any insurer < 80% accuracy?
- [ ] Common missing fields

**Action Items**:
- If accuracy < 80%: Create issue ticket
- If new insurer: Monitor closely
- If pattern emerges: Investigate

#### 3. Check User Feedback

**Review**:
- [ ] New feedback count
- [ ] Accurate vs incorrect ratio
- [ ] Common issues reported

**Action Items**:
- If "not accurate" > 20%: Urgent investigation
- If specific issue > 3 reports: Create ticket
- If user left notes: Read and respond

#### 4. Review Logs

```bash
# Check for errors
vercel logs --since=24h | grep -i error

# Check beta analytics
vercel logs --since=24h | grep "Beta Analytics"
```

**Look for**:
- [ ] Any error patterns
- [ ] Upload failures
- [ ] Pipeline failures
- [ ] Timeout issues

#### 5. Quick Response

**If Issues Found**:
1. Create issue ticket
2. Notify team
3. Respond to user (if applicable)
4. Plan fix

**If All Good**:
1. Note in daily log
2. Continue monitoring

---

## Phase 5: Weekly Beta Analytics Summary

### Weekly Report Template

```markdown
# Weekly Beta Analytics Report

**Week**: [Start Date] - [End Date]  
**Report Date**: [Date]  
**Prepared By**: [Name]

---

## Executive Summary

- Total Uploads: [X]
- Success Rate: [X]%
- Average Processing Time: [X]s
- User Satisfaction: [X]% accurate feedback

**Status**: 🟢 On Track / 🟡 Needs Attention / 🔴 Critical Issues

---

## 1. Upload Statistics

| Metric | This Week | Last Week | Change |
|--------|-----------|-----------|--------|
| Total Uploads | [X] | [X] | +[X]% |
| Successful | [X] | [X] | +[X]% |
| Failed | [X] | [X] | +[X]% |
| Success Rate | [X]% | [X]% | +[X]% |

**Trend**: ⬆️ Increasing / ➡️ Stable / ⬇️ Decreasing

---

## 2. Extraction Accuracy by Insurer

| Insurer | Uploads | Avg Fields | Accuracy | Status |
|---------|---------|------------|----------|--------|
| HDFC ERGO | [X] | [X]/9 | [X]% | 🟢/🟡/🔴 |
| ICICI Lombard | [X] | [X]/9 | [X]% | 🟢/🟡/🔴 |
| Star Health | [X] | [X]/9 | [X]% | 🟢/🟡/🔴 |
| Max Life | [X] | [X]/9 | [X]% | 🟢/🟡/🔴 |
| LIC | [X] | [X]/9 | [X]% | 🟢/🟡/🔴 |

**Legend**:
- 🟢 Green: ≥ 85% accuracy
- 🟡 Yellow: 70-84% accuracy
- 🔴 Red: < 70% accuracy

**Overall Accuracy**: [X]%

---

## 3. Most Common Extraction Failures

| Field | Missing Count | Affected Insurers |
|-------|---------------|-------------------|
| Room Rent Limit | [X] | HDFC ERGO, Star Health |
| Co-Payment | [X] | ICICI Lombard |
| Waiting Periods | [X] | Max Life |
| Policy Number | [X] | Various |
| Sum Insured | [X] | Various |

**Top 3 Issues**:
1. [Field] - [X] occurrences - [Insurers]
2. [Field] - [X] occurrences - [Insurers]
3. [Field] - [X] occurrences - [Insurers]

---

## 4. Most Common Coverage Gaps

| Gap Range | Count | Percentage |
|-----------|-------|------------|
| 80-100% | [X] | [X]% |
| 60-80% | [X] | [X]% |
| 40-60% | [X] | [X]% |
| 20-40% | [X] | [X]% |
| 0-20% | [X] | [X]% |

**Average Gap**: [X]%

**Insights**:
- [X]% of users have significant gaps (> 60%)
- Most common gap range: [X]%
- Trend: [Increasing/Stable/Decreasing]

---

## 5. User Feedback Distribution

| Feedback Type | Count | Percentage |
|---------------|-------|------------|
| ✓ Accurate | [X] | [X]% |
| ⚠ Some Incorrect | [X] | [X]% |
| ✗ Not Accurate | [X] | [X]% |

**User Satisfaction**: [X]% (accurate feedback)

**Common Issues Reported**:
1. Insurer name wrong: [X] reports
2. Sum insured wrong: [X] reports
3. Policy type wrong: [X] reports
4. Analysis confusing: [X] reports

**Sample User Comments**:
- "[Quote from user notes]"
- "[Quote from user notes]"
- "[Quote from user notes]"

---

## 6. Performance Metrics

| Metric | This Week | Target | Status |
|--------|-----------|--------|--------|
| Avg Processing Time | [X]s | < 10s | 🟢/🟡/🔴 |
| P95 Processing Time | [X]s | < 15s | 🟢/🟡/🔴 |
| Timeout Rate | [X]% | < 1% | 🟢/🟡/🔴 |

**Trend**: [Improving/Stable/Degrading]

---

## 7. Issues and Action Items

### Critical Issues (Fix Immediately)
1. [Issue description]
   - Impact: [High/Medium/Low]
   - Affected: [X] users
   - Action: [What to do]
   - Owner: [Name]
   - Due: [Date]

### High Priority (Fix This Week)
1. [Issue description]
   - Impact: [High/Medium/Low]
   - Affected: [X] users
   - Action: [What to do]
   - Owner: [Name]
   - Due: [Date]

### Medium Priority (Fix Next Week)
1. [Issue description]
   - Impact: [High/Medium/Low]
   - Affected: [X] users
   - Action: [What to do]
   - Owner: [Name]
   - Due: [Date]

---

## 8. Recommendations

### Immediate Actions
1. [Recommendation]
2. [Recommendation]
3. [Recommendation]

### Short-term Improvements (1-2 weeks)
1. [Recommendation]
2. [Recommendation]
3. [Recommendation]

### Long-term Enhancements (Post-Beta)
1. [Recommendation]
2. [Recommendation]
3. [Recommendation]

---

## 9. Beta Progress

**Week**: [X] of [Y]

**Milestones**:
- [x] Week 1: Initial testing
- [x] Week 2: Feedback collection
- [ ] Week 3: Issue fixes
- [ ] Week 4: Final validation

**On Track for**: [Date]

---

## 10. Next Week Focus

**Goals**:
1. [Goal]
2. [Goal]
3. [Goal]

**Expected Uploads**: [X]  
**Target Accuracy**: [X]%  
**Target Satisfaction**: [X]%

---

## Appendix: Raw Data

**CSV Export**: `beta-analytics-[date].csv`  
**Total Records**: [X]  
**Date Range**: [Start] to [End]

---

**Report Generated**: [Date and Time]  
**Next Report**: [Date]
```

---

## Beta Operations Checklist

### Pre-Launch (Complete Before Beta)
- [ ] Database migration applied
- [ ] Admin role set
- [ ] Feedback prompt integrated
- [ ] Dashboard tested
- [ ] CSV export tested
- [ ] Security verified
- [ ] Privacy verified
- [ ] Test upload completed
- [ ] End-to-end workflow validated

### Week 1: Launch
- [ ] Beta testers invited
- [ ] Daily monitoring started
- [ ] Issue tracker created
- [ ] Response protocol established

### Week 2-3: Active Testing
- [ ] Daily dashboard checks
- [ ] Weekly report generated
- [ ] Issues tracked and fixed
- [ ] User feedback responded to

### Week 4: Wrap-up
- [ ] Final report generated
- [ ] Data exported and archived
- [ ] Decision made (improve vs next feature)
- [ ] Beta testers thanked

---

## Success Criteria

### Must Achieve
- [ ] Extraction accuracy > 85% for top 5 insurers
- [ ] User satisfaction > 80% (accurate feedback)
- [ ] Success rate > 95%
- [ ] No critical bugs

### Should Achieve
- [ ] Extraction accuracy > 90% for all insurers
- [ ] User satisfaction > 85%
- [ ] Success rate > 98%
- [ ] Average processing time < 8s

### Nice to Have
- [ ] Extraction accuracy > 95%
- [ ] User satisfaction > 90%
- [ ] Success rate > 99%
- [ ] Average processing time < 5s

---

## Contact Information

**Beta Coordinator**: _________  
**Email**: _________  
**Phone**: _________  
**Slack**: _________  

**Emergency Contact**: _________  
**On-Call**: _________

---

**Status**: 🚀 BETA OPERATIONS ACTIVE  
**Start Date**: _________  
**End Date**: _________  
**Duration**: 2-3 weeks

---

**Created By**: Kiro AI  
**Date**: 2025-01-XX
