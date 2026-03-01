# Rate Limit Testing Guide

**Purpose**: Guide for testing FamLedgerAI without hitting Supabase rate limits  
**Last Updated**: March 1, 2026  
**Audience**: Developers, QA Testers

---

## 🚨 Understanding Rate Limits

### What Are Rate Limits?

Rate limits are security measures that restrict the number of requests from a single IP address within a time window.

**Supabase Default Limits**:
- **Registration**: 3-5 attempts per hour per IP
- **Login**: 30 attempts per hour per IP
- **Email sends**: 3 per hour per email address
- **API calls**: 500 per second

### Why Rate Limits Exist

1. **Prevent spam** - Stop automated bot registrations
2. **Prevent abuse** - Limit brute force attacks
3. **Protect infrastructure** - Prevent server overload
4. **Fair usage** - Ensure service availability for all users

### How Rate Limits Work

```
Rate Limit = IP Address + Time Window + Action Type

Example:
- IP: 192.168.1.100
- Action: Registration
- Limit: 5 attempts per hour
- Window: Rolling 60 minutes

Attempt 1 at 10:00 AM ✅
Attempt 2 at 10:05 AM ✅
Attempt 3 at 10:10 AM ✅
Attempt 4 at 10:15 AM ✅
Attempt 5 at 10:20 AM ✅
Attempt 6 at 10:25 AM ❌ Rate limit exceeded!
Attempt 7 at 11:01 AM ✅ (First attempt expired)
```

---

## ⚠️ Common Rate Limit Errors

### Error 1: Too Many Registration Attempts

**Error Message**:
```
⏱️ Too many registration attempts. Please wait a few minutes and try again.
```

**Cause**: Exceeded registration limit from your IP address

**Solution**: Wait 10-15 minutes or use different IP

---

### Error 2: Email Rate Limit

**Error Message**:
```
📧 Too many emails sent. Please try again later.
```

**Cause**: Exceeded email sending limit (confirmation emails, password resets)

**Solution**: Wait 1 hour or use different email address

---

### Error 3: Login Rate Limit

**Error Message**:
```
⏱️ Too many login attempts. Please wait a few minutes and try again.
```

**Cause**: Multiple failed login attempts from your IP

**Solution**: Wait 10-15 minutes

---

## ✅ Testing Strategies to Avoid Rate Limits

### Strategy 1: Email Aliases (Recommended)

Use Gmail's `+` feature to create unlimited test accounts:

```javascript
// All these emails go to the same inbox
test@gmail.com
test+user1@gmail.com
test+user2@gmail.com
test+qa1@gmail.com
test+dev1@gmail.com
test+scenario1@gmail.com

// Supabase sees them as different users
// But you receive all emails in one inbox
```

**Advantages**:
- ✅ Unlimited test accounts
- ✅ All emails in one inbox
- ✅ Easy to manage
- ✅ No rate limit issues

**How to Use**:
```javascript
// Test script example
const testUsers = [
  'test+user1@gmail.com',
  'test+user2@gmail.com',
  'test+user3@gmail.com',
  'test+user4@gmail.com',
  'test+user5@gmail.com'
];

for (const email of testUsers) {
  await registerUser(email, 'password123');
  // Each registration counts as different user
  // No rate limit hit!
}
```

---

### Strategy 2: Space Out Requests

Add delays between test attempts:

```javascript
// Bad: Rapid fire requests (hits rate limit)
await register('user1@test.com');
await register('user2@test.com');
await register('user3@test.com');
await register('user4@test.com');
await register('user5@test.com'); // ❌ Rate limit!

// Good: Spaced out requests
await register('user1@test.com');
await sleep(2000); // Wait 2 seconds
await register('user2@test.com');
await sleep(2000);
await register('user3@test.com');
await sleep(2000);
await register('user4@test.com');
await sleep(2000);
await register('user5@test.com'); // ✅ Success!

// Helper function
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

**Recommended Delays**:
- Registration: 2-3 minutes between attempts
- Login: 30 seconds between attempts
- Password reset: 5 minutes between attempts

---

### Strategy 3: Use Different IP Addresses

#### Option A: Mobile Hotspot
```
1. Enable mobile hotspot on your phone
2. Connect your computer to the hotspot
3. You now have a different IP address
4. Fresh rate limit counter
```

#### Option B: VPN
```
1. Connect to VPN service
2. Select different server location
3. Get new IP address
4. Test with fresh rate limit
```

#### Option C: Different Networks
```
- Home WiFi
- Office network
- Coffee shop WiFi
- Public library
- Friend's network
```

---

### Strategy 4: Use Different Devices

Each device on different network = different IP:

```
Device 1: Laptop on home WiFi
Device 2: Phone on mobile data
Device 3: Tablet on office WiFi
Device 4: Desktop on VPN

Each device has independent rate limit!
```

---

### Strategy 5: Local Supabase (Best for Heavy Testing)

Run Supabase locally with **no rate limits**:

#### Installation

```bash
# 1. Install Supabase CLI
npm install -g supabase

# 2. Initialize Supabase in your project
cd famledgerai
supabase init

# 3. Start local Supabase
supabase start

# Output will show:
# API URL: http://localhost:54321
# Anon key: eyJhbGc...
# Service role key: eyJhbGc...
```

#### Configuration

```javascript
// Create .env.local for local development
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=<your-local-anon-key>

// Update your code to use environment-specific config
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://prod.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'prod-key';
```

#### Benefits

- ✅ **No rate limits** - Test as much as you want
- ✅ **Fast** - No network latency
- ✅ **Isolated** - Doesn't affect production data
- ✅ **Free** - No API costs
- ✅ **Offline** - Works without internet

#### Usage

```bash
# Start local Supabase
supabase start

# Run your tests
npm run dev

# Stop when done
supabase stop
```

---

### Strategy 6: Clean Up Test Accounts

Regularly delete test accounts to reduce clutter:

```sql
-- Delete all test accounts with +test in email
DELETE FROM auth.users 
WHERE email LIKE '%+test%@%';

-- Delete accounts created today
DELETE FROM auth.users 
WHERE created_at::date = CURRENT_DATE;

-- Delete specific test account
DELETE FROM auth.users 
WHERE email = 'test+user1@gmail.com';

-- Delete all test accounts (CAREFUL!)
DELETE FROM auth.users 
WHERE email LIKE 'test%@%';
```

**Cleanup Script**:
```javascript
// cleanup-test-accounts.js
import { createClient } from '@supabase/supabase-js';

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function cleanupTestAccounts() {
  // Get all test accounts
  const { data: users } = await sb.auth.admin.listUsers();
  
  const testUsers = users.filter(u => 
    u.email.includes('+test') || 
    u.email.startsWith('test@')
  );
  
  console.log(`Found ${testUsers.length} test accounts`);
  
  // Delete each test account
  for (const user of testUsers) {
    await sb.auth.admin.deleteUser(user.id);
    console.log(`Deleted: ${user.email}`);
  }
  
  console.log('Cleanup complete!');
}

cleanupTestAccounts();
```

---

## 🧪 Testing Workflows

### Workflow 1: Quick Manual Testing

**Scenario**: Testing registration flow manually

```
1. Use email alias: yourname+test1@gmail.com
2. Complete registration
3. Test feature
4. Use next alias: yourname+test2@gmail.com
5. Repeat

✅ Can test 10+ times without rate limit
```

---

### Workflow 2: Automated Testing

**Scenario**: Running automated test suite

```javascript
// test-suite.js
describe('Registration Flow', () => {
  const testEmails = [
    'test+auto1@gmail.com',
    'test+auto2@gmail.com',
    'test+auto3@gmail.com',
    'test+auto4@gmail.com',
    'test+auto5@gmail.com'
  ];
  
  testEmails.forEach((email, index) => {
    it(`should register user ${index + 1}`, async () => {
      // Add delay to avoid rate limit
      await sleep(2000);
      
      const result = await register(email, 'password123');
      expect(result.success).toBe(true);
    });
  });
});
```

---

### Workflow 3: Load Testing

**Scenario**: Testing with many users

```javascript
// Use local Supabase for load testing
// NO rate limits!

async function loadTest() {
  const users = [];
  
  // Create 100 test users
  for (let i = 1; i <= 100; i++) {
    const email = `loadtest+user${i}@gmail.com`;
    const result = await register(email, 'password123');
    users.push(result);
    
    if (i % 10 === 0) {
      console.log(`Created ${i} users...`);
    }
  }
  
  console.log(`Load test complete: ${users.length} users created`);
}

// Run with local Supabase
loadTest();
```

---

### Workflow 4: QA Testing

**Scenario**: QA team testing all features

```
Day 1: Registration & Onboarding
- Tester 1: Use test+qa1@gmail.com
- Tester 2: Use test+qa2@gmail.com
- Tester 3: Use test+qa3@gmail.com

Day 2: Dashboard & Features
- Reuse same accounts from Day 1
- Or create new: test+qa4@gmail.com

Day 3: Edge Cases
- Use mobile hotspot for fresh IP
- Test rate limit scenarios
- Test error handling
```

---

## 📊 Rate Limit Monitoring

### Check Your Rate Limit Status

```sql
-- See recent registration attempts from your IP
SELECT 
  created_at,
  email,
  raw_user_meta_data->>'name' as name
FROM auth.users
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- Count registrations in last hour
SELECT COUNT(*) as registrations_last_hour
FROM auth.users
WHERE created_at > NOW() - INTERVAL '1 hour';

-- See if you're close to limit
-- If count >= 5, you're at risk of rate limit
```

### Track Rate Limit Hits

```javascript
// Add to your test suite
let rateLimitHits = 0;

async function testWithTracking(email) {
  try {
    await register(email);
  } catch (error) {
    if (error.message.includes('rate limit')) {
      rateLimitHits++;
      console.warn(`Rate limit hit #${rateLimitHits}`);
      
      // Wait and retry
      await sleep(60000); // Wait 1 minute
      await register(email);
    }
  }
}
```

---

## 🔧 Troubleshooting

### Problem: Hit Rate Limit During Testing

**Symptoms**:
- Error: "Too many registration attempts"
- Can't create new accounts
- Testing blocked

**Solutions**:

1. **Immediate Fix**:
   ```
   - Wait 10-15 minutes
   - Use mobile hotspot
   - Use VPN
   - Switch to different network
   ```

2. **Long-term Fix**:
   ```
   - Set up local Supabase
   - Use email aliases
   - Space out test attempts
   - Clean up old test accounts
   ```

---

### Problem: Need to Test Rate Limit Behavior

**Scenario**: You want to test how app handles rate limits

**Solution**:

```javascript
// Intentionally trigger rate limit
async function testRateLimitHandling() {
  console.log('Testing rate limit behavior...');
  
  // Rapid fire registrations
  for (let i = 1; i <= 10; i++) {
    try {
      await register(`test+rapid${i}@gmail.com`, 'password123');
      console.log(`✅ Registration ${i} succeeded`);
    } catch (error) {
      console.log(`❌ Registration ${i} failed: ${error.message}`);
      
      // Verify error message is user-friendly
      expect(error.message).toContain('Too many registration attempts');
      expect(error.message).toContain('wait a few minutes');
      
      // Verify error displayed inline (not alert)
      const errorDiv = document.getElementById('r-em-error');
      expect(errorDiv.style.display).toBe('block');
      expect(errorDiv.textContent).toContain('⏱️');
      
      break; // Stop after hitting rate limit
    }
  }
}
```

---

### Problem: Production Users Hitting Rate Limit

**Symptoms**:
- Real users reporting registration errors
- Multiple users from same office/network
- Shared IP addresses (corporate, school, etc.)

**Solutions**:

1. **Upgrade Supabase Plan**:
   ```
   - Free tier: 3-5 attempts/hour
   - Pro tier: Configurable limits
   - Enterprise: Custom limits
   ```

2. **Adjust Rate Limits** (Pro plan):
   ```
   Supabase Dashboard
   → Settings
   → API
   → Rate Limiting
   → Increase auth endpoint limits
   ```

3. **Implement Retry Logic**:
   ```javascript
   async function registerWithRetry(email, password, maxRetries = 3) {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await register(email, password);
       } catch (error) {
         if (error.message.includes('rate limit') && i < maxRetries - 1) {
           // Wait exponentially: 1min, 2min, 4min
           const waitTime = Math.pow(2, i) * 60000;
           console.log(`Rate limit hit. Waiting ${waitTime/1000}s...`);
           await sleep(waitTime);
         } else {
           throw error;
         }
       }
     }
   }
   ```

4. **Add Queue System**:
   ```javascript
   // Queue registrations to avoid rate limit
   class RegistrationQueue {
     constructor() {
       this.queue = [];
       this.processing = false;
     }
     
     async add(email, password) {
       return new Promise((resolve, reject) => {
         this.queue.push({ email, password, resolve, reject });
         this.process();
       });
     }
     
     async process() {
       if (this.processing || this.queue.length === 0) return;
       
       this.processing = true;
       const { email, password, resolve, reject } = this.queue.shift();
       
       try {
         const result = await register(email, password);
         resolve(result);
       } catch (error) {
         reject(error);
       }
       
       // Wait 2 minutes between registrations
       await sleep(120000);
       this.processing = false;
       this.process(); // Process next in queue
     }
   }
   
   const regQueue = new RegistrationQueue();
   
   // Usage
   await regQueue.add('user1@example.com', 'pass123');
   await regQueue.add('user2@example.com', 'pass123');
   ```

---

## 📋 Testing Checklist

### Before Testing

- [ ] Decide on testing approach (local vs production)
- [ ] Prepare email aliases if using production
- [ ] Set up local Supabase if doing heavy testing
- [ ] Clean up old test accounts
- [ ] Check current rate limit status

### During Testing

- [ ] Use email aliases for multiple accounts
- [ ] Space out registration attempts (2-3 min)
- [ ] Monitor for rate limit errors
- [ ] Document any rate limit hits
- [ ] Switch IP if needed

### After Testing

- [ ] Clean up test accounts
- [ ] Document any issues found
- [ ] Update test data for next session
- [ ] Stop local Supabase if running

---

## 🎓 Best Practices

### DO ✅

- **Use email aliases** for testing (`+test1`, `+test2`)
- **Set up local Supabase** for heavy testing
- **Space out requests** (2-3 minutes between registrations)
- **Clean up test accounts** regularly
- **Monitor rate limit status** during testing
- **Use different networks** when needed
- **Document rate limit hits** for analysis

### DON'T ❌

- **Don't rapid-fire registrations** in production
- **Don't use same email** repeatedly
- **Don't ignore rate limit errors** in tests
- **Don't test rate limits** on production without plan
- **Don't leave test accounts** cluttering database
- **Don't share test accounts** across team (use aliases)
- **Don't bypass rate limits** maliciously

---

## 📞 Support

### Getting Help

**Hit rate limit during testing?**
1. Check this guide for solutions
2. Try email aliases or local Supabase
3. Contact team lead if persistent issues

**Need higher rate limits?**
1. Discuss with product team
2. Consider Supabase Pro plan upgrade
3. Implement retry logic in code

**Found rate limit bug?**
1. Document the scenario
2. Create bug report with details
3. Include error messages and logs

---

## 🔗 Related Documentation

- [Supabase Error Handling](../supabase/SUPABASE_ERROR_HANDLING.md)
- [Testing Guide](./TESTING_GUIDE.md)
- [Error Handling Test Report](./ERROR_HANDLING_TEST_REPORT.md)
- [Development Guide](../development/README.md)

---

## 📝 Quick Reference

### Email Alias Pattern
```
base+identifier@domain.com

Examples:
test+user1@gmail.com
test+qa1@gmail.com
test+dev1@gmail.com
yourname+test1@gmail.com
```

### Local Supabase Commands
```bash
supabase start    # Start local instance
supabase stop     # Stop local instance
supabase status   # Check status
supabase db reset # Reset database
```

### Cleanup SQL
```sql
-- Delete test accounts
DELETE FROM auth.users WHERE email LIKE '%+test%@%';
```

### Wait Between Requests
```javascript
await sleep(120000); // Wait 2 minutes
```

---

**Last Updated**: March 1, 2026  
**Maintained by**: FamLedgerAI Team  
**Questions?**: bhatinishanthanreddy@gmail.com
