import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/currency';
import './MiddleOverviewRow.css';

const DEFAULT_CATEGORY_COLORS = {
  'Food & Dining': '#F28B50',
  'Transport': '#A8C995',
  'Shopping': '#F8E7B2',
  'Entertainment': '#C2B5DE',
  'Others': '#9BC5E8',
  'Education': '#E37435',
  'Bills & Utilities': '#F2A07B',
  'Health & Fitness': '#7BAE7F',
  'Travel': '#7CB4DE',
};

export function MiddleOverviewRow({
  transactions = [],
  currency = 'INR',
  onNavigateSurvival,
}) {
  const selectedRange = 'This Month';

  // Compute category totals from transactions
  const expenseTransactions = transactions.filter((t) => t.type === 'EXPENSE');
  const totalSpent = expenseTransactions.reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);

  // Group by category
  const categoryMap = {};
  expenseTransactions.forEach((t) => {
    const cat = t.category || 'Others';
    categoryMap[cat] = (categoryMap[cat] || 0) + (parseFloat(t.amount) || 0);
  });

  let categoryData = Object.keys(categoryMap).map((cat) => ({
    name: cat,
    value: categoryMap[cat],
    percentage: totalSpent > 0 ? Math.round((categoryMap[cat] / totalSpent) * 100) : 0,
    color: DEFAULT_CATEGORY_COLORS[cat] || '#E0926C',
  })).sort((a, b) => b.value - a.value);

  // Fallback if no transactions yet
  if (categoryData.length === 0) {
    categoryData = [
      { name: 'Food & Dining', value: 816, percentage: 32, color: '#F28B50' },
      { name: 'Transport', value: 612, percentage: 24, color: '#A8C995' },
      { name: 'Shopping', value: 459, percentage: 18, color: '#F8E7B2' },
      { name: 'Entertainment', value: 357, percentage: 14, color: '#C2B5DE' },
      { name: 'Others', value: 306, percentage: 12, color: '#9BC5E8' },
    ];
  }

  // Weekly bar data (Mon - Sun)
  const weeklyData = [
    { day: 'Mon', amount: 280, heightPct: 40 },
    { day: 'Tue', amount: 150, heightPct: 20 },
    { day: 'Wed', amount: 420, heightPct: 58 },
    { day: 'Thu', amount: 480, heightPct: 65 },
    { day: 'Fri', amount: 720, heightPct: 95, isPeak: true },
    { day: 'Sat', amount: 360, heightPct: 48 },
    { day: 'Sun', amount: 140, heightPct: 18 },
  ];

  const displaySpent = totalSpent > 0 ? totalSpent : 2550;

  return (
    <div className="middle-overview-grid">
      {/* Card 1: Your Spending Overview */}
      <div className="spending-overview-card card-surface">
        <div className="overview-header">
          <h3 className="overview-title">Your Spending Overview</h3>
          <div className="overview-filter-pill">
            <span>📅 {selectedRange}</span>
            <span className="filter-chevron">⌄</span>
          </div>
        </div>

        <div className="overview-body">
          {/* Donut Chart with Center Total */}
          <div className="donut-chart-section">
            <div className="donut-canvas-wrapper">
              <ResponsiveContainer width={150} height={150}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="#FFFCF8"
                    strokeWidth={2}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center-text">
                <span className="donut-amount tabular-nums">
                  {formatCurrency(displaySpent, currency)}
                </span>
                <span className="donut-sublabel">Total Spent</span>
              </div>
            </div>
          </div>

          {/* Category Breakdown Legend */}
          <div className="category-legend-list">
            {categoryData.slice(0, 5).map((cat) => (
              <div key={cat.name} className="legend-row">
                <span className="legend-dot" style={{ backgroundColor: cat.color }} />
                <span className="legend-name">{cat.name}</span>
                <span className="legend-pct tabular-nums">{cat.percentage}%</span>
              </div>
            ))}
          </div>

          {/* Weekly Bar Chart */}
          <div className="weekly-bars-section">
            <div className="bars-y-axis">
              <span>750</span>
              <span>500</span>
              <span>250</span>
              <span>0</span>
            </div>
            <div className="bars-columns-wrapper">
              {weeklyData.map((d) => (
                <div key={d.day} className="bar-column">
                  <div className="bar-track">
                    {d.isPeak && (
                      <div className="bar-tooltip-pill animate-fade-in">
                        ₹{d.amount}
                      </div>
                    )}
                    <div
                      className={`bar-fill ${d.isPeak ? 'peak-bar' : ''}`}
                      style={{ height: `${d.heightPct}%` }}
                    />
                  </div>
                  <span className="bar-day-label">{d.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Student Survival Mode Teaser */}
      <div className="survival-teaser-card card-surface">
        <div className="survival-teaser-header">
          <div className="survival-title-badge">
            <h3 className="survival-card-title">Student Survival Mode 🎓</h3>
          </div>
          <p className="survival-card-subtitle">Make your allowance last longer!</p>
        </div>

        <div className="survival-teaser-content">
          {/* Left: Circular radial gauge */}
          <div className="radial-gauge-wrapper">
            <div className="radial-gauge-circle">
              <svg viewBox="0 0 100 100" className="radial-gauge-svg">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#E8F4E1"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#50963C"
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 * (1 - 0.68)}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="gauge-inner-text">
                <span className="gauge-score">68%</span>
                <span className="gauge-status">On Track</span>
              </div>
            </div>
          </div>

          {/* Right: 3D Graduation Cap on Books Illustration */}
          <div className="survival-3d-graphic" aria-hidden="true">
            <svg width="115" height="100" viewBox="0 0 120 100" fill="none">
              <defs>
                <linearGradient id="bookGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F59E66" />
                  <stop offset="100%" stopColor="#D96832" />
                </linearGradient>
                <linearGradient id="bookGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFAAA6" />
                  <stop offset="100%" stopColor="#E56B6F" />
                </linearGradient>
                <filter id="capShadow" x="-10%" y="-10%" width="130%" height="130%">
                  <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#3B261D" floodOpacity="0.2" />
                </filter>
              </defs>
              {/* Stacked books */}
              <rect x="25" y="65" width="75" height="16" rx="4" fill="url(#bookGrad1)" />
              <rect x="28" y="69" width="69" height="3" rx="1.5" fill="#FFE5D4" />
              <rect x="20" y="52" width="70" height="15" rx="4" fill="url(#bookGrad2)" />
              <rect x="23" y="56" width="64" height="3" rx="1.5" fill="#FFF0EB" />

              {/* Graduation Cap */}
              <path
                d="M58 20L95 34L58 46L21 34L58 20Z"
                fill="#3A3238"
                filter="url(#capShadow)"
              />
              <path d="M58 20L95 34L58 46L21 34L58 20Z" stroke="#4F464C" strokeWidth="1" />
              {/* Cap skull base */}
              <path d="M38 38V47C38 52 47 56 58 56C69 56 78 52 78 47V38" fill="#2E272C" />
              {/* Gold Tassel */}
              <circle cx="58" cy="33" r="2.5" fill="#F8C76A" />
              <path d="M58 33C64 36 70 42 72 49" stroke="#F8C76A" strokeWidth="2" strokeLinecap="round" />
              <rect x="70" y="49" width="4" height="8" rx="2" fill="#E6A633" />

              {/* Little calendar check pad */}
              <rect x="75" y="58" width="28" height="30" rx="4" fill="#FFFFFF" stroke="#EAD5C5" strokeWidth="1" />
              <rect x="75" y="58" width="28" height="8" rx="3" fill="#F28B50" />
              <circle cx="82" cy="62" r="1.5" fill="#FFFFFF" />
              <circle cx="95" cy="62" r="1.5" fill="#FFFFFF" />
              <line x1="80" y1="72" x2="98" y2="72" stroke="#A8988C" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="80" y1="78" x2="94" y2="78" stroke="#A8988C" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="80" y1="84" x2="90" y2="84" stroke="#50963C" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <button
          type="button"
          className="survival-view-details-btn"
          onClick={onNavigateSurvival}
        >
          View Details →
        </button>
      </div>
    </div>
  );
}

export default MiddleOverviewRow;
