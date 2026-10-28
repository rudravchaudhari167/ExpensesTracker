import React from 'react';
import { CategoryIcon } from '../../utils/categoryIcons';
import { formatAmountWithSign } from '../../utils/currency';
import { formatFriendlyDate } from '../../utils/date';
import { ArrowUpRight, ArrowRight, Edit2, Trash2, Inbox } from 'lucide-react';
import './RecentTransactions.css';

export function RecentTransactions({
  transactions = [],
  currency = 'USD',
  onViewAll,
  onEdit,
  onDelete,
}) {
  const recent = transactions.slice(0, 6);

  return (
    <div className="recent-tx-card card-surface animate-fade-in">
      <div className="recent-card-header">
        <div>
          <h3 className="recent-title font-serif">Recent Ledger</h3>
          <p className="recent-subtitle">Latest movements in your rhythm</p>
        </div>
        {transactions.length > 0 && (
          <button
            className="btn btn-ghost btn-view-all"
            onClick={onViewAll}
          >
            <span>View all ({transactions.length})</span>
            <ArrowRight size={15} />
          </button>
        )}
      </div>

      <div className="recent-body">
        {recent.length > 0 ? (
          <ul className="recent-list">
            {recent.map((tx) => {
              const isIncome = tx.type === 'INCOME';
              return (
                <li key={tx.id} className="recent-item">
                  <div className="recent-item-left">
                    <CategoryIcon category={tx.category} type={tx.type} size={18} />
                    <div className="recent-item-meta">
                      <span className="recent-item-title" title={tx.title}>
                        {tx.title}
                      </span>
                      <div className="recent-submeta">
                        <span className="recent-category-pill">{tx.category}</span>
                        <span className="recent-date-text">{formatFriendlyDate(tx.date)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="recent-item-right">
                    <div className={`recent-amount tabular-nums font-serif ${isIncome ? 'income' : 'expense'}`}>
                      {formatAmountWithSign(tx.amount, tx.type, currency)}
                    </div>

                    <div className="recent-actions">
                      <button
                        className="recent-action-btn edit"
                        onClick={() => onEdit(tx)}
                        title="Edit entry"
                        aria-label={`Edit ${tx.title}`}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="recent-action-btn delete"
                        onClick={() => onDelete(tx)}
                        title="Delete entry"
                        aria-label={`Delete ${tx.title}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="recent-empty-state">
            <div className="empty-icon-wrap">
              <Inbox size={26} />
            </div>
            <div className="empty-title">No transactions recorded</div>
            <p className="empty-desc">
              Your transaction history will be neatly cataloged here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecentTransactions;
