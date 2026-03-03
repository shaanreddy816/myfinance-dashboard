import { describe, it, expect } from 'vitest';
import {
  computeHouseholdNIM,
  computeDSR,
  computeLCR,
  computeProtectionAdequacy,
  computeStabilityScore,
} from './riskEngine.js';

describe('Risk Engine', () => {
  describe('computeHouseholdNIM', () => {
    it('should return 0 NIM when no investments or loans', () => {
      const result = computeHouseholdNIM(
        { equityItems: [], debtItems: [] },
        [],
        { equityReturn: 12, debtReturn: 7 }
      );
      expect(result.nim).toBe(0);
      expect(result.weightedYield).toBe(0);
      expect(result.weightedCost).toBe(0);
      expect(result.rag).toBe('yellow');
    });

    it('should compute positive NIM when investments yield > loan cost', () => {
      const investments = {
        equityItems: [{ value: 100000 }],
        debtItems: [{ value: 50000 }],
      };
      const loans = [{ outstanding: 200000, rate: 8 }];
      const assumptions = { equityReturn: 12, debtReturn: 7 };

      const result = computeHouseholdNIM(investments, loans, assumptions);

      // Weighted yield = (100000*12 + 50000*7) / 150000 = 10.33%
      // Weighted cost = 8%
      // NIM = 10.33 - 8 = 2.33%
      expect(result.nim).toBeCloseTo(2.33, 1);
      expect(result.rag).toBe('green');
    });

    it('should compute negative NIM when loan cost > investment yield', () => {
      const investments = {
        equityItems: [{ value: 50000 }],
        debtItems: [],
      };
      const loans = [{ outstanding: 500000, rate: 14 }];
      const assumptions = { equityReturn: 10, debtReturn: 7 };

      const result = computeHouseholdNIM(investments, loans, assumptions);

      // Weighted yield = 10%
      // Weighted cost = 14%
      // NIM = 10 - 14 = -4%
      expect(result.nim).toBe(-4);
      expect(result.rag).toBe('red');
    });

    it('should classify NIM as yellow when 0% ≤ NIM < 2%', () => {
      const investments = {
        equityItems: [{ value: 100000 }],
        debtItems: [],
      };
      const loans = [{ outstanding: 100000, rate: 11 }];
      const assumptions = { equityReturn: 12, debtReturn: 7 };

      const result = computeHouseholdNIM(investments, loans, assumptions);

      // NIM = 12 - 11 = 1%
      expect(result.nim).toBe(1);
      expect(result.rag).toBe('yellow');
    });

    it('should handle multiple loans with different rates', () => {
      const investments = {
        equityItems: [{ value: 200000 }],
        debtItems: [],
      };
      const loans = [
        { outstanding: 100000, rate: 8 },
        { outstanding: 200000, rate: 12 },
      ];
      const assumptions = { equityReturn: 15, debtReturn: 7 };

      const result = computeHouseholdNIM(investments, loans, assumptions);

      // Weighted cost = (100000*8 + 200000*12) / 300000 = 10.67%
      // NIM = 15 - 10.67 = 4.33%
      expect(result.weightedCost).toBeCloseTo(10.67, 1);
      expect(result.nim).toBeCloseTo(4.33, 1);
      expect(result.rag).toBe('green');
    });
  });

  describe('computeDSR', () => {
    it('should return 0 DSR when no EMI and no income', () => {
      const result = computeDSR(0, 0);
      expect(result.dsr).toBe(0);
      expect(result.rag).toBe('green');
    });

    it('should return 100 DSR when EMI exists but no income', () => {
      const result = computeDSR(25000, 0);
      expect(result.dsr).toBe(100);
      expect(result.rag).toBe('red');
    });

    it('should compute DSR correctly with income and EMI', () => {
      const result = computeDSR(30000, 100000);
      // DSR = (30000 / 100000) * 100 = 30%
      expect(result.dsr).toBe(30);
      expect(result.rag).toBe('green');
    });

    it('should classify DSR as green when ≤ 35%', () => {
      const result = computeDSR(35000, 100000);
      expect(result.dsr).toBe(35);
      expect(result.rag).toBe('green');
    });

    it('should classify DSR as yellow when > 35% and ≤ 50%', () => {
      const result = computeDSR(45000, 100000);
      expect(result.dsr).toBe(45);
      expect(result.rag).toBe('yellow');
    });

    it('should classify DSR as red when > 50%', () => {
      const result = computeDSR(60000, 100000);
      expect(result.dsr).toBe(60);
      expect(result.rag).toBe('red');
    });

    it('should handle edge case at 50% boundary', () => {
      const result = computeDSR(50000, 100000);
      expect(result.dsr).toBe(50);
      expect(result.rag).toBe('yellow');
    });
  });

  describe('computeLCR', () => {
    it('should return 0 LCR when no liquid savings and no expenses', () => {
      const result = computeLCR(0, 0, 0);
      expect(result.lcr).toBe(0);
      expect(result.monthsCoverage).toBe(0);
      expect(result.rag).toBe('red');
    });

    it('should return 1.0 LCR when liquid savings exist but no expenses', () => {
      const result = computeLCR(100000, 0, 0);
      expect(result.lcr).toBe(1.0);
      expect(result.monthsCoverage).toBe(1.0);
      expect(result.rag).toBe('green');
    });

    it('should compute LCR correctly with 6-month emergency fund', () => {
      const result = computeLCR(300000, 50000, 0);
      // LCR = 300000 / (50000 * 6) = 1.0
      expect(result.lcr).toBe(1.0);
      expect(result.rag).toBe('green');
    });

    it('should compute monthsCoverage including EMI', () => {
      const result = computeLCR(300000, 40000, 10000);
      // monthsCoverage = 300000 / (40000 + 10000) = 6 months
      expect(result.monthsCoverage).toBe(6);
    });

    it('should classify LCR as green when ≥ 1.0', () => {
      const result = computeLCR(400000, 50000, 0);
      // LCR = 400000 / 300000 = 1.33
      expect(result.lcr).toBeCloseTo(1.33, 2);
      expect(result.rag).toBe('green');
    });

    it('should classify LCR as yellow when ≥ 0.5 and < 1.0', () => {
      const result = computeLCR(200000, 50000, 0);
      // LCR = 200000 / 300000 = 0.67
      expect(result.lcr).toBeCloseTo(0.67, 2);
      expect(result.rag).toBe('yellow');
    });

    it('should classify LCR as red when < 0.5', () => {
      const result = computeLCR(100000, 50000, 0);
      // LCR = 100000 / 300000 = 0.33
      expect(result.lcr).toBeCloseTo(0.33, 2);
      expect(result.rag).toBe('red');
    });

    it('should handle edge case at 0.5 boundary', () => {
      const result = computeLCR(150000, 50000, 0);
      // LCR = 150000 / 300000 = 0.5
      expect(result.lcr).toBe(0.5);
      expect(result.rag).toBe('yellow');
    });
  });

  describe('computeProtectionAdequacy', () => {
    it('should return 1.0 term adequacy when no income', () => {
      const result = computeProtectionAdequacy(0, 0, 0, 2, 10);
      expect(result.termAdequacy).toBe(1.0);
      expect(result.termBenchmark).toBe(0);
    });

    it('should compute term adequacy correctly', () => {
      const result = computeProtectionAdequacy(7200000, 0, 50000, 2, 10);
      // termBenchmark = 50000 * 12 * 12 = 7,200,000
      // termAdequacy = 7200000 / 7200000 = 1.0
      expect(result.termBenchmark).toBe(7200000);
      expect(result.termAdequacy).toBe(1.0);
    });

    it('should compute health adequacy with medical inflation', () => {
      const result = computeProtectionAdequacy(0, 2000000, 50000, 2, 10);
      // healthBenchmark = (1000000 + 200000*2) * (1.1)^5 = 1400000 * 1.61051 = 2,254,714
      expect(result.healthBenchmark).toBeCloseTo(2254714, 0);
      expect(result.healthAdequacy).toBeCloseTo(0.887, 2);
    });

    it('should compute overall protection ratio', () => {
      const result = computeProtectionAdequacy(7200000, 2000000, 50000, 2, 10);
      // termAdequacy = 1.0
      // healthAdequacy ≈ 0.887
      // ratio = (1.0 + 0.887) / 2 ≈ 0.944
      expect(result.ratio).toBeCloseTo(0.944, 2);
      expect(result.rag).toBe('green');
    });

    it('should classify protection as green when ratio ≥ 0.8', () => {
      const result = computeProtectionAdequacy(6000000, 2000000, 50000, 2, 10);
      expect(result.ratio).toBeGreaterThanOrEqual(0.8);
      expect(result.rag).toBe('green');
    });

    it('should classify protection as yellow when 0.5 ≤ ratio < 0.8', () => {
      const result = computeProtectionAdequacy(3600000, 1000000, 50000, 2, 10);
      // termAdequacy = 3600000 / 7200000 = 0.5
      // healthAdequacy ≈ 0.44
      // ratio ≈ 0.47
      expect(result.ratio).toBeCloseTo(0.47, 1);
      expect(result.rag).toBe('red');
    });

    it('should classify protection as red when ratio < 0.5', () => {
      const result = computeProtectionAdequacy(1000000, 500000, 50000, 2, 10);
      expect(result.ratio).toBeLessThan(0.5);
      expect(result.rag).toBe('red');
    });

    it('should scale health benchmark with dependent count', () => {
      const result1 = computeProtectionAdequacy(0, 0, 50000, 0, 10);
      const result2 = computeProtectionAdequacy(0, 0, 50000, 3, 10);

      // healthBenchmark increases by 200000 per dependent
      expect(result2.healthBenchmark).toBeGreaterThan(result1.healthBenchmark);
      const diff = result2.healthBenchmark - result1.healthBenchmark;
      expect(diff).toBeCloseTo(600000 * Math.pow(1.1, 5), 0);
    });
  });

  describe('computeStabilityScore', () => {
    it('should compute composite score with correct weights', () => {
      const nimData = { nim: 2, rag: 'green' };
      const dsrData = { dsr: 30, rag: 'green' };
      const lcrData = { lcr: 1.0, rag: 'green' };
      const protData = { ratio: 0.9, rag: 'green' };

      const result = computeStabilityScore(nimData, dsrData, lcrData, protData);

      // nimScore = 50 + 2*25 = 100
      // dsrScore = 100 - 30*2 = 40
      // lcrScore = 1.0*100 = 100
      // protScore = 0.9*100 = 90
      // score = 40*0.3 + 100*0.25 + 100*0.2 + 90*0.25 = 12 + 25 + 20 + 22.5 = 79.5 → 80
      expect(result.nimScore).toBe(100);
      expect(result.dsrScore).toBe(40);
      expect(result.lcrScore).toBe(100);
      expect(result.protScore).toBe(90);
      expect(result.score).toBe(80);
      expect(result.rag).toBe('green');
    });

    it('should identify top risk as lowest scoring metric', () => {
      const nimData = { nim: 2, rag: 'green' };
      const dsrData = { dsr: 60, rag: 'red' }; // dsrScore = 100 - 60*2 = -20 → 0
      const lcrData = { lcr: 1.0, rag: 'green' };
      const protData = { ratio: 0.9, rag: 'green' };

      const result = computeStabilityScore(nimData, dsrData, lcrData, protData);

      expect(result.topRisk).toBe('dsr');
      expect(result.suggestion).toContain('reducing EMI burden');
    });

    it('should provide LCR suggestion when liquidity is lowest', () => {
      const nimData = { nim: 3, rag: 'green' };
      const dsrData = { dsr: 20, rag: 'green' };
      const lcrData = { lcr: 0.3, rag: 'red' }; // lcrScore = 30
      const protData = { ratio: 0.9, rag: 'green' };

      const result = computeStabilityScore(nimData, dsrData, lcrData, protData);

      expect(result.topRisk).toBe('lcr');
      expect(result.suggestion).toContain('emergency fund');
    });

    it('should provide NIM suggestion when borrowing costs are high', () => {
      const nimData = { nim: -3, rag: 'red' }; // nimScore = 50 + (-3)*25 = -25 → 0
      const dsrData = { dsr: 30, rag: 'green' };
      const lcrData = { lcr: 1.0, rag: 'green' };
      const protData = { ratio: 0.9, rag: 'green' };

      const result = computeStabilityScore(nimData, dsrData, lcrData, protData);

      expect(result.topRisk).toBe('nim');
      expect(result.suggestion).toContain('borrowing costs exceed investment returns');
    });

    it('should provide protection suggestion when insurance is low', () => {
      const nimData = { nim: 2, rag: 'green' };
      const dsrData = { dsr: 30, rag: 'green' };
      const lcrData = { lcr: 1.0, rag: 'green' };
      const protData = { ratio: 0.2, rag: 'red' }; // protScore = 20

      const result = computeStabilityScore(nimData, dsrData, lcrData, protData);

      expect(result.topRisk).toBe('protection');
      expect(result.suggestion).toContain('insurance cover is critically low');
    });

    it('should classify score as green when ≥ 75', () => {
      const nimData = { nim: 3, rag: 'green' };
      const dsrData = { dsr: 25, rag: 'green' };
      const lcrData = { lcr: 1.2, rag: 'green' };
      const protData = { ratio: 0.95, rag: 'green' };

      const result = computeStabilityScore(nimData, dsrData, lcrData, protData);

      expect(result.score).toBeGreaterThanOrEqual(75);
      expect(result.rag).toBe('green');
    });

    it('should classify score as yellow when 50 ≤ score < 75', () => {
      const nimData = { nim: 1, rag: 'yellow' };
      const dsrData = { dsr: 40, rag: 'yellow' };
      const lcrData = { lcr: 0.7, rag: 'yellow' };
      const protData = { ratio: 0.6, rag: 'yellow' };

      const result = computeStabilityScore(nimData, dsrData, lcrData, protData);

      expect(result.score).toBeGreaterThanOrEqual(50);
      expect(result.score).toBeLessThan(75);
      expect(result.rag).toBe('yellow');
    });

    it('should classify score as red when < 50', () => {
      const nimData = { nim: -5, rag: 'red' };
      const dsrData = { dsr: 70, rag: 'red' };
      const lcrData = { lcr: 0.2, rag: 'red' };
      const protData = { ratio: 0.1, rag: 'red' };

      const result = computeStabilityScore(nimData, dsrData, lcrData, protData);

      expect(result.score).toBeLessThan(50);
      expect(result.rag).toBe('red');
    });

    it('should clamp normalized scores to 0-100 range', () => {
      const nimData = { nim: -10, rag: 'red' }; // Would be -200 without clamp
      const dsrData = { dsr: 100, rag: 'red' }; // Would be -100 without clamp
      const lcrData = { lcr: 0, rag: 'red' };
      const protData = { ratio: 0, rag: 'red' };

      const result = computeStabilityScore(nimData, dsrData, lcrData, protData);

      expect(result.nimScore).toBeGreaterThanOrEqual(0);
      expect(result.nimScore).toBeLessThanOrEqual(100);
      expect(result.dsrScore).toBeGreaterThanOrEqual(0);
      expect(result.dsrScore).toBeLessThanOrEqual(100);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });
  });
});
