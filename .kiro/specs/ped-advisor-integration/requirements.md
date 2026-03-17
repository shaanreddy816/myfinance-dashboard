# Requirements Document

## Introduction

This document specifies the requirements for integrating the Pre-Existing Disease (PED) Advisor component into the Insurance page of FamLedgerAI. The PED Advisor helps users understand waiting periods for pre-existing conditions, provides personalized coverage analysis, and displays exact dates when specific conditions will be covered under their health insurance policies.

The integration will transform the existing standalone PED Advisor component into a fully integrated feature that allows users to select their saved policies, analyze PED coverage with personalized data, and view comprehensive results through an enhanced tabbed interface.

## Glossary

- **PED_Advisor**: The Pre-Existing Disease Advisor component that analyzes health insurance coverage for pre-existing conditions
- **Insurance_Page**: The main insurance dashboard page at `/insurance` that displays all user policies
- **Policy_Selector**: A UI component that allows users to select from their saved insurance policies
- **Results_View**: The enhanced tabbed interface displaying PED coverage analysis results
- **Coverage_Timeline**: A chronological view showing when specific conditions become covered
- **Waiting_Period**: The duration after policy start date before a pre-existing condition is covered
- **PED_API**: The backend API endpoint at `/api/ped-advisor` that processes coverage analysis requests
- **Knowledge_Base**: The data structure containing disease waiting period information

## Requirements

### Requirement 1: Display PED Advisor on Insurance Page

**User Story:** As a user with health insurance policies, I want to see the PED Advisor on my insurance page, so that I can easily analyze my pre-existing disease coverage without navigating away.

#### Acceptance Criteria

1. THE Insurance_Page SHALL display the PED_Advisor component below the policy cards section
2. WHEN the Insurance_Page loads, THE PED_Advisor SHALL be visible in its input state
3. THE PED_Advisor SHALL maintain its existing styling and visual design
4. THE PED_Advisor SHALL be responsive and display correctly on mobile and desktop viewports

### Requirement 2: Select Policy for Analysis

**User Story:** As a user with multiple health insurance policies, I want to select a specific policy to analyze, so that I get accurate coverage information based on my actual policy details.

#### Acceptance Criteria

1. THE PED_Advisor SHALL display a Policy_Selector dropdown when the user has saved health insurance policies
2. WHEN a user selects a policy from the Policy_Selector, THE PED_Advisor SHALL populate policy details including insurer name, plan name, sum insured, and start date
3. IF the user has no saved health insurance policies, THEN THE PED_Advisor SHALL use default values for analysis
4. THE Policy_Selector SHALL filter and display only health insurance policies from the user's saved policies
5. WHEN policy details are populated, THE PED_Advisor SHALL display the selected policy information in a summary card

### Requirement 3: Analyze PED Coverage with Policy Data

**User Story:** As a user analyzing my PED coverage, I want the analysis to use my actual policy data, so that I receive personalized and accurate coverage information.

#### Acceptance Criteria

1. WHEN a user clicks "Analyze My Coverage", THE PED_Advisor SHALL send the selected policy's start date to the PED_API
2. THE PED_Advisor SHALL send the selected policy's insurer name to the PED_API
3. THE PED_Advisor SHALL send the selected policy's plan name to the PED_API
4. THE PED_Advisor SHALL send the selected policy's sum insured amount to the PED_API
5. THE PED_Advisor SHALL send the user's selected conditions to the PED_API
6. THE PED_Advisor SHALL send any user-entered questions to the PED_API

### Requirement 4: Display Enhanced Results View

**User Story:** As a user who has analyzed my PED coverage, I want to see comprehensive results in an organized tabbed interface, so that I can easily understand my coverage status, timelines, and recommendations.

#### Acceptance Criteria

1. WHEN analysis completes, THE Results_View SHALL display a tabbed interface with five tabs: Overview, Timeline, Alerts, Advice, and FAQs
2. THE Results_View SHALL display the Overview tab by default
3. WHEN a user clicks a tab, THE Results_View SHALL switch to display that tab's content
4. THE Results_View SHALL replace the current JSON display with structured, user-friendly content
5. THE Results_View SHALL maintain visual consistency with the existing Insurance_Page design

### Requirement 5: Display Overview Tab

**User Story:** As a user viewing my PED analysis results, I want to see a summary overview, so that I can quickly understand what is covered and what is not.

#### Acceptance Criteria

1. THE Overview tab SHALL display the personalized summary text from the API response
2. THE Overview tab SHALL display a "Fully Covered Now" section listing all conditions with immediate coverage
3. THE Overview tab SHALL display a "Not Covered Yet" section listing conditions still in waiting periods
4. FOR EACH condition in "Not Covered Yet", THE Overview tab SHALL display the condition name, coverage start date, and days remaining
5. THE Overview tab SHALL use color coding with green for covered conditions and orange for waiting conditions

### Requirement 6: Display Timeline Tab

**User Story:** As a user planning for future medical needs, I want to see a timeline of when my conditions become covered, so that I can plan treatments accordingly.

#### Acceptance Criteria

1. THE Timeline tab SHALL display the Coverage_Timeline from the API response
2. FOR EACH timeline event, THE Timeline tab SHALL display the date, event description, and affected conditions
3. THE Timeline tab SHALL sort events chronologically from earliest to latest
4. THE Timeline tab SHALL visually distinguish between past events and future events
5. THE Timeline tab SHALL highlight high-importance events with distinct styling

### Requirement 7: Display Alerts Tab

**User Story:** As a user with pre-existing conditions, I want to see critical alerts about my coverage, so that I can avoid claim rejections and understand coverage limitations.

#### Acceptance Criteria

1. THE Alerts tab SHALL display all critical alerts from the API response
2. FOR EACH alert, THE Alerts tab SHALL display the severity level, title, message, and recommended action
3. THE Alerts tab SHALL use color coding with red for critical alerts, yellow for warnings, and blue for informational alerts
4. THE Alerts tab SHALL sort alerts by severity with critical alerts displayed first
5. IF there are no alerts, THEN THE Alerts tab SHALL display a success message indicating good coverage status

### Requirement 8: Display Advice Tab

**User Story:** As a user seeking to optimize my insurance coverage, I want to see personalized recommendations, so that I can make informed decisions about my health insurance.

#### Acceptance Criteria

1. THE Advice tab SHALL display all smart recommendations from the API response
2. FOR EACH recommendation, THE Advice tab SHALL display the recommendation text, reason, priority level, and estimated benefit
3. THE Advice tab SHALL sort recommendations by priority with high-priority items displayed first
4. THE Advice tab SHALL display the plan assessment including suitability score, grade, and assessment note
5. THE Advice tab SHALL use visual indicators for priority levels

### Requirement 9: Display FAQs Tab

**User Story:** As a user with questions about PED coverage, I want to see frequently asked questions relevant to my conditions, so that I can understand coverage rules without contacting support.

#### Acceptance Criteria

1. THE FAQs tab SHALL display all frequently asked questions from the API response
2. FOR EACH FAQ, THE FAQs tab SHALL display the question and answer in an expandable format
3. WHEN a user clicks a question, THE FAQs tab SHALL expand to show the answer
4. THE FAQs tab SHALL allow multiple FAQs to be expanded simultaneously
5. THE FAQs tab SHALL use clear typography to distinguish questions from answers

### Requirement 10: Handle Analysis Errors

**User Story:** As a user experiencing technical issues, I want to see clear error messages when analysis fails, so that I understand what went wrong and can retry.

#### Acceptance Criteria

1. IF the PED_API returns an error, THEN THE PED_Advisor SHALL display an error message to the user
2. THE PED_Advisor SHALL provide a "Try Again" button when an error occurs
3. WHEN a user clicks "Try Again", THE PED_Advisor SHALL reset to the input state
4. THE PED_Advisor SHALL log error details to the console for debugging
5. THE error message SHALL be user-friendly and avoid technical jargon

### Requirement 11: Reset Analysis

**User Story:** As a user who has completed an analysis, I want to analyze different conditions or policies, so that I can explore various coverage scenarios.

#### Acceptance Criteria

1. THE Results_View SHALL display an "Analyze Again" button
2. WHEN a user clicks "Analyze Again", THE PED_Advisor SHALL reset to the input state
3. WHEN resetting, THE PED_Advisor SHALL clear previous results
4. WHEN resetting, THE PED_Advisor SHALL preserve the selected policy
5. WHEN resetting, THE PED_Advisor SHALL clear the selected conditions list

### Requirement 12: Maintain Existing Functionality

**User Story:** As a user of the existing PED Advisor, I want all current features to continue working, so that I don't lose functionality during the integration.

#### Acceptance Criteria

1. THE PED_Advisor SHALL maintain the ability to select common conditions from predefined buttons
2. THE PED_Advisor SHALL maintain the ability to add custom conditions via text input
3. THE PED_Advisor SHALL maintain the ability to remove selected conditions
4. THE PED_Advisor SHALL maintain the ability to ask specific questions about coverage
5. THE PED_Advisor SHALL maintain the loading state animation during analysis

### Requirement 13: Responsive Design

**User Story:** As a mobile user, I want the PED Advisor to work seamlessly on my device, so that I can analyze coverage on the go.

#### Acceptance Criteria

1. THE PED_Advisor SHALL display correctly on viewport widths from 320px to 1920px
2. THE Results_View tabs SHALL stack vertically on mobile devices when horizontal space is insufficient
3. THE Policy_Selector SHALL be touch-friendly with adequate tap target sizes
4. THE condition selection buttons SHALL wrap appropriately on narrow screens
5. THE Results_View content SHALL be scrollable on small screens without horizontal overflow
