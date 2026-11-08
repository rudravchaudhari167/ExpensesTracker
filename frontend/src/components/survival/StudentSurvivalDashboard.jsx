import React, { useState, useEffect, useCallback } from 'react';
import {
  GraduationCap,
  Wallet,
  Receipt,
  PiggyBank,
  Zap,
  PlusCircle,
  Sliders,
  History,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Sparkles,
  Layers,
  Utensils,
  Car,
  BookOpen,
  Home,
  ShoppingBag,
  Film,
  Smartphone,
  HeartPulse,
  Tag,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { allowanceService } from '../../services/allowanceService';
import { formatCurrency, getCurrencySymbol } from '../../utils/currency';
import AllowanceSetupModal from './AllowanceSetupModal';
import AllowanceTopUpModal from './AllowanceTopUpModal';
import AllowanceHistoryModal from './AllowanceHistoryModal';
import './StudentSurvivalDashboard.css';

// Student Category Icon Helper
function getStudentCategoryIcon(categoryName = '') {
  const normalized = categoryName.toLowerCase();
  if (normalized.includes('food') || normalized.includes('canteen') || normalized.includes('dining') || normalized.includes('groceries')) {
    return { icon: Utensils, bg: 'rgba(232, 121, 82, 0.12)', color: '#E87952' };
  }
  if (normalized.includes('transport') || normalized.includes('bus') || normalized.includes('metro') || normalized.includes('cab')) {
    return { icon: Car, bg: 'rgba(91, 78, 126, 0.12)', color: '#5B4E7E' };
  }
  if (normalized.includes('college') || normalized.includes('book') || normalized.includes('supplies') || normalized.includes('education')) {
    return { icon: BookOpen, bg: 'rgba(62, 107, 59, 0.12)', color: '#3E6B3B' };
  }
  if (normalized.includes('hostel') || normalized.includes('accommodation') || normalized.includes('rent') || normalized.includes('housing')) {
    return { icon: Home, bg: 'rgba(246, 230, 169, 0.35)', color: '#8C731A' };
  }
  if (normalized.includes('shopping') || normalized.includes('clothes')) {
    return { icon: ShoppingBag, bg: 'rgba(232, 121, 82, 0.15)', color: '#B95337' };
  }
  if (normalized.includes('entertainment') || normalized.includes('movie') || normalized.includes('fun')) {
    return { icon: Film, bg: 'rgba(234, 227, 247, 0.6)', color: '#5B4E7E' };
  }
  if (normalized.includes('subscription') || normalized.includes('recharge') || normalized.includes('internet') || normalized.includes('phone')) {
    return { icon: Smartphone, bg: 'rgba(221, 232, 216, 0.6)', color: '#3E6B3B' };
  }
  if (normalized.includes('emergency') || normalized.includes('medical') || normalized.includes('health')) {
    return { icon: HeartPulse, bg: 'rgba(217, 72, 59, 0.12)', color: '#D9483B' };
  }
  return { icon: Tag, bg: 'var(--color-surface-muted)', color: 'var(--color-text-secondary)' };
}

export function StudentSurvivalDashboard({
  currency = 'INR',
  onShowToast,
  transactions = [],
  transactionsVersion = 0, // Used to trigger refresh when transactions are added/edited/deleted
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [historyList, setHistoryList] = useState([]);

  // Modals state
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [setupInitialData, setSetupInitialData] = useState(null);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Load Active Survival Dashboard from Spring Boot backend (with local fallback)
  const fetchSurvivalMetrics = useCallback(async (targetCycleId = null) => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (targetCycleId) {
        data = await allowanceService.getSurvivalById(targetCycleId, transactions);
      } else {
        data = await allowanceService.getActiveSurvival(transactions);
      }
      setDashboardData(data);
    } catch (err) {
      // If 404, it means no active plan configured yet (show onboarding screen)
      if (err.status === 404 || err.message?.includes('not found') || err.message?.includes('No active')) {
        setDashboardData(null);
      } else {
        console.warn('Could not load survival metrics:', err);
        setError(err.message || 'Unable to connect to Student Survival service.');
      }
    } finally {
      setLoading(false);
    }
  }, [transactions]);

  // Load History list
  const fetchHistory = useCallback(async () => {
    try {
      const history = await allowanceService.getHistory();
      setHistoryList(history || []);
    } catch (err) {
      console.warn('Could not load allowance history:', err);
    }
  }, []);

  useEffect(() => {
    fetchSurvivalMetrics();
    fetchHistory();
  }, [fetchSurvivalMetrics, fetchHistory, transactionsVersion]);

  // Handle Cycle Create or Update
  const handleSaveCycle = async (formData, id) => {
    if (id) {
      await allowanceService.updateCycle(id, formData);
      if (onShowToast) onShowToast('success', 'Student Survival Plan updated successfully.', 'Plan Updated');
    } else {
      await allowanceService.createCycle(formData);
      if (onShowToast) onShowToast('success', 'Your Student Survival Plan is now active!', 'Plan Activated');
    }
    await fetchSurvivalMetrics();
    await fetchHistory();
  };

  // Handle Top-up Submission
  const handleAddTopUp = async (cycleId, topUpData) => {
    const targetCycleId = cycleId || cycle?.id || dashboardData?.cycle?.id || null;
    await allowanceService.addTopUp(targetCycleId, topUpData);
    if (onShowToast) {
      onShowToast('success', `Added ${formatCurrency(topUpData.amount, currency)} to your allowance!`, 'Allowance Top-up Recorded');
    }
    await fetchSurvivalMetrics(targetCycleId);
    await fetchHistory();
  };

  // Quick Action triggers
  const handleOpenEdit = () => {
    if (dashboardData?.cycle) {
      setSetupInitialData(dashboardData.cycle);
      setIsSetupOpen(true);
    }
  };

  const handleOpenNewPlan = () => {
    setSetupInitialData(null);
    setIsSetupOpen(true);
  };

  // Render Loading Skeleton
  if (loading && !dashboardData) {
    return (
      <div className="survival-dashboard-container animate-fade-in">
        <div className="survival-hero-banner card-surface">
          <div className="survival-hero-text">
            <span className="survival-tag-pill">Student Survival Mode</span>
            <h2 className="survival-title font-serif">Loading your survival plan...</h2>
            <p className="survival-subtitle">Fetching verified allowance ledger from Spring Boot.</p>
          </div>
        </div>
        <div className="survival-summary-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="survival-summary-card card-surface animate-shimmer" style={{ height: 130 }}></div>
          ))}
        </div>
      </div>
    );
  }

  // Render Onboarding Screen (If no active cycle exists)
  if (!dashboardData && !loading) {
    return (
      <div className="survival-dashboard-container animate-fade-in">
        <div className="survival-hero-banner card-surface">
          <div className="survival-hero-text">
            <span className="survival-tag-pill">Student Survival Mode</span>
            <h2 className="survival-title font-serif">Student Survival Mode</h2>
            <p className="survival-subtitle">
              Make your allowance last longer. Spend smarter. Live better.
            </p>
          </div>
        </div>

        {error && (
          <div className="card-surface" style={{ padding: '16px', marginBottom: '20px', borderLeft: '4px solid #D64545', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={20} color="#D64545" />
            <div style={{ flex: 1, fontSize: '0.9rem' }}>
              <strong>Could not load survival data:</strong> {error}
            </div>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => fetchSurvivalMetrics()}>
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        <div className="survival-onboarding-card card-surface animate-scale-up">
          <div className="onboarding-cap-circle">
            <GraduationCap size={40} />
          </div>
          <h3 className="onboarding-title font-serif">Let's set up your survival plan!</h3>
          <p className="onboarding-desc">
            Tell us how much money you have and when your next allowance arrives. We'll automatically calculate
            your daily safe spending limit, protect your emergency reserves, and keep you from running broke before month-end.
          </p>

          <div className="onboarding-features-list">
            <div className="onboarding-feature-item">
              <span className="feature-title">🛡️ Daily Safe Limit</span>
              <span className="feature-text">Recalculates after every transaction so you never overspend.</span>
            </div>
            <div className="onboarding-feature-item">
              <span className="feature-title">🔒 Emergency Buffer</span>
              <span className="feature-text">Lock away urgent cash that won't show in daily spending.</span>
            </div>
            <div className="onboarding-feature-item">
              <span className="feature-title">📊 Weekly Diagnostics</span>
              <span className="feature-text">Actionable data on your highest spend days and canteen bills.</span>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            style={{ padding: '12px 28px', fontSize: '1rem' }}
            onClick={handleOpenNewPlan}
          >
            <Sparkles size={18} />
            <span>Set Up Your Survival Plan</span>
          </button>
        </div>

        {/* Modal */}
        <AllowanceSetupModal
          isOpen={isSetupOpen}
          onClose={() => setIsSetupOpen(false)}
          onSubmit={handleSaveCycle}
          initialData={setupInitialData}
          currency={currency}
        />
      </div>
    );
  }

  const {
    cycle,
    totalAllowance,
    totalSpent,
    remainingFlexibleMoney,
    dailySafeSpendingLimit,
    todaySpent,
    todayRemainingLimit,
    daysRemaining,
    totalDays,
    daysElapsed,
    budgetUsedPercentage,
    statusColor,
    statusMessage,
    projectedEndBalance,
    categoryBreakdown = [],
    weeklyReport = {},
  } = dashboardData;

  const statusColorClass = statusColor === 'GREEN' ? 'status-green' : statusColor === 'YELLOW' ? 'status-yellow' : 'status-red';
  const fillClass = statusColor === 'GREEN' ? 'fill-green' : statusColor === 'YELLOW' ? 'fill-yellow' : 'fill-red';

  return (
    <div className="survival-dashboard-container animate-fade-in">
      {/* 1. Header Banner */}
      <div className="survival-hero-banner card-surface">
        <div className="survival-hero-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="survival-tag-pill">
              <GraduationCap size={13} />
              <span>Student Survival Mode</span>
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
              • {cycle?.name || 'Active Plan'}
            </span>
          </div>
          <h2 className="survival-title font-serif">Student Survival Mode</h2>
          <p className="survival-subtitle">
            Make your allowance last longer. Spend smarter. Live better.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="survival-hero-actions">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setIsTopUpOpen(true)}
            title="Record extra pocket money or top-up"
          >
            <PlusCircle size={15} />
            <span>Add Money</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleOpenEdit}
            title="Edit plan allowance or dates"
          >
            <Sliders size={15} />
            <span>Edit Plan</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setIsHistoryOpen(true)}
            title="View past allowance cycles"
          >
            <History size={15} />
            <span>Cycles ({historyList.length})</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => fetchSurvivalMetrics(cycle?.id)}
            title="Refresh metrics from backend"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* 2. Four Core Summary Cards Grid */}
      <div className="survival-summary-grid">
        {/* Card 1: Total Allowance */}
        <div className="survival-summary-card card-surface">
          <div className="card-top-row">
            <span className="card-label">Total Allowance</span>
            <div className="card-icon-bubble bubble-allowance">
              <Wallet size={18} />
            </div>
          </div>
          <div className="card-amount font-mono tabular-nums">
            {formatCurrency(totalAllowance, currency)}
          </div>
          <div className="card-footnote">
            Base: {formatCurrency(cycle?.allowanceAmount || 0, currency)}
            {cycle?.openingBalance > 0 && ` + Carryover: ${formatCurrency(cycle.openingBalance, currency)}`}
            {dashboardData.totalTopUps > 0 && ` + Top-ups: ${formatCurrency(dashboardData.totalTopUps, currency)}`}
          </div>
        </div>

        {/* Card 2: Total Spent */}
        <div className="survival-summary-card card-surface">
          <div className="card-top-row">
            <span className="card-label">Total Spent</span>
            <div className="card-icon-bubble bubble-spent">
              <Receipt size={18} />
            </div>
          </div>
          <div className="card-amount font-mono tabular-nums" style={{ color: 'var(--color-danger)' }}>
            {formatCurrency(totalSpent, currency)}
          </div>
          <div className="card-footnote">
            Across {daysElapsed} elapsed days of cycle
          </div>
        </div>

        {/* Card 3: Remaining Flexible Money */}
        <div className="survival-summary-card card-surface">
          <div className="card-top-row">
            <span className="card-label">Remaining Flexible Money</span>
            <div className="card-icon-bubble bubble-flexible">
              <PiggyBank size={18} />
            </div>
          </div>
          <div
            className="card-amount font-mono tabular-nums"
            style={{ color: remainingFlexibleMoney >= 0 ? 'var(--color-sage-dark)' : 'var(--color-danger)' }}
          >
            {formatCurrency(remainingFlexibleMoney, currency)}
          </div>
          <div className="card-footnote">
            {cycle?.emergencyReserve > 0
              ? `Safeguards ${formatCurrency(cycle.emergencyReserve, currency)} emergency reserve`
              : 'Discretionary cash for remainder of month'}
          </div>
        </div>

        {/* Card 4: Daily Safe Spending Limit */}
        <div className="survival-summary-card card-surface">
          <div className="card-top-row">
            <span className="card-label">Daily Safe Spending Limit</span>
            <div className="card-icon-bubble bubble-daily">
              <Zap size={18} />
            </div>
          </div>
          <div className="card-amount font-mono tabular-nums" style={{ color: 'var(--color-accent)' }}>
            {formatCurrency(dailySafeSpendingLimit, currency)}
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginLeft: 4 }}>
              / day
            </span>
          </div>
          <div className="card-footnote">
            For {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Cycle finalized'}
          </div>
        </div>
      </div>

      {/* 3. Can you survive until your next allowance? Section */}
      <section className="survival-meter-section card-surface">
        <div className="meter-header">
          <div>
            <h3 className="meter-title font-serif">Can you survive until your next allowance?</h3>
            <p className="card-subheading">
              Real-time survival pace based on verified transactions in your cycle ({cycle?.startDate} to {cycle?.endDate})
            </p>
          </div>
          <span className={`meter-badge ${statusColorClass}`}>
            {statusColor === 'GREEN' && 'Safe Pace • On Track'}
            {statusColor === 'YELLOW' && 'Caution • Pace High'}
            {statusColor === 'RED' && 'Critical • Allowance Depleted'}
          </span>
        </div>

        {/* Animated Progress Bar */}
        <div className="meter-track-container">
          <div className="meter-track">
            <div
              className={`meter-fill ${fillClass}`}
              style={{ width: `${Math.min(100, Math.max(0, budgetUsedPercentage))}%` }}
            />
          </div>
          <div className="meter-labels-row font-mono">
            <span>{budgetUsedPercentage}% Budget Utilized</span>
            <span>{daysRemaining} Days Left to Survive</span>
          </div>
        </div>

        {/* Dynamic Advice Bubble */}
        <div className={`meter-message-bubble ${statusColorClass}`}>
          {statusColor === 'GREEN' && <CheckCircle2 size={18} style={{ flexShrink: 0 }} />}
          {statusColor === 'YELLOW' && <AlertTriangle size={18} style={{ flexShrink: 0 }} />}
          {statusColor === 'RED' && <AlertCircle size={18} style={{ flexShrink: 0 }} />}
          <span>{statusMessage}</span>
        </div>

        {/* 4 Secondary Statistics Pillars */}
        <div className="meter-stats-row">
          <div className="stat-metric-box">
            <span className="stat-label">Days Remaining</span>
            <span className="stat-value font-mono">{daysRemaining} / {totalDays} days</span>
          </div>
          <div className="stat-metric-box">
            <span className="stat-label">Recommended Daily Pace</span>
            <span className="stat-value font-mono">{formatCurrency(dailySafeSpendingLimit, currency)}</span>
          </div>
          <div className="stat-metric-box">
            <span className="stat-label">Projected Month-End Balance</span>
            <span
              className="stat-value font-mono"
              style={{ color: projectedEndBalance >= 0 ? 'var(--color-sage-dark)' : 'var(--color-danger)' }}
            >
              {projectedEndBalance >= 0 ? `+${formatCurrency(projectedEndBalance, currency)}` : formatCurrency(projectedEndBalance, currency)}
            </span>
          </div>
          <div className="stat-metric-box">
            <span className="stat-label">Emergency Stash</span>
            <span className="stat-value font-mono" style={{ color: 'var(--color-text-main)' }}>
              🔒 {formatCurrency(cycle?.emergencyReserve || 0, currency)}
            </span>
          </div>
        </div>
      </section>

      {/* 4. Middle 2-Column Grid: Today's Daily Spend Breakdown & Student Categories */}
      <div className="survival-middle-grid">
        {/* Card A: Today's Safe Daily Allowance */}
        <div className="daily-spending-card card-surface">
          <div className="section-head-with-icon">
            <div className="section-icon-box">
              <Zap size={18} />
            </div>
            <div>
              <h4 className="section-title font-serif">Today's Daily Allowance</h4>
              <p className="section-desc">Track and discipline spending within today's window</p>
            </div>
          </div>

          <div className="today-limit-display">
            <div>
              <div className="today-limit-label">Today's Remaining Safe Spend</div>
              <div
                className="today-limit-value font-mono tabular-nums"
                style={{ color: todayRemainingLimit >= 0 ? 'var(--color-accent)' : 'var(--color-danger)' }}
              >
                {formatCurrency(todayRemainingLimit, currency)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                Spent Today
              </div>
              <div className="font-mono tabular-nums" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                {formatCurrency(todaySpent, currency)}
              </div>
            </div>
          </div>

          <div className="daily-equation-box">
            <div><strong>How this is calculated:</strong></div>
            <div className="daily-equation-formula">
              Today's Remaining = Daily Limit ({formatCurrency(dailySafeSpendingLimit, currency)}) - Today's Outflow ({formatCurrency(todaySpent, currency)})
            </div>
            <div style={{ marginTop: 6, fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>
              When you add new transactions through your ledger, your daily safe limit automatically recalibrates.
            </div>
          </div>
        </div>

        {/* Card B: Student Expense Categories */}
        <div className="category-spending-card card-surface">
          <div className="section-head-with-icon">
            <div className="section-icon-box">
              <Layers size={18} />
            </div>
            <div>
              <h4 className="section-title font-serif">Cycle Expense Categories</h4>
              <p className="section-desc">Where your student allowance is flowing</p>
            </div>
          </div>

          {categoryBreakdown.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 12px', color: 'var(--color-text-secondary)' }}>
              <p>No expenses logged in this cycle yet.</p>
            </div>
          ) : (
            <div className="survival-categories-list">
              {categoryBreakdown.map((cat) => {
                const iconInfo = getStudentCategoryIcon(cat.category);
                const IconComponent = iconInfo.icon;
                return (
                  <div key={cat.category} className="category-row-item">
                    <div className="category-row-head">
                      <div className="category-info-left">
                        <div
                          className="category-badge-icon"
                          style={{ background: iconInfo.bg, color: iconInfo.color }}
                        >
                          <IconComponent size={15} />
                        </div>
                        <span className="category-row-title">{cat.category}</span>
                      </div>
                      <div className="category-amounts">
                        <span className="cat-spent-amt font-mono tabular-nums">
                          {formatCurrency(cat.amount, currency)}
                        </span>
                        <span className="cat-spent-pct font-mono">{cat.percentage}%</span>
                      </div>
                    </div>
                    <div className="category-progress-track">
                      <div
                        className="category-progress-bar"
                        style={{ width: `${Math.min(100, Math.max(0, cat.percentage))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 5. Weekly Spending Report Section */}
      <section className="weekly-report-card card-surface">
        <div className="section-head-with-icon">
          <div className="section-icon-box" style={{ background: 'rgba(91, 78, 126, 0.12)', color: '#5B4E7E' }}>
            <Calendar size={18} />
          </div>
          <div>
            <h4 className="section-title font-serif">Your Weekly Survival Report</h4>
            <p className="section-desc">7-day spending trends and behavioral diagnostics</p>
          </div>
        </div>

        {/* 4 Weekly Statistics Pills */}
        <div className="weekly-stats-strip">
          <div className="weekly-metric-cell">
            <span className="stat-label">This Week's Outflow</span>
            <span className="stat-value font-mono tabular-nums">
              {formatCurrency(weeklyReport.totalSpentThisWeek || 0, currency)}
            </span>
          </div>
          <div className="weekly-metric-cell">
            <span className="stat-label">Daily Average</span>
            <span className="stat-value font-mono tabular-nums">
              {formatCurrency(weeklyReport.averageDailySpending || 0, currency)} / day
            </span>
          </div>
          <div className="weekly-metric-cell">
            <span className="stat-label">Peak Spending Day</span>
            <span className="stat-value font-mono" style={{ fontSize: '0.92rem' }}>
              {weeklyReport.highestSpendingDay || 'None'}
            </span>
          </div>
          <div className="weekly-metric-cell">
            <span className="stat-label">Top Category</span>
            <span className="stat-value" style={{ fontSize: '0.92rem', color: 'var(--color-accent)' }}>
              {weeklyReport.mostExpensiveCategory || 'None'}
            </span>
          </div>
        </div>

        {/* 7-Day Bar Chart */}
        {weeklyReport.dailySpending && weeklyReport.dailySpending.length > 0 && (
          <div className="weekly-chart-wrapper">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyReport.dailySpending} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="dayName"
                  stroke="var(--color-text-muted)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--color-border)' }}
                />
                <YAxis
                  stroke="var(--color-text-muted)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${getCurrencySymbol(currency)}${val}`}
                />
                <Tooltip
                  formatter={(val) => [formatCurrency(val, currency), 'Spent']}
                  labelFormatter={(name, payload) => {
                    const date = payload?.[0]?.payload?.date;
                    return `${name} (${date || ''})`;
                  }}
                  contentStyle={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-md)',
                    fontSize: '0.82rem',
                  }}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {weeklyReport.dailySpending.map((entry, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={entry.amount > (dailySafeSpendingLimit || 0) ? '#D9483B' : '#E87952'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Smart Dynamic Insight */}
        {weeklyReport.insightMessage && (
          <div className="weekly-insight-box">
            <Sparkles size={18} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
            <span>{weeklyReport.insightMessage}</span>
          </div>
        )}
      </section>

      {/* 6. Top-ups History Strip (if any top-ups were received) */}
      {cycle?.events && cycle.events.length > 0 && (
        <section className="topups-strip-card card-surface">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
              Top-ups & Extra Cash in this Cycle ({cycle.events.length})
            </span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsTopUpOpen(true)}
            >
              <PlusCircle size={13} />
              <span>Add Top-up</span>
            </button>
          </div>
          <div className="topups-items-list">
            {cycle.events.map((ev) => (
              <div key={ev.id} className="topup-chip-item">
                <span className="topup-amt font-mono tabular-nums">
                  +{formatCurrency(ev.amount, currency)}
                </span>
                <span style={{ color: 'var(--color-text-main)' }}>{ev.description || 'Top-up'}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>({ev.date})</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Modals */}
      <AllowanceSetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        onSubmit={handleSaveCycle}
        initialData={setupInitialData}
        currency={currency}
      />

      <AllowanceTopUpModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        onSubmit={handleAddTopUp}
        cycleId={cycle?.id || dashboardData?.cycle?.id}
        currency={currency}
      />

      <AllowanceHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={historyList}
        currentCycleId={cycle?.id}
        onSelectCycle={(id) => fetchSurvivalMetrics(id)}
        currency={currency}
      />
    </div>
  );
}

export default StudentSurvivalDashboard;
