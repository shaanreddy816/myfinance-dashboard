# Code Refactoring Plan
**Date**: March 1, 2026  
**Application**: FamLedgerAI v2.0  
**Priority**: HIGH  
**Estimated Effort**: 4-6 weeks

---

## Executive Summary

The current codebase has a critical issue: **index.html is 12,955 lines** (1.2MB uncompressed). This causes:
- Slow initial page load (4.8s)
- Difficult maintenance and debugging
- High risk of merge conflicts
- Poor code organization

**Recommendation**: Split into modular components using a modern framework (React/Vue).

---

## Phase 1: Immediate Fixes (Week 1)

### 1.1 Security Fixes ✅ COMPLETED
- [x] Fix CORS wildcard → Restrict to famledgerai.com
- [x] Add rate limiting to AI advice endpoints
- [ ] Add input sanitization (DOMPurify)
- [ ] Implement CSRF protection

### 1.2 Critical Bug Fixes
- [ ] Fix loan table horizontal scroll
- [ ] Add error boundary for crash protection
- [ ] Fix focus indicators for accessibility

---

## Phase 2: Code Organization (Week 2-3)

### 2.1 Extract JavaScript Functions
Split index.html into separate JS files:

```
famledgerai/
├── js/
│   ├── auth.js (login, registration, session)
│   ├── dashboard.js (KPI cards, charts)
│   ├── expenses.js (expense tracking)
│   ├── loans.js (loan management)
│   ├── investments.js (portfolio)
│   ├── insurance.js (policies)
│   ├── goals.js (financial goals)
│   ├── nri.js (NRI planning)
│   ├── ai.js (AI advice)
│   ├── utils.js (helpers, formatters)
│   └── state.js (state management)
```

### 2.2 Extract CSS Styles
Move inline styles to separate CSS files:

```
famledgerai/
├── css/
│   ├── variables.css (CSS custom properties)
│   ├── layout.css (sidebar, main, grid)
│   ├── components.css (cards, buttons, inputs)
│   ├── pages.css (page-specific styles)
│   └── responsive.css (media queries)
```

---

## Phase 3: Framework Migration (Week 4-6)

### 3.1 Choose Framework
**Recommendation**: React with Vite

**Reasons**:
- Large ecosystem and community
- Excellent performance with Virtual DOM
- Easy to learn and maintain
- Good TypeScript support
- Vercel optimized

**Alternative**: Vue 3 (simpler, but smaller ecosystem)

### 3.2 Component Structure

```
famledgerai/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx
│   │   │   ├── RegistrationForm.jsx
│   │   │   └── OnboardingFlow.jsx
│   │   ├── dashboard/
│   │   │   ├── KPICard.jsx
│   │   │   ├── ExpenseChart.jsx
│   │   │   └── InsightBox.jsx
│   │   ├── loans/
│   │   │   ├── LoanTable.jsx
│   │   │   ├── LoanForm.jsx
│   │   │   ├── LoanUpload.jsx
│   │   │   └── LoanScenarios.jsx
│   │   ├── investments/
│   │   │   ├── PortfolioTable.jsx
│   │   │   ├── AllocationChart.jsx
│   │   │   └── ZerodhaIntegration.jsx
│   │   ├── common/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── ErrorBoundary.jsx
│   │   └── ai/
│   │       ├── AdviceCard.jsx
│   │       ├── ChatInterface.jsx
│   │       └── InsightGenerator.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Expenses.jsx
│   │   ├── Loans.jsx
│   │   ├── Investments.jsx
│   │   ├── Insurance.jsx
│   │   ├── Goals.jsx
│   │   └── NRI.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useSupabase.js
│   │   ├── useFinancialData.js
│   │   └── useAI.js
│   ├── services/
│   │   ├── api.js
│   │   ├── supabase.js
│   │   ├── financial.js
│   │   └── ai.js
│   ├── store/
│   │   ├── authStore.js
│   │   ├── dataStore.js
│   │   └── uiStore.js
│   ├── utils/
│   │   ├── formatters.js
│   │   ├── validators.js
│   │   ├── calculations.js
│   │   └── constants.js
│   ├── App.jsx
│   └── main.jsx
```

---

## Phase 4: State Management (Week 5)

### 4.1 Replace localStorage with Zustand

**Current**: Data stored in localStorage, manually synced
**Proposed**: Zustand for client state + React Query for server state

**Benefits**:
- Automatic re-renders on state changes
- Better performance (no manual DOM updates)
- Easier debugging with DevTools
- Type-safe with TypeScript

---

## Phase 5: Testing (Week 6)

### 5.1 Unit Tests (Jest + React Testing Library)
- Test business logic (loan calculations, inflation projections)
- Test components (forms, tables, charts)
- Test hooks (useAuth, useFinancialData)

### 5.2 Integration Tests (Cypress)
- Test user flows (registration → onboarding → dashboard)
- Test API integrations (Supabase, financial APIs)
- Test AI advice generation

### 5.3 E2E Tests (Playwright)
- Test critical paths (login, add expense, upload loan)
- Test across browsers (Chrome, Firefox, Safari)
- Test mobile responsiveness

---

## Migration Strategy

### Option A: Big Bang (Not Recommended)
- Rewrite entire app in React at once
- High risk, long downtime
- Difficult to test incrementally

### Option B: Strangler Fig Pattern (Recommended)
- Migrate one page at a time
- Keep old and new code running side-by-side
- Low risk, incremental testing
- Users see improvements gradually

**Recommended Approach**: Strangler Fig

**Migration Order**:
1. Dashboard (most used, high impact)
2. Expenses (simple, good learning)
3. Loans (complex, test refactoring skills)
4. Investments (API integrations)
5. Insurance (similar to loans)
6. Goals (simple)
7. NRI (complex, low usage)
8. Auth (last, most critical)

---

## Estimated Timeline

| Phase | Duration | Effort | Risk |
|-------|----------|--------|------|
| Phase 1: Immediate Fixes | 1 week | 40 hours | Low |
| Phase 2: Code Organization | 2 weeks | 80 hours | Low |
| Phase 3: Framework Migration | 3 weeks | 120 hours | Medium |
| Phase 4: State Management | 1 week | 40 hours | Low |
| Phase 5: Testing | 1 week | 40 hours | Low |
| **Total** | **8 weeks** | **320 hours** | **Medium** |

---

## Resource Requirements

- 1 Senior Frontend Developer (React expert)
- 1 Backend Developer (API refactoring)
- 1 QA Engineer (testing)
- 1 DevOps Engineer (deployment)

---

## Success Metrics

- Initial page load: <2s (currently 4.8s)
- Time to Interactive: <3s (currently 6s)
- Lighthouse Score: >90 (currently 65)
- Code Coverage: >80% (currently 0%)
- Bundle Size: <500KB (currently 1.2MB)

---

## Next Steps

1. Get stakeholder approval for refactoring plan
2. Set up React project with Vite
3. Create component library (Storybook)
4. Start with Dashboard migration
5. Deploy to staging for testing
6. Gradual rollout to production (10% → 50% → 100%)
