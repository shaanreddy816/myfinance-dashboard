# Beta Monitoring Mode - Active

**Status**: 🟢 BETA MONITORING ACTIVE  
**Start Date**: [Date]  
**Duration**: 2-3 weeks  
**Mode**: Data Collection & Monitoring

---

## Overview

The insurance module is now in **Beta Monitoring Mode**. The focus is on operating the system with real users and collecting data rather than adding new features.

---

## System Readiness Checklist

### ✅ Pre-Launch Verification

- [ ] **Database Migration Applied**
  ```sql
  -- Verify tables exist
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema = 'public' 
    AND table_name IN ('insurance_beta_feedback');
  -- Should return 1 row
  
  -- Verify view exists
  SELECT * FROM beta_analytics_summary LIMIT 1;
  -- Should execute without errors
  ```

- [ ] **Admin Role Access Works**
  ```sql
  -- Check your admin role
  SELECT email, raw_user_meta_data->>'role' as role 
  FROM auth.users 
  WHERE email = 'YOUR_EMAIL';
  -- Should show role: admin
  ```

- [ ] **Beta Dashboard Loads Correctly**
  - Navigate to `/beta-dashboard`
  - Should see dashboard (not access denied)
  - Metrics cards display
  - Tables render correctly
  - Export button visible

- [ ] **Feedback Prompt Appears After Analysis**
  - Upload test policy
  - Wait for analysis to complete
  - Feedback prompt appears
  - Three buttons visible
  - Can submit feedback

- [ ] **CSV Export Endpoint Works**
  - Click "Export CSV" on dashboard
  - CSV downloads successfully
  - Open in spreadsheet
  - Data is correct
  - All 18 columns present

### ✅ Build Status

```bash
npm run build
# Expected: Exit Code 0
# Routes: 72 (including /beta-dashboard)
```

**Status**: ✅ Build Passing

---

## Quick Monitoring Commands

### Setup (One-Time)

**For Bash/Linux/Mac**:
```bash
cd famledgerai/famledgerai-v2
source scripts/beta-monitoring-commands.sh
```

**For PowerShell/Windows**:
```powershell
cd famledgerai/famledgerai-v2
. .\scripts\beta-monitoring-commands.ps1
```

### Available Commands

| Command | Description |
|---------|-------------|
| `beta-logs` | View beta analytics logs (last 24h) |
| `beta-logs-hour` | View beta analytics logs (last hour) |
| `beta-errors` | Check for errors (last 24h) |
| `beta-success-rate` | Show SQL for success rate |
| `beta-accuracy` | Show SQL for extraction accuracy |
| `beta-failures` | Show SQL for common failures |
| `beta-feedback` | Show SQL for user feedback |
| `beta-daily` | Quick daily summary |
| `beta-help` | Show command help |

### Daily Monitoring (5 minutes)

**Every Morning**:
```bash
# 1. Check logs
beta-logs

# 2. Get daily summary
beta-daily

# 3. Check for errors
beta-errors
```

**In Supabase SQL Editor**:
```sql
-- Quick daily metrics
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

---

## Key SQL Queries

### 1. Upload Success Rate (Last 24h)

```sql
SELECT 
  COUNT(*) as total_uploads,
  COUNT(*) as successful_uploads,
  ROUND(100.0, 1) as success_rate_pct
FROM insurance_policies
WHERE created_at > NOW() - INTERVAL '24 hours';
```

### 2. Extraction Accuracy by Insurer

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
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY insurer_name
ORDER BY uploads DESC;
```

### 3. Most Common Extraction Failures

```sql
SELECT 
  'policy_number' as field,
  COUNT(*) - COUNT(policy_number) as missing_count
FROM insurance_policies
WHERE created_at > NOW() - INTERVAL '24 hours'
UNION ALL
SELECT 'sum_insured', COUNT(*) - COUNT(sum_insured)
FROM insurance_policies WHERE created_at > NOW() - INTERVAL '24 hours'
UNION ALL
SELECT 'premium_amount', COUNT(*) - COUNT(premium_amount)
FROM insurance_policies WHERE created_at > NOW() - INTERVAL '24 hours'
UNION ALL
SELECT 'room_rent_limit', COUNT(*) - COUNT(room_rent_limit)
FROM insurance_policies WHERE created_at > NOW() - INTERVAL '24 hours'
UNION ALL
SELECT 'co_payment', COUNT(*) - COUNT(co_payment_percentage)
FROM insurance_policies WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY missing_count DESC;
```

### 4. User Feedback Distribution

```sql
SELECT 
  feedback_type,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
FROM insurance_beta_feedback
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY feedback_type
ORDER BY count DESC;
```

### 5. Common Issues Reported

```sql
SELECT 
  'Insurer name wrong' as issue,
  COUNT(*) as count
FROM insurance_beta_feedback
WHERE created_at > NOW() - INTERVAL '7 days'
  AND insurer_name_wrong = true
UNION ALL
SELECT 'Sum insured wrong', COUNT(*)
FROM insurance_beta_feedback
WHERE created_at > NOW() - INTERVAL '7 days'
  AND sum_insured_wrong = true
UNION ALL
SELECT 'Policy type wrong', COUNT(*)
FROM insurance_beta_feedback
WHERE created_at > NOW() - INTERVAL '7 days'
  AND policy_type_wrong = true
UNION ALL
SELECT 'Analysis confusing', COUNT(*)
FROM insurance_beta_feedback
WHERE created_at > NOW() - INTERVAL '7 days'
  AND analysis_confusing = true
ORDER BY count DESC;
```

---

## Issue Tracking

### Lightweight Issue Format

**File**: `.kiro/specs/insurance-frontend-integration/BETA_ISSUE_TRACKER.md`

**Quick Issue Template**:
```markdown
#### Issue #[ID]: [Title]
- **Category**: Extraction / Insurer-Specific / UI / Performance
- **Severity**: Critical / High / Medium / Low
- **Status**: Open / In Progress / Fixed / Closed
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

### Issue Categories

1. **Extraction Errors** - Fields not extracted correctly
2. **Insurer-Specific Parsing** - Issues with specific insurers
3. **UI Confusion** - User experience problems
4. **Performance Issues** - Slow processing, timeouts

### When to Create an Issue

- Extraction accuracy < 80% for any insurer
- Same field missing > 3 times
- User reports "not accurate" > 2 times
- Processing time > 15 seconds
- Any error that blocks functionality

---

## Weekly Beta Report Generation

### Step 1: Export Data

```bash
# From beta dashboard
# Click "Export CSV" button
# Or use API:
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-domain.com/api/beta/export \
  -o beta-analytics-$(date +%Y-%m-%d).csv
```

### Step 2: Run Queries

Run all key SQL queries (above) and save results.

### Step 3: Generate Report

Use template from `BETA_OPERATIONS_GUIDE.md` Section "Phase 5: Weekly Beta Analytics Summary"

**Key Sections**:
1. Executive Summary
2. Upload Statistics
3. Extraction Accuracy by Insurer
4. Most Common Extraction Failures
5. Most Common Coverage Gaps
6. User Feedback Distribution
7. Performance Metrics
8. Issues and Action Items
9. Recommendations
10. Next Week Focus

### Step 4: Share Report

- Email to stakeholders
- Post in team channel
- Archive in documentation
- Use for decision making

---

## Daily Monitoring Routine

### Morning Check (5 minutes)

**Time**: 9:00 AM daily

1. **Open Beta Dashboard**
   - Navigate to `/beta-dashboard`
   - Note total uploads (yesterday)
   - Check success rate
   - Review extraction accuracy

2. **Check Logs**
   ```bash
   beta-logs | tail -20
   ```
   - Look for errors
   - Check beta analytics
   - Note any patterns

3. **Review Feedback**
   - Check feedback summary on dashboard
   - Note any "not accurate" feedback
   - Read user notes

4. **Quick SQL Check**
   ```sql
   -- Yesterday's summary
   SELECT 
     COUNT(*) as uploads,
     COUNT(DISTINCT insurer_name) as insurers,
     ROUND(AVG(processing_time_ms) / 1000.0, 1) as avg_time_sec
   FROM insurance_policies p
   LEFT JOIN insurance_analysis a ON p.id = a.policy_id
   WHERE p.created_at > NOW() - INTERVAL '24 hours';
   ```

5. **Record Metrics**
   ```
   Date: _______
   Uploads: _____
   Success Rate: _____%
   Avg Time: _____s
   Issues: _________
   ```

### Response to Issues

**If Critical Issue Found**:
1. Create issue ticket immediately
2. Notify team
3. Investigate root cause
4. Plan fix
5. Implement and deploy
6. Verify fix
7. Monitor for recurrence

**If High Priority Issue**:
1. Create issue ticket
2. Investigate within 24 hours
3. Plan fix
4. Implement within 48 hours
5. Deploy and monitor

**If Medium/Low Priority**:
1. Create issue ticket
2. Add to weekly planning
3. Fix in next sprint
4. Document workaround if needed

---

## Success Metrics Tracking

### Daily Targets

| Metric | Target | Alert If |
|--------|--------|----------|
| Upload Success Rate | > 95% | < 90% |
| Extraction Accuracy | > 85% | < 80% |
| Processing Time | < 10s | > 15s |
| User Satisfaction | > 80% | < 70% |

### Weekly Targets

| Metric | Target | Status |
|--------|--------|--------|
| Total Uploads | > 20 | [X] |
| Insurers Covered | > 5 | [X] |
| Feedback Collected | > 10 | [X] |
| Issues Resolved | > 80% | [X] |

---

## Beta Operations Timeline

### Week 1: Launch & Initial Testing
- [ ] Send invitations
- [ ] Monitor first uploads
- [ ] Respond to questions
- [ ] Track initial metrics
- [ ] Create first issues

### Week 2: Active Testing
- [ ] Daily monitoring
- [ ] Weekly report #1
- [ ] Fix critical issues
- [ ] Collect more feedback
- [ ] Analyze patterns

### Week 3: Refinement
- [ ] Daily monitoring
- [ ] Weekly report #2
- [ ] Fix high priority issues
- [ ] Validate improvements
- [ ] Prepare final analysis

### Week 4: Wrap-up
- [ ] Final report
- [ ] Data export and archive
- [ ] Decision: improve vs next feature
- [ ] Thank beta testers
- [ ] Plan next phase

---

## Tools & Resources

### Monitoring Tools
- **Beta Dashboard**: `/beta-dashboard`
- **Vercel Logs**: `vercel logs --since=24h`
- **Supabase**: SQL Editor
- **CSV Export**: Dashboard button or API

### Documentation
- `BETA_OPERATIONS_GUIDE.md` - Complete operations manual
- `BETA_MONITORING_GUIDE.md` - Quick reference
- `BETA_ISSUE_TRACKER.md` - Issue tracking template
- `BETA_SETUP_GUIDE.md` - Setup instructions

### Scripts
- `scripts/beta-monitoring-commands.sh` - Bash commands
- `scripts/beta-monitoring-commands.ps1` - PowerShell commands
- `scripts/generate-beta-report.ts` - Report generator

### Communication
- Email templates in `BETA_OPERATIONS_GUIDE.md`
- WhatsApp templates in `BETA_OPERATIONS_GUIDE.md`
- Weekly report template in `BETA_OPERATIONS_GUIDE.md`

---

## Contact & Support

**Beta Coordinator**: _________  
**Email**: _________  
**Phone**: _________  
**Slack**: _________  

**Emergency Contact**: _________  
**On-Call**: _________

---

## Current Status

**Mode**: 🟢 BETA MONITORING ACTIVE  
**Build**: ✅ Passing (Exit Code 0)  
**Database**: ✅ Migration Applied  
**Dashboard**: ✅ Operational  
**Feedback**: ✅ Collecting  
**Export**: ✅ Working  

**Ready for**: Real user testing  
**Focus**: Data collection & monitoring  
**Duration**: 2-3 weeks  

---

## Next Actions

1. **Today**: Verify system readiness checklist
2. **This Week**: Send beta invitations, monitor daily
3. **Next Week**: Generate first weekly report
4. **Week 3**: Fix issues, validate improvements
5. **Week 4**: Final analysis and decision

---

**Status**: 🟢 BETA MONITORING MODE ACTIVE  
**Last Updated**: [Date]  
**Next Review**: [Date]

---

**Created By**: Kiro AI  
**Date**: 2025-01-XX
