# Beta Testing Setup Guide - Quick Start

**Purpose**: Step-by-step guide to set up beta testing infrastructure

---

## Prerequisites

- ✅ Insurance module deployed to production
- ✅ Supabase project configured
- ✅ Admin access to Supabase dashboard

---

## Step 1: Apply Database Migration (5 minutes)

### 1.1 Open Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" in left sidebar
4. Click "New query"

### 1.2 Run Migration Script

Copy and paste the entire contents of:
```
famledgerai/famledgerai-v2/docs/supabase/BETA_FEEDBACK_MIGRATION.sql
```

Click "Run" to execute.

### 1.3 Verify Tables Created

Run this query to verify:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('insurance_beta_feedback');
```

Should return 1 row.

### 1.4 Verify View Created

Run this query:
```sql
SELECT * FROM beta_analytics_summary LIMIT 1;
```

Should execute without errors (may return 0 rows if no data yet).

---

## Step 2: Set Admin Role (2 minutes)

### 2.1 Find Your User ID

In Supabase SQL Editor, run:
```sql
SELECT id, email FROM auth.users WHERE email = 'YOUR_EMAIL@example.com';
```

Copy your user ID.

### 2.2 Set Admin Role

Run this query (replace YOUR_EMAIL):
```sql
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'YOUR_EMAIL@example.com';
```

### 2.3 Verify Admin Role

Run:
```sql
SELECT email, raw_user_meta_data->>'role' as role 
FROM auth.users 
WHERE email = 'YOUR_EMAIL@example.com';
```

Should show `role: admin`.

---

## Step 3: Integrate Feedback Prompt (10 minutes)

### 3.1 Update Insurance Page

Open: `src/app/(dashboard)/insurance/page.tsx`

Add import at top:
```tsx
import { BetaFeedbackPrompt } from '@/components/insurance/BetaFeedbackPrompt';
```

Add state variables:
```tsx
const [showFeedback, setShowFeedback] = useState(false);
const [completedPolicyId, setCompletedPolicyId] = useState<string | null>(null);
```

After successful upload (in your upload success handler):
```tsx
// When upload succeeds and policyId is available
setCompletedPolicyId(policyId);
setShowFeedback(true);
```

Add feedback prompt in JSX (after analysis results):
```tsx
{showFeedback && completedPolicyId && (
  <BetaFeedbackPrompt 
    policyId={completedPolicyId} 
    onClose={() => {
      setShowFeedback(false);
      setCompletedPolicyId(null);
    }} 
  />
)}
```

### 3.2 Test Feedback Prompt

1. Upload a test policy
2. Wait for analysis to complete
3. Verify feedback prompt appears
4. Test all three feedback options
5. Verify feedback saves to database

---

## Step 4: Test Beta Dashboard (5 minutes)

### 4.1 Navigate to Dashboard

Go to: `https://your-domain.com/beta-dashboard`

### 4.2 Verify Access

- Should see dashboard (not access denied)
- Should see metrics cards
- Should see empty tables (if no data yet)

### 4.3 Upload Test Policy

1. Go to Insurance page
2. Upload a test policy
3. Provide feedback
4. Return to beta dashboard
5. Verify metrics updated

### 4.4 Test CSV Export

1. Click "Export CSV" button
2. Verify CSV downloads
3. Open in spreadsheet
4. Verify data is correct

---

## Step 5: Deploy to Production (5 minutes)

### 5.1 Build and Test Locally

```bash
cd famledgerai/famledgerai-v2
npm run build
```

Verify build passes (Exit Code: 0).

### 5.2 Deploy to Vercel

```bash
git add .
git commit -m "Add beta testing infrastructure"
git push origin main
```

Vercel will auto-deploy.

### 5.3 Verify Production

1. Navigate to production URL
2. Test insurance upload
3. Test feedback prompt
4. Test beta dashboard
5. Test CSV export

---

## Step 6: Invite Beta Testers (10 minutes)

### 6.1 Create Beta Tester List

Identify 5-10 users:
- Mix of technical and non-technical
- Different insurance providers
- Different devices (mobile, desktop)

### 6.2 Send Invitations

Email template:
```
Subject: Beta Testing Invitation - Insurance Module

Hi [Name],

You're invited to beta test our new insurance analysis feature!

What to test:
1. Upload your insurance policy PDF
2. Review the extracted information
3. Provide feedback on accuracy

Access: https://your-domain.com/insurance

Please provide feedback after each upload. Your input helps us improve!

Questions? Reply to this email.

Thanks!
[Your Name]
```

### 6.3 Provide Instructions

Share with testers:
- How to upload policies
- What to look for
- How to provide feedback
- Who to contact for issues

---

## Step 7: Monitor Beta Testing (Ongoing)

### 7.1 Daily Checks

Every day:
1. Check beta dashboard
2. Review new uploads
3. Check feedback summary
4. Note any issues

### 7.2 Weekly Analysis

Every week:
1. Export CSV
2. Analyze trends
3. Identify patterns
4. Create issue tickets

### 7.3 Respond to Feedback

When users report issues:
1. Review feedback in dashboard
2. Check extraction details in logs
3. Investigate root cause
4. Create fix if needed
5. Respond to user

---

## Troubleshooting

### Issue: Can't access beta dashboard

**Solution**:
1. Verify admin role is set:
   ```sql
   SELECT email, raw_user_meta_data->>'role' as role 
   FROM auth.users 
   WHERE email = 'YOUR_EMAIL';
   ```
2. If not admin, run Step 2.2 again
3. Log out and log back in
4. Try accessing dashboard again

### Issue: Feedback not saving

**Solution**:
1. Check browser console for errors
2. Verify table exists:
   ```sql
   SELECT * FROM insurance_beta_feedback LIMIT 1;
   ```
3. Check RLS policies are enabled
4. Verify user is authenticated

### Issue: CSV export fails

**Solution**:
1. Check browser console for errors
2. Verify view exists:
   ```sql
   SELECT * FROM beta_analytics_summary LIMIT 1;
   ```
3. Check admin role is set
4. Try exporting again

### Issue: Dashboard shows no data

**Solution**:
1. Verify policies exist:
   ```sql
   SELECT COUNT(*) FROM insurance_policies 
   WHERE created_at > NOW() - INTERVAL '30 days';
   ```
2. If 0, upload a test policy
3. Refresh dashboard
4. Check for JavaScript errors in console

---

## Quick Reference

### Key URLs

- Beta Dashboard: `/beta-dashboard`
- Insurance Page: `/insurance`
- CSV Export API: `/api/beta/export`

### Key Files

- Migration: `docs/supabase/BETA_FEEDBACK_MIGRATION.sql`
- Feedback Component: `src/components/insurance/BetaFeedbackPrompt.tsx`
- Dashboard Page: `src/app/(dashboard)/beta-dashboard/page.tsx`
- Export API: `src/app/api/beta/export/route.ts`

### Key Tables

- `insurance_beta_feedback` - User feedback
- `beta_analytics_summary` - Aggregated view

### Key Queries

**Check admin role**:
```sql
SELECT email, raw_user_meta_data->>'role' as role 
FROM auth.users WHERE email = 'YOUR_EMAIL';
```

**View recent feedback**:
```sql
SELECT * FROM insurance_beta_feedback 
ORDER BY created_at DESC LIMIT 10;
```

**View analytics summary**:
```sql
SELECT * FROM beta_analytics_summary 
ORDER BY upload_date DESC LIMIT 10;
```

---

## Success Checklist

- [ ] Database migration applied
- [ ] Admin role set
- [ ] Feedback prompt integrated
- [ ] Beta dashboard accessible
- [ ] CSV export working
- [ ] Test policy uploaded
- [ ] Test feedback submitted
- [ ] Dashboard shows data
- [ ] CSV export contains data
- [ ] Production deployed
- [ ] Beta testers invited

---

## Next Steps

After setup complete:
1. Monitor dashboard daily
2. Export CSV weekly
3. Respond to feedback
4. Track issues
5. Iterate and improve

---

**Setup Time**: ~30 minutes  
**Status**: Ready for beta testing  
**Support**: _________

---

**Created By**: Kiro AI  
**Date**: 2025-01-XX
