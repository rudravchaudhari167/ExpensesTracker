import { useState, useEffect, useCallback } from 'react';
import transactionService from '../services/transactionService';

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
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('pennywise_currency') || 'USD';
  });

  const handleSetCurrency = (newCurrency) => {
    setCurrency(newCurrency);
    localStorage.setItem('pennywise_currency', newCurrency);
  };

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);

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
    } catch (err) {
      console.error('Failed to load transaction data:', err);
      setError(err.message || 'Failed to connect to backend.');
      setIsBackendHealthy(false);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Create transaction
  const addTransaction = async (formData) => {
    const created = await transactionService.create(formData);
    await loadData(true);
    return created;
  };

  // Update transaction
  const updateTransaction = async (id, formData) => {
    const updated = await transactionService.update(id, formData);
    await loadData(true);
    return updated;
  };

  // Delete transaction
  const deleteTransaction = async (id) => {
    await transactionService.delete(id);
    await loadData(true);
  };

  return {
    transactions,
    summary,
    loading,
    error,
    isBackendHealthy,
    currency,
    setCurrency: handleSetCurrency,
    refresh: loadData,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
