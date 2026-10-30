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
 * Group transactions by day for recent Cash Flow activity with a continuous 7-day timeline
 */
export function computeDailyData(transactions = [], numDays = 7) {
  if (!transactions.length) return [];

  const dayMap = new Map();

  transactions.forEach((tx) => {
    const p = parseDateParts(tx.date);
    if (!p) return;

    const dayKey = `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;

    if (!dayMap.has(dayKey)) {
      dayMap.set(dayKey, {
        income: 0,
        expense: 0,
        dateObj: p.dateObj,
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
  });

  // Determine latest date to anchor the continuous daily timeline
  const sortedKeys = Array.from(dayMap.keys()).sort();
  if (sortedKeys.length === 0) return [];

  const lastKey = sortedKeys[sortedKeys.length - 1];
  const pLast = parseDateParts(lastKey);
  const endDate = pLast ? pLast.dateObj : new Date();

  // Build a continuous rolling window of numDays ending on endDate
  const result = [];
  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() - i);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const key = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const existing = dayMap.get(key);

    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const fullDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const income = existing ? existing.income : 0;
    const expense = existing ? existing.expense : 0;

    result.push({
      key,
      date: key,
      month: label,
      label,
      fullDate,
      income,
      expense,
      net: Math.round((income - expense) * 100) / 100,
    });
  }

  return result;
}

/**
 * Group transactions by month for Cash Flow trend charts with a continuous 6-month timeline
 */
export function computeMonthlyData(transactions = [], numMonths = 6) {
  if (!transactions.length) return [];

  const monthMap = new Map();
  const now = new Date();

  transactions.forEach((tx) => {
    const p = parseDateParts(tx.date);
    if (!p) return;

    const monthKey = `${p.year}-${String(p.month).padStart(2, '0')}`;

    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, {
        income: 0,
        expense: 0,
        dateObj: new Date(p.year, p.month - 1, 1),
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
  });

  // Find latest month to anchor the 6-month continuous timeline
  let latestDate = now;
  if (monthMap.size > 0) {
    const sortedKeys = Array.from(monthMap.keys()).sort();
    const lastKey = sortedKeys[sortedKeys.length - 1];
    const [ly, lm] = lastKey.split('-').map(Number);
    latestDate = new Date(ly, lm - 1, 1);
  }

  // Ensure rolling numMonths up to latestDate with clean non-colliding labels
  const result = [];
  for (let i = numMonths - 1; i >= 0; i--) {
    const d = new Date(latestDate.getFullYear(), latestDate.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const existing = monthMap.get(key);

    const shortLabel = d.toLocaleDateString('en-US', { month: 'short' });
    const fullMonth = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const income = existing ? existing.income : 0;
    const expense = existing ? existing.expense : 0;

    result.push({
      key,
      month: shortLabel,
      label: shortLabel,
      fullMonth,
      income,
      expense,
      net: Math.round((income - expense) * 100) / 100,
    });
  }

  return result;
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
