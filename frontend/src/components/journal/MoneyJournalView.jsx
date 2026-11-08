import React, { useState, useEffect } from 'react';
import { UserAvatar } from '../common/UserAvatar';
import './MoneyJournalView.css';

export function MoneyJournalView({ onShowToast }) {
  const [entries, setEntries] = useState(() => {
    try {
      const saved = localStorage.getItem('pennywise_money_journal');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      {
        id: 'j1',
        date: 'Today, 2:30 PM',
        mood: '😊 Joyful',
        tag: '#SmartSpend',
        content: 'Cooked lunch with roommates instead of ordering take-out. Saved ₹350 and had great fun!',
      },
      {
        id: 'j2',
        date: 'Yesterday, 8:15 PM',
        mood: '😌 Peaceful',
        tag: '#AllowanceVictory',
        content: 'Stayed ₹80 below my daily allowance limit today. Put the leftover straight into the laptop fund.',
      },
    ];
  });

  const [newContent, setNewContent] = useState('');
  const [selectedMood, setSelectedMood] = useState('😊 Proud');
  const [selectedTag, setSelectedTag] = useState('#SmartSpend');

  useEffect(() => {
    try {
      localStorage.setItem('pennywise_money_journal', JSON.stringify(entries));
    } catch {
      // ignore
    }
  }, [entries]);

  const handleAddEntry = (e) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const newEntry = {
      id: `j-${Date.now()}`,
      date: 'Just now',
      mood: selectedMood,
      tag: selectedTag,
      content: newContent.trim(),
    };

    setEntries((prev) => [newEntry, ...prev]);
    setNewContent('');

    if (onShowToast) {
      onShowToast('success', 'Journal entry saved! Reflecting builds discipline.', 'Thought Recorded! 📝');
    }
  };

  const moods = ['😊 Proud', '😌 Calm', '🎯 Focused', '🌿 Mindful'];
  const tags = ['#SmartSpend', '#AllowanceVictory', '#NoSpendDay', '#Milestone'];

  return (
    <div className="money-journal-page animate-fade-in">
      <div className="page-header-row card-surface journal-hero-card">
        <div>
          <h2 className="page-main-heading">Money Journal 📝</h2>
          <p className="page-main-subheading">
            Reflect on your daily financial choices and celebrate mindful wins.
          </p>
        </div>
        <div className="journal-hero-avatar">
          <UserAvatar size={70} />
        </div>
      </div>

      <div className="journal-layout-grid">
        {/* New Entry Form */}
        <div className="new-journal-card card-surface">
          <h3 className="journal-form-title">Write a Reflection</h3>

          <form onSubmit={handleAddEntry}>
            <div className="journal-mood-picker">
              <span className="picker-label">How are you feeling today?</span>
              <div className="mood-buttons-row">
                {moods.map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`mood-btn ${selectedMood === m ? 'active' : ''}`}
                    onClick={() => setSelectedMood(m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="journal-textarea-wrapper">
              <textarea
                className="journal-textarea"
                rows={4}
                placeholder="What went well with your money today? Any smart win or learning?"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                required
              />
            </div>

            <div className="journal-tag-picker">
              <span className="picker-label">Tag this entry:</span>
              <div className="tag-chips-row">
                {tags.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`tag-chip ${selectedTag === t ? 'active' : ''}`}
                    onClick={() => setSelectedTag(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-save-journal">
              Save Entry
            </button>
          </form>
        </div>

        {/* Previous Entries List */}
        <div className="journal-entries-list">
          <h3 className="entries-list-title">Past Reflections ({entries.length})</h3>

          <div className="entries-stream">
            {entries.map((entry) => (
              <div key={entry.id} className="entry-card card-surface animate-fade-in">
                <div className="entry-top-row">
                  <span className="entry-mood-pill">{entry.mood}</span>
                  <span className="entry-tag-pill">{entry.tag}</span>
                  <span className="entry-date-pill">{entry.date}</span>
                </div>
                <p className="entry-body-text">{entry.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MoneyJournalView;
