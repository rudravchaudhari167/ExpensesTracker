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
  Code,
  Database,
  ExternalLink,
} from 'lucide-react';
import { CURRENCIES } from '../../utils/currency';
import transactionService from '../../services/transactionService';
import './SettingsView.css';

export function SettingsView({ currency, onCurrencyChange, isBackendHealthy }) {
  const [pingStatus, setPingStatus] = useState(null);
  const [isPinging, setIsPinging] = useState(false);

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

  return (
    <div className="settings-container animate-fade-in">
      <div className="settings-hero card-surface">
        <div className="settings-badge">
          <Settings size={14} />
          <span>System Preferences</span>
        </div>
        <h2 className="settings-title font-serif">Preferences & System Health</h2>
        <p className="settings-subtitle">
          Configure interface formatting and test connection with your Spring Boot and MySQL instance.
        </p>
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
              <span className="health-label">API Port:</span>
              <span className="health-val font-mono">http://localhost:8080</span>
            </div>
            <div className="health-item">
              <span className="health-label">Database:</span>
              <span className="health-val font-mono">MySQL (expense_tracker on 3306)</span>
            </div>
            <div className="health-item">
              <span className="health-label">Proxy Route:</span>
              <span className="health-val font-mono">Vite Server Proxy (/api → :8080)</span>
            </div>
            <div className="health-item">
              <span className="health-label">Live Connection:</span>
              <div className={`health-badge ${isBackendHealthy ? 'online' : 'offline'}`}>
                <span className="dot"></span>
                <span>{isBackendHealthy ? 'Active & Healthy' : 'Disconnected'}</span>
              </div>
            </div>
          </div>

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
