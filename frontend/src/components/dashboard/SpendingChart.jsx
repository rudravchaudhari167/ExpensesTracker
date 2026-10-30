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
    const incomeVal = payload.find((p) => p.dataKey === 'income')?.value || 0;
    const expenseVal = payload.find((p) => p.dataKey === 'expense')?.value || 0;
    const netVal = Math.round((incomeVal - expenseVal) * 100) / 100;

    return (
      <div className="custom-chart-tooltip card-surface">
        <div className="tooltip-header">
          {viewMode === 'daily' ? `Date: ${label}` : `Month: ${label}`}
        </div>
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

export function SpendingChart({ transactions = [], currency = 'USD' }) {
  // Allow toggling between daily breakdown and monthly overview
  const [viewMode, setViewMode] = useState('daily');

  const chartData = useMemo(() => {
    if (viewMode === 'daily') {
      const daily = computeDailyData(transactions, 14);
      // Fallback to monthly if daily has no entries
      return daily.length > 0 ? daily : computeMonthlyData(transactions);
    }
    return computeMonthlyData(transactions);
  }, [transactions, viewMode]);

  const hasData = chartData.length > 0 && chartData.some((d) => d.income > 0 || d.expense > 0);

  // Period total net calculation
  const periodTotals = useMemo(() => {
    let inc = 0;
    let exp = 0;
    chartData.forEach((d) => {
      inc += d.income || 0;
      exp += d.expense || 0;
    });
    return {
      income: inc,
      expense: exp,
      net: inc - exp,
    };
  }, [chartData]);

  return (
    <div className="spending-chart-card card-surface animate-fade-in">
      <div className="chart-card-header">
        <div className="chart-title-group">
          <h3 className="chart-title font-serif">Cash Flow Overview</h3>
          <p className="chart-subtitle">
            {viewMode === 'daily' ? 'Recent daily income vs. outflow' : 'Monthly income vs. outflow trends'}
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
              margin={{ top: 12, right: 16, left: 0, bottom: 0 }}
              barGap={6}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAE5DC" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#858276', fontSize: 11 }}
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
                cursor={{ fill: 'rgba(234, 229, 220, 0.4)' }}
              />
              <Bar
                dataKey="income"
                name="Income"
                fill="#3E6B3B"
                radius={[6, 6, 0, 0]}
                maxBarSize={32}
              />
              <Bar
                dataKey="expense"
                name="Expense"
                fill="#E87952"
                radius={[6, 6, 0, 0]}
                maxBarSize={32}
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
