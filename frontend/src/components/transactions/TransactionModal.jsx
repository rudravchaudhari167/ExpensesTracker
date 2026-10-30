import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Plus,
  Check,
  Calendar,
  Tag,
  DollarSign,
  FileText,
  ArrowDownLeft,
  ArrowUpRight,
  Loader2,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getTodayDateString } from '../../utils/date';
import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
} from '../../utils/categoryIcons';
import { CURRENCIES } from '../../utils/currency';
import './TransactionModal.css';

const CUSTOM_CATEGORIES_STORAGE_KEY = 'spendl_custom_categories';

export function TransactionModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  currency = 'USD',
  onCurrencyChange,
}) {
  const isEditing = Boolean(initialData && initialData.id);

  const [activeCurrency, setActiveCurrency] = useState(currency || 'USD');

  useEffect(() => {
    if (currency) {
      setActiveCurrency(currency);
    }
  }, [currency]);

  const handleCurrencySelect = (code) => {
    setActiveCurrency(code);
    if (onCurrencyChange) {
      onCurrencyChange(code);
    }
  };

  const selectedCurrencyConfig = CURRENCIES[activeCurrency] || CURRENCIES.USD;

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'EXPENSE',
    category: '',
    date: getTodayDateString(),
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Custom user-created categories state (persisted in localStorage)
  const [customCategories, setCustomCategories] = useState(() => {
    try {
      const stored =
        localStorage.getItem(CUSTOM_CATEGORIES_STORAGE_KEY) ||
        localStorage.getItem('pennywise_custom_categories');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // State for inline category creator
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [categoryError, setCategoryError] = useState('');

  // Handle adding a new custom category
  const handleAddNewCategory = (e) => {
    if (e) e.preventDefault();
    const trimmed = newCategoryInput.trim();
    if (!trimmed) {
      setCategoryError('Category name cannot be empty');
      return;
    }
    if (trimmed.length > 50) {
      setCategoryError('Category name must be 50 characters or less');
      return;
    }

    // Capitalize first letter neatly
    const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);

    // Save to customCategories list if not present
    if (!customCategories.some((c) => c.toLowerCase() === formatted.toLowerCase())) {
      const updated = [...customCategories, formatted];
      setCustomCategories(updated);
      try {
        localStorage.setItem(CUSTOM_CATEGORIES_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn('Could not save custom category to localStorage', err);
      }
    }

    // Immediately select this category for current transaction
    setFormData((prev) => ({ ...prev, category: formatted }));
    if (errors.category) {
      setErrors((prev) => ({ ...prev, category: undefined }));
    }

    // Reset creator form
    setNewCategoryInput('');
    setCategoryError('');
    setIsCreatingCategory(false);
  };

  const defaultList =
    formData.type === 'INCOME' ? DEFAULT_INCOME_CATEGORIES : DEFAULT_EXPENSE_CATEGORIES;

  // Merge default list + user custom categories (avoiding case-insensitive duplicates)
  // Must be called unconditionally before any early returns to adhere to React Rules of Hooks
  const popularCategories = useMemo(() => {
    const map = new Map();
    defaultList.forEach((c) => map.set(c.toLowerCase(), c));
    customCategories.forEach((c) => {
      if (c && !map.has(c.toLowerCase())) {
        map.set(c.toLowerCase(), c);
      }
    });
    if (formData.category && !map.has(formData.category.toLowerCase())) {
      map.set(formData.category.toLowerCase(), formData.category);
    }
    return Array.from(map.values());
  }, [defaultList, customCategories, formData.category]);

  // Sync initialData when modal opens
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        amount: initialData.amount !== undefined ? String(initialData.amount) : '',
        type: initialData.type || 'EXPENSE',
        category: initialData.category || '',
        date: initialData.date || getTodayDateString(),
      });
    } else {
      setFormData({
        title: '',
        amount: '',
        type: 'EXPENSE',
        category: '',
        date: getTodayDateString(),
      });
    }
    setErrors({});
    setSubmitError(null);
  }, [initialData, isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  const validate = () => {
    const newErrors = {};

    // Title validation
    if (!formData.title || !formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Title cannot exceed 100 characters';
    }

    // Amount validation
    if (!formData.amount || String(formData.amount).trim() === '') {
      newErrors.amount = 'Amount is required';
    } else {
      const num = parseFloat(formData.amount);
      if (isNaN(num)) {
        newErrors.amount = 'Please enter a valid numeric amount';
      } else if (num < 0.01) {
        newErrors.amount = 'Amount must be at least 0.01';
      }
    }

    // Type validation
    if (!['INCOME', 'EXPENSE'].includes(formData.type)) {
      newErrors.type = 'Please select either Income or Expense';
    }

    // Category validation
    if (!formData.category || !formData.category.trim()) {
      newErrors.category = 'Category is required';
    } else if (formData.category.trim().length > 50) {
      newErrors.category = 'Category cannot exceed 50 characters';
    }

    // Date validation
    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.date)) {
      newErrors.date = 'Date must be in YYYY-MM-DD format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: formData.category.trim(),
        date: formData.date,
      };

      await onSubmit(payload, initialData ? initialData.id : null);

      // Trigger celebratory confetti for income or savings entries
      if (formData.type === 'INCOME') {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#DDE8D8', '#3E6B3B', '#E87952'],
        });
      }

      onClose();
    } catch (err) {
      console.error('Failed to save transaction:', err);
      setSubmitError(err.message || 'Failed to persist transaction to backend database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="tx-modal-surface card-surface animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="tx-modal-header">
          <div>
            <h3 className="tx-modal-title font-serif">
              {isEditing ? 'Edit Transaction' : 'Add Transaction'}
            </h3>
            <p className="tx-modal-subtitle">
              {isEditing
                ? 'Update your existing ledger entry in MySQL'
                : 'Log a new income inflow or expense outflow'}
            </p>
          </div>
          <button
            className="tx-modal-close-btn"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Global Submit Error Banner */}
        {submitError && (
          <div className="tx-modal-error-banner animate-slide-up">
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="tx-modal-form" noValidate>
          {/* Type Selector (Pills) */}
          <div className="form-group">
            <label className="form-label">Transaction Type</label>
            <div className="type-toggle-group">
              <button
                type="button"
                className={`type-toggle-btn expense ${formData.type === 'EXPENSE' ? 'active' : ''}`}
                onClick={() => {
                  setFormData({ ...formData, type: 'EXPENSE', category: '' });
                  setErrors({ ...errors, type: undefined });
                }}
              >
                <ArrowUpRight size={17} />
                <span>Expense (Outflow)</span>
              </button>
              <button
                type="button"
                className={`type-toggle-btn income ${formData.type === 'INCOME' ? 'active' : ''}`}
                onClick={() => {
                  setFormData({ ...formData, type: 'INCOME', category: '' });
                  setErrors({ ...errors, type: undefined });
                }}
              >
                <ArrowDownLeft size={17} />
                <span>Income (Inflow)</span>
              </button>
            </div>
            {errors.type && <span className="field-error">{errors.type}</span>}
          </div>

          {/* Title Field */}
          <div className="form-group">
            <label htmlFor="tx-title" className="form-label">
              Description / Title <span className="required-star">*</span>
            </label>
            <div className="input-with-icon">
              <FileText size={17} className="input-icon" />
              <input
                id="tx-title"
                type="text"
                className={`form-input ${errors.title ? 'error' : ''}`}
                placeholder="e.g. Grocery run, Monthly stipend, Coffee"
                value={formData.title}
                maxLength={100}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  if (errors.title) setErrors({ ...errors, title: undefined });
                }}
                disabled={isSubmitting}
                autoFocus
              />
            </div>
            {errors.title && <span className="field-error">{errors.title}</span>}
          </div>

          {/* Amount & Date 2-Column Row */}
          <div className="form-row-2">
            {/* Amount Field */}
            <div className="form-group">
              <div className="amount-label-row">
                <label htmlFor="tx-amount" className="form-label">
                  Amount <span className="required-star">*</span>
                </label>
                <span className="amount-currency-label">
                  Currency: <strong>{selectedCurrencyConfig.code}</strong>
                </span>
              </div>

              <div className="amount-input-composite">
                {/* Currency Dropdown Selector Addon */}
                <div className="currency-selector-addon" title="Select currency">
                  <select
                    id="tx-currency-select"
                    className="currency-addon-select"
                    value={activeCurrency}
                    onChange={(e) => handleCurrencySelect(e.target.value)}
                    aria-label="Select transaction currency"
                  >
                    {Object.values(CURRENCIES).map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.symbol} {c.code}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="currency-addon-arrow" />
                </div>

                <input
                  id="tx-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  className={`form-input composite-amount-input tabular-nums ${errors.amount ? 'error' : ''}`}
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => {
                    setFormData({ ...formData, amount: e.target.value });
                    if (errors.amount) setErrors({ ...errors, amount: undefined });
                  }}
                  disabled={isSubmitting}
                />
              </div>

              {/* Quick Currency Switcher Chips */}
              <div className="currency-chips-strip">
                {Object.values(CURRENCIES).map((c) => {
                  const isActive = activeCurrency === c.code;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      className={`currency-chip-btn ${isActive ? 'active' : ''}`}
                      onClick={() => handleCurrencySelect(c.code)}
                      title={c.label}
                    >
                      <span className="chip-symbol">{c.symbol}</span>
                      <span className="chip-code">{c.code}</span>
                    </button>
                  );
                })}
              </div>

              {errors.amount && <span className="field-error">{errors.amount}</span>}
            </div>

            {/* Date Field */}
            <div className="form-group">
              <label htmlFor="tx-date" className="form-label">
                Date <span className="required-star">*</span>
              </label>
              <div className="input-with-icon">
                <Calendar size={17} className="input-icon" />
                <input
                  id="tx-date"
                  type="date"
                  className={`form-input ${errors.date ? 'error' : ''}`}
                  value={formData.date}
                  onChange={(e) => {
                    setFormData({ ...formData, date: e.target.value });
                    if (errors.date) setErrors({ ...errors, date: undefined });
                  }}
                  disabled={isSubmitting}
                />
              </div>
              {errors.date && <span className="field-error">{errors.date}</span>}
            </div>
          </div>

          {/* Category Field */}
          <div className="form-group">
            <div className="category-label-row">
              <label htmlFor="tx-category" className="form-label">
                Category <span className="required-star">*</span>
              </label>
              {!isCreatingCategory && (
                <button
                  type="button"
                  className="btn-create-category-trigger"
                  onClick={() => {
                    setIsCreatingCategory(true);
                    setCategoryError('');
                  }}
                  id="btn-trigger-create-category"
                >
                  <Plus size={13} strokeWidth={2.4} />
                  <span>+ Create new category</span>
                </button>
              )}
            </div>

            <div className="input-with-icon">
              <Tag size={17} className="input-icon" />
              <input
                id="tx-category"
                type="text"
                className={`form-input ${errors.category ? 'error' : ''}`}
                placeholder="Choose from chips below, type custom, or click + Create"
                value={formData.category}
                maxLength={50}
                onChange={(e) => {
                  setFormData({ ...formData, category: e.target.value });
                  if (errors.category) setErrors({ ...errors, category: undefined });
                }}
                disabled={isSubmitting}
              />
            </div>
            {errors.category && <span className="field-error">{errors.category}</span>}

            {/* Inline Custom Category Creator Card */}
            {isCreatingCategory && (
              <div className="create-category-card animate-scale-up">
                <div className="create-category-header">
                  <div className="create-category-heading">
                    <Sparkles size={14} className="create-cat-sparkle" />
                    <span>Create a new custom category</span>
                  </div>
                  <button
                    type="button"
                    className="create-cat-close-btn"
                    onClick={() => {
                      setIsCreatingCategory(false);
                      setNewCategoryInput('');
                      setCategoryError('');
                    }}
                    title="Close creator"
                    aria-label="Close custom category creator"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="create-category-form-row">
                  <div className="create-category-input-wrap">
                    <Tag size={15} className="create-cat-input-icon" />
                    <input
                      id="input-new-custom-category"
                      type="text"
                      className={`form-input create-cat-input ${categoryError ? 'error' : ''}`}
                      placeholder="e.g. Pet Care, Books, Gaming, Subscriptions..."
                      value={newCategoryInput}
                      maxLength={50}
                      onChange={(e) => {
                        setNewCategoryInput(e.target.value);
                        if (categoryError) setCategoryError('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddNewCategory();
                        } else if (e.key === 'Escape') {
                          e.preventDefault();
                          setIsCreatingCategory(false);
                        }
                      }}
                      autoFocus
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-add-category-confirm"
                    onClick={handleAddNewCategory}
                    id="btn-confirm-new-category"
                  >
                    <Check size={15} strokeWidth={2.4} />
                    <span>Add</span>
                  </button>
                </div>
                {categoryError && <span className="field-error">{categoryError}</span>}
              </div>
            )}

            {/* Category Chips List (Default + Custom Categories) */}
            <div className="category-chips-list">
              {popularCategories.map((cat) => {
                const isActive =
                  formData.category.toLowerCase().trim() === cat.toLowerCase().trim();
                const isCustom = customCategories.some(
                  (c) => c.toLowerCase() === cat.toLowerCase()
                );
                return (
                  <button
                    key={cat}
                    type="button"
                    className={`category-chip ${isActive ? 'active' : ''} ${isCustom ? 'is-custom' : ''}`}
                    onClick={() => {
                      setFormData({ ...formData, category: cat });
                      if (errors.category) setErrors({ ...errors, category: undefined });
                    }}
                    title={isCustom ? `${cat} (Custom user category)` : cat}
                  >
                    <span>{cat}</span>
                    {isCustom && <span className="custom-indicator-dot" title="Custom category" />}
                  </button>
                );
              })}

              {/* "+ Create category" chip at the end */}
              {!isCreatingCategory && (
                <button
                  type="button"
                  className="category-chip create-chip-btn"
                  onClick={() => {
                    setIsCreatingCategory(true);
                    setCategoryError('');
                  }}
                  id="chip-btn-create-category"
                  title="Create custom category"
                >
                  <Plus size={13} strokeWidth={2.5} />
                  <span>+ Create category</span>
                </button>
              )}
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="tx-modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              id="btn-submit-transaction"
              type="submit"
              className="btn btn-primary btn-submit-tx"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Saving to database...</span>
                </>
              ) : (
                <>
                  <Check size={18} strokeWidth={2.4} />
                  <span>{isEditing ? 'Save Changes' : 'Confirm & Save'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TransactionModal;
