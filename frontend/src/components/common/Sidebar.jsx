import React from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Target,
  Settings,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import './Sidebar.css';

export function Sidebar({ activeTab, onSelectTab, transactionCount = 0 }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight, badge: transactionCount > 0 ? transactionCount : null },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'budgets', label: 'Budgets', icon: Target },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="sidebar-container glass-panel">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-logo-coin">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#E87952" />
            <circle cx="12" cy="12" r="6.5" stroke="#FFFFFF" strokeWidth="1.6" strokeDasharray="3 2" />
            <path d="M14.5 8.5C14.1 7.9 13.2 7.5 12 7.5C10.5 7.5 9.5 8.4 9.5 9.6C9.5 11 11 11.5 12.3 12C13.6 12.5 14.6 13.1 14.6 14.6C14.6 16 13.3 16.9 11.8 16.9C10.2 16.9 9.3 16 9 15.2" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="brand-text">
          <div className="brand-name font-serif">Spendl</div>
          <div className="brand-tagline">Your money, your rhythm.</div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">MENU</div>
        <ul className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  id={`nav-${item.id}`}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectTab(item.id)}
                >
                  <Icon size={19} className="nav-icon" />
                  <span className="nav-label">{item.label}</span>
                  {item.badge !== null && item.badge !== undefined && (
                    <span className="nav-badge">{item.badge}</span>
                  )}
                  {isActive && <span className="nav-active-pill" />}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Decorative Monthly Savings Encouragement Card */}
      <div className="sidebar-tip-card">
        <div className="tip-header">
          <div className="tip-icon-wrapper">
            <Sparkles size={14} />
          </div>
          <span className="tip-tag">Rhythm Tip</span>
        </div>
        <p className="tip-text">
          Small, mindful daily pauses before checkout build long-term financial autonomy.
        </p>
        <div className="tip-accent-circle"></div>
      </div>
    </aside>
  );
}

export default Sidebar;
