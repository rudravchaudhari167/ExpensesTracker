import { useState, useEffect, useCallback } from 'react';
import transactionService from '../services/transactionService';

const DEMO_TRANSACTIONS = [
  { id: 101, title: 'Software Internship Stipend', amount: 2500.0, type: 'INCOME', category: 'Salary', date: '2026-10-24' },
  { id: 102, title: 'Freelance UI Design Project', amount: 450.0, type: 'INCOME', category: 'Freelance', date: '2026-10-26' },
  { id: 103, title: 'Kindle Book & Matcha Latte', amount: 35.5, type: 'EXPENSE', category: 'Coffee', date: '2026-10-27' },
  { id: 104, title: 'Organic Groceries & Produce', amount: 120.0, type: 'EXPENSE', category: 'Groceries', date: '2026-10-25' },
  { id: 105, title: 'Mechanical Keyboard Switch Set', amount: 80.0, type: 'EXPENSE', category: 'Shopping', date: '2026-10-23' },
  { id: 106, title: 'High-Speed Broadband & Cloud', amount: 45.0, type: 'EXPENSE', category: 'Utilities', date: '2026-10-22' },
];

function getStoredTransactions() {
  if (typeof window === 'undefined') return DEMO_TRANSACTIONS;
  try {
    const raw =
      localStorage.getItem('spendl_transactions') ||
      localStorage.getItem('pennywise_transactions');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('Could not read saved transactions from storage:', err);
  }
  return DEMO_TRANSACTIONS;
}

function saveStoredTransactions(txs) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('spendl_transactions', JSON.stringify(txs));
  } catch (err) {
    console.warn('Could not save transactions to storage:', err);
  }
}

function calculateSummary(txList) {
  let income = 0;
  let expenses = 0;
  txList.forEach((t) => {
    const amt = Number(t.amount) || 0;
    if (t.type === 'INCOME') income += amt;
    else if (t.type === 'EXPENSE') expenses += amt;
  });
  return {
    totalIncome: income,
    totalExpenses: expenses,
    balance: income - expenses,
  };
}

export function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBackendHealthy, setIsBackendHealthy] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(() => {
    return (
      localStorage.getItem('spendl_demo_mode') === 'true' ||
      localStorage.getItem('pennywise_demo_mode') === 'true'
    );
  });
  const [currency, setCurrency] = useState(() => {
    return (
      localStorage.getItem('spendl_currency') ||
      localStorage.getItem('pennywise_currency') ||
      'USD'
    );
  });

  const handleSetCurrency = (newCurrency) => {
    setCurrency(newCurrency);
    localStorage.setItem('spendl_currency', newCurrency);
  };

  const setDemoMode = (enabled) => {
    setIsDemoMode(enabled);
    localStorage.setItem('spendl_demo_mode', enabled ? 'true' : 'false');
    if (enabled) {
      setError(null);
      const stored = getStoredTransactions();
      setTransactions(stored);
      setSummary(calculateSummary(stored));
      setIsBackendHealthy(false);
    } else {
      loadData();
    }
  };

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);

    // If demo mode is explicitly active, use showcase data from storage
    if (
      localStorage.getItem('spendl_demo_mode') === 'true' ||
      localStorage.getItem('pennywise_demo_mode') === 'true'
    ) {
      const stored = getStoredTransactions();
      setTransactions(stored);
      setSummary(calculateSummary(stored));
      setIsBackendHealthy(false);
      setLoading(false);
      return;
    }

    try {
      // Parallel fetch for transactions list and summary
      const [txList, sum] = await Promise.all([
        transactionService.getAll(),
        transactionService.getSummary(),
      ]);

      // Sort transactions descending by date, then id
      const sorted = (txList || []).sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (dateA !== dateB) return dateB - dateA;
        return (b.id || 0) - (a.id || 0);
      });

      setTransactions(sorted);
      setSummary(sum || { totalIncome: 0, totalExpenses: 0, balance: 0 });
      setIsBackendHealthy(true);
      setError(null);
    } catch (err) {
      console.warn('Backend connection failed:', err);
      const message = typeof err.message === 'string' ? err.message : String(err);
      setError(message);
      setIsBackendHealthy(false);

      // If on cloud (like Vercel) and backend cannot be reached, populate fallback demo transactions
      // so the portfolio visitor can experience the interactive dashboard
      const isCloudHost =
        typeof window !== 'undefined' &&
        window.location.hostname !== 'localhost' &&
        window.location.hostname !== '127.0.0.1';

      if (isCloudHost) {
        const stored = getStoredTransactions();
        setTransactions(stored);
        setSummary(calculateSummary(stored));
        setIsDemoMode(true);
      }
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Create transaction
  const addTransaction = async (formData) => {
    if (isDemoMode || !isBackendHealthy) {
      // Local optimistic addition in demo/fallback mode
      const newEntry = {
        id: Date.now(),
        ...formData,
        amount: Number(formData.amount),
      };
      const updated = [newEntry, ...transactions];
      setTransactions(updated);
      setSummary(calculateSummary(updated));
      saveStoredTransactions(updated);
      return newEntry;
    }

    const created = await transactionService.create(formData);
    await loadData(true);
    return created;
  };

  // Update transaction
  const updateTransaction = async (id, formData) => {
    if (isDemoMode || !isBackendHealthy) {
      const updated = transactions.map((t) =>
        t.id === id ? { ...t, ...formData, amount: Number(formData.amount) } : t
      );
      setTransactions(updated);
      setSummary(calculateSummary(updated));
      saveStoredTransactions(updated);
      return { id, ...formData };
    }

    const updated = await transactionService.update(id, formData);
    await loadData(true);
    return updated;
  };

  // Delete transaction
  const deleteTransaction = async (id) => {
    if (isDemoMode || !isBackendHealthy) {
      const updated = transactions.filter((t) => t.id !== id);
      setTransactions(updated);
      setSummary(calculateSummary(updated));
      saveStoredTransactions(updated);
      return;
    }

    await transactionService.delete(id);
    await loadData(true);
  };

  return {
    transactions,
    summary,
    loading,
    error,
    isBackendHealthy,
    isDemoMode,
    setDemoMode,
    currency,
    setCurrency: handleSetCurrency,
    refresh: loadData,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
