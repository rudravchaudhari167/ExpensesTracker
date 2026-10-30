import React from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Plus,
  PieChart,
  Settings,
  Lock,
} from 'lucide-react';
import './MobileNav.css';

export function MobileNav({ activeTab, onSelectTab, onOpenAddModal }) {
  return (
    <nav className="mobile-nav-bar glass-panel" aria-label="Mobile Navigation">
      <button
        id="mobile-nav-dashboard"
        className={`mobile-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
        onClick={() => onSelectTab('dashboard')}
      >
        <LayoutDashboard size={20} />
        <span>Home</span>
      </button>

      <button
        id="mobile-nav-transactions"
        className={`mobile-nav-item ${activeTab === 'transactions' ? 'active' : ''}`}
        onClick={() => onSelectTab('transactions')}
      >
        <ArrowLeftRight size={20} />
        <span>Activity</span>
      </button>

      {/* Floating Center Add Button */}
      <div className="mobile-add-wrapper">
        <button
          id="btn-add-transaction-mobile"
          className="mobile-add-btn"
          onClick={onOpenAddModal}
          aria-label="Add transaction"
        >
          <Plus size={22} strokeWidth={2.6} />
        </button>
      </div>

      <button
        id="mobile-nav-vault"
        className={`mobile-nav-item ${activeTab === 'vault' ? 'active' : ''}`}
        onClick={() => onSelectTab('vault')}
      >
        <Lock size={20} />
        <span>Vault</span>
      </button>

      <button
        id="mobile-nav-analytics"
        className={`mobile-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
        onClick={() => onSelectTab('analytics')}
      >
        <PieChart size={20} />
        <span>Insights</span>
      </button>

      <button
        id="mobile-nav-settings"
        className={`mobile-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
        onClick={() => onSelectTab('settings')}
      >
        <Settings size={20} />
        <span>Settings</span>
      </button>
    </nav>
  );
}

export default MobileNav;
