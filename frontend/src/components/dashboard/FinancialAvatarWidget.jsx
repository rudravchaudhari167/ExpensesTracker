import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Heart,
  Zap,
  Flame,
  Shield,
  Trophy,
  RefreshCw,
  AlertTriangle,
  Award,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import './FinancialAvatarWidget.css';

const AVATAR_STORAGE_KEY = 'spendl_rpg_avatar_state';

const RANK_TITLES = {
  1: 'Novice Saver',
  2: 'Budget Apprentice',
  3: 'Coin Sentry',
  4: 'Budget Knight',
  5: 'Vault Warden',
  6: 'Wealth Paladin',
  7: 'Financial Sovereign',
};

const DEFAULT_STATE = {
  level: 4,
  hp: 85,
  maxHp: 100,
  xp: 720,
  xpForNextLevel: 1000,
  streakDays: 6,
};

export function FinancialAvatarWidget({ onShowToast }) {
  // RPG State from storage or defaults
  const [gameState, setGameState] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_STATE;
    try {
      const stored = localStorage.getItem(AVATAR_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed.level === 'number') {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read avatar state:', e);
    }
    return DEFAULT_STATE;
  });

  // Animation & Reaction State
  const [avatarMood, setAvatarMood] = useState('normal'); // 'normal' | 'happy' | 'hurt' | 'levelup'
  const [floatingNotification, setFloatingNotification] = useState(null); // { text, type, id }
  const [sparkleParticles, setSparkleParticles] = useState([]);
  const [isDamagedEffect, setIsDamagedEffect] = useState(false);
  const [levelUpBanner, setLevelUpBanner] = useState(false);

  const containerRef = useRef(null);

  // Persist state changes
  useEffect(() => {
    try {
      localStorage.setItem(AVATAR_STORAGE_KEY, JSON.stringify(gameState));
    } catch (e) {
      console.warn('Could not persist avatar state:', e);
    }
  }, [gameState]);

  // Handle Level Progression
  const checkLevelUp = (currentXp, currentLevel, currentMaxHp) => {
    const threshold = currentLevel * 250;
    if (currentXp >= threshold) {
      const nextLevel = currentLevel + 1;
      const leftoverXp = currentXp - threshold;
      const newMaxHp = currentMaxHp + 10;

      setLevelUpBanner(true);
      setAvatarMood('levelup');

      // Grand confetti shower
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10B981', '#34D399', '#FBBF24', '#F59E0B', '#3E6B3B'],
      });

      if (onShowToast) {
        onShowToast(
          'success',
          `Congratulations! You achieved ${RANK_TITLES[nextLevel] || `Level ${nextLevel}`}!`,
          'Level Up! ⚔️'
        );
      }

      setTimeout(() => {
        setLevelUpBanner(false);
        setAvatarMood('normal');
      }, 3500);

      return {
        level: nextLevel,
        xp: leftoverXp,
        maxHp: newMaxHp,
        hp: newMaxHp,
        xpForNextLevel: nextLevel * 250,
      };
    }
    return null;
  };

  // 1. "Simulate Good Day (Log Within Budget)"
  const handleSimulateGoodDay = () => {
    // Generate burst of green sparkles around the avatar container
    const sparkles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: 30 + Math.random() * 40,
      y: 25 + Math.random() * 50,
      size: 14 + Math.random() * 16,
      delay: Math.random() * 0.2,
    }));
    setSparkleParticles(sparkles);
    setTimeout(() => setSparkleParticles([]), 1400);

    // Subtle celebratory confetti
    confetti({
      particleCount: 35,
      spread: 55,
      origin: { y: 0.7 },
      colors: ['#10B981', '#34D399', '#6EE7B7', '#F6E6A9'],
    });

    // Avatar happy mood
    setAvatarMood('happy');
    setTimeout(() => setAvatarMood('normal'), 1800);

    // Show floating +XP tag
    const notifId = Date.now();
    setFloatingNotification({
      id: notifId,
      text: '+100 XP • +5 HP',
      subtext: 'Streak Maintained!',
      type: 'good',
    });
    setTimeout(() => {
      setFloatingNotification((curr) => (curr?.id === notifId ? null : curr));
    }, 1800);

    // Update stats
    setGameState((prev) => {
      const addedXp = prev.xp + 100;
      const addedHp = Math.min(prev.maxHp, prev.hp + 5);
      const newStreak = prev.streakDays + 1;

      const levelUpResult = checkLevelUp(addedXp, prev.level, prev.maxHp);
      if (levelUpResult) {
        return {
          ...prev,
          ...levelUpResult,
          streakDays: newStreak,
        };
      }

      return {
        ...prev,
        xp: addedXp,
        hp: addedHp,
        streakDays: newStreak,
      };
    });

    if (onShowToast) {
      onShowToast(
        'success',
        'Logged within budget! Earned +100 XP and reinforced your Financial Guardian.',
        'Good Day Logged ✨'
      );
    }
  };

  // 2. "Simulate Overspend"
  const handleSimulateOverspend = () => {
    // Trigger shake & red flash overlay
    setIsDamagedEffect(true);
    setAvatarMood('hurt');

    setTimeout(() => {
      setIsDamagedEffect(false);
    }, 600);

    setTimeout(() => {
      setAvatarMood('normal');
    }, 1800);

    // Show floating -HP tag
    const notifId = Date.now();
    setFloatingNotification({
      id: notifId,
      text: '-20 HP',
      subtext: 'Impulse Breach!',
      type: 'hurt',
    });
    setTimeout(() => {
      setFloatingNotification((curr) => (curr?.id === notifId ? null : curr));
    }, 1800);

    // Drop HP dynamically
    setGameState((prev) => {
      const newHp = Math.max(0, prev.hp - 20);
      return {
        ...prev,
        hp: newHp,
        // If HP reaches 0, streak resets
        streakDays: newHp === 0 ? 0 : Math.max(0, prev.streakDays - 1),
      };
    });

    if (onShowToast) {
      onShowToast(
        'error',
        'Overspend registered! Your avatar took -20 HP damage. Cooling periods recommended.',
        'Budget Health Decreased ⚠️'
      );
    }
  };

  // Reset / Rest at Inn
  const handleRestAtInn = () => {
    setGameState(DEFAULT_STATE);
    setAvatarMood('normal');
    setFloatingNotification({
      id: Date.now(),
      text: 'Full Recovery!',
      subtext: 'Rested at Tavern',
      type: 'heal',
    });
    setTimeout(() => setFloatingNotification(null), 1600);

    if (onShowToast) {
      onShowToast('info', 'Avatar vitality and trial states reset to default.', 'Restored');
    }
  };

  // Compute percentage fills for progress bars
  const hpPercent = Math.min(100, Math.max(0, (gameState.hp / gameState.maxHp) * 100));
  const xpPercent = Math.min(100, Math.max(0, (gameState.xp / gameState.xpForNextLevel) * 100));
  const rankName = RANK_TITLES[gameState.level] || `Guardian Tier ${gameState.level}`;

  return (
    <section className="financial-avatar-section animate-fade-in" id="rpg-avatar-widget">
      <div className="avatar-widget-card" ref={containerRef}>
        {/* Soft Ambient Radial Backlight */}
        <div className="avatar-ambient-glow" aria-hidden="true" />

        {/* Level Up Banner Overlay */}
        {levelUpBanner && (
          <div className="level-up-banner animate-bounce-subtle">
            <Trophy size={20} className="trophy-icon" />
            <div className="banner-text">
              <span className="banner-title">LEVEL UP!</span>
              <span className="banner-sub">
                Now Level {gameState.level} {rankName}
              </span>
            </div>
            <Sparkles size={18} className="banner-sparkle" />
          </div>
        )}

        {/* Main Dual-Column Layout on Desktop, Single Column on Mobile */}
        <div className="avatar-dual-columns">
          {/* ============================================================
              LEFT COLUMN: Centered Stylized Digital Avatar Container
             ============================================================ */}
          <div className="avatar-stage-column">
            <div
              className={`avatar-display-stage ${isDamagedEffect ? 'stage-damaged-shake' : ''} mood-${avatarMood}`}
            >
              {/* Damage Red Overlay Flash */}
              <div
                className={`damage-flash-overlay ${isDamagedEffect ? 'active' : ''}`}
                aria-hidden="true"
              />

              {/* Floating Status Notification Tag */}
              {floatingNotification && (
                <div
                  className={`floating-rpg-toast notif-${floatingNotification.type} animate-float-up`}
                >
                  <span className="floating-main-text">{floatingNotification.text}</span>
                  <span className="floating-sub-text">{floatingNotification.subtext}</span>
                </div>
              )}

              {/* Floating Sparkle Elements */}
              {sparkleParticles.map((p) => (
                <div
                  key={p.id}
                  className="sparkle-star-particle"
                  style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    animationDelay: `${p.delay}s`,
                  }}
                >
                  <Sparkles size={p.size} />
                </div>
              ))}

              {/* Ambient Circular Runic Dial & Pedestal */}
              <div className="avatar-mystic-pedestal" aria-hidden="true">
                <div className="pedestal-ring ring-outer" />
                <div className="pedestal-ring ring-inner" />
                <div className="pedestal-glow-spot" />
              </div>

              {/* Stylized Flat-Vector Digital Avatar: "Floris the Financial Life Tree Guardian" */}
              <div className="vector-avatar-wrapper">
                <svg
                  viewBox="0 0 240 240"
                  className="life-tree-avatar-svg"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    {/* Body Gradient */}
                    <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#48A155" />
                      <stop offset="65%" stopColor="#2E7D32" />
                      <stop offset="100%" stopColor="#1B5E20" />
                    </linearGradient>

                    {/* Belly Highlight */}
                    <radialGradient id="bellyGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#E8F5E9" stopOpacity="0.95" />
                      <stop offset="100%" stopColor="#C8E6C9" stopOpacity="0.6" />
                    </radialGradient>

                    {/* Golden Leaf Horns */}
                    <linearGradient id="leafHornGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FDE047" />
                      <stop offset="60%" stopColor="#EAB308" />
                      <stop offset="100%" stopColor="#CA8A04" />
                    </linearGradient>

                    {/* Discipline Core Crystal */}
                    <linearGradient id="gemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#67E8F9" />
                      <stop offset="50%" stopColor="#06B6D4" />
                      <stop offset="100%" stopColor="#0891B2" />
                    </linearGradient>

                    {/* Hurt Core Crystal */}
                    <linearGradient id="gemHurtGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FDA4AF" />
                      <stop offset="50%" stopColor="#F43F5E" />
                      <stop offset="100%" stopColor="#BE123C" />
                    </linearGradient>

                    {/* Aura Filter */}
                    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3.5" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Ethereal Aura Rings */}
                  <g className="avatar-halo-orbit">
                    <circle
                      cx="120"
                      cy="120"
                      r="86"
                      fill="none"
                      stroke="#A7F3D0"
                      strokeWidth="1.5"
                      strokeDasharray="6 8"
                      opacity="0.6"
                    />
                    <circle
                      cx="120"
                      cy="120"
                      r="102"
                      fill="none"
                      stroke="#FDE68A"
                      strokeWidth="1.2"
                      strokeDasharray="4 12"
                      opacity="0.4"
                    />
                  </g>

                  {/* Botanical Pet Body */}
                  <g className="avatar-creature-group">
                    {/* Shadow under feet */}
                    <ellipse cx="120" cy="208" rx="46" ry="10" fill="rgba(40, 40, 32, 0.12)" />

                    {/* Little cute root feet */}
                    <ellipse cx="98" cy="204" rx="14" ry="8" fill="#1B5E20" />
                    <ellipse cx="142" cy="204" rx="14" ry="8" fill="#1B5E20" />

                    {/* Main Teardrop Spirit Body */}
                    <path
                      d="M120 54 C162 54, 178 110, 172 168 C168 200, 148 208, 120 208 C92 208, 72 200, 68 168 C62 110, 78 54, 120 54 Z"
                      fill="url(#bodyGradient)"
                      filter="drop-shadow(0 6px 12px rgba(27, 94, 32, 0.22))"
                    />

                    {/* Belly Patch */}
                    <path
                      d="M120 120 C144 120, 154 148, 150 184 C146 200, 134 204, 120 204 C106 204, 94 200, 90 184 C86 148, 96 120, 120 120 Z"
                      fill="url(#bellyGlow)"
                    />

                    {/* Sprouting Golden Leaf Horns (Antlers) */}
                    <g className="avatar-leaf-antlers">
                      {/* Left Horn */}
                      <path
                        d="M102 65 C88 42, 64 36, 56 46 C50 54, 58 74, 92 73 Z"
                        fill="url(#leafHornGrad)"
                        className="left-leaf"
                      />
                      <path
                        d="M92 68 C80 54, 68 48, 62 50"
                        stroke="#B45309"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        fill="none"
                      />

                      {/* Right Horn */}
                      <path
                        d="M138 65 C152 42, 176 36, 184 46 C190 54, 182 74, 148 73 Z"
                        fill="url(#leafHornGrad)"
                        className="right-leaf"
                      />
                      <path
                        d="M148 68 C160 54, 172 48, 178 50"
                        stroke="#B45309"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        fill="none"
                      />

                      {/* Center Sprout Leaf */}
                      <path
                        d="M120 52 C114 36, 120 22, 126 26 C132 30, 128 44, 122 52 Z"
                        fill="#86EFAC"
                      />
                    </g>

                    {/* Discipline Core Gem on Chest */}
                    <polygon
                      points="120,138 128,150 120,162 112,150"
                      fill={avatarMood === 'hurt' ? 'url(#gemHurtGrad)' : 'url(#gemGrad)'}
                      filter="url(#softGlow)"
                      className="discipline-crystal-gem"
                    />

                    {/* Dynamic Eyes & Face Expressions */}
                    {avatarMood === 'happy' ? (
                      /* Happy Crescent Eyes: ^ ^ */
                      <g className="face-happy animate-bounce-short">
                        <path
                          d="M96 108 Q103 100 110 108"
                          stroke="#1B5E20"
                          strokeWidth="3.2"
                          strokeLinecap="round"
                          fill="none"
                        />
                        <path
                          d="M130 108 Q137 100 144 108"
                          stroke="#1B5E20"
                          strokeWidth="3.2"
                          strokeLinecap="round"
                          fill="none"
                        />
                        {/* Rosy Cheeks */}
                        <ellipse cx="92" cy="116" rx="7" ry="4.5" fill="#FDA4AF" opacity="0.85" />
                        <ellipse cx="148" cy="116" rx="7" ry="4.5" fill="#FDA4AF" opacity="0.85" />
                        {/* Little Smile */}
                        <path
                          d="M116 117 Q120 122 124 117"
                          stroke="#1B5E20"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          fill="none"
                        />
                      </g>
                    ) : avatarMood === 'hurt' ? (
                      /* Hurt Wincing Eyes: > < */
                      <g className="face-hurt">
                        <path
                          d="M96 102 L108 108 L96 114"
                          stroke="#BE123C"
                          strokeWidth="3.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                        <path
                          d="M144 102 L132 108 L144 114"
                          stroke="#BE123C"
                          strokeWidth="3.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                        {/* Wavy Frown */}
                        <path
                          d="M114 121 Q120 116 126 121"
                          stroke="#BE123C"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          fill="none"
                        />
                        {/* Sweat drop */}
                        <path
                          d="M152 92 C152 96, 148 98, 148 100 C148 102, 154 102, 154 100 C154 98, 152 96, 152 92 Z"
                          fill="#67E8F9"
                        />
                      </g>
                    ) : (
                      /* Normal Curious Kawaii Spirit Eyes */
                      <g className="face-normal">
                        {/* Left Eye */}
                        <ellipse cx="102" cy="106" rx="6.5" ry="8.5" fill="#1C1917" />
                        <circle cx="100.5" cy="103" r="2.6" fill="#FFFFFF" />
                        <circle cx="104.5" cy="109" r="1.3" fill="#FFFFFF" />

                        {/* Right Eye */}
                        <ellipse cx="138" cy="106" rx="6.5" ry="8.5" fill="#1C1917" />
                        <circle cx="136.5" cy="103" r="2.6" fill="#FFFFFF" />
                        <circle cx="140.5" cy="109" r="1.3" fill="#FFFFFF" />

                        {/* Soft Cheeks */}
                        <ellipse cx="94" cy="115" rx="5.5" ry="3.5" fill="#FCA5A5" opacity="0.45" />
                        <ellipse cx="146" cy="115" rx="5.5" ry="3.5" fill="#FCA5A5" opacity="0.45" />

                        {/* Petite Smile */}
                        <path
                          d="M117 115 Q120 118 123 115"
                          stroke="#1B5E20"
                          strokeWidth="2"
                          strokeLinecap="round"
                          fill="none"
                        />
                      </g>
                    )}
                  </g>
                </svg>
              </div>

              {/* Character State Capsule Tag */}
              <div className="avatar-mood-badge">
                <span className={`mood-dot mood-dot-${avatarMood}`} />
                <span className="mood-text">
                  {avatarMood === 'happy' && 'Spirit Feeling Joyous & Prosperous'}
                  {avatarMood === 'hurt' && 'Spirit Stressed by Overspending'}
                  {avatarMood === 'levelup' && 'Ascending to Greater Discipline!'}
                  {avatarMood === 'normal' && 'Guarding Your Daily Budget'}
                </span>
              </div>
            </div>
          </div>

          {/* ============================================================
              RIGHT COLUMN: Sleek RPG Status Sheet
             ============================================================ */}
          <div className="status-sheet-column">
            {/* Sheet Header: Level Rank & Streak Stat */}
            <div className="status-header">
              <div className="status-rank-block">
                <div className="rank-tier-pill">
                  <Shield size={13} className="text-terracotta" />
                  <span>RPG FINANCIAL GUARDIAN</span>
                </div>
                <h3 className="character-rank-title font-serif">
                  Level {gameState.level} {rankName}
                </h3>
                <p className="character-rank-desc">
                  Discipline Specialist • Earth & Ledger Affinity
                </p>
              </div>

              {/* Streak Counter Stat */}
              <div className="streak-stat-badge">
                <div className="streak-icon-wrap">
                  <Flame size={17} className="flame-icon-pulse" />
                </div>
                <div className="streak-info">
                  <span className="streak-caption">CURRENT STREAK</span>
                  <span className="streak-value font-mono tabular-nums">
                    {gameState.streakDays} Days Under Budget
                  </span>
                </div>
              </div>
            </div>

            {/* Health & Experience Progress Bars */}
            <div className="status-bars-container">
              {/* HP Bar (Health Points) */}
              <div className="status-bar-card bar-hp-card">
                <div className="bar-header-row">
                  <div className="bar-label-group">
                    <Heart size={15} className="bar-icon icon-hp" />
                    <span className="bar-title">Financial Health (HP)</span>
                  </div>
                  <span className="bar-readout font-mono tabular-nums">
                    <strong>{gameState.hp}</strong> / {gameState.maxHp} HP
                  </span>
                </div>

                <div
                  className="progress-track hp-track"
                  role="progressbar"
                  aria-valuenow={gameState.hp}
                  aria-valuemin={0}
                  aria-valuemax={gameState.maxHp}
                  aria-label="Financial Health Points"
                >
                  <div
                    className="progress-fill hp-fill"
                    style={{ width: `${hpPercent}%` }}
                  >
                    <div className="fill-shimmer" />
                  </div>
                </div>

                <div className="bar-footer-row">
                  <span className="bar-subtext">
                    {gameState.hp > 60
                      ? 'Solid buffer. Safety net intact.'
                      : gameState.hp > 25
                      ? 'Careful: Buffer thinning under impulse pressure.'
                      : 'Critical health! Stop discretionary spending.'}
                  </span>
                  <span className="bar-percent font-mono">{Math.round(hpPercent)}%</span>
                </div>
              </div>

              {/* XP Bar (Experience Points) */}
              <div className="status-bar-card bar-xp-card">
                <div className="bar-header-row">
                  <div className="bar-label-group">
                    <Zap size={15} className="bar-icon icon-xp" />
                    <span className="bar-title">Discipline Mastery (XP)</span>
                  </div>
                  <span className="bar-readout font-mono tabular-nums">
                    <strong>{gameState.xp}</strong> / {gameState.xpForNextLevel} XP
                  </span>
                </div>

                <div
                  className="progress-track xp-track"
                  role="progressbar"
                  aria-valuenow={gameState.xp}
                  aria-valuemin={0}
                  aria-valuemax={gameState.xpForNextLevel}
                  aria-label="Discipline Experience Points"
                >
                  <div
                    className="progress-fill xp-fill"
                    style={{ width: `${xpPercent}%` }}
                  >
                    <div className="fill-shimmer" />
                  </div>
                </div>

                <div className="bar-footer-row">
                  <span className="bar-subtext">
                    {gameState.xpForNextLevel - gameState.xp} XP to Level {gameState.level + 1}
                  </span>
                  <span className="bar-percent font-mono">{Math.round(xpPercent)}%</span>
                </div>
              </div>
            </div>

            {/* RPG Attribute Badges */}
            <div className="rpg-attributes-grid">
              <div className="rpg-attr-chip">
                <Shield size={13} className="attr-icon" />
                <span className="attr-label">Budget Armor:</span>
                <span className="attr-val font-mono">88%</span>
              </div>
              <div className="rpg-attr-chip">
                <Sparkles size={13} className="attr-icon" />
                <span className="attr-label">Impulse Ward:</span>
                <span className="attr-val font-mono">Tier IV</span>
              </div>
              <div className="rpg-attr-chip">
                <TrendingUp size={13} className="attr-icon" />
                <span className="attr-label">Savings Buff:</span>
                <span className="attr-val font-mono">+12%</span>
              </div>
            </div>

            {/* Mock Demonstration Control Buttons */}
            <div className="avatar-actions-dock">
              <div className="dock-header">
                <span className="dock-title">Demonstration Actions</span>
                <button
                  type="button"
                  className="btn-rest-inn"
                  onClick={handleRestAtInn}
                  title="Reset state to default demonstration settings"
                >
                  <RefreshCw size={12} />
                  <span>Reset / Rest</span>
                </button>
              </div>

              <div className="dock-buttons-row">
                {/* 1. Good Day Button */}
                <button
                  type="button"
                  id="btn-simulate-good-day"
                  className="btn-rpg-action btn-good-day"
                  onClick={handleSimulateGoodDay}
                >
                  <Sparkles size={16} className="btn-action-icon" />
                  <div className="btn-label-stack">
                    <span className="main-action-text">Simulate Good Day</span>
                    <span className="sub-action-text">+100 XP • +5 HP • Streak +1</span>
                  </div>
                </button>

                {/* 2. Overspend Button */}
                <button
                  type="button"
                  id="btn-simulate-overspend"
                  className="btn-rpg-action btn-overspend"
                  onClick={handleSimulateOverspend}
                >
                  <AlertTriangle size={16} className="btn-action-icon" />
                  <div className="btn-label-stack">
                    <span className="main-action-text">Simulate Overspend</span>
                    <span className="sub-action-text">-20 HP • Damage Reaction</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FinancialAvatarWidget;
