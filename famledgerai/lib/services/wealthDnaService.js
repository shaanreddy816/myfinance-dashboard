/**
 * Wealth DNA Profiling + Life-Stage Planning + Motivation Engine
 */

function classifyWealthDna(profile) {
  const { age = 30, income = 0, expenses = 0, total_debt_outstanding = 0,
    total_assets = 0, sip_monthly = 0, risk_tolerance = 'moderate' } = profile;

  const savings_rate = income > 0 ? (income - expenses) / income : 0;
  const debt_ratio = total_assets > 0 ? total_debt_outstanding / total_assets : 0;
  const invest_ratio = income > 0 ? sip_monthly / income : 0;

  let profile_type, description, strategy;

  if (debt_ratio > 0.6) {
    profile_type = 'Debt-Focused Rebuilder';
    description = 'High debt relative to assets. Priority is debt reduction and cash flow stabilization.';
    strategy = 'Focus on clearing high-interest debt first, build emergency fund, then gradually increase investments.';
  } else if (age >= 55) {
    profile_type = 'Pre-Retirement Optimizer';
    description = 'Approaching retirement. Focus shifts to capital preservation and income generation.';
    strategy = 'Shift to conservative allocation, maximize retirement corpus, ensure adequate insurance.';
  } else if (risk_tolerance === 'low' || savings_rate > 0.30) {
    profile_type = 'Conservative Stabilizer';
    description = 'Prefers stability and steady growth. Strong savings discipline.';
    strategy = 'Maintain high savings rate, favor debt instruments and balanced funds, keep 6+ months emergency fund.';
  } else if (risk_tolerance === 'high' && invest_ratio > 0.15) {
    profile_type = 'Aggressive Accelerator';
    description = 'High risk appetite with strong investment commitment. Growth-oriented.';
    strategy = 'Maximize equity exposure (age-appropriate), explore mid/small-cap, maintain discipline in downturns.';
  } else {
    profile_type = 'Balanced Builder';
    description = 'Steady approach balancing growth and protection. Building wealth methodically.';
    strategy = 'Diversify across equity/debt/gold, increase SIP annually, optimize tax-saving investments.';
  }

  // Life-stage recommendations
  let life_stage, stage_focus;
  if (age < 30) { life_stage = 'Foundation (20-30)'; stage_focus = 'Build emergency fund, start SIPs, minimize debt, get term + health insurance.'; }
  else if (age < 45) { life_stage = 'Growth (30-45)'; stage_focus = 'Maximize investments, protect family, plan for children\'s education, accelerate debt payoff.'; }
  else if (age < 60) { life_stage = 'Acceleration (45-60)'; stage_focus = 'Maximize retirement corpus, reduce risk exposure, plan succession, ensure health coverage.'; }
  else { life_stage = 'Preservation (60+)'; stage_focus = 'Capital preservation, generate regular income, estate planning, healthcare priority.'; }

  return { wealth_dna_profile: profile_type, description, strategy, life_stage, stage_focus };
}

function getMotivation(healthScore, streaks = {}) {
  const quotes = [
    "Consistency beats intensity in wealth building.",
    "Every EMI paid brings you closer to freedom.",
    "Small improvements today create massive outcomes tomorrow.",
    "Financial discipline is the bridge between goals and accomplishment.",
    "Your future self will thank you for the choices you make today.",
    "Wealth is built in the quiet moments of discipline, not the loud moments of spending.",
    "The best time to start was yesterday. The second best time is now.",
    "Progress, not perfection, is what matters in finance."
  ];

  let motivational_message;
  if (healthScore >= 80) motivational_message = "You're in excellent financial shape. Keep this momentum going.";
  else if (healthScore >= 60) motivational_message = "Good progress! A few optimizations can push you to excellent.";
  else if (healthScore >= 40) motivational_message = "You're on the right track. Focus on the top 2-3 actions to improve fastest.";
  else motivational_message = "Every journey starts with a single step. Let's focus on quick wins first.";

  const quote = quotes[Math.floor(Math.random() * quotes.length)];

  let progress_highlight = '';
  if (streaks.emi_ontime > 3) progress_highlight = `🔥 ${streaks.emi_ontime}-month EMI streak! Keep it going.`;
  else if (streaks.savings_growth > 2) progress_highlight = `📈 Savings growing for ${streaks.savings_growth} months straight!`;
  else progress_highlight = "Track your progress monthly to unlock streaks and badges.";

  return { motivational_message, quote, progress_highlight };
}

export { classifyWealthDna, getMotivation };
