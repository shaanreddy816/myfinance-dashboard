# Requirements Document
# Requirements Document

## Introduction

Redesign the FamLedgerAI registration and onboarding flow into a clean two-step process. Step 1 is a lightweight registration collecting only essential identity fields (first name, last name, email, phone number, password) followed by email verification. Step 2, triggered after email verification, collects detailed profile and financial information (age, gender, spouse, kids, income, expenses, assets, liabilities, goals) and saves everything to Supabase before landing the user on the dashboard with all data visible.

The current `doReg` function collects too many fields upfront (name, spouse, kids, age, occupation, income range, goals, risk, password), creating friction. The existing onboarding wizard (`completeOnboarding`/`showOnboarding`) has caused data loss issues. This redesign replaces both with a streamlined, reliable two-step flow.

## Glossary

- **Registration_Form**: The lightweight Step 1 form that collects first name, last name, email, phone number, and password for account creation
- **Profile_Wizard**: The Step 2 multi-section form shown after email verification that collects detailed personal and financial information
- **Verification_Screen**: The screen displayed after registration confirming that a verification email has been sent
- **Congratulations_Screen**: The screen displayed after the user completes email verification successfully
- **Dashboard**: The main application screen (`showApp`) that displays the user's financial overview including income, expenses, assets, and liabilities
- **App**: The FamLedgerAI single-page application deployed as `index.html` on Vercel
- **Supabase_Auth**: The Supabase authentication service used for signup, email verification, and session management
- **User_Data_Table**: The Supabase `user_data` table keyed by `email` that stores all user profile and financial data
- **Auth_State_Listener**: The `onAuthStateChange` callback that handles SIGNED_IN and SIGNED_OUT events

## Requirements

### Requirement 1: Lightweight Registration Form

**User Story:** As a new user, I want to register with only my basic identity information, so that I can create an account quickly without being overwhelmed by too many fields.

#### Acceptance Criteria

1. THE Registration_Form SHALL collect exactly five fields: first name, last name, email, phone number, and password.
2. THE Registration_Form SHALL display a confirm password field to prevent typos.
3. WHEN the user submits the Registration_Form with any empty required field, THE App SHALL display a validation error indicating which fields are missing.
4. WHEN the user submits a password shorter than 6 characters, THE App SHALL display a validation error stating the minimum password length.
5. WHEN the user submits mismatched password and confirm password values, THE App SHALL display a validation error stating that passwords do not match.
6. WHEN the user submits a valid Registration_Form, THE App SHALL call Supabase_Auth signUp with the email, password, and user metadata containing first name, last name, and phone number.
7. THE Registration_Form SHALL maintain the existing split-screen visual design style.

### Requirement 2: Email Verification Flow

**User Story:** As a new user, I want to receive a verification email after registration, so that I can confirm my email address and activate my account.

#### Acceptance Criteria

1. WHEN Supabase_Auth signUp succeeds and no active session exists, THE App SHALL display the Verification_Screen instructing the user to check their email.
2. THE Verification_Screen SHALL display the registered email address so the user knows which inbox to check.
3. WHEN the user completes email verification and returns to the App, THE Congratulations_Screen SHALL display a congratulations message with the user's first name.
4. WHEN Supabase_Auth signUp succeeds and an active session exists (auto-confirm enabled), THE App SHALL skip the Verification_Screen and proceed directly to the Congratulations_Screen.
5. THE App SHALL store the registration data (first name, last name, email, phone number) in localStorage as `pending_registration_data` backup immediately after successful signUp.

### Requirement 3: Post-Verification Profile Wizard

**User Story:** As a verified user, I want to provide my detailed personal and financial information after verifying my email, so that the app can give me a complete financial overview.

#### Acceptance Criteria

1. WHEN the user lands on the App after email verification with no profile data in User_Data_Table, THE App SHALL display the Profile_Wizard instead of the Dashboard.
2. THE Profile_Wizard SHALL collect personal details: age, gender, occupation, and city.
3. THE Profile_Wizard SHALL collect family details: marital status, spouse name (if married), and children names.
4. THE Profile_Wizard SHALL collect financial income details: monthly income, spouse income, rental income, business income, and other income.
5. THE Profile_Wizard SHALL collect expense details across categories: housing, food, transport, education, healthcare, lifestyle, investments, and miscellaneous.
6. THE Profile_Wizard SHALL collect asset details: mutual funds, stocks, fixed deposits, PPF/EPF, real estate value, gold, and cash/savings.
7. THE Profile_Wizard SHALL collect liability details: home loan, car loan, personal loan, education loan, and credit card debt.
8. THE Profile_Wizard SHALL collect financial goals and risk appetite.
9. THE Profile_Wizard SHALL organize fields into clearly labeled sections or steps so the user can progress through them without feeling overwhelmed.

### Requirement 4: Profile Data Persistence

**User Story:** As a user completing my profile, I want my data saved reliably to Supabase, so that I never lose the information I entered.

#### Acceptance Criteria

1. WHEN the user completes all sections of the Profile_Wizard and submits, THE App SHALL build the complete userData object including profile, income, expenses, investments, loans, insurance, schemes, and bank accounts.
2. WHEN the user submits the Profile_Wizard, THE App SHALL upsert the complete userData to the User_Data_Table using the user's email as the key.
3. IF the Supabase upsert fails, THEN THE App SHALL display an error message and retain the entered data so the user can retry.
4. WHEN the Profile_Wizard data is saved successfully, THE App SHALL update the global `userData` variable so the Dashboard renders correctly without requiring a page reload.
5. THE App SHALL build the `familyMembers` array from the profile data (self, spouse if provided, children if provided) and include it in the saved profile.
6. WHEN the Profile_Wizard data is saved successfully, THE App SHALL set `onboarding_completed` in localStorage to `true`.

### Requirement 5: Dashboard Landing After Profile Completion

**User Story:** As a user who has completed my profile, I want to land on the dashboard with all my financial data visible in every relevant section, so that I can immediately start managing my finances.

#### Acceptance Criteria

1. WHEN the Profile_Wizard data is saved successfully, THE App SHALL navigate to the Dashboard.
2. THE Dashboard overview page SHALL display the user's first name, last name, and a welcome greeting using the registration data.
3. THE Dashboard SHALL display the user's income data (monthly income, spouse income, rental income, business income, other income) as entered in the Profile_Wizard in the income section.
4. THE Dashboard SHALL display the user's expense data organized by category as entered in the Profile_Wizard in the expenses section.
5. THE Dashboard SHALL display the user's asset and investment data as entered in the Profile_Wizard in the investments section.
6. THE Dashboard SHALL display the user's liability and loan data as entered in the Profile_Wizard in the loans section.
7. THE Dashboard settings/profile page SHALL display the user's phone number, email, first name, and last name from the Registration_Form.
8. ALL data entered during both Registration_Form (Step 1) and Profile_Wizard (Step 2) SHALL be mapped to their corresponding Dashboard sections so no entered data is lost or invisible.

### Requirement 6: Auth State Management

**User Story:** As a returning user who verified my email, I want the app to detect my verification and guide me to the right screen, so that I have a seamless experience.

#### Acceptance Criteria

1. WHEN the Auth_State_Listener detects a SIGNED_IN event and the user has no profile data in User_Data_Table, THE App SHALL display the Profile_Wizard.
2. WHEN the Auth_State_Listener detects a SIGNED_IN event and the user has complete profile data in User_Data_Table, THE App SHALL display the Dashboard.
3. THE App SHALL use the `isRegistering` flag to prevent the Auth_State_Listener from interfering during the registration signUp process.
4. WHEN the Auth_State_Listener detects a SIGNED_IN event, THE App SHALL attempt to restore `pending_registration_data` from localStorage if the profile name is missing in User_Data_Table.
5. WHEN the Auth_State_Listener detects a SIGNED_OUT event, THE App SHALL reset the global `userData` to empty defaults and display the auth screen.

### Requirement 7: AI-Powered Features Data Availability

**User Story:** As a user who has completed my profile, I want the AI Advisor, NRI Planner, and Autopilot features to have access to all my registration and profile data, so that they can give me personalized financial suggestions based on my age, goals, liquid funds, investments, schemes, and future plans.

#### Acceptance Criteria

1. WHEN the Profile_Wizard data is saved, THE App SHALL ensure the global `userData` object contains all fields required by the AI Advisor (age, goals, risk appetite, income, expenses, investments, loans, liquid savings).
2. THE AI Advisor SHALL use the user's age, goals, and risk appetite from the Profile_Wizard to generate personalized financial recommendations.
3. THE NRI Planner SHALL use the user's income, assets, liabilities, and goals from the Profile_Wizard to provide India-return planning advice.
4. THE Autopilot feature SHALL use the user's income, expenses, investments, and goals from the Profile_Wizard to generate automated financial action items.
5. ALL data entered during Registration_Form and Profile_Wizard SHALL be available in the `userData` global variable immediately after profile completion, without requiring a page reload or re-login.

### Requirement 8: Removal of Legacy Registration and Onboarding Code

**User Story:** As a developer, I want the old registration fields and onboarding wizard removed, so that there is a single clean flow and no conflicting code paths.

#### Acceptance Criteria

1. THE App SHALL remove the old `doReg` function that collects spouse, kids, age, occupation, income range, goals, and risk during registration.
2. THE App SHALL remove the old `completeOnboarding` and `showOnboarding` functions and the associated onboarding wizard HTML.
3. THE App SHALL remove the `collectOnboardingData` function and the `OnboardingWizard` class.
4. THE App SHALL replace the old registration form HTML with the new lightweight Registration_Form HTML.
5. THE App SHALL ensure that existing users with complete profile data are unaffected and continue to land on the Dashboard on login.
