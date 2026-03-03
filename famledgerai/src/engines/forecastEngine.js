/**
 * Forecast Engine - 15-Year Financial Projection
 * 
 * Pure functions for calculating net worth, savings trajectory, and goal gaps
 * over a 15-year period based on user financial data and assumptions.
 */

/**
 * Calculate 15-year net worth projection
 * @param {Object} userData - User financial data
 * @param {Object} assumptions - Forecast assumptions (returns, inflation, etc.)
 * @returns {Array<Object>} - Array of yearly projections with netWorth, investments, loans
 */
export function calculateNetWorthProjection(userData, assumptions) {
  const weightedReturn = calculateWeightedReturn(userData, assumptions);
  const currentInvestments = calculateTotalInvestments(userData);
  const liquidSavings = userData.liquidSavings || 0;
  const loans = getAllLoans(userData);

  // Pre-compute loan amortization schedules
  const loanAmortizations = loans.map((loan) =>
    calculateLoanAmortization(loan, assumptions)
  );

  const projection = [];
  let investments = currentInvestments;

  for (let year = 0; year <= 15; year++) {
    // Apply investment growth (skip year 0)
    if (year > 0) {
      investments = investments * (1 + weightedReturn);
    }

    // Calculate outstanding loan balance for this year
    let loanOutstanding = 0;
    if (year === 0) {
      loanOutstanding = loans.reduce((sum, loan) => sum + (loan.outstanding || 0), 0);
    } else {
      loanOutstanding = loanAmortizations.reduce(
        (sum, amort) => sum + (amort.yearEndBalances[year - 1] || 0),
        0
      );
    }

    const netWorth = investments + liquidSavings - loanOutstanding;

    projection.push({
      year,
      investments,
      loanOutstanding,
      liquidSavings,
      netWorth,
    });
  }

  return projection;
}

/**
 * Calculate 15-year savings trajectory
 * @param {Object} userData - User financial data
 * @param {Object} assumptions - Forecast assumptions
 * @returns {Array<Object>} - Array of yearly savings with income, expenses, EMIs, corpus
 */
export function calculateSavingsTrajectory(userData, assumptions) {
  const weightedReturn = calculateWeightedReturn(userData, assumptions);
  const baseIncome = calculateAnnualIncome(userData);
  const baseExpenses = calculateAnnualExpenses(userData);
  const loans = getAllLoans(userData);

  // Pre-compute loan amortization to know when EMIs stop
  const loanAmortizations = loans.map((loan) => ({
    emi: loan.emi || 0,
    amort: calculateLoanAmortization(loan, assumptions),
  }));

  const trajectory = [];
  let cumulativeCorpus =
    calculateTotalInvestments(userData) + (userData.liquidSavings || 0);

  for (let year = 0; year <= 15; year++) {
    // Project income and expenses with growth/inflation
    const income = baseIncome * Math.pow(1 + assumptions.incomeGrowth / 100, year);
    const expenses = baseExpenses * Math.pow(1 + assumptions.expenseInflation / 100, year);

    // Calculate active EMIs (stop after loan payoff)
    let emis = 0;
    for (const la of loanAmortizations) {
      const payoffYear = Math.ceil(la.amort.payoffMonth / 12);
      if (year < payoffYear) {
        emis += la.emi * 12;
      }
    }

    const netSavings = income - expenses - emis;

    // Update corpus (skip compounding for year 0)
    if (year > 0) {
      cumulativeCorpus = (cumulativeCorpus + netSavings) * (1 + weightedReturn);
    }

    trajectory.push({
      year,
      income,
      expenses,
      emis,
      netSavings,
      cumulativeCorpus,
    });
  }

  return trajectory;
}

/**
 * Calculate goal gaps (difference between target and projected corpus)
 * @param {Object} userData - User financial data
 * @param {Object} assumptions - Forecast assumptions
 * @param {Array} savingsTrajectory - Output from calculateSavingsTrajectory
 * @returns {Array<Object>} - Array of goal gaps with target, projected, gap
 */
export function calculateGoalGaps(userData, assumptions, savingsTrajectory) {
  const goals = userData.profile?.goals || [];
  if (!goals.length || !savingsTrajectory || !savingsTrajectory.length) {
    return [];
  }

  const age = userData.profile?.age || 30;
  const annualIncome = calculateAnnualIncome(userData);
  const expInflation = (assumptions.expenseInflation || 6) / 100;

  // Default goal definitions
  const goalDefaults = {
    retirement: { targetAmount: annualIncome * 25, targetYear: Math.max(60 - age, 5) },
    'child-education': { targetAmount: annualIncome * 5, targetYear: 18 },
    house: { targetAmount: annualIncome * 8, targetYear: 5 },
    car: { targetAmount: annualIncome * 1, targetYear: 3 },
    emergency: { targetAmount: annualIncome * 0.5, targetYear: 1 },
    travel: { targetAmount: annualIncome * 0.5, targetYear: 2 },
    wealth: { targetAmount: annualIncome * 15, targetYear: 15 },
    'india-return': { targetAmount: annualIncome * 10, targetYear: 10 },
  };

  return goals.map((goalKey) => {
    const def = goalDefaults[goalKey] || {
      targetAmount: annualIncome * 5,
      targetYear: 10,
    };
    const targetYear = Math.min(def.targetYear, 15); // Cap at 15 years

    // Inflate target amount to future value
    const inflatedTarget = def.targetAmount * Math.pow(1 + expInflation, targetYear);

    // Get projected corpus at target year
    const projectedCorpus = savingsTrajectory[targetYear]?.cumulativeCorpus || 0;

    // Calculate gap
    const gap = inflatedTarget - projectedCorpus;

    return {
      goal: goalKey,
      targetYear,
      targetAmount: inflatedTarget,
      projectedCorpus,
      gap,
      gapPercentage: inflatedTarget > 0 ? (gap / inflatedTarget) * 100 : 0,
    };
  });
}

// ========== HELPER FUNCTIONS ==========

/**
 * Calculate weighted return rate based on asset allocation
 * @param {Object} userData - User financial data
 * @param {Object} assumptions - Forecast assumptions
 * @returns {number} - Weighted return rate (decimal, e.g., 0.10 for 10%)
 */
export function calculateWeightedReturn(userData, assumptions) {
  const investments = userData.investments?.byMember || {};
  let totalValue = 0;
  let weightedSum = 0;

  // Iterate through all members and their investments
  for (const memberInvestments of Object.values(investments)) {
    // Equity investments (mutual funds, stocks)
    const equityValue =
      [...(memberInvestments.mutualFunds || []), ...(memberInvestments.stocks || [])].reduce(
        (sum, inv) => sum + (inv.value || 0),
        0
      );

    // Debt investments (FD, PPF)
    const debtValue = [...(memberInvestments.fd || []), ...(memberInvestments.ppf || [])].reduce(
      (sum, inv) => sum + (inv.value || 0),
      0
    );

    totalValue += equityValue + debtValue;
    weightedSum += equityValue * (assumptions.equityReturn / 100);
    weightedSum += debtValue * (assumptions.debtReturn / 100);
  }

  return totalValue > 0 ? weightedSum / totalValue : assumptions.equityReturn / 100;
}

/**
 * Calculate total investments across all members
 * @param {Object} userData - User financial data
 * @returns {number} - Total investment value
 */
export function calculateTotalInvestments(userData) {
  const investments = userData.investments?.byMember || {};
  let total = 0;

  for (const memberInvestments of Object.values(investments)) {
    total += [
      ...(memberInvestments.mutualFunds || []),
      ...(memberInvestments.stocks || []),
      ...(memberInvestments.fd || []),
      ...(memberInvestments.ppf || []),
    ].reduce((sum, inv) => sum + (inv.value || 0), 0);
  }

  return total;
}

/**
 * Calculate annual income
 * @param {Object} userData - User financial data
 * @returns {number} - Annual income
 */
export function calculateAnnualIncome(userData) {
  const income = userData.income || {};
  return ((income.husband || 0) + (income.wife || 0) + (income.rental || 0)) * 12;
}

/**
 * Calculate annual expenses
 * @param {Object} userData - User financial data
 * @returns {number} - Annual expenses
 */
export function calculateAnnualExpenses(userData) {
  const expenses = userData.expenses?.byMonth || {};
  let monthlyTotal = 0;

  for (const monthData of Object.values(expenses)) {
    for (const memberExpenses of Object.values(monthData.byMember || {})) {
      monthlyTotal += memberExpenses.reduce((sum, exp) => sum + (exp.v || exp.amount || 0), 0);
    }
  }

  // Average monthly expenses * 12
  const monthCount = Object.keys(expenses).length || 1;
  return (monthlyTotal / monthCount) * 12;
}

/**
 * Get all loans across all members
 * @param {Object} userData - User financial data
 * @returns {Array} - Array of loan objects
 */
export function getAllLoans(userData) {
  const loans = userData.loans?.byMember || {};
  return Object.values(loans).flat();
}

/**
 * Calculate loan amortization schedule
 * @param {Object} loan - Loan object with outstanding, rate, emi
 * @param {Object} assumptions - Forecast assumptions (unused but kept for consistency)
 * @returns {Object} - Amortization schedule with yearEndBalances and payoffMonth
 */
export function calculateLoanAmortization(loan, assumptions) {
  const outstanding = loan.outstanding || 0;
  const rate = (loan.rate || 0) / 100 / 12; // Monthly rate
  const emi = loan.emi || 0;

  if (outstanding === 0 || emi === 0) {
    return { yearEndBalances: Array(15).fill(0), payoffMonth: 0 };
  }

  let balance = outstanding;
  const monthlyBalances = [];
  let month = 0;

  while (balance > 0 && month < 180) {
    // Cap at 15 years
    const interest = balance * rate;
    const principal = emi - interest;
    balance = Math.max(0, balance - principal);
    monthlyBalances.push(balance);
    month++;
  }

  // Convert to year-end balances
  const yearEndBalances = [];
  for (let year = 1; year <= 15; year++) {
    const monthIndex = year * 12 - 1;
    yearEndBalances.push(monthlyBalances[monthIndex] || 0);
  }

  return {
    yearEndBalances,
    payoffMonth: month,
  };
}
