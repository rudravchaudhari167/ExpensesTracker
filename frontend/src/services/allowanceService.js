import { api } from './api';

const STORAGE_ACTIVE_CYCLE_KEY = 'spendl_survival_active_cycle';
const STORAGE_HISTORY_KEY = 'spendl_survival_history';
const STORAGE_EVENTS_KEY = 'spendl_survival_events';

/**
 * Local date parser avoiding UTC timezone shifting
 */
function parseLocalDate(dateStr) {
  if (!dateStr) return new Date();
  if (typeof dateStr === 'string' && dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      return new Date(y, m, d, 0, 0, 0, 0);
    }
  }
  const d = new Date(dateStr);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

function getLocalToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
}

function formatDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Service for Student Survival Mode Allowance Cycles & Analytics
 * Supports Spring Boot REST API (/api/allowances) with seamless fallback
 * to localStorage and client-side calculations for static / cloud deployments.
 */
export const allowanceService = {
  // -------------------------------------------------------------
  // Internal Local Storage Persistence Helpers
  // -------------------------------------------------------------
  _getActiveCycle() {
    if (typeof window === 'undefined') return null;
    try {
      const raw =
        localStorage.getItem(STORAGE_ACTIVE_CYCLE_KEY) ||
        localStorage.getItem('spendl_active_cycle');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && parsed.allowanceAmount !== undefined) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read active cycle from storage:', e);
    }
    return null;
  },

  _saveActiveCycle(cycle) {
    if (typeof window === 'undefined' || !cycle) return;
    try {
      localStorage.setItem(STORAGE_ACTIVE_CYCLE_KEY, JSON.stringify(cycle));
      localStorage.setItem('spendl_active_cycle', JSON.stringify(cycle));

      // Also ensure cycle is in history list
      const history = this._getStoredHistory();
      const existingIdx = history.findIndex((c) => String(c.id) === String(cycle.id));
      if (existingIdx >= 0) {
        history[existingIdx] = cycle;
      } else {
        history.unshift(cycle);
      }
      this._saveStoredHistory(history);
    } catch (e) {
      console.warn('Could not save active cycle to storage:', e);
    }
  },

  _ensureActiveCycle() {
    let cycle = this._getActiveCycle();
    if (!cycle) {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
      cycle = {
        id: Date.now(),
        name: 'Student Survival Plan',
        allowanceAmount: 8000,
        startDate: `${y}-${m}-01`,
        endDate: `${y}-${m}-${String(lastDay).padStart(2, '0')}`,
        openingBalance: 0,
        emergencyReserve: 500,
        fixedExpenses: 0,
        notes: 'Active Student Survival Plan',
        active: true,
        events: [],
        createdAt: now.toISOString(),
      };
      this._saveActiveCycle(cycle);
    }
    return cycle;
  },

  _getStoredHistory() {
    if (typeof window === 'undefined') return [];
    try {
      const raw =
        localStorage.getItem(STORAGE_HISTORY_KEY) ||
        localStorage.getItem('spendl_cycle_history');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Could not read cycle history from storage:', e);
    }
    const active = this._getActiveCycle();
    return active ? [active] : [];
  },

  _saveStoredHistory(list) {
    if (typeof window === 'undefined' || !Array.isArray(list)) return;
    try {
      localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(list));
      localStorage.setItem('spendl_cycle_history', JSON.stringify(list));
    } catch (e) {
      console.warn('Could not save cycle history to storage:', e);
    }
  },

  _recordLocalTopUp(cycleId, event) {
    let cycle = this._getActiveCycle();
    if (!cycle) {
      cycle = this._ensureActiveCycle();
    }

    cycle.events = cycle.events || [];
    // Prevent duplicate event entries
    const exists = cycle.events.some(
      (e) => String(e.id) === String(event.id) ||
        (e.amount === event.amount && e.date === event.date && e.description === event.description)
    );
    if (!exists) {
      cycle.events.unshift(event);
    }
    this._saveActiveCycle(cycle);

    // Also persist in events log
    try {
      const raw = localStorage.getItem(STORAGE_EVENTS_KEY);
      const list = raw ? JSON.parse(raw) : [];
      if (!list.some((e) => String(e.id) === String(event.id))) {
        list.unshift(event);
        localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(list));
      }
    } catch (e) {
      console.warn('Could not save event to storage:', e);
    }
  },

  _getStoredTransactions() {
    if (typeof window === 'undefined') return [];
    try {
      const raw =
        localStorage.getItem('spendl_transactions') ||
        localStorage.getItem('pennywise_transactions');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Could not read transactions from storage:', e);
    }
    return [];
  },

  // -------------------------------------------------------------
  // Full Client-side Survival Calculation Engine
  // (Exact mathematical equivalent of Spring Boot SurvivalCalculatorService)
  // -------------------------------------------------------------
  calculateLocalSurvival(cycle, allTransactions = [], eventsOverride = null) {
    if (!cycle) return null;

    const events = eventsOverride || cycle.events || [];
    const totalTopUps = events.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const baseAllowance = Number(cycle.allowanceAmount) || 0;
    const openingBalance = Number(cycle.openingBalance) || 0;
    const emergencyReserve = Number(cycle.emergencyReserve) || 0;
    const fixedExpenses = Number(cycle.fixedExpenses) || 0;

    const totalAllowance = baseAllowance + openingBalance + totalTopUps;

    // Filter transactions within the active cycle dates of type EXPENSE
    const startDateStr = cycle.startDate;
    const endDateStr = cycle.endDate;

    const cycleExpenses = (allTransactions || []).filter((t) => {
      if (!t || t.type !== 'EXPENSE') return false;
      const tDate = t.date;
      if (!tDate) return false;
      if (startDateStr && tDate < startDateStr) return false;
      if (endDateStr && tDate > endDateStr) return false;
      return true;
    });

    const totalSpent = cycleExpenses.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const remainingFlexibleMoney = totalAllowance - fixedExpenses - emergencyReserve - totalSpent;

    // Calculate days
    const start = parseLocalDate(cycle.startDate);
    const end = parseLocalDate(cycle.endDate);
    const today = getLocalToday();
    const msPerDay = 1000 * 60 * 60 * 24;

    const totalDays = Math.max(1, Math.round((end - start) / msPerDay) + 1);

    let daysElapsed = 0;
    if (today >= start) {
      daysElapsed = Math.min(totalDays, Math.round((today - start) / msPerDay) + 1);
    }

    let daysRemaining = 0;
    if (today <= end) {
      daysRemaining = Math.max(1, Math.round((end - today) / msPerDay) + 1);
    }

    // Daily safe spending limit
    const dailySafeSpendingLimit =
      daysRemaining <= 0 || remainingFlexibleMoney <= 0
        ? 0
        : Math.round((remainingFlexibleMoney / daysRemaining) * 100) / 100;

    // Today's spent
    const todayStr = formatDateStr(today);
    const todaySpent = cycleExpenses
      .filter((t) => t.date === todayStr)
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const todayRemainingLimit = Math.max(
      0,
      Math.round((dailySafeSpendingLimit - todaySpent) * 100) / 100
    );

    // Budget utilization
    const effectiveBudget = totalAllowance - emergencyReserve - fixedExpenses;
    const budgetUsedPercentage =
      effectiveBudget <= 0
        ? 100
        : Math.min(100, Math.max(0, Math.round((totalSpent / effectiveBudget) * 1000) / 10));

    // Status color & message
    let statusColor = 'GREEN';
    let statusMessage =
      'Safe pace: Your spending is well within your planned daily allowance. Keep this pace to finish the month with savings!';

    if (remainingFlexibleMoney <= 0 || totalSpent > effectiveBudget) {
      statusColor = 'RED';
      statusMessage =
        'Critical: You have exhausted your flexible allowance. Limit all spending to absolute necessities until your next allowance arrives.';
    } else if (budgetUsedPercentage > 70) {
      statusColor = 'YELLOW';
      statusMessage = `Caution: You have utilized over 70% of your flexible allowance. Pace yourself carefully over the remaining ${daysRemaining} days.`;
    }

    // Category breakdown
    const catMap = {};
    cycleExpenses.forEach((t) => {
      const cat = t.category || 'Other';
      catMap[cat] = (catMap[cat] || 0) + (Number(t.amount) || 0);
    });

    const categoryBreakdown = Object.entries(catMap)
      .map(([category, amount]) => ({
        category,
        amount: Math.round(amount * 100) / 100,
        percentage:
          totalSpent > 0 ? Math.round((amount / totalSpent) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Weekly report (last 7 days)
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dailySpending = [];
    let totalSpentThisWeek = 0;
    let highestSpendingDay = null;
    let maxDaySpend = -1;
    const weeklyCatMap = {};

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today.getTime() - i * msPerDay);
      const dStr = formatDateStr(d);
      const dayName = dayNames[d.getDay()];

      const dayTxs = cycleExpenses.filter((t) => t.date === dStr);
      const dayAmt = dayTxs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      dailySpending.push({
        dayName,
        date: dStr,
        amount: Math.round(dayAmt * 100) / 100,
      });

      totalSpentThisWeek += dayAmt;
      if (dayAmt > maxDaySpend && dayAmt > 0) {
        maxDaySpend = dayAmt;
        highestSpendingDay = `${dayName} (${dStr})`;
      }

      dayTxs.forEach((t) => {
        const cat = t.category || 'Other';
        weeklyCatMap[cat] = (weeklyCatMap[cat] || 0) + (Number(t.amount) || 0);
      });
    }

    const averageDailySpending = Math.round((totalSpentThisWeek / 7) * 100) / 100;

    let mostExpensiveCategory = null;
    let maxCatSpend = -1;
    Object.entries(weeklyCatMap).forEach(([cat, amt]) => {
      if (amt > maxCatSpend) {
        maxCatSpend = amt;
        mostExpensiveCategory = cat;
      }
    });

    let insightMessage = '';
    if (totalSpentThisWeek === 0) {
      insightMessage = 'No spending recorded in the last 7 days. Your discipline is top tier!';
    } else if (averageDailySpending > dailySafeSpendingLimit && dailySafeSpendingLimit > 0) {
      insightMessage = `Your daily average this week (${averageDailySpending}) is higher than your safe limit (${dailySafeSpendingLimit}). Consider cutting back.`;
    } else if (mostExpensiveCategory) {
      insightMessage = `${mostExpensiveCategory} was your highest spending category this week.`;
    } else {
      insightMessage = 'You spent less this week. Great job!';
    }

    return {
      cycle: {
        ...cycle,
        events,
      },
      totalAllowance: Math.round(totalAllowance * 100) / 100,
      totalTopUps: Math.round(totalTopUps * 100) / 100,
      totalSpent: Math.round(totalSpent * 100) / 100,
      remainingFlexibleMoney: Math.round(remainingFlexibleMoney * 100) / 100,
      dailySafeSpendingLimit,
      todaySpent: Math.round(todaySpent * 100) / 100,
      todayRemainingLimit,
      daysRemaining,
      totalDays,
      daysElapsed,
      budgetUsedPercentage,
      statusColor,
      statusMessage,
      projectedEndBalance: Math.round(remainingFlexibleMoney * 100) / 100,
      categoryBreakdown,
      weeklyReport: {
        totalSpentThisWeek: Math.round(totalSpentThisWeek * 100) / 100,
        averageDailySpending,
        highestSpendingDay,
        mostExpensiveCategory,
        dailySpending,
        insightMessage,
      },
    };
  },

  // -------------------------------------------------------------
  // Public Service Methods
  // -------------------------------------------------------------

  /**
   * Fetch active survival metrics dashboard
   * @param {Array|null} transactions - active transactions list from useTransactions
   * @returns {Promise<Object>} Full SurvivalDashboardResponse
   */
  async getActiveSurvival(transactions = null) {
    try {
      const data = await api.get('/allowances/active/survival');
      if (data && typeof data === 'object' && data.cycle) {
        this._saveActiveCycle(data.cycle);
        return data;
      }
    } catch (err) {
      console.warn('Backend getActiveSurvival not available, falling back to local engine:', err);
    }

    const localCycle = this._getActiveCycle();
    if (!localCycle) {
      return null;
    }
    const txs = transactions || this._getStoredTransactions();
    return this.calculateLocalSurvival(localCycle, txs, localCycle.events || []);
  },

  /**
   * Fetch active allowance plan
   * @returns {Promise<Object>} AllowanceResponse
   */
  async getActiveCycle() {
    try {
      const data = await api.get('/allowances/active');
      if (data && typeof data === 'object' && data.allowanceAmount !== undefined) {
        this._saveActiveCycle(data);
        return data;
      }
    } catch (err) {
      console.warn('Backend getActiveCycle not available, falling back to local storage:', err);
    }
    return this._getActiveCycle();
  },

  /**
   * Create a new allowance cycle
   * @param {Object} data - { name, allowanceAmount, startDate, endDate, openingBalance, emergencyReserve, fixedExpenses, notes }
   * @returns {Promise<Object>} AllowanceResponse
   */
  async createCycle(data) {
    const payload = {
      name: data.name?.trim() || 'Student Survival Plan',
      allowanceAmount: parseFloat(data.allowanceAmount),
      startDate: data.startDate,
      endDate: data.endDate,
      openingBalance: data.openingBalance ? parseFloat(data.openingBalance) : 0,
      emergencyReserve: data.emergencyReserve ? parseFloat(data.emergencyReserve) : 0,
      fixedExpenses: data.fixedExpenses ? parseFloat(data.fixedExpenses) : 0,
      notes: data.notes?.trim() || null,
    };

    let backendResult = null;
    try {
      backendResult = await api.post('/allowances', payload);
    } catch (err) {
      console.warn('Backend cycle creation returned error, saving locally:', err);
    }

    const cycle = backendResult || {
      id: Date.now(),
      ...payload,
      active: true,
      events: [],
      createdAt: new Date().toISOString(),
    };

    this._saveActiveCycle(cycle);
    return cycle;
  },

  /**
   * Update an existing allowance cycle
   * @param {number|string} id 
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async updateCycle(id, data) {
    const payload = {
      name: data.name?.trim() || 'Student Survival Plan',
      allowanceAmount: parseFloat(data.allowanceAmount),
      startDate: data.startDate,
      endDate: data.endDate,
      openingBalance: data.openingBalance ? parseFloat(data.openingBalance) : 0,
      emergencyReserve: data.emergencyReserve ? parseFloat(data.emergencyReserve) : 0,
      fixedExpenses: data.fixedExpenses ? parseFloat(data.fixedExpenses) : 0,
      notes: data.notes?.trim() || null,
    };

    let backendResult = null;
    try {
      backendResult = await api.put(`/allowances/${id}`, payload);
    } catch (err) {
      console.warn('Backend cycle update returned error, saving locally:', err);
    }

    const existing = this._getActiveCycle() || { id, events: [] };
    const updated = backendResult || {
      ...existing,
      ...payload,
      id: existing.id || id,
    };

    this._saveActiveCycle(updated);
    return updated;
  },

  /**
   * Add a top-up event (pocket money, freelance, extra money)
   * Resiliently catches 405/404/network errors on static hosting & saves locally.
   * @param {number|string|null} cycleId 
   * @param {Object} data - { amount, date, description }
   * @returns {Promise<Object>} AllowanceEventResponse
   */
  async addTopUp(cycleId, data) {
    const payload = {
      amount: parseFloat(data.amount),
      date: data.date,
      description: data.description?.trim() || 'Allowance Top-up',
    };

    let backendResult = null;
    try {
      if (cycleId && !isNaN(Number(cycleId)) && Number(cycleId) > 0) {
        backendResult = await api.post(`/allowances/${cycleId}/events`, payload);
      } else {
        backendResult = await api.post('/allowances/events', payload);
      }
    } catch (err) {
      console.warn(
        `Backend top-up endpoint returned error (status ${err?.status || 'network'}), falling back to local storage:`,
        err
      );
    }

    const event = backendResult || {
      id: Date.now(),
      cycleId: cycleId || 'active',
      amount: payload.amount,
      date: payload.date,
      description: payload.description,
      createdAt: new Date().toISOString(),
    };

    this._recordLocalTopUp(cycleId, event);
    return event;
  },

  /**
   * Fetch allowance history
   * @returns {Promise<Array>} List of past AllowanceResponse
   */
  async getHistory() {
    try {
      const history = await api.get('/allowances/history');
      if (Array.isArray(history) && history.length > 0) {
        this._saveStoredHistory(history);
        return history;
      }
    } catch (err) {
      console.warn('Backend history not available, falling back to local history:', err);
    }
    return this._getStoredHistory();
  },

  /**
   * Fetch survival metrics for a specific cycle by ID (for history reviews)
   * @param {number|string} id 
   * @param {Array|null} transactions
   * @returns {Promise<Object>} SurvivalDashboardResponse
   */
  async getSurvivalById(id, transactions = null) {
    try {
      const data = await api.get(`/allowances/${id}/survival`);
      if (data && typeof data === 'object' && data.cycle) {
        return data;
      }
    } catch (err) {
      console.warn('Backend getSurvivalById not available, calculating locally:', err);
    }

    const history = this._getStoredHistory();
    const cycle =
      history.find((c) => String(c.id) === String(id)) || this._getActiveCycle();
    if (!cycle) return null;
    const txs = transactions || this._getStoredTransactions();
    return this.calculateLocalSurvival(cycle, txs, cycle.events || []);
  },

  /**
   * Fetch weekly report for cycle
   * @param {number|string} id 
   * @param {Array|null} transactions
   * @returns {Promise<Object>} WeeklyReportDto
   */
  async getWeeklyReport(id, transactions = null) {
    try {
      const data = await api.get(`/allowances/${id}/weekly-report`);
      if (data && typeof data === 'object') {
        return data;
      }
    } catch (err) {
      console.warn('Backend getWeeklyReport not available, calculating locally:', err);
    }

    const survival = await this.getSurvivalById(id, transactions);
    return survival?.weeklyReport || null;
  },
};

export default allowanceService;
