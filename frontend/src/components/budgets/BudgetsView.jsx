import React from 'react';
import { Target, Layers, Sparkles, CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import './BudgetsView.css';

export function BudgetsView({ summary = {}, transactions = [], currency = 'USD' }) {
  const expenses = transactions.filter((t) => t.type === 'EXPENSE');
  const totalExpense = expenses.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  return (
    <div className="budgets-container animate-fade-in">
      <div className="budgets-hero card-surface">
        <div className="budgets-badge">
          <Target size={14} />
          <span>Backend Specification Notice</span>
        </div>
        <h2 className="budgets-title font-serif">Monthly Budgets & Caps</h2>
        <p className="budgets-subtitle">
          Budget caps and category thresholds are currently not configured in the Spring Boot backend REST API.
        </p>
      </div>

      <div className="budgets-info-card card-surface">
        <div className="info-card-header">
          <div className="info-icon-box">
            <Layers size={22} />
          </div>
          <div>
            <h3 className="info-title font-serif">Architecture & Implementation Status</h3>
            <span className="info-status-pill">Spring Boot: Transactions Only</span>
          </div>
        </div>

        <p className="info-text">
          Pennywise connects directly to your existing Spring Boot backend.
          Your current backend implements complete CRUD and summary endpoints for{' '}
          <code>Transaction</code> records (Title, Amount, Type, Category, Date), but does not yet expose a{' '}
          <code>Budget</code> entity or <code>/api/budgets</code> endpoints.
        </p>

        <div className="spec-checklist">
          <h4 className="spec-checklist-title font-serif">To enable persistent backend budgets:</h4>
          <ul className="spec-list">
            <li>
              <CheckCircle2 size={16} className="spec-icon-done" />
              <span>
                <strong>Frontend Ready:</strong> UI budget components and progress tracking structures are ready.
              </span>
            </li>
            <li>
              <span className="spec-icon-pending">•</span>
              <span>
                <strong>Backend Entity:</strong> Create <code>Budget.java</code> with fields <code>id, category, monthlyLimit, monthYear</code>.
              </span>
            </li>
            <li>
              <span className="spec-icon-pending">•</span>
              <span>
                <strong>REST Controller:</strong> Expose <code>GET /api/budgets</code> and <code>POST /api/budgets</code>.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Dynamic spending cap preview based on real current expenses */}
      {totalExpense > 0 && (
        <div className="budgets-calculator-card card-surface">
          <div className="calculator-header">
            <Sparkles size={18} className="calc-sparkle" />
            <h4 className="calculator-title font-serif">Estimated Spending Guidelines</h4>
          </div>
          <p className="calculator-subtitle">
            Based on your recorded total outflows of{' '}
            <strong>{formatCurrency(totalExpense, currency)}</strong>, here is how a 50/30/20 budget rhythm would distribute your funds:
          </p>

          <div className="calculator-grid">
            <div className="calc-pill-card">
              <span className="calc-pill-label">Needs (50%)</span>
              <span className="calc-pill-val tabular-nums font-serif">
                {formatCurrency(totalExpense * 0.5, currency)}
              </span>
              <span className="calc-pill-desc">Housing, Groceries, Utilities</span>
            </div>
            <div className="calc-pill-card">
              <span className="calc-pill-label">Wants (30%)</span>
              <span className="calc-pill-val tabular-nums font-serif">
                {formatCurrency(totalExpense * 0.3, currency)}
              </span>
              <span className="calc-pill-desc">Dining, Shopping, Hobbies</span>
            </div>
            <div className="calc-pill-card">
              <span className="calc-pill-label">Savings (20%)</span>
              <span className="calc-pill-val tabular-nums font-serif">
                {formatCurrency(totalExpense * 0.2, currency)}
              </span>
              <span className="calc-pill-desc">Investments & Emergency buffer</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BudgetsView;
