import React, { useState, useEffect, useMemo } from 'react';
import {
  Lock,
  Unlock,
  ShieldAlert,
  Clock,
  Sparkles,
  ShoppingBag,
  PiggyBank,
  Trash2,
  Flame,
  Check,
  Zap,
  Pencil,
  X,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatCurrency, getCurrencySymbol } from '../../utils/currency';
import './WishVault.css';

const VAULT_STORAGE_KEY = 'spendl_wish_vault_items';
const VAULT_SAVED_TOTAL_KEY = 'spendl_wish_vault_saved_total';

// Realistic sample items so the user immediately experiences both states
const INITIAL_DEMO_ITEMS = [
  {
    id: 'vault-1',
    name: 'Sony WH-1000XM5 ANC Headphones',
    price: 349.0,
    category: 'Electronics',
    lockedAt: Date.now() - 14 * 3600 * 1000,
    unlockAt: Date.now() + 34 * 3600 * 1000, // 34h remaining
    durationMs: 48 * 3600 * 1000,
    status: 'locked', // 'locked' | 'decision'
  },
  {
    id: 'vault-2',
    name: 'Keychron Q1 Pro Mechanical Keyboard',
    price: 199.0,
    category: 'Shopping',
    lockedAt: Date.now() - 23 * 3600 * 1000,
    unlockAt: Date.now() + 25 * 1000, // 25s remaining so user can watch it hit 0!
    durationMs: 24 * 3600 * 1000,
    status: 'locked',
  },
  {
    id: 'vault-3',
    name: 'Nordic Minimalist Cashmere Overcoat',
    price: 280.0,
    category: 'Apparel',
    lockedAt: Date.now() - 48 * 3600 * 1000,
    unlockAt: Date.now() - 1000, // already unlocked & ready for decision!
    durationMs: 48 * 3600 * 1000,
    status: 'decision',
  },
];

/**
 * Convert value + unit to milliseconds
 */
function toMilliseconds(value, unit) {
  const val = Math.max(1, parseFloat(value) || 1);
  switch (unit) {
    case 'hours':
      return val * 3600 * 1000;
    case 'days':
      return val * 24 * 3600 * 1000;
    case 'weeks':
      return val * 7 * 24 * 3600 * 1000;
    case 'months':
      return val * 30 * 24 * 3600 * 1000;
    case 'seconds':
      return val * 1000;
    default:
      return val * 24 * 3600 * 1000;
  }
}

/**
 * Format remaining milliseconds into Days, Hours, Mins, Secs
 */
function calculateTimeLeft(targetTimestamp, now) {
  const difference = targetTimestamp - now;
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isZero: true };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / (1000 * 60)) % 60);
  const seconds = Math.floor((difference / 1000) % 60);

  return {
    days,
    hours,
    minutes,
    seconds,
    isZero: false,
  };
}

export function WishVault({ currency = 'USD', onLogExpense, onShowToast }) {
  // Vault items from storage
  const [items, setItems] = useState(() => {
    if (typeof window === 'undefined') return INITIAL_DEMO_ITEMS;
    try {
      const stored = localStorage.getItem(VAULT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not read vault items from localStorage:', e);
    }
    return INITIAL_DEMO_ITEMS;
  });

  // Cumulative money saved by saying "No" to impulses
  const [totalSaved, setTotalSaved] = useState(() => {
    if (typeof window === 'undefined') return 620;
    try {
      const stored = localStorage.getItem(VAULT_SAVED_TOTAL_KEY);
      if (stored) return parseFloat(stored) || 0;
    } catch {}
    return 620;
  });

  // Real-time ticker
  const [now, setNow] = useState(Date.now());

  // Form State
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [durationMode, setDurationMode] = useState('preset'); // 'preset' | 'custom' | 'test'
  const [presetHours, setPresetHours] = useState('48');
  const [customValue, setCustomValue] = useState('7');
  const [customUnit, setCustomUnit] = useState('days');
  const [formError, setFormError] = useState('');

  // Editing Time State for locked items
  const [editingItemId, setEditingItemId] = useState(null);
  const [editCustomValue, setEditCustomValue] = useState('3');
  const [editCustomUnit, setEditCustomUnit] = useState('days');

  // Persist items
  useEffect(() => {
    try {
      localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save vault items:', e);
    }
  }, [items]);

  // Persist total saved
  useEffect(() => {
    try {
      localStorage.setItem(VAULT_SAVED_TOTAL_KEY, String(totalSaved));
    } catch (e) {
      console.warn('Failed to save total saved:', e);
    }
  }, [totalSaved]);

  // Continuous 1-second countdown clock
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check for newly matured items
  useEffect(() => {
    setItems((prevItems) => {
      let hasChanges = false;
      const updated = prevItems.map((item) => {
        if (item.status === 'locked' && item.unlockAt <= now) {
          hasChanges = true;
          return { ...item, status: 'decision' };
        }
        return item;
      });
      return hasChanges ? updated : prevItems;
    });
  }, [now]);

  // Handle locking a new item into the vault
  const handleLockInVault = (e) => {
    e.preventDefault();
    setFormError('');

    const cleanName = itemName.trim();
    const cleanPrice = parseFloat(itemPrice);

    if (!cleanName) {
      setFormError('Please enter the name of the item.');
      return;
    }
    if (isNaN(cleanPrice) || cleanPrice <= 0) {
      setFormError('Please enter a valid price amount.');
      return;
    }

    let durationMs = 0;
    let durationLabel = '';

    if (durationMode === 'test') {
      durationMs = 15 * 1000;
      durationLabel = '15 seconds (Test Mode)';
    } else if (durationMode === 'custom') {
      const parsedVal = Math.max(1, parseFloat(customValue) || 1);
      durationMs = toMilliseconds(parsedVal, customUnit);
      durationLabel = `${parsedVal} ${customUnit}`;
    } else {
      const hoursNum = parseInt(presetHours, 10) || 48;
      durationMs = hoursNum * 3600 * 1000;
      durationLabel = `${hoursNum} hours`;
    }

    const newItem = {
      id: `vault-${Date.now()}`,
      name: cleanName,
      price: Math.round(cleanPrice * 100) / 100,
      category: 'Impulse Wish',
      lockedAt: Date.now(),
      unlockAt: Date.now() + durationMs,
      durationMs,
      status: 'locked',
    };

    setItems([newItem, ...items]);
    setItemName('');
    setItemPrice('');
    setFormError('');

    if (onShowToast) {
      onShowToast(
        'success',
        `"${cleanName}" (${formatCurrency(cleanPrice, currency)}) locked for ${durationLabel}.`,
        'Impulse Locked in Vault'
      );
    }
  };

  // Quick Extend an existing item's time period
  const handleQuickExtend = (itemId, additionalHours, label) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== itemId) return it;
        const baseTime = it.unlockAt > now ? it.unlockAt : now;
        const newUnlockAt = baseTime + additionalHours * 3600 * 1000;
        const newDuration = newUnlockAt - it.lockedAt;
        return {
          ...it,
          unlockAt: newUnlockAt,
          durationMs: newDuration,
          status: 'locked', // Re-lock if it was in decision
        };
      })
    );

    const targetItem = items.find((i) => i.id === itemId);
    const itemNameStr = targetItem ? targetItem.name : 'Item';

    if (onShowToast) {
      onShowToast(
        'info',
        `Added ${label} to cooling period for "${itemNameStr}".`,
        'Cooling Period Extended'
      );
    }
    setEditingItemId(null);
  };

  // Set custom new cooling period for an existing item
  const handleApplyCustomEditTime = (itemId) => {
    const parsedVal = Math.max(1, parseFloat(editCustomValue) || 1);
    const addedMs = toMilliseconds(parsedVal, editCustomUnit);
    const newUnlockAt = now + addedMs;

    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== itemId) return it;
        return {
          ...it,
          unlockAt: newUnlockAt,
          durationMs: newUnlockAt - it.lockedAt,
          status: 'locked',
        };
      })
    );

    const targetItem = items.find((i) => i.id === itemId);
    const itemNameStr = targetItem ? targetItem.name : 'Item';

    if (onShowToast) {
      onShowToast(
        'success',
        `Cooling period for "${itemNameStr}" updated to ${parsedVal} ${editCustomUnit} from now.`,
        'Timer Updated'
      );
    }
    setEditingItemId(null);
  };

  // Action 1: "Save This Money instead!" (Hero action)
  const handleSaveInstead = (item) => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.65 },
      colors: ['#3E6B3B', '#E87952', '#F6E6A9', '#282820', '#FFFFFF'],
    });

    setTotalSaved((prev) => prev + item.price);
    setItems((prev) => prev.filter((i) => i.id !== item.id));

    if (onShowToast) {
      onShowToast(
        'success',
        `Victory! You resisted "${item.name}" and kept ${formatCurrency(item.price, currency)} in your savings!`,
        'Impulse Defeated 🎉'
      );
    }
  };

  // Action 2: "I Still Want It" (Secondary action - validated mindful purchase)
  const handleStillWantIt = (item) => {
    if (onLogExpense) {
      onLogExpense({
        title: item.name,
        amount: item.price,
        type: 'EXPENSE',
        category: 'Shopping',
        date: new Date().toISOString().split('T')[0],
      });
    }

    setItems((prev) => prev.filter((i) => i.id !== item.id));

    if (onShowToast) {
      onShowToast(
        'info',
        `Mindful purchase validated. "${item.name}" recorded as a planned expense.`,
        'Thoughtful Spending'
      );
    }
  };

  // Delete an item from vault
  const handleDeleteItem = (itemId, itemName) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    if (onShowToast) {
      onShowToast('info', `"${itemName}" removed from Wish Vault.`, 'Item Removed');
    }
  };

  // Computed totals
  const totalLockedValue = useMemo(() => {
    return items.reduce((acc, it) => acc + (it.price || 0), 0);
  }, [items]);

  const lockedCount = items.filter((i) => i.status === 'locked').length;
  const decisionCount = items.filter((i) => i.status === 'decision').length;

  return (
    <section className="wish-vault-section animate-fade-in" id="wish-vault-container">
      {/* Light Glassmorphism Container per Spendl Theme */}
      <div className="vault-glass-card">
        {/* Soft Warm Ambient Backlight */}
        <div className="vault-ambient-glow" aria-hidden="true" />

        {/* Vault Header */}
        <div className="vault-header">
          <div className="vault-header-title-block">
            <div className="vault-icon-badge">
              <Lock size={20} className="vault-padlock-icon" />
              <span className="vault-live-pulse" />
            </div>

            <div className="vault-headings">
              <div className="vault-pill-tag">
                <Sparkles size={12} />
                <span>Behavioral Finance Shield</span>
              </div>
              <h2 className="vault-title font-serif">The Wish Vault</h2>
              <p className="vault-subheadline">
                Lock your impulses. Save your future.
              </p>
            </div>
          </div>

          {/* Statistics Bar */}
          <div className="vault-stats-bar">
            <div className="vault-stat-box">
              <span className="stat-caption">Total Money Saved</span>
              <span className="stat-num text-income tabular-nums font-serif">
                {formatCurrency(totalSaved, currency)}
              </span>
            </div>
            <div className="stat-divider" />
            <div className="vault-stat-box">
              <span className="stat-caption">Currently Locked</span>
              <span className="stat-num text-main tabular-nums font-serif">
                {formatCurrency(totalLockedValue, currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Minimal Input Form */}
        <form className="vault-input-form" onSubmit={handleLockInVault}>
          <div className="vault-inputs-row">
            {/* Item Name Field */}
            <div className="vault-field-group field-item-name">
              <label htmlFor="vault-item-name" className="vault-field-label">
                <ShoppingBag size={14} />
                <span>Item Name</span>
              </label>
              <div className="vault-input-wrapper">
                <input
                  id="vault-item-name"
                  type="text"
                  className="vault-text-input"
                  placeholder="e.g. Noise-Cancelling Headphones, Mechanical Keyboard..."
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  maxLength={75}
                  required
                />
              </div>
            </div>

            {/* Price Field */}
            <div className="vault-field-group field-price">
              <label htmlFor="vault-item-price" className="vault-field-label">
                <span>Price ({getCurrencySymbol(currency)})</span>
              </label>
              <div className="vault-input-wrapper">
                <span className="vault-currency-prefix font-mono">
                  {getCurrencySymbol(currency)}
                </span>
                <input
                  id="vault-item-price"
                  type="number"
                  step="0.01"
                  min="0.50"
                  className="vault-text-input vault-price-input tabular-nums font-mono"
                  placeholder="0.00"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Cooling Period Selector with Edit/Custom Option */}
            <div className="vault-field-group field-duration">
              <label className="vault-field-label">
                <Clock size={14} />
                <span>Cooling Period</span>
              </label>
              <div className="duration-pills-wrap">
                <button
                  type="button"
                  className={`duration-pill ${durationMode === 'preset' && presetHours === '24' ? 'active' : ''}`}
                  onClick={() => {
                    setDurationMode('preset');
                    setPresetHours('24');
                  }}
                >
                  24h
                </button>
                <button
                  type="button"
                  className={`duration-pill ${durationMode === 'preset' && presetHours === '48' ? 'active' : ''}`}
                  onClick={() => {
                    setDurationMode('preset');
                    setPresetHours('48');
                  }}
                >
                  48h (Rec)
                </button>
                <button
                  type="button"
                  className={`duration-pill ${durationMode === 'preset' && presetHours === '72' ? 'active' : ''}`}
                  onClick={() => {
                    setDurationMode('preset');
                    setPresetHours('72');
                  }}
                >
                  72h
                </button>
                <button
                  type="button"
                  className={`duration-pill custom-pill ${durationMode === 'custom' ? 'active' : ''}`}
                  onClick={() => setDurationMode('custom')}
                  title="Edit custom cooling duration as long as you want"
                >
                  <Pencil size={12} />
                  <span>Custom Time</span>
                </button>
                <button
                  type="button"
                  className={`duration-pill demo-pill ${durationMode === 'test' ? 'active' : ''}`}
                  onClick={() => setDurationMode('test')}
                  title="Test countdown reaching 0 in 15 seconds"
                >
                  ⚡ 15s Test
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="vault-field-group field-submit">
              <button
                type="submit"
                id="btn-lock-in-vault"
                className="btn-vault-lock"
              >
                <Lock size={17} className="btn-lock-icon" />
                <span>Lock in Vault</span>
              </button>
            </div>
          </div>

          {/* Expandable Custom Duration Controls */}
          {durationMode === 'custom' && (
            <div className="vault-custom-duration-box animate-fade-in">
              <div className="custom-duration-header">
                <Clock size={14} />
                <span>Set Custom Cooling Period (as long as you want):</span>
              </div>
              <div className="custom-duration-inputs">
                <input
                  type="number"
                  min="1"
                  max="999"
                  className="vault-custom-number-input font-mono"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  placeholder="Duration"
                />
                <select
                  className="vault-custom-unit-select"
                  value={customUnit}
                  onChange={(e) => setCustomUnit(e.target.value)}
                >
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                </select>
                <span className="custom-duration-preview">
                  Will stay locked for <strong>{customValue || 1} {customUnit}</strong> before unlocking.
                </span>
              </div>
            </div>
          )}

          {formError && (
            <div className="vault-form-error animate-fade-in">
              <ShieldAlert size={14} />
              <span>{formError}</span>
            </div>
          )}
        </form>

        {/* Cards Grid Section */}
        <div className="vault-grid-section">
          <div className="vault-grid-header">
            <div className="grid-heading-group">
              <h3 className="vault-grid-title font-serif">Currently Locked Items</h3>
              <p className="vault-grid-subtitle">
                Allowing dopamine to settle before any financial commitment.
              </p>
            </div>
            <div className="vault-counter-badges">
              <span className="badge-pill-counter">
                {lockedCount} cooling down
              </span>
              {decisionCount > 0 && (
                <span className="badge-pill-counter ready-badge">
                  <Flame size={12} />
                  <span>{decisionCount} ready for decision</span>
                </span>
              )}
            </div>
          </div>

          {items.length > 0 ? (
            <div className="vault-cards-grid">
              {items.map((item) => {
                const timeLeft = calculateTimeLeft(item.unlockAt, now);
                const isDecisionTime = item.status === 'decision' || timeLeft.isZero;
                const isEditingThisItem = editingItemId === item.id;

                // Progress calculation
                const totalDuration = item.durationMs || (48 * 3600 * 1000);
                const elapsed = Math.max(0, now - item.lockedAt);
                const progressRatio = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

                return (
                  <div
                    key={item.id}
                    className={`vault-item-card ${isDecisionTime ? 'status-decision-card' : 'status-locked-card'}`}
                  >
                    {/* Top Row: Title, Category & Price */}
                    <div className="card-top-row">
                      <div className="card-item-info">
                        <div className="card-status-indicator">
                          {isDecisionTime ? (
                            <span className="unlock-status-badge">
                              <Unlock size={13} />
                              <span>Cooling Complete</span>
                            </span>
                          ) : (
                            <span className="lock-status-badge">
                              <span className="pulsing-sage-dot" />
                              <span>Locked in Vault</span>
                            </span>
                          )}
                        </div>
                        <h4 className="card-item-title" title={item.name}>
                          {item.name}
                        </h4>
                      </div>

                      <div className="card-price-tag font-mono">
                        {formatCurrency(item.price, currency)}
                      </div>
                    </div>

                    {/* Progress Bar under heading */}
                    <div className="vault-card-progress-bar">
                      <div
                        className={`progress-fill ${isDecisionTime ? 'fill-completed' : ''}`}
                        style={{ width: isDecisionTime ? '100%' : `${progressRatio}%` }}
                      />
                    </div>

                    {/* Inline Edit Time Drawer / Panel */}
                    {isEditingThisItem ? (
                      <div className="card-edit-timer-panel animate-fade-in">
                        <div className="edit-timer-header">
                          <div className="edit-timer-title">
                            <Clock size={13} />
                            <span>Edit Cooling Period</span>
                          </div>
                          <button
                            type="button"
                            className="btn-close-edit"
                            onClick={() => setEditingItemId(null)}
                            title="Cancel edit"
                          >
                            <X size={14} />
                          </button>
                        </div>

                        {/* Quick Extend Buttons */}
                        <div className="quick-extend-row">
                          <span className="quick-extend-label">Quick Extend:</span>
                          <div className="quick-extend-pills">
                            <button
                              type="button"
                              className="btn-quick-pill"
                              onClick={() => handleQuickExtend(item.id, 24, '24 hours')}
                            >
                              +24h
                            </button>
                            <button
                              type="button"
                              className="btn-quick-pill"
                              onClick={() => handleQuickExtend(item.id, 72, '3 days')}
                            >
                              +3 Days
                            </button>
                            <button
                              type="button"
                              className="btn-quick-pill"
                              onClick={() => handleQuickExtend(item.id, 168, '1 week')}
                            >
                              +1 Week
                            </button>
                            <button
                              type="button"
                              className="btn-quick-pill"
                              onClick={() => handleQuickExtend(item.id, 720, '30 days')}
                            >
                              +30 Days
                            </button>
                          </div>
                        </div>

                        {/* Custom New Duration from Now */}
                        <div className="custom-extend-row">
                          <span className="quick-extend-label">Or set time from now:</span>
                          <div className="custom-extend-inputs">
                            <input
                              type="number"
                              min="1"
                              max="999"
                              className="edit-number-input font-mono"
                              value={editCustomValue}
                              onChange={(e) => setEditCustomValue(e.target.value)}
                            />
                            <select
                              className="edit-unit-select"
                              value={editCustomUnit}
                              onChange={(e) => setEditCustomUnit(e.target.value)}
                            >
                              <option value="hours">Hours</option>
                              <option value="days">Days</option>
                              <option value="weeks">Weeks</option>
                              <option value="months">Months</option>
                            </select>
                            <button
                              type="button"
                              className="btn-apply-timer-edit"
                              onClick={() => handleApplyCustomEditTime(item.id)}
                            >
                              <Check size={13} />
                              <span>Update</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Normal Middle: Timer vs Decision States */
                      <div className="card-state-container">
                        {!isDecisionTime ? (
                          /* Locked State: Digital Countdown Timer */
                          <div className="vault-countdown-container">
                            <div className="countdown-header-row">
                              <span className="countdown-label">Cooling Timer</span>
                              <button
                                type="button"
                                className="btn-trigger-edit-time"
                                onClick={() => {
                                  setEditingItemId(item.id);
                                  setEditCustomValue('3');
                                  setEditCustomUnit('days');
                                }}
                                title="Edit cooling period"
                              >
                                <Pencil size={11} />
                                <span>Edit Time</span>
                              </button>
                            </div>

                            <div className="digital-timer-display font-mono">
                              <div className="timer-unit">
                                <span className="unit-value">
                                  {String(timeLeft.days).padStart(2, '0')}
                                </span>
                                <span className="unit-caption">DAYS</span>
                              </div>
                              <span className="timer-colon">:</span>
                              <div className="timer-unit">
                                <span className="unit-value">
                                  {String(timeLeft.hours).padStart(2, '0')}
                                </span>
                                <span className="unit-caption">HRS</span>
                              </div>
                              <span className="timer-colon">:</span>
                              <div className="timer-unit">
                                <span className="unit-value">
                                  {String(timeLeft.minutes).padStart(2, '0')}
                                </span>
                                <span className="unit-caption">MINS</span>
                              </div>
                              <span className="timer-colon">:</span>
                              <div className="timer-unit">
                                <span className="unit-value highlight-secs">
                                  {String(timeLeft.seconds).padStart(2, '0')}
                                </span>
                                <span className="unit-caption">SECS</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Unlocked State: Reveals the 2 Distinct Decision Buttons */
                          <div className="vault-decision-container animate-fade-in">
                            <div className="decision-prompt">
                              <span className="decision-glow-icon">
                                <Sparkles size={15} />
                              </span>
                              <span className="decision-text">
                                Your dopamine has reset. What is your choice?
                              </span>
                            </div>

                            <div className="decision-actions-row">
                              {/* 1. Subtle Button: "I Still Want It" */}
                              <button
                                type="button"
                                className="btn-decision-subtle"
                                onClick={() => handleStillWantIt(item)}
                                title="Purchase mindfully and record in expense ledger"
                              >
                                <span>I Still Want It</span>
                              </button>

                              {/* 2. Vibrant Button: "Save This Money instead!" */}
                              <button
                                type="button"
                                className="btn-decision-save-vibrant"
                                onClick={() => handleSaveInstead(item)}
                                title="Resist the urge and save this amount!"
                              >
                                <PiggyBank size={16} />
                                <span>Save This Money instead!</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Bottom Utility Bar */}
                    <div className="card-footer-row">
                      <div className="card-footer-left">
                        <span className="card-timestamp">
                          {isDecisionTime ? 'Ready for mindful decision' : 'Locked for impulse resistance'}
                        </span>
                        {!isEditingThisItem && isDecisionTime && (
                          <button
                            type="button"
                            className="btn-relock-item"
                            onClick={() => {
                              setEditingItemId(item.id);
                              setEditCustomValue('3');
                              setEditCustomUnit('days');
                            }}
                            title="Want more time? Extend cooling period"
                          >
                            <RotateCcw size={11} />
                            <span>Extend Time</span>
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        className="btn-card-discard"
                        onClick={() => handleDeleteItem(item.id, item.name)}
                        title="Discard item from vault"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="vault-empty-state">
              <div className="empty-vault-icon">
                <Lock size={32} />
              </div>
              <h4 className="empty-vault-title font-serif">Your Wish Vault is Clean</h4>
              <p className="empty-vault-desc">
                Whenever you feel the sudden urge to buy something online, lock it here first.
                Set the cooling period as long as you want. If you still need it when the timer rings, buy it guilt-free. If not, keep your money!
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default WishVault;
