import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import './ConfirmModal.css';

export function ConfirmModal({
  isOpen,
  title = 'Delete Transaction',
  message = 'Are you sure you want to delete this transaction? This action cannot be undone.',
  transactionTitle = '',
  amountText = '',
  isDeleting = false,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onCancel} role="dialog" aria-modal="true">
      <div className="confirm-modal-box card-surface animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon-badge">
          <AlertTriangle size={24} className="text-danger" />
        </div>

        <h3 className="confirm-title font-serif">{title}</h3>
        <p className="confirm-message">{message}</p>

        {transactionTitle && (
          <div className="confirm-item-preview">
            <span className="preview-title">{transactionTitle}</span>
            {amountText && <span className="preview-amount tabular-nums">{amountText}</span>}
          </div>
        )}

        <div className="confirm-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            <Trash2 size={16} />
            <span>{isDeleting ? 'Deleting...' : 'Delete Forever'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
