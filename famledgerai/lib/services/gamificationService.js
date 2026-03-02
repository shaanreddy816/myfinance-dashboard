/**
 * Gamification Engine
 * Badges, streaks, and milestones
 */

const BADGES = {
  debt_destroyer: { id: 'debt_destroyer', name: 'Debt Destroyer', icon: '⚔️', description: 'Cleared a loan completely' },
  emergency_champion: { id: 'emergency_champion', name: 'Emergency Fund Champion', icon: '🛡️', description: 'Built 6+ months emergency fund' },
  investment_builder: { id: 'investment_builder', name: 'Investment Builder', icon: '📈', description: 'SIP exceeds 15% of income' },
  risk_reducer: { id: 'risk_reducer', name: 'Risk Reducer', icon: '🎯', description: 'Risk score dropped below 25' },
  freedom_tracker: { id: 'freedom_tracker', name: 'Freedom Tracker', icon: '🏆', description: 'Health score above 80' },
  savings_star: { id: 'savings_star', name: 'Savings Star', icon: '⭐', description: 'Savings rate above 30%' },
  emi_warrior: { id: 'emi_warrior', name: 'EMI Warrior', icon: '💪', description: '6-month EMI on-time streak' },
  net_worth_milestone: { id: 'net_worth_milestone', name: 'Net Worth Milestone', icon: '💎', description: 'Net worth crossed a major milestone' },
  first_step: { id: 'first_step', name: 'First Step', icon: '👣', description: 'Completed financial profile setup' },
  insurance_secured: { id: 'insurance_secured', name: 'Insurance Secured', icon: '🔒', description: 'Adequate term + health insurance' }
};

function evaluateBadges(profile, healthScore, riskScore) {
  const unlocked = [];
  const { income = 0, expenses = 0, liquid_assets = 0, sip_monthly = 0,
    total_debt_outstanding = 0, loans = [], term_cover = 0, health_cover = 0,
    dependents = 0, net_worth = 0 } = profile;

  const savings_rate = income > 0 ? (income - expenses) / income : 0;
  const months_cover = expenses > 0 ? liquid_assets / expenses : 0;
  const invest_ratio = income > 0 ? sip_monthly / income : 0;

  if (total_debt_outstanding === 0 && loans.length === 0) unlocked.push(BADGES.debt_destroyer);
  if (months_cover >= 6) unlocked.push(BADGES.emergency_champion);
  if (invest_ratio >= 0.15) unlocked.push(BADGES.investment_builder);
  if (riskScore <= 25) unlocked.push(BADGES.risk_reducer);
  if (healthScore >= 80) unlocked.push(BADGES.freedom_tracker);
  if (savings_rate >= 0.30) unlocked.push(BADGES.savings_star);

  const requiredTerm = income * 12 * 15;
  const requiredHealth = 1000000 + (dependents * 200000);
  if (term_cover >= requiredTerm * 0.8 && health_cover >= requiredHealth * 0.8) {
    unlocked.push(BADGES.insurance_secured);
  }

  // Net worth milestones
  const milestones = [100000, 500000, 1000000, 5000000, 10000000, 50000000, 100000000];
  const crossed = milestones.filter(m => net_worth >= m);
  if (crossed.length > 0) unlocked.push({ ...BADGES.net_worth_milestone,
    description: `Net worth crossed ₹${(crossed[crossed.length - 1] / 100000).toFixed(0)}L` });

  if (income > 0) unlocked.push(BADGES.first_step);

  return { badges_unlocked: unlocked, total_badges: Object.keys(BADGES).length, earned: unlocked.length };
}

function evaluateStreaks(currentStreaks = {}) {
  // Streaks are tracked over time — this returns the current state
  return {
    emi_ontime: currentStreaks.emi_ontime || 0,
    savings_growth: currentStreaks.savings_growth || 0,
    debt_reduction: currentStreaks.debt_reduction || 0,
    net_worth_growth: currentStreaks.net_worth_growth || 0,
    budget_adherence: currentStreaks.budget_adherence || 0
  };
}

export { evaluateBadges, evaluateStreaks, BADGES };
