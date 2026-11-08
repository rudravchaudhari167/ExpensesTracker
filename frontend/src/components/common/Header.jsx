import React, { useState } from 'react';
import { Search, Bell, Plus, ChevronDown, CheckCircle2, Sparkles, X } from 'lucide-react';
import boyAvatar from '../../assets/guardian-boy.png';
import './Header.css';

export function Header({
  onOpenAddModal,
  isBackendHealthy = true,
  searchQuery = '',
  onSearchChange,
  activeTab = 'dashboard',
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Allowance Cycle Active 🎓',
      desc: 'Your Student Survival Mode is tracking with ₹200 safe daily limit.',
      time: 'Just now',
      read: false,
    },
    {
      id: 2,
      title: 'Smart Habit Badge Earned 🌟',
      desc: 'You stayed 15% below your weekly discretionary budget!',
      time: '2h ago',
      read: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <header className="pennywise-header">
      {/* Left: Pill Search Bar */}
      <div className="header-search-wrapper">
        <div className="header-search-pill">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search transactions, categories..."
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="header-right-group">
        {/* Playful Speech Bubble */}
        <div className="header-speech-bubble" title="Keep up the great spending habits!">
          <span className="speech-text">You're doing great! 🎉</span>
          <div className="speech-tail" aria-hidden="true" />
        </div>

        {/* Quick Add CTA */}
        <button
          id="btn-add-transaction-header"
          className="header-add-btn"
          onClick={onOpenAddModal}
          title="Add Expense or Income"
        >
          <Plus size={16} strokeWidth={2.8} />
          <span>Add</span>
        </button>

        {/* Notification Bell Button */}
        <div className="header-notif-container">
          <button
            type="button"
            className={`header-bell-btn ${showNotifications ? 'active' : ''}`}
            onClick={() => setShowNotifications((prev) => !prev)}
            aria-label="View notifications"
          >
            <Bell size={19} />
            {unreadCount > 0 && <span className="bell-badge-count">{unreadCount}</span>}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="notif-dropdown card-surface animate-scale-up">
              <div className="notif-dropdown-header">
                <div>
                  <h4 className="notif-title">Notifications</h4>
                  <p className="notif-subtitle">Your real-time financial alerts</p>
                </div>
                <div className="notif-header-actions">
                  {unreadCount > 0 && (
                    <button type="button" className="notif-mark-read" onClick={markAllRead}>
                      Mark read
                    </button>
                  )}
                  <button
                    type="button"
                    className="notif-close-btn"
                    onClick={() => setShowNotifications(false)}
                    aria-label="Close"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              <div className="notif-list">
                {notifications.map((item) => (
                  <div key={item.id} className={`notif-item ${item.read ? 'read' : 'unread'}`}>
                    <div className="notif-item-dot" />
                    <div className="notif-item-body">
                      <div className="notif-item-title">{item.title}</div>
                      <div className="notif-item-desc">{item.desc}</div>
                      <div className="notif-item-time">{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar Pill */}
        <div className="header-profile-pill" tabIndex={0} role="button">
          <div className="profile-avatar-circle">
            <img src={boyAvatar} alt="User Avatar" className="avatar-img" />
          </div>
          <span className="profile-greeting-text">Hey, Buddy! 👋</span>
          <ChevronDown size={15} className="profile-chevron" />
        </div>
      </div>
    </header>
  );
}

export default Header;
