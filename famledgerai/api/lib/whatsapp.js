// api/lib/whatsapp.js
// WhatsApp messaging via Twilio

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

/**
 * Validate and format WhatsApp number
 * @param {string} number - Phone number
 * @returns {string} Formatted number with whatsapp: prefix
 */
function formatWhatsAppNumber(number) {
  if (!number) {
    throw new Error('Phone number is required');
  }

  // Remove whatsapp: prefix if exists
  let cleanNumber = number.replace('whatsapp:', '').trim();
  
  // Remove spaces, dashes, parentheses
  cleanNumber = cleanNumber.replace(/[\s\-\(\)]/g, '');
  
  // Ensure it starts with +
  if (!cleanNumber.startsWith('+')) {
    // If it's a 10-digit Indian number, add +91
    if (/^\d{10}$/.test(cleanNumber)) {
      cleanNumber = '+91' + cleanNumber;
    } else if (!cleanNumber.startsWith('+')) {
      throw new Error('Phone number must start with + or be a 10-digit Indian number');
    }
  }
  
  // Validate format: + followed by 10-15 digits
  if (!/^\+\d{10,15}$/.test(cleanNumber)) {
    throw new Error('Invalid phone number format. Expected: +919876543210');
  }
  
  return `whatsapp:${cleanNumber}`;
}

/**
 * Send a WhatsApp message via Twilio
 * @param {string} to - Recipient WhatsApp number (format: +919876543210 or whatsapp:+919876543210)
 * @param {string} message - Message text
 * @returns {Promise<object>} Twilio response
 */
export async function sendWhatsAppMessage(to, message) {
  // Validate credentials
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    throw new Error('Twilio credentials not configured. Please add TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN to environment variables.');
  }

  // Validate inputs
  if (!message || message.trim().length === 0) {
    throw new Error('Message cannot be empty');
  }

  if (message.length > 1600) {
    throw new Error('Message too long. Maximum 1600 characters allowed.');
  }

  // Format phone number
  const formattedTo = formatWhatsAppNumber(to);

  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  
  const body = new URLSearchParams({
    From: TWILIO_WHATSAPP_FROM,
    To: formattedTo,
    Body: message.trim()
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString()
    });

    const data = await response.json();
    
    if (!response.ok) {
      // Parse Twilio error codes
      const errorCode = data.code;
      const errorMessage = data.message || 'Unknown error';
      
      if (errorCode === 21211) {
        throw new Error('Invalid phone number. Please check the format.');
      } else if (errorCode === 21408) {
        throw new Error('User has not joined the WhatsApp sandbox. Send "join happy-tiger" to +14155238886 first.');
      } else if (errorCode === 20003) {
        throw new Error('Invalid Twilio credentials. Please check your Account SID and Auth Token.');
      } else {
        throw new Error(`Twilio error (${errorCode}): ${errorMessage}`);
      }
    }

    return {
      success: true,
      sid: data.sid,
      status: data.status,
      to: data.to,
      from: data.from,
      dateCreated: data.date_created
    };
  } catch (error) {
    // Re-throw with more context
    if (error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to Twilio. Please check your internet connection.');
    }
    throw error;
  }
}

/**
 * Format a consolidated reminder message for recurring expenses
 * @param {string} userName - User's name
 * @param {Array} upcomingExpenses - Array of expenses due soon
 * @returns {string} Formatted message
 */
export function formatConsolidatedReminder(userName, upcomingExpenses) {
  if (!upcomingExpenses || upcomingExpenses.length === 0) {
    throw new Error('No expenses provided for reminder');
  }

  const greeting = `Hi ${userName || 'User'}! 👋\n\n`;
  const header = `📅 *Upcoming Payment Reminders*\n\n`;
  
  let expenseList = '';
  let totalAmount = 0;
  
  upcomingExpenses.forEach((expense, index) => {
    if (!expense.next_due_date || !expense.amount) {
      console.warn('Skipping expense with missing data:', expense);
      return;
    }

    const dueDate = new Date(expense.next_due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysUntil = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    
    expenseList += `${index + 1}. *${expense.name || 'Unnamed Expense'}*\n`;
    expenseList += `   ₹${(expense.amount || 0).toLocaleString('en-IN')}\n`;
    expenseList += `   Due: ${dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;
    
    if (daysUntil === 0) {
      expenseList += ` (Today!)\n\n`;
    } else if (daysUntil === 1) {
      expenseList += ` (Tomorrow)\n\n`;
    } else if (daysUntil < 0) {
      expenseList += ` (Overdue by ${Math.abs(daysUntil)} days!)\n\n`;
    } else {
      expenseList += ` (${daysUntil} days)\n\n`;
    }
    
    totalAmount += expense.amount || 0;
  });
  
  if (expenseList === '') {
    throw new Error('No valid expenses to send reminder for');
  }

  const footer = `💰 *Total: ₹${totalAmount.toLocaleString('en-IN')}*\n\n`;
  const cta = `Visit FamLedgerAI to manage your expenses: https://famledgerai.com\n\n`;
  const disclaimer = `_This is an automated reminder from FamLedgerAI_`;
  
  return greeting + header + expenseList + footer + cta + disclaimer;
}

/**
 * Format an individual expense reminder
 * @param {string} userName - User's name
 * @param {object} expense - Expense object
 * @returns {string} Formatted message
 */
export function formatIndividualReminder(userName, expense) {
  if (!expense || !expense.next_due_date || !expense.amount) {
    throw new Error('Invalid expense data for reminder');
  }

  const dueDate = new Date(expense.next_due_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysUntil = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
  
  let dueDateText = '';
  if (daysUntil === 0) {
    dueDateText = 'Due TODAY!';
  } else if (daysUntil === 1) {
    dueDateText = 'Due TOMORROW';
  } else if (daysUntil < 0) {
    dueDateText = `OVERDUE by ${Math.abs(daysUntil)} days!`;
  } else {
    dueDateText = `Due in ${daysUntil} days`;
  }
  
  return `Hi ${userName || 'User'}! 👋\n\n` +
    `⏰ *Payment Reminder*\n\n` +
    `${expense.name || 'Unnamed Expense'}\n` +
    `Amount: ₹${(expense.amount || 0).toLocaleString('en-IN')}\n` +
    `Due: ${dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}\n` +
    `${dueDateText}\n\n` +
    `Visit FamLedgerAI to mark as paid: https://famledgerai.com\n\n` +
    `_Automated reminder from FamLedgerAI_`;
}

/**
 * Send test WhatsApp message
 * @param {string} to - Recipient number
 * @param {string} userName - User's name
 * @returns {Promise<object>} Result
 */
export async function sendTestMessage(to, userName = 'User') {
  const message = `Hi ${userName}! 👋\n\n` +
    `This is a test message from FamLedgerAI.\n\n` +
    `✅ Your WhatsApp integration is working correctly!\n\n` +
    `You'll receive payment reminders for your recurring expenses here.\n\n` +
    `_Test message from FamLedgerAI_`;
  
  return await sendWhatsAppMessage(to, message);
}
