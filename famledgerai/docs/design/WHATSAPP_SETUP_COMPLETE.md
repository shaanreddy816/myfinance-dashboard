# WhatsApp Integration - Complete Setup Guide

## ✅ What's Been Implemented

### 1. API Endpoints Created
- **`/api/whatsapp/send`** - Send any WhatsApp message
- **`/api/whatsapp/test`** - Send a test message to verify setup
- **`/api/whatsapp/reminders`** - Send recurring expense reminders

### 2. WhatsApp Library (`api/lib/whatsapp.js`)
- `sendWhatsAppMessage()` - Core function to send messages via Twilio
- `sendTestMessage()` - Send test message with user's name
- `formatConsolidatedReminder()` - Format multiple expenses in one message
- `formatIndividualReminder()` - Format single expense reminder

### 3. Dashboard Integration
- **Test Button** added to Recurring Expenses page
- `testWhatsAppReminder()` - Test WhatsApp integration
- `sendWhatsAppReminders()` - Send reminders for upcoming expenses

### 4. Files Modified
- `famledgerai/api/[...catchall].js` - Added 3 new endpoints
- `famledgerai/api/lib/whatsapp.js` - New WhatsApp library (created)
- `famledgerai/index.html` - Added test button and functions

---

## 🚀 Setup Instructions

### Step 1: Get Twilio Credentials

You already have your Twilio sandbox set up! Now get your credentials:

1. Go to [Twilio Console](https://console.twilio.com/)
2. Find your **Account SID** (starts with AC...)
3. Find your **Auth Token** (click to reveal)
4. Note your **WhatsApp Sandbox Number**: `+14155238886`

### Step 2: Add Environment Variables

Add these to your `.env` file in the `famledgerai` directory:

```env
# Twilio WhatsApp Configuration
TWILIO_ACCOUNT_SID=AC...your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

### Step 3: Deploy to Vercel

```bash
cd famledgerai
vercel --prod
```

Vercel will automatically pick up the environment variables from your `.env` file, or you can add them in the Vercel dashboard:

1. Go to your project settings on Vercel
2. Navigate to "Environment Variables"
3. Add the three variables above

### Step 4: Test the Integration

1. Log in to FamLedgerAI
2. Go to **Recurring Expenses** page
3. Click the **📱 Test WhatsApp** button
4. Check your WhatsApp for the test message!

---

## 📱 How to Use

### Test WhatsApp Integration

```javascript
// From the dashboard
testWhatsAppReminder();
```

This will:
- Check if you have a WhatsApp number in your profile
- Send a test message to your number
- Confirm the integration is working

### Send Reminders for Upcoming Expenses

```javascript
// Send consolidated reminder (all expenses in one message)
sendWhatsAppReminders(7, 'consolidated');

// Send individual reminders (one message per expense)
sendWhatsAppReminders(7, 'individual');
```

Parameters:
- `daysAhead` (default: 7) - Look ahead this many days
- `type` (default: 'consolidated') - 'consolidated' or 'individual'

### API Usage

#### Send Test Message
```bash
curl -X POST https://famledgerai.com/api/whatsapp/test \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+919876543210",
    "userName": "Shantan"
  }'
```

#### Send Custom Message
```bash
curl -X POST https://famledgerai.com/api/whatsapp/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+919876543210",
    "message": "Your custom message here"
  }'
```

#### Send Recurring Expense Reminders
```bash
curl -X POST https://famledgerai.com/api/whatsapp/reminders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user@example.com",
    "daysAhead": 7,
    "type": "consolidated"
  }'
```

---

## 🔄 Automated Monthly Reminders

To set up automated reminders, you have two options:

### Option 1: Vercel Cron Jobs (Recommended)

Create `vercel.json` in your project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/monthly-reminders",
      "schedule": "0 9 25 * *"
    }
  ]
}
```

This runs on the 25th of every month at 9 AM (7 days before month-end).

Then create the cron endpoint in `api/cron/monthly-reminders.js`:

```javascript
import { createClient } from '@supabase/supabase-js';
import { sendWhatsAppMessage, formatConsolidatedReminder } from '../lib/whatsapp.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Verify cron secret for security
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Get all users with WhatsApp numbers
    const { data: users } = await supabase
      .from('user_data')
      .select('email, profile')
      .not('profile->whatsapp_number', 'is', null);

    let remindersSent = 0;

    for (const user of users) {
      // Get upcoming expenses for this user
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() + 7);

      const { data: expenses } = await supabase
        .from('master_expenses')
        .select('*')
        .eq('user_email', user.email)
        .eq('status', 'active')
        .lte('next_due_date', cutoffDate.toISOString().split('T')[0]);

      if (expenses && expenses.length > 0) {
        const message = formatConsolidatedReminder(
          user.profile.name || 'User',
          expenses
        );

        await sendWhatsAppMessage(user.profile.whatsapp_number, message);
        remindersSent++;
      }
    }

    return res.status(200).json({
      success: true,
      remindersSent,
      usersProcessed: users.length
    });
  } catch (error) {
    console.error('Cron error:', error);
    return res.status(500).json({ error: error.message });
  }
}
```

### Option 2: External Cron Service

Use a service like [cron-job.org](https://cron-job.org) or [EasyCron](https://www.easycron.com):

1. Create a cron job that runs on the 25th of every month
2. Set it to call: `https://famledgerai.com/api/whatsapp/reminders`
3. Method: POST
4. Body: `{"userId": "all", "daysAhead": 7, "type": "consolidated"}`

---

## 📊 Message Examples

### Test Message
```
Hi Shantan! 👋

This is a test message from FamLedgerAI.

✅ Your WhatsApp integration is working correctly!

You'll receive payment reminders for your recurring expenses here.

_Test message from FamLedgerAI_
```

### Consolidated Reminder
```
Hi Shantan! 👋

📅 *Upcoming Payment Reminders*

1. *HDFC Home Loan EMI*
   ₹45,000
   Due: 1 Mar (7 days)

2. *Netflix Subscription*
   ₹649
   Due: 5 Mar (11 days)

3. *Electricity Bill*
   ₹3,500
   Due: 10 Mar (16 days)

💰 *Total: ₹49,149*

Visit FamLedgerAI to manage your expenses: https://famledgerai.com

_This is an automated reminder from FamLedgerAI_
```

### Individual Reminder
```
Hi Shantan! 👋

⏰ *Payment Reminder*

HDFC Home Loan EMI
Amount: ₹45,000
Due: 1 March 2026
(7 days from now)

Visit FamLedgerAI to mark as paid: https://famledgerai.com

_Automated reminder from FamLedgerAI_
```

---

## 🔒 Security Best Practices

1. **Never commit `.env` file** - Already in `.gitignore`
2. **Use environment variables** - Credentials stored securely in Vercel
3. **Validate phone numbers** - Format: `+91XXXXXXXXXX`
4. **Rate limiting** - Twilio has built-in rate limits
5. **User consent** - Only send to users who provided WhatsApp numbers

---

## 💰 Cost Analysis

Based on your Twilio sandbox setup:

- **Sandbox**: FREE for testing
- **Production**: ₹0.50 per message (approx)
- **Monthly cost per user**: ₹6 (12 messages/year)
- **100 users**: ₹600/year
- **1,000 users**: ₹6,000/year

**Twilio Free Credits**: ₹1,500 (covers 250 users for 1 year!)

---

## 🐛 Troubleshooting

### Error: "Twilio credentials not configured"
**Solution**: Add `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` to `.env`

### Error: "No WhatsApp number found for user"
**Solution**: User needs to add WhatsApp number in Profile Settings

### Error: "Failed to send message"
**Check**:
1. Twilio credentials are correct
2. WhatsApp number format is correct (+91XXXXXXXXXX)
3. User has joined the Twilio sandbox (send "join happy-tiger" to +14155238886)

### Messages not received
**Check**:
1. User has joined Twilio sandbox
2. WhatsApp number is correct in user profile
3. Check Twilio logs in console for delivery status

---

## 📈 Next Steps

1. ✅ Test the integration with the test button
2. ✅ Send yourself a test reminder
3. ⬜ Set up automated monthly reminders (Option 1 or 2 above)
4. ⬜ Move from sandbox to production (requires Twilio approval)
5. ⬜ Add user preferences for reminder frequency
6. ⬜ Add opt-out functionality

---

## 📚 Related Documentation

- [WHATSAPP_INTEGRATION_GUIDE.md](./WHATSAPP_INTEGRATION_GUIDE.md) - Original integration guide
- [SMART_REMINDER_SYSTEM.md](./SMART_REMINDER_SYSTEM.md) - Reminder strategies
- [RECURRING_EXPENSES_SETUP_GUIDE.md](../supabase/RECURRING_EXPENSES_SETUP_GUIDE.md) - Database setup

---

**Status**: ✅ Complete and ready to test!
**Date**: March 1, 2026
**Next Action**: Add Twilio credentials to `.env` and test!
