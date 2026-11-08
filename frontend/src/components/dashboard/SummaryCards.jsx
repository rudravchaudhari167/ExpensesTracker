import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../utils/currency';
import './SummaryCards.css';

/**
 * Animated number hook for smooth count-up
 */
function useAnimatedNumber(targetValue, duration = 650) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setDisplayValue(targetValue);
      return;
    }

    let start = 0;
    const target = typeof targetValue === 'number' ? targetValue : parseFloat(targetValue) || 0;
    const startTime = performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(start + (target - start) * easedProgress);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplayValue(target);
      }
    }

    requestAnimationFrame(step);
  }, [targetValue, duration]);

  return displayValue;
}

export function SummaryCards({ summary = {}, currency = 'INR' }) {
  const balance = Number(summary.balance) || 8450;
  const expenses = Number(summary.totalExpenses) || 2550;
  const income = Number(summary.totalIncome) || 3750;
  const savings = Math.max(0, income - expenses) || 1200;
  const monthlyGoal = 5000;
  const goalProgress = Math.min(100, Math.round((savings / monthlyGoal) * 100)) || 68;

  const animatedBalance = useAnimatedNumber(balance);
  const animatedExpenses = useAnimatedNumber(expenses);
  const animatedSavings = useAnimatedNumber(savings);
  const animatedGoal = useAnimatedNumber(monthlyGoal);

  return (
    <div className="summary-cards-row">
      {/* 1. Total Balance */}
      <div className="penny-summary-card card-surface" id="summary-card-balance">
        <div className="card-top-row">
          <div className="card-icon-pill icon-wallet-3d" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
              <rect x="2" y="6" width="28" height="20" rx="6" fill="#F49A62" />
              <rect x="4" y="8" width="24" height="6" rx="3" fill="#D96832" opacity="0.3" />
              <path d="M18 13H28C29.1 13 30 13.9 30 15V19C30 20.1 29.1 21 28 21H18C16.9 21 16 20.1 16 19V15C16 13.9 16.9 13 18 13Z" fill="#C25320" />
              <circle cx="23" cy="17" r="2" fill="#FFE5A3" />
            </svg>
          </div>
          <div className="card-trend-badge trend-up-green">
            <span>↑ 12%</span>
          </div>
        </div>

        <div className="card-info-block">
          <span className="card-label">Total Balance</span>
          <span className="card-amount tabular-nums">
            {formatCurrency(animatedBalance, currency)}
          </span>
        </div>

        {/* Wavy Green Sparkline */}
        <div className="card-sparkline-wrapper" aria-hidden="true">
          <svg viewBox="0 0 160 36" fill="none" className="sparkline-svg">
            <path
              d="M0 24C20 18 35 28 55 16C75 4 95 24 115 14C135 4 148 18 160 12"
              stroke="#6CA851"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* 2. Total Spent */}
      <div className="penny-summary-card card-surface" id="summary-card-spent">
        <div className="card-top-row">
          <div className="card-icon-pill icon-receipt-3d" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
              <rect x="6" y="3" width="20" height="26" rx="4" fill="#F28B50" />
              <line x1="10" y1="9" x2="22" y2="9" stroke="#FFE9DC" strokeWidth="2" strokeLinecap="round" />
              <line x1="10" y1="14" x2="19" y2="14" stroke="#FFE9DC" strokeWidth="2" strokeLinecap="round" />
              <line x1="10" y1="19" x2="16" y2="19" stroke="#FFE9DC" strokeWidth="2" strokeLinecap="round" />
              <circle cx="21" cy="22" r="3" fill="#D96832" />
            </svg>
          </div>
          <div className="card-trend-badge trend-up-orange">
            <span>↑ 8%</span>
          </div>
        </div>

        <div className="card-info-block">
          <span className="card-label">Total Spent</span>
          <span className="card-amount tabular-nums">
            {formatCurrency(animatedExpenses, currency)}
          </span>
        </div>

        {/* Wavy Orange Sparkline */}
        <div className="card-sparkline-wrapper" aria-hidden="true">
          <svg viewBox="0 0 160 36" fill="none" className="sparkline-svg">
            <path
              d="M0 26C18 20 38 30 60 16C80 4 105 28 125 15C140 7 150 20 160 14"
              stroke="#F28B50"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* 3. Savings */}
      <div className="penny-summary-card card-surface" id="summary-card-savings">
        <div className="card-top-row">
          <div className="card-icon-pill icon-piggy-3d" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
              <ellipse cx="16" cy="18" rx="12" ry="9" fill="#FFA3AB" />
              <circle cx="12" cy="10" r="3.5" fill="#FFC93C" stroke="#E59920" strokeWidth="1" />
              <ellipse cx="23" cy="17" rx="3.5" ry="3" fill="#FFCCD0" />
              <circle cx="19" cy="15" r="1.2" fill="#4A2528" />
              <path d="M19 11C20 9 22 9 23 11" stroke="#FFA3AB" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="card-trend-badge trend-up-green">
            <span>↑ 20%</span>
          </div>
        </div>

        <div className="card-info-block">
          <span className="card-label">Savings</span>
          <span className="card-amount tabular-nums">
            {formatCurrency(animatedSavings, currency)}
          </span>
        </div>

        {/* Wavy Green Sparkline */}
        <div className="card-sparkline-wrapper" aria-hidden="true">
          <svg viewBox="0 0 160 36" fill="none" className="sparkline-svg">
            <path
              d="M0 28C22 24 40 10 65 18C85 24 105 10 130 16C145 20 152 14 160 8"
              stroke="#6CA851"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* 4. Monthly Goal */}
      <div className="penny-summary-card card-surface" id="summary-card-goal">
        <div className="card-top-row">
          <div className="card-icon-pill icon-target-3d" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="12" fill="#FFE5D4" stroke="#D96832" strokeWidth="2.2" />
              <circle cx="16" cy="16" r="8" fill="#FFFFFF" stroke="#F28B50" strokeWidth="2.2" />
              <circle cx="16" cy="16" r="4" fill="#D96832" />
            </svg>
          </div>
          <div className="goal-pct-text">{goalProgress}%</div>
        </div>

        <div className="card-info-block">
          <span className="card-label">Monthly Goal</span>
          <span className="card-amount tabular-nums">
            {formatCurrency(animatedGoal, currency)}
          </span>
        </div>

        {/* Horizontal Orange Progress Bar */}
        <div className="goal-progress-track" aria-hidden="true">
          <div className="goal-progress-fill" style={{ width: `${goalProgress}%` }} />
        </div>
      </div>
    </div>
  );
}

export default SummaryCards;
