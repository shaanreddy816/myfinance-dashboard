# Design Document: Business Monetization Features

## Overview

This design specifies the technical implementation for 5 business-critical features that transform FamLedgerAI into a revenue-generating platform. The features are:

1. **Daily Financial Briefing System** - Personalized daily insights to drive user retention
2. **Financial Health Quick Check Tool** - Public lead generation tool requiring no authentication
3. **Insurance Clause Checker Tool** - Public AI-powered tool to demonstrate value
4. **Pricing Page and Credit System** - Monetization infrastructure with fair usage metering
5. **Legal Disclaimer System** - Regulatory compliance components

All features integrate with the existing FamLedgerAI architecture without breaking changes. The design prioritizes:
- Zero authentication friction for public tools
- Atomic credit consumption to prevent race conditions
- 2-hour caching for daily briefings to reduce AI costs
- Reuse of existing automation insights and financial calculation logic
- Clear upgrade paths from free to paid plans

## Architecture

### System Context

FamLedgerAI is a Next.js 14 application using:
- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API routes, Supabase PostgreSQL, Row Level Security (RLS)
- **AI**: Anthropic Claude 3.5 Sonnet via API
- **Authentication**: Supabase Auth with email/password
- **Existing Systems**: Automation engine, AI agent orchestrator, insurance analysis, financial calculators

### Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Public Routes (No Auth)                   │
│  /health-check  │  /clause-checker  │  /pricing             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Next.js Middleware Layer                    │
│         (Auth bypass for public routes)                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Protected Dashboard Routes                 │
│  /overview (Daily Briefing)  │  /insurance  │  /education   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Routes Layer                        │
│  /api/briefing  │  /api/insurance-education/explain         │
│  /api/analyze-insurance-policy  │  /api/ped-advisor         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Credit System Layer                       │
│  checkAICredits()  │  consumeAICredit()                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Business Logic Layer                       │
│  Briefing Engine  │  Health Calculator  │  AI Agents        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase PostgreSQL                       │
│  user_profiles  │  daily_briefings  │  RLS Policies         │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow Patterns

**Pattern 1: Daily Briefing Generation (Authenticated)**
```
User → /overview → DailyBriefing Component → /api/briefing
  → Check cache (< 2hrs?) → Return cached OR
  → Fetch user data → Automation engine insights → Generate briefing
  → Cache in daily_briefings → Return to UI
```

**Pattern 2: Public Tool Usage (No Auth)**
```
Anonymous User → /health-check → Client-side calculation → Display results
  → CTA to /register
```

**Pattern 3: AI Feature with Credit Gating**
```
User → AI Feature → API Route → checkAICredits()
  → If allowed: Process → consumeAICredit() → Return result
  → If denied: Return 402 with upgrade message
```


## Components and Interfaces

### 1. Daily Financial Briefing System

#### Database Schema

**Table: daily_briefings**
```sql
CREATE TABLE daily_briefings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weekly_score INTEGER NOT NULL CHECK (weekly_score >= 0 AND weekly_score <= 100),
  previous_score INTEGER CHECK (previous_score >= 0 AND previous_score <= 100),
  score_change INTEGER,
  insights JSONB NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_daily_briefings_user_date ON daily_briefings(user_id, date DESC);
CREATE INDEX idx_daily_briefings_generated_at ON daily_briefings(generated_at);

-- RLS Policies
ALTER TABLE daily_briefings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own briefings"
  ON daily_briefings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage briefings"
  ON daily_briefings FOR ALL
  USING (auth.role() = 'service_role');
```

**Insights JSONB Structure**
```typescript
interface Insight {
  type: 'warning' | 'reminder' | 'opportunity' | 'win' | 'info';
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
}

interface BriefingData {
  insights: Insight[];
  weeklyScore: number;
  previousScore: number | null;
  scoreChange: number | null;
  generatedAt: string;
}
```

#### API Specification

**Endpoint: GET /api/briefing**

Request:
```typescript
// No body - uses authenticated user from session
```

Response (200 OK):
```typescript
{
  success: true,
  data: {
    greeting: "Good morning",
    weeklyScore: 78,
    previousScore: 72,
    scoreChange: 6,
    insights: [
      {
        type: "warning",
        title: "High EMI Ratio",
        message: "Your EMI payments are 45% of income. Recommended: below 40%",
        actionUrl: "/loans",
        actionLabel: "Review Loans"
      },
      // ... 4-5 more insights
    ],
    generatedAt: "2025-01-15T08:30:00Z",
    cached: true
  }
}
```

Response (401 Unauthorized):
```typescript
{
  success: false,
  error: "Authentication required"
}
```

Response (500 Error):
```typescript
{
  success: false,
  error: "Failed to generate briefing",
  details: string
}
```


#### React Component Architecture

**Component: DailyBriefing**
- Location: `src/components/overview/DailyBriefing.tsx`
- Props: None (fetches own data)
- State: `briefing`, `loading`, `error`, `collapsed`

```typescript
interface DailyBriefingProps {}

export function DailyBriefing() {
  const [briefing, setBriefing] = useState<BriefingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  
  useEffect(() => {
    fetchBriefing(); // Fire-and-forget, errors don't block page
  }, []);
  
  // Render greeting based on time
  // Display score with trend arrow
  // Map insights to colored cards with icons
  // Collapsible UI
}
```

**Insight Type Styling**
```typescript
const insightStyles = {
  warning: { color: 'red', icon: '⚠️', bgColor: 'bg-red-50' },
  reminder: { color: 'yellow', icon: '🔔', bgColor: 'bg-yellow-50' },
  opportunity: { color: 'teal', icon: '💡', bgColor: 'bg-teal-50' },
  win: { color: 'green', icon: '🎉', bgColor: 'bg-green-50' },
  info: { color: 'gray', icon: 'ℹ️', bgColor: 'bg-gray-50' }
};
```

#### Briefing Engine Logic

**File: `src/lib/briefing/engine.ts`**

```typescript
export async function generateDailyBriefing(userId: string): Promise<BriefingData> {
  // 1. Check cache
  const cached = await getCachedBriefing(userId);
  if (cached && isFresh(cached, 2 * 60 * 60 * 1000)) { // 2 hours
    return cached;
  }
  
  // 2. Fetch user financial data
  const context = await fetchFinancialContext(userId);
  
  // 3. Generate insights (reuse automation rules)
  const insights = await generateInsights(context);
  
  // 4. Calculate weekly score
  const weeklyScore = calculateWeeklyScore(context);
  const previousScore = await getScoreFromWeekAgo(userId);
  
  // 5. Cache and return
  const briefing = {
    insights,
    weeklyScore,
    previousScore,
    scoreChange: previousScore ? weeklyScore - previousScore : null,
    generatedAt: new Date().toISOString()
  };
  
  await cacheBriefing(userId, briefing);
  return briefing;
}
```

**Insight Generation Rules**
```typescript
async function generateInsights(context: FinancialContext): Promise<Insight[]> {
  const insights: Insight[] = [];
  
  // Rule 1: EMI payments due within 7 days
  const upcomingEMIs = context.loans.filter(loan => 
    isWithinDays(loan.nextDueDate, 7)
  );
  if (upcomingEMIs.length > 0) {
    insights.push({
      type: 'reminder',
      title: 'EMI Due Soon',
      message: `${upcomingEMIs.length} EMI payment(s) due in next 7 days`,
      actionUrl: '/loans',
      actionLabel: 'View Loans'
    });
  }
  
  // Rule 2: Insurance renewals within 30 days
  const expiringPolicies = context.insurance.filter(policy =>
    isWithinDays(policy.endDate, 30)
  );
  if (expiringPolicies.length > 0) {
    insights.push({
      type: 'reminder',
      title: 'Insurance Renewal Due',
      message: `${expiringPolicies.length} polic${expiringPolicies.length > 1 ? 'ies' : 'y'} expiring soon`,
      actionUrl: '/insurance',
      actionLabel: 'Review Policies'
    });
  }
  
  // Rule 3: Low savings rate
  const savingsRate = calculateSavingsRate(context);
  if (savingsRate < 0.20) {
    insights.push({
      type: 'warning',
      title: 'Low Savings Rate',
      message: `You're saving ${(savingsRate * 100).toFixed(0)}% of income. Target: 20%+`,
      actionUrl: '/overview',
      actionLabel: 'Improve Savings'
    });
  }
  
  // Rule 4: Insufficient emergency fund
  const emergencyFund = calculateEmergencyFund(context);
  const monthsCovered = emergencyFund / context.monthlyExpenses;
  if (monthsCovered < 6) {
    insights.push({
      type: 'warning',
      title: 'Build Emergency Fund',
      message: `Current fund covers ${monthsCovered.toFixed(1)} months. Target: 6 months`,
      actionUrl: '/overview',
      actionLabel: 'View Details'
    });
  }
  
  // Rule 5: SIP opportunity
  if (context.investments.sips.length === 0 && savingsRate > 0.15) {
    insights.push({
      type: 'opportunity',
      title: 'Start SIP Investment',
      message: 'You have good savings. Consider starting a monthly SIP',
      actionUrl: '/investments',
      actionLabel: 'Explore SIPs'
    });
  }
  
  // Rule 6: Insurance coverage gap
  const recommendedCover = context.annualIncome * 10;
  const actualCover = context.insurance
    .filter(p => p.type.includes('term'))
    .reduce((sum, p) => sum + p.sumInsured, 0);
  if (actualCover < recommendedCover) {
    insights.push({
      type: 'opportunity',
      title: 'Increase Life Cover',
      message: `Recommended: ₹${formatAmount(recommendedCover)}. Current: ₹${formatAmount(actualCover)}`,
      actionUrl: '/insurance',
      actionLabel: 'Review Coverage'
    });
  }
  
  // Limit to 5-6 insights, prioritize by severity
  return insights
    .sort((a, b) => getSeverityScore(a.type) - getSeverityScore(b.type))
    .slice(0, 6);
}
```


**Weekly Score Calculation**
```typescript
function calculateWeeklyScore(context: FinancialContext): number {
  let score = 0;
  
  // Pillar 1: Savings Rate (25 points)
  const savingsRate = calculateSavingsRate(context);
  if (savingsRate >= 0.20) score += 25;
  else if (savingsRate >= 0.10) score += 15;
  else score += 5;
  
  // Pillar 2: EMI Ratio (20 points)
  const emiRatio = context.totalEMI / context.monthlyIncome;
  if (emiRatio < 0.20) score += 20;
  else if (emiRatio < 0.40) score += 12;
  else score += 4;
  
  // Pillar 3: Emergency Fund (20 points)
  const emergencyFund = calculateEmergencyFund(context);
  const monthsCovered = emergencyFund / context.monthlyExpenses;
  if (monthsCovered >= 6) score += 20;
  else if (monthsCovered >= 3) score += 12;
  else score += 4;
  
  // Pillar 4: Investments (15 points)
  if (context.investments.total > 0) score += 15;
  
  // Pillar 5: Insurance (15 points)
  const hasHealth = context.insurance.some(p => p.type.includes('health'));
  const hasTerm = context.insurance.some(p => p.type.includes('term'));
  if (hasHealth) score += 10;
  if (hasTerm) score += 5;
  
  // Pillar 6: Income (5 points)
  if (context.monthlyIncome > 0) score += 5;
  
  return Math.min(score, 100);
}
```

### 2. Financial Health Quick Check Tool

#### Page Route
- Path: `/health-check`
- File: `src/app/(public)/health-check/page.tsx`
- Authentication: None required
- Middleware: Bypass auth check

#### Component Architecture

**Main Component: HealthCheckWizard**
```typescript
interface HealthCheckState {
  step: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  totalLoans: number;
  totalInvestments: number;
  familySize: number;
  hasHealthInsurance: boolean;
  hasTermInsurance: boolean;
}

export default function HealthCheckPage() {
  const [state, setState] = useState<HealthCheckState>({
    step: 1,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    totalLoans: 0,
    totalInvestments: 0,
    familySize: 1,
    hasHealthInsurance: false,
    hasTermInsurance: false
  });
  
  const [result, setResult] = useState<HealthCheckResult | null>(null);
  
  // Step navigation
  // Input validation
  // Client-side calculation
  // Results display
}
```

**Wizard Steps**
1. Monthly Income (number input)
2. Monthly Expenses (number input)
3. Total Loans (number input)
4. Total Investments (number input)
5. Family Size (number input)
6. Insurance Coverage (checkboxes)

**Progress Bar Component**
```typescript
function ProgressBar({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  const progress = (currentStep / totalSteps) * 100;
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className="bg-teal-600 h-2 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
```


#### Health Score Calculation Logic

**File: `src/lib/calculators/healthCheck.ts`**

```typescript
export interface HealthCheckInput {
  monthlyIncome: number;
  monthlyExpenses: number;
  totalLoans: number;
  totalInvestments: number;
  familySize: number;
  hasHealthInsurance: boolean;
  hasTermInsurance: boolean;
}

export interface HealthCheckResult {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D';
  breakdown: {
    savingsRate: { score: number; max: 25 };
    emiRatio: { score: number; max: 20 };
    emergencyFund: { score: number; max: 20 };
    investments: { score: number; max: 15 };
    insurance: { score: number; max: 15 };
    income: { score: number; max: 5 };
  };
  risks: string[];
  opportunities: string[];
  message: string;
}

export function calculateHealthScore(input: HealthCheckInput): HealthCheckResult {
  const breakdown = {
    savingsRate: calculateSavingsRatePillar(input),
    emiRatio: calculateEMIRatioPillar(input),
    emergencyFund: calculateEmergencyFundPillar(input),
    investments: calculateInvestmentsPillar(input),
    insurance: calculateInsurancePillar(input),
    income: calculateIncomePillar(input)
  };
  
  const score = Object.values(breakdown).reduce((sum, pillar) => sum + pillar.score, 0);
  const grade = getGrade(score);
  const risks = identifyRisks(input, breakdown);
  const opportunities = identifyOpportunities(input, breakdown);
  const message = generateMessage(score, grade);
  
  return { score, grade, breakdown, risks, opportunities, message };
}

function calculateSavingsRatePillar(input: HealthCheckInput) {
  const savingsRate = (input.monthlyIncome - input.monthlyExpenses) / input.monthlyIncome;
  
  if (savingsRate >= 0.20) return { score: 25, max: 25 };
  if (savingsRate >= 0.10) return { score: 15, max: 25 };
  return { score: 5, max: 25 };
}

function calculateEMIRatioPillar(input: HealthCheckInput) {
  // Assume 20-year loan, estimate EMI
  const estimatedEMI = input.totalLoans > 0 
    ? (input.totalLoans * 0.01) // Rough EMI estimate
    : 0;
  const emiRatio = estimatedEMI / input.monthlyIncome;
  
  if (emiRatio < 0.20) return { score: 20, max: 20 };
  if (emiRatio < 0.40) return { score: 12, max: 20 };
  return { score: 4, max: 20 };
}

function calculateEmergencyFundPillar(input: HealthCheckInput) {
  // Estimate emergency fund from investments (simplified)
  const liquidAssets = input.totalInvestments * 0.3; // Assume 30% is liquid
  const monthsCovered = liquidAssets / input.monthlyExpenses;
  
  if (monthsCovered >= 6) return { score: 20, max: 20 };
  if (monthsCovered >= 3) return { score: 12, max: 20 };
  return { score: 4, max: 20 };
}

function calculateInvestmentsPillar(input: HealthCheckInput) {
  return input.totalInvestments > 0 
    ? { score: 15, max: 15 }
    : { score: 0, max: 15 };
}

function calculateInsurancePillar(input: HealthCheckInput) {
  let score = 0;
  if (input.hasHealthInsurance) score += 10;
  if (input.hasTermInsurance) score += 5;
  return { score, max: 15 };
}

function calculateIncomePillar(input: HealthCheckInput) {
  return input.monthlyIncome > 0 
    ? { score: 5, max: 5 }
    : { score: 0, max: 5 };
}

function getGrade(score: number): 'A' | 'B' | 'C' | 'D' {
  if (score >= 80) return 'A';
  if (score >= 65) return 'B';
  if (score >= 50) return 'C';
  return 'D';
}

function identifyRisks(input: HealthCheckInput, breakdown: any): string[] {
  const risks: string[] = [];
  
  if (breakdown.savingsRate.score < 15) {
    risks.push('Low savings rate - you may struggle with unexpected expenses');
  }
  
  if (breakdown.emiRatio.score < 12) {
    risks.push('High loan burden - EMI payments consuming too much income');
  }
  
  if (breakdown.emergencyFund.score < 12) {
    risks.push('Insufficient emergency fund - aim for 6 months of expenses');
  }
  
  if (!input.hasHealthInsurance) {
    risks.push('No health insurance - medical emergencies could devastate finances');
  }
  
  if (!input.hasTermInsurance && input.familySize > 1) {
    risks.push('No term insurance - family has no financial protection');
  }
  
  return risks;
}

function identifyOpportunities(input: HealthCheckInput, breakdown: any): string[] {
  const opportunities: string[] = [];
  
  if (breakdown.investments.score === 0) {
    opportunities.push('Start investing - even ₹1000/month can build wealth over time');
  }
  
  if (breakdown.savingsRate.score >= 15 && breakdown.investments.score === 0) {
    opportunities.push('You have good savings - consider starting a SIP');
  }
  
  if (input.totalLoans > input.monthlyIncome * 12) {
    opportunities.push('Consider debt consolidation to reduce EMI burden');
  }
  
  return opportunities;
}

function generateMessage(score: number, grade: string): string {
  if (score >= 80) {
    return 'Excellent! Your finances are in great shape. Keep up the good work.';
  }
  if (score >= 65) {
    return 'Good progress! A few improvements will get you to excellent health.';
  }
  if (score >= 50) {
    return 'Fair. There are several areas that need attention to improve your financial security.';
  }
  return 'Needs improvement. Focus on building emergency fund and reducing debt.';
}
```


#### Results Display Component

```typescript
function HealthCheckResults({ result }: { result: HealthCheckResult }) {
  const scoreColor = result.score >= 80 ? 'text-teal-600' 
    : result.score >= 65 ? 'text-white' 
    : 'text-orange-500';
  
  return (
    <div className="space-y-6">
      {/* Score Display */}
      <div className="text-center">
        <div className={`text-6xl font-bold ${scoreColor}`}>
          {result.score}
        </div>
        <div className="text-2xl text-gray-600">
          Grade: <span className="font-semibold">{result.grade}</span>
        </div>
        <p className="mt-4 text-gray-700">{result.message}</p>
      </div>
      
      {/* Risks */}
      {result.risks.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 mb-2">⚠️ Risks Identified</h3>
          <ul className="space-y-1">
            {result.risks.map((risk, i) => (
              <li key={i} className="text-red-700 text-sm">• {risk}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Opportunities */}
      {result.opportunities.length > 0 && (
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
          <h3 className="font-semibold text-teal-800 mb-2">💡 Opportunities</h3>
          <ul className="space-y-1">
            {result.opportunities.map((opp, i) => (
              <li key={i} className="text-teal-700 text-sm">• {opp}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* CTA */}
      <div className="text-center">
        <Link 
          href="/register"
          className="inline-block bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-700 transition"
        >
          Get Full Analysis — Free →
        </Link>
        <p className="mt-2 text-sm text-gray-600">
          Track all your finances in one place. No credit card required.
        </p>
      </div>
    </div>
  );
}
```

### 3. Insurance Clause Checker Tool

#### Page Route
- Path: `/clause-checker`
- File: `src/app/(public)/clause-checker/page.tsx`
- Authentication: None required

#### Component Architecture

```typescript
export default function ClauseCheckerPage() {
  const [clauseText, setClauseText] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const exampleClauses = [
    'Pre-existing diseases are covered after 48 months of continuous coverage',
    'Waiting period of 30 days for all illnesses except accidents',
    'Co-payment of 20% applicable for all claims for policyholders above 60 years',
    'Room rent capping at 1% of sum insured per day',
    'Maternity expenses covered up to ₹50,000 after 9 months waiting period'
  ];
  
  async function handleExplain() {
    if (!clauseText.trim()) {
      setError('Please enter a clause to explain');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/insurance-education/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: clauseText })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setExplanation(data.answer);
      } else {
        setError(data.error || 'Failed to explain clause');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Insurance Clause Checker</h1>
      <p className="text-gray-600 mb-6">
        Confused by insurance jargon? Paste any clause and get a simple explanation.
      </p>
      
      {/* Example Clauses */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Try these examples:</p>
        <div className="flex flex-wrap gap-2">
          {exampleClauses.map((example, i) => (
            <button
              key={i}
              onClick={() => setClauseText(example)}
              className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition"
            >
              Example {i + 1}
            </button>
          ))}
        </div>
      </div>
      
      {/* Input */}
      <textarea
        value={clauseText}
        onChange={(e) => setClauseText(e.target.value)}
        placeholder="Paste your insurance clause here..."
        className="w-full h-32 p-4 border rounded-lg mb-4"
      />
      
      <button
        onClick={handleExplain}
        disabled={loading}
        className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 disabled:bg-gray-400 transition"
      >
        {loading ? 'Analyzing...' : 'Explain This Clause →'}
      </button>
      
      {/* Error */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}
      
      {/* Explanation */}
      {explanation && (
        <div className="mt-6 bg-teal-50 border-2 border-teal-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🤖</span>
            <h3 className="font-semibold text-teal-900">AI EXPLANATION</h3>
          </div>
          <p className="text-gray-800 whitespace-pre-wrap">{explanation}</p>
        </div>
      )}
      
      {/* CTA */}
      {explanation && (
        <div className="mt-6 text-center bg-gray-50 p-6 rounded-lg">
          <p className="text-gray-700 mb-3">
            Want full policy analysis with coverage gaps and recommendations?
          </p>
          <Link
            href="/register"
            className="inline-block bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-700 transition"
          >
            Sign up free →
          </Link>
        </div>
      )}
    </div>
  );
}
```


#### API Endpoint Modification

**File: `src/app/api/insurance-education/explain/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();
    
    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Question is required' },
        { status: 400 }
      );
    }
    
    // No authentication check - public endpoint
    
    const prompt = `Explain this insurance clause in simple language for an Indian consumer: ${question}

Tell me:
1. What it means in plain English
2. A real example with numbers
3. Whether it's good or bad for me

Keep it under 150 words. Be direct and practical.`;
    
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });
    
    const answer = message.content[0].type === 'text' 
      ? message.content[0].text 
      : 'Unable to generate explanation';
    
    return NextResponse.json({
      success: true,
      answer,
    });
  } catch (error: any) {
    console.error('Clause explanation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to explain clause' },
      { status: 500 }
    );
  }
}
```

### 4. Pricing Page and Credit System

#### Database Schema Extensions

**Migration: Add columns to user_profiles**
```sql
-- File: supabase/migrations/20250115_user_profiles_monetization.sql

ALTER TABLE user_profiles 
  ADD COLUMN IF NOT EXISTS age INTEGER,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS profession TEXT,
  ADD COLUMN IF NOT EXISTS annual_income_range TEXT,
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free' 
    CHECK (plan IN ('free', 'pro', 'family')),
  ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ai_credits_used INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ai_credits_limit INTEGER NOT NULL DEFAULT 10;

-- Index for credit checks
CREATE INDEX IF NOT EXISTS idx_user_profiles_plan ON user_profiles(plan);
CREATE INDEX IF NOT EXISTS idx_user_profiles_credits ON user_profiles(ai_credits_used, ai_credits_limit);

-- Atomic credit increment function
CREATE OR REPLACE FUNCTION increment_ai_credits(user_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE user_profiles
  SET ai_credits_used = ai_credits_used + 1
  WHERE auth_uid = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION increment_ai_credits(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_ai_credits(UUID) TO service_role;

COMMENT ON FUNCTION increment_ai_credits IS 'Atomically increments AI credit usage for a user';
```


#### Credit System Implementation

**File: `src/lib/credits/creditSystem.ts`**

```typescript
import { createClient } from '@/lib/supabase/server';

export interface CreditCheckResult {
  allowed: boolean;
  plan: 'free' | 'pro' | 'family';
  creditsUsed: number;
  creditsLimit: number;
  message: string;
}

/**
 * Check if user has available AI credits
 * @param userId - User's auth.uid
 * @returns Credit check result with allowance status
 */
export async function checkAICredits(userId: string): Promise<CreditCheckResult> {
  const supabase = createClient();
  
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('plan, ai_credits_used, ai_credits_limit, plan_expires_at')
    .eq('auth_uid', userId)
    .single();
  
  if (error || !profile) {
    return {
      allowed: false,
      plan: 'free',
      creditsUsed: 0,
      creditsLimit: 0,
      message: 'User profile not found'
    };
  }
  
  // Check if paid plan is active
  if (profile.plan === 'pro' || profile.plan === 'family') {
    // Check expiration
    if (profile.plan_expires_at) {
      const expiresAt = new Date(profile.plan_expires_at);
      if (expiresAt < new Date()) {
        // Plan expired, treat as free
        return {
          allowed: profile.ai_credits_used < profile.ai_credits_limit,
          plan: 'free',
          creditsUsed: profile.ai_credits_used,
          creditsLimit: profile.ai_credits_limit,
          message: profile.ai_credits_used < profile.ai_credits_limit
            ? 'Using free plan credits'
            : 'Your plan expired. Upgrade to continue using AI features.'
        };
      }
    }
    
    // Active paid plan - unlimited credits
    return {
      allowed: true,
      plan: profile.plan,
      creditsUsed: profile.ai_credits_used,
      creditsLimit: -1, // Unlimited
      message: 'Unlimited AI credits'
    };
  }
  
  // Free plan - check credit limit
  const hasCredits = profile.ai_credits_used < profile.ai_credits_limit;
  
  return {
    allowed: hasCredits,
    plan: 'free',
    creditsUsed: profile.ai_credits_used,
    creditsLimit: profile.ai_credits_limit,
    message: hasCredits
      ? `${profile.ai_credits_limit - profile.ai_credits_used} AI credits remaining`
      : 'You've used all your free AI credits. Upgrade to Pro for unlimited access.'
  };
}

/**
 * Consume one AI credit (atomic operation)
 * @param userId - User's auth.uid
 */
export async function consumeAICredit(userId: string): Promise<void> {
  const supabase = createClient();
  
  // Use atomic database function to prevent race conditions
  const { error } = await supabase.rpc('increment_ai_credits', {
    user_id_param: userId
  });
  
  if (error) {
    console.error('Failed to consume AI credit:', error);
    throw new Error('Failed to update credit usage');
  }
}

/**
 * Get user's current credit status
 */
export async function getCreditStatus(userId: string) {
  const supabase = createClient();
  
  const { data } = await supabase
    .from('user_profiles')
    .select('plan, ai_credits_used, ai_credits_limit')
    .eq('auth_uid', userId)
    .single();
  
  return data;
}
```

#### Pricing Page Component

**File: `src/app/(public)/pricing/page.tsx`**

```typescript
export default function PricingPage() {
  const plans = [
    {
      name: 'Free',
      price: '₹0',
      period: 'forever',
      features: [
        { text: '3 AI runs per month', included: true },
        { text: 'Basic financial tracking', included: true },
        { text: 'Manual data entry', included: true },
        { text: 'Unlimited AI features', included: false },
        { text: 'Priority support', included: false },
        { text: 'Family accounts', included: false }
      ],
      cta: 'Get Started',
      ctaLink: '/register',
      popular: false
    },
    {
      name: 'Pro',
      price: '₹299',
      period: 'per month',
      features: [
        { text: 'Unlimited AI runs', included: true },
        { text: 'All financial features', included: true },
        { text: 'Insurance analysis', included: true },
        { text: 'Investment recommendations', included: true },
        { text: 'Priority support', included: true },
        { text: 'Family accounts', included: false }
      ],
      cta: 'Start 14-Day Free Trial',
      ctaLink: '/register?plan=pro',
      popular: true,
      badge: 'Most Popular'
    },
    {
      name: 'Family',
      price: '₹499',
      period: 'per month',
      features: [
        { text: 'Everything in Pro', included: true },
        { text: 'Up to 6 family members', included: true },
        { text: 'Joint financial planning', included: true },
        { text: 'Shared goals tracking', included: true },
        { text: 'CA consultation (1/year)', included: true },
        { text: 'Priority support', included: true }
      ],
      cta: 'Start 14-Day Free Trial',
      ctaLink: '/register?plan=family',
      popular: false
    }
  ];
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-xl text-gray-600">
          Choose the plan that fits your family's needs
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative border-2 rounded-xl p-8 ${
              plan.popular 
                ? 'border-teal-600 shadow-xl scale-105' 
                : 'border-gray-200'
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-teal-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                {plan.badge}
              </div>
            )}
            
            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold">{plan.price}</span>
              <span className="text-gray-600">/{plan.period}</span>
            </div>
            
            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className={feature.included ? 'text-teal-600' : 'text-gray-400'}>
                    {feature.included ? '✓' : '✗'}
                  </span>
                  <span className={feature.included ? 'text-gray-800' : 'text-gray-400'}>
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>
            
            <Link
              href={plan.ctaLink}
              className={`block w-full text-center py-3 rounded-lg font-semibold transition ${
                plan.popular
                  ? 'bg-teal-600 text-white hover:bg-teal-700'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>
      
      <div className="text-center space-y-4">
        <p className="text-gray-600">
          🔒 Bank-grade security · 🚫 No insurance commissions · ✨ Cancel anytime
        </p>
        <p className="text-sm text-gray-500">
          FamLedgerAI is not a SEBI-registered advisor or IRDAI-licensed broker.
          All features are for educational and organizational purposes.
        </p>
      </div>
    </div>
  );
}
```


#### API Route Integration

**Modify: `src/app/api/analyze-insurance-policy/route.ts`**

```typescript
import { checkAICredits, consumeAICredit } from '@/lib/credits/creditSystem';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check AI credits
    const creditCheck = await checkAICredits(user.id);
    
    if (!creditCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI credits exhausted',
          message: creditCheck.message,
          plan: creditCheck.plan,
          creditsUsed: creditCheck.creditsUsed,
          creditsLimit: creditCheck.creditsLimit,
          upgradeUrl: '/pricing'
        },
        { status: 402 } // Payment Required
      );
    }
    
    // Process the request (existing logic)
    const { policyText } = await request.json();
    
    // ... existing analysis logic ...
    
    // Consume credit after successful processing
    await consumeAICredit(user.id);
    
    return NextResponse.json({
      success: true,
      data: analysisResult,
      creditsRemaining: creditCheck.plan === 'free' 
        ? creditCheck.creditsLimit - creditCheck.creditsUsed - 1
        : -1 // Unlimited
    });
    
  } catch (error: any) {
    console.error('Policy analysis error:', error);
    return NextResponse.json(
      { success: false, error: 'Analysis failed' },
      { status: 500 }
    );
  }
}
```

**Modify: `src/app/api/ped-advisor/route.ts`**

```typescript
import { checkAICredits, consumeAICredit } from '@/lib/credits/creditSystem';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check AI credits
    const creditCheck = await checkAICredits(user.id);
    
    if (!creditCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI credits exhausted',
          message: creditCheck.message,
          upgradeUrl: '/pricing'
        },
        { status: 402 }
      );
    }
    
    // Process PED advisor request
    const { condition, age } = await request.json();
    
    // ... existing PED logic ...
    
    // Consume credit
    await consumeAICredit(user.id);
    
    return NextResponse.json({
      success: true,
      data: pedAdvice
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'PED advisor failed' },
      { status: 500 }
    );
  }
}
```

### 5. Legal Disclaimer System

#### Reusable Component

**File: `src/components/legal/LegalDisclaimer.tsx`**

```typescript
interface LegalDisclaimerProps {
  type: 'general' | 'insurance' | 'investment';
  className?: string;
}

const disclaimerText = {
  general: 
    'FamLedgerAI provides financial tools for educational and organizational purposes only. We are not SEBI-registered advisors or IRDAI-licensed brokers. Nothing on this platform constitutes financial, investment, or insurance advice.',
  
  insurance:
    'Insurance analysis shown is for educational purposes only. FamLedgerAI is not an insurance broker, agent, or intermediary. We do not sell policies or earn commissions. Always verify details with your insurer and consult a licensed advisor.',
  
  investment:
    'Investment insights are for educational purposes only. Past performance does not guarantee future returns. FamLedgerAI is not a SEBI-registered investment advisor. Consult a qualified financial advisor before investing.'
};

export function LegalDisclaimer({ type, className = '' }: LegalDisclaimerProps) {
  return (
    <div 
      className={`flex items-start gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50 ${className}`}
      role="note"
      aria-label="Legal disclaimer"
    >
      <span className="text-2xl flex-shrink-0" aria-hidden="true">⚖️</span>
      <p className="text-xs text-gray-600 leading-relaxed opacity-80">
        {disclaimerText[type]}
      </p>
    </div>
  );
}
```

#### Integration Points

**Modify: `src/app/(dashboard)/overview/page.tsx`**
```typescript
import { LegalDisclaimer } from '@/components/legal/LegalDisclaimer';

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      <DailyBriefing />
      {/* ... other overview components ... */}
      
      {/* Add at bottom */}
      <LegalDisclaimer type="general" className="mt-8" />
    </div>
  );
}
```

**Modify: `src/app/(dashboard)/insurance/page.tsx`**
```typescript
import { LegalDisclaimer } from '@/components/legal/LegalDisclaimer';

export default function InsurancePage() {
  return (
    <div className="space-y-6">
      {/* ... insurance components ... */}
      
      {/* Add at bottom */}
      <LegalDisclaimer type="insurance" className="mt-8" />
    </div>
  );
}
```

**Modify: `src/app/(dashboard)/education/page.tsx`**
```typescript
import { LegalDisclaimer } from '@/components/legal/LegalDisclaimer';

export default function EducationPage() {
  return (
    <div className="space-y-6">
      {/* Add at top */}
      <LegalDisclaimer type="insurance" />
      
      {/* ... education components ... */}
    </div>
  );
}
```

**Modify: `src/app/(dashboard)/investments/page.tsx`**
```typescript
import { LegalDisclaimer } from '@/components/legal/LegalDisclaimer';

export default function InvestmentsPage() {
  return (
    <div className="space-y-6">
      {/* ... investment components ... */}
      
      {/* Add at bottom */}
      <LegalDisclaimer type="investment" className="mt-8" />
    </div>
  );
}
```


## Data Models

### TypeScript Interfaces

```typescript
// User Profile with Monetization Fields
export interface UserProfile {
  id: string;
  auth_uid: string;
  household_id: string;
  email: string;
  display_name: string | null;
  phone: string | null;
  
  // New monetization fields
  age: number | null;
  city: string | null;
  profession: string | null;
  annual_income_range: string | null;
  plan: 'free' | 'pro' | 'family';
  plan_expires_at: string | null;
  trial_started_at: string | null;
  ai_credits_used: number;
  ai_credits_limit: number;
  
  created_at: string;
}

// Daily Briefing
export interface DailyBriefing {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  weekly_score: number; // 0-100
  previous_score: number | null;
  score_change: number | null;
  insights: Insight[];
  generated_at: string;
  created_at: string;
}

export interface Insight {
  type: 'warning' | 'reminder' | 'opportunity' | 'win' | 'info';
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
}

// Health Check
export interface HealthCheckInput {
  monthlyIncome: number;
  monthlyExpenses: number;
  totalLoans: number;
  totalInvestments: number;
  familySize: number;
  hasHealthInsurance: boolean;
  hasTermInsurance: boolean;
}

export interface HealthCheckResult {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D';
  breakdown: {
    savingsRate: { score: number; max: 25 };
    emiRatio: { score: number; max: 20 };
    emergencyFund: { score: number; max: 20 };
    investments: { score: number; max: 15 };
    insurance: { score: number; max: 15 };
    income: { score: number; max: 5 };
  };
  risks: string[];
  opportunities: string[];
  message: string;
}

// Credit System
export interface CreditCheckResult {
  allowed: boolean;
  plan: 'free' | 'pro' | 'family';
  creditsUsed: number;
  creditsLimit: number; // -1 for unlimited
  message: string;
}

// Pricing Plans
export interface PricingPlan {
  id: 'free' | 'pro' | 'family';
  name: string;
  price: number; // in rupees
  period: 'forever' | 'month';
  features: PlanFeature[];
  aiCredits: number; // -1 for unlimited
  trialDays: number;
}

export interface PlanFeature {
  text: string;
  included: boolean;
}
```


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property Reflection

After analyzing all acceptance criteria, I identified the following redundancies:
- Properties about score ranges (weekly score, health score) can be combined into a single invariant property
- Multiple credit checking properties can be consolidated into comprehensive credit gating property
- Briefing insight type validation is subsumed by the JSONB round-trip property

The following properties represent the minimal set needed for comprehensive validation:

### Property 1: Briefing Insight Count

For any authenticated user with valid financial data, generating a daily briefing should produce between 5 and 6 insights (inclusive).

**Validates: Requirements 1.1**

### Property 2: Briefing Insight Type Validity

For any generated daily briefing, every insight must have a type field that is exactly one of: 'warning', 'reminder', 'opportunity', 'win', or 'info'.

**Validates: Requirements 1.2**

### Property 3: Briefing Cache Idempotence

For any user and date, if a cached briefing exists and was generated less than 2 hours ago, requesting the briefing multiple times should return the identical cached data without regeneration.

**Validates: Requirements 1.12**

### Property 4: Briefing Serialization Round-Trip

For any valid briefing data structure, serializing to JSONB, storing in the database, retrieving, and deserializing should produce an equivalent data structure with all insights preserved.

**Validates: Requirements 1.15**

### Property 5: Daily Briefing Uniqueness

For any user and date combination, the daily_briefings table should contain at most one record. Attempting to insert a duplicate should fail.

**Validates: Requirements 1.14**

### Property 6: Health Score Bounds Invariant

For any valid health check input (non-negative numbers, valid boolean flags), the calculated Financial_Health_Score must be an integer between 0 and 100 (inclusive), and the Weekly_Score must also be between 0 and 100 (inclusive).

**Validates: Requirements 2.27, 1.9**

### Property 7: Health Score Determinism

For any health check input, calculating the score multiple times with the same input should produce the identical score, grade, and breakdown values.

**Validates: Requirements 2.27**

### Property 8: Grade Assignment Correctness

For any Financial_Health_Score:
- Score >= 80 should assign grade 'A'
- Score in [65, 79] should assign grade 'B'
- Score in [50, 64] should assign grade 'C'
- Score < 50 should assign grade 'D'

**Validates: Requirements 2.28, 2.29, 2.30, 2.31**

### Property 9: Clause Explanation Prompt Format

For any insurance clause text input, the API should construct a prompt that includes the clause text and requests: plain English explanation, real example with numbers, and good/bad assessment, all under 150 words.

**Validates: Requirements 3.11**

### Property 10: Credit Check Structure

For any user ID, calling checkAICredits should return an object containing: allowed (boolean), plan (string), creditsUsed (number), creditsLimit (number), and message (string).

**Validates: Requirements 4.24, 4.25**

### Property 11: Credit Allowance Rules

For any user:
- If plan is 'pro' or 'family' and not expired, allowed should be true
- If plan is 'free' and ai_credits_used < ai_credits_limit, allowed should be true
- If plan is 'free' and ai_credits_used >= ai_credits_limit, allowed should be false

**Validates: Requirements 4.26, 4.27, 4.28**

### Property 12: Atomic Credit Consumption

For any user, if N concurrent calls to consumeAICredit are made, the final ai_credits_used value should be exactly initial_value + N (no race conditions, no lost updates).

**Validates: Requirements 4.31, 4.32, 6.11**

### Property 13: AI Feature Credit Gating

For any AI-powered API endpoint (/api/analyze-insurance-policy, /api/ped-advisor), if a user's credit check returns allowed=false, the API should return HTTP status 402 with an upgrade message, and should NOT process the request or consume credits.

**Validates: Requirements 4.33, 4.34, 4.35, 4.36, 4.37**

### Property 14: Legal Disclaimer Text Mapping

For any disclaimer type ('general', 'insurance', 'investment'), the LegalDisclaimer component should render the exact corresponding disclaimer text as specified in the requirements.

**Validates: Requirements 5.2, 5.3, 5.4**

### Property 15: Public Route Authentication Bypass

For any request to /health-check, /clause-checker, or /pricing routes, the middleware should allow access without requiring authentication, while protected routes should still require authentication.

**Validates: Requirements 2.2, 3.2, 4.11, 6.12**


## Error Handling

### Error Handling Patterns

#### 1. Daily Briefing Generation Errors

**Pattern: Fire-and-Forget with Graceful Degradation**

```typescript
// In DailyBriefing component
async function fetchBriefing() {
  try {
    setLoading(true);
    const response = await fetch('/api/briefing');
    
    if (!response.ok) {
      throw new Error('Failed to fetch briefing');
    }
    
    const data = await response.json();
    setBriefing(data.data);
  } catch (error) {
    console.error('Briefing fetch failed:', error);
    // Don't block dashboard - just hide the briefing component
    setError('Unable to load daily briefing. Please refresh to try again.');
  } finally {
    setLoading(false);
  }
}
```

**Behavior:**
- Briefing generation failure does NOT block dashboard loading
- Error is logged but user sees rest of dashboard
- User can manually refresh to retry
- No error modal or blocking UI

#### 2. Health Check Validation Errors

**Pattern: Client-Side Validation with User Feedback**

```typescript
function validateStep(state: HealthCheckState): string | null {
  if (state.step === 1 && state.monthlyIncome < 0) {
    return 'Monthly income must be a positive number';
  }
  
  if (state.step === 2 && state.monthlyExpenses < 0) {
    return 'Monthly expenses must be a positive number';
  }
  
  if (state.step === 2 && state.monthlyExpenses > state.monthlyIncome * 2) {
    return 'Expenses seem unusually high. Please verify.';
  }
  
  if (state.step === 5 && (state.familySize < 1 || state.familySize > 20)) {
    return 'Family size must be between 1 and 20';
  }
  
  return null; // Valid
}
```

**Behavior:**
- Validation happens before advancing to next step
- Clear, actionable error messages
- No API calls made with invalid data
- User can correct and retry immediately

#### 3. Clause Checker API Errors

**Pattern: Network Error Handling with Retry Suggestion**

```typescript
async function handleExplain() {
  try {
    setLoading(true);
    setError('');
    
    const response = await fetch('/api/insurance-education/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: clauseText })
    });
    
    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      }
      throw new Error('Failed to explain clause. Please try again.');
    }
    
    const data = await response.json();
    setExplanation(data.answer);
  } catch (error: any) {
    setError(error.message || 'Network error. Please check your connection and try again.');
  } finally {
    setLoading(false);
  }
}
```

**Behavior:**
- Network errors show user-friendly messages
- Rate limiting errors provide specific guidance
- User can retry without page refresh
- Error state is clearable

#### 4. Credit Exhaustion Errors

**Pattern: 402 Payment Required with Upgrade Path**

```typescript
// In AI feature API routes
const creditCheck = await checkAICredits(user.id);

if (!creditCheck.allowed) {
  return NextResponse.json(
    {
      success: false,
      error: 'AI credits exhausted',
      message: creditCheck.message,
      plan: creditCheck.plan,
      creditsUsed: creditCheck.creditsUsed,
      creditsLimit: creditCheck.creditsLimit,
      upgradeUrl: '/pricing',
      upgradeCtaText: 'Upgrade to Pro for unlimited AI features'
    },
    { status: 402 }
  );
}
```

**Client-side handling:**
```typescript
if (response.status === 402) {
  const data = await response.json();
  
  // Show upgrade modal
  showUpgradeModal({
    title: 'AI Credits Exhausted',
    message: data.message,
    ctaText: data.upgradeCtaText,
    ctaLink: data.upgradeUrl
  });
  
  return;
}
```

**Behavior:**
- Clear explanation of why request failed
- Direct path to upgrade (link to pricing page)
- Shows current usage and limits
- Non-blocking modal that user can dismiss

#### 5. Authentication Errors

**Pattern: 401 Unauthorized with Redirect**

```typescript
// In API routes
const { data: { user }, error: authError } = await supabase.auth.getUser();

if (authError || !user) {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Authentication required',
      redirectUrl: '/login'
    },
    { status: 401 }
  );
}
```

**Client-side handling:**
```typescript
if (response.status === 401) {
  // Redirect to login with return URL
  router.push(`/login?returnTo=${encodeURIComponent(window.location.pathname)}`);
  return;
}
```

**Behavior:**
- Automatic redirect to login page
- Preserves intended destination for post-login redirect
- Clear error message before redirect

#### 6. Database Constraint Violations

**Pattern: Unique Constraint Handling**

```typescript
async function cacheBriefing(userId: string, briefing: BriefingData) {
  try {
    const { error } = await supabase
      .from('daily_briefings')
      .insert({
        user_id: userId,
        date: new Date().toISOString().split('T')[0],
        weekly_score: briefing.weeklyScore,
        previous_score: briefing.previousScore,
        score_change: briefing.scoreChange,
        insights: briefing.insights,
        generated_at: briefing.generatedAt
      });
    
    if (error) {
      // Check if it's a unique constraint violation
      if (error.code === '23505') {
        // Duplicate entry - update instead
        await supabase
          .from('daily_briefings')
          .update({
            weekly_score: briefing.weeklyScore,
            previous_score: briefing.previousScore,
            score_change: briefing.scoreChange,
            insights: briefing.insights,
            generated_at: briefing.generatedAt
          })
          .eq('user_id', userId)
          .eq('date', new Date().toISOString().split('T')[0]);
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Failed to cache briefing:', error);
    // Don't throw - caching failure shouldn't break briefing generation
  }
}
```

**Behavior:**
- Unique constraint violations trigger upsert logic
- Caching failures are logged but don't break functionality
- Idempotent operation - safe to retry


### Error Recovery Strategies

| Error Type | Recovery Strategy | User Impact |
|------------|------------------|-------------|
| Briefing generation timeout | Return cached briefing if available, else show placeholder | Low - user sees yesterday's briefing or empty state |
| Health check invalid input | Block progression, show validation message | None - prevents bad data |
| Clause checker API failure | Show error with retry button | Low - user can retry immediately |
| Credit exhaustion | Show upgrade modal with pricing link | Medium - blocks AI feature, clear upgrade path |
| Authentication failure | Redirect to login with return URL | Medium - user must login but returns to intended page |
| Database connection failure | Retry with exponential backoff (3 attempts) | Low to Medium - usually resolves automatically |
| AI API rate limit | Queue request for retry after delay | Low - transparent to user |


## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests for comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, error conditions, and integration points
- **Property tests**: Verify universal properties across all inputs through randomization

Together, these approaches provide comprehensive coverage where unit tests catch concrete bugs and property tests verify general correctness.

### Property-Based Testing Configuration

**Library Selection:**
- **JavaScript/TypeScript**: Use `fast-check` library
- Install: `npm install --save-dev fast-check @types/fast-check`
- Minimum 100 iterations per property test (due to randomization)

**Test Tagging Format:**
Each property test must include a comment referencing the design property:
```typescript
// Feature: business-monetization-features, Property 1: Briefing Insight Count
```

### Property Test Implementations

#### Property 1: Briefing Insight Count

```typescript
import fc from 'fast-check';
import { generateDailyBriefing } from '@/lib/briefing/engine';

// Feature: business-monetization-features, Property 1: Briefing Insight Count
test('Daily briefing always generates 5-6 insights', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.record({
        userId: fc.uuid(),
        monthlyIncome: fc.integer({ min: 10000, max: 500000 }),
        monthlyExpenses: fc.integer({ min: 5000, max: 400000 }),
        loans: fc.array(fc.record({
          emi: fc.integer({ min: 1000, max: 50000 }),
          nextDueDate: fc.date({ min: new Date(), max: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) })
        }), { maxLength: 5 }),
        insurance: fc.array(fc.record({
          type: fc.constantFrom('health', 'term', 'vehicle'),
          endDate: fc.date({ min: new Date(), max: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) })
        }), { maxLength: 5 })
      }),
      async (context) => {
        const briefing = await generateDailyBriefing(context.userId);
        expect(briefing.insights.length).toBeGreaterThanOrEqual(5);
        expect(briefing.insights.length).toBeLessThanOrEqual(6);
      }
    ),
    { numRuns: 100 }
  );
});
```

#### Property 2: Briefing Insight Type Validity

```typescript
// Feature: business-monetization-features, Property 2: Briefing Insight Type Validity
test('All briefing insights have valid types', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.uuid(),
      async (userId) => {
        const briefing = await generateDailyBriefing(userId);
        const validTypes = ['warning', 'reminder', 'opportunity', 'win', 'info'];
        
        briefing.insights.forEach(insight => {
          expect(validTypes).toContain(insight.type);
        });
      }
    ),
    { numRuns: 100 }
  );
});
```

#### Property 6: Health Score Bounds Invariant

```typescript
// Feature: business-monetization-features, Property 6: Health Score Bounds Invariant
test('Health score always between 0 and 100', () => {
  fc.assert(
    fc.property(
      fc.record({
        monthlyIncome: fc.integer({ min: 0, max: 1000000 }),
        monthlyExpenses: fc.integer({ min: 0, max: 1000000 }),
        totalLoans: fc.integer({ min: 0, max: 10000000 }),
        totalInvestments: fc.integer({ min: 0, max: 10000000 }),
        familySize: fc.integer({ min: 1, max: 20 }),
        hasHealthInsurance: fc.boolean(),
        hasTermInsurance: fc.boolean()
      }),
      (input) => {
        const result = calculateHealthScore(input);
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(100);
      }
    ),
    { numRuns: 100 }
  );
});
```

#### Property 7: Health Score Determinism

```typescript
// Feature: business-monetization-features, Property 7: Health Score Determinism
test('Health score calculation is deterministic', () => {
  fc.assert(
    fc.property(
      fc.record({
        monthlyIncome: fc.integer({ min: 0, max: 1000000 }),
        monthlyExpenses: fc.integer({ min: 0, max: 1000000 }),
        totalLoans: fc.integer({ min: 0, max: 10000000 }),
        totalInvestments: fc.integer({ min: 0, max: 10000000 }),
        familySize: fc.integer({ min: 1, max: 20 }),
        hasHealthInsurance: fc.boolean(),
        hasTermInsurance: fc.boolean()
      }),
      (input) => {
        const result1 = calculateHealthScore(input);
        const result2 = calculateHealthScore(input);
        
        expect(result1.score).toBe(result2.score);
        expect(result1.grade).toBe(result2.grade);
        expect(result1.breakdown).toEqual(result2.breakdown);
      }
    ),
    { numRuns: 100 }
  );
});
```

#### Property 12: Atomic Credit Consumption

```typescript
// Feature: business-monetization-features, Property 12: Atomic Credit Consumption
test('Concurrent credit consumption is atomic', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.integer({ min: 1, max: 10 }),
      async (concurrentCalls) => {
        // Setup: Create test user with known credit count
        const userId = await createTestUser({ ai_credits_used: 0 });
        
        // Execute: Make N concurrent credit consumption calls
        await Promise.all(
          Array(concurrentCalls).fill(null).map(() => consumeAICredit(userId))
        );
        
        // Verify: Final count should be exactly N
        const profile = await getUserProfile(userId);
        expect(profile.ai_credits_used).toBe(concurrentCalls);
        
        // Cleanup
        await deleteTestUser(userId);
      }
    ),
    { numRuns: 50 } // Fewer runs due to database operations
  );
});
```


### Unit Test Coverage

Unit tests should focus on specific examples, edge cases, and integration points:

#### Daily Briefing System

```typescript
describe('Daily Briefing Engine', () => {
  test('generates briefing with EMI reminder when payment due in 7 days', async () => {
    const context = createMockContext({
      loans: [{ emi: 25000, nextDueDate: addDays(new Date(), 5) }]
    });
    
    const briefing = await generateInsights(context);
    
    expect(briefing.some(i => i.type === 'reminder' && i.title.includes('EMI'))).toBe(true);
  });
  
  test('generates warning when savings rate below 20%', async () => {
    const context = createMockContext({
      monthlyIncome: 100000,
      monthlyExpenses: 85000 // 15% savings rate
    });
    
    const briefing = await generateInsights(context);
    
    expect(briefing.some(i => i.type === 'warning' && i.message.includes('savings'))).toBe(true);
  });
  
  test('returns cached briefing when less than 2 hours old', async () => {
    const userId = 'test-user-123';
    
    // First call - generates new
    const briefing1 = await generateDailyBriefing(userId);
    
    // Second call within 2 hours - returns cached
    const briefing2 = await generateDailyBriefing(userId);
    
    expect(briefing1.generatedAt).toBe(briefing2.generatedAt);
  });
  
  test('regenerates briefing when cache is older than 2 hours', async () => {
    const userId = 'test-user-123';
    
    // Create old cache entry
    await createCachedBriefing(userId, { generatedAt: subHours(new Date(), 3) });
    
    const briefing = await generateDailyBriefing(userId);
    
    expect(isWithinHours(new Date(briefing.generatedAt), 1)).toBe(true);
  });
});
```

#### Health Check Calculator

```typescript
describe('Health Check Calculator', () => {
  test('assigns grade A for score 80+', () => {
    const input = {
      monthlyIncome: 100000,
      monthlyExpenses: 50000,
      totalLoans: 0,
      totalInvestments: 500000,
      familySize: 3,
      hasHealthInsurance: true,
      hasTermInsurance: true
    };
    
    const result = calculateHealthScore(input);
    
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.grade).toBe('A');
  });
  
  test('identifies risk when no health insurance', () => {
    const input = {
      monthlyIncome: 100000,
      monthlyExpenses: 60000,
      totalLoans: 0,
      totalInvestments: 100000,
      familySize: 3,
      hasHealthInsurance: false,
      hasTermInsurance: true
    };
    
    const result = calculateHealthScore(input);
    
    expect(result.risks.some(r => r.includes('health insurance'))).toBe(true);
  });
  
  test('handles edge case of zero income', () => {
    const input = {
      monthlyIncome: 0,
      monthlyExpenses: 0,
      totalLoans: 0,
      totalInvestments: 0,
      familySize: 1,
      hasHealthInsurance: false,
      hasTermInsurance: false
    };
    
    const result = calculateHealthScore(input);
    
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
```

#### Credit System

```typescript
describe('Credit System', () => {
  test('allows AI usage for pro plan users', async () => {
    const userId = await createTestUser({ plan: 'pro', ai_credits_used: 100 });
    
    const result = await checkAICredits(userId);
    
    expect(result.allowed).toBe(true);
    expect(result.plan).toBe('pro');
  });
  
  test('blocks AI usage when free plan credits exhausted', async () => {
    const userId = await createTestUser({ 
      plan: 'free', 
      ai_credits_used: 10, 
      ai_credits_limit: 10 
    });
    
    const result = await checkAICredits(userId);
    
    expect(result.allowed).toBe(false);
    expect(result.message).toContain('Upgrade');
  });
  
  test('allows AI usage when free plan has remaining credits', async () => {
    const userId = await createTestUser({ 
      plan: 'free', 
      ai_credits_used: 5, 
      ai_credits_limit: 10 
    });
    
    const result = await checkAICredits(userId);
    
    expect(result.allowed).toBe(true);
    expect(result.creditsUsed).toBe(5);
    expect(result.creditsLimit).toBe(10);
  });
  
  test('consumeAICredit increments usage counter', async () => {
    const userId = await createTestUser({ ai_credits_used: 3 });
    
    await consumeAICredit(userId);
    
    const profile = await getUserProfile(userId);
    expect(profile.ai_credits_used).toBe(4);
  });
});
```

#### API Route Integration

```typescript
describe('AI Feature API Routes', () => {
  test('returns 401 when user not authenticated', async () => {
    const response = await fetch('/api/analyze-insurance-policy', {
      method: 'POST',
      body: JSON.stringify({ policyText: 'test' })
    });
    
    expect(response.status).toBe(401);
  });
  
  test('returns 402 when credits exhausted', async () => {
    const user = await createAuthenticatedUser({ 
      plan: 'free', 
      ai_credits_used: 10, 
      ai_credits_limit: 10 
    });
    
    const response = await fetch('/api/analyze-insurance-policy', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${user.token}` },
      body: JSON.stringify({ policyText: 'test' })
    });
    
    expect(response.status).toBe(402);
    const data = await response.json();
    expect(data.upgradeUrl).toBe('/pricing');
  });
  
  test('processes request and consumes credit when allowed', async () => {
    const user = await createAuthenticatedUser({ 
      plan: 'free', 
      ai_credits_used: 2, 
      ai_credits_limit: 10 
    });
    
    const response = await fetch('/api/analyze-insurance-policy', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${user.token}` },
      body: JSON.stringify({ policyText: 'test policy' })
    });
    
    expect(response.status).toBe(200);
    
    const profile = await getUserProfile(user.id);
    expect(profile.ai_credits_used).toBe(3);
  });
});
```

### Integration Testing

Test the complete flow of features:

```typescript
describe('End-to-End: User Journey', () => {
  test('Anonymous user completes health check and signs up', async () => {
    // 1. Visit health check page (no auth required)
    const healthCheckPage = await browser.goto('/health-check');
    expect(healthCheckPage.status()).toBe(200);
    
    // 2. Complete wizard
    await fillHealthCheckForm({
      monthlyIncome: 80000,
      monthlyExpenses: 50000,
      totalLoans: 500000,
      totalInvestments: 200000,
      familySize: 3,
      hasHealthInsurance: true,
      hasTermInsurance: false
    });
    
    // 3. See results
    const score = await page.textContent('[data-testid="health-score"]');
    expect(parseInt(score)).toBeGreaterThan(0);
    
    // 4. Click CTA to register
    await page.click('text=Get Full Analysis — Free');
    expect(page.url()).toContain('/register');
  });
  
  test('Free user exhausts credits and upgrades', async () => {
    // 1. Login as free user with 1 credit remaining
    const user = await loginAsUser({ plan: 'free', ai_credits_used: 9, ai_credits_limit: 10 });
    
    // 2. Use last credit
    await page.goto('/insurance');
    await uploadPolicyDocument('test-policy.pdf');
    await page.click('text=Analyze Policy');
    
    // Wait for analysis
    await page.waitForSelector('[data-testid="analysis-result"]');
    
    // 3. Try to use AI feature again
    await uploadPolicyDocument('test-policy-2.pdf');
    await page.click('text=Analyze Policy');
    
    // 4. See upgrade modal
    await page.waitForSelector('[data-testid="upgrade-modal"]');
    expect(await page.textContent('[data-testid="upgrade-modal"]')).toContain('credits exhausted');
    
    // 5. Click upgrade CTA
    await page.click('text=Upgrade to Pro');
    expect(page.url()).toContain('/pricing');
  });
});
```

### Test Coverage Goals

- **Unit Tests**: 80%+ code coverage
- **Property Tests**: All 15 correctness properties implemented
- **Integration Tests**: All critical user journeys covered
- **E2E Tests**: Happy path + error scenarios for each feature


## Implementation Notes

### File Structure

```
famledgerai-v2/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── health-check/
│   │   │   │   └── page.tsx                    # NEW: Health check wizard
│   │   │   ├── clause-checker/
│   │   │   │   └── page.tsx                    # NEW: Clause checker tool
│   │   │   └── pricing/
│   │   │       └── page.tsx                    # NEW: Pricing page
│   │   ├── (dashboard)/
│   │   │   ├── overview/
│   │   │   │   └── page.tsx                    # MODIFY: Add DailyBriefing + disclaimer
│   │   │   ├── insurance/
│   │   │   │   └── page.tsx                    # MODIFY: Add disclaimer
│   │   │   ├── education/
│   │   │   │   └── page.tsx                    # MODIFY: Add disclaimer
│   │   │   └── investments/
│   │   │       └── page.tsx                    # MODIFY: Add disclaimer
│   │   └── api/
│   │       ├── briefing/
│   │       │   └── route.ts                    # NEW: Daily briefing API
│   │       ├── insurance-education/
│   │       │   └── explain/
│   │       │       └── route.ts                # NEW: Public clause explanation
│   │       ├── analyze-insurance-policy/
│   │       │   └── route.ts                    # MODIFY: Add credit gating
│   │       └── ped-advisor/
│   │           └── route.ts                    # MODIFY: Add credit gating
│   ├── components/
│   │   ├── overview/
│   │   │   └── DailyBriefing.tsx              # NEW: Daily briefing component
│   │   ├── legal/
│   │   │   └── LegalDisclaimer.tsx            # NEW: Reusable disclaimer
│   │   └── health-check/
│   │       ├── HealthCheckWizard.tsx          # NEW: Multi-step wizard
│   │       ├── ProgressBar.tsx                # NEW: Progress indicator
│   │       └── HealthCheckResults.tsx         # NEW: Results display
│   ├── lib/
│   │   ├── briefing/
│   │   │   ├── engine.ts                      # NEW: Briefing generation logic
│   │   │   └── insights.ts                    # NEW: Insight generation rules
│   │   ├── credits/
│   │   │   └── creditSystem.ts                # NEW: Credit checking/consumption
│   │   └── calculators/
│   │       └── healthCheck.ts                 # NEW: Health score calculation
│   └── middleware.ts                          # MODIFY: Add public route bypass
├── supabase/
│   └── migrations/
│       ├── 20250115_daily_briefings.sql       # NEW: Briefings table
│       └── 20250115_user_profiles_monetization.sql  # NEW: Profile columns + credit function
└── __tests__/
    ├── briefing.test.ts                       # NEW: Briefing tests
    ├── healthCheck.test.ts                    # NEW: Health check tests
    ├── creditSystem.test.ts                   # NEW: Credit system tests
    └── properties/
        ├── briefing.property.test.ts          # NEW: Property tests
        ├── healthCheck.property.test.ts       # NEW: Property tests
        └── credits.property.test.ts           # NEW: Property tests
```

### Middleware Configuration

**File: `src/middleware.ts`**

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  // Public routes that don't require authentication
  const publicRoutes = [
    '/health-check',
    '/clause-checker',
    '/pricing',
    '/login',
    '/register',
    '/privacy',
    '/terms',
    '/disclaimer'
  ];
  
  const isPublicRoute = publicRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  );
  
  if (isPublicRoute) {
    return res;
  }
  
  // Check authentication for protected routes
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('returnTo', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

### Environment Variables

Add to `.env.local`:

```bash
# Existing variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ANTHROPIC_API_KEY=your_anthropic_key

# New variables (optional)
BRIEFING_CACHE_HOURS=2
FREE_PLAN_AI_CREDITS=10
PRO_PLAN_PRICE=299
FAMILY_PLAN_PRICE=499
```

### Deployment Checklist

1. **Database Migrations**
   - [ ] Run `20250115_daily_briefings.sql` migration
   - [ ] Run `20250115_user_profiles_monetization.sql` migration
   - [ ] Verify RLS policies are active
   - [ ] Test atomic credit function

2. **Environment Setup**
   - [ ] Add environment variables to production
   - [ ] Verify Anthropic API key is valid
   - [ ] Test Supabase connection

3. **Code Deployment**
   - [ ] Build passes with 0 TypeScript errors
   - [ ] All tests pass (unit + property)
   - [ ] Middleware correctly bypasses public routes
   - [ ] Credit gating works on all AI endpoints

4. **Feature Verification**
   - [ ] Daily briefing generates and caches correctly
   - [ ] Health check tool works without authentication
   - [ ] Clause checker calls AI and returns results
   - [ ] Pricing page displays correctly
   - [ ] Legal disclaimers appear on all pages
   - [ ] Credit exhaustion shows upgrade modal
   - [ ] Free trial starts automatically on signup

5. **Performance Testing**
   - [ ] Briefing generation completes in < 5 seconds
   - [ ] Health check calculation is instant (client-side)
   - [ ] Clause explanation returns in < 3 seconds
   - [ ] Credit check adds < 100ms to API calls

### Rollback Plan

If issues arise post-deployment:

1. **Database Rollback**
   ```sql
   -- Rollback user_profiles changes
   ALTER TABLE user_profiles 
     DROP COLUMN IF EXISTS age,
     DROP COLUMN IF EXISTS city,
     DROP COLUMN IF EXISTS profession,
     DROP COLUMN IF EXISTS annual_income_range,
     DROP COLUMN IF EXISTS plan,
     DROP COLUMN IF EXISTS plan_expires_at,
     DROP COLUMN IF EXISTS trial_started_at,
     DROP COLUMN IF EXISTS ai_credits_used,
     DROP COLUMN IF EXISTS ai_credits_limit;
   
   -- Drop briefings table
   DROP TABLE IF EXISTS daily_briefings;
   
   -- Drop credit function
   DROP FUNCTION IF EXISTS increment_ai_credits(UUID);
   ```

2. **Code Rollback**
   - Revert middleware changes to remove public route bypass
   - Remove credit gating from AI API routes
   - Hide new UI components (DailyBriefing, disclaimers)
   - Redirect public routes to login page

3. **Feature Flags** (Recommended)
   ```typescript
   // Add feature flags for gradual rollout
   const FEATURES = {
     dailyBriefing: process.env.FEATURE_DAILY_BRIEFING === 'true',
     healthCheck: process.env.FEATURE_HEALTH_CHECK === 'true',
     clauseChecker: process.env.FEATURE_CLAUSE_CHECKER === 'true',
     creditSystem: process.env.FEATURE_CREDIT_SYSTEM === 'true',
   };
   ```

### Performance Optimizations

1. **Briefing Generation**
   - Cache briefings for 2 hours to reduce AI API calls
   - Use database indexes on (user_id, date) for fast lookups
   - Generate briefings asynchronously (fire-and-forget)

2. **Health Check**
   - All calculations client-side (no API calls)
   - Minimal bundle size (< 50KB)
   - Instant results

3. **Credit Checking**
   - Single database query per check
   - Index on (plan, ai_credits_used, ai_credits_limit)
   - Atomic operations prevent race conditions

4. **Caching Strategy**
   - Daily briefings: 2 hours
   - User profiles: Session duration
   - Credit status: No caching (always fresh)

### Security Considerations

1. **Public Routes**
   - No sensitive data exposed on /health-check, /clause-checker, /pricing
   - Rate limiting on clause checker to prevent API abuse
   - Input validation on all public forms

2. **Credit System**
   - Atomic database operations prevent double-spending
   - Server-side validation (never trust client)
   - RLS policies prevent users from modifying others' credits

3. **AI API**
   - User input sanitized before sending to Claude
   - Response length limited to prevent abuse
   - Timeout after 30 seconds

4. **Authentication**
   - Protected routes require valid session
   - API routes verify user identity
   - Middleware enforces authentication consistently


## Summary

This design document specifies the complete technical implementation for 5 business-critical monetization features:

1. **Daily Financial Briefing System** - Drives daily engagement with personalized insights, 2-hour caching, and integration with existing automation rules

2. **Financial Health Quick Check Tool** - Public lead generation tool with client-side calculation, 6-pillar scoring system, and clear upgrade CTA

3. **Insurance Clause Checker Tool** - Public AI-powered tool demonstrating value, using existing Claude integration with simplified prompts

4. **Pricing Page and Credit System** - Complete monetization infrastructure with atomic credit operations, 3-tier pricing, and fair usage gating on all AI features

5. **Legal Disclaimer System** - Reusable compliance component protecting against regulatory liability across all AI-powered pages

### Key Design Decisions

- **Zero-friction public tools**: Health check and clause checker require no authentication to maximize lead generation
- **Atomic credit operations**: Database function prevents race conditions in concurrent credit consumption
- **2-hour briefing cache**: Reduces AI API costs while maintaining freshness
- **Reuse existing logic**: Automation insights, financial calculators, and AI agents are leveraged rather than rebuilt
- **Graceful degradation**: Briefing failures don't block dashboard, credit exhaustion shows clear upgrade path
- **Property-based testing**: 15 correctness properties ensure comprehensive validation across all inputs

### Integration Points

- Briefing engine reuses automation rules from `src/lib/automation/engine.ts`
- Health check reuses financial calculation logic from existing calculators
- Clause checker extends existing `/api/insurance-education` endpoint
- Credit system gates existing AI features: policy analysis, PED advisor
- Legal disclaimers added to existing pages: overview, insurance, education, investments

### Implementation Readiness

This design provides:
- Complete database schemas with migrations
- Full API specifications with request/response formats
- Detailed React component architecture
- Comprehensive error handling patterns
- Property-based test implementations
- Deployment checklist and rollback plan

All features are implementation-ready with specific file paths, function signatures, and data structures defined.

