import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  computeWealthTrajectory,
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
  Waves,
  Activity,
  Layers,
} from 'lucide-react';
import './AnalyticsDeepDive.css';

/**
 * Custom Creative Tooltip for Wealth Trajectory & Savings Wave Chart
 */
function WealthTooltip({ active, payload, label, currency, viewMode }) {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload || {};
    const isTrajectory = viewMode === 'trajectory';

    return (
      <div className="custom-analytics-tooltip card-surface">
        <div className="tooltip-period-row">
          <span className="tooltip-period-label">{data.fullMonth || label}</span>
          <span className={`tooltip-savings-tag ${data.net >= 0 ? 'positive' : 'negative'}`}>
            {data.net >= 0 ? `+${formatCurrency(data.net, currency)} Net` : `${formatCurrency(data.net, currency)} Net`}
          </span>
        </div>

        {isTrajectory && (
          <div className="tooltip-main-metric">
            <span className="metric-caption">Cumulative Wealth Position</span>
            <span className={`metric-value font-serif ${data.cumulativeBalance >= 0 ? 'text-sage' : 'text-danger'}`}>
              {formatCurrency(data.cumulativeBalance, currency)}
            </span>
          </div>
        )}

        <div className="tooltip-details-grid">
          <div className="detail-item">
            <span className="dot dot-income"></span>
            <span className="detail-name">Income:</span>
            <span className="detail-val tabular-nums">{formatCurrency(data.income, currency)}</span>
          </div>
          <div className="detail-item">
            <span className="dot dot-expense"></span>
            <span className="detail-name">Outflow:</span>
            <span className="detail-val tabular-nums">{formatCurrency(data.expense, currency)}</span>
          </div>
        </div>

        <div className="tooltip-footer-row">
          <span className="footer-label">Savings Retention:</span>
          <span className="footer-rate tabular-nums">{data.savingsRate}%</span>
        </div>
      </div>
    );
  }
  return null;
}

export function AnalyticsDeepDive({ transactions = [], summary = {}, currency = 'USD' }) {
  const [chartMode, setChartMode] = useState('trajectory'); // 'trajectory' | 'waves'

  const trajectoryData = useMemo(() => computeWealthTrajectory(transactions, 6), [transactions]);
  const categorySpending = useMemo(() => computeCategorySpending(transactions), [transactions]);
  const insights = useMemo(() => computeInsights(transactions, summary), [transactions, summary]);

  const hasData = transactions.length > 0;
  const hasExpenses = categorySpending.length > 0;

  // Key trajectory highlights
  const trajectoryStats = useMemo(() => {
    if (!trajectoryData.length) return { peak: 0, current: 0, rate: 0 };
    const peak = Math.max(...trajectoryData.map((d) => d.cumulativeBalance), 0);
    const current = trajectoryData[trajectoryData.length - 1].cumulativeBalance;
    const totalInc = trajectoryData.reduce((acc, d) => acc + (d.income || 0), 0);
    const totalExp = trajectoryData.reduce((acc, d) => acc + (d.expense || 0), 0);
    const rate = totalInc > 0 ? Math.max(0, Math.round(((totalInc - totalExp) / totalInc) * 100)) : 0;
    return { peak, current, rate };
  }, [trajectoryData]);

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

          {/* Charts Row: Creative Wealth Trajectory Area Chart & Category Pie */}
          <div className="analytics-charts-grid">
            {/* Creative Net Wealth Trajectory & Savings Wave Chart */}
            <div className="analytics-chart-box card-surface">
              <div className="analytics-chart-header-row">
                <div>
                  <h3 className="chart-box-title font-serif">
                    {chartMode === 'trajectory' ? 'Net Wealth Trajectory' : 'Savings & Flow Wave'}
                  </h3>
                  <p className="chart-box-subtitle">
                    {chartMode === 'trajectory'
                      ? 'Cumulative savings and financial capital accumulation'
                      : 'Dual spline stream of inflows vs expenditures'}
                  </p>
                </div>

                {/* Interactive Mode Toggle */}
                <div className="analytics-toggle-group">
                  <button
                    type="button"
                    className={`analytics-toggle-btn ${chartMode === 'trajectory' ? 'active' : ''}`}
                    onClick={() => setChartMode('trajectory')}
                    title="View cumulative wealth curve"
                  >
                    <TrendingUp size={13} />
                    <span>Trajectory</span>
                  </button>
                  <button
                    type="button"
                    className={`analytics-toggle-btn ${chartMode === 'waves' ? 'active' : ''}`}
                    onClick={() => setChartMode('waves')}
                    title="View income vs outflow waves"
                  >
                    <Waves size={13} />
                    <span>Stream Waves</span>
                  </button>
                </div>
              </div>

              {/* Trajectory Badge Stats */}
              <div className="analytics-chart-badges">
                <span className="analytics-badge-pill highlight">
                  <Activity size={12} />
                  <span>Peak Wealth: {formatCurrency(trajectoryStats.peak, currency)}</span>
                </span>
                <span className="analytics-badge-pill">
                  <span>Savings Retention: {trajectoryStats.rate}%</span>
                </span>
              </div>

              <div className="chart-canvas-wrap">
                {trajectoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart
                      data={trajectoryData}
                      margin={{ top: 16, right: 16, left: 0, bottom: 4 }}
                    >
                      <defs>
                        {/* Emerald Wealth Trajectory Gradient */}
                        <linearGradient id="wealthGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3E6B3B" stopOpacity={0.45} />
                          <stop offset="60%" stopColor="#3E6B3B" stopOpacity={0.12} />
                          <stop offset="95%" stopColor="#3E6B3B" stopOpacity={0.01} />
                        </linearGradient>

                        {/* Income Wave Ribbon Gradient */}
                        <linearGradient id="incomeWaveGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3E6B3B" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#3E6B3B" stopOpacity={0.02} />
                        </linearGradient>

                        {/* Expense Wave Ribbon Gradient */}
                        <linearGradient id="expenseWaveGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#E87952" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#E87952" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>

                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAE5DC" />

                      <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#858276', fontSize: 11, fontWeight: 500 }}
                        dy={6}
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
                        content={<WealthTooltip currency={currency} viewMode={chartMode} />}
                        cursor={{ stroke: '#3E6B3B', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                      />

                      {chartMode === 'trajectory' ? (
                        <Area
                          type="monotone"
                          dataKey="cumulativeBalance"
                          name="Net Wealth Position"
                          stroke="#3E6B3B"
                          strokeWidth={3}
                          fill="url(#wealthGrad)"
                          dot={{ r: 4, stroke: '#3E6B3B', strokeWidth: 2, fill: '#FFFFFF' }}
                          activeDot={{ r: 6, stroke: '#2B4D29', strokeWidth: 2.5, fill: '#FFFFFF' }}
                        />
                      ) : (
                        <>
                          <Area
                            type="monotone"
                            dataKey="income"
                            name="Income Stream"
                            stroke="#3E6B3B"
                            strokeWidth={2.5}
                            fill="url(#incomeWaveGrad)"
                            dot={{ r: 3, stroke: '#3E6B3B', strokeWidth: 1.5, fill: '#FFFFFF' }}
                          />
                          <Area
                            type="monotone"
                            dataKey="expense"
                            name="Expense Stream"
                            stroke="#E87952"
                            strokeWidth={2.5}
                            fill="url(#expenseWaveGrad)"
                            dot={{ r: 3, stroke: '#E87952', strokeWidth: 1.5, fill: '#FFFFFF' }}
                          />
                        </>
                      )}
                    </AreaChart>
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
