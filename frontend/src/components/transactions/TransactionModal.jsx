import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getTodayDateString } from '../../utils/date';
import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
} from '../../utils/categoryIcons';
import './TransactionModal.css';

export function TransactionModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  currency = 'USD',
}) {
  const isEditing = Boolean(initialData && initialData.id);

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

  if (!isOpen) return null;

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

  const popularCategories =
    formData.type === 'INCOME' ? DEFAULT_INCOME_CATEGORIES : DEFAULT_EXPENSE_CATEGORIES;

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
              {isEditing ? 'Edit Transaction' : 'Record Transaction'}
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
              <label htmlFor="tx-amount" className="form-label">
                Amount <span className="required-star">*</span>
              </label>
              <div className="input-with-icon">
                <span className="input-currency-symbol">$</span>
                <input
                  id="tx-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  className={`form-input tabular-nums ${errors.amount ? 'error' : ''}`}
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => {
                    setFormData({ ...formData, amount: e.target.value });
                    if (errors.amount) setErrors({ ...errors, amount: undefined });
                  }}
                  disabled={isSubmitting}
                />
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
            <label htmlFor="tx-category" className="form-label">
              Category <span className="required-star">*</span>
            </label>
            <div className="input-with-icon">
              <Tag size={17} className="input-icon" />
              <input
                id="tx-category"
                type="text"
                className={`form-input ${errors.category ? 'error' : ''}`}
                placeholder="Choose from chips below or type custom"
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

            {/* Popular Category Chips */}
            <div className="category-chips-list">
              {popularCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`category-chip ${formData.category.toLowerCase() === cat.toLowerCase() ? 'active' : ''}`}
                  onClick={() => {
                    setFormData({ ...formData, category: cat });
                    if (errors.category) setErrors({ ...errors, category: undefined });
                  }}
                >
                  {cat}
                </button>
              ))}
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
