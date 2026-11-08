import React, { useState } from 'react';
import {
  Settings,
  DollarSign,
  CheckCircle2,
  Globe,
  Sparkles,
  X,
} from 'lucide-react';
import { CURRENCIES } from '../../utils/currency';
import './SettingsView.css';

export function SettingsView({
  currency,
  onCurrencyChange,
  isDemoMode,
  setDemoMode,
}) {
  const [dismissNotice, setDismissNotice] = useState(() => {
    return (
      localStorage.getItem('spendl_dismiss_cloud_notice') === 'true' ||
      localStorage.getItem('pennywise_dismiss_cloud_notice') === 'true'
    );
  });

  const isCloudHost =
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1';

  const handleDismissNotice = () => {
    setDismissNotice(true);
    localStorage.setItem('spendl_dismiss_cloud_notice', 'true');
  };

  return (
    <div className="settings-container animate-fade-in">
      <div className="settings-hero card-surface">
        <div className="settings-badge">
          <Settings size={14} />
          <span>System Preferences</span>
        </div>
        <h2 className="settings-title font-serif">Preferences & System Settings</h2>
        <p className="settings-subtitle">
          Configure interface formatting and currency display preferences.
        </p>
      </div>

      <div className="settings-grid">
        {/* Cloud Deployment Notice Card (Shown if on Vercel or cloud host and not dismissed) */}
        {isCloudHost && !dismissNotice && (
          <div className="settings-card card-surface cloud-notice-card">
            <div className="card-header-with-icon" style={{ justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div className="header-icon-box">
                  <Globe size={20} />
                </div>
                <div>
                  <h3 className="card-heading font-serif">Cloud Hosting Architecture Notice</h3>
                  <p className="card-subheading">Connecting your Spring Boot Backend</p>
                </div>
              </div>
              <button
                type="button"
                className="btn-icon-dismiss"
                onClick={handleDismissNotice}
                title="Dismiss notice"
                aria-label="Dismiss notice"
              >
                <X size={18} />
              </button>
            </div>

            <div className="cloud-notice-content">
              <p>
                <strong>Vercel hosts the static frontend only</strong> (HTML/CSS/JS). Your Java Spring Boot REST API
                and MySQL database are currently running on your local machine (<code>localhost:8080</code>).
              </p>
              <p>
                Because Vercel runs in the cloud, it cannot access your computer's <code>localhost</code> over the public internet.
              </p>
              <div className="cloud-options-box">
                <div className="option-row">
                  <div className="option-desc">
                    <strong>Option A:</strong> Explore in <strong>Showcase Mode</strong> (preloaded portfolio demo data).
                  </div>
                  <button
                    type="button"
                    className={`btn ${isDemoMode ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                    onClick={() => setDemoMode(!isDemoMode)}
                  >
                    <Sparkles size={14} />
                    <span>{isDemoMode ? 'Showcase Mode Active' : 'Enable Showcase Mode'}</span>
                  </button>
                </div>
                <div className="option-row">
                  <div className="option-desc">
                    <strong>Option B:</strong> Deploy Spring Boot & MySQL to a free cloud host like{' '}
                    <a
                      href="https://render.com"
                      target="_blank"
                      rel="noreferrer"
                      className="cloud-link"
                    >
                      Render.com
                    </a>{' '}
                    or{' '}
                    <a
                      href="https://railway.app"
                      target="_blank"
                      rel="noreferrer"
                      className="cloud-link"
                    >
                      Railway.app
                    </a>
                    , then connect your public URL.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
                  <span className="currency-sym">{curr.symbol}</span>
                  <div className="currency-text-wrap">
                    <span className="currency-code">{curr.code}</span>
                    <span className="currency-name">{curr.label}</span>
                  </div>
                  {isSelected && <CheckCircle2 size={16} className="selected-check" />}
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
