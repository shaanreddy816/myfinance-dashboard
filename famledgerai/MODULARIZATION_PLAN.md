# FamLedgerAI Modularization Plan

## Current State
- **Total Lines**: 15,381
- **CSS**: Lines 30-1063 (~1,033 lines)
- **JavaScript**: Lines 2401-end (~13,000 lines)
- **Build Issues**: Repeated Vite build failures due to large inline code

## Goal
Split into maintainable modules WITHOUT changing behavior

## Safety Measures
✅ Rollback snapshot created: `legacy/index.legacy.html`
✅ Incremental approach with build verification after each step
✅ No logic changes, only code organization

## Execution Plan

### STEP 1: Extract CSS (Low Risk)
- Create `styles/base.css` - CSS variables, resets, scrollbar
- Create `styles/components.css` - Buttons, cards, inputs, modals
- Create `styles/dashboard.css` - Dashboard-specific styles
- Update index.html with `<link>` tags
- **Test**: `npm run build && npm run dev`

### STEP 2: Move ALL JS to Single File (Medium Risk)
- Extract entire `<script type="module">` block
- Create `src/legacy/app.legacy.js`
- Update index.html to load it
- **Test**: `npm run build && npm run dev`
- **Verify**: All flows work (auth, onboarding, dashboard)

### STEP 3: Create Module Structure (Preparation)
Create empty module files:
```
src/
├── app/
│   └── bootstrap.js          # New entry point
├── auth/
│   ├── login.js
│   ├── register.js
│   ├── callback.js
│   └── logout.js
├── onboarding/
│   ├── welcome.js
│   └── wizard.js
├── dashboard/
│   ├── shell.js
│   ├── overview.js
│   ├── income.js
│   ├── expenses.js
│   ├── loans.js
│   ├── investments.js
│   └── insurance.js
├── ui/
│   ├── modals.js
│   ├── charts.js
│   ├── toast.js
│   └── dom.js
├── integrations/
│   ├── supabaseClient.js
│   └── apiClient.js
└── utils/
    ├── validators.js
    ├── formatters.js
    └── constants.js
```

### STEP 4: Gradual Extraction (High Risk - Multiple Passes)

#### Pass A: Supabase Init
- Move from `src/lib/supabaseClient.js` (already exists)
- Ensure env vars work
- **Test**: Auth flows

#### Pass B: Auth Flow
- Extract login/register/logout functions
- Keep exact same behavior
- **Test**: Signup → verification → onboarding

#### Pass C: Onboarding
- Extract wizard logic
- Preserve all DOM IDs
- **Test**: Complete wizard → dashboard

#### Pass D: Dashboard
- Extract rendering functions
- Keep same chart behavior
- **Test**: All dashboard sections load

#### Pass E: UI Helpers
- Extract modals, toast, charts
- **Test**: All UI interactions work

### STEP 5: Final Wiring
- Update `src/app/bootstrap.js` to import all modules
- Remove `src/legacy/app.legacy.js`
- Update index.html to load bootstrap.js
- **Test**: Full regression test

### STEP 6: Environment Variables
- Create `.env.example`
- Document Vercel env vars
- Verify no secrets in code

## Testing Checklist (After Each Step)
1. ✅ `npm run build` passes
2. ✅ `npm run dev` starts without errors
3. ✅ Signup → email verification → congratulations modal
4. ✅ Onboarding wizard → dashboard
5. ✅ Logout → login different user → no data leak
6. ✅ No console errors
7. ✅ All charts render
8. ✅ PDF parsing works
9. ✅ WhatsApp integration works
10. ✅ Zerodha OAuth works

## Rollback Instructions
If anything breaks:
```bash
cd famledgerai
cp legacy/index.legacy.html index.html
git checkout -- src/
npm run build
git push origin main
```

## Risk Assessment
- **Step 1 (CSS)**: LOW - CSS is isolated
- **Step 2 (JS to single file)**: MEDIUM - Scope changes
- **Step 3 (Structure)**: LOW - Just creating files
- **Step 4 (Extraction)**: HIGH - Logic movement
- **Step 5 (Wiring)**: HIGH - Integration
- **Step 6 (Env)**: LOW - Documentation

## Timeline
- Step 1: 15 minutes
- Step 2: 20 minutes
- Step 3: 10 minutes
- Step 4: 2-3 hours (careful extraction)
- Step 5: 30 minutes
- Step 6: 10 minutes
- **Total**: ~4 hours with testing

## Decision Point
This is a significant refactoring. Options:
1. **Proceed with full modularization** (4 hours, high risk)
2. **Do Step 1-2 only** (35 minutes, low risk, fixes most build issues)
3. **Create a spec for incremental work** (safer, allows review)

**Recommendation**: Start with Steps 1-2 to stabilize builds, then create a spec for the rest.
