# Requirements Document

## Introduction

This document specifies three launch-critical features for FamLedgerAI: Emergency Fund Model, Automation Workflows, and Health Insurance Education Center. These features are purely additive and must not break any existing functionality. The application is already in production with working features.

## Glossary

- **Emergency_Fund**: Liquid savings (FD + savings account) available for unexpected expenses
- **Financial_Health_System**: The existing system that calculates and displays family financial health scores
- **Overview_Page**: The main dashboard page showing financial summary and widgets
- **Automation_Engine**: Background system that monitors financial health and generates alerts
- **Automation_Job**: A scheduled task that runs financial health checks
- **Alert**: A notification about financial health issues requiring user attention
- **Notification**: A system-generated message displayed to the user
- **Education_Center**: Educational resource hub for health insurance knowledge
- **Insurance_Glossary**: Database of health insurance terms and definitions
- **Government_Scheme**: Official government health insurance programs
- **AI_Q&A_System**: Claude-powered question answering system for insurance education
- **Supabase**: The database system used for data storage
- **RLS**: Row Level Security policies in Supabase
- **Next_Action**: Recommended action displayed to user based on financial health analysis
- **Financial_Health_Score**: Numerical score (0-100) representing overall financial health
- **Pillar_4**: The "Wealth Building" pillar of the Financial Health Score
- **EMI_Ratio**: Ratio of monthly EMI payments to monthly income
- **Savings_Rate**: Percentage of income being invested monthly
- **Protection_Score**: Score representing adequacy of insurance coverage
- **SIP**: Systematic Investment Plan - recurring monthly investment
- **IRDAI**: Insurance Regulatory and Development Authority of India
- **Claude_AI**: Anthropic's AI model (claude-sonnet-4-20250514) used for Q&A
- **Fire_and_Forget**: Execution pattern where operation runs asynchronously without blocking UI

## Requirements

### Requirement 1: Emergency Fund Data Structure

**User Story:** As a user, I want my emergency fund data to be tracked in the system, so that I can monitor my financial safety net.

#### Acceptance Criteria

1. THE System SHALL store emergency fund amount in the existing financial data structure
2. THE System SHALL calculate emergency fund status using liquid savings (FD + savings account balance)
3. THE System SHALL determine employment type (salaried or self-employed) from user profile data
4. THE System SHALL NOT create a new Zustand store for emergency fund data
5. THE System SHALL retrieve emergency fund data from Supabase database

### Requirement 2: Emergency Fund Calculation Logic

**User Story:** As a user, I want the system to calculate my emergency fund target, so that I know how much I should save.

#### Acceptance Criteria

1. WHEN the user is a salaried employee, THE Emergency_Fund_Calculator SHALL calculate target as 6 months of monthly expenses
2. WHEN the user is self-employed, THE Emergency_Fund_Calculator SHALL calculate target as 9 months of monthly expenses
3. THE Emergency_Fund_Calculator SHALL calculate months covered by dividing current emergency fund by monthly expenses
4. THE Emergency_Fund_Calculator SHALL determine status color: teal (#5BE6C4) for ≥6 months, orange (#FF9933) for 3-6 months, red (#FF6B6B) for <3 months
5. THE Emergency_Fund_Calculator SHALL calculate progress percentage as (current amount / target amount) × 100

### Requirement 3: Emergency Fund Card Display

**User Story:** As a user, I want to see my emergency fund status on the Overview page, so that I can quickly assess my financial safety net.

#### Acceptance Criteria

1. THE Overview_Page SHALL display an Emergency Fund card after the Loans card and before Retirement/Education widgets
2. THE Emergency_Fund_Card SHALL display current emergency fund amount in INR currency format
3. THE Emergency_Fund_Card SHALL display target emergency fund amount in INR currency format
4. THE Emergency_Fund_Card SHALL display number of months covered with one decimal place
5. THE Emergency_Fund_Card SHALL display a progress bar showing percentage toward target
6. THE Emergency_Fund_Card SHALL display the next recommended action for improving emergency fund
7. THE Emergency_Fund_Card SHALL use color coding: teal for ≥6 months, orange for 3-6 months, red for <3 months
8. THE Emergency_Fund_Card SHALL match the existing design system (background #060A14, Playfair Display for headings, DM Sans for body)

### Requirement 4: Emergency Fund in Next Action Priority

**User Story:** As a user, I want emergency fund recommendations in my next actions, so that I prioritize building my safety net.

#### Acceptance Criteria

1. WHEN emergency fund is less than 3 months of expenses, THE Next_Action_System SHALL prioritize emergency fund as a critical action
2. WHEN emergency fund is between 3-6 months of expenses, THE Next_Action_System SHALL include emergency fund as a medium priority action
3. WHEN emergency fund is 6 months or more, THE Next_Action_System SHALL NOT include emergency fund in priority actions
4. THE Next_Action_System SHALL generate specific savings amount recommendations to reach 6-month target

### Requirement 5: Emergency Fund in Financial Health Score

**User Story:** As a user, I want my emergency fund status to affect my Financial Health Score, so that the score accurately reflects my financial safety.

#### Acceptance Criteria

1. THE Financial_Health_System SHALL update Pillar 4 calculation to include emergency fund status
2. WHEN emergency fund is ≥6 months, THE Financial_Health_System SHALL award maximum points for emergency fund component
3. WHEN emergency fund is 3-6 months, THE Financial_Health_System SHALL award proportional points based on months covered
4. WHEN emergency fund is <3 months, THE Financial_Health_System SHALL award minimal or zero points for emergency fund component
5. THE Financial_Health_System SHALL maintain backward compatibility with existing score calculations

### Requirement 6: Automation Database Tables

**User Story:** As a system administrator, I want database tables for automation tracking, so that the system can store automation job history and notifications.

#### Acceptance Criteria

1. THE System SHALL create an automation_jobs table with columns: id, user_id, rule_name, last_run_at, next_run_at, status, result_summary
2. THE System SHALL create a notifications table with columns: id, user_id, type, title, message, severity, is_read, created_at, metadata
3. THE System SHALL update the alerts table to support automation-generated alerts
4. THE System SHALL enable RLS (Row Level Security) on automation_jobs table
5. THE System SHALL enable RLS (Row Level Security) on notifications table
6. THE System SHALL create appropriate indexes for query performance on user_id and created_at columns

### Requirement 7: Automation Rule - High EMI Ratio

**User Story:** As a user, I want to be alerted when my EMI ratio is too high, so that I can take corrective action.

#### Acceptance Criteria

1. WHEN monthly EMI exceeds 40% of monthly income, THE Automation_Engine SHALL generate an orange alert
2. THE High_EMI_Alert SHALL include current EMI ratio percentage
3. THE High_EMI_Alert SHALL include recommended actions to reduce EMI burden
4. THE High_EMI_Alert SHALL use calm, educational tone without alarming language
5. THE High_EMI_Alert SHALL be idempotent (not create duplicate alerts for same condition)

### Requirement 8: Automation Rule - Low Savings Rate

**User Story:** As a user, I want to be alerted when my savings rate is too low, so that I can improve my wealth building.

#### Acceptance Criteria

1. WHEN monthly investments are less than 10% of monthly income, THE Automation_Engine SHALL generate an orange alert
2. THE Low_Savings_Alert SHALL include current savings rate percentage
3. THE Low_Savings_Alert SHALL include specific SIP amount recommendations to reach 20% savings rate
4. THE Low_Savings_Alert SHALL use encouraging, educational tone
5. THE Low_Savings_Alert SHALL be idempotent (not create duplicate alerts for same condition)

### Requirement 9: Automation Rule - Insurance Renewal

**User Story:** As a user, I want to be reminded when my insurance policies are expiring soon, so that I don't lose coverage.

#### Acceptance Criteria

1. WHEN an active insurance policy expires within 30 days, THE Automation_Engine SHALL generate an orange alert
2. THE Insurance_Renewal_Alert SHALL include policy name and expiry date
3. THE Insurance_Renewal_Alert SHALL include renewal instructions
4. THE Insurance_Renewal_Alert SHALL check all policy types (term, health, vehicle, property)
5. THE Insurance_Renewal_Alert SHALL be idempotent (not create duplicate alerts for same policy)

### Requirement 10: Automation Rule - No Emergency Fund

**User Story:** As a user, I want to be alerted when I have insufficient emergency savings, so that I can build my safety net.

#### Acceptance Criteria

1. WHEN emergency fund covers less than 3 months of expenses, THE Automation_Engine SHALL generate an orange alert
2. THE No_Emergency_Fund_Alert SHALL include current months covered
3. THE No_Emergency_Fund_Alert SHALL include specific monthly savings amount to reach 6-month target
4. THE No_Emergency_Fund_Alert SHALL use educational tone emphasizing importance of emergency fund
5. THE No_Emergency_Fund_Alert SHALL be idempotent (not create duplicate alerts for same condition)

### Requirement 11: Automation Rule - No Health Insurance

**User Story:** As a user, I want to be alerted if I have no health insurance, so that I can protect my family from medical expenses.

#### Acceptance Criteria

1. WHEN user has no active health insurance policy, THE Automation_Engine SHALL generate a red alert
2. THE No_Health_Insurance_Alert SHALL emphasize critical nature of health coverage
3. THE No_Health_Insurance_Alert SHALL include recommended coverage amounts based on family size
4. THE No_Health_Insurance_Alert SHALL use urgent but not alarming tone
5. THE No_Health_Insurance_Alert SHALL be idempotent (not create duplicate alerts for same condition)

### Requirement 12: Automation Rule - Goal Falling Behind

**User Story:** As a user, I want to be alerted when my financial goals have no funding, so that I can start investing toward them.

#### Acceptance Criteria

1. WHEN an active goal has zero monthly SIP amount, THE Automation_Engine SHALL generate an orange alert
2. THE Goal_Falling_Behind_Alert SHALL include goal name and target amount
3. THE Goal_Falling_Behind_Alert SHALL include recommended monthly SIP amount to reach goal on time
4. THE Goal_Falling_Behind_Alert SHALL use motivational, educational tone
5. THE Goal_Falling_Behind_Alert SHALL be idempotent (not create duplicate alerts for same goal)

### Requirement 13: Automation Rule - Overspending

**User Story:** As a user, I want to be alerted when my expenses exceed income, so that I can adjust my spending.

#### Acceptance Criteria

1. WHEN current month expenses exceed current month income, THE Automation_Engine SHALL generate an orange alert
2. THE Overspending_Alert SHALL include current month income and expense amounts
3. THE Overspending_Alert SHALL include deficit amount
4. THE Overspending_Alert SHALL include budget adjustment recommendations
5. THE Overspending_Alert SHALL be idempotent (not create duplicate alerts for same month)

### Requirement 14: Automation API Endpoint

**User Story:** As a developer, I want an API endpoint to trigger automation, so that the system can run financial health checks.

#### Acceptance Criteria

1. THE System SHALL create an API route at /api/automation/run
2. WHEN the API receives a user_id parameter, THE Automation_Engine SHALL run all 7 automation rules for that user
3. THE Automation_Engine SHALL create alerts in the alerts table for triggered rules
4. THE Automation_Engine SHALL create notifications in the notifications table for triggered rules
5. THE Automation_Engine SHALL update the automation_jobs table with execution results
6. THE Automation_Engine SHALL return a JSON summary of rules executed and alerts created
7. THE Automation_Engine SHALL handle errors gracefully and return appropriate HTTP status codes
8. THE Automation_Engine SHALL be idempotent (safe to run multiple times without creating duplicate alerts)

### Requirement 15: Silent Background Automation

**User Story:** As a user, I want automation to run silently in the background, so that my dashboard experience is never interrupted.

#### Acceptance Criteria

1. WHEN the Overview_Page loads, THE System SHALL trigger automation in fire-and-forget pattern
2. THE Automation_Trigger SHALL NOT block UI rendering or user interactions
3. THE Automation_Trigger SHALL NOT display loading states or spinners
4. WHEN automation was run less than 1 hour ago, THE System SHALL NOT trigger another automation run
5. THE Automation_Trigger SHALL execute asynchronously without awaiting results
6. IF automation fails, THE System SHALL log errors but NOT display error messages to user

### Requirement 16: Alerts Panel Component

**User Story:** As a user, I want to view all my financial alerts in one place, so that I can review and act on them.

#### Acceptance Criteria

1. THE System SHALL create an AlertsPanel component
2. THE AlertsPanel SHALL display all alerts grouped by severity (red, orange, teal)
3. THE AlertsPanel SHALL display alert title, message, and creation timestamp
4. THE AlertsPanel SHALL provide a "Mark as Read" button for each alert
5. THE AlertsPanel SHALL provide filter options by alert type
6. THE AlertsPanel SHALL display automation-generated insights prominently
7. THE AlertsPanel SHALL use the existing design system (background #060A14, Playfair Display for headings)

### Requirement 17: Alerts Page

**User Story:** As a user, I want a dedicated alerts page, so that I can manage all my financial notifications.

#### Acceptance Criteria

1. THE System SHALL create an /alerts page route
2. THE Alerts_Page SHALL display the AlertsPanel component
3. THE Alerts_Page SHALL show unread count in page header
4. THE Alerts_Page SHALL allow marking individual alerts as read
5. THE Alerts_Page SHALL allow marking all alerts as read
6. THE Alerts_Page SHALL display empty state when no alerts exist
7. THE Alerts_Page SHALL match the existing dashboard layout and design system

### Requirement 18: Insurance Glossary Database

**User Story:** As a user, I want access to insurance term definitions, so that I can understand insurance concepts.

#### Acceptance Criteria

1. THE System SHALL create an insurance_glossary table with columns: id, term, definition, example, category, created_at
2. THE System SHALL enable RLS on insurance_glossary table
3. THE System SHALL seed the glossary with at least 15 insurance terms
4. THE Glossary SHALL include terms: Sum Insured, Co-payment, Room Rent Limit, Sub-limits, Waiting Period
5. THE Glossary SHALL include terms: Pre-existing Disease (PED), Cashless vs Reimbursement, Network Hospital
6. THE Glossary SHALL include terms: Claim Settlement Ratio (CSR), No Claim Bonus (NCB), Portability
7. THE Glossary SHALL include terms: Restoration Benefit, Day Care Procedures, Pre-hospitalization, Post-hospitalization
8. THE Glossary SHALL include practical examples for each term

### Requirement 19: Government Schemes Database

**User Story:** As a user, I want information about government health insurance schemes, so that I can explore affordable coverage options.

#### Acceptance Criteria

1. THE System SHALL create a govt_scheme_guidelines table with columns: id, scheme_name, description, eligibility, coverage, how_to_apply, official_link, created_at
2. THE System SHALL enable RLS on govt_scheme_guidelines table
3. THE System SHALL seed government schemes: PM-JAY (Ayushman Bharat)
4. THE System SHALL seed government schemes: CGHS (Central Government Health Scheme)
5. THE System SHALL seed government schemes: ESI (Employee State Insurance)
6. THE System SHALL include state-specific schemes where applicable
7. THE System SHALL include official government website links for each scheme
8. THE System SHALL include eligibility criteria in simple language

### Requirement 20: Insurance Education API

**User Story:** As a user, I want to ask insurance questions and get AI-powered answers, so that I can learn about insurance without reading lengthy documents.

#### Acceptance Criteria

1. THE System SHALL create an API route at /api/insurance-education
2. WHEN the API receives a question parameter, THE AI_Q&A_System SHALL use Claude AI (claude-sonnet-4-20250514) to generate an answer
3. THE AI_Q&A_System SHALL use insurance_glossary data as context for answers
4. THE AI_Q&A_System SHALL use govt_scheme_guidelines data as context for answers
5. THE AI_Q&A_System SHALL append IRDAI disclaimer to every response: "⚠️ This is educational information only. For policy-specific advice, consult a licensed insurance advisor or IRDAI."
6. THE AI_Q&A_System SHALL rate limit requests to 10 per hour per user
7. THE AI_Q&A_System SHALL return answers in simple, educational language
8. THE AI_Q&A_System SHALL NOT provide specific policy recommendations
9. THE AI_Q&A_System SHALL handle errors gracefully and return appropriate HTTP status codes

### Requirement 21: Education Center Page Structure

**User Story:** As a user, I want a dedicated education center for insurance, so that I can learn about health insurance in an organized way.

#### Acceptance Criteria

1. THE System SHALL create an /education page route
2. THE Education_Center SHALL display 5 tabs: Basics, Claims Guide, Govt Schemes, Glossary, Ask AI
3. THE Education_Center SHALL use premium dark design (background #060A14, dot grid overlay)
4. THE Education_Center SHALL use Playfair Display font for headings
5. THE Education_Center SHALL use DM Sans font for body text
6. THE Education_Center SHALL use teal accent color (#5BE6C4) for educational content
7. THE Education_Center SHALL match the existing dashboard layout

### Requirement 22: Education Center - Basics Tab

**User Story:** As a user, I want to learn basic insurance concepts, so that I can make informed decisions about coverage.

#### Acceptance Criteria

1. THE Basics_Tab SHALL explain common insurance concepts in simple language
2. THE Basics_Tab SHALL cover topics: What is health insurance, Why you need it, Types of policies
3. THE Basics_Tab SHALL cover topics: How premiums work, What is covered, What is not covered
4. THE Basics_Tab SHALL use visual examples and analogies
5. THE Basics_Tab SHALL avoid insurance jargon or define terms inline
6. THE Basics_Tab SHALL use teal accent color for highlights and callouts

### Requirement 23: Education Center - Claims Guide Tab

**User Story:** As a user, I want step-by-step instructions for filing insurance claims, so that I can successfully claim when needed.

#### Acceptance Criteria

1. THE Claims_Guide_Tab SHALL provide step-by-step guide for cashless claims
2. THE Claims_Guide_Tab SHALL provide step-by-step guide for reimbursement claims
3. THE Claims_Guide_Tab SHALL include required documents checklist
4. THE Claims_Guide_Tab SHALL include common claim rejection reasons and how to avoid them
5. THE Claims_Guide_Tab SHALL include timeline expectations for claim processing
6. THE Claims_Guide_Tab SHALL use numbered steps and visual indicators

### Requirement 24: Education Center - Government Schemes Tab

**User Story:** As a user, I want to explore government health insurance schemes, so that I can find affordable coverage options.

#### Acceptance Criteria

1. THE Govt_Schemes_Tab SHALL display all government schemes from govt_scheme_guidelines table
2. THE Govt_Schemes_Tab SHALL display scheme name, description, and eligibility for each scheme
3. THE Govt_Schemes_Tab SHALL display coverage details and how to apply
4. THE Govt_Schemes_Tab SHALL provide clickable links to official government websites
5. THE Govt_Schemes_Tab SHALL use card-based layout for easy scanning
6. THE Govt_Schemes_Tab SHALL highlight eligibility criteria prominently

### Requirement 25: Education Center - Glossary Tab

**User Story:** As a user, I want to search insurance terms, so that I can quickly understand unfamiliar concepts.

#### Acceptance Criteria

1. THE Glossary_Tab SHALL display all terms from insurance_glossary table
2. THE Glossary_Tab SHALL provide a search input to filter terms by name
3. THE Glossary_Tab SHALL display term name, definition, and example for each entry
4. THE Glossary_Tab SHALL group terms by category
5. THE Glossary_Tab SHALL use alphabetical sorting within categories
6. THE Glossary_Tab SHALL highlight search matches in real-time

### Requirement 26: Education Center - Ask AI Tab

**User Story:** As a user, I want to ask insurance questions to an AI, so that I can get personalized answers to my specific concerns.

#### Acceptance Criteria

1. THE Ask_AI_Tab SHALL provide a chat interface for asking questions
2. THE Ask_AI_Tab SHALL display conversation history within the session
3. THE Ask_AI_Tab SHALL call /api/insurance-education endpoint for answers
4. THE Ask_AI_Tab SHALL display loading state while waiting for AI response
5. THE Ask_AI_Tab SHALL display IRDAI disclaimer with every AI response
6. THE Ask_AI_Tab SHALL display rate limit message when limit is reached
7. THE Ask_AI_Tab SHALL provide example questions to help users get started
8. THE Ask_AI_Tab SHALL use teal accent for AI responses

### Requirement 27: Education Center Navigation

**User Story:** As a user, I want to access the education center from the main navigation, so that I can easily find insurance learning resources.

#### Acceptance Criteria

1. THE Sidebar SHALL add "Education Center" link under TOOLS group
2. THE Education_Center_Link SHALL use 📚 emoji icon
3. THE Education_Center_Link SHALL highlight when /education page is active
4. THE Education_Center_Link SHALL follow existing sidebar styling and behavior
5. THE Education_Center_Link SHALL be visible to all users (not NRI-specific)

### Requirement 28: System Compatibility and Safety

**User Story:** As a developer, I want all new features to be purely additive, so that existing functionality remains intact.

#### Acceptance Criteria

1. THE System SHALL NOT modify existing Zustand stores
2. THE System SHALL NOT break existing API routes
3. THE System SHALL NOT modify existing component props or interfaces without backward compatibility
4. THE System SHALL NOT remove or rename existing database tables or columns
5. THE System SHALL pass TypeScript compilation with zero errors
6. THE System SHALL maintain existing design system colors and typography
7. THE System SHALL follow existing code patterns and conventions
8. THE System SHALL NOT introduce breaking changes to existing features
