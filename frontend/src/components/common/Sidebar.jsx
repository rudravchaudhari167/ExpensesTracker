import React from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  GraduationCap,
  PieChart,
  ShoppingBag,
  Target,
  Sparkles,
  BookOpen,
  Settings,
} from 'lucide-react';
import './Sidebar.css';

export function Sidebar({ activeTab, onSelectTab, transactionCount = 0 }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight, count: transactionCount },
    { id: 'survival', label: 'Student Survival', icon: GraduationCap, badge: 'NEW' },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'budgets', label: 'Budgets', icon: ShoppingBag },
    { id: 'goals', label: 'Savings Goals', icon: Target },
    { id: 'simulator', label: 'What If Simulator', icon: Sparkles },
    { id: 'journal', label: 'Money Journal', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="pennywise-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand-wrapper">
        <div className="sidebar-brand" onClick={() => onSelectTab('dashboard')} role="button" tabIndex={0}>
          <div className="brand-wallet-3d" aria-hidden="true">
            <svg width="42" height="42" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="walletGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F59E66" />
                  <stop offset="100%" stopColor="#D96832" />
                </linearGradient>
                <linearGradient id="claspGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFEAA7" />
                  <stop offset="100%" stopColor="#F5B041" />
                </linearGradient>
                <filter id="walletShadow" x="-10%" y="-10%" width="130%" height="130%">
                  <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#9C4417" floodOpacity="0.25" />
                </filter>
              </defs>
              {/* Back card peek */}
              <rect x="10" y="8" width="28" height="12" rx="4" fill="#FFE5D4" />
              {/* Wallet Main Body */}
              <rect x="4" y="12" width="40" height="28" rx="8" fill="url(#walletGrad)" filter="url(#walletShadow)" />
              {/* Wallet Stitching Detail */}
              <rect x="6" y="14" width="36" height="24" rx="6" stroke="#FFAF80" strokeWidth="1" strokeDasharray="2 2" fill="none" opacity="0.6" />
              {/* Inner fold shadow */}
              <path d="M4 22C16 23.5 32 23.5 44 22" stroke="#B84F20" strokeWidth="1.2" opacity="0.4" />
              {/* Clasp Flap */}
              <path d="M28 20H42C43.1 20 44 20.9 44 22V28C44 29.1 43.1 30 42 30H28C26.3 30 25 28.7 25 27V23C25 21.3 26.3 20 28 20Z" fill="#C25320" />
              {/* Shiny Gold Button */}
              <circle cx="34" cy="25" r="3" fill="url(#claspGrad)" stroke="#E0921E" strokeWidth="0.8" />
              <circle cx="33" cy="24" r="0.8" fill="#FFFFFF" opacity="0.8" />
            </svg>
          </div>
          <div className="brand-text-block">
            <h1 className="brand-title">Spendl.</h1>
            <p className="brand-tagline">Spend Smart. Live Better.</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav-container" aria-label="Main Navigation">
        <ul className="sidebar-nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id} className="sidebar-nav-item">
                <button
                  id={`nav-${item.id}`}
                  className={`sidebar-nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectTab(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={19} className="sidebar-nav-icon" />
                  <span className="sidebar-nav-label">{item.label}</span>

                  {item.badge && (
                    <span className="sidebar-badge-new">{item.badge}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Illustrated Savings Card */}
      <div className="sidebar-savings-card">
        <div className="savings-card-content">
          <div className="savings-card-header">
            <span className="savings-card-title">Small steps...</span>
            <span className="savings-card-subtitle">Big savings! 🌟</span>
          </div>

          {/* 3D Piggy Bank Illustration */}
          <div className="savings-piggy-illustration" aria-hidden="true">
            <svg width="86" height="74" viewBox="0 0 100 86" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="piggyBody" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFAFB4" />
                  <stop offset="60%" stopColor="#FF9AA2" />
                  <stop offset="100%" stopColor="#F5808C" />
                </linearGradient>
                <linearGradient id="coinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFF275" />
                  <stop offset="100%" stopColor="#F5B041" />
                </linearGradient>
                <filter id="piggyShadow" x="-20%" y="-10%" width="140%" height="130%">
                  <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#8B4A52" floodOpacity="0.18" />
                </filter>
              </defs>
              {/* Gold coin floating into slot */}
              <g className="floating-coin-anim">
                <ellipse cx="48" cy="12" rx="9" ry="11" fill="url(#coinGrad)" stroke="#D4881A" strokeWidth="1" />
                <ellipse cx="48" cy="12" rx="6" ry="8" stroke="#FFEAA7" strokeWidth="0.8" fill="none" />
                <text x="45.5" y="15.5" fontSize="8" fontWeight="bold" fill="#B36B00" fontFamily="sans-serif">₹</text>
              </g>
              {/* Tail */}
              <path d="M18 48C12 47 10 42 13 39C16 36 18 41 15 44" stroke="#F5808C" strokeWidth="3" strokeLinecap="round" />
              {/* Back feet */}
              <rect x="26" y="60" width="10" height="12" rx="5" fill="#E86E7B" />
              <rect x="62" y="60" width="10" height="12" rx="5" fill="#E86E7B" />
              {/* Piggy Body */}
              <ellipse cx="50" cy="48" rx="34" ry="26" fill="url(#piggyBody)" filter="url(#piggyShadow)" />
              {/* Front feet */}
              <rect x="34" y="62" width="11" height="13" rx="5.5" fill="#FF8D99" />
              <rect x="54" y="62" width="11" height="13" rx="5.5" fill="#FF8D99" />
              {/* Coin Slot */}
              <ellipse cx="48" cy="24" rx="7" ry="2" fill="#D45B67" />
              {/* Ear */}
              <path d="M60 27C60 21 68 19 72 26C74 30 68 35 62 33Z" fill="#FFA3AB" stroke="#F5808C" strokeWidth="1" />
              {/* Snout */}
              <ellipse cx="78" cy="47" rx="10" ry="8" fill="#FFBFC4" stroke="#F5808C" strokeWidth="1" />
              <ellipse cx="75" cy="47" rx="2" ry="3" fill="#D45B67" />
              <ellipse cx="80" cy="47" rx="2" ry="3" fill="#D45B67" />
              {/* Cute Smiling Eye */}
              <path d="M64 40C66 38 69 38 71 40" stroke="#4A2528" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              {/* Blush */}
              <circle cx="67" cy="48" r="4" fill="#FF707F" opacity="0.4" />
              {/* Sparkle */}
              <path d="M22 24L24 18L26 24L32 26L26 28L24 34L22 28L16 26Z" fill="#FFF275" opacity="0.8" />
            </svg>
          </div>

          <button
            type="button"
            className="savings-card-btn"
            onClick={() => onSelectTab('goals')}
          >
            Set a Goal →
          </button>
        </div>
      </div>

      {/* Decorative foliage plants at bottom of sidebar */}
      <div className="sidebar-foliage-decor" aria-hidden="true">
        <svg width="100%" height="60" viewBox="0 0 240 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M-10 65C15 45 40 28 75 42C90 48 105 38 120 48C135 58 145 65 170 50C190 38 215 48 245 65V65H-10Z" fill="#A8C995" fillOpacity="0.28" />
          <path d="M-5 65C25 40 50 35 70 50C95 35 125 45 150 60C170 52 195 45 220 65H-5Z" fill="#7FA86D" fillOpacity="0.22" />
        </svg>
      </div>
    </aside>
  );
}

export default Sidebar;
