// api/_lib/deterministic.js
export function deterministicProjection({ loans, investments, profiles, goals, scenario }) {
  // This is a simplified example – expand based on your needs
  const totalLoanEmi = loans.reduce((sum, l) => sum + (l.emi || 0), 0);
  const totalLoanOutstanding = loans.reduce((sum, l) => sum + (l.outstanding || 0), 0);
  const totalInvestments = investments.reduce((sum, i) => sum + (i.value || 0), 0);
  const totalMonthlyIncome = profiles.reduce((sum, p) => sum + (p.income_monthly || 0), 0);
  const totalMonthlyExpenses = profiles.reduce((sum, p) => sum + (p.monthly_expenses || 0), 0);
  const savings = totalMonthlyIncome - totalMonthlyExpenses - totalLoanEmi;

  // Retirement projection (very basic)
  const currentAge = profiles[0]?.age || 30;
  const retirementAge = 60;
  const yearsToRetire = retirementAge - currentAge;
  const monthlyContribution = savings * 0.7; // assume 70% of surplus invested
  const expectedReturn = 0.08 / 12; // 8% annual, monthly compounding
  let retirementCorpus = totalInvestments;
  for (let y = 0; y < yearsToRetire * 12; y++) {
    retirementCorpus = retirementCorpus * (1 + expectedReturn) + monthlyContribution;
  }

  return {
    summary: {
      totalLoanEmi,
      totalLoanOutstanding,
      totalInvestments,
      monthlySavings: savings,
      yearsToRetire,
      retirementCorpus: Math.round(retirementCorpus)
    },
    details: {
      loans,
      investments,
      profiles,
      goals
    }
  };
}