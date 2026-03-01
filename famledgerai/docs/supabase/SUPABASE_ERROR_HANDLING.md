# Supabase Error Handling & User Management Guide

## Table of Contents
1. [Common Authentication Errors](#common-authentication-errors)
2. [User-Friendly Error Messages](#user-friendly-error-messages)
3. [Supabase User Management](#supabase-user-management)
4. [SQL Queries for Common Scenarios](#sql-queries-for-common-scenarios)
5. [Rate Limiting & Prevention](#rate-limiting--prevention)
6. [Testing Best Practices](#testing-best-practices)

---

## Common Authentication Errors

### 1. Email Rate Limit Exceeded
**Technical Error**: `email rate limit exceeded`

**Why it happens**:
- Too many registration attempts from the same IP address
- Multiple signup attempts with the same email in a short time
- Rapid-fire testing without delays

**User-Friendly Message**: 
> ⏱️ Too many registration attempts. Please wait a few minutes and try again.

**Solution**:
- Wait 5-10 minutes before trying again
- Use different email addresses for testing
- Contact admin to clear rate limits

---

### 2. Email Already Registered
**Technical Error**: `User already registered` or `email already exists`

**Why it happens**:
- User trying to register with an email that's already in the system
- Previous registration wasn't completed but email was saved

**User-Friendly Message**: 
> 📧 This email is already registered. Please sign in instead.

**Solution**:
- Use the "Sign In" tab instead
- Use a different email address
- Reset password if forgotten

---

### 3. Invalid Login Credentials
**Technical Error**: `Invalid login credentials` or `invalid credentials`

**Why it happens**:
- Wrong email or password
- Email not confirmed yet
- Account doesn't exist

**User-Friendly Message**: 
> ❌ Invalid email or password. Please check and try again.

**Solution**:
- Double-check email and password
- Ensure caps lock is off
- Try password reset if needed

---

### 4. Email Not Confirmed
**Technical Error**: `Email not confirmed`

**Why it happens**:
- User hasn't clicked the confirmation link sent to their email
- Confirmation email went to spam
- Email service delayed

**User-Friendly Message**: 
> 📧 Please verify your email address before signing in.

**Solution**:
- Check email inbox and spam folder
- Click the confirmation link
- Request a new confirmation email

---

### 5. Invalid Email Format
**Technical Error**: `invalid email`

**Why it happens**:
- Email format is incorrect (missing @, domain, etc.)
- Special characters not allowed
- Whitespace in email

**User-Friendly Message**: 
> ❌ Please enter a valid email address.

**Solution**:
- Check email format: user@domain.com
- Remove any spaces
- Use standard characters only

---

### 6. Weak Password
**Technical Error**: `weak password` or `password too short`

**Why it happens**:
- Password less than 6 characters
- Password doesn't meet security requirements

**User-Friendly Message**: 
> 🔒 Password is too weak. Use at least 6 characters with letters and numbers.

**Solution**:
- Use minimum 6 characters
- Mix letters and numbers
- Add special characters for stronger security

---

### 7. Network Errors
**Technical Error**: `fetch failed` or `network error`

**Why it happens**:
- No internet connection
- Supabase service temporarily down
- Firewall blocking requests
- CORS issues

**User-Friendly Message**: 
> 🌐 Unable to connect. Please check your internet connection.

**Solution**:
- Check internet connection
- Try again in a few moments
- Check if Supabase is operational
- Disable VPN if using one

---

### 8. Request Timeout
**Technical Error**: `timeout` or `request timeout`

**Why it happens**:
- Slow internet connection
- Server taking too long to respond
- Large data transfer

**User-Friendly Message**: 
> ⏱️ Request timed out. Please try again.

**Solution**:
- Check internet speed
- Try again with better connection
- Contact support if persists

---

## User-Friendly Error Messages

All error messages in FamLedgerAI follow these principles:

1. **Use emojis** for visual recognition (⏱️ 📧 ❌ 🔒 🌐)
2. **Be specific** about what went wrong
3. **Provide actionable solutions**
4. **Avoid technical jargon**
5. **Show inline** below the relevant field (not popup alerts)

### Error Display Format
```html
<div style="
  display:block; 
  color:var(--red); 
  font-size:12px; 
  margin:-8px 0 12px 4px; 
  padding:8px 12px; 
  background:var(--red-dim); 
  border-left:3px solid var(--red); 
  border-radius:4px;
">
  ⏱️ Too many registration attempts. Please wait a few minutes and try again.
</div>
```

---

## Supabase User Management

### Via Supabase Dashboard (Recommended)

1. **View All Users**:
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Select your project
   - Navigate to **Authentication** → **Users**
   - See list of all registered users

2. **Delete a User**:
   - Find the user in the list
   - Click the three dots (⋮) next to the user
   - Select **Delete User**
   - Confirm deletion

3. **View User Details**:
   - Click on any user email
   - See: ID, email, created date, last sign-in, metadata

4. **Manage Rate Limits**:
   - Go to **Settings** → **API**
   - Scroll to **Rate Limiting**
   - Adjust limits (requires paid plan)

---

## SQL Queries for Common Scenarios

### 1. View All Registered Users
```sql
-- Get all users with key information
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at,
  email_confirmed_at,
  raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC;
```

### 2. Find User by Email
```sql
-- Search for specific user
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users
WHERE email = 'user@example.com';
```

### 3. View User Metadata
```sql
-- See registration data (name, age, goals, etc.)
SELECT 
  email,
  raw_user_meta_data->>'name' as name,
  raw_user_meta_data->>'age' as age,
  raw_user_meta_data->>'occupation' as occupation,
  raw_user_meta_data->>'incomeRange' as income_range,
  raw_user_meta_data->>'goals' as goals,
  raw_user_meta_data->>'risk' as risk_tolerance
FROM auth.users
ORDER BY created_at DESC;
```

### 4. Delete Specific User
```sql
-- Delete user by email (cascades to user_data table)
DELETE FROM auth.users 
WHERE email = 'test@example.com';
```

### 5. Delete Multiple Test Users
```sql
-- Delete all users with test emails
DELETE FROM auth.users 
WHERE email LIKE '%test%@%';

-- Or delete by date (e.g., all users from today)
DELETE FROM auth.users 
WHERE created_at::date = CURRENT_DATE;
```

### 6. View User Data Table
```sql
-- See all user financial data
SELECT 
  email,
  profile->>'name' as name,
  profile->>'age' as age,
  created_at
FROM user_data
ORDER BY created_at DESC;
```

### 7. Delete User and Their Data
```sql
-- Complete cleanup (run in order)
-- 1. Delete from user_data table
DELETE FROM user_data WHERE email = 'user@example.com';

-- 2. Delete from auth.users (this should cascade)
DELETE FROM auth.users WHERE email = 'user@example.com';
```

### 8. Count Users by Registration Date
```sql
-- See registration trends
SELECT 
  created_at::date as registration_date,
  COUNT(*) as user_count
FROM auth.users
GROUP BY created_at::date
ORDER BY registration_date DESC;
```

### 9. Find Unconfirmed Email Users
```sql
-- Users who haven't confirmed their email
SELECT 
  email,
  created_at,
  email_confirmed_at
FROM auth.users
WHERE email_confirmed_at IS NULL
ORDER BY created_at DESC;
```

### 10. Delete All Test Data (DANGEROUS!)
```sql
-- ⚠️ WARNING: This deletes EVERYTHING! Use only in development!
-- Delete all user data
DELETE FROM user_data;

-- Delete all auth users
DELETE FROM auth.users;

-- Reset sequences (optional)
ALTER SEQUENCE IF EXISTS user_data_id_seq RESTART WITH 1;
```

---

## Rate Limiting & Prevention

### ⚠️ IMPORTANT: Rate Limits Apply Per IP Address

**Common Issue**: "I'm using different users but still getting rate limit errors"

**Why**: Supabase rate limits are based on **IP address**, not user email. If you test multiple registrations from the same computer/network, you'll hit the limit even with different email addresses.

**Solution**: See our comprehensive [Rate Limit Testing Guide](../testing/RATE_LIMIT_TESTING_GUIDE.md) for detailed strategies.

---

### Supabase Default Rate Limits

| Action | Free Tier | Pro Tier | Scope |
|--------|-----------|----------|-------|
| Registration | 3-5/hour | Configurable | **Per IP** |
| Login attempts | 30/hour | Configurable | **Per IP** |
| Email sends | 3/hour | Configurable | Per email |
| API requests | 500/second | Configurable | Per IP |

**Key Point**: Rate limits track your **IP address**, not your email. Testing from the same location with different emails will still hit the limit.

---

### Quick Solutions for Testing

#### Solution 1: Email Aliases (Recommended) ⭐
```
test+1@gmail.com
test+2@gmail.com
test+3@gmail.com
test+qa1@gmail.com
test+dev1@gmail.com
```
Gmail ignores everything after `+`, so all emails go to `test@gmail.com`, but Supabase sees them as different users.

**Important**: This helps with email uniqueness but doesn't bypass IP-based rate limits. Space out your attempts!

#### Solution 2: Wait Between Attempts
```
Registration 1: 10:00 AM ✅
Wait 2-3 minutes...
Registration 2: 10:03 AM ✅
Wait 2-3 minutes...
Registration 3: 10:06 AM ✅
```

#### Solution 3: Use Different IP Addresses
- **Mobile Hotspot**: Connect to your phone's hotspot (different IP)
- **VPN**: Connect to VPN for different IP
- **Different Network**: Use office WiFi, coffee shop, etc.

#### Solution 4: Local Supabase (Best for Heavy Testing)
```bash
# Run Supabase locally with NO rate limits
npm install -g supabase
supabase init
supabase start

# Update .env to use local instance
VITE_SUPABASE_URL=http://localhost:54321
```

#### Solution 5: Wait for Rate Limit Reset
- Rate limits reset after 60 minutes
- Wait 10-15 minutes for partial reset
- Check status with SQL query (see below)

---

### Check Your Rate Limit Status

```sql
-- See how many registrations from your IP in last hour
SELECT 
  COUNT(*) as registrations_last_hour,
  MAX(created_at) as last_registration
FROM auth.users
WHERE created_at > NOW() - INTERVAL '1 hour';

-- If count >= 5, you're likely at the rate limit
-- Wait until last_registration + 1 hour
```

---

### For Production Apps

If real users are hitting rate limits:

1. **Upgrade to Pro Plan**: Increase limits in Supabase Dashboard
2. **Implement Retry Logic**: Auto-retry after delay
3. **Add Queue System**: Space out registrations automatically
4. **Monitor Metrics**: Track rate limit hits
5. **Contact Support**: Request custom limits for your use case

---

### Detailed Testing Guide

For comprehensive strategies on testing without hitting rate limits, see:
📖 [Rate Limit Testing Guide](../testing/RATE_LIMIT_TESTING_GUIDE.md)

Topics covered:
- Email alias strategies
- Local Supabase setup
- Automated testing approaches
- Load testing techniques
- Troubleshooting rate limit issues

---

## Testing Best Practices

### For Developers

1. **Use Test Email Pattern**:
   ```javascript
   const testEmail = `test+${Date.now()}@example.com`;
   ```

2. **Clean Up After Tests**:
   ```sql
   -- Delete test users after testing
   DELETE FROM auth.users WHERE email LIKE 'test+%@%';
   ```

3. **Mock Supabase in Unit Tests**:
   ```javascript
   // Don't hit real Supabase in automated tests
   jest.mock('@supabase/supabase-js');
   ```

4. **Use Staging Environment**:
   - Separate Supabase project for testing
   - Different from production database
   - Can reset anytime

### For QA Testing

1. **Test Each Error Scenario**:
   - ✅ Rate limit (try 5+ registrations quickly)
   - ✅ Duplicate email (register twice with same email)
   - ✅ Invalid credentials (wrong password)
   - ✅ Weak password (use "123")
   - ✅ Invalid email (use "notanemail")
   - ✅ Network error (disconnect internet)

2. **Verify Error Messages**:
   - ✅ Displayed inline below field (not popup)
   - ✅ User-friendly language
   - ✅ Includes emoji for visual recognition
   - ✅ Provides actionable solution
   - ✅ Auto-scrolls to error

3. **Test Happy Path**:
   - ✅ Successful registration
   - ✅ Email confirmation
   - ✅ Successful login
   - ✅ Data persistence

### For Production Monitoring

1. **Track Error Rates**:
   ```sql
   -- Monitor failed login attempts
   SELECT 
     DATE_TRUNC('hour', created_at) as hour,
     COUNT(*) as failed_attempts
   FROM auth.audit_log_entries
   WHERE action = 'login' 
     AND error_message IS NOT NULL
   GROUP BY hour
   ORDER BY hour DESC;
   ```

2. **Set Up Alerts**:
   - High rate limit hits
   - Unusual registration patterns
   - Failed login spikes

3. **User Feedback**:
   - Monitor support tickets
   - Track error message clarity
   - Iterate on messaging

---

## Quick Reference

### Most Common Admin Tasks

| Task | Method | Time |
|------|--------|------|
| View all users | Dashboard → Auth → Users | 10 sec |
| Delete test user | Dashboard → Delete User | 20 sec |
| Clear rate limit | Wait 10 minutes | 10 min |
| Check user data | SQL: `SELECT * FROM user_data` | 30 sec |
| Reset test DB | SQL: `DELETE FROM auth.users` | 1 min |

### Emergency Contacts

- **Supabase Status**: https://status.supabase.com
- **Supabase Docs**: https://supabase.com/docs
- **Support**: https://supabase.com/support
- **Community**: https://github.com/supabase/supabase/discussions

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-03-01 | Initial documentation with all error scenarios | FamLedgerAI Team |
| 2026-03-01 | Added inline error display (replaced alerts) | FamLedgerAI Team |
| 2026-03-01 | Added user-friendly error messages with emojis | FamLedgerAI Team |

---

## Related Documentation

- [Authentication Flow](./TESTING_GUIDE.md)
- [Onboarding Wizard](./enhanced-onboarding-complete-profile/requirements.md)
- [Bug Fixes Log](./enhanced-onboarding-complete-profile/BUG_FIXES.md)
- [E2E Test Report](./enhanced-onboarding-complete-profile/E2E_TEST_REPORT.md)
