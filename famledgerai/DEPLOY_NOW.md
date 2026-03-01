# 🚀 Deploy to Production - Step by Step

## ⚠️ IMPORTANT: Add Your Credentials First!

Before deploying, you need to add your Twilio credentials to the `.env` file.

### Step 1: Get Your Twilio Credentials (2 minutes)

1. Go to https://console.twilio.com/ (you should already have this open)
2. Find your **Account SID** (starts with `AC...`)
3. Find your **Auth Token** (click the eye icon to reveal)

### Step 2: Update .env File (1 minute)

Open `famledgerai/.env` and replace these placeholders:

```env
# Replace these with your actual values:
TWILIO_ACCOUNT_SID=your_account_sid_here  ← Replace this
TWILIO_AUTH_TOKEN=your_auth_token_here    ← Replace this
```

**Example** (don't use these - use YOUR credentials):
```env
TWILIO_ACCOUNT_SID=AC1234567890abcdef1234567890abcdef
TWILIO_AUTH_TOKEN=1234567890abcdef1234567890abcdef
```

### Step 3: Get Supabase Service Role Key (1 minute)

1. Go to https://app.supabase.com/project/ivvkzforsgruhofpekir/settings/api
2. Copy the **service_role** key (NOT the anon key)
3. Add it to `.env`:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here  ← Replace this
```

---

## 🚀 Deploy Commands

Once you've added all credentials above, run these commands:

### Option 1: Deploy with Vercel CLI (Recommended)

```bash
# Navigate to project
cd famledgerai

# Deploy to production
vercel --prod
```

### Option 2: Deploy via Git Push

```bash
# Commit changes
git add .
git commit -m "feat: Add WhatsApp integration and modern registration"

# Push to main branch (triggers auto-deploy if connected to Vercel)
git push origin main
```

---

## ✅ Post-Deployment Verification

### 1. Check Deployment Status

Visit your Vercel dashboard to confirm deployment succeeded.

### 2. Test the Integration

```bash
# Test WhatsApp endpoint
curl -X POST https://famledgerai.com/api/whatsapp/test \
  -H "Content-Type: application/json" \
  -d '{"to":"+919876543210","userName":"Test User"}'
```

### 3. Test in Browser

1. Go to https://famledgerai.com
2. Log in to your account
3. Go to **Recurring Expenses** page
4. Click **📱 Test WhatsApp** button
5. Check your WhatsApp for the test message!

---

## 🔧 Add Environment Variables to Vercel

If you're deploying via Vercel dashboard, add these environment variables:

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

| Variable | Value |
|----------|-------|
| `TWILIO_ACCOUNT_SID` | Your Account SID from Twilio |
| `TWILIO_AUTH_TOKEN` | Your Auth Token from Twilio |
| `TWILIO_WHATSAPP_FROM` | `whatsapp:+14155238886` |
| `SUPABASE_URL` | `https://ivvkzforsgruhofpekir.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key from Supabase |

---

## 🐛 Troubleshooting

### Error: "Twilio credentials not configured"

**Solution**: Make sure you added the credentials to `.env` AND to Vercel environment variables.

### Error: "Cannot find module"

**Solution**: Run `npm install` in the famledgerai directory first.

### Deployment fails

**Solution**: Check Vercel logs for specific error messages.

---

## 📞 Need Help?

1. Check the deployment logs in Vercel dashboard
2. Review `WHATSAPP_DEPLOYMENT_CHECKLIST.md` for detailed steps
3. Test locally first: `vercel dev`

---

## ✅ Deployment Checklist

Before deploying, make sure:

- [ ] Twilio Account SID added to .env
- [ ] Twilio Auth Token added to .env
- [ ] Supabase Service Role Key added to .env
- [ ] All files saved
- [ ] No syntax errors (already verified ✅)
- [ ] Ready to deploy!

---

## 🎉 After Successful Deployment

1. Test the WhatsApp integration
2. Send yourself a test message
3. Create a recurring expense and test reminders
4. Share with your users!

---

**Ready?** Add your credentials above, then run:

```bash
cd famledgerai && vercel --prod
```

🚀 **Let's go!**
