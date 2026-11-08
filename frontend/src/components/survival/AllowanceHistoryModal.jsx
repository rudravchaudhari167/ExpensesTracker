import React from 'react';
import { X, Calendar, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import './AllowanceHistoryModal.css';

export function AllowanceHistoryModal({
  isOpen,
  onClose,
  history = [],
  currentCycleId,
  onSelectCycle,
  currency = 'INR',
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card card-surface history-modal animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title font-serif">Allowance Cycles History</h3>
            <p className="modal-subtitle">
              Review and audit all your previous and active Student Survival plans.
            </p>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-secondary)' }}>
            <p>No allowance cycles recorded yet.</p>
          </div>
        ) : (
          <div className="history-list">
            {history.map((cycle) => {
              const isSelected = currentCycleId === cycle.id;
              const topUpSum = (cycle.events || []).reduce((acc, ev) => acc + (parseFloat(ev.amount) || 0), 0);
              const totalAllowance = (parseFloat(cycle.allowanceAmount) || 0) + (parseFloat(cycle.openingBalance) || 0) + topUpSum;

              return (
                <div
                  key={cycle.id}
                  className={`history-card-item ${isSelected ? 'active-cycle' : ''}`}
                >
                  <div className="history-head">
                    <div>
                      <div className="history-name">{cycle.name}</div>
                      <div className="history-dates">
                        <Calendar size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                        <span>{cycle.startDate} to {cycle.endDate}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`history-status-badge ${cycle.active ? 'active' : 'archived'}`}>
                        {cycle.active ? 'Active Plan' : 'Completed'}
                      </span>
                      {onSelectCycle && (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            onSelectCycle(cycle.id);
                            onClose();
                          }}
                        >
                          <span>{isSelected ? 'Viewing' : 'Inspect'}</span>
                          <ArrowRight size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="history-metrics-grid">
                    <div className="metric-cell">
                      <span className="metric-lbl">Total Allowance</span>
                      <span className="metric-val font-mono tabular-nums">
                        {formatCurrency(totalAllowance, currency)}
                      </span>
                    </div>
                    <div className="metric-cell">
                      <span className="metric-lbl">Emergency Reserve</span>
                      <span className="metric-val font-mono tabular-nums">
                        {formatCurrency(cycle.emergencyReserve || 0, currency)}
                      </span>
                    </div>
                    <div className="metric-cell">
                      <span className="metric-lbl">Top-ups Received</span>
                      <span className="metric-val font-mono tabular-nums" style={{ color: 'var(--color-sage-dark)' }}>
                        +{formatCurrency(topUpSum, currency)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="modal-actions" style={{ marginTop: 'var(--space-4)' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default AllowanceHistoryModal;
