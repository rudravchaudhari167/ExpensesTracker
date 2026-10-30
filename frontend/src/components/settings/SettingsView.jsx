import React, { useState } from 'react';
import {
  Settings,
  DollarSign,
  Activity,
  Server,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Globe,
  Save,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';
import { CURRENCIES } from '../../utils/currency';
import transactionService from '../../services/transactionService';
import { getBaseUrl, setCustomApiUrl } from '../../services/api';
import './SettingsView.css';

export function SettingsView({
  currency,
  onCurrencyChange,
  isBackendHealthy,
  isDemoMode,
  setDemoMode,
  onRefresh,
}) {
  const [pingStatus, setPingStatus] = useState(null);
  const [isPinging, setIsPinging] = useState(false);
  const [customUrl, setCustomUrl] = useState(
    () =>
      localStorage.getItem('spendl_custom_api_url') ||
      localStorage.getItem('pennywise_custom_api_url') ||
      ''
  );
  const [saveSuccess, setSaveSuccess] = useState(false);
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

  const testConnection = async () => {
    setIsPinging(true);
    setPingStatus(null);
    try {
      const result = await transactionService.checkHealth();
      setPingStatus(result);
    } catch (err) {
      setPingStatus({ ok: false, error: err.message });
    } finally {
      setIsPinging(false);
    }
  };

  const handleSaveCustomUrl = (e) => {
    e.preventDefault();
    setCustomApiUrl(customUrl);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
    if (onRefresh) onRefresh();
  };

  const handleResetUrl = () => {
    setCustomUrl('');
    setCustomApiUrl('');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
    if (onRefresh) onRefresh();
  };

  return (
    <div className="settings-container animate-fade-in">
      <div className="settings-hero card-surface">
        <div className="settings-badge">
          <Settings size={14} />
          <span>System Preferences</span>
        </div>
        <h2 className="settings-title font-serif">Preferences & System Health</h2>
        <p className="settings-subtitle">
          Configure interface formatting, custom cloud backend URLs, and verify Spring Boot connectivity.
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
                    , then enter your public URL below.
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

        {/* Backend & Database Connection Diagnostics */}
        <div className="settings-card card-surface">
          <div className="card-header-with-icon">
            <div className="header-icon-box">
              <Server size={20} />
            </div>
            <div>
              <h3 className="card-heading font-serif">Backend Integration Health</h3>
              <p className="card-subheading">Active status of Spring Boot REST API & MySQL</p>
            </div>
          </div>

          <div className="health-details-list">
            <div className="health-item">
              <span className="health-label">Active API Base URL:</span>
              <span className="health-val font-mono">{getBaseUrl()}</span>
            </div>
            <div className="health-item">
              <span className="health-label">Environment / Host:</span>
              <span className="health-val font-mono">{isCloudHost ? 'Vercel Cloud (Web / Chrome)' : 'Local Host (Port 8080 / 5173)'}</span>
            </div>
            <div className="health-item">
              <span className="health-label">Database Target:</span>
              <span className="health-val font-mono">{isCloudHost ? 'Cloud Browser Storage & Sync' : 'MySQL (expense_tracker on 3306)'}</span>
            </div>
            <div className="health-item">
              <span className="health-label">Live Connection:</span>
              <div
                className={`health-badge ${isBackendHealthy ? 'online' : (isCloudHost ? 'online' : 'offline')}`}
                title={isBackendHealthy ? 'Spring Boot REST API is connected' : (isCloudHost ? 'Running on Vercel with Cloud Storage' : 'Cannot reach backend on localhost (runs locally)')}
              >
                <span className="dot"></span>
                <span>{isBackendHealthy ? 'Active & Healthy' : (isCloudHost ? 'Cloud Web Mode (Active)' : 'Disconnected')}</span>
              </div>
            </div>
          </div>

          {/* Custom Backend URL input */}
          <form onSubmit={handleSaveCustomUrl} className="custom-url-form">
            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              Custom Cloud Backend URL (Optional)
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="url"
                className="form-input"
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                placeholder="e.g. https://my-backend.onrender.com/api"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
              />
              <button type="submit" className="btn btn-primary btn-sm" title="Save URL">
                <Save size={15} />
                <span>Save</span>
              </button>
              {customUrl && (
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleResetUrl} title="Reset to default">
                  <RotateCcw size={15} />
                </button>
              )}
            </div>
            {saveSuccess && (
              <span style={{ fontSize: '0.75rem', color: 'var(--color-sage-dark)', fontWeight: 600 }}>
                API URL updated! Reloading connection...
              </span>
            )}
          </form>

          <div className="ping-test-box">
            <button
              className="btn btn-secondary btn-ping"
              onClick={testConnection}
              disabled={isPinging}
            >
              <RefreshCw size={15} className={isPinging ? 'animate-spin' : ''} />
              <span>{isPinging ? 'Pinging Spring Boot...' : 'Test Backend Latency'}</span>
            </button>

            {pingStatus && (
              <div className={`ping-result ${pingStatus.ok ? 'success' : 'fail'}`}>
                {pingStatus.ok ? (
                  <>
                    <CheckCircle2 size={15} />
                    <span>Response received in {pingStatus.latency}ms (200 OK)</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={15} />
                    <span>Ping failed: {pingStatus.error}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Portfolio & Student Creator Card */}
        <div className="settings-card card-surface portfolio-card">
          <div className="card-header-with-icon">
            <div className="header-icon-box">
              <GraduationCap size={20} />
            </div>
            <div>
              <h3 className="card-heading font-serif">Portfolio Project</h3>
              <p className="card-subheading">Full-Stack Engineering & Design</p>
            </div>
          </div>

          <div className="portfolio-info-box">
            <div className="author-name">Rudra Vijay Chaudhari</div>
            <div className="author-title">BTech Computer Science & Engineering</div>
            <p className="portfolio-desc">
              Built as a portfolio-quality fintech web application demonstrating production-grade
              clean architecture, Java Spring Boot REST APIs, relational MySQL persistence, and an
              editorial modern React interface with warm minimalism.
            </p>
            <div className="tech-tags-list">
              <span className="tech-tag">Spring Boot 4</span>
              <span className="tech-tag">MySQL</span>
              <span className="tech-tag">Spring Data JPA</span>
              <span className="tech-tag">React 19</span>
              <span className="tech-tag">Vite</span>
              <span className="tech-tag">Recharts</span>
              <span className="tech-tag">CSS Design Tokens</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsView;
