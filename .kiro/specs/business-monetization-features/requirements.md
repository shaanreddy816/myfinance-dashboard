# Requirements Document: Business Monetization Features

## Introduction

This specification defines 5 business-critical features that transform FamLedgerAI from a technically impressive application into a revenue-generating business. These features focus on user acquisition (zero-entry value tools), user retention (daily engagement hooks), monetization (pricing and credit system), and legal compliance (regulatory disclaimers).

The features are purely additive and must not break existing functionality. All public pages must work without authentication, and the credit system must fairly gate AI features while providing clear upgrade paths.

## Glossary

- **Briefing_Engine**: System component that generates personalized daily financial insights for authenticated users
- **Health_Check_Tool**: Public-facing calculator that provides instant financial health assessment without requiring login
- **Clause_Checker**: Public-facing tool that explains insurance policy clauses using AI without requiring login
- **Credit_System**: Metering system that tracks and limits AI feature usage based on user subscription plan
- **Legal_Disclaimer_Component**: UI component that displays regulatory compliance messages on AI-powered pages
- **Daily_Briefing**: Personalized financial summary generated once per day containing insights, warnings, and opportunities
- **Financial_Health_Score**: Numerical assessment (0-100) of user's financial wellness based on 6 pillars
- **AI_Credit**: Single unit of AI feature usage consumed when user invokes AI-powered analysis
- **Free_Plan**: Subscription tier providing 3 AI credits per month at no cost
- **Pro_Plan**: Subscription tier providing unlimited AI credits for ₹299/month
- **Family_Plan**: Subscription tier providing unlimited AI credits plus multi-user features for ₹499/month
- **Insight**: Single actionable financial observation with type (warning, reminder, opportunity, win, info)
- **Weekly_Score**: Financial health score calculated over 7-day period with trend comparison
- **Public_Page**: Web page accessible without authentication or login
- **RLS**: Row Level Security policy in Supabase database
- **Atomic_Operation**: Database operation that completes entirely or not at all, preventing race conditions

## Requirements

### Requirement 1: Daily Financial Briefing System

**User Story:** As a FamLedgerAI user, I want to receive a personalized daily financial briefing, so that I have a reason to return to the app every day and stay on top of my financial health.

#### Acceptance Criteria

1. WHEN an authenticated user requests their daily briefing, THE Briefing_Engine SHALL generate a personalized briefing containing 5 to 6 Insights
2. THE Briefing_Engine SHALL classify each Insight as exactly one type: warning, reminder, opportunity, win, or info
3. WHEN generating Insights, THE Briefing_Engine SHALL check for EMI payments due within 7 days
4. WHEN generating Insights, THE Briefing_Engine SHALL check for insurance policy renewals due within 30 days
5. WHEN generating Insights, THE Briefing_Engine SHALL identify insurance policies with coverage below recommended levels
6. WHEN generating Insights, THE Briefing_Engine SHALL calculate monthly savings rate and flag if below 20 percent
7. WHEN generating Insights, THE Briefing_Engine SHALL identify opportunities for starting or increasing SIP investments
8. WHEN generating Insights, THE Briefing_Engine SHALL assess emergency fund adequacy against 6-month expense threshold
9. THE Briefing_Engine SHALL calculate a Weekly_Score between 0 and 100 based on current financial data
10. THE Briefing_Engine SHALL compare the current Weekly_Score to the score from 7 days prior
11. WHEN a Daily_Briefing is generated, THE Briefing_Engine SHALL cache the briefing in the daily_briefings table with user_id and current date
12. WHEN a cached Daily_Briefing exists and is less than 2 hours old, THE Briefing_Engine SHALL return the cached briefing without regeneration
13. WHEN a cached Daily_Briefing is 2 hours or older, THE Briefing_Engine SHALL generate a new briefing and update the cache
14. THE daily_briefings table SHALL enforce a unique constraint on the combination of user_id and date
15. THE daily_briefings table SHALL store Insights as JSONB data type
16. THE daily_briefings table SHALL have RLS enabled to restrict access to briefing owner
17. THE API route at /api/briefing SHALL require authentication
18. WHEN the /api/briefing endpoint receives a GET request, THE API SHALL return the cached or newly generated Daily_Briefing
19. THE Daily_Briefing UI component SHALL display a time-appropriate greeting: "Good morning" before 12:00, "Good afternoon" before 18:00, "Good evening" otherwise
20. THE Daily_Briefing UI component SHALL display the Weekly_Score as a prominent number
21. THE Daily_Briefing UI component SHALL display an upward arrow when Weekly_Score increased versus last week
22. THE Daily_Briefing UI component SHALL display a downward arrow when Weekly_Score decreased versus last week
23. THE Daily_Briefing UI component SHALL render each Insight with an icon corresponding to its type
24. THE Daily_Briefing UI component SHALL color-code Insights: red for warning, yellow for reminder, teal for opportunity, green for win, gray for info
25. WHERE an Insight includes an action URL, THE Daily_Briefing UI component SHALL render an action button
26. THE Daily_Briefing UI component SHALL be collapsible to allow users to minimize it
27. THE Daily_Briefing UI component SHALL appear as the first element on the Overview page above all other content

### Requirement 2: Financial Health Quick Check Tool

**User Story:** As a prospective user who has not yet signed up, I want to quickly assess my financial health without creating an account, so that I can see the value of FamLedgerAI before committing to registration.

#### Acceptance Criteria

1. THE Health_Check_Tool SHALL be accessible at the public route /health-check
2. THE Health_Check_Tool SHALL NOT require authentication or login
3. THE Health_Check_Tool SHALL present a 5-step wizard collecting: monthly income, monthly expenses, total loans, total investments, family size
4. THE Health_Check_Tool SHALL present a 6th step with checkboxes for health insurance and term insurance
5. THE Health_Check_Tool SHALL display a progress bar showing completion percentage across all steps
6. THE Health_Check_Tool SHALL perform all calculations client-side without making API calls
7. WHEN calculating Financial_Health_Score, THE Health_Check_Tool SHALL award up to 25 points for savings rate pillar
8. WHEN savings rate is 20 percent or higher, THE Health_Check_Tool SHALL award 25 points for savings rate pillar
9. WHEN savings rate is between 10 and 20 percent, THE Health_Check_Tool SHALL award 15 points for savings rate pillar
10. WHEN savings rate is below 10 percent, THE Health_Check_Tool SHALL award 5 points for savings rate pillar
11. WHEN calculating Financial_Health_Score, THE Health_Check_Tool SHALL award up to 20 points for EMI ratio pillar
12. WHEN EMI ratio is below 20 percent of income, THE Health_Check_Tool SHALL award 20 points for EMI ratio pillar
13. WHEN EMI ratio is between 20 and 40 percent of income, THE Health_Check_Tool SHALL award 12 points for EMI ratio pillar
14. WHEN EMI ratio exceeds 40 percent of income, THE Health_Check_Tool SHALL award 4 points for EMI ratio pillar
15. WHEN calculating Financial_Health_Score, THE Health_Check_Tool SHALL award up to 20 points for emergency fund pillar
16. WHEN emergency fund covers 6 or more months of expenses, THE Health_Check_Tool SHALL award 20 points for emergency fund pillar
17. WHEN emergency fund covers 3 to 6 months of expenses, THE Health_Check_Tool SHALL award 12 points for emergency fund pillar
18. WHEN emergency fund covers less than 3 months of expenses, THE Health_Check_Tool SHALL award 4 points for emergency fund pillar
19. WHEN calculating Financial_Health_Score, THE Health_Check_Tool SHALL award up to 15 points for investments pillar
20. WHEN user has any investments, THE Health_Check_Tool SHALL award 15 points for investments pillar
21. WHEN user has no investments, THE Health_Check_Tool SHALL award 0 points for investments pillar
22. WHEN calculating Financial_Health_Score, THE Health_Check_Tool SHALL award up to 15 points for insurance pillar
23. WHEN user has health insurance, THE Health_Check_Tool SHALL award 10 points toward insurance pillar
24. WHEN user has term insurance, THE Health_Check_Tool SHALL award 5 points toward insurance pillar
25. WHEN calculating Financial_Health_Score, THE Health_Check_Tool SHALL award up to 5 points for income pillar
26. WHEN user has any income, THE Health_Check_Tool SHALL award 5 points for income pillar
27. THE Health_Check_Tool SHALL sum all pillar scores to produce a total Financial_Health_Score between 0 and 100
28. WHEN Financial_Health_Score is 80 or above, THE Health_Check_Tool SHALL assign grade A
29. WHEN Financial_Health_Score is between 65 and 79, THE Health_Check_Tool SHALL assign grade B
30. WHEN Financial_Health_Score is between 50 and 64, THE Health_Check_Tool SHALL assign grade C
31. WHEN Financial_Health_Score is below 50, THE Health_Check_Tool SHALL assign grade D
32. THE Health_Check_Tool SHALL display the Financial_Health_Score as a large prominent number
33. WHEN Financial_Health_Score is 80 or above, THE Health_Check_Tool SHALL display the score in teal color
34. WHEN Financial_Health_Score is between 65 and 79, THE Health_Check_Tool SHALL display the score in white color
35. WHEN Financial_Health_Score is below 65, THE Health_Check_Tool SHALL display the score in orange color
36. THE Health_Check_Tool SHALL display the grade as a badge next to the score
37. THE Health_Check_Tool SHALL display a contextual message based on the score range
38. THE Health_Check_Tool SHALL list identified financial risks in red or orange color
39. THE Health_Check_Tool SHALL list identified financial opportunities in teal color
40. THE Health_Check_Tool SHALL display a call-to-action button labeled "Get Full Analysis — Free →" linking to /register

### Requirement 3: Insurance Clause Checker Tool

**User Story:** As a prospective user confused by insurance policy language, I want to paste a clause and get a simple explanation, so that I understand what I'm buying before I sign up for the full platform.

#### Acceptance Criteria

1. THE Clause_Checker SHALL be accessible at the public route /clause-checker
2. THE Clause_Checker SHALL NOT require authentication or login
3. THE Clause_Checker SHALL provide a textarea for users to paste policy clause text
4. THE Clause_Checker SHALL provide a button labeled "Explain This Clause →"
5. THE Clause_Checker SHALL display 5 example clauses as quick-start buttons
6. WHEN a user clicks an example clause button, THE Clause_Checker SHALL populate the textarea with that example text
7. WHEN a user clicks the explain button, THE Clause_Checker SHALL call the /api/insurance-education/explain endpoint
8. THE /api/insurance-education/explain endpoint SHALL accept POST requests without requiring authentication
9. THE /api/insurance-education/explain endpoint SHALL accept a JSON payload with a question field
10. WHEN the /api/insurance-education/explain endpoint receives a request, THE API SHALL call Claude AI with the clause text
11. THE API SHALL provide Claude AI with the prompt: "Explain this insurance clause in simple language for an Indian consumer: [clause]. Tell me: what it means, real example with numbers, and if it is good or bad for me. Keep it under 150 words. Be direct."
12. THE API SHALL return a JSON response containing an answer field with the AI explanation
13. THE Clause_Checker SHALL display the AI explanation in a teal-bordered box
14. THE Clause_Checker SHALL label the explanation box as "AI EXPLANATION"
15. THE Clause_Checker SHALL display a call-to-action at the bottom: "Want full policy analysis? Sign up free →" linking to /register

### Requirement 4: Pricing Page and Credit System

**User Story:** As a free user who has exhausted my AI credits, I want to understand the paid plans and upgrade easily, so that I can continue using AI features without friction.

#### Acceptance Criteria

1. THE user_profiles table SHALL include an age column
2. THE user_profiles table SHALL include a city column
3. THE user_profiles table SHALL include a profession column
4. THE user_profiles table SHALL include an annual_income_range column
5. THE user_profiles table SHALL include a plan column with default value 'free'
6. THE user_profiles table SHALL include a plan_expires_at column
7. THE user_profiles table SHALL include a trial_started_at column
8. THE user_profiles table SHALL include an ai_credits_used column with default value 0
9. THE user_profiles table SHALL include an ai_credits_limit column with default value 10
10. THE Pricing_Page SHALL be accessible at the public route /pricing
11. THE Pricing_Page SHALL NOT require authentication or login
12. THE Pricing_Page SHALL display 3 subscription plans: Free, Pro, and Family
13. THE Pricing_Page SHALL display the Free plan with price ₹0/forever
14. THE Pricing_Page SHALL display the Pro plan with price ₹299/month
15. THE Pricing_Page SHALL display the Family plan with price ₹499/month
16. THE Pricing_Page SHALL display a "Most Popular" badge on the Pro plan card
17. THE Pricing_Page SHALL list features for the Free plan: 3 AI runs per month and basic features
18. THE Pricing_Page SHALL list features for the Pro plan: unlimited AI runs, all features, and 14-day free trial
19. THE Pricing_Page SHALL list features for the Family plan: Pro features plus 6 members, joint planning, and CA consultation
20. THE Pricing_Page SHALL mark each feature with a checkmark for included or X for not included
21. THE Pricing_Page SHALL display a call-to-action button on each plan card
22. THE Pricing_Page SHALL display a trust note: "Bank-grade security · No insurance commissions · Cancel anytime"
23. THE Pricing_Page SHALL display a legal disclaimer: "FamLedgerAI is not a SEBI-registered advisor or IRDAI-licensed broker"
24. THE Credit_System SHALL provide a checkAICredits function accepting userId parameter
25. WHEN checkAICredits is called, THE Credit_System SHALL return an object containing: allowed boolean, plan string, creditsUsed number, creditsLimit number, and message string
26. WHEN a user has Pro_Plan or Family_Plan, THE checkAICredits function SHALL return allowed as true
27. WHEN a user has Free_Plan and ai_credits_used is less than ai_credits_limit, THE checkAICredits function SHALL return allowed as true
28. WHEN a user has Free_Plan and ai_credits_used equals or exceeds ai_credits_limit, THE checkAICredits function SHALL return allowed as false
29. THE Credit_System SHALL provide a consumeAICredit function accepting userId parameter
30. WHEN consumeAICredit is called, THE Credit_System SHALL increment the ai_credits_used column for that user
31. THE Credit_System SHALL implement a Supabase database function named increment_ai_credits accepting user_id_param
32. THE increment_ai_credits function SHALL perform an Atomic_Operation to increment ai_credits_used
33. THE /api/analyze-insurance-policy route SHALL call checkAICredits before processing the request
34. WHEN checkAICredits returns allowed as false, THE /api/analyze-insurance-policy route SHALL return HTTP status 402
35. WHEN returning status 402, THE API SHALL include a clear message explaining the credit limit and upgrade option
36. THE /api/ped-advisor route SHALL call checkAICredits before processing the request
37. WHEN checkAICredits returns allowed as false, THE /api/ped-advisor route SHALL return HTTP status 402
38. WHEN an AI feature is successfully used, THE API route SHALL call consumeAICredit to decrement available credits
39. WHERE additional AI-powered features exist, THE Credit_System SHALL be integrated to gate access

### Requirement 5: Legal Disclaimer System

**User Story:** As the FamLedgerAI business owner, I want clear legal disclaimers on all AI-powered pages, so that I am protected from regulatory liability and users understand the limitations of the service.

#### Acceptance Criteria

1. THE Legal_Disclaimer_Component SHALL accept a type prop with values: 'general', 'insurance', or 'investment'
2. WHEN type is 'general', THE Legal_Disclaimer_Component SHALL display: "FamLedgerAI provides financial tools for educational and organizational purposes only. We are not SEBI-registered advisors or IRDAI-licensed brokers. Nothing on this platform constitutes financial, investment, or insurance advice."
3. WHEN type is 'insurance', THE Legal_Disclaimer_Component SHALL display: "Insurance analysis shown is for educational purposes only. FamLedgerAI is not an insurance broker, agent, or intermediary. We do not sell policies or earn commissions. Always verify details with your insurer and consult a licensed advisor."
4. WHEN type is 'investment', THE Legal_Disclaimer_Component SHALL display: "Investment insights are for educational purposes only. Past performance does not guarantee future returns. FamLedgerAI is not a SEBI-registered investment advisor. Consult a qualified financial advisor before investing."
5. THE Legal_Disclaimer_Component SHALL render text in small font size
6. THE Legal_Disclaimer_Component SHALL render text with reduced opacity
7. THE Legal_Disclaimer_Component SHALL display a scales of justice icon (⚖️)
8. THE Legal_Disclaimer_Component SHALL have a subtle border
9. THE /insurance page SHALL include a Legal_Disclaimer_Component with type 'insurance' at the bottom of the page
10. THE /education page SHALL include a Legal_Disclaimer_Component with type 'insurance' at the top of the page
11. THE /investments page SHALL include a Legal_Disclaimer_Component with type 'investment' at the bottom of the page
12. THE /overview page SHALL include a Legal_Disclaimer_Component with type 'general' at the very bottom of the page
13. WHERE a page displays AI-generated output, THE page SHALL include an appropriate Legal_Disclaimer_Component
14. THE Legal_Disclaimer_Component SHALL be visible without requiring user interaction

## Non-Functional Requirements

### Requirement 6: System Integration and Compatibility

**User Story:** As a developer maintaining FamLedgerAI, I want these new features to integrate seamlessly with existing functionality, so that the application remains stable and maintainable.

#### Acceptance Criteria

1. WHEN the application is built, THE build process SHALL complete with 0 TypeScript errors
2. THE Daily_Briefing feature SHALL reuse existing automation insights logic
3. THE Health_Check_Tool SHALL reuse existing financial calculation logic
4. THE Clause_Checker SHALL reuse the existing /api/insurance-education endpoint
5. THE Credit_System SHALL gate all existing AI-powered features
6. THE Legal_Disclaimer_Component SHALL be added to all existing pages that display AI output
7. THE new features SHALL NOT modify or break existing feature functionality
8. THE new features SHALL be purely additive to the existing codebase
9. WHEN the Daily_Briefing generation fails, THE failure SHALL NOT block the dashboard from loading
10. THE Daily_Briefing generation SHALL operate as a fire-and-forget background process
11. THE Credit_System database operations SHALL prevent race conditions through Atomic_Operations
12. THE Public_Page routes SHALL function correctly without authentication middleware
13. THE application SHALL maintain existing authentication requirements for protected routes

### Requirement 7: Target User Context

**User Story:** As a product manager, I want AI-generated content to be contextually relevant to our target persona, so that the messaging resonates with our core user base.

#### Acceptance Criteria

1. WHEN generating AI content, THE system SHALL assume the target user is a software engineer or IT professional
2. WHEN generating AI content, THE system SHALL assume the target user is aged 30 to 40 years
3. WHEN generating AI content, THE system SHALL assume the target user is located in Hyderabad, Bangalore, or Pune
4. WHEN generating AI content, THE system SHALL assume the target user has a spouse and 1 child
5. THE system SHALL use this persona context to inform AI prompts and copywriting tone
6. THE system SHALL NOT display persona assumptions directly to users

### Requirement 8: Pricing and Trial Configuration

**User Story:** As a business stakeholder, I want clear pricing tiers and trial mechanics, so that we can convert free users to paid subscribers effectively.

#### Acceptance Criteria

1. THE Free_Plan SHALL cost ₹0 per month with no expiration
2. THE Pro_Plan SHALL cost ₹299 per month
3. THE Family_Plan SHALL cost ₹499 per month
4. WHEN a new user signs up, THE system SHALL automatically start a 14-day Pro_Plan trial
5. THE trial period SHALL NOT require credit card information
6. WHEN the trial period expires, THE system SHALL downgrade the user to Free_Plan
7. THE Free_Plan SHALL provide 3 AI_Credits per month
8. THE Pro_Plan SHALL provide unlimited AI_Credits
9. THE Family_Plan SHALL provide unlimited AI_Credits

## Acceptance Testing Guidance

### Round-Trip Properties

1. FOR ALL valid Daily_Briefing data, serializing to JSONB then deserializing SHALL produce equivalent data
2. FOR ALL Financial_Health_Score calculations, inputting the same financial data SHALL produce the same score

### Invariant Properties

1. THE ai_credits_used value SHALL never exceed ai_credits_limit for Free_Plan users when properly gated
2. THE Financial_Health_Score SHALL always be between 0 and 100 inclusive
3. THE Weekly_Score SHALL always be between 0 and 100 inclusive
4. THE daily_briefings table SHALL never contain duplicate entries for the same user_id and date combination

### Idempotence Properties

1. WHEN checkAICredits is called multiple times with the same userId without intervening consumeAICredit calls, THE function SHALL return identical results
2. WHEN a Daily_Briefing is cached and less than 2 hours old, multiple requests SHALL return the same cached briefing

### Error Conditions

1. WHEN an unauthenticated user attempts to access /api/briefing, THE API SHALL return HTTP status 401
2. WHEN a Free_Plan user exceeds their credit limit, THE API SHALL return HTTP status 402 with upgrade message
3. WHEN the Clause_Checker receives empty input, THE system SHALL display a validation error
4. WHEN the Health_Check_Tool receives invalid numeric input, THE system SHALL display a validation error
5. WHEN the Briefing_Engine cannot access user financial data, THE system SHALL return a graceful error message

## Implementation Notes

This requirements document defines the "what" without prescribing the "how". The design document will specify:

- Database schema details and migration scripts
- API endpoint specifications and request/response formats
- Component architecture and state management
- Caching strategies and performance optimizations
- Error handling patterns and user feedback mechanisms
- Integration points with existing features
- Testing strategies for each requirement

All requirements are testable and follow EARS patterns for clarity and precision.
