# Implementation Plan: Launch Critical Features

## Overview

This implementation plan covers three launch-critical features for FamLedgerAI:
1. **Emergency Fund Model** (Tasks 1-6): Calculator, UI card, and Financial Health Score integration
2. **Automation Workflows** (Tasks 7-20): Background automation engine with 7 intelligent rules
3. **Health Insurance Education Center** (Tasks 21-30): Educational hub with AI-powered Q&A

All features are purely additive with zero breaking changes. The implementation uses TypeScript with Next.js 14 App Router and Supabase.

## Tasks

### FEATURE 1: Emergency Fund Model

- [x] 1. Create emergency fund calculator module
  - Create `/lib/calculators/emergencyFund.ts` with `calculateEmergencyFund()` function
  - Implement target calculation: 6 months (salaried) or 9 months (self-employed)
  - Implement status classification: excellent (≥6), good (4-6), warning (3-4), critical (<3)
  - Implement color mapping: teal (#5BE6C4), orange (#FF9933), red (#FF6B6B)
  - Calculate progress percentage and months covered
  - Generate insight and action messages
  - _Requirements: 1.2, 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ]* 1.1 Write property tests for emergency fund calculator
  - **Property 1: Emergency Fund Calculation Correctness**
  - **Property 2: Salaried Target Calculation**
  - **Property 3: Self-Employed Target Calculation**
  - **Property 4: Status Color Classification**
  - **Property 5: Progress Percentage Calculation**
  - **Property 7: Decimal Precision for Months**
  - **Property 9: Savings Recommendation Calculation**
  - **Validates: Requirements 1.2, 2.1, 2.2, 2.3, 2.4, 2.5**

- [x] 2. Create EmergencyFundCard component
  - Create `/components/overview/EmergencyFundCard.tsx`
  - Fetch liquid savings (FD + savings account) using existing hooks
  - Fetch monthly expenses using existing hooks
  - Fetch employment type from user profile
  - Display current amount, target, months covered with INR formatting
  - Display progress bar with color-coded status
  - Display next action recommendation
  - Match existing SummaryCard styling (background #060A14, Playfair Display, DM Sans)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [ ]* 2.1 Write unit tests for EmergencyFundCard
  - Test rendering with different emergency fund states
  - Test INR currency formatting
  - Test color coding for different status levels
  - **Property 6: Currency Formatting**
  - **Validates: Requirements 3.2, 3.3, 3.4, 3.7**

- [x] 3. Update familyHealthScore.ts with emergency fund integration
  - Modify `/lib/calculators/familyHealthScore.ts`
  - Add optional `employmentType` field to `HealthScoreInput` interface
  - Update Pillar 1 calculation to use employment-aware logic
  - Salaried: 6 months = 20 pts, 4 months = 16 pts, 3 months = 12 pts
  - Self-employed: 9 months = 20 pts, 6 months = 16 pts, 4 months = 12 pts
  - Maintain backward compatibility (existing logic as fallback)
  - Update insight and action messages to reference employment type
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 3.1 Write property tests for Financial Health Score integration
  - **Property 10: Maximum Points for Adequate Fund**
  - **Property 11: Proportional Points for Partial Fund**
  - **Property 12: Minimal Points for Insufficient Fund**
  - **Validates: Requirements 5.2, 5.3, 5.4**

- [x] 4. Add EmergencyFundCard to Overview page
  - Modify `/app/(dashboard)/overview/page.tsx`
  - Import and render EmergencyFundCard component
  - Position after Loans card and before Retirement/Education widgets
  - Ensure responsive layout matches existing cards
  - _Requirements: 3.1_

- [x] 5. Update next action priority system
  - Modify next action calculation logic (location TBD based on existing code)
  - Add emergency fund priority rules:
    - <3 months: critical priority
    - 3-6 months: medium priority
    - ≥6 months: no priority
  - Generate specific savings amount recommendations
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ]* 5.1 Write property tests for next action priority
  - **Property 8: Priority Classification**
  - **Validates: Requirements 4.1, 4.2, 4.3**

- [x] 6. Checkpoint - Emergency Fund Feature Complete
  - Verify EmergencyFundCard displays correctly on Overview page
  - Verify Financial Health Score updates with emergency fund status
  - Verify next actions include emergency fund recommendations
  - Run TypeScript compilation: `npx tsc --noEmit`
  - Ensure all tests pass, ask the user if questions arise

### FEATURE 2: Automation Workflows

- [x] 7. Create Supabase migration for automation tables
  - Create migration file in `/supabase/migrations/`
  - Create `automation_jobs` table with columns: id, user_id, rule_name, last_run_at, next_run_at, status, result_summary, created_at, updated_at
  - Create `notifications` table with columns: id, user_id, type, title, message, severity, is_read, metadata, created_at
  - Update `alerts` table: add automation_rule, is_dismissed, dismissed_at columns
  - Add indexes on user_id, created_at, next_run_at, is_read
  - Enable RLS policies for both tables
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 8. Create automation engine core
  - Create `/lib/automation/engine.ts`
  - Implement `AutomationRule`, `AutomationContext`, `AutomationResult` interfaces
  - Implement `runAutomation(userId)` function
  - Fetch all financial data for user (income, expenses, investments, goals, loans, insurance, alerts)
  - Execute all 7 automation rules with error handling
  - Create alerts/notifications for triggered rules
  - Update automation_jobs table with execution results
  - Implement idempotency checks (no duplicate alerts within 24 hours)
  - Return execution summary
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.8_

- [ ]* 8.1 Write property tests for automation engine
  - **Property 21: Automation Engine Idempotency**
  - **Property 35: API Error Handling**
  - **Validates: Requirements 7.5, 8.5, 9.5, 10.5, 11.5, 12.5, 13.5, 14.7, 14.8**

- [x] 9. Create automation rule: High EMI Ratio
  - Create `/lib/automation/rules/highEMIRatio.ts`
  - Trigger: Monthly EMI > 40% of income
  - Severity: warning (orange)
  - Message: "Your EMI is {X}% of income. Target below 30% for healthy finances."
  - Include current EMI ratio and recommended actions
  - Use calm, educational tone
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ]* 9.1 Write property test for High EMI Ratio rule
  - **Property 13: High EMI Ratio Detection**
  - **Validates: Requirements 7.1, 7.2**

- [x] 10. Create automation rule: Low Savings Rate
  - Create `/lib/automation/rules/lowSavingsRate.ts`
  - Trigger: Monthly investments < 10% of income
  - Severity: warning (orange)
  - Message: "You're investing {X}% of income. Increase SIP by ₹{Y} to reach 20%."
  - Calculate recommended SIP increase
  - Use encouraging, educational tone
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ]* 10.1 Write property tests for Low Savings Rate rule
  - **Property 14: Low Savings Rate Detection**
  - **Property 15: SIP Recommendation Calculation**
  - **Validates: Requirements 8.1, 8.2, 8.3**

- [x] 11. Create automation rule: Insurance Renewal
  - Create `/lib/automation/rules/insuranceRenewal.ts`
  - Trigger: Active policy expires within 30 days
  - Severity: warning (orange)
  - Message: "{Policy name} expires on {date}. Renew now to avoid coverage gap."
  - Check all policy types (term, health, vehicle, property)
  - Include renewal instructions
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ]* 11.1 Write property test for Insurance Renewal rule
  - **Property 16: Insurance Renewal Detection**
  - **Validates: Requirements 9.1, 9.2, 9.4**

- [x] 12. Create automation rule: No Emergency Fund
  - Create `/lib/automation/rules/noEmergencyFund.ts`
  - Trigger: Emergency fund < 3 months expenses
  - Severity: warning (orange)
  - Message: "Emergency fund covers {X} months. Save ₹{Y}/month to reach 6-month target."
  - Include current months covered and savings recommendation
  - Use educational tone emphasizing importance
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ]* 12.1 Write property test for No Emergency Fund rule
  - **Property 17: Low Emergency Fund Detection**
  - **Validates: Requirements 10.1, 10.2, 10.3**

- [x] 13. Create automation rule: No Health Insurance
  - Create `/lib/automation/rules/noHealthInsurance.ts`
  - Trigger: No active health insurance policy
  - Severity: critical (red)
  - Message: "No health insurance found. Get ₹{X}L family floater to protect against medical costs."
  - Calculate recommended coverage based on family size
  - Use urgent but not alarming tone
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ]* 13.1 Write property test for No Health Insurance rule
  - **Property 18: No Health Insurance Detection**
  - **Validates: Requirements 11.1, 11.3**

- [x] 14. Create automation rule: Goal Falling Behind
  - Create `/lib/automation/rules/goalFallingBehind.ts`
  - Trigger: Active goal with zero monthly SIP
  - Severity: warning (orange)
  - Message: "{Goal name} has no funding. Start ₹{X}/month SIP to reach target on time."
  - Include goal name, target amount, and recommended SIP
  - Use motivational, educational tone
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ]* 14.1 Write property test for Goal Falling Behind rule
  - **Property 19: Unfunded Goal Detection**
  - **Validates: Requirements 12.1, 12.2, 12.3**

- [x] 15. Create automation rule: Overspending
  - Create `/lib/automation/rules/overspending.ts`
  - Trigger: Current month expenses > income
  - Severity: warning (orange)
  - Message: "Spending ₹{X} more than income this month. Review budget and cut discretionary expenses."
  - Include income, expenses, and deficit amount
  - Include budget adjustment recommendations
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [ ]* 15.1 Write property test for Overspending rule
  - **Property 20: Overspending Detection**
  - **Validates: Requirements 13.1, 13.2, 13.3**

- [x] 16. Create automation API endpoint
  - Create `/app/api/automation/run/route.ts`
  - Accept POST requests with userId parameter
  - Authenticate request (service role or user's own ID)
  - Check last run time (skip if < 1 hour ago)
  - Call `runAutomation(userId)` from engine
  - Return JSON summary: rulesExecuted, alertsCreated, notificationsCreated
  - Handle errors gracefully (log but don't throw)
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 14.8_

- [ ]* 16.1 Write unit tests for automation API
  - Test successful execution
  - Test rate limiting (< 1 hour)
  - Test error handling
  - **Property 22: Automation Rate Limiting**
  - **Validates: Requirements 14.7, 15.4**

- [x] 17. Create AlertsPanel component
  - Create `/components/alerts/AlertsPanel.tsx`
  - Fetch alerts and notifications using hooks
  - Group by severity: critical (red), warning (orange), info (teal)
  - Display title, message, timestamp for each alert
  - Add "Mark as Read" button per alert
  - Add filter dropdown: All, Critical, Warnings, Info
  - Display empty state when no alerts exist
  - Use existing card styling (background #060A14)
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7_

- [ ]* 17.1 Write property tests for AlertsPanel
  - **Property 23: Alert Grouping by Severity**
  - **Property 24: Alert Filtering**
  - **Property 25: Unread Count Calculation**
  - **Validates: Requirements 16.2, 16.5, 17.3**

- [x] 18. Create alerts page
  - Create `/app/(dashboard)/alerts/page.tsx`
  - Display page header with unread count
  - Add "Mark All as Read" button
  - Render AlertsPanel component
  - Match existing dashboard layout and design system
  - Display empty state when no alerts
  - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7_

- [x] 19. Add automation trigger to Overview page
  - Modify `/app/(dashboard)/overview/page.tsx`
  - Add useEffect hook to trigger automation on page load
  - Check localStorage for last run time
  - If > 1 hour, call `/api/automation/run` asynchronously (fire-and-forget)
  - No loading states, no error messages to user
  - Silent background execution
  - Update localStorage with current timestamp
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_

- [x] 20. Checkpoint - Automation Workflows Complete
  - Verify automation runs silently on Overview page load
  - Verify all 7 rules trigger correctly for test scenarios
  - Verify alerts display in AlertsPanel with correct grouping
  - Verify idempotency (no duplicate alerts)
  - Run TypeScript compilation: `npx tsc --noEmit`
  - Ensure all tests pass, ask the user if questions arise

### FEATURE 3: Health Insurance Education Center

- [x] 21. Create Supabase migration for education tables with seed data
  - Create migration file in `/supabase/migrations/`
  - Create `insurance_glossary` table: id, term, definition, example, category, created_at
  - Create `govt_scheme_guidelines` table: id, scheme_name, description, eligibility, coverage, how_to_apply, official_link, created_at
  - Add indexes on category, term, scheme_name
  - Enable RLS policies (public read access)
  - Seed 15 insurance terms: Sum Insured, Co-payment, Room Rent Limit, Sub-limits, Waiting Period, PED, Cashless vs Reimbursement, Network Hospital, CSR, NCB, Portability, Restoration Benefit, Day Care Procedures, Pre-hospitalization, Post-hospitalization
  - Seed 4 government schemes: PM-JAY, CGHS, ESI, state-specific scheme
  - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 18.7, 18.8, 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7, 19.8_

- [ ]* 21.1 Write property tests for education database
  - **Property 26: Glossary Completeness**
  - **Property 27: Government Scheme Link Completeness**
  - **Validates: Requirements 18.8, 19.7**

- [x] 22. Create insurance education API with Claude AI
  - Create `/app/api/insurance-education/route.ts`
  - Accept POST requests with question parameter
  - Implement rate limiting: 10 requests/hour/user (use in-memory cache or Upstash Redis)
  - Fetch glossary and govt schemes as context
  - Build prompt with context + user question
  - Call Claude API (claude-sonnet-4-20250514)
  - Append IRDAI disclaimer: "⚠️ This is educational information only. For policy-specific advice, consult a licensed insurance advisor or IRDAI."
  - Return answer in simple, educational language
  - No specific policy recommendations
  - Handle errors gracefully (timeout after 30 seconds)
  - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6, 20.7, 20.8, 20.9_

- [ ]* 22.1 Write property tests for education API
  - **Property 28: IRDAI Disclaimer Inclusion**
  - **Property 29: AI Rate Limiting**
  - **Property 30: AI Error Handling**
  - **Validates: Requirements 20.5, 20.6, 20.9**

- [x] 23. Create education center page with tab navigation
  - Create `/app/(dashboard)/education/page.tsx`
  - Display page header: "Health Insurance Education Center" (Playfair Display)
  - Create tab navigation: Basics | Claims Guide | Govt Schemes | Glossary | Ask AI
  - Set up tab state management
  - Premium dark design (#060A14 background, dot grid overlay)
  - Teal accent color (#5BE6C4) for highlights
  - Match existing dashboard layout
  - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5, 21.6, 21.7_

- [x] 24. Create Basics Tab component
  - Create `/components/education/BasicsTab.tsx`
  - Content sections: What is health insurance, Why you need it, Types of policies, How premiums work, What is covered, What is NOT covered
  - Use accordion or card-based layout
  - Visual examples and analogies
  - Teal highlights for key concepts
  - Avoid jargon or define terms inline
  - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5, 22.6_

- [x] 25. Create Claims Guide Tab component
  - Create `/components/education/ClaimsGuideTab.tsx`
  - Step-by-step guide for cashless claims
  - Step-by-step guide for reimbursement claims
  - Required documents checklist
  - Common rejection reasons and how to avoid them
  - Timeline expectations for claim processing
  - Numbered steps with visual indicators
  - _Requirements: 23.1, 23.2, 23.3, 23.4, 23.5, 23.6_

- [x] 26. Create Government Schemes Tab component
  - Create `/components/education/GovtSchemesTab.tsx`
  - Fetch from govt_scheme_guidelines table
  - Display as cards: scheme name, description, eligibility, coverage, how to apply
  - Clickable links to official government websites
  - Card-based layout for easy scanning
  - Highlight eligibility criteria prominently
  - _Requirements: 24.1, 24.2, 24.3, 24.4, 24.5, 24.6_

- [ ]* 26.1 Write property test for Government Schemes Tab
  - **Property 31: Government Schemes Display Completeness**
  - **Validates: Requirements 24.1, 24.2, 24.3**

- [x] 27. Create Glossary Tab component
  - Create `/components/education/GlossaryTab.tsx`
  - Fetch from insurance_glossary table
  - Search input with real-time filtering
  - Group by category (Basics, Coverage, Claims, Financial)
  - Alphabetical sorting within categories
  - Display term, definition, example
  - Highlight search matches
  - _Requirements: 25.1, 25.2, 25.3, 25.4, 25.5, 25.6_

- [ ]* 27.1 Write property tests for Glossary Tab
  - **Property 32: Glossary Display Completeness**
  - **Property 33: Glossary Search Filtering**
  - **Property 34: Glossary Alphabetical Sorting**
  - **Validates: Requirements 25.1, 25.2, 25.3, 25.4, 25.5**

- [x] 28. Create Ask AI Tab component
  - Create `/components/education/AskAITab.tsx`
  - Text input for questions with "Ask" button
  - Display conversation history (session only, not persisted)
  - Loading state while waiting for AI response
  - Display IRDAI disclaimer with every response
  - Rate limit message when limit reached
  - Example questions to get started
  - Teal accent for AI responses
  - _Requirements: 26.1, 26.2, 26.3, 26.4, 26.5, 26.6, 26.7, 26.8_

- [x] 29. Update Sidebar navigation with Education Center link
  - Modify `/components/layout/Sidebar.tsx`
  - Add "Education Center" link under TOOLS group
  - Icon: 📚 emoji
  - Route: /education
  - Highlight when active
  - Follow existing sidebar styling
  - Visible to all users (not NRI-specific)
  - _Requirements: 27.1, 27.2, 27.3, 27.4, 27.5_

- [x] 30. Checkpoint - Education Center Complete
  - Verify all 5 tabs render correctly
  - Verify glossary search and filtering works
  - Verify AI Q&A returns answers with IRDAI disclaimer
  - Verify government schemes display with official links
  - Run TypeScript compilation: `npx tsc --noEmit`
  - Ensure all tests pass, ask the user if questions arise

### FINAL INTEGRATION AND TESTING

- [x] 31. Run TypeScript compilation check
  - Execute: `npx tsc --noEmit`
  - Fix any type errors
  - Ensure zero compilation errors
  - _Requirements: 28.5_

- [x] 32. Verify backward compatibility
  - Test existing features: Overview page, Financial Health Score, Goals, Loans, Insurance
  - Verify no Zustand store modifications
  - Verify no breaking changes to existing API routes
  - Verify no modifications to existing component props without backward compatibility
  - Verify existing design system colors and typography maintained
  - _Requirements: 28.1, 28.2, 28.3, 28.4, 28.6, 28.7, 28.8_

- [ ]* 33. Run all property-based tests
  - Execute all 35 property tests with 100 iterations each
  - Verify all properties pass
  - Fix any failing properties
  - Generate coverage report

- [ ]* 34. Run integration tests
  - Test Emergency Fund Card on Overview page
  - Test automation trigger and alerts display
  - Test Education Center navigation and all tabs
  - Test AI Q&A end-to-end flow
  - Test database queries and RLS policies

- [x] 35. Final checkpoint - All features complete
  - Verify all 3 features working together
  - Verify no breaking changes to existing functionality
  - Verify TypeScript compilation passes
  - Verify all tests pass
  - Review code for security issues
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at feature boundaries
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- All features are purely additive with zero breaking changes
- TypeScript strict mode compliance required throughout
- Follow existing code patterns and conventions
