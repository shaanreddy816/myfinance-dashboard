# 💻 Development Documentation

Development guides, implementation details, architecture, and technical documentation for FamLedgerAI.

## 📄 Documents

### [APP_CONVERSION_SUMMARY.md](./APP_CONVERSION_SUMMARY.md)
**Purpose**: Summary of app conversion from prototype to production  
**Last Updated**: March 1, 2026  
**Key Topics**:
- Architecture changes
- Technology stack
- Migration process
- Lessons learned

---

## 🏗️ Architecture Overview

### Technology Stack

**Frontend**:
- HTML5, CSS3, JavaScript (ES6+)
- Vite (build tool)
- Progressive Web App (PWA)
- Responsive design

**Backend**:
- Supabase (PostgreSQL database)
- Supabase Auth (authentication)
- Supabase Storage (file storage)
- Serverless functions (Vercel)

**Deployment**:
- Vercel (web hosting)
- GitHub (version control)
- GitHub Actions (CI/CD)

**Third-party Services**:
- OpenAI API (AI features)
- Chart.js (data visualization)
- Lottie (animations)

---

## 📁 Project Structure

```
famledgerai/
├── index.html              # Main application file
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
├── package.json            # Dependencies
├── vite.config.js          # Build configuration
├── vercel.json             # Deployment config
│
├── src/
│   ├── main.js             # Entry point
│   ├── style.css           # Global styles
│   └── counter.js          # Utilities
│
├── public/
│   ├── icon-192.png        # App icons
│   ├── icon-512.png
│   └── apple-touch-icon.png
│
├── api/
│   ├── lib/
│   │   ├── aiRouter.js     # AI routing
│   │   ├── deterministic.js # Calculations
│   │   ├── encryption.js   # Security
│   │   └── supabase.js     # DB client
│   └── [...catchall].js    # API handler
│
├── docs/                   # Documentation
│   ├── design/
│   ├── development/
│   ├── testing/
│   ├── errors-and-fixes/
│   ├── security/
│   ├── supabase/
│   └── deployment/
│
└── .kiro/                  # Kiro AI specs
    └── specs/
```

---

## 🚀 Getting Started

### Prerequisites
```bash
# Node.js 18+ required
node --version

# npm or yarn
npm --version
```

### Installation
```bash
# 1. Clone repository
git clone https://github.com/shaanreddy816/myfinance-dashboard.git
cd myfinance-dashboard/famledgerai

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# 4. Start development server
npm run dev

# 5. Open browser
# http://localhost:5173
```

### Environment Variables
```bash
# .env file
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
VITE_OPENAI_API_KEY=sk-xxx...
```

---

## 🛠️ Development Workflow

### 1. Feature Development
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
# ... code ...

# Test locally
npm run dev

# Run tests
npm test

# Commit changes
git add .
git commit -m "feat: Add new feature"

# Push to GitHub
git push origin feature/new-feature

# Create Pull Request
# Review and merge
```

### 2. Code Review
- All code must be reviewed
- At least 1 approval required
- All tests must pass
- No merge conflicts

### 3. Testing
```bash
# Run all tests
npm test

# Run specific test
npm test -- error-handling

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

### 4. Building
```bash
# Development build
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

---

## 📝 Coding Standards

### JavaScript Style Guide

**Variables**:
```javascript
// Use const by default
const userName = 'John';

// Use let for reassignment
let counter = 0;

// Avoid var
// var oldStyle = 'no'; ❌
```

**Functions**:
```javascript
// Use arrow functions for callbacks
const numbers = [1, 2, 3].map(n => n * 2);

// Use async/await for promises
async function fetchData() {
  const response = await fetch(url);
  return response.json();
}

// Use descriptive names
function calculateMonthlyExpenses() { }  // ✅
function calc() { }  // ❌
```

**Error Handling**:
```javascript
// Always use try-catch for async operations
try {
  const data = await fetchData();
} catch (error) {
  console.error('Error:', error);
  showErrorMessage(error.message);
}

// Validate inputs
function divide(a, b) {
  if (b === 0) throw new Error('Division by zero');
  return a / b;
}
```

**Comments**:
```javascript
// Use JSDoc for functions
/**
 * Calculate total monthly expenses
 * @param {Array} expenses - Array of expense objects
 * @returns {number} Total expenses
 */
function calculateTotal(expenses) {
  return expenses.reduce((sum, exp) => sum + exp.amount, 0);
}

// Use inline comments sparingly
const tax = income * 0.3; // 30% tax rate
```

---

### CSS Style Guide

**Naming**:
```css
/* Use kebab-case for classes */
.user-profile { }
.expense-card { }

/* Use BEM for complex components */
.card { }
.card__header { }
.card__body { }
.card--highlighted { }
```

**Organization**:
```css
/* Group related properties */
.button {
  /* Positioning */
  position: relative;
  top: 0;
  
  /* Box model */
  display: inline-block;
  padding: 12px 24px;
  margin: 8px;
  
  /* Typography */
  font-size: 14px;
  font-weight: 600;
  
  /* Visual */
  background: var(--accent);
  border-radius: 8px;
  
  /* Misc */
  cursor: pointer;
  transition: all 0.2s;
}
```

**Variables**:
```css
/* Use CSS custom properties */
:root {
  --primary-color: #6366f1;
  --text-color: #1f2937;
  --spacing-sm: 8px;
  --spacing-md: 16px;
}

.card {
  color: var(--text-color);
  padding: var(--spacing-md);
}
```

---

## 🔍 Debugging

### Browser DevTools
```javascript
// Console logging
console.log('Debug:', variable);
console.error('Error:', error);
console.table(arrayOfObjects);

// Debugger
function complexFunction() {
  debugger; // Execution pauses here
  // ... code ...
}

// Performance profiling
console.time('operation');
// ... code ...
console.timeEnd('operation');
```

### Common Issues

**Issue**: Supabase connection fails
```javascript
// Check credentials
console.log('URL:', SUPABASE_URL);
console.log('Key:', SUPABASE_ANON_KEY?.substring(0, 10) + '...');

// Test connection
const { data, error } = await sb.from('user_data').select('count');
console.log('Connection test:', error ? 'Failed' : 'Success');
```

**Issue**: Data not saving
```javascript
// Check user authentication
const { data: { session } } = await sb.auth.getSession();
console.log('User:', session?.user?.email || 'Not logged in');

// Check RLS policies
// Go to Supabase Dashboard → Authentication → Policies
```

---

## 🧪 Testing Strategy

### Unit Tests
```javascript
// Test individual functions
describe('calculateTotal', () => {
  it('should sum expense amounts', () => {
    const expenses = [
      { amount: 100 },
      { amount: 200 }
    ];
    expect(calculateTotal(expenses)).toBe(300);
  });
  
  it('should handle empty array', () => {
    expect(calculateTotal([])).toBe(0);
  });
});
```

### Integration Tests
```javascript
// Test component interactions
describe('Onboarding Wizard', () => {
  it('should save data and move to next phase', async () => {
    // Fill Phase 1
    fillPhase1Data();
    
    // Click Next
    clickNextButton();
    
    // Verify Phase 2 shown
    expect(getCurrentPhase()).toBe(2);
    
    // Verify data saved
    const saved = localStorage.getItem('onboardingData');
    expect(JSON.parse(saved).phase1).toBeDefined();
  });
});
```

### E2E Tests
```javascript
// Test complete user flows
describe('User Registration Flow', () => {
  it('should register, onboard, and reach dashboard', async () => {
    // Register
    await register('test@example.com', 'password123');
    
    // Complete onboarding
    await completeOnboarding();
    
    // Verify dashboard shown
    expect(page.url()).toContain('/dashboard');
    expect(page.locator('.dashboard')).toBeVisible();
  });
});
```

---

## 📚 API Documentation

### Supabase Client
```javascript
// Initialize
import { createClient } from '@supabase/supabase-js';
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Authentication
const { data, error } = await sb.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});

// Database queries
const { data, error } = await sb
  .from('user_data')
  .select('*')
  .eq('email', userEmail)
  .single();

// Insert/Update
const { error } = await sb
  .from('user_data')
  .upsert({ email: userEmail, profile: userData });
```

### AI Router API
```javascript
// Call AI endpoint
const response = await fetch('/api/ai', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'analyze',
    data: userData
  })
});

const result = await response.json();
```

---

## 🔐 Security Best Practices

### Input Validation
```javascript
// Validate email
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Sanitize input
function sanitizeInput(input) {
  return input.trim().replace(/[<>]/g, '');
}

// Validate numbers
function isValidAmount(amount) {
  return !isNaN(amount) && amount >= 0;
}
```

### Authentication
```javascript
// Check session before operations
async function requireAuth() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    throw new Error('Not authenticated');
  }
  return session;
}

// Use RLS policies
// All database operations automatically filtered by user
```

### Data Protection
```javascript
// Never log sensitive data
console.log('User:', user.email); // ✅
console.log('Password:', password); // ❌

// Use environment variables
const apiKey = import.meta.env.VITE_API_KEY; // ✅
const apiKey = 'hardcoded-key'; // ❌
```

---

## 📊 Performance Optimization

### Code Splitting
```javascript
// Lazy load heavy components
const HeavyComponent = () => import('./HeavyComponent.js');

// Load on demand
button.addEventListener('click', async () => {
  const module = await HeavyComponent();
  module.render();
});
```

### Caching
```javascript
// Cache expensive calculations
const cache = new Map();

function expensiveCalculation(input) {
  if (cache.has(input)) {
    return cache.get(input);
  }
  
  const result = /* ... expensive operation ... */;
  cache.set(input, result);
  return result;
}
```

### Debouncing
```javascript
// Debounce save operations
let saveTimer;
function debounceSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveUserData();
  }, 600);
}
```

---

## 🔗 Useful Resources

- [Supabase Docs](https://supabase.com/docs)
- [Vite Docs](https://vitejs.dev/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [JavaScript Info](https://javascript.info/)

---

[← Back to Documentation Home](../README.md)
