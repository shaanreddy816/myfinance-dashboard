/**
 * Risk Engine — Pure functions for financial risk assessment
 *
 * Computes household financial stability score from four sub-metrics:
 * - NIM (Net Interest Margin): investment yield vs borrowing cost spread
 * - DSR (Debt Service Ratio): EMI burden as % of income
 * - LCR (Liquidity Coverage Ratio): emergency fund adequacy
 * - Protection Adequacy: insurance coverage vs benchmarks
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
 * computeHouseholdNIM(investments, loans, assumptions) → { nim, weightedYield, weightedCost, rag }
 *
 * Net Interest Margin: spread between investment returns and borrowing costs.
 * Positive NIM = investments earning more than loans cost (healthy).
 * Negative NIM = paying more on loans than earning on investments (risky).
 *
 * @param {Object} investments - { equityItems: [{value}], debtItems: [{value}] }
 * @param {Array} loans - [{ outstanding, rate }]
 * @param {Object} assumptions - { equityReturn, debtReturn }
 * @returns {Object} { nim, weightedYield, weightedCost, rag }
 *
 * RAG: green ≥ 2%, yellow ≥ 0% & < 2%, red < 0%
 */
export function computeHouseholdNIM(investments, loans, assumptions) {
  const equityReturn = assumptions.equityReturn || 0;
  const debtReturn = assumptions.debtReturn || 0;

  // Weighted Yield: Σ(value × rate) / Σ(value)
  let totalInvValue = 0;
  let weightedReturnSum = 0;

  for (const item of investments.equityItems || []) {
    const v = item.value || 0;
    totalInvValue += v;
    weightedReturnSum += v * equityReturn;
  }
  for (const item of investments.debtItems || []) {
    const v = item.value || 0;
    totalInvValue += v;
    weightedReturnSum += v * debtReturn;
  }

  const weightedYield = totalInvValue > 0 ? weightedReturnSum / totalInvValue : 0;

  // Weighted Cost: Σ(outstanding × rate) / Σ(outstanding)
  let totalOutstanding = 0;
  let weightedCostSum = 0;

  for (const loan of loans || []) {
    const o = loan.outstanding || 0;
    const r = loan.rate || 0;
    totalOutstanding += o;
    weightedCostSum += o * r;
  }

  const weightedCost = totalOutstanding > 0 ? weightedCostSum / totalOutstanding : 0;

  // NIM = Weighted_Yield − Weighted_Cost (percentage points)
  const nim = weightedYield - weightedCost;

  // RAG classification
  const rag = nim >= 2 ? 'green' : nim >= 0 ? 'yellow' : 'red';

  return { nim, weightedYield, weightedCost, rag };
}

/**
 * computeDSR(totalEmi, monthlyIncome) → { dsr, totalEmi, monthlyIncome, rag }
 *
 * Debt Service Ratio: percentage of gross monthly income consumed by loan EMIs.
 * Banks typically require DSR ≤ 50% for loan approval.
 *
 * @param {number} totalEmi - Total monthly EMI payments
 * @param {number} monthlyIncome - Gross monthly income
 * @returns {Object} { dsr, totalEmi, monthlyIncome, rag }
 *
 * RAG: green ≤ 35%, yellow > 35% & ≤ 50%, red > 50%
 */
export function computeDSR(totalEmi, monthlyIncome) {
  totalEmi = totalEmi || 0;
  monthlyIncome = monthlyIncome || 0;

  // DSR = (totalEmi / monthlyIncome) × 100
  // Guard: when income = 0, DSR = 100 if EMIs exist, 0 if no EMIs
  let dsr;
  if (monthlyIncome === 0) {
    dsr = totalEmi > 0 ? 100 : 0;
  } else {
    dsr = (totalEmi / monthlyIncome) * 100;
  }

  // RAG classification
  const rag = dsr <= 35 ? 'green' : dsr <= 50 ? 'yellow' : 'red';

  return { dsr, totalEmi, monthlyIncome, rag };
}

/**
 * computeLCR(liquidSavings, monthlyExpenses, totalEmi) → { lcr, monthsCoverage, liquidSavings, monthlyExpenses, rag }
 *
 * Liquidity Coverage Ratio: liquid savings vs. 6-month expense benchmark.
 * Measures emergency buffer adequacy.
 *
 * @param {number} liquidSavings - Available liquid cash/savings
 * @param {number} monthlyExpenses - Monthly household expenses
 * @param {number} totalEmi - Total monthly EMI payments
 * @returns {Object} { lcr, monthsCoverage, liquidSavings, monthlyExpenses, rag }
 *
 * RAG: green ≥ 1.0, yellow ≥ 0.5 & < 1.0, red < 0.5
 */
export function computeLCR(liquidSavings, monthlyExpenses, totalEmi) {
  liquidSavings = liquidSavings || 0;
  monthlyExpenses = monthlyExpenses || 0;
  totalEmi = totalEmi || 0;

  // LCR = liquidSavings / (monthlyExpenses × 6)
  let lcr;
  const sixMonthExpenses = monthlyExpenses * 6;
  if (sixMonthExpenses === 0) {
    lcr = liquidSavings > 0 ? 1.0 : 0;
  } else {
    lcr = liquidSavings / sixMonthExpenses;
  }

  // monthsCoverage = liquidSavings / (monthlyExpenses + totalEmi)
  let monthsCoverage;
  const monthlyBurn = monthlyExpenses + totalEmi;
  if (monthlyBurn === 0) {
    monthsCoverage = liquidSavings > 0 ? 1.0 : 0;
  } else {
    monthsCoverage = liquidSavings / monthlyBurn;
  }

  // RAG classification
  const rag = lcr >= 1.0 ? 'green' : lcr >= 0.5 ? 'yellow' : 'red';

  return { lcr, monthsCoverage, liquidSavings, monthlyExpenses, rag };
}

/**
 * computeProtectionAdequacy(termCover, healthCover, monthlyIncome, dependentCount, medicalInflation) →
 *   { ratio, termAdequacy, healthAdequacy, termCover, healthCover, termBenchmark, healthBenchmark, dependentCount, rag }
 *
 * Protection Adequacy: insurance coverage vs. recommended benchmarks.
 *
 * @param {number} termCover - Current term life insurance cover
 * @param {number} healthCover - Current health insurance cover
 * @param {number} monthlyIncome - Gross monthly income
 * @param {number} dependentCount - Number of family dependents
 * @param {number} medicalInflation - Medical inflation rate (%)
 * @returns {Object} { ratio, termAdequacy, healthAdequacy, termCover, healthCover, termBenchmark, healthBenchmark, dependentCount, rag }
 *
 * RAG: green ≥ 0.8, yellow ≥ 0.5 & < 0.8, red < 0.5
 */
export function computeProtectionAdequacy(
  termCover,
  healthCover,
  monthlyIncome,
  dependentCount,
  medicalInflation
) {
  termCover = termCover || 0;
  healthCover = healthCover || 0;
  monthlyIncome = monthlyIncome || 0;
  dependentCount = dependentCount || 0;
  medicalInflation = medicalInflation || 10;

  // termBenchmark = monthlyIncome × 12 months × 12 multiplier (12× annual income)
  const termBenchmark = monthlyIncome * 12 * 12;

  // termAdequacy = termCover / termBenchmark
  // Guard: when income = 0, termAdequacy = 1.0 (no income to protect)
  let termAdequacy;
  if (monthlyIncome === 0) {
    termAdequacy = 1.0;
  } else {
    termAdequacy = termCover / termBenchmark;
  }

  // healthBenchmark = (10,00,000 + 2,00,000 × dependentCount) × (1 + medicalInflation/100)^5
  const healthBenchmark =
    (1000000 + 200000 * dependentCount) * Math.pow(1 + medicalInflation / 100, 5);

  // healthAdequacy = healthCover / healthBenchmark
  const healthAdequacy = healthBenchmark > 0 ? healthCover / healthBenchmark : 0;

  // ratio = average of term and health adequacy
  const ratio = (termAdequacy + healthAdequacy) / 2;

  // RAG classification
  const rag = ratio >= 0.8 ? 'green' : ratio >= 0.5 ? 'yellow' : 'red';

  return {
    ratio,
    termAdequacy,
    healthAdequacy,
    termCover,
    healthCover,
    termBenchmark,
    healthBenchmark,
    dependentCount,
    rag,
  };
}

/**
 * computeStabilityScore(nimData, dsrData, lcrData, protData) →
 *   { score, nimScore, dsrScore, lcrScore, protScore, topRisk, suggestion, rag }
 *
 * Financial Stability Score: composite weighted score (0–100) combining all four sub-metrics.
 *
 * @param {Object} nimData - Result from computeHouseholdNIM
 * @param {Object} dsrData - Result from computeDSR
 * @param {Object} lcrData - Result from computeLCR
 * @param {Object} protData - Result from computeProtectionAdequacy
 * @returns {Object} { score, nimScore, dsrScore, lcrScore, protScore, topRisk, suggestion, rag }
 *
 * Normalization (each to 0–100):
 *   nimScore  = clamp(0, 100, 50 + NIM × 25)
 *   dsrScore  = clamp(0, 100, 100 − DSR × 2)
 *   lcrScore  = clamp(0, 100, LCR × 100)
 *   protScore = clamp(0, 100, ratio × 100)
 *
 * Composite = round(dsrScore × 0.30 + lcrScore × 0.25 + nimScore × 0.20 + protScore × 0.25)
 *
 * RAG: green 75–100, yellow 50–74, red 0–49
 */
export function computeStabilityScore(nimData, dsrData, lcrData, protData) {
  // Normalize each sub-metric to 0–100 scale
  const nimScore = clamp(0, 100, 50 + (nimData.nim || 0) * 25);
  const dsrScore = clamp(0, 100, 100 - (dsrData.dsr || 0) * 2);
  const lcrScore = clamp(0, 100, (lcrData.lcr || 0) * 100);
  const protScore = clamp(0, 100, (protData.ratio || 0) * 100);

  // Composite stability score = weighted sum
  // Weights: DSR 30%, LCR 25%, NIM 20%, Protection 25%
  const score = Math.round(
    dsrScore * 0.3 + lcrScore * 0.25 + nimScore * 0.2 + protScore * 0.25
  );

  // Identify top risk: sub-metric with the lowest normalized score
  const scores = { dsr: dsrScore, lcr: lcrScore, nim: nimScore, protection: protScore };
  let topRisk = 'dsr';
  let lowestScore = dsrScore;
  for (const [key, val] of Object.entries(scores)) {
    if (val < lowestScore) {
      lowestScore = val;
      topRisk = key;
    }
  }

  // Actionable suggestion based on top risk area
  const suggestions = {
    dsr: 'Consider reducing EMI burden — prepay high-interest loans or avoid new debt.',
    lcr: 'Build your emergency fund — target 6 months of expenses in liquid savings.',
    nim: 'Your borrowing costs exceed investment returns — review your investment mix or refinance loans.',
    protection:
      'Your insurance cover is critically low — consider increasing term cover to 12× annual income.',
  };
  const suggestion = suggestions[topRisk] || '';

  // RAG classification
  const rag = score >= 75 ? 'green' : score >= 50 ? 'yellow' : 'red';

  return { score, nimScore, dsrScore, lcrScore, protScore, topRisk, suggestion, rag };
}
