/**
 * Stress Engine — Pure functions for financial stress testing
 *
 * Simulates financial shocks (income loss, expense spikes, rate hikes)
 * and evaluates household resilience through survival analysis.
 *
 * All functions are pure (no side effects, no external state).
 */

/**
 * Clamp value between min and max
 */
function clamp(min, max, value) {
  return Math.max(min, Math.min(max, value));
}

/**
 * STRESS_SCENARIOS — immutable catalog of 9 predefined stress scenarios
 * across 4 categories: Income Shock, Expense Shock, Rate Shock, Combined Shock.
 */
export const STRESS_SCENARIOS = Object.freeze({
  'income-10': {
    id: 'income-10',
    category: 'Income Shock',
    label: '10% Income Loss',
    incomeFactor: 0.9,
    description: 'Salary cut or reduced business income by 10%',
  },
  'income-20': {
    id: 'income-20',
    category: 'Income Shock',
    label: '20% Income Loss',
    incomeFactor: 0.8,
    description: 'Major income disruption — 20% reduction',
  },
  'expense-10': {
    id: 'expense-10',
    category: 'Expense Shock',
    label: '10% Expense Rise',
    expenseFactor: 1.1,
    description: 'Moderate inflation or lifestyle creep — expenses up 10%',
  },
  'expense-20': {
    id: 'expense-20',
    category: 'Expense Shock',
    label: '20% Expense Rise',
    expenseFactor: 1.2,
    description: 'Significant cost increase — expenses up 20%',
  },
  'expense-med': {
    id: 'expense-med',
    category: 'Expense Shock',
    label: 'Medical Emergency',
    expenseFactor: 1.5,
    liquidHit: 'sixMonthExpenses',
    description: 'Medical emergency — 50% expense spike + 6-month savings drain',
  },
  'rate-100': {
    id: 'rate-100',
    category: 'Rate Shock',
    label: '+1% Rate Hike',
    rateBump: 1,
    description: 'RBI rate hike — all loan rates increase by 1 percentage point',
  },
  'rate-200': {
    id: 'rate-200',
    category: 'Rate Shock',
    label: '+2% Rate Hike',
    rateBump: 2,
    description: 'Aggressive tightening — all loan rates increase by 2 percentage points',
  },
  'combined-mild': {
    id: 'combined-mild',
    category: 'Combined Shock',
    label: 'Mild Combined',
    incomeFactor: 0.9,
    rateBump: 1,
    description: '10% income loss + 1% rate hike — mild recession scenario',
  },
  'combined-severe': {
    id: 'combined-severe',
    category: 'Combined Shock',
    label: 'Severe Combined',
    incomeFactor: 0.8,
    rateBump: 2,
    description: '20% income loss + 2% rate hike — severe recession scenario',
  },
});

/**
 * computeShockedEMI(loans, rateBump) → Number
 *
 * Recalculates total monthly EMI with bumped interest rates.
 * Uses standard EMI formula: P × r × (1+r)^n / ((1+r)^n − 1)
 *
 * @param {Array} loans - [{ outstanding, rate, remainingTenure, emi }]
 * @param {number} rateBump - Rate increase in percentage points (e.g., 2 for +2%)
 * @returns {number} Total shocked EMI
 */
export function computeShockedEMI(loans, rateBump) {
  if (!rateBump) {
    return loans.reduce((sum, loan) => sum + (loan.emi || 0), 0);
  }

  let totalShockedEmi = 0;

  for (const loan of loans || []) {
    const P = loan.outstanding || 0;
    if (P === 0) continue;

    const annualRate = (loan.rate || 0) + rateBump;
    const r = annualRate / 12 / 100; // monthly rate
    const n = (loan.remainingTenure || 0) * 12; // remaining months

    if (n === 0 || r === 0) {
      totalShockedEmi += loan.emi || 0;
      continue;
    }

    // EMI formula
    const compoundFactor = Math.pow(1 + r, n);
    const emi = (P * r * compoundFactor) / (compoundFactor - 1);
    totalShockedEmi += emi;
  }

  return totalShockedEmi;
}

/**
 * computeShockedMetrics(scenario, baseMetrics, loans) → ShockedMetrics
 *
 * Applies scenario shocks to base metrics and recomputes risk ratios.
 *
 * @param {Object} scenario - Scenario from STRESS_SCENARIOS
 * @param {Object} baseMetrics - { monthlyIncome, monthlyExpenses, totalEmi, liquidSavings, dsr, lcr, nim, stabilityScore, protScore }
 * @param {Array} loans - Loan data for EMI recalculation
 * @returns {Object} Shocked metrics with recomputed ratios
 */
export function computeShockedMetrics(scenario, baseMetrics, loans) {
  // Apply income shock
  const shockedIncome = baseMetrics.monthlyIncome * (scenario.incomeFactor || 1);

  // Apply expense shock
  const shockedExpenses = baseMetrics.monthlyExpenses * (scenario.expenseFactor || 1);

  // Apply rate shock
  const shockedEmi = scenario.rateBump
    ? computeShockedEMI(loans, scenario.rateBump)
    : baseMetrics.totalEmi;

  // Apply liquid hit
  let shockedLiquidSavings = baseMetrics.liquidSavings;
  if (scenario.liquidHit === 'sixMonthExpenses') {
    shockedLiquidSavings = Math.max(0, baseMetrics.liquidSavings - baseMetrics.monthlyExpenses * 6);
  } else if (typeof scenario.liquidHit === 'number') {
    shockedLiquidSavings = Math.max(0, baseMetrics.liquidSavings - scenario.liquidHit);
  }

  // Recompute DSR
  let shockedDsr;
  if (shockedIncome === 0) {
    shockedDsr = shockedEmi > 0 ? 100 : 0;
  } else {
    shockedDsr = (shockedEmi / shockedIncome) * 100;
  }

  // Recompute LCR
  let shockedLcr;
  const sixMonthExp = shockedExpenses * 6;
  if (sixMonthExp === 0) {
    shockedLcr = shockedLiquidSavings > 0 ? 1.0 : 0;
  } else {
    shockedLcr = shockedLiquidSavings / sixMonthExp;
  }

  // Recompute NIM (for rate shocks)
  let shockedNimValue;
  if (scenario.rateBump) {
    const nimData = baseMetrics.nim || {};
    shockedNimValue = (nimData.weightedYield || 0) - ((nimData.weightedCost || 0) + scenario.rateBump);
  } else {
    shockedNimValue = baseMetrics.nim?.nim || 0;
  }

  // Recompute Stability Score
  const nimScore = clamp(0, 100, 50 + shockedNimValue * 25);
  const dsrScore = clamp(0, 100, 100 - shockedDsr * 2);
  const lcrScore = clamp(0, 100, shockedLcr * 100);
  const protScore = baseMetrics.protScore || 0;

  const shockedStabilityScore = Math.round(
    dsrScore * 0.3 + lcrScore * 0.25 + nimScore * 0.2 + protScore * 0.25
  );

  return {
    monthlyIncome: shockedIncome,
    monthlyExpenses: shockedExpenses,
    totalEmi: shockedEmi,
    liquidSavings: shockedLiquidSavings,
    dsr: shockedDsr,
    lcr: shockedLcr,
    nim: shockedNimValue,
    stabilityScore: shockedStabilityScore,
    nimScore,
    dsrScore,
    lcrScore,
    protScore,
  };
}

/**
 * evaluateShockImpact(baseMetrics, shockedMetrics) → ImpactResult
 *
 * Computes deltas, survival analysis, and severity classification.
 *
 * @param {Object} baseMetrics - Base metrics before shock
 * @param {Object} shockedMetrics - Metrics after shock
 * @returns {Object} Impact analysis with deltas, survival months, and severity
 */
export function evaluateShockImpact(baseMetrics, shockedMetrics) {
  // Compute deltas (positive = worsened)
  const stabilityDelta = baseMetrics.stabilityScore - shockedMetrics.stabilityScore;
  const dsrDelta = shockedMetrics.dsr - baseMetrics.dsr;
  const lcrDelta = baseMetrics.lcr - shockedMetrics.lcr;
  const nimDelta = (baseMetrics.nim?.nim || 0) - shockedMetrics.nim;

  // Survival analysis
  const monthlyDeficit =
    shockedMetrics.monthlyExpenses + shockedMetrics.totalEmi - shockedMetrics.monthlyIncome;
  let monthsLiquidity;
  if (monthlyDeficit <= 0) {
    monthsLiquidity = 999; // no deficit → unlimited
  } else {
    monthsLiquidity = shockedMetrics.liquidSavings / monthlyDeficit;
  }

  // Breach flags
  const dsrBreach = shockedMetrics.dsr > 50;
  const stabilityBreach = shockedMetrics.stabilityScore < 50;

  // Net worth in year 1
  const annualNetCashFlow =
    (shockedMetrics.monthlyIncome - shockedMetrics.monthlyExpenses - shockedMetrics.totalEmi) * 12;
  const netWorthYear1 =
    annualNetCashFlow + (baseMetrics.totalInvestments || 0) - (baseMetrics.totalLoanOutstanding || 0);
  const netWorthNegative = netWorthYear1 < 0;

  // Severity classification
  let severity;
  if (shockedMetrics.stabilityScore < 50 || shockedMetrics.dsr > 50) {
    severity = 'critical';
  } else if (monthsLiquidity < 6) {
    severity = 'warning';
  } else {
    severity = 'manageable';
  }

  return {
    stabilityDelta,
    dsrDelta,
    lcrDelta,
    nimDelta,
    monthsLiquidity: Math.min(monthsLiquidity, 999),
    dsrBreach,
    stabilityBreach,
    netWorthNegative,
    netWorthYear1,
    severity,
  };
}

/**
 * runStressScenario(scenarioId, baseMetrics, loans) → StressResult
 *
 * Orchestrates the full stress test pipeline.
 *
 * @param {string} scenarioId - ID from STRESS_SCENARIOS
 * @param {Object} baseMetrics - Current unshocked metrics
 * @param {Array} loans - Loan data for EMI recalculation
 * @returns {Object} Complete stress test result
 */
export function runStressScenario(scenarioId, baseMetrics, loans) {
  const scenario = STRESS_SCENARIOS[scenarioId];
  if (!scenario) {
    return { error: true, message: `Unknown scenario: ${scenarioId}` };
  }

  const shocked = computeShockedMetrics(scenario, baseMetrics, loans);
  const impact = evaluateShockImpact(baseMetrics, shocked);

  return {
    scenarioId: scenario.id,
    scenarioLabel: scenario.label,
    category: scenario.category,
    description: scenario.description,
    base: baseMetrics,
    shocked,
    impact,
  };
}
