# Design Document: Recurring Expenses & Auto-Carry Forward

## Overview

The Recurring Expenses & Auto-Carry Forward feature introduces a master expense system that automatically generates monthly expense entries for recurring financial obligations. This design enables users to define expenses once (EMIs, subscriptions, utilities, groceries) and have them automatically populate each month, while maintaining the ability to track individual one-time expenses separately.

### Key Capabilities

- Master expense definitions with lifecycle management (active, paused, completed, cancelled)
- Automatic monthly carry-forward engine that generates expense entries
- EMI tracking with start/end dates and automatic completion
- Subscription management with renewal reminders
- Clear visual distinction between recurring and individual expenses
- Family-level expense visibility and management
- Backward compatibility with existing expense data

### Design Goals

1. **Automation**: Eliminate manual re-entry of recurring expenses each month
2. **Flexibility**: Support various expense types (EMIs, subscriptions, utilities, groceries)
3. **Transparency**: Clear distinction between master-generated and individual expenses
4. **Reliability**: Robust carry-forward engine with error handling and retry logic
5. **Maintainability**: Clean separation between master definitions and monthly instances
6. **Scalability**: Efficient database schema supporting multi-family operations

## Architecture

### System Components

The feature introduces three primary architectural components:

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                          │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ Master Expense   │  │ Monthly Expense  │                │
│  │ Management UI    │  │ Dashboard UI     │                │
│  └────────┬─────────┘  └────────┬─────────┘                │
│           │                     │                           │
└───────────┼─────────────────────┼───────────────────────────┘
            │                     │
            ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Recurring Expense Engine                     │   │
│  │  - Monthly carry-forward scheduler                   │   │
│  │  - EMI completion detector                           │   │
│  │  - Subscription renewal notifier                     │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ Master Expense   │  │ Expense Entry    │                │
│  │ Service          │  │ Service          │                │
│  └──────────────────┘  └──────────────────┘                │
└───────────┬─────────────────────┬───────────────────────────┘
            │                     │
            ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer (Supabase)                    │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ master_expenses  │  │ expenses         │                │
│  │ table            │  │ table (extended) │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

**Master Expense Management UI**
- Create, edit, pause, resume, and cancel master expenses
- Display master expense dashboard with lifecycle states
- Provide EMI and subscription-specific input forms
- Show remaining tenure and completion timelines

**Monthly Expense Dashboard UI**
- Display monthly expenses with visual indicators for auto-generated entries
- Toggle visibility of master-generated vs individual expenses
- Allow manual editing of specific monthly instances
- Show separate totals for recurring and individual expenses

**Recurring Expense Engine**
- Scheduled execution on the first day of each month
- Query active master expenses and generate monthly entries
- Detect and mark completed EMIs
- Send subscription renewal reminders
- Handle errors with retry logic and logging

**Master Expense Service**
- CRUD operations for master expense definitions
- Lifecycle state transitions (active → paused → resumed → completed/cancelled)
- Validation of EMI calculations and date ranges
- Family-level access control

**Expense Entry Service**
- Create monthly expense entries (manual and auto-generated)
- Link entries to source master expenses
- Support editing of auto-generated entries with adjustment tracking
- Maintain referential integrity

## Components and Interfaces

### Frontend Components

#### MasterExpenseManager Component

```javascript
class MasterExpenseManager {
  // Renders master expense dashboard
  render() {
    // Display active, paused, and completed master expenses
    // Group by category (EMI, subscription, utilities, groceries)
    // Show lifecycle controls (pause, resume, edit, cancel)
  }

  // Create new master expense
  async createMasterExpense(expenseData) {
    // Validate input
    // Call API to create master expense
    // Refresh dashboard
  }

  // Edit existing master expense
  async editMasterExpense(id, updates) {
    // Validate changes
    // Call API to update
    // Show confirmation that future entries will be affected
  }

  // Lifecycle management
  async pauseMasterExpense(id) { }
  async resumeMasterExpense(id) { }
  async cancelMasterExpense(id) { }
}
```

#### MonthlyExpenseDashboard Component

```javascript
class MonthlyExpenseDashboard {
  // Renders monthly expense view
  render(month, year) {
    // Display all expenses for the month
    // Visual indicators for auto-generated entries
    // Separate totals for recurring vs individual
    // Toggle to show/hide auto-generated
  }

  // Add individual expense
  async addIndividualExpense(expenseData) {
    // Create standalone expense entry
  }

  // Edit auto-generated expense for specific month
  async editMonthlyInstance(id, newAmount) {
    // Mark as manually adjusted
    // Preserve master expense definition
  }
}
```

#### EMITracker Component

```javascript
class EMITracker {
  // Specialized UI for EMI management
  render() {
    // Display all active EMIs
    // Show remaining tenure and total remaining amount
    // Timeline view of completion dates
  }

  // Create EMI with tenure calculation
  async createEMI(emiData) {
    // Calculate total tenure in months
    // Validate start/end dates
    // Display total payment amount
  }
}
```

### Backend Services

#### RecurringExpenseEngine

```javascript
class RecurringExpenseEngine {
  // Main scheduler - runs on first day of month
  async executeMonthlyCarryForward() {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    try {
      // Get all active master expenses
      const activeMasterExpenses = await this.getActiveMasterExpenses();

      // Generate monthly entries
      for (const masterExpense of activeMasterExpenses) {
        await this.generateMonthlyEntry(masterExpense, currentMonth, currentYear);
      }

      // Check for completed EMIs
      await this.checkAndCompleteEMIs(today);

      // Send subscription renewal reminders
      await this.sendRenewalReminders(today);

    } catch (error) {
      await this.handleCarryForwardError(error);
    }
  }

  async getActiveMasterExpenses() {
    // Query master_expenses where status = 'active'
    // Filter by end_date (null or >= current date)
  }

  async generateMonthlyEntry(masterExpense, month, year) {
    // Create expense entry with reference to master_expense_id
    // Set entry_date to first day of month
    // Copy amount, category, description from master
    // Mark as auto_generated = true
  }

  async checkAndCompleteEMIs(currentDate) {
    // Query EMIs where end_date < currentDate and status = 'active'
    // Update status to 'completed'
    // Send completion notification
  }

  async sendRenewalReminders(currentDate) {
    // Query subscriptions with renewal_date within 7 days
    // Send notification to family members
  }

  async handleCarryForwardError(error) {
    // Log error details
    // Retry with exponential backoff (up to 3 attempts)
    // Notify admin if all retries fail
  }
}
```

#### MasterExpenseService

```javascript
class MasterExpenseService {
  async create(familyId, userId, expenseData) {
    // Validate required fields
    // Validate amount > 0
    // Validate end_date > start_date (if provided)
    // For EMI: calculate tenure and validate
    // Insert into master_expenses table
    // Return created record
  }

  async update(id, familyId, updates) {
    // Verify family ownership
    // Prevent editing completed EMIs
    // Update master_expenses record
    // Log modification with user and timestamp
    // Return updated record
  }

  async pause(id, familyId) {
    // Update status to 'paused'
    // Stop future carry-forwards
  }

  async resume(id, familyId) {
    // Update status to 'active'
    // Resume carry-forwards from next month
  }

  async cancel(id, familyId) {
    // Update status to 'cancelled'
    // Stop all future carry-forwards
    // Preserve historical data
  }

  async getByFamily(familyId, filters) {
    // Query master_expenses for family
    // Apply filters (status, category, type)
    // Return with calculated fields (remaining tenure, total remaining)
  }
}
```

#### ExpenseEntryService

```javascript
class ExpenseEntryService {
  async createManual(familyId, userId, expenseData) {
    // Create individual expense entry
    // Set auto_generated = false
    // No master_expense_id reference
  }

  async createAutoGenerated(masterExpenseId, month, year) {
    // Create expense entry from master definition
    // Set auto_generated = true
    // Link to master_expense_id
    // Set entry_date to first of month
  }

  async editMonthlyInstance(id, familyId, newAmount) {
    // Update specific monthly entry
    // Set manually_adjusted = true
    // Preserve master expense definition
  }

  async getByMonthAndFamily(familyId, month, year, includeAutoGenerated) {
    // Query expenses for specific month
    // Filter by includeAutoGenerated flag
    // Join with master_expenses for auto-generated entries
    // Return with source indicators
  }
}
```

### API Endpoints

```
POST   /api/master-expenses              Create master expense
GET    /api/master-expenses              List master expenses for family
GET    /api/master-expenses/:id          Get specific master expense
PUT    /api/master-expenses/:id          Update master expense
POST   /api/master-expenses/:id/pause    Pause master expense
POST   /api/master-expenses/:id/resume   Resume master expense
POST   /api/master-expenses/:id/cancel   Cancel master expense

GET    /api/expenses/monthly             Get expenses for specific month
POST   /api/expenses/manual              Create individual expense
PUT    /api/expenses/:id                 Edit expense entry

POST   /api/recurring-engine/execute     Trigger carry-forward (admin/scheduled)
GET    /api/recurring-engine/status      Get engine status and last run
```

## Data Models

### master_expenses Table

```sql
CREATE TABLE master_expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id),
  
  -- Basic expense information
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  category VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- Expense type and frequency
  expense_type VARCHAR(50) NOT NULL, -- 'emi', 'subscription', 'utility', 'grocery', 'other'
  frequency VARCHAR(50) DEFAULT 'monthly', -- 'monthly', 'annual'
  
  -- Date range
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE, -- NULL for indefinite, set for EMIs
  
  -- EMI-specific fields
  is_emi BOOLEAN DEFAULT FALSE,
  emi_type VARCHAR(100), -- 'house_loan', 'car_loan', 'personal_loan', 'education_loan'
  tenure_months INTEGER, -- Calculated: months between start_date and end_date
  total_amount DECIMAL(12, 2), -- Total EMI amount (amount * tenure_months)
  
  -- Subscription-specific fields
  is_subscription BOOLEAN DEFAULT FALSE,
  service_name VARCHAR(255),
  renewal_date DATE,
  
  -- Lifecycle management
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'paused', 'completed', 'cancelled'
  
  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_modified_by UUID REFERENCES users(id),
  
  -- Indexes
  INDEX idx_master_expenses_family (family_id),
  INDEX idx_master_expenses_status (status),
  INDEX idx_master_expenses_end_date (end_date),
  INDEX idx_master_expenses_type (expense_type)
);
```

### expenses Table (Extended)

```sql
-- Extend existing expenses table with new columns
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS auto_generated BOOLEAN DEFAULT FALSE;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS master_expense_id UUID REFERENCES master_expenses(id) ON DELETE SET NULL;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS manually_adjusted BOOLEAN DEFAULT FALSE;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS original_amount DECIMAL(12, 2);

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_expenses_master_expense ON expenses(master_expense_id);
CREATE INDEX IF NOT EXISTS idx_expenses_auto_generated ON expenses(auto_generated);
CREATE INDEX IF NOT EXISTS idx_expenses_entry_date ON expenses(entry_date);
```

### recurring_engine_logs Table

```sql
CREATE TABLE recurring_engine_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  execution_date DATE NOT NULL,
  execution_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) NOT NULL, -- 'success', 'partial_success', 'failed'
  entries_generated INTEGER DEFAULT 0,
  emis_completed INTEGER DEFAULT 0,
  reminders_sent INTEGER DEFAULT 0,
  errors_encountered INTEGER DEFAULT 0,
  error_details JSONB,
  execution_duration_ms INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_engine_logs_date (execution_date),
  INDEX idx_engine_logs_status (status)
);
```

### Data Model Relationships

```
families (1) ──────< (many) master_expenses
users (1) ──────< (many) master_expenses (created_by)
master_expenses (1) ──────< (many) expenses (master_expense_id)
families (1) ──────< (many) expenses
```

### Sample Data Flow

**Creating a Master Expense (EMI)**
```json
{
  "family_id": "uuid-123",
  "created_by": "user-uuid-456",
  "name": "Home Loan EMI",
  "amount": 35000,
  "category": "housing",
  "expense_type": "emi",
  "is_emi": true,
  "emi_type": "house_loan",
  "start_date": "2024-01-01",
  "end_date": "2044-01-01",
  "tenure_months": 240,
  "total_amount": 8400000,
  "status": "active"
}
```

**Auto-Generated Monthly Entry**
```json
{
  "family_id": "uuid-123",
  "amount": 35000,
  "category": "housing",
  "description": "Home Loan EMI (Auto-generated)",
  "entry_date": "2024-12-01",
  "auto_generated": true,
  "master_expense_id": "master-uuid-789",
  "manually_adjusted": false
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Required Fields Validation

*For any* master expense creation attempt, if any required field (name, amount, category) is missing, the system should reject the creation and return a validation error.

**Validates: Requirements 1.2**

### Property 2: Positive Amount Validation

*For any* master expense or individual expense, if the amount is less than or equal to zero, the system should reject the save operation.

**Validates: Requirements 1.5**

### Property 3: Date Range Validation

*For any* master expense with an end date, if the end date is not after the start date, the system should reject the save operation.

**Validates: Requirements 1.6, 13.2**

### Property 4: Family Association

*For any* created master expense, the system should associate it with the creating user's family account (family_id should match the user's family).

**Validates: Requirements 1.7, 11.1**

### Property 5: EMI Required Fields

*For any* expense marked as EMI type, if start date, end date, or monthly amount is missing, the system should reject the creation.

**Validates: Requirements 2.1**

### Property 6: EMI Tenure Calculation

*For any* EMI with start date and end date, the calculated tenure_months should equal the number of months between start_date and end_date.

**Validates: Requirements 2.2**

### Property 7: EMI Total Amount Validation

*For any* EMI definition, the total_amount should equal (monthly amount × tenure_months) within an acceptable rounding tolerance of ±1.

**Validates: Requirements 2.5**

### Property 8: Active Master Expense Carry Forward

*For any* set of active master expenses (status='active' and end_date is null or >= current date), running the carry-forward engine should generate exactly one expense entry per master expense for the current month.

**Validates: Requirements 3.1**

### Property 9: Status-Based Entry Generation

*For any* master expense, the carry-forward engine should generate monthly entries if and only if the status is 'active' and the end_date has not passed.

**Validates: Requirements 3.3, 5.2**

### Property 10: Field Copying from Master to Entry

*For any* auto-generated expense entry, the amount, category, and description should match the corresponding fields from the source master expense.

**Validates: Requirements 3.4**

### Property 11: Expired Master Expense Filtering

*For any* master expense where end_date < current_date, the carry-forward engine should not generate an expense entry.

**Validates: Requirements 3.5**

### Property 12: Master Expense Reference Integrity

*For any* auto-generated expense entry, it should have auto_generated=true and master_expense_id should reference a valid master expense record.

**Validates: Requirements 3.6, 12.6**

### Property 13: Entry Date Consistency

*For any* auto-generated expense entry created during a carry-forward execution, the entry_date should be set to the first day of the current month.

**Validates: Requirements 3.7**

### Property 14: EMI Completion and Termination

*For any* EMI where current_date > end_date and status='active', the system should mark it as status='completed' and the carry-forward engine should not generate any new entries for it.

**Validates: Requirements 4.1, 4.2**

### Property 15: Completed EMI Persistence

*For any* EMI that reaches completed status, the master expense record should remain in the database (not deleted) and be queryable with status='completed'.

**Validates: Requirements 4.5**

### Property 16: Paused Expense Resumption

*For any* master expense with status='paused', when resumed (status changed to 'active'), the carry-forward engine should generate entries starting from the next execution.

**Validates: Requirements 5.3**

### Property 17: Temporal Isolation of Master Expense Edits

*For any* master expense edit operation, all existing expense entries created before the edit should retain their original amount and description values (no retroactive changes).

**Validates: Requirements 5.4, 5.7**

### Property 18: Cancelled Expense Termination

*For any* master expense with status='cancelled', the carry-forward engine should not generate any new expense entries.

**Validates: Requirements 5.5**

### Property 19: Completed EMI Edit Prevention

*For any* master expense with status='completed' and is_emi=true, any edit attempt should be rejected by the system.

**Validates: Requirements 5.6**

### Property 20: Annual Subscription Frequency

*For any* subscription master expense with frequency='annual', the carry-forward engine should generate at most one expense entry per calendar year.

**Validates: Requirements 6.3**

### Property 21: Expense Total Separation

*For any* month's expenses, the sum of auto-generated expenses should be calculated separately from the sum of individual expenses (auto_generated=false).

**Validates: Requirements 7.5**

### Property 22: Individual Expense Required Fields

*For any* individual expense creation attempt, if amount, category, or date is missing, the system should reject the creation.

**Validates: Requirements 8.2**

### Property 23: Individual Expense Independence

*For any* individual expense created manually, it should have auto_generated=false and master_expense_id=null.

**Validates: Requirements 8.4**

### Property 24: Monthly Instance Edit Isolation

*For any* monthly expense entry edited by a user, the manually_adjusted flag should be set to true and the source master expense definition should remain unchanged.

**Validates: Requirements 9.3, 9.4**

### Property 25: Total Monthly Recurring Obligations

*For any* set of active master expenses, the sum of their amounts should equal the total monthly recurring expense obligation.

**Validates: Requirements 10.2**

### Property 26: EMI Remaining Tenure Calculation

*For any* active EMI, the remaining tenure should equal the number of months between current_date and end_date.

**Validates: Requirements 10.3**

### Property 27: Total Remaining EMI Amount

*For any* active EMI, the total remaining amount should equal (monthly amount × remaining tenure months).

**Validates: Requirements 10.5**

### Property 28: Audit Trail Completeness

*For any* master expense creation or modification, the created_by (for creation) or last_modified_by (for modification) field should be set to the user performing the action, and updated_at should be set to the current timestamp.

**Validates: Requirements 11.4, 11.5**

### Property 29: Maximum Amount Validation

*For any* expense (master or individual), if the amount exceeds the configured maximum limit, the system should reject the save operation.

**Validates: Requirements 13.6**

## Error Handling

### Carry-Forward Engine Error Handling

The recurring expense engine must handle errors gracefully to ensure system reliability:

**Retry Strategy**
- Failed carry-forward operations retry up to 3 times with exponential backoff (1s, 2s, 4s)
- Each retry attempt is logged with error details
- After 3 failed attempts, the error is escalated to admin notification

**Partial Success Handling**
- If some master expenses generate entries successfully but others fail, the successful entries are committed
- Failed master expenses are logged individually
- The engine continues processing remaining master expenses
- Status is marked as 'partial_success' with details of failures

**Error Logging**
- All carry-forward executions are logged in recurring_engine_logs table
- Error details stored in JSONB format for debugging
- Includes: master_expense_id, error_type, error_message, stack_trace

**Database Transaction Management**
- Each monthly entry generation is wrapped in a transaction
- Failed transactions are rolled back without affecting other entries
- Referential integrity is maintained even during partial failures

**Validation Errors**
- Input validation errors return HTTP 400 with descriptive error messages
- Field-level validation errors specify which field failed and why
- Date validation errors include the invalid dates and expected format

**Notification Failures**
- Subscription renewal reminders and EMI completion notifications are non-blocking
- Failed notifications are logged but don't prevent carry-forward execution
- Notification retry queue for failed deliveries

### User-Facing Error Messages

**Master Expense Creation Errors**
```
- "Amount must be greater than zero"
- "End date must be after start date"
- "EMI requires start date, end date, and monthly amount"
- "Amount exceeds maximum limit of ₹{max_limit}"
```

**Master Expense Edit Errors**
```
- "Cannot edit completed EMI"
- "Master expense not found or access denied"
- "Invalid status transition"
```

**Carry-Forward Engine Errors**
```
- "Failed to generate monthly expenses. Please try again or contact support."
- "Partial success: {count} expenses generated, {failed_count} failed"
```

## Testing Strategy

### Dual Testing Approach

This feature requires both unit testing and property-based testing for comprehensive coverage:

**Unit Tests** focus on:
- Specific examples of master expense creation (EMI, subscription, utility)
- Edge cases (end date exactly today, zero tenure, boundary amounts)
- Error conditions (missing fields, invalid dates, permission denied)
- Integration points (Supabase queries, notification sending)
- UI component rendering and user interactions

**Property-Based Tests** focus on:
- Universal properties across all inputs (validation rules, calculations)
- Comprehensive input coverage through randomization
- Invariants that must hold regardless of data values
- State transitions and lifecycle management

### Property-Based Testing Configuration

**Testing Library**: Use `fast-check` for JavaScript property-based testing

**Test Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with reference to design document property
- Tag format: `Feature: recurring-expenses-auto-carry-forward, Property {number}: {property_text}`

**Example Property Test Structure**:
```javascript
// Feature: recurring-expenses-auto-carry-forward, Property 2: Positive Amount Validation
test('master expense with non-positive amount should be rejected', () => {
  fc.assert(
    fc.property(
      fc.record({
        name: fc.string({ minLength: 1 }),
        amount: fc.integer({ max: 0 }), // Generate amounts <= 0
        category: fc.constantFrom('housing', 'transportation', 'utilities'),
        family_id: fc.uuid(),
      }),
      async (expenseData) => {
        const result = await masterExpenseService.create(expenseData);
        expect(result.success).toBe(false);
        expect(result.error).toContain('amount');
      }
    ),
    { numRuns: 100 }
  );
});
```

### Unit Test Coverage Areas

**Master Expense Service**
- Create master expense with valid data
- Create EMI with tenure calculation
- Create subscription with renewal date
- Edit master expense and verify future entries affected
- Pause/resume/cancel lifecycle transitions
- Prevent editing completed EMI

**Recurring Expense Engine**
- Generate entries for active master expenses
- Skip paused and cancelled master expenses
- Skip expired master expenses
- Mark completed EMIs
- Handle annual subscription frequency
- Retry logic on failures
- Partial success scenarios

**Expense Entry Service**
- Create individual expense
- Edit monthly instance without affecting master
- Set manually_adjusted flag on edit
- Query expenses with auto-generated filter

**Data Integrity**
- Referential integrity between master_expenses and expenses
- Cascade delete behavior
- Audit trail fields populated correctly

**UI Components**
- Master expense dashboard renders correctly
- Monthly expense view shows auto-generated indicators
- Toggle to show/hide auto-generated expenses
- EMI timeline visualization
- Subscription renewal reminders display

### Test Data Generators

**Master Expense Generator**
```javascript
const masterExpenseArbitrary = fc.record({
  name: fc.string({ minLength: 1, maxLength: 255 }),
  amount: fc.integer({ min: 1, max: 1000000 }),
  category: fc.constantFrom('housing', 'transportation', 'utilities', 'insurance', 'groceries'),
  expense_type: fc.constantFrom('emi', 'subscription', 'utility', 'grocery', 'other'),
  start_date: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
  end_date: fc.option(fc.date({ min: new Date('2020-01-01'), max: new Date('2050-12-31') })),
  status: fc.constantFrom('active', 'paused', 'completed', 'cancelled'),
});
```

**EMI Generator**
```javascript
const emiArbitrary = fc.record({
  name: fc.string({ minLength: 1 }),
  amount: fc.integer({ min: 5000, max: 100000 }),
  category: fc.constantFrom('housing', 'transportation'),
  expense_type: fc.constant('emi'),
  is_emi: fc.constant(true),
  emi_type: fc.constantFrom('house_loan', 'car_loan', 'personal_loan', 'education_loan'),
  start_date: fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }),
  tenure_months: fc.integer({ min: 12, max: 360 }),
}).map(emi => ({
  ...emi,
  end_date: addMonths(emi.start_date, emi.tenure_months),
  total_amount: emi.amount * emi.tenure_months,
}));
```

### Integration Testing

**Carry-Forward Engine Integration Test**
- Set up test database with sample master expenses
- Run carry-forward engine
- Verify correct number of entries generated
- Verify entry data matches master definitions
- Verify completed EMIs marked correctly

**End-to-End User Flows**
1. User creates EMI → verify stored correctly → run carry-forward → verify entry generated
2. User creates subscription → run carry-forward 12 times → verify annual frequency respected
3. User pauses master expense → run carry-forward → verify no entry generated → resume → verify entry generated next month
4. User edits master expense amount → verify past entries unchanged → run carry-forward → verify new amount used
5. EMI reaches end date → run carry-forward → verify marked completed and no entry generated

### Performance Testing

**Carry-Forward Engine Performance**
- Test with 1000 active master expenses across 100 families
- Measure execution time (target: < 30 seconds)
- Verify database query efficiency (use EXPLAIN ANALYZE)
- Test concurrent family operations during carry-forward

**Database Query Optimization**
- Index on master_expenses(status, end_date)
- Index on expenses(entry_date, family_id)
- Index on expenses(master_expense_id)
- Batch insert for monthly entries

### Backward Compatibility Testing

**Migration Testing**
- Verify existing expenses table schema migration
- Test that existing expenses display correctly
- Verify existing expense entry API still works
- Test that new columns default correctly for existing data

**Rollback Testing**
- Verify system functions if new columns are null
- Test graceful degradation if master_expenses table unavailable

