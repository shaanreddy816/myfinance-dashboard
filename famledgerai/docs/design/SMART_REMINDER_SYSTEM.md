# Smart Reminder System - Implementation Guide

## Overview

Send WhatsApp reminders 7 days before recurring expenses are due. Optimized for minimal message count (12-50 messages/year per user).

## Cost Optimization

### Message Frequency
- **1 consolidated message per month** = 12 messages/year
- **Per-expense reminders** = 12-50 messages/year (depending on number of recurring expenses)
- **Critical only** = 2-6 messages/year (EMIs and high-value subscriptions only)

### Cost Breakdown
| Users | Messages/Year | Annual Cost (Twilio) |
|-------|---------------|---------------------|
| 10    | 120-500       | ₹60-750            |
| 50    | 600-2,500     | ₹300-3,750         |
| 100   | 1,200-5,000   | ₹600-7,500         |
| 500   | 6,000-25,000  | ₹3,000-37,500      |

**With ₹1,500 free credits**: Covers 80-250 users for a full year!

## Implementation

### 1. Add Reminder Scheduler to RecurringExpenseEngine

```javascript
/**
 * Send payment reminders 7 days before due date
 * Runs daily to check for upcoming payments
 */
async sendPaymentReminders() {
    try {
        const today = new Date();
        const reminderDate = new Date(today);
        reminderDate.setDate(reminderDate.getDate() + 7); // 7 days from now
        
        // Get all active master expenses
        const { data: masterExpenses, error } = await this.sb
            .from('master_expenses')
            .select('*')
            .eq('status', 'active');
        
        if (error) {
            console.error('[Reminders] Error fetching master expenses:', error);
            return 0;
        }
        
        // Group by family_id for consolidated messages
        const remindersByFamily = {};
        
        for (const expense of masterExpenses || []) {
            // Check if payment is due in 7 days
            // For monthly expenses, check if we're 7 days before the 1st
            const nextMonth = new Date(today);
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            nextMonth.setDate(1);
            
            const daysUntilDue = Math.ceil((nextMonth - today) / (1000 * 60 * 60 * 24));
            
            if (daysUntilDue === 7) {
                if (!remindersByFamily[expense.family_id]) {
                    remindersByFamily[expense.family_id] = [];
                }
                remindersByFamily[expense.family_id].push(expense);
            }
        }
        
        // Send consolidated reminders
        let remindersSent = 0;
        
        for (const [familyId, expenses] of Object.entries(remindersByFamily)) {
            await this.sendConsolidatedReminder(familyId, expenses);
            remindersSent++;
        }
        
        console.log(`[Reminders] Sent ${remindersSent} payment reminders`);
        return remindersSent;
        
    } catch (error) {
        console.error('[Reminders] Exception sending reminders:', error);
        return 0;
    }
}

/**
 * Send consolidated reminder for all upcoming payments
 */
async sendConsolidatedReminder(familyId, expenses) {
    try {
        // Get user's WhatsApp number
        const { data: userData } = await this.sb
            .from('user_data')
            .select('profile')
            .eq('email', familyId)
            .single();
        
        const whatsappNumber = userData?.profile?.whatsappNumber;
        
        if (!whatsappNumber) {
            console.log(`[Reminders] No WhatsApp number for ${familyId}`);
            return;
        }
        
        // Calculate total
        const total = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
        
        // Get next month name
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        const monthName = nextMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
        
        // Build message
        let message = `📊 *Upcoming Payments - 7 Days Reminder*\n\n`;
        message += `Due on 1st ${monthName}:\n\n`;
        
        expenses.forEach(exp => {
            const icon = exp.expense_type === 'emi' ? '🏦' :
                        exp.expense_type === 'subscription' ? '📱' :
                        exp.expense_type === 'utility' ? '💡' :
                        exp.expense_type === 'grocery' ? '🛒' : '💰';
            
            message += `${icon} ${exp.name}: ₹${exp.amount.toLocaleString('en-IN')}\n`;
        });
        
        message += `\n💰 *Total: ₹${total.toLocaleString('en-IN')}*\n\n`;
        message += `Ensure sufficient balance in your account.\n\n`;
        message += `View details: https://famledgerai.com`;
        
        // Send WhatsApp message
        await this.sendWhatsAppNotification(whatsappNumber, message);
        
        console.log(`[Reminders] Sent consolidated reminder to ${familyId}`);
        
    } catch (error) {
        console.error('[Reminders] Error sending consolidated reminder:', error);
    }
}

/**
 * Send individual reminder for high-value expenses
 * Use this for EMIs > ₹10,000 or critical payments
 */
async sendIndividualReminder(familyId, expense) {
    try {
        const { data: userData } = await this.sb
            .from('user_data')
            .select('profile')
            .eq('email', familyId)
            .single();
        
        const whatsappNumber = userData?.profile?.whatsappNumber;
        
        if (!whatsappNumber) return;
        
        const icon = expense.expense_type === 'emi' ? '🏦' :
                    expense.expense_type === 'subscription' ? '📱' :
                    expense.expense_type === 'utility' ? '💡' :
                    expense.expense_type === 'grocery' ? '🛒' : '💰';
        
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        const dueDate = `1st ${nextMonth.toLocaleDateString('en-IN', { month: 'long' })}`;
        
        const message = `🔔 *Payment Reminder*\n\n` +
                       `${icon} ${expense.name}\n` +
                       `💰 Amount: ₹${expense.amount.toLocaleString('en-IN')}\n` +
                       `📅 Due: ${dueDate} (in 7 days)\n\n` +
                       `Ensure sufficient balance in your account.`;
        
        await this.sendWhatsAppNotification(whatsappNumber, message);
        
    } catch (error) {
        console.error('[Reminders] Error sending individual reminder:', error);
    }
}
```

### 2. Add Daily Scheduler

The reminder system should run daily to check for upcoming payments:

```javascript
/**
 * Daily scheduler - Check for reminders to send
 * Run this via cron job or Vercel scheduled function
 */
async executeDailyTasks() {
    const startTime = Date.now();
    
    console.log('[DailyTasks] Starting daily tasks...');
    
    const metrics = {
        execution_date: new Date().toISOString().split('T')[0],
        reminders_sent: 0,
        errors: 0
    };
    
    try {
        // Send payment reminders (7 days before due)
        metrics.reminders_sent = await this.sendPaymentReminders();
        
        // Check for subscription renewals (7 days before)
        const renewalReminders = await this.sendRenewalReminders(new Date());
        metrics.reminders_sent += renewalReminders;
        
    } catch (error) {
        console.error('[DailyTasks] Error:', error);
        metrics.errors++;
    }
    
    const duration = Date.now() - startTime;
    console.log(`[DailyTasks] Completed in ${duration}ms`);
    console.log(`[DailyTasks] Reminders sent: ${metrics.reminders_sent}`);
    
    return metrics;
}
```

### 3. Vercel Cron Configuration

Add to `vercel.json`:

```json
{
    "crons": [
        {
            "path": "/api/cron/daily-reminders",
            "schedule": "0 9 * * *"
        }
    ]
}
```

Create `famledgerai/api/cron/daily-reminders.js`:

```javascript
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // Verify cron secret
    if (req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    try {
        // Initialize services
        const sb = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_KEY
        );
        
        // Import and initialize engine
        const { RecurringExpenseEngine } = await import('../../lib/recurring-engine');
        const engine = new RecurringExpenseEngine(sb);
        
        // Execute daily tasks
        const result = await engine.executeDailyTasks();
        
        return res.status(200).json({
            success: true,
            ...result
        });
        
    } catch (error) {
        console.error('Daily tasks error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
```

## Message Templates

### Template 1: Consolidated Monthly Reminder (Recommended)

**Frequency**: 1 message/month = 12 messages/year

```
📊 *Upcoming Payments - 7 Days Reminder*

Due on 1st December 2024:

🏦 Home Loan EMI: ₹35,000
🛒 Monthly Groceries: ₹15,000
📱 Netflix Premium: ₹649
💡 Electricity Bill: ₹2,500

💰 *Total: ₹53,149*

Ensure sufficient balance in your account.

View details: https://famledgerai.com
```

### Template 2: Individual EMI Reminder

**Frequency**: 1 message per EMI per month

```
🔔 *Payment Reminder*

🏦 Home Loan EMI
💰 Amount: ₹35,000
📅 Due: 1st December (in 7 days)

Ensure sufficient balance in your account.
```

### Template 3: Critical Payment Alert

**Frequency**: Only for payments > ₹10,000

```
⚠️ *High-Value Payment Due*

🏦 Home Loan EMI
💰 Amount: ₹35,000
📅 Due: 1st December (in 7 days)

⚡ This is a critical payment. Please ensure sufficient funds.

View details: https://famledgerai.com
```

## User Preferences

Add reminder preferences to user profile:

```javascript
// In user profile/settings
reminderPreferences: {
    enabled: true,
    frequency: 'consolidated', // 'consolidated', 'individual', 'critical-only'
    daysBeforeDue: 7,
    whatsappNumber: '9876543210',
    minAmount: 0, // Only remind for amounts > this (for 'critical-only')
    excludeCategories: [] // e.g., ['grocery'] to skip grocery reminders
}
```

### Settings UI

```html
<div class="card">
    <div class="card-title">📱 WhatsApp Reminders</div>
    
    <div class="form-group">
        <label class="form-label">
            <input type="checkbox" id="reminders-enabled" checked>
            Enable WhatsApp payment reminders
        </label>
    </div>
    
    <div class="form-group">
        <label class="form-label">WhatsApp Number</label>
        <input type="tel" id="whatsapp-number" class="onboarding-input" 
               placeholder="9876543210" pattern="[0-9]{10}">
    </div>
    
    <div class="form-group">
        <label class="form-label">Reminder Type</label>
        <select id="reminder-frequency" class="onboarding-input">
            <option value="consolidated">Monthly Summary (12 messages/year)</option>
            <option value="individual">Per-Expense (12-50 messages/year)</option>
            <option value="critical-only">Critical Only (2-6 messages/year)</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label">Days Before Due</label>
        <select id="reminder-days" class="onboarding-input">
            <option value="1">1 day before</option>
            <option value="3">3 days before</option>
            <option value="7" selected>7 days before</option>
            <option value="14">14 days before</option>
        </select>
    </div>
    
    <button class="ebtn" onclick="saveReminderPreferences()">Save Preferences</button>
</div>
```

## Testing

### Test Reminder System

```javascript
// Add test button in UI
window.testReminder = async () => {
    const result = await fetch('/api/test/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: currentUserEmail,
            type: 'consolidated'
        })
    });
    
    const data = await result.json();
    
    if (data.success) {
        showToast('✅ Test reminder sent! Check your WhatsApp', 'green');
    } else {
        showToast(`❌ Error: ${data.error}`, 'red');
    }
};
```

## Cost Optimization Tips

### 1. Consolidate Messages
- Send 1 monthly summary instead of multiple individual messages
- Saves 80-90% on message costs

### 2. Smart Filtering
- Only send for amounts > ₹1,000
- Skip low-value subscriptions
- User can customize threshold

### 3. Opt-In Only
- Don't send to users who haven't provided WhatsApp number
- Respect opt-out immediately

### 4. Batch Processing
- Send all reminders in one batch
- Use Twilio's messaging service for better rates

## Monitoring

### Track Metrics

```javascript
// Log reminder metrics
{
    date: '2024-12-01',
    reminders_sent: 45,
    users_notified: 45,
    messages_delivered: 43,
    messages_failed: 2,
    cost_estimate: 67.50 // in rupees
}
```

### Monthly Report

```
📊 WhatsApp Reminders - November 2024

✅ Reminders Sent: 45
👥 Users Notified: 45
📱 Delivery Rate: 95.6%
💰 Cost: ₹67.50

Average: ₹1.50 per user per month
```

## Summary

### Recommended Setup

1. **Message Type**: Consolidated monthly summary
2. **Frequency**: 1 message/month = 12 messages/year per user
3. **Timing**: 7 days before 1st of month (around 24th-25th)
4. **Cost**: ₹6-18/year per user (extremely affordable!)

### For 100 Users

- **Messages**: 1,200/year
- **Cost**: ₹600-1,800/year (₹50-150/month)
- **With free credits**: First year FREE!

### Next Steps

1. Set up Twilio account (5 minutes)
2. Add WhatsApp number field to profile
3. Implement reminder scheduler
4. Test with your own number
5. Roll out to users

This is a very cost-effective solution that provides real value to users! 🎉
