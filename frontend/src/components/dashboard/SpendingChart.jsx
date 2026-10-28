import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { computeMonthlyData } from '../../utils/analytics';
import { formatCurrency } from '../../utils/currency';
import { BarChart3, TrendingUp, Sparkles } from 'lucide-react';
import './SpendingChart.css';

/**
 * Custom Tooltip for Cash Flow Chart
 */
function CustomTooltip({ active, payload, label, currency }) {
  if (active && payload && payload.length) {
    const incomeVal = payload.find((p) => p.dataKey === 'income')?.value || 0;
    const expenseVal = payload.find((p) => p.dataKey === 'expense')?.value || 0;
    const netVal = incomeVal - expenseVal;

    return (
      <div className="custom-chart-tooltip card-surface">
        <div className="tooltip-header">{label}</div>
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
  const chartData = useMemo(() => {
    return computeMonthlyData(transactions);
  }, [transactions]);

  const hasData = chartData.length > 0;

  return (
    <div className="spending-chart-card card-surface animate-fade-in">
      <div className="chart-card-header">
        <div>
          <h3 className="chart-title font-serif">Cash Flow Overview</h3>
          <p className="chart-subtitle">Monthly income vs. outflow trends</p>
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

      <div className="chart-body">
        {hasData ? (
          <ResponsiveContainer width="100%" height={290}>
            <BarChart
              data={chartData}
              margin={{ top: 12, right: 12, left: -16, bottom: 0 }}
              barGap={6}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAE5DC" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#858276', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#858276', fontSize: 12 }}
                tickFormatter={(val) => {
                  if (val >= 1000) return `${val / 1000}k`;
                  return val;
                }}
              />
              <Tooltip
                content={<CustomTooltip currency={currency} />}
                cursor={{ fill: 'rgba(234, 229, 220, 0.4)' }}
              />
              <Bar
                dataKey="income"
                name="Income"
                fill="#3E6B3B"
                radius={[6, 6, 0, 0]}
                maxBarSize={36}
              />
              <Bar
                dataKey="expense"
                name="Expense"
                fill="#E87952"
                radius={[6, 6, 0, 0]}
                maxBarSize={36}
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
              Log transactions to start visualizing your monthly income vs. expense balance.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SpendingChart;
