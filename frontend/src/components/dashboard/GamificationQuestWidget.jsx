import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Flame, CheckCircle, Sparkles } from 'lucide-react';
import './GamificationQuestWidget.css';

export function GamificationQuestWidget({ onShowToast }) {
  const [questCompleted, setQuestCompleted] = useState(false);
  const [xp, setXp] = useState(65);

  const handleCompleteQuest = () => {
    if (questCompleted) return;

    setQuestCompleted(true);
    setXp((prev) => Math.min(100, prev + 35));

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#F28B50', '#A8C995', '#F8E7B2', '#E8DDF4'],
      });
    } catch {
      // Confetti fallback
    }

    if (onShowToast) {
      onShowToast('success', '+35 XP! Daily Money Quest completed!', 'Level Up Progress! 🌟');
    }
  };

  const badges = [
    { id: 'b1', name: 'Smart Spender', icon: '🌱', unlocked: true, desc: 'Stayed under budget this week' },
    { id: 'b2', name: '4-Day Streak', icon: '🔥', unlocked: true, desc: 'Logged spending 4 days in a row' },
    { id: 'b3', name: 'Savings Star', icon: '⭐', unlocked: true, desc: 'Saved 20% of monthly income' },
    { id: 'b4', name: 'Survival Master', icon: '🎓', unlocked: false, desc: 'Kept daily limit for 14 days' },
  ];

  return (
    <div className="gamification-widget card-surface">
      <div className="gamification-header">
        <div className="level-badge-pill">
          <span className="level-number-badge">Lv. 2</span>
          <span className="level-title-text">Smart Spender</span>
        </div>

        <div className="streak-pill">
          <Flame size={15} className="flame-icon" />
          <span>4-Day Streak</span>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="xp-container">
        <div className="xp-labels">
          <span className="xp-text">Progress to Level 3 (Budget Master)</span>
          <span className="xp-score tabular-nums">{xp} / 100 XP</span>
        </div>
        <div className="xp-track">
          <div className="xp-fill" style={{ width: `${xp}%` }} />
        </div>
      </div>

      {/* Quest & Badges Grid */}
      <div className="quest-and-badges">
        {/* Daily Quest */}
        <div className="daily-quest-card">
          <div className="quest-tag">TODAY'S QUEST</div>
          <div className="quest-row">
            <div className="quest-info">
              <span className="quest-title">Log today's lunch or coffee</span>
              <span className="quest-reward">+35 XP & 1 Gem</span>
            </div>
            <button
              type="button"
              className={`quest-check-btn ${questCompleted ? 'completed' : ''}`}
              onClick={handleCompleteQuest}
            >
              {questCompleted ? (
                <>
                  <CheckCircle size={15} />
                  <span>Done!</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Claim</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Badges preview */}
        <div className="badges-row">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`badge-icon-item ${b.unlocked ? 'unlocked' : 'locked'}`}
              title={`${b.name}: ${b.desc}`}
            >
              <span className="badge-emoji">{b.icon}</span>
              <span className="badge-name-micro">{b.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GamificationQuestWidget;
