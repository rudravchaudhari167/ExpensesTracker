import React from 'react';
import { Target, Layers, ArrowUpRight } from 'lucide-react';
import './BudgetTeaserCard.css';

export function BudgetTeaserCard({ onNavigateBudgets }) {
  return (
    <div className="budget-teaser-card card-surface animate-fade-in">
      <div className="teaser-header">
        <div className="teaser-icon-box">
          <Target size={20} />
        </div>
        <div>
          <h4 className="teaser-title font-serif">Monthly Budgets</h4>
          <span className="teaser-status-pill">Feature Status: Not Configured</span>
        </div>
      </div>

      <p className="teaser-description">
        Category-level budget caps are not configured in your current Spring Boot REST API.
        Your ledger currently persists transactions and calculates totals.
      </p>

      <div className="teaser-action-row">
        <button
          className="btn btn-secondary btn-sm"
          onClick={onNavigateBudgets}
        >
          <span>Explore Budget Roadmap</span>
          <ArrowUpRight size={14} />
        </button>
      </div>
    </div>
  );
}

export default BudgetTeaserCard;
