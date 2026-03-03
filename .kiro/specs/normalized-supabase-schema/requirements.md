# Requirements Document

## Introduction

Phase 1.6 of FamLedgerAI: migrate from a single `user_data` row (JSON blobs keyed by email) to a normalized, scalable Supabase schema with strict Row-Level Security (RLS). The normalized schema introduces household-scoped tables for incomes, expenses, investments, loans, insurance policies, and computed engine outputs (forecasts, risk scores, stress results). RLS policies enforce that only household members can access their household data, with role-based write restrictions. A migration plan covers DDL, backfill from existing JSON data, and rollback.

## Glossary

- **Household**: A logical grouping of family members who share financial data; maps to one row in the `households` table.
- **Household_Member**: A person belonging to a Household; maps to one row in `household_members`. Has a role: owner, spouse, or dependent.
- **User_Profile**: The link between a Supabase Auth user (UUID) and a Household, including the user's role within that Household.
- **Auth_User**: A user registered in Supabase Auth (`auth.users`), identified by a UUID.
- **RLS**: Row-Level Security; Supabase/Postgres feature that restricts row access based on the authenticated user's JWT claims.
- **Service_Role_Key**: A Supabase key that bypasses RLS; used only by the server-side API (`famledgerai/api/[...catchall].js`).
- **Anon_Key**: A Supabase key used by the client; subject to RLS policies.
- **Backfill_Script**: A SQL or JS script that reads existing `user_data` JSON rows and inserts normalized rows into the new tables.
- **Forecast_Engine**: The deterministic client-side engine that computes 15-year financial forecasts.
- **Risk_Engine**: The deterministic client-side engine that computes risk scores.
- **Stress_Engine**: The deterministic client-side engine that runs stress-test scenarios.
- **Overview_Page**: The main dashboard page that displays KPIs (income, expenses, EMI, investments, insurance coverage).
- **DDL**: Data Definition Language; SQL statements that create or alter database objects (CREATE TABLE, ALTER TABLE).
- **Migration_Checklist**: An ordered list of steps to execute the schema migration safely.

## Requirements

### Requirement 1: Households Table

**User Story:** As a family admin, I want a dedicated households table, so that all family financial data is scoped to a single household entity.

#### Acceptance Criteria

1. THE DDL SHALL create a `households` table with columns: `id` (UUID, PK, default `gen_random_uuid()`), `name` (TEXT, NOT NULL), `created_at` (TIMESTAMPTZ, default `now()`), `updated_at` (TIMESTAMPTZ, default `now()`).
2. THE DDL SHALL enable RLS on the `households` table.
3. WHEN an Auth_User queries the `households` table via Anon_Key, THE RLS_Policy SHALL allow SELECT only if the Auth_User has a corresponding row in `user_profiles` for that Household.
4. WHEN an Auth_User with role 'owner' performs INSERT, UPDATE, or DELETE on the `households` table via Anon_Key, THE RLS_Policy SHALL allow the operation.
5. IF an Auth_User with role 'dependent' attempts to UPDATE or DELETE a Household, THEN THE RLS_Policy SHALL deny the operation.

### Requirement 2: Household Members Table

**User Story:** As a family admin, I want to track each family member (self, spouse, kids, parents) as a separate row, so that financial data can be attributed per member.

#### Acceptance Criteria

1. THE DDL SHALL create a `household_members` table with columns: `id` (UUID, PK, default `gen_random_uuid()`), `household_id` (UUID, FK → `households.id`, NOT NULL), `name` (TEXT, NOT NULL), `role` (TEXT, NOT NULL, CHECK IN ('self','spouse','kid','parent','other')), `date_of_birth` (DATE), `created_at` (TIMESTAMPTZ, default `now()`).
2. THE DDL SHALL create an index on `household_members(household_id)`.
3. WHEN an Auth_User queries `household_members` via Anon_Key, THE RLS_Policy SHALL allow SELECT only if the Auth_User belongs to the same Household.
4. WHEN an Auth_User with role 'owner' or 'spouse' performs INSERT, UPDATE, or DELETE on `household_members`, THE RLS_Policy SHALL allow the operation.
5. IF an Auth_User with role 'dependent' attempts to INSERT, UPDATE, or DELETE on `household_members`, THEN THE RLS_Policy SHALL deny the operation.

### Requirement 3: User Profiles Table

**User Story:** As a registered user, I want my Supabase Auth identity linked to a household with a specific role, so that RLS can determine my access level.

#### Acceptance Criteria

1. THE DDL SHALL create a `user_profiles` table with columns: `id` (UUID, PK, default `gen_random_uuid()`), `auth_uid` (UUID, NOT NULL, UNIQUE, references `auth.users(id)`), `household_id` (UUID, FK → `households.id`, NOT NULL), `member_id` (UUID, FK → `household_members.id`), `role` (TEXT, NOT NULL, CHECK IN ('owner','spouse','dependent'), default 'owner'), `email` (TEXT, NOT NULL), `display_name` (TEXT), `phone` (TEXT), `created_at` (TIMESTAMPTZ, default `now()`).
2. THE DDL SHALL create an index on `user_profiles(household_id)`.
3. THE DDL SHALL create a unique index on `user_profiles(auth_uid)`.
4. WHEN an Auth_User queries `user_profiles` via Anon_Key, THE RLS_Policy SHALL allow SELECT only for rows where `auth_uid = auth.uid()` or the row belongs to the same Household as the Auth_User.
5. THE RLS_Policy SHALL allow an Auth_User to UPDATE only the `user_profiles` row where `auth_uid = auth.uid()`.

### Requirement 4: Incomes Table

**User Story:** As a household member, I want income records stored as individual rows with type and amount, so that income data is queryable and attributable per member.

#### Acceptance Criteria

1. THE DDL SHALL create an `incomes` table with columns: `id` (UUID, PK), `household_id` (UUID, FK → `households.id`, NOT NULL), `member_id` (UUID, FK → `household_members.id`, NOT NULL), `type` (TEXT, NOT NULL, e.g. 'salary','rental','business','freelance','other'), `amount` (NUMERIC, NOT NULL), `frequency` (TEXT, NOT NULL, default 'monthly'), `is_active` (BOOLEAN, default TRUE), `created_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ).
2. THE DDL SHALL create an index on `incomes(household_id, member_id)`.
3. WHEN an Auth_User queries `incomes` via Anon_Key, THE RLS_Policy SHALL allow SELECT only if the Auth_User belongs to the same Household.
4. WHEN an Auth_User with role 'owner' or 'spouse' performs INSERT, UPDATE, or DELETE on `incomes`, THE RLS_Policy SHALL allow the operation.
5. IF an Auth_User with role 'dependent' attempts to INSERT, UPDATE, or DELETE on `incomes`, THEN THE RLS_Policy SHALL deny the operation.

### Requirement 5: Expenses Table

**User Story:** As a household member, I want expenses stored as individual rows with category, amount, month, and member attribution, so that spending is trackable per member and per month.

#### Acceptance Criteria

1. THE DDL SHALL create an `expenses` table with columns: `id` (UUID, PK), `household_id` (UUID, FK → `households.id`, NOT NULL), `member_id` (UUID, FK → `household_members.id`, NOT NULL), `category` (TEXT, NOT NULL), `label` (TEXT), `amount` (NUMERIC, NOT NULL), `month` (TEXT, NOT NULL, format 'YYYY-MM'), `is_recurring` (BOOLEAN, default FALSE), `frequency` (TEXT), `created_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ).
2. THE DDL SHALL create an index on `expenses(household_id, month)`.
3. THE DDL SHALL create an index on `expenses(household_id, member_id)`.
4. WHEN an Auth_User queries `expenses` via Anon_Key, THE RLS_Policy SHALL allow SELECT only if the Auth_User belongs to the same Household.
5. WHEN an Auth_User with role 'owner' or 'spouse' performs INSERT, UPDATE, or DELETE on `expenses`, THE RLS_Policy SHALL allow the operation.
6. IF an Auth_User with role 'dependent' attempts to INSERT, UPDATE, or DELETE on `expenses`, THEN THE RLS_Policy SHALL deny the operation.

### Requirement 6: Investments Table

**User Story:** As a household member, I want investments (mutual funds, stocks, FDs, PPF) stored as individual rows per member, so that portfolio data is normalized and queryable.

#### Acceptance Criteria

1. THE DDL SHALL create an `investments` table with columns: `id` (UUID, PK), `household_id` (UUID, FK → `households.id`, NOT NULL), `member_id` (UUID, FK → `household_members.id`, NOT NULL), `type` (TEXT, NOT NULL, CHECK IN ('mutual_fund','stock','fd','ppf','nps','gold','other')), `name` (TEXT, NOT NULL), `value` (NUMERIC, NOT NULL, default 0), `units` (NUMERIC), `nav` (NUMERIC), `purchase_date` (DATE), `rate` (NUMERIC), `maturity_date` (DATE), `sip_amount` (NUMERIC), `meta` (JSONB, default '{}'), `created_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ).
2. THE DDL SHALL create an index on `investments(household_id, member_id)`.
3. THE DDL SHALL create an index on `investments(household_id, type)`.
4. WHEN an Auth_User queries `investments` via Anon_Key, THE RLS_Policy SHALL allow SELECT only if the Auth_User belongs to the same Household.
5. WHEN an Auth_User with role 'owner' or 'spouse' performs INSERT, UPDATE, or DELETE on `investments`, THE RLS_Policy SHALL allow the operation.
6. IF an Auth_User with role 'dependent' attempts to INSERT, UPDATE, or DELETE on `investments`, THEN THE RLS_Policy SHALL deny the operation.

### Requirement 7: Loans Table

**User Story:** As a household member, I want loans stored as individual rows with EMI, rate, outstanding balance, and member attribution, so that debt data is normalized.

#### Acceptance Criteria

1. THE DDL SHALL create a `loans` table with columns: `id` (UUID, PK), `household_id` (UUID, FK → `households.id`, NOT NULL), `member_id` (UUID, FK → `household_members.id`, NOT NULL), `type` (TEXT, NOT NULL, e.g. 'home','car','personal','education','gold','other'), `lender` (TEXT), `principal` (NUMERIC), `outstanding` (NUMERIC, NOT NULL, default 0), `rate` (NUMERIC, NOT NULL), `emi` (NUMERIC, NOT NULL, default 0), `tenure_months` (INTEGER), `start_date` (DATE), `end_date` (DATE), `meta` (JSONB, default '{}'), `created_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ).
2. THE DDL SHALL create an index on `loans(household_id, member_id)`.
3. WHEN an Auth_User queries `loans` via Anon_Key, THE RLS_Policy SHALL allow SELECT only if the Auth_User belongs to the same Household.
4. WHEN an Auth_User with role 'owner' or 'spouse' performs INSERT, UPDATE, or DELETE on `loans`, THE RLS_Policy SHALL allow the operation.
5. IF an Auth_User with role 'dependent' attempts to INSERT, UPDATE, or DELETE on `loans`, THEN THE RLS_Policy SHALL deny the operation.

### Requirement 8: Insurance Policies Table

**User Story:** As a household member, I want insurance policies (term, health, vehicle, life, home) stored as individual rows per member, so that coverage data is normalized and queryable.

#### Acceptance Criteria

1. THE DDL SHALL create an `insurance_policies` table with columns: `id` (UUID, PK), `household_id` (UUID, FK → `households.id`, NOT NULL), `member_id` (UUID, FK → `household_members.id`, NOT NULL), `type` (TEXT, NOT NULL, CHECK IN ('term','health','vehicle','life','home','other')), `provider` (TEXT), `policy_number` (TEXT), `cover_amount` (NUMERIC, NOT NULL, default 0), `premium` (NUMERIC), `premium_frequency` (TEXT, default 'yearly'), `start_date` (DATE), `end_date` (DATE), `meta` (JSONB, default '{}'), `created_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ).
2. THE DDL SHALL create an index on `insurance_policies(household_id, member_id)`.
3. WHEN an Auth_User queries `insurance_policies` via Anon_Key, THE RLS_Policy SHALL allow SELECT only if the Auth_User belongs to the same Household.
4. WHEN an Auth_User with role 'owner' or 'spouse' performs INSERT, UPDATE, or DELETE on `insurance_policies`, THE RLS_Policy SHALL allow the operation.
5. IF an Auth_User with role 'dependent' attempts to INSERT, UPDATE, or DELETE on `insurance_policies`, THEN THE RLS_Policy SHALL deny the operation.

### Requirement 9: Forecast Assumptions Table

**User Story:** As a household owner, I want to store forecast assumptions (inflation rate, equity return, debt return, etc.) per household, so that the client-side Forecast_Engine can load them.

#### Acceptance Criteria

1. THE DDL SHALL create a `forecast_assumptions` table with columns: `id` (UUID, PK), `household_id` (UUID, FK → `households.id`, NOT NULL, UNIQUE), `inflation_rate` (NUMERIC, NOT NULL, default 0.06), `equity_return` (NUMERIC, NOT NULL, default 0.12), `debt_return` (NUMERIC, NOT NULL, default 0.07), `salary_growth` (NUMERIC, NOT NULL, default 0.08), `expense_growth` (NUMERIC, NOT NULL, default 0.06), `retirement_age` (INTEGER, default 60), `life_expectancy` (INTEGER, default 85), `meta` (JSONB, default '{}'), `updated_at` (TIMESTAMPTZ, default `now()`).
2. WHEN an Auth_User queries `forecast_assumptions` via Anon_Key, THE RLS_Policy SHALL allow SELECT only if the Auth_User belongs to the same Household.
3. WHEN an Auth_User with role 'owner' or 'spouse' performs INSERT or UPDATE on `forecast_assumptions`, THE RLS_Policy SHALL allow the operation.
4. IF an Auth_User with role 'dependent' attempts to UPDATE `forecast_assumptions`, THEN THE RLS_Policy SHALL deny the operation.

### Requirement 10: Computed Forecasts Table

**User Story:** As a household member, I want computed forecast results (yearly series) persisted, so that the Overview_Page can load them without re-running the Forecast_Engine.

#### Acceptance Criteria

1. THE DDL SHALL create a `computed_forecasts` table with columns: `id` (UUID, PK), `household_id` (UUID, FK → `households.id`, NOT NULL), `member_id` (UUID, FK → `household_members.id`), `year` (INTEGER, NOT NULL), `projected_income` (NUMERIC), `projected_expenses` (NUMERIC), `projected_investments` (NUMERIC), `projected_net_worth` (NUMERIC), `assumptions_snapshot` (JSONB), `computed_at` (TIMESTAMPTZ, NOT NULL, default `now()`).
2. THE DDL SHALL create an index on `computed_forecasts(household_id, year)`.
3. THE DDL SHALL create a unique constraint on `computed_forecasts(household_id, member_id, year)` to prevent duplicate year entries per member.
4. WHEN an Auth_User queries `computed_forecasts` via Anon_Key, THE RLS_Policy SHALL allow SELECT only if the Auth_User belongs to the same Household.
5. WHEN an Auth_User with role 'owner' or 'spouse' performs INSERT, UPDATE, or DELETE on `computed_forecasts`, THE RLS_Policy SHALL allow the operation.

### Requirement 11: Computed Risk Scores Table

**User Story:** As a household member, I want computed risk score snapshots persisted, so that the Overview_Page can display risk metrics without re-running the Risk_Engine.

#### Acceptance Criteria

1. THE DDL SHALL create a `computed_risk_scores` table with columns: `id` (UUID, PK), `household_id` (UUID, FK → `households.id`, NOT NULL), `member_id` (UUID, FK → `household_members.id`), `overall_score` (NUMERIC, NOT NULL), `category_scores` (JSONB, NOT NULL), `risk_level` (TEXT, NOT NULL, CHECK IN ('low','medium','high','critical')), `computed_at` (TIMESTAMPTZ, NOT NULL, default `now()`).
2. THE DDL SHALL create an index on `computed_risk_scores(household_id)`.
3. WHEN an Auth_User queries `computed_risk_scores` via Anon_Key, THE RLS_Policy SHALL allow SELECT only if the Auth_User belongs to the same Household.
4. WHEN an Auth_User with role 'owner' or 'spouse' performs INSERT or UPDATE on `computed_risk_scores`, THE RLS_Policy SHALL allow the operation.

### Requirement 12: Computed Stress Results Table

**User Story:** As a household member, I want computed stress-test scenario results persisted, so that the Overview_Page can display stress metrics without re-running the Stress_Engine.

#### Acceptance Criteria

1. THE DDL SHALL create a `computed_stress_results` table with columns: `id` (UUID, PK), `household_id` (UUID, FK → `households.id`, NOT NULL), `scenario_name` (TEXT, NOT NULL), `parameters` (JSONB, NOT NULL), `results` (JSONB, NOT NULL), `survival_months` (INTEGER), `computed_at` (TIMESTAMPTZ, NOT NULL, default `now()`).
2. THE DDL SHALL create an index on `computed_stress_results(household_id)`.
3. WHEN an Auth_User queries `computed_stress_results` via Anon_Key, THE RLS_Policy SHALL allow SELECT only if the Auth_User belongs to the same Household.
4. WHEN an Auth_User with role 'owner' or 'spouse' performs INSERT, UPDATE, or DELETE on `computed_stress_results`, THE RLS_Policy SHALL allow the operation.

### Requirement 13: RLS Helper Function

**User Story:** As a database administrator, I want a reusable SQL function that checks household membership, so that RLS policies are DRY and consistent across all tables.

#### Acceptance Criteria

1. THE DDL SHALL create a SQL function `is_household_member(hid UUID)` that returns TRUE if `auth.uid()` has a row in `user_profiles` where `household_id = hid`.
2. THE DDL SHALL create a SQL function `household_role(hid UUID)` that returns the `role` TEXT from `user_profiles` for the current `auth.uid()` and the given `hid`.
3. WHEN any RLS policy checks household membership, THE RLS_Policy SHALL use `is_household_member(household_id)` rather than inline subqueries.
4. WHEN any RLS policy checks write permissions, THE RLS_Policy SHALL use `household_role(household_id)` to verify the user's role is 'owner' or 'spouse'.

### Requirement 14: Migration and Backfill Strategy

**User Story:** As a developer, I want a step-by-step migration plan with backfill script strategy and rollback, so that existing user data is preserved during the schema transition.

#### Acceptance Criteria

1. THE Migration_Checklist SHALL include a step to back up the existing `user_data` table before any DDL changes.
2. THE Migration_Checklist SHALL include ordered DDL steps: create helper functions, create `households`, create `household_members`, create `user_profiles`, create financial tables, create computed tables, enable RLS, create policies, create indexes.
3. THE Migration_Checklist SHALL include a backfill strategy that reads each `user_data` row, creates a Household, creates Household_Members from `profile.familyMembers`, creates a User_Profile linking `profile._authUid` to the Household, and inserts normalized rows into `incomes`, `expenses`, `investments`, `loans`, and `insurance_policies`.
4. THE Migration_Checklist SHALL include a rollback strategy that drops the new tables in reverse dependency order without affecting the existing `user_data` table.
5. THE Migration_Checklist SHALL specify that the existing `user_data` table remains intact and functional throughout the migration period.
6. WHILE the migration is in progress, THE API SHALL continue to read from and write to the `user_data` table using Service_Role_Key, ensuring zero downtime.

### Requirement 15: Index Strategy for Overview Page Queries

**User Story:** As a developer, I want indexes optimized for the Overview_Page query patterns, so that dashboard loads remain fast as data grows.

#### Acceptance Criteria

1. THE DDL SHALL create composite indexes on `(household_id, member_id)` for `incomes`, `expenses`, `investments`, `loans`, and `insurance_policies` tables.
2. THE DDL SHALL create an index on `expenses(household_id, month)` to support monthly expense aggregation queries.
3. THE DDL SHALL create an index on `computed_forecasts(household_id, year)` to support forecast series lookups.
4. THE DDL SHALL create an index on `computed_risk_scores(household_id)` and `computed_stress_results(household_id)` to support latest-snapshot queries.
5. THE DDL SHALL include a `COMMENT ON INDEX` or inline SQL comment documenting the query pattern each index supports.
