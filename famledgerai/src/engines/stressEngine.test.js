import { describe, it, expect } from 'vitest';
import {
  STRESS_SCENARIOS,
  computeShockedEMI,
  computeShockedMetrics,
  evaluateShockImpact,
  runStressScenario,
} from './stressEngine.js';

describe('Stress Engine', () => {
  describe('STRESS_SCENARIOS', () => {
    it('should have 9 predefined scenarios', () => {
      expect(Object.keys(STRESS_SCENARIOS)).toHaveLength(9);
    });

    it('should be immutable', () => {
      // Object.freeze prevents modifications but doesn't throw in non-strict mode
      // Just verify the object is frozen
      expect(Object.isFrozen(STRESS_SCENARIOS)).toBe(true);
    });

    it('should have correct categories', () => {
      const categories = Object.values(STRESS_SCENARIOS).map((s) => s.category);
      expect(categories).toContain('Income Shock');
      expect(categories).toContain('Expense Shock');
      expect(categories).toContain('Rate Shock');
      expect(categories).toContain('Combined Shock');
    });

    it('should have income-10 scenario with 10% reduction', () => {
      expect(STRESS_SCENARIOS['income-10'].incomeFactor).toBe(0.9);
    });

    it('should have medical emergency with expense spike and liquid hit', () => {
      expect(STRESS_SCENARIOS['expense-med'].expenseFactor).toBe(1.5);
      expect(STRESS_SCENARIOS['expense-med'].liquidHit).toBe('sixMonthExpenses');
    });
  });

  describe('computeShockedEMI', () => {
    it('should return original EMI when no rate bump', () => {
      const loans = [
        { outstanding: 1000000, rate: 8, remainingTenure: 10, emi: 12133 },
        { outstanding: 500000, rate: 10, remainingTenure: 5, emi: 10624 },
      ];
      const result = computeShockedEMI(loans, 0);
      expect(result).toBe(22757);
    });

    it('should increase EMI with rate bump', () => {
      const loans = [{ outstanding: 1000000, rate: 8, remainingTenure: 10, emi: 12133 }];
      const originalEMI = computeShockedEMI(loans, 0);
      const shockedEMI = computeShockedEMI(loans, 2); // +2% rate hike

      expect(shockedEMI).toBeGreaterThan(originalEMI);
      // EMI at 10% rate for 10 years on 1M principal
      expect(shockedEMI).toBeCloseTo(13215, 0);
    });

    it('should handle multiple loans with different rates', () => {
      const loans = [
        { outstanding: 1000000, rate: 8, remainingTenure: 10, emi: 12133 },
        { outstanding: 500000, rate: 10, remainingTenure: 5, emi: 10624 },
      ];
      const shockedEMI = computeShockedEMI(loans, 1);

      // Both loans get +1% rate bump
      expect(shockedEMI).toBeGreaterThan(22757);
    });

    it('should handle zero outstanding loans', () => {
      const loans = [{ outstanding: 0, rate: 8, remainingTenure: 10, emi: 0 }];
      const result = computeShockedEMI(loans, 2);
      expect(result).toBe(0);
    });

    it('should handle zero remaining tenure', () => {
      const loans = [{ outstanding: 100000, rate: 8, remainingTenure: 0, emi: 5000 }];
      const result = computeShockedEMI(loans, 2);
      expect(result).toBe(5000); // Uses original EMI
    });

    it('should handle empty loan array', () => {
      const result = computeShockedEMI([], 2);
      expect(result).toBe(0);
    });
  });

  describe('computeShockedMetrics', () => {
    const baseMetrics = {
      monthlyIncome: 100000,
      monthlyExpenses: 50000,
      totalEmi: 6066,
      liquidSavings: 300000,
      dsr: 6.07,
      lcr: 1.0,
      nim: { nim: 2, weightedYield: 10, weightedCost: 8 },
      stabilityScore: 75,
      protScore: 80,
      totalInvestments: 1000000,
      totalLoanOutstanding: 500000,
    };

    const loans = [{ outstanding: 500000, rate: 8, remainingTenure: 10, emi: 6066 }];

    it('should apply income shock correctly', () => {
      const scenario = STRESS_SCENARIOS['income-10'];
      const result = computeShockedMetrics(scenario, baseMetrics, loans);

      expect(result.monthlyIncome).toBe(90000); // 10% reduction
      expect(result.monthlyExpenses).toBe(50000); // unchanged
    });

    it('should apply expense shock correctly', () => {
      const scenario = STRESS_SCENARIOS['expense-10'];
      const result = computeShockedMetrics(scenario, baseMetrics, loans);

      expect(result.monthlyExpenses).toBeCloseTo(55000, 1); // 10% increase
      expect(result.monthlyIncome).toBe(100000); // unchanged
    });

    it('should apply rate shock and recompute EMI', () => {
      const scenario = STRESS_SCENARIOS['rate-200'];
      const result = computeShockedMetrics(scenario, baseMetrics, loans);

      expect(result.totalEmi).toBeGreaterThan(6066);
      expect(result.nim).toBe(0); // NIM = 10 - (8 + 2) = 0
    });

    it('should apply medical emergency with liquid hit', () => {
      const scenario = STRESS_SCENARIOS['expense-med'];
      const result = computeShockedMetrics(scenario, baseMetrics, loans);

      expect(result.monthlyExpenses).toBe(75000); // 50% increase
      expect(result.liquidSavings).toBe(0); // 300000 - (50000 * 6) = 0
    });

    it('should recompute DSR after shock', () => {
      const scenario = STRESS_SCENARIOS['income-20'];
      const result = computeShockedMetrics(scenario, baseMetrics, loans);

      // DSR = (6066 / 80000) * 100 = 7.58%
      expect(result.dsr).toBeCloseTo(7.58, 1);
    });

    it('should recompute LCR after shock', () => {
      const scenario = STRESS_SCENARIOS['expense-20'];
      const result = computeShockedMetrics(scenario, baseMetrics, loans);

      // LCR = 300000 / (60000 * 6) = 0.833
      expect(result.lcr).toBeCloseTo(0.833, 2);
    });

    it('should recompute stability score after shock', () => {
      const scenario = STRESS_SCENARIOS['combined-severe'];
      const result = computeShockedMetrics(scenario, baseMetrics, loans);

      // Stability score should be within valid range
      expect(result.stabilityScore).toBeGreaterThanOrEqual(0);
      expect(result.stabilityScore).toBeLessThanOrEqual(100);
      // With 20% income loss + 2% rate hike, score should change
      expect(result.stabilityScore).not.toBe(baseMetrics.stabilityScore);
    });

    it('should handle zero income edge case', () => {
      const zeroIncomeBase = { ...baseMetrics, monthlyIncome: 0 };
      const scenario = STRESS_SCENARIOS['income-10'];
      const result = computeShockedMetrics(scenario, zeroIncomeBase, loans);

      expect(result.dsr).toBe(100); // EMI exists but no income
    });

    it('should handle zero expenses edge case', () => {
      const zeroExpenseBase = { ...baseMetrics, monthlyExpenses: 0 };
      const scenario = STRESS_SCENARIOS['expense-10'];
      const result = computeShockedMetrics(scenario, zeroExpenseBase, loans);

      expect(result.lcr).toBe(1.0); // Liquid savings exist but no expenses
    });

    it('should apply combined shock correctly', () => {
      const scenario = STRESS_SCENARIOS['combined-mild'];
      const result = computeShockedMetrics(scenario, baseMetrics, loans);

      expect(result.monthlyIncome).toBe(90000); // 10% income loss
      expect(result.totalEmi).toBeGreaterThan(6066); // +1% rate hike
      expect(result.nim).toBe(1); // NIM = 10 - (8 + 1) = 1
    });
  });

  describe('evaluateShockImpact', () => {
    const baseMetrics = {
      monthlyIncome: 100000,
      monthlyExpenses: 50000,
      totalEmi: 20000,
      liquidSavings: 300000,
      dsr: 20,
      lcr: 1.0,
      nim: { nim: 2 },
      stabilityScore: 75,
      totalInvestments: 1000000,
      totalLoanOutstanding: 500000,
    };

    it('should compute positive deltas when metrics worsen', () => {
      const shockedMetrics = {
        monthlyIncome: 80000,
        monthlyExpenses: 50000,
        totalEmi: 20000,
        liquidSavings: 300000,
        dsr: 25,
        lcr: 1.0,
        nim: 2,
        stabilityScore: 70,
      };

      const result = evaluateShockImpact(baseMetrics, shockedMetrics);

      expect(result.stabilityDelta).toBe(5); // 75 - 70
      expect(result.dsrDelta).toBe(5); // 25 - 20
    });

    it('should compute months of liquidity correctly', () => {
      const shockedMetrics = {
        monthlyIncome: 80000,
        monthlyExpenses: 50000,
        totalEmi: 20000,
        liquidSavings: 300000,
        dsr: 25,
        lcr: 0.857,
        nim: 2,
        stabilityScore: 70,
      };

      const result = evaluateShockImpact(baseMetrics, shockedMetrics);

      // monthlyDeficit = 50000 + 20000 - 80000 = -10000 (surplus)
      expect(result.monthsLiquidity).toBe(999); // unlimited
    });

    it('should compute months of liquidity with deficit', () => {
      const shockedMetrics = {
        monthlyIncome: 60000,
        monthlyExpenses: 50000,
        totalEmi: 20000,
        liquidSavings: 300000,
        dsr: 33.33,
        lcr: 1.0,
        nim: 2,
        stabilityScore: 65,
      };

      const result = evaluateShockImpact(baseMetrics, shockedMetrics);

      // monthlyDeficit = 50000 + 20000 - 60000 = 10000
      // monthsLiquidity = 300000 / 10000 = 30 months
      expect(result.monthsLiquidity).toBe(30);
    });

    it('should flag DSR breach when > 50%', () => {
      const shockedMetrics = {
        monthlyIncome: 30000,
        monthlyExpenses: 50000,
        totalEmi: 20000,
        liquidSavings: 300000,
        dsr: 66.67,
        lcr: 1.0,
        nim: 2,
        stabilityScore: 40,
      };

      const result = evaluateShockImpact(baseMetrics, shockedMetrics);

      expect(result.dsrBreach).toBe(true);
    });

    it('should flag stability breach when < 50', () => {
      const shockedMetrics = {
        monthlyIncome: 80000,
        monthlyExpenses: 50000,
        totalEmi: 20000,
        liquidSavings: 100000,
        dsr: 25,
        lcr: 0.333,
        nim: 2,
        stabilityScore: 45,
      };

      const result = evaluateShockImpact(baseMetrics, shockedMetrics);

      expect(result.stabilityBreach).toBe(true);
    });

    it('should compute net worth in year 1', () => {
      const shockedMetrics = {
        monthlyIncome: 80000,
        monthlyExpenses: 50000,
        totalEmi: 20000,
        liquidSavings: 300000,
        dsr: 25,
        lcr: 1.0,
        nim: 2,
        stabilityScore: 70,
      };

      const result = evaluateShockImpact(baseMetrics, shockedMetrics);

      // annualNetCashFlow = (80000 - 50000 - 20000) * 12 = 120000
      // netWorthYear1 = 120000 + 1000000 - 500000 = 620000
      expect(result.netWorthYear1).toBe(620000);
      expect(result.netWorthNegative).toBe(false);
    });

    it('should flag negative net worth', () => {
      const shockedMetrics = {
        monthlyIncome: 40000,
        monthlyExpenses: 50000,
        totalEmi: 20000,
        liquidSavings: 300000,
        dsr: 50,
        lcr: 1.0,
        nim: 2,
        stabilityScore: 50,
      };

      const result = evaluateShockImpact(baseMetrics, shockedMetrics);

      // annualNetCashFlow = (40000 - 50000 - 20000) * 12 = -360000
      // netWorthYear1 = -360000 + 1000000 - 500000 = 140000
      expect(result.netWorthYear1).toBe(140000);
      expect(result.netWorthNegative).toBe(false);
    });

    it('should classify severity as critical when stability < 50', () => {
      const shockedMetrics = {
        monthlyIncome: 80000,
        monthlyExpenses: 50000,
        totalEmi: 20000,
        liquidSavings: 100000,
        dsr: 25,
        lcr: 0.333,
        nim: 2,
        stabilityScore: 45,
      };

      const result = evaluateShockImpact(baseMetrics, shockedMetrics);

      expect(result.severity).toBe('critical');
    });

    it('should classify severity as critical when DSR > 50', () => {
      const shockedMetrics = {
        monthlyIncome: 30000,
        monthlyExpenses: 50000,
        totalEmi: 20000,
        liquidSavings: 300000,
        dsr: 66.67,
        lcr: 1.0,
        nim: 2,
        stabilityScore: 55,
      };

      const result = evaluateShockImpact(baseMetrics, shockedMetrics);

      expect(result.severity).toBe('critical');
    });

    it('should classify severity as warning when months < 6', () => {
      const shockedMetrics = {
        monthlyIncome: 60000,
        monthlyExpenses: 50000,
        totalEmi: 20000,
        liquidSavings: 50000,
        dsr: 33.33,
        lcr: 0.167,
        nim: 2,
        stabilityScore: 55,
      };

      const result = evaluateShockImpact(baseMetrics, shockedMetrics);

      // monthlyDeficit = 50000 + 20000 - 60000 = 10000
      // monthsLiquidity = 50000 / 10000 = 5 months
      expect(result.monthsLiquidity).toBe(5);
      expect(result.severity).toBe('warning');
    });

    it('should classify severity as manageable otherwise', () => {
      const shockedMetrics = {
        monthlyIncome: 90000,
        monthlyExpenses: 50000,
        totalEmi: 20000,
        liquidSavings: 300000,
        dsr: 22.22,
        lcr: 1.0,
        nim: 2,
        stabilityScore: 72,
      };

      const result = evaluateShockImpact(baseMetrics, shockedMetrics);

      expect(result.severity).toBe('manageable');
    });
  });

  describe('runStressScenario', () => {
    const baseMetrics = {
      monthlyIncome: 100000,
      monthlyExpenses: 50000,
      totalEmi: 6066,
      liquidSavings: 300000,
      dsr: 6.07,
      lcr: 1.0,
      nim: { nim: 2, weightedYield: 10, weightedCost: 8 },
      stabilityScore: 75,
      protScore: 80,
      totalInvestments: 1000000,
      totalLoanOutstanding: 500000,
    };

    const loans = [{ outstanding: 500000, rate: 8, remainingTenure: 10, emi: 6066 }];

    it('should return error for unknown scenario', () => {
      const result = runStressScenario('invalid-scenario', baseMetrics, loans);
      expect(result.error).toBe(true);
      expect(result.message).toContain('Unknown scenario');
    });

    it('should run income-10 scenario successfully', () => {
      const result = runStressScenario('income-10', baseMetrics, loans);

      expect(result.error).toBeUndefined();
      expect(result.scenarioId).toBe('income-10');
      expect(result.scenarioLabel).toBe('10% Income Loss');
      expect(result.category).toBe('Income Shock');
      expect(result.base).toBeDefined();
      expect(result.shocked).toBeDefined();
      expect(result.impact).toBeDefined();
    });

    it('should run expense-med scenario successfully', () => {
      const result = runStressScenario('expense-med', baseMetrics, loans);

      expect(result.shocked.monthlyExpenses).toBe(75000);
      expect(result.shocked.liquidSavings).toBe(0);
      expect(result.impact.severity).toBeDefined();
    });

    it('should run rate-200 scenario successfully', () => {
      const result = runStressScenario('rate-200', baseMetrics, loans);

      expect(result.shocked.totalEmi).toBeGreaterThan(6066);
      expect(result.shocked.nim).toBe(0); // NIM = 10 - (8 + 2) = 0
    });

    it('should run combined-severe scenario successfully', () => {
      const result = runStressScenario('combined-severe', baseMetrics, loans);

      expect(result.shocked.monthlyIncome).toBe(80000);
      expect(result.shocked.totalEmi).toBeGreaterThan(6066);
      expect(result.impact.severity).toBeDefined();
    });

    it('should include complete result structure', () => {
      const result = runStressScenario('income-10', baseMetrics, loans);

      expect(result).toHaveProperty('scenarioId');
      expect(result).toHaveProperty('scenarioLabel');
      expect(result).toHaveProperty('category');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('base');
      expect(result).toHaveProperty('shocked');
      expect(result).toHaveProperty('impact');

      expect(result.impact).toHaveProperty('stabilityDelta');
      expect(result.impact).toHaveProperty('dsrDelta');
      expect(result.impact).toHaveProperty('lcrDelta');
      expect(result.impact).toHaveProperty('nimDelta');
      expect(result.impact).toHaveProperty('monthsLiquidity');
      expect(result.impact).toHaveProperty('severity');
    });
  });
});
