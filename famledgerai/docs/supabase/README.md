# 🗄️ Supabase Documentation

Supabase configuration, error handling, database management, and user administration for FamLedgerAI.

## 📄 Documents

### [SUPABASE_ERROR_HANDLING.md](./SUPABASE_ERROR_HANDLING.md)
**Purpose**: Comprehensive guide for handling Supabase authentication errors  
**Last Updated**: March 1, 2026  
**Key Topics**:
- Common authentication errors
- User-friendly error messages
- User management via dashboard and SQL
- Rate limiting and prevention
- Testing best practices
- SQL queries for all scenarios

**Quick Links**:
- [Common Errors](./SUPABASE_ERROR_HANDLING.md#common-authentication-errors)
- [User Management](./SUPABASE_ERROR_HANDLING.md#supabase-user-management)
- [SQL Queries](./SUPABASE_ERROR_HANDLING.md#sql-queries-for-common-scenarios)
- [Rate Limiting](./SUPABASE_ERROR_HANDLING.md#rate-limiting--prevention)

---

## 🔧 Quick Reference

### Most Common Admin Tasks

| Task | Method | Documentation |
|------|--------|---------------|
| View all users | Dashboard → Auth → Users | [Guide](./SUPABASE_ERROR_HANDLING.md#via-supabase-dashboard-recommended) |
| Delete test user | Dashboard or SQL | [SQL Query](./SUPABASE_ERROR_HANDLING.md#4-delete-specific-user) |
| Check user data | SQL Query | [Query](./SUPABASE_ERROR_HANDLING.md#6-view-user-data-table) |
| Clear rate limit | Wait 10 minutes | [Prevention](./SUPABASE_ERROR_HANDLING.md#how-to-avoid-rate-limits-during-testing) |
| Find user by email | SQL Query | [Query](./SUPABASE_ERROR_HANDLING.md#2-find-user-by-email) |

---

## 🚨 Common Error Scenarios

### 1. Email Rate Limit Exceeded
**User Message**: ⏱️ Too many registration attempts. Please wait a few minutes and try again.

**Admin Action**:
```sql
-- Check recent registrations
SELECT email, created_at 
FROM auth.users 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

---

### 2. Email Already Registered
**User Message**: 📧 This email is already registered. Please sign in instead.

**Admin Action**:
```sql
-- Find existing user
SELECT id, email, created_at, email_confirmed_at
FROM auth.users
WHERE email = 'user@example.com';
```

---

### 3. Invalid Login Credentials
**User Message**: ❌ Invalid email or password. Please check and try again.

**Admin Action**:
```sql
-- Check if user exists
SELECT email, email_confirmed_at, last_sign_in_at
FROM auth.users
WHERE email = 'user@example.com';
```

---

## 📊 Database Schema

### auth.users (Supabase Managed)
```sql
- id: UUID (Primary Key)
- email: TEXT (Unique)
- encrypted_password: TEXT
- email_confirmed_at: TIMESTAMP
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- last_sign_in_at: TIMESTAMP
- raw_user_meta_data: JSONB
- raw_app_meta_data: JSONB
```

### user_data (Custom Table)
```sql
- email: TEXT (Primary Key)
- profile: JSONB
- income: JSONB
- expenses: JSONB
- investments: JSONB
- loans: JSONB
- insurance: JSONB
- schemes: JSONB
- bank_accounts: JSONB
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

---

## 🔐 Security Best Practices

### Row Level Security (RLS)
```sql
-- Enable RLS on user_data table
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own data
CREATE POLICY "Users can view own data"
ON user_data FOR SELECT
USING (auth.email() = email);

CREATE POLICY "Users can update own data"
ON user_data FOR UPDATE
USING (auth.email() = email);

CREATE POLICY "Users can insert own data"
ON user_data FOR INSERT
WITH CHECK (auth.email() = email);
```

### API Key Management
- **Anon Key**: Use in client-side code (public)
- **Service Role Key**: NEVER expose in client code (admin only)
- **JWT Secret**: Keep secure, rotate periodically

---

## 🛠️ Useful SQL Queries

### User Management

```sql
-- 1. View all users with metadata
SELECT 
  email,
  raw_user_meta_data->>'name' as name,
  raw_user_meta_data->>'age' as age,
  created_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;

-- 2. Find inactive users (no login in 30 days)
SELECT email, last_sign_in_at
FROM auth.users
WHERE last_sign_in_at < NOW() - INTERVAL '30 days'
OR last_sign_in_at IS NULL;

-- 3. Delete test users
DELETE FROM auth.users 
WHERE email LIKE '%test%@%';

-- 4. Count users by registration date
SELECT 
  DATE(created_at) as date,
  COUNT(*) as registrations
FROM auth.users
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- 5. Find users with unconfirmed emails
SELECT email, created_at
FROM auth.users
WHERE email_confirmed_at IS NULL;
```

### Data Management

```sql
-- 1. View user financial summary
SELECT 
  email,
  profile->>'name' as name,
  (income->>'husband')::numeric + (income->>'wife')::numeric as total_income,
  jsonb_array_length(investments->'mutualFunds') as mf_count,
  jsonb_array_length(loans) as loan_count
FROM user_data;

-- 2. Find users with high loan burden
SELECT 
  email,
  profile->>'name' as name,
  jsonb_array_length(loans) as loan_count
FROM user_data
WHERE jsonb_array_length(loans) > 3;

-- 3. Backup user data
COPY (SELECT * FROM user_data) 
TO '/tmp/user_data_backup.csv' 
WITH CSV HEADER;
```

---

## 📈 Monitoring & Analytics

### Key Metrics to Track

```sql
-- 1. Daily Active Users (DAU)
SELECT 
  DATE(last_sign_in_at) as date,
  COUNT(DISTINCT id) as dau
FROM auth.users
WHERE last_sign_in_at > NOW() - INTERVAL '24 hours'
GROUP BY DATE(last_sign_in_at);

-- 2. User Retention (7-day)
SELECT 
  COUNT(*) as retained_users
FROM auth.users
WHERE last_sign_in_at > NOW() - INTERVAL '7 days'
AND created_at < NOW() - INTERVAL '7 days';

-- 3. Registration Funnel
SELECT 
  COUNT(*) as total_signups,
  COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) as confirmed,
  COUNT(CASE WHEN last_sign_in_at IS NOT NULL THEN 1 END) as logged_in
FROM auth.users;
```

---

## 🔄 Backup & Recovery

### Manual Backup
```bash
# Backup auth.users table
pg_dump -h db.xxx.supabase.co -U postgres -t auth.users > auth_users_backup.sql

# Backup user_data table
pg_dump -h db.xxx.supabase.co -U postgres -t user_data > user_data_backup.sql
```

### Restore from Backup
```bash
# Restore auth.users
psql -h db.xxx.supabase.co -U postgres < auth_users_backup.sql

# Restore user_data
psql -h db.xxx.supabase.co -U postgres < user_data_backup.sql
```

### Automated Backups
Supabase Pro plan includes:
- Daily automated backups
- Point-in-time recovery
- 7-day retention (configurable)

---

## 🐛 Troubleshooting

### Issue: Users can't register
**Check**:
1. Rate limits not exceeded
2. Email format valid
3. Supabase service operational
4. API keys configured correctly

**SQL Diagnostic**:
```sql
-- Check recent failed attempts
SELECT * FROM auth.audit_log_entries
WHERE action = 'user_signedup'
AND error_message IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;
```

---

### Issue: Users can't login
**Check**:
1. Email confirmed
2. Correct credentials
3. Account not locked
4. Session not expired

**SQL Diagnostic**:
```sql
-- Check user status
SELECT 
  email,
  email_confirmed_at,
  last_sign_in_at,
  banned_until
FROM auth.users
WHERE email = 'user@example.com';
```

---

### Issue: Data not saving
**Check**:
1. RLS policies correct
2. User authenticated
3. Network connectivity
4. Payload size limits

**SQL Diagnostic**:
```sql
-- Check if data exists
SELECT * FROM user_data
WHERE email = 'user@example.com';

-- Check RLS policies
SELECT * FROM pg_policies
WHERE tablename = 'user_data';
```

---

## 📞 Support Resources

- **Supabase Status**: https://status.supabase.com
- **Documentation**: https://supabase.com/docs
- **Community**: https://github.com/supabase/supabase/discussions
- **Support**: https://supabase.com/support

---

## 📝 Change Log

| Date | Change | Impact |
|------|--------|--------|
| 2026-03-01 | Added comprehensive error handling | Improved UX |
| 2026-03-01 | Documented all SQL queries | Better admin tools |
| 2026-03-01 | Added rate limiting guide | Reduced abuse |

---

[← Back to Documentation Home](../README.md)
