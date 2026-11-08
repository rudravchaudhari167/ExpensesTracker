import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import './WhatIfSimulatorView.css';

export function WhatIfSimulatorView({ currency = 'INR' }) {
  const [habitAmount, setHabitAmount] = useState(150);
  const [frequency, setFrequency] = useState('daily'); // daily, weekly, monthly
  const [habitName, setHabitName] = useState('Daily Cafeteria Coffee & Snack');

  // Multiplier for monthly
  let monthlySavings = 0;
  if (frequency === 'daily') monthlySavings = habitAmount * 30;
  else if (frequency === 'weekly') monthlySavings = habitAmount * 4.3;
  else monthlySavings = habitAmount;

  const sixMonthSavings = monthlySavings * 6;
  const oneYearSavings = monthlySavings * 12;

  return (
    <div className="what-if-page animate-fade-in">
      <div className="page-header-row">
        <div>
          <h2 className="page-main-heading">What If Simulator 💡</h2>
          <p className="page-main-subheading">
            Simulate small habit tweaks and watch them turn into serious wealth!
          </p>
        </div>
      </div>

      <div className="simulator-grid">
        {/* Controls Card */}
        <div className="simulator-card card-surface">
          <h3 className="sim-card-title">Choose a Spending Habit</h3>

          <div className="sim-form-group">
            <label className="sim-label">Habit Description</label>
            <input
              type="text"
              className="sim-input"
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              placeholder="e.g. Daily Iced Latte"
            />
          </div>

          <div className="sim-form-group">
            <label className="sim-label">Amount per occurrence</label>
            <div className="sim-amount-slider-row">
              <span className="sim-slider-val tabular-nums">
                {formatCurrency(habitAmount, currency)}
              </span>
              <input
                type="range"
                min="20"
                max="2000"
                step="10"
                value={habitAmount}
                onChange={(e) => setHabitAmount(Number(e.target.value))}
                className="sim-range"
              />
            </div>
          </div>

          <div className="sim-form-group">
            <label className="sim-label">Frequency</label>
            <div className="freq-pills-row">
              <button
                type="button"
                className={`freq-pill ${frequency === 'daily' ? 'active' : ''}`}
                onClick={() => setFrequency('daily')}
              >
                Every Day
              </button>
              <button
                type="button"
                className={`freq-pill ${frequency === 'weekly' ? 'active' : ''}`}
                onClick={() => setFrequency('weekly')}
              >
                Every Week
              </button>
              <button
                type="button"
                className={`freq-pill ${frequency === 'monthly' ? 'active' : ''}`}
                onClick={() => setFrequency('monthly')}
              >
                Every Month
              </button>
            </div>
          </div>

          <div className="quick-habits-box">
            <span className="quick-habits-title">Quick presets:</span>
            <div className="quick-habit-buttons">
              <button
                type="button"
                className="btn-quick-habit"
                onClick={() => {
                  setHabitName('Campus Coffee ☕');
                  setHabitAmount(120);
                  setFrequency('daily');
                }}
              >
                Campus Coffee (₹120/day)
              </button>
              <button
                type="button"
                className="btn-quick-habit"
                onClick={() => {
                  setHabitName('Weekend Food Delivery 🍕');
                  setHabitAmount(450);
                  setFrequency('weekly');
                }}
              >
                Weekend Pizza (₹450/week)
              </button>
              <button
                type="button"
                className="btn-quick-habit"
                onClick={() => {
                  setHabitName('Unused Subscription 🎬');
                  setHabitAmount(299);
                  setFrequency('monthly');
                }}
              >
                Streaming Plan (₹299/mo)
              </button>
            </div>
          </div>
        </div>

        {/* Projection Card */}
        <div className="projection-card card-surface">
          <div className="projection-header">
            <Sparkles size={20} className="sparkle-icon" />
            <h3 className="projection-title">Your Future Savings Power</h3>
          </div>

          <p className="projection-subtitle">
            If you substitute or trim <strong>"{habitName}"</strong>:
          </p>

          <div className="projection-stats-list">
            <div className="stat-pill-box">
              <span className="stat-pill-label">In 30 Days</span>
              <span className="stat-pill-number tabular-nums">
                +{formatCurrency(monthlySavings, currency)}
              </span>
            </div>

            <div className="stat-pill-box highlight-6m">
              <span className="stat-pill-label">In 6 Months</span>
              <span className="stat-pill-number tabular-nums">
                +{formatCurrency(sixMonthSavings, currency)}
              </span>
            </div>

            <div className="stat-pill-box highlight-1y">
              <span className="stat-pill-label">In 1 Year</span>
              <span className="stat-pill-number tabular-nums">
                +{formatCurrency(oneYearSavings, currency)}
              </span>
            </div>
          </div>

          <div className="milestone-insight-box">
            <span className="insight-emoji">🚀</span>
            <div className="insight-content">
              <strong>Milestone Equivalent:</strong> In 1 year, this saving covers a high-end smartphone or 2 semesters of textbooks!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WhatIfSimulatorView;
