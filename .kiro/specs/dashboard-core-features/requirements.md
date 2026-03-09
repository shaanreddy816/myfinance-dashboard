# Requirements Document: Dashboard Core Features

## Introduction

This document specifies the requirements for Phase 1 core features of the FamLedgerAI dashboard. The system enables NRI (Non-Resident Indian) and Indian Citizen users to manage their financial data including income, expenses, investments, financial goals, and family member profiles. The dashboard provides comprehensive financial visibility with real-time data updates, visualizations, and goal tracking capabilities.

## Glossary

- **Dashboard_System**: The complete FamLedgerAI dashboard application including all pages, components, and data management
- **Database_Layer**: Supabase PostgreSQL database with Row Level Security (RLS) policies
- **Income_Module**: System component managing income transactions and recurring income tracking
- **Expense_Module**: System component managing expense transactions with categories, tags, and payment methods
- **Investment_Module**: System component managing investment portfolio tracking and return calculations
- **Goal_Module**: System component managing financial goal tracking with progress monitoring
- **Family_Module**: System component managing family member profiles and relationships
- **Navigation_System**: Sidebar and top navigation components for page routing
- **Data_Hook**: React custom hook for data fetching and mutations with Supabase
- **Toast_System**: Notification system for user feedback on actions
- **Modal_System**: Overlay dialog system for forms and confirmations
- **User**: Authenticated user with user_profiles record (NRI or Indian Citizen type)
- **RLS_Policy**: Row Level Security policy ensuring users only access their own data
- **Currency_Formatter**: Utility function formatting amounts in Indian currency format
- **Summary_Card**: Reusable component displaying key metrics with icon and value
- **Empty_State**: Component displayed when no data exists for a section

## Requirements

### Requirement 1: Database Schema for Income Tracking

**User Story:** As a user, I want to store and track my income transactions, so that I can monitor my earnings over time and identify recurring income sources.

#### Acceptance Criteria

1. THE Database_Layer SHALL create an income table with columns: id, user_id, amount, currency, source, description, date, is_recurring, recurring_frequency, created_at, updated_at
2. THE Database_Layer SHALL enforce a foreign key constraint from income.user_id to user_profiles.id with CASCADE delete
3. THE Database_Layer SHALL create an RLS policy that enables users to SELECT only their own income records WHERE user_id equals auth.uid()
4. THE Database_Layer SHALL create an RLS policy that enables users to INSERT income records WHERE user_id equals auth.uid()
5. THE Database_Layer SHALL create an RLS policy that enables users to UPDATE only their own income records WHERE user_id equals auth.uid()
6. THE Database_Layer SHALL create an RLS policy that enables users to DELETE only their own income records WHERE user_id equals auth.uid()
7. THE Database_Layer SHALL set amount column as numeric type with precision for currency values
8. THE Database_Layer SHALL set currency column with default value 'INR'
9. THE Database_Layer SHALL create an index on user_id and date columns for query performance

### Requirement 2: Database Schema for Expense Tracking

**User Story:** As a user, I want to categorize and tag my expenses, so that I can analyze spending patterns and control my budget.

#### Acceptance Criteria

1. THE Database_Layer SHALL create an expenses table with columns: id, user_id, amount, currency, category, description, payment_method, tags, date, created_at, updated_at
2. THE Database_Layer SHALL enforce a foreign key constraint from expenses.user_id to user_profiles.id with CASCADE delete
3. THE Database_Layer SHALL create RLS policies for SELECT, INSERT, UPDATE, DELETE that restrict access WHERE user_id equals auth.uid()
4. THE Database_Layer SHALL set category column as text type with valid values: food, transport, utilities, healthcare, education, entertainment, shopping, rent, insurance, other
5. THE Database_Layer SHALL set payment_method column as text type with valid values: cash, credit_card, debit_card, upi, net_banking, wallet
6. THE Database_Layer SHALL set tags column as text array type for multiple tag support
7. THE Database_Layer SHALL create an index on user_id, date, and category columns for query performance

### Requirement 3: Database Schema for Investment Portfolio

**User Story:** As a user, I want to track my investment portfolio across different asset types, so that I can monitor returns and make informed investment decisions.

#### Acceptance Criteria

1. THE Database_Layer SHALL create an investments table with columns: id, user_id, type, name, invested_amount, current_value, units, purchase_date, currency, notes, created_at, updated_at
2. THE Database_Layer SHALL enforce a foreign key constraint from investments.user_id to user_profiles.id with CASCADE delete
3. THE Database_Layer SHALL create RLS policies for SELECT, INSERT, UPDATE, DELETE that restrict access WHERE user_id equals auth.uid()
4. THE Database_Layer SHALL set type column as text type with valid values: mutual_funds, stocks, ppf, epf, nps, fd, real_estate, gold, nre_account, nro_account
5. THE Database_Layer SHALL set invested_amount and current_value columns as numeric type with precision for currency values
6. THE Database_Layer SHALL create an index on user_id and type columns for query performance

### Requirement 4: Database Schema for Financial Goals

**User Story:** As a user, I want to set and track financial goals with target amounts and deadlines, so that I can work towards specific financial objectives.

#### Acceptance Criteria

1. THE Database_Layer SHALL create a goals table with columns: id, user_id, category, title, description, target_amount, current_amount, target_date, priority, currency, status, created_at, updated_at
2. THE Database_Layer SHALL enforce a foreign key constraint from goals.user_id to user_profiles.id with CASCADE delete
3. THE Database_Layer SHALL create RLS policies for SELECT, INSERT, UPDATE, DELETE that restrict access WHERE user_id equals auth.uid()
4. THE Database_Layer SHALL set category column as text type with valid values: emergency_fund, retirement, home, education, return_india, vacation, wedding, vehicle, business, other
5. THE Database_Layer SHALL set priority column as text type with valid values: high, medium, low
6. THE Database_Layer SHALL set status column as text type with valid values: active, completed, paused with default value 'active'
7. THE Database_Layer SHALL create an index on user_id and status columns for query performance

### Requirement 5: Database Schema for Family Members

**User Story:** As a user, I want to maintain profiles for my family members, so that I can plan finances for my entire family unit.

#### Acceptance Criteria

1. THE Database_Layer SHALL create a family_members table with columns: id, user_id, name, relation, date_of_birth, is_dependent, created_at, updated_at
2. THE Database_Layer SHALL enforce a foreign key constraint from family_members.user_id to user_profiles.id with CASCADE delete
3. THE Database_Layer SHALL create RLS policies for SELECT, INSERT, UPDATE, DELETE that restrict access WHERE user_id equals auth.uid()
4. THE Database_Layer SHALL set relation column as text type with valid values: self, spouse, child, parent, sibling, grandparent, other
5. THE Database_Layer SHALL set is_dependent column as boolean type with default value false
6. THE Database_Layer SHALL create an index on user_id column for query performance

### Requirement 6: Navigation System Layout

**User Story:** As a user, I want a consistent navigation system across all dashboard pages, so that I can easily access different sections of the application.

#### Acceptance Criteria

1. THE Navigation_System SHALL render a fixed sidebar with width 220px on desktop viewports (min-width 768px)
2. THE Navigation_System SHALL render a bottom navigation bar on mobile viewports (max-width 767px)
3. THE Navigation_System SHALL display navigation sections: Overview, Money (Income, Expenses, Investments), Planning (Goals, Family), Tools
4. THE Navigation_System SHALL highlight the active page link with saffron color (#FF9933)
5. THE Navigation_System SHALL display user profile section at sidebar bottom with avatar, name, and user_type badge
6. THE Navigation_System SHALL render a top navigation bar with page title and quick action buttons
7. WHEN a navigation link is clicked, THE Navigation_System SHALL navigate to the corresponding page route

### Requirement 7: Dashboard Overview Page

**User Story:** As a user, I want to see a summary of my financial status on the dashboard, so that I can quickly understand my current financial position.

#### Acceptance Criteria

1. THE Dashboard_System SHALL display 4 summary cards showing: Total Income (current month), Total Expenses (current month), Total Investments, Goals Progress percentage
2. WHEN the user has no data, THE Dashboard_System SHALL display empty state components with call-to-action buttons
3. THE Dashboard_System SHALL fetch and display the last 5 combined income and expense transactions sorted by date descending
4. THE Dashboard_System SHALL display a snapshot of 4 active goals with progress bars showing current_amount divided by target_amount
5. THE Dashboard_System SHALL render a bar chart comparing income versus expenses for the last 6 months
6. WHILE data is loading, THE Dashboard_System SHALL display skeleton loaders for all sections
7. IF data fetching fails, THEN THE Dashboard_System SHALL display an error message with retry button

### Requirement 8: Income Management Page

**User Story:** As a user, I want to add, view, edit, and delete income transactions, so that I can maintain accurate records of my earnings.

#### Acceptance Criteria

1. THE Income_Module SHALL display summary cards showing: This Month total, Last Month total, Recurring Income total
2. THE Income_Module SHALL render a paginated table of income transactions with columns: date, source, amount, description, recurring status
3. WHEN the Add Income button is clicked, THE Income_Module SHALL display a modal with form fields: amount, source, description, date, is_recurring toggle, recurring_frequency, currency
4. WHEN the income form is submitted with valid data, THE Income_Module SHALL insert the record into the income table and display a success toast
5. WHEN an edit icon is clicked, THE Income_Module SHALL populate the modal form with existing income data for modification
6. WHEN a delete icon is clicked, THE Income_Module SHALL display a confirmation dialog before deleting the record
7. WHEN an income record is added, updated, or deleted, THE Income_Module SHALL refresh the income list and summary cards
8. IF form validation fails, THEN THE Income_Module SHALL display field-specific error messages
9. THE Income_Module SHALL prevent double-submit by disabling the submit button after first click

### Requirement 9: Expense Management Page

**User Story:** As a user, I want to categorize my expenses and analyze spending patterns, so that I can control my budget effectively.

#### Acceptance Criteria

1. THE Expense_Module SHALL display summary cards showing: This Month total, Biggest Category name and amount, Daily Average
2. THE Expense_Module SHALL render a donut chart showing expense breakdown by category with percentages
3. THE Expense_Module SHALL render a paginated table of expenses with columns: date, category icon, description, payment method, tags, amount
4. WHEN the Add Expense button is clicked, THE Expense_Module SHALL display a modal with form fields: amount, category select, description, payment_method select, tags input, date, currency
5. WHEN the expense form is submitted with valid data, THE Expense_Module SHALL insert the record into the expenses table and display a success toast
6. WHEN an edit icon is clicked, THE Expense_Module SHALL populate the modal form with existing expense data for modification
7. WHEN a delete icon is clicked, THE Expense_Module SHALL display a confirmation dialog before deleting the record
8. WHEN an expense record is added, updated, or deleted, THE Expense_Module SHALL refresh the expense list, summary cards, and category chart
9. THE Expense_Module SHALL calculate Biggest Category by summing expenses per category for current month
10. THE Expense_Module SHALL calculate Daily Average by dividing current month total by number of days elapsed

### Requirement 10: Investment Portfolio Page

**User Story:** As a user, I want to track my investment portfolio and monitor returns, so that I can evaluate investment performance.

#### Acceptance Criteria

1. THE Investment_Module SHALL display summary cards showing: Total Invested sum, Current Value sum, Total Returns amount and percentage
2. THE Investment_Module SHALL calculate Total Returns as (Current Value minus Total Invested) and percentage as (Returns divided by Total Invested times 100)
3. THE Investment_Module SHALL render a breakdown visualization showing portfolio distribution by investment type
4. THE Investment_Module SHALL render a table of investments with columns: type icon, name, invested amount, current value, returns (color-coded), purchase date
5. THE Investment_Module SHALL display returns in green color WHEN positive and coral color WHEN negative
6. WHEN the Add Investment button is clicked, THE Investment_Module SHALL display a modal with form fields: type select, name, invested_amount, current_value, units, purchase_date, currency, notes
7. WHEN the investment form is submitted with valid data, THE Investment_Module SHALL insert the record into the investments table and display a success toast
8. WHEN an edit icon is clicked, THE Investment_Module SHALL populate the modal form with existing investment data for modification
9. WHEN a delete icon is clicked, THE Investment_Module SHALL display a confirmation dialog before deleting the record
10. WHEN an investment record is added, updated, or deleted, THE Investment_Module SHALL refresh the investment list, summary cards, and portfolio breakdown

### Requirement 11: Financial Goals Page

**User Story:** As a user, I want to set financial goals and track progress, so that I can work systematically towards my financial objectives.

#### Acceptance Criteria

1. THE Goal_Module SHALL display summary cards showing: Active Goals count, Total Target sum, Total Saved sum
2. THE Goal_Module SHALL render goals in a 2-column grid layout with cards showing: category icon, title, description, progress bar, target amount, current amount, target date, priority badge
3. THE Goal_Module SHALL display priority badges with colors: high (coral), medium (saffron), low (teal)
4. THE Goal_Module SHALL calculate progress percentage as (current_amount divided by target_amount times 100)
5. WHEN the Add Goal button is clicked, THE Goal_Module SHALL display a modal with form fields: category select, title, description, target_amount, current_amount, target_date, priority select, currency
6. WHEN the goal form is submitted with valid data, THE Goal_Module SHALL insert the record into the goals table and display a success toast
7. WHEN an Add Savings button is clicked on a goal card, THE Goal_Module SHALL display a modal to update current_amount
8. WHEN current_amount reaches or exceeds target_amount, THE Goal_Module SHALL automatically update status to 'completed'
9. WHEN an edit icon is clicked, THE Goal_Module SHALL populate the modal form with existing goal data for modification
10. WHEN a delete icon is clicked, THE Goal_Module SHALL display a confirmation dialog before deleting the record

### Requirement 12: Family Members Page

**User Story:** As a user, I want to manage family member profiles, so that I can plan finances for my entire family.

#### Acceptance Criteria

1. THE Family_Module SHALL render family members in a 3-column grid layout with cards showing: avatar with initials, name, relation badge, age, dependent status
2. THE Family_Module SHALL display relation badges with colors: self (saffron), spouse (coral), child (teal), parent (purple), sibling (blue), other (gray)
3. THE Family_Module SHALL calculate age from date_of_birth as (current year minus birth year)
4. WHEN the Add Member button is clicked, THE Family_Module SHALL display a modal with form fields: name, relation select, date_of_birth, is_dependent toggle
5. WHEN the family member form is submitted with valid data, THE Family_Module SHALL insert the record into the family_members table and display a success toast
6. WHEN an edit icon is clicked, THE Family_Module SHALL populate the modal form with existing member data for modification
7. WHEN a delete icon is clicked, THE Family_Module SHALL display a confirmation dialog before deleting the record
8. WHEN a family member record is added, updated, or deleted, THE Family_Module SHALL refresh the family members grid

### Requirement 13: Toast Notification System

**User Story:** As a user, I want to receive feedback notifications for my actions, so that I know whether operations succeeded or failed.

#### Acceptance Criteria

1. THE Toast_System SHALL display toast notifications with types: success, error, info, warning
2. THE Toast_System SHALL position toasts at top-right corner of the viewport
3. THE Toast_System SHALL display success toasts with green background and checkmark icon
4. THE Toast_System SHALL display error toasts with coral background and error icon
5. THE Toast_System SHALL auto-dismiss toasts after 4 seconds
6. WHEN a user clicks the close button, THE Toast_System SHALL immediately dismiss the toast
7. THE Toast_System SHALL stack multiple toasts vertically with 8px spacing

### Requirement 14: Modal Dialog System

**User Story:** As a user, I want modal dialogs for forms and confirmations, so that I can complete actions without leaving the current page.

#### Acceptance Criteria

1. THE Modal_System SHALL render modals with a semi-transparent overlay covering the viewport
2. THE Modal_System SHALL center modal content vertically and horizontally
3. THE Modal_System SHALL trap focus within the modal while open
4. WHEN the ESC key is pressed, THE Modal_System SHALL close the modal
5. WHEN the overlay is clicked, THE Modal_System SHALL close the modal
6. THE Modal_System SHALL prevent body scroll while modal is open
7. THE Modal_System SHALL render confirmation dialogs with title, message, cancel button, and confirm button

### Requirement 15: Data Hooks for Income

**User Story:** As a developer, I want reusable hooks for income data operations, so that I can maintain consistent data fetching and mutation logic.

#### Acceptance Criteria

1. THE Data_Hook SHALL provide a useIncome hook that returns: income list, loading state, error state, addIncome function, updateIncome function, deleteIncome function, monthlyTotal function
2. WHEN useIncome is called, THE Data_Hook SHALL fetch income records for the authenticated user from the income table
3. WHEN addIncome is called with valid data, THE Data_Hook SHALL insert the record and revalidate the income list
4. WHEN updateIncome is called with id and data, THE Data_Hook SHALL update the record WHERE id matches and user_id equals auth.uid()
5. WHEN deleteIncome is called with id, THE Data_Hook SHALL delete the record WHERE id matches and user_id equals auth.uid()
6. WHEN monthlyTotal is called with year and month, THE Data_Hook SHALL return sum of income amounts for that month
7. IF any operation fails, THEN THE Data_Hook SHALL set error state with descriptive message

### Requirement 16: Data Hooks for Expenses

**User Story:** As a developer, I want reusable hooks for expense data operations, so that I can maintain consistent data fetching and mutation logic.

#### Acceptance Criteria

1. THE Data_Hook SHALL provide a useExpenses hook that returns: expenses list, loading state, error state, addExpense function, updateExpense function, deleteExpense function, categoryBreakdown function
2. WHEN useExpenses is called, THE Data_Hook SHALL fetch expense records for the authenticated user from the expenses table
3. WHEN addExpense is called with valid data, THE Data_Hook SHALL insert the record and revalidate the expenses list
4. WHEN updateExpense is called with id and data, THE Data_Hook SHALL update the record WHERE id matches and user_id equals auth.uid()
5. WHEN deleteExpense is called with id, THE Data_Hook SHALL delete the record WHERE id matches and user_id equals auth.uid()
6. WHEN categoryBreakdown is called, THE Data_Hook SHALL return an array of objects with category name and total amount for current month
7. IF any operation fails, THEN THE Data_Hook SHALL set error state with descriptive message

### Requirement 17: Data Hooks for Investments

**User Story:** As a developer, I want reusable hooks for investment data operations, so that I can maintain consistent data fetching and mutation logic.

#### Acceptance Criteria

1. THE Data_Hook SHALL provide a useInvestments hook that returns: investments list, loading state, error state, addInvestment function, updateInvestment function, deleteInvestment function, portfolioSummary function
2. WHEN useInvestments is called, THE Data_Hook SHALL fetch investment records for the authenticated user from the investments table
3. WHEN addInvestment is called with valid data, THE Data_Hook SHALL insert the record and revalidate the investments list
4. WHEN updateInvestment is called with id and data, THE Data_Hook SHALL update the record WHERE id matches and user_id equals auth.uid()
5. WHEN deleteInvestment is called with id, THE Data_Hook SHALL delete the record WHERE id matches and user_id equals auth.uid()
6. WHEN portfolioSummary is called, THE Data_Hook SHALL return object with totalInvested, currentValue, totalReturns, returnPercentage
7. IF any operation fails, THEN THE Data_Hook SHALL set error state with descriptive message

### Requirement 18: Data Hooks for Goals

**User Story:** As a developer, I want reusable hooks for goal data operations, so that I can maintain consistent data fetching and mutation logic.

#### Acceptance Criteria

1. THE Data_Hook SHALL provide a useGoals hook that returns: goals list, loading state, error state, addGoal function, updateGoal function, deleteGoal function, updateProgress function
2. WHEN useGoals is called, THE Data_Hook SHALL fetch goal records for the authenticated user from the goals table
3. WHEN addGoal is called with valid data, THE Data_Hook SHALL insert the record and revalidate the goals list
4. WHEN updateGoal is called with id and data, THE Data_Hook SHALL update the record WHERE id matches and user_id equals auth.uid()
5. WHEN deleteGoal is called with id, THE Data_Hook SHALL delete the record WHERE id matches and user_id equals auth.uid()
6. WHEN updateProgress is called with id and amount, THE Data_Hook SHALL update current_amount and check if goal is completed
7. IF any operation fails, THEN THE Data_Hook SHALL set error state with descriptive message

### Requirement 19: Data Hooks for Family Members

**User Story:** As a developer, I want reusable hooks for family member data operations, so that I can maintain consistent data fetching and mutation logic.

#### Acceptance Criteria

1. THE Data_Hook SHALL provide a useFamily hook that returns: family members list, loading state, error state, addMember function, updateMember function, deleteMember function
2. WHEN useFamily is called, THE Data_Hook SHALL fetch family member records for the authenticated user from the family_members table
3. WHEN addMember is called with valid data, THE Data_Hook SHALL insert the record and revalidate the family members list
4. WHEN updateMember is called with id and data, THE Data_Hook SHALL update the record WHERE id matches and user_id equals auth.uid()
5. WHEN deleteMember is called with id, THE Data_Hook SHALL delete the record WHERE id matches and user_id equals auth.uid()
6. IF any operation fails, THEN THE Data_Hook SHALL set error state with descriptive message

### Requirement 20: Currency Formatting Utilities

**User Story:** As a developer, I want consistent currency formatting across the application, so that amounts are displayed in Indian currency format.

#### Acceptance Criteria

1. THE Currency_Formatter SHALL provide a formatCurrency function that accepts amount and currency code
2. WHEN formatCurrency is called with INR currency, THE Currency_Formatter SHALL return formatted string with ₹ symbol and Indian number format (₹1,00,000)
3. THE Currency_Formatter SHALL provide a formatCompact function for large amounts
4. WHEN formatCompact is called with amounts between 1,00,000 and 99,99,999, THE Currency_Formatter SHALL return format with L suffix (₹1.5L)
5. WHEN formatCompact is called with amounts 1,00,00,000 and above, THE Currency_Formatter SHALL return format with Cr suffix (₹2.3Cr)
6. THE Currency_Formatter SHALL round decimal values to 2 decimal places for standard format and 1 decimal place for compact format

### Requirement 21: Date Formatting Utilities

**User Story:** As a developer, I want consistent date formatting across the application, so that dates are displayed in readable format.

#### Acceptance Criteria

1. THE Dashboard_System SHALL provide a formatDate function that accepts date string or Date object
2. WHEN formatDate is called with a date, THE Dashboard_System SHALL return formatted string in DD MMM YYYY format (15 Jan 2024)
3. THE Dashboard_System SHALL provide a formatRelativeDate function for recent dates
4. WHEN formatRelativeDate is called with today's date, THE Dashboard_System SHALL return "Today"
5. WHEN formatRelativeDate is called with yesterday's date, THE Dashboard_System SHALL return "Yesterday"
6. WHEN formatRelativeDate is called with dates within last 7 days, THE Dashboard_System SHALL return day name (Monday, Tuesday)
7. WHEN formatRelativeDate is called with older dates, THE Dashboard_System SHALL return DD MMM YYYY format

### Requirement 22: Empty State Components

**User Story:** As a user, I want helpful empty states when I have no data, so that I understand what actions to take next.

#### Acceptance Criteria

1. THE Empty_State SHALL display an icon relevant to the data type (income, expense, investment, goal, family)
2. THE Empty_State SHALL display a title describing the empty state
3. THE Empty_State SHALL display a subtitle with helpful guidance
4. THE Empty_State SHALL display a call-to-action button to add the first record
5. WHEN the call-to-action button is clicked, THE Empty_State SHALL trigger the add modal for that data type

### Requirement 23: Loading States

**User Story:** As a user, I want to see loading indicators while data is being fetched, so that I know the application is working.

#### Acceptance Criteria

1. WHILE data is loading, THE Dashboard_System SHALL display skeleton loaders matching the layout of actual content
2. THE Dashboard_System SHALL display skeleton loaders for summary cards with animated shimmer effect
3. THE Dashboard_System SHALL display skeleton loaders for table rows with appropriate column widths
4. THE Dashboard_System SHALL display skeleton loaders for chart areas with placeholder shapes
5. WHEN data loading completes, THE Dashboard_System SHALL replace skeleton loaders with actual content

### Requirement 24: Error Handling and Retry

**User Story:** As a user, I want clear error messages and retry options when operations fail, so that I can recover from errors.

#### Acceptance Criteria

1. IF a data fetch operation fails, THEN THE Dashboard_System SHALL display an error message with description
2. IF a data fetch operation fails, THEN THE Dashboard_System SHALL display a retry button
3. WHEN the retry button is clicked, THE Dashboard_System SHALL re-attempt the failed operation
4. IF a mutation operation fails, THEN THE Dashboard_System SHALL display an error toast with specific error message
5. THE Dashboard_System SHALL log errors to console for debugging purposes

### Requirement 25: Form Validation

**User Story:** As a user, I want form validation to prevent invalid data entry, so that I maintain data quality.

#### Acceptance Criteria

1. WHEN a required field is empty, THE Dashboard_System SHALL display "This field is required" error message
2. WHEN an amount field contains non-numeric value, THE Dashboard_System SHALL display "Please enter a valid number" error message
3. WHEN an amount field contains negative value, THE Dashboard_System SHALL display "Amount must be positive" error message
4. WHEN a date field contains invalid date, THE Dashboard_System SHALL display "Please enter a valid date" error message
5. WHEN a date field contains future date for historical transactions, THE Dashboard_System SHALL display "Date cannot be in the future" error message
6. THE Dashboard_System SHALL disable form submit button until all validation passes

### Requirement 26: Responsive Design

**User Story:** As a user, I want the dashboard to work well on mobile devices, so that I can manage finances on the go.

#### Acceptance Criteria

1. WHEN viewport width is less than 768px, THE Navigation_System SHALL hide the sidebar and display bottom navigation
2. WHEN viewport width is less than 768px, THE Dashboard_System SHALL display summary cards in single column layout
3. WHEN viewport width is less than 768px, THE Dashboard_System SHALL display goals grid in single column layout
4. WHEN viewport width is less than 768px, THE Dashboard_System SHALL display family members grid in single column layout
5. WHEN viewport width is less than 768px, THE Dashboard_System SHALL make tables horizontally scrollable
6. WHEN viewport width is less than 768px, THE Modal_System SHALL display modals at full width with 16px padding

### Requirement 27: Real-time Data Updates

**User Story:** As a user, I want the dashboard to reflect changes immediately after I perform actions, so that I see up-to-date information.

#### Acceptance Criteria

1. WHEN an income record is added, THE Dashboard_System SHALL refresh income list, dashboard summary cards, and monthly chart
2. WHEN an expense record is added, THE Dashboard_System SHALL refresh expense list, category breakdown, dashboard summary cards, and monthly chart
3. WHEN an investment record is added, THE Dashboard_System SHALL refresh investment list, portfolio breakdown, and dashboard summary cards
4. WHEN a goal record is updated, THE Dashboard_System SHALL refresh goals list and dashboard goals snapshot
5. WHEN a family member is added, THE Dashboard_System SHALL refresh family members grid
6. THE Dashboard_System SHALL update all affected components without requiring page reload

### Requirement 28: Accessibility Compliance

**User Story:** As a user with accessibility needs, I want the dashboard to be keyboard navigable and screen reader friendly, so that I can use the application effectively.

#### Acceptance Criteria

1. THE Dashboard_System SHALL ensure all interactive elements are keyboard accessible with visible focus indicators
2. THE Dashboard_System SHALL provide ARIA labels for icon buttons and interactive elements
3. THE Modal_System SHALL announce modal title to screen readers when opened
4. THE Toast_System SHALL announce toast messages to screen readers using ARIA live regions
5. THE Dashboard_System SHALL maintain logical tab order throughout all pages
6. THE Dashboard_System SHALL provide alt text for all decorative icons using aria-hidden or role="presentation"

### Requirement 29: Performance Optimization

**User Story:** As a user, I want the dashboard to load quickly and respond smoothly, so that I have a good user experience.

#### Acceptance Criteria

1. THE Dashboard_System SHALL implement pagination for lists exceeding 20 records
2. THE Dashboard_System SHALL debounce search and filter inputs by 300ms
3. THE Dashboard_System SHALL lazy load chart libraries only when needed
4. THE Dashboard_System SHALL cache user profile data in session storage
5. THE Dashboard_System SHALL implement optimistic updates for mutations to provide immediate feedback

### Requirement 30: Security and Data Isolation

**User Story:** As a user, I want my financial data to be secure and isolated from other users, so that my privacy is protected.

#### Acceptance Criteria

1. THE Database_Layer SHALL enforce RLS policies on all tables to prevent cross-user data access
2. THE Dashboard_System SHALL verify user authentication before rendering any protected pages
3. THE Dashboard_System SHALL include user_id from auth.uid() in all INSERT operations
4. THE Dashboard_System SHALL filter all SELECT queries by user_id equals auth.uid()
5. THE Dashboard_System SHALL prevent client-side manipulation of user_id in mutations
6. IF authentication token expires, THEN THE Dashboard_System SHALL redirect user to login page
