-- ============================================================================
-- RECURRING EXPENSES & AUTO-CARRY FORWARD FEATURE
-- Database Migration Script
-- ============================================================================
-- This script creates the necessary tables and indexes for the recurring
-- expenses feature. Execute this in your Supabase SQL Editor.
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE 1: master_expenses
-- Stores recurring/mandatory expense definitions
-- ============================================================================

CREATE TABLE IF NOT EXISTS master_expenses (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Foreign keys (Note: Adjust these based on your actual schema)
    -- If you don't have families/users tables, you can use email instead
    family_id VARCHAR(255) NOT NULL, -- Can be email or UUID based on your setup
    created_by VARCHAR(255) NOT NULL, -- User email who created this
    
    -- Basic expense information
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    category VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Expense type and frequency
    expense_type VARCHAR(50) NOT NULL DEFAULT 'other', 
    -- Values: 'emi', 'subscription', 'utility', 'grocery', 'other'
    frequency VARCHAR(50) DEFAULT 'monthly', 
    -- Values: 'monthly', 'annual'
    
    -- Date range
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE, -- NULL for indefinite, set for EMIs
    
    -- EMI-specific fields
    is_emi BOOLEAN DEFAULT FALSE,
    emi_type VARCHAR(100), 
    -- Values: 'house_loan', 'car_loan', 'personal_loan', 'education_loan'
    tenure_months INTEGER, -- Calculated: months between start_date and end_date
    total_amount DECIMAL(12, 2), -- Total EMI amount (amount * tenure_months)
    
    -- Subscription-specific fields
    is_subscription BOOLEAN DEFAULT FALSE,
    service_name VARCHAR(255),
    renewal_date DATE,
    
    -- Lifecycle management
    status VARCHAR(50) NOT NULL DEFAULT 'active', 
    -- Values: 'active', 'paused', 'completed', 'cancelled'
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_modified_by VARCHAR(255), -- User email who last modified
    
    -- Constraints
    CONSTRAINT valid_expense_type CHECK (expense_type IN ('emi', 'subscription', 'utility', 'grocery', 'other')),
    CONSTRAINT valid_frequency CHECK (frequency IN ('monthly', 'annual')),
    CONSTRAINT valid_status CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
    CONSTRAINT valid_date_range CHECK (end_date IS NULL OR end_date > start_date)
);

-- Indexes for master_expenses
CREATE INDEX IF NOT EXISTS idx_master_expenses_family ON master_expenses(family_id);
CREATE INDEX IF NOT EXISTS idx_master_expenses_status ON master_expenses(status);
CREATE INDEX IF NOT EXISTS idx_master_expenses_end_date ON master_expenses(end_date);
CREATE INDEX IF NOT EXISTS idx_master_expenses_type ON master_expenses(expense_type);
CREATE INDEX IF NOT EXISTS idx_master_expenses_created_at ON master_expenses(created_at);

-- ============================================================================
-- TABLE 2: expenses
-- Stores individual expense entries (both manual and auto-generated)
-- ============================================================================

CREATE TABLE IF NOT EXISTS expenses (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Foreign keys
    family_id VARCHAR(255) NOT NULL,
    master_expense_id UUID REFERENCES master_expenses(id) ON DELETE SET NULL,
    
    -- Basic expense information
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    category VARCHAR(100) NOT NULL,
    description TEXT,
    entry_date DATE NOT NULL,
    
    -- Auto-generation tracking
    auto_generated BOOLEAN DEFAULT FALSE,
    manually_adjusted BOOLEAN DEFAULT FALSE,
    original_amount DECIMAL(12, 2), -- Original amount before manual adjustment
    
    -- Member tracking (optional - for family member attribution)
    member_name VARCHAR(255),
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255),
    
    -- Notes and attachments
    notes TEXT,
    receipt_url TEXT
);

-- Indexes for expenses
CREATE INDEX IF NOT EXISTS idx_expenses_family ON expenses(family_id);
CREATE INDEX IF NOT EXISTS idx_expenses_master_expense ON expenses(master_expense_id);
CREATE INDEX IF NOT EXISTS idx_expenses_auto_generated ON expenses(auto_generated);
CREATE INDEX IF NOT EXISTS idx_expenses_entry_date ON expenses(entry_date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses(created_at);

-- Composite index for common queries (family + month)
CREATE INDEX IF NOT EXISTS idx_expenses_family_date ON expenses(family_id, entry_date);

-- ============================================================================
-- TABLE 3: recurring_engine_logs
-- Tracks execution history of the carry-forward engine
-- ============================================================================

CREATE TABLE IF NOT EXISTS recurring_engine_logs (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Execution tracking
    execution_date DATE NOT NULL,
    execution_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) NOT NULL, 
    -- Values: 'success', 'partial_success', 'failed'
    
    -- Metrics
    entries_generated INTEGER DEFAULT 0,
    emis_completed INTEGER DEFAULT 0,
    reminders_sent INTEGER DEFAULT 0,
    errors_encountered INTEGER DEFAULT 0,
    execution_duration_ms INTEGER,
    
    -- Error details (JSONB for flexible error storage)
    error_details JSONB,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_log_status CHECK (status IN ('success', 'partial_success', 'failed'))
);

-- Indexes for recurring_engine_logs
CREATE INDEX IF NOT EXISTS idx_engine_logs_date ON recurring_engine_logs(execution_date);
CREATE INDEX IF NOT EXISTS idx_engine_logs_status ON recurring_engine_logs(status);
CREATE INDEX IF NOT EXISTS idx_engine_logs_execution_time ON recurring_engine_logs(execution_time);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for master_expenses
DROP TRIGGER IF EXISTS update_master_expenses_updated_at ON master_expenses;
CREATE TRIGGER update_master_expenses_updated_at
    BEFORE UPDATE ON master_expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for expenses
DROP TRIGGER IF EXISTS update_expenses_updated_at ON expenses;
CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Note: Adjust these policies based on your authentication setup
-- These are examples assuming email-based authentication

-- Enable RLS on tables
ALTER TABLE master_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_engine_logs ENABLE ROW LEVEL SECURITY;

-- Master Expenses Policies
-- Users can view master expenses for their family
CREATE POLICY "Users can view their family's master expenses"
    ON master_expenses FOR SELECT
    USING (family_id = current_setting('app.current_user_email', true));

-- Users can insert master expenses for their family
CREATE POLICY "Users can create master expenses for their family"
    ON master_expenses FOR INSERT
    WITH CHECK (family_id = current_setting('app.current_user_email', true));

-- Users can update their family's master expenses
CREATE POLICY "Users can update their family's master expenses"
    ON master_expenses FOR UPDATE
    USING (family_id = current_setting('app.current_user_email', true));

-- Users can delete their family's master expenses
CREATE POLICY "Users can delete their family's master expenses"
    ON master_expenses FOR DELETE
    USING (family_id = current_setting('app.current_user_email', true));

-- Expenses Policies
-- Users can view expenses for their family
CREATE POLICY "Users can view their family's expenses"
    ON expenses FOR SELECT
    USING (family_id = current_setting('app.current_user_email', true));

-- Users can insert expenses for their family
CREATE POLICY "Users can create expenses for their family"
    ON expenses FOR INSERT
    WITH CHECK (family_id = current_setting('app.current_user_email', true));

-- Users can update their family's expenses
CREATE POLICY "Users can update their family's expenses"
    ON expenses FOR UPDATE
    USING (family_id = current_setting('app.current_user_email', true));

-- Users can delete their family's expenses
CREATE POLICY "Users can delete their family's expenses"
    ON expenses FOR DELETE
    USING (family_id = current_setting('app.current_user_email', true));

-- Recurring Engine Logs Policies (read-only for users, write for service)
CREATE POLICY "Users can view engine logs"
    ON recurring_engine_logs FOR SELECT
    USING (true); -- All authenticated users can view logs

-- Service role can insert logs (you'll need to use service_role key for this)
CREATE POLICY "Service can insert engine logs"
    ON recurring_engine_logs FOR INSERT
    WITH CHECK (true);

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Uncomment to insert sample data for testing
/*
-- Sample Master Expense: House Loan EMI
INSERT INTO master_expenses (
    family_id, created_by, name, amount, category, 
    expense_type, is_emi, emi_type, start_date, end_date, 
    tenure_months, total_amount, status
) VALUES (
    'test@example.com', 'test@example.com', 'Home Loan EMI', 35000, 'housing',
    'emi', true, 'house_loan', '2024-01-01', '2044-01-01',
    240, 8400000, 'active'
);

-- Sample Master Expense: Netflix Subscription
INSERT INTO master_expenses (
    family_id, created_by, name, amount, category,
    expense_type, is_subscription, service_name, renewal_date,
    frequency, status
) VALUES (
    'test@example.com', 'test@example.com', 'Netflix Premium', 649, 'entertainment',
    'subscription', true, 'Netflix', '2024-12-15',
    'monthly', 'active'
);

-- Sample Master Expense: Groceries
INSERT INTO master_expenses (
    family_id, created_by, name, amount, category,
    expense_type, frequency, status
) VALUES (
    'test@example.com', 'test@example.com', 'Monthly Groceries', 15000, 'groceries',
    'grocery', 'monthly', 'active'
);

-- Sample Individual Expense
INSERT INTO expenses (
    family_id, amount, category, description, entry_date,
    auto_generated, created_by
) VALUES (
    'test@example.com', 2500, 'entertainment', 'Movie tickets and dinner',
    CURRENT_DATE, false, 'test@example.com'
);
*/

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check if tables were created successfully
SELECT 
    table_name, 
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_name IN ('master_expenses', 'expenses', 'recurring_engine_logs')
ORDER BY table_name;

-- Check indexes
SELECT 
    tablename, 
    indexname, 
    indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
    AND tablename IN ('master_expenses', 'expenses', 'recurring_engine_logs')
ORDER BY tablename, indexname;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Next steps:
-- 1. Execute this script in Supabase SQL Editor
-- 2. Verify tables and indexes were created
-- 3. Test RLS policies with your authentication setup
-- 4. Adjust family_id and created_by columns if using UUID-based users table
-- 5. Proceed with implementing the application code
-- ============================================================================
