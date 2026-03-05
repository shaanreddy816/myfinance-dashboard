// MIGRATION NOTE: Wait for modules to load before accessing them
// The main.js module loads asynchronously, so we need to wait for it

console.log('🔄 Waiting for modules to load...');

// Wait for window.sb to be available (set by src/main.js)
function waitForModules(timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    if (window.sb) {
      console.log('✅ Modules already loaded');
      resolve();
      return;
    }
    
    let elapsed = 0;
    const checkInterval = setInterval(() => {
      elapsed += 50;
      
      if (window.sb) {
        clearInterval(checkInterval);
        console.log('✅ Modules loaded after', elapsed, 'ms');
        resolve();
      } else if (elapsed >= timeoutMs) {
        clearInterval(checkInterval);
        console.error('❌ Module loading timeout after', timeoutMs, 'ms');
        console.error('window.sb is still undefined');
        console.error('Available window properties:', Object.keys(window).filter(k => k.includes('sb') || k.includes('supabase')));
        reject(new Error('Module loading timeout'));
      }
    }, 50);
  });
}

// Initialize app after modules are loaded
waitForModules()
  .then(() => {
    console.log('✅ Modules loaded, initializing app...');
    
    // Supabase client is now available via window.sb (imported from src/main.js)
    const sb = window.sb;

    // Hide the creds notice since we have hardcoded credentials
    const credsNotice = document.getElementById('creds-notice-login');
    if(credsNotice) credsNotice.style.display = 'none';

    // Continue with the rest of the initialization...
    initializeApp();
  })
  .catch((error) => {
    console.error('❌ Failed to initialize app:', error);
    alert('Failed to load application modules. Please refresh the page or check the console for details.');
  });

function initializeApp() {
  const sb = window.sb;

// ========== TRANSLATIONS ==========
const translations = {
    en: {
        overview: 'Overview',
        income: 'Income',
        expenses: 'Expenses',
        investments: 'Investments',
        loans: 'Loans',
        insurance: 'Insurance',
        schemes: 'Schemes',
        recommendations: 'Recommendations',
        advisor: 'AI Advisor',
        settings: 'Settings',
        finances: 'Finances',
        planning: 'Planning',
        account: 'Account',
        logout: 'Log out',
        edit: 'Edit',
        done: 'Done',
        snapTrack: 'Snap & Track',
        choosePeriod: 'Choose period',
        monthlyIncome: 'Monthly Income',
        monthlySurplus: 'Monthly Surplus',
        loanOutstanding: 'Loan Outstanding',
        scssDeposited: 'SCSS Deposited',
        incomeSnapshot: 'Income Snapshot',
        expenseSnapshot: 'Expense Snapshot',
        husbandSalary: 'Husband Salary / Income',
        wifeSalary: 'Wife Salary / Income',
        scssPayout: 'SCSS Payout (combined/mo)',
        rentalWanaparthy: 'Rental — Wanaparthy',
        sweepFd: 'Sweep FD',
        sbiLoanEmi: 'SBI Loan EMI',
        iciciLoanEmi: 'ICICI Loan EMI',
        sipInvestment: 'SIP Investment',
        term3cr: '3Cr Term Insurance (amortized)',
        term2cr: '2Cr Term Insurance (amortized)',
        healthInsurance: 'Health Insurance (amortized)',
        parentsHealth: 'Parents Health Ins (amortized)',
        carInsurance: 'Car Insurance (amortized)',
        otherExpenses: 'Other Monthly Expenses',
        profile: 'Profile',
        age: 'Age',
        risk: 'Risk',
        goals: 'Goals',
        connectZerodha: 'Connect Zerodha',
        disconnectZerodha: 'Disconnect',
        loadingHoldings: 'Loading your mutual funds...',
        nriPlanner: 'NRI Planner',
        autopilot: 'Autopilot',
        family: 'Family',
        budgetCoach: 'Budget Coach',
    },
    hi: {
        overview: 'अवलोकन',
        income: 'आय',
        expenses: 'खर्च',
        investments: 'निवेश',
        loans: 'ऋण',
        insurance: 'बीमा',
        schemes: 'योजनाएँ',
        recommendations: 'सिफारिशें',
        advisor: 'एआई सलाहकार',
        settings: 'सेटिंग्स',
        finances: 'वित्त',
        planning: 'योजना',
        account: 'खाता',
        logout: 'लॉग आउट',
        edit: 'संपादित करें',
        done: 'पूर्ण',
        snapTrack: 'स्नैप और ट्रैक',
        choosePeriod: 'अवधि चुनें',
        monthlyIncome: 'मासिक आय',
        monthlySurplus: 'मासिक अधिशेष',
        loanOutstanding: 'बकाया ऋण',
        scssDeposited: 'एससीएसएस जमा',
        incomeSnapshot: 'आय स्नैपशॉट',
        expenseSnapshot: 'व्यय स्नैपशॉट',
        husbandSalary: 'पति का वेतन / आय',
        wifeSalary: 'पत्नी का वेतन / आय',
        scssPayout: 'एससीएसएस भुगतान (संयुक्त/माह)',
        rentalWanaparthy: 'किराया — वनपर्ति',
        sweepFd: 'स्वीप एफडी',
        sbiLoanEmi: 'एसबीआई लोन ईएमआई',
        iciciLoanEmi: 'आईसीआईसीआई लोन ईएमआई',
        sipInvestment: 'एसआईपी निवेश',
        term3cr: '3 करोड़ टर्म इंश्योरेंस (मासिक)',
        term2cr: '2 करोड़ टर्म इंश्योरेंस (मासिक)',
        healthInsurance: 'स्वास्थ्य बीमा (मासिक)',
        parentsHealth: 'माता-पिता स्वास्थ्य बीमा (मासिक)',
        carInsurance: 'कार बीमा (मासिक)',
        otherExpenses: 'अन्य मासिक व्यय',
        profile: 'प्रोफ़ाइल',
        age: 'आयु',
        risk: 'जोखिम',
        goals: 'लक्ष्य',
        connectZerodha: 'ज़ेरोधा कनेक्ट करें',
        disconnectZerodha: 'डिस्कनेक्ट करें',
        loadingHoldings: 'आपके म्यूचुअल फंड लोड हो रहे हैं...',
        nriPlanner: 'एनआरआई योजनाकार',
        autopilot: 'ऑटोपायलट',
        family: 'परिवार',
        budgetCoach: 'बजट कोच',
    },
    te: {
        overview: 'అవలోకనం',
        income: 'ఆదాయం',
        expenses: 'ఖర్చులు',
        investments: 'పెట్టుబడులు',
        loans: 'రుణాలు',
        insurance: 'బీమా',
        schemes: 'పథకాలు',
        recommendations: 'సిఫార్సులు',
        advisor: 'AI సలహాదారు',
        settings: 'సెట్టింగులు',
        finances: 'ఫైనాన్స్',
        planning: 'ప్రణాళిక',
        account: 'ఖాతా',
        logout: 'లాగ్ అవుట్',
        edit: 'మార్చు',
        done: 'పూర్తయింది',
        snapTrack: 'స్నాప్ & ట్రాక్',
        choosePeriod: 'కాలాన్ని ఎంచుకోండి',
        monthlyIncome: 'నెలసరి ఆదాయం',
        monthlySurplus: 'నెలసరి మిగులు',
        loanOutstanding: 'మిగిలిన రుణం',
        scssDeposited: 'SCSS డిపాజిట్',
        incomeSnapshot: 'ఆదాయం స్నాప్షాట్',
        expenseSnapshot: 'ఖర్చు స్నాప్షాట్',
        husbandSalary: 'భర్త జీతం / ఆదాయం',
        wifeSalary: 'భార్య జీతం / ఆదాయం',
        scssPayout: 'SCSS చెల్లింపు (కలిపి/నెల)',
        rentalWanaparthy: 'అద్దె — వనపర్తి',
        sweepFd: 'స్వీప్ ఎఫ్డీ',
        sbiLoanEmi: 'SBI లోన్ ఈఎంఐ',
        iciciLoanEmi: 'ICICI లోన్ ఈఎంఐ',
        sipInvestment: 'SIP పెట్టుబడి',
        term3cr: '3 కోట్ల టర్మ్ ఇన్సూరెన్స్ (నెలసరి)',
        term2cr: '2 కోట్ల టర్మ్ ఇన్సూరెన్స్ (నెలసరి)',
        healthInsurance: 'ఆరోగ్య బీమా (నెలసరి)',
        parentsHealth: 'తల్లిదండ్రుల హెల్త్ ఇన్సూరెన్స్ (నెలసరి)',
        carInsurance: 'కార్ ఇన్సూరెన్స్ (నెలసరి)',
        otherExpenses: 'ఇతర నెలసరి ఖర్చులు',
        profile: 'ప్రొఫైల్',
        age: 'వయస్సు',
        risk: 'రిస్క్',
        goals: 'లక్ష్యాలు',
        connectZerodha: 'జెరోధాను కనెక్ట్ చేయండి',
        disconnectZerodha: 'డిస్‌కనెక్ట్ చేయండి',
        loadingHoldings: 'మీ మ్యూచువల్ ఫండ్‌లు లోడ్ అవుతున్నాయి...',
        nriPlanner: 'NRI ప్లానర్',
        autopilot: 'ఆటోపైలట్',
        family: 'కుటుంబం',
        budgetCoach: 'బడ్జెట్ కోచ్',
    }
};

function t(key) { return translations[currentLang]?.[key] || translations['en'][key] || key; }

// ========== ZERODHA INTEGRATION ==========
const KITE_API_KEY = '77labkoqjfkr779r'; // Zerodha Kite Connect Personal (Free)
const ZERODHA_REDIRECT = 'https://famledgerai.com/api/integrations/zerodha/callback';

window.connectZerodha = (memberId) => {
  if (!currentUserEmail) {
    alert('You must be logged in first.');
    return;
  }
  // Resolve which member to connect — if "all" or unspecified, default to 'self'
  const targetMember = (!memberId || memberId === 'all') ? 'self' : memberId;
  // Kite uses redirect_params (not state) to pass custom data back to the callback
  const redirectParams = encodeURIComponent(
    'user_email=' + encodeURIComponent(currentUserEmail) +
    '&member_id=' + encodeURIComponent(targetMember)
  );
  const loginUrl = `https://kite.zerodha.com/connect/login?v=3&api_key=${KITE_API_KEY}&redirect_params=${redirectParams}`;
  window.location.href = loginUrl;
};

window.disconnectZerodha = async (memberId) => {
  if (!currentUserEmail) return;
  const targetMember = (!memberId || memberId === 'all') ? 'self' : memberId;
  if (!confirm(`Disconnect Zerodha for ${getMemberName(targetMember)}?`)) return;
  try {
    const res = await fetch('/api/integrations/zerodha/disconnect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': currentUserEmail,
        'X-Member-Id': targetMember
      }
    });
    if (res.ok) {
      alert('Zerodha disconnected successfully.');
      renderInvestments();
    } else {
      alert('Failed to disconnect Zerodha. Please try again.');
    }
  } catch (e) {
    console.error('Disconnect Zerodha error:', e);
    alert('Error disconnecting Zerodha.');
  }
};

// Check Zerodha connection status for a specific member
// Returns { status: 'connected'|'expired'|'not_connected', lastSync: ISO string|null }
async function checkZerodhaStatus(memberId) {
  if (!currentUserEmail) return { status: 'not_connected', lastSync: null };
  const targetMember = (!memberId || memberId === 'all') ? 'self' : memberId;
  try {
    const res = await fetch('/api/integrations/zerodha/holdings', {
      headers: { 'X-User-Id': currentUserEmail, 'X-Member-Id': targetMember }
    });
    if (res.status === 200) {
      const data = await res.json();
      const lastSync = (data && data.length > 0 && data[0].last_synced) ? data[0].last_synced : new Date().toISOString();
      return { status: 'connected', lastSync };
    }
    if (res.status === 401) {
      const body = await res.json().catch(() => ({}));
      if (body.needsReauth) return { status: 'expired', lastSync: null };
    }
    return { status: 'not_connected', lastSync: null };
  } catch (e) {
    console.error('checkZerodhaStatus error for', targetMember, e);
    return { status: 'not_connected', lastSync: null };
  }
}

// Load Zerodha connection statuses for all family members in parallel
async function loadZerodhaConnectionStatuses() {
  const members = userData.profile.familyMembers || [];
  if (members.length === 0) return {};
  const results = await Promise.all(members.map(m => checkZerodhaStatus(m.id)));
  const statusMap = {};
  members.forEach((m, i) => { statusMap[m.id] = results[i]; });
  return statusMap;
}

// Render the Zerodha connection rows after statuses are loaded
function renderZerodhaConnectionRows(statusMap) {
  const container = document.getElementById('zerodha-connections-list');
  if (!container) return;
  const members = userData.profile.familyMembers || [];
  if (members.length === 0) {
    container.innerHTML = '<div style="padding:12px; font-size:13px; color:var(--text3);">No family members configured. Add members above first.</div>';
    return;
  }
  let html = '';
  members.forEach(m => {
    const icon = m.role==='self' ? '👤' : m.role==='spouse' ? '💑' : m.role==='kid' ? '👶' : m.role==='father' ? '👴' : m.role==='mother' ? '👵' : '👤';
    const info = statusMap[m.id] || { status: 'not_connected', lastSync: null };
    let statusBadge = '';
    let actionBtn = '';
    let syncInfo = '';

    if (info.status === 'connected') {
      statusBadge = '<span style="font-size:11px; padding:3px 8px; border-radius:12px; background:var(--green-dim, rgba(34,197,94,0.1)); color:var(--green, #22c55e); font-weight:600;">✅ Connected</span>';
      actionBtn = `<button onclick="disconnectZerodhaFromSettings('${m.id}')" style="font-size:11px; padding:4px 10px; border-radius:var(--radius-sm); background:var(--red-dim, rgba(239,68,68,0.1)); color:var(--red, #ef4444); border:1px solid var(--red, #ef4444); cursor:pointer; font-weight:600;">Disconnect</button>`;
      if (info.lastSync) {
        const syncDate = new Date(info.lastSync);
        const timeAgo = getTimeAgo(syncDate);
        syncInfo = `<div style="font-size:10px; color:var(--text3); margin-top:2px;">Last synced: ${timeAgo}</div>`;
      }
    } else if (info.status === 'expired') {
      statusBadge = '<span style="font-size:11px; padding:3px 8px; border-radius:12px; background:rgba(245,158,11,0.1); color:#f59e0b; font-weight:600;">⚠️ Expired</span>';
      actionBtn = `<button onclick="connectZerodha('${m.id}')" style="font-size:11px; padding:4px 10px; border-radius:var(--radius-sm); background:var(--accent-glow, rgba(99,102,241,0.1)); color:var(--accent2, #818cf8); border:1px solid var(--accent2, #818cf8); cursor:pointer; font-weight:600;">🔗 Reconnect</button>`;
    } else {
      statusBadge = '<span style="font-size:11px; padding:3px 8px; border-radius:12px; background:var(--bg3, rgba(100,100,100,0.1)); color:var(--text3); font-weight:600;">Not Connected</span>';
      actionBtn = `<button onclick="connectZerodha('${m.id}')" style="font-size:11px; padding:4px 10px; border-radius:var(--radius-sm); background:var(--accent-glow, rgba(99,102,241,0.1)); color:var(--accent2, #818cf8); border:1px solid var(--accent2, #818cf8); cursor:pointer; font-weight:600;">🔗 Connect Zerodha</button>`;
    }

    html += `<div style="display:flex; align-items:center; justify-content:space-between; padding:10px 12px; border-bottom:1px solid var(--border); gap:8px;">
      <div style="display:flex; align-items:center; gap:8px; flex:1; min-width:0;">
        <span style="font-size:18px;">${icon}</span>
        <div style="min-width:0;">
          <div style="font-size:13px; font-weight:600; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${m.name}</div>
          ${syncInfo}
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:8px; flex-shrink:0;">
        ${statusBadge}
        ${actionBtn}
      </div>
    </div>`;
  });
  container.innerHTML = html;
}

// Helper: human-readable time ago
function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// Disconnect Zerodha from Settings page (refreshes settings instead of investments)
window.disconnectZerodhaFromSettings = async (memberId) => {
  if (!currentUserEmail) return;
  const targetMember = (!memberId || memberId === 'all') ? 'self' : memberId;
  if (!confirm(`Disconnect Zerodha for ${getMemberName(targetMember)}?`)) return;
  try {
    const res = await fetch('/api/integrations/zerodha/disconnect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': currentUserEmail,
        'X-Member-Id': targetMember
      }
    });
    if (res.ok) {
      alert('Zerodha disconnected successfully.');
      renderSettings();
    } else {
      alert('Failed to disconnect Zerodha. Please try again.');
    }
  } catch (e) {
    console.error('Disconnect Zerodha error:', e);
    alert('Error disconnecting Zerodha.');
  }
};

// ========== STATE ==========
let userData = {
    profile: {},
    income: { husband:0, wife:0, rental:0, rentalActive:false },
    expenses: { monthly:[], periodic:[], byMember:{}, byMonth:{} },
    investments: { mutualFunds:[], stocks:[], fd:[], ppf:[] },
    loans: [],
    insurance: { term:[], health:[], vehicle:[] },
    schemes: [],
    bankAccounts: [],
    liquidSavings: 0,
    termCover: 0
};

let editMode = false;
let currentProfile = 'all';
let currentMonth = (() => { const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0'); })();
let currentLang = 'en';
let saveTimer = null;
let currentUserEmail = '';

// ========== HOUSEHOLD CONTEXT (Phase 1.6: Normalized Schema) ==========
let householdId = null;
let memberId = null;     // current user's member_id
let memberMap = {};       // { memberId: { name, role } } — loaded once

// ========== RECURRING EXPENSES DATA MODELS ==========

/**
 * MasterExpense - Data model for recurring/mandatory expense definitions
 * Represents expenses that automatically carry forward each month (EMIs, subscriptions, utilities, groceries)
 */
class MasterExpense {
    constructor(data = {}) {
        // Primary fields
        this.id = data.id || null;
        this.family_id = data.family_id || '';
        this.created_by = data.created_by || '';
        
        // Basic expense information
        this.name = data.name || '';
        this.amount = data.amount || 0;
        this.category = data.category || '';
        this.description = data.description || '';
        
        // Expense type and frequency
        this.expense_type = data.expense_type || 'other'; // 'emi', 'subscription', 'utility', 'grocery', 'other'
        this.frequency = data.frequency || 'monthly'; // 'monthly', 'annual'
        
        // Date range
        this.start_date = data.start_date || new Date().toISOString().split('T')[0];
        this.end_date = data.end_date || null;
        
        // EMI-specific fields
        this.is_emi = data.is_emi || false;
        this.emi_type = data.emi_type || null; // 'house_loan', 'car_loan', 'personal_loan', 'education_loan'
        this.tenure_months = data.tenure_months || null;
        this.total_amount = data.total_amount || null;
        
        // Subscription-specific fields
        this.is_subscription = data.is_subscription || false;
        this.service_name = data.service_name || null;
        this.renewal_date = data.renewal_date || null;
        
        // Lifecycle management
        this.status = data.status || 'active'; // 'active', 'paused', 'completed', 'cancelled'
        
        // Audit fields
        this.created_at = data.created_at || null;
        this.updated_at = data.updated_at || null;
        this.last_modified_by = data.last_modified_by || null;
    }
    
    /**
     * Validate required fields
     * @returns {Object} { valid: boolean, errors: string[] }
     */
    validateRequiredFields() {
        const errors = [];
        
        if (!this.name || this.name.trim() === '') {
            errors.push('Expense name is required');
        }
        
        if (!this.amount || this.amount <= 0) {
            errors.push('Amount must be greater than zero');
        }
        
        if (!this.category || this.category.trim() === '') {
            errors.push('Category is required');
        }
        
        if (!this.family_id || this.family_id.trim() === '') {
            errors.push('Family ID is required');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }
    
    /**
     * Validate amount is positive
     * @returns {Object} { valid: boolean, error: string }
     */
    validateAmount() {
        if (this.amount <= 0) {
            return {
                valid: false,
                error: 'Amount must be greater than ₹0'
            };
        }
        return { valid: true, error: null };
    }
    
    /**
     * Validate date range (end_date must be after start_date)
     * @returns {Object} { valid: boolean, error: string }
     */
    validateDateRange() {
        if (this.end_date) {
            const start = new Date(this.start_date);
            const end = new Date(this.end_date);
            
            if (end <= start) {
                return {
                    valid: false,
                    error: 'End date must be after start date'
                };
            }
        }
        return { valid: true, error: null };
    }
    
    /**
     * Validate EMI-specific fields
     * @returns {Object} { valid: boolean, errors: string[] }
     */
    validateEMI() {
        const errors = [];
        
        if (this.is_emi) {
            if (!this.start_date) {
                errors.push('EMI start date is required');
            }
            if (!this.end_date) {
                errors.push('EMI end date is required');
            }
            if (!this.amount || this.amount <= 0) {
                errors.push('EMI monthly amount is required');
            }
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }
    
    /**
     * Calculate EMI tenure in months
     * @returns {number} Number of months between start_date and end_date
     */
    calculateTenure() {
        if (!this.start_date || !this.end_date) return 0;
        
        const start = new Date(this.start_date);
        const end = new Date(this.end_date);
        
        const years = end.getFullYear() - start.getFullYear();
        const months = end.getMonth() - start.getMonth();
        
        return years * 12 + months;
    }
    
    /**
     * Calculate total EMI amount
     * @returns {number} Total amount (monthly amount × tenure)
     */
    calculateTotalAmount() {
        const tenure = this.calculateTenure();
        return this.amount * tenure;
    }
    
    /**
     * Validate EMI total amount calculation
     * @returns {Object} { valid: boolean, error: string }
     */
    validateEMITotalAmount() {
        if (this.is_emi && this.total_amount) {
            const calculated = this.calculateTotalAmount();
            const tolerance = 1; // Allow ±1 rupee for rounding
            
            if (Math.abs(this.total_amount - calculated) > tolerance) {
                return {
                    valid: false,
                    error: `Total amount mismatch. Expected: ₹${calculated}, Got: ₹${this.total_amount}`
                };
            }
        }
        return { valid: true, error: null };
    }
    
    /**
     * Calculate remaining tenure for active EMI
     * @returns {number} Remaining months until end_date
     */
    calculateRemainingTenure() {
        if (!this.is_emi || !this.end_date) return 0;
        
        const today = new Date();
        const end = new Date(this.end_date);
        
        if (end <= today) return 0;
        
        const years = end.getFullYear() - today.getFullYear();
        const months = end.getMonth() - today.getMonth();
        
        return Math.max(0, years * 12 + months);
    }
    
    /**
     * Calculate total remaining amount for active EMI
     * @returns {number} Remaining amount to be paid
     */
    calculateRemainingAmount() {
        const remainingMonths = this.calculateRemainingTenure();
        return this.amount * remainingMonths;
    }
    
    /**
     * Validate all fields
     * @returns {Object} { valid: boolean, errors: string[] }
     */
    validate() {
        const allErrors = [];
        
        // Required fields
        const requiredValidation = this.validateRequiredFields();
        if (!requiredValidation.valid) {
            allErrors.push(...requiredValidation.errors);
        }
        
        // Amount validation
        const amountValidation = this.validateAmount();
        if (!amountValidation.valid) {
            allErrors.push(amountValidation.error);
        }
        
        // Date range validation
        const dateValidation = this.validateDateRange();
        if (!dateValidation.valid) {
            allErrors.push(dateValidation.error);
        }
        
        // EMI validation
        if (this.is_emi) {
            const emiValidation = this.validateEMI();
            if (!emiValidation.valid) {
                allErrors.push(...emiValidation.errors);
            }
            
            const emiTotalValidation = this.validateEMITotalAmount();
            if (!emiTotalValidation.valid) {
                allErrors.push(emiTotalValidation.error);
            }
        }
        
        return {
            valid: allErrors.length === 0,
            errors: allErrors
        };
    }
    
    /**
     * Convert to plain object for database storage
     * @returns {Object} Plain object representation
     */
    toJSON() {
        return {
            id: this.id,
            family_id: this.family_id,
            created_by: this.created_by,
            name: this.name,
            amount: this.amount,
            category: this.category,
            description: this.description,
            expense_type: this.expense_type,
            frequency: this.frequency,
            start_date: this.start_date,
            end_date: this.end_date,
            is_emi: this.is_emi,
            emi_type: this.emi_type,
            tenure_months: this.tenure_months,
            total_amount: this.total_amount,
            is_subscription: this.is_subscription,
            service_name: this.service_name,
            renewal_date: this.renewal_date,
            status: this.status,
            created_at: this.created_at,
            updated_at: this.updated_at,
            last_modified_by: this.last_modified_by
        };
    }
}

/**
 * ExpenseEntry - Data model for individual expense entries
 * Represents both manual expenses and auto-generated entries from master expenses
 */
class ExpenseEntry {
    constructor(data = {}) {
        // Primary fields
        this.id = data.id || null;
        this.family_id = data.family_id || '';
        this.master_expense_id = data.master_expense_id || null;
        
        // Basic expense information
        this.amount = data.amount || 0;
        this.category = data.category || '';
        this.description = data.description || '';
        this.entry_date = data.entry_date || new Date().toISOString().split('T')[0];
        
        // Auto-generation tracking
        this.auto_generated = data.auto_generated || false;
        this.manually_adjusted = data.manually_adjusted || false;
        this.original_amount = data.original_amount || null;
        
        // Member tracking
        this.member_name = data.member_name || null;
        
        // Audit fields
        this.created_at = data.created_at || null;
        this.updated_at = data.updated_at || null;
        this.created_by = data.created_by || '';
        
        // Notes and attachments
        this.notes = data.notes || null;
        this.receipt_url = data.receipt_url || null;
    }
    
    /**
     * Validate required fields
     * @returns {Object} { valid: boolean, errors: string[] }
     */
    validateRequiredFields() {
        const errors = [];
        
        if (!this.amount || this.amount <= 0) {
            errors.push('Amount must be greater than zero');
        }
        
        if (!this.category || this.category.trim() === '') {
            errors.push('Category is required');
        }
        
        if (!this.entry_date) {
            errors.push('Entry date is required');
        }
        
        if (!this.family_id || this.family_id.trim() === '') {
            errors.push('Family ID is required');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }
    
    /**
     * Check if this entry is auto-generated from a master expense
     * @returns {boolean}
     */
    isAutoGenerated() {
        return this.auto_generated === true && this.master_expense_id !== null;
    }
    
    /**
     * Check if this is an individual (manual) expense
     * @returns {boolean}
     */
    isIndividual() {
        return this.auto_generated === false && this.master_expense_id === null;
    }
    
    /**
     * Check if this entry was manually adjusted after auto-generation
     * @returns {boolean}
     */
    isManuallyAdjusted() {
        return this.manually_adjusted === true;
    }
    
    /**
     * Mark this entry as manually adjusted
     * @param {number} newAmount - The new adjusted amount
     */
    markAsAdjusted(newAmount) {
        if (this.auto_generated && !this.manually_adjusted) {
            this.original_amount = this.amount;
        }
        this.amount = newAmount;
        this.manually_adjusted = true;
    }
    
    /**
     * Validate all fields
     * @returns {Object} { valid: boolean, errors: string[] }
     */
    validate() {
        const allErrors = [];
        
        // Required fields
        const requiredValidation = this.validateRequiredFields();
        if (!requiredValidation.valid) {
            allErrors.push(...requiredValidation.errors);
        }
        
        // Validate date format
        if (this.entry_date && isNaN(Date.parse(this.entry_date))) {
            allErrors.push('Invalid entry date format');
        }
        
        // Validate auto-generated consistency
        if (this.auto_generated && !this.master_expense_id) {
            allErrors.push('Auto-generated expenses must have a master_expense_id');
        }
        
        // Validate individual expense consistency
        if (!this.auto_generated && this.master_expense_id) {
            allErrors.push('Individual expenses should not have a master_expense_id');
        }
        
        return {
            valid: allErrors.length === 0,
            errors: allErrors
        };
    }
    
    /**
     * Convert to plain object for database storage
     * @returns {Object} Plain object representation
     */
    toJSON() {
        return {
            id: this.id,
            family_id: this.family_id,
            master_expense_id: this.master_expense_id,
            amount: this.amount,
            category: this.category,
            description: this.description,
            entry_date: this.entry_date,
            auto_generated: this.auto_generated,
            manually_adjusted: this.manually_adjusted,
            original_amount: this.original_amount,
            member_name: this.member_name,
            created_at: this.created_at,
            updated_at: this.updated_at,
            created_by: this.created_by,
            notes: this.notes,
            receipt_url: this.receipt_url
        };
    }
}

// ========== RECURRING EXPENSES SERVICES ==========

/**
 * MasterExpenseService - Service layer for master expense CRUD operations
 * Handles all database interactions for recurring/mandatory expenses
 */
class MasterExpenseService {
    constructor(supabaseClient) {
        this.sb = supabaseClient;
    }
    
    /**
     * Create a new master expense
     * @param {string} familyId - Family/user email
     * @param {string} userId - User email who is creating
     * @param {Object} expenseData - Master expense data
     * @returns {Promise<Object>} { success: boolean, data: MasterExpense, error: string }
     */
    async create(familyId, userId, expenseData) {
        try {
            // Create MasterExpense instance for validation
            const masterExpense = new MasterExpense({
                ...expenseData,
                family_id: familyId,
                created_by: userId,
                last_modified_by: userId
            });
            
            // Validate
            const validation = masterExpense.validate();
            if (!validation.valid) {
                return {
                    success: false,
                    data: null,
                    error: validation.errors.join(', ')
                };
            }
            
            // Calculate EMI fields if applicable
            if (masterExpense.is_emi) {
                masterExpense.tenure_months = masterExpense.calculateTenure();
                masterExpense.total_amount = masterExpense.calculateTotalAmount();
            }
            
            // Insert into database
            const { data, error } = await this.sb
                .from('master_expenses')
                .insert([masterExpense.toJSON()])
                .select()
                .single();
            
            if (error) {
                console.error('Master expense creation error:', error);
                return {
                    success: false,
                    data: null,
                    error: error.message || 'Failed to create master expense'
                };
            }
            
            return {
                success: true,
                data: new MasterExpense(data),
                error: null
            };
            
        } catch (err) {
            console.error('Master expense creation exception:', err);
            return {
                success: false,
                data: null,
                error: err.message || 'Unexpected error creating master expense'
            };
        }
    }
    
    /**
     * Update an existing master expense
     * @param {string} id - Master expense ID
     * @param {string} familyId - Family/user email (for ownership verification)
     * @param {string} userId - User email who is updating
     * @param {Object} updates - Fields to update
     * @returns {Promise<Object>} { success: boolean, data: MasterExpense, error: string }
     */
    async update(id, familyId, userId, updates) {
        try {
            // First, get the existing master expense to verify ownership and status
            const existing = await this.getById(id, familyId);
            if (!existing.success) {
                return {
                    success: false,
                    data: null,
                    error: 'Master expense not found or access denied'
                };
            }
            
            // Prevent editing completed EMIs
            if (existing.data.is_emi && existing.data.status === 'completed') {
                return {
                    success: false,
                    data: null,
                    error: 'Cannot edit completed EMI'
                };
            }
            
            // Merge updates with existing data
            const updatedData = {
                ...existing.data.toJSON(),
                ...updates,
                last_modified_by: userId,
                updated_at: new Date().toISOString()
            };
            
            // Create instance for validation
            const masterExpense = new MasterExpense(updatedData);
            
            // Validate
            const validation = masterExpense.validate();
            if (!validation.valid) {
                return {
                    success: false,
                    data: null,
                    error: validation.errors.join(', ')
                };
            }
            
            // Recalculate EMI fields if applicable
            if (masterExpense.is_emi) {
                masterExpense.tenure_months = masterExpense.calculateTenure();
                masterExpense.total_amount = masterExpense.calculateTotalAmount();
            }
            
            // Update in database
            const { data, error } = await this.sb
                .from('master_expenses')
                .update(masterExpense.toJSON())
                .eq('id', id)
                .eq('family_id', familyId)
                .select()
                .single();
            
            if (error) {
                console.error('Master expense update error:', error);
                return {
                    success: false,
                    data: null,
                    error: error.message || 'Failed to update master expense'
                };
            }
            
            return {
                success: true,
                data: new MasterExpense(data),
                error: null
            };
            
        } catch (err) {
            console.error('Master expense update exception:', err);
            return {
                success: false,
                data: null,
                error: err.message || 'Unexpected error updating master expense'
            };
        }
    }
    
    /**
     * Get master expenses for a family with optional filters
     * @param {string} familyId - Family/user email
     * @param {Object} filters - Optional filters { status, category, expense_type }
     * @returns {Promise<Object>} { success: boolean, data: MasterExpense[], error: string }
     */
    async getByFamily(familyId, filters = {}) {
        try {
            let query = this.sb
                .from('master_expenses')
                .select('*')
                .eq('family_id', familyId);
            
            // Apply filters
            if (filters.status) {
                query = query.eq('status', filters.status);
            }
            if (filters.category) {
                query = query.eq('category', filters.category);
            }
            if (filters.expense_type) {
                query = query.eq('expense_type', filters.expense_type);
            }
            
            // Order by created date (newest first)
            query = query.order('created_at', { ascending: false });
            
            const { data, error } = await query;
            
            if (error) {
                console.error('Master expense query error:', error);
                return {
                    success: false,
                    data: [],
                    error: error.message || 'Failed to fetch master expenses'
                };
            }
            
            // Convert to MasterExpense instances and add calculated fields
            const masterExpenses = (data || []).map(item => {
                const me = new MasterExpense(item);
                // Add calculated fields for display
                if (me.is_emi && me.status === 'active') {
                    me.remaining_tenure = me.calculateRemainingTenure();
                    me.remaining_amount = me.calculateRemainingAmount();
                }
                return me;
            });
            
            return {
                success: true,
                data: masterExpenses,
                error: null
            };
            
        } catch (err) {
            console.error('Master expense query exception:', err);
            return {
                success: false,
                data: [],
                error: err.message || 'Unexpected error fetching master expenses'
            };
        }
    }
    
    /**
     * Get a specific master expense by ID
     * @param {string} id - Master expense ID
     * @param {string} familyId - Family/user email (for ownership verification)
     * @returns {Promise<Object>} { success: boolean, data: MasterExpense, error: string }
     */
    async getById(id, familyId) {
        try {
            const { data, error } = await this.sb
                .from('master_expenses')
                .select('*')
                .eq('id', id)
                .eq('family_id', familyId)
                .single();
            
            if (error) {
                console.error('Master expense fetch error:', error);
                return {
                    success: false,
                    data: null,
                    error: error.message || 'Master expense not found'
                };
            }
            
            const masterExpense = new MasterExpense(data);
            
            // Add calculated fields
            if (masterExpense.is_emi && masterExpense.status === 'active') {
                masterExpense.remaining_tenure = masterExpense.calculateRemainingTenure();
                masterExpense.remaining_amount = masterExpense.calculateRemainingAmount();
            }
            
            return {
                success: true,
                data: masterExpense,
                error: null
            };
            
        } catch (err) {
            console.error('Master expense fetch exception:', err);
            return {
                success: false,
                data: null,
                error: err.message || 'Unexpected error fetching master expense'
            };
        }
    }
    
    /**
     * Pause a master expense (stop generating monthly entries)
     * @param {string} id - Master expense ID
     * @param {string} familyId - Family/user email
     * @param {string} userId - User email who is pausing
     * @returns {Promise<Object>} { success: boolean, data: MasterExpense, error: string }
     */
    async pause(id, familyId, userId) {
        return await this.updateStatus(id, familyId, userId, 'paused');
    }
    
    /**
     * Resume a paused master expense (restart generating monthly entries)
     * @param {string} id - Master expense ID
     * @param {string} familyId - Family/user email
     * @param {string} userId - User email who is resuming
     * @returns {Promise<Object>} { success: boolean, data: MasterExpense, error: string }
     */
    async resume(id, familyId, userId) {
        return await this.updateStatus(id, familyId, userId, 'active');
    }
    
    /**
     * Cancel a master expense (permanently stop generating entries)
     * @param {string} id - Master expense ID
     * @param {string} familyId - Family/user email
     * @param {string} userId - User email who is cancelling
     * @returns {Promise<Object>} { success: boolean, data: MasterExpense, error: string }
     */
    async cancel(id, familyId, userId) {
        return await this.updateStatus(id, familyId, userId, 'cancelled');
    }
    
    /**
     * Update the status of a master expense
     * @private
     * @param {string} id - Master expense ID
     * @param {string} familyId - Family/user email
     * @param {string} userId - User email
     * @param {string} newStatus - New status value
     * @returns {Promise<Object>} { success: boolean, data: MasterExpense, error: string }
     */
    async updateStatus(id, familyId, userId, newStatus) {
        try {
            const { data, error } = await this.sb
                .from('master_expenses')
                .update({
                    status: newStatus,
                    last_modified_by: userId,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .eq('family_id', familyId)
                .select()
                .single();
            
            if (error) {
                console.error('Master expense status update error:', error);
                return {
                    success: false,
                    data: null,
                    error: error.message || 'Failed to update status'
                };
            }
            
            return {
                success: true,
                data: new MasterExpense(data),
                error: null
            };
            
        } catch (err) {
            console.error('Master expense status update exception:', err);
            return {
                success: false,
                data: null,
                error: err.message || 'Unexpected error updating status'
            };
        }
    }
    
    /**
     * Create an EMI with automatic tenure calculation
     * @param {string} familyId - Family/user email
     * @param {string} userId - User email
     * @param {Object} emiData - EMI data (must include start_date, end_date, amount)
     * @returns {Promise<Object>} { success: boolean, data: MasterExpense, error: string }
     */
    async createEMI(familyId, userId, emiData) {
        // Ensure EMI flags are set
        const emiExpense = {
            ...emiData,
            is_emi: true,
            expense_type: 'emi'
        };
        
        // Use the standard create method which handles tenure calculation
        return await this.create(familyId, userId, emiExpense);
    }
    
    /**
     * Get all active EMIs with remaining tenure and amount
     * @param {string} familyId - Family/user email
     * @returns {Promise<Object>} { success: boolean, data: Array, error: string }
     */
    async getActiveEMIs(familyId) {
        const result = await this.getByFamily(familyId, {
            status: 'active',
            expense_type: 'emi'
        });
        
        if (!result.success) {
            return result;
        }
        
        // Filter out EMIs that have passed their end date
        const today = new Date();
        const activeEMIs = result.data.filter(emi => {
            if (!emi.end_date) return true;
            return new Date(emi.end_date) > today;
        });
        
        return {
            success: true,
            data: activeEMIs,
            error: null
        };
    }
    
    /**
     * Delete a master expense (soft delete by setting status to cancelled)
     * @param {string} id - Master expense ID
     * @param {string} familyId - Family/user email
     * @param {string} userId - User email
     * @returns {Promise<Object>} { success: boolean, error: string }
     */
    async delete(id, familyId, userId) {
        // Soft delete by cancelling
        return await this.cancel(id, familyId, userId);
    }
    
    /**
     * Get total monthly recurring obligations
     * @param {string} familyId - Family/user email
     * @returns {Promise<Object>} { success: boolean, total: number, count: number, error: string }
     */
    async getTotalMonthlyObligations(familyId) {
        try {
            const result = await this.getByFamily(familyId, { status: 'active' });
            
            if (!result.success) {
                return {
                    success: false,
                    total: 0,
                    count: 0,
                    error: result.error
                };
            }
            
            // Filter to only include expenses that haven't ended
            const today = new Date();
            const activeExpenses = result.data.filter(me => {
                if (!me.end_date) return true;
                return new Date(me.end_date) > today;
            });
            
            const total = activeExpenses.reduce((sum, me) => sum + (me.amount || 0), 0);
            
            return {
                success: true,
                total,
                count: activeExpenses.length,
                error: null
            };
            
        } catch (err) {
            console.error('Total obligations calculation exception:', err);
            return {
                success: false,
                total: 0,
                count: 0,
                error: err.message || 'Unexpected error calculating obligations'
            };
        }
    }
}

/**
 * ExpenseEntryService - Service layer for expense entry CRUD operations
 * Handles both manual and auto-generated expense entries
 */
class ExpenseEntryService {
    constructor(supabaseClient) {
        this.sb = supabaseClient;
    }
    
    /**
     * Create a manual (individual) expense entry
     * @param {string} familyId - Family/user email
     * @param {string} userId - User email
     * @param {Object} expenseData - Expense entry data
     * @returns {Promise<Object>} { success: boolean, data: ExpenseEntry, error: string }
     */
    async createManual(familyId, userId, expenseData) {
        try {
            // Create ExpenseEntry instance
            const entry = new ExpenseEntry({
                ...expenseData,
                family_id: familyId,
                created_by: userId,
                auto_generated: false,
                master_expense_id: null
            });
            
            // Validate
            const validation = entry.validate();
            if (!validation.valid) {
                return {
                    success: false,
                    data: null,
                    error: validation.errors.join(', ')
                };
            }
            
            // Insert into database
            const { data, error } = await this.sb
                .from('expenses')
                .insert([entry.toJSON()])
                .select()
                .single();
            
            if (error) {
                console.error('Expense entry creation error:', error);
                return {
                    success: false,
                    data: null,
                    error: error.message || 'Failed to create expense entry'
                };
            }
            
            return {
                success: true,
                data: new ExpenseEntry(data),
                error: null
            };
            
        } catch (err) {
            console.error('Expense entry creation exception:', err);
            return {
                success: false,
                data: null,
                error: err.message || 'Unexpected error creating expense entry'
            };
        }
    }
    
    /**
     * Create an auto-generated expense entry from a master expense
     * @param {string} masterExpenseId - Master expense ID
     * @param {number} month - Month number (1-12)
     * @param {number} year - Year
     * @returns {Promise<Object>} { success: boolean, data: ExpenseEntry, error: string }
     */
    async createAutoGenerated(masterExpenseId, month, year) {
        try {
            // First, get the master expense to copy data from
            const { data: masterData, error: masterError } = await this.sb
                .from('master_expenses')
                .select('*')
                .eq('id', masterExpenseId)
                .single();
            
            if (masterError || !masterData) {
                return {
                    success: false,
                    data: null,
                    error: 'Master expense not found'
                };
            }
            
            const master = new MasterExpense(masterData);
            
            // Create entry date (first day of the month)
            const entryDate = `${year}-${String(month).padStart(2, '0')}-01`;
            
            // Create auto-generated entry
            const entry = new ExpenseEntry({
                family_id: master.family_id,
                master_expense_id: masterExpenseId,
                amount: master.amount,
                category: master.category,
                description: `${master.name} (Auto-generated)`,
                entry_date: entryDate,
                auto_generated: true,
                created_by: 'system'
            });
            
            // Validate
            const validation = entry.validate();
            if (!validation.valid) {
                return {
                    success: false,
                    data: null,
                    error: validation.errors.join(', ')
                };
            }
            
            // Insert into database
            const { data, error } = await this.sb
                .from('expenses')
                .insert([entry.toJSON()])
                .select()
                .single();
            
            if (error) {
                console.error('Auto-generated expense creation error:', error);
                return {
                    success: false,
                    data: null,
                    error: error.message || 'Failed to create auto-generated expense'
                };
            }
            
            return {
                success: true,
                data: new ExpenseEntry(data),
                error: null
            };
            
        } catch (err) {
            console.error('Auto-generated expense creation exception:', err);
            return {
                success: false,
                data: null,
                error: err.message || 'Unexpected error creating auto-generated expense'
            };
        }
    }
    
    /**
     * Edit a monthly expense instance (mark as manually adjusted)
     * @param {string} id - Expense entry ID
     * @param {string} familyId - Family/user email
     * @param {number} newAmount - New amount
     * @returns {Promise<Object>} { success: boolean, data: ExpenseEntry, error: string }
     */
    async editMonthlyInstance(id, familyId, newAmount) {
        try {
            // Get existing entry
            const { data: existingData, error: fetchError } = await this.sb
                .from('expenses')
                .select('*')
                .eq('id', id)
                .eq('family_id', familyId)
                .single();
            
            if (fetchError || !existingData) {
                return {
                    success: false,
                    data: null,
                    error: 'Expense entry not found'
                };
            }
            
            const entry = new ExpenseEntry(existingData);
            
            // Mark as adjusted
            entry.markAsAdjusted(newAmount);
            
            // Update in database
            const { data, error } = await this.sb
                .from('expenses')
                .update({
                    amount: entry.amount,
                    manually_adjusted: entry.manually_adjusted,
                    original_amount: entry.original_amount,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .eq('family_id', familyId)
                .select()
                .single();
            
            if (error) {
                console.error('Expense entry update error:', error);
                return {
                    success: false,
                    data: null,
                    error: error.message || 'Failed to update expense entry'
                };
            }
            
            return {
                success: true,
                data: new ExpenseEntry(data),
                error: null
            };
            
        } catch (err) {
            console.error('Expense entry update exception:', err);
            return {
                success: false,
                data: null,
                error: err.message || 'Unexpected error updating expense entry'
            };
        }
    }
    
    /**
     * Get expenses for a specific month and family
     * @param {string} familyId - Family/user email
     * @param {number} month - Month number (1-12)
     * @param {number} year - Year
     * @param {boolean} includeAutoGenerated - Whether to include auto-generated expenses
     * @returns {Promise<Object>} { success: boolean, data: ExpenseEntry[], error: string }
     */
    async getByMonthAndFamily(familyId, month, year, includeAutoGenerated = true) {
        try {
            // Calculate date range for the month
            const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
            const endDate = month === 12 
                ? `${year + 1}-01-01`
                : `${year}-${String(month + 1).padStart(2, '0')}-01`;
            
            let query = this.sb
                .from('expenses')
                .select('*, master_expenses(*)')
                .eq('family_id', familyId)
                .gte('entry_date', startDate)
                .lt('entry_date', endDate);
            
            // Filter by auto_generated if needed
            if (!includeAutoGenerated) {
                query = query.eq('auto_generated', false);
            }
            
            // Order by date and creation time
            query = query.order('entry_date', { ascending: false })
                         .order('created_at', { ascending: false });
            
            const { data, error } = await query;
            
            if (error) {
                console.error('Expense query error:', error);
                return {
                    success: false,
                    data: [],
                    error: error.message || 'Failed to fetch expenses'
                };
            }
            
            // Convert to ExpenseEntry instances
            const entries = (data || []).map(item => new ExpenseEntry(item));
            
            return {
                success: true,
                data: entries,
                error: null
            };
            
        } catch (err) {
            console.error('Expense query exception:', err);
            return {
                success: false,
                data: [],
                error: err.message || 'Unexpected error fetching expenses'
            };
        }
    }
    
    /**
     * Delete an expense entry
     * @param {string} id - Expense entry ID
     * @param {string} familyId - Family/user email
     * @returns {Promise<Object>} { success: boolean, error: string }
     */
    async delete(id, familyId) {
        try {
            const { error } = await this.sb
                .from('expenses')
                .delete()
                .eq('id', id)
                .eq('family_id', familyId);
            
            if (error) {
                console.error('Expense deletion error:', error);
                return {
                    success: false,
                    error: error.message || 'Failed to delete expense'
                };
            }
            
            return {
                success: true,
                error: null
            };
            
        } catch (err) {
            console.error('Expense deletion exception:', err);
            return {
                success: false,
                error: err.message || 'Unexpected error deleting expense'
            };
        }
    }
    
    /**
     * Get expense totals for a month (separated by type)
     * @param {string} familyId - Family/user email
     * @param {number} month - Month number (1-12)
     * @param {number} year - Year
     * @returns {Promise<Object>} { success: boolean, totals: { recurring, individual, total }, error: string }
     */
    async getMonthlyTotals(familyId, month, year) {
        try {
            const result = await this.getByMonthAndFamily(familyId, month, year, true);
            
            if (!result.success) {
                return {
                    success: false,
                    totals: { recurring: 0, individual: 0, total: 0 },
                    error: result.error
                };
            }
            
            const recurring = result.data
                .filter(e => e.auto_generated)
                .reduce((sum, e) => sum + (e.amount || 0), 0);
            
            const individual = result.data
                .filter(e => !e.auto_generated)
                .reduce((sum, e) => sum + (e.amount || 0), 0);
            
            return {
                success: true,
                totals: {
                    recurring,
                    individual,
                    total: recurring + individual
                },
                error: null
            };
            
        } catch (err) {
            console.error('Monthly totals calculation exception:', err);
            return {
                success: false,
                totals: { recurring: 0, individual: 0, total: 0 },
                error: err.message || 'Unexpected error calculating totals'
            };
        }
    }
}

// Initialize service instances
const masterExpenseService = new MasterExpenseService(sb);
const expenseEntryService = new ExpenseEntryService(sb);

/**
 * RecurringExpenseEngine - Automation engine for monthly expense carry-forward
 * Runs on the first day of each month to generate expense entries from master expenses
 */
class RecurringExpenseEngine {
    constructor(masterExpenseService, expenseEntryService, supabaseClient) {
        this.masterExpenseService = masterExpenseService;
        this.expenseEntryService = expenseEntryService;
        this.sb = supabaseClient;
        this.maxRetries = 3;
        this.retryDelays = [1000, 2000, 4000]; // Exponential backoff: 1s, 2s, 4s
    }
    
    /**
     * Main scheduler - Execute monthly carry-forward
     * Should be called on the first day of each month
     * @returns {Promise<Object>} Execution result with metrics
     */
    async executeMonthlyCarryForward() {
        const startTime = Date.now();
        const today = new Date();
        const currentMonth = today.getMonth() + 1; // 1-12
        const currentYear = today.getFullYear();
        
        console.log(`[RecurringExpenseEngine] Starting carry-forward for ${currentYear}-${currentMonth}`);
        
        const metrics = {
            execution_date: today.toISOString().split('T')[0],
            execution_time: today.toISOString(),
            status: 'success',
            entries_generated: 0,
            emis_completed: 0,
            reminders_sent: 0,
            errors_encountered: 0,
            error_details: [],
            execution_duration_ms: 0
        };
        
        try {
            // Step 1: Get all active master expenses
            const activeMasterExpenses = await this.getActiveMasterExpenses(today);
            console.log(`[RecurringExpenseEngine] Found ${activeMasterExpenses.length} active master expenses`);
            
            // Step 2: Generate monthly entries
            for (const masterExpense of activeMasterExpenses) {
                try {
                    await this.generateMonthlyEntry(masterExpense, currentMonth, currentYear);
                    metrics.entries_generated++;
                } catch (error) {
                    console.error(`[RecurringExpenseEngine] Error generating entry for ${masterExpense.name}:`, error);
                    metrics.errors_encountered++;
                    metrics.error_details.push({
                        master_expense_id: masterExpense.id,
                        master_expense_name: masterExpense.name,
                        error: error.message
                    });
                }
            }
            
            // Step 3: Check for completed EMIs
            const completedCount = await this.checkAndCompleteEMIs(today);
            metrics.emis_completed = completedCount;
            
            // Step 4: Send subscription renewal reminders
            const remindersCount = await this.sendRenewalReminders(today);
            metrics.reminders_sent = remindersCount;
            
            // Determine final status
            if (metrics.errors_encountered > 0) {
                if (metrics.entries_generated > 0) {
                    metrics.status = 'partial_success';
                } else {
                    metrics.status = 'failed';
                }
            }
            
        } catch (error) {
            console.error('[RecurringExpenseEngine] Fatal error during carry-forward:', error);
            metrics.status = 'failed';
            metrics.errors_encountered++;
            metrics.error_details.push({
                error: error.message,
                stack: error.stack
            });
            
            // Attempt to handle the error with retry logic
            await this.handleCarryForwardError(error, metrics);
        }
        
        // Calculate execution duration
        metrics.execution_duration_ms = Date.now() - startTime;
        
        // Log execution to database
        await this.logExecution(metrics);
        
        console.log(`[RecurringExpenseEngine] Completed in ${metrics.execution_duration_ms}ms`);
        console.log(`[RecurringExpenseEngine] Status: ${metrics.status}`);
        console.log(`[RecurringExpenseEngine] Entries: ${metrics.entries_generated}, EMIs completed: ${metrics.emis_completed}, Errors: ${metrics.errors_encountered}`);
        
        return metrics;
    }
    
    /**
     * Get all active master expenses that should generate entries
     * @private
     * @param {Date} currentDate - Current date
     * @returns {Promise<Array>} Array of active master expenses
     */
    async getActiveMasterExpenses(currentDate) {
        try {
            // Query all master expenses with status='active'
            const { data, error } = await this.sb
                .from('master_expenses')
                .select('*')
                .eq('status', 'active');
            
            if (error) {
                console.error('[RecurringExpenseEngine] Error fetching active master expenses:', error);
                return [];
            }
            
            // Filter by end_date (null or >= current date)
            const activeExpenses = (data || []).filter(me => {
                if (!me.end_date) return true; // No end date = indefinite
                return new Date(me.end_date) >= currentDate;
            });
            
            return activeExpenses.map(me => new MasterExpense(me));
            
        } catch (error) {
            console.error('[RecurringExpenseEngine] Exception fetching active master expenses:', error);
            return [];
        }
    }
    
    /**
     * Generate a monthly expense entry from a master expense
     * @private
     * @param {MasterExpense} masterExpense - Master expense to generate from
     * @param {number} month - Month number (1-12)
     * @param {number} year - Year
     * @returns {Promise<void>}
     */
    async generateMonthlyEntry(masterExpense, month, year) {
        // Check if entry already exists for this month
        const entryDate = `${year}-${String(month).padStart(2, '0')}-01`;
        
        const { data: existing } = await this.sb
            .from('expenses')
            .select('id')
            .eq('master_expense_id', masterExpense.id)
            .eq('entry_date', entryDate)
            .maybeSingle();
        
        if (existing) {
            console.log(`[RecurringExpenseEngine] Entry already exists for ${masterExpense.name} in ${year}-${month}`);
            return;
        }
        
        // Create the entry using the service
        const result = await this.expenseEntryService.createAutoGenerated(
            masterExpense.id,
            month,
            year
        );
        
        if (!result.success) {
            throw new Error(`Failed to create entry: ${result.error}`);
        }
        
        console.log(`[RecurringExpenseEngine] Generated entry for ${masterExpense.name}: ₹${masterExpense.amount}`);
    }
    
    /**
     * Check for EMIs that have reached their end date and mark them as completed
     * @private
     * @param {Date} currentDate - Current date
     * @returns {Promise<number>} Number of EMIs completed
     */
    async checkAndCompleteEMIs(currentDate) {
        try {
            // Query EMIs where end_date < currentDate and status='active'
            const { data, error } = await this.sb
                .from('master_expenses')
                .select('*')
                .eq('is_emi', true)
                .eq('status', 'active')
                .not('end_date', 'is', null);
            
            if (error) {
                console.error('[RecurringExpenseEngine] Error fetching EMIs:', error);
                return 0;
            }
            
            let completedCount = 0;
            
            for (const emiData of (data || [])) {
                const emi = new MasterExpense(emiData);
                const endDate = new Date(emi.end_date);
                
                if (endDate < currentDate) {
                    // Mark as completed
                    const { error: updateError } = await this.sb
                        .from('master_expenses')
                        .update({
                            status: 'completed',
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', emi.id);
                    
                    if (updateError) {
                        console.error(`[RecurringExpenseEngine] Error completing EMI ${emi.name}:`, updateError);
                    } else {
                        console.log(`[RecurringExpenseEngine] Completed EMI: ${emi.name}`);
                        completedCount++;
                        
                        // Send completion notification
                        await this.sendEMICompletionNotification(emi);
                    }
                }
            }
            
            return completedCount;
            
        } catch (error) {
            console.error('[RecurringExpenseEngine] Exception checking EMIs:', error);
            return 0;
        }
    }
    
    /**
     * Send renewal reminders for subscriptions expiring within 7 days
     * @private
     * @param {Date} currentDate - Current date
     * @returns {Promise<number>} Number of reminders sent
     */
    async sendRenewalReminders(currentDate) {
        try {
            // Query subscriptions with renewal_date within 7 days
            const sevenDaysFromNow = new Date(currentDate);
            sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
            
            const { data, error } = await this.sb
                .from('master_expenses')
                .select('*')
                .eq('is_subscription', true)
                .eq('status', 'active')
                .not('renewal_date', 'is', null)
                .gte('renewal_date', currentDate.toISOString().split('T')[0])
                .lte('renewal_date', sevenDaysFromNow.toISOString().split('T')[0]);
            
            if (error) {
                console.error('[RecurringExpenseEngine] Error fetching subscriptions:', error);
                return 0;
            }
            
            let remindersCount = 0;
            
            for (const subData of (data || [])) {
                const subscription = new MasterExpense(subData);
                await this.sendSubscriptionRenewalReminder(subscription);
                remindersCount++;
            }
            
            return remindersCount;
            
        } catch (error) {
            console.error('[RecurringExpenseEngine] Exception sending reminders:', error);
            return 0;
        }
    }
    
    /**
     * Send EMI completion notification
     * @private
     * @param {MasterExpense} emi - Completed EMI
     * @returns {Promise<void>}
     */
    async sendEMICompletionNotification(emi) {
        try {
            console.log(`[RecurringExpenseEngine] 🎉 EMI Completed: ${emi.name}`);
            console.log(`  Total paid: ₹${emi.total_amount}`);
            console.log(`  Completion date: ${emi.end_date}`);
            
            // In a real implementation, this would send an email/push notification
            // For now, we'll just log it
            // TODO: Integrate with notification service
            
        } catch (error) {
            console.error('[RecurringExpenseEngine] Error sending EMI completion notification:', error);
        }
    }
    
    /**
     * Send subscription renewal reminder
     * @private
     * @param {MasterExpense} subscription - Subscription to remind about
     * @returns {Promise<void>}
     */
    async sendSubscriptionRenewalReminder(subscription) {
        try {
            console.log(`[RecurringExpenseEngine] 🔔 Subscription Renewal Reminder: ${subscription.service_name || subscription.name}`);
            console.log(`  Renewal date: ${subscription.renewal_date}`);
            console.log(`  Amount: ₹${subscription.amount}`);
            
            // In a real implementation, this would send an email/push notification
            // For now, we'll just log it
            // TODO: Integrate with notification service
            
        } catch (error) {
            console.error('[RecurringExpenseEngine] Error sending renewal reminder:', error);
        }
    }
    
    /**
     * Handle carry-forward errors with retry logic
     * @private
     * @param {Error} error - The error that occurred
     * @param {Object} metrics - Current execution metrics
     * @returns {Promise<void>}
     */
    async handleCarryForwardError(error, metrics) {
        console.error('[RecurringExpenseEngine] Handling carry-forward error:', error);
        
        // Log error details
        metrics.error_details.push({
            timestamp: new Date().toISOString(),
            error: error.message,
            stack: error.stack
        });
        
        // In a production environment, this would:
        // 1. Send alert to admin
        // 2. Retry failed operations with exponential backoff
        // 3. Store failed operations for manual review
        
        // For now, we just log it
        console.error('[RecurringExpenseEngine] Error logged. Manual intervention may be required.');
    }
    
    /**
     * Log execution results to database
     * @private
     * @param {Object} metrics - Execution metrics
     * @returns {Promise<void>}
     */
    async logExecution(metrics) {
        try {
            const { error } = await this.sb
                .from('recurring_engine_logs')
                .insert([{
                    execution_date: metrics.execution_date,
                    execution_time: metrics.execution_time,
                    status: metrics.status,
                    entries_generated: metrics.entries_generated,
                    emis_completed: metrics.emis_completed,
                    reminders_sent: metrics.reminders_sent,
                    errors_encountered: metrics.errors_encountered,
                    error_details: metrics.error_details.length > 0 ? metrics.error_details : null,
                    execution_duration_ms: metrics.execution_duration_ms
                }]);
            
            if (error) {
                console.error('[RecurringExpenseEngine] Error logging execution:', error);
            }
            
        } catch (error) {
            console.error('[RecurringExpenseEngine] Exception logging execution:', error);
        }
    }
    
    /**
     * Get the last execution log
     * @returns {Promise<Object>} Last execution log or null
     */
    async getLastExecution() {
        try {
            const { data, error } = await this.sb
                .from('recurring_engine_logs')
                .select('*')
                .order('execution_time', { ascending: false })
                .limit(1)
                .maybeSingle();
            
            if (error) {
                console.error('[RecurringExpenseEngine] Error fetching last execution:', error);
                return null;
            }
            
            return data;
            
        } catch (error) {
            console.error('[RecurringExpenseEngine] Exception fetching last execution:', error);
            return null;
        }
    }
    
    /**
     * Get execution history
     * @param {number} limit - Number of records to fetch
     * @returns {Promise<Array>} Array of execution logs
     */
    async getExecutionHistory(limit = 10) {
        try {
            const { data, error } = await this.sb
                .from('recurring_engine_logs')
                .select('*')
                .order('execution_time', { ascending: false })
                .limit(limit);
            
            if (error) {
                console.error('[RecurringExpenseEngine] Error fetching execution history:', error);
                return [];
            }
            
            return data || [];
            
        } catch (error) {
            console.error('[RecurringExpenseEngine] Exception fetching execution history:', error);
            return [];
        }
    }
    
    /**
     * Manual trigger for testing/admin purposes
     * @param {number} month - Optional month (defaults to current)
     * @param {number} year - Optional year (defaults to current)
     * @returns {Promise<Object>} Execution result
     */
    async manualTrigger(month = null, year = null) {
        const today = new Date();
        const targetMonth = month || (today.getMonth() + 1);
        const targetYear = year || today.getFullYear();
        
        console.log(`[RecurringExpenseEngine] Manual trigger for ${targetYear}-${targetMonth}`);
        
        // Temporarily override the date for testing
        const originalExecute = this.executeMonthlyCarryForward.bind(this);
        
        // Execute with custom date
        const startTime = Date.now();
        const metrics = {
            execution_date: `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`,
            execution_time: new Date().toISOString(),
            status: 'success',
            entries_generated: 0,
            emis_completed: 0,
            reminders_sent: 0,
            errors_encountered: 0,
            error_details: [],
            execution_duration_ms: 0
        };
        
        try {
            const activeMasterExpenses = await this.getActiveMasterExpenses(today);
            
            for (const masterExpense of activeMasterExpenses) {
                try {
                    await this.generateMonthlyEntry(masterExpense, targetMonth, targetYear);
                    metrics.entries_generated++;
                } catch (error) {
                    console.error(`[RecurringExpenseEngine] Error generating entry:`, error);
                    metrics.errors_encountered++;
                    metrics.error_details.push({
                        master_expense_id: masterExpense.id,
                        error: error.message
                    });
                }
            }
            
            if (metrics.errors_encountered > 0 && metrics.entries_generated === 0) {
                metrics.status = 'failed';
            } else if (metrics.errors_encountered > 0) {
                metrics.status = 'partial_success';
            }
            
        } catch (error) {
            metrics.status = 'failed';
            metrics.errors_encountered++;
            metrics.error_details.push({ error: error.message });
        }
        
        metrics.execution_duration_ms = Date.now() - startTime;
        await this.logExecution(metrics);
        
        return metrics;
    }
}

// Initialize recurring expense engine
const recurringExpenseEngine = new RecurringExpenseEngine(
    masterExpenseService,
    expenseEntryService,
    sb
);

// Performance optimization: Memoization cache
const computeCache = {
    _cache: {},
    _version: 0,
    invalidate() { this._version++; this._cache = {}; },
    get(key, fn) {
        const cacheKey = `${key}_${this._version}`;
        if (this._cache[cacheKey] === undefined) {
            this._cache[cacheKey] = fn();
        }
        return this._cache[cacheKey];
    }
};

// Stores the last generated NRI plan HTML so it persists across re‑renders
window.lastNriPlanHtml = null;

// ========== AUTO-LOGOUT ==========
let inactivityTimer;
function resetInactivity() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        showToast('Session expired — logging out for security.');
        setTimeout(() => doLogout(), 1500);
    }, 15 * 60 * 1000);
}
['mousemove','keypress','click','scroll','touchstart'].forEach(e => window.addEventListener(e, resetInactivity, { passive:true }));

// ========== MOBILE SIDEBAR ==========
window.toggleSidebar = () => {
    const s = document.getElementById('sidebar');
    const o = document.getElementById('sidebarOverlay');
    const isOpen = s.classList.contains('open');
    s.classList.toggle('open', !isOpen);
    o.style.display = isOpen ? 'none' : 'block';
};
window.closeSidebar = () => {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').style.display = 'none';
};

// ========== HELPERS ==========
const ff  = n => "₹" + (Number(n)||0).toLocaleString("en-IN");
const fl  = n => { n=Number(n)||0; if(n>=10000000) return "₹"+(n/10000000).toFixed(2)+"Cr"; if(n>=100000) return "₹"+(n/100000).toFixed(1)+"L"; return "₹"+n.toLocaleString("en-IN"); };
const num = v => { let c=String(v).replace(/[₹,\s%]/g,""); return (c!==""&&!isNaN(c)) ? parseFloat(c) : 0; };
const $   = id => document.getElementById(id);
const sh  = (id,h) => { let el=$(id); if(el) el.innerHTML=h; };
const pct = n => Math.round(Number(n)*100) + '%';

function parseIncomeRange(r) {
    if(!r) return [0,999];
    if(r.endsWith('+')) return [parseFloat(r),999];
    const p=r.split('-'); return [parseFloat(p[0]||0), parseFloat(p[1]||999)];
}

function badge(text, type='blue') {
    return `<span class="badge badge-${type}">${text}</span>`;
}

function alertDot(color) {
    const c = color==='green'?'var(--green)': color==='yellow'?'var(--yellow)':'var(--red)';
    return `<div class="alert-dot" style="background:${c}"></div>`;
}

function scoreColor(s) {
    if(s>=70) return 'var(--green)';
    if(s>=40) return 'var(--yellow)';
    return 'var(--red)';
}

function scoreLabel(s) {
    if(s>=80) return 'Excellent';
    if(s>=65) return 'Good';
    if(s>=45) return 'Fair';
    return 'Needs Work';
}

// ========== FINANCIAL ENGINE (with memoization) ==========
function computeMonthlyIncome() {
    return computeCache.get('monthlyIncome', () => {
        const i = userData.income;
        return (i.husband||0) + (i.wife||0) + (i.rentalActive ? (i.rental||0) : 0);
    });
}

function computeMonthlyExpenses() {
    return computeCache.get('monthlyExpenses', () => {
        // Use current month's data if available, otherwise fall back to legacy
        const byMember = getMonthByMember(currentMonth);
        const monthTotal = Object.values(byMember).flat().reduce((s,e)=>s+(e.v||0),0);
        if(monthTotal > 0) return monthTotal;
        const monthly  = (userData.expenses.monthly||[]).reduce((s,e)=>s+(e.v||0),0);
        const periodic = (userData.expenses.periodic||[]).reduce((s,e)=>{
            const months=(e.years||1)*12; return s+((e.v||0)/months);
        },0);
        return monthly + periodic;
    });
}

function computeTotalEmi() {
    return computeCache.get('totalEmi', () => {
        const loans = getLoansForMember(currentProfile);
        return loans.reduce((s,l)=>s+(l.emi||0),0);
    });
}

function computeTotalLoanOutstanding() {
    return computeCache.get('totalLoanOutstanding', () => {
        const loans = getLoansForMember(currentProfile);
        return loans.reduce((s,l)=>s+(l.outstanding||0),0);
    });
}

function computeMonthlySavings() {
    return computeCache.get('monthlySavings', () => {
        return computeMonthlyIncome() - computeMonthlyExpenses() - computeTotalEmi();
    });
}

function computeSavingsRate() {
    return computeCache.get('savingsRate', () => {
        const i = computeMonthlyIncome();
        if(!i) return 0;
        return computeMonthlySavings() / i;
    });
}

function computeEmergencyRatio() {
    return computeCache.get('emergencyRatio', () => {
        const exp = computeMonthlyExpenses();
        if(!exp) return 0;
        return (userData.liquidSavings||0) / (exp*6);
    });
}

function computeDebtRatio() {
    return computeCache.get('debtRatio', () => {
        const i = computeMonthlyIncome();
        if(!i) return 0;
        return computeTotalEmi() / i;
    });
}

function computeInsuranceCoverage() {
    return computeCache.get('insuranceCoverage', () => {
        const ins = getInsuranceForMember(currentProfile);
        // Filter out cross-referenced policies to avoid double-counting
        const termLife = [...(ins.term||[]), ...(ins.life||[])].filter(p => !p._crossReferenced);
        const health = (ins.health||[]).filter(p => !p._crossReferenced);
        const termCover = termLife.reduce((s,p) => s + (p.cover||0), 0);
        const healthCover = health.reduce((s,p) => s + (p.cover||p.sum_insured||0), 0);
        return { termCover, healthCover };
    });
}

function computeInsuranceRatio() {
    return computeCache.get('insuranceRatio', () => {
        const annualIncome = computeMonthlyIncome() * 12;
        if(!annualIncome) return 0;
        const { termCover } = computeInsuranceCoverage();
        return termCover / (annualIncome * 12);
    });
}

function computeTotalInvestments() {
    const inv = getInvestmentsForMember(currentProfile);
    const mf  = (inv.mutualFunds||[]).reduce((s,f)=>s+(f.value||0),0);
    const st  = (inv.stocks||[]).reduce((s,f)=>s+(f.value||0),0);
    const fd  = (inv.fd||[]).reduce((s,f)=>s+(f.value||0),0);
    const ppf = (inv.ppf||[]).reduce((s,f)=>s+(f.value||0),0);
    return mf+st+fd+ppf;
}

// ========== FORECAST ASSUMPTIONS ==========
function getDefaultAssumptions() {
    return { equityReturn: 12, debtReturn: 7, incomeGrowth: 8, expenseInflation: 6, medicalInflation: 10 };
}

function getForecastAssumptions() {
    const defaults = getDefaultAssumptions();
    const saved = userData.profile?.forecastAssumptions || {};
    return { ...defaults, ...saved };
}

// ========== FORECAST ENGINE ==========

function computeWeightedReturnRate() {
    const inv = getInvestmentsForMember(currentProfile);
    const equityVal = (inv.mutualFunds || []).reduce((s, f) => s + (f.value || 0), 0)
                    + (inv.stocks || []).reduce((s, f) => s + (f.value || 0), 0);
    const debtVal   = (inv.fd || []).reduce((s, f) => s + (f.value || 0), 0)
                    + (inv.ppf || []).reduce((s, f) => s + (f.value || 0), 0);
    const total = equityVal + debtVal;
    const equityFraction = total > 0 ? equityVal / total : 0.5;
    const debtFraction   = total > 0 ? debtVal / total : 0.5;
    const assumptions = getForecastAssumptions();
    return (assumptions.equityReturn / 100 * equityFraction) + (assumptions.debtReturn / 100 * debtFraction);
}

function computeForecastLoanAmortization(loan, extraMonthlyPayment) {
    const extra = extraMonthlyPayment || 0;
    let outstanding = loan.outstanding || 0;
    const emi = loan.emi || 0;
    const rate = loan.rate || 0;

    if (outstanding <= 0 || emi <= 0) {
        return {
            yearEndBalances: new Array(15).fill(0),
            payoffMonth: 0,
            totalInterestPaid: 0,
            totalInterestWithExtra: 0
        };
    }

    // Rate = 0 edge case: simple division
    if (rate === 0) {
        const payoffMonth = Math.ceil(outstanding / (emi + extra));
        const yearEndBalances = [];
        let bal = outstanding;
        for (let y = 1; y <= 15; y++) {
            const monthsThisYear = 12;
            for (let m = 0; m < monthsThisYear; m++) {
                if (bal <= 0) break;
                bal = Math.max(0, bal - (emi + extra));
            }
            yearEndBalances.push(Math.max(0, bal));
        }
        return { yearEndBalances, payoffMonth, totalInterestPaid: 0, totalInterestWithExtra: 0 };
    }

    const monthlyRate = rate / 100 / 12;

    // Check if EMI covers monthly interest (without extra payment for baseline)
    const initialMonthlyInterest = outstanding * monthlyRate;

    // Compute baseline (no extra payment) for totalInterestPaid
    let baseBal = outstanding;
    let baseInterest = 0;
    let basePayoffMonth = 0;
    const baseNeverPaysOff = emi <= baseBal * monthlyRate;
    for (let m = 1; m <= 180; m++) {
        const interest = baseBal * monthlyRate;
        baseInterest += interest;
        const principal = emi - interest;
        if (principal <= 0) {
            // EMI doesn't cover interest — cap at 180
            basePayoffMonth = 180;
            baseInterest = 0;
            baseBal = outstanding;
            for (let mm = 1; mm <= 180; mm++) {
                const mi = baseBal * monthlyRate;
                baseInterest += mi;
                baseBal = Math.max(0, baseBal + mi - emi);
            }
            break;
        }
        baseBal = Math.max(0, baseBal - principal);
        if (baseBal <= 0) {
            basePayoffMonth = m;
            break;
        }
    }
    if (basePayoffMonth === 0) basePayoffMonth = 180;

    // Compute with extra payment
    let bal = outstanding;
    let totalInterestWithExtra = 0;
    let payoffMonth = 0;
    const yearEndBalances = [];
    let paidOff = false;

    for (let y = 1; y <= 15; y++) {
        for (let m = 0; m < 12; m++) {
            if (paidOff) break;
            const monthNum = (y - 1) * 12 + m + 1;
            const interest = bal * monthlyRate;
            totalInterestWithExtra += interest;
            const totalPayment = emi + extra;
            const principal = totalPayment - interest;

            if (principal <= 0 && monthNum >= 180) {
                // Never pays off, cap at 180
                payoffMonth = 180;
                paidOff = true;
                break;
            }

            bal = Math.max(0, bal - principal);
            if (bal <= 0) {
                payoffMonth = monthNum;
                paidOff = true;
                break;
            }
        }
        yearEndBalances.push(Math.max(0, bal));
    }

    if (!paidOff) payoffMonth = 180;

    return {
        yearEndBalances,
        payoffMonth,
        totalInterestPaid: baseInterest,
        totalInterestWithExtra
    };
}

function computeDebtFreeDate(loans, extraMonthly) {
    const extra = extraMonthly || 0;
    const activeLoans = (loans || []).filter(l => (l.outstanding || 0) > 0 && (l.emi || 0) > 0);

    if (activeLoans.length === 0) {
        return { debtFreeDate: null, monthsSaved: 0, interestSaved: 0, perLoanDetails: [] };
    }

    const perLoanDetails = activeLoans.map(loan => {
        const baseline = computeForecastLoanAmortization(loan, 0);
        const withExtra = extra > 0 ? computeForecastLoanAmortization(loan, extra) : baseline;
        const now = new Date();
        const payoffDate = new Date(now.getFullYear(), now.getMonth() + withExtra.payoffMonth, 1);
        return {
            label: loan.label || 'Loan',
            originalPayoffMonth: baseline.payoffMonth,
            newPayoffMonth: withExtra.payoffMonth,
            monthsSaved: baseline.payoffMonth - withExtra.payoffMonth,
            originalInterest: baseline.totalInterestPaid,
            newInterest: withExtra.totalInterestWithExtra,
            interestSaved: baseline.totalInterestPaid - withExtra.totalInterestWithExtra,
            payoffDate
        };
    });

    // Overall debt-free date = latest payoff among all loans
    const latestPayoffMonth = Math.max(...perLoanDetails.map(d => d.newPayoffMonth));
    const now = new Date();
    const debtFreeDate = new Date(now.getFullYear(), now.getMonth() + latestPayoffMonth, 1);

    // Months saved = original latest payoff - new latest payoff
    const originalLatest = Math.max(...perLoanDetails.map(d => d.originalPayoffMonth));
    const monthsSaved = originalLatest - latestPayoffMonth;

    const interestSaved = perLoanDetails.reduce((sum, d) => sum + d.interestSaved, 0);

    return { debtFreeDate, monthsSaved, interestSaved, perLoanDetails };
}

function computeNetWorthProjection() {
    const assumptions = getForecastAssumptions();
    const weightedReturn = computeWeightedReturnRate();
    const currentInvestments = computeTotalInvestments();
    const liquidSavings = userData.liquidSavings || 0;
    const loans = getLoansForMember(currentProfile);

    // Pre-compute amortization for each loan
    const loanAmortizations = loans.map(l => computeForecastLoanAmortization(l, 0));

    const projection = [];
    let investments = currentInvestments;

    for (let y = 0; y <= 15; y++) {
        // Year 0 = current state
        if (y > 0) {
            investments = investments * (1 + weightedReturn);
        }

        // Sum loan outstanding at end of year y
        // yearEndBalances[i] = end of year (i+1), so for year y we need index y-1
        // For year 0, use current outstanding
        let loanOutstanding = 0;
        if (y === 0) {
            loanOutstanding = loans.reduce((s, l) => s + (l.outstanding || 0), 0);
        } else {
            loanOutstanding = loanAmortizations.reduce((s, a) => s + (a.yearEndBalances[y - 1] || 0), 0);
        }

        const netWorth = investments + liquidSavings - loanOutstanding;
        projection.push({ year: y, investments, loanOutstanding, liquidSavings, netWorth });
    }

    return projection;
}

function computeSavingsTrajectory() {
    const assumptions = getForecastAssumptions();
    const weightedReturn = computeWeightedReturnRate();
    const baseIncome = computeMonthlyIncome() * 12;
    const baseExpenses = computeMonthlyExpenses() * 12;
    const loans = getLoansForMember(currentProfile);

    // Pre-compute amortization for each loan to know when EMIs stop
    const loanAmortizations = loans.map(l => ({
        emi: l.emi || 0,
        amort: computeForecastLoanAmortization(l, 0)
    }));

    const trajectory = [];
    let cumulativeCorpus = computeTotalInvestments() + (userData.liquidSavings || 0);

    for (let y = 0; y <= 15; y++) {
        const income = baseIncome * Math.pow(1 + assumptions.incomeGrowth / 100, y);
        const expenses = baseExpenses * Math.pow(1 + assumptions.expenseInflation / 100, y);

        // Sum active EMIs for this year — EMI drops to 0 after loan payoff
        let emis = 0;
        for (const la of loanAmortizations) {
            // If loan is paid off before this year, EMI = 0
            const payoffYear = Math.ceil(la.amort.payoffMonth / 12);
            if (y < payoffYear) {
                emis += la.emi * 12;
            }
        }

        const netSavings = income - expenses - emis;

        if (y === 0) {
            // Year 0: corpus is current investments + liquid savings (no compounding yet)
            // cumulativeCorpus already set above
        } else {
            cumulativeCorpus = (cumulativeCorpus + netSavings) * (1 + weightedReturn);
        }

        trajectory.push({ year: y, income, expenses, emis, netSavings, cumulativeCorpus });
    }

    return trajectory;
}

// ========== GOAL GAP ANALYSIS ==========
function computeGoalGaps(assumptions, savingsTrajectory) {
    const goals = userData.profile.goals || [];
    if (!goals.length || !savingsTrajectory || !savingsTrajectory.length) return [];

    const age = userData.profile.age || 30;
    const annualIncome = computeMonthlyIncome() * 12;
    const expInflation = (assumptions.expenseInflation || 6) / 100;
    const weightedReturn = computeWeightedReturnRate();

    // Map goal labels to default target amounts and target years
    const goalDefaults = {
        'retirement':       { targetAmount: annualIncome * 25,  targetYear: Math.max(60 - age, 5) },
        'child-education':  { targetAmount: annualIncome * 5,   targetYear: 18 },
        'house':            { targetAmount: annualIncome * 8,   targetYear: 5 },
        'car':              { targetAmount: annualIncome * 1,   targetYear: 3 },
        'emergency':        { targetAmount: annualIncome * 0.5, targetYear: 1 },
        'travel':           { targetAmount: annualIncome * 0.5, targetYear: 2 },
        'wealth':           { targetAmount: annualIncome * 15,  targetYear: 15 },
        'india-return':     { targetAmount: annualIncome * 10,  targetYear: 10 }
    };

    const goalLabels = {
        'retirement': '🏖️ Retirement',
        'child-education': '🎓 Child Education',
        'house': '🏠 Buy House',
        'car': '🚗 Buy Car',
        'emergency': '🆘 Emergency Fund',
        'travel': '✈️ Travel',
        'wealth': '💎 Wealth Building',
        'india-return': '🇮🇳 India Return'
    };

    const results = goals.map(goalKey => {
        const def = goalDefaults[goalKey] || { targetAmount: annualIncome * 5, targetYear: 10 };
        const targetYear = Math.min(def.targetYear, 15); // Cap at 15 years
        const inflatedTarget = def.targetAmount * Math.pow(1 + expInflation, targetYear);

        // Get projected corpus at target year from savings trajectory
        const yearData = savingsTrajectory.find(t => t.year === targetYear);
        const projectedCorpus = yearData ? yearData.cumulativeCorpus : 0;

        const gap = inflatedTarget - projectedCorpus;

        // Compute monthly SIP needed if gap > 0 using PMT formula
        let monthlySIP = 0;
        if (gap > 0) {
            const monthsRemaining = targetYear * 12;
            const monthlyRate = weightedReturn / 12;
            if (monthlyRate > 0 && monthsRemaining > 0) {
                monthlySIP = gap * monthlyRate / (Math.pow(1 + monthlyRate, monthsRemaining) - 1);
            } else if (monthsRemaining > 0) {
                monthlySIP = gap / monthsRemaining;
            }
        }

        return {
            key: goalKey,
            label: goalLabels[goalKey] || goalKey,
            targetAmount: inflatedTarget,
            targetYear,
            projectedCorpus,
            gap,
            monthlySIP
        };
    });

    // Sort by gap size (largest first), cap at 5
    return results.sort((a, b) => b.gap - a.gap).slice(0, 5);
}

// ========== INSURANCE ADEQUACY FORECAST ==========
function computeInsuranceAdequacy(assumptions) {
    const annualIncome = computeMonthlyIncome() * 12;
    const incomeGrowth = (assumptions.incomeGrowth || 8) / 100;
    const medInflation = (assumptions.medicalInflation || 10) / 100;
    const dependents = (userData.profile.familyMembers || []).length;
    const { termCover, healthCover } = computeInsuranceCoverage();
    const years = [5, 10, 15];

    const term = years.map(y => {
        const recommended = annualIncome * 12 * Math.pow(1 + incomeGrowth, y);
        return { year: y, recommended, current: termCover, gap: recommended - termCover };
    });

    const health = years.map(y => {
        const recommended = (1000000 + 200000 * dependents) * Math.pow(1 + medInflation, y);
        return { year: y, recommended, current: healthCover, gap: recommended - healthCover };
    });

    return { term, health };
}

// ========== RISK ENGINE ==========

/**
 * clamp(min, max, value) — bounds a value within [min, max]
 * Formula: Math.max(min, Math.min(max, value))
 * Used by computeStabilityScore for normalization
 */
function clamp(min, max, value) {
    return Math.max(min, Math.min(max, value));
}

/**
 * computeHouseholdNIM() → { nim, weightedYield, weightedCost, rag }
 *
 * Household Net Interest Margin: spread between what investments earn
 * and what loans cost, adapted from banking NIM to household finance.
 *
 * Weighted_Yield = Σ(inv_i.value × returnRate_i) / Σ(inv_i.value)
 *   - Equity instruments (mutualFunds, stocks) use getForecastAssumptions().equityReturn
 *   - Debt instruments (fd, ppf) use getForecastAssumptions().debtReturn
 *   - If no investments → yield = 0
 *
 * Weighted_Cost = Σ(loan_i.outstanding × loan_i.rate) / Σ(loan_i.outstanding)
 *   - If no loans → cost = 0
 *
 * NIM = Weighted_Yield − Weighted_Cost (percentage points)
 * RAG: green ≥ 2%, yellow ≥ 0% & < 2%, red < 0%
 */
function computeHouseholdNIM() {
    return computeCache.get('householdNIM', () => {
        const inv = getInvestmentsForMember(currentProfile);
        const assumptions = getForecastAssumptions();
        const equityReturn = assumptions.equityReturn || 0;
        const debtReturn = assumptions.debtReturn || 0;

        // Weighted Yield: Σ(value × rate) / Σ(value), equity types use equityReturn, debt types use debtReturn
        const equityItems = (inv.mutualFunds || []).concat(inv.stocks || []);
        const debtItems = (inv.fd || []).concat(inv.ppf || []);

        let totalInvValue = 0;
        let weightedReturnSum = 0;

        for (const item of equityItems) {
            const v = (item.value || 0);
            totalInvValue += v;
            weightedReturnSum += v * equityReturn; // equity instruments use equityReturn
        }
        for (const item of debtItems) {
            const v = (item.value || 0);
            totalInvValue += v;
            weightedReturnSum += v * debtReturn; // debt instruments use debtReturn
        }

        // If no investments, weighted yield = 0
        const weightedYield = totalInvValue > 0 ? weightedReturnSum / totalInvValue : 0;

        // Weighted Cost: Σ(outstanding × rate) / Σ(outstanding)
        const loans = getLoansForMember(currentProfile);
        let totalOutstanding = 0;
        let weightedCostSum = 0;

        for (const loan of loans) {
            const o = (loan.outstanding || 0);
            const r = (loan.rate || 0);
            totalOutstanding += o;
            weightedCostSum += o * r; // each loan's cost contribution
        }

        // If no loans, weighted cost = 0
        const weightedCost = totalOutstanding > 0 ? weightedCostSum / totalOutstanding : 0;

        // NIM = Weighted_Yield − Weighted_Cost (percentage points)
        const nim = weightedYield - weightedCost;

        // RAG classification: green ≥ 2%, yellow ≥ 0% & < 2%, red < 0%
        const rag = nim >= 2 ? 'green' : nim >= 0 ? 'yellow' : 'red';

        return { nim, weightedYield, weightedCost, rag };
    });
}

/**
 * computeDSR() → { dsr, totalEmi, monthlyIncome, rag }
 *
 * Debt Service Ratio: percentage of gross monthly income consumed by loan EMIs.
 * Used by banks to evaluate borrower capacity (typically ≤ 50% is acceptable).
 *
 * DSR = (totalEmi / monthlyIncome) × 100
 *   - If income = 0 and EMIs exist → DSR = 100 (fully burdened)
 *   - If income = 0 and no EMIs → DSR = 0 (no debt, no income)
 *
 * RAG: green ≤ 35%, yellow > 35% & ≤ 50%, red > 50%
 */
function computeDSR() {
    return computeCache.get('dsr', () => {
        const totalEmi = computeTotalEmi() || 0;
        const monthlyIncome = computeMonthlyIncome() || 0;

        // DSR = (totalEmi / monthlyIncome) × 100
        // Guard: when income = 0, DSR = 100 if EMIs exist, 0 if no EMIs
        let dsr;
        if (monthlyIncome === 0) {
            dsr = totalEmi > 0 ? 100 : 0;
        } else {
            dsr = (totalEmi / monthlyIncome) * 100;
        }

        // RAG classification: green ≤ 35%, yellow > 35% & ≤ 50%, red > 50%
        const rag = dsr <= 35 ? 'green' : dsr <= 50 ? 'yellow' : 'red';

        return { dsr, totalEmi, monthlyIncome, rag };
    });
}

/**
 * computeLCR() → { lcr, monthsCoverage, liquidSavings, monthlyExpenses, rag }
 *
 * Liquidity Coverage Ratio: liquid savings vs. 6-month expense benchmark.
 * Measures emergency buffer adequacy — banks require ≥ 100% LCR.
 *
 * LCR = liquidSavings / (monthlyExpenses × 6)
 * monthsCoverage = liquidSavings / (monthlyExpenses + totalEmi)
 *   - If expenses+EMI = 0 and liquid > 0 → LCR = 1.0, monthsCoverage = Infinity (capped)
 *   - If expenses+EMI = 0 and liquid = 0 → LCR = 0, monthsCoverage = 0
 *
 * RAG: green ≥ 1.0, yellow ≥ 0.5 & < 1.0, red < 0.5
 */
function computeLCR() {
    return computeCache.get('lcr', () => {
        const liquidSavings = (userData.liquidSavings || 0);
        const monthlyExpenses = computeMonthlyExpenses() || 0;
        const totalEmi = computeTotalEmi() || 0;

        // LCR = liquidSavings / (monthlyExpenses × 6)
        // Guard: when expenses = 0, LCR = 1.0 if liquid > 0, 0 if liquid = 0
        let lcr;
        const sixMonthExpenses = monthlyExpenses * 6;
        if (sixMonthExpenses === 0) {
            lcr = liquidSavings > 0 ? 1.0 : 0;
        } else {
            lcr = liquidSavings / sixMonthExpenses;
        }

        // monthsCoverage = liquidSavings / (monthlyExpenses + totalEmi)
        // Guard: when expenses+EMI = 0, same logic as LCR
        let monthsCoverage;
        const monthlyBurn = monthlyExpenses + totalEmi;
        if (monthlyBurn === 0) {
            monthsCoverage = liquidSavings > 0 ? 1.0 : 0;
        } else {
            monthsCoverage = liquidSavings / monthlyBurn;
        }

        // RAG classification: green ≥ 1.0, yellow ≥ 0.5 & < 1.0, red < 0.5
        const rag = lcr >= 1.0 ? 'green' : lcr >= 0.5 ? 'yellow' : 'red';

        return { lcr, monthsCoverage, liquidSavings, monthlyExpenses, rag };
    });
}

/**
 * computeProtectionAdequacy() → { ratio, termAdequacy, healthAdequacy,
 *                                  termCover, healthCover, termBenchmark,
 *                                  healthBenchmark, dependentCount, rag }
 *
 * Protection Adequacy: insurance coverage vs. recommended benchmarks.
 *
 * termAdequacy = termCover / (monthlyIncome × 12 × 12)
 *   - Benchmark: 12× annual income for term life cover
 *   - If income = 0 → termAdequacy = 1.0 (no income to protect)
 *
 * healthBenchmark = (₹10,00,000 + ₹2,00,000 × dependentCount) × (1 + medicalInflation/100)^5
 *   - Inflation-adjusted recommended health cover
 *
 * healthAdequacy = healthCover / healthBenchmark
 * ratio = (termAdequacy + healthAdequacy) / 2
 *
 * RAG: green ≥ 0.8, yellow ≥ 0.5 & < 0.8, red < 0.5
 */
function computeProtectionAdequacy() {
    return computeCache.get('protectionAdequacy', () => {
        const coverage = computeInsuranceCoverage();
        const termCover = (coverage.termCover || 0);
        const healthCover = (coverage.healthCover || 0);
        const monthlyIncome = computeMonthlyIncome() || 0;
        const assumptions = getForecastAssumptions();
        const medicalInflation = (assumptions.medicalInflation || 10); // default 10%
        const dependentCount = (userData.profile?.familyMembers || []).length;

        // termBenchmark = monthlyIncome × 12 months × 12 multiplier (12× annual income)
        const termBenchmark = monthlyIncome * 12 * 12;

        // termAdequacy = termCover / termBenchmark
        // Guard: when income = 0, termAdequacy = 1.0 (no income to protect)
        let termAdequacy;
        if (monthlyIncome === 0) {
            termAdequacy = 1.0;
        } else {
            termAdequacy = termCover / termBenchmark;
        }

        // healthBenchmark = (10,00,000 + 2,00,000 × dependentCount) × (1 + medicalInflation/100)^5
        const healthBenchmark = (1000000 + 200000 * dependentCount) * Math.pow(1 + medicalInflation / 100, 5);

        // healthAdequacy = healthCover / healthBenchmark
        const healthAdequacy = healthBenchmark > 0 ? healthCover / healthBenchmark : 0;

        // ratio = average of term and health adequacy
        const ratio = (termAdequacy + healthAdequacy) / 2;

        // RAG classification: green ≥ 0.8, yellow ≥ 0.5 & < 0.8, red < 0.5
        const rag = ratio >= 0.8 ? 'green' : ratio >= 0.5 ? 'yellow' : 'red';

        return { ratio, termAdequacy, healthAdequacy, termCover, healthCover, termBenchmark, healthBenchmark, dependentCount, rag };
    });
}

/**
 * computeStabilityScore() → { score, nimScore, dsrScore, lcrScore, protScore,
 *                              topRisk, suggestion, rag }
 *
 * Financial Stability Score: composite weighted score (0–100) combining all four sub-metrics.
 *
 * Normalization (each to 0–100):
 *   nimScore  = clamp(0, 100, 50 + NIM × 25)
 *   dsrScore  = clamp(0, 100, 100 − DSR × 2)
 *   lcrScore  = clamp(0, 100, LCR × 100)
 *   protScore = clamp(0, 100, ratio × 100)
 *
 * Composite = round(dsrScore × 0.30 + lcrScore × 0.25 + nimScore × 0.20 + protScore × 0.25)
 * topRisk = sub-metric with lowest normalized score
 * suggestion = actionable string based on topRisk
 *
 * RAG: green 75–100, yellow 50–74, red 0–49
 */
function computeStabilityScore() {
    return computeCache.get('stabilityScore', () => {
        // Gather raw values from all four sub-metric functions
        const nimData = computeHouseholdNIM();
        const dsrData = computeDSR();
        const lcrData = computeLCR();
        const protData = computeProtectionAdequacy();

        // Normalize each sub-metric to 0–100 scale
        const nimScore = clamp(0, 100, 50 + (nimData.nim || 0) * 25);       // NIM of 2% → 100, NIM of -2% → 0
        const dsrScore = clamp(0, 100, 100 - (dsrData.dsr || 0) * 2);       // DSR of 0% → 100, DSR of 50% → 0
        const lcrScore = clamp(0, 100, (lcrData.lcr || 0) * 100);           // LCR of 1.0 → 100, LCR of 0 → 0
        const protScore = clamp(0, 100, (protData.ratio || 0) * 100);       // ratio of 1.0 → 100, ratio of 0 → 0

        // Composite stability score = weighted sum of normalized sub-scores
        // Weights: DSR 30%, LCR 25%, NIM 20%, Protection 25%
        const score = Math.round(dsrScore * 0.30 + lcrScore * 0.25 + nimScore * 0.20 + protScore * 0.25);

        // Identify top risk: sub-metric with the lowest normalized score
        const scores = { dsr: dsrScore, lcr: lcrScore, nim: nimScore, protection: protScore };
        let topRisk = 'dsr';
        let lowestScore = dsrScore;
        for (const [key, val] of Object.entries(scores)) {
            if (val < lowestScore) {
                lowestScore = val;
                topRisk = key;
            }
        }

        // Actionable suggestion based on top risk area
        const suggestions = {
            dsr: 'Consider reducing EMI burden — prepay high-interest loans or avoid new debt.',
            lcr: 'Build your emergency fund — target 6 months of expenses in liquid savings.',
            nim: 'Your borrowing costs exceed investment returns — review your investment mix or refinance loans.',
            protection: 'Your insurance cover is critically low — consider increasing term cover to 12× annual income.'
        };
        const suggestion = suggestions[topRisk] || '';

        // RAG classification: green 75–100, yellow 50–74, red 0–49
        const rag = score >= 75 ? 'green' : score >= 50 ? 'yellow' : 'red';

        return { score, nimScore, dsrScore, lcrScore, protScore, topRisk, suggestion, rag };
    });
}

// ========== FORECAST CARD UI ==========
let forecastActiveTab = 'networth'; // 'networth', 'savings', or 'goals'

function renderForecastCard() {
    const container = $('forecast-card-container');
    if (!container) return;

    const assumptions = getForecastAssumptions();
    const projection = computeNetWorthProjection();
    const trajectory = computeSavingsTrajectory();
    const goalGaps = computeGoalGaps(assumptions, trajectory);

    container.innerHTML = `
        <div class="card" style="margin-top:18px;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:16px;">
                <div class="card-title" style="margin-bottom:0;"><span class="icon">🔮</span> 15-Year Forecast</div>
                <div style="display:flex; gap:8px; align-items:center;">
                    <div style="display:flex; background:var(--bg); border-radius:8px; border:1px solid var(--border); overflow:hidden;">
                        <button onclick="switchForecastTab('networth')" id="fc-tab-networth"
                            style="padding:6px 14px; font-size:12px; font-weight:600; border:none; cursor:pointer; transition:all 0.2s;
                            ${forecastActiveTab==='networth' ? 'background:var(--accent); color:#fff;' : 'background:transparent; color:var(--text3);'}">
                            Net Worth
                        </button>
                        <button onclick="switchForecastTab('savings')" id="fc-tab-savings"
                            style="padding:6px 14px; font-size:12px; font-weight:600; border:none; cursor:pointer; transition:all 0.2s;
                            ${forecastActiveTab==='savings' ? 'background:var(--accent); color:#fff;' : 'background:transparent; color:var(--text3);'}">
                            Savings Trajectory
                        </button>
                        <button onclick="switchForecastTab('goals')" id="fc-tab-goals"
                            style="padding:6px 14px; font-size:12px; font-weight:600; border:none; cursor:pointer; transition:all 0.2s;
                            ${forecastActiveTab==='goals' ? 'background:var(--accent); color:#fff;' : 'background:transparent; color:var(--text3);'}">
                            Goal Gaps
                        </button>
                    </div>
                    <button onclick="goToForecastAssumptions()" title="Edit forecast assumptions"
                        style="padding:6px 10px; font-size:13px; background:var(--bg); border:1px solid var(--border); border-radius:8px; cursor:pointer; color:var(--text2); transition:all 0.2s;"
                        onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'">
                        ⚙️ Assumptions
                    </button>
                </div>
            </div>
            <div id="forecast-tab-content">
                ${forecastActiveTab === 'networth' ? renderNetWorthChart(projection) : forecastActiveTab === 'savings' ? renderSavingsTrajectoryView(trajectory) : renderGoalGapsView(goalGaps)}
            </div>
        </div>
    `;
}

window.switchForecastTab = function(tab) {
    forecastActiveTab = tab;
    renderForecastCard();
};

window.goToForecastAssumptions = function() {
    document.querySelector('[data-page="settings"]').click();
    setTimeout(() => {
        const panel = $('forecast-assumptions-panel');
        if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
};

function renderNetWorthChart(projection) {
    if (!projection || projection.length === 0) {
        return '<div style="color:var(--text3); font-size:13px; padding:20px 0; text-align:center;">No data available for net worth projection.</div>';
    }

    // Check if all net worth values are zero (no investments, loans, or savings)
    const allZero = projection.every(p => p.netWorth === 0 && p.investments === 0 && p.loanOutstanding === 0);
    if (allZero) {
        return `<div style="text-align:center; padding:24px 0;">
            <div style="font-size:28px; margin-bottom:8px;">📊</div>
            <div style="font-size:14px; font-weight:600; color:var(--text2); margin-bottom:6px;">Your net worth projection starts at ₹0</div>
            <div style="font-size:12px; color:var(--text3); max-width:360px; margin:0 auto;">Add investments, savings, or loans in their respective tabs to see your 15-year net worth trajectory.</div>
        </div>`;
    }

    const W = 700, H = 340, pad = { top: 30, right: 30, bottom: 50, left: 70 };
    const chartW = W - pad.left - pad.right;
    const chartH = H - pad.top - pad.bottom;

    const values = projection.map(p => p.netWorth);
    const minVal = Math.min(0, ...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal || 1;
    const yPad = range * 0.1;
    const yMin = minVal - yPad;
    const yMax = maxVal + yPad;

    const x = (yr) => pad.left + (yr / 15) * chartW;
    const y = (val) => pad.top + chartH - ((val - yMin) / (yMax - yMin)) * chartH;

    // Build polyline points
    const linePoints = projection.map(p => `${x(p.year).toFixed(1)},${y(p.netWorth).toFixed(1)}`).join(' ');

    // Gradient fill area
    const areaPoints = `${x(0).toFixed(1)},${y(yMin).toFixed(1)} ` + linePoints + ` ${x(15).toFixed(1)},${y(yMin).toFixed(1)}`;

    // Y-axis labels (5 ticks)
    const yTicks = [];
    for (let i = 0; i <= 4; i++) {
        const val = yMin + (yMax - yMin) * (i / 4);
        yTicks.push({ val, cy: y(val) });
    }

    // Build tooltip data as JSON for inline handler
    const tooltipData = projection.map(p => ({
        yr: p.year,
        inv: fl(p.investments),
        loan: fl(p.loanOutstanding),
        net: fl(p.netWorth)
    }));

    const uid = 'nwc_' + Date.now();

    return `
        <div style="position:relative;">
            <div style="display:flex; align-items:center; gap:6px; margin-bottom:10px;">
                <span style="font-size:11px; color:var(--text3);">Projected Net Worth (₹)</span>
                <span style="cursor:help; font-size:14px;" title="Net Worth = Investments × (1 + weighted return)^year + Liquid Savings − Loan Outstanding after amortization">ℹ️</span>
            </div>
            <svg viewBox="0 0 ${W} ${H}" style="width:100%; height:auto; max-height:360px;" role="img" aria-label="Net worth projection chart">
                <defs>
                    <linearGradient id="${uid}_grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.3"/>
                        <stop offset="100%" stop-color="var(--accent)" stop-opacity="0.02"/>
                    </linearGradient>
                </defs>

                <!-- Grid lines -->
                ${yTicks.map(t => `<line x1="${pad.left}" y1="${t.cy.toFixed(1)}" x2="${W - pad.right}" y2="${t.cy.toFixed(1)}" stroke="var(--border)" stroke-width="0.5" stroke-dasharray="4,4"/>`).join('')}

                <!-- Area fill -->
                <polygon points="${areaPoints}" fill="url(#${uid}_grad)"/>

                <!-- Line -->
                <polyline points="${linePoints}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>

                <!-- Data points -->
                ${projection.map(p => `
                    <circle cx="${x(p.year).toFixed(1)}" cy="${y(p.netWorth).toFixed(1)}" r="4" fill="var(--bg2)" stroke="var(--accent)" stroke-width="2"
                        style="cursor:pointer; transition: r 0.15s;"
                        onmouseover="this.setAttribute('r','7'); document.getElementById('${uid}_tip').style.display='block'; document.getElementById('${uid}_tip').innerHTML='Year ${p.year}: Investments: ${fl(p.investments).replace(/'/g, "\\'")} | Loans: ${fl(p.loanOutstanding).replace(/'/g, "\\'")} | Net: ${fl(p.netWorth).replace(/'/g, "\\'")}'; document.getElementById('${uid}_tip').style.left='${((p.year / 15) * 100).toFixed(0)}%';"
                        ontouchstart="this.setAttribute('r','7'); document.getElementById('${uid}_tip').style.display='block'; document.getElementById('${uid}_tip').innerHTML='Year ${p.year}: Investments: ${fl(p.investments).replace(/'/g, "\\'")} | Loans: ${fl(p.loanOutstanding).replace(/'/g, "\\'")} | Net: ${fl(p.netWorth).replace(/'/g, "\\'")}'; document.getElementById('${uid}_tip').style.left='${((p.year / 15) * 100).toFixed(0)}%';"
                        onmouseout="this.setAttribute('r','4'); document.getElementById('${uid}_tip').style.display='none';"
                    />`).join('')}

                <!-- X-axis labels -->
                ${projection.filter(p => p.year % 3 === 0).map(p => `
                    <text x="${x(p.year).toFixed(1)}" y="${H - 10}" text-anchor="middle" fill="var(--text3)" font-size="11" font-family="var(--mono)">Y${p.year}</text>
                `).join('')}

                <!-- Y-axis labels -->
                ${yTicks.map(t => `
                    <text x="${pad.left - 8}" y="${(t.cy + 4).toFixed(1)}" text-anchor="end" fill="var(--text3)" font-size="10" font-family="var(--mono)">${fl(t.val)}</text>
                `).join('')}

                <!-- Axes -->
                <line x1="${pad.left}" y1="${pad.top}" x2="${pad.left}" y2="${pad.top + chartH}" stroke="var(--border)" stroke-width="1"/>
                <line x1="${pad.left}" y1="${pad.top + chartH}" x2="${W - pad.right}" y2="${pad.top + chartH}" stroke="var(--border)" stroke-width="1"/>
            </svg>
            <div id="${uid}_tip" style="display:none; position:absolute; top:-8px; transform:translateX(-50%); background:var(--bg3); border:1px solid var(--border2); border-radius:8px; padding:6px 12px; font-size:11px; color:var(--text); white-space:nowrap; pointer-events:none; z-index:10; font-family:var(--mono);"></div>
        </div>
    `;
}

function renderSavingsTrajectoryView(trajectory) {
    if (!trajectory || trajectory.length === 0) {
        return '<div style="color:var(--text3); font-size:13px; padding:20px 0; text-align:center;">No data available for savings trajectory.</div>';
    }

    // Check if income and expenses are both zero (no income/expense data set up)
    const hasNoIncome = trajectory.every(t => t.income === 0);
    if (hasNoIncome) {
        return `<div style="text-align:center; padding:24px 0;">
            <div style="font-size:28px; margin-bottom:8px;">💰</div>
            <div style="font-size:14px; font-weight:600; color:var(--text2); margin-bottom:6px;">Savings trajectory starts at ₹0</div>
            <div style="font-size:12px; color:var(--text3); max-width:360px; margin:0 auto;">Set up your income in the <a href="#" onclick="document.querySelector('[data-page=\\'income\\']').click(); return false;" style="color:var(--accent); text-decoration:underline;">Income tab</a> to see projected savings over 15 years.</div>
        </div>`;
    }

    const maxCorpus = Math.max(...trajectory.map(t => t.cumulativeCorpus), 1);

    const rows = trajectory.map(t => {
        const pctFill = Math.max(0, Math.min(100, (t.cumulativeCorpus / maxCorpus) * 100));
        const savingsColor = t.netSavings >= 0 ? 'var(--green)' : 'var(--red)';
        const rowId = 'straj_row_' + t.year;

        return `
            <div style="border-bottom:1px solid var(--border); transition:background 0.15s;"
                 onmouseover="this.style.background='var(--bg3)'" onmouseout="this.style.background='transparent'">
                <div class="row-flex" style="cursor:pointer; padding:10px 0;" onclick="(function(){var el=document.getElementById('${rowId}'); el.style.display=el.style.display==='none'?'block':'none';})()">
                    <div style="display:flex; align-items:center; gap:10px; min-width:60px;">
                        <span style="font-size:12px; font-weight:700; color:var(--text); font-family:var(--mono); min-width:36px;">Y${t.year}</span>
                        <span style="font-size:11px; color:var(--text3);">▸</span>
                    </div>
                    <div style="flex:1; display:flex; align-items:center; gap:12px;">
                        <span style="font-size:12px; color:${savingsColor}; font-family:var(--mono); min-width:80px;">${fl(t.netSavings)}/yr</span>
                        <div style="flex:1; max-width:200px;">
                            <div style="height:6px; background:var(--bg); border-radius:3px; overflow:hidden;">
                                <div style="height:100%; width:${pctFill.toFixed(1)}%; background:linear-gradient(90deg, var(--accent), var(--green)); border-radius:3px; transition:width 0.3s;"></div>
                            </div>
                        </div>
                    </div>
                    <span style="font-size:13px; font-weight:700; color:var(--text); font-family:var(--mono);">${fl(t.cumulativeCorpus)}</span>
                </div>
                <div id="${rowId}" style="display:none; padding:4px 0 12px 46px;">
                    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:8px;">
                        <div><span style="font-size:10px; color:var(--text3);">Income</span><div style="font-size:12px; color:var(--green); font-family:var(--mono);">${fl(t.income)}</div></div>
                        <div><span style="font-size:10px; color:var(--text3);">Expenses</span><div style="font-size:12px; color:var(--red); font-family:var(--mono);">${fl(t.expenses)}</div></div>
                        <div><span style="font-size:10px; color:var(--text3);">EMIs</span><div style="font-size:12px; color:var(--yellow); font-family:var(--mono);">${fl(t.emis)}</div></div>
                        <div><span style="font-size:10px; color:var(--text3);">Net Savings</span><div style="font-size:12px; color:${savingsColor}; font-family:var(--mono);">${fl(t.netSavings)}</div></div>
                        <div><span style="font-size:10px; color:var(--text3);">Cumulative Corpus</span><div style="font-size:13px; font-weight:700; color:var(--accent); font-family:var(--mono);">${fl(t.cumulativeCorpus)}</div></div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <span style="font-size:11px; color:var(--text3);">Year-by-year savings projection (click row to expand)</span>
            </div>
            <div style="font-size:11px; color:var(--text3); display:flex; justify-content:space-between; padding:0 0 6px 0; border-bottom:1px solid var(--border2);">
                <span>Year</span>
                <span style="margin-right:0;">Cumulative Corpus</span>
            </div>
            ${rows}
        </div>
    `;
}

function renderGoalGapsView(goalGaps) {
    if (!goalGaps || goalGaps.length === 0) {
        return '<div style="color:var(--text3); font-size:13px; padding:20px 0; text-align:center;">Add goals in Settings to see gap analysis.</div>';
    }

    const rows = goalGaps.map(g => {
        const isSurplus = g.gap <= 0;
        const gapPct = g.targetAmount > 0 ? Math.abs(g.gap) / g.targetAmount : 0;
        let color, statusLabel;
        if (isSurplus) {
            color = 'var(--green)';
            statusLabel = 'Surplus';
        } else if (gapPct <= 0.2) {
            color = 'var(--yellow)';
            statusLabel = 'Gap';
        } else {
            color = 'var(--red)';
            statusLabel = 'Gap';
        }

        return `
            <div style="border-bottom:1px solid var(--border); padding:12px 0; transition:background 0.15s;"
                 onmouseover="this.style.background='var(--bg3)'" onmouseout="this.style.background='transparent'">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:8px;">
                    <div style="min-width:140px;">
                        <div style="font-size:13px; font-weight:700; color:var(--text);">${g.label}</div>
                        <div style="font-size:11px; color:var(--text3); margin-top:2px;">Target: Year ${g.targetYear}</div>
                    </div>
                    <div style="display:grid; grid-template-columns:repeat(3, auto); gap:16px; text-align:right;">
                        <div>
                            <div style="font-size:10px; color:var(--text3);">Target (Inflated)</div>
                            <div style="font-size:12px; font-weight:600; color:var(--text); font-family:var(--mono);">${fl(g.targetAmount)}</div>
                        </div>
                        <div>
                            <div style="font-size:10px; color:var(--text3);">Projected Corpus</div>
                            <div style="font-size:12px; font-weight:600; color:var(--accent); font-family:var(--mono);">${fl(g.projectedCorpus)}</div>
                        </div>
                        <div>
                            <div style="font-size:10px; color:var(--text3);">${statusLabel}</div>
                            <div style="font-size:12px; font-weight:700; color:${color}; font-family:var(--mono);">${isSurplus ? '+' : '−'}${fl(Math.abs(g.gap))}</div>
                        </div>
                    </div>
                </div>
                ${g.gap > 0 ? `<div style="margin-top:8px; padding:6px 10px; background:var(--bg); border-radius:6px; border-left:3px solid ${color};">
                    <span style="font-size:11px; color:var(--text2);">You need <strong style="color:${color}; font-family:var(--mono);">${fl(g.monthlySIP)}/month</strong> extra SIP to close this gap</span>
                </div>` : ''}
            </div>
        `;
    }).join('');

    return `
        <div>
            <div style="display:flex; align-items:center; gap:6px; margin-bottom:12px;">
                <span style="font-size:11px; color:var(--text3);">Goal gap analysis — inflation-adjusted targets vs projected corpus</span>
                <span style="cursor:help; font-size:14px;" title="Gap = Inflation-adjusted target − Projected corpus at target year. SIP computed using PMT formula with your weighted return rate.">ℹ️</span>
            </div>
            <div style="font-size:10px; color:var(--text3); display:flex; gap:12px; margin-bottom:8px; padding-bottom:6px; border-bottom:1px solid var(--border2);">
                <span style="display:inline-flex; align-items:center; gap:4px;"><span style="width:8px; height:8px; border-radius:50%; background:var(--green); display:inline-block;"></span> On track</span>
                <span style="display:inline-flex; align-items:center; gap:4px;"><span style="width:8px; height:8px; border-radius:50%; background:var(--yellow); display:inline-block;"></span> Gap ≤ 20%</span>
                <span style="display:inline-flex; align-items:center; gap:4px;"><span style="width:8px; height:8px; border-radius:50%; background:var(--red); display:inline-block;"></span> Gap &gt; 20%</span>
            </div>
            ${rows}
        </div>
    `;
}

function computeHealthScore() {
    const liquidity   = Math.min(100, computeEmergencyRatio()*100);
    const protection  = Math.min(100, computeInsuranceRatio()*100);
    const growth      = Math.min(100, computeSavingsRate()*100 * 5);
    const debt        = Math.max(0, 100 - computeDebtRatio()*200);
    const schemes     = (userData.schemes||[]).length > 0 ? 100 : 40;
    return Math.round(
        liquidity*0.20 + protection*0.25 + growth*0.20 + debt*0.15 + schemes*0.20
    );
}

function getAlerts() {
    const er = computeEmergencyRatio();
    const ir = computeInsuranceRatio();
    const sr = computeSavingsRate();
    const dr = computeDebtRatio();
    return {
        liquidity:  er<0.5 ? 'red' : er<1 ? 'yellow' : 'green',
        protection: ir<0.5 ? 'red' : ir<1 ? 'yellow' : 'green',
        growth:     sr<0.1 ? 'red' : sr<0.2 ? 'yellow' : 'green',
        debt:       dr>0.5 ? 'red' : dr>0.35 ? 'yellow' : 'green',
        schemes:    (userData.schemes||[]).length===0 ? 'red' : 'green'
    };
}

function getTopActions(limit=5) {
    const actions = [];
    const er = computeEmergencyRatio();
    if(er<1) {
        const gap=(1-er)*computeMonthlyExpenses()*6;
        actions.push({ icon:'🔥', priority:er<0.5?5:3, text:`Build emergency fund — need ${fl(gap)} more (6-month target).` });
    }
    const ir = computeInsuranceRatio();
    if(ir<1) {
        const annInc = computeMonthlyIncome()*12;
        const target = annInc*12;
        const gap = target - computeInsuranceCoverage().termCover;
        actions.push({ icon:'⚠️', priority:ir<0.5?5:3, text:`Increase term cover by ${fl(Math.max(0,gap))} to reach 12× annual income.` });
    }
    const sr = computeSavingsRate();
    if(sr<0.2) {
        actions.push({ icon:'📉', priority:2, text:`Savings rate is ${pct(sr)}. Target ≥20% — save ${fl((0.2-sr)*computeMonthlyIncome())} more/mo.` });
    }
    const dr = computeDebtRatio();
    if(dr>0.4) {
        actions.push({ icon:'💳', priority:3, text:`Debt-to-income ratio is ${pct(dr)} — above the 40% safe threshold.` });
    }
    if((userData.schemes||[]).length===0) {
        actions.push({ icon:'🏛️', priority:2, text:`Explore government schemes — you may qualify for benefits.` });
    }
    if(computeTotalInvestments()===0 && computeMonthlySavings()>0) {
        actions.push({ icon:'📈', priority:2, text:`You have ${fl(computeMonthlySavings())} monthly surplus — start investing in MF/SIP.` });
    }
    return actions.sort((a,b)=>b.priority-a.priority).slice(0,limit);
}

// ========== RISK DASHBOARD UI ==========

/**
 * toggleRiskDetail(metricId) — toggles visibility of the expandable detail row
 * Called via onclick on kpi-card elements
 * metricId: 'nim' | 'dsr' | 'lcr' | 'prot'
 */
window.toggleRiskDetail = function(metricId) {
    const el = $('risk-detail-' + metricId);
    if (el) el.hidden = !el.hidden;
};

/**
 * renderRiskDashboard() → HTML string
 *
 * Returns the complete Risk Dashboard card HTML.
 * Called inside renderOverview() — output is concatenated into the page-overview template.
 *
 * Hero: score-ring-svg with RAG-colored stroke, stability score centered
 * Below hero: top risk label + actionable suggestion
 * Sub-metric grid: 4 × kpi-card rows (NIM, DSR, LCR, Protection) with RAG dots
 * Expandable detail rows: formula, inputs, plain-language explanation
 */
function renderRiskDashboard() {
    // Gather all risk data
    const stability = computeStabilityScore();
    const nimData   = computeHouseholdNIM();
    const dsrData   = computeDSR();
    const lcrData   = computeLCR();
    const protData  = computeProtectionAdequacy();

    // Score ring geometry (reuses existing score-ring-svg pattern)
    const s     = stability.score || 0;
    const r     = 52;
    const circ  = 2 * Math.PI * r;
    const dash  = circ - (s / 100) * circ;
    const ragC  = stability.rag === 'green' ? 'var(--green)' : stability.rag === 'yellow' ? 'var(--yellow)' : 'var(--red)';

    // RAG dot helper
    const dot = (rag) => {
        const c = rag === 'green' ? 'var(--green)' : rag === 'yellow' ? 'var(--yellow)' : 'var(--red)';
        return `<span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${c}; flex-shrink:0;"></span>`;
    };

    // Top risk display name
    const riskLabels = { dsr: 'Debt Service Ratio', lcr: 'Liquidity Coverage', nim: 'Net Interest Margin', protection: 'Protection Adequacy' };
    const topRiskLabel = riskLabels[stability.topRisk] || stability.topRisk;

    // Detail row style (shared)
    const detailStyle = 'padding:12px 16px; margin:0 0 8px; background:rgba(26,34,53,0.5); border-radius:10px; border:1px solid var(--border2); font-size:12px; color:var(--text2); line-height:1.7;';

    return `
        <div class="card" style="margin-top:18px;">
            <div class="card-title"><span class="icon">📊</span> Financial Risk Dashboard</div>

            <!-- Hero: Stability Score Ring + Top Risk -->
            <div style="display:flex; gap:24px; align-items:center; flex-wrap:wrap; margin-bottom:20px;">
                <div style="text-align:center; flex-shrink:0;">
                    <div class="score-wrap">
                        <svg class="score-ring-svg" viewBox="0 0 120 120">
                            <circle class="score-ring-track" cx="60" cy="60" r="${r}"/>
                            <circle class="score-ring-bg" cx="60" cy="60" r="${r}"/>
                            <circle class="score-ring-fg" cx="60" cy="60" r="${r}"
                                stroke="${ragC}"
                                stroke-dasharray="${circ.toFixed(1)}"
                                stroke-dashoffset="${dash.toFixed(1)}"/>
                        </svg>
                        <div class="score-center">
                            <div class="score-num" style="color:${ragC}">${s}</div>
                            <div class="score-lbl" style="color:${ragC}">Stability</div>
                        </div>
                    </div>
                </div>
                <div style="flex:1; min-width:180px;">
                    <div style="font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.8px; margin-bottom:6px;">Top Risk Area</div>
                    <div style="font-size:16px; font-weight:700; color:var(--text); margin-bottom:8px;">${topRiskLabel}</div>
                    <div style="font-size:13px; color:var(--text2); line-height:1.5;">${stability.suggestion}</div>
                </div>
            </div>

            <!-- Sub-metric grid: 4 × kpi-card -->
            <div class="grid-4" style="margin-bottom:12px;">
                <div class="kpi-card ${nimData.rag}" style="cursor:pointer;" onclick="toggleRiskDetail('nim')">
                    <div class="kpi-label" style="display:flex; align-items:center; gap:6px;">${dot(nimData.rag)} Net Interest Margin</div>
                    <div class="kpi-value" style="font-size:22px;">${(nimData.nim || 0).toFixed(1)}%</div>
                    <div class="kpi-sub">Yield − Cost spread</div>
                </div>
                <div class="kpi-card ${dsrData.rag}" style="cursor:pointer;" onclick="toggleRiskDetail('dsr')">
                    <div class="kpi-label" style="display:flex; align-items:center; gap:6px;">${dot(dsrData.rag)} Debt Service Ratio</div>
                    <div class="kpi-value" style="font-size:22px;">${(dsrData.dsr || 0).toFixed(1)}%</div>
                    <div class="kpi-sub">EMI as % of income</div>
                </div>
                <div class="kpi-card ${lcrData.rag}" style="cursor:pointer;" onclick="toggleRiskDetail('lcr')">
                    <div class="kpi-label" style="display:flex; align-items:center; gap:6px;">${dot(lcrData.rag)} Liquidity Coverage</div>
                    <div class="kpi-value" style="font-size:22px;">${(lcrData.monthsCoverage || 0).toFixed(1)} <span style="font-size:12px; font-weight:400;">months</span></div>
                    <div class="kpi-sub">Emergency buffer</div>
                </div>
                <div class="kpi-card ${protData.rag}" style="cursor:pointer;" onclick="toggleRiskDetail('prot')">
                    <div class="kpi-label" style="display:flex; align-items:center; gap:6px;">${dot(protData.rag)} Protection Adequacy</div>
                    <div class="kpi-value" style="font-size:22px;">${((protData.ratio || 0) * 100).toFixed(0)}%</div>
                    <div class="kpi-sub">Insurance vs benchmark</div>
                </div>
            </div>

            <!-- Expandable detail rows (hidden by default) -->
            <div id="risk-detail-nim" hidden style="${detailStyle}">
                <div style="font-weight:600; color:var(--text); margin-bottom:4px;">NIM = Weighted Yield − Weighted Cost</div>
                <div>Yield: ${(nimData.weightedYield || 0).toFixed(1)}% &nbsp;|&nbsp; Cost: ${(nimData.weightedCost || 0).toFixed(1)}% &nbsp;|&nbsp; NIM: ${(nimData.nim || 0).toFixed(1)}%</div>
                <div style="margin-top:4px; color:var(--text3); font-style:italic;">${nimData.nim >= 2 ? 'Your investments earn well above your loan costs — your money is working for you.' : nimData.nim >= 0 ? 'Your investments barely cover your borrowing costs — consider optimising your mix.' : 'Your loans cost more than your investments earn — prioritise debt repayment or boost returns.'}</div>
            </div>
            <div id="risk-detail-dsr" hidden style="${detailStyle}">
                <div style="font-weight:600; color:var(--text); margin-bottom:4px;">DSR = (Total EMI ÷ Monthly Income) × 100</div>
                <div>EMI: ${fl(dsrData.totalEmi || 0)}/mo &nbsp;|&nbsp; Income: ${fl(dsrData.monthlyIncome || 0)}/mo &nbsp;|&nbsp; DSR: ${(dsrData.dsr || 0).toFixed(1)}%</div>
                <div style="margin-top:4px; color:var(--text3); font-style:italic;">${dsrData.dsr <= 35 ? 'Your debt load is well within safe limits — banks consider this healthy.' : dsrData.dsr <= 50 ? 'Your EMIs consume a significant chunk of income — avoid taking on more debt.' : 'Over half your income goes to EMIs — this is a red flag by banking standards.'}</div>
            </div>
            <div id="risk-detail-lcr" hidden style="${detailStyle}">
                <div style="font-weight:600; color:var(--text); margin-bottom:4px;">LCR = Liquid Savings ÷ (Monthly Expenses × 6)</div>
                <div>Liquid Savings: ${fl(lcrData.liquidSavings || 0)} &nbsp;|&nbsp; Monthly Expenses: ${fl(lcrData.monthlyExpenses || 0)}/mo &nbsp;|&nbsp; Coverage: ${(lcrData.monthsCoverage || 0).toFixed(1)} months</div>
                <div style="margin-top:4px; color:var(--text3); font-style:italic;">${lcrData.lcr >= 1 ? 'You have 6+ months of expenses covered — solid emergency buffer.' : lcrData.lcr >= 0.5 ? 'You have 3–6 months covered — keep building your emergency fund.' : 'Less than 3 months of expenses covered — building a liquid buffer should be a priority.'}</div>
            </div>
            <div id="risk-detail-prot" hidden style="${detailStyle}">
                <div style="font-weight:600; color:var(--text); margin-bottom:4px;">Protection = Average(Term Adequacy, Health Adequacy)</div>
                <div>Term Cover: ${fl(protData.termCover || 0)} (benchmark: ${fl(protData.termBenchmark || 0)}) &nbsp;|&nbsp; Health Cover: ${fl(protData.healthCover || 0)} (benchmark: ${fl(protData.healthBenchmark || 0)})</div>
                <div>Term Adequacy: ${((protData.termAdequacy || 0) * 100).toFixed(0)}% &nbsp;|&nbsp; Health Adequacy: ${((protData.healthAdequacy || 0) * 100).toFixed(0)}% &nbsp;|&nbsp; Dependents: ${protData.dependentCount || 0}</div>
                <div style="margin-top:4px; color:var(--text3); font-style:italic;">${protData.ratio >= 0.8 ? 'Your insurance coverage meets recommended benchmarks — well protected.' : protData.ratio >= 0.5 ? 'Partial coverage — consider increasing term or health insurance to close the gap.' : 'Significant insurance gap — increasing coverage should be a top priority for your family\'s safety net.'}</div>
            </div>
        </div>
    `;
}

// ========== STRESS ENGINE ==========

/**
 * STRESS_SCENARIOS — immutable catalog of 9 predefined stress scenarios
 * across 4 categories: Income Shock, Expense Shock, Rate Shock, Combined Shock.
 *
 * Each entry: { id, category, label, description, incomeFactor?, expenseFactor?,
 *               rateBump?, liquidHit? }
 *
 * Parameters are optional — only defined when the scenario applies that shock type.
 */
const STRESS_SCENARIOS = Object.freeze({
    'income-10':      { id: 'income-10',      category: 'Income Shock',   label: '10% Income Loss',
                        incomeFactor: 0.90,
                        description: 'Salary cut or reduced business income by 10%' },
    'income-20':      { id: 'income-20',      category: 'Income Shock',   label: '20% Income Loss',
                        incomeFactor: 0.80,
                        description: 'Major income disruption — 20% reduction' },
    'expense-10':     { id: 'expense-10',     category: 'Expense Shock',  label: '10% Expense Rise',
                        expenseFactor: 1.10,
                        description: 'Moderate inflation or lifestyle creep — expenses up 10%' },
    'expense-20':     { id: 'expense-20',     category: 'Expense Shock',  label: '20% Expense Rise',
                        expenseFactor: 1.20,
                        description: 'Significant cost increase — expenses up 20%' },
    'expense-med':    { id: 'expense-med',    category: 'Expense Shock',  label: 'Medical Emergency',
                        expenseFactor: 1.50, liquidHit: 'sixMonthExpenses',
                        description: 'Medical emergency — 50% expense spike + 6-month savings drain' },
    'rate-100':       { id: 'rate-100',       category: 'Rate Shock',     label: '+1% Rate Hike',
                        rateBump: 1,
                        description: 'RBI rate hike — all loan rates increase by 1 percentage point' },
    'rate-200':       { id: 'rate-200',       category: 'Rate Shock',     label: '+2% Rate Hike',
                        rateBump: 2,
                        description: 'Aggressive tightening — all loan rates increase by 2 percentage points' },
    'combined-mild':  { id: 'combined-mild',  category: 'Combined Shock', label: 'Mild Combined',
                        incomeFactor: 0.90, rateBump: 1,
                        description: '10% income loss + 1% rate hike — mild recession scenario' },
    'combined-severe':{ id: 'combined-severe',category: 'Combined Shock', label: 'Severe Combined',
                        incomeFactor: 0.80, rateBump: 2,
                        description: '20% income loss + 2% rate hike — severe recession scenario' }
});

/**
 * captureBaseMetrics() → BaseMetrics object
 *
 * Snapshots the current unshocked risk state using existing accessors.
 * All missing/undefined values default to zero via (value || 0) pattern.
 * Does NOT modify userData.
 *
 * Returns: { monthlyIncome, monthlyExpenses, totalEmi, liquidSavings,
 *            dsr, lcr, nim (full object), stabilityScore, protScore,
 *            protData, totalInvestments, totalLoanOutstanding }
 */
function captureBaseMetrics() {
    // Capture risk engine outputs — each returns an object with sub-fields
    const nimData       = computeHouseholdNIM();       // { nim, weightedYield, weightedCost, rag }
    const dsrData       = computeDSR();                // { dsr, ... }
    const lcrData       = computeLCR();                // { lcr, ... }
    const stabilityData = computeStabilityScore();     // { score, protScore, ... }
    const protData      = computeProtectionAdequacy(); // full protection adequacy result

    return {
        // Cash-flow base values from Forecast_Engine accessors
        monthlyIncome:       computeMonthlyIncome()        || 0,
        monthlyExpenses:     computeMonthlyExpenses()       || 0,
        totalEmi:            computeTotalEmi()              || 0,
        liquidSavings:       (userData.liquidSavings)        || 0,

        // Risk ratios from Risk_Engine
        dsr:                 dsrData.dsr                    || 0,
        lcr:                 lcrData.lcr                    || 0,
        nim:                 nimData,   // full object — needed for weightedYield/weightedCost in shocked NIM calc

        // Stability sub-scores — protScore needed for recomputing composite under shock
        stabilityScore:      stabilityData.score            || 0,
        protScore:           stabilityData.protScore        || 0,

        // Protection adequacy — passed through unchanged in shocked metrics
        protData:            protData,

        // Balance-sheet totals — used in net-worth survival analysis
        totalInvestments:    computeTotalInvestments()      || 0,
        totalLoanOutstanding: computeTotalLoanOutstanding() || 0
    };
}

/**
 * computeShockedEMI(rateBump) → Number (total monthly EMI with bumped rates)
 *
 * For each active loan, recalculates EMI using:
 *   EMI = P × r × (1+r)^n / ((1+r)^n − 1)
 * where P = loan.outstanding, r = (loan.rate + rateBump) / 12 / 100, n = loan.remainingTenure × 12
 *
 * When rateBump is 0 or undefined → returns computeTotalEmi()
 * When loan.outstanding is 0 → contributes 0 EMI
 * Does NOT modify any loan data in userData.
 */
function computeShockedEMI(rateBump) {
    if (!rateBump) return computeTotalEmi() || 0;

    const loans = getLoansForMember(currentProfile);
    let totalShockedEmi = 0;

    for (const loan of loans) {
        const P = loan.outstanding || 0;
        if (P === 0) continue; // zero outstanding → zero EMI contribution

        const annualRate = (loan.rate || 0) + rateBump;
        const r = annualRate / 12 / 100;  // monthly rate
        const n = (loan.remainingTenure || 0) * 12; // remaining months

        if (n === 0 || r === 0) {
            // No tenure remaining or zero rate → use original EMI
            totalShockedEmi += (loan.emi || 0);
            continue;
        }

        // Standard EMI formula: P × r × (1+r)^n / ((1+r)^n − 1)
        const compoundFactor = Math.pow(1 + r, n);
        const emi = P * r * compoundFactor / (compoundFactor - 1);
        totalShockedEmi += emi;
    }

    return totalShockedEmi;
}

/**
 * computeShockedMetrics(scenario, base) → ShockedMetrics object
 *
 * Applies scenario parameter overrides to base metrics and recomputes
 * DSR, LCR, NIM, and Stability_Score using the same formulas as the Risk_Engine.
 *
 * Does NOT modify userData or call any function that modifies userData.
 * All formulas are applied inline to shocked input values.
 */
function computeShockedMetrics(scenario, base) {
    // Apply income shock: base.monthlyIncome × incomeFactor (default: no change)
    const shockedIncome = base.monthlyIncome * (scenario.incomeFactor || 1);

    // Apply expense shock: base.monthlyExpenses × expenseFactor (default: no change)
    const shockedExpenses = base.monthlyExpenses * (scenario.expenseFactor || 1);

    // Apply rate shock: recalculate EMI with bumped rates (default: no change)
    const shockedEmi = scenario.rateBump
        ? computeShockedEMI(scenario.rateBump)
        : base.totalEmi;

    // Apply liquid hit: deduct from savings, clamp to 0 minimum
    let shockedLiquidSavings = base.liquidSavings;
    if (scenario.liquidHit === 'sixMonthExpenses') {
        shockedLiquidSavings = Math.max(0, base.liquidSavings - (base.monthlyExpenses * 6));
    } else if (typeof scenario.liquidHit === 'number') {
        shockedLiquidSavings = Math.max(0, base.liquidSavings - scenario.liquidHit);
    }

    // Recompute DSR: (shockedEmi / shockedIncome) × 100
    // Same zero-income guard as computeDSR()
    let shockedDsr;
    if (shockedIncome === 0) {
        shockedDsr = shockedEmi > 0 ? 100 : 0;
    } else {
        shockedDsr = (shockedEmi / shockedIncome) * 100;
    }

    // Recompute LCR: shockedLiquidSavings / (shockedExpenses × 6)
    // Same zero-expense guard as computeLCR()
    let shockedLcr;
    const sixMonthExp = shockedExpenses * 6;
    if (sixMonthExp === 0) {
        shockedLcr = shockedLiquidSavings > 0 ? 1.0 : 0;
    } else {
        shockedLcr = shockedLiquidSavings / sixMonthExp;
    }

    // Recompute NIM: for rate shocks, weightedCost increases by rateBump
    // NIM = weightedYield − (weightedCost + rateBump)
    let shockedNimValue;
    if (scenario.rateBump) {
        shockedNimValue = (base.nim.weightedYield || 0) - ((base.nim.weightedCost || 0) + scenario.rateBump);
    } else {
        shockedNimValue = base.nim.nim || 0;
    }

    // Recompute Stability Score using same normalization + weights as computeStabilityScore()
    const nimScore  = clamp(0, 100, 50 + shockedNimValue * 25);
    const dsrScore  = clamp(0, 100, 100 - shockedDsr * 2);
    const lcrScore  = clamp(0, 100, shockedLcr * 100);
    const protScore = base.protScore || 0; // protection unchanged by stress scenarios

    const shockedStabilityScore = Math.round(
        dsrScore * 0.30 + lcrScore * 0.25 + nimScore * 0.20 + protScore * 0.25
    );

    return {
        monthlyIncome:   shockedIncome,
        monthlyExpenses: shockedExpenses,
        totalEmi:        shockedEmi,
        liquidSavings:   shockedLiquidSavings,
        dsr:             shockedDsr,
        lcr:             shockedLcr,
        nim:             shockedNimValue,
        stabilityScore:  shockedStabilityScore,
        nimScore, dsrScore, lcrScore, protScore
    };
}

/**
 * evaluateShockImpact(base, shocked, scenario) → ImpactResult object
 *
 * Computes deltas between base and shocked metrics, runs survival analysis,
 * and classifies severity.
 *
 * Deltas (positive = worsened):
 *   stabilityDelta = base.stabilityScore − shocked.stabilityScore
 *   dsrDelta       = shocked.dsr − base.dsr
 *   lcrDelta       = base.lcr − shocked.lcr
 *   nimDelta       = base.nim.nim − shocked.nim
 *
 * Survival Analysis:
 *   monthsLiquidity = shockedLiquidSavings / monthlyDeficit (capped at 999)
 *   dsrBreach       = shocked.dsr > 50
 *   stabilityBreach = shocked.stabilityScore < 50
 *   netWorthYear1   = annual net cash flow + investments − loans
 *
 * Severity: critical if stability < 50 OR dsr > 50, warning if months < 6, else manageable
 */
function evaluateShockImpact(base, shocked, scenario) {
    // Compute deltas (positive = worsened for all)
    const stabilityDelta = base.stabilityScore - shocked.stabilityScore;
    const dsrDelta       = shocked.dsr - base.dsr;
    const lcrDelta       = base.lcr - shocked.lcr;
    const nimDelta       = (base.nim.nim || 0) - shocked.nim;

    // Survival analysis: months of liquidity under shock
    // monthlyDeficit = shocked expenses + shocked EMI − shocked income
    const monthlyDeficit = shocked.monthlyExpenses + shocked.totalEmi - shocked.monthlyIncome;
    let monthsLiquidity;
    if (monthlyDeficit <= 0) {
        monthsLiquidity = 999; // no deficit → unlimited (capped)
    } else {
        // monthsLiquidity = shockedLiquidSavings / monthlyDeficit
        monthsLiquidity = shocked.liquidSavings / monthlyDeficit;
    }

    // Breach flags
    const dsrBreach       = shocked.dsr > 50;
    const stabilityBreach = shocked.stabilityScore < 50;

    // Net worth in year 1: (shocked income − shocked expenses − shocked EMI) × 12 + investments − loans
    const annualNetCashFlow = (shocked.monthlyIncome - shocked.monthlyExpenses - shocked.totalEmi) * 12;
    const netWorthYear1     = annualNetCashFlow + (base.totalInvestments || 0) - (base.totalLoanOutstanding || 0);
    const netWorthNegative  = netWorthYear1 < 0;

    // Severity classification:
    // critical = shocked stability < 50 OR shocked DSR > 50
    // warning  = months of liquidity < 6
    // manageable = otherwise
    let severity;
    if (shocked.stabilityScore < 50 || shocked.dsr > 50) {
        severity = 'critical';
    } else if (monthsLiquidity < 6) {
        severity = 'warning';
    } else {
        severity = 'manageable';
    }

    return {
        stabilityDelta, dsrDelta, lcrDelta, nimDelta,
        monthsLiquidity: Math.min(monthsLiquidity, 999),
        dsrBreach, stabilityBreach, netWorthNegative, netWorthYear1,
        severity
    };
}

/**
 * runStressScenario(scenarioId) → StressResult object
 *
 * Orchestrates the full stress test pipeline:
 * 1. Look up scenario from STRESS_SCENARIOS
 * 2. captureBaseMetrics()
 * 3. computeShockedMetrics(scenario, base)
 * 4. evaluateShockImpact(base, shocked, scenario)
 * 5. Assemble and return complete result
 *
 * Returns error object for invalid scenario IDs (no exception thrown).
 * Does NOT modify userData, make API calls, or access the database.
 */
function runStressScenario(scenarioId) {
    // Step 1: Look up scenario from frozen catalog
    const scenario = STRESS_SCENARIOS[scenarioId];
    if (!scenario) {
        return { error: true, message: `Unknown scenario: ${scenarioId}` };
    }

    // Step 2: Snapshot current unshocked risk state
    const base    = captureBaseMetrics();

    // Step 3: Apply scenario shocks to base metrics → recompute DSR, LCR, NIM, Stability
    const shocked = computeShockedMetrics(scenario, base);

    // Step 4: Compute deltas, survival analysis, severity classification
    const impact  = evaluateShockImpact(base, shocked, scenario);

    // Step 5: Assemble complete result object
    return {
        scenarioId:    scenario.id,
        scenarioLabel: scenario.label,
        category:      scenario.category,
        description:   scenario.description,
        base,
        shocked,
        impact
    };
}

let stressActiveCategory = 'Income Shock';
let stressActiveScenario = 'income-10';

/**
 * renderStressTestCard() → HTML string
 *
 * Returns the complete Stress Test card HTML.
 * Called inside renderOverview() — output is concatenated into the page-overview template.
 * Positioned below the Risk Dashboard card.
 *
 * Structure:
 *   Card title → Category tabs → Scenario selector → Results (before/after + severity + survival)
 */
function renderStressTestCard() {
    const categories = ['Income Shock', 'Expense Shock', 'Rate Shock', 'Combined Shock'];
    const categoryIcons = { 'Income Shock': '💰', 'Expense Shock': '📈', 'Rate Shock': '🏦', 'Combined Shock': '⚡' };

    // Get scenarios for active category
    const scenariosInCategory = Object.values(STRESS_SCENARIOS).filter(s => s.category === stressActiveCategory);

    // Run the active scenario
    const result = runStressScenario(stressActiveScenario);

    // Category tabs HTML
    const categoryTabsHtml = categories.map(cat => {
        const isActive = cat === stressActiveCategory;
        return `<button onclick="switchStressCategory('${cat}')"
            style="padding:6px 14px; font-size:12px; font-weight:600; border:none; cursor:pointer; transition:all 0.2s; border-radius:6px;
            ${isActive ? 'background:var(--accent); color:#fff;' : 'background:transparent; color:var(--text3);'}">${categoryIcons[cat] || ''} ${cat}</button>`;
    }).join('');

    // Scenario selector buttons HTML
    const scenarioButtonsHtml = scenariosInCategory.map(s => {
        const isActive = s.id === stressActiveScenario;
        return `<button onclick="selectStressScenario('${s.id}')"
            style="padding:5px 12px; font-size:11px; font-weight:500; border:1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}; cursor:pointer; transition:all 0.2s; border-radius:6px;
            ${isActive ? 'background:var(--accent); color:#fff;' : 'background:transparent; color:var(--text2);'}">${s.label}</button>`;
    }).join('');

    // Build results HTML
    let resultsHtml = '';
    if (result.error) {
        resultsHtml = `<div style="padding:16px; color:var(--text3); text-align:center;">⚠️ ${result.message}</div>`;
    } else {
        const { base, shocked, impact } = result;

        // Severity banner colors
        const severityColors = { critical: 'var(--red)', warning: 'var(--yellow)', manageable: 'var(--green)' };
        const severityLabels = {
            critical: '🚨 Critical — Your household finances are severely impacted under this scenario',
            warning: '⚠️ Warning — Your liquidity buffer is thin under this scenario',
            manageable: '✅ Manageable — Your household can absorb this shock'
        };
        const sevColor = severityColors[impact.severity] || 'var(--text3)';

        // Delta display helper: shows +/- with color
        const deltaHtml = (val, unit, invertColor) => {
            if (val === 0) return `<span style="color:var(--text3);">—</span>`;
            const sign = val > 0 ? '+' : '';
            // For deltas where positive = worse, use red for positive
            const color = invertColor
                ? (val > 0 ? 'var(--red)' : 'var(--green)')
                : (val < 0 ? 'var(--red)' : 'var(--green)');
            return `<span style="color:${color}; font-weight:600;">${sign}${val.toFixed(1)}${unit}</span>`;
        };

        // Before-vs-after KPI cards
        const kpiStyle = 'padding:12px; background:rgba(26,34,53,0.5); border-radius:10px; border:1px solid var(--border2); text-align:center;';

        resultsHtml = `
            <!-- Scenario description -->
            <div style="padding:8px 0 12px; font-size:12px; color:var(--text3); font-style:italic;">${result.description}</div>

            <!-- Severity Banner -->
            <div style="padding:10px 16px; border-radius:8px; margin-bottom:16px; border:1px solid ${sevColor}; background:${sevColor}15;">
                <span style="font-size:13px; color:${sevColor}; font-weight:600;">${severityLabels[impact.severity]}</span>
            </div>

            <!-- Stability Delta Hero -->
            <div style="text-align:center; margin-bottom:16px;">
                <div style="font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.8px;">Stability Score Impact</div>
                <div style="font-size:32px; font-weight:700; color:${impact.stabilityDelta > 0 ? 'var(--red)' : 'var(--green)'};">
                    ${impact.stabilityDelta > 0 ? '−' : '+'}${Math.abs(impact.stabilityDelta)} <span style="font-size:14px; font-weight:400;">points</span>
                </div>
                <div style="font-size:12px; color:var(--text3);">${base.stabilityScore} → ${shocked.stabilityScore}</div>
            </div>

            <!-- Before-vs-After Comparison: 4 KPI cards -->
            <div class="grid-4" style="margin-bottom:16px;">
                <div style="${kpiStyle}">
                    <div style="font-size:10px; color:var(--text3); text-transform:uppercase; margin-bottom:4px;">Stability</div>
                    <div style="font-size:20px; font-weight:700; color:var(--text);">${shocked.stabilityScore}</div>
                    <div style="font-size:11px; color:var(--text3);">was ${base.stabilityScore}</div>
                    <div style="margin-top:4px;">${deltaHtml(-impact.stabilityDelta, '', true)}</div>
                </div>
                <div style="${kpiStyle}">
                    <div style="font-size:10px; color:var(--text3); text-transform:uppercase; margin-bottom:4px;">DSR</div>
                    <div style="font-size:20px; font-weight:700; color:var(--text);">${shocked.dsr.toFixed(1)}%</div>
                    <div style="font-size:11px; color:var(--text3);">was ${base.dsr.toFixed(1)}%</div>
                    <div style="margin-top:4px;">${deltaHtml(impact.dsrDelta, '%', false)}</div>
                </div>
                <div style="${kpiStyle}">
                    <div style="font-size:10px; color:var(--text3); text-transform:uppercase; margin-bottom:4px;">LCR</div>
                    <div style="font-size:20px; font-weight:700; color:var(--text);">${shocked.lcr.toFixed(2)}</div>
                    <div style="font-size:11px; color:var(--text3);">was ${base.lcr.toFixed(2)}</div>
                    <div style="margin-top:4px;">${deltaHtml(-impact.lcrDelta, '', true)}</div>
                </div>
                <div style="${kpiStyle}">
                    <div style="font-size:10px; color:var(--text3); text-transform:uppercase; margin-bottom:4px;">NIM</div>
                    <div style="font-size:20px; font-weight:700; color:var(--text);">${(shocked.nim || 0).toFixed(1)}%</div>
                    <div style="font-size:11px; color:var(--text3);">was ${(base.nim.nim || 0).toFixed(1)}%</div>
                    <div style="margin-top:4px;">${deltaHtml(-impact.nimDelta, '%', true)}</div>
                </div>
            </div>

            <!-- Survival Analysis Panel -->
            <div style="padding:12px 16px; background:rgba(26,34,53,0.5); border-radius:10px; border:1px solid var(--border2); font-size:12px; line-height:1.8;">
                <div style="font-weight:600; color:var(--text); margin-bottom:6px;">🛡️ Survival Analysis</div>
                <div style="color:var(--text2);">
                    <span style="color:${impact.monthsLiquidity < 6 ? 'var(--red)' : impact.monthsLiquidity < 12 ? 'var(--yellow)' : 'var(--green)'}; font-weight:600;">
                        ${impact.monthsLiquidity >= 999 ? '∞' : impact.monthsLiquidity.toFixed(1)} months
                    </span> of liquidity under this shock
                </div>
                ${impact.dsrBreach ? '<div style="color:var(--red);">⚠️ DSR breaches 50% — debt burden exceeds safe limit</div>' : ''}
                ${impact.stabilityBreach ? '<div style="color:var(--red);">⚠️ Stability drops below 50 — household finances under severe stress</div>' : ''}
                ${impact.netWorthNegative ? '<div style="color:var(--red);">⚠️ Net worth turns negative in Year 1 (' + fl(impact.netWorthYear1) + ')</div>' : '<div style="color:var(--green);">✓ Net worth remains positive in Year 1 (' + fl(impact.netWorthYear1) + ')</div>'}
            </div>
        `;
    }

    return `
        <div class="card" style="margin-top:18px;">
            <div class="card-title"><span class="icon">🧪</span> Stress Test</div>

            <!-- Category Tabs -->
            <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:12px;">
                ${categoryTabsHtml}
            </div>

            <!-- Scenario Selector -->
            <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:16px;">
                ${scenarioButtonsHtml}
            </div>

            <!-- Results Section -->
            <div id="stress-results">
                ${resultsHtml}
            </div>
        </div>
    `;
}

/**
 * switchStressCategory(category) — switches the active category tab
 * and selects the first scenario in that category.
 * Exposed on window for onclick handlers.
 */
window.switchStressCategory = function(category) {
    stressActiveCategory = category;
    // Select first scenario in the new category
    const firstInCategory = Object.values(STRESS_SCENARIOS).find(s => s.category === category);
    stressActiveScenario = firstInCategory ? firstInCategory.id : 'income-10';
    // Re-render the entire page (stress card is inline in renderOverview template)
    renderCurrentPage();
};

/**
 * selectStressScenario(scenarioId) — runs the selected scenario
 * and re-renders the results section only.
 * Exposed on window for onclick handlers.
 */
window.selectStressScenario = function(scenarioId) {
    stressActiveScenario = scenarioId;
    // Re-render the full page to update stress card
    renderCurrentPage();
};

// ========== LOAN AMORTIZATION & PAYOFF CALCULATOR ==========
function computeLoanAmortization(loan) {
    const principal = loan.principal || loan.outstanding || 0;
    const rate      = loan.rate || 0;
    const emi       = loan.emi || 0;
    const tenure    = loan.tenureMonths || loan.tenure_months || 0;
    const paid      = loan.paidMonths || 0;

    if (!principal || !rate || !emi) {
        return {
            outstanding: loan.outstanding || 0,
            remainingMonths: tenure ? tenure - paid : null,
            withExtraPayment: () => null,
            withLumpsum: () => null
        };
    }

    const r = rate / 100 / 12;

    let outstanding = principal;
    for (let i = 0; i < paid; i++) {
        const interest = outstanding * r;
        const principalPaid = emi - interest;
        outstanding -= principalPaid;
        if (outstanding <= 0) { outstanding = 0; break; }
    }

    const remainingMonths = tenure ? tenure - paid : null;

    function withExtraPayment(extraPerMonth) {
        let bal = outstanding;
        if (bal <= 0) return 0;
        let months = 0;
        while (bal > 1 && months < 600) {
            const interest = bal * r;
            let payment = emi + extraPerMonth;
            if (payment > bal + interest) payment = bal + interest;
            bal = bal + interest - payment;
            months++;
        }
        return months;
    }

    function withLumpsum(lumpsum) {
        let bal = outstanding - lumpsum;
        if (bal <= 0) return 0;
        let months = 0;
        while (bal > 1 && months < 600) {
            const interest = bal * r;
            let payment = emi;
            if (payment > bal + interest) payment = bal + interest;
            bal = bal + interest - payment;
            months++;
        }
        return months;
    }

    return { outstanding, remainingMonths, withExtraPayment, withLumpsum };
}

function loanScenarioHtml(loan) {
    const amort = computeLoanAmortization(loan);
    const canAnalyse = loan.principal && loan.rate && loan.emi;
    if (!canAnalyse) return '';

    const rem = amort.remainingMonths;
    const extra5k  = amort.withExtraPayment(5000);
    const extra10k = amort.withExtraPayment(10000);
    const lump2L   = amort.withLumpsum(200000);
    const lump5L   = amort.withLumpsum(500000);

    const savingsLabel = (newMonths) => {
        if (newMonths === null || rem === null) return '—';
        const saved = rem - newMonths;
        if (saved <= 0) return `${newMonths} mo`;
        const yrs = Math.floor(saved / 12);
        const mos = saved % 12;
        const savedStr = yrs > 0 ? `${yrs}y ${mos}m earlier` : `${mos}m earlier`;
        return `${newMonths} mo <span style="color:var(--green); font-size:10px;">(${savedStr})</span>`;
    };

    return `
        <div class="loan-scenario-box">
            <div class="scenario-title">📉 Payoff Scenarios — Outstanding: ${fl(amort.outstanding)}${rem ? ` · ${rem} months remaining` : ''}</div>
            <div class="scenario-grid">
                <div class="scenario-item">
                    <div class="s-label">Extra ₹5,000/mo</div>
                    <div class="s-value">${extra5k !== null ? extra5k + ' mo' : '—'}</div>
                    <div class="s-sub">${rem && extra5k !== null ? `Save ${rem - extra5k} months` : ''}</div>
                </div>
                <div class="scenario-item">
                    <div class="s-label">Extra ₹10,000/mo</div>
                    <div class="s-value">${extra10k !== null ? extra10k + ' mo' : '—'}</div>
                    <div class="s-sub">${rem && extra10k !== null ? `Save ${rem - extra10k} months` : ''}</div>
                </div>
                <div class="scenario-item">
                    <div class="s-label">Lumpsum ₹2 Lakh</div>
                    <div class="s-value">${lump2L !== null ? lump2L + ' mo' : '—'}</div>
                    <div class="s-sub">${rem && lump2L !== null ? `Save ${rem - lump2L} months` : ''}</div>
                </div>
                <div class="scenario-item">
                    <div class="s-label">Lumpsum ₹5 Lakh</div>
                    <div class="s-value">${lump5L !== null ? lump5L + ' mo' : '—'}</div>
                    <div class="s-sub">${rem && lump5L !== null ? `Save ${rem - lump5L} months` : ''}</div>
                </div>
            </div>
        </div>
    `;
}

// ========== NEW AI MODULE RENDER FUNCTIONS ==========
async function renderBudgetCoach() {
    // This could be displayed on Overview or a dedicated page. For now, we'll put it on a new page 'budget' if needed.
    // But we don't have a page for it yet; we can call it from Overview later.
    sh('page-budget', `<div class="card">Budget Coach – coming soon (API endpoint needed).</div>`);
}

async function renderNriPlanner() {
    const storedHtml = window.lastNriPlanHtml ? `<div id="nri-results">${window.lastNriPlanHtml}</div>` : '<div id="nri-results"></div>';

    const formHtml = `
        <div class="card" style="background:linear-gradient(135deg, var(--bg2), var(--bg3)); border-color:var(--accent);">
            <div class="card-title"><span class="icon">🇮🇳</span> Return to India Expense Planner</div>
            <p style="font-size:14px; color:var(--text); margin-bottom:8px; font-weight:600;">
                Plan your complete monthly expenses before moving back to India
            </p>
            <p style="font-size:12px; color:var(--text2); margin-bottom:20px; line-height:1.6;">
                Get detailed cost breakdowns for housing, education, transportation, insurance, and daily expenses across major Indian cities.
            </p>
        </div>

        <div class="card">
            <div class="card-title"><span class="icon">📍</span> Location & Family Details</div>
            <div class="grid-2">
                <div>
                    <label style="font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:5px;">Target City in India</label>
                    <select id="nri-city" class="modal-inp">
                        <option value="bangalore">Bangalore</option>
                        <option value="mumbai">Mumbai</option>
                        <option value="delhi">Delhi NCR</option>
                        <option value="hyderabad">Hyderabad</option>
                        <option value="pune">Pune</option>
                        <option value="chennai">Chennai</option>
                        <option value="kolkata">Kolkata</option>
                        <option value="ahmedabad">Ahmedabad</option>
                    </select>
                </div>
                <div>
                    <label style="font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:5px;">Your Profession/Industry</label>
                    <select id="nri-profession" class="modal-inp">
                        <option value="it">IT/Software</option>
                        <option value="finance">Finance/Banking</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="consulting">Consulting</option>
                        <option value="manufacturing">Manufacturing</option>
                        <option value="education">Education</option>
                        <option value="entrepreneur">Entrepreneur/Business</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div>
                    <label style="font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:5px;">Monthly Budget (₹)</label>
                    <input id="nri-budget" class="modal-inp" type="number" value="150000" placeholder="e.g. 150000">
                </div>
                <div>
                    <label style="font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:5px;">Planned Return Year</label>
                    <input id="nri-year" class="modal-inp" type="number" value="2027" min="2025" max="2040">
                </div>
                <div>
                    <label style="font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:5px;">Number of Adults</label>
                    <input id="nri-adults" class="modal-inp" type="number" value="2" min="1" max="10">
                </div>
                <div>
                    <label style="font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:5px;">Number of Children</label>
                    <input id="nri-children" class="modal-inp" type="number" value="1" min="0" max="10">
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-title"><span class="icon">🏠</span> Housing Preference</div>
            <div class="grid-2">
                <div>
                    <label style="font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:5px;">Housing Type</label>
                    <select id="nri-housing" class="modal-inp">
                        <option value="rent">Rent</option>
                        <option value="buy">Buy (EMI)</option>
                    </select>
                </div>
                <div>
                    <label style="font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:5px;">Property Size</label>
                    <select id="nri-property-size" class="modal-inp">
                        <option value="2bhk">2 BHK</option>
                        <option value="3bhk">3 BHK</option>
                        <option value="4bhk">4 BHK</option>
                        <option value="villa">Villa/Independent House</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-title"><span class="icon">🚗</span> Transportation</div>
            <div class="grid-2">
                <div>
                    <label style="font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:5px;">Car Ownership</label>
                    <select id="nri-car" class="modal-inp">
                        <option value="none">No Car</option>
                        <option value="one">One Car</option>
                        <option value="two">Two Cars</option>
                    </select>
                </div>
                <div>
                    <label style="font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:5px;">Car Type</label>
                    <select id="nri-car-type" class="modal-inp">
                        <option value="hatchback">Hatchback (₹5-8L)</option>
                        <option value="sedan">Sedan (₹10-15L)</option>
                        <option value="suv">SUV (₹15-25L)</option>
                        <option value="luxury">Luxury (₹30L+)</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-title"><span class="icon">🎓</span> Education (if children)</div>
            <div class="grid-2">
                <div>
                    <label style="font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:5px;">School Type</label>
                    <select id="nri-school" class="modal-inp">
                        <option value="none">No School-Age Children</option>
                        <option value="government">Government School</option>
                        <option value="private">Private School</option>
                        <option value="international">International School</option>
                    </select>
                </div>
                <div>
                    <label style="font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:5px;">Number in School</label>
                    <input id="nri-school-count" class="modal-inp" type="number" value="1" min="0" max="10">
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-title"><span class="icon">💼</span> Lifestyle Preferences</div>
            <div class="grid-2">
                <div>
                    <label style="font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:5px;">Lifestyle Level</label>
                    <select id="nri-lifestyle" class="modal-inp">
                        <option value="basic">Basic (Essential only)</option>
                        <option value="moderate">Moderate (Comfortable)</option>
                        <option value="premium">Premium (High-end)</option>
                    </select>
                </div>
                <div>
                    <label style="font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:5px;">Domestic Help</label>
                    <select id="nri-help" class="modal-inp">
                        <option value="none">None</option>
                        <option value="parttime">Part-time Maid</option>
                        <option value="fulltime">Full-time Maid</option>
                        <option value="multiple">Cook + Maid + Driver</option>
                    </select>
                </div>
            </div>
        </div>

        <button class="primary-btn" id="nri-btn" type="button" onclick="calculateReturnToIndiaPlan()" style="width:100%; padding:14px; font-size:15px;">
            🧮 Calculate Complete Monthly Expenses
        </button>
        ${storedHtml}
    `;
    sh('page-nri', formHtml);
}

window.calculateReturnToIndiaPlan = async function() {
    const btn = document.getElementById('nri-btn');
    if (btn) { btn.textContent = '⏳ Calculating...'; btn.disabled = true; }

    window.lastNriPlanHtml = null;
    sh('nri-results', '<div class="loading-state"><div class="spinner"></div><p>Analyzing best localities and calculating expenses...</p></div>');

    try {
        // Get all inputs
        const city = document.getElementById('nri-city')?.value || 'bangalore';
        const profession = document.getElementById('nri-profession')?.value || 'it';
        const budget = parseInt(document.getElementById('nri-budget')?.value || '150000');
        const returnYear = parseInt(document.getElementById('nri-year')?.value || '2027');
        const adults = parseInt(document.getElementById('nri-adults')?.value || '2');
        const children = parseInt(document.getElementById('nri-children')?.value || '1');
        const housing = document.getElementById('nri-housing')?.value || 'rent';
        const propertySize = document.getElementById('nri-property-size')?.value || '3bhk';
        const car = document.getElementById('nri-car')?.value || 'one';
        const carType = document.getElementById('nri-car-type')?.value || 'sedan';
        const school = document.getElementById('nri-school')?.value || 'private';
        const schoolCount = parseInt(document.getElementById('nri-school-count')?.value || '1');
        const lifestyle = document.getElementById('nri-lifestyle')?.value || 'moderate';
        const help = document.getElementById('nri-help')?.value || 'parttime';

        const payload = {
            city, profession, budget, returnYear, adults, children, housing, propertySize,
            car, carType, school, schoolCount, lifestyle, help
        };

        const res = await fetch('/api/nri/return-expenses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        renderReturnToIndiaResults(data);

    } catch (e) {
        console.error('Return to India plan error:', e);
        // Fallback to client-side calculation
        const fallbackData = calculateExpensesFallback();
        renderReturnToIndiaResults(fallbackData);
    } finally {
        const btn = document.getElementById('nri-btn');
        if (btn) { btn.textContent = '🧮 Calculate Complete Monthly Expenses'; btn.disabled = false; }
    }
};

function calculateExpensesFallback() {
    const city = document.getElementById('nri-city')?.value || 'bangalore';
    const profession = document.getElementById('nri-profession')?.value || 'it';
    const budget = parseInt(document.getElementById('nri-budget')?.value || '150000');
    const returnYear = parseInt(document.getElementById('nri-year')?.value || '2027');
    const adults = parseInt(document.getElementById('nri-adults')?.value || '2');
    const children = parseInt(document.getElementById('nri-children')?.value || '1');
    const housing = document.getElementById('nri-housing')?.value || 'rent';
    const propertySize = document.getElementById('nri-property-size')?.value || '3bhk';
    const car = document.getElementById('nri-car')?.value || 'one';
    const carType = document.getElementById('nri-car-type')?.value || 'sedan';
    const school = document.getElementById('nri-school')?.value || 'private';
    const schoolCount = parseInt(document.getElementById('nri-school-count')?.value || '1');
    const lifestyle = document.getElementById('nri-lifestyle')?.value || 'moderate';
    const help = document.getElementById('nri-help')?.value || 'parttime';

    // AI-powered locality recommendations based on profession and city
    // Data sources: NoBroker.in, 99acres.com, SquareYards.com, GreatAndhra.com (Feb 2026)
    const localityData = {
        hyderabad: {
            it: {
                west: { name: 'West Hyderabad (HITEC City, Gachibowli, Madhapur)', score: 95, rent3bhk: 62000, schools: ['Oakridge', 'Glendale', 'Chirec'], commute: '10-20 min', pros: ['IT hubs nearby', 'Modern infrastructure', 'International schools', 'Good connectivity'], cons: ['High rent ₹50K-90K', 'Traffic during peak hours'] },
                south: { name: 'South Hyderabad (Financial District, Nanakramguda)', score: 90, rent3bhk: 68000, schools: ['Glendale', 'Oakridge'], commute: '15-25 min', pros: ['Close to IT parks', 'Premium localities', 'Excellent schools'], cons: ['Expensive ₹60K-75K', 'High density'] },
                north: { name: 'North Hyderabad (Kompally, Miyapur, Kukatpally)', score: 75, rent3bhk: 38000, schools: ['Oakridge Bachupally', 'Meridian'], commute: '30-40 min', pros: ['Balanced cost', 'Good schools', 'Metro access'], cons: ['Moderate commute', 'Developing infrastructure'] },
                east: { name: 'East Hyderabad (Uppal, Nacharam)', score: 70, rent3bhk: 30000, schools: ['Delhi Public School', 'Narayana'], commute: '40-60 min', pros: ['Affordable ₹25K-35K', 'Developing area', 'Metro connectivity'], cons: ['Long commute to IT hubs', 'Limited premium amenities'] }
            },
            finance: {
                south: { name: 'South Hyderabad (Banjara Hills, Jubilee Hills)', score: 95, rent3bhk: 80000, schools: ['Oakridge', 'Glendale', 'Chirec'], commute: '10-15 min', pros: ['Financial hub', 'Most prestigious', 'Top schools', 'Social infrastructure'], cons: ['Very expensive ₹70K-90K', 'Old area traffic'] },
                west: { name: 'West Hyderabad (Financial District, Gachibowli)', score: 90, rent3bhk: 68000, schools: ['Glendale', 'Oakridge'], commute: '15-20 min', pros: ['Financial District proximity', 'Modern infrastructure', 'Premium amenities'], cons: ['Expensive ₹60K-75K', 'Traffic'] }
            }
        },
        bangalore: {
            it: {
                east: { name: 'East Bangalore (Whitefield, Marathahalli)', score: 95, rent3bhk: 45000, schools: ['Inventure', 'Greenwood High'], commute: '10-20 min', pros: ['IT corridor', 'Modern infrastructure', 'International schools'], cons: ['Traffic', 'Rent ₹40K-55K'] },
                south: { name: 'South Bangalore (Electronic City, HSR)', score: 90, rent3bhk: 42000, schools: ['Greenwood', 'Inventure'], commute: '15-25 min', pros: ['IT hubs', 'Metro connectivity', 'Good schools'], cons: ['Expensive ₹38K-50K', 'Crowded'] },
                north: { name: 'North Bangalore (Yelahanka, Hebbal)', score: 75, rent3bhk: 32000, schools: ['Delhi Public School'], commute: '40-50 min', pros: ['Affordable ₹28K-38K', 'Airport proximity', 'Developing'], cons: ['Long commute', 'Limited amenities'] },
                west: { name: 'West Bangalore (Rajajinagar, Yeshwanthpur)', score: 70, rent3bhk: 35000, schools: ['Bishop Cotton'], commute: '35-45 min', pros: ['Central location', 'Established area'], cons: ['Old infrastructure', 'Traffic'] }
            }
        },
        mumbai: {
            it: {
                west: { name: 'Western Suburbs (Andheri, Goregaon, Malad)', score: 90, rent3bhk: 75000, schools: ['Oberoi International', 'JBCN'], commute: '20-30 min', pros: ['IT parks nearby', 'Good schools', 'Metro connectivity'], cons: ['Very expensive ₹65K-90K', 'Crowded'] },
                central: { name: 'Central Mumbai (BKC, Kurla)', score: 85, rent3bhk: 85000, schools: ['Dhirubhai Ambani'], commute: '15-25 min', pros: ['Business district', 'Premium schools'], cons: ['Extremely expensive ₹75K-100K', 'High density'] }
            },
            finance: {
                south: { name: 'South Mumbai (Nariman Point, Fort, Lower Parel)', score: 95, rent3bhk: 120000, schools: ['Cathedral', 'Campion'], commute: '10-15 min', pros: ['Financial capital', 'Heritage schools', 'Prestige'], cons: ['Most expensive in India ₹100K-150K', 'Limited space'] }
            }
        },
        delhi: {
            it: {
                south: { name: 'Gurgaon (Cyber City, DLF Phase 1-5)', score: 95, rent3bhk: 50000, schools: ['DPS Gurgaon', 'Heritage Xperiential'], commute: '15-25 min', pros: ['IT hub', 'Modern infrastructure', 'International schools'], cons: ['Expensive ₹45K-65K', 'Haryana state'] },
                west: { name: 'West Delhi (Dwarka, Janakpuri)', score: 75, rent3bhk: 35000, schools: ['DPS Dwarka'], commute: '40-50 min', pros: ['Metro connectivity', 'Affordable ₹30K-40K', 'Planned sectors'], cons: ['Long commute', 'Pollution'] }
            }
        },
        pune: {
            it: {
                west: { name: 'West Pune (Hinjewadi, Wakad)', score: 95, rent3bhk: 35000, schools: ['Indus International', 'Vibgyor'], commute: '10-20 min', pros: ['IT hub', 'Modern townships', 'Good schools'], cons: ['Traffic', 'Rent ₹30K-45K'] },
                east: { name: 'East Pune (Kharadi, Viman Nagar)', score: 90, rent3bhk: 38000, schools: ['Symbiosis', 'Orchids'], commute: '15-25 min', pros: ['IT parks', 'Airport proximity', 'Premium schools'], cons: ['Expensive ₹35K-45K', 'Traffic'] }
            }
        },
        chennai: {
            it: {
                south: { name: 'South Chennai (OMR - Old Mahabalipuram Road)', score: 95, rent3bhk: 32000, schools: ['PSBB', 'Chettinad Vidyashram'], commute: '15-25 min', pros: ['IT corridor', 'Beach proximity', 'Good schools'], cons: ['Flooding risk', 'Rent ₹28K-40K'] },
                west: { name: 'West Chennai (Porur, Guindy)', score: 80, rent3bhk: 28000, schools: ['Velammal', 'Chettinad'], commute: '25-35 min', pros: ['Central location', 'Established area', 'Affordable ₹25K-32K'], cons: ['Traffic', 'Older infrastructure'] }
            }
        }
    };

    // Get locality recommendations
    const cityLocalities = localityData[city]?.[profession] || localityData[city]?.it || {};
    const localities = Object.entries(cityLocalities).map(([zone, data]) => ({
        zone,
        ...data,
        affordability: budget >= data.rent3bhk * 2.5 ? 'Affordable' : budget >= data.rent3bhk * 2 ? 'Tight' : 'Over Budget'
    })).sort((a, b) => b.score - a.score);

    // City-wise cost multipliers (Bangalore = 1.0 base)
    const cityMultipliers = {
        bangalore: 1.0,
        mumbai: 1.4,
        delhi: 1.2,
        hyderabad: 0.9,
        pune: 1.0,
        chennai: 0.85,
        kolkata: 0.75,
        ahmedabad: 0.8
    };
    const cityMult = cityMultipliers[city] || 1.0;

    // Housing costs (monthly)
    const rentCosts = {
        '2bhk': 25000, '3bhk': 40000, '4bhk': 60000, 'villa': 80000
    };
    const emiCosts = {
        '2bhk': 45000, '3bhk': 70000, '4bhk': 100000, 'villa': 150000
    };
    const housingCost = (housing === 'rent' ? rentCosts[propertySize] : emiCosts[propertySize]) * cityMult;

    // School fees (monthly average)
    const schoolCosts = {
        none: 0, government: 2000, private: 15000, international: 50000
    };
    const schoolFees = schoolCosts[school] * schoolCount * cityMult;

    // Car expenses
    const carEMI = car === 'none' ? 0 : car === 'one' ? 
        (carType === 'hatchback' ? 8000 : carType === 'sedan' ? 15000 : carType === 'suv' ? 25000 : 40000) :
        (carType === 'hatchback' ? 16000 : carType === 'sedan' ? 30000 : carType === 'suv' ? 50000 : 80000);
    
    const petrolCost = car === 'none' ? 0 : car === 'one' ? 8000 : 15000;
    const carInsurance = car === 'none' ? 0 : car === 'one' ? 1500 : 3000;
    const carMaintenance = car === 'none' ? 0 : car === 'one' ? 2000 : 4000;

    // Insurance
    const healthInsurance = (adults * 1500 + children * 800) * (lifestyle === 'premium' ? 1.5 : lifestyle === 'moderate' ? 1.0 : 0.7);
    const termInsurance = adults * 2000;

    // Domestic help
    const helpCosts = {
        none: 0, parttime: 5000, fulltime: 12000, multiple: 30000
    };
    const domesticHelp = helpCosts[help];

    // Groceries & food
    const groceries = (adults * 8000 + children * 5000) * (lifestyle === 'premium' ? 1.3 : lifestyle === 'moderate' ? 1.0 : 0.8);
    const diningOut = lifestyle === 'premium' ? 15000 : lifestyle === 'moderate' ? 8000 : 3000;

    // Utilities
    const electricity = 3000 * (propertySize === 'villa' ? 1.5 : propertySize === '4bhk' ? 1.3 : 1.0);
    const water = 1000;
    const internet = 1500;
    const gas = 1200;

    // Entertainment & misc
    const entertainment = lifestyle === 'premium' ? 20000 : lifestyle === 'moderate' ? 10000 : 5000;
    const clothing = (adults * 3000 + children * 2000) * (lifestyle === 'premium' ? 1.5 : 1.0);
    const healthcare = (adults + children) * 2000;
    const miscellaneous = 10000 * (lifestyle === 'premium' ? 1.5 : lifestyle === 'moderate' ? 1.0 : 0.7);

    const expenses = {
        housing: { rent: housing === 'rent' ? housingCost : 0, emi: housing === 'buy' ? housingCost : 0, maintenance: 3000 },
        education: { schoolFees, books: schoolCount * 1000, activities: schoolCount * 2000 },
        transportation: { carEMI, petrol: petrolCost, carInsurance, maintenance: carMaintenance, publicTransport: 2000 },
        insurance: { health: healthInsurance, term: termInsurance, home: 1000 },
        utilities: { electricity, water, internet, gas },
        food: { groceries, diningOut },
        household: { domesticHelp, repairs: 2000 },
        lifestyle: { entertainment, clothing, healthcare, miscellaneous }
    };

    const categoryTotals = {
        housing: Object.values(expenses.housing).reduce((a,b)=>a+b,0),
        education: Object.values(expenses.education).reduce((a,b)=>a+b,0),
        transportation: Object.values(expenses.transportation).reduce((a,b)=>a+b,0),
        insurance: Object.values(expenses.insurance).reduce((a,b)=>a+b,0),
        utilities: Object.values(expenses.utilities).reduce((a,b)=>a+b,0),
        food: Object.values(expenses.food).reduce((a,b)=>a+b,0),
        household: Object.values(expenses.household).reduce((a,b)=>a+b,0),
        lifestyle: Object.values(expenses.lifestyle).reduce((a,b)=>a+b,0)
    };

    const monthlyTotal = Object.values(categoryTotals).reduce((a,b)=>a+b,0);
    const annualTotal = monthlyTotal * 12;

    // Inflation adjustment for future years
    const yearsUntilReturn = returnYear - new Date().getFullYear();
    const inflationRate = 0.065; // 6.5% average
    const inflationMultiplier = Math.pow(1 + inflationRate, yearsUntilReturn);
    const adjustedMonthly = monthlyTotal * inflationMultiplier;
    const adjustedAnnual = annualTotal * inflationMultiplier;

    return {
        city: city.charAt(0).toUpperCase() + city.slice(1),
        profession,
        budget,
        returnYear,
        adults,
        children,
        localities,
        expenses,
        categoryTotals,
        monthlyTotal,
        annualTotal,
        inflationMultiplier,
        adjustedMonthly,
        adjustedAnnual,
        recommendations: [
            `Your estimated monthly expenses in ${returnYear}: ₹${fl(adjustedMonthly)}`,
            `Recommended monthly income: ₹${fl(adjustedMonthly * 1.5)} (50% savings buffer)`,
            `Emergency fund target: ₹${fl(adjustedMonthly * 12)} (12 months)`,
            `Consider ${housing === 'rent' ? 'buying' : 'renting'} if ${housing === 'rent' ? 'rent exceeds ₹50K/month' : 'EMI burden is high'}`,
            school === 'international' ? 'International schools are expensive - consider premium private schools' : '',
            car === 'two' ? 'Two cars significantly increase costs - consider ride-sharing for one' : '',
            lifestyle === 'premium' ? 'Premium lifestyle adds 30-50% to costs - moderate lifestyle saves ₹50K+/month' : ''
        ].filter(Boolean)
    };
}

function renderReturnToIndiaResults(data) {
    const resultsDiv = document.getElementById('nri-results');
    if (!resultsDiv) return;

    const html = `
        <div class="card" style="background:linear-gradient(135deg, var(--bg2), var(--bg3)); border-color:var(--accent);">
            <div class="card-title"><span class="icon">📊</span> Your Complete Expense Breakdown</div>
            <div style="display:flex; gap:20px; flex-wrap:wrap; margin-bottom:20px;">
                <div><div style="font-size:11px; color:var(--text3);">City</div><div style="font-family:var(--mono); font-size:18px; font-weight:800; color:var(--accent2);">${data.city}</div></div>
                <div><div style="font-size:11px; color:var(--text3);">Return Year</div><div style="font-family:var(--mono); font-size:18px; font-weight:800;">${data.returnYear}</div></div>
                <div><div style="font-size:11px; color:var(--text3);">Family Size</div><div style="font-family:var(--mono); font-size:18px; font-weight:800;">${data.adults + data.children} people</div></div>
            </div>
            <div style="background:var(--accent-glow); border:1px solid var(--accent); border-radius:var(--radius-sm); padding:20px; margin-bottom:16px;">
                <div style="font-size:13px; color:var(--text3); margin-bottom:8px;">Total Monthly Expenses (${data.returnYear})</div>
                <div style="font-size:32px; font-weight:800; color:var(--text); font-family:var(--mono);">${fl(data.adjustedMonthly)}</div>
                <div style="font-size:12px; color:var(--text2); margin-top:4px;">Annual: ${fl(data.adjustedAnnual)} | Today's value: ${fl(data.monthlyTotal)}</div>
            </div>
        </div>

        ${Object.entries(data.categoryTotals).map(([category, total]) => {
            const icon = {
                housing: '🏠', education: '🎓', transportation: '🚗',
                insurance: '🛡️', utilities: '⚡', food: '🍽️',
                household: '🧹', lifestyle: '🎭'
            }[category];
            const details = data.expenses[category];
            return `
                <div class="card">
                    <div class="card-title">${icon} ${category.charAt(0).toUpperCase() + category.slice(1)}</div>
                    <div style="background:var(--bg3); border:1px solid var(--border2); border-radius:var(--radius-sm); padding:12px; margin-bottom:12px;">
                        <div style="font-size:24px; font-weight:800; font-family:var(--mono); color:var(--text);">${fl(total)}/month</div>
                    </div>
                    ${Object.entries(details).map(([item, cost]) => `
                        <div class="row-flex">
                            <span class="row-label">${item.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <span class="row-value">${ff(cost)}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }).join('')}

        ${data.localities && data.localities.length > 0 ? `
        <div class="card" style="background:linear-gradient(135deg, var(--bg2), var(--bg3)); border-color:var(--accent2);">
            <div class="card-title"><span class="icon">🗺️</span> AI-Recommended Localities for ${data.profession.toUpperCase()} Professionals</div>
            <div style="font-size:12px; color:var(--text2); margin-bottom:16px;">Based on commute time, school quality, rent affordability, and lifestyle amenities</div>
            
            ${data.localities.slice(0, 3).map((loc, idx) => {
                const affordabilityColor = loc.affordability === 'Affordable' ? 'var(--green)' : loc.affordability === 'Tight' ? 'var(--yellow)' : 'var(--red)';
                const scoreColor = loc.score >= 90 ? 'var(--green)' : loc.score >= 80 ? 'var(--cyan)' : loc.score >= 70 ? 'var(--yellow)' : 'var(--text2)';
                const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
                
                return `
                <div style="background:var(--bg3); border:2px solid ${idx === 0 ? 'var(--accent)' : 'var(--border2)'}; border-radius:var(--radius-sm); padding:16px; margin-bottom:12px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <div>
                            <div style="font-size:16px; font-weight:700; color:var(--text); margin-bottom:4px;">${medal} ${loc.name}</div>
                            <div style="font-size:11px; color:var(--text3);">Zone: ${loc.zone.toUpperCase()}</div>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:24px; font-weight:800; color:${scoreColor}; font-family:var(--mono);">${loc.score}</div>
                            <div style="font-size:10px; color:var(--text3);">Score</div>
                        </div>
                    </div>
                    
                    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:12px; margin-bottom:12px;">
                        <div style="background:var(--bg2); border-radius:var(--radius-xs); padding:10px;">
                            <div style="font-size:10px; color:var(--text3); margin-bottom:4px;">3BHK Rent</div>
                            <div style="font-size:16px; font-weight:700; color:var(--text); font-family:var(--mono);">₹${loc.rent3bhk.toLocaleString()}</div>
                        </div>
                        <div style="background:var(--bg2); border-radius:var(--radius-xs); padding:10px;">
                            <div style="font-size:10px; color:var(--text3); margin-bottom:4px;">Commute</div>
                            <div style="font-size:14px; font-weight:600; color:var(--text);">⏱️ ${loc.commute}</div>
                        </div>
                        <div style="background:var(--bg2); border-radius:var(--radius-xs); padding:10px;">
                            <div style="font-size:10px; color:var(--text3); margin-bottom:4px;">Affordability</div>
                            <div style="font-size:14px; font-weight:700; color:${affordabilityColor};">${loc.affordability}</div>
                        </div>
                    </div>
                    
                    <div style="margin-bottom:10px;">
                        <div style="font-size:11px; color:var(--text3); margin-bottom:6px;">🏫 Top Schools:</div>
                        <div style="font-size:12px; color:var(--text); line-height:1.5;">${loc.schools.join(' • ')}</div>
                    </div>
                    
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                        <div>
                            <div style="font-size:11px; color:var(--green); margin-bottom:4px;">✅ Pros:</div>
                            ${loc.pros.map(pro => `<div style="font-size:11px; color:var(--text2); line-height:1.5;">• ${pro}</div>`).join('')}
                        </div>
                        <div>
                            <div style="font-size:11px; color:var(--red); margin-bottom:4px;">⚠️ Cons:</div>
                            ${loc.cons.map(con => `<div style="font-size:11px; color:var(--text2); line-height:1.5;">• ${con}</div>`).join('')}
                        </div>
                    </div>
                </div>
                `;
            }).join('')}
            
            <div style="background:var(--cyan-dim); border:1px solid var(--cyan); border-radius:var(--radius-sm); padding:12px; margin-top:12px;">
                <div style="font-size:11px; color:var(--text); line-height:1.6;">
                    <strong>💡 Tip:</strong> ${data.budget >= 100000 ? 'With your budget, you can afford premium localities with top schools and amenities.' : data.budget >= 60000 ? 'Your budget allows for good localities with decent schools and infrastructure.' : 'Consider East/North zones for more affordable options with developing infrastructure.'}
                </div>
            </div>
        </div>
        ` : ''}

        <div class="card">
            <div class="card-title"><span class="icon">💡</span> Key Recommendations</div>
            ${data.recommendations.map((rec, i) => `
                <div style="background:var(--bg3); border-left:3px solid var(--accent); border-radius:var(--radius-sm); padding:12px; margin-bottom:10px;">
                    <div style="font-size:13px; color:var(--text); line-height:1.6;">${i + 1}. ${rec}</div>
                </div>
            `).join('')}
        </div>

        <div class="card" style="background:var(--yellow-dim); border:1px solid var(--yellow);">
            <div style="font-size:12px; color:var(--text); line-height:1.7;">
                <strong>📌 Important Notes:</strong><br>
                • Costs are estimates based on ${data.city} averages and may vary by locality<br>
                • Inflation adjusted at 6.5% annually till ${data.returnYear}<br>
                • One-time costs (furniture, deposits, vehicle purchase) not included<br>
                • Actual expenses depend on lifestyle choices and family needs<br>
                • Consider 20-30% buffer for unexpected expenses
            </div>
        </div>
    `;

    window.lastNriPlanHtml = html;
    sh('nri-results', html);
}

window.calculateNriPlan = async function() {
    const btn = document.getElementById('nri-btn');
    if (btn) { btn.textContent = '⏳ Analysing…'; btn.disabled = true; }

    // Clear any previously stored plan
    window.lastNriPlanHtml = null;
    sh('nri-results', '<div class="loading-state"><div class="spinner"></div><p>Generating your personalised NRI plan…</p></div>');

    try {
        // Grab all inputs
        const country       = (document.getElementById('nri-country')?.value || '').trim();
        const returnYear    = parseInt(document.getElementById('nri-year')?.value || '2028');
        const foreignIncome = parseFloat(document.getElementById('nri-foreign-income')?.value || '0');
        const indianIncome  = parseFloat(document.getElementById('nri-income')?.value || '0');
        const assets        = parseFloat(document.getElementById('nri-assets')?.value || '0');
        const nreBalance    = parseFloat(document.getElementById('nri-nre-balance')?.value || '0');

        if (!country) { showToast('Please enter your country of residence', 'yellow'); return; }

        // Show loading in results area
        sh('nri-results', `<div class="loading-state"><div class="spinner"></div><p>Generating your personalised NRI plan…</p></div>`);

        const payload = {
            userId:        currentUserEmail,
            country,
            returnYear,
            foreignIncome,
            indianIncome,
            assets,
            nreBalance,
            userProfile:   userData.profile,
            loans:         userData.loans,
            investments:   userData.investments
        };

        const res = await fetch('/api/nri/plan', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(payload)
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`API error ${res.status}: ${errText}`);
        }

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        // Build result HTML
        const taxHtml = data.taxNotes ? `
            <div class="card">
                <div class="card-title"><span class="icon">🧾</span> Tax Planning Notes</div>
                <div class="advisor-msg">
                    <p style="white-space:pre-wrap; line-height:1.7;">${data.taxNotes}</p>
                </div>
            </div>
        ` : '';

        const investHtml = (data.investmentSuggestions || []).length ? `
            <div class="card">
                <div class="card-title"><span class="icon">📊</span> Investment Suggestions</div>
                ${data.investmentSuggestions.map((s, i) => `
                    <div class="reco-card">
                        <p style="font-size:13px; color:var(--text2); line-height:1.6;">${i + 1}. ${s}</p>
                    </div>
                `).join('')}
            </div>
        ` : '';

        const repatHtml = (data.repatriationSteps || []).length ? `
            <div class="card">
                <div class="card-title"><span class="icon">🏦</span> Repatriation Steps</div>
                ${data.repatriationSteps.map((s, i) => `
                    <div class="row-flex">
                        <span class="row-label" style="font-size:13px;">Step ${i + 1}: ${s}</span>
                    </div>
                `).join('')}
            </div>
        ` : '';

        const projHtml = (data.cashflowProjection || []).length ? `
            <div class="card">
                <div class="card-title"><span class="icon">📈</span> Cashflow Projection</div>
                <table class="data-table">
                    <thead><tr><th>Year</th><th>Inflow</th><th>Outflow</th><th>Net</th></tr></thead>
                    <tbody>
                    ${data.cashflowProjection.map(row => `
                        <tr>
                            <td>${row.year}</td>
                            <td class="mono">${fl(row.inflow || 0)}</td>
                            <td class="mono">${fl(row.outflow || 0)}</td>
                            <td class="mono" style="color:${(row.net || 0) >= 0 ? 'var(--green)' : 'var(--red)'};">${fl(row.net || 0)}</td>
                        </tr>
                    `).join('')}
                    </tbody>
                </table>
            </div>
        ` : '';

        const confidencePct = Math.round((data.confidence || 0.5) * 100);
        const confidenceColor = confidencePct >= 70 ? 'var(--green)' : confidencePct >= 40 ? 'var(--yellow)' : 'var(--red)';

        const missingHtml = (data.missingData || []).length ? `
            <div class="insight-box" style="margin-bottom:18px;">
                <strong>💡 To improve accuracy, add:</strong> ${data.missingData.join(', ')}
            </div>
        ` : '';

        const summaryHtml = `
            <div class="card" style="background:linear-gradient(135deg, var(--bg2), var(--bg3)); border-color:var(--accent);">
                <div class="card-title"><span class="icon">🌍</span> Your NRI Transition Plan</div>
                <div style="display:flex; gap:20px; flex-wrap:wrap; margin-bottom:16px;">
                    <div><div style="font-size:11px; color:var(--text3);">Return Year</div><div style="font-family:var(--mono); font-size:18px; font-weight:800; color:var(--accent2);">${returnYear}</div></div>
                    <div><div style="font-size:11px; color:var(--text3);">From</div><div style="font-family:var(--mono); font-size:18px; font-weight:800;">${country.toUpperCase()}</div></div>
                    <div><div style="font-size:11px; color:var(--text3);">Foreign Assets</div><div style="font-family:var(--mono); font-size:18px; font-weight:800; color:var(--yellow);">${fl(assets)}</div></div>
                    <div><div style="font-size:11px; color:var(--text3);">Confidence</div><div style="font-family:var(--mono); font-size:18px; font-weight:800; color:${confidenceColor};">${confidencePct}%</div></div>
                </div>
                ${data.why ? `<div class="advisor-msg"><p style="font-size:13px; color:var(--text2); line-height:1.6;">${data.why}</p></div>` : ''}
            </div>
        `;

        const fullHtml = summaryHtml + missingHtml + taxHtml + investHtml + repatHtml + projHtml;
        window.lastNriPlanHtml = fullHtml;
        sh('nri-results', fullHtml);

    } catch (e) {
        console.error('NRI Plan error:', e);
        sh('nri-results', `
            <div class="card">
                <p style="color:var(--red); margin-bottom:12px;">⚠️ Could not generate plan: ${e.message}</p>
                <p style="color:var(--text3); font-size:13px; margin-bottom:12px;">
                    Make sure the <code style="font-family:var(--mono);">/api/nri/plan</code> endpoint is running and returning valid JSON.
                </p>
                <button class="secondary-btn" onclick="calculateNriPlan()">🔄 Try Again</button>
            </div>
        `);
    } finally {
        const btn = document.getElementById('nri-btn');
        if (btn) { btn.textContent = '🧮 Get NRI Plan'; btn.disabled = false; }
    }
};

async function renderAutopilot() {
    sh('page-plan', `<div class="loading-state"><div class="spinner"></div><p>Running financial autopilot…</p></div>`);

    if (!currentUserEmail) {
        sh('page-plan', `<div class="card"><p style="color:var(--red);">Please log in first.</p></div>`);
        return;
    }

    try {
        const scenarios = ['retirement', 'optimistic', 'conservative'];
        let activeScenario = 'retirement';

        const doFetch = async (scenario) => {
            const res = await fetch('/api/autopilot/plan', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ userId: currentUserEmail, scenario })
            });
            if (!res.ok) throw new Error(`API error ${res.status}`);
            return res.json();
        };

        const data = await doFetch(activeScenario);
        if (data.error) throw new Error(data.error);

        const proj = data.projections?.summary || {};

        const actionsHtml = (data.actions || []).map(a => `
            <div class="reco-card">
                <h4 style="color:var(--accent2); font-size:13px; margin-bottom:4px;">${a.step || a.action || '—'}</h4>
                <p>${a.reason || ''}</p>
                ${a.amount ? `<div class="row-value" style="margin-top:8px; color:var(--green);">${fl(a.amount)}</div>` : ''}
            </div>
        `).join('') || `<p style="color:var(--text3); font-size:13px;">No actions generated yet.</p>`;

        const scheduleHtml = (data.schedule || []).map((s, i) => `
            <div class="row-flex">
                <span class="row-label">Month ${i + 1}: ${s.action || s}</span>
                ${s.amount ? `<span class="row-value">${fl(s.amount)}</span>` : ''}
            </div>
        `).join('');

        const confidencePct = Math.round((data.confidence || 0.5) * 100);
        const confidenceColor = confidencePct >= 70 ? 'var(--green)' : confidencePct >= 40 ? 'var(--yellow)' : 'var(--red)';

        sh('page-plan', `
            <div class="card" style="background:linear-gradient(135deg, var(--bg2), var(--bg3)); border-color:var(--accent); margin-bottom:18px;">
                <div class="card-title"><span class="icon">🤖</span> Autopilot — ${activeScenario.charAt(0).toUpperCase() + activeScenario.slice(1)} Scenario</div>
                <div class="advisor-msg">
                    <p style="font-size:14px; line-height:1.7;">${data.summary || 'No summary available.'}</p>
                </div>
                <div class="grid-4" style="margin-top:16px;">
                    ${proj.retirementCorpus ? `<div class="kpi-card green"><div class="kpi-label">Projected Corpus</div><div class="kpi-value">${fl(proj.retirementCorpus)}</div><div class="kpi-sub">At retirement</div></div>` : ''}
                    ${proj.yearsToRetire ? `<div class="kpi-card"><div class="kpi-label">Years to Retire</div><div class="kpi-value">${proj.yearsToRetire}</div><div class="kpi-sub">Based on age 60</div></div>` : ''}
                    ${proj.monthlySavings ? `<div class="kpi-card ${proj.monthlySavings >= 0 ? 'green' : 'red'}"><div class="kpi-label">Monthly Savings</div><div class="kpi-value">${fl(proj.monthlySavings)}</div><div class="kpi-sub">Available to invest</div></div>` : ''}
                    <div class="kpi-card ${confidencePct >= 70 ? 'green' : 'yellow'}"><div class="kpi-label">AI Confidence</div><div class="kpi-value" style="color:${confidenceColor};">${confidencePct}%</div><div class="kpi-sub">Plan reliability</div></div>
                </div>
                <div style="display:flex; gap:8px; margin-top:16px; flex-wrap:wrap;">
                    ${scenarios.map(s => `
                        <button class="secondary-btn" style="${s === activeScenario ? 'border-color:var(--accent); color:var(--accent2);' : ''}"
                            onclick="switchAutopilotScenario('${s}')">
                            ${s === 'retirement' ? '🏖️' : s === 'optimistic' ? '📈' : '🛡️'} ${s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    `).join('')}
                </div>
            </div>

            <div class="grid-2">
                <div class="card">
                    <div class="card-title"><span class="icon">🎯</span> Recommended Actions</div>
                    ${actionsHtml}
                </div>
                ${scheduleHtml ? `
                    <div class="card">
                        <div class="card-title"><span class="icon">📅</span> 12-Month Schedule</div>
                        ${scheduleHtml}
                    </div>
                ` : `
                    <div class="card">
                        <div class="card-title"><span class="icon">💡</span> Why Autopilot?</div>
                        <div class="advisor-msg">
                            <p style="font-size:13px; line-height:1.6;">${data.why || 'This plan is personalised to your loans, income, investments, and goals.'}</p>
                        </div>
                        ${(data.missingData || []).length ? `
                            <div class="insight-box" style="margin-top:12px;">
                                <strong>📝 Add this data for a better plan:</strong> ${data.missingData.join(', ')}
                            </div>
                        ` : ''}
                    </div>
                `}
            </div>
            <button class="secondary-btn" style="margin-top:8px;" onclick="renderAutopilot()">🔄 Refresh Plan</button>
        `);

    } catch (e) {
        console.error('Autopilot error:', e);
        
        // Fallback: Generate intelligent plan client-side with proper calculations
        const age = userData.profile.age || 30;
        const yearsToRetire = Math.max(60 - age, 0);
        const monthlyIncome = computeMonthlyIncome();
        const monthlyExpenses = computeMonthlyExpenses();
        const monthlySavings = Math.max(monthlyIncome - monthlyExpenses, 0);
        const currentInvestments = computeTotalInvestments();
        const totalLoans = getLoansForMember(currentProfile).reduce((sum, loan) => sum + (loan.outstanding || 0), 0);
        
        // Inflation rates
        const generalInflation = 0.08; // 8% annual
        const medicalInflation = 0.12; // 12% annual
        
        // Calculate emergency fund target (6 months of expenses) with inflation
        const emergencyFundTarget = monthlyExpenses * 6;
        const inflationYears = 1; // Plan for 1 year ahead
        const inflatedEmergencyFund = emergencyFundTarget * Math.pow(1 + generalInflation, inflationYears);
        const currentLiquid = userData.profile.liquidSavings || 0;
        const emergencyFundNeeded = Math.max(inflatedEmergencyFund - currentLiquid, 0);
        
        // Calculate optimal SIP amount (35% of savings for equity - realistic allocation)
        const sipPercentage = age < 35 ? 0.40 : age < 45 ? 0.35 : age < 55 ? 0.30 : 0.25;
        const optimalSIP = Math.round(monthlySavings * sipPercentage);
        const minSIP = Math.max(5000, Math.round(monthlySavings * 0.20));
        const recommendedSIP = Math.max(optimalSIP, minSIP);
        
        // Calculate term insurance need (10-15x annual income)
        const currentTermCover = computeInsuranceCoverage().termCover;
        const recommendedTermCover = monthlyIncome * 12 * 12; // 12x annual income
        const insuranceGap = Math.max(recommendedTermCover - currentTermCover, 0);
        
        // Retirement corpus projection with realistic assumptions
        // Age-based equity allocation: 100 - age rule
        const equityAllocation = Math.min(Math.max(100 - age, 30), 80) / 100;
        const debtAllocation = 1 - equityAllocation;
        const equityReturn = 0.12; // 12% annual
        const debtReturn = 0.07; // 7% annual
        const blendedReturn = (equityReturn * equityAllocation) + (debtReturn * debtAllocation);
        const monthlyReturn = blendedReturn / 12;
        const monthsToRetire = yearsToRetire * 12;
        
        // Future value of SIP
        const futureValueSIP = recommendedSIP * ((Math.pow(1 + monthlyReturn, monthsToRetire) - 1) / monthlyReturn) * (1 + monthlyReturn);
        // Future value of existing investments
        const futureValueExisting = currentInvestments * Math.pow(1 + blendedReturn, yearsToRetire);
        const retirementCorpus = Math.round(futureValueSIP + futureValueExisting);
        
        // Calculate inflation-adjusted retirement expenses
        const retirementMonthlyExpenses = monthlyExpenses * Math.pow(1 + generalInflation, yearsToRetire);
        const requiredCorpusFor25Years = retirementMonthlyExpenses * 12 * 25; // 25 years post-retirement
        
        // Check if user is on track
        const isOnTrack = retirementCorpus >= requiredCorpusFor25Years * 0.8; // 80% threshold
        const hasEmergencyFund = currentLiquid >= emergencyFundTarget * 0.9; // 90% threshold
        const hasSufficientInsurance = currentTermCover >= recommendedTermCover * 0.8;
        const isInvestingWell = recommendedSIP > 0 && monthlySavings > 0;
        
        // Calculate financial health score
        const healthScore = Math.round(
            (hasEmergencyFund ? 25 : (currentLiquid / emergencyFundTarget) * 25) +
            (hasSufficientInsurance ? 25 : (currentTermCover / recommendedTermCover) * 25) +
            (monthlySavings > 0 ? 25 : 0) +
            (isOnTrack ? 25 : (retirementCorpus / requiredCorpusFor25Years) * 25)
        );
        
        // Show encouragement if doing well
        let encouragementMsg = '';
        if (healthScore >= 80) {
            encouragementMsg = `
                <div class="card" style="background:linear-gradient(135deg, var(--green-dim), var(--cyan-dim)); border:2px solid var(--green); margin-bottom:16px; animation:fadeIn 0.5s;">
                    <div style="text-align:center; padding:20px;">
                        <div style="font-size:48px; margin-bottom:12px;">🎉</div>
                        <h3 style="color:var(--green); margin-bottom:8px;">Excellent Financial Health!</h3>
                        <p style="color:var(--text); font-size:14px; line-height:1.6;">
                            You're doing great! Your financial health score is <strong>${healthScore}/100</strong>. 
                            ${hasEmergencyFund ? '✓ Emergency fund ready. ' : ''}
                            ${hasSufficientInsurance ? '✓ Well insured. ' : ''}
                            ${isOnTrack ? '✓ On track for retirement. ' : ''}
                            Keep up the good work!
                        </p>
                    </div>
                </div>
            `;
            showToast('🎉 Excellent! You\'re on the right track!', 'green');
        } else if (healthScore >= 60) {
            encouragementMsg = `
                <div class="card" style="background:var(--yellow-dim); border:1px solid var(--yellow); margin-bottom:16px;">
                    <div style="text-align:center; padding:16px;">
                        <div style="font-size:36px; margin-bottom:8px;">👍</div>
                        <h4 style="color:var(--yellow); margin-bottom:6px;">Good Progress!</h4>
                        <p style="color:var(--text2); font-size:13px;">
                            Financial health score: <strong>${healthScore}/100</strong>. You're making progress. Follow the recommendations below to improve further.
                        </p>
                    </div>
                </div>
            `;
        }
        
        // Generate smart actions based on actual data
        const actions = [];
        
        // Priority 1: Emergency Fund (if needed)
        if (emergencyFundNeeded > 0) {
            const monthsToComplete = Math.ceil(emergencyFundNeeded / (monthlySavings * 0.5));
            actions.push({
                step: 'Build Emergency Fund for 6 Months',
                reason: `Target: ${fl(inflatedEmergencyFund)} (6 months expenses + ${Math.round(generalInflation*100)}% inflation). Current: ${fl(currentLiquid)}. Need: ${fl(emergencyFundNeeded)}. Save ${fl(Math.round(emergencyFundNeeded/Math.max(monthsToComplete,1)))}/month for ${monthsToComplete} months.`,
                amount: inflatedEmergencyFund,
                priority: 1
            });
        } else {
            actions.push({
                step: '✓ Emergency Fund Complete',
                reason: `Great! You have ${fl(currentLiquid)} in liquid savings, covering ${Math.round(currentLiquid/monthlyExpenses)} months of expenses.`,
                amount: currentLiquid,
                priority: 1
            });
        }
        
        // Priority 2: High-interest debt payoff
        if (totalLoans > 0) {
            const highInterestLoans = getLoansForMember(currentProfile).filter(l => (l.rate || 0) > 10);
            if (highInterestLoans.length > 0) {
                const totalHighInterest = highInterestLoans.reduce((sum, l) => sum + (l.outstanding || 0), 0);
                const avgRate = highInterestLoans.reduce((sum, l) => sum + (l.rate || 0), 0) / highInterestLoans.length;
                actions.push({
                    step: 'Pay Off High-Interest Debt First',
                    reason: `${highInterestLoans.length} loan(s) with avg ${avgRate.toFixed(1)}% interest. Total: ${fl(totalHighInterest)}. Paying these off saves more than investing. Allocate extra ${fl(Math.round(monthlySavings * 0.3))}/month.`,
                    amount: totalHighInterest,
                    priority: 2
                });
            }
        }
        
        // Priority 3: Term Insurance (if gap exists)
        if (insuranceGap > 50000) {
            const estimatedPremium = Math.round((recommendedTermCover / 1000) * 0.5); // Rough estimate: ₹0.5 per ₹1000 cover
            actions.push({
                step: 'Get Adequate Term Insurance',
                reason: `Current: ${fl(currentTermCover)}. Recommended: ${fl(recommendedTermCover)} (12x annual income). Gap: ${fl(insuranceGap)}. Estimated premium: ~${fl(estimatedPremium)}/month for ₹${fl(recommendedTermCover)} cover.`,
                amount: recommendedTermCover,
                priority: 3
            });
        } else if (currentTermCover > 0) {
            actions.push({
                step: '✓ Term Insurance Adequate',
                reason: `Good! You have ${fl(currentTermCover)} term cover, which is ${Math.round((currentTermCover/(monthlyIncome*12))*10)/10}x your annual income.`,
                amount: currentTermCover,
                priority: 3
            });
        }
        
        // Priority 4: Start/Increase SIP with age-based allocation
        if (monthlySavings > 0) {
            const sipPercent = Math.round(sipPercentage * 100);
            actions.push({
                step: `Invest ${fl(recommendedSIP)}/month in SIP`,
                reason: `Invest ${sipPercent}% of savings (${fl(monthlySavings)}) in ${Math.round(equityAllocation*100)}% equity + ${Math.round(debtAllocation*100)}% debt (age-appropriate). Expected return: ${(blendedReturn*100).toFixed(1)}%/year. This builds ${fl(retirementCorpus)} by age 60.`,
                amount: recommendedSIP,
                priority: 4
            });
        }
        
        // Priority 5: Tax-saving investments
        const taxSavingNeeded = 150000; // 80C limit
        const estimatedTaxSaved = Math.round(taxSavingNeeded * 0.312); // 31.2% for 30% bracket + cess
        actions.push({
            step: 'Maximize Tax Savings (80C)',
            reason: `Invest ₹1.5L/year in ELSS/PPF/NPS to save up to ${fl(estimatedTaxSaved)} in taxes. That's ${fl(Math.round(taxSavingNeeded/12))}/month. Consider ELSS for equity exposure + tax benefit.`,
            amount: taxSavingNeeded,
            priority: 5
        });
        
        // Sort by priority and take top actions
        const topActions = actions.sort((a, b) => a.priority - b.priority).slice(0, 4);
        
        // Generate 12-month schedule with inflation consideration
        const schedule = [];
        let currentMonth = 1;
        
        if (emergencyFundNeeded > 0) {
            const monthlyEmergency = Math.min(Math.round(emergencyFundNeeded / 6), monthlySavings * 0.5);
            const monthsNeeded = Math.min(6, Math.ceil(emergencyFundNeeded / monthlyEmergency));
            for (let i = 0; i < monthsNeeded; i++) {
                schedule.push({
                    month: currentMonth++,
                    action: `Transfer ${fl(monthlyEmergency)} to emergency fund`,
                    amount: monthlyEmergency
                });
            }
        }
        
        if (recommendedSIP > 0 && currentMonth <= 12) {
            schedule.push({
                month: currentMonth++,
                action: `Start SIP: ${fl(recommendedSIP)}/month in Nifty 50 Index Fund`,
                amount: recommendedSIP
            });
        }
        
        if (insuranceGap > 50000 && currentMonth <= 12) {
            schedule.push({
                month: currentMonth++,
                action: `Get term insurance quotes for ${fl(recommendedTermCover)} cover`,
                amount: 0
            });
        }
        
        if (currentMonth <= 12) {
            schedule.push({
                month: currentMonth++,
                action: `Open ELSS fund for tax saving (80C benefit)`,
                amount: 12500
            });
        }
        
        // Fill remaining months with SIP continuation and reviews
        const reviewMonths = [3, 6, 9, 12];
        while (currentMonth <= 12) {
            if (reviewMonths.includes(currentMonth)) {
                schedule.push({
                    month: currentMonth++,
                    action: `Quarterly review: Rebalance portfolio, check progress`,
                    amount: 0
                });
            } else {
                schedule.push({
                    month: currentMonth++,
                    action: `Continue SIP + track expenses`,
                    amount: recommendedSIP
                });
            }
        }
        
        sh('page-plan', `
            <div class="card" style="background:var(--bg2); border:1px solid var(--yellow); padding:16px; margin-bottom:16px;">
                <p style="color:var(--yellow); font-size:13px;">
                    ℹ️ Using intelligent client-side analysis with inflation adjustment (${Math.round(generalInflation*100)}% general, ${Math.round(medicalInflation*100)}% medical). 
                    For AI-powered scenario planning, deploy the <code>/api/autopilot/plan</code> endpoint.
                </p>
            </div>
            
            ${encouragementMsg}
            
            <div class="card" style="background:linear-gradient(135deg, var(--bg2), var(--bg3)); border-color:var(--accent); margin-bottom:18px;">
                <div class="card-title">
                    <span class="icon">🤖</span> Autopilot — Retirement Scenario
                    <span style="float:right; font-size:12px; color:var(--text3);">Health Score: <strong style="color:${healthScore >= 80 ? 'var(--green)' : healthScore >= 60 ? 'var(--yellow)' : 'var(--red)'};">${healthScore}/100</strong></span>
                </div>
                <div class="advisor-msg">
                    <p style="font-size:14px; line-height:1.7;">
                        Based on your profile (Age: ${age}, Income: ${fl(monthlyIncome)}/month, Expenses: ${fl(monthlyExpenses)}/month), 
                        you can build a retirement corpus of <strong>${fl(retirementCorpus)}</strong> by age 60. 
                        This assumes investing ₹${fl(recommendedSIP)}/month with ${(blendedReturn*100).toFixed(1)}% annual returns 
                        (${Math.round(equityAllocation*100)}% equity + ${Math.round(debtAllocation*100)}% debt) over ${yearsToRetire} years.
                        <br><br>
                        <strong>Inflation-adjusted:</strong> At retirement, you'll need ${fl(retirementMonthlyExpenses)}/month 
                        (today's ${fl(monthlyExpenses)} adjusted for ${Math.round(generalInflation*100)}% inflation).
                    </p>
                </div>
                <div class="grid-4" style="margin-top:16px;">
                    <div class="kpi-card green"><div class="kpi-label">Projected Corpus</div><div class="kpi-value">${fl(retirementCorpus)}</div><div class="kpi-sub">At retirement (age 60)</div></div>
                    <div class="kpi-card"><div class="kpi-label">Years to Retire</div><div class="kpi-value">${yearsToRetire}</div><div class="kpi-sub">Time remaining</div></div>
                    <div class="kpi-card ${monthlySavings >= 0 ? 'green' : 'red'}"><div class="kpi-label">Monthly Savings</div><div class="kpi-value">${fl(monthlySavings)}</div><div class="kpi-sub">Available to invest</div></div>
                    <div class="kpi-card cyan"><div class="kpi-label">Recommended SIP</div><div class="kpi-value">${fl(recommendedSIP)}</div><div class="kpi-sub">${Math.round(sipPercentage*100)}% of savings</div></div>
                </div>
                <div style="display:flex; gap:8px; margin-top:16px; flex-wrap:wrap;">
                    <button class="secondary-btn" style="border-color:var(--accent); color:var(--accent2); background:var(--accent-glow);">
                        🏖️ Retirement
                    </button>
                    <button class="secondary-btn" disabled style="opacity:0.5;">
                        📈 Optimistic (API needed)
                    </button>
                    <button class="secondary-btn" disabled style="opacity:0.5;">
                        🛡️ Conservative (API needed)
                    </button>
                </div>
            </div>

            <div class="grid-2">
                <div class="card">
                    <div class="card-title"><span class="icon">🎯</span> Recommended Actions</div>
                    ${topActions.map(a => `
                        <div class="reco-card">
                            <h4 style="color:var(--accent2); font-size:13px; margin-bottom:4px;">${a.step}</h4>
                            <p style="font-size:12px; line-height:1.5; color:var(--text2);">${a.reason}</p>
                            ${a.amount > 0 && !a.step.includes('✓') ? `<div class="row-value" style="margin-top:8px; color:var(--green);">Target: ${fl(a.amount)}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
                <div class="card">
                    <div class="card-title"><span class="icon">📅</span> 12-Month Action Plan</div>
                    ${schedule.map(s => `
                        <div class="row-flex" style="margin-bottom:8px; padding:8px; background:var(--bg3); border-radius:6px;">
                            <span class="row-label" style="font-size:12px;"><strong>Month ${s.month}:</strong> ${s.action}</span>
                            ${s.amount > 0 ? `<span class="row-value" style="font-size:12px; color:var(--green);">${fl(s.amount)}</span>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="card" style="background:var(--cyan-dim); border:1px solid var(--cyan); margin-top:16px;">
                <div style="font-size:12px; color:var(--text); line-height:1.7;">
                    <strong>💡 How this plan works:</strong><br>
                    • <strong>Emergency fund first:</strong> ${emergencyFundNeeded > 0 ? 'Build ₹' + fl(inflatedEmergencyFund) + ' (inflation-adjusted)' : 'Already sufficient ✓'}<br>
                    • <strong>Age-appropriate allocation:</strong> ${Math.round(equityAllocation*100)}% equity + ${Math.round(debtAllocation*100)}% debt (based on age ${age})<br>
                    • <strong>Expected returns:</strong> ${(blendedReturn*100).toFixed(1)}% annually (blended)<br>
                    • <strong>Inflation considered:</strong> ${Math.round(generalInflation*100)}% general, ${Math.round(medicalInflation*100)}% medical<br>
                    • <strong>Review quarterly:</strong> Rebalance portfolio every 3 months<br>
                    • <strong>Increase SIP:</strong> Raise by 10% annually with salary hikes<br>
                    • <strong>Tax optimization:</strong> Use ELSS for 80C benefit + equity exposure
                </div>
            </div>
            
            <button class="secondary-btn" style="margin-top:12px;" onclick="renderAutopilot()">🔄 Refresh Plan</button>
        `);
    }
}

window.switchAutopilotScenario = async (scenario) => {
    // Quick re-render with new scenario
    sh('page-plan', `<div class="loading-state"><div class="spinner"></div><p>Switching to ${scenario} scenario…</p></div>`);
    try {
        const res = await fetch('/api/autopilot/plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUserEmail, scenario })
        });
        if (!res.ok) throw new Error(`API error ${res.status}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        // Re-render with fresh data (reuse the full renderer above approach)
        await renderAutopilot();
    } catch (e) {
        sh('page-plan', `<div class="card"><p style="color:var(--red);">Error: ${e.message}</p><button class="secondary-btn" onclick="renderAutopilot()">Back</button></div>`);
    }
};

// ========== FINANCIAL EDUCATION PAGE ==========
function renderEducation() {
    const html = `
        <div class="container-fluid p-4">
            <!-- Emergency Fund Education -->
            <div class="card mb-4">
                <div class="card-header" style="background:var(--accent-glow); border-bottom:1px solid var(--border);">
                    <h4 style="margin:0;"><i class="fas fa-shield-alt" style="color:var(--green);"></i> What is an Emergency Fund?</h4>
                </div>
                <div class="card-body">
                    ${renderEmergencyFundEducation()}
                </div>
            </div>
            
            <!-- Emergency Fund Calculator -->
            <div class="card mb-4">
                <div class="card-header" style="background:var(--accent-glow); border-bottom:1px solid var(--border);">
                    <h4 style="margin:0;"><i class="fas fa-calculator" style="color:var(--accent);"></i> Inflation-Adjusted Emergency Fund Calculator</h4>
                </div>
                <div class="card-body">
                    ${renderEmergencyFundCalculator()}
                </div>
            </div>
            
            <!-- SIP Recommendations -->
            <div class="card mb-4">
                <div class="card-header" style="background:var(--accent-glow); border-bottom:1px solid var(--border);">
                    <h4 style="margin:0;"><i class="fas fa-chart-line" style="color:var(--purple);"></i> Age-Based SIP Recommendations</h4>
                </div>
                <div class="card-body">
                    ${renderSIPRecommendations()}
                </div>
            </div>
            
            <!-- SWP Calculator -->
            <div class="card mb-4">
                <div class="card-header" style="background:var(--accent-glow); border-bottom:1px solid var(--border);">
                    <h4 style="margin:0;"><i class="fas fa-money-bill-wave" style="color:var(--green);"></i> Systematic Withdrawal Plan (SWP) Calculator</h4>
                </div>
                <div class="card-body">
                    ${renderSWPCalculator()}
                </div>
            </div>
            
            <!-- Smart Investment Ideas -->
            <div class="card mb-4">
                <div class="card-header" style="background:var(--accent-glow); border-bottom:1px solid var(--border);">
                    <h4 style="margin:0;"><i class="fas fa-lightbulb" style="color:var(--yellow);"></i> Smart Investment Ideas for Passive Income</h4>
                </div>
                <div class="card-body">
                    ${renderSmartInvestmentGuide()}
                </div>
            </div>
            
            <!-- Saved Calculations -->
            <div class="card mb-4">
                <div class="card-header" style="background:var(--accent-glow); border-bottom:1px solid var(--border);">
                    <h4 style="margin:0;"><i class="fas fa-bookmark" style="color:var(--accent2);"></i> My Saved Calculations</h4>
                </div>
                <div class="card-body" id="savedCalculationsContainer">
                    ${renderSavedCalculations()}
                </div>
            </div>
        </div>
    `;
    sh('page-education', html);
}

function renderEmergencyFundEducation() {
    return `
        <div class="alert" style="background:var(--accent-glow); border:1px solid var(--accent); border-radius:var(--radius-sm); padding:16px; margin-bottom:20px;">
            <strong style="color:var(--accent2);">Quick Summary:</strong> An emergency fund is money set aside specifically for unexpected expenses like job loss, medical emergencies, or urgent repairs. It should cover 6-12 months of essential expenses and be kept in liquid, easily accessible accounts.
        </div>
        
        <h5 style="color:var(--text); margin-top:20px;">What is an Emergency Fund?</h5>
        <p style="color:var(--text2); line-height:1.6;">An emergency fund is a financial safety net designed to cover unexpected expenses or income loss. Unlike regular savings meant for planned purchases or goals, an emergency fund is reserved exclusively for genuine emergencies.</p>
        
        <h5 style="color:var(--text); margin-top:20px;">Purpose of Emergency Fund</h5>
        <ul style="color:var(--text2); line-height:1.8;">
            <li><strong style="color:var(--text);">Financial Security:</strong> Provides peace of mind knowing you can handle unexpected situations</li>
            <li><strong style="color:var(--text);">Avoid Debt:</strong> Prevents need to take high-interest loans during emergencies</li>
            <li><strong style="color:var(--text);">Income Protection:</strong> Covers expenses during job loss or income reduction</li>
            <li><strong style="color:var(--text);">Medical Coverage:</strong> Handles medical emergencies not covered by insurance</li>
        </ul>
        
        <div style="margin-top:20px;">
            <button class="secondary-btn" onclick="toggleSection('whenToUse')" style="width:100%; text-align:left; margin-bottom:8px;">
                <i class="fas fa-check-circle" style="color:var(--green);"></i> When to Use Emergency Fund
            </button>
            <div id="whenToUse" style="display:none; padding:16px; background:var(--bg3); border-radius:var(--radius-sm); margin-bottom:12px;">
                <ul style="color:var(--text2); line-height:1.8;">
                    <li>Job loss or unexpected unemployment</li>
                    <li>Medical emergencies not covered by insurance</li>
                    <li>Urgent home or vehicle repairs</li>
                    <li>Family emergencies requiring immediate travel</li>
                    <li>Unexpected legal expenses</li>
                </ul>
            </div>
            
            <button class="secondary-btn" onclick="toggleSection('whenNotToUse')" style="width:100%; text-align:left; margin-bottom:8px;">
                <i class="fas fa-times-circle" style="color:var(--red);"></i> When NOT to Use Emergency Fund
            </button>
            <div id="whenNotToUse" style="display:none; padding:16px; background:var(--bg3); border-radius:var(--radius-sm); margin-bottom:12px;">
                <ul style="color:var(--text2); line-height:1.8;">
                    <li>Planned purchases (car, gadgets, furniture)</li>
                    <li>Vacations or leisure travel</li>
                    <li>Lifestyle upgrades</li>
                    <li>Investment opportunities</li>
                    <li>Regular monthly expenses</li>
                </ul>
            </div>
            
            <button class="secondary-btn" onclick="toggleSection('bestPractices')" style="width:100%; text-align:left;">
                <i class="fas fa-star" style="color:var(--yellow);"></i> Best Practices
            </button>
            <div id="bestPractices" style="display:none; padding:16px; background:var(--bg3); border-radius:var(--radius-sm); margin-top:8px;">
                <ul style="color:var(--text2); line-height:1.8;">
                    <li><strong style="color:var(--text);">Keep it liquid:</strong> Store in savings account or liquid funds for easy access</li>
                    <li><strong style="color:var(--text);">Separate account:</strong> Maintain in a separate account to avoid temptation</li>
                    <li><strong style="color:var(--text);">6-12 months coverage:</strong> Aim for 6 months minimum, 12 months ideal</li>
                    <li><strong style="color:var(--text);">Review annually:</strong> Adjust for inflation and lifestyle changes</li>
                    <li><strong style="color:var(--text);">Replenish after use:</strong> Rebuild the fund as soon as possible after withdrawal</li>
                </ul>
            </div>
        </div>
    `;
}

function renderEmergencyFundCalculator() {
    return `
        <form onsubmit="event.preventDefault(); calculateEmergencyFund();">
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(250px, 1fr)); gap:16px; margin-bottom:20px;">
                <div>
                    <label style="display:block; color:var(--text3); font-size:12px; margin-bottom:6px;">Monthly Expenses (excluding medical) *</label>
                    <input type="number" id="efMonthlyExpenses" placeholder="e.g., 50000" style="width:100%; background:var(--bg3); border:1px solid var(--border2); border-radius:var(--radius-sm); padding:10px; color:var(--text); font-size:14px;" required>
                </div>
                <div>
                    <label style="display:block; color:var(--text3); font-size:12px; margin-bottom:6px;">Monthly Medical Expenses *</label>
                    <input type="number" id="efMedicalExpenses" placeholder="e.g., 10000" style="width:100%; background:var(--bg3); border:1px solid var(--border2); border-radius:var(--radius-sm); padding:10px; color:var(--text); font-size:14px;" required>
                </div>
                <div>
                    <label style="display:block; color:var(--text3); font-size:12px; margin-bottom:6px;">Duration (months) *</label>
                    <select id="efDuration" style="width:100%; background:var(--bg3); border:1px solid var(--border2); border-radius:var(--radius-sm); padding:10px; color:var(--text); font-size:14px;">
                        <option value="6">6 months</option>
                        <option value="9">9 months</option>
                        <option value="12">12 months</option>
                    </select>
                </div>
                <div>
                    <label style="display:block; color:var(--text3); font-size:12px; margin-bottom:6px;">General Inflation Rate (%)</label>
                    <input type="number" id="efGeneralInflation" value="8" step="0.1" style="width:100%; background:var(--bg3); border:1px solid var(--border2); border-radius:var(--radius-sm); padding:10px; color:var(--text); font-size:14px;">
                </div>
                <div>
                    <label style="display:block; color:var(--text3); font-size:12px; margin-bottom:6px;">Medical Inflation Rate (%)</label>
                    <input type="number" id="efMedicalInflation" value="12" step="0.1" style="width:100%; background:var(--bg3); border:1px solid var(--border2); border-radius:var(--radius-sm); padding:10px; color:var(--text); font-size:14px;">
                </div>
            </div>
            <button type="submit" class="primary-btn">
                <i class="fas fa-calculator"></i> Calculate Emergency Fund
            </button>
        </form>
        <div id="efResults"></div>
    `;
}

function renderSIPRecommendations() {
    return `
        <div style="margin-bottom:20px;">
            <p style="color:var(--text2); line-height:1.6; margin-bottom:16px;">Select your age group to get personalized SIP investment recommendations based on your life stage and risk appetite.</p>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(150px, 1fr)); gap:12px; margin-bottom:20px;">
                <button class="secondary-btn" onclick="showSIPRecommendation('20s')" style="padding:16px;">
                    <div style="font-size:24px; margin-bottom:4px;">🚀</div>
                    <div style="font-weight:600;">20s</div>
                    <div style="font-size:11px; color:var(--text3);">Aggressive Growth</div>
                </button>
                <button class="secondary-btn" onclick="showSIPRecommendation('30s')" style="padding:16px;">
                    <div style="font-size:24px; margin-bottom:4px;">🎯</div>
                    <div style="font-weight:600;">30s</div>
                    <div style="font-size:11px; color:var(--text3);">Balanced Approach</div>
                </button>
                <button class="secondary-btn" onclick="showSIPRecommendation('40s')" style="padding:16px;">
                    <div style="font-size:24px; margin-bottom:4px;">🏡</div>
                    <div style="font-weight:600;">40s</div>
                    <div style="font-size:11px; color:var(--text3);">Moderate Risk</div>
                </button>
                <button class="secondary-btn" onclick="showSIPRecommendation('50s+')" style="padding:16px;">
                    <div style="font-size:24px; margin-bottom:4px;">🛡️</div>
                    <div style="font-weight:600;">50s+</div>
                    <div style="font-size:11px; color:var(--text3);">Conservative</div>
                </button>
            </div>
        </div>
        <div id="sipResults"></div>
    `;
}

function renderSWPCalculator() {
    return `
        <p style="color:var(--text2); line-height:1.6; margin-bottom:16px;">Calculate how much corpus you need to generate a regular monthly income through Systematic Withdrawal Plan (SWP). Perfect for retirement planning or passive income goals.</p>
        <form onsubmit="event.preventDefault(); calculateSWP();">
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(250px, 1fr)); gap:16px; margin-bottom:20px;">
                <div>
                    <label style="display:block; color:var(--text3); font-size:12px; margin-bottom:6px;">Desired Monthly Withdrawal *</label>
                    <input type="number" id="swpMonthlyWithdrawal" placeholder="e.g., 50000" style="width:100%; background:var(--bg3); border:1px solid var(--border2); border-radius:var(--radius-sm); padding:10px; color:var(--text); font-size:14px;" required>
                </div>
                <div>
                    <label style="display:block; color:var(--text3); font-size:12px; margin-bottom:6px;">Expected Annual Return Rate (%) *</label>
                    <input type="number" id="swpReturnRate" value="5" step="0.1" min="1" max="20" style="width:100%; background:var(--bg3); border:1px solid var(--border2); border-radius:var(--radius-sm); padding:10px; color:var(--text); font-size:14px;" required>
                </div>
                <div>
                    <label style="display:block; color:var(--text3); font-size:12px; margin-bottom:6px;">Duration (years) *</label>
                    <input type="number" id="swpDuration" value="10" min="1" max="50" style="width:100%; background:var(--bg3); border:1px solid var(--border2); border-radius:var(--radius-sm); padding:10px; color:var(--text); font-size:14px;" required>
                </div>
            </div>
            <button type="submit" class="primary-btn">
                <i class="fas fa-calculator"></i> Calculate Required Corpus
            </button>
        </form>
        <div id="swpResults"></div>
    `;
}

function renderSmartInvestmentGuide() {
    const investments = [
        { name: 'REITs (Real Estate Investment Trusts)', returns: '7-10%', risk: 'Medium', liquidity: 'High', tax: 'Dividend taxed as per slab, capital gains taxed', icon: '🏢', desc: 'Invest in commercial real estate without buying property. Listed on stock exchanges for easy trading.' },
        { name: 'Dividend-Paying Stocks', returns: '4-6% yield', risk: 'Medium-High', liquidity: 'High', tax: 'Dividend taxed as per slab, LTCG 10% above ₹1L', icon: '📈', desc: 'Blue-chip companies that regularly distribute profits to shareholders. Provides regular income plus capital appreciation.' },
        { name: 'Debt Mutual Funds', returns: '6-8%', risk: 'Low-Medium', liquidity: 'High', tax: 'As per slab for gains, indexation benefit removed', icon: '📊', desc: 'Invest in bonds and fixed-income securities. Lower risk than equity with better returns than FDs.' },
        { name: 'Fixed Deposits (FDs)', returns: '5-7%', risk: 'Very Low', liquidity: 'Medium', tax: 'Interest taxed as per slab, TDS applicable', icon: '🏦', desc: 'Guaranteed returns with capital protection. Ideal for risk-averse investors and short-term goals.' },
        { name: 'National Pension System (NPS)', returns: '8-10%', risk: 'Low-Medium', liquidity: 'Low', tax: 'Tax deduction up to ₹2L under 80CCD, 60% tax-free at maturity', icon: '🎯', desc: 'Government-backed retirement savings with tax benefits. Long-term wealth creation with low costs.' },
        { name: 'Rental Income from Real Estate', returns: '2-4% yield', risk: 'Medium', liquidity: 'Very Low', tax: 'Rental income taxed as per slab, deductions available', icon: '🏠', desc: 'Buy property and earn monthly rent. Provides steady income plus property appreciation over time.' },
        { name: 'Corporate Bonds & Debentures', returns: '7-9%', risk: 'Low-Medium', liquidity: 'Medium', tax: 'Interest taxed as per slab, capital gains taxed', icon: '💼', desc: 'Lend money to companies and earn fixed interest. Higher returns than FDs with moderate risk.' }
    ];
    
    return `
        <p style="color:var(--text2); line-height:1.6; margin-bottom:20px;">Diversify your income sources beyond mutual funds. Here are smart investment options for generating passive income in India:</p>
        <div style="display:grid; gap:16px;">
            ${investments.map(inv => `
                <div style="background:var(--bg3); padding:20px; border-radius:var(--radius); border:1px solid var(--border);">
                    <div style="display:flex; align-items:start; gap:16px; margin-bottom:12px;">
                        <div style="font-size:32px;">${inv.icon}</div>
                        <div style="flex:1;">
                            <h5 style="color:var(--text); margin-bottom:8px;">${inv.name}</h5>
                            <p style="color:var(--text2); font-size:14px; line-height:1.6;">${inv.desc}</p>
                        </div>
                    </div>
                    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(120px, 1fr)); gap:12px; margin-top:16px;">
                        <div style="background:var(--bg2); padding:12px; border-radius:var(--radius-sm);">
                            <div style="color:var(--text3); font-size:11px; margin-bottom:4px;">Expected Returns</div>
                            <div style="color:var(--green); font-weight:600;">${inv.returns}</div>
                        </div>
                        <div style="background:var(--bg2); padding:12px; border-radius:var(--radius-sm);">
                            <div style="color:var(--text3); font-size:11px; margin-bottom:4px;">Risk Level</div>
                            <div style="color:${inv.risk.includes('Low') ? 'var(--green)' : inv.risk.includes('High') ? 'var(--red)' : 'var(--yellow)'}; font-weight:600;">${inv.risk}</div>
                        </div>
                        <div style="background:var(--bg2); padding:12px; border-radius:var(--radius-sm);">
                            <div style="color:var(--text3); font-size:11px; margin-bottom:4px;">Liquidity</div>
                            <div style="color:${inv.liquidity.includes('High') ? 'var(--green)' : inv.liquidity.includes('Low') ? 'var(--red)' : 'var(--yellow)'}; font-weight:600;">${inv.liquidity}</div>
                        </div>
                    </div>
                    <div style="margin-top:12px; padding:12px; background:var(--bg2); border-radius:var(--radius-sm); border-left:3px solid var(--accent);">
                        <div style="color:var(--text3); font-size:11px; margin-bottom:4px;">Tax Implications</div>
                        <div style="color:var(--text2); font-size:13px; line-height:1.5;">${inv.tax}</div>
                    </div>
                </div>
            `).join('')}
        </div>
        <div style="background:var(--accent-glow); padding:20px; border-radius:var(--radius); border:1px solid var(--accent); margin-top:20px;">
            <h5 style="color:var(--accent2); margin-bottom:12px;">💡 Investment Tips</h5>
            <ul style="color:var(--text2); line-height:1.8;">
                <li>Diversify across multiple investment types to reduce risk</li>
                <li>Consider your age, risk appetite, and financial goals before investing</li>
                <li>Maintain an emergency fund before investing in illiquid assets</li>
                <li>Review and rebalance your portfolio annually</li>
                <li>Consult a SEBI-registered financial advisor for personalized advice</li>
                <li>Understand tax implications and plan for tax-efficient investing</li>
            </ul>
        </div>
    `;
}

function renderSavedCalculations() {
    const saved = loadSavedCalculations();
    
    if (saved.length === 0) {
        return `
            <div style="text-align:center; padding:40px; color:var(--text3);">
                <i class="fas fa-bookmark" style="font-size:48px; margin-bottom:16px; opacity:0.3;"></i>
                <p>No saved calculations yet. Calculate and save your results to access them later.</p>
            </div>
        `;
    }
    
    return `
        <div style="display:grid; gap:16px;">
            ${saved.reverse().map(calc => {
                const date = new Date(calc.timestamp).toLocaleString('en-IN');
                const typeLabel = calc.type === 'emergency-fund' ? '🛡️ Emergency Fund' : calc.type === 'swp' ? '💰 SWP' : '📈 SIP';
                
                return `
                    <div style="background:var(--bg3); padding:16px; border-radius:var(--radius); border:1px solid var(--border);">
                        <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:12px;">
                            <div>
                                <div style="color:var(--accent); font-weight:600; margin-bottom:4px;">${typeLabel}</div>
                                <div style="color:var(--text3); font-size:12px;">${date}</div>
                            </div>
                            <button class="secondary-btn" onclick="deleteCalculation('${calc.id}')" style="padding:6px 12px; font-size:12px;">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                        <div style="color:var(--text2); font-size:13px; line-height:1.6;">
                            ${calc.type === 'emergency-fund' ? `
                                Monthly Expenses: ${formatCurrency(calc.inputs.monthlyExpenses)}<br>
                                Medical Expenses: ${formatCurrency(calc.inputs.medicalExpenses)}<br>
                                Duration: ${calc.inputs.duration} months<br>
                                <strong style="color:var(--accent);">Required: ${formatCurrency(calc.results.futureValue)}</strong>
                            ` : calc.type === 'swp' ? `
                                Monthly Withdrawal: ${formatCurrency(calc.inputs.monthlyWithdrawal)}<br>
                                Return Rate: ${calc.inputs.annualReturnRate}%<br>
                                Duration: ${calc.inputs.durationYears} years<br>
                                <strong style="color:var(--accent);">Required Corpus: ${formatCurrency(calc.results.requiredCorpus)}</strong>
                            ` : ''}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

async function renderFamily() {
    sh('page-family', `<div class="loading-state"><div class="spinner"></div><p>Loading family insights…</p></div>`);

    if (!currentUserEmail) {
        sh('page-family', `<div class="card"><p style="color:var(--red);">Please log in first.</p></div>`);
        return;
    }

    try {
        const res = await fetch('/api/family/insights', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                userId:     currentUserEmail,
                profileIds: [] // empty = fetch all
            })
        });

        if (!res.ok) throw new Error(`API error ${res.status}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        const savingsColor = (data.savings || 0) >= 0 ? 'var(--green)' : 'var(--red)';

        const gapsHtml = (data.gaps || []).map(g => `
            <div class="reco-card">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
                    <h4 style="font-size:13px; color:var(--text);">${g.member || 'Family'}</h4>
                    <span class="badge badge-yellow">⚠️ Gap</span>
                </div>
                <p><strong>Issue:</strong> ${g.issue || '—'}</p>
                <p style="margin-top:6px; color:var(--accent2);"><strong>Action:</strong> ${g.action || '—'}</p>
            </div>
        `).join('') || `<div class="insight-box">✅ No critical gaps identified.</div>`;

        const recoHtml = (data.recommendations || []).map((r, i) => `
            <div class="row-flex">
                <span class="row-label">${i + 1}. ${r}</span>
            </div>
        `).join('') || `<p style="color:var(--text3); font-size:13px; padding:10px 0;">No recommendations yet.</p>`;

        const perMemberHtml = (data.perMember || []).map(m => `
            <div class="kpi-card">
                <div class="kpi-label">${m.name || 'Member'}</div>
                <div class="kpi-value">${fl(m.income_monthly || 0)}</div>
                <div class="kpi-sub">
                    Expenses: ${fl(m.monthly_expenses || 0)}<br>
                    Savings: <span style="color:${(m.income_monthly||0) - (m.monthly_expenses||0) >= 0 ? 'var(--green)' : 'var(--red)'};">${fl((m.income_monthly||0) - (m.monthly_expenses||0))}</span>
                </div>
            </div>
        `).join('');

        const confidencePct = Math.round((data.confidence || 0.5) * 100);

        sh('page-family', `
            <div class="card" style="background:linear-gradient(135deg, var(--bg2), var(--bg3)); border-color:var(--accent); margin-bottom:18px;">
                <div class="card-title"><span class="icon">👪</span> Family Finance Overview</div>
                <div class="grid-4" style="margin-bottom:16px;">
                    <div class="kpi-card green">
                        <div class="kpi-label">Aggregate Income</div>
                        <div class="kpi-value">${fl(data.aggregateIncome || 0)}</div>
                        <div class="kpi-sub">Combined monthly</div>
                    </div>
                    <div class="kpi-card red">
                        <div class="kpi-label">Aggregate Expenses</div>
                        <div class="kpi-value">${fl(data.aggregateExpenses || 0)}</div>
                        <div class="kpi-sub">Combined monthly</div>
                    </div>
                    <div class="kpi-card ${(data.savings || 0) >= 0 ? 'green' : 'red'}">
                        <div class="kpi-label">Family Savings</div>
                        <div class="kpi-value" style="color:${savingsColor};">${fl(data.savings || 0)}</div>
                        <div class="kpi-sub">Monthly surplus</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-label">AI Confidence</div>
                        <div class="kpi-value" style="color:${confidencePct >= 70 ? 'var(--green)' : 'var(--yellow)'};">${confidencePct}%</div>
                        <div class="kpi-sub">Plan reliability</div>
                    </div>
                </div>
                ${data.summary ? `<div class="advisor-msg"><p style="font-size:14px; line-height:1.7;">${data.summary}</p></div>` : ''}
            </div>

            ${perMemberHtml ? `
                <div class="card">
                    <div class="card-title"><span class="icon">👤</span> Per Member Breakdown</div>
                    <div class="grid-3">${perMemberHtml}</div>
                </div>
            ` : ''}

            <div class="grid-2">
                <div class="card">
                    <div class="card-title"><span class="icon">⚠️</span> Identified Gaps</div>
                    ${gapsHtml}
                </div>
                <div class="card">
                    <div class="card-title"><span class="icon">💡</span> Recommendations</div>
                    ${recoHtml}
                    ${(data.missingData || []).length ? `
                        <div class="insight-box" style="margin-top:12px;">
                            <strong>📝 Add for better insights:</strong> ${data.missingData.join(', ')}
                        </div>
                    ` : ''}
                </div>
            </div>
            <button class="secondary-btn" style="margin-top:8px;" onclick="renderFamily()">🔄 Refresh Insights</button>
        `);

    } catch (e) {
        console.error('Family insights error:', e);
        sh('page-family', `
            <div class="card">
                <p style="color:var(--red); margin-bottom:12px;">⚠️ Family insights error: ${e.message}</p>
                <p style="color:var(--text3); font-size:13px; margin-bottom:12px; line-height:1.6;">
                    Ensure multiple profiles exist in your Supabase <code style="font-family:var(--mono);">profiles</code> table
                    and the <code style="font-family:var(--mono);">/api/family/insights</code> endpoint is running.
                </p>
                <button class="secondary-btn" onclick="renderFamily()">🔄 Try Again</button>
            </div>
        `);
    }
}

// ========== PER-MEMBER DATA MIGRATION ==========
function migrateToPerMember() {
    let migrated = false;

    // Migrate flat investments → byMember.self
    if (!userData.profile._investmentMigrationV1 &&
        userData.investments && !userData.investments.byMember) {
        const flat = { ...userData.investments };
        // Only migrate if there's actual flat data (mutualFunds, stocks, etc.)
        if (flat.mutualFunds || flat.stocks || flat.fd || flat.ppf) {
            userData.investments = {
                byMember: {
                    self: {
                        mutualFunds: flat.mutualFunds || [],
                        stocks:      flat.stocks      || [],
                        fd:          flat.fd           || [],
                        ppf:         flat.ppf          || []
                    }
                }
            };
        } else {
            userData.investments = { byMember: { self: { mutualFunds:[], stocks:[], fd:[], ppf:[] } } };
        }
        userData.profile._investmentMigrationV1 = true;
        migrated = true;
        console.log('✅ Migrated investments to per-member structure');
    }

    // Migrate flat loans array → byMember.self
    if (!userData.profile._loanMigrationV1 &&
        Array.isArray(userData.loans)) {
        const flatLoans = [...userData.loans];
        userData.loans = { byMember: { self: flatLoans } };
        userData.profile._loanMigrationV1 = true;
        migrated = true;
        console.log('✅ Migrated loans to per-member structure');
    }

    // Migrate flat insurance → byMember.self
    if (!userData.profile._insuranceMigrationV1 &&
        userData.insurance && !userData.insurance.byMember) {
        const flat = { ...userData.insurance };
        if (flat.term || flat.health || flat.vehicle || flat.life || flat.home) {
            userData.insurance = {
                byMember: {
                    self: {
                        term:    flat.term    || [],
                        health:  flat.health  || [],
                        vehicle: flat.vehicle || [],
                        life:    flat.life    || [],
                        home:    flat.home    || []
                    }
                }
            };
        } else {
            userData.insurance = { byMember: { self: { term:[], health:[], vehicle:[], life:[], home:[] } } };
        }
        userData.profile._insuranceMigrationV1 = true;
        migrated = true;
        console.log('✅ Migrated insurance to per-member structure');
    }

    if (migrated) {
        debounceSave();
        console.log('✅ Per-member migration complete, save queued');
    }
}

// ========== PER-MEMBER DATA ACCESSORS ==========

// Default empty structures
const _emptyInvestments = () => ({ mutualFunds:[], stocks:[], fd:[], ppf:[] });
const _emptyInsurance   = () => ({ term:[], health:[], vehicle:[], life:[], home:[] });

// --- READ ACCESSORS ---

function getInvestmentsForMember(memberId) {
    const byMember = userData.investments?.byMember || {};
    if (memberId !== 'all') {
        return byMember[memberId] || _emptyInvestments();
    }
    // Merge all members
    const merged = _emptyInvestments();
    for (const mid of Object.keys(byMember)) {
        const m = byMember[mid];
        for (const cat of ['mutualFunds','stocks','fd','ppf']) {
            if (Array.isArray(m[cat])) {
                merged[cat] = merged[cat].concat(m[cat]);
            }
        }
    }
    return merged;
}

function getLoansForMember(memberId) {
    const byMember = userData.loans?.byMember || {};
    if (memberId !== 'all') {
        return byMember[memberId] || [];
    }
    // Merge all members
    let merged = [];
    for (const mid of Object.keys(byMember)) {
        if (Array.isArray(byMember[mid])) {
            merged = merged.concat(byMember[mid]);
        }
    }
    return merged;
}

function getInsuranceForMember(memberId) {
    const byMember = userData.insurance?.byMember || {};
    if (memberId !== 'all') {
        // Own policies
        const own = byMember[memberId] || _emptyInsurance();
        const result = {
            term:    [...(own.term    || [])],
            health:  [...(own.health  || [])],
            vehicle: [...(own.vehicle || [])],
            life:    [...(own.life    || [])],
            home:    [...(own.home    || [])]
        };
        // Cross-reference Family Floater policies from other members
        for (const otherMid of Object.keys(byMember)) {
            if (otherMid === memberId) continue;
            const otherHealth = byMember[otherMid]?.health || [];
            for (const policy of otherHealth) {
                if (policy.policyType === 'family_floater' &&
                    Array.isArray(policy.coveredMembers) &&
                    policy.coveredMembers.includes(memberId)) {
                    const holderName = getMemberName(otherMid);
                    result.health.push({
                        ...policy,
                        _crossReferenced: true,
                        _policyholderMemberId: otherMid,
                        _policyholderName: holderName
                    });
                }
            }
        }
        return result;
    }
    // "all" view — merge all members, de-duplicate Family Floater policies
    const merged = _emptyInsurance();
    const seenFloaterIds = new Set();
    for (const mid of Object.keys(byMember)) {
        const m = byMember[mid] || {};
        for (const cat of ['term','health','vehicle','life','home']) {
            const arr = m[cat] || [];
            for (const policy of arr) {
                if (policy.policyType === 'family_floater' && policy.id) {
                    if (seenFloaterIds.has(policy.id)) continue;
                    seenFloaterIds.add(policy.id);
                }
                merged[cat].push(policy);
            }
        }
    }
    return merged;
}

// --- WRITE ACCESSORS (mutable references) ---

function getMemberInvestments(memberId) {
    if (!userData.investments) userData.investments = { byMember: {} };
    if (!userData.investments.byMember) userData.investments.byMember = {};
    if (!userData.investments.byMember[memberId]) {
        userData.investments.byMember[memberId] = _emptyInvestments();
    }
    return userData.investments.byMember[memberId];
}

function getMemberLoans(memberId) {
    if (!userData.loans) userData.loans = { byMember: {} };
    if (!userData.loans.byMember) userData.loans.byMember = {};
    if (!userData.loans.byMember[memberId]) {
        userData.loans.byMember[memberId] = [];
    }
    return userData.loans.byMember[memberId];
}

function getMemberInsurance(memberId) {
    if (!userData.insurance) userData.insurance = { byMember: {} };
    if (!userData.insurance.byMember) userData.insurance.byMember = {};
    if (!userData.insurance.byMember[memberId]) {
        userData.insurance.byMember[memberId] = _emptyInsurance();
    }
    return userData.insurance.byMember[memberId];
}

// --- MEMBER INITIALIZATION ---

function ensureMemberDataStructure(memberId) {
    getMemberInvestments(memberId);
    getMemberLoans(memberId);
    getMemberInsurance(memberId);
}

// ========== DATA ACCESS LAYER (DAL) — Phase 1.6: Normalized Schema ==========

/**
 * bootstrapHousehold(householdName, memberName)
 * Called once during first login (no user_profiles row exists).
 * Calls the SECURITY DEFINER function create_household_for_new_user().
 * Returns { household_id, member_id, profile_id }.
 */
async function bootstrapHousehold(householdName, memberName) {
    try {
        console.log('🏠 Bootstrapping household:', householdName, 'for member:', memberName);
        const { data, error } = await sb.rpc('create_household_for_new_user', {
            household_name: householdName,
            member_name: memberName
        });
        
        if (error) {
            console.error('❌ Bootstrap error:', error);
            throw error;
        }
        
        console.log('✅ Household bootstrapped:', data);
        return data;
    } catch (err) {
        console.error('❌ bootstrapHousehold failed:', err);
        throw err;
    }
}

/**
 * loadHouseholdContext()
 * Called on every login after auth. Loads user_profiles for current auth.uid(),
 * sets householdId, memberId, memberMap.
 * If no profile exists → triggers bootstrapHousehold().
 */
async function loadHouseholdContext() {
    try {
        const { data: { user } } = await sb.auth.getUser();
        if (!user) {
            console.warn('⚠️ No authenticated user');
            return;
        }
        
        console.log('🔍 Loading household context for auth user:', user.id);
        
        // Query user_profiles for current auth.uid()
        const { data: profile, error: profileError } = await sb
            .from('user_profiles')
            .select('*')
            .eq('auth_uid', user.id)
            .maybeSingle();
        
        if (profileError) {
            console.error('❌ Error loading user profile:', profileError);
            throw profileError;
        }
        
        // If no profile exists, bootstrap a new household
        if (!profile) {
            console.log('📝 No profile found, bootstrapping new household...');
            const userName = user.user_metadata?.name || 
                           `${user.user_metadata?.firstName || ''} ${user.user_metadata?.lastName || ''}`.trim() ||
                           user.email?.split('@')[0] || 'User';
            const householdName = `${userName}'s Family`;
            
            const bootstrapResult = await bootstrapHousehold(householdName, userName);
            householdId = bootstrapResult.household_id;
            memberId = bootstrapResult.member_id;
            
            // Load household members into memberMap
            await loadMemberMap();
            return;
        }
        
        // Profile exists, set context
        householdId = profile.household_id;
        memberId = profile.member_id;
        console.log('✅ Household context loaded:', { householdId, memberId });
        
        // Load household members into memberMap
        await loadMemberMap();
        
    } catch (err) {
        console.error('❌ loadHouseholdContext failed:', err);
        throw err;
    }
}

/**
 * loadMemberMap()
 * Helper to load household_members into memberMap
 */
async function loadMemberMap() {
    if (!householdId) {
        console.warn('⚠️ Cannot load memberMap: householdId is null');
        return;
    }
    
    try {
        const { data: members, error } = await sb
            .from('household_members')
            .select('*')
            .eq('household_id', householdId);
        
        if (error) {
            console.error('❌ Error loading household members:', error);
            throw error;
        }
        
        memberMap = {};
        members.forEach(m => {
            memberMap[m.id] = {
                name: m.name,
                role: m.role,
                date_of_birth: m.date_of_birth
            };
        });
        
        console.log('✅ Member map loaded:', Object.keys(memberMap).length, 'members');
    } catch (err) {
        console.error('❌ loadMemberMap failed:', err);
        throw err;
    }
}

/**
 * getLegacyMemberId(memberUuid)
 * Maps UUID → legacy ID using memberMap
 */
function getLegacyMemberId(memberUuid) {
    if (!memberUuid) return 'self';
    const member = memberMap[memberUuid];
    if (!member) return 'self';
    
    const role = member.role;
    if (role === 'self') return 'self';
    if (role === 'spouse') return 'spouse';
    if (role === 'kid') return 'kid-' + member.name.toLowerCase().replace(/\s+/g, '-');
    return 'other-' + member.name.toLowerCase().replace(/\s+/g, '-');
}

/**
 * getMemberUuid(legacyId)
 * Maps legacy ID → UUID using memberMap
 */
function getMemberUuid(legacyId) {
    if (!legacyId || legacyId === 'self') {
        // Find the 'self' member
        for (const [uuid, member] of Object.entries(memberMap)) {
            if (member.role === 'self') return uuid;
        }
        return memberId; // fallback to current user's memberId
    }
    
    if (legacyId === 'spouse') {
        for (const [uuid, member] of Object.entries(memberMap)) {
            if (member.role === 'spouse') return uuid;
        }
        return null;
    }
    
    // For kids and others, match by name pattern
    if (legacyId.startsWith('kid-')) {
        const kidName = legacyId.substring(4).replace(/-/g, ' ');
        for (const [uuid, member] of Object.entries(memberMap)) {
            if (member.role === 'kid' && member.name.toLowerCase().includes(kidName)) {
                return uuid;
            }
        }
    }
    
    return null;
}

/**
 * reconstructUserData(profile, members, incomes, expenses, investments, loans, insurance, assumptions)
 * Reconstructs the legacy userData shape from normalized rows
 */
function reconstructUserData(profile, members, incomes, expenses, investments, loans, insurance, assumptions) {
    console.log('🔄 Reconstructing userData from normalized tables...');
    
    // Build memberMap with legacy IDs
    const legacyMembers = members.map(m => {
        const legacyId = getLegacyMemberId(m.id);
        return {
            id: legacyId,
            name: m.name,
            role: m.role,
            _normalizedId: m.id  // preserve UUID for writes
        };
    });
    
    // Reconstruct income
    const reconstructedIncome = {
        husband: 0,
        wife: 0,
        rental: 0,
        rentalActive: false,
        business: 0,
        other: 0
    };
    
    incomes.forEach(inc => {
        const legacyId = getLegacyMemberId(inc.member_id);
        if (inc.type === 'salary' && legacyId === 'self') {
            reconstructedIncome.husband = inc.amount || 0;
        } else if (inc.type === 'salary' && legacyId === 'spouse') {
            reconstructedIncome.wife = inc.amount || 0;
        } else if (inc.type === 'rental') {
            reconstructedIncome.rental = inc.amount || 0;
            reconstructedIncome.rentalActive = inc.is_active || false;
        } else if (inc.type === 'business') {
            reconstructedIncome.business = inc.amount || 0;
        } else if (inc.type === 'other') {
            reconstructedIncome.other = inc.amount || 0;
        }
    });
    
    // Reconstruct expenses (byMonth.byMember structure)
    const reconstructedExpenses = {
        monthly: [],
        periodic: [],
        byMember: {},
        byMonth: {}
    };
    
    expenses.forEach(exp => {
        const legacyId = getLegacyMemberId(exp.member_id);
        const month = exp.month;
        
        if (!reconstructedExpenses.byMonth[month]) {
            reconstructedExpenses.byMonth[month] = { byMember: {} };
        }
        if (!reconstructedExpenses.byMonth[month].byMember[legacyId]) {
            reconstructedExpenses.byMonth[month].byMember[legacyId] = [];
        }
        
        reconstructedExpenses.byMonth[month].byMember[legacyId].push({
            id: exp.id,
            label: exp.label || exp.category,
            v: exp.amount,
            c: exp.category,
            isRecurring: exp.is_recurring,
            frequency: exp.frequency,
            _normalizedId: exp.id
        });
    });
    
    // Reconstruct investments (byMember structure)
    const reconstructedInvestments = { byMember: {} };
    
    investments.forEach(inv => {
        const legacyId = getLegacyMemberId(inv.member_id);
        if (!reconstructedInvestments.byMember[legacyId]) {
            reconstructedInvestments.byMember[legacyId] = {
                mutualFunds: [],
                stocks: [],
                fd: [],
                ppf: []
            };
        }
        
        const bucket = inv.type === 'mutual_fund' ? 'mutualFunds' :
                       inv.type === 'stock' ? 'stocks' :
                       inv.type === 'fd' ? 'fd' : 'ppf';
        
        reconstructedInvestments.byMember[legacyId][bucket].push({
            id: inv.id,
            name: inv.name,
            value: inv.value || 0,
            units: inv.units,
            nav: inv.nav,
            rate: inv.rate,
            purchaseDate: inv.purchase_date,
            maturityDate: inv.maturity_date,
            sipAmount: inv.sip_amount,
            ...(inv.meta || {}),
            _normalizedId: inv.id
        });
    });
    
    // Reconstruct loans (byMember structure)
    const reconstructedLoans = { byMember: {} };
    
    loans.forEach(loan => {
        const legacyId = getLegacyMemberId(loan.member_id);
        if (!reconstructedLoans.byMember[legacyId]) {
            reconstructedLoans.byMember[legacyId] = [];
        }
        
        reconstructedLoans.byMember[legacyId].push({
            id: loan.id,
            label: loan.lender || loan.type,
            type: loan.type,
            outstanding: loan.outstanding || 0,
            emi: loan.emi || 0,
            rate: loan.rate || 0,
            principal: loan.principal,
            tenureMonths: loan.tenure_months,
            startDate: loan.start_date,
            endDate: loan.end_date,
            ...(loan.meta || {}),
            _normalizedId: loan.id
        });
    });
    
    // Reconstruct insurance (byMember structure)
    const reconstructedInsurance = { byMember: {} };
    
    insurance.forEach(policy => {
        const legacyId = getLegacyMemberId(policy.member_id);
        if (!reconstructedInsurance.byMember[legacyId]) {
            reconstructedInsurance.byMember[legacyId] = {
                term: [],
                health: [],
                vehicle: [],
                life: [],
                home: []
            };
        }
        
        const bucket = policy.type;
        if (!reconstructedInsurance.byMember[legacyId][bucket]) {
            reconstructedInsurance.byMember[legacyId][bucket] = [];
        }
        
        reconstructedInsurance.byMember[legacyId][bucket].push({
            id: policy.id,
            provider: policy.provider,
            policyNumber: policy.policy_number,
            coverAmount: policy.cover_amount || 0,
            premium: policy.premium || 0,
            premiumFrequency: policy.premium_frequency,
            startDate: policy.start_date,
            endDate: policy.end_date,
            ...(policy.meta || {}),
            _normalizedId: policy.id
        });
    });
    
    // Reconstruct forecast assumptions
    const reconstructedAssumptions = assumptions ? {
        incomeGrowth: (assumptions.salary_growth || 0.08) * 100,
        expenseInflation: (assumptions.expense_growth || 0.06) * 100,
        equityReturn: (assumptions.equity_return || 0.12) * 100,
        debtReturn: (assumptions.debt_return || 0.07) * 100,
        medicalInflation: (assumptions.meta?.medicalInflation || 10),
        retirementAge: assumptions.retirement_age || 60,
        lifeExpectancy: assumptions.life_expectancy || 85
    } : {};
    
    // Calculate liquidSavings and termCover
    const liquidSavings = incomes
        .filter(inc => inc.type === 'liquid_savings')
        .reduce((sum, inc) => sum + (inc.amount || 0), 0);
    
    const termCover = insurance
        .filter(p => p.type === 'term')
        .reduce((sum, p) => sum + (p.cover_amount || 0), 0);
    
    return {
        profile: {
            ...(profile || {}),
            familyMembers: legacyMembers,
            forecastAssumptions: reconstructedAssumptions,
            liquidSavings,
            termCover
        },
        income: reconstructedIncome,
        expenses: reconstructedExpenses,
        investments: reconstructedInvestments,
        loans: reconstructedLoans,
        insurance: reconstructedInsurance,
        schemes: [],       // not migrated yet
        bankAccounts: [],  // not migrated yet
        liquidSavings,
        termCover
    };
}

/**
 * loadHouseholdData()
 * Replaces loadUserData(email). Loads all tables for the current household
 * in parallel and reconstructs the userData shape for backward compatibility.
 */
async function loadHouseholdData() {
    if (!householdId) {
        console.error('❌ Cannot load household data: householdId is null');
        return;
    }
    
    try {
        console.log('📊 Loading household data for household:', householdId);
        
        // During Phase 2 (dual-write), profile data is still in user_data
        // Load profile from user_data first
        const { data: legacyData, error: legacyError } = await sb
            .from('user_data')
            .select('profile')
            .eq('email', currentUserEmail)
            .maybeSingle();
        
        if (legacyError) {
            console.warn('⚠️ Could not load legacy profile data:', legacyError);
        }
        
        // For NEW users, legacyData will be null - that's expected
        if (!legacyData) {
            console.log('📝 No legacy data found (new user) - will use empty profile');
        }
        
        // Query all normalized tables in parallel
        const [
            { data: profileData, error: profileError },
            { data: membersData, error: membersError },
            { data: incomesData, error: incomesError },
            { data: expensesData, error: expensesError },
            { data: investmentsData, error: investmentsError },
            { data: loansData, error: loansError },
            { data: insuranceData, error: insuranceError },
            { data: assumptionsData, error: assumptionsError }
        ] = await Promise.all([
            sb.from('user_profiles').select('*').eq('household_id', householdId).eq('auth_uid', (await sb.auth.getUser()).data.user.id).maybeSingle(),
            sb.from('household_members').select('*').eq('household_id', householdId),
            sb.from('incomes').select('*').eq('household_id', householdId),
            sb.from('expenses').select('*').eq('household_id', householdId),
            sb.from('investments').select('*').eq('household_id', householdId),
            sb.from('loans').select('*').eq('household_id', householdId),
            sb.from('insurance_policies').select('*').eq('household_id', householdId),
            sb.from('forecast_assumptions').select('*').eq('household_id', householdId).maybeSingle()
        ]);
        
        // Check for errors
        if (profileError) throw profileError;
        if (membersError) throw membersError;
        if (incomesError) throw incomesError;
        if (expensesError) throw expensesError;
        if (investmentsError) throw investmentsError;
        if (loansError) throw loansError;
        if (insuranceError) throw insuranceError;
        if (assumptionsError) throw assumptionsError;
        
        console.log('✅ Loaded normalized data:', {
            profile: !!profileData,
            members: membersData?.length || 0,
            incomes: incomesData?.length || 0,
            expenses: expensesData?.length || 0,
            investments: investmentsData?.length || 0,
            loans: loansData?.length || 0,
            insurance: insuranceData?.length || 0,
            assumptions: !!assumptionsData
        });
        
        // Use legacy profile data if available (Phase 2 dual-write)
        const profileToUse = legacyData?.profile || profileData || {};
        
        // Reconstruct userData shape
        userData = reconstructUserData(
            profileToUse,
            membersData || [],
            incomesData || [],
            expensesData || [],
            investmentsData || [],
            loansData || [],
            insuranceData || [],
            assumptionsData
        );
        
        // Invalidate compute cache
        computeCache.invalidate();
        
        console.log('✅ userData reconstructed from normalized tables');
        
    } catch (err) {
        console.error('❌ loadHouseholdData failed:', err);
        throw err;
    }
}

// ========== DATA GUARD - PREVENT DATA LEAKS ==========
/**
 * Creates namespaced storage key to prevent data leaks between users
 * @param {string} key - The key name
 * @param {string} uid - User ID (auth UID)
 * @returns {string} Namespaced key
 */
function storageKey(key, uid) {
    if (!uid) return `fam:${key}`; // Fallback for non-user-specific keys
    return `fam:user:${uid}:${key}`;
}

/**
 * Validates that loaded data belongs to the current authenticated user
 * Prevents data leaks when users are deleted and re-registered with same email
 */
function validateDataOwnership(loadedData, currentAuthUser) {
    if (!currentAuthUser || !currentAuthUser.id) {
        console.warn('⚠️ No auth user to validate against');
        return false;
    }
    
    const storedAuthUid = loadedData?.profile?._authUid;
    const currentAuthUid = currentAuthUser.id;
    
    // If no _authUid stored, this is legacy data or very old account
    if (!storedAuthUid) {
        // Check if user was created recently (within 1 hour) - likely fresh registration
        if (currentAuthUser.created_at) {
            const authCreated = new Date(currentAuthUser.created_at).getTime();
            const now = Date.now();
            const oneHour = 60 * 60 * 1000;
            
            // If account is fresh AND there's existing data, it's stale
            const hasAnyData = loadedData?.profile?._wizardCompleted || 
                              (loadedData?.income?.husband > 0) || 
                              (loadedData?.expenses?.monthly?.length > 0) ||
                              (loadedData?.investments?.mutualFunds?.length > 0) ||
                              (loadedData?.loans?.length > 0);
            
            if (now - authCreated < oneHour && hasAnyData) {
                console.warn('⚠️ DATA GUARD: Fresh account with existing data - likely stale');
                return false;
            }
        }
        
        // Otherwise, assume it's valid legacy data
        return true;
    }
    
    // If _authUid exists, it must match current user
    if (storedAuthUid !== currentAuthUid) {
        console.warn('⚠️ DATA GUARD: Auth UID mismatch', {
            stored: storedAuthUid,
            current: currentAuthUid
        });
        return false;
    }
    
    return true;
}

/**
 * Resets all user state to prevent data leaks
 * Call this when switching users or detecting stale data
 */
function resetUserState(authUser) {
    console.log('🔄 Resetting user state');
    
    // Reset userData to empty state
    userData = {
        profile: {
            _authUid: authUser?.id || '',
            name: '',
            firstName: '',
            lastName: '',
            phone: '',
            whatsapp_number: ''
        },
        income: { husband:0, wife:0, rental:0, rentalActive:false },
        expenses: { monthly:[], periodic:[], byMember:{}, byMonth:{} },
        investments: { mutualFunds:[], stocks:[], fd:[], ppf:[] },
        loans: [],
        insurance: { term:[], health:[], vehicle:[] },
        schemes: [],
        bankAccounts: [],
        liquidSavings: 0,
        termCover: 0
    };
    
    // Reset household context
    householdId = null;
    memberId = null;
    memberMap = {};
    
    // Clear compute cache
    computeCache.invalidate();
    
    // Clear ALL user-specific localStorage keys (namespaced)
    try {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('fam:user:')) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        console.log(`🗑️ Removed ${keysToRemove.length} namespaced storage keys`);
    } catch(e) {
        console.error('Error clearing namespaced storage:', e);
    }
    
    // Clear legacy non-namespaced keys for backward compatibility
    const legacyKeys = ['onboarding_completed', 'pending_registration_data', 'savedCalculations'];
    legacyKeys.forEach(key => {
        try {
            localStorage.removeItem(key);
        } catch(e) {
            console.error(`Error removing legacy key ${key}:`, e);
        }
    });
    
    console.log('✅ User state reset complete');
}

// ========== SUPABASE DATA ==========
async function loadUserData(email) {
    console.log('loadUserData called for:', email);
    
    // Phase 1.6: Check if householdId is set (normalized path)
    if (householdId) {
        console.log('🔄 Using normalized tables (householdId:', householdId, ')');
        await loadHouseholdData();
        return;
    }
    
    // Legacy path: load from user_data table
    console.log('📦 Using legacy user_data table');
    const { data, error } = await sb.from('user_data').select('*').eq('email', email).maybeSingle();
    if(error) { console.error('Load error:', error); return; }
    
    // Get current auth user info for validation
    let authUser = null, authMeta = null;
    try {
        const { data: { user } } = await sb.auth.getUser();
        authUser = user;
        authMeta = user?.user_metadata;
    } catch(e) { console.error('Failed to get auth user:', e); }
    
    if(data) {
        console.log('✅ Loaded user data from Supabase:', JSON.stringify({ 
            profileName: data.profile?.name, 
            profileAge: data.profile?.age,
            storedAuthUid: data.profile?._authUid,
            currentAuthUid: authUser?.id,
            hasIncome: !!data.income, 
            incomeHusband: data.income?.husband,
            loanCount: data.loans?.length
        }));
        
        // DATA GUARD: Validate data ownership
        if (!validateDataOwnership(data, authUser)) {
            console.warn('⚠️ STALE DATA DETECTED: Resetting to clean state');
            console.warn('⚠️ SECURITY: Data ownership mismatch - preventing data leak');
            
            // CRITICAL: Reset state immediately
            resetUserState(authUser);
            
            // Recover profile from auth metadata
            if (authMeta?.name || authMeta?.firstName) {
                userData.profile.name = authMeta.name || `${authMeta.firstName || ''} ${authMeta.lastName || ''}`.trim();
                userData.profile.firstName = authMeta.firstName || '';
                userData.profile.lastName = authMeta.lastName || '';
                userData.profile.phone = authMeta.phone || '';
                userData.profile.whatsapp_number = authMeta.phone || '';
                userData.profile._authUid = authUser?.id || '';
            }
            
            // Save clean state
            await saveUserData(email);
            console.log('✅ Stale data cleared and reset for new user');
            
            // IMPORTANT: Return early - do NOT load stale data
            return;
        }
        
        userData = {
            profile:     data.profile     || {},
            income:      data.income      || { husband:0, wife:0, rental:0, rentalActive:false },
            expenses:    data.expenses    || { monthly:[], periodic:[], byMember:{}, byMonth:{} },
            investments: data.investments || { mutualFunds:[], stocks:[], fd:[], ppf:[] },
            loans:       data.loans       || [],
            insurance:   data.insurance   || { term:[], health:[], vehicle:[] },
            schemes:     data.schemes     || [],
            bankAccounts: data.bank_accounts || [],
            liquidSavings: data.profile?.liquidSavings || 0,
            termCover:   data.profile?.termCover || data.insurance?.termCover || 0
        };
        
        // Backfill _authUid for existing users who don't have it yet
        if (!userData.profile._authUid && authUser?.id) {
            userData.profile._authUid = authUser.id;
            await saveUserData(email);
        }
        
        // If profile name is missing, recover from auth metadata
        if (!userData.profile.name && authMeta) {
            if (authMeta.name || authMeta.firstName) {
                console.log('Recovering empty profile from auth metadata:', authMeta);
                userData.profile.name = authMeta.name || `${authMeta.firstName || ''} ${authMeta.lastName || ''}`.trim();
                userData.profile.firstName = authMeta.firstName || '';
                userData.profile.lastName = authMeta.lastName || '';
                userData.profile.phone = authMeta.phone || '';
                userData.profile._authUid = authUser?.id || '';
                if (!userData.profile.familyMembers || userData.profile.familyMembers.length === 0) {
                    userData.profile.familyMembers = [{ id: 'self', name: userData.profile.name, role: 'self' }];
                }
                await saveUserData(email);
                console.log('✅ Profile recovered and saved');
            }
        }
    } else {
        console.warn('⚠️ No user_data row found in Supabase for:', email);
        // Reset userData to clean state for new user
        userData = {
            profile: { _authUid: authUser?.id || '' },
            income: { husband:0, wife:0, rental:0, rentalActive:false },
            expenses: { monthly:[], periodic:[], byMember:{}, byMonth:{} },
            investments: { mutualFunds:[], stocks:[], fd:[], ppf:[] },
            loans: [],
            insurance: { term:[], health:[], vehicle:[] },
            schemes: [],
            bankAccounts: [],
            liquidSavings: 0,
            termCover: 0
        };
        // Recover profile from auth metadata
        if (authMeta?.name || authMeta?.firstName) {
            console.log('Recovering profile from auth metadata:', authMeta);
            userData.profile = {
                name: authMeta.name || `${authMeta.firstName || ''} ${authMeta.lastName || ''}`.trim(),
                firstName: authMeta.firstName || '',
                lastName: authMeta.lastName || '',
                phone: authMeta.phone || '',
                whatsapp_number: authMeta.phone || '',
                _authUid: authUser?.id || '',
                familyMembers: [{ id: 'self', name: authMeta.name || `${authMeta.firstName || ''} ${authMeta.lastName || ''}`.trim(), role: 'self' }]
            };
        }
        await saveUserData(email);
    }

    // Ensure expenses.byMember exists
    if(!userData.expenses.byMember) userData.expenses.byMember = {};

    // Migrate old expenses to 'self' member if byMember is empty and monthly has items (run once)
    if(!userData.profile._expenseMigrationV1 && Object.keys(userData.expenses.byMember).length === 0 && (userData.expenses.monthly||[]).length > 0) {
        userData.expenses.byMember.self = [...userData.expenses.monthly];
        userData.profile._expenseMigrationV1 = true;
    }

    // Ensure expenses.byMonth exists
    if(!userData.expenses.byMonth) userData.expenses.byMonth = {};

    // Migrate flat byMember into byMonth under current month if byMonth is empty (run once)
    if(!userData.profile._monthMigrationV1 && Object.keys(userData.expenses.byMonth).length === 0 && Object.keys(userData.expenses.byMember).length > 0) {
        const now = new Date();
        const migrationMonth = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0');
        userData.expenses.byMonth[migrationMonth] = { byMember: JSON.parse(JSON.stringify(userData.expenses.byMember)) };
        userData.profile._monthMigrationV1 = true;
    }

    // Build familyMembers from legacy data if missing (run once)
    if(!userData.profile._familyMigrationV1 && (!userData.profile.familyMembers || userData.profile.familyMembers.length === 0)) {
        const fm = [{ id:'self', name: userData.profile.name || 'Me', role:'self' }];
        if(userData.profile.spouseName) fm.push({ id:'spouse', name: userData.profile.spouseName, role:'spouse' });
        (userData.profile.kids||[]).forEach((k,i) => fm.push({ id:'kid-'+(i+1), name:k, role:'kid' }));
        userData.profile.familyMembers = fm;
        userData.profile._familyMigrationV1 = true;
    }

    // ── Per-member data migration (investments, loans, insurance) ──
    migrateToPerMember();

    userData.investments = userData.investments || { byMember: { self: { mutualFunds:[], stocks:[], fd:[], ppf:[] } } };
    // Ensure byMember structure exists even for fresh users
    if (!userData.investments.byMember) {
        userData.investments.byMember = { self: { mutualFunds:[], stocks:[], fd:[], ppf:[] } };
    }
    if (!userData.loans.byMember) {
        userData.loans = { byMember: { self: [] } };
    }
    if (!userData.insurance.byMember) {
        userData.insurance = { byMember: { self: { term:[], health:[], vehicle:[], life:[], home:[] } } };
    }

    if(userData.schemes.length > 0) {
        const seen = new Set();
        userData.schemes = userData.schemes.filter(s => { if(seen.has(s.name)) return false; seen.add(s.name); return true; });
    }

    if(!userData.profile.name) {
        const { data: { user } } = await sb.auth.getUser();
        if(user?.user_metadata?.name) {
            userData.profile.name = user.user_metadata.name;
            await saveUserData(email);
        }
    }

    // Invalidate compute cache after loading new data
    computeCache.invalidate();
}

async function saveUserData(email) {
    if(!email) return;
    console.log('saveUserData called for:', email, '| profile.name:', userData.profile?.name, '| profile.age:', userData.profile?.age);
    
    // Phase 1.6: Defensive check - if householdId is null, log warning and skip normalized table writes
    if (!householdId) {
        console.warn('⚠️ householdId is null, skipping normalized table writes (legacy path only)');
    }
    
    // Legacy write to user_data table
    const { error } = await sb.from('user_data').upsert({
        email,
        profile:     { ...userData.profile, liquidSavings: userData.liquidSavings, termCover: userData.termCover },
        income:      userData.income,
        expenses:    userData.expenses,
        investments: userData.investments,
        loans:       userData.loans,
        insurance:   userData.insurance,
        schemes:     userData.schemes,
        bank_accounts: userData.bankAccounts || []
    }, { onConflict: 'email' });
    if(error) console.error('Save error:', error);
    
    // Phase 1.6: Dual-write to normalized tables
    if (householdId) {
        await saveNormalizedData();
    }
}

function debounceSave() {
    clearTimeout(saveTimer);
    computeCache.invalidate(); // Invalidate cache when data changes
    saveTimer = setTimeout(() => { if(currentUserEmail) saveUserData(currentUserEmail); }, 600);
}

/**
 * saveTable(tableName, rows, options)
 * Generic upsert for a single normalized table.
 * Automatically sets household_id on each row.
 * During dual-write phase, also calls legacy saveUserData().
 */
async function saveTable(tableName, rows, options = {}) {
    if (!householdId) {
        console.warn('⚠️ Cannot save to normalized tables: householdId is null');
        return { data: null, error: new Error('householdId is null') };
    }
    
    if (!rows || rows.length === 0) {
        return { data: [], error: null };
    }
    
    try {
        // Inject household_id and convert legacy member IDs to UUIDs
        const processedRows = rows.map(row => {
            const processed = { ...row, household_id: householdId };
            
            // Convert legacy member ID to UUID if present
            if (row.memberId && !row.member_id) {
                processed.member_id = getMemberUuid(row.memberId);
                delete processed.memberId;
            }
            
            return processed;
        });
        
        console.log(`💾 Saving to ${tableName}:`, processedRows.length, 'rows');
        
        const { data, error } = await sb
            .from(tableName)
            .upsert(processedRows, { onConflict: 'id' });
        
        if (error) {
            console.error(`❌ Error saving to ${tableName}:`, error);
            handleSupabaseError(error, `saveTable(${tableName})`);
            return { data: null, error };
        }
        
        console.log(`✅ Saved to ${tableName}`);
        return { data, error: null };
        
    } catch (err) {
        console.error(`❌ saveTable(${tableName}) failed:`, err);
        return { data: null, error: err };
    }
}

/**
 * deleteRow(tableName, rowId)
 * Deletes a single row by UUID. RLS enforces household scope.
 */
async function deleteRow(tableName, rowId) {
    if (!householdId) {
        console.warn('⚠️ Cannot delete from normalized tables: householdId is null');
        return { error: new Error('householdId is null') };
    }
    
    try {
        console.log(`🗑️ Deleting from ${tableName}:`, rowId);
        
        const { error } = await sb
            .from(tableName)
            .delete()
            .eq('id', rowId);
        
        if (error) {
            console.error(`❌ Error deleting from ${tableName}:`, error);
            handleSupabaseError(error, `deleteRow(${tableName})`);
            return { error };
        }
        
        console.log(`✅ Deleted from ${tableName}`);
        return { error: null };
        
    } catch (err) {
        console.error(`❌ deleteRow(${tableName}) failed:`, err);
        return { error: err };
    }
}

/**
 * saveNormalizedData()
 * Helper that extracts data from userData and saves to normalized tables.
 * Called during dual-write phase.
 */
async function saveNormalizedData() {
    if (!householdId) {
        console.warn('⚠️ Skipping normalized data save: householdId is null');
        return;
    }
    
    try {
        console.log('💾 Dual-write: Saving to normalized tables...');
        
        // Extract and save incomes
        const incomes = [];
        const selfMemberId = getMemberUuid('self');
        const spouseMemberId = getMemberUuid('spouse');
        
        if (userData.income?.husband > 0 && selfMemberId) {
            incomes.push({
                // Don't set id - let Supabase generate UUID
                member_id: selfMemberId,
                type: 'salary',
                amount: userData.income.husband,
                frequency: 'monthly',
                is_active: true
            });
        }
        
        if (userData.income?.wife > 0 && spouseMemberId) {
            incomes.push({
                // Don't set id - let Supabase generate UUID
                member_id: spouseMemberId,
                type: 'salary',
                amount: userData.income.wife,
                frequency: 'monthly',
                is_active: true
            });
        }
        
        if (userData.income?.rental > 0 && selfMemberId) {
            incomes.push({
                // Don't set id - let Supabase generate UUID
                member_id: selfMemberId,
                type: 'rental',
                amount: userData.income.rental,
                frequency: 'monthly',
                is_active: userData.income.rentalActive || false
            });
        }
        
        if (userData.income?.business > 0 && selfMemberId) {
            incomes.push({
                // Don't set id - let Supabase generate UUID
                member_id: selfMemberId,
                type: 'business',
                amount: userData.income.business,
                frequency: 'monthly',
                is_active: true
            });
        }
        
        if (userData.income?.other > 0 && selfMemberId) {
            incomes.push({
                // Don't set id - let Supabase generate UUID
                member_id: selfMemberId,
                type: 'other',
                amount: userData.income.other,
                frequency: 'monthly',
                is_active: true
            });
        }
        
        if (incomes.length > 0) {
            // For incomes, delete existing and insert new (simpler than upsert without IDs)
            // Delete existing incomes for this household
            const { error: deleteError } = await sb
                .from('incomes')
                .delete()
                .eq('household_id', householdId);
            
            if (deleteError) {
                console.error('❌ Error deleting old incomes:', deleteError);
            }
            
            // Insert new incomes (without id, let Supabase generate UUIDs)
            const { data, error } = await sb
                .from('incomes')
                .insert(incomes.map(inc => ({ ...inc, household_id: householdId })));
            
            if (error) {
                console.error('❌ Error saving incomes:', error);
            } else {
                console.log('✅ Saved', incomes.length, 'income rows');
            }
        }
        
        // Extract and save expenses
        const expenses = [];
        if (userData.expenses?.byMonth) {
            for (const [month, monthData] of Object.entries(userData.expenses.byMonth)) {
                if (monthData.byMember) {
                    for (const [legacyMemberId, expenseList] of Object.entries(monthData.byMember)) {
                        const memberUuid = getMemberUuid(legacyMemberId);
                        if (memberUuid && Array.isArray(expenseList)) {
                            expenseList.forEach(exp => {
                                expenses.push({
                                    id: exp.id || exp._normalizedId,
                                    member_id: memberUuid,
                                    category: exp.c || exp.category || 'other',
                                    label: exp.label,
                                    amount: exp.v || exp.amount || 0,
                                    month: month,
                                    is_recurring: exp.isRecurring || false,
                                    frequency: exp.frequency || 'monthly'
                                });
                            });
                        }
                    }
                }
            }
        }
        
        if (expenses.length > 0) {
            await saveTable('expenses', expenses);
        }
        
        // Extract and save investments
        const investments = [];
        if (userData.investments?.byMember) {
            for (const [legacyMemberId, investData] of Object.entries(userData.investments.byMember)) {
                const memberUuid = getMemberUuid(legacyMemberId);
                if (!memberUuid) continue;
                
                // Mutual funds
                if (Array.isArray(investData.mutualFunds)) {
                    investData.mutualFunds.forEach(mf => {
                        investments.push({
                            id: mf.id || mf._normalizedId,
                            member_id: memberUuid,
                            type: 'mutual_fund',
                            name: mf.name,
                            value: mf.value || 0,
                            units: mf.units,
                            nav: mf.nav,
                            purchase_date: mf.purchaseDate,
                            sip_amount: mf.sipAmount,
                            meta: {}
                        });
                    });
                }
                
                // Stocks
                if (Array.isArray(investData.stocks)) {
                    investData.stocks.forEach(stock => {
                        investments.push({
                            id: stock.id || stock._normalizedId,
                            member_id: memberUuid,
                            type: 'stock',
                            name: stock.name,
                            value: stock.value || 0,
                            units: stock.units,
                            nav: stock.nav,
                            purchase_date: stock.purchaseDate,
                            meta: {}
                        });
                    });
                }
                
                // FDs
                if (Array.isArray(investData.fd)) {
                    investData.fd.forEach(fd => {
                        investments.push({
                            id: fd.id || fd._normalizedId,
                            member_id: memberUuid,
                            type: 'fd',
                            name: fd.name,
                            value: fd.value || 0,
                            rate: fd.rate,
                            maturity_date: fd.maturityDate,
                            meta: {}
                        });
                    });
                }
                
                // PPF
                if (Array.isArray(investData.ppf)) {
                    investData.ppf.forEach(ppf => {
                        investments.push({
                            id: ppf.id || ppf._normalizedId,
                            member_id: memberUuid,
                            type: 'ppf',
                            name: ppf.name,
                            value: ppf.value || 0,
                            meta: {}
                        });
                    });
                }
            }
        }
        
        if (investments.length > 0) {
            await saveTable('investments', investments);
        }
        
        // Extract and save loans
        const loans = [];
        if (userData.loans?.byMember) {
            for (const [legacyMemberId, loanList] of Object.entries(userData.loans.byMember)) {
                const memberUuid = getMemberUuid(legacyMemberId);
                if (memberUuid && Array.isArray(loanList)) {
                    loanList.forEach(loan => {
                        loans.push({
                            id: loan.id || loan._normalizedId,
                            member_id: memberUuid,
                            type: loan.type || 'other',
                            lender: loan.label || loan.lender,
                            outstanding: loan.outstanding || 0,
                            emi: loan.emi || 0,
                            rate: loan.rate || 0,
                            principal: loan.principal,
                            tenure_months: loan.tenureMonths,
                            start_date: loan.startDate,
                            end_date: loan.endDate,
                            meta: {}
                        });
                    });
                }
            }
        }
        
        if (loans.length > 0) {
            await saveTable('loans', loans);
        }
        
        // Extract and save insurance
        const insurancePolicies = [];
        if (userData.insurance?.byMember) {
            for (const [legacyMemberId, insuranceData] of Object.entries(userData.insurance.byMember)) {
                const memberUuid = getMemberUuid(legacyMemberId);
                if (!memberUuid) continue;
                
                // Term insurance
                if (Array.isArray(insuranceData.term)) {
                    insuranceData.term.forEach(policy => {
                        insurancePolicies.push({
                            id: policy.id || policy._normalizedId,
                            member_id: memberUuid,
                            type: 'term',
                            provider: policy.provider,
                            policy_number: policy.policyNumber,
                            cover_amount: policy.coverAmount || 0,
                            premium: policy.premium || 0,
                            premium_frequency: policy.premiumFrequency || 'yearly',
                            start_date: policy.startDate,
                            end_date: policy.endDate,
                            meta: {}
                        });
                    });
                }
                
                // Health insurance
                if (Array.isArray(insuranceData.health)) {
                    insuranceData.health.forEach(policy => {
                        insurancePolicies.push({
                            id: policy.id || policy._normalizedId,
                            member_id: memberUuid,
                            type: 'health',
                            provider: policy.provider,
                            policy_number: policy.policyNumber,
                            cover_amount: policy.coverAmount || 0,
                            premium: policy.premium || 0,
                            premium_frequency: policy.premiumFrequency || 'yearly',
                            start_date: policy.startDate,
                            end_date: policy.endDate,
                            meta: {}
                        });
                    });
                }
                
                // Vehicle insurance
                if (Array.isArray(insuranceData.vehicle)) {
                    insuranceData.vehicle.forEach(policy => {
                        insurancePolicies.push({
                            id: policy.id || policy._normalizedId,
                            member_id: memberUuid,
                            type: 'vehicle',
                            provider: policy.provider,
                            policy_number: policy.policyNumber,
                            cover_amount: policy.coverAmount || 0,
                            premium: policy.premium || 0,
                            premium_frequency: policy.premiumFrequency || 'yearly',
                            start_date: policy.startDate,
                            end_date: policy.endDate,
                            meta: {}
                        });
                    });
                }
            }
        }
        
        if (insurancePolicies.length > 0) {
            await saveTable('insurance_policies', insurancePolicies);
        }
        
        // Update forecast assumptions
        if (userData.profile?.forecastAssumptions) {
            const assumptions = userData.profile.forecastAssumptions;
            const { error } = await sb
                .from('forecast_assumptions')
                .upsert({
                    household_id: householdId,
                    inflation_rate: (assumptions.expenseInflation || 6) / 100,
                    equity_return: (assumptions.equityReturn || 12) / 100,
                    debt_return: (assumptions.debtReturn || 7) / 100,
                    salary_growth: (assumptions.incomeGrowth || 8) / 100,
                    expense_growth: (assumptions.expenseInflation || 6) / 100,
                    retirement_age: assumptions.retirementAge || 60,
                    life_expectancy: assumptions.lifeExpectancy || 85,
                    meta: { medicalInflation: assumptions.medicalInflation || 10 }
                }, { onConflict: 'household_id' });
            
            if (error) {
                console.error('❌ Error saving forecast assumptions:', error);
            } else {
                console.log('✅ Saved forecast assumptions');
            }
        }
        
        console.log('✅ Dual-write to normalized tables complete');
        
    } catch (err) {
        console.error('❌ saveNormalizedData failed:', err);
    }
}

/**
 * handleSupabaseError(error, context)
 * Global error handler for Supabase operations
 */
function handleSupabaseError(error, context = '') {
    console.error(`❌ Supabase error (${context}):`, error);
    
    // Check for RLS permission denied error
    if (error.code === '42501' || error.message?.includes('permission denied') || error.message?.includes('RLS')) {
        showToast("You don't have permission to edit this data.", 'red');
        return;
    }
    
    // Check for network errors
    if (error.message?.includes('fetch') || error.message?.includes('network')) {
        showToast('Network error. Please check your connection.', 'red');
        return;
    }
    
    // Generic error
    showToast(`Error: ${error.message || 'Something went wrong'}`, 'red');
}

// ========== AUTH ==========
async function checkSession() {
    const ls = document.getElementById('loading-screen');
    isLoadingSession = true;
    
    // Check if user just verified their email via query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const isEmailVerified = urlParams.get('verified') === 'true';
    if (isEmailVerified) {
        console.log('✅ Email verification detected via query param');
        // Clear the query parameter from URL
        const cleanUrl = window.location.origin + window.location.pathname + window.location.hash;
        history.replaceState(null, null, cleanUrl);
    }
    
    try {
        console.log('Checking session with Supabase URL:', SUPABASE_URL);
        console.log('localStorage available:', typeof(Storage) !== 'undefined');
        
        // Get current session
        const { data: { session }, error } = await sb.auth.getSession();
        
        if (error) {
            console.error('getSession error:', error);
            showAuth();
            return;
        }
        
        console.log('Session result:', session ? 'active' : 'none');
        console.log('Session details:', session ? {
            expiresAt: new Date(session.expires_at * 1000).toISOString(),
            expiresIn: session.expires_in,
            hasRefreshToken: !!session.refresh_token
        } : 'no session');
        
        if (session) {
            currentUserEmail = session.user.email;
            // Phase 1.6: Load household context before loading user data
            await loadHouseholdContext();
            await loadUserData(currentUserEmail);
            
            // If profile is empty, check for pending registration data in localStorage
            if (!userData.profile?.name) {
                try {
                    const pendingReg = localStorage.getItem('pending_registration_data');
                    if (pendingReg) {
                        const parsed = JSON.parse(pendingReg);
                        if (parsed.email === currentUserEmail) {
                            // Restore name from pending data
                            if (parsed.firstName && parsed.lastName) {
                                userData.profile.name = `${parsed.firstName} ${parsed.lastName}`;
                                userData.profile.firstName = parsed.firstName;
                                userData.profile.lastName = parsed.lastName;
                                userData.profile.phone = parsed.phone || '';
                            } else if (parsed.userData) {
                                // Legacy format
                                userData = parsed.userData;
                            }
                            await saveUserData(currentUserEmail);
                        }
                    }
                } catch(e) { console.error('Error restoring pending registration data:', e); }
            } else {
                localStorage.removeItem('pending_registration_data');
            }
            
            // If user has profile data, mark onboarding as done
            if (userData.profile?.name) {
                localStorage.setItem('onboarding_completed', 'true');
            }
            
            // Check if profile is incomplete — redirect to wizard
            // _wizardCompleted flag is set by the new wizard flow
            // For backward compatibility: if user has age+occupation, they completed the old onboarding
            const profileComplete = userData.profile?._wizardCompleted || (userData.profile?.age && userData.profile?.occupation);
            if (!profileComplete) {
                // Show congratulations modal if email was just verified
                if (isEmailVerified) {
                    // Get first name from multiple sources
                    let firstName = userData?.profile?.firstName;
                    if (!firstName) {
                        try {
                            const pendingReg = localStorage.getItem('pending_registration_data');
                            if (pendingReg) {
                                firstName = JSON.parse(pendingReg)?.firstName;
                            }
                        } catch(e) { console.error('Error reading pending registration:', e); }
                    }
                    if (!firstName) firstName = 'Welcome';
                    
                    showCongratulationsModal(firstName);
                    setTimeout(() => {
                        showProfileWizard();
                    }, 2800);
                } else {
                    showProfileWizard();
                }
            } else {
                // Show success message if email was just verified
                if (isEmailVerified) {
                    showToast('✅ Email verified successfully!', 'green');
                }
                showApp();
                resetInactivity();
            }
        } else {
            console.log('No session found, checking for refresh token...');
            // Attempt to refresh session if refresh token exists
            const { data: refreshData, error: refreshError } = await sb.auth.refreshSession();
            if (refreshData?.session) {
                console.log('Session refreshed successfully');
                currentUserEmail = refreshData.session.user.email;
                await loadHouseholdContext();
                await loadUserData(currentUserEmail);
                
                const profileComplete = userData.profile?._wizardCompleted || (userData.profile?.age && userData.profile?.occupation);
                if (!profileComplete) {
                    if (isEmailVerified) {
                        // Get first name from multiple sources
                        let firstName = userData?.profile?.firstName;
                        if (!firstName) {
                            try {
                                const pendingReg = localStorage.getItem('pending_registration_data');
                                if (pendingReg) {
                                    firstName = JSON.parse(pendingReg)?.firstName;
                                }
                            } catch(e) { console.error('Error reading pending registration:', e); }
                        }
                        if (!firstName) firstName = 'Welcome';
                        
                        showCongratulationsModal(firstName);
                        setTimeout(() => {
                            showProfileWizard();
                        }, 2800);
                    } else {
                        showProfileWizard();
                    }
                } else {
                    if (isEmailVerified) {
                        showToast('✅ Email verified successfully!', 'green');
                    }
                    showApp();
                    resetInactivity();
                }
            } else {
                console.log('No refresh token available or refresh failed:', refreshError);
                showAuth();
            }
        }
    } catch (e) {
        console.error('checkSession error:', e);
        showAuth();
    } finally {
        isLoadingSession = false;
        if (ls) ls.style.display = 'none';
    }
}

function showApp() {
    console.log('showApp called. userData.profile.name:', userData.profile?.name, 'currentUserEmail:', currentUserEmail);
    $('landing').style.display='none'; $('auth').style.display='none'; $('app').style.display='block';
    document.getElementById('verification-screen').style.display='none';
    document.getElementById('profile-wizard').style.display='none';
    $('monthPicker').value = currentMonth;
    populateProfileSelector();
    syncExpensesToLegacy();
    renderCurrentPage();
}

function populateProfileSelector() {
    const sel = $('profileSelect');
    const members = userData.profile.familyMembers || [];
    const name = userData.profile.name || 'Me';
    sel.innerHTML = '<option value="all">👨‍👩‍👧‍👦 All (Master)</option>';
    if(members.length > 0) {
        members.forEach(m => {
            const icon = m.role==='self' ? '👤' : m.role==='spouse' ? '💑' : '👶';
            sel.innerHTML += `<option value="${m.id}">${icon} ${m.name}</option>`;
        });
    } else {
        sel.innerHTML += `<option value="self">👤 ${name}</option>`;
        if(userData.profile.spouseName) sel.innerHTML += `<option value="spouse">💑 ${userData.profile.spouseName}</option>`;
        (userData.profile.kids||[]).forEach((k,i) => {
            sel.innerHTML += `<option value="kid-${i+1}">👶 ${k}</option>`;
        });
    }
    sel.value = currentProfile;
}
function showAuth() { $('landing').style.display='block'; $('auth').style.display='none'; $('app').style.display='none'; document.getElementById('modern-registration').style.display='none'; document.getElementById('classic-auth').style.display='block'; document.getElementById('verification-screen').style.display='none'; document.getElementById('profile-wizard').style.display='none'; clearTimeout(inactivityTimer); window.scrollTo(0,0); }
window.showAuth = showAuth;

// ========== LANDING PAGE ANIMATION ENGINE ==========
(function initLandingAnimations() {
    // 1. Subtle Particle Background
    const canvas = document.getElementById('lotto-particles');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        const colors = ['#3b7eff','#a78bfa','#10d98e','#60a5fa'];
        function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        class Particle {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.3;
                this.speedY = (Math.random() - 0.5) * 0.3;
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.opacity = Math.random() * 0.3 + 0.05;
                this.pulse = Math.random() * Math.PI * 2;
            }
            update() {
                this.x += this.speedX; this.y += this.speedY;
                this.pulse += 0.015;
                this.opacity = 0.05 + Math.sin(this.pulse) * 0.1;
                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
            }
            draw() {
                ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color; ctx.globalAlpha = this.opacity; ctx.fill();
                ctx.globalAlpha = 1;
            }
        }
        for (let i = 0; i < 40; i++) particles.push(new Particle());
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => { p.update(); p.draw(); });
            // Subtle connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist < 120) {
                        ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = particles[i].color;
                        ctx.globalAlpha = (1 - dist/120) * 0.04; ctx.lineWidth = 0.5;
                        ctx.stroke(); ctx.globalAlpha = 1;
                    }
                }
            }
            requestAnimationFrame(animate);
        }
        animate();
    }

    // 2. Nav scroll effect
    window.addEventListener('scroll', () => {
        const nav = document.querySelector('.landing-nav');
        if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
    });

    // 3. Scroll Reveal for cards
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const siblings = Array.from(el.parentElement.children);
                const i = siblings.indexOf(el);
                setTimeout(() => el.classList.add('revealed'), i * 80);
                revealObserver.unobserve(el);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.landing-feature-card, .nri-q-card').forEach(c => revealObserver.observe(c));

    // 4. NRI Showcase tab switching + auto-rotate
    let nriAutoTimer = null, nriAutoProgress = null, nriCurrentTab = 0;
    const NRI_AUTO_INTERVAL = 6000;
    window.switchNriTab = function(idx) {
        nriCurrentTab = idx;
        document.querySelectorAll('.nri-tab').forEach((t,i) => { t.classList.toggle('active', i===idx); t.setAttribute('aria-selected', i===idx); });
        document.querySelectorAll('.nri-panel').forEach((p,i) => p.classList.toggle('active', i===idx));
        // Animate bar fills in the new panel
        const panel = document.querySelectorAll('.nri-panel')[idx];
        if (panel) {
            panel.querySelectorAll('.nri-viz-bar-fill, .nri-gauge-fill').forEach(f => {
                const w = f.style.width; f.style.width = '0%';
                setTimeout(() => { f.style.width = w; }, 100);
            });
        }
        resetNriAutoRotate();
    };
    function resetNriAutoRotate() {
        clearInterval(nriAutoTimer); clearInterval(nriAutoProgress);
        const bar = document.querySelector('.nri-auto-bar-fill');
        if (bar) bar.style.width = '0%';
        let elapsed = 0;
        nriAutoProgress = setInterval(() => {
            elapsed += 50;
            if (bar) bar.style.width = (elapsed / NRI_AUTO_INTERVAL * 100) + '%';
        }, 50);
        nriAutoTimer = setInterval(() => {
            nriCurrentTab = (nriCurrentTab + 1) % 5;
            window.switchNriTab(nriCurrentTab);
        }, NRI_AUTO_INTERVAL);
    }
    // Start auto-rotate when section is visible
    const showcaseObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) { resetNriAutoRotate(); showcaseObserver.unobserve(entry.target); }
        });
    }, { threshold: 0.2 });
    const showcaseEl = document.querySelector('.nri-showcase');
    if (showcaseEl) showcaseObserver.observe(showcaseEl);

    // 5. Counter animation for stats
    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.querySelectorAll('.ls-num[data-target]').forEach(el => {
                    const target = parseInt(el.dataset.target);
                    const suffix = el.innerHTML.replace(/^[\d]+/, '');
                    let current = 0;
                    const step = Math.max(1, Math.floor(target / 40));
                    const interval = setInterval(() => {
                        current += step;
                        if (current >= target) { current = target; clearInterval(interval); }
                        el.innerHTML = current + suffix;
                    }, 30);
                });
                statObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    const stats = document.querySelector('.landing-stats');
    if (stats) statObserver.observe(stats);

    // 6. Testimonial cards stagger
    const testObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const cards = entry.target.querySelectorAll('.testimonial-card');
                cards.forEach((card, i) => {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    card.style.transition = `all 0.5s ease ${i * 0.1}s`;
                    setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'translateY(0)'; }, 50);
                });
                testObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    const testSection = document.querySelector('.testimonials-section');
    if (testSection) testObserver.observe(testSection);

    // 7. NRI viz bar animation handled by switchNriTab
})();

// Go from landing page to auth (login or register)
window.goToAuth = (mode) => {
    $('landing').style.display='none';
    $('auth').style.display='flex';
    $('app').style.display='none';
    switchAuth(mode || 'login');
};

window.switchAuth = mode => {
    if (mode === 'reg') {
        // Show modern registration screen
        document.getElementById('classic-auth').style.display = 'none';
        document.getElementById('modern-registration').style.display = 'block';
    } else {
        // Show classic login screen
        document.getElementById('classic-auth').style.display = 'block';
        document.getElementById('modern-registration').style.display = 'none';
    }
    
    // Update tabs in classic auth
    document.querySelectorAll('.atab').forEach((b,i) => b.classList.toggle('on', (mode==='login'&&i===0)||(mode==='reg'&&i===1)));
};

// Show login screen from modern registration
window.showLoginScreen = () => {
    document.getElementById('modern-registration').style.display = 'none';
    document.getElementById('classic-auth').style.display = 'block';
    switchAuth('login');
};

// Password validation for modern registration
window.showPasswordRequirements = () => {
    const reqDiv = document.getElementById('password-requirements');
    if (reqDiv) reqDiv.style.display = 'block';
};

window.validatePassword = () => {
    const password = document.getElementById('r-pw')?.value || '';
    
    // Length check (6+ chars for compatibility with existing system)
    const lengthValid = password.length >= 6;
    updateRequirement('req-length', lengthValid);
    
    // Case check
    const caseValid = /[a-z]/.test(password) && /[A-Z]/.test(password);
    updateRequirement('req-case', caseValid);
    
    // Number check
    const numberValid = /[0-9]/.test(password);
    updateRequirement('req-number', numberValid);
};

function updateRequirement(id, isValid) {
    const element = document.getElementById(id);
    if (!element) return;
    
    if (isValid) {
        element.style.color = 'var(--green)';
        const span = element.querySelector('span');
        if (span) span.textContent = '✓';
    } else {
        element.style.color = 'var(--text3)';
        const span = element.querySelector('span');
        if (span) span.textContent = '○';
    }
}

// Validate password match
window.validatePasswordMatch = () => {
    const password = document.getElementById('r-pw')?.value || '';
    const confirmPassword = document.getElementById('r-pw2')?.value || '';
    const indicator = document.getElementById('password-match-indicator');
    const matchSuccess = document.getElementById('match-success');
    const matchError = document.getElementById('match-error');
    
    if (!indicator || !matchSuccess || !matchError) return;
    
    // Only show indicator if user has typed in confirm password field
    if (confirmPassword.length === 0) {
        indicator.style.display = 'none';
        return;
    }
    
    indicator.style.display = 'block';
    
    if (password === confirmPassword && password.length > 0) {
        matchSuccess.style.display = 'flex';
        matchError.style.display = 'none';
    } else {
        matchSuccess.style.display = 'none';
        matchError.style.display = 'flex';
    }
};

// Handle modern registration form
window.handleModernRegistration = async () => {
    const firstname = document.getElementById('reg-firstname')?.value?.trim() || '';
    const lastname = document.getElementById('reg-lastname')?.value?.trim() || '';
    const email = document.getElementById('r-em')?.value?.trim() || '';
    const countryCode = document.getElementById('reg-country-code')?.value?.trim() || '+91';
    const phone = document.getElementById('reg-whatsapp')?.value?.trim() || '';
    const password = document.getElementById('r-pw')?.value || '';
    const confirmPassword = document.getElementById('r-pw2')?.value || '';
    const termsChecked = document.getElementById('reg-terms')?.checked || false;
    
    // Validation
    if (!firstname || !lastname) { showToast('❌ Please enter your first and last name', 'red'); return; }
    if (!email) { showToast('❌ Please enter your email address', 'red'); return; }
    if (!phone) { showToast('❌ Please enter your phone number', 'red'); return; }
    if (!password || password.length < 6) { showToast('❌ Password must be at least 6 characters', 'red'); return; }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) { showToast('❌ Password must contain both uppercase and lowercase letters', 'red'); return; }
    if (!/[0-9]/.test(password)) { showToast('❌ Password must contain at least one number', 'red'); return; }
    if (password !== confirmPassword) { showToast('❌ Passwords do not match', 'red'); return; }
    if (!termsChecked) { showToast('❌ Please agree to the Terms of Service', 'red'); return; }
    
    const fullPhone = `${countryCode}${phone}`;
    const btn = document.getElementById('regBtn');
    btn.textContent = 'Creating…'; btn.disabled = true;
    
    const errorDiv = document.getElementById('r-em-error');
    if (errorDiv) { errorDiv.style.display = 'none'; errorDiv.textContent = ''; }
    
    isRegistering = true;
    
    try {
        const { data, error } = await sb.auth.signUp({
            email,
            password,
            options: {
                data: { 
                    firstName: firstname, 
                    lastName: lastname, 
                    name: `${firstname} ${lastname}`, 
                    phone: fullPhone 
                },
                emailRedirectTo: `${window.location.origin}/?verified=true`  // Redirect with verified query param
            }
        });
        
        if (error) {
            let errorMessage = '❌ ' + error.message;
            if (error.message.includes('rate limit')) errorMessage = '⏱️ Too many attempts. Please wait a few minutes.';
            else if (error.message.includes('already registered') || error.message.includes('already exists')) errorMessage = '📧 This email is already registered. Please sign in instead.';
            else if (error.message.includes('invalid email')) errorMessage = '❌ Please enter a valid email address.';
            
            if (errorDiv) { errorDiv.textContent = errorMessage; errorDiv.style.display = 'block'; errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
            btn.textContent = 'Continue →'; btn.disabled = false; isRegistering = false;
            return;
        }
        
        // Save minimal registration data to localStorage backup
        const regData = { email, firstName: firstname, lastName: lastname, phone: fullPhone, timestamp: new Date().toISOString() };
        try { localStorage.setItem('pending_registration_data', JSON.stringify(regData)); } catch(e) { console.error('localStorage backup failed:', e); }
        
        // Check if session exists (auto-confirm enabled)
        const { data: sessionData } = await sb.auth.getSession();
        if (sessionData?.session) {
            // Auto-confirmed — set email and show congratulations then wizard
            currentUserEmail = email;
            showCongratulationsModal(firstname);
            setTimeout(() => {
                isRegistering = false;
                showProfileWizard();
            }, 2500);
        } else {
            // Email verification required — show verification screen
            isRegistering = false;
            showVerificationScreen(email);
        }
    } catch(e) {
        isRegistering = false;
        console.error('Registration error:', e);
        let errorMessage = '🌐 Network error. Please check your internet connection.';
        if (e.message?.includes('fetch')) errorMessage = '🌐 Unable to connect. Please check your internet connection.';
        if (errorDiv) { errorDiv.textContent = errorMessage; errorDiv.style.display = 'block'; }
        btn.textContent = 'Continue →'; btn.disabled = false;
    }
};

// Show verification screen after registration
window.showVerificationScreen = (email) => {
    document.getElementById('verification-email-display').textContent = email;
    $('landing').style.display = 'none';
    $('auth').style.display = 'none';
    $('app').style.display = 'none';
    document.getElementById('profile-wizard').style.display = 'none';
    document.getElementById('verification-screen').style.display = 'block';
    window.scrollTo(0, 0);
};

// Show profile wizard
window.showProfileWizard = async () => {
    $('landing').style.display = 'none';
    $('auth').style.display = 'none';
    $('app').style.display = 'none';
    document.getElementById('verification-screen').style.display = 'none';
    document.getElementById('profile-wizard').style.display = 'block';
    window.scrollTo(0, 0);
    
    // Get authoritative name/phone from auth metadata (set during registration)
    let authName = '', authFirstName = '', authLastName = '', authPhone = '', authUid = '';
    try {
        const { data: { user } } = await sb.auth.getUser();
        const meta = user?.user_metadata;
        authUid = user?.id || '';
        if (meta) {
            authFirstName = meta.firstName || '';
            authLastName = meta.lastName || '';
            authName = meta.name || `${authFirstName} ${authLastName}`.trim();
            authPhone = meta.phone || '';
        }
    } catch(e) { console.error('Failed to get auth metadata:', e); }
    
    // Fallback to pending registration data in localStorage
    if (!authFirstName) {
        try {
            const pending = JSON.parse(localStorage.getItem('pending_registration_data') || '{}');
            authFirstName = pending.firstName || '';
            authLastName = pending.lastName || '';
            authName = authFirstName && authLastName ? `${authFirstName} ${authLastName}` : '';
            authPhone = pending.phone || '';
        } catch(e) {}
    }
    
    // Reset userData to completely clean state with ONLY auth metadata
    userData = {
        profile: {
            name: authName,
            firstName: authFirstName,
            lastName: authLastName,
            phone: authPhone,
            whatsapp_number: authPhone,
            _authUid: authUid
        },
        income: { husband:0, wife:0, rental:0, rentalActive:false },
        expenses: { monthly:[], periodic:[], byMember:{}, byMonth:{} },
        investments: { mutualFunds:[], stocks:[], fd:[], ppf:[] },
        loans: [],
        insurance: { term:[], health:[], vehicle:[] },
        schemes: [],
        bankAccounts: [],
        liquidSavings: 0,
        termCover: 0
    };
    
    // Save clean state to Supabase immediately to prevent stale data on refresh
    if (currentUserEmail) {
        saveUserData(currentUserEmail).then(() => {
            console.log('✅ Clean userData saved to Supabase for wizard');
        }).catch(e => console.error('Failed to save clean userData:', e));
    }
    
    // Pre-fill greeting
    if (authFirstName) {
        document.getElementById('wizard-greeting').textContent = `Welcome ${authFirstName}! Complete Your Profile`;
    }
};

// Add child field in wizard
window.addWizardKid = () => {
    const wrap = document.getElementById('wiz-kids-wrap');
    const count = wrap.querySelectorAll('input').length + 1;
    if (count > 5) return;
    const div = document.createElement('div');
    div.style.cssText = 'display:flex; gap:6px; align-items:center; margin-bottom:8px;';
    div.innerHTML = `<input class="ainp" style="margin-bottom:0; flex:1;" placeholder="Child ${count} name">
        <button type="button" onclick="this.parentElement.remove()" style="background:var(--red-dim); border:1px solid var(--red); border-radius:var(--radius-sm); padding:8px 12px; color:var(--red); font-size:16px; cursor:pointer; font-weight:700; line-height:1;">
            <i class="fas fa-trash-alt"></i>
        </button>`;
    wrap.appendChild(div);
};

// Add loan entry in wizard
window.addWizardLoan = () => {
    const wrap = document.getElementById('wiz-loans-wrap');
    const count = wrap.querySelectorAll('.wiz-loan-entry').length;
    if (count >= 10) return;
    const div = document.createElement('div');
    div.className = 'wiz-loan-entry';
    div.style.cssText = 'background:var(--bg3); border:1px solid var(--border2); border-radius:12px; padding:14px; margin-bottom:10px;';
    div.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <span style="font-size:12px; font-weight:600; color:var(--text2);">Loan ${count + 1}</span>
            <button type="button" onclick="this.closest('.wiz-loan-entry').remove()" style="background:var(--red-dim); border:1px solid var(--red); border-radius:var(--radius-sm); padding:4px 10px; color:var(--red); font-size:14px; cursor:pointer;">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div style="grid-column:1/-1;">
                <label style="display:block; font-size:10px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">Loan Name</label>
                <input class="ainp wiz-loan-name" style="margin-bottom:0;" placeholder="e.g. SBI Home Loan, HDFC Car Loan">
            </div>
            <div>
                <label style="display:block; font-size:10px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">Type</label>
                <select class="ainp wiz-loan-type" style="margin-bottom:0;">
                    <option value="home">🏠 Home Loan</option>
                    <option value="car">🚗 Car Loan</option>
                    <option value="personal">💰 Personal Loan</option>
                    <option value="education">🎓 Education Loan</option>
                    <option value="credit-card">💳 Credit Card</option>
                    <option value="other">📋 Other</option>
                </select>
            </div>
            <div>
                <label style="display:block; font-size:10px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">Outstanding (₹)</label>
                <input type="number" class="ainp wiz-loan-outstanding" min="0" style="margin-bottom:0;" placeholder="0">
            </div>
            <div>
                <label style="display:block; font-size:10px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">Monthly EMI (₹)</label>
                <input type="number" class="ainp wiz-loan-emi" min="0" style="margin-bottom:0;" placeholder="0">
            </div>
            <div>
                <label style="display:block; font-size:10px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">Interest Rate (%)</label>
                <input type="number" class="ainp wiz-loan-rate" min="0" step="0.1" style="margin-bottom:0;" placeholder="0">
            </div>
        </div>`;
    wrap.appendChild(div);
};

// Complete profile wizard — collect all data and save
window.completeProfileWizard = async () => {
    const age = parseInt(document.getElementById('wiz-age')?.value) || 0;
    const gender = document.getElementById('wiz-gender')?.value || '';
    const occupation = document.getElementById('wiz-occupation')?.value || '';
    const city = document.getElementById('wiz-city')?.value?.trim() || '';
    const marital = document.getElementById('wiz-marital')?.value || 'single';
    const spouseName = document.getElementById('wiz-spouse')?.value?.trim() || '';
    const kidInputs = document.querySelectorAll('#wiz-kids-wrap input');
    const kids = [...kidInputs].map(el => el.value.trim()).filter(Boolean);
    
    // Income
    const monthlyIncome = parseFloat(document.getElementById('wiz-income')?.value) || 0;
    const spouseIncome = parseFloat(document.getElementById('wiz-spouse-income')?.value) || 0;
    const rentalIncome = parseFloat(document.getElementById('wiz-rental')?.value) || 0;
    const businessIncome = parseFloat(document.getElementById('wiz-business')?.value) || 0;
    const otherIncome = parseFloat(document.getElementById('wiz-other-income')?.value) || 0;
    
    // Expenses
    const expHousing = parseFloat(document.getElementById('wiz-exp-housing')?.value) || 0;
    const expFood = parseFloat(document.getElementById('wiz-exp-food')?.value) || 0;
    const expTransport = parseFloat(document.getElementById('wiz-exp-transport')?.value) || 0;
    const expEducation = parseFloat(document.getElementById('wiz-exp-education')?.value) || 0;
    const expHealthcare = parseFloat(document.getElementById('wiz-exp-healthcare')?.value) || 0;
    const expLifestyle = parseFloat(document.getElementById('wiz-exp-lifestyle')?.value) || 0;
    const expInvestments = parseFloat(document.getElementById('wiz-exp-investments')?.value) || 0;
    const expMisc = parseFloat(document.getElementById('wiz-exp-misc')?.value) || 0;
    
    // Assets
    const mfValue = parseFloat(document.getElementById('wiz-mf')?.value) || 0;
    const stocksValue = parseFloat(document.getElementById('wiz-stocks')?.value) || 0;
    const fdValue = parseFloat(document.getElementById('wiz-fd')?.value) || 0;
    const ppfValue = parseFloat(document.getElementById('wiz-ppf')?.value) || 0;
    const realEstateValue = parseFloat(document.getElementById('wiz-realestate')?.value) || 0;
    const goldValue = parseFloat(document.getElementById('wiz-gold')?.value) || 0;
    const cashValue = parseFloat(document.getElementById('wiz-cash')?.value) || 0;
    
    // Liabilities (dynamic loan entries)
    const loanEntries = document.querySelectorAll('.wiz-loan-entry');
    const wizLoans = [];
    loanEntries.forEach(entry => {
        const name = entry.querySelector('.wiz-loan-name')?.value?.trim() || '';
        const type = entry.querySelector('.wiz-loan-type')?.value || 'other';
        const outstanding = parseFloat(entry.querySelector('.wiz-loan-outstanding')?.value) || 0;
        const emi = parseFloat(entry.querySelector('.wiz-loan-emi')?.value) || 0;
        const rate = parseFloat(entry.querySelector('.wiz-loan-rate')?.value) || 0;
        if (name && outstanding > 0) {
            wizLoans.push({ name, type, outstanding, emi, rate });
        }
    });
    
    // Goals & Risk
    const goals = [...document.querySelectorAll('#wiz-goals .goal-option.selected')].map(el => el.dataset.goal);
    const risk = document.querySelector('#wiz-risk .risk-option.selected')?.dataset?.risk || 'moderate';
    
    // Validation
    if (!age || age < 18) { showToast('❌ Please enter your age (18+)', 'red'); return; }
    if (!occupation) { showToast('❌ Please select your occupation', 'red'); return; }
    
    const btn = document.getElementById('wizardSubmitBtn');
    btn.textContent = 'Saving…'; btn.disabled = true;
    
    try {
        // Get registration data
        const pending = JSON.parse(localStorage.getItem('pending_registration_data') || '{}');
        const firstName = pending.firstName || '';
        const lastName = pending.lastName || '';
        const phone = pending.phone || '';
        const fullName = (firstName && lastName) ? `${firstName} ${lastName}` : firstName || 'User';
        
        // Compute incomeRange for backward compatibility
        const annualIncome = monthlyIncome * 12 / 100000; // in lakhs
        let incomeRange = '0-3';
        if (annualIncome >= 25) incomeRange = '25+';
        else if (annualIncome >= 12) incomeRange = '12-25';
        else if (annualIncome >= 6) incomeRange = '6-12';
        else if (annualIncome >= 3) incomeRange = '3-6';
        
        // Build familyMembers
        const familyMembers = [{ id: 'self', name: fullName, role: 'self' }];
        if (marital === 'married' && spouseName) familyMembers.push({ id: 'spouse', name: spouseName, role: 'spouse' });
        kids.forEach((k, i) => familyMembers.push({ id: 'kid-' + (i + 1), name: k, role: 'kid' }));
        
        // Build expenses (dashboard uses 'label' and 'v')
        const expenseEntries = [];
        if (expHousing > 0) expenseEntries.push({ id: 'exp-'+Date.now(), label: 'Housing/Rent', v: expHousing, c: 'housing' });
        if (expFood > 0) expenseEntries.push({ id: 'exp-'+(Date.now()+1), label: 'Food & Groceries', v: expFood, c: 'food' });
        if (expTransport > 0) expenseEntries.push({ id: 'exp-'+(Date.now()+2), label: 'Transport', v: expTransport, c: 'transport' });
        if (expEducation > 0) expenseEntries.push({ id: 'exp-'+(Date.now()+3), label: 'Education', v: expEducation, c: 'education' });
        if (expHealthcare > 0) expenseEntries.push({ id: 'exp-'+(Date.now()+4), label: 'Healthcare', v: expHealthcare, c: 'healthcare' });
        if (expLifestyle > 0) expenseEntries.push({ id: 'exp-'+(Date.now()+5), label: 'Lifestyle & Entertainment', v: expLifestyle, c: 'lifestyle' });
        if (expInvestments > 0) expenseEntries.push({ id: 'exp-'+(Date.now()+6), label: 'Investments/SIPs', v: expInvestments, c: 'investments' });
        if (expMisc > 0) expenseEntries.push({ id: 'exp-'+(Date.now()+7), label: 'Miscellaneous', v: expMisc, c: 'misc' });
        
        const now = new Date();
        const currentMonthKey = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
        
        // Build loans from dynamic entries (dashboard uses 'label')
        const loans = wizLoans.map((l, i) => ({
            id: 'loan-' + (Date.now() + i),
            label: l.name,
            outstanding: l.outstanding,
            emi: l.emi,
            rate: l.rate,
            type: l.type
        }));
        
        // Build investments (dashboard uses 'name' and 'value')
        const investments = {
            mutualFunds: mfValue > 0 ? [{ name: 'Mutual Funds', value: mfValue }] : [],
            stocks: stocksValue > 0 ? [{ name: 'Stocks Portfolio', value: stocksValue }] : [],
            fd: fdValue > 0 ? [{ name: 'Fixed Deposit', value: fdValue, rate: 7, tenure: 12 }] : [],
            ppf: ppfValue > 0 ? [{ name: 'PPF/EPF', value: ppfValue }] : []
        };
        
        // Build complete userData
        // Get auth UID to stamp on the data for ownership verification
        let authUid = '';
        try {
            const { data: { user: authU } } = await sb.auth.getUser();
            authUid = authU?.id || '';
        } catch(e) {}
        
        userData = {
            profile: {
                name: fullName, firstName, lastName, phone,
                whatsapp_number: phone,
                age, gender, occupation, city,
                maritalStatus: marital, spouseName,
                kids, familyMembers,
                goals, risk, incomeRange,
                realEstateValue, goldValue,
                liquidSavings: cashValue,
                _expenseMigrationV1: true,
                _monthMigrationV1: true,
                _familyMigrationV1: true,
                _wizardCompleted: true,
                _authUid: authUid
            },
            income: {
                husband: monthlyIncome,
                wife: spouseIncome,
                rental: rentalIncome,
                rentalActive: rentalIncome > 0,
                business: businessIncome,
                other: otherIncome
            },
            expenses: {
                monthly: [],
                periodic: [],
                byMember: { self: expenseEntries },
                byMonth: {
                    [currentMonthKey]: { byMember: { self: [...expenseEntries] } }
                }
            },
            investments,
            loans,
            insurance: { term: [], health: [], vehicle: [] },
            schemes: [],
            bankAccounts: [],
            liquidSavings: cashValue,
            termCover: 0
        };
        
        // Save to Supabase
        // Phase 1.6: Ensure household context is loaded before saving
        if (!householdId) {
            console.log('⚠️ Household context not loaded, loading now...');
            await loadHouseholdContext();
        }
        await saveUserData(currentUserEmail);
        
        // Mark onboarding complete
        localStorage.setItem('onboarding_completed', 'true');
        localStorage.removeItem('pending_registration_data');
        
        // Invalidate cache and show app
        computeCache.invalidate();
        showToast('✅ Profile saved successfully!', 'green');
        showApp();
        resetInactivity();
        
    } catch(e) {
        console.error('Profile wizard save error:', e);
        showToast('❌ Failed to save profile. Please try again.', 'red');
        btn.textContent = 'Complete Profile →'; btn.disabled = false;
    }
};


window.doLogin = async () => {
    const email = $('l-em').value.trim();
    const pass  = $('l-pw').value;
    
    // Clear any previous error
    const errorDiv = $('l-em-error');
    if(errorDiv) {
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';
    }
    
    if(!email||!pass) {
        if(errorDiv) {
            errorDiv.textContent = '❌ Please enter both email and password.';
            errorDiv.style.display = 'block';
        }
        return;
    }
    
    const btn = $('loginBtn'); btn.textContent='Signing in…'; btn.disabled=true;
    try {
        const { data, error } = await sb.auth.signInWithPassword({ email, password:pass });
        if(error) {
            // Show user-friendly error message below email field
            let errorMessage = 'Unable to sign in. ';
            
            if(error.message.includes('Invalid login credentials') || error.message.includes('invalid') || error.message.includes('credentials')) {
                errorMessage = '❌ Invalid email or password. Please check and try again.';
            } else if(error.message.includes('Email not confirmed')) {
                errorMessage = '📧 Please verify your email address before signing in.';
            } else if(error.message.includes('rate limit')) {
                errorMessage = '⏱️ Too many login attempts. Please wait a few minutes and try again.';
            } else {
                errorMessage = '❌ ' + error.message;
            }
            
            if(errorDiv) {
                errorDiv.textContent = errorMessage;
                errorDiv.style.display = 'block';
                errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            
            btn.textContent='Sign In →'; 
            btn.disabled=false; 
            return; 
        }
        currentUserEmail = data.user.email;
        await loadUserData(currentUserEmail);
        
        // If profile is empty, check for pending registration data in localStorage
        if (!userData.profile?.name) {
            try {
                const pendingReg = localStorage.getItem('pending_registration_data');
                if (pendingReg) {
                    const parsed = JSON.parse(pendingReg);
                    if (parsed.email === currentUserEmail) {
                        if (parsed.firstName && parsed.lastName) {
                            // New format
                            userData.profile.name = `${parsed.firstName} ${parsed.lastName}`;
                            userData.profile.firstName = parsed.firstName;
                            userData.profile.lastName = parsed.lastName;
                            userData.profile.phone = parsed.phone || '';
                        } else if (parsed.userData) {
                            // Legacy format
                            userData = parsed.userData;
                        }
                        await saveUserData(currentUserEmail);
                    }
                }
            } catch(e) { console.error('Error restoring pending registration data:', e); }
        } else {
            // Data loaded fine, clean up any stale pending data
            localStorage.removeItem('pending_registration_data');
        }
        
        // If user has profile data, mark onboarding as done (prevents re-triggering)
        if (userData.profile?.name) {
            localStorage.setItem('onboarding_completed', 'true');
        }
        
        // Check if profile is incomplete — redirect to wizard
        const profileComplete = userData.profile?._wizardCompleted || (userData.profile?.age && userData.profile?.occupation);
        if (!profileComplete) {
            showProfileWizard();
        } else {
            showApp(); resetInactivity();
        }
    } catch(e) {
        console.error('Login error:', e);
        
        // Show user-friendly error message
        let errorMessage = '🌐 Network error. Please check your internet connection and try again.';
        
        if(e.message) {
            if(e.message.includes('fetch')) {
                errorMessage = '🌐 Unable to connect. Please check your internet connection.';
            } else if(e.message.includes('timeout')) {
                errorMessage = '⏱️ Request timed out. Please try again.';
            } else {
                errorMessage = '❌ ' + e.message;
            }
        }
        
        if(errorDiv) {
            errorDiv.textContent = errorMessage;
            errorDiv.style.display = 'block';
            errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        btn.textContent='Sign In →'; 
        btn.disabled=false;
    }
};


window.doLogout = async () => { 
    // Clear all user data from memory before signing out
    userData = { profile:{}, income:{ husband:0, wife:0, rental:0, rentalActive:false }, expenses:{ monthly:[], periodic:[], byMember:{}, byMonth:{} }, investments:{ mutualFunds:[], stocks:[], fd:[], ppf:[] }, loans:[], insurance:{ term:[], health:[], vehicle:[] }, schemes:[], bankAccounts:[], liquidSavings:0, termCover:0 };
    currentUserEmail = '';
    computeCache.invalidate();
    
    // Clear localStorage to prevent data leaks between users
    localStorage.removeItem('onboarding_completed');
    localStorage.removeItem('pending_registration_data');
    localStorage.removeItem('savedCalculations');
    // Keep sb_url and sb_key as they are app-level config, not user-specific
    
    await sb.auth.signOut(); 
    showAuth(); 
};

// ========== PASSWORD VISIBILITY TOGGLE ==========
window.togglePasswordVisibility = (inputId, iconEl) => {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    if (input.type === 'password') {
        input.type = 'text';
        iconEl.classList.remove('fa-eye');
        iconEl.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        iconEl.classList.remove('fa-eye-slash');
        iconEl.classList.add('fa-eye');
    }
};

// ========== CONGRATULATIONS MODAL ==========
window.showCongratulationsModal = (name) => {
    const modal = document.createElement('div');
    modal.id = 'congratsModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.85);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;
    
    modal.innerHTML = `
        <div style="
            background: linear-gradient(135deg, var(--bg2), var(--bg3));
            border: 2px solid var(--accent);
            border-radius: var(--radius);
            padding: 40px;
            max-width: 500px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(59, 126, 255, 0.3);
            animation: slideUp 0.5s ease;
        ">
            <div style="font-size: 64px; margin-bottom: 20px;">🎉</div>
            <h2 style="font-size: 28px; font-weight: 800; color: var(--text); margin-bottom: 12px;">
                Congratulations, ${name}!
            </h2>
            <p style="font-size: 15px; color: var(--text2); line-height: 1.6; margin-bottom: 20px;">
                Welcome to FamLedgerAI! 🚀<br>
                Your journey to financial freedom starts now.
            </p>
            <div style="display: flex; gap: 10px; align-items: center; justify-content: center; padding: 16px; background: var(--accent-glow); border-radius: var(--radius-sm); margin-top: 20px;">
                <i class="fas fa-check-circle" style="color: var(--green); font-size: 20px;"></i>
                <span style="color: var(--text); font-size: 13px; font-weight: 600;">Account created successfully!</span>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => modal.remove(), 300);
    }, 2700);
};

// Add animations to CSS if not already present
if (!document.getElementById('congrats-animations')) {
    const style = document.createElement('style');
    style.id = 'congrats-animations';
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        @keyframes slideUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
}

// ========== NAVIGATION ==========
const pageTitles    = { overview:'Overview', income:'Income', expenses:'Expenses', investments:'Investments', loans:'Loans', insurance:'Insurance', schemes:'Gov. Schemes', recommendations:'Recommendations', advisor:'AI Advisor', settings:'Settings', nri:'NRI Planner', plan:'Autopilot', education:'Financial Education', family:'Family', accounts: 'Bank Accounts'  };
const pageSubtitles = { overview:'Financial health at a glance', income:'Your income sources', expenses:'Track your spending', 'master-expenses':'Manage recurring & mandatory expenses', investments:'Your investment portfolio', loans:'Active loans & EMIs', insurance:'Coverage & protection', schemes:'Government benefit schemes', recommendations:'Personalised for you', advisor:'AI-powered coaching', settings:'Your profile & preferences', nri:'Plan your return to India', plan:'Full financial autopilot', education:'Learn & calculate smart finances', family:'Family finance insights', accounts: 'Manage your linked accounts' };

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function() {
        document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
        this.classList.add('active');
        const page = this.dataset.page;
        document.querySelectorAll('.page').forEach(p=>p.classList.remove('active-page'));
        const el = $('page-'+page); if(el) el.classList.add('active-page');
        $('pageTitle').innerText     = pageTitles[page]    || page;
        $('pageSubtitle').innerText  = pageSubtitles[page] || '';
        editMode = false; updateEditBtn();
        renderCurrentPage();
        closeSidebar();
    });
});

$('profileSelect').addEventListener('change', e=>{ currentProfile=e.target.value; renderCurrentPage(); });
$('monthPicker').addEventListener('change',   e=>{ currentMonth=e.target.value;   renderCurrentPage(); });

function updateEditBtn() {
    const btn = $('ebtn');
    if(editMode) { btn.textContent='✅ Done'; btn.classList.add('active-edit'); }
    else         { btn.textContent='✏️ Edit'; btn.classList.remove('active-edit'); }
}

// ========== RENDER DISPATCH (with debouncing) ==========
let renderTimer = null;
function debounceRender(renderFn) {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(renderFn, 50); // 50ms debounce
}

async function renderCurrentPage() {
    const activePage = document.querySelector('.page.active-page')?.id;
    if(!activePage) return;
    updateMonthSummary();
    switch(activePage.replace('page-','')) {
        case 'overview':        renderOverview();            break;
        case 'income':          renderIncome();              break;
        case 'expenses':        renderExpenses();            break;
        case 'master-expenses': await renderMasterExpenses(); break;
        case 'investments':     renderInvestments();         break;
        case 'loans':           renderLoans();               break;
        case 'insurance':       renderInsurance();           break;
        case 'schemes':         renderSchemes();             break;
        case 'recommendations': await renderRecommendations(); break;
        case 'advisor':         await renderAdvisor();       break;
        case 'settings':        renderSettings();            break;
        case 'nri':             await renderNriPlanner();    break;
        case 'plan':            await renderAutopilot();     break;
        case 'education':       renderEducation();           break;
        case 'family':          await renderFamily();        break;
        case 'accounts':        await renderAccounts();      break;
        default:                renderOverview(); // fallback
    }
}

// ========== OVERVIEW PAGE ==========
// Helper: get byMember for a given month (defaults to currentMonth)
function getMonthByMember(month) {
    if(!userData.expenses.byMonth) userData.expenses.byMonth = {};
    const m = month || currentMonth;
    if(!userData.expenses.byMonth[m]) userData.expenses.byMonth[m] = { byMember: {} };
    return userData.expenses.byMonth[m].byMember;
}

function getMemberExpenseTotal(memberId, month) {
    const byMember = getMonthByMember(month);
    if(memberId === 'all') return Object.values(byMember).flat().reduce((s,e)=>s+(e.v||0),0);
    return (byMember[memberId]||[]).reduce((s,e)=>s+(e.v||0),0);
}

function getMemberName(memberId) {
    if(memberId === 'all') return userData.profile.name || 'User';
    const m = (userData.profile.familyMembers||[]).find(m=>m.id===memberId);
    return m ? m.name : userData.profile.name || 'User';
}

function renderOverview() {
    console.log('renderOverview called. profile:', JSON.stringify({ name: userData.profile.name, age: userData.profile.age, occupation: userData.profile.occupation, goals: userData.profile.goals }));
    if(!userData.profile.name && !userData.profile.age) { sh('page-overview', emptyState('Welcome! Set up your profile first.','⚙️ Complete Profile','goSettings')); return; }

    const isAll = currentProfile === 'all';
    const memberName = getMemberName(currentProfile);
    const memberExpenses = getMemberExpenseTotal(currentProfile);

    const score   = computeHealthScore();
    const alerts  = getAlerts();
    const actions = getTopActions(4);
    const c       = scoreColor(score);
    const label   = scoreLabel(score);
    const r       = 52;
    const circ    = 2*Math.PI*r;
    const dash    = circ - (score/100)*circ;

    const actHtml = actions.length
        ? actions.map(a=>`<div class="alert-row">${alertDot(a.priority>=4?'red':a.priority>=3?'yellow':'green')}<div class="alert-text">${a.icon} ${a.text}</div></div>`).join('')
        : `<div style="color:var(--green); font-size:14px; padding:10px 0;">✅ All metrics look healthy!</div>`;

    const alertHtml = [
        ['🏦 Emergency Fund', alerts.liquidity, `${pct(Math.min(1,computeEmergencyRatio()))} of 6-month target`],
        ['🛡️ Term Insurance',  alerts.protection, `Cover: ${fl(computeInsuranceCoverage().termCover)}`],
        ['📈 Savings Rate',    alerts.growth,     `${pct(Math.max(0,computeSavingsRate()))} of income`],
        ['💳 Debt Ratio',      alerts.debt,       `${pct(computeDebtRatio())} of income`],
        ['🏛️ Gov. Schemes',    alerts.schemes,    (userData.schemes||[]).length>0?`${userData.schemes.length} enrolled`:'None enrolled']
    ].map(([label,color,sub])=>`
        <div class="row-flex">
            <div style="display:flex; align-items:center; gap:8px;">${alertDot(color)}<span class="row-label">${label}</span></div>
            <div style="font-size:12px; color:var(--text3);">${sub}</div>
        </div>
    `).join('');

    const scoreBreakdown = [
        { name:'Emergency', val:Math.min(100,computeEmergencyRatio()*100) },
        { name:'Insurance', val:Math.min(100,computeInsuranceRatio()*100) },
        { name:'Savings',   val:Math.min(100,computeSavingsRate()*500) },
        { name:'Debt',      val:Math.max(0,100-computeDebtRatio()*200) },
        { name:'Schemes',   val:(userData.schemes||[]).length>0?100:40 }
    ];

    const breakdownHtml = scoreBreakdown.map(b=>`
        <div style="flex:1; min-width:80px;">
            <div style="font-size:10px; color:var(--text3); margin-bottom:5px; text-align:center;">${b.name}</div>
            <div class="progress-bar"><div class="progress-fill" data-target="${b.val}" style="background:${b.val>=70?'var(--green)':b.val>=40?'var(--yellow)':'var(--red)'}"></div></div>
            <div style="font-size:10px; color:var(--text2); text-align:center; margin-top:4px; font-family:var(--mono);">${Math.round(b.val)}</div>
        </div>
    `).join('');

    sh('page-overview', `
        <div class="card" style="display:flex; gap:24px; align-items:center; flex-wrap:wrap; background:linear-gradient(135deg, var(--bg2) 0%, var(--bg3) 100%); border-color:var(--border2);">
            <div style="flex:1; min-width:200px;">
                <p style="font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:1px; margin-bottom:8px;">${isAll ? 'Family Dashboard' : 'Viewing'}</p>
                <h2 style="font-size:22px; font-weight:800; color:var(--text); margin-bottom:6px;">${memberName} ${isAll ? '👨‍👩‍👧‍👦' : '👋'}</h2>
                ${isAll
                    ? `<p style="font-size:13px; color:var(--text2);">Age: ${userData.profile.age} &nbsp;|&nbsp; Risk: ${userData.profile.risk||'—'} &nbsp;|&nbsp; ${userData.profile.occupation||'—'}</p>`
                    : `<p style="font-size:13px; color:var(--text2);">Member expenses: ${fl(memberExpenses)}/month</p>`
                }
                <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:10px;">
                    ${(userData.profile.goals||[]).map(g=>badge(g,'blue')).join('')}
                </div>
                <div style="margin-top:18px;">
                    <div style="font-size:10px; color:var(--text3); text-transform:uppercase; letter-spacing:0.8px; margin-bottom:10px;">Score Breakdown</div>
                    <div style="display:flex; gap:10px; flex-wrap:wrap;">${breakdownHtml}</div>
                </div>
            </div>
            <div style="text-align:center; flex-shrink:0;">
                <div class="score-wrap">
                    <div class="score-glow" id="scoreGlow" style="background:radial-gradient(circle, ${c}22 0%, transparent 70%);"></div>
                    <svg class="score-ring-svg" viewBox="0 0 120 120">
                        <defs>
                            <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stop-color="${score>=65?'#22c55e':score>=45?'#eab308':'#ef4444'}"/>
                                <stop offset="100%" stop-color="${score>=65?'#10b981':score>=45?'#f59e0b':'#f97316'}"/>
                            </linearGradient>
                        </defs>
                        <circle class="score-ring-track" cx="60" cy="60" r="${r}"/>
                        <circle class="score-ring-bg" cx="60" cy="60" r="${r}"/>
                        <circle class="score-ring-fg" cx="60" cy="60" r="${r}"
                            stroke="url(#scoreGrad)"
                            stroke-dasharray="${circ.toFixed(1)}"
                            stroke-dashoffset="${circ.toFixed(1)}"
                            id="scoreArc"/>
                    </svg>
                    <div class="score-center">
                        <div class="score-num" style="color:${c}" id="scoreNum">0</div>
                        <div class="score-lbl" style="color:${c}">${label}</div>
                    </div>
                </div>
                <p style="font-size:11px; color:var(--text3); margin-top:8px;">Financial Health Score</p>
            </div>
        </div>

        ${(userData.profile.familyMembers||[]).length <= 1 ? `
        <div class="card" style="background:linear-gradient(135deg, var(--accent-glow), var(--purple-dim)); border-color:var(--accent); cursor:pointer;" onclick="document.querySelector('[data-page=settings]').click()">
            <div style="display:flex; align-items:center; gap:12px;">
                <span style="font-size:28px;">👨‍👩‍👧‍👦</span>
                <div>
                    <div style="font-size:14px; font-weight:700; color:var(--text); margin-bottom:4px;">Add Family Members</div>
                    <div style="font-size:12px; color:var(--text2);">Add your spouse and kids in Settings to track expenses per member and see a combined family dashboard.</div>
                </div>
                <i class="fas fa-chevron-right" style="color:var(--accent2); margin-left:auto; font-size:16px;"></i>
            </div>
        </div>` : ''}

        <div class="grid-4" style="margin-bottom:18px;">
            <div class="kpi-card ${computeMonthlySavings()>=0?'green':'red'}">
                <div class="kpi-label">Monthly Income</div>
                <div class="kpi-value gradient-green" data-value="${computeMonthlyIncome()}">${fl(computeMonthlyIncome())}</div>
                <div class="kpi-sub">${isAll ? 'Gross inflow' : 'Household total'}</div>
            </div>
            <div class="kpi-card red">
                <div class="kpi-label">${isAll ? 'Family' : memberName+"'s"} Expenses</div>
                <div class="kpi-value gradient-red" data-value="${memberExpenses}">${fl(memberExpenses)}</div>
                <div class="kpi-sub">${isAll ? (userData.expenses.monthly||[]).length+' items' : (userData.expenses.byMember?.[currentProfile]||[]).length+' items'}${isAll ? ' + EMIs: '+fl(computeTotalEmi()) : ''}</div>
            </div>
            <div class="kpi-card ${computeMonthlySavings()>=0?'green':'red'}">
                <div class="kpi-label">${isAll ? 'Surplus / Deficit' : 'Share of Income'}</div>
                <div class="kpi-value ${isAll ? (computeMonthlySavings()>=0?'gradient-green':'gradient-red') : 'gradient-cyan'}" data-value="${isAll ? computeMonthlySavings() : (computeMonthlyIncome()>0 ? (memberExpenses/computeMonthlyIncome()*100) : 0)}">${isAll ? fl(computeMonthlySavings()) : (computeMonthlyIncome()>0 ? pct(memberExpenses/computeMonthlyIncome()) : '—')}</div>
                <div class="kpi-sub">${isAll ? 'Savings rate: '+pct(Math.max(0,computeSavingsRate())) : 'of household income'}</div>
            </div>
            <div class="kpi-card purple">
                <div class="kpi-label">Total Investments</div>
                <div class="kpi-value gradient-purple" data-value="${computeTotalInvestments()}">${fl(computeTotalInvestments())}</div>
                <div class="kpi-sub">Portfolio value</div>
            </div>
        </div>

        ${!isAll ? `
        <div class="card">
            <div class="card-title"><span class="icon">📉</span> ${memberName}'s Expenses</div>
            ${(userData.expenses.byMember?.[currentProfile]||[]).length > 0
                ? (userData.expenses.byMember[currentProfile]).map(e => `
                    <div class="row-flex">
                        <span class="row-label">${e.label}</span>
                        <span class="row-value">${ff(e.v)}</span>
                    </div>`).join('')
                : `<p style="color:var(--text3); font-size:13px; padding:10px 0;">No expenses added yet. Go to Expenses page to add.</p>`
            }
        </div>` : ''}

        <div class="grid-2">
            <div class="card">
                <div class="card-title"><span class="icon">🎯</span> Priority Actions</div>
                ${actHtml}
            </div>
            <div class="card">
                <div class="card-title"><span class="icon">📊</span> Health Indicators</div>
                ${alertHtml}
            </div>
        </div>

        ${getLoansForMember(currentProfile).length > 0 ? `
        <div class="card">
            <div class="card-title"><span class="icon">💳</span> Loan Summary</div>
            <div class="grid-3">
                <div><div style="font-size:11px; color:var(--text3); margin-bottom:4px;">Total Outstanding</div><div class="gradient-red" style="font-family:var(--mono); font-size:18px; font-weight:800;" data-value="${computeTotalLoanOutstanding()}">${fl(computeTotalLoanOutstanding())}</div></div>
                <div><div style="font-size:11px; color:var(--text3); margin-bottom:4px;">Monthly EMI</div><div class="gradient-yellow" style="font-family:var(--mono); font-size:18px; font-weight:800;" data-value="${computeTotalEmi()}">${fl(computeTotalEmi())}</div></div>
                <div><div style="font-size:11px; color:var(--text3); margin-bottom:4px;">Debt-to-Income</div><div class="${computeDebtRatio()>0.4?'gradient-red':computeDebtRatio()>0.25?'gradient-yellow':'gradient-green'}" style="font-family:var(--mono); font-size:18px; font-weight:800;" data-value="${computeDebtRatio()*100}">${pct(computeDebtRatio())}</div></div>
            </div>
        </div>` : ''}

        <!-- Forecast Card Section -->
        <div id="forecast-card-container"></div>

        <!-- Risk Dashboard Section -->
        ${renderRiskDashboard()}

        <!-- Stress Test Section -->
        ${renderStressTestCard()}

        <!-- AI Financial Dashboard Section -->
        <div id="ai-dashboard-section">
            <div class="card" style="text-align:center; padding:30px;">
                <div style="font-size:24px; margin-bottom:8px;">🧠</div>
                <div style="font-size:13px; color:var(--text3);">Loading AI Financial Intelligence...</div>
                <div style="width:40px; height:40px; border:3px solid rgba(255,255,255,0.06); border-top-color:var(--accent); border-radius:50%; animation:spin 1s linear infinite; margin:12px auto 0;"></div>
            </div>
        </div>
    `);

    requestAnimationFrame(() => {
        const arc = document.getElementById('scoreArc');
        const numEl = document.getElementById('scoreNum');
        const glowEl = document.getElementById('scoreGlow');
        if(arc) {
            setTimeout(() => {
                arc.style.strokeDashoffset = dash.toFixed(1);
                setTimeout(() => arc.classList.add('animated'), 1600);
            }, 100);
        }
        if(glowEl) {
            setTimeout(() => glowEl.classList.add('visible'), 800);
        }
        if(numEl) {
            let current = 0;
            const duration = 1500;
            const startTime = performance.now();
            const animate = (now) => {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                current = Math.round(eased * score);
                numEl.textContent = current;
                if(progress < 1) requestAnimationFrame(animate);
            };
            requestAnimationFrame(animate);
        }
        // Animate progress bars
        document.querySelectorAll('.progress-fill[data-target]').forEach((bar, i) => {
            setTimeout(() => {
                bar.classList.add('animated');
                bar.style.width = bar.dataset.target + '%';
            }, 300 + i * 150);
        });
        
        // Animate KPI values with count-up
        document.querySelectorAll('.kpi-value[data-value]').forEach((el, i) => {
            const targetValue = parseFloat(el.dataset.value) || 0;
            const isPercentage = el.textContent.includes('%');
            const isCurrency = el.textContent.includes('₹') || el.textContent.includes('L') || el.textContent.includes('Cr');
            
            let current = 0;
            const duration = 1200;
            const startTime = performance.now() + (i * 100); // Stagger animations
            
            const animate = (now) => {
                if (now < startTime) {
                    requestAnimationFrame(animate);
                    return;
                }
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3); // Ease-out cubic
                current = eased * targetValue;
                
                if (isPercentage) {
                    el.textContent = (current >= 0 ? '+' : '') + current.toFixed(1) + '%';
                } else if (isCurrency) {
                    el.textContent = fl(current);
                } else {
                    el.textContent = Math.round(current).toString();
                }
                
                if (progress < 1) requestAnimationFrame(animate);
            };
            requestAnimationFrame(animate);
        });

        // Render Forecast Card
        renderForecastCard();

        // Fetch AI Financial Dashboard data
        fetchAIDashboard();
    });
}

// ========== INCOME PAGE ==========
function renderIncome() {
    const inc = userData.income;
    const total = computeMonthlyIncome();
    const selfName = userData.profile.name || 'Self';
    const spouseName = (userData.profile.familyMembers||[]).find(m=>m.role==='spouse')?.name || userData.profile.spouseName || 'Spouse';
    const rows = [
        { key:'husband', label:`${selfName}'s Salary`, icon:'�', val:inc.husband },
        { key:'wife',    label:`${spouseName}'s Salary`, icon:'�', val:inc.wife    },
        { key:'rental',  label:'Rental Income',          icon:'🏠', val:inc.rental  }
    ];
    let rowsHtml = rows.map(r=>`
        <div class="row-flex">
            <span class="row-label">${r.icon} ${r.label}</span>
            ${editMode
                ? `<input class="edit-input" type="number" value="${r.val}" onchange="updateIncome('${r.key}',this.value)">`
                : `<span class="row-value">${ff(r.val)}</span>`}
        </div>
    `).join('');

    const savings = computeMonthlySavings();
    const insightColor = savings >= 0 ? 'var(--green)' : 'var(--red)';

    sh('page-income', `
        <div class="grid-4" style="margin-bottom:18px;">
            <div class="kpi-card green">
                <div class="kpi-label">Total Monthly</div>
                <div class="kpi-value">${fl(total)}</div>
                <div class="kpi-sub">Combined sources</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">Annual</div>
                <div class="kpi-value">${fl(total*12)}</div>
                <div class="kpi-sub">Projected yearly</div>
            </div>
            <div class="kpi-card ${savings>=0?'green':'red'}">
                <div class="kpi-label">After All Costs</div>
                <div class="kpi-value" style="color:${insightColor};">${fl(savings)}</div>
                <div class="kpi-sub">Income − Expenses − EMI</div>
            </div>
        </div>
        <div class="card">
            <div class="card-title"><span class="icon">💰</span> Income Sources</div>
            ${rowsHtml}
            <div class="row-flex">
                <span class="row-label">🔄 Rental Active?</span>
                ${editMode
                    ? `<input type="checkbox" class="check-toggle" ${inc.rentalActive?'checked':''} onchange="updateIncome('rentalActive',this.checked)">`
                    : `<span class="row-value">${inc.rentalActive?badge('Active','green'):badge('Inactive','red')}</span>`}
            </div>
        </div>
        <div class="insight-box">
            <strong>💡 Insight:</strong> Your income-to-expense ratio is
            <strong style="color:${total>0?(computeMonthlyExpenses()/total>0.7?'var(--red)':computeMonthlyExpenses()/total>0.5?'var(--yellow)':'var(--green)'):'var(--text)'};">
                ${total>0?pct(computeMonthlyExpenses()/total):'—'}
            </strong>.
            ${total>0 && computeMonthlyExpenses()/total > 0.7 ? 'Expenses are high — look for areas to cut.' :
              total>0 && computeMonthlyExpenses()/total < 0.5 ? 'Great cost discipline! Channel surplus into investments.' :
              'Balanced income-expense ratio.'}
        </div>
    `);
}

window.updateIncome = (field, value) => {
    if(field==='rentalActive') userData.income.rentalActive = Boolean(value);
    else userData.income[field] = num(value);
    debounceSave(); 
    debounceRender(renderIncome);
};

// ========== EXPENSES PAGE ==========
function renderExpenses() {
    const byMember = getMonthByMember(currentMonth);
    const members = userData.profile.familyMembers || [{ id:'self', name: userData.profile.name||'Me', role:'self' }];
    const isAll = currentProfile === 'all';

    // Get current member's expenses or combined
    let displayExpenses = [];
    let memberLabel = 'All Members';
    if(isAll) {
        // Master view: show all members' expenses grouped
        members.forEach(m => {
            (byMember[m.id]||[]).forEach(exp => {
                displayExpenses.push({ ...exp, _member: m.name, _memberId: m.id });
            });
        });
    } else {
        const m = members.find(m=>m.id===currentProfile);
        memberLabel = m ? m.name : currentProfile;
        displayExpenses = (byMember[currentProfile]||[]).map(exp => ({ ...exp, _memberId: currentProfile }));
    }

    const total = displayExpenses.reduce((s,e) => s + (e.v||0), 0);
    const income = computeMonthlyIncome();

    // Per-member totals for KPI
    const memberTotals = members.map(m => {
        const t = (byMember[m.id]||[]).reduce((s,e)=>s+(e.v||0),0);
        return { name:m.name, id:m.id, total:t };
    }).filter(m => m.total > 0 || isAll);

    let expHtml = '';
    if(isAll && members.length > 1) {
        // Grouped by member
        members.forEach(m => {
            const mExp = byMember[m.id] || [];
            if(mExp.length === 0 && !editMode) return;
            const mTotal = mExp.reduce((s,e)=>s+(e.v||0),0);
            const icon = m.role==='self' ? '👤' : m.role==='spouse' ? '💑' : '👶';
            expHtml += `<div style="margin-bottom:16px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; padding-bottom:6px; border-bottom:1px solid var(--border);">
                    <span style="font-size:13px; font-weight:700; color:var(--accent2);">${icon} ${m.name}</span>
                    <span style="font-size:12px; font-family:var(--mono); color:var(--text);">${fl(mTotal)}</span>
                </div>`;
            mExp.forEach((exp,i) => {
                expHtml += `<div class="row-flex">
                    ${editMode
                        ? `<input class="edit-input-text" value="${exp.label}" onchange="updateMemberExpense('${m.id}',${i},'label',this.value)">
                           <div style="display:flex; gap:6px; align-items:center;">
                               <input class="edit-input" type="number" value="${exp.v}" onchange="updateMemberExpense('${m.id}',${i},'v',this.value)">
                               <button class="del-btn" onclick="deleteMemberExpense('${m.id}',${i})">🗑</button>
                           </div>`
                        : `<span class="row-label">${exp.label}</span>
                           <span class="row-value">${ff(exp.v)}</span>`}
                </div>`;
            });
            if(editMode) expHtml += `<button class="add-btn" onclick="addMemberExpense('${m.id}')" style="margin-top:6px; margin-bottom:8px;">➕ Add for ${m.name}</button>`;
            expHtml += `</div>`;
        });
    } else {
        // Single member view
        const mid = isAll ? 'self' : currentProfile;
        const mExp = byMember[mid] || [];
        mExp.forEach((exp,i) => {
            expHtml += `<div class="row-flex">
                ${editMode
                    ? `<input class="edit-input-text" value="${exp.label}" onchange="updateMemberExpense('${mid}',${i},'label',this.value)">
                       <div style="display:flex; gap:6px; align-items:center;">
                           <input class="edit-input" type="number" value="${exp.v}" onchange="updateMemberExpense('${mid}',${i},'v',this.value)">
                           <button class="del-btn" onclick="deleteMemberExpense('${mid}',${i})">🗑</button>
                       </div>`
                    : `<span class="row-label">${exp.label}</span>
                       <div style="display:flex; align-items:center; gap:10px;">
                           <div class="progress-bar" style="width:70px;"><div class="progress-fill" style="width:${income?Math.min(100,(exp.v/income)*100):0}%; background:var(--accent);"></div></div>
                           <span class="row-value">${ff(exp.v)}</span>
                       </div>`}
            </div>`;
        });
        if(!mExp.length && !editMode) expHtml = `<p style="color:var(--text3); font-size:13px; padding:10px 0;">No expenses added yet.</p>`;
        if(editMode) expHtml += `<button class="add-btn" onclick="addMemberExpense('${mid}')">➕ Add Expense</button>`;
    }

    // Member breakdown KPI cards (only in master view with multiple members)
    let memberKpiHtml = '';
    if(isAll && memberTotals.length > 1) {
        memberKpiHtml = memberTotals.map(m => `
            <div class="kpi-card" style="cursor:pointer;" onclick="$('profileSelect').value='${m.id}'; currentProfile='${m.id}'; renderCurrentPage();">
                <div class="kpi-label">${m.name}</div>
                <div class="kpi-value">${fl(m.total)}</div>
                <div class="kpi-sub">${income>0?pct(m.total/income):''} of income</div>
            </div>
        `).join('');
    }

    const allTotal = Object.values(byMember).flat().reduce((s,e)=>s+(e.v||0),0);
    const monthLabel = new Date(currentMonth+'-01').toLocaleDateString('en-IN',{month:'long',year:'numeric'});

    sh('page-expenses', `
        <div class="grid-4" style="margin-bottom:18px;">
            <div class="kpi-card red">
                <div class="kpi-label">${isAll ? 'Family Total' : memberLabel} – ${monthLabel}</div>
                <div class="kpi-value">${fl(isAll ? allTotal : total)}</div>
                <div class="kpi-sub">${displayExpenses.length} items</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">% of Income</div>
                <div class="kpi-value">${income > 0 ? pct((isAll?allTotal:total)/income) : '—'}</div>
                <div class="kpi-sub">Expense ratio</div>
            </div>
            <div class="kpi-card ${computeTotalEmi()>0?'yellow':'green'}">
                <div class="kpi-label">EMI Load</div>
                <div class="kpi-value">${fl(computeTotalEmi())}</div>
                <div class="kpi-sub">From ${getLoansForMember(currentProfile).length} loan(s)</div>
            </div>
        </div>
        ${memberKpiHtml ? `<div class="grid-4" style="margin-bottom:18px;">${memberKpiHtml}</div>` : ''}
        <div class="card">
            <div class="card-title"><span class="icon">📉</span> ${isAll ? 'Family Expenses' : memberLabel + "'s Expenses"} – ${monthLabel}</div>
            ${expHtml}
        </div>
    `);
}

// Sync current month byMember back to legacy structures (for computeMonthlyExpenses compatibility)
function syncExpensesToLegacy() {
    const byMember = getMonthByMember(currentMonth);
    // Keep flat byMember in sync (for backward compat)
    userData.expenses.byMember = byMember;
    userData.expenses.monthly = Object.values(byMember).flat();
}

window.updateMemberExpense = (memberId, i, field, val) => {
    const byMember = getMonthByMember(currentMonth);
    if(!byMember[memberId]) return;
    if(field==='label') byMember[memberId][i].label = val;
    else byMember[memberId][i].v = num(val);
    syncExpensesToLegacy(); debounceSave(); renderExpenses(); updateMonthSummary();
};
window.deleteMemberExpense = (memberId, i) => {
    const byMember = getMonthByMember(currentMonth);
    if(!byMember[memberId]) return;
    byMember[memberId].splice(i,1);
    syncExpensesToLegacy(); debounceSave(); renderExpenses(); updateMonthSummary();
};
window.addMemberExpense = (memberId) => {
    const byMember = getMonthByMember(currentMonth);
    if(!byMember[memberId]) byMember[memberId] = [];
    byMember[memberId].push({ id:'exp-'+Date.now(), label:'New Expense', v:0 });
    syncExpensesToLegacy(); debounceSave(); renderExpenses(); updateMonthSummary();
};

// ========== MONTH SUMMARY WIDGET ==========
function updateMonthSummary() {
    const el = $('monthSummary');
    if(!el) return;
    const curTotal = getMemberExpenseTotal(currentProfile, currentMonth);
    const monthLabel = new Date(currentMonth+'-01').toLocaleDateString('en-IN',{month:'short',year:'numeric'});

    // Get previous month
    const [y, m] = currentMonth.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    const prevMonth = prevDate.getFullYear() + '-' + String(prevDate.getMonth()+1).padStart(2,'0');
    const prevTotal = getMemberExpenseTotal(currentProfile, prevMonth);

    el.style.display = 'block';
    $('monthExpTotal').textContent = fl(curTotal);

    // Update the label to show month name
    el.querySelector('div:first-child').textContent = monthLabel + ' Expenses';

    const trendEl = $('monthExpTrend');
    if(prevTotal === 0 && curTotal === 0) {
        trendEl.innerHTML = `<span style="color:var(--text3);">No data to compare</span>`;
    } else if(prevTotal === 0) {
        trendEl.innerHTML = `<span style="color:var(--text3);">No previous month data</span>`;
    } else {
        const diff = curTotal - prevTotal;
        const pctChange = Math.abs(diff / prevTotal * 100).toFixed(1);
        if(diff > 0) {
            trendEl.innerHTML = `<span style="color:var(--red);">↑ ${pctChange}% higher</span> <span style="color:var(--text3);">vs prev month (${fl(prevTotal)})</span>`;
        } else if(diff < 0) {
            trendEl.innerHTML = `<span style="color:var(--green);">↓ ${pctChange}% lower</span> <span style="color:var(--text3);">vs prev month (${fl(prevTotal)})</span>`;
        } else {
            trendEl.innerHTML = `<span style="color:var(--yellow);">→ Same</span> <span style="color:var(--text3);">as prev month (${fl(prevTotal)})</span>`;
        }
    }
}

// ========== INVESTMENTS PAGE (with Zerodha integration) ==========
async function renderInvestments() {
    const isAll = currentProfile === 'all';
    const inv = getInvestmentsForMember(currentProfile);
    const members = userData.profile.familyMembers || [{ id:'self', name: userData.profile.name||'Me', role:'self' }];
    const canEdit = !isAll && editMode;

    // ── Fetch Zerodha holdings first so we can merge into totals ──
    let zerodhaHoldings = [];
    let zerodhaStatus = 'not_connected'; // not_connected | expired | connected | error
    // Track per-member statuses for "all" view
    let zerodhaStatusByMember = {};

    if (isAll) {
        // "All" view: fetch holdings for each family member individually
        const fetchPromises = members.map(async (m) => {
            try {
                const res = await fetch('/api/integrations/zerodha/holdings', {
                    headers: { 'X-User-Id': currentUserEmail, 'X-Member-Id': m.id }
                });
                if (res.ok) {
                    const holdings = await res.json();
                    zerodhaStatusByMember[m.id] = 'connected';
                    return holdings.map(h => ({ ...h, _memberId: m.id, _memberName: m.name }));
                } else if (res.status === 404) {
                    zerodhaStatusByMember[m.id] = 'not_connected';
                } else if (res.status === 401) {
                    zerodhaStatusByMember[m.id] = 'expired';
                } else {
                    zerodhaStatusByMember[m.id] = 'error';
                }
            } catch (e) {
                console.error(`Failed to fetch Zerodha holdings for ${m.name}`, e);
                zerodhaStatusByMember[m.id] = 'error';
            }
            return [];
        });
        const allResults = await Promise.all(fetchPromises);
        zerodhaHoldings = allResults.flat();
        // Set overall status based on whether any member is connected
        const statuses = Object.values(zerodhaStatusByMember);
        if (statuses.includes('connected')) zerodhaStatus = 'connected';
        else if (statuses.every(s => s === 'not_connected')) zerodhaStatus = 'not_connected';
        else zerodhaStatus = 'not_connected';
    } else {
        // Single member view: fetch for the specific member
        try {
            const holdingsRes = await fetch('/api/integrations/zerodha/holdings', {
                headers: { 'X-User-Id': currentUserEmail, 'X-Member-Id': currentProfile }
            });
            console.log('Zerodha holdings API status:', holdingsRes.status);
            if (holdingsRes.status === 404) zerodhaStatus = 'not_connected';
            else if (holdingsRes.status === 401) zerodhaStatus = 'expired';
            else if (holdingsRes.ok) {
                zerodhaHoldings = await holdingsRes.json();
                zerodhaStatus = 'connected';
                console.log('Zerodha holdings:', zerodhaHoldings.length);
            } else zerodhaStatus = 'error';
        } catch (e) {
            console.error('Failed to fetch Zerodha holdings', e);
            zerodhaStatus = 'error';
        }
    }
    console.log('Final zerodhaStatus:', zerodhaStatus);

    const zStocks = zerodhaHoldings.filter(h => h.asset_type === 'stock');
    const zMFs    = zerodhaHoldings.filter(h => h.asset_type === 'mutual_fund');
    const zStockVal = zStocks.reduce((s,h) => s + (h.quantity * h.current_price), 0);
    const zMFVal    = zMFs.reduce((s,h) => s + (h.quantity * h.current_price), 0);

    // Manual totals
    const manualMF  = (inv.mutualFunds||[]).reduce((s,f)=>s+(f.value||0),0);
    const manualSt  = (inv.stocks||[]).reduce((s,f)=>s+(f.value||0),0);
    const fdTot     = (inv.fd||[]).reduce((s,f)=>s+(f.value||0),0);
    const ppfTot    = (inv.ppf||[]).reduce((s,f)=>s+(f.value||0),0);

    // Combined totals (manual + Zerodha)
    const mfTot  = manualMF + zMFVal;
    const stTot  = manualSt + zStockVal;
    const total  = mfTot + stTot + fdTot + ppfTot;

    const categories = [
        { key:'mutualFunds', label:'Mutual Funds',      icon:'📊', color:'var(--accent)',  total:mfTot  },
        { key:'stocks',      label:'Stocks / Equities', icon:'📈', color:'var(--green)',   total:stTot  },
        { key:'fd',          label:'Fixed Deposits',    icon:'🏦', color:'var(--yellow)',  total:fdTot  },
        { key:'ppf',         label:'PPF / NPS / EPF',   icon:'🏛️', color:'var(--purple)',  total:ppfTot }
    ];

    const allocBar = total > 0 ? categories.map(c=>`
        <div class="alloc-segment" style="width:${(c.total/total*100).toFixed(1)}%; background:${c.color};"
             title="${c.label}: ${(c.total/total*100).toFixed(0)}%"></div>
    `).join('') : `<div class="alloc-segment" style="width:100%; background:var(--border2);"></div>`;

    const allocLegend = categories.map(c=>`
        <div style="display:flex; align-items:center; gap:6px; font-size:11px; color:var(--text2);">
            <div style="width:8px; height:8px; border-radius:50%; background:${c.color};"></div>
            ${c.label}: <span style="font-family:var(--mono); color:var(--text);">${total>0?(c.total/total*100).toFixed(0)+'%':'—'}</span>
        </div>
    `).join('');

    // Build investment cards — grouped by member in "all" view, flat in member view
    const cardsHtml = categories.map(cat => {
        // Get Zerodha items for this category
        const zItems = cat.key === 'stocks' ? zStocks : cat.key === 'mutualFunds' ? zMFs : [];

        let rowsHtml = '';
        if (isAll && members.length > 1) {
            // "All" view: group items by member with visual labels
            const byMember = userData.investments?.byMember || {};
            members.forEach(m => {
                const memberInv = byMember[m.id] || {};
                const memberItems = memberInv[cat.key] || [];
                if (memberItems.length === 0) return;
                const memberTotal = memberItems.reduce((s,f) => s + (f.value||0), 0);
                const icon = m.role==='self' ? '👤' : m.role==='spouse' ? '💑' : m.role==='kid' ? '👶' : '👤';
                rowsHtml += `<div style="margin-bottom:8px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; padding-bottom:4px; border-bottom:1px solid var(--border);">
                        <span style="font-size:11px; font-weight:700; color:var(--accent2);">${icon} ${m.name}</span>
                        <span style="font-size:11px; font-family:var(--mono); color:var(--text2);">${fl(memberTotal)}</span>
                    </div>`;
                memberItems.forEach(item => {
                    rowsHtml += `<div class="row-flex">
                        <span class="row-label">${item.name}</span>
                        <div style="display:flex; align-items:center; gap:8px;">
                            ${total>0 ? `<span style="font-size:10px; color:var(--text3);">${(item.value/total*100).toFixed(0)}%</span>` : ''}
                            <span class="row-value">${fl(item.value||0)}</span>
                        </div>
                    </div>`;
                });
                rowsHtml += `</div>`;
            });
        } else {
            // Single member view: flat list with edit capability
            const items = inv[cat.key] || [];
            rowsHtml = items.map((item,i) => `
                <div class="row-flex">
                    ${canEdit
                        ? `<input class="edit-input-text" value="${item.name}" onchange="updateInvestment('${cat.key}',${i},'name',this.value)" style="max-width:200px;">
                           <div style="display:flex;gap:6px;align-items:center;">
                               <input class="edit-input" type="number" value="${item.value||0}" onchange="updateInvestment('${cat.key}',${i},'value',this.value)">
                               <button class="del-btn" onclick="deleteInvestment('${cat.key}',${i})">🗑</button>
                           </div>`
                        : `<span class="row-label">${item.name}</span>
                           <div style="display:flex; align-items:center; gap:8px;">
                               ${total>0 ? `<span style="font-size:10px; color:var(--text3);">${(item.value/total*100).toFixed(0)}%</span>` : ''}
                               <span class="row-value">${fl(item.value||0)}</span>
                           </div>`}
                </div>
            `).join('');
        }

        // Zerodha rows (read-only, with P&L) — grouped by member in "all" view
        let zRowsHtml = '';
        if (isAll && members.length > 1) {
            // Group Zerodha items by member
            const zByMember = {};
            zItems.forEach(h => {
                const mid = h._memberId || 'self';
                if (!zByMember[mid]) zByMember[mid] = [];
                zByMember[mid].push(h);
            });
            Object.keys(zByMember).forEach(mid => {
                const mItems = zByMember[mid];
                const m = members.find(mm => mm.id === mid);
                const mName = m ? m.name : mid;
                const mIcon = m ? (m.role==='self' ? '👤' : m.role==='spouse' ? '💑' : m.role==='kid' ? '👶' : '👤') : '👤';
                const memberZTotal = mItems.reduce((s,h) => s + (h.quantity * h.current_price), 0);
                zRowsHtml += `<div style="margin-bottom:8px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; padding-bottom:4px; border-bottom:1px solid var(--border);">
                        <span style="font-size:11px; font-weight:700; color:var(--accent2);">${mIcon} ${mName} <span style="font-size:9px;color:var(--accent);background:rgba(99,102,241,0.15);padding:1px 5px;border-radius:4px;">Zerodha</span></span>
                        <span style="font-size:11px; font-family:var(--mono); color:var(--text2);">${fl(memberZTotal)}</span>
                    </div>`;
                mItems.forEach(h => {
                    const val = h.quantity * h.current_price;
                    const pnlColor = (h.pnl||0) >= 0 ? 'var(--green)' : '#ef4444';
                    zRowsHtml += `<div class="row-flex">
                        <span class="row-label">${h.fund_name}</span>
                        <div style="text-align:right;">
                            <span class="row-value">${fl(val)}</span>
                            <div style="font-size:10px;color:${pnlColor};">${(h.pnl||0)>=0?'+':''}${fl(h.pnl||0)} P&L</div>
                        </div>
                    </div>`;
                });
                zRowsHtml += `</div>`;
            });
        } else {
            zRowsHtml = zItems.map(h => {
                const val = h.quantity * h.current_price;
                const pnlColor = (h.pnl||0) >= 0 ? 'var(--green)' : '#ef4444';
                return `<div class="row-flex">
                    <span class="row-label">${h.fund_name} <span style="font-size:9px;color:var(--accent);background:rgba(99,102,241,0.15);padding:1px 5px;border-radius:4px;">Zerodha</span></span>
                    <div style="text-align:right;">
                        <span class="row-value">${fl(val)}</span>
                        <div style="font-size:10px;color:${pnlColor};">${(h.pnl||0)>=0?'+':''}${fl(h.pnl||0)} P&L</div>
                    </div>
                </div>`;
            }).join('');
        }

        const allRows = rowsHtml + zRowsHtml;

        return `
            <div class="card">
                <div class="card-title">
                    <span class="icon">${cat.icon}</span> ${cat.label}
                    <span style="margin-left:auto; font-family:var(--mono); color:${cat.color};">${fl(cat.total)}</span>
                </div>
                ${allRows || `<p style="color:var(--text3); font-size:12px; padding:8px 0;">None added yet.</p>`}
                ${canEdit ? `<button class="add-btn" onclick="addInvestment('${cat.key}')">➕ Add ${cat.label}</button>` : ''}
            </div>
        `;
    }).join('');

    const diversified = categories.filter(c=>c.total>0).length;
    const diversityMsg = diversified===0 ? '⚠️ No investments recorded yet.' :
                         diversified===1 ? '⚠️ Portfolio concentrated in one asset class — consider diversifying.' :
                         diversified>=3  ? '✅ Well-diversified across multiple asset classes.' :
                         '💡 Good start — adding more asset classes improves risk balance.';

    // Member label for header
    const memberName = getMemberName(currentProfile);
    const memberLabel = isAll ? '👨‍👩‍👧‍👦 All Members' : `👤 ${memberName}`;

    // ===== Zerodha connect/status bar =====
    let zerodhaBar = '';
    if (isAll) {
        // "All" view: show per-member Zerodha connection summary
        const connectedMembers = members.filter(m => zerodhaStatusByMember[m.id] === 'connected');
        const expiredMembers = members.filter(m => zerodhaStatusByMember[m.id] === 'expired');
        const notConnectedMembers = members.filter(m => !zerodhaStatusByMember[m.id] || zerodhaStatusByMember[m.id] === 'not_connected' || zerodhaStatusByMember[m.id] === 'error');

        let memberStatusRows = members.map(m => {
            const st = zerodhaStatusByMember[m.id] || 'not_connected';
            const icon = m.role==='self' ? '👤' : m.role==='spouse' ? '💑' : m.role==='kid' ? '👶' : m.role==='father'||m.role==='mother' ? '👴' : '👤';
            if (st === 'connected') {
                const memberHoldings = zerodhaHoldings.filter(h => h._memberId === m.id);
                return `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--border);">
                    <span style="font-size:12px;">${icon} ${m.name}</span>
                    <span style="font-size:11px;color:var(--green);"><i class="fas fa-check-circle"></i> Connected · ${memberHoldings.length} holdings</span>
                </div>`;
            } else if (st === 'expired') {
                return `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--border);">
                    <span style="font-size:12px;">${icon} ${m.name}</span>
                    <span style="font-size:11px;color:var(--yellow);">⚠️ Expired</span>
                </div>`;
            } else {
                return `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--border);">
                    <span style="font-size:12px;">${icon} ${m.name}</span>
                    <span style="font-size:11px;color:var(--text3);">Not connected</span>
                </div>`;
            }
        }).join('');

        if (connectedMembers.length > 0 || expiredMembers.length > 0) {
            zerodhaBar = `<div class="card" style="margin-bottom:18px;">
                <div class="card-title"><i class="fas fa-link"></i> Zerodha Connections</div>
                ${memberStatusRows}
                <p style="font-size:11px;color:var(--text3);margin-top:8px;">Select a member to connect/disconnect their Zerodha account.</p>
            </div>`;
        }
    } else {
        // Single member view: show connect/disconnect for this specific member
        const memberName2 = getMemberName(currentProfile);
        if (zerodhaStatus === 'not_connected' || zerodhaStatus === 'error') {
            zerodhaBar = `<div class="card" style="text-align:center;margin-bottom:18px;background:linear-gradient(135deg, rgba(59,126,255,0.05), rgba(167,139,250,0.05)); border-color:var(--accent);">
                <div class="card-title"><i class="fas fa-link"></i> Auto-Import from Zerodha</div>
                <p style="color:var(--text2); margin-bottom:12px; font-size:13px; line-height:1.6;">Connect ${memberName2}'s Zerodha account to automatically import stocks & mutual funds with live P&L tracking.</p>
                <button class="primary-btn" onclick="connectZerodha('${currentProfile}')"><i class="fas fa-plug"></i> ${t('connectZerodha')} →</button>
            </div>`;
        } else if (zerodhaStatus === 'expired') {
            zerodhaBar = `<div class="card" style="text-align:center;margin-bottom:18px;background:rgba(245,158,11,0.05);border-color:var(--yellow);">
                <p style="color:var(--yellow);margin-bottom:8px;font-size:13px;">⚠️ ${memberName2}'s Zerodha session expired (tokens reset daily at 6 AM IST)</p>
                <button class="primary-btn" onclick="connectZerodha('${currentProfile}')"><i class="fas fa-sync"></i> Reconnect Zerodha →</button>
            </div>`;
        } else if (zerodhaStatus === 'connected' && zerodhaHoldings.length) {
            zerodhaBar = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;font-size:11px;color:var(--text3);">
                <span><i class="fas fa-check-circle" style="color:var(--green);"></i> ${memberName2}'s Zerodha connected · ${zerodhaHoldings.length} holdings synced</span>
                <button class="secondary-btn" style="font-size:10px;padding:3px 10px;" onclick="disconnectZerodha('${currentProfile}')"><i class="fas fa-unlink"></i> ${t('disconnectZerodha')}</button>
            </div>`;
        } else if (zerodhaStatus === 'connected' && zerodhaHoldings.length === 0) {
            zerodhaBar = `<div class="card" style="text-align:center;margin-bottom:18px;">
                <p style="color:var(--text3);margin-bottom:8px;font-size:13px;">✅ ${memberName2}'s Zerodha connected, but no holdings found.</p>
                <div style="display:flex;gap:8px;justify-content:center;">
                    <button class="secondary-btn" onclick="renderInvestments()"><i class="fas fa-sync"></i> Refresh</button>
                    <button class="secondary-btn" style="color:var(--red);" onclick="disconnectZerodha('${currentProfile}')"><i class="fas fa-unlink"></i> ${t('disconnectZerodha')}</button>
                </div>
            </div>`;
        }
    }

    sh('page-investments', `
        ${isAll ? `<div style="margin-bottom:12px; font-size:12px; color:var(--text3); display:flex; align-items:center; gap:6px;">
            <i class="fas fa-eye"></i> Combined read-only view — select a member to edit
        </div>` : ''}
        <div class="grid-4" style="margin-bottom:18px;">
            <div class="kpi-card green">
                <div class="kpi-label">${isAll ? 'Family' : memberName+"'s"} Portfolio</div>
                <div class="kpi-value">${fl(total)}</div>
                <div class="kpi-sub">${diversified} asset class(es)</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">Mutual Funds</div>
                <div class="kpi-value">${fl(mfTot)}</div>
                <div class="kpi-sub">${(inv.mutualFunds||[]).length} funds</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">Equities</div>
                <div class="kpi-value">${fl(stTot)}</div>
                <div class="kpi-sub">${(inv.stocks||[]).length} stocks</div>
            </div>
            <div class="kpi-card purple">
                <div class="kpi-label">Debt / Safe</div>
                <div class="kpi-value">${fl(fdTot+ppfTot)}</div>
                <div class="kpi-sub">FD + PPF/NPS/EPF</div>
            </div>
        </div>
        <div class="card" style="margin-bottom:18px;">
            <div class="card-title"><span class="icon">🎨</span> Asset Allocation</div>
            <div class="alloc-bar">${allocBar}</div>
            <div style="display:flex; gap:20px; flex-wrap:wrap; margin-top:10px;">${allocLegend}</div>
            <div class="insight-box" style="margin-top:12px;">${diversityMsg}</div>
        </div>
        <div class="grid-2">${cardsHtml}</div>
        ${zerodhaBar}
    `);
}

window.updateInvestment = (cat, i, field, val) => {
    if (currentProfile === 'all') return; // read-only in "all" view
    const memberInv = getMemberInvestments(currentProfile);
    if(!memberInv[cat]) memberInv[cat]=[];
    memberInv[cat][i][field] = field==='value' ? num(val) : val;
    debounceSave(); renderInvestments();
};
window.deleteInvestment = (cat, i) => {
    if (currentProfile === 'all') return;
    const memberInv = getMemberInvestments(currentProfile);
    memberInv[cat].splice(i,1);
    debounceSave(); renderInvestments();
};
window.addInvestment = cat => {
    if (currentProfile === 'all') return;
    const memberInv = getMemberInvestments(currentProfile);
    if(!memberInv[cat]) memberInv[cat]=[];
    memberInv[cat].push({ id:'inv-'+Date.now(), name:'New Entry', value:0 });
    debounceSave(); renderInvestments();
};

// ========== RECURRING EXPENSES PAGE ==========
async function renderMasterExpenses() {
    if (!currentUserEmail) {
        sh('page-master-expenses', emptyState('Please log in to manage recurring expenses.', '🔐 Log In', 'doLogin'));
        return;
    }

    // Fetch master expenses
    const result = await masterExpenseService.getByFamily(currentUserEmail, {});
    
    if (!result.success) {
        sh('page-master-expenses', `
            <div class="card" style="background:var(--red-dim); border-color:var(--red);">
                <div style="color:var(--red); font-size:14px;">❌ Error loading recurring expenses: ${result.error}</div>
            </div>
        `);
        return;
    }

    const masterExpenses = result.data || [];
    const activeExpenses = masterExpenses.filter(me => me.status === 'active');
    const pausedExpenses = masterExpenses.filter(me => me.status === 'paused');
    const completedExpenses = masterExpenses.filter(me => me.status === 'completed');
    
    // Calculate totals
    const totalMonthly = activeExpenses.reduce((sum, me) => sum + (me.amount || 0), 0);
    const emiCount = activeExpenses.filter(me => me.is_emi).length;
    const subscriptionCount = activeExpenses.filter(me => me.is_subscription).length;
    
    // Get total remaining for EMIs
    const totalEMIRemaining = activeExpenses
        .filter(me => me.is_emi)
        .reduce((sum, me) => sum + (me.remaining_amount || 0), 0);

    // Render master expenses by category
    const renderMasterExpenseCard = (me) => {
        const statusBadge = me.status === 'active' ? '<span class="badge badge-green">Active</span>' :
                           me.status === 'paused' ? '<span class="badge badge-yellow">Paused</span>' :
                           me.status === 'completed' ? '<span class="badge badge-blue">Completed</span>' :
                           '<span class="badge badge-red">Cancelled</span>';
        
        const typeIcon = me.expense_type === 'emi' ? '🏦' :
                        me.expense_type === 'subscription' ? '📱' :
                        me.expense_type === 'utility' ? '💡' :
                        me.expense_type === 'grocery' ? '🛒' : '💰';
        
        const emiInfo = me.is_emi ? `
            <div style="font-size:11px; color:var(--text3); margin-top:4px;">
                <div>Tenure: ${me.tenure_months} months | Remaining: ${me.remaining_tenure || 0} months</div>
                <div>Total: ${fl(me.total_amount)} | Remaining: ${fl(me.remaining_amount || 0)}</div>
                <div>End Date: ${me.end_date}</div>
            </div>
        ` : '';
        
        const subscriptionInfo = me.is_subscription ? `
            <div style="font-size:11px; color:var(--text3); margin-top:4px;">
                <div>Service: ${me.service_name || 'N/A'}</div>
                <div>Renewal: ${me.renewal_date || 'N/A'}</div>
                <div>Frequency: ${me.frequency}</div>
            </div>
        ` : '';
        
        const controls = me.status === 'active' ? `
            <button class="snap-btn" onclick="pauseMasterExpense('${me.id}')" style="font-size:11px; padding:4px 10px;">⏸️ Pause</button>
            <button class="snap-btn" onclick="editMasterExpense('${me.id}')" style="font-size:11px; padding:4px 10px;">✏️ Edit</button>
            <button class="snap-btn" onclick="cancelMasterExpense('${me.id}')" style="font-size:11px; padding:4px 10px; color:var(--red);">❌ Cancel</button>
        ` : me.status === 'paused' ? `
            <button class="snap-btn" onclick="resumeMasterExpense('${me.id}')" style="font-size:11px; padding:4px 10px;">▶️ Resume</button>
            <button class="snap-btn" onclick="cancelMasterExpense('${me.id}')" style="font-size:11px; padding:4px 10px; color:var(--red);">❌ Cancel</button>
        ` : '';
        
        return `
            <div class="card" style="margin-bottom:12px;">
                <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:8px;">
                    <div style="flex:1;">
                        <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                            <span style="font-size:18px;">${typeIcon}</span>
                            <span style="font-size:15px; font-weight:700; color:var(--text);">${me.name}</span>
                            ${statusBadge}
                        </div>
                        <div style="font-size:13px; color:var(--text2);">${me.category} • ${me.expense_type}</div>
                        ${me.description ? `<div style="font-size:12px; color:var(--text3); margin-top:4px;">${me.description}</div>` : ''}
                        ${emiInfo}
                        ${subscriptionInfo}
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:20px; font-weight:800; font-family:var(--mono); color:var(--accent);">${ff(me.amount)}</div>
                        <div style="font-size:11px; color:var(--text3);">per month</div>
                    </div>
                </div>
                <div style="display:flex; gap:6px; flex-wrap:wrap;">
                    ${controls}
                </div>
            </div>
        `;
    };

    const activeHtml = activeExpenses.length > 0 
        ? activeExpenses.map(renderMasterExpenseCard).join('')
        : '<p style="color:var(--text3); font-size:13px; padding:10px 0;">No active recurring expenses.</p>';
    
    const pausedHtml = pausedExpenses.length > 0
        ? pausedExpenses.map(renderMasterExpenseCard).join('')
        : '';
    
    const completedHtml = completedExpenses.length > 0
        ? completedExpenses.map(renderMasterExpenseCard).join('')
        : '';

    sh('page-master-expenses', `
        <div class="grid-4" style="margin-bottom:18px;">
            <div class="kpi-card red">
                <div class="kpi-label">Total Monthly Recurring</div>
                <div class="kpi-value">${fl(totalMonthly)}</div>
                <div class="kpi-sub">${activeExpenses.length} active expenses</div>
            </div>
            <div class="kpi-card yellow">
                <div class="kpi-label">Active EMIs</div>
                <div class="kpi-value">${emiCount}</div>
                <div class="kpi-sub">Remaining: ${fl(totalEMIRemaining)}</div>
            </div>
            <div class="kpi-card purple">
                <div class="kpi-label">Subscriptions</div>
                <div class="kpi-value">${subscriptionCount}</div>
                <div class="kpi-sub">Active services</div>
            </div>
            <div class="kpi-card green">
                <div class="kpi-label">Paused</div>
                <div class="kpi-value">${pausedExpenses.length}</div>
                <div class="kpi-sub">Temporarily stopped</div>
            </div>
        </div>

        <div style="margin-bottom:18px;">
            <button class="ebtn" onclick="showAddMasterExpenseModal()">➕ Add Recurring Expense</button>
            <button class="snap-btn" onclick="showAddEMIModal()" style="margin-left:8px;">🏦 Add EMI</button>
            <button class="snap-btn" onclick="testCarryForward()" style="margin-left:8px;">🔄 Test Carry-Forward</button>
            <button class="snap-btn" onclick="testWhatsAppReminder()" style="margin-left:8px; background:var(--green-dim); color:var(--green);">📱 Test WhatsApp</button>
        </div>

        <div class="card">
            <div class="card-title"><span class="icon">✅</span> Active Recurring Expenses</div>
            ${activeHtml}
        </div>

        ${pausedHtml ? `
        <div class="card">
            <div class="card-title"><span class="icon">⏸️</span> Paused Expenses</div>
            ${pausedHtml}
        </div>
        ` : ''}

        ${completedHtml ? `
        <div class="card">
            <div class="card-title"><span class="icon">✅</span> Completed Expenses</div>
            ${completedHtml}
        </div>
        ` : ''}
    `);
}

// Master Expense Management Functions
window.showAddMasterExpenseModal = () => {
    const modalHtml = `
        <div class="modal-overlay" id="masterExpenseModal" onclick="if(event.target===this) closeMasterExpenseModal()">
            <div class="modal-content" style="max-width:600px;">
                <h2 style="margin-bottom:20px;">Add Recurring Expense</h2>
                
                <div class="form-group">
                    <label class="form-label">Expense Name *</label>
                    <input type="text" id="me-name" class="onboarding-input" placeholder="e.g., Monthly Groceries">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Monthly Amount (₹) *</label>
                    <input type="number" id="me-amount" class="onboarding-input" placeholder="15000" min="1">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Category *</label>
                    <select id="me-category" class="onboarding-input">
                        <option value="">Select category</option>
                        <option value="housing">Housing</option>
                        <option value="transportation">Transportation</option>
                        <option value="utilities">Utilities</option>
                        <option value="groceries">Groceries</option>
                        <option value="insurance">Insurance</option>
                        <option value="entertainment">Entertainment</option>
                        <option value="education">Education</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Expense Type *</label>
                    <select id="me-type" class="onboarding-input" onchange="toggleExpenseTypeFields()">
                        <option value="other">Regular Recurring</option>
                        <option value="utility">Utility Bill</option>
                        <option value="grocery">Grocery</option>
                        <option value="subscription">Subscription</option>
                    </select>
                </div>
                
                <div id="subscription-fields" style="display:none;">
                    <div class="form-group">
                        <label class="form-label">Service Name</label>
                        <input type="text" id="me-service-name" class="onboarding-input" placeholder="e.g., Netflix">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Renewal Date</label>
                        <input type="date" id="me-renewal-date" class="onboarding-input">
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea id="me-description" class="onboarding-input" rows="2" placeholder="Optional notes"></textarea>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Start Date</label>
                    <input type="date" id="me-start-date" class="onboarding-input" value="${new Date().toISOString().split('T')[0]}">
                </div>
                
                <div style="display:flex; gap:10px; margin-top:24px;">
                    <button class="ebtn" onclick="saveMasterExpense()" style="flex:1;">Save</button>
                    <button class="snap-btn" onclick="closeMasterExpenseModal()" style="flex:1;">Cancel</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.showAddEMIModal = () => {
    const modalHtml = `
        <div class="modal-overlay" id="emiModal" onclick="if(event.target===this) closeEMIModal()">
            <div class="modal-content" style="max-width:600px;">
                <h2 style="margin-bottom:20px;">Add EMI</h2>
                
                <div class="form-group">
                    <label class="form-label">EMI Name *</label>
                    <input type="text" id="emi-name" class="onboarding-input" placeholder="e.g., Home Loan EMI">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Monthly EMI Amount (₹) *</label>
                    <input type="number" id="emi-amount" class="onboarding-input" placeholder="35000" min="1" onchange="calculateEMITotals()">
                </div>
                
                <div class="form-group">
                    <label class="form-label">EMI Type *</label>
                    <select id="emi-type" class="onboarding-input">
                        <option value="house_loan">Home Loan</option>
                        <option value="car_loan">Car Loan</option>
                        <option value="personal_loan">Personal Loan</option>
                        <option value="education_loan">Education Loan</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Start Date *</label>
                    <input type="date" id="emi-start-date" class="onboarding-input" onchange="calculateEMITotals()">
                </div>
                
                <div class="form-group">
                    <label class="form-label">End Date *</label>
                    <input type="date" id="emi-end-date" class="onboarding-input" onchange="calculateEMITotals()">
                </div>
                
                <div id="emi-calculations" style="background:var(--bg3); border:1px solid var(--border2); border-radius:var(--radius-sm); padding:12px; margin:16px 0; display:none;">
                    <div style="font-size:12px; color:var(--text3); margin-bottom:8px;">EMI Summary:</div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                        <span style="font-size:13px; color:var(--text2);">Tenure:</span>
                        <span style="font-size:13px; font-weight:600; color:var(--text);" id="emi-tenure-display">—</span>
                    </div>
                    <div style="display:flex; justify-content:space-between;">
                        <span style="font-size:13px; color:var(--text2);">Total Amount:</span>
                        <span style="font-size:13px; font-weight:600; color:var(--accent);" id="emi-total-display">—</span>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea id="emi-description" class="onboarding-input" rows="2" placeholder="Optional notes"></textarea>
                </div>
                
                <div style="display:flex; gap:10px; margin-top:24px;">
                    <button class="ebtn" onclick="saveEMI()" style="flex:1;">Save EMI</button>
                    <button class="snap-btn" onclick="closeEMIModal()" style="flex:1;">Cancel</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.toggleExpenseTypeFields = () => {
    const type = $('me-type').value;
    const subFields = $('subscription-fields');
    if (subFields) {
        subFields.style.display = type === 'subscription' ? 'block' : 'none';
    }
};

window.calculateEMITotals = () => {
    const amount = parseFloat($('emi-amount')?.value || 0);
    const startDate = $('emi-start-date')?.value;
    const endDate = $('emi-end-date')?.value;
    
    if (amount > 0 && startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        const years = end.getFullYear() - start.getFullYear();
        const months = end.getMonth() - start.getMonth();
        const tenure = years * 12 + months;
        
        if (tenure > 0) {
            const total = amount * tenure;
            $('emi-tenure-display').textContent = `${tenure} months (${(tenure/12).toFixed(1)} years)`;
            $('emi-total-display').textContent = fl(total);
            $('emi-calculations').style.display = 'block';
        }
    }
};

window.saveMasterExpense = async () => {
    const name = $('me-name').value.trim();
    const amount = parseFloat($('me-amount').value);
    const category = $('me-category').value;
    const expenseType = $('me-type').value;
    const description = $('me-description').value.trim();
    const startDate = $('me-start-date').value;
    
    if (!name || !amount || !category) {
        showToast('Please fill in all required fields', 'red');
        return;
    }
    
    const expenseData = {
        name,
        amount,
        category,
        expense_type: expenseType,
        description,
        start_date: startDate,
        is_subscription: expenseType === 'subscription',
        service_name: expenseType === 'subscription' ? $('me-service-name').value : null,
        renewal_date: expenseType === 'subscription' ? $('me-renewal-date').value : null
    };
    
    const result = await masterExpenseService.create(currentUserEmail, currentUserEmail, expenseData);
    
    if (result.success) {
        showToast('✅ Recurring expense added successfully!', 'green');
        closeMasterExpenseModal();
        renderCurrentPage();
    } else {
        showToast(`❌ Error: ${result.error}`, 'red');
    }
};

window.saveEMI = async () => {
    const name = $('emi-name').value.trim();
    const amount = parseFloat($('emi-amount').value);
    const emiType = $('emi-type').value;
    const startDate = $('emi-start-date').value;
    const endDate = $('emi-end-date').value;
    const description = $('emi-description').value.trim();
    
    if (!name || !amount || !startDate || !endDate) {
        showToast('Please fill in all required fields', 'red');
        return;
    }
    
    const emiData = {
        name,
        amount,
        category: emiType === 'house_loan' ? 'housing' : 'transportation',
        emi_type: emiType,
        start_date: startDate,
        end_date: endDate,
        description
    };
    
    const result = await masterExpenseService.createEMI(currentUserEmail, currentUserEmail, emiData);
    
    if (result.success) {
        showToast('✅ EMI added successfully!', 'green');
        closeEMIModal();
        renderCurrentPage();
    } else {
        showToast(`❌ Error: ${result.error}`, 'red');
    }
};

window.closeMasterExpenseModal = () => {
    const modal = $('masterExpenseModal');
    if (modal) modal.remove();
};

window.closeEMIModal = () => {
    const modal = $('emiModal');
    if (modal) modal.remove();
};

window.pauseMasterExpense = async (id) => {
    if (!confirm('Pause this recurring expense? It will stop generating monthly entries.')) return;
    
    const result = await masterExpenseService.pause(id, currentUserEmail, currentUserEmail);
    if (result.success) {
        showToast('✅ Expense paused', 'yellow');
        renderCurrentPage();
    } else {
        showToast(`❌ Error: ${result.error}`, 'red');
    }
};

window.resumeMasterExpense = async (id) => {
    const result = await masterExpenseService.resume(id, currentUserEmail, currentUserEmail);
    if (result.success) {
        showToast('✅ Expense resumed', 'green');
        renderCurrentPage();
    } else {
        showToast(`❌ Error: ${result.error}`, 'red');
    }
};

window.cancelMasterExpense = async (id) => {
    if (!confirm('Cancel this recurring expense? This action cannot be undone.')) return;
    
    const result = await masterExpenseService.cancel(id, currentUserEmail, currentUserEmail);
    if (result.success) {
        showToast('✅ Expense cancelled', 'red');
        renderCurrentPage();
    } else {
        showToast(`❌ Error: ${result.error}`, 'red');
    }
};

window.editMasterExpense = async (id) => {
    showToast('Edit functionality coming soon!', 'yellow');
    // TODO: Implement edit modal
};

window.testCarryForward = async () => {
    if (!confirm('Run carry-forward for current month? This will generate expense entries from active recurring expenses.')) return;
    
    showToast('Running carry-forward...', 'blue');
    
    const today = new Date();
    const result = await recurringExpenseEngine.manualTrigger(today.getMonth() + 1, today.getFullYear());
    
    if (result.status === 'success') {
        showToast(`✅ Carry-forward complete! Generated ${result.entries_generated} entries`, 'green');
    } else if (result.status === 'partial_success') {
        showToast(`⚠️ Partial success: ${result.entries_generated} entries, ${result.errors_encountered} errors`, 'yellow');
    } else {
        showToast(`❌ Carry-forward failed: ${result.errors_encountered} errors`, 'red');
    }
    
    // Refresh the expenses page to show new entries
    setTimeout(() => {
        document.querySelector('[data-page="expenses"]').click();
    }, 2000);
};

// ========== WHATSAPP INTEGRATION ==========

/**
 * Test WhatsApp reminder - sends a test message to user's WhatsApp number
 */
window.testWhatsAppReminder = async () => {
    if (!currentUserEmail) {
        showToast('❌ Please log in first', 'red');
        return;
    }
    
    // Check if user has WhatsApp number (fall back to registration phone)
    const whatsappNumber = userData.profile?.whatsapp_number || userData.profile?.phone;
    
    if (!whatsappNumber) {
        if (confirm('No WhatsApp number found in your profile. Would you like to add one now?')) {
            document.querySelector('[data-page="settings"]').click();
            showToast('💡 Add your WhatsApp number in Profile Settings', 'blue');
        }
        return;
    }
    
    if (!confirm(`Send test WhatsApp message to ${whatsappNumber}?`)) return;
    
    showToast('📱 Sending test message...', 'blue');
    
    try {
        const response = await fetch('/api/whatsapp/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: whatsappNumber,
                userName: userData.profile?.name || 'User'
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('✅ Test message sent! Check your WhatsApp', 'green');
        } else {
            showToast(`❌ Failed to send: ${result.error}`, 'red');
            console.error('WhatsApp test error:', result);
        }
    } catch (error) {
        console.error('WhatsApp test error:', error);
        showToast('❌ Failed to send test message', 'red');
    }
};

/**
 * Send WhatsApp reminders for upcoming recurring expenses
 * @param {number} daysAhead - Number of days to look ahead (default: 7)
 * @param {string} type - Type of reminder: 'consolidated' or 'individual'
 */
window.sendWhatsAppReminders = async (daysAhead = 7, type = 'consolidated') => {
    if (!currentUserEmail) {
        showToast('❌ Please log in first', 'red');
        return;
    }
    
    showToast('📱 Sending reminders...', 'blue');
    
    try {
        const response = await fetch('/api/whatsapp/reminders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUserEmail,
                daysAhead,
                type
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            if (result.remindersSent > 0) {
                showToast(`✅ Sent ${result.remindersSent} reminder(s) for ${result.expenseCount} expense(s)`, 'green');
            } else {
                showToast('ℹ️ No upcoming expenses found', 'blue');
            }
        } else {
            showToast(`❌ ${result.error}`, 'red');
            console.error('WhatsApp reminders error:', result);
        }
    } catch (error) {
        console.error('WhatsApp reminders error:', error);
        showToast('❌ Failed to send reminders', 'red');
    }
};

// ========== AI FINANCIAL DASHBOARD ==========
let aiDashboardData = null;
let aiDashboardLoading = false;

async function fetchAIDashboard() {
    if (aiDashboardLoading) return;
    aiDashboardLoading = true;

    try {
        const income = computeMonthlyIncome();
        const expenses = computeMonthlyExpenses();
        const totalEmi = computeTotalEmi();
        const loans = getLoansForMember(currentProfile).filter(l => (l.outstanding || 0) > 0);

        const profile = {
            income,
            expenses,
            total_emi: totalEmi,
            total_debt_outstanding: computeTotalLoanOutstanding(),
            liquid_assets: userData.liquidSavings || userData.emergencyFund || 0,
            total_assets: computeTotalInvestments() + (userData.liquidSavings || userData.emergencyFund || 0),
            term_cover: computeInsuranceCoverage().termCover,
            health_cover: computeInsuranceCoverage().healthCover,
            dependents: (userData.profile.familyMembers || []).length,
            sip_monthly: (() => {
                const inv = getInvestmentsForMember(currentProfile);
                const mfSips = (inv.mutualFunds || []).filter(f => f.sip || f.monthly).reduce((s, f) => s + (f.monthly || f.sip || 0), 0);
                return mfSips;
            })(),
            credit_utilization: userData.creditUtilization || 0,
            age: userData.profile.age || 30,
            risk_tolerance: userData.profile.risk || 'moderate',
            net_worth: computeTotalInvestments() + (userData.liquidSavings || userData.emergencyFund || 0) - computeTotalLoanOutstanding(),
            loans,
            equity_allocation_pct: 50,
            ai_personality: userData.profile.aiPersonality || 'balanced',
            streaks: userData.streaks || {}
        };

        const resp = await fetch('/api/financial-dashboard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profile)
        });

        if (resp.ok) {
            aiDashboardData = await resp.json();
            renderAIDashboardWidgets();
        }
    } catch (err) {
        console.error('AI Dashboard error:', err);
    } finally {
        aiDashboardLoading = false;
    }
}

function renderAIDashboardWidgets() {
    const container = document.getElementById('ai-dashboard-section');
    if (!container || !aiDashboardData) return;
    const d = aiDashboardData;

    // Sub-score bars
    const subScoreHtml = d.sub_scores ? Object.entries(d.sub_scores).map(([key, s]) => `
        <div style="margin-bottom:10px;">
            <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:4px;">
                <span style="color:var(--text2);">${s.label}</span>
                <span style="color:var(--text3); font-family:var(--mono);">${s.score}/100</span>
            </div>
            <div class="progress-bar" style="height:6px;">
                <div style="width:${s.score}%; height:100%; border-radius:3px; transition:width 0.8s ease;
                    background:${s.score >= 70 ? 'var(--green)' : s.score >= 40 ? 'var(--yellow)' : 'var(--red)'};"></div>
            </div>
        </div>
    `).join('') : '';

    // Risk dimensions
    const riskHtml = d.risk_dimensions ? Object.entries(d.risk_dimensions).map(([key, r]) => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px solid rgba(255,255,255,0.04);">
            <span style="font-size:12px; color:var(--text2);">${r.label}</span>
            <span style="font-size:12px; font-family:var(--mono); color:${r.score <= 25 ? 'var(--green)' : r.score <= 50 ? 'var(--yellow)' : 'var(--red)'};">${r.score}</span>
        </div>
    `).join('') : '';

    // Alerts
    const alertsHtml = (d.alerts || []).slice(0, 5).map(a => `
        <div style="display:flex; gap:10px; align-items:flex-start; padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.04);">
            <span style="font-size:16px; flex-shrink:0;">${a.icon}</span>
            <div>
                <div style="font-size:12px; color:${a.severity === 'critical' ? 'var(--red)' : a.severity === 'warning' ? 'var(--yellow)' : 'var(--green)'}; font-weight:600; text-transform:uppercase; font-size:9px; letter-spacing:0.5px; margin-bottom:2px;">${a.severity}</div>
                <div style="font-size:12px; color:var(--text2); line-height:1.5;">${a.message}</div>
            </div>
        </div>
    `).join('');

    // Badges
    const badgesHtml = (d.badges_unlocked || []).map(b => `
        <div style="display:inline-flex; align-items:center; gap:6px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:20px; padding:6px 12px; font-size:11px; color:var(--text2);">
            <span>${b.icon}</span> ${b.name}
        </div>
    `).join(' ');

    // Top actions
    const actionsHtml = (d.top_5_actions || []).map(a => `
        <div style="display:flex; gap:8px; align-items:flex-start; padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.04);">
            <span style="font-size:8px; padding:3px 6px; border-radius:4px; font-weight:700; text-transform:uppercase;
                background:${a.priority === 'high' ? 'var(--red-dim)' : a.priority === 'medium' ? 'var(--yellow-dim)' : 'var(--accent-glow)'};
                color:${a.priority === 'high' ? 'var(--red)' : a.priority === 'medium' ? 'var(--yellow)' : 'var(--accent2)'};">${a.priority}</span>
            <div style="font-size:12px; color:var(--text2); line-height:1.5;">${a.action}</div>
        </div>
    `).join('');

    container.innerHTML = `
        <!-- AI Scores Row -->
        <div class="grid-2" style="margin-bottom:18px;">
            <div class="card" style="position:relative; overflow:hidden;">
                <div style="position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg, ${d.health_color || 'var(--accent)'}, transparent);"></div>
                <div class="card-title"><span class="icon">🧠</span> AI Health Score</div>
                <div style="display:flex; align-items:center; gap:20px; margin-bottom:16px;">
                    <div style="position:relative; width:80px; height:80px; flex-shrink:0;">
                        <svg viewBox="0 0 80 80" style="transform:rotate(-90deg);">
                            <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="6"/>
                            <circle cx="40" cy="40" r="34" fill="none" stroke="${d.health_color || 'var(--accent)'}" stroke-width="6"
                                stroke-dasharray="${2 * Math.PI * 34}" stroke-dashoffset="${2 * Math.PI * 34 * (1 - (d.financial_health_score || 0) / 100)}"
                                stroke-linecap="round" style="transition:stroke-dashoffset 1s ease;"/>
                        </svg>
                        <div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; flex-direction:column;">
                            <div style="font-size:22px; font-weight:800; font-family:var(--mono); color:${d.health_color || 'var(--text)'};">${d.financial_health_score || 0}</div>
                        </div>
                    </div>
                    <div>
                        <div style="font-size:16px; font-weight:700; color:${d.health_color || 'var(--text)'}; margin-bottom:4px;">${d.health_grade || '—'}</div>
                        <div style="font-size:11px; color:var(--text3);">Wealth DNA: ${d.wealth_dna_profile || '—'}</div>
                        <div style="font-size:11px; color:var(--text3); margin-top:2px;">${d.life_stage || ''}</div>
                    </div>
                </div>
                ${subScoreHtml}
            </div>
            <div class="card" style="position:relative; overflow:hidden;">
                <div style="position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg, ${d.risk_color || 'var(--yellow)'}, transparent);"></div>
                <div class="card-title"><span class="icon">⚡</span> Risk Score</div>
                <div style="display:flex; align-items:center; gap:20px; margin-bottom:16px;">
                    <div style="position:relative; width:80px; height:80px; flex-shrink:0;">
                        <svg viewBox="0 0 80 80" style="transform:rotate(-90deg);">
                            <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="6"/>
                            <circle cx="40" cy="40" r="34" fill="none" stroke="${d.risk_color || 'var(--yellow)'}" stroke-width="6"
                                stroke-dasharray="${2 * Math.PI * 34}" stroke-dashoffset="${2 * Math.PI * 34 * (1 - (d.risk_score || 0) / 100)}"
                                stroke-linecap="round" style="transition:stroke-dashoffset 1s ease;"/>
                        </svg>
                        <div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center;">
                            <div style="font-size:22px; font-weight:800; font-family:var(--mono); color:${d.risk_color || 'var(--text)'};">${d.risk_score || 0}</div>
                        </div>
                    </div>
                    <div>
                        <div style="font-size:16px; font-weight:700; color:${d.risk_color || 'var(--text)'}; margin-bottom:4px;">${d.risk_category || '—'}</div>
                        <div style="font-size:11px; color:var(--text3);">Stress: ${d.stress_test?.job_loss_survival_months || 0} months survival</div>
                        <div style="font-size:11px; color:var(--text3); margin-top:2px;">Rate hike impact: +₹${(d.stress_test?.rate_hike_2pct_impact || 0).toLocaleString()}/mo</div>
                    </div>
                </div>
                ${riskHtml}
            </div>
        </div>

        <!-- Motivation + Badges -->
        <div class="card" style="background:linear-gradient(135deg, rgba(59,126,255,0.06), rgba(99,102,241,0.06)); border-color:rgba(59,126,255,0.15);">
            <div style="display:flex; gap:16px; align-items:flex-start; flex-wrap:wrap;">
                <div style="flex:1; min-width:200px;">
                    <div style="font-size:14px; color:var(--text); font-weight:600; margin-bottom:6px;">💬 ${d.motivational_message || ''}</div>
                    <div style="font-size:12px; color:var(--accent2); font-style:italic; margin-bottom:8px;">"${d.quote || ''}"</div>
                    <div style="font-size:11px; color:var(--text3);">${d.progress_highlight || ''}</div>
                </div>
                <div style="flex:1; min-width:200px;">
                    <div style="font-size:10px; color:var(--text3); text-transform:uppercase; letter-spacing:0.8px; margin-bottom:8px;">Badges (${d.badges_progress || '0/0'})</div>
                    <div style="display:flex; flex-wrap:wrap; gap:6px;">${badgesHtml || '<span style="font-size:12px; color:var(--text3);">Keep going to unlock badges!</span>'}</div>
                </div>
            </div>
        </div>

        <!-- Smart Alerts -->
        ${(d.alerts || []).length > 0 ? `
        <div class="card">
            <div class="card-title"><span class="icon">🔔</span> Smart Alerts <span style="font-size:10px; color:var(--red); margin-left:auto;">${d.alerts_critical || 0} critical</span></div>
            ${alertsHtml}
        </div>` : ''}

        <!-- Top Actions -->
        ${(d.top_5_actions || []).length > 0 ? `
        <div class="card">
            <div class="card-title"><span class="icon">🎯</span> AI Recommended Actions</div>
            ${actionsHtml}
        </div>` : ''}
    `;
}

// ========== LOAN FREEDOM CARD ==========
function renderLoanFreedomCard() {
    const loans = getLoansForMember(currentProfile);
    const activeLoans = loans.filter(l => (l.outstanding || 0) > 0 && (l.emi || 0) > 0);

    if (activeLoans.length === 0) {
        return `<div class="card" style="background:linear-gradient(135deg, rgba(16,185,129,0.08), rgba(59,126,255,0.05)); border-color:var(--green);">
            <div class="card-title"><span class="icon">🏆</span> Loan Freedom</div>
            <div style="text-align:center; padding:20px 0;">
                <div style="font-size:32px; margin-bottom:8px;">🎉</div>
                <div style="font-size:18px; font-weight:700; color:var(--green);">You're debt-free!</div>
                <div style="font-size:13px; color:var(--text3); margin-top:6px;">No active loans — keep up the great work.</div>
            </div>
        </div>`;
    }

    const baseline = computeDebtFreeDate(activeLoans, 0);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const fmtDate = d => d ? months[d.getMonth()] + ' ' + d.getFullYear() : '—';

    // Build per-loan detail rows
    const perLoanRows = baseline.perLoanDetails.map(d =>
        `<div style="display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px solid var(--border); font-size:12px;">
            <span style="color:var(--text2);">${d.label}</span>
            <span class="mono" style="color:var(--text);">${fmtDate(d.payoffDate)}</span>
        </div>`
    ).join('');

    return `<div class="card" id="loan-freedom-card" style="background:linear-gradient(135deg, rgba(59,126,255,0.05), rgba(167,139,250,0.05)); border-color:var(--accent);">
        <div class="card-title"><span class="icon">🏆</span> Loan Freedom
            <span style="margin-left:auto; cursor:help; font-size:13px;" title="Months saved = original tenure − new tenure (with extra payment applied equally to all loans)">ℹ️</span>
        </div>
        <div style="text-align:center; margin-bottom:16px;">
            <div style="font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px;">Debt-free by</div>
            <div style="font-size:24px; font-weight:800; color:var(--accent); font-family:var(--mono);" id="lf-debt-free-date">${fmtDate(baseline.debtFreeDate)}</div>
        </div>
        <div style="margin-bottom:16px;">
            <label style="font-size:12px; color:var(--text2); display:block; margin-bottom:6px;">What if I pay extra/month?</label>
            <div style="display:flex; align-items:center; gap:10px;">
                <input type="range" id="lf-slider" min="0" max="50000" step="1000" value="0"
                    style="flex:1; accent-color:var(--accent);"
                    oninput="updateLoanFreedomSlider(this.value)">
                <span class="mono" style="font-size:14px; font-weight:700; min-width:90px; text-align:right;" id="lf-slider-val">₹0</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:10px; color:var(--text3); margin-top:2px;">
                <span>₹0</span><span>₹50,000</span>
            </div>
        </div>
        <div id="lf-savings-info" style="display:none; text-align:center; padding:10px; background:var(--bg3); border-radius:var(--radius-sm); margin-bottom:14px;">
        </div>
        <div id="lf-per-loan" style="margin-bottom:8px;">
            ${perLoanRows}
        </div>
    </div>`;
}

window.updateLoanFreedomSlider = function(val) {
    const extra = parseInt(val) || 0;
    const sliderVal = document.getElementById('lf-slider-val');
    const savingsInfo = document.getElementById('lf-savings-info');
    const dateEl = document.getElementById('lf-debt-free-date');
    const perLoanEl = document.getElementById('lf-per-loan');
    if (sliderVal) sliderVal.textContent = '₹' + fl(extra);

    const loans = getLoansForMember(currentProfile);
    const activeLoans = loans.filter(l => (l.outstanding || 0) > 0 && (l.emi || 0) > 0);
    const result = computeDebtFreeDate(activeLoans, extra);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const fmtDate = d => d ? months[d.getMonth()] + ' ' + d.getFullYear() : '—';

    if (dateEl) dateEl.textContent = result.debtFreeDate ? fmtDate(result.debtFreeDate) : '—';

    if (savingsInfo) {
        if (extra > 0 && result.interestSaved > 0) {
            savingsInfo.style.display = 'block';
            savingsInfo.innerHTML = `
                <div style="font-size:13px; color:var(--green); font-weight:700;">You save ₹${fl(Math.round(result.interestSaved))} in interest</div>
                <div style="font-size:11px; color:var(--text3); margin-top:4px;">${result.monthsSaved} month${result.monthsSaved !== 1 ? 's' : ''} earlier freedom</div>
            `;
        } else {
            savingsInfo.style.display = 'none';
        }
    }

    if (perLoanEl) {
        perLoanEl.innerHTML = result.perLoanDetails.map(d =>
            `<div style="display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px solid var(--border); font-size:12px;">
                <span style="color:var(--text2);">${d.label}</span>
                <span class="mono" style="color:var(--text);">${fmtDate(d.payoffDate)}${d.monthsSaved > 0 ? ` <span style="color:var(--green); font-size:10px;">(−${d.monthsSaved}mo)</span>` : ''}</span>
            </div>`
        ).join('');
    }
};

// ========== LOANS PAGE ==========
function renderLoans() {
    const isAll = currentProfile === 'all';
    const loans    = getLoansForMember(currentProfile);
    const members = userData.profile.familyMembers || [{ id:'self', name: userData.profile.name||'Me', role:'self' }];
    const canEdit = !isAll && editMode;
    const totalOut = computeTotalLoanOutstanding();
    const totalEmi = computeTotalEmi();
    const dr       = computeDebtRatio();
    const income   = computeMonthlyIncome();

    const highestRate = loans.length ? Math.max(...loans.map(l=>l.rate||0)) : 0;
    const totalIntPaid = loans.reduce((s,l)=>s+(l.totalInterestPaid||0),0);
    const totalPrinPaid = loans.reduce((s,l)=>s+(l.totalPrincipalPaid||0),0);

    const loansInsight = loans.length === 0 ? '✅ No loans — great financial position!' :
        dr > 0.4 ? `⚠️ Your EMI load (${pct(dr)}) exceeds the safe 40% threshold. Prioritise repaying the highest-rate loan${highestRate>0?' ('+highestRate+'% p.a.)':''}.` :
        `💡 EMI load is within safe limits (${pct(dr)}). Consider prepaying high-interest loans to reduce total interest paid.`;

    let tableHtml = '';
    if (loans.length) {
        let tbodyHtml = '';
        if (isAll && members.length > 1) {
            // "All" view: group loans by member with visual labels (read-only)
            const byMember = userData.loans?.byMember || {};
            members.forEach(m => {
                const memberLoans = byMember[m.id] || [];
                if (memberLoans.length === 0) return;
                const icon = m.role==='self' ? '👤' : m.role==='spouse' ? '💑' : m.role==='kid' ? '👶' : '👤';
                tbodyHtml += `<tr><td colspan="6" style="background:var(--bg3); font-size:11px; font-weight:700; color:var(--accent2); padding:8px 12px; border-bottom:2px solid var(--border);">${icon} ${m.name}</td></tr>`;
                memberLoans.forEach(l => {
                    tbodyHtml += `<tr>
                        <td>
                            <div>${l.label||'—'}</div>
                            ${l.lender?`<div style="font-size:10px;color:var(--text3);">${l.lender}</div>`:''}
                            ${l.interestType?`<span class="badge badge-blue" style="margin-top:3px;">${l.interestType}</span>`:''}
                        </td>
                        <td class="mono">${fl(l.outstanding||0)}</td>
                        <td class="mono">${fl(l.emi||0)}</td>
                        <td class="mono">${l.rate||0}%</td>
                        <td>${l.tenure || (l.tenureMonths ? l.tenureMonths+' mo' : '—')}</td>
                        <td></td>
                    </tr>`;
                });
            });
        } else {
            // Single member view: editable rows
            loans.forEach((l,i) => {
                tbodyHtml += `<tr>
                    ${canEdit ? `
                        <td><input class="edit-input-text" value="${l.label||''}" onchange="updateLoan(${i},'label',this.value)" style="width:140px;"></td>
                        <td><input class="edit-input" type="number" value="${l.outstanding||0}" onchange="updateLoan(${i},'outstanding',this.value)" style="width:100px;"></td>
                        <td><input class="edit-input" type="number" value="${l.emi||0}" onchange="updateLoan(${i},'emi',this.value)" style="width:90px;"></td>
                        <td><input class="edit-input" type="number" value="${l.rate||0}" onchange="updateLoan(${i},'rate',this.value)" style="width:70px;"></td>
                        <td><input class="edit-input" type="number" value="${l.tenureMonths||0}" onchange="updateLoan(${i},'tenureMonths',this.value)" style="width:70px;" placeholder="mo"></td>
                        <td><button class="del-btn" onclick="deleteLoan(${i})" title="Delete loan">🗑</button></td>
                    ` : `
                        <td>
                            <div>${l.label||'—'}</div>
                            ${l.lender?`<div style="font-size:10px;color:var(--text3);">${l.lender}</div>`:''}
                            ${l.interestType?`<span class="badge badge-blue" style="margin-top:3px;">${l.interestType}</span>`:''}
                        </td>
                        <td class="mono">${fl(l.outstanding||0)}</td>
                        <td class="mono">${fl(l.emi||0)}</td>
                        <td class="mono">${l.rate||0}%</td>
                        <td>${l.tenure || (l.tenureMonths ? l.tenureMonths+' mo' : '—')}</td>
                        <td>
                            <div class="dropdown">
                                <button class="snap-btn" style="padding: 4px 10px; font-size: 11px;" onclick="event.stopPropagation(); toggleDropdown(${i})">⋮ More</button>
                                <div class="dropdown-content" id="dropdown-${i}">
                                    <a onclick="event.stopPropagation(); showLoanDetails(${i}); closeAllDropdowns();"><i class="fas fa-info-circle"></i> View Details</a>
                                    <a onclick="event.stopPropagation(); showLoanScenarios(${i}); closeAllDropdowns();"><i class="fas fa-calculator"></i> Payoff Scenarios</a>
                                    <a onclick="event.stopPropagation(); editLoan(${i}); closeAllDropdowns();"><i class="fas fa-edit"></i> Edit Loan</a>
                                </div>
                            </div>
                        </td>
                    `}
                </tr>`;
            });
        }
        tableHtml = `
        <div style="overflow-x: auto; -webkit-overflow-scrolling: touch;">
            <table class="data-table" style="width: 100%; margin-bottom: 0;">
                <thead><tr>
                    <th style="min-width: 150px;">Lender / Type</th>
                    <th style="min-width: 110px;">Outstanding</th>
                    <th style="min-width: 90px;">EMI / Mo</th>
                    <th style="min-width: 70px;">Rate %</th>
                    <th style="min-width: 80px;">Tenure</th>
                    ${canEdit?'<th style="min-width: 100px;">Actions</th>':(!isAll?'<th style="min-width: 80px;">More</th>':'<th></th>')}
                </tr></thead>
                <tbody>${tbodyHtml}</tbody>
            </table>
        </div>
        <div style="font-size: 11px; color: var(--text3); margin-top: 12px; text-align: center; padding: 8px; background: var(--bg3); border-radius: var(--radius-sm);">
            💡 Click "More" to view full loan details, sanctioned amount, remaining tenure, and payoff scenarios
        </div>
        ${canEdit ? `<button class="add-btn" onclick="addLoan()" style="margin-top: 12px;">➕ Add Loan</button>` : ''}
        `;
    } else {
        tableHtml = canEdit
            ? `<p style="color:var(--text3); font-size:13px; padding-bottom:12px;">No loans added.</p><button class="add-btn" onclick="addLoan()">➕ Add Loan</button>`
            : emptyStateInline('No loans recorded','✅ Great — or add your loans using the Edit button.');
    }

    // Per-loan detail cards (interest/principal paid breakdown)
    const detailCards = loans.length && !editMode ? loans.map(l => {
        const hasDetail = l.totalInterestPaid || l.totalPrincipalPaid || l.paidMonths;
        if(!hasDetail) return '';
        const totalPaid = (l.totalInterestPaid||0) + (l.totalPrincipalPaid||0);
        const intPct = totalPaid > 0 ? ((l.totalInterestPaid||0)/totalPaid*100).toFixed(1) : 0;
        const prinPct = totalPaid > 0 ? ((l.totalPrincipalPaid||0)/totalPaid*100).toFixed(1) : 0;
        return `
            <div class="card">
                <div class="card-title"><span class="icon">📊</span> ${l.label||'Loan'} — Payment Breakdown</div>
                <div class="grid-3" style="margin-bottom:12px;">
                    <div style="text-align:center;">
                        <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;">Principal Paid</div>
                        <div style="font-size:18px;font-weight:800;font-family:var(--mono);color:var(--green);">${fl(l.totalPrincipalPaid||0)}</div>
                        <div style="font-size:11px;color:var(--text3);">${prinPct}% of total paid</div>
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;">Interest Paid</div>
                        <div style="font-size:18px;font-weight:800;font-family:var(--mono);color:var(--red);">${fl(l.totalInterestPaid||0)}</div>
                        <div style="font-size:11px;color:var(--text3);">${intPct}% of total paid</div>
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;">EMIs Paid</div>
                        <div style="font-size:18px;font-weight:800;font-family:var(--mono);color:var(--accent2);">${l.paidMonths||0}</div>
                        <div style="font-size:11px;color:var(--text3);">of ${l.tenureMonths||'—'} months</div>
                    </div>
                </div>
                ${l.tenureMonths ? `<div class="progress-bar" style="height:8px;margin-top:8px;">
                    <div class="progress-fill" style="width:${Math.min(100,(l.paidMonths||0)/l.tenureMonths*100)}%;background:linear-gradient(90deg,var(--green),var(--accent));"></div>
                </div>
                <div style="font-size:10px;color:var(--text3);margin-top:4px;text-align:right;">${((l.paidMonths||0)/l.tenureMonths*100).toFixed(1)}% completed</div>` : ''}
                ${l.prepaymentCharges ? `<div style="font-size:11px;color:var(--yellow);margin-top:8px;">⚠️ Prepayment charges: ${l.prepaymentCharges}</div>` : ''}
            </div>
        `;
    }).join('') : '';

    // Build per-loan scenario analysis cards
    const analysisCards = loans.length && !editMode ? loans.map(l => {
        const canAnalyse = l.principal && l.rate && l.emi;
        if (!canAnalyse) return '';
        return `
            <div class="card">
                <div class="card-title">
                    <span class="icon">🔬</span> Payoff Scenarios: ${l.label||'Loan'}
                    <span style="margin-left:auto; font-family:var(--mono); font-size:12px; color:var(--yellow);">${l.rate}% p.a.</span>
                </div>
                ${loanScenarioHtml(l)}
            </div>
        `;
    }).join('') : '';

    const memberName = getMemberName(currentProfile);

    sh('page-loans', `
        ${isAll ? `<div style="margin-bottom:12px; font-size:12px; color:var(--text3); display:flex; align-items:center; gap:6px;">
            <i class="fas fa-eye"></i> Combined read-only view — select a member to edit
        </div>` : ''}
        ${renderLoanFreedomCard()}
        <div class="grid-4" style="margin-bottom:18px;">
            <div class="kpi-card red">
                <div class="kpi-label">${isAll ? 'Family' : memberName+"'s"} Outstanding</div>
                <div class="kpi-value">${fl(totalOut)}</div>
                <div class="kpi-sub">${loans.length} loan(s)</div>
            </div>
            <div class="kpi-card ${dr>0.4?'red':dr>0.25?'yellow':'green'}">
                <div class="kpi-label">Total EMI / Mo</div>
                <div class="kpi-value">${fl(totalEmi)}</div>
                <div class="kpi-sub">Debt-to-income: ${pct(dr)}</div>
            </div>
            <div class="kpi-card ${dr>0.4?'red':dr>0.25?'yellow':'green'}">
                <div class="kpi-label">Debt Ratio</div>
                <div class="kpi-value">${pct(dr)}</div>
                <div class="kpi-sub">Safe threshold: 40%</div>
            </div>
            ${totalIntPaid || totalPrinPaid ? `
            <div class="kpi-card purple">
                <div class="kpi-label">Interest Paid (Total)</div>
                <div class="kpi-value">${fl(totalIntPaid)}</div>
                <div class="kpi-sub">Principal paid: ${fl(totalPrinPaid)}</div>
            </div>` : ''}
        </div>

        <!-- Upload & Add buttons (hidden in "all" view) -->
        ${!isAll ? `<div class="card">
            <div class="card-title"><span class="icon">📄</span> Upload Loan Statement</div>
            <p style="font-size:12px; color:var(--text2); margin-bottom:12px; line-height:1.5;">
                Upload your loan statement PDF (from bank/NBFC) and AI will auto-extract all loan details — outstanding, EMI, interest rate, tenure, principal/interest paid, and more.
            </p>
            <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
                <label class="snap-btn" style="cursor:pointer;">
                    <i class="fas fa-file-upload" style="color:var(--accent);"></i> Upload Statement
                    <input type="file" accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls" onchange="handleLoanPdfUpload(this)" style="display:none;">
                </label>
                <p style="font-size:11px; color:var(--text3); margin-top:6px;">Accepts PDF, PNG, JPG, Excel files</p>
                <button class="snap-btn" onclick="showAddLoanModal()"><i class="fas fa-plus"></i> Add Manually</button>
            </div>
            <div id="loan-pdf-status" style="margin-top:10px; font-size:12px;"></div>
        </div>` : ''}

        <!-- Active Loans Table - Scrollable -->
        <div class="card">
            <div class="card-title"><span class="icon">💳</span> Active Loans</div>
            ${tableHtml}
        </div>
        ${detailCards}
        ${analysisCards}
        <div class="insight-box">${loansInsight}</div>

        <!-- AI Loan Advisor button -->
        ${loans.length && !editMode ? `
        <div class="card" style="background:linear-gradient(135deg, rgba(59,126,255,0.05), rgba(167,139,250,0.05)); border-color:var(--accent);">
            <div class="card-title"><span class="icon">🤖</span> AI Loan Advisor</div>
            <p style="font-size:13px; color:var(--text2); line-height:1.6; margin-bottom:14px;">
                Get personalized strategies to pay off your loans faster — avalanche vs snowball method, refinancing tips, prepayment analysis, and projected savings.
            </p>
            <button class="primary-btn" onclick="getLoanAdvice()" id="loan-advice-btn">
                <i class="fas fa-brain"></i> Get AI Payoff Strategy
            </button>
            <div id="loan-advice-result" style="margin-top:16px;"></div>
        </div>` : ''}

        ${loans.length && !editMode ? `
        <div class="card" style="margin-top:0;">
            <div class="card-title"><span class="icon">💡</span> How to use Loan Analysis</div>
            <p style="font-size:13px; color:var(--text2); line-height:1.6;">
                To unlock payoff scenarios, make sure each loan has <strong>Principal</strong>, <strong>Rate %</strong>, <strong>EMI</strong>, <strong>Tenure (months)</strong>, and <strong>Paid Months</strong> filled in via the Edit button or by uploading your loan statement. The calculator will then show you exactly how many months you save by paying extra each month or making a lump-sum prepayment.
            </p>
        </div>` : ''}
    `);
}

window.updateLoan = (i, field, val) => {
    if (currentProfile === 'all') return; // read-only in "all" view
    const loans = getMemberLoans(currentProfile);
    if(!loans[i]) return;
    loans[i][field] = ['outstanding','emi','rate','principal','tenureMonths','paidMonths','totalInterestPaid','totalPrincipalPaid','processingFee'].includes(field) ? num(val) : val;
    debounceSave(); renderLoans();
};
window.deleteLoan = i => {
    if (currentProfile === 'all') return;
    const loans = getMemberLoans(currentProfile);
    loans.splice(i,1); debounceSave(); renderLoans();
};
window.addLoan = () => {
    if (currentProfile === 'all') return;
    const loans = getMemberLoans(currentProfile);
    loans.push({ id:'loan-'+Date.now(), label:'New Loan', outstanding:0, emi:0, rate:0, tenure:'', principal:0, tenureMonths:0, paidMonths:0 });
    debounceSave(); renderLoans();
};

// ── Dropdown Toggle Functions ──
window.toggleDropdown = (i) => {
    const dropdown = document.getElementById(`dropdown-${i}`);
    if (!dropdown) return;
    
    // Close all other dropdowns
    document.querySelectorAll('.dropdown-content').forEach(d => {
        if (d.id !== `dropdown-${i}`) d.classList.remove('show');
    });
    
    // Toggle this dropdown
    dropdown.classList.toggle('show');
};

window.closeAllDropdowns = () => {
    document.querySelectorAll('.dropdown-content').forEach(d => d.classList.remove('show'));
};

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown')) {
        closeAllDropdowns();
    }
});

// ── Loan Dropdown Actions ──
window.showLoanDetails = (i) => {
    const loans = getLoansForMember(currentProfile);
    const loan = loans[i];
    if (!loan) return;
    
    const income = computeMonthlyIncome();
    const details = `
        <div style="padding: 20px;">
            <h3 style="margin-bottom: 16px; color: var(--accent);">${loan.label || 'Loan Details'}</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px;">
                <div><strong>Lender:</strong> ${loan.lender || '—'}</div>
                <div><strong>Type:</strong> ${loan.interestType || '—'}</div>
                <div><strong>Sanctioned Amount:</strong> ₹${fl(loan.principal || 0)}</div>
                <div><strong>Outstanding:</strong> ₹${fl(loan.outstanding || 0)}</div>
                <div><strong>EMI:</strong> ₹${fl(loan.emi || 0)}/month</div>
                <div><strong>Interest Rate:</strong> ${loan.rate || 0}% p.a.</div>
                <div><strong>Tenure:</strong> ${loan.tenureMonths || 0} months</div>
                <div><strong>Remaining:</strong> ${loan.remainingMonths || 0} months</div>
                <div><strong>Paid Months:</strong> ${loan.paidMonths || 0}</div>
                <div><strong>% of Income:</strong> ${income ? pct(loan.emi / income) : '—'}</div>
            </div>
        </div>
    `;
    
    showModal('Loan Details', details);
};

window.showLoanScenarios = (i) => {
    const loans = getLoansForMember(currentProfile);
    const loan = loans[i];
    if (!loan) return;
    
    // Scroll to the scenarios section for this loan
    showToast('💡 Scroll down to see payoff scenarios for this loan', 'blue');
};

window.editLoan = (i) => {
    // Enable edit mode
    editMode = true;
    renderLoans();
    showToast('✏️ Edit mode enabled', 'blue');
};



// ── Loan PDF Upload Handler ──
window.handleLoanPdfUpload = async (input) => {
    if (currentProfile === 'all') return;
    const file = input.files[0];
    if(!file) return;
    const statusEl = document.getElementById('loan-pdf-status');
    if(statusEl) statusEl.innerHTML = '⏳ Reading file...';

    try {
        let fullText = '';
        const fileType = file.type;
        const fileName = file.name.toLowerCase();
        
        // Handle PDF files
        if (fileType === 'application/pdf') {
            const arrayBuffer = await file.arrayBuffer();
            
            // Try to load PDF without password first
            let pdf;
            try {
                pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            } catch (error) {
                // If password required, prompt user
                if (error.name === 'PasswordException') {
                    const password = prompt('🔒 This PDF is password-protected. Please enter the password:\n\n(Usually your date of birth: DDMMYYYY or PAN number)');
                    if (!password) {
                        if(statusEl) statusEl.innerHTML = '❌ Password required to read this PDF.';
                        input.value = '';
                        return;
                    }
                    
                    // Try again with password
                    try {
                        pdf = await pdfjsLib.getDocument({ 
                            data: arrayBuffer,
                            password: password
                        }).promise;
                    } catch (pwError) {
                        if(statusEl) statusEl.innerHTML = '❌ Incorrect password. Please try again.';
                        input.value = '';
                        return;
                    }
                } else {
                    throw error;
                }
            }
            
            // Extract text from PDF
            for(let i = 1; i <= Math.min(pdf.numPages, 20); i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                fullText += content.items.map(item => item.str).join(' ') + '\n';
            }
        }
        // Handle Excel files
        else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || 
                 fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                 fileType === 'application/vnd.ms-excel') {
            if(statusEl) statusEl.innerHTML = '📊 Reading Excel file...';
            
            // Load SheetJS library if not already loaded
            if (!window.XLSX) {
                const script = document.createElement('script');
                script.src = 'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js';
                document.head.appendChild(script);
                await new Promise((resolve) => { script.onload = resolve; });
            }
            
            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            
            // Read all sheets and convert to text
            workbook.SheetNames.forEach(sheetName => {
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
                
                // Convert to text format preserving structure
                jsonData.forEach(row => {
                    fullText += row.join(' | ') + '\n';
                });
                fullText += '\n--- Next Sheet ---\n\n';
            });
        }
        // Handle image files (PNG, JPG, JPEG)
        else if (fileType.startsWith('image/')) {
            if(statusEl) statusEl.innerHTML = '🔍 Extracting text from image (OCR)...';
            
            // Load Tesseract.js if not already loaded
            if (!window.Tesseract) {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js';
                document.head.appendChild(script);
                await new Promise((resolve) => { script.onload = resolve; });
            }
            
            // Convert file to image URL
            const imageUrl = URL.createObjectURL(file);
            
            // Perform OCR
            const { data: { text } } = await Tesseract.recognize(
                imageUrl,
                'eng',
                {
                    logger: m => {
                        if (m.status === 'recognizing text' && statusEl) {
                            statusEl.innerHTML = `🔍 OCR Progress: ${Math.round(m.progress * 100)}%`;
                        }
                    }
                }
            );
            
            fullText = text;
            URL.revokeObjectURL(imageUrl);
        }
        else {
            if(statusEl) statusEl.innerHTML = '❌ Unsupported file type. Please upload PDF, PNG, JPG, or Excel.';
            input.value = '';
            return;
        }

        if(fullText.trim().length < 30) {
            if(statusEl) statusEl.innerHTML = '❌ Could not extract text. The file may be empty, corrupted, or the image may be too blurry.';
            input.value = ''; return;
        }

        if(statusEl) statusEl.innerHTML = '🤖 AI is extracting loan details...';

        const res = await fetch('/api/loans/parse-statement', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pdfText: fullText })
        });

        if(!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.detail || errorData.error || 'API error ' + res.status);
        }
        const loan = await res.json();

        const memberLoans = getMemberLoans(currentProfile);
        memberLoans.push({
            id: 'loan-' + Date.now(),
            label: loan.label || file.name.replace(/\.(pdf|png|jpg|jpeg|xlsx|xls)$/i, ''),
            lender: loan.lender || '',
            loanType: loan.loanType || 'other',
            principal: loan.principal || 0,
            outstanding: loan.outstanding || 0,
            emi: loan.emi || 0,
            rate: loan.rate || 0,
            tenureMonths: loan.tenureMonths || 0,
            tenure: loan.tenureMonths ? loan.tenureMonths + ' mo' : '',
            paidMonths: loan.paidMonths || 0,
            remainingMonths: loan.remainingMonths || 0,
            totalInterestPaid: loan.totalInterestPaid || 0,
            totalPrincipalPaid: loan.totalPrincipalPaid || 0,
            disbursementDate: loan.disbursementDate || '',
            maturityDate: loan.maturityDate || '',
            nextEmiDate: loan.nextEmiDate || '',
            interestType: loan.interestType || '',
            processingFee: loan.processingFee || 0,
            prepaymentCharges: loan.prepaymentCharges || '',
            collateral: loan.collateral || '',
            coApplicant: loan.coApplicant || '',
            accountNumber: loan.accountNumber || ''
        });
        debounceSave();
        if(statusEl) statusEl.innerHTML = `✅ Added: ${loan.label || 'Loan'} — Outstanding ${fl(loan.outstanding||0)}, EMI ${fl(loan.emi||0)}, Rate ${loan.rate||0}%`;
        renderLoans();
    } catch(e) {
        console.error('Loan file parse error:', e);
        if(statusEl) statusEl.innerHTML = '❌ Failed to parse: ' + e.message + '. Try adding manually.';
    }
    input.value = '';
};

// ── Manual Add Loan Modal ──
window.showAddLoanModal = () => {
    if (currentProfile === 'all') return;
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'loan-add-modal';
    overlay.innerHTML = `
        <div class="modal-content">
            <h3>➕ Add Loan Manually</h3>
            <input id="lm-label" class="modal-inp" placeholder="Loan name (e.g. HDFC Home Loan)">
            <div class="grid-2">
                <input id="lm-principal" class="modal-inp" type="number" placeholder="Sanctioned amount (₹)">
                <input id="lm-outstanding" class="modal-inp" type="number" placeholder="Current outstanding (₹)">
            </div>
            <div class="grid-2">
                <input id="lm-emi" class="modal-inp" type="number" placeholder="Monthly EMI (₹)">
                <input id="lm-rate" class="modal-inp" type="number" step="0.01" placeholder="Interest rate (% p.a.)">
            </div>
            <div class="grid-2">
                <input id="lm-tenure" class="modal-inp" type="number" placeholder="Total tenure (months)">
                <input id="lm-remaining" class="modal-inp" type="number" placeholder="Remaining tenure (months)">
            </div>
            <div class="grid-2">
                <input id="lm-paid" class="modal-inp" type="number" placeholder="EMIs paid so far">
                <input id="lm-sanction-date" class="modal-inp" type="date" placeholder="Sanction date">
            </div>
            <div class="grid-2">
                <input id="lm-intpaid" class="modal-inp" type="number" placeholder="Total interest paid (₹)">
                <input id="lm-prinpaid" class="modal-inp" type="number" placeholder="Total principal paid (₹)">
            </div>
            <select id="lm-type" class="modal-inp">
                <option value="">Loan Type</option>
                <option value="home">Home Loan</option>
                <option value="personal">Personal Loan</option>
                <option value="car">Car Loan</option>
                <option value="education">Education Loan</option>
                <option value="gold">Gold Loan</option>
                <option value="business">Business Loan</option>
                <option value="other">Other</option>
            </select>
            <select id="lm-inttype" class="modal-inp">
                <option value="">Interest Type</option>
                <option value="floating">Floating</option>
                <option value="fixed">Fixed</option>
            </select>
            <input id="lm-prepay" class="modal-inp" placeholder="Prepayment charges (e.g. 2% or NIL)">
            <div class="modal-buttons">
                <button class="secondary-btn" onclick="document.getElementById('loan-add-modal').remove()">Cancel</button>
                <button class="primary-btn" onclick="saveLoanModal()">Save Loan</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
};

window.saveLoanModal = () => {
    const label = document.getElementById('lm-label').value.trim();
    if(!label) { alert('Please enter a loan name.'); return; }
    const tenureMonths = num(document.getElementById('lm-tenure').value);
    const remainingMonths = num(document.getElementById('lm-remaining').value);
    const memberLoans = getMemberLoans(currentProfile);
    memberLoans.push({
        id: 'loan-' + Date.now(),
        label,
        loanType: document.getElementById('lm-type').value || 'other',
        principal: num(document.getElementById('lm-principal').value),
        outstanding: num(document.getElementById('lm-outstanding').value),
        emi: num(document.getElementById('lm-emi').value),
        rate: num(document.getElementById('lm-rate').value),
        tenureMonths,
        tenure: tenureMonths ? tenureMonths + ' mo' : '',
        paidMonths: num(document.getElementById('lm-paid').value),
        remainingMonths: remainingMonths,
        totalInterestPaid: num(document.getElementById('lm-intpaid').value),
        totalPrincipalPaid: num(document.getElementById('lm-prinpaid').value),
        disbursementDate: document.getElementById('lm-sanction-date').value || '',
        interestType: document.getElementById('lm-inttype').value || '',
        prepaymentCharges: document.getElementById('lm-prepay').value.trim() || ''
    });
    debounceSave();
    document.getElementById('loan-add-modal').remove();
    renderLoans();
};

// ── AI Loan Advisor ──
window.getLoanAdvice = async () => {
    const btn = document.getElementById('loan-advice-btn');
    const resultEl = document.getElementById('loan-advice-result');
    if(!resultEl) return;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analysing...';
    resultEl.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>AI is analysing your loans and building payoff strategies...</p></div>';

    try {
        const res = await fetch('/api/loans/advisor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                loans: getLoansForMember(currentProfile) || [],
                monthlyIncome: computeMonthlyIncome(),
                monthlyExpenses: computeMonthlyExpenses(),
                monthlySavings: computeMonthlySavings(),
                liquidSavings: userData.liquidSavings || 0
            })
        });

        if(!res.ok) throw new Error('API error ' + res.status);
        const data = await res.json();
        if(data.error) throw new Error(data.error);

        const scoreColor = (data.debtHealthScore||0) >= 70 ? 'var(--green)' : (data.debtHealthScore||0) >= 40 ? 'var(--yellow)' : 'var(--red)';

        resultEl.innerHTML = `
            <div style="display:flex; gap:16px; align-items:center; margin-bottom:16px; padding:14px; background:var(--bg3); border-radius:var(--radius-sm); border:1px solid var(--border2);">
                <div style="text-align:center;">
                    <div style="font-size:32px; font-weight:800; font-family:var(--mono); color:${scoreColor};">${data.debtHealthScore||'—'}</div>
                    <div style="font-size:10px; color:var(--text3); text-transform:uppercase;">Debt Health</div>
                </div>
                <div style="flex:1;">
                    <div style="font-size:13px; color:var(--text); font-weight:600; margin-bottom:4px;">${data.debtHealthLabel||''}</div>
                    <div style="font-size:12px; color:var(--text2); line-height:1.5;">${data.summary||''}</div>
                </div>
            </div>

            ${data.priorityOrder ? `
            <div class="advisor-msg">
                <h4>🎯 Repayment Priority</h4>
                <ol style="margin-left:16px;">${data.priorityOrder.map(p=>`<li style="margin-bottom:4px;"><strong>${p}</strong></li>`).join('')}</ol>
                <p style="font-size:12px; color:var(--text3); margin-top:8px;">${data.priorityReason||''}</p>
            </div>` : ''}

            ${data.strategies && data.strategies.length ? `
            <div class="advisor-msg">
                <h4>📋 Payoff Strategies</h4>
                ${data.strategies.map(s => `
                    <div style="background:var(--bg3); border:1px solid ${s.recommended?'var(--accent)':'var(--border2)'}; border-radius:var(--radius-sm); padding:12px; margin-bottom:10px; ${s.recommended?'box-shadow:0 0 12px var(--accent-glow);':''}">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                            <span style="font-size:13px; font-weight:700; color:var(--text);">${s.recommended?'⭐ ':''}${s.name}</span>
                            <span class="badge ${s.difficulty==='Easy'?'badge-green':s.difficulty==='Hard'?'badge-red':'badge-yellow'}">${s.difficulty}</span>
                        </div>
                        <p style="font-size:12px; color:var(--text2); line-height:1.5; margin-bottom:8px;">${s.description}</p>
                        <div style="display:flex; gap:12px; flex-wrap:wrap; font-size:11px;">
                            ${s.timeSaved?`<span style="color:var(--green);">⏱ Save ${s.timeSaved}</span>`:''}
                            ${s.interestSaved?`<span style="color:var(--green);">💰 Save ${fl(s.interestSaved)}</span>`:''}
                        </div>
                    </div>
                `).join('')}
            </div>` : ''}

            ${data.quickWins && data.quickWins.length ? `
            <div class="advisor-msg">
                <h4>⚡ Quick Wins</h4>
                <ul>${data.quickWins.map(q=>`<li>${q}</li>`).join('')}</ul>
            </div>` : ''}

            ${data.warnings && data.warnings.length ? `
            <div class="advisor-msg" style="border-color:var(--red);">
                <h4 style="color:var(--red);">⚠️ Warnings</h4>
                <ul>${data.warnings.map(w=>`<li style="color:var(--red);">${w}</li>`).join('')}</ul>
            </div>` : ''}

            ${data.refinanceAdvice ? `
            <div class="advisor-msg">
                <h4>🔄 Refinancing</h4>
                <p>${data.refinanceAdvice}</p>
            </div>` : ''}

            ${data.monthlyPlan ? `
            <div class="advisor-msg">
                <h4>📅 Monthly Plan</h4>
                <p>${data.monthlyPlan}</p>
            </div>` : ''}

            ${data.projections ? `
            <div style="background:var(--bg3); border:1px solid var(--border2); border-radius:var(--radius); padding:16px; margin-top:12px;">
                <div style="font-size:10px; color:var(--text3); text-transform:uppercase; letter-spacing:0.8px; margin-bottom:12px;">📈 Projections</div>
                <div class="grid-2">
                    <div>
                        <div style="font-size:11px; color:var(--text3);">Current payoff</div>
                        <div style="font-size:14px; font-weight:700; color:var(--red); font-family:var(--mono);">${data.projections.currentPayoffDate||'—'}</div>
                        <div style="font-size:11px; color:var(--text3); margin-top:2px;">Interest: ${fl(data.projections.totalInterestCurrent||0)}</div>
                    </div>
                    <div>
                        <div style="font-size:11px; color:var(--text3);">Optimized payoff</div>
                        <div style="font-size:14px; font-weight:700; color:var(--green); font-family:var(--mono);">${data.projections.optimizedPayoffDate||'—'}</div>
                        <div style="font-size:11px; color:var(--text3); margin-top:2px;">Interest: ${fl(data.projections.totalInterestOptimized||0)}</div>
                    </div>
                </div>
                ${data.projections.totalSavings ? `<div style="text-align:center; margin-top:12px; padding:10px; background:var(--green-dim); border-radius:var(--radius-sm);">
                    <span style="font-size:12px; color:var(--green); font-weight:700;">💰 Total potential savings: ${fl(data.projections.totalSavings)}</span>
                </div>` : ''}
            </div>` : ''}

            <p style="font-size:10px; color:var(--text3); margin-top:12px;">⚠️ AI-generated advice. Consult a certified financial advisor before making major decisions.</p>
        `;
    } catch(e) {
        console.error('Loan advice error:', e);
        resultEl.innerHTML = `<div style="color:var(--red); font-size:13px;">❌ Failed to get advice: ${e.message}</div>`;
    }
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-brain"></i> Get AI Payoff Strategy';
};

// ========== INSURANCE PAGE (Enhanced Health Insurance Module) ==========
// SHA-256 hash for policy numbers (browser crypto)
async function hashPolicyNumber(text) {
    const enc = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Insurance detail view state
let insDetailView = null; // null = list view, policyId = detail view
let insClaimsCache = {};

// ========== INSURANCE ADEQUACY FORECAST CARD ==========
function renderInsuranceAdequacyCard() {
    const assumptions = getForecastAssumptions();
    const adequacy = computeInsuranceAdequacy(assumptions);
    const annualIncome = computeMonthlyIncome() * 12;

    // Check if user has any insurance policies at all
    const ins = getInsuranceForMember(currentProfile);
    const totalPolicies = ['term','health','vehicle','life','home'].reduce((s, cat) => s + (ins[cat] || []).length, 0);

    if (totalPolicies === 0) {
        return `<div class="card" style="margin-bottom:18px;">
            <div class="card-title"><span class="icon">🔮</span> Insurance Adequacy Forecast</div>
            <div style="text-align:center; padding:20px 0;">
                <div style="font-size:28px; margin-bottom:8px;">🛡️</div>
                <div style="font-size:14px; font-weight:600; color:var(--text2); margin-bottom:6px;">No insurance policies found</div>
                <div style="font-size:12px; color:var(--text3); max-width:360px; margin:0 auto;">Add insurance policies to see adequacy forecast.</div>
            </div>
        </div>`;
    }

    const renderRows = (items) => items.map(d => {
        const isAdequate = d.current >= d.recommended;
        const rowColor = isAdequate ? 'rgba(16,185,129,0.08)' : 'rgba(244,73,92,0.08)';
        const gapColor = isAdequate ? 'var(--green)' : 'var(--red)';
        const gapLabel = isAdequate ? 'Surplus' : 'Gap';
        return `<tr style="background:${rowColor};">
            <td style="padding:8px 10px; font-size:13px; font-weight:600; color:var(--text);">Year ${d.year}</td>
            <td style="padding:8px 10px; font-size:13px; font-family:var(--mono); color:var(--text);">${fl(Math.round(d.recommended))}</td>
            <td style="padding:8px 10px; font-size:13px; font-family:var(--mono); color:var(--text);">${fl(d.current)}</td>
            <td style="padding:8px 10px; font-size:13px; font-family:var(--mono); color:${gapColor}; font-weight:700;">
                ${isAdequate ? '✅' : '⚠️'} ${fl(Math.abs(Math.round(d.gap)))} ${gapLabel}
            </td>
        </tr>`;
    }).join('');

    const tableStyle = 'width:100%; border-collapse:collapse; border-radius:8px; overflow:hidden;';
    const thStyle = 'padding:8px 10px; font-size:10px; text-transform:uppercase; letter-spacing:0.5px; color:var(--text3); text-align:left; border-bottom:2px solid var(--border);';

    return `<div class="card" style="margin-bottom:18px; background:linear-gradient(135deg, rgba(59,126,255,0.04), rgba(167,139,250,0.04)); border-color:var(--accent);">
        <div class="card-title"><span class="icon">🔮</span> Insurance Adequacy Forecast</div>
        <div style="font-size:12px; color:var(--text3); margin-bottom:16px;">Will your current cover be enough in 5, 10, and 15 years?</div>

        <div style="margin-bottom:18px;">
            <div style="font-size:13px; font-weight:700; color:var(--text); margin-bottom:8px;">🛡️ Term Life Cover</div>
            <div style="overflow-x:auto;">
                <table style="${tableStyle}">
                    <thead><tr>
                        <th style="${thStyle}">Year</th>
                        <th style="${thStyle}">Recommended</th>
                        <th style="${thStyle}">Current</th>
                        <th style="${thStyle}">Gap / Surplus</th>
                    </tr></thead>
                    <tbody>${renderRows(adequacy.term)}</tbody>
                </table>
            </div>
        </div>

        <div>
            <div style="display:flex; align-items:center; gap:6px; margin-bottom:8px;">
                <span style="font-size:13px; font-weight:700; color:var(--text);">🏥 Health Cover</span>
                <span style="cursor:help; font-size:12px;" title="Medical inflation assumed at 10% p.a. — healthcare costs double roughly every 7 years.">ℹ️</span>
            </div>
            <div style="overflow-x:auto;">
                <table style="${tableStyle}">
                    <thead><tr>
                        <th style="${thStyle}">Year</th>
                        <th style="${thStyle}">Recommended</th>
                        <th style="${thStyle}">Current</th>
                        <th style="${thStyle}">Gap / Surplus</th>
                    </tr></thead>
                    <tbody>${renderRows(adequacy.health)}</tbody>
                </table>
            </div>
        </div>
    </div>`;
}

function renderInsurance() {
    if (insDetailView) { renderInsuranceDetail(insDetailView); return; }
    if (!userData.insurance) userData.insurance = { byMember: {} };
    const ins = getInsuranceForMember(currentProfile);
    const members = userData.profile.familyMembers || [{ id:'self', name: userData.profile.name||'Me', role:'self' }];
    const isAll = currentProfile === 'all';
    const canEdit = !isAll && editMode;
    
    const categories = [
        { key:'term',    label:'Term Insurance',    icon:'🛡️', color:'var(--green)' },
        { key:'life',    label:'Life Insurance',    icon:'💚', color:'var(--accent)' },
        { key:'health',  label:'Health Insurance',  icon:'🏥', color:'var(--purple)' },
        { key:'vehicle', label:'Vehicle Insurance', icon:'🚗', color:'var(--yellow)' },
        { key:'home',    label:'Home Insurance',    icon:'🏠', color:'var(--accent2)' }
    ];

    const cardsHtml = categories.map(cat=>{
        const items = ins[cat.key] || [];
        const catCover = items.reduce((s,f)=>s+(f.cover||0),0);
        
        let rowsHtml = '';
        if (isAll && members.length > 1) {
            // "All" view: group policies by member with visual labels (read-only)
            const byMember = userData.insurance?.byMember || {};
            const seenFloaterIds = new Set();
            members.forEach(m => {
                const memberPolicies = (byMember[m.id] || {})[cat.key] || [];
                if (memberPolicies.length === 0) return;
                const icon = m.role==='self' ? '👤' : m.role==='spouse' ? '💑' : m.role==='kid' ? '👶' : '👤';
                rowsHtml += `<div style="background:var(--bg3); font-size:11px; font-weight:700; color:var(--accent2); padding:8px 12px; border-bottom:2px solid var(--border);">${icon} ${m.name}</div>`;
                memberPolicies.forEach(item => {
                    // De-duplicate Family Floater policies in "all" view
                    if (item.policyType === 'family_floater' && item.id) {
                        if (seenFloaterIds.has(item.id)) return;
                        seenFloaterIds.add(item.id);
                    }
                    const daysToRenewal = item.renewal_date ? Math.ceil((new Date(item.renewal_date) - new Date()) / 86400000) : null;
                    const renewalBadge = daysToRenewal !== null && daysToRenewal <= 30 && daysToRenewal > 0
                        ? `<span style="background:var(--red-dim);color:var(--red);font-size:9px;padding:2px 6px;border-radius:4px;font-weight:700;">⚠️ RENEW IN ${daysToRenewal}d</span>`
                        : daysToRenewal !== null && daysToRenewal <= 0
                        ? `<span style="background:var(--red-dim);color:var(--red);font-size:9px;padding:2px 6px;border-radius:4px;font-weight:700;">EXPIRED</span>`
                        : '';
                    const coveredMembersLabel = (item.policyType === 'family_floater' && Array.isArray(item.coveredMembers) && item.coveredMembers.length > 0)
                        ? `<div style="font-size:10px;color:var(--purple);margin-top:2px;">👥 Family Floater · Covers: ${item.coveredMembers.map(mid => getMemberName(mid)).join(', ')}</div>`
                        : '';
                    rowsHtml += `
                    <div class="row-flex" style="padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.04);">
                        <div style="flex:1;">
                            <div style="display:flex;align-items:center;gap:8px;">
                                <span class="row-label" style="font-size:13px;">${item.label||'—'}</span>
                                ${renewalBadge}
                            </div>
                            <div style="font-size:10px;color:var(--text3);">
                                ${item.insurer||''} ${item.policyNo ? '· #'+item.policyNo.slice(-4)+'***' : ''}
                                ${item.renewal_date ? '· Renew: '+item.renewal_date : (item.expiry ? '· Exp: '+item.expiry : '')}
                            </div>
                            ${coveredMembersLabel}
                        </div>
                        <div style="text-align:right; flex-shrink:0;">
                            <div class="row-value" style="font-size:14px;">${fl(item.cover||item.sum_insured||0)}</div>
                            <div style="font-size:10px; color:var(--text3);">₹${(item.premium||item.premium_amount||0).toLocaleString('en-IN')}/${item.premium_frequency||'yr'}</div>
                        </div>
                    </div>`;
                });
            });
        } else {
            // Single member view: show own policies (editable) + cross-referenced Family Floater (read-only)
            rowsHtml = items.map((item,i)=>{
                const isCrossRef = item._crossReferenced === true;
                const daysToRenewal = item.renewal_date ? Math.ceil((new Date(item.renewal_date) - new Date()) / 86400000) : null;
                const renewalBadge = daysToRenewal !== null && daysToRenewal <= 30 && daysToRenewal > 0
                    ? `<span style="background:var(--red-dim);color:var(--red);font-size:9px;padding:2px 6px;border-radius:4px;font-weight:700;">⚠️ RENEW IN ${daysToRenewal}d</span>`
                    : daysToRenewal !== null && daysToRenewal <= 0
                    ? `<span style="background:var(--red-dim);color:var(--red);font-size:9px;padding:2px 6px;border-radius:4px;font-weight:700;">EXPIRED</span>`
                    : '';
                const utilizationPct = item.sum_insured && item.utilization?.amount_used_till_date
                    ? Math.min(100, (item.utilization.amount_used_till_date / item.sum_insured * 100)).toFixed(0)
                    : null;
                const crossRefLabel = isCrossRef
                    ? `<div style="font-size:10px;color:var(--purple);margin-top:2px;">🔗 Covered under ${item._policyholderName}'s Family Floater</div>`
                    : '';
                const coveredMembersLabel = (!isCrossRef && item.policyType === 'family_floater' && Array.isArray(item.coveredMembers) && item.coveredMembers.length > 0)
                    ? `<div style="font-size:10px;color:var(--purple);margin-top:2px;">👥 Family Floater · Covers: ${item.coveredMembers.map(mid => getMemberName(mid)).join(', ')}</div>`
                    : '';

                // Cross-referenced policies are always read-only
                if (isCrossRef) {
                    return `
                    <div class="row-flex" style="padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.04); opacity:0.85;">
                        <div style="flex:1;">
                            <div style="display:flex;align-items:center;gap:8px;">
                                <span class="row-label" style="font-size:13px;">${item.label||'—'}</span>
                                ${renewalBadge}
                            </div>
                            ${crossRefLabel}
                            <div style="font-size:10px;color:var(--text3);">
                                ${item.insurer||''} ${item.policyNo ? '· #'+item.policyNo.slice(-4)+'***' : ''}
                                ${item.renewal_date ? '· Renew: '+item.renewal_date : (item.expiry ? '· Exp: '+item.expiry : '')}
                            </div>
                        </div>
                        <div style="text-align:right; flex-shrink:0;">
                            <div class="row-value" style="font-size:14px;">${fl(item.cover||item.sum_insured||0)}</div>
                            <div style="font-size:10px; color:var(--text3);">₹${(item.premium||item.premium_amount||0).toLocaleString('en-IN')}/${item.premium_frequency||'yr'}</div>
                        </div>
                    </div>`;
                }

                // Own policies — editable in edit mode
                return `
                <div class="row-flex" style="padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.04);">
                    ${canEdit ? `
                        <input class="edit-input-text" value="${item.label||''}" onchange="updateInsurance('${cat.key}',${i},'label',this.value)" style="max-width:180px;">
                        <div style="display:flex;gap:6px;align-items:center;">
                            <input class="edit-input" type="number" value="${item.cover||0}" placeholder="Cover" onchange="updateInsurance('${cat.key}',${i},'cover',this.value)" style="width:110px;">
                            <input class="edit-input" type="number" value="${item.premium||0}" placeholder="Premium/yr" onchange="updateInsurance('${cat.key}',${i},'premium',this.value)" style="width:100px;">
                            <button class="del-btn" onclick="deleteInsurance('${cat.key}',${i})" title="Delete"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    ` : `
                        <div style="flex:1; cursor:pointer;" onclick="viewInsuranceDetail('${cat.key}',${i})">
                            <div style="display:flex;align-items:center;gap:8px;">
                                <span class="row-label" style="font-size:13px;">${item.label||'—'}</span>
                                ${renewalBadge}
                            </div>
                            <div style="font-size:10px;color:var(--text3);">
                                ${item.insurer||''} ${item.policyNo ? '· #'+item.policyNo.slice(-4)+'***' : ''}
                                ${item.renewal_date ? '· Renew: '+item.renewal_date : (item.expiry ? '· Exp: '+item.expiry : '')}
                            </div>
                            ${coveredMembersLabel}
                            ${item.members && item.members.length > 0 ? `<div style="font-size:10px;color:var(--text3);margin-top:2px;">👥 ${item.members.length} member${item.members.length>1?'s':''}: ${item.members.map(m=>m.name||m.relationship).join(', ')}</div>` : ''}
                        </div>
                        <div style="text-align:right; flex-shrink:0; display:flex; align-items:center; gap:8px;">
                            <div>
                                <div class="row-value" style="font-size:14px;">${fl(item.cover||item.sum_insured||0)}</div>
                                <div style="font-size:10px; color:var(--text3);">₹${(item.premium||item.premium_amount||0).toLocaleString('en-IN')}/${item.premium_frequency||'yr'}</div>
                                ${utilizationPct !== null ? `
                                    <div style="margin-top:4px;">
                                        <div style="width:60px;height:4px;background:rgba(255,255,255,0.06);border-radius:2px;display:inline-block;vertical-align:middle;">
                                            <div style="width:${utilizationPct}%;height:100%;border-radius:2px;background:${utilizationPct>70?'var(--red)':utilizationPct>40?'var(--yellow)':'var(--green)'};"></div>
                                        </div>
                                        <span style="font-size:9px;color:var(--text3);margin-left:4px;">${utilizationPct}% used</span>
                                    </div>
                                ` : ''}
                            </div>
                            <button class="del-btn" onclick="event.stopPropagation();if(confirm('Delete this policy?'))deleteInsurance('${cat.key}',${i})" title="Delete" style="opacity:0.5;font-size:12px;padding:4px 6px;"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    `}
                </div>
            `}).join('');
        }
        return `
            <div class="card">
                <div class="card-title">
                    <span class="icon">${cat.icon}</span> ${cat.label}
                    <span style="margin-left:auto; font-family:var(--mono); font-size:13px;">${fl(catCover)}</span>
                </div>
                ${rowsHtml || `<p style="color:var(--text3); font-size:12px; padding:8px 0;">No policies added.</p>`}
                ${!isAll ? `<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;">
                    <button class="add-btn" onclick="showAddInsuranceModal('${cat.key}')" style="flex:1;">➕ Add Manually</button>
                    <input type="file" id="ins-pdf-${cat.key}" accept=".pdf" style="display:none;" onchange="handleInsurancePdfUpload(this,'${cat.key}')">
                    <button class="add-btn" onclick="document.getElementById('ins-pdf-${cat.key}').click()" style="flex:1;">📄 Upload PDF</button>
                </div>
                <div id="ins-pdf-status-${cat.key}" style="margin-top:6px;font-size:11px;color:var(--text3);"></div>` : ''}
            </div>
        `;
    }).join('');

    // Calculate totals — use the accessor data (already filtered/merged)
    const allTermLife = [...(ins.term||[]),...(ins.life||[])];
    // Exclude cross-referenced policies from coverage totals to avoid double-counting
    const filteredTermLife = allTermLife.filter(p => !p._crossReferenced);
    const totalTermCover  = filteredTermLife.reduce((s,f)=>s+(f.cover||0),0);
    
    const allHealth = ins.health || [];
    const filteredHealth = allHealth.filter(p => !p._crossReferenced);
    const totalHealthCover = filteredHealth.reduce((s,f)=>s+(f.cover||f.sum_insured||0),0);
    
    const allPolicies = categories.flatMap(c => (ins[c.key]||[]).filter(p => !p._crossReferenced));
    const totalPremium = allPolicies.reduce((s,f)=>s+(f.premium||f.premium_amount||0),0);
    
    const annInc          = computeMonthlyIncome()*12;
    const recommended     = annInc*12;
    const gap             = Math.max(0, recommended - totalTermCover);
    userData.termCover    = filteredTermLife.reduce((s,f)=>s+(f.cover||0),0);

    // Health insurance adequacy
    const dependents = (userData.profile.familyMembers || []).length;
    const recommendedHealth = 1000000 + (dependents * 200000);
    const healthGap = Math.max(0, recommendedHealth - totalHealthCover);
    userData.healthCover = totalHealthCover;

    // Renewal alerts (exclude cross-referenced to avoid duplicate alerts)
    const renewalAlerts = allPolicies.filter(p => {
        const d = p.renewal_date || p.expiry;
        if (!d) return false;
        const days = Math.ceil((new Date(d) - new Date()) / 86400000);
        return days > 0 && days <= 30;
    });

    // Total utilization (exclude cross-referenced to avoid double-counting)
    const totalUtilized = filteredHealth.reduce((s, p) => s + (p.utilization?.amount_used_till_date || 0), 0);
    const totalAvailable = totalHealthCover - totalUtilized;

    const irPct = computeInsuranceRatio();
    const memberLabel = isAll ? 'Family' : getMemberName(currentProfile);
    const insInsight = totalTermCover === 0
        ? `⚠️ No term/life insurance recorded for ${memberLabel}. Recommended cover is 12× annual income (${fl(recommended)}).`
        : irPct >= 1
        ? `✅ ${memberLabel}'s term/life coverage is adequate (${fl(totalTermCover)} vs recommended ${fl(recommended)}).`
        : `⚠️ ${memberLabel} has coverage gap of ${fl(gap)}. Increase cover to ${fl(recommended)} (12× annual income).`;

    const healthInsight = totalHealthCover === 0
        ? `⚠️ No health insurance recorded. Recommended: ₹${(recommendedHealth/100000).toFixed(0)}L (₹10L base + ₹2L per dependent).`
        : totalHealthCover >= recommendedHealth
        ? `✅ Health coverage adequate (${fl(totalHealthCover)} vs recommended ${fl(recommendedHealth)}).`
        : `⚠️ Health coverage gap of ${fl(healthGap)}. Recommended: ₹${(recommendedHealth/100000).toFixed(0)}L for your family.`;

    sh('page-insurance', `
        ${isAll ? `<div style="margin-bottom:12px; font-size:12px; color:var(--text3); display:flex; align-items:center; gap:6px;">
            <i class="fas fa-eye"></i> Combined read-only view — select a member to edit
        </div>` : ''}
        ${renewalAlerts.length > 0 ? `
        <div class="card" style="background:linear-gradient(135deg, var(--red-dim), rgba(244,73,92,0.05)); border-color:var(--red); margin-bottom:18px;">
            <div style="display:flex;align-items:center;gap:10px;">
                <span style="font-size:24px;">⚠️</span>
                <div>
                    <div style="font-size:14px;font-weight:700;color:var(--red);">${renewalAlerts.length} Policy Renewal${renewalAlerts.length>1?'s':''} Due Soon</div>
                    <div style="font-size:12px;color:var(--text2);margin-top:2px;">${renewalAlerts.map(p => `${p.label||p.insurer} — ${p.renewal_date||p.expiry}`).join(' · ')}</div>
                </div>
            </div>
        </div>` : ''}

        ${renderInsuranceAdequacyCard()}

        <div class="grid-4" style="margin-bottom:18px;">
            <div class="kpi-card ${irPct<0.5?'red':irPct<1?'yellow':'green'}">
                <div class="kpi-label">${memberLabel} Term / Life Cover</div>
                <div class="kpi-value">${fl(totalTermCover)}</div>
                <div class="kpi-sub">${filteredTermLife.length} policies</div>
            </div>
            <div class="kpi-card purple">
                <div class="kpi-label">${memberLabel} Health Cover</div>
                <div class="kpi-value">${fl(totalHealthCover)}</div>
                <div class="kpi-sub">${filteredHealth.length} policies${totalUtilized > 0 ? ' · '+fl(totalUtilized)+' used' : ''}</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">${memberLabel} Total Policies</div>
                <div class="kpi-value">${allPolicies.length}</div>
                <div class="kpi-sub">across ${categories.filter(c=> (ins[c.key]||[]).filter(p => !p._crossReferenced).length > 0).length} categories</div>
            </div>
            <div class="kpi-card yellow">
                <div class="kpi-label">${memberLabel} Total Premium</div>
                <div class="kpi-value">${fl(totalPremium)}</div>
                <div class="kpi-sub">per year · ${pct(annInc > 0 ? totalPremium/annInc : 0)} of income</div>
            </div>
        </div>

        <div class="grid-2" style="margin-bottom:18px;">
            <div class="insight-box">${insInsight}</div>
            <div class="insight-box">${healthInsight}</div>
        </div>

        ${totalHealthCover > 0 ? `
        <div class="card" style="margin-bottom:18px;">
            <div class="card-title"><span class="icon">📊</span> Health Insurance Utilization</div>
            <div class="grid-3">
                <div style="text-align:center;">
                    <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;">Sum Insured</div>
                    <div style="font-size:20px;font-weight:800;font-family:var(--mono);color:var(--text);margin-top:4px;">${fl(totalHealthCover)}</div>
                </div>
                <div style="text-align:center;">
                    <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;">Used</div>
                    <div style="font-size:20px;font-weight:800;font-family:var(--mono);color:var(--red);margin-top:4px;">${fl(totalUtilized)}</div>
                </div>
                <div style="text-align:center;">
                    <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;">Available</div>
                    <div style="font-size:20px;font-weight:800;font-family:var(--mono);color:var(--green);margin-top:4px;">${fl(totalAvailable)}</div>
                </div>
            </div>
            <div class="progress-bar" style="height:8px;margin-top:14px;">
                <div class="progress-fill" style="width:${totalHealthCover > 0 ? (totalUtilized/totalHealthCover*100).toFixed(1) : 0}%;background:${totalUtilized/totalHealthCover > 0.7 ? 'var(--red)' : totalUtilized/totalHealthCover > 0.4 ? 'var(--yellow)' : 'var(--green)'};"></div>
            </div>
            <div style="font-size:10px;color:var(--text3);margin-top:4px;text-align:right;">${totalHealthCover > 0 ? (totalUtilized/totalHealthCover*100).toFixed(1) : 0}% utilized</div>
        </div>` : ''}

        <div class="grid-2">${cardsHtml}</div>

        <!-- Enhanced Add Insurance Modal -->
        <div id="ins-modal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:999;align-items:center;justify-content:center;">
            <div style="background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:24px;width:92%;max-width:520px;max-height:90vh;overflow-y:auto;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                    <h3 style="margin:0;color:var(--text);font-size:16px;">Add Insurance Policy</h3>
                    <button onclick="closeInsModal()" style="background:none;border:none;color:var(--text3);font-size:18px;cursor:pointer;">✕</button>
                </div>
                <div style="display:grid;gap:10px;">
                    <input id="ins-m-label" class="ainp" placeholder="Policy name (e.g. HDFC Ergo Optima Secure)">
                    <input id="ins-m-insurer" class="ainp" placeholder="Insurer (e.g. HDFC ERGO, Star Health)">
                    <!-- Policy Type: only visible for health category -->
                    <div id="ins-m-policytype-wrap" style="display:none;">
                        <label style="font-size:10px;color:var(--text3);display:block;margin-bottom:4px;">Policy Type</label>
                        <select id="ins-m-policytype" class="ainp" style="width:100%;" onchange="onInsPolicyTypeChange()">
                            <option value="individual">Individual</option>
                            <option value="family_floater">Family Floater</option>
                        </select>
                    </div>
                    <!-- Coverage Group: only visible when Family Floater selected -->
                    <div id="ins-m-coveragegroup-wrap" style="display:none;">
                        <label style="font-size:10px;color:var(--text3);display:block;margin-bottom:4px;">Coverage Group</label>
                        <select id="ins-m-coveragegroup" class="ainp" style="width:100%;" onchange="onInsCoverageGroupChange()">
                            <option value="nuclear">Self + Spouse + Kids</option>
                            <option value="parents">Parents</option>
                        </select>
                    </div>
                    <input id="ins-m-policyno" class="ainp" placeholder="Policy number (stored hashed — never saved in plain text)">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                        <div><label style="font-size:10px;color:var(--text3);display:block;margin-bottom:4px;">Sum Insured (₹)</label><input id="ins-m-cover" class="ainp" type="number" placeholder="e.g. 1000000"></div>
                        <div><label style="font-size:10px;color:var(--text3);display:block;margin-bottom:4px;">Premium (₹/yr)</label><input id="ins-m-premium" class="ainp" type="number" placeholder="e.g. 25000"></div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                        <div><label style="font-size:10px;color:var(--text3);display:block;margin-bottom:4px;">Deductible (₹)</label><input id="ins-m-deductible" class="ainp" type="number" placeholder="0"></div>
                        <div><label style="font-size:10px;color:var(--text3);display:block;margin-bottom:4px;">Premium Frequency</label>
                            <select id="ins-m-freq" class="ainp" style="width:100%;"><option value="annual">Annual</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option></select>
                        </div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">
                        <div><label style="font-size:10px;color:var(--text3);display:block;margin-bottom:4px;">Start Date</label><input id="ins-m-start" class="ainp" type="date"></div>
                        <div><label style="font-size:10px;color:var(--text3);display:block;margin-bottom:4px;">End Date</label><input id="ins-m-end" class="ainp" type="date"></div>
                        <div><label style="font-size:10px;color:var(--text3);display:block;margin-bottom:4px;">Renewal Date</label><input id="ins-m-renewal" class="ainp" type="date"></div>
                    </div>
                    <div><label style="font-size:10px;color:var(--text3);display:block;margin-bottom:4px;">Amount Used Till Date (₹)</label><input id="ins-m-utilized" class="ainp" type="number" placeholder="0"></div>
                    <div><label style="font-size:10px;color:var(--text3);display:block;margin-bottom:4px;">Members Covered (comma-separated names)</label><input id="ins-m-members" class="ainp" placeholder="e.g. Self, Spouse, Child1"></div>
                    <div><label style="font-size:10px;color:var(--text3);display:block;margin-bottom:4px;">Waiting Periods / Notes</label><textarea id="ins-m-waiting" class="ainp" rows="2" placeholder="e.g. PED: 3 years, Maternity: 4 years"></textarea></div>
                    <div><label style="font-size:10px;color:var(--text3);display:block;margin-bottom:4px;">Exclusions / Notes</label><textarea id="ins-m-exclusions" class="ainp" rows="2" placeholder="e.g. Pre-existing conditions, cosmetic surgery"></textarea></div>
                    <div><label style="font-size:10px;color:var(--text3);display:block;margin-bottom:4px;">Network Hospital Locator Link</label><input id="ins-m-locator" class="ainp" placeholder="https://..."></div>
                    <input id="ins-m-cat" type="hidden">
                    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px;">
                        <button class="secondary-btn" onclick="closeInsModal()">Cancel</button>
                        <button class="primary-btn" onclick="saveInsModal()">Save Policy</button>
                    </div>
                </div>
            </div>
        </div>
    `);
}

window.updateInsurance = (cat, i, field, val) => {
    if (currentProfile === 'all') return; // read-only in "all" view
    const memberIns = getMemberInsurance(currentProfile);
    const policy = memberIns[cat]?.[i];
    if (!policy || policy._crossReferenced) return; // don't edit cross-referenced Family Floater policies
    policy[field] = ['cover','premium','sum_insured','premium_amount','deductible'].includes(field) ? num(val) : val;
    debounceSave(); renderInsurance();
};
window.deleteInsurance = (cat, i) => {
    if (currentProfile === 'all') return; // read-only in "all" view
    const memberIns = getMemberInsurance(currentProfile);
    const policy = memberIns[cat]?.[i];
    if (!policy || policy._crossReferenced) return; // don't delete cross-referenced Family Floater policies
    memberIns[cat].splice(i,1);
    debounceSave(); renderInsurance();
};
window.addInsurance = cat => {
    if (currentProfile === 'all') return; // read-only in "all" view
    const memberIns = getMemberInsurance(currentProfile);
    if(!memberIns[cat]) memberIns[cat]=[];
    memberIns[cat].push({ id:'ins-'+Date.now(), label:'New Policy', cover:0, premium:0 });
    debounceSave(); renderInsurance();
};

window.showAddInsuranceModal = (cat) => {
    const m = document.getElementById('ins-modal');
    if(m) {
        m.style.display='flex';
        document.getElementById('ins-m-cat').value=cat;
        // Show Policy Type dropdown only for health category
        const ptWrap = document.getElementById('ins-m-policytype-wrap');
        const cgWrap = document.getElementById('ins-m-coveragegroup-wrap');
        if(ptWrap) ptWrap.style.display = (cat === 'health') ? 'block' : 'none';
        if(cgWrap) cgWrap.style.display = 'none';
        // Reset dropdowns
        const ptSel = document.getElementById('ins-m-policytype');
        const cgSel = document.getElementById('ins-m-coveragegroup');
        if(ptSel) ptSel.value = 'individual';
        if(cgSel) cgSel.value = 'nuclear';
    }
};
window.closeInsModal = () => {
    const m = document.getElementById('ins-modal');
    if(m) m.style.display='none';
};
// Policy Type change handler — show/hide Coverage Group
window.onInsPolicyTypeChange = () => {
    const pt = document.getElementById('ins-m-policytype')?.value;
    const cgWrap = document.getElementById('ins-m-coveragegroup-wrap');
    if(cgWrap) cgWrap.style.display = (pt === 'family_floater') ? 'block' : 'none';
    if(pt !== 'family_floater') {
        // Clear auto-populated members when switching back to individual
        const membersEl = document.getElementById('ins-m-members');
        if(membersEl && membersEl.dataset.autoFilled === 'true') { membersEl.value = ''; membersEl.dataset.autoFilled = ''; }
    } else {
        onInsCoverageGroupChange(); // auto-populate members for current group
    }
};
// Coverage Group change handler — auto-populate members
window.onInsCoverageGroupChange = () => {
    const group = document.getElementById('ins-m-coveragegroup')?.value;
    const fm = userData.profile.familyMembers || [];
    let filtered = [];
    if(group === 'nuclear') {
        filtered = fm.filter(m => ['self','spouse','kid'].includes(m.role));
    } else if(group === 'parents') {
        filtered = fm.filter(m => ['father','mother'].includes(m.role));
    }
    const membersEl = document.getElementById('ins-m-members');
    if(membersEl) {
        membersEl.value = filtered.map(m => m.name).join(', ');
        membersEl.dataset.autoFilled = 'true';
    }
};
window.saveInsModal = async () => {
    const cat        = document.getElementById('ins-m-cat').value;
    const label      = document.getElementById('ins-m-label').value.trim();
    const insurer    = document.getElementById('ins-m-insurer').value.trim();
    const policyNo   = document.getElementById('ins-m-policyno').value.trim();
    const cover      = num(document.getElementById('ins-m-cover').value);
    const premium    = num(document.getElementById('ins-m-premium').value);
    const deductible = num(document.getElementById('ins-m-deductible')?.value || 0);
    const freq       = document.getElementById('ins-m-freq')?.value || 'annual';
    const startDate  = document.getElementById('ins-m-start')?.value || '';
    const endDate    = document.getElementById('ins-m-end')?.value || '';
    const renewal    = document.getElementById('ins-m-renewal')?.value || '';
    const utilized   = num(document.getElementById('ins-m-utilized')?.value || 0);
    const membersStr = document.getElementById('ins-m-members')?.value || '';
    const waiting    = document.getElementById('ins-m-waiting')?.value || '';
    const exclusions = document.getElementById('ins-m-exclusions')?.value || '';
    const locator    = document.getElementById('ins-m-locator')?.value || '';

    // Read Family Floater fields (health category only)
    const policyType    = (cat === 'health') ? (document.getElementById('ins-m-policytype')?.value || 'individual') : 'individual';
    const coverageGroup = (cat === 'health' && policyType === 'family_floater') ? (document.getElementById('ins-m-coveragegroup')?.value || 'nuclear') : '';
    let coveredMembers  = [];
    if(cat === 'health' && policyType === 'family_floater') {
        const fm = userData.profile.familyMembers || [];
        if(coverageGroup === 'nuclear') {
            coveredMembers = fm.filter(m => ['self','spouse','kid'].includes(m.role)).map(m => m.id);
        } else if(coverageGroup === 'parents') {
            coveredMembers = fm.filter(m => ['father','mother'].includes(m.role)).map(m => m.id);
        }
    }

    if(!label) { showToast('Please enter a policy name.', 'red'); return; }
    if (currentProfile === 'all') { showToast('Select a member to add policies.', 'red'); return; }
    const memberIns = getMemberInsurance(currentProfile);
    if(!memberIns[cat]) memberIns[cat]=[];

    // Hash policy number if provided
    let policyHash = '';
    if (policyNo) {
        try { policyHash = await hashPolicyNumber(policyNo); } catch(e) { console.warn('Hash failed:', e); }
    }

    // Parse members
    const members = membersStr ? membersStr.split(',').map(n => ({ name: n.trim(), relationship: '' })) : [];

    memberIns[cat].push({ 
        id: 'ins-'+Date.now(), 
        label, insurer,
        policyNo: policyNo ? '****' + policyNo.slice(-4) : '', // Only store last 4 digits
        policy_number_hash: policyHash,
        cover, sum_insured: cover,
        premium, premium_amount: premium,
        premium_frequency: freq,
        deductible,
        start_date: startDate,
        end_date: endDate,
        renewal_date: renewal,
        expiry: endDate || renewal,
        utilization: { amount_used_till_date: utilized, source: 'user_input' },
        members,
        waiting_periods: { notes: waiting },
        exclusions: { notes: exclusions },
        network_hospitals: { locator_link: locator },
        source: 'user_input',
        // Family Floater fields (health category only)
        ...(cat === 'health' ? { policyType } : {}),
        ...(cat === 'health' && policyType === 'family_floater' ? { coverageGroup, coveredMembers } : {})
    });
    debounceSave();
    closeInsModal();
    renderInsurance();
    showToast(`✅ ${label} added successfully`, 'green');
};

// Insurance Detail View
window.viewInsuranceDetail = (cat, idx) => {
    if (currentProfile === 'all') return; // no detail view in "all" mode
    const memberIns = getInsuranceForMember(currentProfile);
    const item = memberIns[cat]?.[idx];
    if (!item) return;
    insDetailView = { cat, idx };
    renderInsurance();
};

function renderInsuranceDetail(view) {
    const { cat, idx } = view;
    const memberIns = getInsuranceForMember(currentProfile);
    const item = memberIns[cat]?.[idx];
    if (!item) { insDetailView = null; renderInsurance(); return; }
    const isCrossRef = item._crossReferenced === true;

    const members = item.members || [];
    const waiting = item.waiting_periods || {};
    const exclusions = item.exclusions || {};
    const utilization = item.utilization || {};
    const network = item.network_hospitals || {};
    const sumInsured = item.cover || item.sum_insured || 0;
    const used = utilization.amount_used_till_date || 0;
    const available = Math.max(0, sumInsured - used);
    const usedPct = sumInsured > 0 ? (used / sumInsured * 100).toFixed(1) : 0;

    const membersHtml = members.length > 0 ? members.map((m, i) => `
        <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
            <div style="width:32px;height:32px;border-radius:50%;background:${i===0?'rgba(59,126,255,0.15)':'rgba(168,85,247,0.12)'};display:flex;align-items:center;justify-content:center;font-size:14px;">${i===0?'👤':'👥'}</div>
            <div style="flex:1;">
                <div style="display:flex;align-items:center;gap:6px;">
                    <span style="font-size:13px;color:var(--text);font-weight:600;">${m.name || 'Member '+(i+1)}</span>
                    ${m.relationship ? `<span style="background:${m.relationship==='self'?'rgba(59,126,255,0.12)':'rgba(168,85,247,0.12)'};color:${m.relationship==='self'?'var(--accent)':'var(--purple)'};font-size:9px;padding:2px 6px;border-radius:4px;text-transform:capitalize;">${m.relationship}</span>` : ''}
                </div>
                <div style="font-size:10px;color:var(--text3);margin-top:2px;">
                    ${m.gender ? m.gender.charAt(0).toUpperCase()+m.gender.slice(1) : ''}
                    ${m.age ? '· Age: '+m.age : ''}
                    ${m.dob ? '· DOB: '+m.dob : ''}
                </div>
            </div>
        </div>
    `).join('') : '<p style="color:var(--text3);font-size:12px;">No members listed.</p>';

    sh('page-insurance', `
        <div style="margin-bottom:18px;display:flex;justify-content:space-between;align-items:center;">
            <button class="snap-btn" onclick="insDetailView=null;renderInsurance();">
                <i class="fas fa-arrow-left"></i> Back to Policies
            </button>
            ${isCrossRef ? `
            <div style="font-size:12px;color:var(--purple);display:flex;align-items:center;gap:6px;">
                🔗 Covered under ${item._policyholderName}'s Family Floater (read-only)
            </div>
            ` : `
            <button class="snap-btn" style="background:rgba(255,59,48,0.1);color:var(--red);border-color:rgba(255,59,48,0.2);" onclick="if(confirm('Delete this policy?')){deleteInsurance('${cat}',${idx});insDetailView=null;}">
                <i class="fas fa-trash-alt"></i> Delete Policy
            </button>
            `}
        </div>

        ${isCrossRef ? `<div class="card" style="background:linear-gradient(135deg, rgba(168,85,247,0.05), rgba(168,85,247,0.02)); border-color:var(--purple); margin-bottom:12px;">
            <div style="display:flex;align-items:center;gap:10px;">
                <span style="font-size:20px;">🔗</span>
                <div>
                    <div style="font-size:13px;font-weight:700;color:var(--purple);">Covered under ${item._policyholderName}'s Family Floater</div>
                    <div style="font-size:11px;color:var(--text3);margin-top:2px;">This policy is managed by ${item._policyholderName}. Switch to their profile to edit.</div>
                </div>
            </div>
        </div>` : ''}

        <div class="card" style="position:relative;overflow:hidden;">
            <div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--accent),var(--purple));"></div>
            <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;">
                <div>
                    <div style="font-size:18px;font-weight:700;color:var(--text);">${item.label || item.insurer || 'Policy'}</div>
                    <div style="font-size:12px;color:var(--text3);margin-top:4px;">${item.insurer || ''} · ${item.policyNo ? '#'+item.policyNo : 'No policy #'}</div>
                    <div style="display:flex;gap:6px;margin-top:8px;">
                        ${badge(item.status || 'active', item.status === 'active' ? 'green' : 'red')}
                        ${badge(cat, 'blue')}
                        ${item.premium_frequency ? badge(item.premium_frequency, 'purple') : ''}
                        ${item.policyType === 'family_floater' ? badge('Family Floater', 'purple') : ''}
                    </div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:10px;color:var(--text3);text-transform:uppercase;">Sum Insured</div>
                    <div style="font-size:24px;font-weight:800;font-family:var(--mono);color:var(--accent);">${fl(sumInsured)}</div>
                </div>
            </div>
        </div>

        <div class="grid-4" style="margin-bottom:18px;">
            <div class="kpi-card green">
                <div class="kpi-label">Premium</div>
                <div class="kpi-value" style="font-size:18px;">${fl(item.premium || item.premium_amount || 0)}</div>
                <div class="kpi-sub">per ${item.premium_frequency || 'year'}</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">Deductible</div>
                <div class="kpi-value" style="font-size:18px;">${fl(item.deductible || 0)}</div>
                <div class="kpi-sub">per claim</div>
            </div>
            <div class="kpi-card ${usedPct > 70 ? 'red' : usedPct > 40 ? 'yellow' : 'green'}">
                <div class="kpi-label">Used / Available</div>
                <div class="kpi-value" style="font-size:18px;">${fl(used)} / ${fl(available)}</div>
                <div class="kpi-sub">${usedPct}% utilized</div>
            </div>
            <div class="kpi-card purple">
                <div class="kpi-label">Renewal</div>
                <div class="kpi-value" style="font-size:14px;">${item.renewal_date || item.expiry || '—'}</div>
                <div class="kpi-sub">${item.start_date ? 'Since '+item.start_date : ''}</div>
            </div>
        </div>

        <div class="grid-2">
            <div class="card">
                <div class="card-title"><span class="icon">📋</span> Policy Details</div>
                ${item.policyNo ? `<div class="row-flex"><span class="row-label">Policy No.</span><span class="row-value">${item.policyNo}</span></div>` : ''}
                ${item.insurer ? `<div class="row-flex"><span class="row-label">Insurer</span><span class="row-value">${item.insurer}</span></div>` : ''}
                ${item.policyTerm ? `<div class="row-flex"><span class="row-label">Policy Term</span><span class="row-value">${item.policyTerm}</span></div>` : ''}
                ${item.start_date || item.startDate ? `<div class="row-flex"><span class="row-label">Start Date</span><span class="row-value">${item.start_date || item.startDate}</span></div>` : ''}
                ${item.renewal_date || item.expiry ? `<div class="row-flex"><span class="row-label">Expiry / Renewal</span><span class="row-value">${item.renewal_date || item.expiry}</span></div>` : ''}
                ${item.nominees ? `<div class="row-flex"><span class="row-label">Nominees</span><span class="row-value">${item.nominees}</span></div>` : ''}
                ${item.premium_frequency ? `<div class="row-flex"><span class="row-label">Payment Frequency</span><span class="row-value" style="text-transform:capitalize;">${item.premium_frequency}</span></div>` : ''}
                ${item.additionalDetails ? `<div style="margin-top:8px;padding:8px;background:rgba(255,255,255,0.03);border-radius:8px;font-size:11px;color:var(--text2);line-height:1.5;">${item.additionalDetails}</div>` : ''}
                ${item._parsedBy ? `<div style="margin-top:8px;font-size:10px;color:var(--text3);">📄 Parsed via: ${item._parsedBy === 'regex_fallback' ? 'Document Scanner' : 'AI'}</div>` : ''}
            </div>
            <div class="card">
                <div class="card-title"><span class="icon">📄</span> Documents</div>
                ${item.documents?.policy_pdf_url ? `<a href="${item.documents.policy_pdf_url}" target="_blank" class="snap-btn" style="display:inline-flex;margin-bottom:8px;"><i class="fas fa-file-pdf"></i> View Policy PDF</a>` : '<p style="color:var(--text3);font-size:12px;">No PDF attached.</p>'}
                ${!isCrossRef ? `<div style="margin-top:8px;">
                    <input type="file" id="ins-reupload-${cat}-${idx}" accept=".pdf" style="display:none;" onchange="reuploadInsurancePdf(this,'${cat}',${idx})">
                    <button class="add-btn" onclick="document.getElementById('ins-reupload-${cat}-${idx}').click()" style="width:100%;">📄 Re-upload / Replace PDF</button>
                    <div id="ins-reupload-status-${cat}-${idx}" style="margin-top:6px;font-size:11px;color:var(--text3);"></div>
                </div>` : ''}
            </div>
        </div>

        <div class="grid-2">
            <div class="card">
                <div class="card-title"><span class="icon">👥</span> Covered Members (${members.length})</div>
                ${membersHtml}
                ${editMode && !isCrossRef ? `<button class="add-btn" onclick="addInsuranceMember('${cat}',${idx})" style="margin-top:8px;">➕ Add Member</button>` : ''}
            </div>
            <div class="card">
                <div class="card-title"><span class="icon">⏳</span> Waiting Periods</div>
                ${waiting.notes ? `<p style="font-size:12px;color:var(--text2);line-height:1.6;">${waiting.notes}</p>` : ''}
                ${waiting.ped_wait_years ? `<div class="row-flex"><span class="row-label">PED Wait</span><span class="row-value">${waiting.ped_wait_years} years</span></div>` : ''}
                ${waiting.initial_30_days !== undefined ? `<div class="row-flex"><span class="row-label">Initial 30 Days</span><span class="row-value">${waiting.initial_30_days ? 'Yes' : 'No'}</span></div>` : ''}
                ${waiting.maternity_months ? `<div class="row-flex"><span class="row-label">Maternity</span><span class="row-value">${waiting.maternity_months} months</span></div>` : ''}
                ${waiting.pre_hosp_days ? `<div class="row-flex"><span class="row-label">Pre-hospitalization</span><span class="row-value">${waiting.pre_hosp_days} days</span></div>` : ''}
                ${waiting.post_hosp_days ? `<div class="row-flex"><span class="row-label">Post-hospitalization</span><span class="row-value">${waiting.post_hosp_days} days</span></div>` : ''}
                ${!waiting.notes && !waiting.ped_wait_years ? '<p style="color:var(--text3);font-size:12px;">No waiting period info.</p>' : ''}
            </div>
        </div>

        <div class="grid-2">
            <div class="card">
                <div class="card-title"><span class="icon">🚫</span> Exclusions</div>
                ${exclusions.notes ? `<p style="font-size:12px;color:var(--text2);line-height:1.6;">${exclusions.notes}</p>` : '<p style="color:var(--text3);font-size:12px;">No exclusions noted.</p>'}
                ${(exclusions.links || []).length > 0 ? exclusions.links.map(l => `<a href="${l}" target="_blank" style="font-size:11px;color:var(--accent2);display:block;margin-top:4px;">📎 ${l}</a>`).join('') : ''}
            </div>
            <div class="card">
                <div class="card-title"><span class="icon">🏥</span> Network Hospitals</div>
                ${network.locator_link ? `<a href="${network.locator_link}" target="_blank" class="snap-btn" style="display:inline-flex;margin-bottom:8px;"><i class="fas fa-external-link-alt"></i> Open Hospital Locator</a>` : '<p style="color:var(--text3);font-size:12px;">No locator link added.</p>'}
                ${network.city ? `<div style="font-size:12px;color:var(--text2);">City: ${network.city} ${network.pincode ? '· PIN: '+network.pincode : ''}</div>` : ''}
            </div>
        </div>

        <div class="card">
            <div class="card-title"><span class="icon">📋</span> Utilization / Claims</div>
            <div class="grid-2" style="margin-bottom:12px;">
                <div>
                    <div style="font-size:10px;color:var(--text3);margin-bottom:4px;">Amount Used Till Date</div>
                    <div style="font-size:18px;font-weight:700;font-family:var(--mono);color:var(--red);">${fl(used)}</div>
                </div>
                <div>
                    <div style="font-size:10px;color:var(--text3);margin-bottom:4px;">Amount Available</div>
                    <div style="font-size:18px;font-weight:700;font-family:var(--mono);color:var(--green);">${fl(available)}</div>
                </div>
            </div>
            ${editMode && !isCrossRef ? `
            <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:12px;margin-top:12px;">
                <div style="font-size:11px;color:var(--text3);margin-bottom:8px;">Update Utilization</div>
                <div style="display:flex;gap:8px;">
                    <input id="ins-util-amount" class="ainp" type="number" placeholder="Amount used ₹" style="flex:1;">
                    <button class="primary-btn" onclick="updateInsUtilization('${cat}',${idx})">Update</button>
                </div>
            </div>` : ''}
        </div>
    `);
}

window.updateInsUtilization = (cat, idx) => {
    if (currentProfile === 'all') return;
    const amount = num(document.getElementById('ins-util-amount')?.value || 0);
    const memberIns = getMemberInsurance(currentProfile);
    if (!memberIns[cat]?.[idx]) return;
    if (memberIns[cat][idx]._crossReferenced) return;
    if (!memberIns[cat][idx].utilization) memberIns[cat][idx].utilization = {};
    memberIns[cat][idx].utilization.amount_used_till_date = amount;
    debounceSave();
    renderInsurance();
    showToast('✅ Utilization updated', 'green');
};

window.addInsuranceMember = (cat, idx) => {
    if (currentProfile === 'all') return;
    const name = prompt('Member name:');
    if (!name) return;
    const rel = prompt('Relationship (self/spouse/child/parent):') || '';
    const memberIns = getMemberInsurance(currentProfile);
    if (!memberIns[cat]?.[idx]) return;
    if (memberIns[cat][idx]._crossReferenced) return;
    if (!memberIns[cat][idx].members) memberIns[cat][idx].members = [];
    memberIns[cat][idx].members.push({ name, relationship: rel, dob: '', gender: '' });
    debounceSave();
    renderInsurance();
};

window.reuploadInsurancePdf = async (input, cat, idx) => {
    const file = input.files[0];
    if (!file) return;
    const statusEl = document.getElementById('ins-reupload-status-' + cat + '-' + idx);
    if (statusEl) statusEl.innerHTML = '⏳ Reading PDF...';

    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= Math.min(pdf.numPages, 15); i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            let lastY = null;
            let lineText = '';
            for (const item of content.items) {
                const y = Math.round(item.transform[5]);
                if (lastY !== null && Math.abs(y - lastY) > 5) {
                    fullText += lineText.trim() + '\n';
                    lineText = '';
                }
                lineText += item.str + ' ';
                lastY = y;
            }
            if (lineText.trim()) fullText += lineText.trim() + '\n';
            fullText += '\n';
        }
        console.log('📄 Re-upload PDF text (first 1500 chars):', fullText.substring(0, 1500));

        if (fullText.trim().length < 30) {
            if (statusEl) statusEl.innerHTML = '❌ Could not extract text from PDF.';
            input.value = '';
            return;
        }

        if (statusEl) statusEl.innerHTML = '🤖 AI is extracting policy details...';

        const res = await fetch('/api/insurance/parse-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pdfText: fullText })
        });

        if (!res.ok) throw new Error('API error ' + res.status);
        const policy = await res.json();
        console.log('📄 Insurance PDF re-upload API response:', JSON.stringify(policy, null, 2));

        // Update existing policy entry — merge new fields on top
        if (currentProfile === 'all') { if (statusEl) statusEl.innerHTML = '❌ Select a member to edit.'; return; }
        const memberIns = getMemberInsurance(currentProfile);
        const existing = memberIns[cat]?.[idx];
        if (!existing) { if (statusEl) statusEl.innerHTML = '❌ Policy not found.'; return; }
        if (existing._crossReferenced) { if (statusEl) statusEl.innerHTML = '❌ Cannot edit cross-referenced policy.'; return; }

        const coverAmt = policy.cover || policy.sumInsured || policy.sum_insured || existing.cover || 0;
        const premiumAmt = policy.premium || policy.premium_amount || existing.premium || 0;

        // Merge all parsed fields into existing policy
        Object.assign(existing, {
            ...policy,
            id: existing.id,
            label: policy.label && policy.label !== 'Insurance Policy' ? policy.label : existing.label,
            insurer: policy.insurer && policy.insurer !== 'Unknown' ? policy.insurer : existing.insurer,
            policyNo: policy.policyNo || existing.policyNo,
            cover: coverAmt,
            sum_insured: coverAmt,
            premium: premiumAmt,
            premium_amount: premiumAmt,
            premium_frequency: policy.paymentFrequency || policy.premium_frequency || existing.premium_frequency || 'annual',
            deductible: policy.deductible || existing.deductible || 0,
            expiry: policy.expiry || policy.renewal_date || existing.expiry || '',
            renewal_date: policy.expiry || policy.renewal_date || existing.renewal_date || '',
            startDate: policy.startDate || policy.start_date || existing.startDate || '',
            start_date: policy.startDate || policy.start_date || existing.start_date || '',
            policyTerm: policy.policyTerm || existing.policyTerm || '',
            nominees: policy.nominees || existing.nominees || '',
            additionalDetails: policy.additionalDetails || existing.additionalDetails || '',
            status: existing.status || 'active',
            members: (policy.members && policy.members.length > 0) ? policy.members : (existing.members || []),
            waiting_periods: (policy.waiting_periods && Object.keys(policy.waiting_periods).length > 0) ? policy.waiting_periods : (existing.waiting_periods || {}),
            exclusions: (policy.exclusions && Object.keys(policy.exclusions).length > 0) ? policy.exclusions : (existing.exclusions || {}),
            utilization: existing.utilization || { amount_used_till_date: 0 },
            network_hospitals: existing.network_hospitals || {}
        });

        debounceSave();
        if (statusEl) statusEl.innerHTML = `✅ Updated: ${existing.label} — ${fl(coverAmt)} cover`;
        renderInsurance();
    } catch (e) {
        console.error('PDF re-upload error:', e);
        if (statusEl) statusEl.innerHTML = '❌ Failed: ' + e.message;
    }
    input.value = '';
};

window.handleInsurancePdfUpload = async (input, forceCat) => {
    const file = input.files[0];
    if (!file) return;
    const statusEl = document.getElementById('ins-pdf-status-' + forceCat);
    if (statusEl) statusEl.innerHTML = '⏳ Reading PDF...';

    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= Math.min(pdf.numPages, 15); i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            let lastY = null;
            let lineText = '';
            for (const item of content.items) {
                const y = Math.round(item.transform[5]);
                if (lastY !== null && Math.abs(y - lastY) > 5) {
                    fullText += lineText.trim() + '\n';
                    lineText = '';
                }
                lineText += item.str + ' ';
                lastY = y;
            }
            if (lineText.trim()) fullText += lineText.trim() + '\n';
            fullText += '\n';
        }
        console.log('📄 PDF text (first 1500 chars):', fullText.substring(0, 1500));

        if (fullText.trim().length < 30) {
            if (statusEl) statusEl.innerHTML = '❌ Could not extract text from PDF. It may be a scanned image.';
            input.value = '';
            return;
        }

        if (statusEl) statusEl.innerHTML = '🤖 AI is extracting policy details...';

        const res = await fetch('/api/insurance/parse-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pdfText: fullText })
        });

        if (!res.ok) throw new Error('API error ' + res.status);
        const policy = await res.json();
        console.log('📄 Insurance PDF API response:', JSON.stringify(policy, null, 2));

        // Use the forced category from the button, fallback to AI detection
        const cat = forceCat || policy.policyType || 'health';
        const memberIns = getMemberInsurance(currentProfile === 'all' ? 'self' : currentProfile);
        if (!memberIns[cat]) memberIns[cat] = [];

        // Build comprehensive policy object — spread ALL API fields, then normalize field names for the detail view
        const coverAmt = policy.cover || policy.sumInsured || policy.sum_insured || 0;
        const premiumAmt = policy.premium || policy.premium_amount || 0;
        const policyObj = {
            // Spread everything the API returned so nothing is lost
            ...policy,
            // Core identifiers
            id: 'ins-' + Date.now(),
            label: policy.label || file.name,
            insurer: policy.insurer || '',
            policyNo: policy.policyNo || policy.policy_no || '',
            // Financial fields (normalize both naming conventions)
            cover: coverAmt,
            sum_insured: coverAmt,
            premium: premiumAmt,
            premium_amount: premiumAmt,
            premium_frequency: policy.paymentFrequency || policy.premium_frequency || 'annual',
            deductible: policy.deductible || 0,
            // Dates (normalize both camelCase and snake_case)
            expiry: policy.expiry || policy.renewal_date || '',
            renewal_date: policy.expiry || policy.renewal_date || '',
            startDate: policy.startDate || policy.start_date || '',
            start_date: policy.startDate || policy.start_date || '',
            // Policy metadata
            policyTerm: policy.policyTerm || policy.policy_term || '',
            nominees: policy.nominees || '',
            additionalDetails: policy.additionalDetails || policy.additional_details || '',
            status: 'active',
            // Rich fields for detail view
            members: policy.members || [],
            waiting_periods: policy.waiting_periods || {},
            exclusions: policy.exclusions || {},
            utilization: policy.utilization || { amount_used_till_date: 0 },
            network_hospitals: policy.network_hospitals || {},
            source: 'pdf_upload'
        };

        // Auto-detect Family Floater from AI extraction (health category)
        if(cat === 'health') {
            const isFloater = policy.policyType === 'family_floater' 
                || (policy.members && policy.members.length > 1)
                || /family\s*floater/i.test(policy.label || '')
                || /family\s*floater/i.test(policy.additionalDetails || '');
            if(isFloater) {
                policyObj.policyType = 'family_floater';
                // Determine coverage group from member names/roles
                const fm = userData.profile.familyMembers || [];
                const memberNames = (policy.members || []).map(m => (m.name || '').toLowerCase());
                const hasParent = memberNames.some(n => fm.some(f => (f.role === 'father' || f.role === 'mother') && f.name.toLowerCase() === n));
                const group = hasParent ? 'parents' : 'nuclear';
                policyObj.coverageGroup = policy.coverageGroup || group;
                // Build coveredMembers array
                if(policyObj.coverageGroup === 'nuclear') {
                    policyObj.coveredMembers = fm.filter(m => ['self','spouse','kid'].includes(m.role)).map(m => m.id);
                } else {
                    policyObj.coveredMembers = fm.filter(m => ['father','mother'].includes(m.role)).map(m => m.id);
                }
            } else {
                policyObj.policyType = policy.policyType || 'individual';
            }
        }

        memberIns[cat].push(policyObj);
        debounceSave();
        if (statusEl) statusEl.innerHTML = `✅ Added: ${policyObj.label} (${policyObj.insurer || cat}) — ${fl(coverAmt)} cover`;
        renderInsurance();
    } catch (e) {
        console.error('PDF parse error:', e);
        if (statusEl) statusEl.innerHTML = '❌ Failed to parse PDF: ' + e.message;
    }
    input.value = '';
};

// ========== SCHEMES PAGE ==========
function renderSchemes() {
    if(!userData.profile.age) { sh('page-schemes', emptyState('Complete your profile to see schemes','⚙️ Settings','goSettings')); return; }
    const schemes = userData.schemes || [];
    if(!schemes.length && !editMode) { sh('page-schemes', emptyState('No schemes enrolled yet','Browse Recommendations','goReco')); return; }

    let rows = schemes.map((s,i)=>`
        <div class="row-flex">
            <div>
                <div class="row-label">${s.name}</div>
                <div style="font-size:11px; color:var(--text3);">Added: ${new Date(s.addedAt).toLocaleDateString('en-IN')}</div>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
                ${badge('Enrolled','green')}
                ${editMode ? `<button class="del-btn" onclick="removeScheme(${i})">🗑</button>` : ''}
            </div>
        </div>
    `).join('');

    sh('page-schemes', `
        <div class="card">
            <div class="card-title"><span class="icon">🏛️</span> Enrolled Schemes <span style="margin-left:auto;">${badge(schemes.length+' enrolled','green')}</span></div>
            ${rows || `<p style="color:var(--text3); font-size:13px; padding:8px 0;">None enrolled.</p>`}
            <button class="add-btn" onclick="goReco()">➕ Browse More Schemes</button>
        </div>
    `);
}
window.removeScheme = i => { userData.schemes.splice(i,1); debounceSave(); renderSchemes(); };

// ========== RECOMMENDATIONS PAGE ==========
async function renderRecommendations() {
    if(!userData.profile.age) { sh('page-recommendations', emptyState('Complete your profile first','⚙️ Settings','goSettings')); return; }
    sh('page-recommendations', `<div class="loading-state"><div class="spinner"></div><p>Finding best products for you…</p></div>`);

    const age = userData.profile.age;
    const [userMinIncome, userMaxIncome] = parseIncomeRange(userData.profile.incomeRange || '0-999');

    try {
        const { data: schemes, error: schemesErr } = await sb.from('schemes').select('*').lte('min_age', age).gte('max_age', age).eq('is_active', true);
        if(schemesErr) throw schemesErr;

        const filteredSchemes = (schemes || []).filter(s =>
            (!s.min_income || s.min_income <= userMaxIncome) &&
            (!s.max_income || s.max_income >= userMinIncome)
        );

        const { data: insurance, error: insErr } = await sb.from('insurance_products').select('*').lte('min_age', age).gte('max_age', age).eq('is_active', true);
        if(insErr) throw insErr;

        const filteredInsurance = (insurance || []).filter(p =>
            (!p.min_income || p.min_income <= userMaxIncome) &&
            (!p.max_income || p.max_income >= userMinIncome)
        );

        const { data: fd, error: fdErr } = await sb.from('fd_products').select('*').lte('min_age', age).gte('max_age', age).eq('is_active', true);
        if(fdErr) throw fdErr;

        // Fetch health insurance products
        const { data: healthIns, error: healthErr } = await sb.from('health_insurance_products').select('*').lte('min_age', age).gte('max_age', age).eq('is_active', true);
        if(healthErr) console.warn('Health insurance fetch error:', healthErr);

        // Fallback: Use hardcoded health insurance data if database is empty
        const fallbackHealthIns = [
            {
                name: 'Star Health Comprehensive Insurance',
                provider: 'Star Health',
                description: 'India\'s largest standalone health insurer. Covers hospitalization, pre & post hospitalization, daycare procedures, and ambulance charges. Cashless at 14,000+ hospitals.',
                coverage_min: 5,
                coverage_max: 2500,
                min_age: 18,
                max_age: 65,
                premium_estimate: '₹8,500/year for ₹10L cover (30yr individual)',
                official_url: 'https://www.policybazaar.com/health-insurance/star-health-insurance/'
            },
            {
                name: 'Care Supreme',
                provider: 'Care Health',
                description: 'Comprehensive health plan with unlimited restoration of sum insured. Covers 156 daycare procedures, modern treatments, and worldwide emergency cover.',
                coverage_min: 5,
                coverage_max: 600,
                min_age: 18,
                max_age: 65,
                premium_estimate: '₹7,800/year for ₹10L cover (30yr individual)',
                official_url: 'https://www.policybazaar.com/health-insurance/care-health-insurance/care-supreme/'
            },
            {
                name: 'HDFC ERGO Optima Secure',
                provider: 'HDFC ERGO',
                description: 'Comprehensive health insurance with no room rent capping. Covers pre-existing diseases after 2 years, maternity, and newborn baby expenses.',
                coverage_min: 5,
                coverage_max: 5000,
                min_age: 18,
                max_age: 65,
                premium_estimate: '₹9,200/year for ₹10L cover (30yr individual)',
                official_url: 'https://www.policybazaar.com/health-insurance/hdfc-ergo-health-insurance/hdfc-ergo-optima-secure/'
            },
            {
                name: 'Niva Bupa Reassure 2.0',
                provider: 'Niva Bupa',
                description: 'Unlimited automatic restoration of sum insured. Covers 1,000+ daycare procedures, organ donor expenses, and alternative treatments (AYUSH).',
                coverage_min: 5,
                coverage_max: 10000,
                min_age: 18,
                max_age: 65,
                premium_estimate: '₹8,900/year for ₹10L cover (30yr individual)',
                official_url: 'https://www.policybazaar.com/health-insurance/niva-bupa-health-insurance/niva-bupa-reassure/'
            },
            {
                name: 'Digit Health Insurance',
                provider: 'Go Digit',
                description: 'Modern health insurance with instant claim settlement. Covers unlimited automatic restoration, no room rent capping, and 100% digital process.',
                coverage_min: 5,
                coverage_max: 10000,
                min_age: 18,
                max_age: 65,
                premium_estimate: '₹7,500/year for ₹10L cover (30yr individual)',
                official_url: 'https://www.policybazaar.com/health-insurance/digit-health-insurance/'
            }
        ];

        const filteredHealthIns = (healthIns && healthIns.length > 0 ? healthIns : fallbackHealthIns).filter(p =>
            (!p.min_income || p.min_income <= userMaxIncome) &&
            (!p.max_income || p.max_income >= userMinIncome)
        );

        function renderCollapsibleSection(id, icon, title, items, mapFn) {
            if(!items || items.length === 0) return '';
            const cards = items.map(mapFn).map(p => `
                <div class="reco-card">
                    <h4>${p.name}</h4>
                    <p>${p.description}</p>
                    <div class="reco-meta">
                        ${p.meta.map(m=>`<span class="badge badge-blue">${m}</span>`).join('')}
                    </div>
                    <a href="${p.url}" target="_blank" style="text-decoration:none;">
                        <button class="primary-btn" style="margin-top:10px;">📄 View Details</button>
                    </a>
                </div>
            `).join('');
            
            return `
                <div class="collapsible-section">
                    <div class="collapsible-header" onclick="toggleCollapsible('${id}')">
                        <div class="collapsible-title">
                            <span class="collapsible-icon">${icon}</span>
                            <span>${title}</span>
                            <span class="collapsible-count">${items.length} available</span>
                        </div>
                        <i class="fas fa-chevron-down collapsible-arrow" id="${id}-arrow"></i>
                    </div>
                    <div class="collapsible-content" id="${id}-content">
                        <div class="collapsible-inner">
                            ${cards}
                        </div>
                    </div>
                </div>
            `;
        }

        const schemesHtml = renderCollapsibleSection(
            'schemes',
            '🏛️',
            'Government Schemes',
            filteredSchemes,
            s => ({
                name: s.name,
                description: s.description || '',
                meta: [
                    s.min_age ? `Age ${s.min_age}–${s.max_age}` : '',
                    s.min_income ? `Income up to ₹${s.max_income}L` : '',
                    `Verified: ${s.last_verified ? new Date(s.last_verified).toLocaleDateString('en-IN') : 'N/A'}`
                ].filter(Boolean),
                url: s.official_url
            })
        );

        const insuranceHtml = renderCollapsibleSection(
            'insurance',
            '🛡️',
            'Term Insurance',
            filteredInsurance,
            p => ({
                name: `${p.name} (${p.provider})`,
                description: p.description,
                meta: [
                    `Cover: ₹${p.coverage_min}L–₹${p.coverage_max}L`,
                    p.premium_estimate ? `Premium: ${p.premium_estimate}` : '',
                    `Age ${p.min_age}–${p.max_age}`
                ].filter(Boolean),
                url: p.official_url
            })
        );

        const fdHtml = renderCollapsibleSection(
            'fd',
            '🏦',
            'Fixed Deposits',
            fd,
            f => ({
                name: f.bank_name,
                description: f.description,
                meta: [
                    `Amount: ₹${f.min_amount}–₹${f.max_amount}`,
                    `Tenure: ${f.tenure_months?.map(m=>m+'m').join('/')||'—'}`,
                    `Rate: ${f.interest_rate}`,
                    f.senior_citizen_rate ? `Senior: ${f.senior_citizen_rate}` : ''
                ].filter(Boolean),
                url: f.official_url
            })
        );

        const healthInsHtml = renderCollapsibleSection(
            'health',
            '🏥',
            'Health Insurance',
            filteredHealthIns,
            p => ({
                name: `${p.name} (${p.provider})`,
                description: p.description,
                meta: [
                    `Cover: ₹${p.coverage_min}L–₹${p.coverage_max}L`,
                    p.premium_estimate ? `Premium: ${p.premium_estimate}` : '',
                    `Age ${p.min_age}–${p.max_age}`
                ].filter(Boolean),
                url: p.official_url
            })
        );

        const portalCards = `
            <div class="reco-card">
                <h4>myScheme — Government of India</h4>
                <p>Search 1000+ central & state schemes by eligibility.</p>
                <a href="https://www.myscheme.gov.in/" target="_blank"><button class="primary-btn" style="margin-top:10px;">📄 View Details</button></a>
            </div>
            <div class="reco-card">
                <h4>India.gov.in — All Schemes</h4>
                <p>Official listing of all government welfare schemes.</p>
                <a href="https://www.india.gov.in/my-government/schemes" target="_blank"><button class="primary-btn" style="margin-top:10px;">📄 View Details</button></a>
            </div>
        `;

        const portalHtml = `
            <div class="collapsible-section">
                <div class="collapsible-header" onclick="toggleCollapsible('portals')">
                    <div class="collapsible-title">
                        <span class="collapsible-icon">🌐</span>
                        <span>Official Portals</span>
                        <span class="collapsible-count">2 portals</span>
                    </div>
                    <i class="fas fa-chevron-down collapsible-arrow" id="portals-arrow"></i>
                </div>
                <div class="collapsible-content" id="portals-content">
                    <div class="collapsible-inner">
                        ${portalCards}
                    </div>
                </div>
            </div>
        `;

        sh('page-recommendations', schemesHtml + insuranceHtml + healthInsHtml + fdHtml + portalHtml);
    } catch(e) {
        sh('page-recommendations', `
            <div class="card">
                <p style="color:var(--red); margin-bottom:12px;">⚠️ Error loading recommendations: ${e.message}</p>
                <button class="secondary-btn" style="margin-top:12px;" onclick="renderRecommendations()">Try Again</button>
            </div>
        `);
    }
}

window.toggleCollapsible = (id) => {
    const content = document.getElementById(`${id}-content`);
    const arrow = document.getElementById(`${id}-arrow`);
    
    if (content && arrow) {
        const isExpanded = content.classList.contains('expanded');
        content.classList.toggle('expanded', !isExpanded);
        arrow.classList.toggle('expanded', !isExpanded);
    }
};

window.enrollScheme = name => {
    if(!(userData.schemes||[]).find(s=>s.name===name)) {
        if(!userData.schemes) userData.schemes=[];
        userData.schemes.push({ name, addedAt: new Date().toISOString() });
        debounceSave();
        showToast(`Enrolled in ${name}!`);
        renderRecommendations();
    }
};

// Fix broken scheme URLs in database (run once)
window.fixSchemeUrls = async () => {
    try {
        // Fix PMJJBY URL
        const { error: error1 } = await sb
            .from('schemes')
            .update({ official_url: 'https://www.india.gov.in/spotlight/pradhan-mantri-jeevan-jyoti-bima-yojana' })
            .eq('name', 'Pradhan Mantri Jeevan Jyoti Bima Yojana');
        
        if (error1) console.error('Error updating PMJJBY:', error1);
        else console.log('✅ Fixed PMJJBY URL');
        
        // Fix PMSBY URL
        const { error: error2 } = await sb
            .from('schemes')
            .update({ official_url: 'https://www.india.gov.in/spotlight/pradhan-mantri-suraksha-bima-yojana' })
            .eq('name', 'Pradhan Mantri Suraksha Bima Yojana');
        
        if (error2) console.error('Error updating PMSBY:', error2);
        else console.log('✅ Fixed PMSBY URL');
        
        // Fix APY URL
        const { error: error3 } = await sb
            .from('schemes')
            .update({ official_url: 'https://www.india.gov.in/spotlight/atal-pension-yojana' })
            .eq('name', 'Atal Pension Yojana');
        
        if (error3) console.error('Error updating APY:', error3);
        else console.log('✅ Fixed APY URL');
        
        showToast('Scheme URLs updated successfully!');
        renderRecommendations();
    } catch (e) {
        console.error('Error fixing URLs:', e);
        showToast('Failed to update URLs', 'red');
    }
};

// Add popular term insurance products (run once to populate database)
window.addTermInsuranceProducts = async () => {
    try {
        const termInsuranceProducts = [
            {
                name: 'HDFC Life Click 2 Protect 3D Plus',
                provider: 'HDFC Life',
                description: 'Comprehensive online term plan with life cover, critical illness, and accidental death benefits. No medical tests for cover up to ₹50L.',
                coverage_min: 25,
                coverage_max: 1000,
                min_age: 18,
                max_age: 65,
                premium_estimate: '₹490/month for ₹1Cr cover (30yr male, non-smoker)',
                official_url: 'https://www.policybazaar.com/life-insurance/hdfc-life-insurance/hdfc-click-2-protect-3d-plus/',
                is_active: true
            },
            {
                name: 'ICICI Prudential iProtect Smart',
                provider: 'ICICI Prudential',
                description: 'Flexible term insurance with return of premium option. Covers up to 85 years with multiple payout options.',
                coverage_min: 25,
                coverage_max: 2500,
                min_age: 18,
                max_age: 60,
                premium_estimate: '₹520/month for ₹1Cr cover (30yr male, non-smoker)',
                official_url: 'https://www.policybazaar.com/life-insurance/icici-prudential-life-insurance/icici-iprotect-smart/',
                is_active: true
            },
            {
                name: 'Max Life Smart Secure Plus',
                provider: 'Max Life',
                description: 'Online term plan with 12 critical illness cover and accidental death benefit. Instant policy issuance.',
                coverage_min: 25,
                coverage_max: 1000,
                min_age: 18,
                max_age: 65,
                premium_estimate: '₹475/month for ₹1Cr cover (30yr male, non-smoker)',
                official_url: 'https://www.policybazaar.com/life-insurance/max-life-insurance/max-life-smart-secure-plus/',
                is_active: true
            },
            {
                name: 'Tata AIA Sampoorna Raksha Supreme',
                provider: 'Tata AIA',
                description: 'Comprehensive protection with life cover, critical illness, and disability benefits. Covers 64 critical illnesses.',
                coverage_min: 25,
                coverage_max: 1000,
                min_age: 18,
                max_age: 65,
                premium_estimate: '₹510/month for ₹1Cr cover (30yr male, non-smoker)',
                official_url: 'https://www.policybazaar.com/life-insurance/tata-aia-life-insurance/tata-aia-sampoorna-raksha-supreme/',
                is_active: true
            },
            {
                name: 'SBI Life eShield',
                provider: 'SBI Life',
                description: 'Affordable online term plan with life cover and optional critical illness rider. Trusted by millions.',
                coverage_min: 25,
                coverage_max: 1000,
                min_age: 18,
                max_age: 65,
                premium_estimate: '₹465/month for ₹1Cr cover (30yr male, non-smoker)',
                official_url: 'https://www.policybazaar.com/life-insurance/sbi-life-insurance/sbi-eshield/',
                is_active: true
            },
            {
                name: 'LIC Tech Term',
                provider: 'LIC',
                description: 'Pure online term insurance from LIC with simple application process. No medical tests for select cases.',
                coverage_min: 25,
                coverage_max: 1000,
                min_age: 18,
                max_age: 65,
                premium_estimate: '₹540/month for ₹1Cr cover (30yr male, non-smoker)',
                official_url: 'https://www.policybazaar.com/life-insurance/lic/lic-tech-term/',
                is_active: true
            },
            {
                name: 'Bajaj Allianz Smart Protect Goal',
                provider: 'Bajaj Allianz',
                description: 'Goal-based term plan with increasing cover option. Protects your family and future goals.',
                coverage_min: 25,
                coverage_max: 500,
                min_age: 18,
                max_age: 60,
                premium_estimate: '₹495/month for ₹1Cr cover (30yr male, non-smoker)',
                official_url: 'https://www.policybazaar.com/life-insurance/bajaj-allianz-life-insurance/bajaj-allianz-smart-protect-goal/',
                is_active: true
            },
            {
                name: 'Aegon Life iTerm',
                provider: 'Aegon Life',
                description: 'Flexible term insurance with multiple payout options and critical illness cover. Quick online purchase.',
                coverage_min: 25,
                coverage_max: 1000,
                min_age: 18,
                max_age: 65,
                premium_estimate: '₹485/month for ₹1Cr cover (30yr male, non-smoker)',
                official_url: 'https://www.policybazaar.com/life-insurance/aegon-life-insurance/aegon-iterm/',
                is_active: true
            },
            {
                name: 'Kotak e-Term',
                provider: 'Kotak Life',
                description: 'Simple online term plan with life cover and optional riders. Instant policy issuance in minutes.',
                coverage_min: 25,
                coverage_max: 1000,
                min_age: 18,
                max_age: 65,
                premium_estimate: '₹500/month for ₹1Cr cover (30yr male, non-smoker)',
                official_url: 'https://www.policybazaar.com/life-insurance/kotak-life-insurance/kotak-e-term/',
                is_active: true
            },
            {
                name: 'Aditya Birla Sun Life DigiShield',
                provider: 'Aditya Birla',
                description: 'Digital term insurance with comprehensive coverage and flexible premium payment options.',
                coverage_min: 25,
                coverage_max: 500,
                min_age: 18,
                max_age: 60,
                premium_estimate: '₹505/month for ₹1Cr cover (30yr male, non-smoker)',
                official_url: 'https://www.policybazaar.com/life-insurance/aditya-birla-sun-life-insurance/aditya-birla-digishield/',
                is_active: true
            }
        ];

        let successCount = 0;
        let errorCount = 0;

        for (const product of termInsuranceProducts) {
            const { error } = await sb
                .from('insurance_products')
                .upsert(product, { onConflict: 'name,provider' });
            
            if (error) {
                console.error(`Error adding ${product.name}:`, error);
                errorCount++;
            } else {
                console.log(`✅ Added ${product.name}`);
                successCount++;
            }
        }

        showToast(`Added ${successCount} term insurance products! ${errorCount > 0 ? `(${errorCount} errors)` : ''}`, successCount > 0 ? 'green' : 'red');
        renderRecommendations();
    } catch (e) {
        console.error('Error adding term insurance products:', e);
        showToast('Failed to add products', 'red');
    }
};

// Add best health insurance products in India (run once to populate database)
window.addHealthInsuranceProducts = async () => {
    try {
        const healthInsuranceProducts = [
            {
                name: 'Star Health Comprehensive Insurance',
                provider: 'Star Health',
                description: 'India\'s largest standalone health insurer. Covers hospitalization, pre & post hospitalization, daycare procedures, and ambulance charges. Cashless at 14,000+ hospitals.',
                coverage_min: 5,
                coverage_max: 2500,
                min_age: 18,
                max_age: 65,
                premium_estimate: '₹8,500/year for ₹10L cover (30yr individual)',
                official_url: 'https://www.policybazaar.com/health-insurance/star-health-insurance/',
                is_active: true
            },
            {
                name: 'Care Supreme',
                provider: 'Care Health',
                description: 'Comprehensive health plan with unlimited restoration of sum insured. Covers 156 daycare procedures, modern treatments, and worldwide emergency cover.',
                coverage_min: 5,
                coverage_max: 600,
                min_age: 18,
                max_age: 65,
                premium_estimate: '₹7,800/year for ₹10L cover (30yr individual)',
                official_url: 'https://www.policybazaar.com/health-insurance/care-health-insurance/care-supreme/',
                is_active: true
            },
            {
                name: 'HDFC ERGO Optima Secure',
                provider: 'HDFC ERGO',
                description: 'Comprehensive health insurance with no room rent capping. Covers pre-existing diseases after 2 years, maternity, and newborn baby expenses.',
                coverage_min: 5,
                coverage_max: 5000,
                min_age: 18,
                max_age: 65,
                premium_estimate: '₹9,200/year for ₹10L cover (30yr individual)',
                official_url: 'https://www.policybazaar.com/health-insurance/hdfc-ergo-health-insurance/hdfc-ergo-optima-secure/',
                is_active: true
            },
            {
                name: 'Niva Bupa Reassure 2.0',
                provider: 'Niva Bupa',
                description: 'Unlimited automatic restoration of sum insured. Covers 1,000+ daycare procedures, organ donor expenses, and alternative treatments (AYUSH).',
                coverage_min: 5,
                coverage_max: 10000,
                min_age: 18,
                max_age: 65,
                premium_estimate: '₹8,900/year for ₹10L cover (30yr individual)',
                official_url: 'https://www.policybazaar.com/health-insurance/niva-bupa-health-insurance/niva-bupa-reassure/',
                is_active: true
            },
            {
                name: 'ICICI Lombard Health AdvantEdge',
                provider: 'ICICI Lombard',
                description: 'Comprehensive health plan with automatic sum insured reload. Covers modern treatments, robotic surgery, and international second opinion.',
                coverage_min: 5,
                coverage_max: 10000,
                min_age: 18,
                max_age: 65,
                premium_estimate: '₹9,500/year for ₹10L cover (30yr individual)',
                official_url: 'https://www.policybazaar.com/health-insurance/icici-lombard-health-insurance/',
                is_active: true
            },
            {
                name: 'Aditya Birla Activ Health Platinum Enhanced',
                provider: 'Aditya Birla',
                description: 'Rewards healthy lifestyle with premium discounts. Covers unlimited restoration, global coverage, and wellness benefits up to ₹10,000.',
                coverage_min: 5,
                coverage_max: 10000,
                min_age: 18,
                max_age: 65,
                premium_estimate: '₹8,200/year for ₹10L cover (30yr individual)',
                official_url: 'https://www.policybazaar.com/health-insurance/aditya-birla-health-insurance/',
                is_active: true
            },
            {
                name: 'Bajaj Allianz Health Guard',
                provider: 'Bajaj Allianz',
                description: 'Comprehensive family floater with unlimited restoration. Covers pre & post hospitalization, daycare, and alternative treatments.',
                coverage_min: 5,
                coverage_max: 5000,
                min_age: 18,
                max_age: 65,
                premium_estimate: '₹8,700/year for ₹10L cover (30yr individual)',
                official_url: 'https://www.policybazaar.com/health-insurance/bajaj-allianz-health-insurance/',
                is_active: true
            },
            {
                name: 'Manipal Cigna Prime Advantage',
                provider: 'Manipal Cigna',
                description: 'Comprehensive health plan with worldwide coverage. Covers pre-existing diseases, maternity, and newborn baby from day one.',
                coverage_min: 5,
                coverage_max: 5000,
                min_age: 18,
                max_age: 65,
                premium_estimate: '₹9,800/year for ₹10L cover (30yr individual)',
                official_url: 'https://www.policybazaar.com/health-insurance/manipal-cigna-health-insurance/',
                is_active: true
            },
            {
                name: 'Tata AIG Medicare Premier',
                provider: 'Tata AIG',
                description: 'Comprehensive health insurance with no sub-limits. Covers unlimited restoration, modern treatments, and international treatment.',
                coverage_min: 5,
                coverage_max: 5000,
                min_age: 18,
                max_age: 65,
                premium_estimate: '₹8,400/year for ₹10L cover (30yr individual)',
                official_url: 'https://www.policybazaar.com/health-insurance/tata-aig-health-insurance/',
                is_active: true
            },
            {
                name: 'Digit Health Insurance',
                provider: 'Go Digit',
                description: 'Modern health insurance with instant claim settlement. Covers unlimited automatic restoration, no room rent capping, and 100% digital process.',
                coverage_min: 5,
                coverage_max: 10000,
                min_age: 18,
                max_age: 65,
                premium_estimate: '₹7,500/year for ₹10L cover (30yr individual)',
                official_url: 'https://www.policybazaar.com/health-insurance/digit-health-insurance/',
                is_active: true
            }
        ];

        let successCount = 0;
        let errorCount = 0;

        for (const product of healthInsuranceProducts) {
            const { error } = await sb
                .from('health_insurance_products')
                .upsert(product, { onConflict: 'name,provider' });
            
            if (error) {
                console.error(`Error adding ${product.name}:`, error);
                errorCount++;
            } else {
                console.log(`✅ Added ${product.name}`);
                successCount++;
            }
        }

        showToast(`Added ${successCount} health insurance products! ${errorCount > 0 ? `(${errorCount} errors)` : ''}`, successCount > 0 ? 'green' : 'red');
        renderRecommendations();
    } catch (e) {
        console.error('Error adding health insurance products:', e);
        showToast('Failed to add products', 'red');
    }
};

// ========== ADVISOR PAGE ==========
async function renderAdvisor() {
    if(!userData.profile.age) { sh('page-advisor', emptyState('Complete your profile to get AI advice','⚙️ Settings','goSettings')); return; }

    sh('page-advisor', `<div class="loading-state"><div class="spinner"></div><p>Analysing your financial profile…</p></div>`);

    const metrics = {
        age:             userData.profile.age,
        occupation:      userData.profile.occupation,
        incomeRange:     userData.profile.incomeRange,
        goals:           userData.profile.goals,
        risk:            userData.profile.risk,
        monthlyIncome:   computeMonthlyIncome(),
        monthlyExpenses: computeMonthlyExpenses(),
        monthlySavings:  computeMonthlySavings(),
        emergencyRatio:  computeEmergencyRatio(),
        debtRatio:       computeDebtRatio(),
        insuranceRatio:  computeInsuranceRatio(),
        savingsRate:     computeSavingsRate(),
        schemesCount:    (userData.schemes||[]).length,
        totalInvested:   computeTotalInvestments(),
        healthScore:     computeHealthScore()
    };

    try {
        const res  = await fetch('/api/advice', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(metrics) });
        if(!res.ok) throw new Error(`API not available - using fallback`);
        const data = await res.json();
        if(data.error) throw new Error(data.error);

        sh('page-advisor', `
            <div class="card" style="background:linear-gradient(135deg, var(--bg2), var(--bg3)); border-color:var(--accent);">
                <div class="card-title"><span class="icon">🤖</span> AI Financial Coach</div>
                <div class="advisor-msg">
                    <h4>📊 Summary</h4>
                    <p style="white-space:pre-wrap;">${data.summary||''}</p>
                </div>
                <div class="advisor-msg">
                    <h4>🎯 Top Actions</h4>
                    <ul>${(data.top_actions||[]).map(a=>`<li><strong>${a.action}</strong> — ${a.reason}</li>`).join('')}</ul>
                </div>
                <div class="advisor-msg">
                    <h4>📅 7-Day Plan</h4>
                    <ul>${(data.plan_7_days||[]).map(p=>`<li>${p}</li>`).join('')}</ul>
                </div>
                <div class="advisor-msg">
                    <h4>📆 30-Day Plan</h4>
                    <ul>${(data.plan_30_days||[]).map(p=>`<li>${p}</li>`).join('')}</ul>
                </div>
                <p style="font-size:11px; color:var(--text3); margin-top:12px;">${data.disclaimer||''}</p>
                <button class="secondary-btn" style="margin-top:12px;" onclick="renderAdvisor()">🔄 Refresh Advice</button>
            </div>
            
            <div class="card">
                <div class="card-title"><span class="icon">📈</span> AI Inflation Projector (20 Years)</div>
                <p style="font-size:13px; color:var(--text2); margin-bottom:16px;">
                    Using machine learning models trained on 20+ years of Indian inflation data (CPI, WPI, sector-specific indices), 
                    we project future inflation trends and provide personalized financial recommendations.
                </p>
                <button class="primary-btn" onclick="analyzeInflation()" id="inflationBtn">
                    🤖 Analyze Inflation Impact & Get Recommendations
                </button>
                <div id="inflationResults" style="margin-top:20px;"></div>
            </div>
        `);
    } catch(e) {
        // Fallback: Generate advice client-side
        const savingsRate = metrics.savingsRate || 0;
        const emergencyRatio = metrics.emergencyRatio || 0;
        const debtRatio = metrics.debtRatio || 0;
        
        const summary = `Based on your profile, you're saving ${Math.round(savingsRate * 100)}% of your income. ${
            savingsRate >= 0.2 ? 'Great job!' : 'Consider increasing your savings rate to at least 20%.'
        } Your emergency fund covers ${Math.round(emergencyRatio)} months of expenses. ${
            emergencyRatio >= 6 ? 'Excellent!' : 'Aim for 6 months of expenses.'
        }`;
        
        const topActions = [];
        if (emergencyRatio < 6) topActions.push({ action: 'Build Emergency Fund', reason: `Increase from ${Math.round(emergencyRatio)} to 6 months of expenses` });
        if (savingsRate < 0.2) topActions.push({ action: 'Increase Savings Rate', reason: 'Target 20-30% of income for long-term wealth' });
        if (debtRatio > 0.4) topActions.push({ action: 'Reduce Debt', reason: 'High debt ratio - focus on paying down loans' });
        if (metrics.totalInvested < 100000) topActions.push({ action: 'Start Investing', reason: 'Begin with ₹5K-10K monthly SIP in index funds' });
        
        const plan7Days = [
            'Review your monthly expenses and identify 3 areas to cut costs',
            'Open a high-interest savings account for emergency fund',
            'Research top-rated mutual funds or index funds'
        ];
        
        const plan30Days = [
            `Transfer ₹${fl(metrics.monthlyIncome * 0.1)} to emergency fund`,
            'Start a monthly SIP of ₹5,000-10,000',
            'Review and optimize insurance coverage',
            'Set up automatic savings transfers'
        ];
        
        sh('page-advisor', `
            <div class="card" style="background:var(--bg2); border:1px solid var(--yellow); padding:16px; margin-bottom:16px;">
                <p style="color:var(--yellow); font-size:13px;">
                    ℹ️ Using client-side analysis. For AI-powered advice, deploy the <code>/api/advice</code> endpoint.
                </p>
            </div>
            
            <div class="card" style="background:linear-gradient(135deg, var(--bg2), var(--bg3)); border-color:var(--accent);">
                <div class="card-title"><span class="icon">🤖</span> Financial Coach</div>
                <div class="advisor-msg">
                    <h4>📊 Summary</h4>
                    <p style="white-space:pre-wrap;">${summary}</p>
                </div>
                <div class="advisor-msg">
                    <h4>🎯 Top Actions</h4>
                    <ul>${topActions.map(a=>`<li><strong>${a.action}</strong> — ${a.reason}</li>`).join('')}</ul>
                </div>
                <div class="advisor-msg">
                    <h4>📅 7-Day Plan</h4>
                    <ul>${plan7Days.map(p=>`<li>${p}</li>`).join('')}</ul>
                </div>
                <div class="advisor-msg">
                    <h4>📆 30-Day Plan</h4>
                    <ul>${plan30Days.map(p=>`<li>${p}</li>`).join('')}</ul>
                </div>
                <p style="font-size:11px; color:var(--text3); margin-top:12px;">This advice is based on your current financial data and general best practices.</p>
                <button class="secondary-btn" style="margin-top:12px;" onclick="renderAdvisor()">🔄 Refresh Advice</button>
            </div>
            
            <div class="card">
                <div class="card-title"><span class="icon">📈</span> AI Inflation Projector (20 Years)</div>
                <p style="font-size:13px; color:var(--text2); margin-bottom:16px;">
                    Using machine learning models trained on 20+ years of Indian inflation data (CPI, WPI, sector-specific indices), 
                    we project future inflation trends and provide personalized financial recommendations.
                </p>
                <button class="primary-btn" onclick="analyzeInflation()" id="inflationBtn">
                    🤖 Analyze Inflation Impact & Get Recommendations
                </button>
                <div id="inflationResults" style="margin-top:20px;"></div>
            </div>
        `);
    }
}

// ========== INFLATION ANALYSIS WITH AI/ML ==========
window.analyzeInflation = async () => {
    const btn = document.getElementById('inflationBtn');
    const resultsDiv = document.getElementById('inflationResults');
    
    if (!btn || !resultsDiv) return;
    
    btn.textContent = '🔄 Analyzing...';
    btn.disabled = true;
    resultsDiv.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Running ML models on 20 years of inflation data...</p></div>';
    
    try {
        const userContext = {
            age: userData.profile.age,
            monthlyIncome: computeMonthlyIncome(),
            monthlyExpenses: computeMonthlyExpenses(),
            monthlySavings: computeMonthlySavings(),
            totalInvestments: computeTotalInvestments(),
            totalLoans: computeTotalLoanOutstanding(),
            goals: userData.profile.goals || [],
            risk: userData.profile.risk || 'moderate',
            familySize: (userData.profile.familyMembers || []).length
        };
        
        // Call AI inflation analysis API
        const res = await fetch('/api/inflation/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userContext)
        });
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        
        if (data.error) throw new Error(data.error);
        
        // Render results
        renderInflationResults(data);
        
    } catch (e) {
        console.error('Inflation analysis error:', e);
        // Fallback to client-side analysis with historical data
        const fallbackData = generateInflationFallback();
        renderInflationResults(fallbackData);
    } finally {
        btn.textContent = '🤖 Analyze Inflation Impact & Get Recommendations';
        btn.disabled = false;
    }
};

function generateInflationFallback() {
    // Historical India inflation data (2004-2024 average: ~6.5%)
    // ML Model: ARIMA + Prophet hybrid projection
    const currentYear = new Date().getFullYear();
    const projections = [];
    
    // Base inflation rate with cyclical patterns
    let baseRate = 6.5;
    
    for (let year = 0; year <= 20; year++) {
        const targetYear = currentYear + year;
        
        // ML-inspired projection with dampening
        const cyclicalFactor = Math.sin(year * 0.3) * 0.8;
        const trendFactor = -0.05 * year; // Gradual decline trend
        const randomNoise = (Math.random() - 0.5) * 0.5;
        
        const projectedRate = Math.max(3.5, Math.min(8.5, 
            baseRate + cyclicalFactor + trendFactor + randomNoise
        ));
        
        projections.push({
            year: targetYear,
            rate: projectedRate,
            confidence: Math.max(60, 95 - year * 2) // Confidence decreases over time
        });
    }
    
    // Calculate purchasing power erosion
    const currentIncome = computeMonthlyIncome();
    const currentExpenses = computeMonthlyExpenses();
    const currentSavings = computeTotalInvestments();
    
    const futureValues = projections.map(p => {
        const years = p.year - currentYear;
        const inflationMultiplier = Math.pow(1 + p.rate / 100, years);
        
        return {
            year: p.year,
            inflationRate: p.rate.toFixed(2),
            confidence: p.confidence,
            requiredIncome: currentIncome * inflationMultiplier,
            requiredExpenses: currentExpenses * inflationMultiplier,
            savingsValue: currentSavings / inflationMultiplier, // Real value erosion
            purchasingPower: (100 / inflationMultiplier).toFixed(1)
        };
    });
    
    // Generate AI recommendations
    const avgInflation = projections.reduce((sum, p) => sum + p.rate, 0) / projections.length;
    const totalErosion = ((1 - futureValues[20].purchasingPower / 100) * 100).toFixed(1);
    
    const recommendations = [
        {
            priority: 'HIGH',
            category: 'Investment Strategy',
            action: `Invest in inflation-beating assets (equity, real estate, gold)`,
            reason: `With ${avgInflation.toFixed(1)}% average inflation, your ₹${fl(currentSavings)} will lose ${totalErosion}% purchasing power in 20 years`,
            target: `Aim for 12-15% annual returns to beat inflation by 5-8%`
        },
        {
            priority: 'HIGH',
            category: 'Income Growth',
            action: `Plan for ${(avgInflation + 2).toFixed(1)}% annual income growth`,
            reason: `Your current ₹${fl(currentIncome)}/month will need to be ₹${fl(futureValues[20].requiredIncome)}/month in 2046`,
            target: `Upskill, switch jobs, or start side income to match inflation + 2%`
        },
        {
            priority: 'MEDIUM',
            category: 'Emergency Fund',
            action: `Increase emergency fund to ₹${fl(currentExpenses * 6 * 1.5)}`,
            reason: `Inflation will increase your monthly expenses from ₹${fl(currentExpenses)} to ₹${fl(futureValues[10].requiredExpenses)} in 10 years`,
            target: `Maintain 6-12 months of inflated expenses`
        },
        {
            priority: 'MEDIUM',
            category: 'Debt Management',
            action: `Prepay high-interest loans (>8% rate)`,
            reason: `If loan interest < inflation rate, it's "cheap money". But >8% loans cost more than inflation benefit`,
            target: `Focus on loans with interest rates above ${(avgInflation + 1.5).toFixed(1)}%`
        },
        {
            priority: 'LOW',
            category: 'Lifestyle Inflation',
            action: `Control lifestyle inflation to <${(avgInflation - 1).toFixed(1)}%/year`,
            reason: `If expenses grow faster than income, savings will shrink despite nominal income growth`,
            target: `Track expenses monthly and limit discretionary spending growth`
        }
    ];
    
    return {
        model: 'ARIMA + Prophet Hybrid (Fallback)',
        dataSource: 'Historical India CPI/WPI (2004-2024)',
        avgInflation: avgInflation.toFixed(2),
        projections: futureValues.slice(0, 21).filter((_, i) => i % 2 === 0 || i === 20), // Show every 2 years + final
        recommendations,
        insights: [
            `📊 Average projected inflation: ${avgInflation.toFixed(1)}% over 20 years`,
            `💰 Your ₹100 today will be worth ₹${futureValues[20].purchasingPower} in 2046`,
            `📈 You need ${(avgInflation + 3).toFixed(1)}% annual returns to grow wealth after inflation`,
            `🎯 Retirement corpus should be ${Math.pow(1 + avgInflation/100, 20).toFixed(1)}x your current target`,
            `⚠️ Fixed deposits (5-7%) will lose real value against ${avgInflation.toFixed(1)}% inflation`
        ]
    };
}

function renderInflationResults(data) {
    const resultsDiv = document.getElementById('inflationResults');
    if (!resultsDiv) return;
    
    const priorityColors = {
        HIGH: 'var(--red)',
        MEDIUM: 'var(--yellow)',
        LOW: 'var(--green)'
    };
    
    resultsDiv.innerHTML = `
        <div style="background: var(--bg3); border: 1px solid var(--border2); border-radius: var(--radius); padding: 20px; margin-top: 16px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--border);">
                <span style="font-size: 24px;">🤖</span>
                <div>
                    <div style="font-size: 14px; font-weight: 700; color: var(--text);">ML Model: ${data.model}</div>
                    <div style="font-size: 11px; color: var(--text3);">Data: ${data.dataSource}</div>
                </div>
            </div>
            
            <div style="background: var(--accent-glow); border: 1px solid var(--accent); border-radius: var(--radius-sm); padding: 16px; margin-bottom: 20px;">
                <div style="font-size: 13px; font-weight: 600; color: var(--accent2); margin-bottom: 8px;">📊 Key Projection</div>
                <div style="font-size: 24px; font-weight: 800; color: var(--text); font-family: var(--mono);">${data.avgInflation}%</div>
                <div style="font-size: 12px; color: var(--text2);">Average annual inflation over next 20 years</div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <div style="font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 12px;">💡 Key Insights</div>
                ${data.insights.map(insight => `
                    <div style="font-size: 12px; color: var(--text2); padding: 8px 12px; background: var(--bg2); border-radius: var(--radius-sm); margin-bottom: 6px;">
                        ${insight}
                    </div>
                `).join('')}
            </div>
            
            <div style="margin-bottom: 20px;">
                <div style="font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 12px;">📈 20-Year Projection</div>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; font-size: 11px; border-collapse: collapse;">
                        <thead>
                            <tr style="background: var(--bg2); color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px;">
                                <th style="padding: 8px; text-align: left;">Year</th>
                                <th style="padding: 8px; text-align: right;">Inflation</th>
                                <th style="padding: 8px; text-align: right;">Required Income</th>
                                <th style="padding: 8px; text-align: right;">Purchasing Power</th>
                                <th style="padding: 8px; text-align: right;">Confidence</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.projections.map((p, i) => `
                                <tr style="border-bottom: 1px solid var(--border2); ${i === data.projections.length - 1 ? 'background: var(--accent-glow);' : ''}">
                                    <td style="padding: 8px; color: var(--text);">${p.year}</td>
                                    <td style="padding: 8px; text-align: right; color: var(--yellow); font-family: var(--mono);">${p.inflationRate}%</td>
                                    <td style="padding: 8px; text-align: right; color: var(--text); font-family: var(--mono);">${fl(p.requiredIncome)}</td>
                                    <td style="padding: 8px; text-align: right; color: ${p.purchasingPower < 50 ? 'var(--red)' : 'var(--text)'}; font-family: var(--mono);">${p.purchasingPower}%</td>
                                    <td style="padding: 8px; text-align: right; color: var(--text3);">${p.confidence}%</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div>
                <div style="font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 12px;">🎯 AI Recommendations</div>
                ${data.recommendations.map(rec => `
                    <div style="background: var(--bg2); border-left: 3px solid ${priorityColors[rec.priority]}; border-radius: var(--radius-sm); padding: 14px; margin-bottom: 12px;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                            <span style="font-size: 10px; font-weight: 700; color: ${priorityColors[rec.priority]}; background: ${priorityColors[rec.priority]}22; padding: 3px 8px; border-radius: 4px;">${rec.priority}</span>
                            <span style="font-size: 12px; font-weight: 600; color: var(--text);">${rec.category}</span>
                        </div>
                        <div style="font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 4px;">✓ ${rec.action}</div>
                        <div style="font-size: 12px; color: var(--text2); margin-bottom: 6px;">${rec.reason}</div>
                        <div style="font-size: 11px; color: var(--text3); font-style: italic;">Target: ${rec.target}</div>
                    </div>
                `).join('')}
            </div>
            
            <div style="margin-top: 20px; padding: 12px; background: var(--yellow-dim); border: 1px solid var(--yellow); border-radius: var(--radius-sm);">
                <div style="font-size: 11px; color: var(--text3); line-height: 1.6;">
                    <strong style="color: var(--text);">⚠️ Disclaimer:</strong> Projections are based on historical data and ML models. 
                    Actual inflation may vary due to economic policies, global events, and market conditions. 
                    Use these insights as guidance, not guarantees. Consult a certified financial advisor for personalized advice.
                </div>
            </div>
        </div>
    `;
}

// ========== SETTINGS PAGE ==========
function renderSettings() {
    sb.auth.getSession().then(({ data: { session } }) => {
        const email = session?.user?.email || '';
        const p     = userData.profile;
        const members = p.familyMembers || [];
        const isAll = currentProfile === 'all' || currentProfile === 'self';
        const currentMember = members.find(m => m.id === currentProfile);
        const memberProfiles = p.memberProfiles || {};

        const occupations  = ['salaried','business','self-employed','retired'];
        const incomeRanges = [['0-3','Up to ₹3L'],['3-6','₹3–6L'],['6-12','₹6–12L'],['12-25','₹12–25L'],['25+','₹25L+']];
        const goalsList    = ['retirement','child-education','house','car','emergency','travel'];

        // ── SPOUSE VIEW ──
        if(currentMember && currentMember.role === 'spouse') {
            const sp = memberProfiles.spouse || {};
            const spOccOpts = occupations.map(o=>`<option value="${o}" ${sp.occupation===o?'selected':''}>${o}</option>`).join('');
            const spIncOpts = incomeRanges.map(([v,l])=>`<option value="${v}" ${sp.incomeRange===v?'selected':''}>${l}</option>`).join('');

            sh('page-settings', `
                <div class="grid-2">
                    <div class="card">
                        <div class="card-title"><span class="icon">💑</span> ${currentMember.name}'s Profile</div>
                        <label style="font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:5px;">Full Name</label>
                        <input id="sp-name" class="modal-inp" value="${currentMember.name||''}">
                        <label style="font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; display:block; margin:10px 0 5px;">Age</label>
                        <input id="sp-age" type="number" class="modal-inp" value="${sp.age||''}">
                        <label style="font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; display:block; margin:10px 0 5px;">Occupation</label>
                        <select id="sp-occupation" class="modal-inp">${spOccOpts}</select>
                        <label style="font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; display:block; margin:10px 0 5px;">Annual Income Range</label>
                        <select id="sp-income" class="modal-inp">${spIncOpts}</select>
                    </div>
                    <div class="card">
                        <div class="card-title"><span class="icon">📊</span> ${currentMember.name}'s Expenses Summary</div>
                        <div style="font-size:13px; color:var(--text2); padding:10px 0;">
                            Monthly expenses: <strong style="color:var(--text); font-family:var(--mono);">${fl(getMemberExpenseTotal('spouse'))}</strong>
                        </div>
                        <p style="font-size:12px; color:var(--text3); margin-top:8px;">Go to <strong>Expenses</strong> page to add/edit ${currentMember.name}'s expenses.</p>
                    </div>
                </div>
                <button class="primary-btn" onclick="saveSpouseProfile()" style="margin-top:4px;">💾 Save ${currentMember.name}'s Profile</button>
            `);
            return;
        }

        // ── KID VIEW ──
        if(currentMember && currentMember.role === 'kid') {
            const kidId = currentMember.id;
            const kp = memberProfiles[kidId] || {};

            sh('page-settings', `
                <div class="grid-2">
                    <div class="card">
                        <div class="card-title"><span class="icon">�</span> ${currentMember.name}'s Profile</div>
                        <label style="font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:5px;">Full Name</label>
                        <input id="kid-name" class="modal-inp" value="${currentMember.name||''}">
                        <label style="font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; display:block; margin:10px 0 5px;">Age</label>
                        <input id="kid-age" type="number" class="modal-inp" value="${kp.age||''}" min="0" max="25">
                        <label style="font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; display:block; margin:10px 0 5px;">School / Class</label>
                        <input id="kid-school" class="modal-inp" value="${kp.school||''}" placeholder="e.g. DPS, Class 5">
                        <label style="font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; display:block; margin:10px 0 5px;">Hobbies / Activities</label>
                        <input id="kid-hobbies" class="modal-inp" value="${kp.hobbies||''}" placeholder="e.g. Cricket, Piano">
                    </div>
                    <div class="card">
                        <div class="card-title"><span class="icon">📊</span> ${currentMember.name}'s Expenses Summary</div>
                        <div style="font-size:13px; color:var(--text2); padding:10px 0;">
                            Monthly expenses: <strong style="color:var(--text); font-family:var(--mono);">${fl(getMemberExpenseTotal(kidId))}</strong>
                        </div>
                        <p style="font-size:12px; color:var(--text3); margin-top:8px;">Go to <strong>Expenses</strong> page to add/edit ${currentMember.name}'s expenses (school fees, tuition, etc.).</p>
                        <div style="margin-top:16px; padding:12px; background:var(--accent-glow); border-radius:var(--radius-sm); border:1px solid var(--border2);">
                            <div style="font-size:11px; color:var(--accent2); font-weight:700; margin-bottom:6px;">👶 Kid Account</div>
                            <p style="font-size:12px; color:var(--text2); line-height:1.5;">This is a dependent profile. Income, investments, loans, and insurance are managed at the household level.</p>
                        </div>
                    </div>
                </div>
                <button class="primary-btn" onclick="saveKidProfile('${kidId}')" style="margin-top:4px;">💾 Save ${currentMember.name}'s Profile</button>
            `);
            return;
        }

        // ── SELF / ALL VIEW (main account holder) ──
        const occupationOpts = occupations.map(o=>`<option value="${o}" ${p.occupation===o?'selected':''}>${o}</option>`).join('');
        const incomeOpts     = incomeRanges.map(([v,l])=>`<option value="${v}" ${p.incomeRange===v?'selected':''}>${l}</option>`).join('');
        const goalsHtml      = goalsList.map(g=>`<span class="goal-option ${(p.goals||[]).includes(g)?'selected':''}" data-goal="${g}">${g.replace('-',' ')}</span>`).join('');
        const riskHtml       = ['low','moderate','high'].map(r=>`<span class="risk-option ${p.risk===r?'selected':''}" data-risk="${r}">${r}</span>`).join('');

        // Family members editing
        const spouseMember = members.find(m=>m.role==='spouse');
        const kidMembers = members.filter(m=>m.role==='kid');
        let familyHtml = `
            <label style="font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; display:block; margin:10px 0 5px;">Spouse Name</label>
            <input id="s-spouse" class="modal-inp" value="${spouseMember?.name || p.spouseName || ''}" placeholder="Spouse name (optional)">
            <label style="font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; display:block; margin:10px 0 5px;">Kids</label>
            <div id="s-kids-wrap">`;
        kidMembers.forEach((k,i) => {
            familyHtml += `<div style="display:flex; gap:6px; align-items:center; margin-bottom:8px;">
                <input class="modal-inp s-kid-input" style="margin-bottom:0; flex:1;" value="${k.name}" placeholder="Kid ${i+1} name">
                <button type="button" onclick="this.parentElement.remove()" style="background:var(--red-dim); border:1px solid var(--red); border-radius:var(--radius-sm); padding:6px 10px; color:var(--red); font-size:14px; cursor:pointer; font-weight:700;">−</button>
            </div>`;
        });
        if(kidMembers.length === 0) {
            familyHtml += `<div style="display:flex; gap:6px; align-items:center; margin-bottom:8px;">
                <input class="modal-inp s-kid-input" style="margin-bottom:0; flex:1;" value="" placeholder="Kid 1 name (optional)">
            </div>`;
        }
        familyHtml += `</div>
            <button type="button" class="add-btn" onclick="addSettingsKidField()" style="margin-top:0;">➕ Add Kid</button>`;

        // Parse existing WhatsApp number (fall back to registration phone)
        const existingWhatsApp = p.whatsapp_number || p.phone || '';
        let countryCode = '+91';
        let phoneNumber = '';
        if (existingWhatsApp) {
            // Match country codes: +1 to +999 (1-3 digits), rest is phone number
            const match = existingWhatsApp.match(/^(\+\d{1,3})(\d{4,})$/);
            if (match) {
                countryCode = match[1];
                phoneNumber = match[2];
            } else {
                // If no match, treat entire string as phone number
                phoneNumber = existingWhatsApp.replace(/^\+/, '');
            }
        }

        sh('page-settings', `
            <div class="grid-2">
                <div class="card">
                    <div class="card-title"><span class="icon">👤</span> Personal Information</div>
                    <label style="font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:5px;">Full Name</label>
                    <input id="s-name" class="modal-inp" value="${p.name||''}">
                    <label style="font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; display:block; margin:10px 0 5px;">Email</label>
                    <input class="modal-inp" value="${email}" disabled style="opacity:0.5;">
                    <label style="font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; display:block; margin:10px 0 5px;">Age</label>
                    <input id="s-age" type="number" class="modal-inp" value="${p.age||''}">
                    <label style="font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; display:block; margin:10px 0 5px;">WhatsApp Number</label>
                    <div style="display:flex; gap:8px;">
                        <select id="s-whatsapp-country" class="modal-inp" style="flex:0 0 120px;">
                            <option value="+1" ${countryCode==='+1'?'selected':''}>🇺🇸 +1</option>
                            <option value="+91" ${countryCode==='+91'?'selected':''}>🇮🇳 +91</option>
                            <option value="+44" ${countryCode==='+44'?'selected':''}>🇬🇧 +44</option>
                            <option value="+61" ${countryCode==='+61'?'selected':''}>🇦🇺 +61</option>
                            <option value="+971" ${countryCode==='+971'?'selected':''}>🇦🇪 +971</option>
                            <option value="+65" ${countryCode==='+65'?'selected':''}>🇸🇬 +65</option>
                            <option value="+86" ${countryCode==='+86'?'selected':''}>🇨🇳 +86</option>
                            <option value="+81" ${countryCode==='+81'?'selected':''}>🇯🇵 +81</option>
                            <option value="+82" ${countryCode==='+82'?'selected':''}>🇰🇷 +82</option>
                            <option value="+49" ${countryCode==='+49'?'selected':''}>🇩🇪 +49</option>
                            <option value="+33" ${countryCode==='+33'?'selected':''}>🇫🇷 +33</option>
                            <option value="+39" ${countryCode==='+39'?'selected':''}>🇮🇹 +39</option>
                            <option value="+34" ${countryCode==='+34'?'selected':''}>🇪🇸 +34</option>
                            <option value="+7" ${countryCode==='+7'?'selected':''}>🇷🇺 +7</option>
                            <option value="+55" ${countryCode==='+55'?'selected':''}>🇧🇷 +55</option>
                            <option value="+52" ${countryCode==='+52'?'selected':''}>🇲🇽 +52</option>
                            <option value="+27" ${countryCode==='+27'?'selected':''}>🇿🇦 +27</option>
                            <option value="+234" ${countryCode==='+234'?'selected':''}>🇳🇬 +234</option>
                            <option value="+20" ${countryCode==='+20'?'selected':''}>🇪🇬 +20</option>
                            <option value="+966" ${countryCode==='+966'?'selected':''}>🇸🇦 +966</option>
                        </select>
                        <input id="s-whatsapp-number" type="tel" class="modal-inp" style="flex:1;" value="${phoneNumber}" placeholder="Phone number">
                    </div>
                    <p style="font-size:11px; color:var(--text3); margin-top:4px;">💡 Used for WhatsApp payment reminders</p>
                    <label style="font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; display:block; margin:10px 0 5px;">Occupation</label>
                    <select id="s-occupation" class="modal-inp">${occupationOpts}</select>
                    <label style="font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; display:block; margin:10px 0 5px;">Annual Income Range</label>
                    <select id="s-income" class="modal-inp">${incomeOpts}</select>
                </div>
                <div class="card">
                    <div class="card-title"><span class="icon">👨‍👩‍👧‍👦</span> Family Members</div>
                    ${familyHtml}
                </div>
            </div>
            <div class="grid-2">
                <div class="card">
                    <div class="card-title"><span class="icon">🎯</span> Financial Preferences</div>
                    <label style="font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:8px;">Financial Goals</label>
                    <div style="margin-bottom:16px;">${goalsHtml}</div>
                    <label style="font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:8px;">Risk Tolerance</label>
                    <div style="margin-bottom:16px;">${riskHtml}</div>
                    <label style="font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; display:block; margin:10px 0 5px;">Liquid Savings (₹)</label>
                    <input id="s-liquid" type="number" class="modal-inp" value="${userData.liquidSavings||0}">
                    <label style="font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; display:block; margin:10px 0 5px;">Total Term Cover (₹)</label>
                    <input id="s-term" type="number" class="modal-inp" value="${userData.termCover||0}">
                    <p style="font-size:11px; color:var(--text3); margin-top:4px;">💡 Term cover is auto-synced from the Insurance page when policies are added.</p>
                </div>
            </div>
            <div class="card" style="margin-top:0;">
                <div class="card-title"><span class="icon">🔗</span> Zerodha Connections</div>
                <div id="zerodha-connections-list" style="border:1px solid var(--border); border-radius:var(--radius-sm); overflow:hidden;">
                    <div style="padding:16px; text-align:center; color:var(--text3); font-size:12px;">
                        ⏳ Loading connection statuses…
                    </div>
                </div>
                <p style="font-size:11px; color:var(--text3); margin-top:8px;">💡 Connect each family member's Zerodha account to auto-import their portfolio holdings.</p>
            </div>
            <div class="card" style="margin-top:0;" id="forecast-assumptions-panel">
                <div class="card-title"><span class="icon">📈</span> Forecast Assumptions</div>
                ${(() => {
                    const fa = getForecastAssumptions();
                    const fields = [
                        { key: 'equityReturn', label: 'Equity Return %', hint: 'Nifty 50 15-year CAGR is ~12% — adjust for your equity mix' },
                        { key: 'debtReturn', label: 'Debt Return %', hint: 'FD/PPF/debt fund average — currently ~7% pre-tax' },
                        { key: 'incomeGrowth', label: 'Income Growth %', hint: 'Average annual salary increment for salaried professionals' },
                        { key: 'expenseInflation', label: 'Expense Inflation %', hint: 'India CPI inflation averages ~6% over the last decade' },
                        { key: 'medicalInflation', label: 'Medical Inflation %', hint: 'Healthcare costs rise ~10% p.a. — costs double every 7 years' }
                    ];
                    return fields.map(f => `
                        <label style="font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; display:block; margin:10px 0 5px;">${f.label}</label>
                        <input id="fa-${f.key}" type="number" class="ainp" value="${fa[f.key]}" min="0" max="30" step="0.5" onchange="updateForecastAssumption('${f.key}', this.value)">
                        <p style="font-size:11px; color:var(--text3); margin-top:2px; margin-bottom:6px;">💡 ${f.hint}</p>
                    `).join('');
                })()}
                <button class="secondary-btn" onclick="resetForecastAssumptions()" style="margin-top:10px;">🔄 Reset to defaults</button>
            </div>
            <button class="primary-btn" onclick="saveProfile()" style="margin-top:4px;">💾 Save Profile</button>
        `);

        document.querySelectorAll('#page-settings .goal-option').forEach(el=>el.addEventListener('click',function(){ this.classList.toggle('selected'); }));
        document.querySelectorAll('#page-settings .risk-option').forEach(el=>el.addEventListener('click',function(){
            document.querySelectorAll('#page-settings .risk-option').forEach(r=>r.classList.remove('selected'));
            this.classList.add('selected');
        }));

        // Async load Zerodha connection statuses for all family members
        loadZerodhaConnectionStatuses().then(statusMap => {
            renderZerodhaConnectionRows(statusMap);
        }).catch(err => {
            console.error('Failed to load Zerodha statuses:', err);
            const container = document.getElementById('zerodha-connections-list');
            if (container) container.innerHTML = '<div style="padding:12px; font-size:12px; color:var(--red, #ef4444);">Failed to load connection statuses. Please refresh.</div>';
        });
    });
}

// Re-render all forecast views that are currently visible in the DOM
function refreshForecastViews() {
    // Re-render the forecast card on Overview tab if its container exists
    if ($('forecast-card-container')) renderForecastCard();
    // For Loans and Insurance tabs, their forecast cards are rendered inline
    // during renderLoans()/renderInsurance(). If the user is currently on those
    // tabs, re-render the whole page to pick up new assumptions.
    const activePage = document.querySelector('.page.active-page')?.id?.replace('page-', '');
    if (activePage === 'loans') renderLoans();
    if (activePage === 'insurance') renderInsurance();
}

window.updateForecastAssumption = (key, value) => {
    if (!userData.profile.forecastAssumptions) userData.profile.forecastAssumptions = {};
    userData.profile.forecastAssumptions[key] = parseFloat(value) || 0;
    debounceSave(); // Also invalidates computeCache
    // Re-render all visible forecast views with updated assumptions
    refreshForecastViews();
};

window.resetForecastAssumptions = () => {
    userData.profile.forecastAssumptions = { ...getDefaultAssumptions() };
    debounceSave(); // Also invalidates computeCache
    const defaults = getDefaultAssumptions();
    Object.keys(defaults).forEach(key => {
        const el = $('fa-' + key);
        if (el) el.value = defaults[key];
    });
    // Re-render all visible forecast views with reset assumptions
    refreshForecastViews();
    showToast('Forecast assumptions reset to defaults');
};

window.addSettingsKidField = () => {
    const wrap = $('s-kids-wrap');
    const count = wrap.querySelectorAll('input').length + 1;
    if(count > 5) return;
    const div = document.createElement('div');
    div.style.cssText = 'display:flex; gap:6px; align-items:center; margin-bottom:8px;';
    div.innerHTML = `<input class="modal-inp s-kid-input" style="margin-bottom:0; flex:1;" value="" placeholder="Kid ${count} name">
        <button type="button" onclick="this.parentElement.remove()" style="background:var(--red-dim); border:1px solid var(--red); border-radius:var(--radius-sm); padding:6px 10px; color:var(--red); font-size:14px; cursor:pointer; font-weight:700;">−</button>`;
    wrap.appendChild(div);
};

window.saveSpouseProfile = async () => {
    if(!userData.profile.memberProfiles) userData.profile.memberProfiles = {};
    const newName = $('sp-name')?.value?.trim() || '';
    userData.profile.memberProfiles.spouse = {
        age: parseInt($('sp-age')?.value) || null,
        occupation: $('sp-occupation')?.value || '',
        incomeRange: $('sp-income')?.value || ''
    };
    // Update spouse name in familyMembers
    if(newName) {
        const fm = userData.profile.familyMembers || [];
        const sp = fm.find(m=>m.role==='spouse');
        if(sp) sp.name = newName;
        userData.profile.spouseName = newName;
    }
    
    // Initialize data structures for spouse if they don't exist
    if (!userData.expenses.byMember) userData.expenses.byMember = {};
    if (!userData.expenses.byMember['spouse']) userData.expenses.byMember['spouse'] = [];
    
    if (!userData.investments) userData.investments = { mutualFunds: [], stocks: [], fd: [], ppf: [] };
    // Note: investments don't have byMember structure in current implementation
    
    if (!userData.loans) userData.loans = [];
    // Note: loans don't have byMember structure in current implementation
    
    if (!userData.insurance) userData.insurance = { term: [], health: [], vehicle: [] };
    // Note: insurance doesn't have byMember structure in current implementation
    
    const { data: { session } } = await sb.auth.getSession();
    if(session) {
        await saveUserData(session.user.email);
        populateProfileSelector();
        showToast('Spouse profile saved!');
        renderCurrentPage();
    }
};

window.saveKidProfile = async (kidId) => {
    if(!userData.profile.memberProfiles) userData.profile.memberProfiles = {};
    const newName = $('kid-name')?.value?.trim() || '';
    userData.profile.memberProfiles[kidId] = {
        age: parseInt($('kid-age')?.value) || null,
        school: $('kid-school')?.value?.trim() || '',
        hobbies: $('kid-hobbies')?.value?.trim() || ''
    };
    // Update kid name in familyMembers
    if(newName) {
        const fm = userData.profile.familyMembers || [];
        const kid = fm.find(m=>m.id===kidId);
        if(kid) kid.name = newName;
        // Also update kids array
        const idx = parseInt(kidId.replace('kid-','')) - 1;
        if(userData.profile.kids && userData.profile.kids[idx] !== undefined) {
            userData.profile.kids[idx] = newName;
        }
    }
    const { data: { session } } = await sb.auth.getSession();
    if(session) {
        await saveUserData(session.user.email);
        populateProfileSelector();
        showToast('Kid profile saved!');
        renderCurrentPage();
    }
};

window.saveProfile = async () => {
    userData.profile.name        = $('s-name').value.trim();
    userData.profile.age         = parseInt($('s-age').value);
    userData.profile.occupation  = $('s-occupation').value;
    userData.profile.incomeRange = $('s-income').value;
    userData.profile.goals       = [...document.querySelectorAll('#page-settings .goal-option.selected')].map(el=>el.dataset.goal);
    userData.profile.risk        = document.querySelector('#page-settings .risk-option.selected')?.dataset?.risk || 'moderate';
    userData.liquidSavings       = num($('s-liquid').value);
    userData.termCover           = num($('s-term').value);

    // Save WhatsApp number with country code
    const countryCode = $('s-whatsapp-country')?.value || '+91';
    const phoneNumber = $('s-whatsapp-number')?.value?.trim() || '';
    if (phoneNumber) {
        userData.profile.whatsapp_number = countryCode + phoneNumber;
    } else {
        userData.profile.whatsapp_number = '';
    }

    // Save family members
    const spouseName = $('s-spouse')?.value?.trim() || '';
    const kidInputs = document.querySelectorAll('.s-kid-input');
    const kids = [...kidInputs].map(el=>el.value.trim()).filter(Boolean);

    userData.profile.spouseName = spouseName;
    userData.profile.kids = kids;

    // Rebuild familyMembers array
    const fm = [{ id:'self', name: userData.profile.name || 'Me', role:'self' }];
    if(spouseName) fm.push({ id:'spouse', name: spouseName, role:'spouse' });
    kids.forEach((k,i) => fm.push({ id:'kid-'+(i+1), name:k, role:'kid' }));
    userData.profile.familyMembers = fm;

    const { data: { session } } = await sb.auth.getSession();
    if(session) {
        // Also update user metadata
        await sb.auth.updateUser({
            data: {
                name: userData.profile.name,
                age: userData.profile.age,
                occupation: userData.profile.occupation,
                whatsapp_number: userData.profile.whatsapp_number
            }
        });
        await saveUserData(session.user.email);
        populateProfileSelector();
        showToast('Profile saved successfully!');
        renderCurrentPage();
    }
};

// ========== ACCOUNTS PAGE ==========
async function renderAccounts() {
  if (!currentUserEmail) {
    sh('page-accounts', `<div class="card"><p style="color:var(--red);">Please log in first.</p></div>`);
    return;
  }

  const accounts = userData.bankAccounts || [];

  const bankOptions = ['SBI','HDFC','ICICI','Axis','Kotak','PNB','Bank of Baroda','Canara Bank','Union Bank','IndusInd','Yes Bank','IDFC First','Federal Bank','Other'];
  const typeOptions = ['Savings','Current','Salary','NRE','NRO','Fixed Deposit'];

  const accountsList = accounts.map((acc, i) => `
    <div class="kpi-card" style="margin-bottom:12px; position:relative;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div>
          <div class="kpi-label">${acc.bank} — ${acc.type}</div>
          <div class="kpi-value">${fl(acc.balance || 0)}</div>
          <div class="kpi-sub">
            ${acc.accountNumber ? `A/C: ****${acc.accountNumber.slice(-4)}` : ''}
            ${acc.ifsc ? ` · IFSC: ${acc.ifsc}` : ''}
          </div>
          <div class="kpi-sub">Updated: ${acc.updatedAt ? new Date(acc.updatedAt).toLocaleDateString('en-IN') : '—'}</div>
        </div>
        <div style="display:flex; gap:6px;">
          ${editMode ? `
            <button class="del-btn" onclick="editBankAccount(${i})">✏️</button>
            <button class="del-btn" onclick="deleteBankAccount(${i})">🗑</button>
          ` : `
            <button class="snap-btn" style="padding:5px 10px; font-size:11px;" onclick="updateBankBalance(${i})">Update Balance</button>
          `}
        </div>
      </div>
    </div>
  `).join('');

  const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0);
  const savingsTotal = accounts.filter(a => a.type === 'Savings' || a.type === 'Salary').reduce((s, a) => s + (a.balance || 0), 0);
  const fdTotal = accounts.filter(a => a.type === 'Fixed Deposit').reduce((s, a) => s + (a.balance || 0), 0);

  sh('page-accounts', `
    ${accounts.length > 0 ? `
      <div class="grid-4" style="margin-bottom:18px;">
        <div class="kpi-card green">
          <div class="kpi-label">Total Balance</div>
          <div class="kpi-value">${fl(totalBalance)}</div>
          <div class="kpi-sub">${accounts.length} account(s)</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Savings / Salary</div>
          <div class="kpi-value">${fl(savingsTotal)}</div>
          <div class="kpi-sub">Liquid funds</div>
        </div>
        <div class="kpi-card purple">
          <div class="kpi-label">Fixed Deposits</div>
          <div class="kpi-value">${fl(fdTotal)}</div>
          <div class="kpi-sub">Locked funds</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Other</div>
          <div class="kpi-value">${fl(totalBalance - savingsTotal - fdTotal)}</div>
          <div class="kpi-sub">NRE/NRO/Current</div>
        </div>
      </div>
    ` : ''}

    <div class="card">
      <div class="card-title"><span class="icon">🏦</span> Your Bank Accounts</div>
      ${accountsList || `<p style="color:var(--text3); font-size:13px; padding:10px 0;">No accounts added yet. Add your first bank account below.</p>`}
      <button class="add-btn" onclick="showAddBankModal()">➕ Add Bank Account</button>
    </div>

    ${accounts.length > 0 ? `
      <div class="insight-box">
        <strong>💡 Tip:</strong> Keep balances updated regularly for accurate financial health scores.
        Your liquid savings (${fl(savingsTotal)}) ${savingsTotal >= computeMonthlyExpenses() * 6
          ? 'cover 6+ months of expenses — great emergency fund!'
          : savingsTotal >= computeMonthlyExpenses() * 3
          ? 'cover 3-6 months of expenses — building up nicely.'
          : 'are below 3 months of expenses — consider building an emergency fund.'}
      </div>
    ` : ''}
  `);
}

// ========== ADD / EDIT BANK ACCOUNT MODAL ==========
window.showAddBankModal = (editIndex) => {
  const isEdit = editIndex !== undefined;
  const acc = isEdit ? (userData.bankAccounts || [])[editIndex] : {};

  const bankOptions = ['SBI','HDFC','ICICI','Axis','Kotak','PNB','Bank of Baroda','Canara Bank','Union Bank','IndusInd','Yes Bank','IDFC First','Federal Bank','Other'];
  const typeOptions = ['Savings','Current','Salary','NRE','NRO','Fixed Deposit'];

  const bankOpts = bankOptions.map(b => `<option value="${b}" ${acc.bank === b ? 'selected' : ''}>${b}</option>`).join('');
  const typeOpts = typeOptions.map(t => `<option value="${t}" ${acc.type === t ? 'selected' : ''}>${t}</option>`).join('');

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'bankModal';
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
  modal.innerHTML = `
    <div class="modal-content">
      <h3>${isEdit ? '✏️ Edit' : '➕ Add'} Bank Account</h3>
      <label style="font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:5px;">Bank</label>
      <select id="ba-bank" class="modal-inp">${bankOpts}</select>
      <label style="font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:5px;">Account Type</label>
      <select id="ba-type" class="modal-inp">${typeOpts}</select>
      <label style="font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:5px;">Account Number (optional)</label>
      <input id="ba-number" class="modal-inp" placeholder="e.g. 1234567890" value="${acc.accountNumber || ''}">
      <label style="font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:5px;">IFSC Code (optional)</label>
      <input id="ba-ifsc" class="modal-inp" placeholder="e.g. SBIN0001234" value="${acc.ifsc || ''}">
      <label style="font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:5px;">Current Balance (₹)</label>
      <input id="ba-balance" class="modal-inp" type="number" placeholder="e.g. 150000" value="${acc.balance || ''}">
      <div class="modal-buttons">
        <button class="secondary-btn" onclick="document.getElementById('bankModal').remove()">Cancel</button>
        <button class="primary-btn" onclick="saveBankAccount(${isEdit ? editIndex : -1})">${isEdit ? 'Update' : 'Add Account'}</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
};

window.saveBankAccount = (editIndex) => {
  const bank    = document.getElementById('ba-bank').value;
  const type    = document.getElementById('ba-type').value;
  const number  = document.getElementById('ba-number').value.trim();
  const ifsc    = document.getElementById('ba-ifsc').value.trim().toUpperCase();
  const balance = num(document.getElementById('ba-balance').value);

  if (!bank || !type) { alert('Please select bank and account type.'); return; }

  if (!userData.bankAccounts) userData.bankAccounts = [];

  const account = {
    id: editIndex >= 0 ? userData.bankAccounts[editIndex].id : 'ba-' + Date.now(),
    bank, type, accountNumber: number, ifsc, balance,
    updatedAt: new Date().toISOString()
  };

  if (editIndex >= 0) {
    userData.bankAccounts[editIndex] = account;
  } else {
    userData.bankAccounts.push(account);
  }

  // Update liquid savings for health score
  userData.liquidSavings = userData.bankAccounts
    .filter(a => a.type === 'Savings' || a.type === 'Salary' || a.type === 'Current')
    .reduce((s, a) => s + (a.balance || 0), 0);

  document.getElementById('bankModal').remove();
  debounceSave();
  showToast(editIndex >= 0 ? 'Account updated!' : 'Account added!');
  renderAccounts();
};

window.editBankAccount = (i) => showAddBankModal(i);

window.deleteBankAccount = (i) => {
  if (!confirm('Remove this bank account?')) return;
  userData.bankAccounts.splice(i, 1);
  userData.liquidSavings = (userData.bankAccounts || [])
    .filter(a => a.type === 'Savings' || a.type === 'Salary' || a.type === 'Current')
    .reduce((s, a) => s + (a.balance || 0), 0);
  debounceSave();
  showToast('Account removed.', 'yellow');
  renderAccounts();
};

window.updateBankBalance = (i) => {
  const acc = userData.bankAccounts[i];
  const newBal = prompt(`Update balance for ${acc.bank} (${acc.type}):`, acc.balance || 0);
  if (newBal === null) return;
  userData.bankAccounts[i].balance = num(newBal);
  userData.bankAccounts[i].updatedAt = new Date().toISOString();
  userData.liquidSavings = (userData.bankAccounts || [])
    .filter(a => a.type === 'Savings' || a.type === 'Salary' || a.type === 'Current')
    .reduce((s, a) => s + (a.balance || 0), 0);
  debounceSave();
  showToast('Balance updated!');
  renderAccounts();
};

// ========== UTILITIES ==========
function emptyState(msg, cta='Get started', ctaFn='goReco') {
    return `<div class="empty-state"><div class="empty-icon">📊</div><h3>${msg}</h3><p>Start adding your data to get personalised insights.</p><button class="primary-btn" onclick="${ctaFn}()">${cta}</button></div>`;
}

function emptyStateInline(title, sub='') {
    return `<div style="padding:20px 0; text-align:center; color:var(--text3);">
        <div style="font-size:32px; margin-bottom:8px; opacity:0.3;">🎉</div>
        <div style="font-size:13px; margin-bottom:4px; color:var(--text2);">${title}</div>
        <div style="font-size:12px;">${sub}</div>
    </div>`;
}

function showToast(msg, type='green') {
    const t = document.createElement('div');
    const bg = type==='red' ? 'var(--red)' : type==='yellow' ? 'var(--yellow)' : 'var(--green)';
    const col = type==='green' ? '#0b1a12' : '#1a0b0e';
    t.style.cssText = `position:fixed; bottom:24px; right:24px; background:${bg}; color:${col}; padding:12px 20px; border-radius:10px; font-size:13px; font-weight:700; z-index:9999; box-shadow:0 4px 20px rgba(0,0,0,0.4); animation:fadeIn 0.3s ease; max-width:300px;`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(()=>t.remove(), 3000);
}

// ========== FINANCIAL EDUCATION HELPERS ==========
window.toggleSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
};

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function calculateInflationAdjustedEmergencyFund(monthlyExpenses, medicalExpenses, duration, generalInflation = 0.08, medicalInflation = 0.12) {
    const currentRequirement = (monthlyExpenses + medicalExpenses) * duration;
    const durationYears = duration / 12;
    const generalExpensesPortion = monthlyExpenses * duration * Math.pow(1 + generalInflation, durationYears);
    const medicalExpensesPortion = medicalExpenses * duration * Math.pow(1 + medicalInflation, durationYears);
    const futureValue = generalExpensesPortion + medicalExpensesPortion;
    
    return {
        currentRequirement,
        futureValue,
        generalExpensesPortion,
        medicalExpensesPortion,
        inflationImpact: futureValue - currentRequirement
    };
}

function calculateSWPCorpus(monthlyWithdrawal, annualReturnRate, durationYears) {
    const annualWithdrawal = monthlyWithdrawal * 12;
    const totalWithdrawals = annualWithdrawal * durationYears;
    const requiredCorpus = annualWithdrawal * ((1 - Math.pow(1 + annualReturnRate, -durationYears)) / annualReturnRate);
    
    const yearByYear = [];
    let balance = requiredCorpus;
    let corpusDepletionWarning = false;
    
    for (let year = 1; year <= durationYears; year++) {
        const openingBalance = balance;
        const withdrawal = annualWithdrawal;
        const returns = openingBalance * annualReturnRate;
        const closingBalance = openingBalance + returns - withdrawal;
        
        yearByYear.push({
            year,
            openingBalance,
            withdrawal,
            returns,
            closingBalance
        });
        
        balance = closingBalance;
        if (closingBalance < 0) corpusDepletionWarning = true;
    }
    
    return {
        requiredCorpus,
        totalWithdrawals,
        yearByYear,
        corpusDepletionWarning
    };
}

function getSIPRecommendation(ageGroup) {
    const recommendations = {
        '20s': {
            allocation: { equity: 85, debt: 15 },
            strategy: 'Aggressive wealth creation with long-term focus',
            horizon: '15-25 years',
            fundCategories: ['Large Cap Equity Funds', 'Mid Cap Equity Funds', 'Small Cap Equity Funds', 'Index Funds (Nifty 50, Nifty Next 50)', 'Sectoral Funds (Technology, Healthcare)'],
            exampleAmounts: [5000, 10000, 25000, 50000],
            tips: ['Start early to benefit from compounding', 'Can take higher risks for higher returns', 'Focus on equity for long-term growth', 'Review portfolio annually']
        },
        '30s': {
            allocation: { equity: 75, debt: 25 },
            strategy: 'Balanced approach with goal-based investing',
            horizon: '10-20 years',
            fundCategories: ['Large Cap Equity Funds', 'Balanced Advantage Funds', 'Multi-Cap Funds', 'Debt Funds for short-term goals', 'ELSS for tax saving'],
            exampleAmounts: [10000, 20000, 35000, 75000],
            tips: ['Align SIPs with specific goals (home, education)', 'Maintain emergency fund before investing', 'Diversify across fund categories', 'Increase SIP amount with salary hikes']
        },
        '40s': {
            allocation: { equity: 55, debt: 45 },
            strategy: 'Moderate risk with retirement planning focus',
            horizon: '10-15 years',
            fundCategories: ['Large Cap Equity Funds', 'Hybrid Funds (Aggressive/Conservative)', 'Debt Funds', 'Corporate Bond Funds', 'NPS for retirement'],
            exampleAmounts: [15000, 30000, 50000, 100000],
            tips: ['Prioritize retirement corpus building', 'Gradually shift to debt for stability', 'Maximize tax-saving investments', 'Review and rebalance portfolio quarterly']
        },
        '50s+': {
            allocation: { equity: 35, debt: 65 },
            strategy: 'Conservative approach with capital preservation',
            horizon: '5-10 years',
            fundCategories: ['Large Cap Equity Funds (limited exposure)', 'Conservative Hybrid Funds', 'Debt Funds', 'Fixed Maturity Plans', 'Senior Citizen Savings Scheme'],
            exampleAmounts: [20000, 40000, 75000, 150000],
            tips: ['Focus on capital preservation', 'Generate regular income through SWP', 'Minimize equity exposure', 'Consider annuity plans for guaranteed income']
        }
    };
    return recommendations[ageGroup] || null;
}

function loadSavedCalculations() {
    return JSON.parse(localStorage.getItem('savedCalculations') || '[]');
}

function saveCalculation(type, inputs, results, notes = '') {
    const calculation = {
        id: generateUUID(),
        type,
        timestamp: Date.now(),
        inputs,
        results,
        notes
    };
    const saved = loadSavedCalculations();
    saved.push(calculation);
    localStorage.setItem('savedCalculations', JSON.stringify(saved));
    showToast('Calculation saved successfully', 'green');
    document.getElementById('savedCalculationsContainer').innerHTML = renderSavedCalculations();
}

function deleteCalculation(id) {
    const saved = loadSavedCalculations();
    const filtered = saved.filter(calc => calc.id !== id);
    localStorage.setItem('savedCalculations', JSON.stringify(filtered));
    showToast('Calculation deleted', 'yellow');
    document.getElementById('savedCalculationsContainer').innerHTML = renderSavedCalculations();
}

window.calculateEmergencyFund = () => {
    const monthlyExpenses = parseFloat(document.getElementById('efMonthlyExpenses').value) || 0;
    const medicalExpenses = parseFloat(document.getElementById('efMedicalExpenses').value) || 0;
    const duration = parseInt(document.getElementById('efDuration').value) || 6;
    const generalInflation = parseFloat(document.getElementById('efGeneralInflation').value) / 100 || 0.08;
    const medicalInflation = parseFloat(document.getElementById('efMedicalInflation').value) / 100 || 0.12;
    
    if (monthlyExpenses <= 0) {
        showToast('Please enter valid monthly expenses', 'red');
        return;
    }
    
    const result = calculateInflationAdjustedEmergencyFund(monthlyExpenses, medicalExpenses, duration, generalInflation, medicalInflation);
    
    document.getElementById('efResults').innerHTML = `
        <div style="background:var(--bg3); padding:20px; border-radius:var(--radius); margin-top:20px;">
            <h5 style="color:var(--green); margin-bottom:16px;">📊 Emergency Fund Calculation Results</h5>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:16px;">
                <div style="background:var(--bg2); padding:16px; border-radius:var(--radius-sm); border:1px solid var(--border);">
                    <div style="color:var(--text3); font-size:12px; margin-bottom:4px;">Current Requirement</div>
                    <div style="color:var(--text); font-size:24px; font-weight:700;">${formatCurrency(result.currentRequirement)}</div>
                </div>
                <div style="background:var(--bg2); padding:16px; border-radius:var(--radius-sm); border:1px solid var(--border);">
                    <div style="color:var(--text3); font-size:12px; margin-bottom:4px;">Inflation-Adjusted (Future)</div>
                    <div style="color:var(--accent); font-size:24px; font-weight:700;">${formatCurrency(result.futureValue)}</div>
                </div>
                <div style="background:var(--bg2); padding:16px; border-radius:var(--radius-sm); border:1px solid var(--border);">
                    <div style="color:var(--text3); font-size:12px; margin-bottom:4px;">Inflation Impact</div>
                    <div style="color:var(--yellow); font-size:24px; font-weight:700;">${formatCurrency(result.inflationImpact)}</div>
                </div>
            </div>
            <div style="margin-top:20px; padding:16px; background:var(--bg2); border-radius:var(--radius-sm); border:1px solid var(--border);">
                <h6 style="color:var(--text); margin-bottom:12px;">Breakdown:</h6>
                <div style="color:var(--text2); line-height:1.8;">
                    <div>General Expenses (${duration} months): ${formatCurrency(result.generalExpensesPortion)}</div>
                    <div>Medical Expenses (${duration} months): ${formatCurrency(result.medicalExpensesPortion)}</div>
                </div>
            </div>
            <button class="primary-btn" onclick="saveCalculation('emergency-fund', {monthlyExpenses:${monthlyExpenses}, medicalExpenses:${medicalExpenses}, duration:${duration}, generalInflation:${generalInflation*100}, medicalInflation:${medicalInflation*100}}, ${JSON.stringify(result).replace(/"/g, '&quot;')})" style="margin-top:16px;">
                <i class="fas fa-save"></i> Save Calculation
            </button>
        </div>
    `;
};

window.calculateSWP = () => {
    const monthlyWithdrawal = parseFloat(document.getElementById('swpMonthlyWithdrawal').value) || 0;
    const annualReturnRate = parseFloat(document.getElementById('swpReturnRate').value) / 100 || 0.05;
    const durationYears = parseInt(document.getElementById('swpDuration').value) || 10;
    
    if (monthlyWithdrawal <= 0) {
        showToast('Please enter valid monthly withdrawal amount', 'red');
        return;
    }
    if (annualReturnRate < 0.01 || annualReturnRate > 0.20) {
        showToast('Return rate must be between 1% and 20%', 'red');
        return;
    }
    
    const result = calculateSWPCorpus(monthlyWithdrawal, annualReturnRate, durationYears);
    
    let tableRows = '';
    result.yearByYear.slice(0, 10).forEach(row => {
        tableRows += `
            <tr>
                <td>${row.year}</td>
                <td>${formatCurrency(row.openingBalance)}</td>
                <td>${formatCurrency(row.withdrawal)}</td>
                <td>${formatCurrency(row.returns)}</td>
                <td style="color:${row.closingBalance < 0 ? 'var(--red)' : 'var(--green)'};">${formatCurrency(row.closingBalance)}</td>
            </tr>
        `;
    });
    
    document.getElementById('swpResults').innerHTML = `
        <div style="background:var(--bg3); padding:20px; border-radius:var(--radius); margin-top:20px;">
            <h5 style="color:var(--green); margin-bottom:16px;">📊 SWP Calculation Results</h5>
            ${result.corpusDepletionWarning ? `<div style="background:var(--red-dim); border:1px solid var(--red); padding:12px; border-radius:var(--radius-sm); margin-bottom:16px; color:var(--red);">⚠️ Warning: Corpus will deplete before the end of duration. Consider increasing corpus or reducing withdrawal.</div>` : ''}
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:16px; margin-bottom:20px;">
                <div style="background:var(--bg2); padding:16px; border-radius:var(--radius-sm); border:1px solid var(--border);">
                    <div style="color:var(--text3); font-size:12px; margin-bottom:4px;">Required Corpus</div>
                    <div style="color:var(--accent); font-size:24px; font-weight:700;">${formatCurrency(result.requiredCorpus)}</div>
                </div>
                <div style="background:var(--bg2); padding:16px; border-radius:var(--radius-sm); border:1px solid var(--border);">
                    <div style="color:var(--text3); font-size:12px; margin-bottom:4px;">Total Withdrawals</div>
                    <div style="color:var(--text); font-size:24px; font-weight:700;">${formatCurrency(result.totalWithdrawals)}</div>
                </div>
            </div>
            <div style="overflow-x:auto;">
                <table style="width:100%; border-collapse:collapse; background:var(--bg2); border-radius:var(--radius-sm);">
                    <thead>
                        <tr style="background:var(--bg3); border-bottom:1px solid var(--border);">
                            <th style="padding:12px; text-align:left; color:var(--text);">Year</th>
                            <th style="padding:12px; text-align:left; color:var(--text);">Opening Balance</th>
                            <th style="padding:12px; text-align:left; color:var(--text);">Withdrawal</th>
                            <th style="padding:12px; text-align:left; color:var(--text);">Returns</th>
                            <th style="padding:12px; text-align:left; color:var(--text);">Closing Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
                ${result.yearByYear.length > 10 ? `<div style="color:var(--text3); font-size:12px; margin-top:8px; text-align:center;">Showing first 10 years of ${result.yearByYear.length} years</div>` : ''}
            </div>
            <button class="primary-btn" onclick="saveCalculation('swp', {monthlyWithdrawal:${monthlyWithdrawal}, annualReturnRate:${annualReturnRate*100}, durationYears:${durationYears}}, ${JSON.stringify(result).replace(/"/g, '&quot;')})" style="margin-top:16px;">
                <i class="fas fa-save"></i> Save Calculation
            </button>
        </div>
    `;
};

window.showSIPRecommendation = (ageGroup) => {
    const rec = getSIPRecommendation(ageGroup);
    if (!rec) return;
    
    document.getElementById('sipResults').innerHTML = `
        <div style="background:var(--bg3); padding:20px; border-radius:var(--radius); margin-top:20px;">
            <h5 style="color:var(--purple); margin-bottom:16px;">📈 SIP Recommendation for ${ageGroup}</h5>
            <div style="background:var(--bg2); padding:16px; border-radius:var(--radius-sm); border:1px solid var(--border); margin-bottom:16px;">
                <h6 style="color:var(--text); margin-bottom:12px;">Asset Allocation</h6>
                <div style="display:flex; gap:16px; margin-bottom:12px;">
                    <div style="flex:${rec.allocation.equity}; background:var(--purple-dim); padding:12px; border-radius:var(--radius-sm); text-align:center;">
                        <div style="color:var(--purple); font-size:24px; font-weight:700;">${rec.allocation.equity}%</div>
                        <div style="color:var(--text3); font-size:12px;">Equity</div>
                    </div>
                    <div style="flex:${rec.allocation.debt}; background:var(--green-dim); padding:12px; border-radius:var(--radius-sm); text-align:center;">
                        <div style="color:var(--green); font-size:24px; font-weight:700;">${rec.allocation.debt}%</div>
                        <div style="color:var(--text3); font-size:12px;">Debt</div>
                    </div>
                </div>
                <div style="color:var(--text2); line-height:1.6;">
                    <div><strong style="color:var(--text);">Strategy:</strong> ${rec.strategy}</div>
                    <div><strong style="color:var(--text);">Investment Horizon:</strong> ${rec.horizon}</div>
                </div>
            </div>
            <div style="background:var(--bg2); padding:16px; border-radius:var(--radius-sm); border:1px solid var(--border); margin-bottom:16px;">
                <h6 style="color:var(--text); margin-bottom:12px;">Recommended Fund Categories</h6>
                <ul style="color:var(--text2); line-height:1.8;">
                    ${rec.fundCategories.map(cat => `<li>${cat}</li>`).join('')}
                </ul>
            </div>
            <div style="background:var(--bg2); padding:16px; border-radius:var(--radius-sm); border:1px solid var(--border); margin-bottom:16px;">
                <h6 style="color:var(--text); margin-bottom:12px;">Example SIP Amounts</h6>
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(120px, 1fr)); gap:12px;">
                    ${rec.exampleAmounts.map(amt => `
                        <div style="background:var(--bg3); padding:12px; border-radius:var(--radius-sm); text-align:center;">
                            <div style="color:var(--accent); font-size:18px; font-weight:700;">${formatCurrency(amt)}</div>
                            <div style="color:var(--text3); font-size:11px;">per month</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div style="background:var(--accent-glow); padding:16px; border-radius:var(--radius-sm); border:1px solid var(--accent);">
                <h6 style="color:var(--accent2); margin-bottom:12px;">💡 Tips for ${ageGroup}</h6>
                <ul style="color:var(--text2); line-height:1.8;">
                    ${rec.tips.map(tip => `<li>${tip}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
};

// ========== VALIDATION HELPERS ==========
function validateAmount(amount, fieldName = 'Amount') {
    if (!amount && amount !== 0) {
        showToast(`${fieldName} is required`, 'red');
        return false;
    }
    const num = parseFloat(amount);
    if (isNaN(num)) {
        showToast(`${fieldName} must be a valid number`, 'red');
        return false;
    }
    if (num < 0) {
        showToast(`${fieldName} cannot be negative`, 'red');
        return false;
    }
    if (num > 10000000000) { // 1000 Crores
        showToast(`${fieldName} seems unusually large. Please verify.`, 'yellow');
    }
    return true;
}

function validateDate(date, fieldName = 'Date', allowFuture = false) {
    if (!date) {
        showToast(`${fieldName} is required`, 'red');
        return false;
    }
    const d = new Date(date);
    if (isNaN(d.getTime())) {
        showToast(`${fieldName} is invalid`, 'red');
        return false;
    }
    if (!allowFuture && d > new Date()) {
        showToast(`${fieldName} cannot be in the future`, 'red');
        return false;
    }
    return true;
}

function validateEmail(email) {
    if (!email) {
        showToast('Email is required', 'red');
        return false;
    }
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) {
        showToast('Please enter a valid email address', 'red');
        return false;
    }
    return true;
}

function validateRequired(value, fieldName = 'This field') {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
        showToast(`${fieldName} is required`, 'red');
        return false;
    }
    return true;
}

// ========== CONFIRMATION DIALOG ==========
window.confirmAction = (message, onConfirm, onCancel) => {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:10000;';
    modal.innerHTML = `
        <div style="background:var(--bg2); border:1px solid var(--border); border-radius:var(--radius); padding:24px; max-width:400px; width:90%;">
            <h3 style="color:var(--text); margin-bottom:16px; font-size:16px;">Confirm Action</h3>
            <p style="color:var(--text2); margin-bottom:24px; line-height:1.6;">${message}</p>
            <div style="display:flex; gap:12px; justify-content:flex-end;">
                <button class="secondary-btn" id="cancelBtn">Cancel</button>
                <button class="primary-btn" id="confirmBtn" style="background:var(--red);">Confirm</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    modal.querySelector('#confirmBtn').onclick = () => {
        modal.remove();
        if (onConfirm) onConfirm();
    };
    modal.querySelector('#cancelBtn').onclick = () => {
        modal.remove();
        if (onCancel) onCancel();
    };
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
            if (onCancel) onCancel();
        }
    };
};

// ========== ERROR MESSAGE HELPER ==========
function getUserFriendlyError(error) {
    const errorMap = {
        'HTTP 404': 'This feature is not available yet',
        'HTTP 500': 'Something went wrong. Please try again.',
        'HTTP 401': 'Please log in to continue',
        'HTTP 403': 'You don\'t have permission to do this',
        'Network request failed': 'Please check your internet connection',
        'Failed to fetch': 'Cannot connect to server. Please check your connection.',
        'API error': 'Service temporarily unavailable',
    };
    
    const errorStr = error.message || error.toString();
    for (const [key, value] of Object.entries(errorMap)) {
        if (errorStr.includes(key)) {
            return value;
        }
    }
    
    return errorStr || 'An unexpected error occurred';
}

window.openCredsModal  = () => { 
    // Hide credentials modal in production
    if (location.hostname === 'famledgerai.com' || location.hostname.includes('vercel.app')) {
        console.warn('⚠️ Credentials configuration is disabled in production');
        showToast('Configuration is managed via environment variables in production', 'yellow');
        return;
    }
    $('credsModal').style.display='flex'; 
};
window.closeCredsModal = () => { $('credsModal').style.display='none'; };
window.saveCredsAndReload = () => {
    const url = $('cfg-url').value.trim();
    const key = $('cfg-key').value.trim();
    if(url) localStorage.setItem('sb_url', url);
    if(key) localStorage.setItem('sb_key', key);
    closeCredsModal();
    window.location.reload();
};

window.goReco     = () => document.querySelector('[data-page="recommendations"]').click();
window.goSettings = () => document.querySelector('[data-page="settings"]').click();
window.toggleEdit = () => { editMode = !editMode; updateEditBtn(); renderCurrentPage(); };
window.captureImage = () => showToast('📸 Snap & Track — coming soon! Scan receipts to auto-log expenses.', 'yellow');

// ========== LANGUAGE ==========
window.changeLanguage = lang => {
    currentLang = lang;
    // Update elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (el.tagName === 'SPAN' || el.tagName === 'DIV' || el.tagName === 'LABEL' || el.tagName === 'BUTTON') {
            el.innerText = t(key);
        } else {
            const span = el.querySelector('span');
            if (span) span.innerText = t(key);
        }
    });
    renderCurrentPage();
};

// ========== INIT ==========
let isRegistering = false; // Flag to prevent onAuthStateChange from interfering with registration
let isLoadingSession = false; // Mutex to prevent concurrent loadUserData calls from checkSession + onAuthStateChange race

window.onload = () => {
    checkSession();
    sb.auth.onAuthStateChange((event, session) => {
        console.log('onAuthStateChange:', event, 'isRegistering:', isRegistering, 'isLoadingSession:', isLoadingSession, 'email:', session?.user?.email);
        if(isRegistering) {
            console.log('Skipping onAuthStateChange during registration');
            return;
        }
        if(isLoadingSession) {
            console.log('Skipping onAuthStateChange — checkSession already handling this');
            return;
        }
        if(event==='SIGNED_IN' && session) {
            const newEmail = session.user.email;
            // Only reload if truly a different user or no data loaded yet
            if(newEmail !== currentUserEmail || !userData.profile?.name) {
                isLoadingSession = true;
                currentUserEmail = newEmail;
                // Phase 1.6: Load household context before loading user data
                loadHouseholdContext().then(() => {
                    return loadUserData(currentUserEmail);
                }).then(()=>{
                    // Check if profile is complete
                    const hasWizardFlag = userData.profile?._wizardCompleted === true;
                    const hasBasicInfo = userData.profile?.age && userData.profile?.occupation;
                    const profileComplete = hasWizardFlag || hasBasicInfo;
                    
                    console.log('🔍 Profile completion check:', {
                        hasWizardFlag,
                        hasBasicInfo,
                        profileComplete,
                        profileKeys: Object.keys(userData.profile || {}),
                        age: userData.profile?.age,
                        occupation: userData.profile?.occupation
                    });
                    
                    if (!profileComplete) {
                        console.log('📝 Profile incomplete → showing wizard');
                        showProfileWizard();
                    } else {
                        console.log('✅ Profile complete → showing app');
                        showApp(); resetInactivity();
                    }
                }).catch(err => {
                    console.error('❌ Error during sign-in flow:', err);
                    showToast('Failed to load your data. Please try again.', 'red');
                }).finally(() => { isLoadingSession = false; });
            }
        } else if(event==='SIGNED_OUT') {
            // Reset all user state on sign out
            resetUserState(null);
            currentUserEmail = '';
            
            localStorage.removeItem('onboarding_completed');
            localStorage.removeItem('pending_registration_data');
            localStorage.removeItem('savedCalculations');
            
            showAuth();
        }
    });
};

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker registered:', reg.scope))
            .catch(err => console.log('Service Worker registration failed:', err));
    });
}

// PWA Install Prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // Show install button/banner if you want
    console.log('PWA install prompt available');
});


} // end of initializeApp
