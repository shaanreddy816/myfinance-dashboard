/**
 * Risk Scoring Engine (1–100)
 * 5 risk dimensions with weighted aggregation
 * Categories: Stable (0-25) | Watchlist (26-50) | High (51-75) | Critical (76-100)
 */

const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

function computeRiskScore(profile) {
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
    equity_allocation_pct = 0,
    age = 30,
    income_sources = 1,
    job_stability = 'stable' // stable, moderate, unstable
  } = profile;

  const emi_ratio = income > 0 ? total_emi / income : 1;
  const savings_rate = income > 0 ? (income - expenses) / income : 0;
  const months_cover = expenses > 0 ? liquid_assets / expenses : 0;
  const debt_to_assets = total_assets > 0 ? total_debt_outstanding / total_assets : 1;

  // EMI Risk: higher EMI ratio = higher risk
  const EMIRisk = clamp(emi_ratio / 0.50 * 100, 0, 100);

  // Liquidity Risk: fewer months of cover = higher risk
  const LiquidityRisk = clamp((1 - months_cover / 12) * 100, 0, 100);

  // Cashflow Risk: lower savings rate = higher risk
  const CashflowRisk = clamp((1 - savings_rate / 0.30) * 100, 0, 100);

  // Debt Risk: higher debt-to-assets = higher risk
  const DebtRisk = clamp(debt_to_assets * 100, 0, 100);

  // Insurance Risk
  const requiredTerm = income * 12 * 15;
  const requiredHealth = 1000000 + (dependents * 200000);
  const termGap = requiredTerm > 0 ? Math.max(0, 1 - term_cover / requiredTerm) : 1;
  const healthGap = requiredHealth > 0 ? Math.max(0, 1 - health_cover / requiredHealth) : 1;
  const InsuranceRisk = clamp((termGap * 60 + healthGap * 40), 0, 100);

  // Volatility Adjustment: based on equity allocation vs age-appropriate
  const ageAppropriateEquity = Math.max(20, 100 - age);
  const equityOverexposure = Math.max(0, equity_allocation_pct - ageAppropriateEquity);
  const VolatilityAdjustment = clamp(equityOverexposure / 30 * 100, 0, 100);

  // Weighted risk score
  const riskScore = Math.round(
    0.25 * EMIRisk +
    0.20 * LiquidityRisk +
    0.20 * CashflowRisk +
    0.15 * DebtRisk +
    0.10 * InsuranceRisk +
    0.10 * VolatilityAdjustment
  );

  // Category
  let risk_category, color;
  if (riskScore <= 25) { risk_category = 'Stable'; color = '#10d98e'; }
  else if (riskScore <= 50) { risk_category = 'Watchlist'; color = '#f5c542'; }
  else if (riskScore <= 75) { risk_category = 'High'; color = '#f97316'; }
  else { risk_category = 'Critical'; color = '#f4495c'; }

  return {
    risk_score: riskScore,
    risk_category,
    color,
    risk_dimensions: {
      emi_risk: { score: Math.round(EMIRisk), weight: 0.25, label: 'EMI Burden' },
      liquidity_risk: { score: Math.round(LiquidityRisk), weight: 0.20, label: 'Liquidity' },
      cashflow_risk: { score: Math.round(CashflowRisk), weight: 0.20, label: 'Cashflow' },
      debt_risk: { score: Math.round(DebtRisk), weight: 0.15, label: 'Debt Exposure' },
      insurance_risk: { score: Math.round(InsuranceRisk), weight: 0.10, label: 'Insurance Gap' },
      volatility: { score: Math.round(VolatilityAdjustment), weight: 0.10, label: 'Volatility' }
    },
    stress_test: {
      job_loss_survival_months: +months_cover.toFixed(1),
      rate_hike_2pct_impact: Math.round(total_emi * 0.12), // ~12% EMI increase for 2% rate hike
      recession_risk: riskScore > 50 ? 'High exposure' : 'Manageable'
    }
  };
}

export { computeRiskScore };
