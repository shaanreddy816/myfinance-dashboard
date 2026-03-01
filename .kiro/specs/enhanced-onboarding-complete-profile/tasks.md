# Implementation Plan: Enhanced Onboarding - Complete Profile Setup

## Overview

This implementation plan breaks down the Enhanced Onboarding feature into discrete coding tasks. The feature adds a comprehensive 4-phase wizard to collect detailed financial information from Indian users, replacing the basic signup flow. All code will be integrated into the existing `famledgerai/index.html` single-page application.

The implementation follows an incremental approach: build core infrastructure first, then add each phase sequentially, integrate smart defaults and validation, add persistence, and finally wire everything together with the existing dashboard.

## Tasks

- [ ] 1. Set up onboarding infrastructure and core components
  - Create onboarding wizard container HTML structure in famledgerai/index.html
  - Implement OnboardingWizard class with phase navigation methods
  - Create ProgressIndicator component with 4-phase stepper UI
  - Add CSS styling for wizard container, progress indicator, and navigation buttons
  - Implement phase rendering and transition logic
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 22.1_

- [ ]* 1.1 Write property tests for phase navigation
  - **Property 1: Phase Navigation Preserves Data**
  - **Validates: Requirements 1.4**

- [ ] 2. Implement Phase 1: Basic Information
  - [ ] 2.1 Create Phase 1 form HTML with all required fields
    - Add name, age, gender, marital status, occupation, city fields
    - Implement conditional spouse section (shown when married)
    - Add dynamic child and parent form groups with add/remove buttons
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ] 2.2 Implement BasicInfoPhase class
    - Write render() method to display form
    - Implement getData() method to collect form values
    - Add event listeners for marital status change (show/hide spouse)
    - Implement addChild(), removeChild(), addParent(), removeParent() functions
    - _Requirements: 2.1, 2.2, 2.3, 4.4_

  - [ ] 2.3 Add Phase 1 validation logic
    - Validate required fields (name, age, gender, marital status, occupation, city)
    - Validate age >= 18
    - Validate spouse fields when married
    - Display inline error messages
    - _Requirements: 2.1, 19.1, 19.2, 19.5_

  - [ ]* 2.4 Write property tests for Phase 1
    - **Property 4: Conditional Field Display**
    - **Property 5: Dynamic Form Addition**
    - **Validates: Requirements 2.2, 2.3, 4.4, 10.1, 10.4**

- [ ] 3. Implement Phase 2: Income Sources
  - [ ] 3.1 Create Phase 2 form HTML
    - Add salary, bonus, rental, business, freelancing, investment returns, other income fields
    - Add conditional spouse income field (shown when married)
    - Add total income display section
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ] 3.2 Implement IncomePhase class and calculations
    - Write render() method to display income form
    - Implement calculateTotalIncome() function (sum all sources, divide bonus by 12)
    - Add real-time income total updates on input change
    - Implement getData() method
    - _Requirements: 4.2, 4.5_

  - [ ] 3.3 Add Phase 2 validation
    - Validate salary is required and > 0
    - Validate all numeric fields accept only numbers
    - Validate no negative values
    - _Requirements: 4.6, 19.1, 19.2_

  - [ ]* 3.4 Write property tests for income calculations
    - **Property 8: Annual to Monthly Conversion**
    - **Property 9: Total Income Calculation**
    - **Validates: Requirements 4.2, 4.5**

- [ ] 4. Implement Phase 3: Monthly Expenses - Part 1 (Core Categories)
  - [ ] 4.1 Create expense category HTML structure
    - Implement Housing category (EMI/rent choice, property tax, maintenance, insurance)
    - Implement Transportation category (car EMI, petrol, insurance, maintenance, public transport)
    - Implement Insurance category (health, term, car, personal accident with annual to monthly conversion)
    - Implement Utilities category (electricity, water, gas, internet, mobile, OTT)
    - Implement Food category (groceries, vegetables, dining, delivery)
    - Add category total and percentage displays for each
    - _Requirements: 5.1, 5.2, 6.1, 6.2, 7.1, 7.2, 8.1, 9.1_

  - [ ] 4.2 Implement expense calculation functions
    - Write calculateCategoryTotal() for each category
    - Write calculateCategoryPercentage() using total income
    - Add real-time updates on input change
    - Display category totals and percentages
    - _Requirements: 5.3, 6.3, 7.3, 8.2, 9.2_

  - [ ]* 4.3 Write property tests for expense calculations
    - **Property 10: Category Total Calculation**
    - **Property 11: Category Percentage Calculation**
    - **Validates: Requirements 5.3, 6.3, 7.3, 8.2, 9.2**

- [ ] 5. Implement Phase 3: Monthly Expenses - Part 2 (Remaining Categories)
  - [ ] 5.1 Create remaining expense category HTML
    - Implement Children category (dynamic per-child expenses: school fees, tuition, sports, transport, books)
    - Implement Healthcare category (medicines, consultations, gym, supplements, emergency fund)
    - Implement Lifestyle category (outings, entertainment, shopping, hobbies)
    - Implement Investments category (SIP, PPF, stocks, education fund, retirement fund, equity/debt split)
    - Implement Miscellaneous category (domestic help, pets, charity, custom categories)
    - _Requirements: 10.1, 10.2, 11.1, 12.1, 13.1, 14.1, 14.2_

  - [ ] 5.2 Implement dynamic expense features
    - Add addVehicle() function for multiple vehicle expenses
    - Add addCustomCategory() function for miscellaneous expenses (max 10)
    - Link children expenses to children added in Phase 1
    - _Requirements: 6.5, 10.4, 14.4_

  - [ ] 5.3 Implement total expenses calculation
    - Write calculateTotalExpenses() summing all categories
    - Write calculateRemaining() (income - expenses)
    - Display total expenses and remaining income
    - Disable completion if expenses > income
    - _Requirements: 17.1, 17.2, 17.3, 17.4_

  - [ ]* 5.4 Write property tests for total calculations
    - **Property 13: Total Expenses Calculation**
    - **Property 14: Remaining Income Calculation**
    - **Property 15: Budget Validation Blocking**
    - **Validates: Requirements 17.1, 17.2, 17.3, 17.4**

- [ ] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement expense warnings and tips
  - [ ] 7.1 Create warning system for high expense ratios
    - Implement threshold checks for each category (housing > 40%, transport > 20%, etc.)
    - Display warning messages when thresholds exceeded
    - Add contextual tips for reducing expenses
    - _Requirements: 5.4, 6.4, 7.4, 7.5, 8.5, 9.4, 9.5, 10.5, 11.4, 11.5, 12.4, 13.3, 14.5_

  - [ ]* 7.2 Write property tests for warnings
    - **Property 12: Threshold-Based Warnings**
    - **Validates: Requirements 5.4, 6.4, 7.4, 7.5, 8.5, 9.4, 9.5, 10.5, 11.4, 11.5, 12.4, 13.3, 14.5, 16.4**

- [ ] 8. Implement Smart Defaults Engine
  - [ ] 8.1 Create SmartDefaultsEngine class
    - Implement getCityTier() function (tier 1, 2, 3 based on city)
    - Implement calculateFamilySize() function
    - Write getHousingDefault() based on city tier and income
    - Write getGroceriesDefault() based on family size
    - Write getUtilitiesDefault() based on family size
    - Write getInvestmentDefault() based on age and income
    - Write getSchoolFeesDefault() based on school type
    - _Requirements: 5.5, 9.3, 10.3, 13.4, 23.1, 23.2, 23.3, 23.4_

  - [ ] 8.2 Integrate smart defaults into expense forms
    - Call loadSmartDefaults() when city is selected in Phase 1
    - Apply defaults only to empty fields
    - Add visual indicator (CSS class) for smart default values
    - Allow user override of defaults
    - _Requirements: 23.5_

  - [ ]* 8.3 Write property tests for smart defaults
    - **Property 6: Smart Defaults Scale with Context**
    - **Property 7: Smart Defaults Scale with Family Size**
    - **Property 29: Smart Defaults Override**
    - **Property 34: Age-Based Investment Defaults**
    - **Property 35: School Type Defaults**
    - **Validates: Requirements 5.5, 9.3, 10.3, 13.4, 23.1, 23.2, 23.3, 23.4, 23.5**

- [ ] 9. Implement Phase 4: Assets & Liabilities
  - [ ] 9.1 Create Phase 4 form HTML
    - Add liquid assets section (bank balance)
    - Add semi-liquid assets section (FD, mutual funds, stocks)
    - Add illiquid assets section (gold, real estate with dynamic property addition)
    - Add liabilities section with dynamic loan addition (type, outstanding, interest rate, EMI)
    - Add assets summary, liabilities summary, and net worth display
    - _Requirements: 15.1, 15.3, 15.4, 16.1, 16.2_

  - [ ] 9.2 Implement assets and liabilities calculations
    - Write updateAssetsCalculations() (categorize and sum liquid, semi-liquid, illiquid)
    - Write updateLiabilitiesCalculations() (sum outstanding and EMIs)
    - Write calculateNetWorth() (assets - liabilities)
    - Write calculateDebtToIncomeRatio() (total EMI / income)
    - Display warnings when debt-to-income ratio > 40%
    - Add real-time updates on input change
    - _Requirements: 15.2, 15.5, 16.3, 16.4, 16.5_

  - [ ]* 9.3 Write property tests for assets and liabilities
    - **Property 16: Total Assets Calculation**
    - **Property 17: Total Liabilities Calculation**
    - **Property 18: Net Worth Calculation**
    - **Property 19: Debt-to-Income Ratio Calculation**
    - **Property 20: Asset Categorization**
    - **Property 21: Investment Type Distinction**
    - **Validates: Requirements 15.2, 15.5, 16.3, 16.4, 16.5, 13.5**

- [ ] 10. Implement Financial Goals collection
  - [ ] 10.1 Create goals form in Phase 1
    - Add dynamic goal addition (name, target amount, timeline, priority)
    - Implement addGoal() and removeGoal() functions
    - _Requirements: 3.1_

  - [ ] 10.2 Implement goal categorization
    - Write categorizeGoalTimeline() (short < 3 years, medium 3-7, long > 7)
    - Display goal category automatically based on timeline
    - _Requirements: 3.2_

  - [ ]* 10.3 Write property tests for goals
    - **Property 22: Goal Timeline Categorization**
    - **Validates: Requirements 3.2**

- [ ] 11. Implement Risk Profile calculation
  - [ ] 11.1 Create CalculationEngine class
    - Write calculateRiskScore() considering age, debt ratio, emergency fund, savings rate, dependents
    - Write categorizeRiskProfile() (Conservative < 40, Moderate 40-70, Aggressive >= 70)
    - _Requirements: 25.1, 25.2, 25.3, 25.4_

  - [ ]* 11.2 Write property tests for risk calculations
    - **Property 23: Risk Score Calculation**
    - **Property 24: Risk Profile Categorization**
    - **Validates: Requirements 25.1, 25.2, 25.3, 25.4**

- [ ] 12. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Implement Validation Engine
  - [ ] 13.1 Create ValidationEngine class
    - Write validateRequired() for mandatory fields
    - Write validateNumeric() for number fields
    - Write validatePositive() for non-negative values
    - Write validateAge() for age range (18-100)
    - Write validateRange() for bounded values
    - Implement displayError() and clearError() for inline error messages
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5_

  - [ ] 13.2 Integrate validation into all phases
    - Add validation calls to each phase's validate() method
    - Prevent phase advancement when validation fails
    - Focus first error field on validation failure
    - _Requirements: 19.5_

  - [ ]* 13.3 Write property tests for validation
    - **Property 25: Mandatory Field Validation**
    - **Property 26: Numeric Field Validation**
    - **Property 27: Negative Value Validation**
    - **Property 28: Custom Category Limit**
    - **Validates: Requirements 4.6, 19.1, 19.2, 19.5, 14.4**

- [ ] 14. Implement localStorage persistence
  - [ ] 14.1 Create PersistenceManager class
    - Write saveProgress() to store onboarding state in localStorage
    - Write loadProgress() to restore state on page load
    - Write clearProgress() to remove onboarding data
    - Handle QuotaExceededError gracefully
    - _Requirements: 18.1, 18.2, 18.3, 18.4_

  - [ ] 14.2 Integrate persistence into wizard lifecycle
    - Call saveProgress() after each phase completion
    - Call loadProgress() on wizard initialization
    - Restore current phase and all entered data
    - Add "Save & Exit" button functionality
    - Add "Clear and Start Over" button functionality
    - _Requirements: 1.5, 1.6, 18.1, 18.2, 18.4_

  - [ ] 14.3 Add beforeunload warning
    - Warn user before leaving page if onboarding incomplete
    - Show "Welcome back" message when returning
    - _Requirements: 18.5_

  - [ ]* 14.4 Write property tests for persistence
    - **Property 2: Progress Persistence Across Sessions**
    - **Property 32: Data Persistence After Phase Completion**
    - **Property 33: Clear and Start Over**
    - **Validates: Requirements 1.5, 1.6, 18.1, 18.2, 18.3, 18.4**

- [ ] 15. Implement completion summary and Supabase transfer
  - [ ] 15.1 Create completion summary display
    - Show summary cards (total income, expenses, savings, savings rate, net worth, risk profile)
    - Implement renderExpenseChart() using Chart.js for expense breakdown
    - Calculate and display completion time
    - Add "Complete Setup" and "Review & Edit" buttons
    - _Requirements: 20.1, 20.2, 20.3, 21.1, 21.2_

  - [ ] 15.2 Implement Supabase data transfer
    - Write transferToSupabase() function to upsert user_profiles table
    - Include all collected data and calculated fields
    - Handle network errors with retry logic (3 attempts with exponential backoff)
    - Clear localStorage after successful transfer
    - Show error message and "Complete Later" button on failure
    - _Requirements: 20.4, 20.5_

  - [ ] 15.3 Add completion button logic
    - Show completion button only when all 4 phases complete and budget valid
    - Call transferToSupabase() on completion
    - Navigate to dashboard after successful transfer
    - _Requirements: 20.2, 20.5_

  - [ ]* 15.4 Write unit tests for completion flow
    - Test completion button visibility logic
    - Test Supabase transfer success and failure scenarios
    - Test localStorage clearing after transfer
    - _Requirements: 20.2, 20.4, 20.5_

- [ ] 16. Integrate with existing dashboard
  - [ ] 16.1 Add onboarding trigger to auth flow
    - Check if user has completed onboarding after successful registration
    - Show onboarding wizard if profile incomplete
    - Skip onboarding if profile exists
    - _Requirements: 1.1, 24.1_

  - [ ] 16.2 Extend userData object with profile data
    - Write extendUserData() to merge onboarding data into existing userData structure
    - Convert expense structure to match existing monthly expenses array
    - Convert assets to investments structure
    - Update liquidSavings, termCover, and other calculated fields
    - _Requirements: 24.2, 24.3_

  - [ ] 16.3 Invalidate computation cache
    - Call computeCache.invalidate() after onboarding completion
    - Ensure dashboard recalculates with new profile data
    - _Requirements: 24.3_

  - [ ] 16.4 Navigate to dashboard after completion
    - Call navigateTo('overview') after successful transfer
    - Call renderOverview() to display dashboard with new data
    - _Requirements: 20.5, 24.4_

  - [ ]* 16.5 Write integration tests
    - Test auth flow triggers onboarding for new users
    - Test dashboard receives correct profile data
    - Test existing userData structure extends correctly
    - _Requirements: 1.1, 24.1, 24.2, 24.3, 24.4_

- [ ] 17. Add mobile-responsive design
  - [ ] 17.1 Implement mobile CSS
    - Add media queries for screens < 768px (tablet) and < 480px (mobile)
    - Stack form fields vertically on mobile
    - Make progress indicator compact on mobile
    - Ensure touch targets >= 44x44px
    - Prevent iOS zoom with font-size: 16px on inputs
    - Make navigation buttons full-width on mobile
    - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5_

  - [ ]* 17.2 Write mobile responsiveness tests
    - Test layout at 320px, 390px, 768px widths
    - Test no horizontal scroll
    - Test touch target sizes
    - _Requirements: 21.1, 21.2, 21.3, 21.4_

- [ ] 18. Add accessibility features
  - [ ] 18.1 Implement keyboard navigation
    - Add Enter key handler to advance to next field
    - Add Tab navigation through all fields
    - Focus first input when phase loads
    - Focus first error field on validation failure
    - _Requirements: 22.4_

  - [ ] 18.2 Add ARIA labels and screen reader support
    - Add aria-required to mandatory fields
    - Add aria-describedby for help text
    - Add role="alert" for error messages
    - Add role="status" for progress announcements
    - Add proper label associations for all inputs
    - _Requirements: 22.4_

  - [ ]* 18.3 Write accessibility tests
    - Test keyboard navigation through all phases
    - Test screen reader announcements
    - Test focus management
    - _Requirements: 22.4_

- [ ] 19. Add helper functions and utilities
  - [ ] 19.1 Implement utility functions
    - Write formatCurrency() for Indian rupee formatting
    - Write getValue() and setValue() for form field access
    - Write generateId() for unique IDs
    - Write getCityTier() for city categorization
    - Write calculateFamilySize() for family member count
    - Write calculateCompletionPercentage() for progress tracking
    - Write showToast() for notifications
    - Write debounce() for performance optimization
    - _Requirements: 22.3, 22.5_

  - [ ] 19.2 Add performance optimizations
    - Implement debounced calculation updates (300ms delay)
    - Implement lazy phase rendering (only render current phase)
    - Add calculation memoization with cache invalidation
    - _Requirements: 22.5_

  - [ ]* 19.3 Write unit tests for utilities
    - Test formatCurrency() with various amounts
    - Test getCityTier() with tier 1, 2, 3 cities
    - Test calculateFamilySize() with different family structures
    - Test debounce() timing
    - _Requirements: 22.3, 22.5_

- [ ] 20. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 21. Create Supabase database schema
  - [ ] 21.1 Create user_profiles table
    - Define table schema with all required columns (basic info, family, goals, income, expenses, assets, liabilities, calculated fields, metadata)
    - Use JSONB for complex nested data (spouse, children, parents, goals, income, expenses, assets, liabilities, calculated)
    - Add timestamps (created_at, updated_at, onboarding_completed_at)
    - _Requirements: 20.4_

  - [ ] 21.2 Add Row Level Security policies
    - Enable RLS on user_profiles table
    - Create policy: Users can view own profile
    - Create policy: Users can insert own profile
    - Create policy: Users can update own profile
    - _Requirements: 20.4_

  - [ ]* 21.3 Write database integration tests
    - Test profile insert for new user
    - Test profile update for existing user
    - Test RLS policies prevent unauthorized access
    - _Requirements: 20.4_

- [ ] 22. Add error handling and edge cases
  - [ ] 22.1 Implement error handling
    - Handle localStorage unavailable (show warning, use session-only mode)
    - Handle localStorage quota exceeded (show warning, keep only current phase data)
    - Handle Supabase connection errors (retry with backoff, show "Complete Later" option)
    - Handle division by zero in percentage calculations (show 0%)
    - Handle invalid data types (sanitize with parseFloat, default to 0)
    - _Requirements: 19.6_

  - [ ] 22.2 Add input sanitization
    - Write sanitizeInput() for text and number fields
    - Remove potential XSS characters from text inputs
    - Ensure numeric fields parse correctly and default to 0
    - _Requirements: 19.2_

  - [ ]* 22.3 Write edge case tests
    - Test with age 17 (invalid), 18 (valid), 100 (valid)
    - Test with income 0, 1, 10000000
    - Test with family size 0, 1, 10, 11 (over limit)
    - Test with empty strings, whitespace-only strings
    - Test with special characters in text fields
    - _Requirements: 19.1, 19.2, 19.3, 19.4_

- [ ] 23. Final integration and polish
  - [ ] 23.1 Add CSS styling and animations
    - Style progress indicator with completed/active states
    - Style form fields with focus states and smart default indicators
    - Style error and warning messages
    - Add smooth transitions for phase changes
    - Style completion summary cards and chart
    - _Requirements: 21.1, 21.2_

  - [ ] 23.2 Add loading states and feedback
    - Show loading spinner during Supabase transfer
    - Show toast notifications for save success/failure
    - Show progress percentage in real-time
    - Add smooth scrolling to error fields
    - _Requirements: 22.5_

  - [ ] 23.3 Test complete end-to-end flow
    - Test new user registration → onboarding → dashboard flow
    - Test save and exit → return → resume flow
    - Test all 4 phases with realistic data
    - Test completion with valid budget
    - Test completion blocked with invalid budget
    - Verify all data appears correctly in dashboard
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 20.1, 20.2, 20.3, 20.4, 20.5, 24.1, 24.2, 24.3, 24.4_

  - [ ]* 23.4 Write end-to-end integration tests
    - Test complete onboarding flow from start to finish
    - Test data persistence across page reloads
    - Test dashboard integration
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 20.5, 24.4_

- [ ] 24. Final checkpoint - Complete testing and validation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties using fast-check library
- Unit tests validate specific examples, edge cases, and integration points
- All code integrates into existing famledgerai/index.html single-page application
- Implementation uses JavaScript, HTML, and CSS (no separate files)
- Smart defaults reduce data entry time to meet < 10 minute target
- localStorage persistence ensures > 80% completion rate target
- Mobile-responsive design ensures > 60% mobile completion rate target
