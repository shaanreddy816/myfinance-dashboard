/**
 * Historical Financial Data Service
 * Provides 20 years of historical data for modeling
 */

class HistoricalDataService {
    constructor() {
        // Historical data (2005-2025) - India
        this.indiaData = {
            equityReturns: [40.5, 46.7, 54.8, -52.5, 81.0, 18.0, -24.6, 10.5, 9.0, 31.4, 
                           -4.1, 29.0, 3.0, 28.6, -4.0, 14.9, 12.1, 18.1, 14.4, 15.8],
            bondYields: [7.2, 7.8, 7.9, 7.1, 7.2, 8.0, 8.2, 8.4, 8.8, 7.8,
                        7.6, 7.4, 7.8, 7.4, 6.8, 6.2, 6.5, 7.2, 7.1, 7.0],
            goldReturns: [8.5, 22.6, 31.5, 10.5, 18.4, 20.3, 29.6, 31.6, -5.4, -10.4,
                         -1.5, 8.7, 10.8, 5.5, 10.2, 12.6, -1.2, 8.4, 9.2, 11.5],
            inflation: [4.2, 6.2, 6.4, 8.3, 10.9, 12.1, 8.9, 9.3, 10.9, 11.0,
                       9.5, 6.4, 5.9, 4.9, 4.5, 3.3, 6.2, 5.5, 6.7, 5.4],
            medicalInflation: [8.5, 10.2, 11.5, 12.8, 14.2, 15.5, 13.8, 14.5, 15.2, 16.0,
                              14.8, 12.5, 11.8, 10.5, 9.8, 8.5, 11.2, 10.8, 12.5, 11.2],
            mortgageRates: [8.5, 9.0, 9.5, 8.0, 7.5, 8.5, 9.5, 10.0, 10.5, 10.0,
                           9.5, 9.0, 8.5, 8.0, 7.5, 7.0, 6.5, 7.0, 7.5, 8.0],
            recessionYears: [2008, 2020], // Global financial crisis, COVID
            gdpGrowth: [9.3, 9.8, 9.1, 3.1, 8.5, 10.3, 5.2, 6.4, 6.4, 7.4,
                       6.4, 8.0, 7.4, 8.2, 4.2, -6.6, 8.9, 7.2, 7.8, 6.5]
        };

        // Historical data (2005-2025) - USA
        this.usaData = {
            equityReturns: [4.9, 15.8, 5.5, -37.0, 26.5, 15.1, 2.1, 16.0, 32.4, 13.7,
                           1.4, 12.0, 21.8, -4.4, 31.5, 18.4, -18.1, 28.7, 10.9, 23.4],
            bondYields: [4.3, 4.8, 4.6, 3.7, 3.2, 3.2, 1.8, 1.8, 2.1, 2.1,
                        2.4, 2.3, 2.9, 2.7, 1.9, 0.9, 1.5, 2.9, 3.9, 4.2],
            goldReturns: [18.2, 22.8, 31.1, 5.5, 23.9, 29.5, 10.2, -28.0, -1.5, 8.1,
                         -10.4, 13.1, 8.6, 13.5, 18.9, 24.4, -3.6, 7.5, 0.4, 13.2],
            inflation: [3.4, 3.2, 2.8, 3.8, -0.4, 1.6, 3.2, 2.1, 1.5, 1.6,
                       0.1, 1.3, 2.1, 2.4, 1.8, 1.2, 4.7, 8.0, 4.1, 3.4],
            medicalInflation: [6.5, 7.2, 7.8, 8.5, 6.2, 5.8, 6.5, 7.2, 7.8, 8.2,
                              7.5, 6.8, 7.2, 7.5, 6.8, 6.2, 8.5, 9.2, 8.5, 7.8],
            mortgageRates: [5.9, 6.4, 6.3, 6.0, 5.0, 4.7, 3.7, 3.5, 3.9, 4.2,
                           3.6, 4.0, 4.5, 4.9, 3.9, 3.1, 3.0, 5.3, 6.8, 6.9],
            recessionYears: [2008, 2020],
            gdpGrowth: [3.5, 2.9, 1.9, -0.1, -2.5, 2.6, 1.6, 2.2, 2.3, 2.9,
                       2.3, 1.7, 2.4, 2.9, 2.3, -3.4, 5.9, 2.1, 1.9, 2.5]
        };
    }

    async load(country = 'India') {
        const data = country === 'USA' ? this.usaData : this.indiaData;
        
        return {
            ...data,
            stats: this.calculateStatistics(data),
            correlations: this.calculateCorrelations(data)
        };
    }

    calculateStatistics(data) {
        return {
            equity: {
                mean: this.mean(data.equityReturns),
                std: this.standardDeviation(data.equityReturns),
                cagr: this.cagr(data.equityReturns)
            },
            bonds: {
                mean: this.mean(data.bondYields),
                std: this.standardDeviation(data.bondYields)
            },
            gold: {
                mean: this.mean(data.goldReturns),
                std: this.standardDeviation(data.goldReturns),
                cagr: this.cagr(data.goldReturns)
            },
            inflation: {
                mean: this.mean(data.inflation),
                std: this.standardDeviation(data.inflation)
            }
        };
    }

    mean(arr) {
        return arr.reduce((a, b) => a + b, 0) / arr.length;
    }

    standardDeviation(arr) {
        const avg = this.mean(arr);
        const squareDiffs = arr.map(value => Math.pow(value - avg, 2));
        return Math.sqrt(this.mean(squareDiffs));
    }

    cagr(returns) {
        const totalReturn = returns.reduce((acc, r) => acc * (1 + r / 100), 1);
        return (Math.pow(totalReturn, 1 / returns.length) - 1) * 100;
    }

    calculateCorrelations(data) {
        return {
            equityBonds: this.correlation(data.equityReturns, data.bondYields),
            equityGold: this.correlation(data.equityReturns, data.goldReturns),
            bondsGold: this.correlation(data.bondYields, data.goldReturns)
        };
    }

    correlation(x, y) {
        const n = x.length;
        const sum_x = x.reduce((a, b) => a + b);
        const sum_y = y.reduce((a, b) => a + b);
        const sum_xy = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sum_x2 = x.reduce((sum, xi) => sum + xi * xi, 0);
        const sum_y2 = y.reduce((sum, yi) => sum + yi * yi, 0);
        
        return (n * sum_xy - sum_x * sum_y) / 
               Math.sqrt((n * sum_x2 - sum_x * sum_x) * (n * sum_y2 - sum_y * sum_y));
    }
}

export default new HistoricalDataService();
