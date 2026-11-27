import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, ChevronDown, X } from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import './Header.css';

export function Header({
  onOpenAddModal,
  isBackendHealthy = true,
  searchQuery = '',
  onSearchChange,
  activeTab = 'dashboard',
  user,
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);

  // Close profile menu on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  return (
    <header className="pennywise-header">
      {/* Left: Pill Search Bar */}
      <div className="header-search-wrapper">
        <div className="header-search-pill">
          <Search size={18} className="header-search-icon" />
          <input
            type="text"
            className="header-search-input"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="header-search-clear"
              onClick={() => onSearchChange && onSearchChange('')}
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
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

        {/* Profile Avatar Pill & Dropdown */}
        <div className="header-profile-container" ref={profileRef}>
          <button
            type="button"
            className={`header-profile-pill ${showProfileMenu ? 'active' : ''}`}
            onClick={() => setShowProfileMenu((prev) => !prev)}
            aria-expanded={showProfileMenu}
            aria-label="User Profile"
          >
            <div className="profile-avatar-circle">
              <UserAvatar user={user} size={36} />
            </div>
            <span className="profile-greeting-text">Hey, Buddy! 👋</span>
            <ChevronDown size={15} className={`profile-chevron ${showProfileMenu ? 'rotated' : ''}`} />
          </button>

          {showProfileMenu && (
            <div className="profile-dropdown-card card-surface animate-scale-up">
              <div className="profile-dropdown-avatar">
                <UserAvatar user={user} size={64} />
              </div>
              <div className="profile-dropdown-details">
                <h4 className="profile-dropdown-name">Hey, Buddy! 👋</h4>
                <span className="profile-dropdown-badge">Spendl Smart Saver</span>
                <p className="profile-dropdown-tagline">Spend Smart. Live Better.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
