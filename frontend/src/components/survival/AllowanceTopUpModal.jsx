import React, { useState } from 'react';
import { X, PlusCircle, Calendar, AlertCircle, ArrowUpRight } from 'lucide-react';
import { formatCurrency, getCurrencySymbol } from '../../utils/currency';
import './AllowanceTopUpModal.css';

export function AllowanceTopUpModal({
  isOpen,
  onClose,
  onSubmit,
  cycleId,
  currency = 'INR',
}) {
  const getToday = () => new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    amount: '',
    date: getToday(),
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      errs.amount = 'Please enter a valid amount greater than 0';
    }
    if (!formData.date) {
      errs.date = 'Date is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(cycleId, {
        amount: parseFloat(formData.amount),
        date: formData.date,
        description: formData.description?.trim() || 'Allowance Top-up',
      });
      setFormData({ amount: '', date: getToday(), description: '' });
      onClose();
    } catch (err) {
      setSubmitError(err.message || 'Failed to record allowance top-up.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyPreset = (amt) => {
    setFormData((prev) => ({ ...prev, amount: amt.toString() }));
    if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
  };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card card-surface topup-modal animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title font-serif">Add Money / Top-up</h3>
            <p className="modal-subtitle">
              Record extra cash, freelance income, or pocket money added to this cycle.
            </p>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        {submitError && (
          <div className="modal-error-banner animate-fade-in">
            <AlertCircle size={16} />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Top-up Amount */}
          <div className="form-group">
            <label className="form-label">
              Top-up Amount <span className="required-star">*</span>
            </label>
            <div className="input-with-icon">
              <span className="input-currency-symbol font-mono">{getCurrencySymbol(currency)}</span>
              <input
                type="number"
                step="1"
                min="1"
                className={`form-input tabular-nums ${errors.amount ? 'error' : ''}`}
                placeholder="e.g. 1000"
                value={formData.amount}
                onChange={(e) => {
                  setFormData({ ...formData, amount: e.target.value });
                  if (errors.amount) setErrors({ ...errors, amount: undefined });
                }}
                required
                autoFocus
              />
            </div>
            {errors.amount && <span className="field-error">{errors.amount}</span>}

            <div className="topup-preset-chips">
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Quick:</span>
              {[500, 1000, 2000, 5000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  className="topup-preset-btn"
                  onClick={() => handleApplyPreset(amt)}
                >
                  +{formatCurrency(amt, currency, { fractionDigits: 0 })}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div className="form-group">
            <label className="form-label">
              Received Date <span className="required-star">*</span>
            </label>
            <div className="input-with-icon">
              <span className="input-icon-left">
                <Calendar size={16} />
              </span>
              <input
                type="date"
                className={`form-input ${errors.date ? 'error' : ''}`}
                value={formData.date}
                onChange={(e) => {
                  setFormData({ ...formData, date: e.target.value });
                  if (errors.date) setErrors({ ...errors, date: undefined });
                }}
                required
              />
            </div>
            {errors.date && <span className="field-error">{errors.date}</span>}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">
              Source / Description <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(Optional)</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Pocket money from parents, Freelance gig"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              maxLength={120}
            />
          </div>

          <div className="modal-actions" style={{ marginTop: 'var(--space-4)' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              <PlusCircle size={16} />
              <span>{isSubmitting ? 'Adding...' : 'Add to Allowance'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AllowanceTopUpModal;

