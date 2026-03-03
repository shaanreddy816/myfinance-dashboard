import { describe, it, expect } from 'vitest';
import {
  calculateNetWorthProjection,
  calculateSavingsTrajectory,
  calculateGoalGaps,
  calculateWeightedReturn,
  calculateTotalInvestments,
  calculateAnnualIncome,
  calculateAnnualExpenses,
  calculateLoanAmortization,
} from './forecastEngine.js';

describe('Forecast Engine', () => {
  const mockUserData = {
    profile: { age: 30, goals: ['retirement', 'house'] },
    income: { husband: 100000, wife: 80000, rental: 0 },
    expenses: {
      byMonth: {
        '2024-01': {
          byMember: {
            self: [{ v: 30000 }, { v: 10000 }],
          },
        },
      },
    },
    investments: {
      byMember: {
        self: {
          mutualFunds: [{ value: 500000 }],
          stocks: [{ value: 200000 }],
          fd: [{ value: 300000 }],
          ppf: [],
        },
      },
    },
    loans: {
      byMember: {
        self: [{ outstanding: 2000000, rate: 8.5, emi: 25000 }],
      },
    },
    liquidSavings: 500000,
  };

  const mockAssumptions = {
    incomeGrowth: 8,
    expenseInflation: 6,
    equityReturn: 12,
    debtReturn: 7,
  };

  describe('calculateNetWorthProjection', () => {
    it('should return 16 years of projections (0-15)', () => {
      const result = calculateNetWorthProjection(mockUserData, mockAssumptions);
      expect(result).toHaveLength(16);
      expect(result[0].year).toBe(0);
      expect(result[15].year).toBe(15);
    });

    it('should have correct structure for each year', () => {
      const result = calculateNetWorthProjection(mockUserData, mockAssumptions);
      const year0 = result[0];
      
      expect(year0).toHaveProperty('year');
      expect(year0).toHaveProperty('investments');
      expect(year0).toHaveProperty('loanOutstanding');
      expect(year0).toHaveProperty('liquidSavings');
      expect(year0).toHaveProperty('netWorth');
    });

    it('should calculate initial net worth correctly', () => {
      const result = calculateNetWorthProjection(mockUserData, mockAssumptions);
      const year0 = result[0];
      
      // Net worth = investments + liquid savings - loans
      // = 1,000,000 + 500,000 - 2,000,000 = -500,000
      expect(year0.netWorth).toBe(-500000);
    });

    it('should grow investments by weighted return each year', () => {
      const result = calculateNetWorthProjection(mockUserData, mockAssumptions);
      const year0Investments = result[0].investments;
      const year1Investments = result[1].investments;
      
      // Investments should grow
      expect(year1Investments).toBeGreaterThan(year0Investments);
      
      // Growth should be approximately weighted return
      const growthRate = (year1Investments - year0Investments) / year0Investments;
      expect(growthRate).toBeGreaterThan(0.07); // At least 7% (debt return)
      expect(growthRate).toBeLessThan(0.12); // At most 12% (equity return)
    });

    it('should reduce loan outstanding over time', () => {
      const result = calculateNetWorthProjection(mockUserData, mockAssumptions);
      const year0Loans = result[0].loanOutstanding;
      const year5Loans = result[5].loanOutstanding;
      const year15Loans = result[15].loanOutstanding;
      
      expect(year5Loans).toBeLessThan(year0Loans);
      expect(year15Loans).toBeLessThan(year5Loans);
    });

    it('should handle zero investments gracefully', () => {
      const zeroInvestmentData = {
        ...mockUserData,
        investments: { byMember: {} },
        liquidSavings: 0,
        loans: { byMember: {} },
      };
      
      const result = calculateNetWorthProjection(zeroInvestmentData, mockAssumptions);
      expect(result).toHaveLength(16);
      expect(result[0].netWorth).toBe(0);
      expect(result[15].netWorth).toBe(0);
    });

    it('should handle zero loans gracefully', () => {
      const zeroLoanData = {
        ...mockUserData,
        loans: { byMember: {} },
      };
      
      const result = calculateNetWorthProjection(zeroLoanData, mockAssumptions);
      expect(result).toHaveLength(16);
      expect(result[0].loanOutstanding).toBe(0);
    });
  });

  describe('calculateSavingsTrajectory', () => {
    it('should return 16 years of trajectory (0-15)', () => {
      const result = calculateSavingsTrajectory(mockUserData, mockAssumptions);
      expect(result).toHaveLength(16);
    });

    it('should have correct structure for each year', () => {
      const result = calculateSavingsTrajectory(mockUserData, mockAssumptions);
      const year0 = result[0];
      
      expect(year0).toHaveProperty('year');
      expect(year0).toHaveProperty('income');
      expect(year0).toHaveProperty('expenses');
      expect(year0).toHaveProperty('emis');
      expect(year0).toHaveProperty('netSavings');
      expect(year0).toHaveProperty('cumulativeCorpus');
    });

    it('should increase income by growth rate each year', () => {
      const result = calculateSavingsTrajectory(mockUserData, mockAssumptions);
      const year0Income = result[0].income;
      const year1Income = result[1].income;
      
      const expectedGrowth = 1.08; // 8% growth
      const actualGrowth = year1Income / year0Income;
      
      expect(actualGrowth).toBeCloseTo(expectedGrowth, 2);
    });

    it('should increase expenses by inflation each year', () => {
      const result = calculateSavingsTrajectory(mockUserData, mockAssumptions);
      const year0Expenses = result[0].expenses;
      const year1Expenses = result[1].expenses;
      
      const expectedInflation = 1.06; // 6% inflation
      const actualInflation = year1Expenses / year0Expenses;
      
      expect(actualInflation).toBeCloseTo(expectedInflation, 2);
    });

    it('should calculate net savings correctly', () => {
      const result = calculateSavingsTrajectory(mockUserData, mockAssumptions);
      const year0 = result[0];
      
      // Net savings = income - expenses - EMIs
      const expectedNetSavings = year0.income - year0.expenses - year0.emis;
      expect(year0.netSavings).toBeCloseTo(expectedNetSavings, 0);
    });

    it('should grow cumulative corpus over time', () => {
      const result = calculateSavingsTrajectory(mockUserData, mockAssumptions);
      
      // Corpus should generally increase (assuming positive net savings)
      const year0Corpus = result[0].cumulativeCorpus;
      const year15Corpus = result[15].cumulativeCorpus;
      
      expect(year15Corpus).toBeGreaterThan(year0Corpus);
    });

    it('should handle zero income gracefully', () => {
      const zeroIncomeData = {
        ...mockUserData,
        income: { husband: 0, wife: 0, rental: 0 },
      };
      
      const result = calculateSavingsTrajectory(zeroIncomeData, mockAssumptions);
      expect(result).toHaveLength(16);
      expect(result[0].income).toBe(0);
      expect(result[0].netSavings).toBeLessThan(0); // Negative due to expenses
    });
  });

  describe('calculateGoalGaps', () => {
    it('should return empty array if no goals', () => {
      const noGoalsData = { ...mockUserData, profile: { age: 30, goals: [] } };
      const trajectory = calculateSavingsTrajectory(mockUserData, mockAssumptions);
      
      const result = calculateGoalGaps(noGoalsData, mockAssumptions, trajectory);
      expect(result).toEqual([]);
    });

    it('should calculate gap for each goal', () => {
      const trajectory = calculateSavingsTrajectory(mockUserData, mockAssumptions);
      const result = calculateGoalGaps(mockUserData, mockAssumptions, trajectory);
      
      expect(result).toHaveLength(2); // retirement and house
      expect(result[0]).toHaveProperty('goal');
      expect(result[0]).toHaveProperty('targetYear');
      expect(result[0]).toHaveProperty('targetAmount');
      expect(result[0]).toHaveProperty('projectedCorpus');
      expect(result[0]).toHaveProperty('gap');
      expect(result[0]).toHaveProperty('gapPercentage');
    });

    it('should calculate retirement goal correctly', () => {
      const trajectory = calculateSavingsTrajectory(mockUserData, mockAssumptions);
      const result = calculateGoalGaps(mockUserData, mockAssumptions, trajectory);
      
      const retirementGoal = result.find((g) => g.goal === 'retirement');
      expect(retirementGoal).toBeDefined();
      expect(retirementGoal.targetYear).toBeGreaterThan(0);
      expect(retirementGoal.targetAmount).toBeGreaterThan(0);
    });

    it('should show surplus when projected > target', () => {
      // Create scenario with high income and low target
      const highIncomeData = {
        ...mockUserData,
        income: { husband: 500000, wife: 400000, rental: 0 },
        profile: { age: 30, goals: ['emergency'] }, // Small target
      };
      
      const trajectory = calculateSavingsTrajectory(highIncomeData, mockAssumptions);
      const result = calculateGoalGaps(highIncomeData, mockAssumptions, trajectory);
      
      const emergencyGoal = result.find((g) => g.goal === 'emergency');
      expect(emergencyGoal.gap).toBeLessThanOrEqual(0); // Surplus or met
    });
  });

  describe('calculateWeightedReturn', () => {
    it('should return equity return for 100% equity portfolio', () => {
      const equityOnlyData = {
        ...mockUserData,
        investments: {
          byMember: {
            self: {
              mutualFunds: [{ value: 500000 }],
              stocks: [{ value: 500000 }],
              fd: [],
              ppf: [],
            },
          },
        },
      };
      
      const result = calculateWeightedReturn(equityOnlyData, mockAssumptions);
      expect(result).toBeCloseTo(0.12, 2); // 12% equity return
    });

    it('should return debt return for 100% debt portfolio', () => {
      const debtOnlyData = {
        ...mockUserData,
        investments: {
          byMember: {
            self: {
              mutualFunds: [],
              stocks: [],
              fd: [{ value: 500000 }],
              ppf: [{ value: 500000 }],
            },
          },
        },
      };
      
      const result = calculateWeightedReturn(debtOnlyData, mockAssumptions);
      expect(result).toBeCloseTo(0.07, 2); // 7% debt return
    });

    it('should return weighted average for mixed portfolio', () => {
      const result = calculateWeightedReturn(mockUserData, mockAssumptions);
      
      // Should be between debt (7%) and equity (12%)
      expect(result).toBeGreaterThan(0.07);
      expect(result).toBeLessThan(0.12);
    });

    it('should handle empty portfolio gracefully', () => {
      const emptyData = {
        ...mockUserData,
        investments: { byMember: {} },
      };
      
      const result = calculateWeightedReturn(emptyData, mockAssumptions);
      expect(result).toBe(0.12); // Defaults to equity return
    });
  });

  describe('calculateTotalInvestments', () => {
    it('should sum all investments across all members', () => {
      const result = calculateTotalInvestments(mockUserData);
      
      // 500k (MF) + 200k (stocks) + 300k (FD) = 1,000,000
      expect(result).toBe(1000000);
    });

    it('should return 0 for empty investments', () => {
      const emptyData = {
        ...mockUserData,
        investments: { byMember: {} },
      };
      
      const result = calculateTotalInvestments(emptyData);
      expect(result).toBe(0);
    });
  });

  describe('calculateAnnualIncome', () => {
    it('should calculate annual income correctly', () => {
      const result = calculateAnnualIncome(mockUserData);
      
      // (100k + 80k) * 12 = 2,160,000
      expect(result).toBe(2160000);
    });

    it('should handle zero income', () => {
      const zeroIncomeData = {
        ...mockUserData,
        income: { husband: 0, wife: 0, rental: 0 },
      };
      
      const result = calculateAnnualIncome(zeroIncomeData);
      expect(result).toBe(0);
    });
  });

  describe('calculateAnnualExpenses', () => {
    it('should calculate annual expenses correctly', () => {
      const result = calculateAnnualExpenses(mockUserData);
      
      // (30k + 10k) * 12 = 480,000
      expect(result).toBe(480000);
    });

    it('should handle empty expenses', () => {
      const noExpensesData = {
        ...mockUserData,
        expenses: { byMonth: {} },
      };
      
      const result = calculateAnnualExpenses(noExpensesData);
      expect(result).toBe(0);
    });
  });

  describe('calculateLoanAmortization', () => {
    it('should calculate year-end balances correctly', () => {
      const loan = { outstanding: 1000000, rate: 10, emi: 13215 };
      const result = calculateLoanAmortization(loan, mockAssumptions);
      
      expect(result.yearEndBalances).toHaveLength(15);
      expect(result.yearEndBalances[0]).toBeLessThan(1000000); // Balance reduces
      expect(result.payoffMonth).toBeGreaterThan(0);
    });

    it('should handle zero outstanding gracefully', () => {
      const zeroLoan = { outstanding: 0, rate: 10, emi: 0 };
      const result = calculateLoanAmortization(zeroLoan, mockAssumptions);
      
      expect(result.yearEndBalances.every((b) => b === 0)).toBe(true);
      expect(result.payoffMonth).toBe(0);
    });

    it('should pay off loan within expected timeframe', () => {
      const loan = { outstanding: 1000000, rate: 10, emi: 20000 };
      const result = calculateLoanAmortization(loan, mockAssumptions);
      
      // Loan should be paid off before 15 years
      expect(result.payoffMonth).toBeLessThan(180);
      expect(result.yearEndBalances[14]).toBe(0); // Fully paid by year 15
    });
  });

  describe('Edge Cases and Invariants', () => {
    it('should never have NaN values in projections', () => {
      const result = calculateNetWorthProjection(mockUserData, mockAssumptions);
      
      result.forEach((year) => {
        expect(Number.isNaN(year.netWorth)).toBe(false);
        expect(Number.isNaN(year.investments)).toBe(false);
        expect(Number.isNaN(year.loanOutstanding)).toBe(false);
      });
    });

    it('should handle negative net worth gracefully', () => {
      const highDebtData = {
        ...mockUserData,
        investments: { byMember: {} },
        liquidSavings: 0,
        loans: { byMember: { self: [{ outstanding: 5000000, rate: 10, emi: 50000 }] } },
      };
      
      const result = calculateNetWorthProjection(highDebtData, mockAssumptions);
      expect(result[0].netWorth).toBeLessThan(0);
      expect(result).toHaveLength(16); // Should still return all years
    });

    it('should handle very high income gracefully', () => {
      const highIncomeData = {
        ...mockUserData,
        income: { husband: 10000000, wife: 8000000, rental: 0 },
      };
      
      const result = calculateSavingsTrajectory(highIncomeData, mockAssumptions);
      expect(result).toHaveLength(16);
      expect(result[15].cumulativeCorpus).toBeGreaterThan(0);
    });
  });
});
