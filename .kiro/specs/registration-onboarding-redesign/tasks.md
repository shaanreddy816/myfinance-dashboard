# Tasks

## Task 1: Clean up Registration Form HTML
- [x] Remove hidden compatibility fields from `#aform-reg`: `#r-nm`, `#r-spouse`, `#r-kids-wrap`, `#r-age`, `#r-occupation`, `#r-income-range`, `#goal-options`, `#risk-options`
- [x] Rename WhatsApp field label to "Phone Number *" and make it required (remove "Optional" text)
- [x] Verify first name, last name, email, phone, password, confirm password, terms checkbox remain

## Task 2: Add Verification Screen HTML
- [x] Add `<div id="verification-screen" style="display:none;">` section with envelope icon, "Check your email" heading, registered email display, and "Back to Sign In" button
- [x] Add `showVerificationScreen(email)` function to display it and hide other sections
- [x] Add click handler for "Back to Sign In" button that calls `showAuth()`

## Task 3: Add Profile Wizard HTML and CSS
- [x] Add `<div id="profile-wizard" style="display:none;">` section with all 7 wizard sections (personal, family, income, expenses, assets, liabilities, goals)
- [x] Add marital status toggle to show/hide spouse name field
- [x] Add dynamic add/remove children functionality
- [x] Add "Complete Profile →" submit button
- [x] Style wizard sections with existing card/form styles for visual consistency

## Task 4: Rewrite `handleModernRegistration()` Function
- [x] Remove all hidden field setting code (`r-nm`, `r-age`, `r-occupation`, `r-income-range`)
- [x] Remove call to `doReg()` — inline the signUp logic directly
- [x] Call `sb.auth.signUp({ email, password, options: { data: { firstName, lastName, phone } } })`
- [x] On success with no session: save `{email, firstName, lastName, phone}` to localStorage as `pending_registration_data`, show verification screen
- [x] On success with session: show congratulations modal, then `showProfileWizard()`
- [x] Do NOT build full userData object — only store minimal registration data

## Task 5: Implement `showProfileWizard()` Function
- [x] Create function that shows `#profile-wizard` and hides `#landing`, `#auth`, `#app`, `#verification-screen`
- [x] Pre-fill first name and last name from `pending_registration_data` or auth metadata into a read-only greeting
- [x] Attach marital status change listener to toggle spouse fields
- [x] Attach add/remove child button handlers

## Task 6: Implement `completeProfileWizard()` Function
- [x] Collect all wizard field values
- [x] Validate required fields (age, occupation at minimum)
- [x] Build complete `userData` object matching existing data structure (profile, income, expenses with byMember/byMonth, investments, loans, insurance, schemes, bankAccounts)
- [x] Compute `incomeRange` from monthly income for backward compatibility
- [x] Build `familyMembers` array from personal + family data
- [x] Build expenses.byMember.self and expenses.byMonth entries for non-zero expense values with proper category labels (housing, food, transport, education, healthcare, lifestyle, investments, miscellaneous)
- [x] Build investments object with entries for non-zero asset values (mutualFunds, stocks, fd, ppf)
- [x] Store real estate and gold values in profile for asset display
- [x] Build loans array with entries for non-zero liability values (home loan, car loan, personal loan, education loan, credit card debt)
- [x] Set `liquidSavings` from cash/savings value for emergency fund calculations
- [x] Ensure all data is available in global `userData` for AI Advisor, NRI Planner, and Autopilot features
- [x] Call `saveUserData(currentUserEmail)`
- [x] On success: set `onboarding_completed` in localStorage, remove `pending_registration_data`, call `showApp()`
- [x] On failure: show error toast, retain form data

## Task 7: Modify Auth State Listener and `checkSession()`
- [x] In `onAuthStateChange` SIGNED_IN handler: after `loadUserData()`, check if profile is incomplete (no age, no occupation) → call `showProfileWizard()` instead of `showApp()`
- [x] In `checkSession()`: after `loadUserData()` and pending data restore, check if profile is incomplete → call `showProfileWizard()` instead of `showApp()`
- [x] Update `loadUserData()` auth metadata recovery to only recover firstName, lastName, phone (not age, occupation, goals, risk)

## Task 8: Remove Legacy Registration and Onboarding Code
- [x] Remove `window.doReg` function
- [x] Remove `window.addKidField` function (registration version)
- [x] Remove `OnboardingWizard` class and all its methods
- [x] Remove `completeOnboarding`, `showOnboarding`, `collectOnboardingData` functions
- [x] Remove `ONBOARDING_STORAGE_KEY` and `onboardingState` variables
- [x] Remove `syncPendingOnboardingData` function
- [x] Remove registration goal/risk selector event listeners
- [x] Verify no broken references remain after removal
