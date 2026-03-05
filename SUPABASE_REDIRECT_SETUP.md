# Fix Email Verification Redirect

## Problem
Email verification is redirecting to the landing page instead of the profile wizard.

## Root Cause
The redirect URL needs to be whitelisted in Supabase Auth settings.

## Solution

### Step 1: Add Redirect URL to Supabase

1. Go to Supabase Dashboard
2. Click on "Authentication" in the left sidebar
3. Click on "URL Configuration"
4. Under "Redirect URLs", add these URLs:
   ```
   https://famledgerai.com
   https://famledgerai.com/
   https://famledgerai.com/?verified=true
   http://localhost:5173
   http://localhost:5173/?verified=true
   ```
5. Click "Save"

### Step 2: Configure Site URL

In the same "URL Configuration" section:
- Set "Site URL" to: `https://famledgerai.com`

### Step 3: Verify Email Template

1. Go to Authentication → Email Templates
2. Click on "Confirm signup"
3. Make sure the template uses: `{{ .ConfirmationURL }}`
4. The URL should look like: `https://famledgerai.com/?verified=true&token=...`

## After Setup

When users click the verification link, they should:
1. Be redirected to `https://famledgerai.com/?verified=true`
2. See the profile wizard
3. See a success toast message

## Test

1. Register a new user
2. Click verification link in email
3. Should land on profile wizard, not landing page
