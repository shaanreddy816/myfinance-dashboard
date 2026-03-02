/**
 * Financial Health Score Engine (0–100)
 * 7 sub-scores with weighted aggregation
 */

const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

function computeHealthScore(profile) {
  const {
    income = 0,
    expenses = 0,
    total_emi = 0,
    total_debt_outstanding = 0,
    liquid_assets = 0,
    total_assets = 0,
    term_cover = 0,
    health_cover = 0,
    dependents = 0,
    sip_monthly = 0,
    credit_utilization = 0,
    age = 30
  } = profile;

  // Derived metrics
  const savings_rate = income > 0 ? (income - expenses) / income : 0;
  const emi_ratio = income > 0 ? total_emi / income : (total_emi > 0 ? 1 : 0);
  const months_cover = expenses > 0 ? liquid_assets / expenses : (liquid_assets > 0 ? 12 : 0);
  const debt_to_assets = total_assets > 0 ? total_debt_outstanding / total_assets : (total_debt_outstanding > 0 ? 1 : 0);

  // Sub-scores
  const CashflowScore = clamp((savings_rate / 0.20) * 100, 0, 100);
  const EMIScore = clamp(((0.40 - emi_ratio) / 0.40) * 100, 0, 100);
  const EmergencyScore = clamp((months_cover / 6) * 100, 0, 100);
  const DebtScore = clamp((1 - debt_to_assets) * 100, 0, 100);
  const InvestmentScore = income > 0 ? clamp((sip_monthly / (0.15 * income)) * 100, 0, 100) : 0;
  const CreditScore = clamp(((0.30 - credit_utilization) / 0.30) * 100, 0, 100);

  // Insurance adequacy
  const requiredTerm = income * 12 * 15; // 15x annual income
  const requiredHealth = 1000000 + (dependents * 200000); // 10L base + 2L per dependent
  const termAdequacy = requiredTerm > 0 ? clamp(term_cover / requiredTerm, 0, 1) : (term_cover > 0 ? 1 : 0);
  const healthAdequacy = requiredHealth > 0 ? clamp(health_cover / requiredHealth, 0, 1) : 0;
  const InsuranceScore = clamp((termAdequacy * 60 + healthAdequacy * 40), 0, 100);

  // Weighted final score
  const finalScore = Math.round(
    0.20 * CashflowScore +
    0.20 * EMIScore +
    0.15 * EmergencyScore +
    0.15 * DebtScore +
    0.15 * InsuranceScore +
    0.10 * CreditScore +
    0.05 * InvestmentScore
  );

  // Grade
  let grade, color;
  if (finalScore >= 80) { grade = 'Excellent'; color = '#10d98e'; }
  else if (finalScore >= 60) { grade = 'Good'; color = '#3b7eff'; }
  else if (finalScore >= 40) { grade = 'Fair'; color = '#f5c542'; }
  else if (finalScore >= 20) { grade = 'Poor'; color = '#f4495c'; }
  else { grade = 'Critical'; color = '#dc2626'; }

  return {
    financial_health_score: finalScore,
    grade,
    color,
    sub_scores: {
      cashflow: { score: Math.round(CashflowScore), weight: 0.20, label: 'Cashflow', detail: `Savings rate: ${(savings_rate * 100).toFixed(1)}%` },
      emi_load: { score: Math.round(EMIScore), weight: 0.20, label: 'EMI Load', detail: `EMI ratio: ${(emi_ratio * 100).toFixed(1)}%` },
      emergency: { score: Math.round(EmergencyScore), weight: 0.15, label: 'Emergency Fund', detail: `${months_cover.toFixed(1)} months cover` },
      debt: { score: Math.round(DebtScore), weight: 0.15, label: 'Debt Health', detail: `Debt-to-asset: ${(debt_to_assets * 100).toFixed(1)}%` },
      insurance: { score: Math.round(InsuranceScore), weight: 0.15, label: 'Insurance', detail: `Term: ${(termAdequacy * 100).toFixed(0)}%, Health: ${(healthAdequacy * 100).toFixed(0)}%` },
      credit: { score: Math.round(CreditScore), weight: 0.10, label: 'Credit Usage', detail: `Utilization: ${(credit_utilization * 100).toFixed(1)}%` },
      investment: { score: Math.round(InvestmentScore), weight: 0.05, label: 'Investment', detail: `SIP: ₹${sip_monthly.toLocaleString()} / target ₹${Math.round(0.15 * income).toLocaleString()}` }
    },
    derived_metrics: {
      savings_rate: +(savings_rate * 100).toFixed(1),
      emi_ratio: +(emi_ratio * 100).toFixed(1),
      months_cover: +months_cover.toFixed(1),
      debt_to_assets: +(debt_to_assets * 100).toFixed(1)
    }
  };
}

export { computeHealthScore };
