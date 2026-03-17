# Implementation Plan: AI Question Routing System

## Overview

This implementation plan breaks down the AI Question Routing System into discrete, manageable coding tasks. The system enables users to ask financial questions and receive multi-perspective analysis from specialized reasoning agents. Implementation follows a bottom-up approach: database → types → backend services → API routes → frontend components → integration → testing.

## Tasks

- [ ] 1. Database schema and migrations
  - Create migration file for all question routing tables
  - Define tables: suggested_questions, question_sessions, agent_runs, agent_outputs, final_recommendations, follow_up_questions, analytics_events, question_cache
  - Add indexes for performance optimization
  - Add foreign key constraints and cascading deletes
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 2. TypeScript types and interfaces
  - [ ] 2.1 Create core type definitions file
    - Define IntentCategory, ReasoningAgentType enums
    - Define UserContext, QuestionSubmission, QuestionResponse interfaces
    - Define AgentOutputContract, FinalAnswer interfaces
    - Define database record types matching schema
    - _Requirements: 1.1, 3.2, 4.1, 5.3, 6.3_

  - [ ]* 2.2 Write property test for type conformance
    - **Property 12: Agent Output Schema Conformance**
    - **Validates: Requirements 5.3, 5.4**

- [ ] 3. User Context Builder
  - [ ] 3.1 Implement UserContextBuilder class
    - Create buildUserContext() method to fetch user financial data
    - Query existing tables: insurance_policies, loans, investments, income, expenses, family_members, profiles
    - Aggregate data into UserContext interface
    - Handle missing data gracefully with defaults
    - _Requirements: 3.1, 8.1, 8.2, 8.3, 8.4_

  - [ ]* 3.2 Write unit tests for UserContextBuilder
    - Test with complete user data
    - Test with minimal user data
    - Test with missing tables/records
    - _Requirements: 3.1_


- [ ] 4. Intent Classifier implementation
  - [ ] 4.1 Create IntentClassifier class
    - Implement classify() method with OpenAI GPT-4 integration
    - Build classification prompt template with user context
    - Parse and validate classification response
    - Implement confidence threshold logic (default to general_financial_advice if < 0.5)
    - Add timeout handling (2 seconds)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 4.2 Write property test for intent classification
    - **Property 4: Intent Classification Output Validity**
    - **Validates: Requirements 3.2**

  - [ ]* 4.3 Write property test for default intent fallback
    - **Property 6: Default Intent for Low Confidence**
    - **Validates: Requirements 3.4**

  - [ ]* 4.4 Write unit tests for IntentClassifier
    - Test specific question classifications
    - Test timeout handling
    - Test API error handling
    - _Requirements: 3.2, 3.5_

- [ ] 5. Agent Selector implementation
  - [ ] 5.1 Create AgentSelector class
    - Define intent-to-agent mapping configuration
    - Implement selectAgents() method with mapping lookup
    - Ensure 2-5 agents selected per intent
    - Add agent enable/disable configuration
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ]* 5.2 Write property test for agent selection bounds
    - **Property 8: Agent Selection Count Bounds**
    - **Validates: Requirements 4.1**

  - [ ]* 5.3 Write unit tests for AgentSelector
    - Test each intent category mapping
    - Test agent filtering when disabled
    - _Requirements: 4.1, 4.2_

- [ ] 6. Base Reasoning Agent framework
  - [ ] 6.1 Create BaseReasoningAgent abstract class
    - Define abstract analyze() method
    - Implement callLLM() helper method with OpenAI integration
    - Implement validateOutput() method for schema validation
    - Add timeout handling (10 seconds per agent)
    - Add error handling and logging
    - _Requirements: 5.1, 5.2, 5.3, 5.5, 5.6_

  - [ ]* 6.2 Write unit tests for BaseReasoningAgent
    - Test LLM call with mock responses
    - Test output validation
    - Test timeout handling
    - _Requirements: 5.5, 5.6_


- [ ] 7. Implement all 12 Reasoning Agents
  - [ ] 7.1 Implement FirstPrinciplesAgent
    - Extend BaseReasoningAgent
    - Build framework-specific prompt template
    - Implement analyze() method
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ] 7.2 Implement DevilsAdvocateAgent
    - Extend BaseReasoningAgent
    - Build counterargument-focused prompt
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ] 7.3 Implement OpportunityCostAgent
    - Extend BaseReasoningAgent
    - Build trade-off analysis prompt
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ] 7.4 Implement OccamsRazorAgent
    - Extend BaseReasoningAgent
    - Build simplicity-focused prompt
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ] 7.5 Implement MarginOfSafetyAgent
    - Extend BaseReasoningAgent
    - Build risk mitigation prompt
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ] 7.6 Implement ParetoPrincipleAgent
    - Extend BaseReasoningAgent
    - Build 80/20 analysis prompt
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ] 7.7 Implement SWOTAgent
    - Extend BaseReasoningAgent
    - Build SWOT analysis prompt
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ] 7.8 Implement PreMortemAgent
    - Extend BaseReasoningAgent
    - Build failure analysis prompt
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ] 7.9 Implement SystemsThinkingAgent
    - Extend BaseReasoningAgent
    - Build interconnection analysis prompt
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ] 7.10 Implement FlywheelAgent
    - Extend BaseReasoningAgent
    - Build compounding effects prompt
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ] 7.11 Implement ProductMarketFitAgent
    - Extend BaseReasoningAgent
    - Build needs-solution alignment prompt
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ] 7.12 Implement JobsToBeDoneAgent
    - Extend BaseReasoningAgent
    - Build underlying job analysis prompt
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ]* 7.13 Write property test for agent output conformance
    - **Property 12: Agent Output Schema Conformance**
    - **Validates: Requirements 5.3, 5.4**

  - [ ]* 7.14 Write unit tests for each agent
    - Test specific financial scenarios for each agent
    - Test prompt generation
    - _Requirements: 5.1, 5.2_


- [ ] 8. Synthesis Engine implementation
  - [ ] 8.1 Create SynthesisEngine class
    - Implement synthesize() method
    - Implement identifyCommonThemes() using semantic clustering
    - Implement resolveConflicts() for conflicting recommendations
    - Implement prioritizeRecommendations() by frequency and confidence
    - Generate summary using OpenAI
    - Add mandatory disclaimer generation
    - Add uncertainty flagging for low confidence (<70%)
    - Add timeout handling (5 seconds)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

  - [ ]* 8.2 Write property test for synthesis output structure
    - **Property 14: Synthesis Output Structure**
    - **Validates: Requirements 6.3**

  - [ ]* 8.3 Write property test for mandatory disclaimer
    - **Property 28: Mandatory Disclaimer Inclusion**
    - **Validates: Requirements 12.1**

  - [ ]* 8.4 Write property test for uncertainty flagging
    - **Property 29: Low Confidence Uncertainty Flagging**
    - **Validates: Requirements 12.2**

  - [ ]* 8.5 Write unit tests for SynthesisEngine
    - Test with multiple agent outputs
    - Test with conflicting recommendations
    - Test with low confidence scores
    - Test disclaimer generation
    - _Requirements: 6.1, 6.3, 12.1_

- [ ] 9. Follow-Up Question Generator implementation
  - [ ] 9.1 Create FollowUpGenerator class
    - Implement generate() method with OpenAI integration
    - Build prompt template for contextual follow-ups
    - Ensure 3-5 questions generated
    - Implement duplicate detection and removal
    - Score relevance based on user context
    - _Requirements: 7.1, 7.2, 7.3, 7.5_

  - [ ]* 9.2 Write property test for follow-up count
    - **Property 17: Follow-Up Question Count**
    - **Validates: Requirements 7.1**

  - [ ]* 9.3 Write property test for follow-up uniqueness
    - **Property 18: Follow-Up Question Uniqueness**
    - **Validates: Requirements 7.5**

  - [ ]* 9.4 Write unit tests for FollowUpGenerator
    - Test question generation
    - Test duplicate removal
    - Test relevance scoring
    - _Requirements: 7.1, 7.5_


- [ ] 10. Suggestion Personalizer implementation
  - [ ] 10.1 Create SuggestionPersonalizer class
    - Implement getPersonalizedSuggestions() method
    - Implement scoreQuestionRelevance() with personalization rules
    - Query suggested_questions table
    - Apply user context-based scoring
    - Ensure minimum 6 questions returned
    - Sort by personalization score
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [ ]* 10.2 Write property test for context-based personalization
    - **Property 20: Context-Based Question Personalization**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4**

  - [ ]* 10.3 Write property test for minimum questions
    - **Property 21: Minimum Suggested Questions**
    - **Validates: Requirements 8.6**

  - [ ]* 10.4 Write unit tests for SuggestionPersonalizer
    - Test scoring for different user contexts
    - Test NRI-specific filtering
    - Test minimum question guarantee
    - _Requirements: 8.1, 8.6_

- [ ] 11. Rate Limiter implementation
  - [ ] 11.1 Create RateLimiter class
    - Implement checkRateLimit() method
    - Query user tier from profiles table
    - Track daily question count per user
    - Enforce limits: 10/day free, 100/day premium
    - Return clear error messages when exceeded
    - _Requirements: 17.1, 17.2, 17.3_

  - [ ]* 11.2 Write property test for rate limiting
    - **Property 40: User Tier Rate Limiting**
    - **Validates: Requirements 17.1, 17.2**

  - [ ]* 11.3 Write unit tests for RateLimiter
    - Test free tier limit
    - Test premium tier limit
    - Test limit reset at midnight
    - _Requirements: 17.1, 17.2_

- [ ] 12. Question Cache implementation
  - [ ] 12.1 Create QuestionCache class
    - Implement get() and set() methods
    - Generate question hash for cache key
    - Check cache expiration (1 hour TTL)
    - Track hit count for analytics
    - Implement cache invalidation on user data change
    - _Requirements: 16.5, 16.6, 20.3_

  - [ ]* 12.2 Write property test for cache TTL
    - **Property 38: Client-Side Cache TTL**
    - **Validates: Requirements 16.5, 20.3**

  - [ ]* 12.3 Write unit tests for QuestionCache
    - Test cache hit/miss
    - Test expiration
    - Test invalidation
    - _Requirements: 16.5, 16.6_


- [ ] 13. Analytics tracker implementation
  - [ ] 13.1 Create Analytics class
    - Implement trackEvent() method
    - Insert records into analytics_events table
    - Support event types: question_submitted, suggested_clicked, custom_submitted, follow_up_clicked, answer_rated
    - Include session_id, user_id, event_data, timestamp
    - _Requirements: 11.1, 11.2, 11.5_

  - [ ]* 13.2 Write unit tests for Analytics
    - Test event logging for each type
    - Test data structure validation
    - _Requirements: 11.1, 11.2_

- [ ] 14. Question Router Orchestrator implementation
  - [ ] 14.1 Create QuestionRouter class
    - Implement submitQuestion() main orchestration method
    - Validate input (10-500 characters)
    - Create question session record
    - Invoke IntentClassifier
    - Invoke AgentSelector
    - Execute agents in parallel using Promise.all()
    - Handle graceful agent failures
    - Invoke SynthesisEngine
    - Invoke FollowUpGenerator
    - Store all results in database
    - Return complete QuestionResponse
    - Add overall timeout (30 seconds)
    - _Requirements: 1.4, 1.5, 2.2, 2.3, 4.6, 4.7, 9.1, 9.2, 9.3, 9.4, 9.5, 13.7, 20.2_

  - [ ] 14.2 Implement getQuestionHistory() method
    - Query question_sessions for user
    - Sort by created_at DESC
    - Include pagination support
    - _Requirements: 9.6, 9.7_

  - [ ] 14.3 Implement getSessionDetails() method
    - Query full session with all related data
    - Include agent runs, outputs, final answer, follow-ups
    - _Requirements: 9.7_

  - [ ] 14.4 Implement rateAnswer() method
    - Update final_recommendations with user feedback
    - Track rating and feedback text
    - _Requirements: 10.1, 10.2_

  - [ ]* 14.5 Write property test for input validation
    - **Property 2: Input Validation with Error Feedback**
    - **Validates: Requirements 2.2, 2.3**

  - [ ]* 14.6 Write property test for parallel agent execution
    - **Property 9: Parallel Agent Execution**
    - **Validates: Requirements 4.6, 20.2**

  - [ ]* 14.7 Write property test for graceful agent failure
    - **Property 10: Graceful Agent Failure Handling**
    - **Validates: Requirements 4.7**

  - [ ]* 14.8 Write property test for session data persistence
    - **Property 23: Complete Session Data Persistence**
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5**

  - [ ]* 14.9 Write unit tests for QuestionRouter
    - Test end-to-end question processing
    - Test validation errors
    - Test all agents failing
    - Test history retrieval
    - Test session details
    - _Requirements: 1.4, 2.2, 4.7, 9.6_


- [ ] 15. Checkpoint - Core backend services complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 16. API Routes implementation
  - [ ] 16.1 Create POST /api/question-router/ask route
    - Validate authentication
    - Parse request body
    - Check rate limits
    - Check cache for duplicate questions
    - Call QuestionRouter.submitQuestion()
    - Track analytics event
    - Return QuestionResponse JSON
    - Handle errors with appropriate status codes (400, 429, 500, 503)
    - _Requirements: 1.4, 1.5, 2.4, 13.5, 13.6, 13.7, 17.1, 17.2, 17.3_

  - [ ] 16.2 Create GET /api/question-router/suggestions route
    - Validate authentication
    - Call SuggestionPersonalizer.getPersonalizedSuggestions()
    - Check cache (5 minute TTL)
    - Return personalized suggestions
    - _Requirements: 1.1, 1.2, 1.3, 8.1, 8.5, 8.6_

  - [ ] 16.3 Create GET /api/question-router/history route
    - Validate authentication
    - Parse query parameters (limit, offset, intent filter)
    - Call QuestionRouter.getQuestionHistory()
    - Return paginated history
    - _Requirements: 9.6, 9.7_

  - [ ] 16.4 Create GET /api/question-router/session/[sessionId] route
    - Validate authentication and ownership
    - Call QuestionRouter.getSessionDetails()
    - Return full session details
    - _Requirements: 9.7_

  - [ ] 16.5 Create POST /api/question-router/feedback route
    - Validate authentication and ownership
    - Parse rating and feedback text
    - Call QuestionRouter.rateAnswer()
    - Track analytics event
    - Return success response
    - _Requirements: 10.1, 10.2, 11.5_

  - [ ]* 16.6 Write integration tests for all API routes
    - Test successful requests
    - Test authentication failures
    - Test validation errors
    - Test rate limiting
    - Test error responses
    - _Requirements: 1.4, 2.2, 17.1_


- [ ] 17. Frontend state management
  - [ ] 17.1 Create useQuestionRouter hook
    - Implement submitQuestion() mutation
    - Implement getSuggestions() query with caching
    - Implement getHistory() query with pagination
    - Implement getSessionDetails() query
    - Implement rateAnswer() mutation
    - Handle loading, error, and success states
    - Implement optimistic UI updates
    - _Requirements: 2.5, 2.6, 13.1, 13.2, 16.3_

  - [ ]* 17.2 Write unit tests for useQuestionRouter hook
    - Test state transitions
    - Test error handling
    - Test optimistic updates
    - _Requirements: 2.5, 16.3_

- [ ] 18. Frontend components - Suggested Questions
  - [ ] 18.1 Create SuggestedQuestions component
    - Fetch personalized suggestions on mount
    - Display questions grouped by category
    - Handle click to submit question
    - Show loading skeleton while fetching
    - Track analytics on click
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 8.1, 11.1_

  - [ ] 18.2 Create SuggestedQuestionCard component
    - Display question text
    - Show category badge
    - Add hover effects
    - Handle click event
    - _Requirements: 1.1, 1.2_

  - [ ]* 18.3 Write unit tests for SuggestedQuestions
    - Test rendering with suggestions
    - Test click handling
    - Test loading state
    - _Requirements: 1.1, 1.4_

- [ ] 19. Frontend components - Custom Question Input
  - [ ] 19.1 Create CustomQuestionInput component
    - Render textarea with character counter
    - Implement real-time validation (10-500 chars)
    - Show validation errors inline
    - Disable submit during processing
    - Handle submit on Enter key
    - Track analytics on submit
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 11.2_

  - [ ]* 19.2 Write property test for input validation
    - **Property 2: Input Validation with Error Feedback**
    - **Validates: Requirements 2.2, 2.3**

  - [ ]* 19.3 Write unit tests for CustomQuestionInput
    - Test character counter
    - Test validation messages
    - Test submit handling
    - Test disabled state
    - _Requirements: 2.2, 2.3, 2.5_


- [ ] 20. Frontend components - Answer Display
  - [ ] 20.1 Create AnswerDisplay component
    - Display summary section prominently
    - Render key insights with importance badges
    - Display recommendations with priority, effort, impact indicators
    - Show risks and considerations with severity levels
    - Display next steps as actionable checklist
    - Show agent attribution badges
    - Display disclaimer prominently
    - Show uncertainty flags when applicable
    - Add copy-to-clipboard functionality
    - _Requirements: 6.3, 6.4, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

  - [ ] 20.2 Create InsightCard component
    - Display insight text
    - Show source agents
    - Show importance badge
    - _Requirements: 6.3, 6.4_

  - [ ] 20.3 Create RecommendationCard component
    - Display action text
    - Show priority, effort, impact badges
    - Show source agents
    - Add expand/collapse for details
    - _Requirements: 6.3, 6.4_

  - [ ] 20.4 Create RiskCard component
    - Display risk text
    - Show severity indicator
    - Display mitigation strategy
    - Show source agents
    - _Requirements: 6.3, 6.4_

  - [ ]* 20.5 Write unit tests for AnswerDisplay components
    - Test rendering all sections
    - Test disclaimer display
    - Test uncertainty flags
    - Test agent attribution
    - _Requirements: 6.3, 12.1_

- [ ] 21. Frontend components - Follow-Up Questions
  - [ ] 21.1 Create FollowUpQuestions component
    - Display 3-5 follow-up questions
    - Handle click to submit as new question
    - Link to parent session
    - Track analytics on click
    - Show relevance indicators
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 11.5_

  - [ ]* 21.2 Write property test for follow-up session linking
    - **Property 19: Follow-Up Session Linking**
    - **Validates: Requirements 7.4**

  - [ ]* 21.3 Write unit tests for FollowUpQuestions
    - Test rendering questions
    - Test click handling
    - Test session linking
    - _Requirements: 7.1, 7.4_


- [ ] 22. Frontend components - Loading States
  - [ ] 22.1 Create LoadingStates component
    - Display "Analyzing your question" during classification
    - Display "Consulting financial frameworks" during agent execution
    - Display "Preparing your answer" during synthesis
    - Show animated progress indicators
    - Display estimated time remaining
    - _Requirements: 13.1, 13.2, 13.3, 13.4_

  - [ ]* 22.2 Write unit tests for LoadingStates
    - Test each loading phase display
    - Test progress animations
    - _Requirements: 13.1, 13.2, 13.3_

- [ ] 23. Frontend components - Question History
  - [ ] 23.1 Create QuestionHistory component
    - Display list of past questions
    - Show question text, date, intent category
    - Implement pagination
    - Handle click to view full session
    - Add filter by intent category
    - Show loading skeleton
    - _Requirements: 9.6, 9.7_

  - [ ] 23.2 Create QuestionHistoryItem component
    - Display question summary
    - Show timestamp
    - Show intent badge
    - Show confidence indicator
    - Handle click to expand
    - _Requirements: 9.6, 9.7_

  - [ ]* 23.3 Write unit tests for QuestionHistory
    - Test rendering history list
    - Test pagination
    - Test filtering
    - Test item click
    - _Requirements: 9.6, 9.7_

- [ ] 24. Frontend components - Feedback Rating
  - [ ] 24.1 Create FeedbackRating component
    - Display 1-5 star rating input
    - Add optional text feedback field
    - Handle submit
    - Show thank you message after submission
    - Track analytics event
    - _Requirements: 10.1, 10.2, 11.5_

  - [ ]* 24.2 Write unit tests for FeedbackRating
    - Test rating selection
    - Test feedback submission
    - Test thank you message
    - _Requirements: 10.1, 10.2_


- [ ] 25. Main AI Copilot page integration
  - [ ] 25.1 Create /ai-copilot page
    - Integrate SuggestedQuestions component
    - Integrate CustomQuestionInput component
    - Integrate AnswerDisplay component (conditional on answer)
    - Integrate FollowUpQuestions component (conditional on answer)
    - Integrate LoadingStates component (conditional on processing)
    - Integrate FeedbackRating component (conditional on answer)
    - Add QuestionHistory sidebar/modal
    - Implement responsive layout
    - Add error boundary
    - _Requirements: 1.1, 1.4, 2.1, 2.4, 6.3, 7.1, 9.6, 10.1, 13.1_

  - [ ]* 25.2 Write E2E tests for AI Copilot page
    - Test suggested question flow
    - Test custom question flow
    - Test follow-up question flow
    - Test error handling
    - _Requirements: 1.4, 2.4, 7.4_

- [ ] 26. Checkpoint - Frontend components complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 27. Error handling and user experience
  - [ ] 27.1 Create ErrorDisplay component
    - Display user-friendly error messages
    - Hide technical details
    - Show retry button for retryable errors
    - Show upgrade prompt for rate limit errors
    - Show "try again later" for API unavailability
    - _Requirements: 13.5, 13.6, 13.7, 17.3_

  - [ ] 27.2 Implement error handling in QuestionRouter
    - Add retry logic with exponential backoff
    - Implement circuit breaker pattern
    - Add graceful degradation
    - Log errors for monitoring
    - _Requirements: 4.7, 13.6, 17.4_

  - [ ]* 27.3 Write unit tests for error handling
    - Test retry logic
    - Test circuit breaker
    - Test error messages
    - _Requirements: 13.5, 13.6_

- [ ] 28. Rate limiting and cost control
  - [ ] 28.1 Implement rate limit middleware
    - Check user tier
    - Enforce daily limits
    - Return 429 with clear message
    - Include upgrade URL in response
    - _Requirements: 17.1, 17.2, 17.3_

  - [ ] 28.2 Implement token usage tracking
    - Log OpenAI API token usage per request
    - Store in analytics_events table
    - Calculate cost per question
    - _Requirements: 17.5_

  - [ ]* 28.3 Write property test for rate limit enforcement
    - **Property 40: User Tier Rate Limiting**
    - **Property 41: Rate Limit Exceeded Messaging**
    - **Validates: Requirements 17.1, 17.2, 17.3**

  - [ ]* 28.4 Write unit tests for rate limiting
    - Test free tier limit
    - Test premium tier limit
    - Test error messages
    - _Requirements: 17.1, 17.2, 17.3_


- [ ] 29. Caching implementation
  - [ ] 29.1 Implement question response caching
    - Generate cache key from question hash
    - Check cache before processing
    - Store successful responses with 1 hour TTL
    - Track cache hit/miss in analytics
    - _Requirements: 16.5, 20.3_

  - [ ] 29.2 Implement suggestion caching
    - Cache personalized suggestions per user
    - Set 5 minute TTL
    - Invalidate on user data change
    - _Requirements: 16.5, 16.6_

  - [ ]* 29.3 Write property test for cache invalidation
    - **Property 39: Cache Invalidation on Data Change**
    - **Validates: Requirements 16.6**

  - [ ]* 29.4 Write unit tests for caching
    - Test cache hit/miss
    - Test TTL expiration
    - Test invalidation
    - _Requirements: 16.5, 16.6_

- [ ] 30. Navigation and sidebar integration
  - [ ] 30.1 Add AI Copilot to sidebar navigation
    - Add menu item with Sparkles icon
    - Add "New" badge
    - Link to /ai-copilot page
    - _Requirements: 1.1_

  - [ ] 30.2 Update dashboard overview
    - Add AI Copilot quick access card
    - Show recent questions count
    - Link to full AI Copilot page
    - _Requirements: 1.1_

- [ ] 31. Database seed data
  - [ ] 31.1 Create seed script for suggested questions
    - Add 20+ suggested questions across all categories
    - Cover: health insurance, term insurance, loans, investments, budget, emergency fund, retirement, NRI planning
    - Set appropriate intent categories
    - Set display order
    - _Requirements: 1.1, 1.2, 8.1_

  - [ ] 31.2 Run seed script
    - Execute seed script on development database
    - Verify questions appear in UI
    - _Requirements: 1.1_


- [ ] 32. Analytics and monitoring
  - [ ] 32.1 Create analytics dashboard API route
    - Implement GET /api/question-router/analytics
    - Calculate overview metrics: total questions, avg response time, avg confidence, cache hit rate
    - Calculate intent distribution
    - Calculate agent performance metrics
    - Identify popular questions
    - Calculate follow-up engagement rate
    - Restrict to admin users only
    - _Requirements: 11.3, 11.4, 11.5_

  - [ ] 32.2 Create analytics dashboard page (admin only)
    - Display overview metrics cards
    - Show intent distribution chart
    - Show agent performance table
    - Show popular questions list
    - Show follow-up engagement metrics
    - Add date range filter
    - _Requirements: 11.3, 11.4, 11.5_

  - [ ]* 32.3 Write unit tests for analytics calculations
    - Test metric calculations
    - Test date filtering
    - _Requirements: 11.3, 11.4_

- [ ] 33. Performance optimization
  - [ ] 33.1 Implement parallel agent execution
    - Use Promise.all() for concurrent agent calls
    - Set individual agent timeouts
    - Handle partial failures gracefully
    - _Requirements: 4.6, 20.2_

  - [ ] 33.2 Add database indexes
    - Index question_sessions(user_id, created_at)
    - Index agent_runs(session_id, status)
    - Index analytics_events(user_id, event_type, created_at)
    - Index question_cache(question_hash, expires_at)
    - _Requirements: 20.1, 20.2_

  - [ ] 33.3 Implement request queueing
    - Add queue for high load scenarios
    - Show estimated wait time to users
    - Process queue with worker threads
    - _Requirements: 20.5_

  - [ ]* 33.4 Write property test for response time
    - **Property 45: Overall Response Time Performance**
    - **Validates: Requirements 20.1**

  - [ ]* 33.5 Write performance tests
    - Test 100 concurrent requests
    - Test 95th percentile response time
    - Test cache performance
    - _Requirements: 20.1, 20.2_


- [ ] 34. Environment configuration
  - [ ] 34.1 Add environment variables
    - Add OPENAI_API_KEY
    - Add OPENAI_MODEL (default: gpt-4-turbo-preview)
    - Add timeout configurations
    - Add rate limit configurations
    - Add cache TTL configurations
    - Add feature flags
    - Document all variables in .env.example
    - _Requirements: 3.5, 5.5, 6.7, 17.1, 17.2, 20.3_

  - [ ] 34.2 Create configuration validation
    - Validate required environment variables on startup
    - Provide clear error messages for missing config
    - _Requirements: 3.5_

- [ ] 35. Security implementation
  - [ ] 35.1 Implement input sanitization
    - Sanitize question text to prevent injection
    - Remove script tags and javascript: protocols
    - Validate all user inputs
    - _Requirements: 2.2, 2.3_

  - [ ] 35.2 Implement authentication checks
    - Verify user authentication on all API routes
    - Check session ownership for session-specific routes
    - Implement CSRF protection
    - _Requirements: 9.6, 9.7, 10.1_

  - [ ] 35.3 Implement data privacy measures
    - Never log full user context in production
    - Anonymize data in analytics
    - Encrypt sensitive data at rest
    - _Requirements: 11.1, 11.2_

  - [ ]* 35.4 Write security tests
    - Test input sanitization
    - Test authentication enforcement
    - Test authorization checks
    - _Requirements: 2.2, 9.6_

- [ ] 36. Checkpoint - Security and performance complete
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 37. Integration testing
  - [ ]* 37.1 Write integration tests for question submission flow
    - Test end-to-end suggested question flow
    - Test end-to-end custom question flow
    - Test end-to-end follow-up flow
    - Test database persistence
    - Test analytics tracking
    - _Requirements: 1.4, 2.4, 7.4, 9.1, 11.1_

  - [ ]* 37.2 Write integration tests for error scenarios
    - Test OpenAI API timeout
    - Test OpenAI API unavailability
    - Test database connection failure
    - Test all agents failing
    - Test rate limit exceeded
    - _Requirements: 4.7, 13.6, 13.7, 17.3_

  - [ ]* 37.3 Write integration tests for caching
    - Test cache hit on duplicate question
    - Test cache expiration
    - Test cache invalidation
    - _Requirements: 16.5, 16.6_

  - [ ]* 37.4 Write integration tests for personalization
    - Test suggestions for user with insurance
    - Test suggestions for NRI user
    - Test suggestions for user with loans
    - Test suggestions for minimal user data
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.6_

- [ ] 38. Documentation
  - [ ] 38.1 Create API documentation
    - Document all API endpoints
    - Include request/response examples
    - Document error codes
    - Document rate limits
    - _Requirements: 1.4, 2.4, 9.6, 10.1, 17.1_

  - [ ] 38.2 Create developer guide
    - Document system architecture
    - Document reasoning agent framework
    - Document how to add new agents
    - Document configuration options
    - Document testing strategy
    - _Requirements: 18.3_

  - [ ] 38.3 Create user guide
    - Document how to use suggested questions
    - Document how to ask custom questions
    - Document how to use follow-ups
    - Document how to view history
    - Document how to provide feedback
    - _Requirements: 1.1, 2.1, 7.1, 9.6, 10.1_


- [ ] 39. Deployment preparation
  - [ ] 39.1 Run database migrations on staging
    - Execute migration script
    - Verify all tables created
    - Verify indexes created
    - _Requirements: 9.1_

  - [ ] 39.2 Seed suggested questions on staging
    - Run seed script
    - Verify questions appear in database
    - Test personalization with different user profiles
    - _Requirements: 1.1, 8.1_

  - [ ] 39.3 Configure environment variables on staging
    - Set OpenAI API key
    - Set timeout configurations
    - Set rate limit configurations
    - Enable caching
    - Enable analytics
    - _Requirements: 3.5, 17.1, 20.3_

  - [ ] 39.4 Set up monitoring and alerts
    - Configure error tracking
    - Set up response time monitoring
    - Set up OpenAI API usage monitoring
    - Configure alerts for high error rates
    - Configure alerts for slow response times
    - _Requirements: 11.3, 11.4, 20.1_

  - [ ] 39.5 Perform staging smoke tests
    - Test suggested question flow
    - Test custom question flow
    - Test follow-up flow
    - Test rate limiting
    - Test error handling
    - Test analytics tracking
    - _Requirements: 1.4, 2.4, 7.4, 17.1_

- [ ] 40. Production deployment
  - [ ] 40.1 Run database migrations on production
    - Execute migration script
    - Verify all tables created
    - Monitor for errors
    - _Requirements: 9.1_

  - [ ] 40.2 Seed suggested questions on production
    - Run seed script
    - Verify questions appear
    - _Requirements: 1.1_

  - [ ] 40.3 Configure production environment
    - Set production OpenAI API key
    - Set production configurations
    - Enable production monitoring
    - _Requirements: 3.5_

  - [ ] 40.4 Deploy application to production
    - Deploy Next.js application
    - Verify deployment successful
    - Monitor error rates
    - _Requirements: 1.1_

  - [ ] 40.5 Perform production smoke tests
    - Test basic question flow
    - Verify analytics tracking
    - Verify rate limiting
    - Monitor performance metrics
    - _Requirements: 1.4, 11.1, 17.1, 20.1_

- [ ] 41. Final checkpoint - Deployment complete
  - Ensure all production tests pass, monitor for 24 hours, ask the user if questions arise.


## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples, edge cases, and error conditions
- Integration tests validate end-to-end flows and component interactions
- The implementation follows a bottom-up approach: database → backend → API → frontend
- All 12 reasoning agents follow the same interface pattern for consistency
- Parallel agent execution is critical for meeting performance requirements
- Graceful degradation ensures reliability even when individual agents fail
- Comprehensive error handling provides good user experience during failures
- Rate limiting and caching are essential for cost control and performance
- Security measures protect against common vulnerabilities
- Analytics tracking enables continuous improvement based on usage patterns

## Implementation Language

This feature will be implemented in **TypeScript** using:
- Next.js 14 (App Router) for frontend and API routes
- React 18 for UI components
- Supabase (PostgreSQL) for database
- OpenAI GPT-4 API for AI capabilities
- Vitest for unit tests
- fast-check for property-based tests
- Playwright for E2E tests

## Estimated Timeline

- Phase 1 (Database + Backend): 2-3 weeks
- Phase 2 (API Routes): 1 week
- Phase 3 (Frontend Components): 2-3 weeks
- Phase 4 (Integration + Testing): 1-2 weeks
- Phase 5 (Deployment): 1 week

Total: 7-10 weeks for complete implementation with comprehensive testing

## Success Criteria

- All 46 correctness properties validated through property-based tests
- 95% of questions return answers within 15 seconds
- Rate limiting enforced correctly for free and premium tiers
- All mandatory disclaimers included in responses
- Analytics tracking all user interactions
- Zero data privacy violations
- Graceful handling of all error scenarios
- Successful deployment to production with monitoring
