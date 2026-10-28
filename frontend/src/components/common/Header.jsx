import React from 'react';
import { Plus, Bell, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import './Header.css';

export function Header({
  onOpenAddModal,
  isBackendHealthy = true,
  searchQuery = '',
  onSearchChange,
  activeTab = 'dashboard',
}) {
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="header-container glass-panel">
      <div className="header-left">
        <div className="header-greeting-wrapper">
          <h1 className="header-greeting font-serif">
            Your money, in a better place.
          </h1>
          <div className="header-meta">
            <span className="header-date">{todayFormatted}</span>
            <span className="meta-separator">•</span>
            <div className={`backend-indicator ${isBackendHealthy ? 'online' : 'offline'}`} title={isBackendHealthy ? 'Connected to Spring Boot API' : 'Backend connection unavailable'}>
              <span className="indicator-dot"></span>
              <span className="indicator-text">
                {isBackendHealthy ? 'Spring Boot Online' : 'Backend Offline'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="header-right">
        {/* Quick Add Transaction CTA */}
        <button
          id="btn-add-transaction-header"
          className="btn btn-primary btn-add-header"
          onClick={onOpenAddModal}
        >
          <Plus size={18} strokeWidth={2.4} />
          <span>Add transaction</span>
        </button>

        {/* Profile Avatar */}
        <div className="profile-pill" title="Rudra Chaudhari • BTech CSE Portfolio">
          <div className="profile-avatar">
            <span>RC</span>
          </div>
          <div className="profile-info-compact">
            <span className="profile-name">Rudra</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
