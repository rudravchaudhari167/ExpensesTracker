import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Plus, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import './SavingsGoalsView.css';

export function SavingsGoalsView({ currency = 'INR', onShowToast }) {
  const [goals, setGoals] = useState([
    {
      id: 'g1',
      title: 'New Laptop Fund 💻',
      target: 60000,
      saved: 38000,
      category: 'Tech',
      color: '#F28B50',
    },
    {
      id: 'g2',
      title: 'College Semester Trip 🏕️',
      target: 12000,
      saved: 9200,
      category: 'Travel',
      color: '#A8C995',
    },
    {
      id: 'g3',
      title: 'Emergency Student Cushion 🛡️',
      target: 15000,
      saved: 15000,
      category: 'Security',
      color: '#8A68D6',
      completed: true,
    },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState('');

  const handleDeposit = (id, amount) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const updated = Math.min(g.target, g.saved + amount);
          const wasCompleted = g.completed;
          const isNowCompleted = updated >= g.target;
          if (!wasCompleted && isNowCompleted) {
            try {
              confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
            } catch {
              // fallback
            }
            if (onShowToast) {
              onShowToast('success', `Hurray! You reached your goal "${g.title}"! 🎉`, 'Goal Completed!');
            }
          }
          return { ...g, saved: updated, completed: isNowCompleted };
        }
        return g;
      })
    );
  };

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newTarget || isNaN(newTarget)) return;

    const newGoal = {
      id: `g-${Date.now()}`,
      title: newTitle.trim(),
      target: parseFloat(newTarget),
      saved: 0,
      category: 'Custom',
      color: '#F28B50',
    };

    setGoals((prev) => [newGoal, ...prev]);
    setNewTitle('');
    setNewTarget('');
    setIsAdding(false);

    if (onShowToast) {
      onShowToast('success', `Created savings goal: "${newGoal.title}"`, 'New Goal Added! 🎯');
    }
  };

  return (
    <div className="savings-goals-page animate-fade-in">
      <div className="page-header-row">
        <div>
          <h2 className="page-main-heading">Savings Goals 🎯</h2>
          <p className="page-main-subheading">
            Dream big, save consistently, and celebrate every milestone!
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-add-goal"
          onClick={() => setIsAdding((prev) => !prev)}
        >
          <Plus size={18} />
          <span>New Goal</span>
        </button>
      </div>

      {/* New Goal Inline Form */}
      {isAdding && (
        <form onSubmit={handleAddGoal} className="new-goal-form card-surface animate-scale-up">
          <h4 className="form-heading">Create a New Savings Goal</h4>
          <div className="form-inputs-row">
            <input
              type="text"
              placeholder="e.g. New Headphones or Goa Trip"
              className="form-input"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Target amount"
              className="form-input"
              value={newTarget}
              onChange={(e) => setNewTarget(e.target.value)}
              min="1"
              required
            />
            <button type="submit" className="btn btn-primary">
              Save Goal
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setIsAdding(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Goals Grid */}
      <div className="goals-grid">
        {goals.map((g) => {
          const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
          const remaining = Math.max(0, g.target - g.saved);
          return (
            <div key={g.id} className="goal-card card-surface">
              <div className="goal-card-top">
                <span className="goal-card-title">{g.title}</span>
                {g.completed ? (
                  <span className="badge badge-sage">
                    <CheckCircle2 size={13} /> Completed
                  </span>
                ) : (
                  <span className="goal-pct-pill">{pct}%</span>
                )}
              </div>

              <div className="goal-numbers-row">
                <div className="goal-saved-text tabular-nums">
                  {formatCurrency(g.saved, currency)}
                </div>
                <div className="goal-target-text tabular-nums">
                  of {formatCurrency(g.target, currency)}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="goal-track">
                <div
                  className="goal-fill"
                  style={{
                    width: `${pct}%`,
                    background: g.completed ? '#50963C' : g.color,
                  }}
                />
              </div>

              <div className="goal-card-bottom">
                <span className="remaining-text">
                  {remaining > 0 ? `${formatCurrency(remaining, currency)} remaining` : 'Target reached! 🏆'}
                </span>

                {!g.completed && (
                  <div className="quick-deposit-pills">
                    <button
                      type="button"
                      className="deposit-pill"
                      onClick={() => handleDeposit(g.id, 500)}
                    >
                      +₹500
                    </button>
                    <button
                      type="button"
                      className="deposit-pill"
                      onClick={() => handleDeposit(g.id, 1000)}
                    >
                      +₹1k
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SavingsGoalsView;
