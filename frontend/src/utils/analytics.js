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
 * Safely parse date strings (YYYY-MM-DD) avoiding UTC timezone off-by-one shifts
 */
export function parseDateParts(dateStr) {
  if (!dateStr) return null;
  if (dateStr instanceof Date) {
    if (isNaN(dateStr.getTime())) return null;
    return {
      year: dateStr.getFullYear(),
      month: dateStr.getMonth() + 1,
      day: dateStr.getDate(),
      dateObj: dateStr,
    };
  }
  const clean = String(dateStr).split('T')[0].trim();
  const parts = clean.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      const dateObj = new Date(year, month - 1, day);
      return { year, month, day, dateObj };
    }
  }
  const fallback = new Date(dateStr);
  if (!isNaN(fallback.getTime())) {
    return {
      year: fallback.getFullYear(),
      month: fallback.getMonth() + 1,
      day: fallback.getDate(),
      dateObj: fallback,
    };
  }
  return null;
}

/**
 * Group transactions by day for recent Cash Flow activity
 */
export function computeDailyData(transactions = [], limit = 14) {
  if (!transactions.length) return [];

  const dayMap = new Map();

  transactions.forEach((tx) => {
    const p = parseDateParts(tx.date);
    if (!p) return;

    const dayKey = `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
    const dayLabel = p.dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    if (!dayMap.has(dayKey)) {
      dayMap.set(dayKey, {
        key: dayKey,
        month: dayLabel,
        label: dayLabel,
        income: 0,
        expense: 0,
        net: 0,
      });
    }

    const entry = dayMap.get(dayKey);
    const rawAmt = typeof tx.amount === 'string' ? parseFloat(tx.amount.replace(/[^0-9.-]+/g, '')) : Number(tx.amount);
    const amount = Math.abs(rawAmt) || 0;
    const typeUpper = String(tx.type || '').trim().toUpperCase();

    if (typeUpper === 'INCOME') {
      entry.income = Math.round((entry.income + amount) * 100) / 100;
    } else if (typeUpper === 'EXPENSE') {
      entry.expense = Math.round((entry.expense + amount) * 100) / 100;
    }
    entry.net = Math.round((entry.income - entry.expense) * 100) / 100;
  });

  const sorted = Array.from(dayMap.values()).sort((a, b) => a.key.localeCompare(b.key));
  return sorted.length > limit ? sorted.slice(-limit) : sorted;
}

/**
 * Group transactions by month for Cash Flow trend charts with a continuous 6-month timeline
 */
export function computeMonthlyData(transactions = []) {
  if (!transactions.length) return [];

  const monthMap = new Map();
  const now = new Date();

  transactions.forEach((tx) => {
    const p = parseDateParts(tx.date);
    if (!p) return;

    const monthKey = `${p.year}-${String(p.month).padStart(2, '0')}`;
    const monthLabel = p.dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, {
        key: monthKey,
        month: monthLabel,
        label: monthLabel,
        income: 0,
        expense: 0,
        net: 0,
      });
    }

    const entry = monthMap.get(monthKey);
    const rawAmt = typeof tx.amount === 'string' ? parseFloat(tx.amount.replace(/[^0-9.-]+/g, '')) : Number(tx.amount);
    const amount = Math.abs(rawAmt) || 0;
    const typeUpper = String(tx.type || '').trim().toUpperCase();

    if (typeUpper === 'INCOME') {
      entry.income = Math.round((entry.income + amount) * 100) / 100;
    } else if (typeUpper === 'EXPENSE') {
      entry.expense = Math.round((entry.expense + amount) * 100) / 100;
    }
    entry.net = Math.round((entry.income - entry.expense) * 100) / 100;
  });

  // If there are fewer than 4 months, pad with previous months ending at latest transaction date
  let latestDate = now;
  if (monthMap.size > 0) {
    const sortedKeys = Array.from(monthMap.keys()).sort();
    const lastKey = sortedKeys[sortedKeys.length - 1];
    const [ly, lm] = lastKey.split('-').map(Number);
    latestDate = new Date(ly, lm - 1, 1);
  }

  // Ensure a rolling 6-month timeline up to latestDate
  for (let i = 5; i >= 0; i--) {
    const d = new Date(latestDate.getFullYear(), latestDate.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!monthMap.has(key)) {
      const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthMap.set(key, { key, month: label, label, income: 0, expense: 0, net: 0 });
    }
  }

  // Sort chronologically
  return Array.from(monthMap.values()).sort((a, b) => a.key.localeCompare(b.key));
}

/**
 * Compute spending breakdown by category for Donut/Pie charts
 */
export function computeCategorySpending(transactions = []) {
  const expenseTransactions = transactions.filter(
    (t) => String(t.type || '').trim().toUpperCase() === 'EXPENSE'
  );
  if (!expenseTransactions.length) return [];

  const categoryMap = new Map();
  let totalExpenseAmount = 0;

  expenseTransactions.forEach((tx) => {
    const cat = (tx.category || 'Uncategorized').trim();
    const rawAmt = typeof tx.amount === 'string' ? parseFloat(tx.amount.replace(/[^0-9.-]+/g, '')) : Number(tx.amount);
    const amount = Math.abs(rawAmt) || 0;
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

  const expenses = transactions.filter(
    (t) => String(t.type || '').trim().toUpperCase() === 'EXPENSE'
  );
  const incomes = transactions.filter(
    (t) => String(t.type || '').trim().toUpperCase() === 'INCOME'
  );

  const totalExpense = expenses.reduce((acc, t) => {
    const rawAmt = typeof t.amount === 'string' ? parseFloat(t.amount.replace(/[^0-9.-]+/g, '')) : Number(t.amount);
    return acc + (Math.abs(rawAmt) || 0);
  }, 0);

  const totalIncome = incomes.reduce((acc, t) => {
    const rawAmt = typeof t.amount === 'string' ? parseFloat(t.amount.replace(/[^0-9.-]+/g, '')) : Number(t.amount);
    return acc + (Math.abs(rawAmt) || 0);
  }, 0);

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
