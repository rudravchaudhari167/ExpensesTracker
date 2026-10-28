import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Edit2,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Inbox,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import { CategoryIcon } from '../../utils/categoryIcons';
import { formatAmountWithSign, formatCurrency } from '../../utils/currency';
import { formatDate, formatFriendlyDate } from '../../utils/date';
import './TransactionTable.css';

const ITEMS_PER_PAGE = 8;

export function TransactionTable({
  transactions = [],
  currency = 'USD',
  onOpenAddModal,
  onEdit,
  onDelete,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL'); // ALL, INCOME, EXPENSE
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState('date-desc'); // date-desc, date-asc, amount-desc, amount-asc
  const [currentPage, setCurrentPage] = useState(1);

  // Extract all unique categories from existing transactions
  const availableCategories = useMemo(() => {
    const set = new Set();
    transactions.forEach((t) => {
      if (t.category) set.add(t.category.trim());
    });
    return Array.from(set).sort();
  }, [transactions]);

  // Filter and Sort transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesTitle = tx.title && tx.title.toLowerCase().includes(q);
          const matchesCat = tx.category && tx.category.toLowerCase().includes(q);
          if (!matchesTitle && !matchesCat) return false;
        }

        // Type filter
        if (typeFilter !== 'ALL' && tx.type !== typeFilter) {
          return false;
        }

        // Category filter
        if (selectedCategory !== 'ALL' && tx.category?.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return new Date(b.date).getTime() - new Date(a.date).getTime() || (b.id || 0) - (a.id || 0);
        }
        if (sortBy === 'date-asc') {
          return new Date(a.date).getTime() - new Date(b.date).getTime() || (a.id || 0) - (b.id || 0);
        }
        if (sortBy === 'amount-desc') {
          return Number(b.amount) - Number(a.amount);
        }
        if (sortBy === 'amount-asc') {
          return Number(a.amount) - Number(b.amount);
        }
        return 0;
      });
  }, [transactions, searchQuery, typeFilter, selectedCategory, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTransactions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTransactions, currentPage]);

  const hasActiveFilters = searchQuery !== '' || typeFilter !== 'ALL' || selectedCategory !== 'ALL';

  const resetFilters = () => {
    setSearchQuery('');
    setTypeFilter('ALL');
    setSelectedCategory('ALL');
    setSortBy('date-desc');
    setCurrentPage(1);
  };

  return (
    <div className="tx-table-container animate-fade-in">
      {/* Top Controls: Search, Type Filters, Category Select, Sort */}
      <div className="tx-controls-card card-surface">
        <div className="tx-search-row">
          <div className="tx-search-input-wrap">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="tx-search-input"
              placeholder="Search by description or category..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
            {searchQuery && (
              <button
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <button
            className="btn btn-primary btn-add-table"
            onClick={onOpenAddModal}
          >
            <Plus size={17} strokeWidth={2.4} />
            <span>Add Transaction</span>
          </button>
        </div>

        {/* Filter Pills and Dropdowns */}
        <div className="tx-filters-row">
          <div className="type-filter-pills">
            <button
              className={`type-pill ${typeFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => { setTypeFilter('ALL'); setCurrentPage(1); }}
            >
              All Types
            </button>
            <button
              className={`type-pill expense ${typeFilter === 'EXPENSE' ? 'active' : ''}`}
              onClick={() => { setTypeFilter('EXPENSE'); setCurrentPage(1); }}
            >
              Expenses
            </button>
            <button
              className={`type-pill income ${typeFilter === 'INCOME' ? 'active' : ''}`}
              onClick={() => { setTypeFilter('INCOME'); setCurrentPage(1); }}
            >
              Income
            </button>
          </div>

          <div className="filter-dropdowns">
            {/* Category Dropdown */}
            {availableCategories.length > 0 && (
              <select
                className="filter-select"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="ALL">All Categories</option>
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}

            {/* Sort Dropdown */}
            <select
              className="filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>

            {hasActiveFilters && (
              <button className="btn-reset-filters" onClick={resetFilters}>
                <X size={14} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table / Mobile Cards */}
      <div className="tx-list-card card-surface">
        {paginatedTransactions.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="desktop-table-wrapper">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th className="text-right">Amount</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTransactions.map((tx) => {
                    const isIncome = tx.type === 'INCOME';
                    return (
                      <tr key={tx.id} className="tx-table-row">
                        <td className="tx-item-cell">
                          <CategoryIcon category={tx.category} type={tx.type} size={17} />
                          <span className="tx-title-text" title={tx.title}>
                            {tx.title}
                          </span>
                        </td>
                        <td>
                          <span className="category-tag-pill">{tx.category}</span>
                        </td>
                        <td className="tx-date-cell">
                          {formatDate(tx.date)}
                        </td>
                        <td>
                          <span className={`type-tag ${isIncome ? 'income' : 'expense'}`}>
                            {isIncome ? 'Income' : 'Expense'}
                          </span>
                        </td>
                        <td className={`tx-amount-cell tabular-nums font-serif text-right ${isIncome ? 'income' : 'expense'}`}>
                          {formatAmountWithSign(tx.amount, tx.type, currency)}
                        </td>
                        <td className="tx-actions-cell text-right">
                          <button
                            className="tx-action-btn edit"
                            onClick={() => onEdit(tx)}
                            title="Edit"
                            aria-label={`Edit ${tx.title}`}
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            className="tx-action-btn delete"
                            onClick={() => onDelete(tx)}
                            title="Delete"
                            aria-label={`Delete ${tx.title}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (shown below 768px) */}
            <div className="mobile-cards-list">
              {paginatedTransactions.map((tx) => {
                const isIncome = tx.type === 'INCOME';
                return (
                  <div key={tx.id} className="mobile-tx-card">
                    <div className="mobile-card-top">
                      <div className="mobile-card-left">
                        <CategoryIcon category={tx.category} type={tx.type} size={18} />
                        <div>
                          <div className="mobile-tx-title">{tx.title}</div>
                          <div className="mobile-tx-sub">
                            <span className="category-tag-pill">{tx.category}</span>
                            <span>{formatFriendlyDate(tx.date)}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`mobile-tx-amount tabular-nums font-serif ${isIncome ? 'income' : 'expense'}`}>
                        {formatAmountWithSign(tx.amount, tx.type, currency)}
                      </div>
                    </div>
                    <div className="mobile-card-bottom">
                      <span className={`type-tag ${isIncome ? 'income' : 'expense'}`}>
                        {isIncome ? 'Income Inflow' : 'Expense Outflow'}
                      </span>
                      <div className="mobile-tx-actions">
                        <button
                          className="tx-action-btn edit"
                          onClick={() => onEdit(tx)}
                          aria-label={`Edit ${tx.title}`}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="tx-action-btn delete"
                          onClick={() => onDelete(tx)}
                          aria-label={`Delete ${tx.title}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Bar */}
            <div className="tx-pagination-bar">
              <span className="pagination-info">
                Showing{' '}
                <strong>
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)}
                </strong>{' '}
                of <strong>{filteredTransactions.length}</strong> entries
              </span>

              {totalPages > 1 && (
                <div className="pagination-buttons">
                  <button
                    className="pagination-nav-btn"
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="pagination-page-indicator">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    className="pagination-nav-btn"
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    aria-label="Next page"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="tx-empty-container">
            <div className="empty-icon-box">
              <Inbox size={32} />
            </div>
            <h4 className="empty-title font-serif">
              {hasActiveFilters ? 'No matching transactions' : 'No transactions found'}
            </h4>
            <p className="empty-description">
              {hasActiveFilters
                ? 'Try adjusting your search query, type filter, or category selection.'
                : 'Your ledger has no records yet. Click below to add your first transaction.'}
            </p>
            {hasActiveFilters ? (
              <button className="btn btn-secondary" onClick={resetFilters}>
                Clear Active Filters
              </button>
            ) : (
              <button className="btn btn-primary" onClick={onOpenAddModal}>
                <Plus size={16} />
                <span>Add First Transaction</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TransactionTable;
