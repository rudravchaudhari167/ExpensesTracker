import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  computeMonthlyData,
  computeCategorySpending,
  computeInsights,
} from '../../utils/analytics';
import { formatCurrency } from '../../utils/currency';
import { CategoryIcon } from '../../utils/categoryIcons';
import {
  TrendingUp,
  Award,
  Sparkles,
  PieChart as PieIcon,
  BarChart3,
  Lightbulb,
  ArrowUpRight,
  Info,
} from 'lucide-react';
import './AnalyticsDeepDive.css';

export function AnalyticsDeepDive({ transactions = [], summary = {}, currency = 'USD' }) {
  const monthlyData = useMemo(() => computeMonthlyData(transactions), [transactions]);
  const categorySpending = useMemo(() => computeCategorySpending(transactions), [transactions]);
  const insights = useMemo(() => computeInsights(transactions, summary), [transactions, summary]);

  const hasData = transactions.length > 0;
  const hasExpenses = categorySpending.length > 0;

  return (
    <div className="analytics-container animate-fade-in">
      {/* Header Banner */}
      <div className="analytics-hero card-surface">
        <div className="analytics-hero-text">
          <div className="analytics-pill">
            <Sparkles size={13} />
            <span>Deep Insights</span>
          </div>
          <h2 className="analytics-hero-title font-serif">
            Financial Rhythm & Intelligence
          </h2>
          <p className="analytics-hero-subtitle">
            Derived directly from your verified Spring Boot & MySQL transactions.
          </p>
        </div>
      </div>

      {hasData ? (
        <>
          {/* Smart Insights Cards */}
          {insights.insightsList.length > 0 && (
            <div className="insights-grid">
              {insights.insightsList.map((item, idx) => (
                <div key={idx} className={`insight-card card-surface type-${item.type}`}>
                  <div className="insight-card-top">
                    <span className="insight-title">{item.title}</span>
                    <span className="insight-highlight">{item.highlight}</span>
                  </div>
                  <p className="insight-text">{item.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* Charts Row: Monthly Cash Flow & Category Pie */}
          <div className="analytics-charts-grid">
            {/* Monthly Trend Chart */}
            <div className="analytics-chart-box card-surface">
              <div className="analytics-chart-header">
                <div>
                  <h3 className="chart-box-title font-serif">Monthly Cash Flow</h3>
                  <p className="chart-box-subtitle">Income vs Outflow breakdown</p>
                </div>
              </div>

              <div className="chart-canvas-wrap">
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAE5DC" />
                      <XAxis dataKey="month" stroke="#858276" fontSize={12} tickLine={false} />
                      <YAxis stroke="#858276" fontSize={12} tickLine={false} />
                      <Tooltip
                        formatter={(val) => [formatCurrency(val, currency), '']}
                        contentStyle={{
                          background: '#FFFFFF',
                          borderColor: '#EAE5DC',
                          borderRadius: '12px',
                          boxShadow: '0 4px 12px rgba(40,40,32,0.08)',
                        }}
                      />
                      <Bar dataKey="income" name="Income" fill="#3E6B3B" radius={[6, 6, 0, 0]} maxBarSize={32} />
                      <Bar dataKey="expense" name="Expense" fill="#E87952" radius={[6, 6, 0, 0]} maxBarSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="analytics-empty-chart">Insufficient monthly timeline data</div>
                )}
              </div>
            </div>

            {/* Category Donut Distribution */}
            <div className="analytics-chart-box card-surface">
              <div className="analytics-chart-header">
                <div>
                  <h3 className="chart-box-title font-serif">Category Allocation</h3>
                  <p className="chart-box-subtitle">Share of total expenditures</p>
                </div>
              </div>

              <div className="chart-canvas-wrap">
                {hasExpenses ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={categorySpending}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                      >
                        {categorySpending.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val) => [formatCurrency(val, currency), 'Total']}
                        contentStyle={{
                          background: '#FFFFFF',
                          borderColor: '#EAE5DC',
                          borderRadius: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="analytics-empty-chart">No expenses logged to allocate</div>
                )}
              </div>
            </div>
          </div>

          {/* Highest-Spending Categories Leaderboard */}
          {hasExpenses && (
            <div className="leaderboard-card card-surface">
              <div className="leaderboard-header">
                <h3 className="leaderboard-title font-serif">Highest Spending Categories</h3>
                <p className="leaderboard-subtitle">Ranked by overall financial weight</p>
              </div>

              <div className="leaderboard-list">
                {categorySpending.map((cat, idx) => (
                  <div key={cat.name} className="leaderboard-item">
                    <div className="leaderboard-rank tabular-nums font-serif">#{idx + 1}</div>
                    <CategoryIcon category={cat.name} type="EXPENSE" size={17} />
                    <div className="leaderboard-info">
                      <div className="leaderboard-name-row">
                        <span className="leaderboard-name">{cat.name}</span>
                        <span className="leaderboard-amount tabular-nums font-serif">
                          {formatCurrency(cat.value, currency)}
                        </span>
                      </div>
                      <div className="leaderboard-progress-bg">
                        <div
                          className="leaderboard-progress-fill"
                          style={{
                            width: `${cat.percentage}%`,
                            backgroundColor: cat.color,
                          }}
                        />
                      </div>
                    </div>
                    <div className="leaderboard-share tabular-nums">{cat.percentage}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="analytics-empty-state card-surface">
          <div className="empty-icon-wrap">
            <BarChart3 size={32} />
          </div>
          <h3 className="empty-title font-serif">No Analytics Available Yet</h3>
          <p className="empty-desc">
            We compute genuine analytics only from verified transactions in your Spring Boot & MySQL ledger.
            Add transactions to begin visualizing your spending patterns and rhythm.
          </p>
        </div>
      )}
    </div>
  );
}

export default AnalyticsDeepDive;
