# Requirements Document

## Introduction

This document defines requirements for the Recurring Expenses & Auto-Carry Forward feature in FamLedgerAI. The feature enables users to define master expenses (recurring/mandatory) that automatically populate each month, while maintaining the ability to track individual one-time expenses manually. This includes support for EMIs with defined tenures, subscriptions, recurring bills, and the ability to manage the lifecycle of these recurring expenses.

## Glossary

- **Master_Expense**: A recurring or mandatory expense defined once that automatically carries forward to subsequent months
- **Individual_Expense**: A one-time or variable expense that requires manual entry each month
- **EMI**: Equated Monthly Installment - a fixed payment amount for loans with a defined start date, end date, and monthly amount
- **Recurring_Expense_Engine**: The system component responsible for automatically generating monthly expense entries from master expense definitions
- **Expense_Template**: The master definition of a recurring expense including amount, frequency, start date, and optional end date
- **Carry_Forward**: The automatic process of creating a new expense entry for the current month based on a master expense definition
- **Expense_Lifecycle**: The states a master expense can be in: active, paused, completed, or cancelled
- **Tenure**: The duration period for which an EMI or loan payment is active

## Requirements

### Requirement 1: Define Master Expenses

**User Story:** As a user, I want to define master expenses once, so that they automatically appear every month without manual re-entry.

#### Acceptance Criteria

1. THE Expense_Management_System SHALL provide a master expense creation interface
2. WHEN creating a master expense, THE Expense_Management_System SHALL require expense name, amount, and category
3. WHEN creating a master expense, THE Expense_Management_System SHALL accept optional start date, end date, and recurrence frequency
4. THE Expense_Management_System SHALL store master expense definitions separately from monthly expense entries
5. WHEN a master expense is saved, THE Expense_Management_System SHALL validate that the amount is greater than zero
6. WHEN a master expense is saved with an end date, THE Expense_Management_System SHALL validate that the end date is after the start date
7. FOR ALL master expenses, THE Expense_Management_System SHALL associate them with the creating user's family account

### Requirement 2: EMI and Loan Management

**User Story:** As a user, I want to define EMIs with start dates, end dates, and monthly amounts, so that loan payments are tracked accurately throughout their tenure.

#### Acceptance Criteria

1. WHERE an expense is marked as EMI type, THE Expense_Management_System SHALL require start date, end date, and monthly amount
2. WHEN an EMI is defined, THE Recurring_Expense_Engine SHALL calculate the total tenure in months
3. THE Expense_Management_System SHALL support EMI categories including house loan, car loan, personal loan, and education loan
4. WHEN defining an EMI, THE Expense_Management_System SHALL display the calculated total payment amount and tenure duration
5. FOR ALL EMI definitions, THE Expense_Management_System SHALL validate that monthly amount multiplied by tenure equals the expected total within acceptable rounding tolerance

### Requirement 3: Automatic Monthly Carry Forward

**User Story:** As a user, I want master expenses to automatically populate each month, so that I don't have to manually enter recurring expenses.

#### Acceptance Criteria

1. WHEN a new month begins, THE Recurring_Expense_Engine SHALL generate expense entries for all active master expenses
2. THE Recurring_Expense_Engine SHALL create carry forward entries within the first day of each month
3. WHILE a master expense is in active state, THE Recurring_Expense_Engine SHALL continue generating monthly entries
4. WHEN generating a monthly entry, THE Recurring_Expense_Engine SHALL copy the amount, category, and description from the master expense definition
5. IF a master expense has an end date that has passed, THEN THE Recurring_Expense_Engine SHALL skip generating an entry for that expense
6. WHEN a monthly entry is generated, THE Expense_Management_System SHALL mark it with a reference to its source master expense
7. FOR ALL generated monthly entries, THE Expense_Management_System SHALL set the entry date to the first day of the current month

### Requirement 4: Automatic EMI Completion

**User Story:** As a user, I want EMIs to automatically stop carrying forward when they reach their end date, so that completed loans don't continue appearing in my expenses.

#### Acceptance Criteria

1. WHEN the current date exceeds an EMI's end date, THE Recurring_Expense_Engine SHALL mark the EMI as completed
2. WHEN an EMI is marked as completed, THE Recurring_Expense_Engine SHALL stop generating monthly entries for that EMI
3. THE Expense_Management_System SHALL send a notification when an EMI reaches completion
4. WHEN an EMI completes, THE Expense_Management_System SHALL display the total amount paid and the completion date
5. THE Expense_Management_System SHALL maintain completed EMI records in the master expense history

### Requirement 5: Manage Recurring Expense Lifecycle

**User Story:** As a user, I want to pause, resume, edit, or cancel recurring expenses, so that I can adapt to changing financial circumstances.

#### Acceptance Criteria

1. THE Expense_Management_System SHALL provide controls to pause, resume, edit, and cancel master expenses
2. WHEN a master expense is paused, THE Recurring_Expense_Engine SHALL stop generating monthly entries until resumed
3. WHEN a paused master expense is resumed, THE Recurring_Expense_Engine SHALL generate entries starting from the next month
4. WHEN a master expense is edited, THE Expense_Management_System SHALL apply changes to future monthly entries only
5. WHEN a master expense is cancelled, THE Expense_Management_System SHALL mark it as inactive and stop all future carry forwards
6. IF a user attempts to edit a completed EMI, THEN THE Expense_Management_System SHALL prevent the modification and display an informational message
7. WHEN a master expense amount is edited, THE Expense_Management_System SHALL preserve the historical monthly entries with their original amounts

### Requirement 6: Subscription Management

**User Story:** As a user, I want to track subscriptions as recurring expenses, so that I can monitor ongoing service costs.

#### Acceptance Criteria

1. THE Expense_Management_System SHALL support a subscription category for master expenses
2. WHERE an expense is marked as subscription type, THE Expense_Management_System SHALL accept monthly or annual frequency
3. WHEN a subscription has annual frequency, THE Recurring_Expense_Engine SHALL generate an entry once per year on the specified month
4. THE Expense_Management_System SHALL allow users to add subscription service names and renewal dates
5. WHEN a subscription renewal date approaches within 7 days, THE Expense_Management_System SHALL send a reminder notification

### Requirement 7: Distinguish Master and Individual Expenses

**User Story:** As a user, I want clear visual distinction between master recurring expenses and individual one-time expenses, so that I can easily understand my expense structure.

#### Acceptance Criteria

1. THE Expense_Management_System SHALL display master expenses in a dedicated master dashboard section
2. THE Expense_Management_System SHALL display individual expenses in a separate monthly expenses section
3. WHEN viewing monthly expenses, THE Expense_Management_System SHALL visually indicate which entries were auto-generated from master expenses
4. THE Expense_Management_System SHALL provide a toggle to show or hide auto-generated expenses in monthly views
5. WHEN displaying expense summaries, THE Expense_Management_System SHALL separately total master expenses and individual expenses
6. THE Expense_Management_System SHALL use distinct visual indicators such as icons or badges for master-generated entries

### Requirement 8: Manual Individual Expense Entry

**User Story:** As a user, I want to manually enter individual one-time expenses each month, so that I can track variable spending like entertainment and shopping.

#### Acceptance Criteria

1. THE Expense_Management_System SHALL provide a manual expense entry interface for individual expenses
2. WHEN entering an individual expense, THE Expense_Management_System SHALL require amount, category, and date
3. THE Expense_Management_System SHALL support individual expense categories including entertainment, shopping, medical, travel, and miscellaneous
4. WHEN an individual expense is saved, THE Expense_Management_System SHALL store it as a standalone entry without master expense association
5. THE Expense_Management_System SHALL allow users to add optional notes and receipts to individual expenses

### Requirement 9: Grocery Recurring Expense

**User Story:** As a user, I want groceries to appear as a recurring master expense, so that I can budget for this regular monthly cost.

#### Acceptance Criteria

1. THE Expense_Management_System SHALL support groceries as a master expense category
2. WHEN groceries are defined as a master expense, THE Recurring_Expense_Engine SHALL generate a monthly entry
3. THE Expense_Management_System SHALL allow users to edit the grocery amount for specific months without affecting the master definition
4. WHEN a monthly grocery entry is edited, THE Expense_Management_System SHALL mark it as manually adjusted
5. THE Expense_Management_System SHALL display both the master grocery amount and any monthly adjustments in the dashboard

### Requirement 10: Master Expense Reporting

**User Story:** As a user, I want to view reports on my recurring expenses, so that I can understand my fixed monthly obligations.

#### Acceptance Criteria

1. THE Expense_Management_System SHALL provide a master expense summary report showing all active recurring expenses
2. THE Expense_Management_System SHALL calculate and display total monthly recurring expense obligations
3. WHEN viewing master expense reports, THE Expense_Management_System SHALL show remaining tenure for EMIs
4. THE Expense_Management_System SHALL provide a timeline view showing when EMIs and loans will complete
5. THE Expense_Management_System SHALL calculate and display the total remaining amount for all active EMIs
6. WHEN generating reports, THE Expense_Management_System SHALL include both active and paused master expenses with clear status indicators

### Requirement 11: Multi-User Family Support

**User Story:** As a family member, I want recurring expenses to be visible to all family members, so that everyone understands our shared financial obligations.

#### Acceptance Criteria

1. WHEN a master expense is created, THE Expense_Management_System SHALL associate it with the family account
2. THE Expense_Management_System SHALL display all family master expenses to all family members
3. WHERE a user has appropriate permissions, THE Expense_Management_System SHALL allow editing master expenses
4. THE Expense_Management_System SHALL track which family member created or last modified each master expense
5. WHEN a master expense is modified, THE Expense_Management_System SHALL log the change with user identification and timestamp

### Requirement 12: Data Persistence and Synchronization

**User Story:** As a user, I want my recurring expense data to be reliably stored and synchronized, so that I don't lose important financial information.

#### Acceptance Criteria

1. THE Expense_Management_System SHALL persist all master expense definitions in the Supabase database
2. THE Expense_Management_System SHALL persist all generated monthly expense entries in the Supabase database
3. WHEN a master expense is created or modified, THE Expense_Management_System SHALL synchronize the change to the database within 2 seconds
4. IF database synchronization fails, THEN THE Expense_Management_System SHALL retry the operation up to 3 times with exponential backoff
5. WHEN database synchronization fails after all retries, THE Expense_Management_System SHALL display an error message and preserve the data locally for later sync
6. THE Expense_Management_System SHALL maintain referential integrity between master expenses and their generated monthly entries

### Requirement 13: Validation and Error Handling

**User Story:** As a user, I want clear error messages when I enter invalid recurring expense data, so that I can correct mistakes easily.

#### Acceptance Criteria

1. WHEN a user enters an invalid amount, THE Expense_Management_System SHALL display a descriptive error message
2. WHEN a user enters an end date before a start date, THE Expense_Management_System SHALL display a validation error
3. IF required fields are missing, THEN THE Expense_Management_System SHALL highlight the missing fields and prevent submission
4. WHEN a user attempts to create a duplicate master expense, THE Expense_Management_System SHALL warn the user and request confirmation
5. IF the Recurring_Expense_Engine encounters an error during carry forward, THEN THE Expense_Management_System SHALL log the error and notify the user
6. THE Expense_Management_System SHALL validate that expense amounts do not exceed reasonable limits (configurable maximum)

### Requirement 14: Backward Compatibility

**User Story:** As an existing user, I want my current expense data to remain intact when the recurring expense feature is added, so that I don't lose historical information.

#### Acceptance Criteria

1. WHEN the recurring expense feature is deployed, THE Expense_Management_System SHALL preserve all existing expense entries
2. THE Expense_Management_System SHALL treat all existing expenses as individual expenses by default
3. THE Expense_Management_System SHALL provide a migration tool to convert existing recurring expenses to master expenses
4. WHEN viewing historical data, THE Expense_Management_System SHALL display expenses from before the feature deployment without master expense indicators
5. THE Expense_Management_System SHALL maintain the existing expense entry API for backward compatibility

