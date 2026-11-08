import React, { useState, useMemo, useRef, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Check } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import './MiddleOverviewRow.css';

const DEFAULT_CATEGORY_COLORS = {
  'Food & Dining': '#F28B50',
  'Groceries': '#E87952',
  'Transport': '#A8C995',
  'Shopping': '#F8E7B2',
  'Entertainment': '#C2B5DE',
  'Drinks': '#E5A070',
  'Coffee': '#D96832',
  'Utilities': '#B87A5E',
  'Bills & Utilities': '#F2A07B',
  'Education': '#E37435',
  'Health & Fitness': '#7BAE7F',
  'Travel': '#7CB4DE',
  'Others': '#9BC5E8',
};

const RANGE_OPTIONS = [
  { id: 'this-month', label: 'This Month' },
  { id: 'all', label: 'All Time' },
  { id: '0', label: 'January' },
  { id: '1', label: 'February' },
  { id: '2', label: 'March' },
  { id: '3', label: 'April' },
  { id: '4', label: 'May' },
  { id: '5', label: 'June' },
  { id: '6', label: 'July' },
  { id: '7', label: 'August' },
  { id: '8', label: 'September' },
  { id: '9', label: 'October' },
  { id: '10', label: 'November' },
  { id: '11', label: 'December' },
];

export function MiddleOverviewRow({
  transactions = [],
  currency = 'INR',
  onNavigateSurvival,
}) {
  const [selectedRange, setSelectedRange] = useState('this-month');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const activeOption = RANGE_OPTIONS.find((opt) => opt.id === selectedRange) || RANGE_OPTIONS[0];

  const hasAnyTransactions = transactions.some((t) => t.type === 'EXPENSE');

  // Filter expenses based on selected timeframe or month
  const filteredExpenses = useMemo(() => {
    const allExpenses = transactions.filter((t) => t.type === 'EXPENSE');

    if (selectedRange === 'all') {
      return allExpenses;
    }

    if (selectedRange === 'this-month') {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth(); // 0-indexed

      return allExpenses.filter((t) => {
        if (!t.date) return false;
        const parts = t.date.split('-');
        if (parts.length < 2) return false;
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        return y === currentYear && m === currentMonth;
      });
    }

    // Specific month selected (0 to 11)
    const monthIndex = parseInt(selectedRange, 10);
    if (!isNaN(monthIndex)) {
      return allExpenses.filter((t) => {
        if (!t.date) return false;
        const parts = t.date.split('-');
        if (parts.length < 2) return false;
        const m = parseInt(parts[1], 10) - 1;
        return m === monthIndex;
      });
    }

    return allExpenses;
  }, [transactions, selectedRange]);

  // Compute category breakdown and total spent
  const { categoryData, totalSpent } = useMemo(() => {
    if (!hasAnyTransactions) {
      // Clean sample breakdown when no transactions exist in the database
      return {
        categoryData: [
          { name: 'Food & Dining', value: 816, percentage: 32, color: '#F28B50' },
          { name: 'Transport', value: 612, percentage: 24, color: '#A8C995' },
          { name: 'Shopping', value: 459, percentage: 18, color: '#F8E7B2' },
          { name: 'Entertainment', value: 357, percentage: 14, color: '#C2B5DE' },
          { name: 'Others', value: 306, percentage: 12, color: '#9BC5E8' },
        ],
        totalSpent: 2550,
      };
    }

    const sum = filteredExpenses.reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);

    const categoryMap = {};
    filteredExpenses.forEach((t) => {
      const cat = t.category || 'Others';
      categoryMap[cat] = (categoryMap[cat] || 0) + (parseFloat(t.amount) || 0);
    });

    const list = Object.keys(categoryMap)
      .map((cat) => ({
        name: cat,
        value: categoryMap[cat],
        percentage: sum > 0 ? Math.round((categoryMap[cat] / sum) * 100) : 0,
        color: DEFAULT_CATEGORY_COLORS[cat] || '#E0926C',
      }))
      .sort((a, b) => b.value - a.value);

    return { categoryData: list, totalSpent: sum };
  }, [filteredExpenses, hasAnyTransactions]);

  // Compute Weekly (Mon-Sun) breakdown
  const { weeklyData, yAxisMax } = useMemo(() => {
    if (!hasAnyTransactions) {
      return {
        weeklyData: [
          { day: 'Mon', amount: 280, heightPct: 40 },
          { day: 'Tue', amount: 150, heightPct: 20 },
          { day: 'Wed', amount: 420, heightPct: 58 },
          { day: 'Thu', amount: 480, heightPct: 65 },
          { day: 'Fri', amount: 720, heightPct: 95, isPeak: true },
          { day: 'Sat', amount: 360, heightPct: 48 },
          { day: 'Sun', amount: 140, heightPct: 18 },
        ],
        yAxisMax: 750,
      };
    }

    const dayTotals = {
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
      Sun: 0,
    };

    filteredExpenses.forEach((t) => {
      if (t.date) {
        const parts = t.date.split('-');
        if (parts.length === 3) {
          const dt = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
          const dayIndex = dt.getDay(); // 0 = Sun, 1 = Mon, ...
          const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const dayName = dayNames[dayIndex];
          dayTotals[dayName] += (parseFloat(t.amount) || 0);
        }
      }
    });

    const maxVal = Math.max(...Object.values(dayTotals), 0);
    const chartMax = maxVal > 0 ? Math.ceil(maxVal / 50) * 50 : 750;

    const daysOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = daysOrder.map((day) => {
      const amt = dayTotals[day];
      const isPeak = maxVal > 0 && amt === maxVal;
      const heightPct = maxVal > 0 ? Math.max(12, Math.round((amt / chartMax) * 92)) : 8;
      return {
        day,
        amount: amt,
        heightPct,
        isPeak,
      };
    });

    return { weeklyData: data, yAxisMax: chartMax };
  }, [filteredExpenses, hasAnyTransactions]);

  const peakAmount = weeklyData.find((d) => d.isPeak)?.amount || 0;

  return (
    <div className="middle-overview-grid">
      {/* Card 1: Your Spending Overview */}
      <div className="spending-overview-card card-surface">
        <div className="overview-header">
          <h3 className="overview-title">Your Spending Overview</h3>

          {/* Interactive Month Selector Dropdown */}
          <div className="overview-filter-wrapper" ref={dropdownRef}>
            <button
              type="button"
              className={`overview-filter-pill ${isDropdownOpen ? 'open' : ''}`}
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              aria-haspopup="listbox"
              aria-expanded={isDropdownOpen}
              aria-label="Filter spending by month"
            >
              <span>📅 {activeOption.label}</span>
              <span className="filter-chevron">⌄</span>
            </button>

            {isDropdownOpen && (
              <div className="overview-dropdown-menu animate-scale-up" role="listbox">
                <div className="dropdown-section-title">Timeframe</div>
                <button
                  type="button"
                  className={`overview-dropdown-item ${selectedRange === 'this-month' ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedRange('this-month');
                    setIsDropdownOpen(false);
                  }}
                >
                  <span>This Month</span>
                  {selectedRange === 'this-month' && <Check size={14} className="dropdown-check-icon" />}
                </button>
                <button
                  type="button"
                  className={`overview-dropdown-item ${selectedRange === 'all' ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedRange('all');
                    setIsDropdownOpen(false);
                  }}
                >
                  <span>All Time</span>
                  {selectedRange === 'all' && <Check size={14} className="dropdown-check-icon" />}
                </button>

                <div className="dropdown-divider" />
                <div className="dropdown-section-title">Select Month</div>

                {RANGE_OPTIONS.slice(2).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`overview-dropdown-item ${selectedRange === opt.id ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedRange(opt.id);
                      setIsDropdownOpen(false);
                    }}
                  >
                    <span>{opt.label}</span>
                    {selectedRange === opt.id && <Check size={14} className="dropdown-check-icon" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="overview-body">
          {/* Donut Chart with Center Total */}
          <div className="donut-chart-section">
            <div className="donut-canvas-wrapper">
              <ResponsiveContainer width={150} height={150}>
                <PieChart>
                  {categoryData.length > 0 ? (
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={46}
                      outerRadius={68}
                      paddingAngle={categoryData.length > 1 ? 3 : 0}
                      dataKey="value"
                      stroke="#FFFCF8"
                      strokeWidth={2}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  ) : (
                    <Pie
                      data={[{ value: 1 }]}
                      cx="50%"
                      cy="50%"
                      innerRadius={46}
                      outerRadius={68}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill="#F5ECE4" />
                    </Pie>
                  )}
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center-text">
                <span className="donut-amount tabular-nums">
                  {formatCurrency(totalSpent, currency)}
                </span>
                <span className="donut-sublabel">Total Spent</span>
              </div>
            </div>
          </div>

          {/* Category Breakdown Legend */}
          <div className="category-legend-list">
            {categoryData.length > 0 ? (
              categoryData.slice(0, 5).map((cat) => (
                <div key={cat.name} className="legend-row">
                  <span className="legend-dot" style={{ backgroundColor: cat.color }} />
                  <span className="legend-name" title={cat.name}>{cat.name}</span>
                  <span className="legend-pct tabular-nums">{cat.percentage}%</span>
                </div>
              ))
            ) : (
              <div className="empty-overview-legend">
                <span className="empty-legend-title">No expenses</span>
                <span className="empty-legend-sub">Recorded in {activeOption.label}</span>
              </div>
            )}
          </div>

          {/* Weekly Bar Chart */}
          <div className="weekly-bars-section">
            <div className="bars-y-axis">
              <span>{yAxisMax}</span>
              <span>{Math.round(yAxisMax * 0.66)}</span>
              <span>{Math.round(yAxisMax * 0.33)}</span>
              <span>0</span>
            </div>
            <div className="bars-columns-wrapper">
              {weeklyData.map((d) => (
                <div key={d.day} className="bar-column">
                  <div className="bar-track">
                    {d.isPeak && peakAmount > 0 && (
                      <div className="bar-tooltip-pill animate-fade-in">
                        {formatCurrency(peakAmount, currency, { fractionDigits: 0 })}
                      </div>
                    )}
                    <div
                      className={`bar-fill ${d.isPeak && peakAmount > 0 ? 'peak-bar' : ''}`}
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
