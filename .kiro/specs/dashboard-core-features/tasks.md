# Implementation Plan: Dashboard Core Features

## Overview

This implementation plan breaks down the FamLedgerAI Phase 1 dashboard core features into actionable coding tasks. The implementation follows a bottom-up approach: database setup → utilities → shared components → data hooks → layout → pages. Each task builds incrementally, ensuring all code is integrated and functional at every checkpoint.

The dashboard provides comprehensive financial management for NRI and Indian Citizen users, including income tracking, expense management, investment portfolio monitoring, financial goal tracking, and family member management. Built with Next.js 15, React 19, TypeScript, Tailwind CSS, and Supabase.

## Tasks

- [x] 1. Database setup and migrations
  - [x] 1.1 Create SQL migration for income table with RLS policies
    - Create migration file in `supabase/migrations/` directory
    - Define income table schema with all columns (id, user_id, amount, currency, source, description, date, is_recurring, recurring_frequency, created_at, updated_at)
    - Add CHECK constraint for amount >= 0
    - Add CHECK constraint for recurring_frequency enum values
    - Create indexes on (user_id, date) and (user_id, is_recurring)
    - Enable RLS on income table
    - Create RLS policies for SELECT, INSERT, UPDATE, DELETE with user_id = auth.uid() checks
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 30.1, 30.3, 30.4_

  - [x] 1.2 Create SQL migration for expenses table with RLS policies
    - Create migration file in `supabase/migrations/` directory
    - Define expenses table schema with all columns (id, user_id, amount, currency, category, description, payment_method, tags, date, created_at, updated_at)
    - Add CHECK constraints for amount >= 0, category enum, payment_method enum
    - Create indexes on (user_id, date), (user_id, category), and (user_id, date, category)
    - Enable RLS on expenses table
    - Create RLS policies for SELECT, INSERT, UPDATE, DELETE with user_id = auth.uid() checks
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 30.1, 30.3, 30.4_


  - [x] 1.3 Create SQL migration for investments table with RLS policies
    - Create migration file in `supabase/migrations/` directory
    - Define investments table schema with all columns (id, user_id, type, name, invested_amount, current_value, units, purchase_date, currency, notes, created_at, updated_at)
    - Add CHECK constraints for invested_amount >= 0, current_value >= 0, type enum
    - Create indexes on (user_id, type) and (user_id, purchase_date)
    - Enable RLS on investments table
    - Create RLS policies for SELECT, INSERT, UPDATE, DELETE with user_id = auth.uid() checks
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 30.1, 30.3, 30.4_

  - [x] 1.4 Create SQL migration for goals table with RLS policies
    - Create migration file in `supabase/migrations/` directory
    - Define goals table schema with all columns (id, user_id, category, title, description, target_amount, current_amount, target_date, priority, currency, status, created_at, updated_at)
    - Add CHECK constraints for target_amount > 0, current_amount >= 0, category enum, priority enum, status enum
    - Set default value 'active' for status column
    - Create indexes on (user_id, status) and (user_id, priority)
    - Enable RLS on goals table
    - Create RLS policies for SELECT, INSERT, UPDATE, DELETE with user_id = auth.uid() checks
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 30.1, 30.3, 30.4_

  - [x] 1.5 Create SQL migration for family_members table with RLS policies
    - Create migration file in `supabase/migrations/` directory
    - Define family_members table schema with all columns (id, user_id, name, relation, date_of_birth, is_dependent, created_at, updated_at)
    - Add CHECK constraint for relation enum
    - Set default value false for is_dependent column
    - Create index on user_id
    - Enable RLS on family_members table
    - Create RLS policies for SELECT, INSERT, UPDATE, DELETE with user_id = auth.uid() checks
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 30.1, 30.3, 30.4_

- [x] 2. Utility functions and validation schemas
  - [x] 2.1 Create currency formatting utilities
    - Create `src/lib/utils/currency.ts` file
    - Implement formatCurrency function with INR support and Indian number grouping
    - Implement formatCompact function with L (Lakh) and Cr (Crore) suffixes
    - Implement parseCurrency function to parse currency strings to numbers
    - Add JSDoc comments for all functions
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6_

  - [ ]* 2.2 Write property test for currency formatting
    - **Property 11: Currency Formatting for INR**
    - **Property 12: Compact Currency Formatting**
    - **Validates: Requirements 20.2, 20.4, 20.5, 20.6**

  - [x] 2.3 Create date formatting utilities
    - Create `src/lib/utils/date.ts` file
    - Implement formatDate function returning DD MMM YYYY format
    - Implement formatRelativeDate function with Today/Yesterday/day name/full date logic
    - Implement getCurrentMonthRange function returning start and end dates
    - Implement getLastMonthRange function returning start and end dates
    - Implement calculateAge function from date of birth
    - Add JSDoc comments for all functions
    - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5, 21.6, 21.7_

  - [ ]* 2.4 Write property test for date formatting
    - **Property 13: Date Formatting**
    - **Property 14: Relative Date Formatting**
    - **Validates: Requirements 21.2, 21.6, 21.7**

  - [x] 2.5 Create form validation schemas with Zod
    - Create `src/lib/utils/validation.ts` file
    - Define incomeSchema with validation for amount, currency, source, date, is_recurring, recurring_frequency
    - Define expenseSchema with validation for amount, currency, category, payment_method, tags, date
    - Define investmentSchema with validation for type, name, invested_amount, current_value, units, purchase_date, currency
    - Define goalSchema with validation for category, title, target_amount, current_amount, target_date, priority, currency
    - Define familyMemberSchema with validation for name, relation, date_of_birth, is_dependent
    - Add custom refinements for date validation (no future dates for historical transactions, future dates for goals)
    - _Requirements: 25.1, 25.2, 25.3, 25.4, 25.5, 25.6_

  - [ ]* 2.6 Write property test for form validation
    - **Property 6: Form Validation Error Display**
    - **Validates: Requirements 8.8, 25.1, 25.2, 25.3, 25.4, 25.5, 25.6**

  - [x] 2.7 Create helper utility functions
    - Create `src/lib/utils/helpers.ts` file
    - Implement getInitials function to generate initials from name
    - Implement getCategoryIcon function returning Lucide icon for expense categories
    - Implement getInvestmentIcon function returning Lucide icon for investment types
    - Implement getGoalIcon function returning Lucide icon for goal categories
    - Implement getRelationColor function returning Tailwind color class for relations
    - Implement getPriorityColor function returning Tailwind color class for priorities
    - Implement calculateProgress function for goal progress percentage
    - Implement truncate function for text truncation
    - Implement debounce function for input debouncing
    - _Requirements: 29.2_


  - [x] 2.8 Create error handling utilities
    - Create `src/lib/utils/errors.ts` file
    - Define AppError, AuthenticationError, ValidationError, NotFoundError, DatabaseError classes
    - Implement mapSupabaseError function to map Supabase errors to application errors
    - Implement ErrorBoundary React component for error boundaries
    - _Requirements: 24.1, 24.2, 24.3, 24.4, 24.5_

  - [x] 2.9 Create TypeScript database types
    - Create `src/types/database.ts` file
    - Define Income, Expense, Investment, Goal, FamilyMember interfaces matching database schema
    - Define ExpenseCategory, PaymentMethod, InvestmentType, GoalCategory, Relation type unions
    - Export all types for use across the application
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_

- [x] 3. Checkpoint - Verify utilities and types
  - Ensure all utility functions are implemented and exported correctly
  - Ensure all TypeScript types compile without errors
  - Ask the user if questions arise

- [x] 4. Shared UI components
  - [x] 4.1 Create Button component
    - Create `src/components/ui/Button.tsx` file
    - Implement Button with variants: primary, secondary, danger, ghost
    - Implement Button with sizes: sm, md, lg
    - Add disabled state styling
    - Add loading state with spinner
    - Ensure keyboard accessibility with visible focus indicators
    - _Requirements: 28.1_

  - [x] 4.2 Create Input component
    - Create `src/components/ui/Input.tsx` file
    - Implement Input with error state styling
    - Implement Input with disabled state styling
    - Add focus state with saffron border color
    - Ensure keyboard accessibility
    - _Requirements: 28.1_

  - [x] 4.3 Create Select component
    - Create `src/components/ui/Select.tsx` file
    - Implement Select dropdown with options
    - Add error state styling
    - Add disabled state styling
    - Ensure keyboard accessibility with arrow key navigation
    - _Requirements: 28.1_

  - [x] 4.4 Create Modal component
    - Create `src/components/ui/Modal.tsx` file
    - Implement Modal with overlay, content, and close button
    - Implement focus trap within modal
    - Add ESC key handler to close modal
    - Add overlay click handler to close modal
    - Prevent body scroll when modal is open
    - Add ARIA attributes for screen reader support (role="dialog", aria-modal, aria-labelledby)
    - Support size variants: sm, md, lg
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 28.3_

  - [ ]* 4.5 Write property test for Modal keyboard and click interactions
    - **Property 16: Modal Keyboard and Click Interactions**
    - **Property 17: Modal Body Scroll Prevention**
    - **Validates: Requirements 14.3, 14.4, 14.5, 14.6**

  - [x] 4.6 Create ConfirmDialog component
    - Create `src/components/ui/ConfirmDialog.tsx` file
    - Implement confirmation dialog using Modal component
    - Add title, message, confirm button, cancel button
    - Support variant prop: danger, warning, info
    - _Requirements: 14.7_

  - [x] 4.7 Create Toast notification component
    - Create `src/components/ui/Toast.tsx` file
    - Implement Toast with types: success, error, info, warning
    - Add appropriate background colors and icons for each type
    - Add close button
    - Position at top-right corner
    - Add ARIA live region for screen reader announcements
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.6, 28.4_

  - [x] 4.8 Create ToastContainer component
    - Create `src/components/ui/ToastContainer.tsx` file
    - Implement container to stack multiple toasts vertically with 8px spacing
    - _Requirements: 13.7_

  - [x] 4.9 Create useToast hook with Zustand store
    - Create `src/lib/store/ui-store.ts` file
    - Implement Zustand store for UI state (modals, toasts, sidebar)
    - Implement addToast, removeToast functions
    - Implement auto-dismiss after 4 seconds
    - Create `src/hooks/useToast.ts` hook wrapping the store
    - _Requirements: 13.5_

  - [ ]* 4.10 Write property test for Toast auto-dismiss and styling
    - **Property 18: Toast Auto-Dismiss and Manual Dismiss**
    - **Property 19: Toast Type Styling**
    - **Validates: Requirements 13.1, 13.3, 13.4, 13.5, 13.6**

  - [x] 4.11 Create SummaryCard component
    - Create `src/components/ui/SummaryCard.tsx` file
    - Implement card displaying title, value, icon, and optional trend
    - Add loading state with skeleton
    - Style with card background, border, and padding
    - _Requirements: 7.1_

  - [x] 4.12 Create EmptyState component
    - Create `src/components/ui/EmptyState.tsx` file
    - Implement component with icon, title, description, and call-to-action button
    - _Requirements: 22.1, 22.2, 22.3, 22.4_

  - [ ]* 4.13 Write property test for EmptyState display and interaction
    - **Property 7: Empty State Display and Interaction**
    - **Validates: Requirements 7.2, 22.1, 22.2, 22.3, 22.4, 22.5**

  - [x] 4.14 Create SkeletonLoader component
    - Create `src/components/ui/SkeletonLoader.tsx` file
    - Implement variants: card, table, chart, text
    - Add animated shimmer effect
    - Support count prop for multiple skeletons
    - _Requirements: 23.1, 23.2, 23.3, 23.4_

  - [ ]* 4.15 Write property test for loading state display
    - **Property 8: Loading State Display and Transition**
    - **Validates: Requirements 7.6, 23.1, 23.5**

  - [x] 4.16 Create ErrorState component
    - Create `src/components/ui/ErrorState.tsx` file
    - Implement component with error icon, title, message, and retry button
    - _Requirements: 24.1, 24.2_

  - [ ]* 4.17 Write property test for error handling with retry
    - **Property 9: Error Handling with Retry**
    - **Property 10: Mutation Error Feedback**
    - **Validates: Requirements 7.7, 15.7, 16.7, 17.7, 18.7, 19.6, 24.1, 24.2, 24.3, 24.4, 24.5**

  - [x] 4.18 Create LoadingSpinner component
    - Create `src/components/ui/LoadingSpinner.tsx` file
    - Implement spinner with sizes: sm, md, lg
    - Use Lucide Loader2 icon with spin animation
    - _Requirements: 8.9_

  - [x] 4.19 Create Badge component
    - Create `src/components/ui/Badge.tsx` file
    - Implement badge with color variants for relations and priorities
    - _Requirements: 11.3, 12.2_

  - [x] 4.20 Create InlineError component
    - Create `src/components/ui/InlineError.tsx` file
    - Implement inline error message with error icon
    - _Requirements: 25.1, 25.2, 25.3, 25.4, 25.5_


- [x] 5. Checkpoint - Verify shared UI components
  - Ensure all UI components render correctly
  - Ensure all components are keyboard accessible
  - Ensure all components have proper ARIA attributes
  - Ask the user if questions arise

- [x] 6. Data hooks for all modules
  - [x] 6.1 Create useIncome hook
    - Create `src/hooks/useIncome.ts` file
    - Implement fetchIncome function using Supabase client
    - Implement addIncome function with optimistic update and rollback on error
    - Implement updateIncome function with optimistic update
    - Implement deleteIncome function with optimistic update
    - Implement monthlyTotal calculation function
    - Handle errors with mapSupabaseError and show toast notifications
    - Return income list, loading state, error state, and all mutation functions
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7_

  - [ ]* 6.2 Write property test for useIncome CRUD operations
    - **Property 3: CRUD Operations with User ID Enforcement**
    - **Property 20: Monthly Total Calculation**
    - **Validates: Requirements 15.2, 15.3, 15.4, 15.5, 15.6, 30.3, 30.5**

  - [x] 6.3 Create useExpenses hook
    - Create `src/hooks/useExpenses.ts` file
    - Implement fetchExpenses function using Supabase client
    - Implement addExpense function with optimistic update and rollback on error
    - Implement updateExpense function with optimistic update
    - Implement deleteExpense function with optimistic update
    - Implement categoryBreakdown calculation function
    - Handle errors with mapSupabaseError and show toast notifications
    - Return expenses list, loading state, error state, and all mutation functions
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7_

  - [ ]* 6.4 Write property test for useExpenses CRUD and category breakdown
    - **Property 3: CRUD Operations with User ID Enforcement**
    - **Property 21: Category Breakdown Calculation**
    - **Validates: Requirements 16.2, 16.3, 16.4, 16.5, 16.6, 30.3, 30.5**

  - [x] 6.5 Create useInvestments hook
    - Create `src/hooks/useInvestments.ts` file
    - Implement fetchInvestments function using Supabase client
    - Implement addInvestment function with optimistic update and rollback on error
    - Implement updateInvestment function with optimistic update
    - Implement deleteInvestment function with optimistic update
    - Implement portfolioSummary calculation function (totalInvested, currentValue, totalReturns, returnPercentage)
    - Handle errors with mapSupabaseError and show toast notifications
    - Return investments list, loading state, error state, and all mutation functions
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7_

  - [ ]* 6.6 Write property test for useInvestments CRUD and portfolio summary
    - **Property 3: CRUD Operations with User ID Enforcement**
    - **Property 22: Portfolio Summary Calculation**
    - **Validates: Requirements 10.2, 17.2, 17.3, 17.4, 17.5, 17.6, 30.3, 30.5**

  - [x] 6.7 Create useGoals hook
    - Create `src/hooks/useGoals.ts` file
    - Implement fetchGoals function using Supabase client
    - Implement addGoal function with optimistic update and rollback on error
    - Implement updateGoal function with optimistic update
    - Implement deleteGoal function with optimistic update
    - Implement updateProgress function that updates current_amount and checks if goal is completed
    - Handle errors with mapSupabaseError and show toast notifications
    - Return goals list, loading state, error state, and all mutation functions
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 18.7_

  - [ ]* 6.8 Write property test for useGoals CRUD and progress calculation
    - **Property 3: CRUD Operations with User ID Enforcement**
    - **Property 23: Goal Progress and Completion**
    - **Validates: Requirements 11.4, 11.8, 18.2, 18.3, 18.4, 18.5, 18.6, 30.3, 30.5**

  - [x] 6.9 Create useFamily hook
    - Create `src/hooks/useFamily.ts` file
    - Implement fetchFamilyMembers function using Supabase client
    - Implement addMember function with optimistic update and rollback on error
    - Implement updateMember function with optimistic update
    - Implement deleteMember function with optimistic update
    - Handle errors with mapSupabaseError and show toast notifications
    - Return family members list, loading state, error state, and all mutation functions
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6_

  - [ ]* 6.10 Write property test for useFamily CRUD operations
    - **Property 3: CRUD Operations with User ID Enforcement**
    - **Validates: Requirements 19.2, 19.3, 19.4, 19.5, 30.3, 30.5**

  - [ ]* 6.11 Write property test for optimistic updates with rollback
    - **Property 5: Optimistic Updates with Rollback**
    - **Validates: Requirements 29.5**

  - [ ]* 6.12 Write property test for data synchronization after mutations
    - **Property 4: Data Synchronization After Mutations**
    - **Validates: Requirements 8.7, 9.8, 10.10, 11.10, 12.8, 27.1, 27.2, 27.3, 27.4, 27.5, 27.6**

- [x] 7. Checkpoint - Verify data hooks
  - Ensure all hooks fetch data correctly
  - Ensure all hooks handle mutations with optimistic updates
  - Ensure all hooks handle errors gracefully
  - Ask the user if questions arise

- [x] 8. Layout components
  - [x] 8.1 Create Sidebar component
    - Create `src/components/layout/Sidebar.tsx` file
    - Implement fixed sidebar with 220px width for desktop (min-width 768px)
    - Add navigation sections: Overview, Money (Income, Expenses, Investments), Planning (Goals, Family)
    - Highlight active link with saffron color
    - Add user profile section at bottom with avatar, name, and user_type badge
    - Ensure keyboard navigation with visible focus indicators
    - Add ARIA labels for all navigation links
    - _Requirements: 6.1, 6.3, 6.4, 6.5, 28.1, 28.2_

  - [ ]* 8.2 Write property test for navigation link behavior
    - **Property 15: Navigation Link Behavior**
    - **Validates: Requirements 6.4, 6.7**

  - [x] 8.3 Create BottomNav component
    - Create `src/components/layout/BottomNav.tsx` file
    - Implement fixed bottom navigation for mobile (max-width 767px)
    - Display 5 primary navigation items with icons
    - Highlight active link with saffron color
    - Ensure keyboard navigation
    - Add ARIA labels for all navigation items
    - _Requirements: 6.2, 26.1, 28.1, 28.2_

  - [x] 8.4 Create TopNav component
    - Create `src/components/layout/TopNav.tsx` file
    - Display page title and quick action buttons
    - Add mobile menu toggle button for sidebar
    - _Requirements: 6.6_

  - [x] 8.5 Create DashboardShell layout component
    - Create `src/components/layout/DashboardShell.tsx` file
    - Implement main layout wrapper with Sidebar (desktop) or BottomNav (mobile)
    - Add TopNav component
    - Add main content area with proper padding
    - Ensure responsive layout with Tailwind breakpoints
    - _Requirements: 6.1, 6.2, 26.1, 26.2_

  - [x] 8.6 Update dashboard layout file
    - Update `src/app/(dashboard)/layout.tsx` file
    - Wrap children with DashboardShell component
    - Add authentication check using Supabase server client
    - Redirect to login if not authenticated
    - _Requirements: 30.2, 30.6_

  - [ ]* 8.7 Write property test for authentication verification
    - **Property 27: Authentication Verification**
    - **Validates: Requirements 30.2, 30.6**


- [x] 9. Checkpoint - Verify layout components
  - Ensure sidebar displays correctly on desktop
  - Ensure bottom navigation displays correctly on mobile
  - Ensure navigation links work and highlight active page
  - Ensure authentication check redirects unauthenticated users
  - Ask the user if questions arise

- [x] 10. Income module components
  - [x] 10.1 Create IncomeSummary component
    - Create `src/components/income/IncomeSummary.tsx` file
    - Display 3 summary cards: This Month, Last Month, Recurring Total
    - Use SummaryCard component with appropriate icons and colors
    - Show loading state with skeleton loaders
    - Calculate trend percentage between this month and last month
    - _Requirements: 8.1_

  - [x] 10.2 Create IncomeTable component
    - Create `src/components/income/IncomeTable.tsx` file
    - Display table with columns: date, source, amount, description, recurring status
    - Add edit and delete action buttons with ARIA labels
    - Format dates using formatRelativeDate
    - Format amounts using formatCurrency
    - Show recurring badge for recurring income
    - Implement pagination for lists exceeding 20 records
    - Make table horizontally scrollable on mobile
    - _Requirements: 8.2, 26.5, 29.1_

  - [x] 10.3 Create IncomeForm component
    - Create `src/components/income/IncomeForm.tsx` file
    - Add form fields: amount, source, description, date, is_recurring toggle, recurring_frequency select, currency
    - Use Zod validation with incomeSchema
    - Display field-specific error messages using InlineError component
    - Disable submit button while submitting or validation fails
    - Show loading spinner on submit button during submission
    - Handle form submission with onSubmit callback
    - _Requirements: 8.3, 8.4, 8.8, 8.9, 25.6_

  - [x] 10.4 Create Income page
    - Create `src/app/(dashboard)/income/page.tsx` file
    - Add page header with title and "Add Income" button
    - Render IncomeSummary component
    - Render IncomeTable component with data from useIncome hook
    - Show EmptyState when no income records exist
    - Show SkeletonLoader while loading
    - Show ErrorState on fetch error with retry button
    - Open Modal with IncomeForm on "Add Income" button click
    - Handle edit by populating form with existing data
    - Handle delete with ConfirmDialog
    - Refresh data after add, update, or delete operations
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9_

  - [ ]* 10.5 Write property test for edit form population
    - **Property 30: Edit Form Population**
    - **Validates: Requirements 8.5**

  - [ ]* 10.6 Write property test for delete confirmation
    - **Property 29: Confirmation Dialog for Delete Operations**
    - **Validates: Requirements 8.6**

  - [ ]* 10.7 Write property test for double-submit prevention
    - **Property 28: Double-Submit Prevention**
    - **Validates: Requirements 8.9**

- [x] 11. Expense module components
  - [x] 11.1 Create ExpenseSummary component
    - Create `src/components/expenses/ExpenseSummary.tsx` file
    - Display 3 summary cards: This Month, Biggest Category, Daily Average
    - Use SummaryCard component with appropriate icons and colors
    - Show loading state with skeleton loaders
    - _Requirements: 9.1_

  - [x] 11.2 Create CategoryChart component
    - Create `src/components/expenses/CategoryChart.tsx` file
    - Implement donut chart using Recharts (lazy loaded)
    - Display expense breakdown by category with percentages
    - Use category icons and colors
    - Show loading state with skeleton loader
    - _Requirements: 9.2, 29.3_

  - [x] 11.3 Create ExpenseTable component
    - Create `src/components/expenses/ExpenseTable.tsx` file
    - Display table with columns: date, category icon, description, payment method, tags, amount
    - Add edit and delete action buttons with ARIA labels
    - Format dates using formatRelativeDate
    - Format amounts using formatCurrency
    - Display category icon using getCategoryIcon helper
    - Display tags as badges
    - Implement pagination for lists exceeding 20 records
    - Make table horizontally scrollable on mobile
    - _Requirements: 9.3, 26.5, 29.1_

  - [x] 11.4 Create ExpenseForm component
    - Create `src/components/expenses/ExpenseForm.tsx` file
    - Add form fields: amount, category select, description, payment_method select, tags input, date, currency
    - Use Zod validation with expenseSchema
    - Display field-specific error messages using InlineError component
    - Disable submit button while submitting or validation fails
    - Show loading spinner on submit button during submission
    - Handle form submission with onSubmit callback
    - _Requirements: 9.4, 9.5, 25.6_

  - [x] 11.5 Create Expenses page
    - Create `src/app/(dashboard)/expenses/page.tsx` file
    - Add page header with title and "Add Expense" button
    - Render ExpenseSummary component
    - Render CategoryChart component
    - Render ExpenseTable component with data from useExpenses hook
    - Show EmptyState when no expense records exist
    - Show SkeletonLoader while loading
    - Show ErrorState on fetch error with retry button
    - Open Modal with ExpenseForm on "Add Expense" button click
    - Handle edit by populating form with existing data
    - Handle delete with ConfirmDialog
    - Refresh data after add, update, or delete operations
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 9.10_

- [x] 12. Investment module components
  - [x] 12.1 Create InvestmentSummary component
    - Create `src/components/investments/InvestmentSummary.tsx` file
    - Display 4 summary cards: Total Invested, Current Value, Total Returns (amount), Return Percentage
    - Use SummaryCard component with appropriate icons and colors
    - Show returns in green when positive, coral when negative
    - Show loading state with skeleton loaders
    - _Requirements: 10.1, 10.2, 10.5_

  - [x] 12.2 Create PortfolioChart component
    - Create `src/components/investments/PortfolioChart.tsx` file
    - Implement breakdown visualization using Recharts (lazy loaded)
    - Display portfolio distribution by investment type with percentages
    - Use investment type icons and colors
    - Show loading state with skeleton loader
    - _Requirements: 10.3, 29.3_

  - [x] 12.3 Create InvestmentTable component
    - Create `src/components/investments/InvestmentTable.tsx` file
    - Display table with columns: type icon, name, invested amount, current value, returns (color-coded), purchase date
    - Add edit and delete action buttons with ARIA labels
    - Format dates using formatDate
    - Format amounts using formatCurrency
    - Display investment type icon using getInvestmentIcon helper
    - Color-code returns: green for positive, coral for negative
    - Implement pagination for lists exceeding 20 records
    - Make table horizontally scrollable on mobile
    - _Requirements: 10.4, 10.5, 26.5, 29.1_

  - [x] 12.4 Create InvestmentForm component
    - Create `src/components/investments/InvestmentForm.tsx` file
    - Add form fields: type select, name, invested_amount, current_value, units, purchase_date, currency, notes
    - Use Zod validation with investmentSchema
    - Display field-specific error messages using InlineError component
    - Disable submit button while submitting or validation fails
    - Show loading spinner on submit button during submission
    - Handle form submission with onSubmit callback
    - _Requirements: 10.6, 10.7, 25.6_

  - [x] 12.5 Create Investments page
    - Create `src/app/(dashboard)/investments/page.tsx` file
    - Add page header with title and "Add Investment" button
    - Render InvestmentSummary component
    - Render PortfolioChart component
    - Render InvestmentTable component with data from useInvestments hook
    - Show EmptyState when no investment records exist
    - Show SkeletonLoader while loading
    - Show ErrorState on fetch error with retry button
    - Open Modal with InvestmentForm on "Add Investment" button click
    - Handle edit by populating form with existing data
    - Handle delete with ConfirmDialog
    - Refresh data after add, update, or delete operations
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 10.10_


- [x] 13. Goal module components
  - [x] 13.1 Create GoalSummary component
    - Create `src/components/goals/GoalSummary.tsx` file
    - Display 3 summary cards: Active Goals count, Total Target, Total Saved
    - Use SummaryCard component with appropriate icons and colors
    - Show loading state with skeleton loaders
    - _Requirements: 11.1_

  - [x] 13.2 Create GoalCard component
    - Create `src/components/goals/GoalCard.tsx` file
    - Display goal card with: category icon, title, description, progress bar, target amount, current amount, target date, priority badge
    - Use getGoalIcon helper for category icon
    - Use getPriorityColor helper for priority badge colors (high: coral, medium: saffron, low: teal)
    - Calculate progress percentage using calculateProgress helper
    - Add "Add Savings" button
    - Add edit and delete action buttons with ARIA labels
    - _Requirements: 11.2, 11.3, 11.4, 11.7_

  - [x] 13.3 Create GoalForm component
    - Create `src/components/goals/GoalForm.tsx` file
    - Add form fields: category select, title, description, target_amount, current_amount, target_date, priority select, currency
    - Use Zod validation with goalSchema
    - Display field-specific error messages using InlineError component
    - Disable submit button while submitting or validation fails
    - Show loading spinner on submit button during submission
    - Handle form submission with onSubmit callback
    - _Requirements: 11.5, 11.6, 25.6_

  - [x] 13.4 Create AddSavingsForm component
    - Create `src/components/goals/AddSavingsForm.tsx` file
    - Add form field for savings amount to add to current_amount
    - Validate amount is positive
    - Display field-specific error messages
    - Handle form submission with onSubmit callback
    - _Requirements: 11.7_

  - [x] 13.5 Create Goals page
    - Create `src/app/(dashboard)/goals/page.tsx` file
    - Add page header with title and "Add Goal" button
    - Render GoalSummary component
    - Render goals in 2-column grid layout using GoalCard component
    - Filter to show only active goals
    - Show EmptyState when no active goals exist
    - Show SkeletonLoader while loading
    - Show ErrorState on fetch error with retry button
    - Open Modal with GoalForm on "Add Goal" button click
    - Open Modal with AddSavingsForm on "Add Savings" button click
    - Handle edit by populating form with existing data
    - Handle delete with ConfirmDialog
    - Refresh data after add, update, or delete operations
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 11.9, 11.10, 26.3_

- [x] 14. Family module components
  - [x] 14.1 Create FamilyCard component
    - Create `src/components/family/FamilyCard.tsx` file
    - Display family member card with: avatar with initials, name, relation badge, age, dependent status
    - Use getInitials helper for avatar initials
    - Use getRelationColor helper for relation badge colors
    - Calculate age using calculateAge helper
    - Add edit and delete action buttons with ARIA labels
    - _Requirements: 12.1, 12.2, 12.3_

  - [x] 14.2 Create FamilyForm component
    - Create `src/components/family/FamilyForm.tsx` file
    - Add form fields: name, relation select, date_of_birth, is_dependent toggle
    - Use Zod validation with familyMemberSchema
    - Display field-specific error messages using InlineError component
    - Disable submit button while submitting or validation fails
    - Show loading spinner on submit button during submission
    - Handle form submission with onSubmit callback
    - _Requirements: 12.4, 12.5, 25.6_

  - [x] 14.3 Create Family page
    - Create `src/app/(dashboard)/family/page.tsx` file
    - Add page header with title and "Add Member" button
    - Render family members in 3-column grid layout using FamilyCard component
    - Show EmptyState when no family members exist
    - Show SkeletonLoader while loading
    - Show ErrorState on fetch error with retry button
    - Open Modal with FamilyForm on "Add Member" button click
    - Handle edit by populating form with existing data
    - Handle delete with ConfirmDialog
    - Refresh data after add, update, or delete operations
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 26.4_

- [x] 15. Checkpoint - Verify all module pages
  - Ensure all pages render correctly with data
  - Ensure all forms validate and submit correctly
  - Ensure all CRUD operations work with optimistic updates
  - Ensure all pages show appropriate empty, loading, and error states
  - Ask the user if questions arise

- [x] 16. Dashboard overview page
  - [x] 16.1 Create RecentTransactionsList component
    - Create `src/components/overview/RecentTransactionsList.tsx` file
    - Display last 5 combined income and expense transactions
    - Sort by date descending
    - Show transaction type icon (income or expense)
    - Format dates using formatRelativeDate
    - Format amounts using formatCurrency
    - _Requirements: 7.3_

  - [ ]* 16.2 Write property test for recent transactions display
    - **Property 24: Recent Transactions Display**
    - **Validates: Requirements 7.3**

  - [x] 16.3 Create GoalSnapshotCard component
    - Create `src/components/overview/GoalSnapshotCard.tsx` file
    - Display compact goal card with title, progress bar, and percentage
    - Use goal category icon
    - _Requirements: 7.4_

  - [x] 16.4 Create IncomeVsExpenseChart component
    - Create `src/components/overview/IncomeVsExpenseChart.tsx` file
    - Implement bar chart using Recharts (lazy loaded)
    - Compare income versus expenses for last 6 months
    - Use green for income bars, coral for expense bars
    - Show loading state with skeleton loader
    - _Requirements: 7.5, 29.3_

  - [x] 16.5 Create Dashboard Overview page
    - Create `src/app/(dashboard)/overview/page.tsx` file
    - Display 4 summary cards: Total Income (current month), Total Expenses (current month), Total Investments, Goals Progress percentage
    - Render IncomeVsExpenseChart component
    - Render RecentTransactionsList component
    - Render 4 active goals using GoalSnapshotCard component
    - Show EmptyState components when no data exists
    - Show SkeletonLoader while loading
    - Show ErrorState on fetch error with retry button
    - Fetch data from all hooks: useIncome, useExpenses, useInvestments, useGoals
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

  - [x] 16.6 Update root dashboard route
    - Update `src/app/(dashboard)/page.tsx` to redirect to `/overview`
    - _Requirements: 7.1_

- [x] 17. Checkpoint - Verify dashboard overview page
  - Ensure all summary cards display correct data
  - Ensure charts render correctly
  - Ensure recent transactions display correctly
  - Ensure goals snapshot displays correctly
  - Ask the user if questions arise

- [ ] 18. Responsive design and accessibility
  - [x] 18.1 Add responsive breakpoints to Tailwind config
    - Update `tailwind.config.ts` file
    - Ensure breakpoints are defined: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
    - _Requirements: 26.1, 26.2, 26.3, 26.4, 26.5, 26.6_

  - [x] 18.2 Verify responsive layouts across all pages
    - Ensure sidebar hides on mobile and bottom nav shows
    - Ensure summary cards stack in single column on mobile
    - Ensure goals grid displays in single column on mobile
    - Ensure family grid displays in single column on mobile
    - Ensure tables are horizontally scrollable on mobile
    - Ensure modals display at full width on mobile
    - _Requirements: 26.1, 26.2, 26.3, 26.4, 26.5, 26.6_

  - [ ]* 18.3 Write property test for keyboard navigation
    - **Property 31: Accessibility - Keyboard Navigation**
    - **Validates: Requirements 28.1, 28.5**

  - [ ]* 18.4 Write property test for ARIA labels and announcements
    - **Property 32: Accessibility - ARIA Labels and Announcements**
    - **Validates: Requirements 28.2, 28.3, 28.4, 28.6**

  - [ ] 18.5 Run accessibility audit with jest-axe
    - Install jest-axe package
    - Create accessibility tests for all major components
    - Fix any accessibility violations found
    - _Requirements: 28.1, 28.2, 28.3, 28.4, 28.5, 28.6_


- [ ] 19. Performance optimization
  - [x] 19.1 Implement pagination for all data tables
    - Create usePagination hook in `src/hooks/usePagination.ts`
    - Update IncomeTable, ExpenseTable, InvestmentTable to use pagination
    - Display page controls (previous, next, page numbers)
    - _Requirements: 29.1_

  - [x] 19.2 Add debouncing to search and filter inputs
    - Use debounce helper function for all search inputs
    - Set debounce delay to 300ms
    - _Requirements: 29.2_

  - [x] 19.3 Lazy load chart libraries
    - Use React.lazy and Suspense to lazy load Recharts
    - Show skeleton loader while chart library loads
    - _Requirements: 29.3_

  - [ ] 19.4 Implement session storage caching for user profile
    - Cache user profile data in session storage
    - Retrieve from cache on subsequent page loads
    - _Requirements: 29.4_

  - [x] 19.5 Verify optimistic updates are implemented
    - Ensure all mutation hooks use optimistic updates
    - Ensure immediate UI feedback on all actions
    - _Requirements: 29.5_

- [ ] 20. Security and RLS verification
  - [ ]* 20.1 Write property test for data isolation through RLS
    - **Property 1: Data Isolation Through RLS**
    - **Validates: Requirements 1.3, 1.4, 1.5, 1.6, 2.3, 3.3, 4.3, 5.3, 30.1, 30.4**

  - [ ]* 20.2 Write property test for cascade delete referential integrity
    - **Property 2: Cascade Delete Referential Integrity**
    - **Validates: Requirements 1.2, 2.2, 3.2, 4.2, 5.2**

  - [ ] 20.3 Verify user_id is set from auth.uid() in all INSERT operations
    - Review all data hooks to ensure user_id is automatically set
    - Ensure client cannot manipulate user_id
    - _Requirements: 30.3, 30.5_

  - [ ] 20.4 Verify authentication checks on all protected pages
    - Review all dashboard pages to ensure authentication check
    - Ensure redirect to login on expired token
    - _Requirements: 30.2, 30.6_

- [ ] 21. Final checkpoint and testing
  - [x] 21.1 Run all unit tests
    - Execute test suite for all utility functions
    - Execute test suite for all UI components
    - Execute test suite for all data hooks
    - Ensure minimum 80% code coverage
    - _Requirements: All_

  - [ ] 21.2 Run all property-based tests
    - Execute all 32 property tests with 100 iterations each
    - Verify all properties pass
    - Fix any failing properties
    - _Requirements: All_

  - [ ] 21.3 Manual testing of all user workflows
    - Test complete CRUD cycle for income
    - Test complete CRUD cycle for expenses
    - Test complete CRUD cycle for investments
    - Test complete CRUD cycle for goals
    - Test complete CRUD cycle for family members
    - Test dashboard overview displays correct data
    - Test responsive design on mobile and desktop
    - Test keyboard navigation and accessibility
    - _Requirements: All_

  - [ ] 21.4 Verify all acceptance criteria are met
    - Review requirements document
    - Verify each acceptance criterion is implemented
    - Document any deviations or known issues
    - _Requirements: All_

  - [ ] 21.5 Final review and cleanup
    - Remove console.log statements
    - Remove commented-out code
    - Ensure consistent code formatting
    - Update documentation if needed
    - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional property-based tests and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples, edge cases, and integration points
- All code uses TypeScript for type safety
- All components follow accessibility best practices (WCAG compliance)
- All data operations use Supabase RLS for security
- All mutations use optimistic updates for immediate user feedback

## Implementation Language

**TypeScript** (Next.js 15 with App Router, React 19)

## Property-Based Testing Configuration

- Framework: fast-check
- Minimum iterations per property: 100
- Tag format: `// Feature: dashboard-core-features, Property N: [Property Title]`
- All property tests are marked as optional sub-tasks with `*` postfix

## Success Criteria

- All database tables created with RLS policies
- All utility functions implemented and tested
- All shared UI components implemented and accessible
- All data hooks implemented with optimistic updates
- All layout components responsive and accessible
- All module pages functional with CRUD operations
- Dashboard overview page displays all summary data
- All property-based tests pass (100 iterations each)
- Unit test coverage >= 80%
- All acceptance criteria from requirements document met
- Application is keyboard navigable and screen reader friendly
- Application works on mobile and desktop viewports
