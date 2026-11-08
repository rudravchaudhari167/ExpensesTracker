import React, { useState, useEffect } from 'react';
import {
  X,
  GraduationCap,
  Sparkles,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency, getCurrencySymbol } from '../../utils/currency';
import './AllowanceSetupModal.css';

export function AllowanceSetupModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  currency = 'INR',
}) {
  const isEditing = Boolean(initialData && initialData.id);

  // Helper for initial dates
  const getToday = () => new Date().toISOString().split('T')[0];
  const getMonthEnd = () => {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return end.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    name: '',
    allowanceAmount: '',
    startDate: getToday(),
    endDate: getMonthEnd(),
    openingBalance: '',
    emergencyReserve: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        allowanceAmount: initialData.allowanceAmount?.toString() || '',
        startDate: initialData.startDate || getToday(),
        endDate: initialData.endDate || getMonthEnd(),
        openingBalance: initialData.openingBalance ? initialData.openingBalance.toString() : '',
        emergencyReserve: initialData.emergencyReserve ? initialData.emergencyReserve.toString() : '',
      });
    } else {
      setFormData({
        name: '',
        allowanceAmount: '8000',
        startDate: getToday(),
        endDate: getMonthEnd(),
        openingBalance: '0',
        emergencyReserve: '500',
      });
    }
    setErrors({});
    setSubmitError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Real-time calculation preview
  const parsedAllowance = parseFloat(formData.allowanceAmount) || 0;
  const parsedOpening = parseFloat(formData.openingBalance) || 0;
  const parsedReserve = parseFloat(formData.emergencyReserve) || 0;

  const flexibleTotal = Math.max(0, parsedAllowance + parsedOpening - parsedReserve);

  // Calculate days in cycle
  let cycleDays = 30;
  if (formData.startDate && formData.endDate) {
    const s = new Date(formData.startDate);
    const e = new Date(formData.endDate);
    const diffTime = e.getTime() - s.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24)) + 1;
    if (diffDays > 0) cycleDays = diffDays;
  }
  const estimatedDaily = cycleDays > 0 ? (flexibleTotal / cycleDays).toFixed(2) : '0.00';

  const validate = () => {
    const errs = {};
    if (!formData.allowanceAmount || isNaN(formData.allowanceAmount) || parseFloat(formData.allowanceAmount) <= 0) {
      errs.allowanceAmount = 'Please enter a valid allowance amount greater than 0';
    }
    if (!formData.startDate) {
      errs.startDate = 'Start date is required';
    }
    if (!formData.endDate) {
      errs.endDate = 'End date is required';
    }
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      errs.endDate = 'End date must be after or equal to start date';
    }
    if (parsedReserve < 0) {
      errs.emergencyReserve = 'Emergency reserve cannot be negative';
    }
    if (parsedReserve > (parsedAllowance + parsedOpening)) {
      errs.emergencyReserve = 'Emergency reserve cannot exceed total available allowance';
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
      await onSubmit({
        name: formData.name.trim() || undefined,
        allowanceAmount: parseFloat(formData.allowanceAmount),
        startDate: formData.startDate,
        endDate: formData.endDate,
        openingBalance: parsedOpening,
        emergencyReserve: parsedReserve,
        fixedExpenses: 0,
        notes: undefined,
      }, initialData?.id);
      onClose();
    } catch (err) {
      setSubmitError(err.message || 'Failed to save allowance cycle to Spring Boot database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyPreset = (amount) => {
    setFormData((prev) => ({ ...prev, allowanceAmount: amount.toString() }));
    if (errors.allowanceAmount) setErrors((prev) => ({ ...prev, allowanceAmount: undefined }));
  };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card card-surface survival-setup-modal animate-scale-up" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div className="setup-header-badge">
              <GraduationCap size={13} />
              <span>Student Survival Mode</span>
            </div>
            <h3 className="modal-title font-serif">
              {isEditing ? 'Update Survival Plan' : "Let's set up your survival plan!"}
            </h3>
            <p className="modal-subtitle">
              Tell us how much money you have and when your next allowance arrives.
            </p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Global Error Banner */}
        {submitError && (
          <div className="modal-error-banner animate-fade-in">
            <AlertCircle size={16} />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Plan Name */}
          <div className="form-group">
            <label className="form-label">
              Plan Title <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(Optional)</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. November Survival Budget"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              maxLength={100}
            />
          </div>

          {/* Allowance Amount & Quick Presets */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">
                Monthly / Cycle Allowance <span className="required-star">*</span>
              </label>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                Currency: <strong>{currency}</strong>
              </span>
            </div>

            <div className="input-with-icon">
              <span className="input-currency-symbol font-mono">{getCurrencySymbol(currency)}</span>
              <input
                type="number"
                step="1"
                min="1"
                className={`form-input tabular-nums ${errors.allowanceAmount ? 'error' : ''}`}
                placeholder="e.g. 8000"
                value={formData.allowanceAmount}
                onChange={(e) => {
                  setFormData({ ...formData, allowanceAmount: e.target.value });
                  if (errors.allowanceAmount) setErrors({ ...errors, allowanceAmount: undefined });
                }}
                required
              />
            </div>
            {errors.allowanceAmount && <span className="field-error">{errors.allowanceAmount}</span>}

            {/* Presets */}
            <div className="setup-presets-row">
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Quick:</span>
              {[5000, 8000, 10000, 12000, 15000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  className={`preset-chip ${formData.allowanceAmount === amt.toString() ? 'active' : ''}`}
                  onClick={() => handleApplyPreset(amt)}
                >
                  {formatCurrency(amt, currency, { fractionDigits: 0 })}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range: Start Date & Next Allowance Date */}
          <div className="setup-dates-grid">
            <div className="form-group">
              <label className="form-label">
                Cycle Start Date <span className="required-star">*</span>
              </label>
              <div className="input-with-icon">
                <span className="input-icon-left">
                  <Calendar size={16} />
                </span>
                <input
                  type="date"
                  className={`form-input ${errors.startDate ? 'error' : ''}`}
                  value={formData.startDate}
                  onChange={(e) => {
                    setFormData({ ...formData, startDate: e.target.value });
                    if (errors.startDate) setErrors({ ...errors, startDate: undefined });
                  }}
                  required
                />
              </div>
              {errors.startDate && <span className="field-error">{errors.startDate}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Next Allowance Date <span className="required-star">*</span>
              </label>
              <div className="input-with-icon">
                <span className="input-icon-left">
                  <Calendar size={16} />
                </span>
                <input
                  type="date"
                  className={`form-input ${errors.endDate ? 'error' : ''}`}
                  value={formData.endDate}
                  onChange={(e) => {
                    setFormData({ ...formData, endDate: e.target.value });
                    if (errors.endDate) setErrors({ ...errors, endDate: undefined });
                  }}
                  required
                />
              </div>
              {errors.endDate && <span className="field-error">{errors.endDate}</span>}
            </div>
          </div>

          {/* 3-Column Monetary Options: Opening Balance, Emergency Reserve, Fixed Costs */}
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">
                Opening Balance <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(Optional)</span>
              </label>
              <div className="input-with-icon">
                <span className="input-currency-symbol font-mono">{getCurrencySymbol(currency)}</span>
                <input
                  type="number"
                  step="1"
                  min="0"
                  className="form-input tabular-nums"
                  placeholder="0"
                  value={formData.openingBalance}
                  onChange={(e) => setFormData({ ...formData, openingBalance: e.target.value })}
                />
              </div>
              <p className="helper-caption">Carryover cash from last month</p>
            </div>

            <div className="form-group">
              <label className="form-label">
                Emergency Reserve <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(Optional)</span>
              </label>
              <div className="input-with-icon">
                <span className="input-currency-symbol font-mono">{getCurrencySymbol(currency)}</span>
                <input
                  type="number"
                  step="1"
                  min="0"
                  className={`form-input tabular-nums ${errors.emergencyReserve ? 'error' : ''}`}
                  placeholder="500"
                  value={formData.emergencyReserve}
                  onChange={(e) => {
                    setFormData({ ...formData, emergencyReserve: e.target.value });
                    if (errors.emergencyReserve) setErrors({ ...errors, emergencyReserve: undefined });
                  }}
                />
              </div>
              <p className="helper-caption">Locked for medical/urgent needs only</p>
              {errors.emergencyReserve && <span className="field-error">{errors.emergencyReserve}</span>}
            </div>
          </div>

          {/* Live Calculation Preview Card */}
          <div className="setup-preview-card">
            <div className="preview-col">
              <span className="preview-label">Flexible Spending Pool</span>
              <span className="preview-value font-mono tabular-nums">
                {formatCurrency(flexibleTotal, currency)}
              </span>
            </div>
            <div className="preview-divider"></div>
            <div className="preview-col">
              <span className="preview-label">Cycle Duration</span>
              <span className="preview-value font-mono">{cycleDays} Days</span>
            </div>
            <div className="preview-divider"></div>
            <div className="preview-col">
              <span className="preview-label">Estimated Daily Limit</span>
              <span className="preview-value font-mono tabular-nums">
                {formatCurrency(parseFloat(estimatedDaily), currency)} / day
              </span>
            </div>
          </div>

          {/* Modal Footer Actions */}
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
              <Sparkles size={16} />
              <span>{isSubmitting ? 'Saving Plan...' : (isEditing ? 'Update Plan' : 'Activate Survival Plan')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AllowanceSetupModal;

