# Implementation Plan: Recurring Expenses & Auto-Carry Forward

## Overview

This implementation plan breaks down the recurring expenses feature into incremental coding tasks. The feature introduces a master expense system that automatically generates monthly expense entries, supporting EMIs, subscriptions, utilities, and groceries. Implementation follows a bottom-up approach: database schema → data models → services → recurring engine → UI components → integration.

## Tasks

- [ ] 1. Set up database schema and migrations
  - [ ] 1.1 Create master_expenses table in Supabase
    - Create table with all required columns (id, family_id, created_by, name, amount, category, description, expense_type, frequency, start_date, end_date, is_emi, emi_type, tenure_months, total_amount, is_subscription, service_name, renewal_date, status, created_at, updated_at, last_modified_by)
    - Add CHECK constraint for amount > 0
    - Add foreign key constraints to families and users tables
    - Create indexes on family_id, status, end_date, and expense_type
    - _Requirements: 1.1, 1.2, 1.4, 1.7, 12.1_
  
  - [ ]* 1.2 Write property test for master_expenses table schema
    - **Property 1: Required Fields Validation**
    - **Property 2: Positive Amount Validation**
    - **Property 4: Family Association**
    - **Validates: Requirements 1.2, 1.5, 1.7**
  
  - [ ] 1.3 Extend expenses table with new columns
    - Add auto_generated BOOLEAN column (default FALSE)
    - Add master_expense_id UUID column with foreign key to master_expenses
    - Add manually_adjusted BOOLEAN column (default FALSE)
    - Add original_amount DECIMAL column
    - Create indexes on master_expense_id, auto_generated, and entry_date
    - _Requirements: 3.6, 9.4, 12.2, 12.6_
  
  - [ ] 1.4 Create recurring_engine_logs table
    - Create table for tracking carry-forward execution history
    - Include columns: id, execution_date, execution_time, status, entries_generated, emis_completed, reminders_sent, errors_encountered, error_details (JSONB), execution_duration_ms, created_at
    - Create indexes on execution_date and status
    - _Requirements: 13.5_

- [ ] 2. Implement data models and validation
  - [ ] 2.1 Create MasterExpense data model class
    - Define JavaScript class with all master expense properties
    - Implement validation methods for required fields (name, amount, category)
    - Implement amount validation (must be > 0)
    - Implement date range validation (end_date > start_date)
    - Add EMI-specific validation (start_date, end_date, monthly amount required)
    - Add EMI tenure calculation method
    - Add EMI total amount calculation method
    - _Requirements: 1.2, 1.5, 1.6, 2.1, 2.2, 2.5_
  
  - [ ]* 2.2 Write property tests for MasterExpense validation
    - **Property 1: Required Fields Validation**
    - **Property 2: Positive Amount Validation**
    - **Property 3: Date Range Validation**
    - **Property 5: EMI Required Fields**
    - **Property 6: EMI Tenure Calculation**
    - **Property 7: EMI Total Amount Validation**
    - **Validates: Requirements 1.2, 1.5, 1.6, 2.1, 2.2, 2.5**
  
  - [ ] 2.3 Create ExpenseEntry data model class
    - Define JavaScript class for expense entries
    - Add properties for auto_generated, master_expense_id, manually_adjusted, original_amount
    - Implement validation for required fields (amount, category, date)
    - Add method to check if entry is auto-generated
    - _Requirements: 3.6, 8.2, 9.4_
  
  - [ ]* 2.4 Write property tests for ExpenseEntry validation
    - **Property 22: Individual Expense Required Fields**
    - **Property 23: Individual Expense Independence**
    - **Validates: Requirements 8.2, 8.4**

- [ ] 3. Implement MasterExpenseService
  - [ ] 3.1 Create MasterExpenseService class with CRUD operations
    - Implement create() method with validation and Supabase insert
    - Implement update() method with family ownership verification
    - Implement getByFamily() method with filtering support
    - Implement getById() method
    - Add audit trail tracking (created_by, last_modified_by, updated_at)
    - _Requirements: 1.1, 1.2, 1.3, 11.1, 11.4, 11.5_
  
  - [ ]* 3.2 Write unit tests for MasterExpenseService CRUD operations
    - Test create with valid data
    - Test create with invalid data (missing fields, negative amount)
    - Test update with valid changes
    - Test family ownership verification
    - Test audit trail fields
    - _Requirements: 1.2, 1.5, 11.4_
  
  - [ ] 3.3 Implement lifecycle management methods
    - Implement pause() method to set status='paused'
    - Implement resume() method to set status='active'
    - Implement cancel() method to set status='cancelled'
    - Add validation to prevent editing completed EMIs
    - _Requirements: 5.1, 5.2, 5.3, 5.5, 5.6_
  
  - [ ]* 3.4 Write property tests for lifecycle management
    - **Property 16: Paused Expense Resumption**
    - **Property 18: Cancelled Expense Termination**
    - **Property 19: Completed EMI Edit Prevention**
    - **Validates: Requirements 5.3, 5.5, 5.6**
  
  - [ ] 3.5 Add EMI-specific methods
    - Implement createEMI() method with tenure calculation
    - Implement getRemainingTenure() method
    - Implement getTotalRemaining() method
    - Add EMI completion detection logic
    - _Requirements: 2.1, 2.2, 2.4, 2.5, 10.3, 10.5_
  
  - [ ]* 3.6 Write property tests for EMI calculations
    - **Property 6: EMI Tenure Calculation**
    - **Property 7: EMI Total Amount Validation**
    - **Property 26: EMI Remaining Tenure Calculation**
    - **Property 27: Total Remaining EMI Amount**
    - **Validates: Requirements 2.2, 2.5, 10.3, 10.5**

- [ ] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement ExpenseEntryService
  - [ ] 5.1 Create ExpenseEntryService class
    - Implement createManual() method for individual expenses
    - Implement createAutoGenerated() method for carry-forward entries
    - Implement editMonthlyInstance() method with manually_adjusted flag
    - Implement getByMonthAndFamily() method with auto-generated filter
    - Add validation for required fields
    - _Requirements: 3.1, 3.4, 8.1, 8.2, 9.3, 9.4_
  
  - [ ]* 5.2 Write property tests for ExpenseEntryService
    - **Property 12: Master Expense Reference Integrity**
    - **Property 13: Entry Date Consistency**
    - **Property 23: Individual Expense Independence**
    - **Property 24: Monthly Instance Edit Isolation**
    - **Validates: Requirements 3.6, 3.7, 8.4, 9.3, 9.4**
  
  - [ ] 5.3 Implement expense querying with filters
    - Add method to query expenses by month and year
    - Add toggle support for showing/hiding auto-generated expenses
    - Implement separate totals calculation for recurring vs individual
    - Add method to join with master_expenses for auto-generated entries
    - _Requirements: 7.4, 7.5, 9.1_
  
  - [ ]* 5.4 Write property tests for expense totals
    - **Property 21: Expense Total Separation**
    - **Property 25: Total Monthly Recurring Obligations**
    - **Validates: Requirements 7.5, 10.2**

- [ ] 6. Implement RecurringExpenseEngine
  - [ ] 6.1 Create RecurringExpenseEngine class with scheduler
    - Implement executeMonthlyCarryForward() main method
    - Implement getActiveMasterExpenses() to query active expenses
    - Add date filtering logic (end_date null or >= current date)
    - Add status filtering (status='active')
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [ ]* 6.2 Write property tests for active expense filtering
    - **Property 8: Active Master Expense Carry Forward**
    - **Property 9: Status-Based Entry Generation**
    - **Property 11: Expired Master Expense Filtering**
    - **Validates: Requirements 3.1, 3.3, 3.5, 5.2**
  
  - [ ] 6.3 Implement monthly entry generation logic
    - Implement generateMonthlyEntry() method
    - Copy amount, category, description from master expense
    - Set entry_date to first day of current month
    - Set auto_generated=true and link master_expense_id
    - Add transaction wrapping for atomicity
    - _Requirements: 3.4, 3.6, 3.7_
  
  - [ ]* 6.4 Write property tests for entry generation
    - **Property 10: Field Copying from Master to Entry**
    - **Property 12: Master Expense Reference Integrity**
    - **Property 13: Entry Date Consistency**
    - **Validates: Requirements 3.4, 3.6, 3.7**
  
  - [ ] 6.5 Implement EMI completion detection
    - Implement checkAndCompleteEMIs() method
    - Query EMIs where end_date < current_date and status='active'
    - Update status to 'completed'
    - Stop generating future entries for completed EMIs
    - _Requirements: 4.1, 4.2, 4.5_
  
  - [ ]* 6.6 Write property tests for EMI completion
    - **Property 14: EMI Completion and Termination**
    - **Property 15: Completed EMI Persistence**
    - **Validates: Requirements 4.1, 4.2, 4.5**
  
  - [ ] 6.7 Implement subscription renewal reminders
    - Implement sendRenewalReminders() method
    - Query subscriptions with renewal_date within 7 days
    - Send notification to family members
    - Handle annual subscription frequency
    - _Requirements: 6.3, 6.5_
  
  - [ ]* 6.8 Write property tests for subscription handling
    - **Property 20: Annual Subscription Frequency**
    - **Validates: Requirements 6.3**
  
  - [ ] 6.9 Implement error handling and retry logic
    - Implement handleCarryForwardError() method
    - Add exponential backoff retry (up to 3 attempts)
    - Log errors to recurring_engine_logs table
    - Handle partial success scenarios
    - Preserve successful entries even if some fail
    - _Requirements: 12.4, 13.5_
  
  - [ ]* 6.10 Write unit tests for error handling
    - Test retry logic with exponential backoff
    - Test partial success scenarios
    - Test error logging
    - Test transaction rollback on failure
    - _Requirements: 12.4, 13.5_

- [ ] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement MasterExpenseManager UI component
  - [ ] 8.1 Create MasterExpenseManager class for UI
    - Implement render() method to display master expense dashboard
    - Group expenses by category (EMI, subscription, utilities, groceries)
    - Display lifecycle states (active, paused, completed, cancelled)
    - Add visual indicators for expense types
    - _Requirements: 7.1, 10.1_
  
  - [ ] 8.2 Implement master expense creation form
    - Create form with fields: name, amount, category, expense_type, start_date, end_date
    - Add EMI-specific fields (emi_type, tenure display)
    - Add subscription-specific fields (service_name, renewal_date, frequency)
    - Implement form validation with error messages
    - Call MasterExpenseService.create() on submit
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 6.1, 6.4_
  
  - [ ] 8.3 Implement master expense editing interface
    - Create edit form pre-populated with existing data
    - Add confirmation message about future entries being affected
    - Prevent editing completed EMIs
    - Call MasterExpenseService.update() on submit
    - _Requirements: 5.1, 5.4, 5.6, 5.7_
  
  - [ ] 8.4 Implement lifecycle control buttons
    - Add pause/resume/cancel buttons for each master expense
    - Implement pause functionality (call MasterExpenseService.pause())
    - Implement resume functionality (call MasterExpenseService.resume())
    - Implement cancel functionality (call MasterExpenseService.cancel())
    - Add confirmation dialogs for destructive actions
    - _Requirements: 5.1, 5.2, 5.3, 5.5_

- [ ] 9. Implement EMITracker UI component
  - [ ] 9.1 Create EMITracker class for EMI visualization
    - Implement render() method to display all active EMIs
    - Show remaining tenure and total remaining amount for each EMI
    - Display timeline view of completion dates
    - Calculate and display total monthly EMI obligations
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [ ] 9.2 Create EMI creation form
    - Add specialized form for EMI creation
    - Calculate and display tenure in months
    - Calculate and display total payment amount
    - Validate EMI-specific fields
    - _Requirements: 2.1, 2.2, 2.4, 2.5_

- [ ] 10. Implement MonthlyExpenseDashboard UI component
  - [ ] 10.1 Create MonthlyExpenseDashboard class
    - Implement render() method for monthly expense view
    - Display all expenses for selected month
    - Add visual indicators for auto-generated entries (icon/badge)
    - Show separate totals for recurring vs individual expenses
    - _Requirements: 7.2, 7.3, 7.5, 7.6_
  
  - [ ] 10.2 Implement toggle for auto-generated expenses
    - Add toggle switch to show/hide auto-generated expenses
    - Update expense list when toggle changes
    - Persist toggle state in localStorage
    - _Requirements: 7.4_
  
  - [ ] 10.3 Implement individual expense creation
    - Create form for manual expense entry
    - Add fields: amount, category, date, notes
    - Call ExpenseEntryService.createManual() on submit
    - _Requirements: 8.1, 8.2, 8.3, 8.5_
  
  - [ ] 10.4 Implement monthly instance editing
    - Add edit button for auto-generated expenses
    - Allow editing amount for specific month
    - Set manually_adjusted flag when edited
    - Preserve master expense definition
    - Display indicator for manually adjusted entries
    - _Requirements: 9.3, 9.4, 9.5_

- [ ] 11. Integrate components into main application
  - [ ] 11.1 Add navigation menu items
    - Add "Master Expenses" menu item in sidebar
    - Add "Monthly Expenses" menu item (if not exists)
    - Add "EMI Tracker" menu item
    - Update navigation routing logic
    - _Requirements: 7.1, 7.2, 10.1_
  
  - [ ] 11.2 Wire MasterExpenseManager to application
    - Initialize MasterExpenseManager component
    - Connect to Supabase client
    - Add event listeners for user actions
    - Implement data refresh after operations
    - _Requirements: 1.1, 11.1, 11.2, 12.1_
  
  - [ ] 11.3 Wire MonthlyExpenseDashboard to application
    - Initialize MonthlyExpenseDashboard component
    - Connect to month picker in sidebar
    - Load expenses when month changes
    - Integrate with existing expense display logic
    - _Requirements: 7.2, 7.3, 8.1_
  
  - [ ] 11.4 Wire EMITracker to application
    - Initialize EMITracker component
    - Load active EMIs on component mount
    - Add refresh logic for EMI updates
    - _Requirements: 10.1, 10.4_
  
  - [ ] 11.5 Set up RecurringExpenseEngine scheduler
    - Add scheduled execution trigger (first day of month)
    - Implement manual trigger button for admin/testing
    - Add engine status display showing last run
    - Log execution results to recurring_engine_logs
    - _Requirements: 3.1, 3.2, 13.5_

- [ ] 12. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Implement multi-user family support
  - [ ] 13.1 Add family-level access control
    - Verify family_id matches user's family for all operations
    - Filter master expenses by family_id
    - Filter expense entries by family_id
    - _Requirements: 1.7, 11.1, 11.2_
  
  - [ ] 13.2 Implement permission checks
    - Add permission check for editing master expenses
    - Add permission check for deleting master expenses
    - Display read-only view for users without edit permissions
    - _Requirements: 11.3_
  
  - [ ] 13.3 Add audit trail display
    - Show created_by user name in master expense details
    - Show last_modified_by user name and timestamp
    - Display modification history
    - _Requirements: 11.4, 11.5_

- [ ] 14. Implement validation and error handling
  - [ ] 14.1 Add client-side validation
    - Validate required fields before submission
    - Validate amount > 0
    - Validate end_date > start_date
    - Validate amount does not exceed maximum limit
    - Display field-level error messages
    - _Requirements: 1.5, 1.6, 13.1, 13.2, 13.3, 13.6_
  
  - [ ] 14.2 Add duplicate detection
    - Check for duplicate master expense names
    - Show warning and request confirmation
    - _Requirements: 13.4_
  
  - [ ] 14.3 Implement database error handling
    - Add try-catch blocks for all Supabase operations
    - Implement retry logic with exponential backoff (up to 3 attempts)
    - Display user-friendly error messages
    - Preserve data locally if sync fails
    - _Requirements: 12.3, 12.4, 12.5_
  
  - [ ]* 14.4 Write property tests for validation
    - **Property 1: Required Fields Validation**
    - **Property 2: Positive Amount Validation**
    - **Property 3: Date Range Validation**
    - **Property 29: Maximum Amount Validation**
    - **Validates: Requirements 1.2, 1.5, 1.6, 13.6**

- [ ] 15. Implement backward compatibility
  - [ ] 15.1 Handle existing expense data
    - Ensure existing expenses display correctly
    - Default auto_generated=false for existing expenses
    - Default master_expense_id=null for existing expenses
    - _Requirements: 14.1, 14.2, 14.4_
  
  - [ ] 15.2 Maintain existing expense entry API
    - Ensure existing expense creation still works
    - Ensure existing expense editing still works
    - Add backward-compatible defaults for new columns
    - _Requirements: 14.5_
  
  - [ ]* 15.3 Write integration tests for backward compatibility
    - Test existing expense display
    - Test existing expense creation
    - Test existing expense editing
    - Test migration of existing data
    - _Requirements: 14.1, 14.2, 14.5_

- [ ] 16. Implement notifications
  - [ ] 16.1 Add EMI completion notifications
    - Send notification when EMI reaches completion
    - Display total amount paid and completion date
    - _Requirements: 4.3, 4.4_
  
  - [ ] 16.2 Add subscription renewal reminders
    - Send reminder 7 days before renewal date
    - Display service name and renewal date
    - _Requirements: 6.5_
  
  - [ ] 16.3 Add carry-forward error notifications
    - Notify user if carry-forward fails
    - Display error details and retry status
    - _Requirements: 13.5_

- [ ] 17. Final checkpoint and integration testing
  - [ ] 17.1 Test complete user flows
    - Test creating master expense → verify carry-forward → verify monthly entry
    - Test creating EMI → verify tenure calculation → verify completion detection
    - Test pausing master expense → verify no entry generated → resume → verify entry generated
    - Test editing master expense → verify past entries unchanged → verify new amount used
    - Test creating individual expense → verify stored correctly → verify separate totals
    - _Requirements: All_
  
  - [ ]* 17.2 Write end-to-end integration tests
    - Test complete EMI lifecycle
    - Test subscription with annual frequency
    - Test pause/resume workflow
    - Test master expense editing workflow
    - Test monthly dashboard with mixed expenses
    - _Requirements: All_
  
  - [ ] 17.3 Final checkpoint - Ensure all tests pass
    - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- All code should be added to the single-page application (index.html)
- Use Supabase JavaScript client for all database operations
- Follow existing code style and patterns in index.html
