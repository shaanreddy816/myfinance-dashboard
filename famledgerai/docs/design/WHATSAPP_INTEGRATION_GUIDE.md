# WhatsApp Integration Guide

## Overview

This guide explains how to integrate WhatsApp notifications for recurring expense reminders, EMI completion alerts, and subscription renewals.

## Option 1: Twilio WhatsApp (Recommended)

### Setup Steps

#### 1. Create Twilio Account
1. Go to https://www.twilio.com/try-twilio
2. Sign up (free trial with ₹1,500 credits)
3. Verify your phone number

#### 2. Get Credentials
1. Go to Twilio Console
2. Copy your Account SID
3. Copy your Auth Token
4. Note the WhatsApp sandbox number: `+1 415 523 8886`

#### 3. Join Sandbox (For Testing)
1. Send WhatsApp message to: `+1 415 523 8886`
2. Send the code shown in console (e.g., "join <code>")
3. You'll receive confirmation

### Implementation

#### Add to Vercel Environment Variables

```bash
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

#### Create API Endpoint

Create `famledgerai/api/notifications/whatsapp.js`:

```javascript
import twilio from 'twilio';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { to, message, type } = req.body;

    if (!to || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const client = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );

        const result = await client.messages.create({
            from: process.env.TWILIO_WHATSAPP_FROM,
            to: `whatsapp:+91${to}`,
            body: message
        });

        return res.status(200).json({
            success: true,
            messageSid: result.sid
        });

    } catch (error) {
        console.error('WhatsApp send error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
```

#### Update RecurringExpenseEngine

Add WhatsApp notification to your engine:

```javascript
// In RecurringExpenseEngine class

async sendEMICompletionNotification(emi) {
    try {
        console.log(`[RecurringExpenseEngine] 🎉 EMI Completed: ${emi.name}`);
        
        // Get user's WhatsApp number from profile
        const { data: userData } = await this.sb
            .from('user_data')
            .select('profile')
            .eq('email', emi.family_id)
            .single();
        
        const whatsappNumber = userData?.profile?.whatsappNumber;
        
        if (whatsappNumber) {
            const message = `🎉 *EMI Completed!*\n\n` +
                          `${emi.name} has been fully paid off!\n\n` +
                          `💰 Total Paid: ₹${emi.total_amount.toLocaleString('en-IN')}\n` +
                          `📅 Completion Date: ${emi.end_date}\n\n` +
                          `Congratulations on completing this financial milestone! 🎊`;
            
            await this.sendWhatsAppNotification(whatsappNumber, message);
        }
        
    } catch (error) {
        console.error('[RecurringExpenseEngine] Error sending EMI completion notification:', error);
    }
}

async sendSubscriptionRenewalReminder(subscription) {
    try {
        console.log(`[RecurringExpenseEngine] 🔔 Subscription Renewal Reminder: ${subscription.service_name || subscription.name}`);
        
        const { data: userData } = await this.sb
            .from('user_data')
            .select('profile')
            .eq('email', subscription.family_id)
            .single();
        
        const whatsappNumber = userData?.profile?.whatsappNumber;
        
        if (whatsappNumber) {
            const daysUntilRenewal = Math.ceil(
                (new Date(subscription.renewal_date) - new Date()) / (1000 * 60 * 60 * 24)
            );
            
            const message = `🔔 *Subscription Renewal Reminder*\n\n` +
                          `${subscription.service_name || subscription.name}\n\n` +
                          `💰 Amount: ₹${subscription.amount.toLocaleString('en-IN')}\n` +
                          `📅 Renewal Date: ${subscription.renewal_date}\n` +
                          `⏰ ${daysUntilRenewal} day(s) remaining\n\n` +
                          `Don't forget to renew your subscription!`;
            
            await this.sendWhatsAppNotification(whatsappNumber, message);
        }
        
    } catch (error) {
        console.error('[RecurringExpenseEngine] Error sending renewal reminder:', error);
    }
}

async sendWhatsAppNotification(phoneNumber, message) {
    try {
        const response = await fetch('/api/notifications/whatsapp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: phoneNumber,
                message: message
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('[RecurringExpenseEngine] WhatsApp notification sent successfully');
        } else {
            console.error('[RecurringExpenseEngine] WhatsApp notification failed:', result.error);
        }
        
    } catch (error) {
        console.error('[RecurringExpenseEngine] WhatsApp API error:', error);
    }
}
```

### Message Templates

#### EMI Completion
```
🎉 *EMI Completed!*

Home Loan EMI has been fully paid off!

💰 Total Paid: ₹84,00,000
📅 Completion Date: 2044-01-01

Congratulations on completing this financial milestone! 🎊
```

#### Subscription Renewal
```
🔔 *Subscription Renewal Reminder*

Netflix Premium

💰 Amount: ₹649
📅 Renewal Date: 2024-12-15
⏰ 7 day(s) remaining

Don't forget to renew your subscription!
```

#### Monthly Carry-Forward Summary
```
📊 *Monthly Expenses Generated*

Your recurring expenses for December 2024:

🏦 Home Loan EMI: ₹35,000
🛒 Monthly Groceries: ₹15,000
📱 Netflix Premium: ₹649

💰 Total: ₹50,649

View details: https://famledgerai.com
```

## Option 2: WhatsApp Business API (Production)

### When to Upgrade

Upgrade when you have:
- 100+ active users
- Need for branded messaging
- Requirement for template messages
- Budget for ₹5,000-10,000/month

### Setup Steps

1. **Apply for WhatsApp Business API**
   - Go to Meta Business Suite
   - Apply for WhatsApp Business API access
   - Provide business documents

2. **Get Approved Templates**
   - Create message templates
   - Submit for approval (24-48 hours)
   - Use approved templates only

3. **Integrate with Provider**
   - Use Twilio, MessageBird, or Gupshup
   - Configure webhooks
   - Test delivery

### Template Example

```
Template Name: emi_completion
Category: UTILITY
Language: English

Body:
Your {{1}} EMI has been completed! 🎉
Total paid: ₹{{2}}
Completion date: {{3}}

Congratulations on this financial milestone!
```

## Option 3: Indian Providers (Wati/Interakt)

### Wati.io Setup

1. **Sign Up**
   - Go to wati.io
   - Free tier: 1,000 messages/month
   - Connect WhatsApp Business number

2. **API Integration**

```javascript
async function sendWatiMessage(phoneNumber, message) {
    const response = await fetch('https://live-server-XXXX.wati.io/api/v1/sendSessionMessage', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.WATI_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            whatsappNumber: `91${phoneNumber}`,
            message: message
        })
    });
    
    return await response.json();
}
```

## Cost Comparison

| Provider | Free Tier | Cost After | Best For |
|----------|-----------|------------|----------|
| Twilio Sandbox | ₹1,500 credits | ₹0.50-1.50/msg | Testing |
| WhatsApp Business API | 1,000 conv/month | ₹0.30-0.80/conv | Scale |
| Wati.io | 1,000 msg/month | ₹999-2,999/month | Small business |
| Interakt | 1,000 msg/month | ₹1,499/month | Indian market |

## Implementation Checklist

### Phase 1: Testing (Free)
- [ ] Sign up for Twilio
- [ ] Join WhatsApp sandbox
- [ ] Add WhatsApp number field to user profile
- [ ] Create API endpoint
- [ ] Test EMI completion notification
- [ ] Test subscription renewal reminder
- [ ] Test monthly summary

### Phase 2: Production (Paid)
- [ ] Apply for WhatsApp Business API
- [ ] Get message templates approved
- [ ] Set up production number
- [ ] Configure webhooks
- [ ] Add opt-in/opt-out functionality
- [ ] Monitor delivery rates

## User Profile Update

Add WhatsApp number field to user profile:

```javascript
// In settings page
<div class="form-group">
    <label class="form-label">WhatsApp Number (for notifications)</label>
    <input type="tel" id="whatsapp-number" class="onboarding-input" 
           placeholder="9876543210" pattern="[0-9]{10}">
    <div style="font-size:11px; color:var(--text3); margin-top:4px;">
        📱 Receive EMI completion alerts and subscription reminders
    </div>
</div>
```

## Privacy & Compliance

### User Consent
- Add opt-in checkbox during onboarding
- Allow users to disable notifications
- Respect opt-out requests immediately

### Data Protection
- Store phone numbers encrypted
- Don't share with third parties
- Allow users to delete their number

### Message Frequency
- Limit to important notifications only
- Don't spam users
- Provide clear unsubscribe option

## Testing

### Test Scenarios

1. **EMI Completion**
   - Create EMI with end date = today
   - Run carry-forward
   - Verify WhatsApp message received

2. **Subscription Renewal**
   - Create subscription with renewal in 7 days
   - Run reminder check
   - Verify WhatsApp message received

3. **Monthly Summary**
   - Create multiple recurring expenses
   - Run carry-forward
   - Verify summary message received

### Test Message

```javascript
// Test function
async function testWhatsAppNotification() {
    const result = await fetch('/api/notifications/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            to: '9876543210', // Your test number
            message: '🧪 Test notification from FamLedgerAI!\n\nIf you received this, WhatsApp integration is working! ✅'
        })
    });
    
    console.log(await result.json());
}
```

## Troubleshooting

### Common Issues

**1. Message not delivered**
- Check if number joined sandbox
- Verify number format (+91XXXXXXXXXX)
- Check Twilio logs

**2. "Not a valid WhatsApp number"**
- Ensure number has WhatsApp installed
- Verify country code
- Check number is active

**3. Rate limiting**
- Twilio: 1 msg/sec in sandbox
- Production: Higher limits
- Implement queue for bulk messages

## Next Steps

1. **Immediate** (Free):
   - Set up Twilio sandbox
   - Add WhatsApp field to profile
   - Test with your own number

2. **Short-term** (₹1,000-2,000/month):
   - Get 10-20 users
   - Monitor message costs
   - Decide on provider

3. **Long-term** (₹5,000+/month):
   - Apply for Business API
   - Get templates approved
   - Scale to 100+ users

## Support

- Twilio Docs: https://www.twilio.com/docs/whatsapp
- WhatsApp Business API: https://developers.facebook.com/docs/whatsapp
- Wati Support: https://www.wati.io/support

---

**Recommendation**: Start with Twilio sandbox (free) for testing. Once you have 20-30 active users, upgrade to paid tier. The cost will be minimal (₹500-1,000/month) for small user base.
