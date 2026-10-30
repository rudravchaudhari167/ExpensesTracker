import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { computeMonthlyData, computeDailyData } from '../../utils/analytics';
import { formatCurrency } from '../../utils/currency';
import { BarChart3, TrendingUp, Calendar } from 'lucide-react';
import './SpendingChart.css';

/**
 * Custom Tooltip for Cash Flow Chart
 */
function CustomTooltip({ active, payload, label, currency, viewMode }) {
  if (active && payload && payload.length) {
    const dataItem = payload[0]?.payload || {};
    const incomeVal = dataItem.income || 0;
    const expenseVal = dataItem.expense || 0;
    const netVal = Math.round((incomeVal - expenseVal) * 100) / 100;
    const headerTitle =
      viewMode === 'daily'
        ? dataItem.fullDate || `Date: ${label}`
        : dataItem.fullMonth || `Month: ${label}`;

    return (
      <div className="custom-chart-tooltip card-surface">
        <div className="tooltip-header">{headerTitle}</div>
        <div className="tooltip-row income">
          <span className="tooltip-indicator income-dot"></span>
          <span className="tooltip-label">Income:</span>
          <span className="tooltip-val tabular-nums">{formatCurrency(incomeVal, currency)}</span>
        </div>
        <div className="tooltip-row expense">
          <span className="tooltip-indicator expense-dot"></span>
          <span className="tooltip-label">Expenses:</span>
          <span className="tooltip-val tabular-nums">{formatCurrency(expenseVal, currency)}</span>
        </div>
        <div className="tooltip-divider"></div>
        <div className="tooltip-row net">
          <span className="tooltip-label">Net Balance:</span>
          <span className={`tooltip-val tabular-nums ${netVal >= 0 ? 'text-sage' : 'text-danger'}`}>
            {formatCurrency(netVal, currency)}
          </span>
        </div>
      </div>
    );
  }
  return null;
}

/**
 * Custom Bar renderer that aligns bars directly over their corresponding date ticks.
 * If a date has only income, the income bar is centered over the tick.
 * If a date has only expense, the expense bar is centered over the tick.
 * If both exist, they are displayed side-by-side symmetrically around the tick.
 */
function AlignedBar(props) {
  const { x, y, width, height, fill, payload, dataKey } = props;
  if (!height || height <= 0) return null;

  const barGap = 3;
  const hasIncome = (payload?.income || 0) > 0;
  const hasExpense = (payload?.expense || 0) > 0;

  // Maximum elegant bar width to maintain readable proportions
  const barWidth = Math.min(width, 24);

  let adjustedX = x;

  if (hasIncome && !hasExpense && dataKey === 'income') {
    // Single income bar: center directly over category tick
    adjustedX = x + (width + barGap) / 2 - (barWidth - width) / 2;
  } else if (hasExpense && !hasIncome && dataKey === 'expense') {
    // Single expense bar: center directly over category tick
    adjustedX = x - (width + barGap) / 2 - (barWidth - width) / 2;
  } else {
    // Both exist: center the bar within its allotted half-slot
    adjustedX = x + (width - barWidth) / 2;
  }

  return (
    <rect
      x={adjustedX}
      y={y}
      width={barWidth}
      height={Math.max(height, 2)}
      rx={5}
      ry={5}
      fill={fill}
      className="recharts-bar-rectangle"
    />
  );
}

export function SpendingChart({ transactions = [], currency = 'USD' }) {
  // Allow toggling between daily breakdown and monthly overview
  const [viewMode, setViewMode] = useState('daily');

  const chartData = useMemo(() => {
    if (viewMode === 'daily') {
      const daily = computeDailyData(transactions, 7);
      // Fallback to monthly if daily has no entries
      return daily.length > 0 ? daily : computeMonthlyData(transactions, 6);
    }
    return computeMonthlyData(transactions, 6);
  }, [transactions, viewMode]);

  const hasData = chartData.length > 0 && chartData.some((d) => d.income > 0 || d.expense > 0);

  return (
    <div className="spending-chart-card card-surface animate-fade-in">
      <div className="chart-card-header">
        <div className="chart-title-group">
          <h3 className="chart-title font-serif">Cash Flow Overview</h3>
          <p className="chart-subtitle">
            {viewMode === 'daily' ? 'Past 7 days income vs. outflow' : '6-month cash flow trajectory'}
          </p>
        </div>

        <div className="chart-actions-group">
          {/* Daily vs Monthly Toggle */}
          <div className="chart-view-toggle">
            <button
              type="button"
              className={`toggle-btn ${viewMode === 'daily' ? 'active' : ''}`}
              onClick={() => setViewMode('daily')}
              title="View daily cash flow breakdown"
            >
              Daily
            </button>
            <button
              type="button"
              className={`toggle-btn ${viewMode === 'monthly' ? 'active' : ''}`}
              onClick={() => setViewMode('monthly')}
              title="View 6-month trend overview"
            >
              Monthly
            </button>
          </div>

          <div className="chart-legend-custom">
            <div className="legend-item">
              <span className="legend-pill sage"></span>
              <span>Income</span>
            </div>
            <div className="legend-item">
              <span className="legend-pill terracotta"></span>
              <span>Expense</span>
            </div>
          </div>
        </div>
      </div>

      <div className="chart-body">
        {hasData ? (
          <ResponsiveContainer width="100%" height={290}>
            <BarChart
              data={chartData}
              margin={{ top: 14, right: 16, left: 0, bottom: 4 }}
              barCategoryGap="28%"
              barGap={3}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAE5DC" />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#858276', fontSize: 11, fontWeight: 500 }}
                dy={6}
                interval={0}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                width={48}
                tick={{ fill: '#858276', fontSize: 11 }}
                tickFormatter={(val) => {
                  if (val >= 1000000) return `${(val / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
                  if (val >= 1000) return `${(val / 1000).toFixed(1).replace(/\.0$/, '')}k`;
                  return val;
                }}
              />
              <Tooltip
                content={<CustomTooltip currency={currency} viewMode={viewMode} />}
                cursor={{ fill: 'rgba(234, 229, 220, 0.4)', radius: 6 }}
              />
              <Bar
                dataKey="income"
                name="Income"
                fill="#3E6B3B"
                shape={<AlignedBar dataKey="income" />}
              />
              <Bar
                dataKey="expense"
                name="Expense"
                fill="#E87952"
                shape={<AlignedBar dataKey="expense" />}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="chart-empty-state">
            <div className="empty-icon-wrap">
              <BarChart3 size={28} />
            </div>
            <div className="empty-title">No cash flow activity yet</div>
            <p className="empty-desc">
              Log transactions to start visualizing your daily and monthly income vs. expense balance.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SpendingChart;
