import React from 'react';
import {
  Settings,
  DollarSign,
  CheckCircle2,
} from 'lucide-react';
import { CURRENCIES } from '../../utils/currency';
import { UserAvatar } from '../common/UserAvatar';
import './SettingsView.css';

export function SettingsView({
  currency,
  onCurrencyChange,
}) {
  return (
    <div className="settings-container animate-fade-in">
      <div className="settings-hero card-surface">
        <div className="settings-hero-text">
          <div className="settings-badge">
            <Settings size={14} />
            <span>System Preferences</span>
          </div>
          <h2 className="settings-title font-serif">Preferences & System Settings</h2>
          <p className="settings-subtitle">
            Configure interface formatting and currency display preferences.
          </p>
        </div>
        <div className="settings-hero-avatar">
          <UserAvatar size={74} />
        </div>
      </div>

      <div className="settings-grid">
        {/* Currency Preference Card */}
        <div className="settings-card card-surface">
          <div className="card-header-with-icon">
            <div className="header-icon-box">
              <DollarSign size={20} />
            </div>
            <div>
              <h3 className="card-heading font-serif">Currency Display</h3>
              <p className="card-subheading">Choose your preferred currency unit across all views</p>
            </div>
          </div>

          <div className="currency-selector-grid">
            {Object.values(CURRENCIES).map((curr) => {
              const isSelected = currency === curr.code;
              return (
                <button
                  key={curr.code}
                  className={`currency-option-btn ${isSelected ? 'selected' : ''}`}
                  onClick={() => onCurrencyChange(curr.code)}
                >
                  <div className="currency-sym-box">
                    <span>{curr.symbol}</span>
                  </div>
                  <div className="currency-text-wrap">
                    <span className="currency-name">{curr.name}</span>
                    <span className="currency-sub font-mono">
                      {curr.symbol} {curr.code}
                    </span>
                  </div>
                  {isSelected && <CheckCircle2 size={18} className="selected-check" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsView;
