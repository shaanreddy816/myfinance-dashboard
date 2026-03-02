/**
 * Smart EMI + Alert System
 * Detects financial risks and generates severity-based alerts
 */

function generateAlerts(profile) {
  const alerts = [];
  const {
    income = 0,
    expenses = 0,
    total_emi = 0,
    liquid_assets = 0,
    loans = [],
    term_cover = 0,
    health_cover = 0,
    dependents = 0,
    sip_monthly = 0,
    prev_month_expenses = 0,
    prev_month_savings_rate = 0,
    credit_utilization = 0
  } = profile;

  const savings_rate = income > 0 ? (income - expenses) / income : 0;
  const emi_ratio = income > 0 ? total_emi / income : 0;
  const months_cover = expenses > 0 ? liquid_assets / expenses : 0;

  // EMI alerts
  if (emi_ratio > 0.50) {
    alerts.push({ type: 'emi_overload', severity: 'critical', icon: '🚨',
      message: `EMI load is ${(emi_ratio * 100).toFixed(0)}% of income — well above the safe 40% limit. Consider restructuring or prepaying high-rate loans.` });
  } else if (emi_ratio > 0.40) {
    alerts.push({ type: 'emi_warning', severity: 'warning', icon: '⚠️',
      message: `EMI load at ${(emi_ratio * 100).toFixed(0)}% is at the upper limit. Avoid new debt.` });
  }

  // Low balance risk
  if (months_cover < 1) {
    alerts.push({ type: 'low_balance', severity: 'critical', icon: '🔴',
      message: `Emergency fund covers less than 1 month of expenses. Build this to 6 months urgently.` });
  } else if (months_cover < 3) {
    alerts.push({ type: 'low_emergency', severity: 'warning', icon: '🟡',
      message: `Emergency fund covers only ${months_cover.toFixed(1)} months. Target is 6 months.` });
  }

  // Overspending trend
  if (prev_month_expenses > 0 && expenses > prev_month_expenses * 1.15) {
    const increase = ((expenses - prev_month_expenses) / prev_month_expenses * 100).toFixed(0);
    alerts.push({ type: 'overspending', severity: 'warning', icon: '📈',
      message: `Spending increased ${increase}% vs last month. Review discretionary expenses.` });
  }

  // Savings drop
  if (savings_rate < 0.10) {
    alerts.push({ type: 'savings_low', severity: 'warning', icon: '💰',
      message: `Savings rate is only ${(savings_rate * 100).toFixed(0)}%. Aim for at least 20%.` });
  }

  // Insurance gap
  const requiredTerm = income * 12 * 15;
  if (term_cover < requiredTerm * 0.5) {
    alerts.push({ type: 'insurance_gap', severity: 'critical', icon: '🛡️',
      message: `Term insurance cover is significantly below the recommended 15× annual income. Current gap: ₹${((requiredTerm - term_cover) / 100000).toFixed(0)}L` });
  }
  const requiredHealth = 1000000 + (dependents * 200000);
  if (health_cover < requiredHealth * 0.5) {
    alerts.push({ type: 'health_gap', severity: 'warning', icon: '🏥',
      message: `Health insurance may be inadequate. Recommended: ₹${(requiredHealth / 100000).toFixed(0)}L for your family size.` });
  }

  // Rising debt ratio
  if (emi_ratio > 0.35 && loans.length > 2) {
    alerts.push({ type: 'debt_rising', severity: 'warning', icon: '📊',
      message: `Multiple active loans (${loans.length}) with ${(emi_ratio * 100).toFixed(0)}% EMI ratio. Consider consolidation.` });
  }

  // Credit utilization
  if (credit_utilization > 0.50) {
    alerts.push({ type: 'credit_high', severity: 'warning', icon: '💳',
      message: `Credit utilization at ${(credit_utilization * 100).toFixed(0)}% — keep below 30% for a healthy credit score.` });
  }

  // Positive alerts
  if (savings_rate >= 0.30) {
    alerts.push({ type: 'savings_great', severity: 'info', icon: '🌟',
      message: `Excellent savings rate of ${(savings_rate * 100).toFixed(0)}%! You're building wealth faster than most.` });
  }
  if (months_cover >= 6) {
    alerts.push({ type: 'emergency_solid', severity: 'info', icon: '✅',
      message: `Emergency fund covers ${months_cover.toFixed(1)} months — solid safety net.` });
  }

  // Sort: critical first, then warning, then info
  const severityOrder = { critical: 0, warning: 1, info: 2 };
  alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return { alerts, total: alerts.length, critical: alerts.filter(a => a.severity === 'critical').length };
}

export { generateAlerts };
