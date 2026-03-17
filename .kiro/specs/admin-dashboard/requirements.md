# Requirements Document

## Introduction

A secure, read-only admin dashboard for FamLedgerAI that provides a single designated administrator with visibility into platform metrics including user activity, revenue, churn, and feature usage. The dashboard enforces strict two-layer authentication, masks all personally identifiable information, excludes user financial data (transactions, investments, insurance details), and operates entirely on existing database tables using the Supabase service role client.

## Glossary

- **Admin_Dashboard**: The protected web interface at `/admin/*` routes providing read-only platform metrics to the designated administrator.
- **Admin_User**: The single authenticated Supabase user whose email matches the `ADMIN_EMAIL` environment variable.
- **Admin_Auth_Module**: The server-side module (`lib/admin/adminAuth.ts`) responsible for verifying two-layer admin access.
- **Admin_Supabase_Client**: A Supabase client (`lib/admin/adminSupabase.ts`) initialized with the `SUPABASE_SERVICE_ROLE_KEY` that bypasses Row Level Security, used exclusively in server-side admin API routes.
- **Middleware**: The Next.js middleware (`middleware.ts`) that intercepts requests and enforces authentication and authorization rules.
- **KPI_Card**: A reusable UI component displaying a single metric value with an optional trend indicator.
- **Admin_Table**: A reusable data table component with pagination, search, and filtering capabilities.
- **Admin_Chart**: A Recharts wrapper component providing consistent chart styling across admin pages.
- **MRR**: Monthly Recurring Revenue, calculated from active paid subscriptions.
- **ARR**: Annual Recurring Revenue, equal to MRR multiplied by 12.
- **ARPU**: Average Revenue Per User, calculated as MRR divided by total paying users.
- **LTV**: Lifetime Value, estimated revenue from a user over their expected subscription lifetime.
- **Churn_Rate**: The percentage of paying subscribers who cancel within a given period.
- **Masked_Data**: User-identifiable information (emails, names) that has been partially obscured for privacy.

## Requirements

### Requirement 1: Two-Layer Admin Authentication

**User Story:** As the platform owner, I want admin access restricted to a single verified user, so that only the designated administrator can view platform metrics.

#### Acceptance Criteria

1. WHEN a request is made to any `/admin/*` route, THE Middleware SHALL verify that the requester has an active Supabase session.
2. WHEN a request to any `/admin/*` route has a valid Supabase session, THE Middleware SHALL verify that the session user's email matches the `ADMIN_EMAIL` environment variable.
3. IF a request to any `/admin/*` route lacks a valid Supabase session, THEN THE Middleware SHALL redirect the requester to `/login`.
4. IF a request to any `/admin/*` route has a valid session but the email does not match `ADMIN_EMAIL`, THEN THE Middleware SHALL redirect the requester to `/dashboard`.
5. WHEN an unauthorized admin access attempt is detected (valid session, wrong email), THE Admin_Auth_Module SHALL log the attempt including the requester's email and timestamp.
6. THE Admin_Auth_Module SHALL expose a `verifyAdminAccess` function that accepts a Supabase session and returns an authorization result indicating success or the specific failure reason.
7. IF the `ADMIN_EMAIL` environment variable is not configured or is empty, THE Admin_Auth_Module SHALL deny all admin access regardless of the requester's session state.
8. THE Admin_Auth_Module SHALL log a server-side warning on every blocked request when `ADMIN_EMAIL` is not configured: `ADMIN_EMAIL not configured — admin access disabled`.
9. THE Middleware SHALL redirect all `/admin/*` requests to `/dashboard` when `ADMIN_EMAIL` is not configured, rather than throwing an unhandled error.

### Requirement 2: Admin API Route Protection

**User Story:** As the platform owner, I want all admin API endpoints protected with the same two-layer auth, so that platform data cannot be accessed programmatically by unauthorized users.

#### Acceptance Criteria

1. WHEN a request is made to any `/api/admin/*` endpoint without a valid Supabase session, THE API route SHALL return a 401 Unauthorized response with error code `UNAUTHORIZED`.
2. WHEN a request is made to any `/api/admin/*` endpoint with a valid session but a non-admin email, THE API route SHALL return a 403 Forbidden response with error code `FORBIDDEN`.
3. THE Admin_Auth_Module SHALL be invoked as the first operation in every `/api/admin/*` route handler before any data queries are executed.
4. WHEN an unauthorized API access attempt is detected, THE Admin_Auth_Module SHALL log the attempt including the endpoint path, requester email, and timestamp.
5. WHEN an admin API route returns HTTP 401 due to an expired or invalidated Supabase session, THE Admin_Dashboard client SHALL detect the 401 response and redirect the admin browser to `/login?returnTo=/admin` so the admin returns to the dashboard overview page after re-authenticating.
6. THE redirect SHALL preserve the `returnTo` parameter through the Supabase auth callback flow so the admin is not dropped at the default post-login page.

### Requirement 3: Admin Supabase Client Isolation

**User Story:** As the platform owner, I want admin database queries to use a dedicated service role client, so that admin reads bypass RLS without affecting the regular user client.

#### Acceptance Criteria

1. THE Admin_Supabase_Client SHALL be initialized with the `SUPABASE_SERVICE_ROLE_KEY` environment variable to bypass Row Level Security.
2. THE Admin_Supabase_Client SHALL be used exclusively within server-side `/api/admin/*` route handlers.
3. THE Admin_Supabase_Client SHALL perform only read operations (SELECT queries) against the database.
4. THE Admin_Supabase_Client SHALL reuse existing database tables without creating new tables, views, or stored procedures.
5. IF the `SUPABASE_SERVICE_ROLE_KEY` environment variable is not set or is empty at initialization time, THE Admin_Supabase_Client SHALL throw a configuration error immediately and THE admin API route SHALL return HTTP 503 Service Unavailable with `{ error: 'Admin service unavailable', code: 'SERVICE_UNAVAILABLE' }` rather than attempting to query with an invalid client.
6. THE configuration error SHALL be logged server-side with the message: `SUPABASE_SERVICE_ROLE_KEY not configured`.

### Requirement 4: Admin Layout and Navigation

**User Story:** As the admin user, I want a dedicated layout separate from the main dashboard, so that admin navigation is distinct and does not interfere with the regular user experience.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL render a separate layout at `app/(admin)/layout.tsx` that is independent of the main dashboard layout.
2. THE Admin_Dashboard layout SHALL display a dark sidebar of 200 pixels width containing navigation links to: Overview, Users, Revenue, Churn, Feature Usage, and Settings.
3. THE Admin_Dashboard layout SHALL display a "Back to App" link in the sidebar that navigates to `/dashboard`.
4. THE Admin_Dashboard layout SHALL display the authenticated admin email at the bottom of the sidebar.
5. THE Admin_Dashboard SHALL serve the following pages: Overview at `/admin`, Users at `/admin/users`, Revenue at `/admin/revenue`, Churn at `/admin/churn`, Feature Usage at `/admin/usage`, and Settings at `/admin/settings`.

### Requirement 5: Overview Page Metrics

**User Story:** As the admin user, I want a summary overview of key platform metrics, so that I can quickly assess the health of the platform at a glance.

#### Acceptance Criteria

1. WHEN the admin navigates to the Overview page, THE Admin_Dashboard SHALL display four KPI_Card components showing: total registered users, active paid subscribers, MRR, and ARR.
2. WHEN the admin navigates to the Overview page, THE Admin_Dashboard SHALL display a line chart showing the user signup trend over the past 12 months.
3. WHEN the admin navigates to the Overview page, THE Admin_Dashboard SHALL display a donut chart showing the breakdown of users by plan (Free, Pro, NRI Premium).
4. WHEN the admin navigates to the Overview page, THE Admin_Dashboard SHALL display a table of the 10 most recent signups with masked email addresses.
5. THE `/api/admin/overview` endpoint SHALL return total user count, plan breakdown counts, MRR, ARR, and monthly signup trend data.
6. WHEN no paid subscribers exist, THE Revenue and Churn pages SHALL display a descriptive empty state message in place of charts and revenue KPIs rather than rendering broken or zero-value visualizations.
7. WHEN fewer than 7 days of signup data exists in the database, THE signup trend chart SHALL render only the available data points without treating missing days as errors or showing visual gaps as broken state.
8. WHEN any dataset required for a chart contains zero records, THE Admin_Chart component SHALL render an empty state placeholder with a message describing what data will appear here once available.

### Requirement 6: User Management Page

**User Story:** As the admin user, I want to browse and search all registered users, so that I can understand the user base without accessing sensitive financial data.

#### Acceptance Criteria

1. WHEN the admin navigates to the Users page, THE Admin_Dashboard SHALL display a paginated table of users with 50 rows per page.
2. THE Users page SHALL support text search by masked email and filtering by plan type and subscription status.
3. THE Users page table SHALL display for each user: a masked user ID, masked email, masked display name, current plan, subscription status, signup date, and last active date.
4. THE Users page SHALL provide expandable rows showing the following non-financial user metadata only: subscription start date, billing cycle (monthly or annual), and current month usage counters (AI messages used, insurance analyses used, copilot runs used). Expandable rows SHALL NOT show any financial transaction data, investment records, insurance policy details, or income records.
5. THE Users page SHALL provide a CSV export function that excludes all sensitive and financial data.
6. THE `/api/admin/users` endpoint SHALL accept pagination parameters (page, limit), search query, and filter parameters.
7. THE `/api/admin/users` endpoint SHALL return user records with all emails and names masked using the masking utility.
8. THE `/api/admin/users` endpoint SHALL exclude all financial data including transactions, investments, insurance policy details, and income records.

### Requirement 7: Revenue Metrics Page

**User Story:** As the admin user, I want detailed revenue analytics, so that I can track the financial health and growth trajectory of the platform.

#### Acceptance Criteria

1. WHEN the admin navigates to the Revenue page, THE Admin_Dashboard SHALL display KPI_Card components showing: MRR, ARR, ARPU, and estimated LTV.
2. WHEN the admin navigates to the Revenue page, THE Admin_Dashboard SHALL display a bar chart showing monthly revenue for the past 12 months.
3. WHEN the admin navigates to the Revenue page, THE Admin_Dashboard SHALL display a pie chart showing the split between monthly and annual billing cycles.
4. WHEN the admin navigates to the Revenue page, THE Admin_Dashboard SHALL display a breakdown of revenue contribution by plan (Pro, NRI Premium).
5. THE Revenue page SHALL display a disclaimer banner stating that revenue figures are estimates derived from subscription data and may not reflect actual payment settlements.
6. THE `/api/admin/revenue` endpoint SHALL calculate MRR by summing the monthly-equivalent price of all active paid subscriptions.
7. THE `/api/admin/revenue` endpoint SHALL calculate ARPU by dividing MRR by the count of active paying users.
8. THE `/api/admin/revenue` endpoint SHALL return revenue trend data, billing cycle breakdown, and per-plan revenue split.
9. THE `/api/admin/revenue` endpoint SHALL calculate estimated LTV using the formula: `LTV = ARPU / monthly_churn_rate` WHERE `monthly_churn_rate` is the percentage of paying subscribers who cancelled in the most recent 30-day period, expressed as a decimal (e.g. 0.05 for 5%). A minimum churn rate floor of 0.01 (1%) SHALL be applied to prevent division by zero when no cancellations have occurred.
10. THE LTV value SHALL be displayed with a disclaimer: `Estimated based on current churn rate. Actual LTV may vary.`

### Requirement 8: Churn Tracking Page

**User Story:** As the admin user, I want to monitor subscription cancellations and churn patterns, so that I can identify retention issues and take corrective action.

#### Acceptance Criteria

1. WHEN the admin navigates to the Churn page, THE Admin_Dashboard SHALL display KPI_Card components showing: current churn rate, churned MRR (revenue lost to cancellations), and total cancellations in the current period.
2. WHEN the admin navigates to the Churn page, THE Admin_Dashboard SHALL display a line chart showing the monthly churn trend.
3. WHEN the admin navigates to the Churn page, THE Admin_Dashboard SHALL display a table of churn rates broken down by plan.
4. WHEN the admin navigates to the Churn page, THE Admin_Dashboard SHALL display a list of recent cancellations with anonymized user identifiers (no emails or names).
5. THE `/api/admin/churn` endpoint SHALL calculate churn rate as the number of cancellations in a period divided by the number of active subscribers at the start of that period.
6. THE `/api/admin/churn` endpoint SHALL return anonymized cancellation records containing only plan type, cancellation date, and subscription duration.

### Requirement 9: Feature Usage Page

**User Story:** As the admin user, I want to see which features are being adopted and how frequently, so that I can prioritize development and identify upgrade opportunities.

#### Acceptance Criteria

1. WHEN the admin navigates to the Feature Usage page, THE Admin_Dashboard SHALL display adoption rate cards for each gated feature showing the percentage of eligible users who have used the feature.
2. WHEN the admin navigates to the Feature Usage page, THE Admin_Dashboard SHALL display a chart showing usage trends for key features over time.
3. WHEN the admin navigates to the Feature Usage page, THE Admin_Dashboard SHALL display a table of upgrade opportunities listing free-tier users who are approaching or have hit usage limits.
4. THE `/api/admin/usage` endpoint SHALL calculate feature adoption rates from the usage counters stored in `user_profiles.preferences.subscription.usage`.
5. THE `/api/admin/usage` endpoint SHALL identify upgrade opportunity candidates as free-plan users whose usage counters are at 80% or more of their plan limits.

### Requirement 10: Admin Settings Page

**User Story:** As the admin user, I want a settings page showing system configuration and health status, so that I can verify the admin setup is correct and the system is operational.

#### Acceptance Criteria

1. WHEN the admin navigates to the Settings page, THE Admin_Dashboard SHALL display the configured `ADMIN_EMAIL` value as a read-only field.
2. WHEN the admin navigates to the Settings page, THE Admin_Dashboard SHALL display system health checks showing the status of Supabase connectivity and environment variable configuration.
3. THE Settings page SHALL provide manual sync action buttons that trigger a server-side re-fetch of admin metrics directly from Supabase for the current admin session only. The manual sync SHALL NOT clear or invalidate caches for regular user sessions or any routes outside of `/api/admin/*`.
4. WHEN a manual sync completes, THE Settings page SHALL display the timestamp of the last successful sync and a count of records refreshed.

### Requirement 11: Data Privacy and Masking

**User Story:** As the platform owner, I want all user-identifiable information masked in the admin view, so that privacy is maintained even for the administrator.

#### Acceptance Criteria

1. THE masking utility SHALL provide a `maskEmail` function that obscures the local part of an email address, showing only the first two characters followed by asterisks and the full domain (e.g., `jo***@example.com`).
2. THE masking utility SHALL provide a `maskName` function that shows only the first character of each name part followed by asterisks (e.g., `J*** D**`).
3. THE Admin_Dashboard SHALL apply email masking to all email addresses displayed in any admin page or exported data.
4. THE Admin_Dashboard SHALL apply name masking to all display names shown in any admin page or exported data.
5. THE Admin_Dashboard SHALL exclude all user financial data (transactions, investments, insurance policy details, income records, loan details) from every admin view and API response.

### Requirement 12: Reusable Admin UI Components

**User Story:** As a developer, I want reusable admin UI components, so that the admin pages maintain consistent styling and reduce code duplication.

#### Acceptance Criteria

1. THE KPI_Card component SHALL accept a title, value, optional trend percentage, and optional trend direction (up or down) and render a styled metric card.
2. THE Admin_Table component SHALL accept column definitions, row data, and pagination configuration and render a sortable, paginated data table.
3. THE Admin_Chart component SHALL wrap Recharts components with consistent color theming, responsive sizing, and tooltip formatting.
4. THE KPI_Card component SHALL display a green upward indicator for positive trends and a red downward indicator for negative trends.

### Requirement 13: Non-Disruption of Existing Functionality

**User Story:** As the platform owner, I want the admin dashboard to be additive only, so that no existing user-facing functionality is broken or altered.

#### Acceptance Criteria

1. THE Admin_Dashboard implementation SHALL not modify any existing database tables, views, or stored procedures.
2. THE Admin_Dashboard implementation SHALL not alter the behavior of any existing API routes outside of `/api/admin/*`.
3. THE Middleware changes SHALL preserve all existing route protection logic for dashboard, public, and API routes.
4. THE Admin_Dashboard implementation SHALL not modify any existing UI components or page layouts outside of the `(admin)` route group and `components/admin/` directory.
