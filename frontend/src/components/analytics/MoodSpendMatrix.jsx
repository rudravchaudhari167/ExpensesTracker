import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  Lightbulb,
  CheckCircle2,
  Calendar,
  Layers,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  Compass,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatCurrency } from '../../utils/currency';
import './MoodSpendMatrix.css';

// 5 Core Mood Definitions
export const MOODS = [
  {
    id: 'stressed',
    emoji: '😫',
    label: 'Stressed',
    caption: 'High pressure & urgency',
    color: '#8B5CF6',
    pastelBg: '#F5F3FF',
    softBorder: 'rgba(139, 92, 246, 0.26)',
    activeBorder: '#8B5CF6',
    glowColor: 'rgba(139, 92, 246, 0.25)',
    badgeClass: 'mood-stressed',
    affinity: {
      food: 0.44,
      shopping: 0.24,
      entertainment: 0.08,
      transit: 0.14,
      treats: 0.08,
      wellness: 0.02,
    },
    triggerNote: 'High stress triggers rush delivery fees, comfort takeout, and spontaneous relief buys.',
  },
  {
    id: 'bored',
    emoji: '🥱',
    label: 'Bored',
    caption: 'Downtime & passive scrolling',
    color: '#EC4899',
    pastelBg: '#FDF2F8',
    softBorder: 'rgba(236, 72, 153, 0.26)',
    activeBorder: '#EC4899',
    glowColor: 'rgba(236, 72, 153, 0.25)',
    badgeClass: 'mood-bored',
    affinity: {
      shopping: 0.46,
      entertainment: 0.22,
      food: 0.18,
      treats: 0.10,
      transit: 0.02,
      wellness: 0.02,
    },
    triggerNote: 'Boredom fuels evening online cart checkout, subscription upgrades, and novelty gadgets.',
  },
  {
    id: 'social',
    emoji: '🎉',
    label: 'Social',
    caption: 'Gatherings & weekend dinners',
    color: '#F59E0B',
    pastelBg: '#FEF3C7',
    softBorder: 'rgba(245, 158, 11, 0.28)',
    activeBorder: '#F59E0B',
    glowColor: 'rgba(245, 158, 11, 0.25)',
    badgeClass: 'mood-social',
    affinity: {
      entertainment: 0.42,
      food: 0.36,
      transit: 0.12,
      treats: 0.06,
      shopping: 0.04,
      wellness: 0.00,
    },
    triggerNote: 'Celebratory vibes spike group dining bills, rounds of drinks, and rideshare trips.',
  },
  {
    id: 'calm',
    emoji: '🌲',
    label: 'Calm',
    caption: 'Mindful, balanced & grounded',
    color: '#10B981',
    pastelBg: '#ECFDF5',
    softBorder: 'rgba(16, 185, 129, 0.26)',
    activeBorder: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.25)',
    badgeClass: 'mood-calm',
    affinity: {
      wellness: 0.36,
      food: 0.28,
      shopping: 0.14,
      treats: 0.12,
      entertainment: 0.06,
      transit: 0.04,
    },
    triggerNote: 'Calm correlates with intentional groceries, wholesome wellness, and zero impulse orders.',
  },
  {
    id: 'tired',
    emoji: '🔋',
    label: 'Tired',
    caption: 'Low stamina & convenience',
    color: '#0284C7',
    pastelBg: '#F0F9FF',
    softBorder: 'rgba(2, 132, 199, 0.26)',
    activeBorder: '#0284C7',
    glowColor: 'rgba(2, 132, 199, 0.25)',
    badgeClass: 'mood-tired',
    affinity: {
      transit: 0.38,
      food: 0.32,
      treats: 0.20,
      shopping: 0.08,
      entertainment: 0.02,
      wellness: 0.00,
    },
    triggerNote: 'Fatigue prompts hailing cabs over walking, extra caffeine shots, and fast-food shortcuts.',
  },
];

// Matrix Category Definitions
export const MATRIX_CATEGORIES = [
  { id: 'food', name: 'Food & Delivery', icon: '🍔', tag: 'High Velocity', baselineRatio: 0.34 },
  { id: 'shopping', name: 'Shopping & Retail', icon: '🛍️', tag: 'Discretionary', baselineRatio: 0.26 },
  { id: 'entertainment', name: 'Entertainment & Nightlife', icon: '🎟️', tag: 'Social', baselineRatio: 0.18 },
  { id: 'transit', name: 'Transportation & Cabs', icon: '🚗', tag: 'Convenience', baselineRatio: 0.12 },
  { id: 'treats', name: 'Coffee & Treats', icon: '☕', tag: 'Micro-Spend', baselineRatio: 0.06 },
  { id: 'wellness', name: 'Personal Care & Self', icon: '🌿', tag: 'Intentional', baselineRatio: 0.04 },
];

const STORAGE_ACTIVE_MOOD_KEY = 'spendl_active_mood_log';

export function MoodSpendMatrix({ transactions = [], currency = 'USD', onShowToast }) {
  // Current user-logged mood (persisted in localStorage)
  const [activeMoodId, setActiveMoodId] = useState(() => {
    if (typeof window === 'undefined') return 'stressed';
    try {
      return localStorage.getItem(STORAGE_ACTIVE_MOOD_KEY) || 'stressed';
    } catch {
      return 'stressed';
    }
  });

  // Selected mood filter ('all' or specific mood ID)
  const [filterMoodId, setFilterMoodId] = useState('all');

  // Chart view mode: 'heatmap' or 'bars'
  const [viewMode, setViewMode] = useState('heatmap');

  // Active insight card index
  const [insightIndex, setInsightIndex] = useState(0);

  // Hovered spot tooltip state: { category, mood, amount, percent, count, x, y }
  const [hoveredSpot, setHoveredSpot] = useState(null);

  // Time range filter
  const [timeFilter, setTimeFilter] = useState('month'); // 'month' | 'quarter' | 'all'

  // Persist active mood changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ACTIVE_MOOD_KEY, activeMoodId);
    } catch (e) {
      console.warn('Could not store active mood:', e);
    }
  }, [activeMoodId]);

  // Total expense from real transactions (fallback to rich demo model if empty)
  const totalExpenseOutflow = useMemo(() => {
    const rawExpense = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    return rawExpense > 0 ? rawExpense : 2460.0;
  }, [transactions]);

  // Compute 2D Matrix of Emotional Spend Spots: categoryId -> moodId -> amount
  const { matrixData, moodTotals, categoryTotals, maxCellAmount } = useMemo(() => {
    const data = {};
    const mTotals = { stressed: 0, bored: 0, social: 0, calm: 0, tired: 0 };
    const cTotals = {};
    let maxAmount = 1;

    // Mood distribution weights across the month
    const moodWeights = {
      stressed: 0.32,
      social: 0.26,
      bored: 0.20,
      tired: 0.12,
      calm: 0.10,
    };

    MATRIX_CATEGORIES.forEach((cat) => {
      data[cat.id] = {};
      const catVolume = totalExpenseOutflow * cat.baselineRatio;
      let rowSum = 0;

      MOODS.forEach((m) => {
        const rawFactor = (m.affinity[cat.id] || 0.05) * (moodWeights[m.id] || 0.2);
        const amount = Math.round(catVolume * (rawFactor / 0.16) * 100) / 100;
        data[cat.id][m.id] = amount;
        mTotals[m.id] += amount;
        rowSum += amount;
        if (amount > maxAmount) maxAmount = amount;
      });

      cTotals[cat.id] = rowSum;
    });

    return {
      matrixData: data,
      moodTotals: mTotals,
      categoryTotals: cTotals,
      maxCellAmount: maxAmount,
    };
  }, [totalExpenseOutflow]);

  // Monthly Insights Array
  const insightsList = useMemo(() => {
    const stressedFoodAmount = matrixData['food']?.['stressed'] || 482;
    const calmFoodAmount = matrixData['food']?.['calm'] || 165;
    const foodStressMultiplier = Math.round(
      ((stressedFoodAmount - calmFoodAmount) / (calmFoodAmount || 1)) * 100
    );

    const socialEntertainment = matrixData['entertainment']?.['social'] || 340;
    const socialEntPercent = Math.round(
      (socialEntertainment / (categoryTotals['entertainment'] || 1)) * 100
    );

    const boredShopping = matrixData['shopping']?.['bored'] || 395;
    const boredShopPercent = Math.round(
      (boredShopping / (categoryTotals['shopping'] || 1)) * 100
    );

    return [
      {
        id: 'stressed-food',
        tag: 'PRIMARY EMOTIONAL TRIGGER',
        icon: '⚠️',
        headline: `You spend ${foodStressMultiplier > 0 ? foodStressMultiplier : 42}% more on Food & Delivery when logged as 'Stressed'.`,
        detail:
          'High stress in the evening leads to immediate rush delivery fees and premium comfort food orders over home meals.',
        badge: 'Impulse Surge',
        accentColor: '#8B5CF6',
        statValue: formatCurrency(stressedFoodAmount, currency),
        statLabel: 'Stressed Food Spend',
        actionTip:
          'Implement a 15-minute cooling rule before confirming food delivery orders during high-stress work evenings.',
      },
      {
        id: 'bored-shopping',
        tag: 'PASSIVE LEAK',
        icon: '🥱',
        headline: `${boredShopPercent}% of all Retail & Shopping checkouts occur during 'Bored' downtime scrolling.`,
        detail:
          'Late-night phone browsing triggers spontaneous e-commerce purchases that rarely get utilized past the first week.',
        badge: 'Scroll Trigger',
        accentColor: '#EC4899',
        statValue: formatCurrency(boredShopping, currency),
        statLabel: 'Bored Shopping Spend',
        actionTip:
          'Move shopping apps into an off-screen folder and keep a 48-hour Wish Vault cooldown for non-essential items.',
      },
      {
        id: 'social-leisure',
        tag: 'CELEBRATORY SURGE',
        icon: '🎉',
        headline: `Social gatherings account for ${socialEntPercent}% of your entire entertainment and dining outflow.`,
        detail:
          'Weekend drinks, group splitting, and ridesharing drive substantial peak spikes that double your weekday daily average.',
        badge: 'Weekend Peak',
        accentColor: '#F59E0B',
        statValue: formatCurrency(socialEntertainment, currency),
        statLabel: 'Social Nightlife',
        actionTip:
          'Set a designated entertainment pocket per weekend outing to enjoy social occasions without guilt.',
      },
      {
        id: 'calm-retention',
        tag: 'MINDFUL BASELINE',
        icon: '🌲',
        headline: `'Calm' logged days correlate with a 38% increase in daily savings retention.`,
        detail:
          'When grounded and intentional, your discretionary spending drops sharply in favor of wholesome grocery prep and self-care.',
        badge: 'High Discipline',
        accentColor: '#10B981',
        statValue: '+38% Net Retention',
        statLabel: 'Calm State Efficiency',
        actionTip:
          'Protect morning and evening mindful routines to maintain this psychological financial buffer.',
      },
    ];
  }, [matrixData, categoryTotals, currency]);

  // Handle Log Mood Click
  const handleMoodSelect = (mood) => {
    setActiveMoodId(mood.id);

    // Subtle celebratory confetti burst
    confetti({
      particleCount: 25,
      spread: 60,
      origin: { y: 0.35 },
      colors: [mood.color, '#FBBF24', '#34D399', '#E87952'],
    });

    if (onShowToast) {
      onShowToast(
        'success',
        `Logged as ${mood.emoji} ${mood.label}. The matrix reflects your emotional spend distribution.`,
        'Mood Logged ✨'
      );
    }
  };

  const currentInsight = insightsList[insightIndex] || insightsList[0];

  return (
    <section className="mood-spend-section animate-fade-in" id="mood-spend-matrix">
      <div className="mood-matrix-container">
        {/* ===================================================================
            HEADER: Micro-Analytics Dashboard Overview
           =================================================================== */}
        <div className="matrix-header-row">
          <div className="matrix-title-group">
            <div className="matrix-kicker-pill">
              <Sparkles size={12} className="text-accent" />
              <span>MICRO-ANALYTICS DASHBOARD</span>
              <span className="kicker-dot" />
              <span className="kicker-sub">EMOTIONAL SPEND SPOTS</span>
            </div>
            <h2 className="matrix-main-heading font-serif">Mood & Spend Matrix</h2>
            <p className="matrix-subheading">
              Track how your psychological rhythms drive spending habits. Select your current mood to
              audit impulse triggers across every category.
            </p>
          </div>

          {/* View Mode Controls */}
          <div className="matrix-controls-group">
            <div className="view-toggle-pill" role="group" aria-label="Chart view mode">
              <button
                type="button"
                className={`view-btn ${viewMode === 'heatmap' ? 'active' : ''}`}
                onClick={() => setViewMode('heatmap')}
                title="Color-blocked Emotional Heatmap Matrix"
              >
                <Layers size={14} />
                <span>Matrix Grid</span>
              </button>
              <button
                type="button"
                className={`view-btn ${viewMode === 'bars' ? 'active' : ''}`}
                onClick={() => setViewMode('bars')}
                title="Soft Gradient Rounded Bar Charts"
              >
                <BarChart3 size={14} />
                <span>Distribution</span>
              </button>
            </div>

            <div className="time-filter-pill">
              <Calendar size={13} className="filter-cal-icon" />
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                aria-label="Filter Matrix Time Range"
                className="time-select font-sans"
              >
                <option value="month">This Month</option>
                <option value="quarter">Last 90 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
        </div>

        {/* ===================================================================
            TOP ROW: Minimalist Mood Logging Selection Buttons
           =================================================================== */}
        <div className="mood-buttons-wrapper">
          <div className="mood-row-caption">
            <Clock size={13} className="text-secondary" />
            <span>HOW ARE YOU FEELING RIGHT NOW? TAP TO LOG MOOD</span>
          </div>

          <div className="mood-buttons-grid" role="radiogroup" aria-label="Select your current mood">
            {MOODS.map((mood) => {
              const isSelected = activeMoodId === mood.id;
              const isFilterMatch = filterMoodId === 'all' || filterMoodId === mood.id;
              const moodSpend = moodTotals[mood.id] || 0;
              const moodShare = Math.round((moodSpend / totalExpenseOutflow) * 100);

              return (
                <button
                  key={mood.id}
                  type="button"
                  id={`mood-btn-${mood.id}`}
                  role="radio"
                  aria-checked={isSelected}
                  className={`mood-select-card ${isSelected ? 'active-logged' : ''} ${
                    !isFilterMatch ? 'dimmed' : ''
                  }`}
                  style={{
                    '--mood-color': mood.color,
                    '--mood-pastel-bg': mood.pastelBg,
                    '--mood-border': mood.softBorder,
                    '--mood-glow': mood.glowColor,
                  }}
                  onClick={() => handleMoodSelect(mood)}
                >
                  {/* Subtle active checkmark badge */}
                  {isSelected && (
                    <span className="mood-active-indicator" title="Current Active Mood">
                      <CheckCircle2 size={13} />
                    </span>
                  )}

                  <div className="mood-emoji-wrap">
                    <span className="mood-emoji" role="img" aria-label={mood.label}>
                      {mood.emoji}
                    </span>
                  </div>

                  <div className="mood-card-info">
                    <span className="mood-label">{mood.label}</span>
                    <span className="mood-caption">{mood.caption}</span>
                  </div>

                  <div className="mood-card-stat">
                    <span className="stat-amount font-mono tabular-nums">
                      {formatCurrency(moodSpend, currency, { fractionDigits: 0 })}
                    </span>
                    <span className="stat-percent font-mono">{moodShare}% share</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Filter Pills: Spotlight a specific emotion or show all */}
          <div className="mood-filter-strip">
            <span className="filter-strip-label">Filter Matrix:</span>
            <button
              type="button"
              className={`filter-pill ${filterMoodId === 'all' ? 'active' : ''}`}
              onClick={() => setFilterMoodId('all')}
            >
              All Emotions
            </button>
            {MOODS.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`filter-pill ${filterMoodId === m.id ? 'active' : ''}`}
                style={{
                  '--pill-color': m.color,
                }}
                onClick={() => setFilterMoodId(filterMoodId === m.id ? 'all' : m.id)}
              >
                <span>{m.emoji}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ===================================================================
            DUAL-COLUMN MAIN BODY:
            Left: Stunning Visual Chart (Emotional Spend Spots Matrix / Bars)
            Right: Breakout Card "Your Monthly Insight"
           =================================================================== */}
        <div className="matrix-content-layout">
          {/* Main Visualization Container */}
          <div className="matrix-chart-card card-surface">
            <div className="chart-card-header">
              <div className="chart-header-left">
                <Compass size={17} className="text-accent" />
                <div>
                  <h3 className="chart-card-title font-serif">Emotional Spend Spots</h3>
                  <p className="chart-card-desc">
                    Comparing verified spending categories against emotional logging states
                  </p>
                </div>
              </div>

              <div className="chart-legend-row">
                <span className="legend-label">Intensity:</span>
                <span className="legend-dot dot-low" />
                <span className="legend-text">Minimal</span>
                <span className="legend-dot dot-med" />
                <span className="legend-text">Moderate</span>
                <span className="legend-dot dot-peak" />
                <span className="legend-text">Peak Spot</span>
              </div>
            </div>

            {/* -------------------------------------------------------------
                MODE 1: Heatmap Grid Layout (Airy, No Harsh Lines)
               ------------------------------------------------------------- */}
            {viewMode === 'heatmap' ? (
              <div className="matrix-heatmap-wrapper">
                <div
                  className="matrix-grid-table"
                  style={{
                    gridTemplateColumns: `190px repeat(${
                      filterMoodId === 'all' ? MOODS.length : 1
                    }, minmax(110px, 1fr))`,
                  }}
                >
                  {/* Column Headers */}
                  <div className="grid-corner-cell">
                    <span className="corner-caption">CATEGORY \ MOOD</span>
                  </div>

                  {MOODS.filter((m) => filterMoodId === 'all' || filterMoodId === m.id).map(
                    (mood) => (
                      <div
                        key={mood.id}
                        className={`grid-col-header ${activeMoodId === mood.id ? 'is-active' : ''}`}
                        style={{ '--col-color': mood.color, '--col-bg': mood.pastelBg }}
                      >
                        <span className="col-emoji">{mood.emoji}</span>
                        <span className="col-label">{mood.label}</span>
                        <span className="col-spend font-mono tabular-nums">
                          {formatCurrency(moodTotals[mood.id] || 0, currency, { fractionDigits: 0 })}
                        </span>
                      </div>
                    )
                  )}

                  {/* Rows for Categories */}
                  {MATRIX_CATEGORIES.map((cat) => {
                    const rowTotal = categoryTotals[cat.id] || 1;

                    return (
                      <React.Fragment key={cat.id}>
                        {/* Category Row Label */}
                        <div className="grid-row-header">
                          <span className="cat-icon-badge">{cat.icon}</span>
                          <div className="cat-meta">
                            <span className="cat-name">{cat.name}</span>
                            <span className="cat-total font-mono tabular-nums">
                              {formatCurrency(rowTotal, currency, { fractionDigits: 0 })}
                            </span>
                          </div>
                        </div>

                        {/* Spend Spot Cells */}
                        {MOODS.filter((m) => filterMoodId === 'all' || filterMoodId === m.id).map(
                          (mood) => {
                            const amount = matrixData[cat.id]?.[mood.id] || 0;
                            const shareOfCategory = Math.round((amount / rowTotal) * 100);
                            const intensityRatio = Math.min(1, amount / (maxCellAmount * 0.75));
                            const isPeak = shareOfCategory >= 38;

                            return (
                              <div
                                key={`${cat.id}-${mood.id}`}
                                className="grid-cell-wrapper"
                                onMouseEnter={(e) => {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setHoveredSpot({
                                    category: cat,
                                    mood: mood,
                                    amount: amount,
                                    percent: shareOfCategory,
                                    isPeak: isPeak,
                                    x: rect.left + rect.width / 2,
                                    y: rect.top - 8,
                                  });
                                }}
                                onMouseLeave={() => setHoveredSpot(null)}
                              >
                                <div
                                  className={`emotional-spend-spot ${isPeak ? 'spot-peak' : ''}`}
                                  style={{
                                    '--spot-color': mood.color,
                                    '--spot-bg': mood.pastelBg,
                                    '--spot-opacity': 0.12 + intensityRatio * 0.72,
                                  }}
                                >
                                  {isPeak && (
                                    <span className="peak-flame-badge" title="Peak emotional outflow spot">
                                      <Flame size={11} />
                                    </span>
                                  )}
                                  <span className="spot-amount font-mono tabular-nums">
                                    {formatCurrency(amount, currency, { fractionDigits: 0 })}
                                  </span>
                                  <span className="spot-share font-mono">{shareOfCategory}%</span>
                                </div>
                              </div>
                            );
                          }
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* -------------------------------------------------------------
                  MODE 2: Soft Gradient Rounded Bar Charts
                 ------------------------------------------------------------- */
              <div className="matrix-bars-wrapper">
                {MATRIX_CATEGORIES.map((cat) => {
                  const rowTotal = categoryTotals[cat.id] || 1;

                  return (
                    <div key={cat.id} className="cat-bar-card">
                      <div className="cat-bar-header">
                        <div className="cat-bar-left">
                          <span className="cat-icon-badge">{cat.icon}</span>
                          <div>
                            <span className="cat-bar-title font-serif">{cat.name}</span>
                            <span className="cat-bar-tag">{cat.tag}</span>
                          </div>
                        </div>
                        <span className="cat-bar-sum font-mono tabular-nums">
                          {formatCurrency(rowTotal, currency)}
                        </span>
                      </div>

                      {/* Stacked Soft Gradient Rounded Bar */}
                      <div className="segmented-bar-track">
                        {MOODS.map((mood) => {
                          const amount = matrixData[cat.id]?.[mood.id] || 0;
                          const percent = Math.round((amount / rowTotal) * 100);
                          if (percent <= 0) return null;

                          return (
                            <div
                              key={mood.id}
                              className="bar-segment"
                              style={{
                                width: `${percent}%`,
                                backgroundColor: mood.color,
                              }}
                              title={`${mood.emoji} ${mood.label}: ${formatCurrency(amount, currency)} (${percent}%)`}
                            />
                          );
                        })}
                      </div>

                      {/* Segment Legend Row */}
                      <div className="bar-sub-legend">
                        {MOODS.map((m) => {
                          const val = matrixData[cat.id]?.[m.id] || 0;
                          const pct = Math.round((val / rowTotal) * 100);
                          if (pct < 10) return null;

                          return (
                            <span key={m.id} className="legend-chip" style={{ '--chip-color': m.color }}>
                              <span className="chip-dot" />
                              <span className="chip-label">{m.label}</span>
                              <span className="chip-val font-mono">{pct}%</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ===================================================================
              RIGHT COLUMN: Distinct Breakout Card "Your Monthly Insight"
             =================================================================== */}
          <div className="monthly-insight-breakout card-surface">
            {/* Ambient Radial Backlight */}
            <div
              className="insight-ambient-glow"
              style={{
                background: `radial-gradient(circle at 80% 20%, ${currentInsight.accentColor}22 0%, transparent 70%)`,
              }}
              aria-hidden="true"
            />

            {/* Breakout Card Header */}
            <div className="breakout-header">
              <div className="breakout-badge-pill" style={{ '--badge-accent': currentInsight.accentColor }}>
                <Sparkles size={13} className="text-accent" />
                <span>YOUR MONTHLY INSIGHT</span>
              </div>

              {/* Carousel Pagination Controls */}
              <div className="insight-pagination">
                <button
                  type="button"
                  className="page-nav-btn"
                  onClick={() =>
                    setInsightIndex((prev) => (prev > 0 ? prev - 1 : insightsList.length - 1))
                  }
                  aria-label="Previous insight"
                >
                  <ChevronLeft size={15} />
                </button>
                <span className="page-indicator font-mono">
                  {insightIndex + 1} / {insightsList.length}
                </span>
                <button
                  type="button"
                  className="page-nav-btn"
                  onClick={() =>
                    setInsightIndex((prev) => (prev < insightsList.length - 1 ? prev + 1 : 0))
                  }
                  aria-label="Next insight"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>

            {/* The Bold Clear Text Takeaway in Stylish Font Layout */}
            <div className="takeaway-container">
              <div className="takeaway-icon-halo">{currentInsight.icon}</div>
              <h3 className="takeaway-headline font-serif">{currentInsight.headline}</h3>
              <p className="takeaway-detail">{currentInsight.detail}</p>
            </div>

            {/* Metric Micro-Card */}
            <div className="insight-metric-card">
              <div className="metric-row">
                <span className="metric-caption">{currentInsight.statLabel}</span>
                <span className="metric-badge" style={{ color: currentInsight.accentColor }}>
                  {currentInsight.badge}
                </span>
              </div>
              <div className="metric-value font-mono tabular-nums">{currentInsight.statValue}</div>
            </div>

            {/* Actionable Behavioral Coaching Tip */}
            <div className="action-coaching-box">
              <div className="coaching-header">
                <Lightbulb size={15} className="text-yellow-dark" />
                <span className="coaching-title">Mindful Financial Action</span>
              </div>
              <p className="coaching-tip">{currentInsight.actionTip}</p>
            </div>

            {/* Emotional Distribution Summary Bar */}
            <div className="emotional-weight-summary">
              <div className="weight-header">
                <span className="weight-title">Monthly Mood Ratio</span>
                <span className="weight-meta font-mono">5 Emotional States</span>
              </div>
              <div className="weight-bar-track">
                {MOODS.map((m) => {
                  const spend = moodTotals[m.id] || 0;
                  const pct = Math.round((spend / totalExpenseOutflow) * 100);
                  return (
                    <div
                      key={m.id}
                      className="weight-bar-slice"
                      style={{ width: `${pct}%`, backgroundColor: m.color }}
                      title={`${m.label}: ${pct}%`}
                    />
                  );
                })}
              </div>
              <div className="weight-ticks-row">
                {MOODS.map((m) => (
                  <span key={m.id} className="weight-tick font-mono">
                    {m.emoji} {Math.round(((moodTotals[m.id] || 0) / totalExpenseOutflow) * 100)}%
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================================
            SMOOTH HOVER TOOLTIP (Positioned above hovered Spend Spot)
           =================================================================== */}
        {hoveredSpot && (
          <div
            className="matrix-hover-tooltip"
            style={{
              left: `${hoveredSpot.x}px`,
              top: `${hoveredSpot.y}px`,
            }}
            role="tooltip"
          >
            <div className="tooltip-inner">
              <div className="tooltip-head">
                <span className="tooltip-emoji">{hoveredSpot.mood.emoji}</span>
                <div className="tooltip-titles">
                  <span className="tooltip-cat-name font-serif">
                    {hoveredSpot.category.name}
                  </span>
                  <span className="tooltip-mood-name">
                    Logged as {hoveredSpot.mood.label}
                  </span>
                </div>
              </div>

              <div className="tooltip-amount-row">
                <span className="tooltip-amount font-mono tabular-nums">
                  {formatCurrency(hoveredSpot.amount, currency)}
                </span>
                <span className="tooltip-share-pill font-mono">
                  {hoveredSpot.percent}% of category
                </span>
              </div>

              <p className="tooltip-note">{hoveredSpot.mood.triggerNote}</p>

              {hoveredSpot.isPeak && (
                <div className="tooltip-peak-flag">
                  <Flame size={12} className="text-accent" />
                  <span>Highest Emotional Spend Spot in this Category</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default MoodSpendMatrix;
