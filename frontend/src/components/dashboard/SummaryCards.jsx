import React, { useState, useEffect } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  PiggyBank,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import './SummaryCards.css';

/**
 * Animated number hook for smooth loading count-up
 */
function useAnimatedNumber(targetValue, duration = 600) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    // Check if user prefers reduced motion
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
      // Ease out cubic
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

export function SummaryCards({ summary = {}, currency = 'USD' }) {
  const balance = Number(summary.balance) || 0;
  const income = Number(summary.totalIncome) || 0;
  const expenses = Number(summary.totalExpenses) || 0;

  // Real savings rate calculation
  let savingsRate = null;
  if (income > 0) {
    savingsRate = Math.round(((income - expenses) / income) * 100);
  }

  const animatedBalance = useAnimatedNumber(balance);
  const animatedIncome = useAnimatedNumber(income);
  const animatedExpenses = useAnimatedNumber(expenses);
  const animatedSavingsRate = useAnimatedNumber(savingsRate !== null ? savingsRate : 0);

  const cards = [
    {
      id: 'balance',
      label: 'Total Balance',
      amountDisplay: formatCurrency(animatedBalance, currency),
      subtitle: balance >= 0 ? 'Net positive liquidity' : 'Net negative deficit',
      icon: Wallet,
      colorTheme: 'terracotta',
      statusClass: balance >= 0 ? 'positive' : 'negative',
      badgeText: 'Net Cash',
      accentShape: 'circle',
    },
    {
      id: 'income',
      label: 'Total Income',
      amountDisplay: formatCurrency(animatedIncome, currency),
      subtitle: income > 0 ? 'Verified inbound inflow' : 'No income logged yet',
      icon: ArrowDownLeft,
      colorTheme: 'sage',
      statusClass: 'income',
      badgeText: 'Inflow',
      accentShape: 'pill',
    },
    {
      id: 'expenses',
      label: 'Total Expenses',
      amountDisplay: formatCurrency(animatedExpenses, currency),
      subtitle: expenses > 0 ? 'Active recorded outflows' : 'Zero outflows',
      icon: ArrowUpRight,
      colorTheme: 'terracotta-soft',
      statusClass: 'expense',
      badgeText: 'Outflow',
      accentShape: 'wave',
    },
    {
      id: 'savings',
      label: 'Savings Rate',
      amountDisplay: savingsRate !== null ? `${Math.round(animatedSavingsRate)}%` : '—',
      subtitle: savingsRate !== null
        ? savingsRate >= 20 ? 'Optimal savings buffer' : 'Moderate savings rate'
        : 'Requires recorded income',
      icon: PiggyBank,
      colorTheme: 'lavender',
      statusClass: 'savings',
      badgeText: savingsRate !== null ? `${savingsRate}%` : 'Pending',
      accentShape: 'donut',
    },
  ];

  return (
    <div className="summary-cards-grid">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className={`summary-card card-surface animate-slide-up stagger-${idx + 1} theme-${card.colorTheme}`}
          >
            <div className="card-top-row">
              <span className="card-label">{card.label}</span>
              <div className="card-icon-bubble">
                <Icon size={19} strokeWidth={2.2} />
              </div>
            </div>

            <div className="card-amount tabular-nums font-serif">
              {card.amountDisplay}
            </div>

            <div className="card-footer-row">
              <span className="card-subtitle">{card.subtitle}</span>
              <span className={`card-badge badge-${card.colorTheme}`}>
                {card.badgeText}
              </span>
            </div>

            {/* Subtle decorative background shape */}
            <div className={`card-accent-shape shape-${card.accentShape}`} aria-hidden="true" />
          </div>
        );
      })}
    </div>
  );
}

export default SummaryCards;
