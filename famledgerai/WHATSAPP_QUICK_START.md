# WhatsApp Integration - Quick Start 🚀

## ✅ You're Almost Done!

Your Twilio WhatsApp sandbox is set up. Now just 3 steps to go live:

---

## Step 1: Get Your Credentials (2 minutes)

1. Go to https://console.twilio.com/
2. Copy your **Account SID** (starts with `AC...`)
3. Copy your **Auth Token** (click eye icon to reveal)

---

## Step 2: Add to Environment (1 minute)

Create or edit `famledgerai/.env`:

```env
TWILIO_ACCOUNT_SID=AC...paste_here
TWILIO_AUTH_TOKEN=paste_here
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

---

## Step 3: Deploy & Test (2 minutes)

```bash
cd famledgerai
vercel --prod
```

Then:
1. Open https://famledgerai.com
2. Go to **Recurring Expenses** page
3. Click **📱 Test WhatsApp** button
4. Check your WhatsApp! 🎉

---

## What You Get

✅ **Test Button** - Verify WhatsApp integration works
✅ **API Endpoints** - Send messages programmatically
✅ **Reminder System** - Auto-remind users of upcoming payments
✅ **Cost Effective** - ₹6/year per user (12 messages)

---

## API Endpoints Created

### 1. Test Message
```bash
POST /api/whatsapp/test
Body: { "to": "+919876543210", "userName": "Shantan" }
```

### 2. Send Custom Message
```bash
POST /api/whatsapp/send
Body: { "to": "+919876543210", "message": "Your message" }
```

### 3. Send Reminders
```bash
POST /api/whatsapp/reminders
Body: { "userId": "email@example.com", "daysAhead": 7, "type": "consolidated" }
```

---

## Dashboard Functions

```javascript
// Test WhatsApp integration
testWhatsAppReminder();

// Send reminders for expenses due in next 7 days
sendWhatsAppReminders(7, 'consolidated');

// Send individual reminders
sendWhatsAppReminders(7, 'individual');
```

---

## Troubleshooting

**"Twilio credentials not configured"**
→ Add credentials to `.env` file

**"No WhatsApp number found"**
→ Add WhatsApp number in Profile Settings

**Messages not received**
→ Make sure you joined the sandbox (send "join happy-tiger" to +14155238886)

---

## Full Documentation

See `docs/design/WHATSAPP_SETUP_COMPLETE.md` for:
- Automated monthly reminders setup
- Message format examples
- Cost analysis
- Security best practices
- Production deployment guide

---

**Ready to test?** Just add your Twilio credentials and click the test button! 🚀
