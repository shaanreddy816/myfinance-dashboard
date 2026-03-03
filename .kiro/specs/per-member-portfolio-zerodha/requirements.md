# Requirements Document

## Introduction

FamLedgerAI is a family finance management app where one account serves the entire family. Currently, investments, loans, and insurance data are stored at the account level (flat structures), while expenses already support per-member tracking via `userData.expenses.byMember`. This feature extends the per-member pattern to investments, loans, and insurance, and allows each family member to connect their own Zerodha brokerage account for automatic portfolio import.

## Glossary

- **FamLedgerAI**: The family finance management application
- **Family_Member**: A person in the family unit, stored in `userData.profile.familyMembers` with `{id, name, role}` properties
- **Profile_Selector**: The existing sidebar dropdown that lets the user switch between family members or "All Members" view
- **Investment_Store**: The `userData.investments` object containing `{mutualFunds:[], stocks:[], fd:[], ppf:[]}` categories
- **Loan_Store**: The `userData.loans` array containing loan objects
- **Insurance_Store**: The `userData.insurance` object containing `{term:[], health:[], vehicle:[]}` categories
- **Family_Floater**: A health insurance policy type that covers multiple family members under a single policy and premium
- **Nuclear_Coverage_Group**: The coverage group consisting of self + spouse + children, typically covered under one Family_Floater policy
- **Parent_Coverage_Group**: The coverage group consisting of father and/or mother, who have separate health insurance (individual or their own Family_Floater)
- **Zerodha_Token**: An access token obtained via Kite Connect OAuth, used to fetch holdings from Zerodha
- **Integrations_Table**: The Supabase `integrations` table that stores provider tokens keyed by `user_id` and `provider`
- **Member_Context**: The currently selected family member ID from the Profile_Selector (or "all" for combined view)
- **Migration_Flag**: A boolean property on `userData.profile` that ensures a one-time data migration runs only once

## Requirements

### Requirement 1: Per-Member Investment Data Structure

**User Story:** As a family account owner, I want each family member's investments tracked separately, so that I can see individual portfolios and a combined family view.

#### Acceptance Criteria

1. THE FamLedgerAI SHALL store investments in a `userData.investments.byMember` object keyed by Family_Member ID, where each value follows the existing `{mutualFunds:[], stocks:[], fd:[], ppf:[]}` structure.
2. WHEN a user adds, updates, or deletes an investment entry, THE Investment_Store SHALL apply the change only to the currently selected Family_Member's investment data.
3. WHEN the Profile_Selector is set to "all", THE Investment_Store SHALL present a read-only combined view aggregating investments across all Family_Members.
4. WHEN the Profile_Selector is set to a specific Family_Member, THE Investment_Store SHALL display and allow editing of only that Family_Member's investment data.

### Requirement 2: Per-Member Loan Data Structure

**User Story:** As a family account owner, I want each family member's loans tracked separately, so that I can manage individual debt obligations and see a family-wide loan summary.

#### Acceptance Criteria

1. THE FamLedgerAI SHALL store loans in a `userData.loans.byMember` object keyed by Family_Member ID, where each value is an array of loan objects.
2. WHEN a user adds, updates, or deletes a loan entry, THE Loan_Store SHALL apply the change only to the currently selected Family_Member's loan data.
3. WHEN the Profile_Selector is set to "all", THE Loan_Store SHALL present a read-only combined view aggregating loans across all Family_Members.
4. WHEN the Profile_Selector is set to a specific Family_Member, THE Loan_Store SHALL display and allow editing of only that Family_Member's loan data.

### Requirement 3: Per-Member Insurance Data Structure with Family Floater Support

**User Story:** As a family account owner, I want each family member's insurance policies tracked separately, with health insurance supporting "Family Floater" policies that cover multiple members under one plan, so that I can see accurate individual and combined coverage.

#### Acceptance Criteria

1. THE FamLedgerAI SHALL store insurance in a `userData.insurance.byMember` object keyed by Family_Member ID, where each value follows the existing `{term:[], health:[], vehicle:[]}` structure.
2. WHEN a user adds, updates, or deletes a per-member insurance policy (term, vehicle, home), THE Insurance_Store SHALL apply the change only to the currently selected Family_Member's insurance data.
3. WHEN the Profile_Selector is set to "all", THE Insurance_Store SHALL present a read-only combined view aggregating insurance policies across all Family_Members, de-duplicating shared Family_Floater policies so they appear once with all covered members listed.
4. WHEN the Profile_Selector is set to a specific Family_Member, THE Insurance_Store SHALL display that Family_Member's individual policies plus any Family_Floater policies that cover them.
5. WHEN a user adds a health insurance policy, THE FamLedgerAI SHALL prompt the user to select the policy type: "Individual" or "Family Floater".
6. WHEN the policy type is "Family Floater", THE FamLedgerAI SHALL prompt the user to select the Coverage Group: "Nuclear_Coverage_Group" (self + spouse + children) or "Parent_Coverage_Group" (father and/or mother).
7. WHEN a Family_Floater policy is assigned to the Nuclear_Coverage_Group, THE Insurance_Store SHALL store the policy once under the primary policyholder's member ID with a `coverageGroup: "nuclear"` flag and a `coveredMembers` array containing the IDs of self, spouse, and all children.
8. WHEN a Family_Floater policy is assigned to the Parent_Coverage_Group, THE Insurance_Store SHALL store the policy under the parent policyholder's member ID with a `coverageGroup: "parents"` flag and a `coveredMembers` array containing the IDs of father and/or mother.
9. WHEN a user uploads a health insurance PDF and the AI extraction detects the policy type as "Family Floater", THE FamLedgerAI SHALL auto-select "Family Floater" as the policy type and suggest the appropriate Coverage Group based on the covered members listed in the PDF.
10. WHEN rendering a Family_Member's insurance view, THE Insurance_Store SHALL include any Family_Floater policies where that Family_Member's ID appears in the `coveredMembers` array, displaying them as "Covered under [policyholder name]'s Family Floater".

### Requirement 4: Backward-Compatible Data Migration

**User Story:** As an existing user, I want my current investment, loan, and insurance data preserved and automatically assigned to the "self" member, so that I do not lose any data after the update.

#### Acceptance Criteria

1. WHEN FamLedgerAI loads user data that has investments in the flat format (`userData.investments.mutualFunds` exists at the top level) and `userData.investments.byMember` does not exist, THE FamLedgerAI SHALL migrate the existing flat investment data into `userData.investments.byMember.self` and set the Migration_Flag `_investmentMigrationV1` to true.
2. WHEN FamLedgerAI loads user data that has loans in the flat format (`userData.loans` is an array) and `userData.loans.byMember` does not exist, THE FamLedgerAI SHALL migrate the existing flat loan data into a new object `{byMember: {self: [existing loans]}}` and set the Migration_Flag `_loanMigrationV1` to true.
3. WHEN FamLedgerAI loads user data that has insurance in the flat format (`userData.insurance.term` exists at the top level) and `userData.insurance.byMember` does not exist, THE FamLedgerAI SHALL migrate the existing flat insurance data into `userData.insurance.byMember.self` and set the Migration_Flag `_insuranceMigrationV1` to true.
4. THE FamLedgerAI SHALL run each migration only once per user, gated by the corresponding Migration_Flag on `userData.profile`.
5. WHEN migration completes, THE FamLedgerAI SHALL call `debounceSave()` to persist the migrated data to Supabase.

### Requirement 5: Per-Member Zerodha Account Connection

**User Story:** As a family account owner, I want each family member to connect their own Zerodha brokerage account, so that each person's portfolio is imported independently.

#### Acceptance Criteria

1. THE FamLedgerAI SHALL store Zerodha tokens in the Integrations_Table with a composite key of `user_id` (account email) and `member_id` (Family_Member ID), allowing multiple Zerodha connections per FamLedgerAI account.
2. WHEN a Family_Member initiates Zerodha OAuth, THE FamLedgerAI SHALL include the Family_Member ID in the OAuth state parameter so the callback can associate the token with the correct Family_Member.
3. WHEN the Zerodha OAuth callback is received, THE FamLedgerAI SHALL store the access token in the Integrations_Table associated with both the account `user_id` and the `member_id` from the state parameter.
4. WHEN a Family_Member's Zerodha token expires or is invalid, THE FamLedgerAI SHALL display a reconnection prompt specific to that Family_Member without affecting other Family_Members' connections.
5. THE FamLedgerAI SHALL allow each Family_Member to independently connect or disconnect their Zerodha account.

### Requirement 6: Per-Member Zerodha Portfolio Fetch

**User Story:** As a family member with a connected Zerodha account, I want my holdings fetched and displayed in my individual portfolio, so that I can see my brokerage data alongside manually entered investments.

#### Acceptance Criteria

1. WHEN the investments tab is rendered for a specific Family_Member who has a connected Zerodha account, THE FamLedgerAI SHALL fetch that Family_Member's equity holdings and mutual fund holdings from the Kite Connect API using that Family_Member's stored access token.
2. WHEN the investments tab is rendered for a specific Family_Member who does not have a connected Zerodha account, THE FamLedgerAI SHALL display a "Connect Zerodha" button for that Family_Member.
3. WHEN the Profile_Selector is set to "all", THE FamLedgerAI SHALL fetch and merge Zerodha holdings from all Family_Members who have connected Zerodha accounts.
4. THE FamLedgerAI SHALL display Zerodha-sourced holdings with a visual indicator distinguishing them from manually entered investments.
5. IF the Kite Connect API returns a `TokenException` for a Family_Member, THEN THE FamLedgerAI SHALL clear that Family_Member's stale token from the Integrations_Table and display a reconnection prompt for that specific Family_Member.

### Requirement 7: Per-Member Zerodha SIP Fetch

**User Story:** As a family member with a connected Zerodha account, I want my active SIPs fetched and displayed, so that I can track my systematic investment plans.

#### Acceptance Criteria

1. WHEN SIP data is requested for a specific Family_Member who has a connected Zerodha account, THE FamLedgerAI SHALL fetch that Family_Member's active SIPs from the Kite Connect MF SIPs API using that Family_Member's stored access token.
2. WHEN the Profile_Selector is set to "all", THE FamLedgerAI SHALL fetch and merge SIP data from all Family_Members who have connected Zerodha accounts.
3. IF the Kite Connect API returns an error for a Family_Member's SIP fetch, THEN THE FamLedgerAI SHALL log the error and continue displaying data for other Family_Members without interruption.

### Requirement 8: Profile Selector Integration with Tabs

**User Story:** As a user, I want the sidebar profile selector to control which family member's data is shown across investments, loans, and insurance tabs, so that switching members is seamless.

#### Acceptance Criteria

1. WHEN the user changes the Profile_Selector value, THE FamLedgerAI SHALL re-render the currently active tab (investments, loans, or insurance) with the selected Family_Member's data.
2. THE FamLedgerAI SHALL display the selected Family_Member's name in the tab header to indicate whose data is being viewed.
3. WHEN the Profile_Selector is set to "all", THE FamLedgerAI SHALL display a combined view with each Family_Member's entries visually grouped or labeled by member name.
4. THE FamLedgerAI SHALL persist the Profile_Selector selection across tab switches within the same session.

### Requirement 9: Combined Family Dashboard Totals

**User Story:** As a family account owner, I want the dashboard to show accurate totals that reflect per-member data, so that the overview remains correct after the data restructuring.

#### Acceptance Criteria

1. WHEN computing total investments for the dashboard, THE FamLedgerAI SHALL sum investment values across all Family_Members in `userData.investments.byMember`.
2. WHEN computing total EMI and outstanding loan amounts for the dashboard, THE FamLedgerAI SHALL sum loan values across all Family_Members in `userData.loans.byMember`.
3. WHEN computing total insurance coverage for the dashboard, THE FamLedgerAI SHALL sum coverage values across all Family_Members in `userData.insurance.byMember`.
4. WHEN the Profile_Selector is set to a specific Family_Member, THE FamLedgerAI SHALL display that Family_Member's individual totals on the dashboard.

### Requirement 10: Zerodha Connection Management UI

**User Story:** As a family account owner, I want a settings section where I can see and manage Zerodha connections for all family members, so that I have a central place to connect or disconnect accounts.

#### Acceptance Criteria

1. THE FamLedgerAI SHALL display a Zerodha connection status indicator for each Family_Member in the settings or integrations section.
2. WHEN a Family_Member's Zerodha account is connected, THE FamLedgerAI SHALL display the connection status as "Connected" with an option to disconnect.
3. WHEN a Family_Member's Zerodha account is not connected, THE FamLedgerAI SHALL display a "Connect Zerodha" button that initiates the OAuth flow for that specific Family_Member.
4. WHEN a user clicks "Disconnect" for a Family_Member, THE FamLedgerAI SHALL remove that Family_Member's Zerodha token from the Integrations_Table and update the UI to reflect the disconnected state.
