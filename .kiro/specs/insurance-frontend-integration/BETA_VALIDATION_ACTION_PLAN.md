# Beta Validation Action Plan

**Date**: 2025-01-XX  
**Status**: 🚀 READY TO START  
**Duration**: 2-3 weeks  
**Mode**: Beta Validation & Data Collection

---

## Current Status

✅ **Infrastructure Complete**:
- Beta monitoring commands created
- Beta dashboard implemented (`/beta-dashboard`)
- Feedback collection component ready (`BetaFeedbackPrompt.tsx`)
- Database migration prepared (`BETA_FEEDBACK_MIGRATION.sql`)
- CSV export API ready (`/api/beta/export`)
- Issue tracking template ready
- Operations guide complete
- Build passing (Exit Code 0, 72 routes)

⚠️ **Pending Setup** (Required before beta launch):
- [ ] Apply database migration in Supabase
- [ ] Set admin role for your account
- [ ] Integrate BetaFeedbackPrompt into insurance page
- [ ] Test end-to-end workflow
- [ ] Send beta tester invitations

---

## Phase 1: Pre-Launch Setup (30 minutes)

### Step 1: Apply Database Migration (5 min)

**Action**: Run the migration in Supabase SQL Editor

**File**: `famledgerai/famledgerai-v2/docs/supabase/BETA_FEEDBACK_MIGRATION.sql`

**Steps**:
1. Open Supabase Dashboard → SQL Editor
2. Copy entire migration file
3. Paste and click "Run"
4. Verify table created:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_name = 'insurance_beta_feedback';
   ```
5. Verify view created:
   ```sql
   SELECT * FROM beta_analytics_summary LIMIT 1;
   ```

**Expected Result**: ✅ Table and view created successfully

---

### Step 2: Set Admin Role (2 min)

**Action**: Grant yourself admin access to beta dashboard

**Steps**:
1. In Supabase SQL Editor, run:
   ```sql
   UPDATE auth.users
   SET raw_user_meta_data = jsonb_set(
     COALESCE(raw_user_meta_data, '{}'::jsonb),
     '{role}',
     '"admin"'
   )
   WHERE email = 'YOUR_EMAIL@example.com';
   ```
2. Verify:
   ```sql
   SELECT email, raw_user_meta_data->>'role' as role 
   FROM auth.users WHERE email = 'YOUR_EMAIL@example.com';
   ```

**Expected Result**: ✅ Role shows "admin"

---

### Step 3: Integrate Feedback Prompt (10 min)

**Action**: Add BetaFeedbackPrompt to insurance page

**File**: `famledgerai/famledgerai-v2/src/app/(dashboard)/insurance/page.tsx`

**Changes Needed**:
1. Import component
2. Add state for feedback prompt
3. Show prompt after successful analysis
4. Handle close callback

**Reference**: See `BETA_SETUP_GUIDE.md` Section 3.1 for detailed code

**Expected Result**: ✅ Feedback prompt appears after upload

---

### Step 4: Test End-to-End Workflow (10 min)

**Action**: Validate complete beta workflow

**Test Scenario**:
1. Upload test insurance policy PDF
2. Wait for analysis to complete (7 stages)
3. Verify feedback prompt appears
4. Submit feedback (try all 3 options)
5. Check feedback saved in database
6. Navigate to `/beta-dashboard`
7. Verify metrics updated
8. Click "Export CSV"
9. Verify CSV downloads with data

**Expected Result**: ✅ All steps work without errors

**Verification Queries**:
```sql
-- Check policy created
SELECT id, insurer_name, created_at 
FROM insurance_policies 
ORDER BY created_at DESC LIMIT 1;

-- Check feedback saved
SELECT * FROM insurance_beta_feedback 
ORDER BY created_at DESC LIMIT 1;

-- Check analytics view
SELECT * FROM beta_analytics_summary 
ORDER BY upload_date DESC LIMIT 1;
```

---

### Step 5: Deploy to Production (3 min)

**Action**: Push changes to production

**Commands**:
```bash
cd famledgerai/famledgerai-v2
npm run build  # Verify build passes
git add .
git commit -m "Integrate beta feedback prompt"
git push origin main
```

**Expected Result**: ✅ Vercel auto-deploys successfully

---

## Phase 2: Beta Launch (1 hour)

### Step 1: Prepare Beta Tester List

**Action**: Identify 5-10 beta testers

**Criteria**:
- Mix of technical and non-technical users
- Different insurance providers (HDFC, ICICI, Star Health, Max Life, LIC)
- Different devices (mobile, desktop)
- Willing to provide honest feedback

**Beta Tester Template**:
```
Name: ___________
Email: ___________
Phone: ___________
Insurer: ___________
Device: ___________
```

---

### Step 2: Send Invitations

**Action**: Email beta testers with instructions

**Template**: Use email template from `BETA_OPERATIONS_GUIDE.md` Phase 3

**Key Points to Include**:
- What to test (upload policy, review analysis, provide feedback)
- How long it takes (5-10 minutes)
- Privacy assurance (data is secure)
- Contact for questions
- Thank you for participation

**Channels**:
- Email (primary)
- WhatsApp (follow-up)
- SMS (reminder)

---

### Step 3: Set Up Monitoring

**Action**: Enable daily monitoring routine

**For Windows PowerShell**:
```powershell
cd famledgerai/famledgerai-v2
. .\scripts\beta-monitoring-commands.ps1
```

**For Bash/Linux/Mac**:
```bash
cd famledgerai/famledgerai-v2
source scripts/beta-monitoring-commands.sh
```

**Available Commands**:
- `beta-logs` - View analytics logs (24h)
- `beta-errors` - Check for errors
- `beta-daily` - Quick daily summary
- `beta-help` - Show all commands

---

## Phase 3: Daily Monitoring (5 min/day)

### Morning Routine (Every Day at 9 AM)

**Step 1: Check Dashboard** (2 min)
1. Navigate to `/beta-dashboard`
2. Note total uploads (yesterday)
3. Check success rate (target: >95%)
4. Review extraction accuracy (target: >85%)
5. Check user feedback distribution

**Record**:
```
Date: _______
Uploads: _____
Success Rate: _____%
Avg Accuracy: _____%
Issues: _________
```

---

**Step 2: Review Logs** (1 min)
```powershell
beta-logs | Select-Object -Last 20
```

**Look for**:
- Upload success/failure patterns
- Extraction accuracy logs
- Any error messages
- Performance metrics

---

**Step 3: Check Feedback** (1 min)

**Query in Supabase**:
```sql
SELECT 
  feedback_type,
  COUNT(*) as count
FROM insurance_beta_feedback
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY feedback_type;
```

**Action Items**:
- If "not_accurate" > 20%: Urgent investigation
- If specific issue > 3 reports: Create issue ticket
- If user left notes: Read and respond

---

**Step 4: Quick Health Check** (1 min)

**Query in Supabase**:
```sql
SELECT 
  COUNT(*) as uploads_24h,
  COUNT(DISTINCT insurer_name) as insurers,
  ROUND(AVG(
    CASE WHEN policy_number IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN sum_insured IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN premium_amount IS NOT NULL THEN 1 ELSE 0 END
  ) / 3.0 * 100, 1) as avg_accuracy
FROM insurance_policies
WHERE created_at > NOW() - INTERVAL '24 hours';
```

**Targets**:
- Uploads: Any activity is good
- Insurers: More variety = better
- Accuracy: >85%

---

## Phase 4: Weekly Analysis (30 min/week)

### Step 1: Export Data (5 min)

**Action**: Download beta analytics CSV

**Steps**:
1. Navigate to `/beta-dashboard`
2. Click "Export CSV"
3. Save as `beta-analytics-YYYY-MM-DD.csv`
4. Open in spreadsheet

---

### Step 2: Run Analysis Queries (10 min)

**Query 1: Extraction Accuracy by Insurer**
```sql
SELECT 
  insurer_name,
  COUNT(*) as uploads,
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
  ) / 9.0 * 100, 1) as accuracy_pct
FROM insurance_policies
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY insurer_name
ORDER BY uploads DESC;
```

**Query 2: Most Common Extraction Failures**
```sql
SELECT 
  'policy_number' as field,
  COUNT(*) - COUNT(policy_number) as missing_count
FROM insurance_policies
WHERE created_at > NOW() - INTERVAL '7 days'
UNION ALL
SELECT 'sum_insured', COUNT(*) - COUNT(sum_insured)
FROM insurance_policies WHERE created_at > NOW() - INTERVAL '7 days'
UNION ALL
SELECT 'premium_amount', COUNT(*) - COUNT(premium_amount)
FROM insurance_policies WHERE created_at > NOW() - INTERVAL '7 days'
UNION ALL
SELECT 'room_rent_limit', COUNT(*) - COUNT(room_rent_limit)
FROM insurance_policies WHERE created_at > NOW() - INTERVAL '7 days'
UNION ALL
SELECT 'co_payment', COUNT(*) - COUNT(co_payment_percentage)
FROM insurance_policies WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY missing_count DESC;
```

**Query 3: User Feedback Summary**
```sql
SELECT 
  feedback_type,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
FROM insurance_beta_feedback
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY feedback_type
ORDER BY count DESC;
```

---

### Step 3: Generate Weekly Report (15 min)

**Action**: Create weekly summary using template

**Template**: Use from `BETA_OPERATIONS_GUIDE.md` Phase 5

**Key Sections**:
1. Executive Summary
2. Upload Statistics
3. Extraction Accuracy by Insurer
4. Most Common Extraction Failures
5. User Feedback Distribution
6. Issues and Action Items
7. Recommendations
8. Next Week Focus

**Save As**: `beta-report-week-X-YYYY-MM-DD.md`

---

## Phase 5: Issue Management

### When to Create an Issue

**Triggers**:
- Extraction accuracy < 80% for any insurer
- Same field missing > 3 times
- User reports "not accurate" > 2 times
- Processing time > 15 seconds
- Any error that blocks functionality

---

### Issue Creation Process

**Step 1: Document Issue**

**File**: `.kiro/specs/insurance-frontend-integration/BETA_ISSUE_TRACKER.md`

**Template**:
```markdown
#### Issue #[ID]: [Title]
- **Category**: Extraction / Insurer-Specific / UI / Performance
- **Severity**: Critical / High / Medium / Low
- **Status**: Open
- **Reported**: [Date]
- **Affected**: [Count] users / [Insurer]

**Description**: [What's wrong]
**Impact**: [How it affects users]
**Solution**: [How to fix]

**Action Items**:
- [ ] Investigate
- [ ] Fix
- [ ] Test
- [ ] Deploy
- [ ] Verify
```

---

### Issue Priority

**Critical** (Fix immediately):
- System crashes or errors
- Data loss or corruption
- Security vulnerabilities
- Blocks all users

**High** (Fix within 24-48 hours):
- Extraction accuracy < 70%
- Multiple user complaints
- Affects major insurers
- Performance degradation

**Medium** (Fix within 1 week):
- Extraction accuracy 70-85%
- Minor UI confusion
- Affects specific scenarios
- Workaround available

**Low** (Fix in next sprint):
- Extraction accuracy 85-90%
- Edge cases
- Nice-to-have improvements
- Minimal user impact

---

## Phase 6: Success Metrics

### Daily Targets

| Metric | Target | Alert If |
|--------|--------|----------|
| Upload Success Rate | > 95% | < 90% |
| Extraction Accuracy | > 85% | < 80% |
| Processing Time | < 10s | > 15s |
| User Satisfaction | > 80% | < 70% |

---

### Weekly Targets

| Metric | Target | Status |
|--------|--------|--------|
| Total Uploads | > 20 | [ ] |
| Insurers Covered | > 5 | [ ] |
| Feedback Collected | > 10 | [ ] |
| Issues Resolved | > 80% | [ ] |

---

### Beta Completion Criteria

**Must Achieve** (Required for success):
- [ ] Extraction accuracy > 85% for top 5 insurers
- [ ] User satisfaction > 80% (accurate feedback)
- [ ] Success rate > 95%
- [ ] No critical bugs
- [ ] At least 20 real policy uploads
- [ ] Feedback from at least 10 users

**Should Achieve** (Desired outcomes):
- [ ] Extraction accuracy > 90% for all insurers
- [ ] User satisfaction > 85%
- [ ] Success rate > 98%
- [ ] Average processing time < 8s
- [ ] At least 50 policy uploads
- [ ] Coverage of 8+ insurers

---

## Phase 7: Beta Wrap-Up

### Week 4 Activities

**Step 1: Final Data Export**
- Export all beta analytics CSV
- Archive in documentation
- Backup database tables

**Step 2: Final Report**
- Generate comprehensive final report
- Include all metrics and learnings
- Document issues and resolutions
- Provide recommendations

**Step 3: Decision Point**

**Option A: Improve Extraction Accuracy**
- If accuracy < 90% for major insurers
- If user feedback indicates confusion
- If critical issues remain

**Option B: Start Next Feature**
- If accuracy > 90% for all insurers
- If user satisfaction > 85%
- If no critical issues
- Ready for Health Report Analyzer spec

**Step 4: Thank Beta Testers**
- Send thank you email
- Share results and improvements
- Offer early access to new features
- Request continued feedback

---

## Quick Reference

### Key URLs
- Beta Dashboard: `https://your-domain.com/beta-dashboard`
- Insurance Page: `https://your-domain.com/insurance`
- CSV Export API: `https://your-domain.com/api/beta/export`

### Key Files
- Action Plan: `.kiro/specs/insurance-frontend-integration/BETA_VALIDATION_ACTION_PLAN.md`
- Operations Guide: `.kiro/specs/insurance-frontend-integration/BETA_OPERATIONS_GUIDE.md`
- Issue Tracker: `.kiro/specs/insurance-frontend-integration/BETA_ISSUE_TRACKER.md`
- Monitoring Mode: `.kiro/specs/insurance-frontend-integration/BETA_MONITORING_MODE.md`
- Setup Guide: `.kiro/specs/insurance-frontend-integration/BETA_SETUP_GUIDE.md`

### Key Commands
```powershell
# Load monitoring commands
. .\scripts\beta-monitoring-commands.ps1

# Daily checks
beta-logs
beta-errors
beta-daily

# Weekly analysis
beta-success-rate
beta-accuracy
beta-failures
beta-feedback
```

### Key Queries
```sql
-- Daily summary
SELECT COUNT(*) as uploads_24h
FROM insurance_policies
WHERE created_at > NOW() - INTERVAL '24 hours';

-- Feedback summary
SELECT feedback_type, COUNT(*) 
FROM insurance_beta_feedback
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY feedback_type;

-- Accuracy by insurer
SELECT insurer_name, COUNT(*) as uploads
FROM insurance_policies
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY insurer_name;
```

---

## Timeline

### Week 1: Launch & Initial Testing
- **Day 1**: Complete pre-launch setup
- **Day 2**: Send invitations, first uploads
- **Day 3-7**: Daily monitoring, respond to questions

### Week 2: Active Testing
- **Day 8-14**: Daily monitoring, collect feedback
- **End of Week 2**: Generate first weekly report

### Week 3: Refinement
- **Day 15-21**: Fix high priority issues, daily monitoring
- **End of Week 3**: Generate second weekly report

### Week 4: Wrap-up
- **Day 22-25**: Final testing, validate fixes
- **Day 26-28**: Final report, decision, thank testers

---

## Next Steps

**Immediate** (Today):
1. [ ] Apply database migration
2. [ ] Set admin role
3. [ ] Integrate feedback prompt
4. [ ] Test end-to-end workflow
5. [ ] Deploy to production

**This Week**:
1. [ ] Prepare beta tester list
2. [ ] Send invitations
3. [ ] Set up monitoring commands
4. [ ] Start daily monitoring

**Ongoing** (2-3 weeks):
1. [ ] Daily dashboard checks (5 min/day)
2. [ ] Weekly reports (30 min/week)
3. [ ] Issue tracking and fixes
4. [ ] User communication

---

**Status**: 🚀 READY TO START  
**Duration**: 2-3 weeks  
**Focus**: Real user validation & data collection  
**Goal**: Achieve >85% extraction accuracy and >80% user satisfaction

---

**Created By**: Kiro AI  
**Date**: 2025-01-XX  
**Last Updated**: 2025-01-XX
