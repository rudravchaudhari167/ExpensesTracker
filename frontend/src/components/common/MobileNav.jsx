import React from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Plus,
  Settings,
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
        <LayoutDashboard size={21} />
        <span>Home</span>
      </button>

      <button
        id="mobile-nav-transactions"
        className={`mobile-nav-item ${activeTab === 'transactions' ? 'active' : ''}`}
        onClick={() => onSelectTab('transactions')}
      >
        <ArrowLeftRight size={21} />
        <span>Activity</span>
      </button>

      <button
        id="mobile-nav-settings"
        className={`mobile-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
        onClick={() => onSelectTab('settings')}
      >
        <Settings size={21} />
        <span>Settings</span>
      </button>

      {/* Primary Action Add (+) Button in the Right Corner */}
      <div className="mobile-add-wrapper right-corner">
        <button
          id="btn-add-transaction-mobile"
          className="mobile-add-btn"
          onClick={onOpenAddModal}
          aria-label="Add transaction"
          title="Add Transaction"
        >
          <Plus size={23} strokeWidth={2.8} />
        </button>
      </div>
    </nav>
  );
}

export default MobileNav;
