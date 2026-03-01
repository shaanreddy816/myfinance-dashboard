# Requirements Document: Enhanced Onboarding - Complete Profile Setup

## Introduction

This document defines requirements for Phase 1 of FamLedger AI's transformation into a comprehensive financial freedom platform. The Enhanced Onboarding feature replaces the basic signup flow with a comprehensive 4-phase wizard that collects detailed financial information including income sources, 20+ expense categories tailored for Indian households, family details, assets, liabilities, and financial goals. This data enables AI-powered budget allocation, expense tracking, goal planning, and personalized recommendations.

## Glossary

- **Onboarding_Wizard**: The multi-step user interface that guides new users through profile setup
- **Financial_Profile**: The complete set of user financial data including income, expenses, assets, and liabilities
- **Expense_Category**: A predefined classification for monthly expenses (e.g., Home EMI, Groceries, School Fees)
- **Progress_Indicator**: Visual component showing completion status across onboarding phases
- **User_Data_Store**: Client-side storage mechanism (localStorage) for persisting onboarding progress
- **Mandatory_Field**: Required input that must be provided to proceed
- **Optional_Field**: Input that can be skipped without blocking progress
- **Smart_Default**: Pre-populated value based on user context (city, income level)
- **Phase**: A logical grouping of related onboarding steps (Basic Info, Income, Expenses, Assets)
- **Validation_Rule**: Constraint that ensures data quality and completeness
- **Dashboard**: The main application interface shown after onboarding completion

## Requirements

### Requirement 1: Multi-Phase Onboarding Wizard

**User Story:** As a new user, I want to complete my financial profile through a guided wizard, so that I can receive personalized financial recommendations.

#### Acceptance Criteria

1. THE Onboarding_Wizard SHALL display exactly 4 phases: Basic Information, Income Sources, Monthly Expenses, and Assets & Liabilities
2. THE Progress_Indicator SHALL display the current phase number and completion percentage
3. WHEN a user completes a phase, THE Onboarding_Wizard SHALL advance to the next phase
4. WHEN a user clicks the back button, THE Onboarding_Wizard SHALL return to the previous phase without data loss
5. THE Onboarding_Wizard SHALL persist progress to User_Data_Store after each phase completion
6. WHEN a user returns to an incomplete onboarding session, THE Onboarding_Wizard SHALL restore the last completed phase
7. THE Onboarding_Wizard SHALL render responsively on mobile devices with screen width >= 320px

### Requirement 2: Basic Information Collection

**User Story:** As a new user, I want to provide my personal and family details, so that the system can tailor recommendations to my household.

#### Acceptance Criteria

1. THE Onboarding_Wizard SHALL collect name, age, gender, marital status, occupation, and city as Mandatory_Fields
2. THE Onboarding_Wizard SHALL collect spouse details (name, age, occupation, income) WHEN marital status is "Married"
3. THE Onboarding_Wizard SHALL allow users to add multiple children with name, age, and school grade
4. THE Onboarding_Wizard SHALL allow users to add dependent parents with name, age, and health status
5. WHEN age is less than 18, THE Onboarding_Wizard SHALL display an error message "Must be 18 or older"
6. WHEN city is selected, THE Onboarding_Wizard SHALL load Smart_Defaults for expense categories based on city tier

### Requirement 3: Financial Goals Definition

**User Story:** As a new user, I want to define my financial goals with timelines, so that the system can help me plan and track progress.

#### Acceptance Criteria

1. THE Onboarding_Wizard SHALL allow users to add at least one financial goal as a Mandatory_Field
2. THE Onboarding_Wizard SHALL categorize goals as Short-term (< 3 years), Medium-term (3-7 years), or Long-term (> 7 years)
3. THE Onboarding_Wizard SHALL collect goal name, target amount, timeline, and priority for each goal
4. THE Onboarding_Wizard SHALL provide predefined goal templates: Home Purchase, Car Purchase, Children Education, Retirement, Emergency Fund, Vacation
5. WHEN target amount is less than 1000, THE Onboarding_Wizard SHALL display an error message "Goal amount must be at least ₹1,000"

### Requirement 4: Income Sources Collection

**User Story:** As a new user, I want to specify all my income sources, so that the system can calculate my total monthly income and recommend budget allocation.

#### Acceptance Criteria

1. THE Onboarding_Wizard SHALL collect primary monthly salary as a Mandatory_Field
2. THE Onboarding_Wizard SHALL collect annual bonus and divide by 12 for monthly calculation
3. THE Onboarding_Wizard SHALL allow users to add additional income sources: Rental Income, Business Income, Freelancing, Investment Returns, Other
4. THE Onboarding_Wizard SHALL collect spouse income WHEN marital status is "Married"
5. THE Onboarding_Wizard SHALL calculate and display total monthly household income
6. WHEN any income value is negative, THE Onboarding_Wizard SHALL display an error message "Income cannot be negative"

### Requirement 5: Housing Expenses Collection

**User Story:** As a new user, I want to specify my housing-related expenses, so that the system can track my largest expense category.

#### Acceptance Criteria

1. THE Onboarding_Wizard SHALL collect either Home EMI or Monthly Rent as a Mandatory_Field
2. THE Onboarding_Wizard SHALL collect Property Tax, Maintenance Charges, and Home Insurance as Optional_Fields
3. THE Onboarding_Wizard SHALL calculate total housing expenses and display as percentage of income
4. WHEN housing expenses exceed 40% of income, THE Onboarding_Wizard SHALL display a warning "Housing costs are high - consider reviewing"
5. THE Onboarding_Wizard SHALL provide Smart_Defaults based on city tier (Tier 1: 35%, Tier 2: 30%, Tier 3: 25% of income)

### Requirement 6: Transportation Expenses Collection

**User Story:** As a new user, I want to specify my transportation expenses, so that the system can track vehicle and commute costs.

#### Acceptance Criteria

1. THE Onboarding_Wizard SHALL collect Car EMI, Petrol/Diesel, Car Insurance, Car Maintenance, and Public Transport as Optional_Fields
2. THE Onboarding_Wizard SHALL allow users to add multiple vehicles with separate EMI and fuel costs
3. THE Onboarding_Wizard SHALL calculate total transportation expenses and display as percentage of income
4. WHEN transportation expenses exceed 20% of income, THE Onboarding_Wizard SHALL display a warning "Transportation costs are high"
5. THE Onboarding_Wizard SHALL provide Smart_Defaults: Car EMI (₹15,000), Petrol (₹5,000), Insurance (₹1,000/month)

### Requirement 7: Insurance Expenses Collection

**User Story:** As a new user, I want to specify my insurance premiums, so that the system can ensure adequate coverage and track protection costs.

#### Acceptance Criteria

1. THE Onboarding_Wizard SHALL collect Health Insurance (family floater), Term Insurance, Car Insurance, and Personal Accident Insurance as Optional_Fields
2. THE Onboarding_Wizard SHALL convert annual premiums to monthly amounts for budget calculation
3. THE Onboarding_Wizard SHALL calculate total insurance expenses and display as percentage of income
4. WHEN health insurance coverage is less than ₹5 lakhs per family member, THE Onboarding_Wizard SHALL display a warning "Consider increasing health coverage"
5. WHEN term insurance coverage is less than 10x annual income, THE Onboarding_Wizard SHALL display a warning "Term insurance coverage may be insufficient"

### Requirement 8: Utilities Expenses Collection

**User Story:** As a new user, I want to specify my utility bills, so that the system can track recurring household expenses.

#### Acceptance Criteria

1. THE Onboarding_Wizard SHALL collect Electricity, Water, Gas/LPG, Internet/Broadband, Mobile Bills, and DTH/OTT Subscriptions as Optional_Fields
2. THE Onboarding_Wizard SHALL calculate total utilities expenses and display as percentage of income
3. THE Onboarding_Wizard SHALL provide Smart_Defaults based on family size: 2 members (₹4,000), 3-4 members (₹6,000), 5+ members (₹8,000)
4. THE Onboarding_Wizard SHALL allow users to add multiple mobile connections and OTT subscriptions
5. WHEN utilities exceed 10% of income, THE Onboarding_Wizard SHALL display a warning "Utility costs are high"

### Requirement 9: Groceries and Food Expenses Collection

**User Story:** As a new user, I want to specify my food-related expenses, so that the system can track one of my largest variable expense categories.

#### Acceptance Criteria

1. THE Onboarding_Wizard SHALL collect Monthly Groceries, Vegetables & Fruits, Restaurant/Dining Out, and Food Delivery as Optional_Fields
2. THE Onboarding_Wizard SHALL calculate total food expenses and display as percentage of income
3. THE Onboarding_Wizard SHALL provide Smart_Defaults based on family size: ₹3,000 per family member for groceries
4. WHEN food expenses exceed 25% of income, THE Onboarding_Wizard SHALL display a warning "Food costs are high - consider meal planning"
5. WHEN restaurant expenses exceed 30% of total food budget, THE Onboarding_Wizard SHALL display a tip "Cooking at home can save money"

### Requirement 10: Children's Expenses Collection

**User Story:** As a parent, I want to specify all child-related expenses, so that the system can track education and activity costs.

#### Acceptance Criteria

1. WHEN children are added in Basic Information, THE Onboarding_Wizard SHALL collect School Fees, Tuition/Coaching, Sports/Extracurricular Fees, School Transport, and Books & Stationery per child
2. THE Onboarding_Wizard SHALL calculate total children expenses and display as percentage of income
3. THE Onboarding_Wizard SHALL provide Smart_Defaults based on school type: Government (₹2,000), Private (₹10,000), International (₹30,000) per month
4. THE Onboarding_Wizard SHALL allow separate expense tracking for each child
5. WHEN children expenses exceed 25% of income, THE Onboarding_Wizard SHALL display a warning "Children's expenses are high"

### Requirement 11: Healthcare Expenses Collection

**User Story:** As a new user, I want to specify my healthcare expenses, so that the system can track medical costs and wellness spending.

#### Acceptance Criteria

1. THE Onboarding_Wizard SHALL collect Regular Medicines, Doctor Consultations, Gym Membership, Health Supplements, and Emergency Medical Fund as Optional_Fields
2. THE Onboarding_Wizard SHALL calculate total healthcare expenses and display as percentage of income
3. THE Onboarding_Wizard SHALL provide Smart_Defaults: Emergency Fund (₹5,000/month), Regular Medicines (₹2,000/month for families with elderly)
4. WHEN emergency medical fund is less than ₹50,000, THE Onboarding_Wizard SHALL display a warning "Build emergency medical fund to ₹50,000+"
5. WHEN healthcare expenses exceed 15% of income, THE Onboarding_Wizard SHALL display a warning "Healthcare costs are high"

### Requirement 12: Lifestyle and Entertainment Expenses Collection

**User Story:** As a new user, I want to specify my lifestyle expenses, so that the system can track discretionary spending.

#### Acceptance Criteria

1. THE Onboarding_Wizard SHALL collect Monthly Outings/Trips, Movies & Entertainment, Shopping, and Hobbies as Optional_Fields
2. THE Onboarding_Wizard SHALL calculate total lifestyle expenses and display as percentage of income
3. THE Onboarding_Wizard SHALL provide Smart_Defaults: 5-10% of income for lifestyle expenses
4. WHEN lifestyle expenses exceed 15% of income, THE Onboarding_Wizard SHALL display a tip "Consider reducing discretionary spending to increase savings"
5. THE Onboarding_Wizard SHALL allow users to set monthly budgets for each lifestyle category

### Requirement 13: Investment and Savings Collection

**User Story:** As a new user, I want to specify my investment commitments, so that the system can track wealth-building activities.

#### Acceptance Criteria

1. THE Onboarding_Wizard SHALL collect SIP (Mutual Funds), PPF/EPF, Stocks, Children's Education Fund, and Retirement Fund as Optional_Fields
2. THE Onboarding_Wizard SHALL calculate total investments and display as percentage of income
3. WHEN total investments are less than 20% of income, THE Onboarding_Wizard SHALL display a recommendation "Aim to save at least 20% of income"
4. THE Onboarding_Wizard SHALL provide Smart_Defaults based on age: Age < 30 (30% savings), Age 30-45 (25% savings), Age > 45 (20% savings)
5. THE Onboarding_Wizard SHALL distinguish between equity and debt investments for risk assessment

### Requirement 14: Miscellaneous Expenses Collection

**User Story:** As a new user, I want to specify other recurring expenses, so that the system captures my complete spending picture.

#### Acceptance Criteria

1. THE Onboarding_Wizard SHALL collect Domestic Help, Pet Expenses, and Religious/Charity as Optional_Fields
2. THE Onboarding_Wizard SHALL allow users to add custom expense categories with name and monthly amount
3. THE Onboarding_Wizard SHALL calculate total miscellaneous expenses and display as percentage of income
4. THE Onboarding_Wizard SHALL limit miscellaneous expenses to 10 custom categories
5. WHEN miscellaneous expenses exceed 10% of income, THE Onboarding_Wizard SHALL display a warning "Review miscellaneous expenses"

### Requirement 15: Assets Collection

**User Story:** As a new user, I want to specify my assets, so that the system can calculate my net worth and provide investment recommendations.

#### Acceptance Criteria

1. THE Onboarding_Wizard SHALL collect Bank Balance, Fixed Deposits, Mutual Funds, Stocks, Gold, and Real Estate as Optional_Fields
2. THE Onboarding_Wizard SHALL calculate total assets and display net worth
3. THE Onboarding_Wizard SHALL allow users to add multiple properties with current market value
4. THE Onboarding_Wizard SHALL allow users to add multiple investment accounts
5. THE Onboarding_Wizard SHALL categorize assets as Liquid (cash, bank), Semi-Liquid (FD, mutual funds), and Illiquid (real estate, gold)

### Requirement 16: Liabilities Collection

**User Story:** As a new user, I want to specify my debts, so that the system can calculate my net worth and provide debt management recommendations.

#### Acceptance Criteria

1. THE Onboarding_Wizard SHALL collect Home Loan, Car Loan, Personal Loan, and Credit Card Debt as Optional_Fields
2. THE Onboarding_Wizard SHALL collect outstanding amount, interest rate, and monthly EMI for each liability
3. THE Onboarding_Wizard SHALL calculate total liabilities and debt-to-income ratio
4. WHEN debt-to-income ratio exceeds 40%, THE Onboarding_Wizard SHALL display a warning "High debt burden - consider debt consolidation"
5. THE Onboarding_Wizard SHALL calculate net worth as total assets minus total liabilities

### Requirement 17: Budget Allocation Validation

**User Story:** As a new user, I want the system to validate my budget allocation, so that I can ensure my expenses don't exceed income.

#### Acceptance Criteria

1. THE Onboarding_Wizard SHALL calculate total monthly expenses across all categories
2. WHEN total expenses exceed total income, THE Onboarding_Wizard SHALL display an error "Expenses exceed income - please review your entries"
3. THE Onboarding_Wizard SHALL display remaining income after all expenses
4. WHEN remaining income is negative, THE Onboarding_Wizard SHALL prevent onboarding completion until corrected
5. THE Onboarding_Wizard SHALL display a budget breakdown chart showing expense distribution by category

### Requirement 18: Data Persistence and Recovery

**User Story:** As a new user, I want my progress to be saved automatically, so that I can complete onboarding across multiple sessions.

#### Acceptance Criteria

1. THE Onboarding_Wizard SHALL save Financial_Profile data to User_Data_Store after each phase completion
2. WHEN a user closes the browser during onboarding, THE User_Data_Store SHALL retain all entered data
3. WHEN a user returns to onboarding, THE Onboarding_Wizard SHALL restore data from User_Data_Store
4. THE Onboarding_Wizard SHALL provide a "Clear and Start Over" option that erases User_Data_Store
5. WHEN onboarding is completed, THE Onboarding_Wizard SHALL transfer data from User_Data_Store to permanent storage

### Requirement 19: Input Validation and Error Handling

**User Story:** As a new user, I want clear validation messages, so that I can correct errors and provide valid data.

#### Acceptance Criteria

1. WHEN a Mandatory_Field is empty, THE Onboarding_Wizard SHALL display an error message "This field is required"
2. WHEN a numeric field contains non-numeric characters, THE Onboarding_Wizard SHALL display an error message "Please enter a valid number"
3. WHEN an email field contains invalid format, THE Onboarding_Wizard SHALL display an error message "Please enter a valid email address"
4. THE Onboarding_Wizard SHALL display validation errors inline below the relevant input field
5. THE Onboarding_Wizard SHALL prevent phase advancement WHEN validation errors exist

### Requirement 20: Onboarding Completion and Transition

**User Story:** As a new user, I want to complete onboarding and access the dashboard, so that I can start using the financial planning features.

#### Acceptance Criteria

1. WHEN all 4 phases are completed, THE Onboarding_Wizard SHALL display a completion summary with total income, expenses, savings rate, and net worth
2. THE Onboarding_Wizard SHALL display a "Complete Setup" button WHEN all Mandatory_Fields are filled
3. WHEN the user clicks "Complete Setup", THE Onboarding_Wizard SHALL navigate to the Dashboard
4. THE Onboarding_Wizard SHALL measure and log completion time for analytics
5. WHEN completion time exceeds 10 minutes, THE Onboarding_Wizard SHALL log a metric for UX improvement analysis

### Requirement 21: Mobile Responsiveness

**User Story:** As a mobile user, I want to complete onboarding on my phone, so that I can set up my profile anywhere.

#### Acceptance Criteria

1. THE Onboarding_Wizard SHALL render all input fields with touch-friendly sizing (minimum 44x44 pixels)
2. THE Onboarding_Wizard SHALL use mobile-optimized input types (number, email, tel) for appropriate fields
3. THE Onboarding_Wizard SHALL stack form fields vertically on screens narrower than 768px
4. THE Onboarding_Wizard SHALL display the Progress_Indicator at the top of the viewport on mobile devices
5. THE Onboarding_Wizard SHALL prevent horizontal scrolling on all screen sizes

### Requirement 22: Skip Optional Fields

**User Story:** As a new user who wants to start quickly, I want to skip optional fields, so that I can complete basic setup and add details later.

#### Acceptance Criteria

1. THE Onboarding_Wizard SHALL display a "Skip for Now" button for all Optional_Fields
2. WHEN a user skips optional fields, THE Onboarding_Wizard SHALL allow phase advancement
3. THE Onboarding_Wizard SHALL display a completion percentage that reflects skipped fields
4. THE Onboarding_Wizard SHALL allow users to return and complete skipped fields from the Dashboard
5. WHEN completion percentage is below 70%, THE Dashboard SHALL display a prompt to complete profile

### Requirement 23: Smart Defaults Based on Context

**User Story:** As a new user, I want the system to suggest reasonable default values, so that I can complete onboarding faster.

#### Acceptance Criteria

1. WHEN city tier is identified, THE Onboarding_Wizard SHALL populate Smart_Defaults for housing costs (Tier 1: 35%, Tier 2: 30%, Tier 3: 25% of income)
2. WHEN family size is determined, THE Onboarding_Wizard SHALL populate Smart_Defaults for groceries (₹3,000 per member)
3. WHEN children are added, THE Onboarding_Wizard SHALL populate Smart_Defaults for school fees based on typical costs
4. WHEN income level is entered, THE Onboarding_Wizard SHALL populate Smart_Defaults for investment allocation (20-30% of income)
5. THE Onboarding_Wizard SHALL allow users to override all Smart_Defaults

### Requirement 24: Expense Category Completeness

**User Story:** As a new user, I want to see all relevant expense categories for Indian households, so that I don't miss any regular expenses.

#### Acceptance Criteria

1. THE Onboarding_Wizard SHALL display at least 20 predefined Expense_Categories covering housing, transportation, insurance, utilities, food, children, healthcare, lifestyle, investments, and miscellaneous
2. THE Onboarding_Wizard SHALL organize Expense_Categories into logical groups with clear headings
3. THE Onboarding_Wizard SHALL display typical percentage ranges for each category group
4. THE Onboarding_Wizard SHALL allow users to add custom categories not covered by predefined options
5. THE Onboarding_Wizard SHALL display a checklist showing which categories have been completed

### Requirement 25: Risk Assessment

**User Story:** As a new user, I want the system to assess my financial risk profile, so that I can receive appropriate investment recommendations.

#### Acceptance Criteria

1. THE Onboarding_Wizard SHALL calculate risk score based on age, income stability, dependents, debt-to-income ratio, and emergency fund adequacy
2. THE Onboarding_Wizard SHALL categorize users as Conservative, Moderate, or Aggressive risk profiles
3. WHEN emergency fund is less than 6 months of expenses, THE Onboarding_Wizard SHALL classify risk as higher
4. WHEN debt-to-income ratio exceeds 40%, THE Onboarding_Wizard SHALL classify risk as higher
5. THE Onboarding_Wizard SHALL display risk assessment results in the completion summary

## Quality Attributes

### Performance
- Onboarding completion time target: < 10 minutes for 80% of users
- Page load time: < 2 seconds on 3G connection
- Form validation: < 100ms response time

### Usability
- Completion rate target: > 80%
- Mobile usability: Touch-friendly, no horizontal scroll
- Clear progress indication at all times

### Data Quality
- All monetary values in Indian Rupees (₹)
- Validation prevents negative values and unrealistic entries
- Smart defaults based on Indian household norms

### Accessibility
- Keyboard navigation support
- Screen reader compatible labels
- High contrast mode support
- Minimum font size: 14px

## Out of Scope

The following are explicitly out of scope for this phase:

- Backend API integration (Phase 1 uses localStorage only)
- Multi-language support (English only for Phase 1)
- Document upload for verification
- Bank account linking
- Automated expense import
- Social login (OAuth)
- Email verification during onboarding
- Real-time currency conversion
- Tax calculation features
- Investment portfolio analysis (covered in future phases)

## Success Metrics

- 80%+ onboarding completion rate
- Average completion time < 10 minutes
- < 5% user drop-off per phase
- 70%+ profile completeness (including optional fields)
- Mobile completion rate > 60% of total completions

## Dependencies

- Existing FamLedger AI codebase (index.html single-page app)
- localStorage API support in browser
- Responsive CSS framework or custom responsive styles
- Form validation library or custom validation logic

## Assumptions

- Users have basic financial literacy to understand expense categories
- Users can estimate monthly expenses reasonably accurately
- Users have access to financial documents (salary slips, loan statements) during onboarding
- Browser localStorage has sufficient capacity (minimum 5MB)
- Users complete onboarding in one or few sessions (not months apart)
