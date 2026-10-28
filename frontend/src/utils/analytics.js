/**
 * Real Data Analytics Aggregation Utilities
 * Computes metrics strictly from actual backend transactions
 */

const PALETTE = [
  '#E87952', // Terracotta
  '#5B4E7E', // Lavender
  '#3E6B3B', // Sage
  '#E5A93B', // Warm amber
  '#2C5C8A', // Soft navy
  '#8A3B65', // Plum
  '#1B6A70', // Teal
  '#9B6B43', // Clay
  '#858276', // Muted stone
];

/**
 * Group transactions by month for Cash Flow trend charts
 */
export function computeMonthlyData(transactions = []) {
  if (!transactions.length) return [];

  const monthMap = new Map();

  transactions.forEach((tx) => {
    if (!tx.date) return;
    const date = new Date(tx.date);
    if (isNaN(date.getTime())) return;

    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, {
        key: monthKey,
        month: monthLabel,
        income: 0,
        expense: 0,
        net: 0,
      });
    }

    const entry = monthMap.get(monthKey);
    const amount = Number(tx.amount) || 0;
    if (tx.type === 'INCOME') {
      entry.income += amount;
    } else if (tx.type === 'EXPENSE') {
      entry.expense += amount;
    }
    entry.net = entry.income - entry.expense;
  });

  // Sort chronologically
  return Array.from(monthMap.values()).sort((a, b) => a.key.localeCompare(b.key));
}

/**
 * Compute spending breakdown by category for Donut/Pie charts
 */
export function computeCategorySpending(transactions = []) {
  const expenseTransactions = transactions.filter((t) => t.type === 'EXPENSE');
  if (!expenseTransactions.length) return [];

  const categoryMap = new Map();
  let totalExpenseAmount = 0;

  expenseTransactions.forEach((tx) => {
    const cat = (tx.category || 'Uncategorized').trim();
    const amount = Number(tx.amount) || 0;
    totalExpenseAmount += amount;
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + amount);
  });

  const categories = Array.from(categoryMap.entries())
    .map(([name, value], index) => ({
      name,
      value: Math.round(value * 100) / 100,
      percentage: totalExpenseAmount > 0 ? Math.round((value / totalExpenseAmount) * 100) : 0,
      color: PALETTE[index % PALETTE.length],
    }))
    .sort((a, b) => b.value - a.value);

  return categories;
}

/**
 * Derive genuine data-driven financial insights
 */
export function computeInsights(transactions = [], summary = {}) {
  if (!transactions || transactions.length === 0) {
    return {
      hasData: false,
      message: 'No transactions recorded yet. Add your first expense or income to unlock insights.',
      insightsList: [],
    };
  }

  const expenses = transactions.filter((t) => t.type === 'EXPENSE');
  const incomes = transactions.filter((t) => t.type === 'INCOME');

  const totalExpense = expenses.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
  const totalIncome = incomes.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  const categories = computeCategorySpending(transactions);
  const topCategory = categories[0] || null;

  // Largest single expense
  let largestExpense = null;
  if (expenses.length > 0) {
    largestExpense = [...expenses].sort((a, b) => Number(b.amount) - Number(a.amount))[0];
  }

  // Calculate real savings rate
  let savingsRate = null;
  if (totalIncome > 0) {
    const rate = ((totalIncome - totalExpense) / totalIncome) * 100;
    savingsRate = Math.round(rate);
  }

  const insightsList = [];

  if (topCategory && totalExpense > 0) {
    insightsList.push({
      type: 'category',
      title: 'Top Spending Category',
      text: `${topCategory.name} is your largest expense area, accounting for ${topCategory.percentage}% of all expenses.`,
      highlight: `${topCategory.percentage}%`,
    });
  }

  if (largestExpense) {
    insightsList.push({
      type: 'expense',
      title: 'Largest Single Expense',
      text: `Your biggest single outflow is "${largestExpense.title}" in ${largestExpense.category}.`,
      highlight: largestExpense.title,
    });
  }

  if (savingsRate !== null) {
    const isHealthy = savingsRate >= 20;
    insightsList.push({
      type: 'savings',
      title: 'Savings Rhythm',
      text: isHealthy
        ? `You have a healthy savings rate of ${savingsRate}% this period.`
        : `Your current savings rate is ${savingsRate}%. Focus on trimming non-essential expenses.`,
      highlight: `${savingsRate}%`,
    });
  } else if (totalExpense > 0 && totalIncome === 0) {
    insightsList.push({
      type: 'notice',
      title: 'Income Tracking Needed',
      text: 'You have recorded expenses without any corresponding income. Log salary or deposits to view your savings rhythm.',
      highlight: 'Add Income',
    });
  }

  return {
    hasData: true,
    totalExpense,
    totalIncome,
    count: transactions.length,
    incomeCount: incomes.length,
    expenseCount: expenses.length,
    topCategory,
    largestExpense,
    savingsRate,
    insightsList,
  };
}
