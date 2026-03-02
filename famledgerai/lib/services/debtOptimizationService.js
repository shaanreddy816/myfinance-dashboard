/**
 * Debt Optimization Engine
 * Snowball vs Avalanche vs Hybrid comparison
 * Amortization schedules and interest savings
 */

function optimizeDebt(loans, extraMonthlyBudget = 0) {
  if (!loans || loans.length === 0) {
    return { strategy: 'none', message: 'No active loans. Great financial position!', loans: [] };
  }

  const activeLoansList = loans.filter(l => (l.outstanding || 0) > 0).map(l => ({
    label: l.label || 'Loan',
    outstanding: l.outstanding || 0,
    emi: l.emi || 0,
    rate: l.rate || 0,
    remainingMonths: l.remainingMonths || l.tenureMonths || 0
  }));

  if (activeLoansList.length === 0) {
    return { strategy: 'none', message: 'All loans cleared!', loans: [] };
  }

  // Snowball: smallest balance first
  const snowball = simulatePayoff([...activeLoansList].sort((a, b) => a.outstanding - b.outstanding), extraMonthlyBudget);
  // Avalanche: highest rate first
  const avalanche = simulatePayoff([...activeLoansList].sort((a, b) => b.rate - a.rate), extraMonthlyBudget);
  // Hybrid: weighted score (rate × 0.6 + inverse_balance × 0.4)
  const maxBal = Math.max(...activeLoansList.map(l => l.outstanding));
  const hybrid = simulatePayoff(
    [...activeLoansList].sort((a, b) => {
      const scoreA = a.rate * 0.6 + (1 - a.outstanding / maxBal) * 40 * 0.4;
      const scoreB = b.rate * 0.6 + (1 - b.outstanding / maxBal) * 40 * 0.4;
      return scoreB - scoreA;
    }), extraMonthlyBudget
  );

  // Find best strategy
  const strategies = [
    { name: 'Avalanche', ...avalanche },
    { name: 'Snowball', ...snowball },
    { name: 'Hybrid', ...hybrid }
  ];
  const best = strategies.reduce((a, b) => a.totalInterest < b.totalInterest ? a : b);

  // Baseline (no extra payment)
  const baseline = simulatePayoff(activeLoansList, 0);

  return {
    best_strategy: best.name,
    comparison: strategies.map(s => ({
      strategy: s.name,
      total_interest: Math.round(s.totalInterest),
      months_to_freedom: s.monthsToFreedom,
      debt_free_date: getDateFromMonths(s.monthsToFreedom),
      interest_saved_vs_baseline: Math.round(baseline.totalInterest - s.totalInterest),
      payoff_order: s.order
    })),
    optimal_extra_emi: extraMonthlyBudget > 0 ? extraMonthlyBudget :
      suggestExtraEmi(activeLoansList),
    total_outstanding: Math.round(activeLoansList.reduce((s, l) => s + l.outstanding, 0)),
    total_monthly_emi: Math.round(activeLoansList.reduce((s, l) => s + l.emi, 0))
  };
}

function simulatePayoff(sortedLoans, extraBudget) {
  const loans = sortedLoans.map(l => ({ ...l, balance: l.outstanding }));
  let totalInterest = 0;
  let month = 0;
  const maxMonths = 600; // 50 year cap
  const order = loans.map(l => l.label);

  while (loans.some(l => l.balance > 0) && month < maxMonths) {
    month++;
    let extraLeft = extraBudget;

    for (const loan of loans) {
      if (loan.balance <= 0) continue;
      const monthlyRate = loan.rate / 100 / 12;
      const interest = loan.balance * monthlyRate;
      totalInterest += interest;
      const principal = Math.min(loan.emi - interest, loan.balance);
      loan.balance = Math.max(0, loan.balance - principal);
    }

    // Apply extra payment to priority loan
    for (const loan of loans) {
      if (loan.balance <= 0 || extraLeft <= 0) continue;
      const payment = Math.min(extraLeft, loan.balance);
      loan.balance -= payment;
      extraLeft -= payment;
    }
  }

  return { totalInterest, monthsToFreedom: month, order };
}

function suggestExtraEmi(loans) {
  const totalEmi = loans.reduce((s, l) => s + l.emi, 0);
  return Math.round(totalEmi * 0.10); // Suggest 10% of total EMI as extra
}

function getDateFromMonths(months) {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
}

export { optimizeDebt };
