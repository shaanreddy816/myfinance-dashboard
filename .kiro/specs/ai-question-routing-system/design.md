# Design Document: AI Question Routing System

## Overview

The AI Question Routing System is an intelligent financial copilot that enables users to ask financial questions and receive multi-perspective analysis from specialized reasoning agents. The system classifies user intent, routes questions to relevant analytical frameworks (First Principles, Devil's Advocate, Opportunity Cost, etc.), synthesizes outputs into actionable recommendations, and generates contextual follow-up questions.

### Key Design Goals

1. **Intelligent Routing**: Automatically classify user questions and select the most relevant reasoning agents
2. **Multi-Agent Analysis**: Execute multiple reasoning frameworks in parallel for comprehensive insights
3. **Unified Synthesis**: Combine diverse agent outputs into a single, user-friendly answer
4. **Contextual Personalization**: Tailor suggestions and analysis based on user's financial profile
5. **Scalable Architecture**: Support horizontal scaling and handle concurrent requests efficiently
6. **Safety First**: Include appropriate disclaimers and uncertainty flags in all responses

### System Boundaries

**In Scope:**
- Suggested and custom question interfaces
- Intent classification and agent selection
- 12 reasoning agent frameworks
- Multi-agent output synthesis
- Follow-up question generation
- Question session management
- Analytics and tracking
- Rate limiting and cost control

**Out of Scope (Future Enhancements):**
- Document upload and analysis (architecture prepared)
- Multi-language support beyond English (architecture prepared)
- Voice input/output
- Real-time collaborative question sessions


## Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         User Interface Layer                         │
│  ┌──────────────────┐              ┌──────────────────────────┐    │
│  │ Suggested        │              │ Custom Question          │    │
│  │ Questions Panel  │              │ Input Field              │    │
│  └────────┬─────────┘              └────────┬─────────────────┘    │
│           │                                  │                       │
│           └──────────────┬───────────────────┘                       │
└──────────────────────────┼─────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Question Router Orchestrator                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  1. Validate Input                                            │  │
│  │  2. Create Question Session                                   │  │
│  │  3. Invoke Intent Classifier                                  │  │
│  │  4. Invoke Agent Selector                                     │  │
│  │  5. Execute Reasoning Agents (Parallel)                       │  │
│  │  6. Invoke Synthesis Engine                                   │  │
│  │  7. Generate Follow-Up Questions                              │  │
│  │  8. Store Results & Return Response                           │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Intent     │  │    Agent     │  │  Synthesis   │
│ Classifier   │  │  Selector    │  │   Engine     │
│              │  │              │  │              │
│ (OpenAI GPT) │  │ (Rule-based) │  │ (OpenAI GPT) │
└──────────────┘  └──────┬───────┘  └──────────────┘
                         │
                         ▼
        ┌────────────────────────────────────┐
        │    Reasoning Agent Pool            │
        │  ┌──────────────────────────────┐  │
        │  │ First Principles Agent       │  │
        │  │ Devil's Advocate Agent       │  │
        │  │ Opportunity Cost Agent       │  │
        │  │ Occam's Razor Agent          │  │
        │  │ Margin of Safety Agent       │  │
        │  │ Pareto Principle Agent       │  │
        │  │ SWOT Agent                   │  │
        │  │ Pre-Mortem Agent             │  │
        │  │ Systems Thinking Agent       │  │
        │  │ Flywheel Agent               │  │
        │  │ Product-Market Fit Agent     │  │
        │  │ Jobs-To-Be-Done Agent        │  │
        │  └──────────────────────────────┘  │
        └────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Data Layer                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ Question     │  │ Agent Runs   │  │ Final Recommendations    │  │
│  │ Sessions     │  │ & Outputs    │  │ & Follow-Ups             │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ User Context │  │ Suggested    │  │ Analytics Events         │  │
│  │ (Existing)   │  │ Questions    │  │                          │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

```
User Question Submission Flow:
─────────────────────────────

1. User clicks suggested question OR types custom question
   │
   ▼
2. QuestionRouter.submitQuestion(questionText)
   │
   ├─► Validate input (10-500 chars)
   │
   ├─► Create QuestionSession record in DB
   │
   ├─► Fetch UserContext from existing tables
   │   (insurance, loans, investments, income, expenses, family)
   │
   ▼
3. IntentClassifier.classify(questionText, userContext)
   │
   ├─► Call OpenAI GPT-4 with classification prompt
   │
   ├─► Return IntentCategory + confidence score
   │
   ▼
4. AgentSelector.selectAgents(intentCategory)
   │
   ├─► Lookup intent-to-agent mapping
   │
   ├─► Return array of 2-5 ReasoningAgent instances
   │
   ▼
5. Execute agents in parallel using Promise.all()
   │
   ├─► Each agent receives: question, intent, userContext
   │
   ├─► Each agent calls OpenAI with framework-specific prompt
   │
   ├─► Each agent returns AgentOutputContract JSON
   │
   ├─► Store each agent run + output in DB
   │
   ▼
6. SynthesisEngine.synthesize(agentOutputs, question, userContext)
   │
   ├─► Identify common themes across outputs
   │
   ├─► Resolve conflicts and prioritize insights
   │
   ├─► Format final answer with sections:
   │   - Summary
   │   - Key Insights
   │   - Recommendations
   │   - Risks and Considerations
   │   - Next Steps
   │
   ├─► Add safety disclaimers
   │
   ├─► Store final answer in DB
   │
   ▼
7. FollowUpGenerator.generate(question, answer, userContext)
   │
   ├─► Generate 3-5 contextual follow-up questions
   │
   ├─► Store follow-ups in DB
   │
   ▼
8. Return complete response to UI
   │
   ├─► Final answer
   ├─► Follow-up questions
   ├─► Agent attribution
   └─► Confidence scores
```


### Data Flow Diagram

```
┌──────────┐
│  User    │
│ Question │
└────┬─────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Question Router API                       │
│  POST /api/question-router/ask                              │
│  {                                                           │
│    questionText: string,                                     │
│    sessionId?: string  // for follow-ups                     │
│  }                                                           │
└────┬────────────────────────────────────────────────────────┘
     │
     ├─► Fetch User Context
     │   ├─► Insurance policies
     │   ├─► Loans
     │   ├─► Investments
     │   ├─► Income/Expenses
     │   ├─► Family members
     │   └─► NRI status
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│              Intent Classification (OpenAI)                  │
│  Prompt: "Classify this financial question..."              │
│  Output: {                                                   │
│    intent: "health_insurance_analysis",                      │
│    confidence: 0.92                                          │
│  }                                                           │
└────┬────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Agent Selection                            │
│  Intent: health_insurance_analysis                           │
│  Selected Agents:                                            │
│    - First Principles                                        │
│    - Devil's Advocate                                        │
│    - Margin of Safety                                        │
│    - SWOT                                                    │
└────┬────────────────────────────────────────────────────────┘
     │
     ├──────────────┬──────────────┬──────────────┐
     ▼              ▼              ▼              ▼
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│ Agent 1 │   │ Agent 2 │   │ Agent 3 │   │ Agent 4 │
│ (GPT-4) │   │ (GPT-4) │   │ (GPT-4) │   │ (GPT-4) │
└────┬────┘   └────┬────┘   └────┬────┘   └────┬────┘
     │             │             │             │
     │  Output 1   │  Output 2   │  Output 3   │  Output 4
     │             │             │             │
     └──────────────┴──────────────┴──────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│              Synthesis Engine (OpenAI)                       │
│  Prompt: "Combine these agent outputs..."                   │
│  Inputs: [Output1, Output2, Output3, Output4]               │
│  Output: {                                                   │
│    summary: "...",                                           │
│    keyInsights: [...],                                       │
│    recommendations: [...],                                   │
│    risks: [...],                                             │
│    nextSteps: [...]                                          │
│  }                                                           │
└────┬────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│           Follow-Up Generator (OpenAI)                       │
│  Prompt: "Generate follow-up questions..."                  │
│  Output: [                                                   │
│    "What is the waiting period for my pre-existing...",     │
│    "Should I consider adding a critical illness rider?",    │
│    "How does my current coverage compare to..."             │
│  ]                                                           │
└────┬────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│                  Store in Database                           │
│  - question_sessions                                         │
│  - agent_runs                                                │
│  - agent_outputs                                             │
│  - final_recommendations                                     │
│  - follow_up_questions                                       │
│  - analytics_events                                          │
└────┬────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│                Return Response to UI                         │
│  {                                                           │
│    sessionId: "...",                                         │
│    answer: { summary, insights, recommendations, ... },      │
│    followUpQuestions: [...],                                 │
│    agentAttribution: [...],                                  │
│    confidence: 0.87,                                         │
│    processingTime: 8.2                                       │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
```


## Components and Interfaces

### 1. Question Router Orchestrator

The central coordinator that manages the entire question-answer workflow.

**TypeScript Interface:**

```typescript
interface QuestionRouterConfig {
  maxQuestionLength: number; // 500
  minQuestionLength: number; // 10
  defaultTimeout: number; // 30000ms
  agentTimeout: number; // 10000ms
  synthesisTimeout: number; // 5000ms
  enableCaching: boolean;
  cacheTTL: number; // 3600s
}

interface QuestionSubmission {
  questionText: string;
  userId: string;
  sessionId?: string; // for follow-ups
  source: 'suggested' | 'custom';
  suggestedQuestionId?: string;
}

interface QuestionResponse {
  sessionId: string;
  answer: FinalAnswer;
  followUpQuestions: FollowUpQuestion[];
  agentAttribution: AgentAttribution[];
  confidence: number;
  processingTime: number;
  cached: boolean;
}

class QuestionRouter {
  constructor(config: QuestionRouterConfig);
  
  async submitQuestion(submission: QuestionSubmission): Promise<QuestionResponse>;
  async getQuestionHistory(userId: string, limit?: number): Promise<QuestionSession[]>;
  async getSessionDetails(sessionId: string): Promise<QuestionSessionDetails>;
  async rateAnswer(sessionId: string, rating: number): Promise<void>;
}
```

**Key Methods:**

- `submitQuestion()`: Main entry point for processing questions
- `getQuestionHistory()`: Retrieve user's past questions and answers
- `getSessionDetails()`: Get full details of a specific question session
- `rateAnswer()`: Allow users to provide feedback on answers


### 2. Intent Classifier

AI-powered component that maps questions to intent categories.

**TypeScript Interface:**

```typescript
type IntentCategory =
  | 'financial_health_check'
  | 'health_insurance_analysis'
  | 'term_insurance_decision'
  | 'loan_decision'
  | 'investment_analysis'
  | 'budget_optimization'
  | 'emergency_fund_planning'
  | 'retirement_planning'
  | 'nri_return_planning'
  | 'document_analysis'
  | 'general_financial_advice';

interface IntentClassificationResult {
  intent: IntentCategory;
  confidence: number; // 0-1
  reasoning: string;
  alternativeIntents?: Array<{
    intent: IntentCategory;
    confidence: number;
  }>;
}

interface UserContext {
  userId: string;
  hasInsurance: boolean;
  insurancePolicies: Array<{
    type: string;
    sumInsured: number;
  }>;
  hasLoans: boolean;
  totalLoanAmount: number;
  monthlyEMI: number;
  hasInvestments: boolean;
  totalInvestments: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  familySize: number;
  age: number;
  isNRI: boolean;
  hasEmergencyFund: boolean;
}

class IntentClassifier {
  async classify(
    questionText: string,
    userContext: UserContext
  ): Promise<IntentClassificationResult>;
  
  async batchClassify(
    questions: string[],
    userContext: UserContext
  ): Promise<IntentClassificationResult[]>;
}
```

**Classification Prompt Template:**

```
You are a financial intent classifier for an Indian family finance platform.

User Question: "{questionText}"

User Context:
- Monthly Income: ₹{monthlyIncome}
- Has Insurance: {hasInsurance}
- Has Loans: {hasLoans}
- Has Investments: {hasInvestments}
- Family Size: {familySize}
- Is NRI: {isNRI}

Classify this question into ONE of these intents:
1. financial_health_check - Overall financial health assessment
2. health_insurance_analysis - Health insurance coverage, claims, policies
3. term_insurance_decision - Life/term insurance needs
4. loan_decision - Loan advice, EMI, prepayment
5. investment_analysis - Investment portfolio, SIP, mutual funds
6. budget_optimization - Budget planning, expense management
7. emergency_fund_planning - Emergency fund adequacy
8. retirement_planning - Retirement corpus, planning
9. nri_return_planning - NRI return to India planning
10. document_analysis - Analysis of uploaded documents
11. general_financial_advice - General financial questions

Return JSON:
{
  "intent": "<intent_category>",
  "confidence": <0-1>,
  "reasoning": "<brief explanation>"
}
```


### 3. Agent Selector

Rule-based component that selects appropriate reasoning agents for each intent.

**TypeScript Interface:**

```typescript
type ReasoningAgentType =
  | 'first_principles'
  | 'devils_advocate'
  | 'opportunity_cost'
  | 'occams_razor'
  | 'margin_of_safety'
  | 'pareto_principle'
  | 'swot'
  | 'pre_mortem'
  | 'systems_thinking'
  | 'flywheel'
  | 'product_market_fit'
  | 'jobs_to_be_done';

interface AgentSelectionConfig {
  intentToAgentMap: Record<IntentCategory, ReasoningAgentType[]>;
  enabledAgents: ReasoningAgentType[];
  maxAgentsPerQuestion: number; // 5
  minAgentsPerQuestion: number; // 2
}

class AgentSelector {
  constructor(config: AgentSelectionConfig);
  
  selectAgents(intent: IntentCategory): ReasoningAgentType[];
  isAgentEnabled(agentType: ReasoningAgentType): boolean;
  updateAgentMapping(intent: IntentCategory, agents: ReasoningAgentType[]): void;
}
```

**Intent-to-Agent Mapping:**

```typescript
const DEFAULT_INTENT_AGENT_MAP: Record<IntentCategory, ReasoningAgentType[]> = {
  financial_health_check: [
    'first_principles',
    'swot',
    'pareto_principle',
    'systems_thinking'
  ],
  
  health_insurance_analysis: [
    'first_principles',
    'devils_advocate',
    'margin_of_safety',
    'swot'
  ],
  
  term_insurance_decision: [
    'first_principles',
    'margin_of_safety',
    'pre_mortem',
    'devils_advocate'
  ],
  
  loan_decision: [
    'opportunity_cost',
    'margin_of_safety',
    'devils_advocate',
    'first_principles'
  ],
  
  investment_analysis: [
    'margin_of_safety',
    'systems_thinking',
    'pareto_principle',
    'opportunity_cost'
  ],
  
  budget_optimization: [
    'pareto_principle',
    'opportunity_cost',
    'first_principles',
    'swot'
  ],
  
  emergency_fund_planning: [
    'margin_of_safety',
    'pre_mortem',
    'first_principles'
  ],
  
  retirement_planning: [
    'first_principles',
    'systems_thinking',
    'margin_of_safety',
    'opportunity_cost'
  ],
  
  nri_return_planning: [
    'swot',
    'pre_mortem',
    'systems_thinking',
    'opportunity_cost'
  ],
  
  document_analysis: [
    'first_principles',
    'devils_advocate',
    'occams_razor'
  ],
  
  general_financial_advice: [
    'first_principles',
    'swot',
    'opportunity_cost'
  ]
};
```


### 4. Reasoning Agent Framework

Base interface and implementations for all reasoning agents.

**TypeScript Interface:**

```typescript
interface AgentOutputContract {
  agentName: string;
  frameworkApplied: string;
  keyInsights: string[];
  recommendations: string[];
  risksIdentified: string[];
  confidenceScore: number; // 0-100
  reasoningSteps: string[];
  documentReferences?: Array<{
    documentId: string;
    pageNumber?: number;
    excerpt: string;
  }>;
}

interface ReasoningAgentInput {
  question: string;
  intent: IntentCategory;
  userContext: UserContext;
  documentContext?: {
    documentId: string;
    extractedText: string;
    metadata: Record<string, any>;
  };
}

abstract class BaseReasoningAgent {
  abstract agentType: ReasoningAgentType;
  abstract frameworkName: string;
  abstract frameworkDescription: string;
  
  abstract analyze(input: ReasoningAgentInput): Promise<AgentOutputContract>;
  
  protected async callLLM(prompt: string): Promise<string>;
  protected validateOutput(output: AgentOutputContract): boolean;
}
```

**Example: First Principles Agent**

```typescript
class FirstPrinciplesAgent extends BaseReasoningAgent {
  agentType = 'first_principles' as const;
  frameworkName = 'First Principles Thinking';
  frameworkDescription = 'Break down complex problems to fundamental truths and build up from there';
  
  async analyze(input: ReasoningAgentInput): Promise<AgentOutputContract> {
    const prompt = this.buildPrompt(input);
    const response = await this.callLLM(prompt);
    const output = JSON.parse(response);
    
    if (!this.validateOutput(output)) {
      throw new Error('Invalid agent output');
    }
    
    return output;
  }
  
  private buildPrompt(input: ReasoningAgentInput): string {
    return `
You are a First Principles Reasoning Agent for financial analysis.

Framework: Break down the question to fundamental truths, challenge assumptions, and build up logical conclusions.

User Question: "${input.question}"
Intent: ${input.intent}

User Financial Context:
- Monthly Income: ₹${input.userContext.monthlyIncome}
- Monthly Expenses: ₹${input.userContext.monthlyExpenses}
- Total Loans: ₹${input.userContext.totalLoanAmount}
- Total Investments: ₹${input.userContext.totalInvestments}
- Family Size: ${input.userContext.familySize}
- Age: ${input.userContext.age}
- Is NRI: ${input.userContext.isNRI}

Apply First Principles Thinking:
1. Identify the fundamental truths and assumptions in this question
2. Break down the problem to its core components
3. Challenge each assumption
4. Build up logical conclusions from first principles
5. Provide actionable insights

Return JSON matching this schema:
{
  "agentName": "First Principles Agent",
  "frameworkApplied": "First Principles Thinking",
  "keyInsights": ["insight 1", "insight 2", ...],
  "recommendations": ["recommendation 1", "recommendation 2", ...],
  "risksIdentified": ["risk 1", "risk 2", ...],
  "confidenceScore": 85,
  "reasoningSteps": ["step 1", "step 2", ...]
}
`;
  }
}
```


**All 12 Reasoning Agent Frameworks:**

1. **First Principles Agent**: Break down to fundamental truths
2. **Devil's Advocate Agent**: Challenge assumptions and find counterarguments
3. **Opportunity Cost Agent**: Analyze trade-offs and alternative uses of resources
4. **Occam's Razor Agent**: Find the simplest explanation or solution
5. **Margin of Safety Agent**: Identify safety buffers and risk mitigation
6. **Pareto Principle Agent**: Find the 20% of actions that yield 80% of results
7. **SWOT Agent**: Analyze Strengths, Weaknesses, Opportunities, Threats
8. **Pre-Mortem Agent**: Imagine future failure and work backwards
9. **Systems Thinking Agent**: Analyze interconnections and feedback loops
10. **Flywheel Agent**: Identify compounding effects and momentum builders
11. **Product-Market Fit Agent**: Assess alignment between needs and solutions
12. **Jobs-To-Be-Done Agent**: Understand the underlying job the user is trying to accomplish

Each agent follows the same interface but applies its unique analytical framework.


### 5. Synthesis Engine

Combines multiple agent outputs into a unified, user-friendly answer.

**TypeScript Interface:**

```typescript
interface FinalAnswer {
  summary: string;
  keyInsights: Array<{
    insight: string;
    sourceAgents: string[];
    importance: 'high' | 'medium' | 'low';
  }>;
  recommendations: Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    effort: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
    sourceAgents: string[];
  }>;
  risksAndConsiderations: Array<{
    risk: string;
    severity: 'high' | 'medium' | 'low';
    mitigation: string;
    sourceAgents: string[];
  }>;
  nextSteps: string[];
  disclaimer: string;
  uncertaintyFlags: string[];
}

interface SynthesisInput {
  question: string;
  intent: IntentCategory;
  userContext: UserContext;
  agentOutputs: AgentOutputContract[];
}

class SynthesisEngine {
  async synthesize(input: SynthesisInput): Promise<FinalAnswer>;
  
  private identifyCommonThemes(outputs: AgentOutputContract[]): string[];
  private resolveConflicts(outputs: AgentOutputContract[]): any;
  private prioritizeRecommendations(outputs: AgentOutputContract[]): any[];
  private generateDisclaimer(intent: IntentCategory, confidence: number): string;
  private flagUncertainty(outputs: AgentOutputContract[]): string[];
}
```


**Synthesis Algorithm Pseudocode:**

```
function synthesize(question, intent, userContext, agentOutputs):
  // Step 1: Extract all insights, recommendations, and risks
  allInsights = []
  allRecommendations = []
  allRisks = []
  
  for each output in agentOutputs:
    allInsights.extend(output.keyInsights)
    allRecommendations.extend(output.recommendations)
    allRisks.extend(output.risksIdentified)
  
  // Step 2: Identify common themes using semantic similarity
  commonThemes = clusterSimilarInsights(allInsights)
  
  // Step 3: Prioritize insights by frequency and agent confidence
  prioritizedInsights = []
  for each theme in commonThemes:
    importance = calculateImportance(theme.frequency, theme.avgConfidence)
    prioritizedInsights.add({
      insight: theme.representative,
      sourceAgents: theme.agents,
      importance: importance
    })
  
  // Step 4: Resolve conflicting recommendations
  recommendations = []
  conflictGroups = findConflictingRecommendations(allRecommendations)
  
  for each group in conflictGroups:
    if group.hasConflict:
      // Present multiple perspectives
      recommendations.add(formatMultiplePerspectives(group))
    else:
      recommendations.add(formatRecommendation(group))
  
  // Step 5: Assess and categorize risks
  categorizedRisks = []
  for each risk in allRisks:
    severity = assessRiskSeverity(risk, userContext)
    mitigation = generateMitigation(risk, userContext)
    categorizedRisks.add({
      risk: risk,
      severity: severity,
      mitigation: mitigation,
      sourceAgents: getSourceAgents(risk)
    })
  
  // Step 6: Generate summary using LLM
  summary = await generateSummary(
    question,
    prioritizedInsights,
    recommendations,
    categorizedRisks
  )
  
  // Step 7: Extract next steps
  nextSteps = extractActionableSteps(recommendations, 5)
  
  // Step 8: Add safety guardrails
  avgConfidence = calculateAverageConfidence(agentOutputs)
  disclaimer = generateDisclaimer(intent, avgConfidence)
  uncertaintyFlags = flagUncertainty(agentOutputs, avgConfidence)
  
  return {
    summary,
    keyInsights: prioritizedInsights,
    recommendations,
    risksAndConsiderations: categorizedRisks,
    nextSteps,
    disclaimer,
    uncertaintyFlags
  }
```


### 6. Follow-Up Question Generator

Generates contextual follow-up questions based on the answer.

**TypeScript Interface:**

```typescript
interface FollowUpQuestion {
  id: string;
  questionText: string;
  category: string;
  relevanceScore: number;
  displayOrder: number;
}

class FollowUpGenerator {
  async generate(
    originalQuestion: string,
    answer: FinalAnswer,
    userContext: UserContext,
    count?: number
  ): Promise<FollowUpQuestion[]>;
  
  private scoreRelevance(question: string, userContext: UserContext): number;
  private avoidDuplicates(questions: string[], existing: string[]): string[];
}
```

**Generation Prompt Template:**

```
Based on this financial question and answer, generate 5 relevant follow-up questions.

Original Question: "{originalQuestion}"

Answer Summary: "{answer.summary}"

Key Insights: {answer.keyInsights}

User Context:
- Has Insurance: {hasInsurance}
- Has Loans: {hasLoans}
- Monthly Income: ₹{monthlyIncome}

Generate follow-up questions that:
1. Explore related topics mentioned in the answer
2. Help the user take action on recommendations
3. Address potential concerns or risks identified
4. Are specific to the user's financial situation
5. Are actionable and not too broad

Return JSON array:
[
  {
    "questionText": "...",
    "category": "...",
    "relevanceScore": 0.9
  },
  ...
]
```


### 7. Suggestion Personalizer

Customizes suggested questions based on user profile.

**TypeScript Interface:**

```typescript
interface SuggestedQuestion {
  id: string;
  category: string;
  questionText: string;
  intentCategory: IntentCategory;
  displayOrder: number;
  isActive: boolean;
  personalizationScore?: number;
}

class SuggestionPersonalizer {
  async getPersonalizedSuggestions(
    userId: string,
    userContext: UserContext,
    count?: number
  ): Promise<SuggestedQuestion[]>;
  
  private scoreQuestionRelevance(
    question: SuggestedQuestion,
    userContext: UserContext
  ): number;
  
  private ensureMinimumQuestions(
    questions: SuggestedQuestion[],
    minCount: number
  ): SuggestedQuestion[];
}
```

**Personalization Rules:**

```typescript
function scoreQuestionRelevance(question: SuggestedQuestion, context: UserContext): number {
  let score = 0;
  
  // Health insurance questions
  if (question.category === 'health_insurance') {
    if (context.hasInsurance) score += 30;
    if (context.familySize > 2) score += 20;
  }
  
  // Loan questions
  if (question.category === 'loans') {
    if (context.hasLoans) score += 40;
    if (context.monthlyEMI > context.monthlyIncome * 0.4) score += 30;
  }
  
  // Investment questions
  if (question.category === 'investments') {
    if (context.hasInvestments) score += 30;
    if (context.age < 40) score += 20;
  }
  
  // Emergency fund questions
  if (question.category === 'emergency_fund') {
    if (!context.hasEmergencyFund) score += 50;
  }
  
  // NRI questions
  if (question.category === 'nri_planning') {
    if (context.isNRI) score += 60;
    else score = 0; // Don't show to non-NRI
  }
  
  return score;
}
```


## Data Models

### Database Schema

**1. suggested_questions**

```sql
CREATE TABLE suggested_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  question_text TEXT NOT NULL,
  intent_category TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_suggested_questions_category ON suggested_questions(category);
CREATE INDEX idx_suggested_questions_active ON suggested_questions(is_active);
```

**2. question_sessions**

```sql
CREATE TABLE question_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  intent_category TEXT NOT NULL,
  intent_confidence DECIMAL(3,2),
  session_status TEXT DEFAULT 'processing', -- processing, completed, failed
  source TEXT NOT NULL, -- suggested, custom
  suggested_question_id UUID REFERENCES suggested_questions(id),
  parent_session_id UUID REFERENCES question_sessions(id), -- for follow-ups
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_question_sessions_user ON question_sessions(user_id, created_at DESC);
CREATE INDEX idx_question_sessions_status ON question_sessions(session_status);
CREATE INDEX idx_question_sessions_intent ON question_sessions(intent_category);
```

**3. agent_runs**

```sql
CREATE TABLE agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES question_sessions(id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL,
  agent_type TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'running', -- running, completed, failed, timeout
  error_message TEXT,
  execution_time_ms INTEGER
);

CREATE INDEX idx_agent_runs_session ON agent_runs(session_id);
CREATE INDEX idx_agent_runs_status ON agent_runs(status);
CREATE INDEX idx_agent_runs_agent_type ON agent_runs(agent_type);
```

**4. agent_outputs**

```sql
CREATE TABLE agent_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_run_id UUID NOT NULL REFERENCES agent_runs(id) ON DELETE CASCADE,
  output_json JSONB NOT NULL,
  confidence_score INTEGER NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agent_outputs_run ON agent_outputs(agent_run_id);
CREATE INDEX idx_agent_outputs_confidence ON agent_outputs(confidence_score);
```


**5. final_recommendations**

```sql
CREATE TABLE final_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES question_sessions(id) ON DELETE CASCADE,
  synthesized_answer JSONB NOT NULL,
  summary TEXT NOT NULL,
  overall_confidence INTEGER NOT NULL,
  user_feedback_rating INTEGER CHECK (user_feedback_rating >= 1 AND user_feedback_rating <= 5),
  user_feedback_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_final_recommendations_session ON final_recommendations(session_id);
CREATE INDEX idx_final_recommendations_rating ON final_recommendations(user_feedback_rating);
```

**6. follow_up_questions**

```sql
CREATE TABLE follow_up_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES question_sessions(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  category TEXT,
  relevance_score DECIMAL(3,2),
  display_order INTEGER NOT NULL,
  was_clicked BOOLEAN DEFAULT false,
  clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_follow_up_questions_session ON follow_up_questions(session_id);
CREATE INDEX idx_follow_up_questions_clicked ON follow_up_questions(was_clicked);
```

**7. analytics_events**

```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- question_submitted, suggested_clicked, custom_submitted, follow_up_clicked, answer_rated
  event_data JSONB NOT NULL,
  session_id UUID REFERENCES question_sessions(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_user ON analytics_events(user_id, created_at DESC);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created ON analytics_events(created_at DESC);
```

**8. question_cache**

```sql
CREATE TABLE question_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_hash TEXT NOT NULL UNIQUE,
  intent_category TEXT NOT NULL,
  cached_response JSONB NOT NULL,
  hit_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_question_cache_hash ON question_cache(question_hash);
CREATE INDEX idx_question_cache_expires ON question_cache(expires_at);
```


### Entity Relationship Diagram

```
┌─────────────────────┐
│  auth.users         │
│  (existing)         │
└──────┬──────────────┘
       │
       │ 1:N
       │
       ▼
┌─────────────────────────────────┐
│  question_sessions              │
│  ─────────────────────────────  │
│  id (PK)                        │
│  user_id (FK)                   │
│  question_text                  │
│  intent_category                │
│  intent_confidence              │
│  session_status                 │
│  source                         │
│  suggested_question_id (FK)     │
│  parent_session_id (FK, self)   │
│  created_at                     │
│  completed_at                   │
└──────┬──────────────────────────┘
       │
       ├─────────────┬─────────────┬─────────────┐
       │ 1:N         │ 1:1         │ 1:N         │
       ▼             ▼             ▼             ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ agent_runs   │ │   final_     │ │  follow_up_  │
│              │ │ recommend-   │ │  questions   │
│ id (PK)      │ │ ations       │ │              │
│ session_id   │ │              │ │ id (PK)      │
│ agent_name   │ │ id (PK)      │ │ session_id   │
│ agent_type   │ │ session_id   │ │ question_text│
│ status       │ │ synthesized_ │ │ was_clicked  │
│ started_at   │ │ answer       │ │ clicked_at   │
│ completed_at │ │ summary      │ └──────────────┘
│ error_msg    │ │ confidence   │
└──────┬───────┘ │ rating       │
       │         │ feedback     │
       │ 1:1     └──────────────┘
       ▼
┌──────────────┐
│ agent_       │
│ outputs      │
│              │
│ id (PK)      │
│ agent_run_id │
│ output_json  │
│ confidence   │
└──────────────┘

┌─────────────────────┐
│  suggested_         │
│  questions          │
│  ─────────────────  │
│  id (PK)            │
│  category           │
│  question_text      │
│  intent_category    │
│  display_order      │
│  is_active          │
└─────────────────────┘

┌─────────────────────┐
│  analytics_events   │
│  ─────────────────  │
│  id (PK)            │
│  user_id (FK)       │
│  event_type         │
│  event_data         │
│  session_id (FK)    │
│  created_at         │
└─────────────────────┘

┌─────────────────────┐
│  question_cache     │
│  ─────────────────  │
│  id (PK)            │
│  question_hash      │
│  intent_category    │
│  cached_response    │
│  hit_count          │
│  expires_at         │
└─────────────────────┘
```


### TypeScript Type Definitions

```typescript
// Database types
export interface QuestionSession {
  id: string;
  user_id: string;
  question_text: string;
  intent_category: IntentCategory;
  intent_confidence: number;
  session_status: 'processing' | 'completed' | 'failed';
  source: 'suggested' | 'custom';
  suggested_question_id?: string;
  parent_session_id?: string;
  created_at: string;
  completed_at?: string;
}

export interface AgentRun {
  id: string;
  session_id: string;
  agent_name: string;
  agent_type: ReasoningAgentType;
  started_at: string;
  completed_at?: string;
  status: 'running' | 'completed' | 'failed' | 'timeout';
  error_message?: string;
  execution_time_ms?: number;
}

export interface AgentOutput {
  id: string;
  agent_run_id: string;
  output_json: AgentOutputContract;
  confidence_score: number;
  created_at: string;
}

export interface FinalRecommendation {
  id: string;
  session_id: string;
  synthesized_answer: FinalAnswer;
  summary: string;
  overall_confidence: number;
  user_feedback_rating?: number;
  user_feedback_text?: string;
  created_at: string;
}

export interface FollowUpQuestionRecord {
  id: string;
  session_id: string;
  question_text: string;
  category?: string;
  relevance_score: number;
  display_order: number;
  was_clicked: boolean;
  clicked_at?: string;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  user_id: string;
  event_type: 'question_submitted' | 'suggested_clicked' | 'custom_submitted' | 'follow_up_clicked' | 'answer_rated';
  event_data: Record<string, any>;
  session_id?: string;
  created_at: string;
}

export interface QuestionCache {
  id: string;
  question_hash: string;
  intent_category: IntentCategory;
  cached_response: QuestionResponse;
  hit_count: number;
  created_at: string;
  expires_at: string;
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Question Submission Triggers Processing

*For any* suggested or custom question submission, the system should create a question session record, invoke the intent classifier, and display loading states.

**Validates: Requirements 1.4, 1.5, 2.4, 9.1**

### Property 2: Input Validation with Error Feedback

*For any* custom question input, if the length is outside the range of 10-500 characters, the system should reject the input and display a validation error message.

**Validates: Requirements 2.2, 2.3**

### Property 3: UI State Management During Processing

*For any* question being processed, the submit button should be disabled, and when processing completes, the answer should be displayed and the input field should be re-enabled.

**Validates: Requirements 2.5, 2.6**

### Property 4: Intent Classification Output Validity

*For any* question submitted, the intent classifier should return exactly one intent category from the predefined set of valid categories.

**Validates: Requirements 3.2**

### Property 5: Intent Classification with User Context

*For any* question submission, the intent classifier should be invoked with both the question text and the complete user context (insurance, loans, investments, income, expenses, family data).

**Validates: Requirements 3.1**


### Property 6: Default Intent for Low Confidence

*For any* question where the intent classifier confidence score is below a threshold, the system should assign the default intent category of "general_financial_advice".

**Validates: Requirements 3.4**

### Property 7: Intent Classification Performance

*For any* question, the intent classification should complete within 2 seconds.

**Validates: Requirements 3.5**

### Property 8: Agent Selection Count Bounds

*For any* intent category, the agent selector should select between 2 and 5 reasoning agents (inclusive).

**Validates: Requirements 4.1**

### Property 9: Parallel Agent Execution

*For any* set of selected reasoning agents, they should execute concurrently (in parallel) rather than sequentially to minimize total processing time.

**Validates: Requirements 4.6, 20.2**

### Property 10: Graceful Agent Failure Handling

*For any* reasoning agent that fails during execution, the system should continue processing with the remaining agents, log the failure, and exclude the failed agent's output from synthesis.

**Validates: Requirements 4.7**

### Property 11: Agent Input Contract

*For any* reasoning agent invocation, the agent should receive all three required inputs: question text, intent category, and user context.

**Validates: Requirements 5.1**

### Property 12: Agent Output Schema Conformance

*For any* reasoning agent output, it should conform to the AgentOutputContract JSON schema with all required fields: agent_name, framework_applied, key_insights, recommendations, risks_identified, confidence_score, and reasoning_steps.

**Validates: Requirements 5.3, 5.4**

### Property 13: Agent Execution Timeout

*For any* reasoning agent execution, if it exceeds 10 seconds, the system should timeout the agent and exclude its output from synthesis.

**Validates: Requirements 5.5, 5.6**

### Property 14: Synthesis Output Structure

*For any* synthesized answer, it should contain all required sections: Summary, Key Insights, Recommendations, Risks and Considerations, and Next Steps.

**Validates: Requirements 6.3**


### Property 15: Agent Attribution in Synthesis

*For any* insight or recommendation in the final answer, if it originated from a specific reasoning agent, it should include attribution to that agent.

**Validates: Requirements 6.4**

### Property 16: Synthesis Performance

*For any* synthesis operation, it should complete within 5 seconds.

**Validates: Requirements 6.7**

### Property 17: Follow-Up Question Count

*For any* generated final answer, the system should create between 3 and 5 follow-up questions (inclusive).

**Validates: Requirements 7.1**

### Property 18: Follow-Up Question Uniqueness

*For any* set of generated follow-up questions, there should be no duplicate questions (each question text should be unique).

**Validates: Requirements 7.5**

### Property 19: Follow-Up Session Linking

*For any* follow-up question that is clicked, the system should process it as a new question with a parent_session_id linking it to the original question session.

**Validates: Requirements 7.4**

### Property 20: Context-Based Question Personalization

*For any* user with specific financial data (insurance policies, loans, NRI status, or missing emergency fund), the personalized suggested questions should include relevant questions for those categories.

**Validates: Requirements 8.1, 8.2, 8.3, 8.4**

### Property 21: Minimum Suggested Questions

*For any* user context (including minimal context), the system should display at least 6 suggested questions.

**Validates: Requirements 8.6**

### Property 22: Personalization Refresh on Data Change

*For any* change to user financial data, the personalized suggested questions should be refreshed to reflect the new context.

**Validates: Requirements 8.5**

### Property 23: Complete Session Data Persistence

*For any* question session, the system should store the question text, intent category, timestamp, user_id, all agent outputs, the final synthesized answer, and all follow-up questions in the database with proper foreign key relationships.

**Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5**


### Property 24: Question History Retrieval

*For any* user, their question history should be retrievable in reverse chronological order (most recent first), and clicking any historical question should display its original answer and follow-ups.

**Validates: Requirements 9.6, 9.7**

### Property 25: Comprehensive Event Logging

*For any* user interaction (suggested question click, custom question submission, follow-up click, answer rating), the system should log an analytics event with all required fields (user_id, event_type, event_data, session_id, timestamp).

**Validates: Requirements 11.1, 11.2, 11.5**

### Property 26: Agent Execution Metrics Logging

*For any* reasoning agent execution, the system should log the execution time, success/failure status, and confidence score.

**Validates: Requirements 11.4**

### Property 27: Intent Classification Logging

*For any* completed intent classification, the system should log the classified intent category and confidence score.

**Validates: Requirements 11.3**

### Property 28: Mandatory Disclaimer Inclusion

*For any* final answer generated, it should include a disclaimer stating that the advice is for informational purposes and not professional financial advice.

**Validates: Requirements 12.1**

### Property 29: Low Confidence Uncertainty Flagging

*For any* final answer where the average reasoning agent confidence score is below 70%, the answer should be flagged as having higher uncertainty.

**Validates: Requirements 12.2**

### Property 30: Contextual Professional Consultation Disclaimers

*For any* answer that includes specific financial recommendations, tax implications, or insurance/legal matters, the system should include appropriate disclaimers suggesting consultation with qualified professionals.

**Validates: Requirements 12.3, 12.5, 12.6**

### Property 31: Tentative Language Usage

*For any* generated final answer, it should avoid definitive language patterns (e.g., "you must", "you should definitely") and instead use tentative language (e.g., "you might consider", "it may be beneficial").

**Validates: Requirements 12.4**

### Property 32: Progressive Loading State Messages

*For any* question being processed, the system should display appropriate status messages for each processing phase: "Analyzing your question" during classification, "Consulting financial frameworks" during agent execution, and "Preparing your answer" during synthesis.

**Validates: Requirements 13.1, 13.2, 13.3, 13.4**


### Property 33: User-Friendly Error Messages

*For any* error that occurs during processing, the system should display a user-friendly error message that does not expose technical implementation details.

**Validates: Requirements 13.5**

### Property 34: API Unavailability Handling

*For any* AI provider API unavailability error, the system should display a message indicating temporary unavailability and suggest trying again later.

**Validates: Requirements 13.6**

### Property 35: Overall Timeout Handling

*For any* question processing that exceeds 30 seconds, the system should display a timeout message and provide a retry option.

**Validates: Requirements 13.7**

### Property 36: Optimistic UI Updates

*For any* question submission, the UI should update optimistically (showing the question immediately) before server confirmation.

**Validates: Requirements 16.3**

### Property 37: Race Condition Handling

*For any* scenario where multiple questions are submitted rapidly, the system should handle them correctly without data corruption or lost requests.

**Validates: Requirements 16.4**

### Property 38: Client-Side Cache TTL

*For any* cached suggested questions or frequently asked questions, the cache should be valid for the configured TTL period (5 minutes for suggestions, 1 hour for FAQ) and then expire.

**Validates: Requirements 16.5, 20.3**

### Property 39: Cache Invalidation on Data Change

*For any* change to user financial data, all cached personalized data should be invalidated immediately.

**Validates: Requirements 16.6**

### Property 40: User Tier Rate Limiting

*For any* user, the system should enforce rate limits based on their tier: 10 questions per day for free users, 100 questions per day for premium users.

**Validates: Requirements 17.1, 17.2**

### Property 41: Rate Limit Exceeded Messaging

*For any* user who exceeds their daily question limit, the system should display a message indicating the limit and present upgrade options.

**Validates: Requirements 17.3**


### Property 42: Exponential Backoff on Rate Limit Errors

*For any* AI provider API rate limit error, the system should implement exponential backoff before retrying the request.

**Validates: Requirements 17.4**

### Property 43: Token Usage Logging

*For any* question processed, the system should log the AI API token usage for cost analysis purposes.

**Validates: Requirements 17.5**

### Property 44: Agent Extensibility

*For any* new reasoning agent added to the system, it should automatically become available in the agent pool without requiring changes to the agent selector core logic.

**Validates: Requirements 18.3**

### Property 45: Overall Response Time Performance

*For any* large sample of questions (e.g., 1000 questions), at least 95% should return a final answer within 15 seconds.

**Validates: Requirements 20.1**

### Property 46: Request Queueing Under Load

*For any* situation where system load exceeds capacity, incoming requests should be queued and users should be shown an estimated wait time.

**Validates: Requirements 20.5**


## Error Handling

### Error Categories and Handling Strategies

**1. Input Validation Errors**

- **Trigger**: Invalid question length, empty input, malformed data
- **Handling**: 
  - Display inline validation error messages
  - Prevent submission until corrected
  - Provide clear guidance on valid input format
- **User Experience**: Immediate feedback, no server round-trip

**2. Intent Classification Errors**

- **Trigger**: OpenAI API timeout, rate limit, or service unavailability
- **Handling**:
  - Retry with exponential backoff (3 attempts)
  - Fall back to default intent "general_financial_advice"
  - Log error for monitoring
- **User Experience**: Transparent to user, processing continues

**3. Agent Execution Errors**

- **Trigger**: Individual agent timeout, API error, or invalid output
- **Handling**:
  - Continue with remaining agents (graceful degradation)
  - Log failed agent details
  - Exclude failed agent from synthesis
  - If all agents fail, return error to user
- **User Experience**: May receive answer from fewer agents, with confidence score adjusted

**4. Synthesis Errors**

- **Trigger**: Synthesis timeout, API error, insufficient agent outputs
- **Handling**:
  - Retry once with shorter timeout
  - If retry fails, return raw agent outputs with minimal formatting
  - Log error for investigation
- **User Experience**: May receive less polished answer, but still actionable

**5. Database Errors**

- **Trigger**: Connection failure, constraint violation, timeout
- **Handling**:
  - Retry with connection pool
  - Return answer to user even if storage fails
  - Queue failed writes for retry
  - Alert monitoring system
- **User Experience**: User receives answer, history may be delayed

**6. Rate Limiting Errors**

- **Trigger**: User exceeds daily question limit, API rate limits
- **Handling**:
  - Display clear message about limit
  - Show upgrade options for free users
  - Implement exponential backoff for API limits
- **User Experience**: Clear explanation and next steps

**7. Timeout Errors**

- **Trigger**: Overall processing exceeds 30 seconds
- **Handling**:
  - Cancel pending operations
  - Return partial results if available
  - Offer retry option
  - Log timeout for performance analysis
- **User Experience**: Timeout message with retry button


### Error Recovery Patterns

**Circuit Breaker Pattern**

```typescript
class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime?: Date;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (this.shouldAttemptReset()) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess() {
    this.failureCount = 0;
    this.state = 'closed';
  }
  
  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = new Date();
    
    if (this.failureCount >= 5) {
      this.state = 'open';
    }
  }
  
  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) return false;
    const timeSinceFailure = Date.now() - this.lastFailureTime.getTime();
    return timeSinceFailure > 60000; // 1 minute
  }
}
```

**Retry with Exponential Backoff**

```typescript
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}
```

**Graceful Degradation**

```typescript
async function executeAgentsWithGracefulDegradation(
  agents: ReasoningAgent[],
  input: ReasoningAgentInput
): Promise<AgentOutputContract[]> {
  const results = await Promise.allSettled(
    agents.map(agent => agent.analyze(input))
  );
  
  const successfulOutputs = results
    .filter((result): result is PromiseFulfilledResult<AgentOutputContract> => 
      result.status === 'fulfilled'
    )
    .map(result => result.value);
  
  const failures = results.filter(result => result.status === 'rejected');
  
  // Log failures but continue with successful outputs
  failures.forEach((failure, index) => {
    console.error(`Agent ${agents[index].agentType} failed:`, failure.reason);
  });
  
  if (successfulOutputs.length === 0) {
    throw new Error('All agents failed');
  }
  
  return successfulOutputs;
}
```


## Testing Strategy

### Dual Testing Approach

The AI Question Routing System requires both unit tests and property-based tests for comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, error conditions, and integration points
- **Property tests**: Verify universal properties across all inputs through randomization

Both approaches are complementary and necessary. Unit tests catch concrete bugs and validate specific scenarios, while property tests verify general correctness across a wide input space.

### Unit Testing Strategy

**Focus Areas for Unit Tests:**

1. **Specific Examples**
   - Test that financial_health_check intent maps to correct agents
   - Test that suggested questions are organized into expected categories
   - Test that AgentOutputContract has all required fields
   - Test specific error messages for validation failures

2. **Edge Cases**
   - Empty user context (minimal data)
   - Question at exactly 10 characters (boundary)
   - Question at exactly 500 characters (boundary)
   - All agents failing simultaneously
   - Single agent succeeding when others fail

3. **Integration Points**
   - Database connection and query execution
   - OpenAI API request/response handling
   - Supabase authentication integration
   - Cache read/write operations

4. **Error Conditions**
   - Network timeout simulation
   - Invalid JSON response from LLM
   - Database constraint violations
   - Rate limit exceeded scenarios

**Unit Test Examples:**

```typescript
describe('IntentClassifier', () => {
  it('should classify health insurance question correctly', async () => {
    const classifier = new IntentClassifier();
    const result = await classifier.classify(
      'Is my health insurance coverage adequate?',
      mockUserContext
    );
    
    expect(result.intent).toBe('health_insurance_analysis');
    expect(result.confidence).toBeGreaterThan(0.7);
  });
  
  it('should return default intent for ambiguous question', async () => {
    const classifier = new IntentClassifier();
    const result = await classifier.classify(
      'What should I do?',
      mockUserContext
    );
    
    expect(result.intent).toBe('general_financial_advice');
  });
});

describe('AgentSelector', () => {
  it('should select correct agents for loan_decision intent', () => {
    const selector = new AgentSelector(defaultConfig);
    const agents = selector.selectAgents('loan_decision');
    
    expect(agents).toContain('opportunity_cost');
    expect(agents).toContain('margin_of_safety');
    expect(agents).toContain('devils_advocate');
    expect(agents.length).toBeGreaterThanOrEqual(2);
    expect(agents.length).toBeLessThanOrEqual(5);
  });
});

describe('QuestionRouter', () => {
  it('should reject question shorter than 10 characters', async () => {
    const router = new QuestionRouter(defaultConfig);
    
    await expect(
      router.submitQuestion({
        questionText: 'Too short',
        userId: 'user-123',
        source: 'custom'
      })
    ).rejects.toThrow('Question must be between 10 and 500 characters');
  });
  
  it('should handle all agents failing gracefully', async () => {
    const router = new QuestionRouter(defaultConfig);
    mockAllAgentsToFail();
    
    await expect(
      router.submitQuestion({
        questionText: 'Should I prepay my home loan?',
        userId: 'user-123',
        source: 'custom'
      })
    ).rejects.toThrow('Unable to process question');
  });
});
```


### Property-Based Testing Strategy

**Property-Based Testing Library**: Use `fast-check` for TypeScript/JavaScript

**Configuration**: Each property test should run minimum 100 iterations to ensure comprehensive input coverage through randomization.

**Test Tagging**: Each property test must include a comment tag referencing the design document property:

```typescript
// Feature: ai-question-routing-system, Property 2: Input Validation with Error Feedback
```

**Property Test Examples:**

```typescript
import fc from 'fast-check';

describe('Property Tests: Question Router', () => {
  // Feature: ai-question-routing-system, Property 2: Input Validation with Error Feedback
  it('should reject any question outside 10-500 character range', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.string({ minLength: 0, maxLength: 9 }),
          fc.string({ minLength: 501, maxLength: 1000 })
        ),
        async (invalidQuestion) => {
          const router = new QuestionRouter(defaultConfig);
          
          await expect(
            router.submitQuestion({
              questionText: invalidQuestion,
              userId: 'user-123',
              source: 'custom'
            })
          ).rejects.toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });
  
  // Feature: ai-question-routing-system, Property 4: Intent Classification Output Validity
  it('should always return a valid intent category', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 500 }),
        fc.record({
          monthlyIncome: fc.integer({ min: 0, max: 10000000 }),
          hasInsurance: fc.boolean(),
          hasLoans: fc.boolean(),
          familySize: fc.integer({ min: 1, max: 10 })
        }),
        async (question, userContext) => {
          const classifier = new IntentClassifier();
          const result = await classifier.classify(question, userContext);
          
          const validIntents = [
            'financial_health_check',
            'health_insurance_analysis',
            'term_insurance_decision',
            'loan_decision',
            'investment_analysis',
            'budget_optimization',
            'emergency_fund_planning',
            'retirement_planning',
            'nri_return_planning',
            'document_analysis',
            'general_financial_advice'
          ];
          
          expect(validIntents).toContain(result.intent);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  // Feature: ai-question-routing-system, Property 8: Agent Selection Count Bounds
  it('should always select between 2 and 5 agents', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          'financial_health_check',
          'health_insurance_analysis',
          'loan_decision',
          'investment_analysis',
          'budget_optimization',
          'emergency_fund_planning',
          'retirement_planning',
          'nri_return_planning'
        ),
        (intent) => {
          const selector = new AgentSelector(defaultConfig);
          const agents = selector.selectAgents(intent);
          
          expect(agents.length).toBeGreaterThanOrEqual(2);
          expect(agents.length).toBeLessThanOrEqual(5);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  // Feature: ai-question-routing-system, Property 12: Agent Output Schema Conformance
  it('should always return output matching AgentOutputContract', () => {
    fc.assert(
      fc.property(
        fc.record({
          question: fc.string({ minLength: 10, maxLength: 500 }),
          intent: fc.constantFrom('loan_decision', 'investment_analysis'),
          userContext: fc.record({
            monthlyIncome: fc.integer({ min: 10000, max: 1000000 }),
            totalLoanAmount: fc.integer({ min: 0, max: 10000000 })
          })
        }),
        async (input) => {
          const agent = new FirstPrinciplesAgent();
          const output = await agent.analyze(input);
          
          expect(output).toHaveProperty('agentName');
          expect(output).toHaveProperty('frameworkApplied');
          expect(output).toHaveProperty('keyInsights');
          expect(output).toHaveProperty('recommendations');
          expect(output).toHaveProperty('risksIdentified');
          expect(output).toHaveProperty('confidenceScore');
          expect(output).toHaveProperty('reasoningSteps');
          
          expect(Array.isArray(output.keyInsights)).toBe(true);
          expect(Array.isArray(output.recommendations)).toBe(true);
          expect(Array.isArray(output.risksIdentified)).toBe(true);
          expect(Array.isArray(output.reasoningSteps)).toBe(true);
          
          expect(output.confidenceScore).toBeGreaterThanOrEqual(0);
          expect(output.confidenceScore).toBeLessThanOrEqual(100);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  // Feature: ai-question-routing-system, Property 17: Follow-Up Question Count
  it('should always generate between 3 and 5 follow-up questions', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 500 }),
        fc.record({
          summary: fc.string(),
          keyInsights: fc.array(fc.record({ insight: fc.string() })),
          recommendations: fc.array(fc.record({ action: fc.string() }))
        }),
        async (question, answer) => {
          const generator = new FollowUpGenerator();
          const followUps = await generator.generate(
            question,
            answer,
            mockUserContext
          );
          
          expect(followUps.length).toBeGreaterThanOrEqual(3);
          expect(followUps.length).toBeLessThanOrEqual(5);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  // Feature: ai-question-routing-system, Property 18: Follow-Up Question Uniqueness
  it('should never generate duplicate follow-up questions', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 500 }),
        fc.record({
          summary: fc.string(),
          keyInsights: fc.array(fc.record({ insight: fc.string() }))
        }),
        async (question, answer) => {
          const generator = new FollowUpGenerator();
          const followUps = await generator.generate(
            question,
            answer,
            mockUserContext
          );
          
          const questionTexts = followUps.map(f => f.questionText);
          const uniqueTexts = new Set(questionTexts);
          
          expect(uniqueTexts.size).toBe(questionTexts.length);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  // Feature: ai-question-routing-system, Property 28: Mandatory Disclaimer Inclusion
  it('should always include disclaimer in final answer', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            agentName: fc.string(),
            keyInsights: fc.array(fc.string()),
            recommendations: fc.array(fc.string()),
            confidenceScore: fc.integer({ min: 0, max: 100 })
          }),
          { minLength: 1, maxLength: 5 }
        ),
        async (agentOutputs) => {
          const synthesizer = new SynthesisEngine();
          const answer = await synthesizer.synthesize({
            question: 'Should I invest in mutual funds?',
            intent: 'investment_analysis',
            userContext: mockUserContext,
            agentOutputs
          });
          
          expect(answer.disclaimer).toBeDefined();
          expect(answer.disclaimer.toLowerCase()).toContain('informational');
          expect(answer.disclaimer.toLowerCase()).toContain('not professional');
        }
      ),
      { numRuns: 100 }
    );
  });
  
  // Feature: ai-question-routing-system, Property 40: User Tier Rate Limiting
  it('should enforce rate limits based on user tier', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('free', 'premium'),
        fc.integer({ min: 1, max: 150 }),
        async (userTier, questionCount) => {
          const router = new QuestionRouter(defaultConfig);
          const limit = userTier === 'free' ? 10 : 100;
          
          let successCount = 0;
          let rateLimitedCount = 0;
          
          for (let i = 0; i < questionCount; i++) {
            try {
              await router.submitQuestion({
                questionText: `Question ${i}`,
                userId: `user-${userTier}`,
                source: 'custom'
              });
              successCount++;
            } catch (error: any) {
              if (error.message.includes('rate limit')) {
                rateLimitedCount++;
              }
            }
          }
          
          expect(successCount).toBeLessThanOrEqual(limit);
          if (questionCount > limit) {
            expect(rateLimitedCount).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
```


### Integration Testing

**API Endpoint Tests:**

```typescript
describe('API: /api/question-router/ask', () => {
  it('should process a valid question end-to-end', async () => {
    const response = await fetch('/api/question-router/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionText: 'Should I prepay my home loan or invest in SIP?',
        userId: 'test-user-123'
      })
    });
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('sessionId');
    expect(data).toHaveProperty('answer');
    expect(data).toHaveProperty('followUpQuestions');
    expect(data.answer).toHaveProperty('summary');
    expect(data.answer).toHaveProperty('keyInsights');
    expect(data.answer).toHaveProperty('recommendations');
  });
  
  it('should return 400 for invalid question length', async () => {
    const response = await fetch('/api/question-router/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionText: 'Short',
        userId: 'test-user-123'
      })
    });
    
    expect(response.status).toBe(400);
  });
  
  it('should return 429 when rate limit exceeded', async () => {
    const userId = 'rate-limit-test-user';
    
    // Submit 11 questions for free user
    for (let i = 0; i < 11; i++) {
      const response = await fetch('/api/question-router/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: `Question number ${i} about my finances`,
          userId
        })
      });
      
      if (i < 10) {
        expect(response.status).toBe(200);
      } else {
        expect(response.status).toBe(429);
      }
    }
  });
});
```

### Performance Testing

**Load Testing Strategy:**

```typescript
describe('Performance Tests', () => {
  it('should handle 100 concurrent requests', async () => {
    const requests = Array.from({ length: 100 }, (_, i) =>
      fetch('/api/question-router/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: `Performance test question ${i}`,
          userId: `perf-user-${i}`
        })
      })
    );
    
    const startTime = Date.now();
    const responses = await Promise.all(requests);
    const endTime = Date.now();
    
    const successCount = responses.filter(r => r.status === 200).length;
    expect(successCount).toBeGreaterThan(90); // 90% success rate
    
    const avgTime = (endTime - startTime) / 100;
    expect(avgTime).toBeLessThan(20000); // Average under 20 seconds
  });
  
  it('should meet 95th percentile response time SLA', async () => {
    const responseTimes: number[] = [];
    
    for (let i = 0; i < 100; i++) {
      const startTime = Date.now();
      await fetch('/api/question-router/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: `SLA test question ${i}`,
          userId: `sla-user-${i}`
        })
      });
      const endTime = Date.now();
      responseTimes.push(endTime - startTime);
    }
    
    responseTimes.sort((a, b) => a - b);
    const p95Index = Math.floor(responseTimes.length * 0.95);
    const p95Time = responseTimes[p95Index];
    
    expect(p95Time).toBeLessThan(15000); // 15 seconds for 95th percentile
  });
});
```

### Test Coverage Goals

- **Unit Test Coverage**: Minimum 80% code coverage
- **Property Test Coverage**: All 46 correctness properties implemented
- **Integration Test Coverage**: All API endpoints and database operations
- **E2E Test Coverage**: Critical user flows (suggested question, custom question, follow-up)

### Continuous Testing

- Run unit tests on every commit
- Run property tests on every pull request
- Run integration tests on staging deployment
- Run performance tests weekly
- Monitor production metrics against test baselines


## API Specifications

### POST /api/question-router/ask

Submit a question for processing.

**Request:**

```typescript
{
  questionText: string;      // 10-500 characters
  userId: string;            // Authenticated user ID
  source: 'suggested' | 'custom';
  suggestedQuestionId?: string;  // If source is 'suggested'
  sessionId?: string;        // For follow-up questions
}
```

**Response (200 OK):**

```typescript
{
  sessionId: string;
  answer: {
    summary: string;
    keyInsights: Array<{
      insight: string;
      sourceAgents: string[];
      importance: 'high' | 'medium' | 'low';
    }>;
    recommendations: Array<{
      action: string;
      priority: 'high' | 'medium' | 'low';
      effort: 'low' | 'medium' | 'high';
      impact: 'low' | 'medium' | 'high';
      sourceAgents: string[];
    }>;
    risksAndConsiderations: Array<{
      risk: string;
      severity: 'high' | 'medium' | 'low';
      mitigation: string;
      sourceAgents: string[];
    }>;
    nextSteps: string[];
    disclaimer: string;
    uncertaintyFlags: string[];
  };
  followUpQuestions: Array<{
    id: string;
    questionText: string;
    category: string;
    relevanceScore: number;
  }>;
  agentAttribution: Array<{
    agentName: string;
    agentType: string;
    executionTime: number;
    confidenceScore: number;
  }>;
  confidence: number;
  processingTime: number;
  cached: boolean;
}
```

**Error Responses:**

```typescript
// 400 Bad Request
{
  error: 'INVALID_INPUT',
  message: 'Question must be between 10 and 500 characters',
  field: 'questionText'
}

// 429 Too Many Requests
{
  error: 'RATE_LIMIT_EXCEEDED',
  message: 'You have reached your daily question limit of 10',
  limit: 10,
  resetAt: '2024-01-15T00:00:00Z',
  upgradeUrl: '/pricing'
}

// 500 Internal Server Error
{
  error: 'PROCESSING_FAILED',
  message: 'Unable to process your question. Please try again.',
  retryable: true
}

// 503 Service Unavailable
{
  error: 'SERVICE_UNAVAILABLE',
  message: 'AI service is temporarily unavailable. Please try again in a few minutes.',
  retryAfter: 60
}
```


### GET /api/question-router/suggestions

Get personalized suggested questions for the user.

**Request:**

```typescript
// Query parameters
?userId=string
&refresh=boolean  // Force refresh, bypass cache
```

**Response (200 OK):**

```typescript
{
  suggestions: Array<{
    id: string;
    category: string;
    questionText: string;
    intentCategory: string;
    displayOrder: number;
    personalizationScore: number;
  }>;
  personalized: boolean;
  cachedAt?: string;
}
```

### GET /api/question-router/history

Get user's question history.

**Request:**

```typescript
// Query parameters
?userId=string
&limit=number     // Default: 20, Max: 100
&offset=number    // Default: 0
&intent=string    // Optional filter by intent category
```

**Response (200 OK):**

```typescript
{
  sessions: Array<{
    id: string;
    questionText: string;
    intentCategory: string;
    source: 'suggested' | 'custom';
    createdAt: string;
    summary: string;
    confidence: number;
  }>;
  total: number;
  hasMore: boolean;
}
```

### GET /api/question-router/session/:sessionId

Get full details of a specific question session.

**Response (200 OK):**

```typescript
{
  session: {
    id: string;
    questionText: string;
    intentCategory: string;
    createdAt: string;
    completedAt: string;
  };
  answer: FinalAnswer;
  followUpQuestions: FollowUpQuestion[];
  agentRuns: Array<{
    agentName: string;
    agentType: string;
    status: string;
    executionTime: number;
    output: AgentOutputContract;
  }>;
  userFeedback?: {
    rating: number;
    text: string;
  };
}
```

### POST /api/question-router/feedback

Submit feedback on an answer.

**Request:**

```typescript
{
  sessionId: string;
  rating: number;      // 1-5
  feedbackText?: string;
}
```

**Response (200 OK):**

```typescript
{
  success: true;
  message: 'Thank you for your feedback'
}
```

### GET /api/question-router/analytics

Get analytics dashboard data (admin only).

**Request:**

```typescript
// Query parameters
?startDate=string  // ISO date
&endDate=string    // ISO date
```

**Response (200 OK):**

```typescript
{
  overview: {
    totalQuestions: number;
    avgResponseTime: number;
    avgConfidence: number;
    cacheHitRate: number;
  };
  intentDistribution: Array<{
    intent: string;
    count: number;
    percentage: number;
  }>;
  agentPerformance: Array<{
    agentType: string;
    totalRuns: number;
    successRate: number;
    avgExecutionTime: number;
    avgConfidence: number;
  }>;
  popularQuestions: Array<{
    questionText: string;
    count: number;
    avgRating: number;
  }>;
  followUpEngagement: {
    totalFollowUps: number;
    clickRate: number;
  };
}
```


## Implementation Notes

### Technology Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript 5
- Tailwind CSS
- shadcn/ui components
- React Query for server state
- Zustand for client state

**Backend:**
- Next.js API Routes
- Supabase (PostgreSQL)
- OpenAI GPT-4 API
- Redis for caching (optional)

**Testing:**
- Vitest for unit tests
- fast-check for property-based tests
- Playwright for E2E tests

### File Structure

```
src/
├── app/
│   ├── api/
│   │   └── question-router/
│   │       ├── ask/
│   │       │   └── route.ts
│   │       ├── suggestions/
│   │       │   └── route.ts
│   │       ├── history/
│   │       │   └── route.ts
│   │       ├── session/
│   │       │   └── [sessionId]/
│   │       │       └── route.ts
│   │       ├── feedback/
│   │       │   └── route.ts
│   │       └── analytics/
│   │           └── route.ts
│   └── (dashboard)/
│       └── ai-copilot/
│           └── page.tsx
├── components/
│   └── question-router/
│       ├── QuestionInterface.tsx
│       ├── SuggestedQuestions.tsx
│       ├── CustomQuestionInput.tsx
│       ├── AnswerDisplay.tsx
│       ├── FollowUpQuestions.tsx
│       ├── LoadingStates.tsx
│       └── QuestionHistory.tsx
├── lib/
│   └── question-router/
│       ├── QuestionRouter.ts
│       ├── IntentClassifier.ts
│       ├── AgentSelector.ts
│       ├── agents/
│       │   ├── BaseReasoningAgent.ts
│       │   ├── FirstPrinciplesAgent.ts
│       │   ├── DevilsAdvocateAgent.ts
│       │   ├── OpportunityCostAgent.ts
│       │   ├── OccamsRazorAgent.ts
│       │   ├── MarginOfSafetyAgent.ts
│       │   ├── ParetoPrincipleAgent.ts
│       │   ├── SWOTAgent.ts
│       │   ├── PreMortemAgent.ts
│       │   ├── SystemsThinkingAgent.ts
│       │   ├── FlywheelAgent.ts
│       │   ├── ProductMarketFitAgent.ts
│       │   └── JobsToBeDoneAgent.ts
│       ├── SynthesisEngine.ts
│       ├── FollowUpGenerator.ts
│       ├── SuggestionPersonalizer.ts
│       ├── UserContextBuilder.ts
│       ├── RateLimiter.ts
│       ├── QuestionCache.ts
│       └── Analytics.ts
├── types/
│   └── question-router.ts
└── __tests__/
    └── question-router/
        ├── unit/
        │   ├── IntentClassifier.test.ts
        │   ├── AgentSelector.test.ts
        │   ├── SynthesisEngine.test.ts
        │   └── agents/
        │       └── FirstPrinciplesAgent.test.ts
        ├── property/
        │   ├── QuestionRouter.property.test.ts
        │   ├── AgentOutput.property.test.ts
        │   └── RateLimiting.property.test.ts
        └── integration/
            └── api.integration.test.ts
```


### Integration with Existing FamLedgerAI Systems

**1. User Context Integration**

The Question Router integrates with existing user data:

```typescript
async function buildUserContext(userId: string): Promise<UserContext> {
  const supabase = createClient();
  
  // Fetch from existing tables
  const [insurance, loans, investments, income, expenses, family, profile] = 
    await Promise.all([
      supabase.from('insurance_policies').select('*').eq('user_id', userId),
      supabase.from('loans').select('*').eq('user_id', userId),
      supabase.from('investments').select('*').eq('user_id', userId),
      supabase.from('income').select('*').eq('user_id', userId),
      supabase.from('expenses').select('*').eq('user_id', userId),
      supabase.from('family_members').select('*').eq('user_id', userId),
      supabase.from('profiles').select('*').eq('id', userId).single()
    ]);
  
  return {
    userId,
    hasInsurance: insurance.data.length > 0,
    insurancePolicies: insurance.data.map(p => ({
      type: p.policy_type,
      sumInsured: p.sum_insured
    })),
    hasLoans: loans.data.length > 0,
    totalLoanAmount: loans.data.reduce((sum, l) => sum + l.outstanding_amount, 0),
    monthlyEMI: loans.data.reduce((sum, l) => sum + l.emi_amount, 0),
    hasInvestments: investments.data.length > 0,
    totalInvestments: investments.data.reduce((sum, i) => sum + i.current_value, 0),
    monthlyIncome: income.data.reduce((sum, i) => sum + i.amount, 0),
    monthlyExpenses: expenses.data.reduce((sum, e) => sum + e.amount, 0),
    familySize: family.data.length + 1,
    age: calculateAge(profile.data.date_of_birth),
    isNRI: profile.data.user_type === 'nri',
    hasEmergencyFund: profile.data.emergency_fund > 0
  };
}
```

**2. Navigation Integration**

Add to sidebar navigation:

```typescript
// src/components/layout/Sidebar.tsx
{
  name: 'AI Copilot',
  href: '/ai-copilot',
  icon: SparklesIcon,
  badge: 'New'
}
```

**3. Analytics Integration**

Integrate with existing analytics system:

```typescript
// Track events in existing analytics
import { trackEvent } from '@/lib/analytics';

trackEvent('question_submitted', {
  intent: intentCategory,
  source: 'suggested' | 'custom',
  userId
});
```

**4. Credit System Integration**

For future monetization:

```typescript
// Check credits before processing
const hasCredits = await checkUserCredits(userId, 'question_routing');
if (!hasCredits) {
  return { error: 'INSUFFICIENT_CREDITS' };
}

// Deduct credits after successful processing
await deductCredits(userId, 'question_routing', 1);
```

### Environment Variables

```bash
# .env.local

# OpenAI Configuration
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=2000
OPENAI_TEMPERATURE=0.7

# Rate Limiting
RATE_LIMIT_FREE_TIER=10
RATE_LIMIT_PREMIUM_TIER=100
RATE_LIMIT_WINDOW_HOURS=24

# Timeouts (milliseconds)
INTENT_CLASSIFICATION_TIMEOUT=2000
AGENT_EXECUTION_TIMEOUT=10000
SYNTHESIS_TIMEOUT=5000
OVERALL_TIMEOUT=30000

# Caching
ENABLE_QUESTION_CACHE=true
CACHE_TTL_SECONDS=3600
SUGGESTION_CACHE_TTL_SECONDS=300

# Feature Flags
ENABLE_DOCUMENT_ANALYSIS=false
ENABLE_MULTI_LANGUAGE=false

# Monitoring
ENABLE_ANALYTICS=true
LOG_LEVEL=info
```

### Deployment Considerations

**1. Database Migrations**

Run migrations in order:
```bash
supabase migration up 001_create_question_routing_tables.sql
```

**2. Seed Data**

Populate suggested questions:
```bash
npm run seed:suggested-questions
```

**3. Monitoring**

Set up alerts for:
- Average response time > 20 seconds
- Error rate > 5%
- OpenAI API failures
- Database connection issues
- Rate limit violations

**4. Scaling**

- Use Vercel Edge Functions for API routes
- Enable Redis caching for production
- Configure database connection pooling
- Set up CDN for static assets

### Security Considerations

**1. Input Sanitization**

```typescript
function sanitizeQuestion(question: string): string {
  // Remove potential injection attempts
  return question
    .replace(/<script>/gi, '')
    .replace(/javascript:/gi, '')
    .trim();
}
```

**2. Rate Limiting**

Implement at multiple levels:
- Per user (10/day free, 100/day premium)
- Per IP (100/hour)
- Per API key (1000/hour)

**3. Data Privacy**

- Never log full user context in production
- Anonymize data in analytics
- Comply with GDPR/data retention policies
- Encrypt sensitive data at rest

**4. API Key Protection**

- Store OpenAI key in environment variables
- Rotate keys regularly
- Monitor usage for anomalies
- Set spending limits


## Future Enhancements

### Phase 2: Document Analysis Integration

**Architecture Prepared:**
- AgentOutputContract includes `documentReferences` field
- Intent classifier supports `document_analysis` category
- Database schema ready for document metadata

**Implementation:**
```typescript
interface DocumentContext {
  documentId: string;
  documentType: 'policy' | 'statement' | 'report';
  extractedText: string;
  metadata: {
    pageCount: number;
    uploadDate: string;
    fileName: string;
  };
}

// Agents can reference specific document sections
{
  documentReferences: [
    {
      documentId: 'doc-123',
      pageNumber: 3,
      excerpt: 'Sum Insured: ₹5,00,000'
    }
  ]
}
```

### Phase 3: Multi-Language Support

**Architecture Prepared:**
- Suggested questions table includes language field
- Intent classifier can detect input language
- Synthesis engine can generate answers in detected language

**Supported Languages (Future):**
- English (Phase 1)
- Hindi (Phase 3)
- Tamil (Phase 3)
- Telugu (Phase 3)
- Bengali (Phase 3)

### Phase 4: Voice Input/Output

- Integrate speech-to-text for question input
- Text-to-speech for answer narration
- Optimize for mobile voice interactions

### Phase 5: Collaborative Sessions

- Share question sessions with family members
- Collaborative follow-up discussions
- Family financial planning sessions

### Phase 6: Advanced Personalization

- Learn from user feedback to improve suggestions
- Predict questions before user asks
- Proactive financial insights based on patterns

## Conclusion

The AI Question Routing System design provides a comprehensive, scalable, and production-ready architecture for intelligent financial question answering. The system leverages multiple reasoning frameworks to provide diverse perspectives, synthesizes outputs into actionable recommendations, and maintains safety through appropriate disclaimers and uncertainty flagging.

Key design strengths:
- **Modular architecture** enables easy addition of new reasoning agents
- **Parallel execution** minimizes latency
- **Graceful degradation** ensures reliability even when components fail
- **Comprehensive testing strategy** with both unit and property-based tests
- **Future-ready architecture** supports document analysis and multi-language
- **Production-grade error handling** and monitoring

The design is ready for implementation and deployment to production.

