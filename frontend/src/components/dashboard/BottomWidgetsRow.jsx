import React from 'react';
import {
  TrendingUp,
  ArrowRight,
  Plus,
  Target,
  Trophy,
  Coins,
  Utensils,
  Car,
  ShoppingBag,
  Tv,
  HelpCircle,
} from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import './BottomWidgetsRow.css';

const CATEGORY_ICON_MAP = {
  'Food & Dining': Utensils,
  'Transport': Car,
  'Shopping': ShoppingBag,
  'Entertainment': Tv,
  'Others': HelpCircle,
};

export function BottomWidgetsRow({
  transactions = [],
  currency = 'INR',
  onViewAll,
  onOpenAddExpense,
  onNavigateBudgets,
  onNavigateGoals,
  onOpenAddMoney,
}) {
  // Recent transactions list (2-3 items)
  const recentList = transactions.slice(0, 3);

  // Fallback items if database has no transactions yet
  const displayTransactions = recentList.length > 0 ? recentList : [
    {
      id: 'demo-1',
      title: "Domino's Pizza",
      category: 'Food & Dining',
      amount: 320,
      type: 'EXPENSE',
      date: 'Today',
    },
    {
      id: 'demo-2',
      title: 'Metro Card',
      category: 'Transport',
      amount: 60,
      type: 'EXPENSE',
      date: 'Yesterday',
    },
  ];

  return (
    <div className="bottom-widgets-grid">
      {/* 1. Recent Transactions */}
      <div className="bottom-widget-card card-surface recent-tx-widget">
        <div className="widget-header">
          <h3 className="widget-title">Recent Transactions</h3>
          <button type="button" className="widget-action-link" onClick={onViewAll}>
            <span>View All</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="recent-tx-list">
          {displayTransactions.map((tx) => {
            const Icon = CATEGORY_ICON_MAP[tx.category] || HelpCircle;
            const isExpense = tx.type === 'EXPENSE';
            return (
              <div key={tx.id} className="recent-tx-item">
                <div className="tx-icon-pill" aria-hidden="true">
                  <Icon size={17} />
                </div>
                <div className="tx-meta-info">
                  <div className="tx-title-text">{tx.category || 'General'}</div>
                  <div className="tx-subtitle-text">{tx.title || 'Store'}</div>
                </div>
                <div className="tx-amount-side">
                  <div className="tx-amount-text tabular-nums">
                    {isExpense ? '- ' : '+ '}
                    {formatCurrency(tx.amount, currency)}
                  </div>
                  <div className="tx-date-text">{tx.date || 'Today'}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Quick Actions */}
      <div className="bottom-widget-card card-surface quick-actions-widget">
        <div className="widget-header">
          <h3 className="widget-title">Quick Actions</h3>
        </div>

        <div className="quick-actions-2x2">
          {/* Action 1: Add Expense */}
          <button
            type="button"
            className="quick-action-tile tile-expense"
            onClick={onOpenAddExpense}
          >
            <div className="tile-icon-circle circle-expense">
              <Plus size={16} strokeWidth={2.6} />
            </div>
            <span className="tile-label">Add Expense</span>
          </button>

          {/* Action 2: Set Budget */}
          <button
            type="button"
            className="quick-action-tile tile-budget"
            onClick={onNavigateBudgets}
          >
            <div className="tile-icon-circle circle-budget">
              <Target size={16} />
            </div>
            <span className="tile-label">Set Budget</span>
          </button>

          {/* Action 3: Add Goal */}
          <button
            type="button"
            className="quick-action-tile tile-goal"
            onClick={onNavigateGoals}
          >
            <div className="tile-icon-circle circle-goal">
              <Trophy size={16} />
            </div>
            <span className="tile-label">Add Goal</span>
          </button>

          {/* Action 4: Add Money / Top-up */}
          <button
            type="button"
            className="quick-action-tile tile-money"
            onClick={onOpenAddMoney}
          >
            <div className="tile-icon-circle circle-money">
              <Coins size={16} />
            </div>
            <span className="tile-label">Add Money</span>
          </button>
        </div>
      </div>

      {/* 3. Smart Insights */}
      <div className="bottom-widget-card card-surface smart-insights-widget">
        <div className="widget-header">
          <div className="insights-header-title">
            <h3 className="widget-title">Smart Insights</h3>
          </div>
          <div className="insights-trend-pill" aria-hidden="true">
            <TrendingUp size={16} />
          </div>
        </div>

        <div className="insights-list">
          <div className="insight-bullet-item">
            <span className="insight-indicator green-indicator">↑</span>
            <span className="insight-text">
              You spent <strong>15% less</strong> than last month!
            </span>
          </div>

          <div className="insight-bullet-item">
            <span className="insight-indicator food-indicator">🍴</span>
            <span className="insight-text">
              <strong>Food</strong> is your highest spending category.
            </span>
          </div>

          <div className="insight-bullet-item">
            <span className="insight-indicator star-indicator">⭐</span>
            <span className="insight-text">
              You have <strong>₹1,200</strong> left for this month.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BottomWidgetsRow;
