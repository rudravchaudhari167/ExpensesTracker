import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Sparkles,
  Heart,
  Zap,
  Flame,
  Shield,
  Trophy,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import guardianBoyImg from '../../assets/guardian-boy.png';
import './FinancialAvatarWidget.css';

const AVATAR_STORAGE_KEY = 'spendl_rpg_avatar_state';

const RANK_TITLES = {
  1: 'Disciplined Strategist',
  2: 'Budget Tactician',
  3: 'Asset Vanguard',
  4: 'Wealth Sentinel',
  5: 'Capital Commander',
  6: 'Sovereign Guardian',
  7: 'Financial Sovereign',
};


const DEFAULT_STATE = {
  level: 4,
  hp: 92,
  maxHp: 100,
  xp: 450,
  xpForNextLevel: 1000,
  streakDays: 7, // Sophisticated grown man with an active 7-day budget streak!
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
  const [floatingNotification, setFloatingNotification] = useState(null); // { text, subtext, type, id }
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

  // =========================================================================
  // DYNAMIC RPG ATTRIBUTES CALCULATION
  // =========================================================================

  // 1. Budget Armor: scales dynamically with remaining HP ratio, Level, and Streak
  const budgetArmor = useMemo(() => {
    const hpRatio = gameState.hp / gameState.maxHp;
    const armor = Math.round(hpRatio * 60 + gameState.level * 4 + gameState.streakDays * 1.5);
    return Math.min(99, Math.max(15, armor));
  }, [gameState.hp, gameState.maxHp, gameState.level, gameState.streakDays]);

  // 2. Impulse Ward: tiers dynamically based on Streak and Level
  const impulseWard = useMemo(() => {
    const score = gameState.streakDays + gameState.level;
    if (score >= 14) {
      return {
        tier: 'Tier V',
        name: 'Diamond Aegis',
        cooldown: '72h Cooling',
        mitigation: '50% Damage Absorb',
        description: 'Elite mental barrier blocking impulsive checkouts. Peak resistance.',
      };
    }
    if (score >= 10) {
      return {
        tier: 'Tier IV',
        name: 'Obsidian Barrier',
        cooldown: '48h Cooling',
        mitigation: '35% Damage Absorb',
        description: 'Heavy protective ward reinforcing your cooling periods against spontaneous urges.',
      };
    }
    if (score >= 7) {
      return {
        tier: 'Tier III',
        name: 'Runic Shield',
        cooldown: '36h Cooling',
        mitigation: '25% Damage Absorb',
        description: 'Hardened shield forged by steady daily spending discipline.',
      };
    }
    if (score >= 4) {
      return {
        tier: 'Tier II',
        name: 'Iron Bastion',
        cooldown: '24h Cooling',
        mitigation: '15% Damage Absorb',
        description: 'Reliable foundational ward shielding your budget against small slips.',
      };
    }
    return {
      tier: 'Tier I',
      name: 'Wood Buckler',
      cooldown: '12h Cooling',
      mitigation: '5% Damage Absorb',
      description: 'Introductory barrier. Build higher streaks to upgrade your tier.',
    };
  }, [gameState.streakDays, gameState.level]);

  // 3. Savings Buff: scales dynamically with Level, Streak, and Health state
  const savingsBuff = useMemo(() => {
    const levelBonus = gameState.level * 2;
    const streakBonus = Math.round(gameState.streakDays * 1.5);
    const healthBonus = gameState.hp >= 75 ? 5 : 2;
    return levelBonus + streakBonus + healthBonus;
  }, [gameState.level, gameState.streakDays, gameState.hp]);

  // Dynamic XP calculation for a Good Day
  const goodDayXpGain = useMemo(() => {
    return 100 + Math.round(100 * (savingsBuff / 100));
  }, [savingsBuff]);

  // Dynamic Presence & Command Scale
  const avatarScale = useMemo(() => {
    const s = Math.max(0, gameState.streakDays);
    const scale = 0.96 + Math.min(0.16, Math.sqrt(s) * 0.035);
    return Number(scale.toFixed(2));
  }, [gameState.streakDays]);

  // Check and process Level Ups
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

  // 1. "Simulate Disciplined Day (Log Within Budget)"
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
      colors: ['#059669', '#10B981', '#E87952', '#FBBF24'],
    });

    // Avatar confident mood
    setAvatarMood('happy');
    setTimeout(() => setAvatarMood('normal'), 1800);

    // Dynamic XP calculation using active Savings Buff!
    const baseBonusXp = 100;
    const buffBonusXp = Math.round(baseBonusXp * (savingsBuff / 100));
    const totalGainedXp = baseBonusXp + buffBonusXp;

    const nextStreak = gameState.streakDays + 1;

    // Show floating notification with active buff & discipline details
    const notifId = Date.now();
    setFloatingNotification({
      id: notifId,
      text: `+${totalGainedXp} XP • +5 HP`,
      subtext: `Streak: ${nextStreak} Days Under Budget`,
      type: 'good',
    });
    setTimeout(() => {
      setFloatingNotification((curr) => (curr?.id === notifId ? null : curr));
    }, 2000);

    // Update stats
    setGameState((prev) => {
      const addedXp = prev.xp + totalGainedXp;
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
        `Logged within budget! Earned +${totalGainedXp} XP (with +${savingsBuff}% Savings Buff) and fortified Budget Armor.`,
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

    // Damage mitigated by active Budget Armor & Impulse Ward!
    const rawDamage = 28;
    const mitigatedAmount = Math.round((budgetArmor / 100) * 12);
    const actualDamage = Math.max(8, rawDamage - mitigatedAmount);

    // Show floating -HP tag noting armor absorption
    const notifId = Date.now();
    setFloatingNotification({
      id: notifId,
      text: `-${actualDamage} HP`,
      subtext: `Armor absorbed ${mitigatedAmount} damage!`,
      type: 'hurt',
    });
    setTimeout(() => {
      setFloatingNotification((curr) => (curr?.id === notifId ? null : curr));
    }, 2000);

    // Drop HP dynamically
    setGameState((prev) => {
      const newHp = Math.max(0, prev.hp - actualDamage);
      return {
        ...prev,
        hp: newHp,
        streakDays: newHp === 0 ? 0 : Math.max(0, prev.streakDays - 1),
      };
    });

    if (onShowToast) {
      onShowToast(
        'error',
        `Overspend registered! Budget Armor absorbed ${mitigatedAmount} damage, actual damage: -${actualDamage} HP.`,
        'Budget Armor Strained ⚠️'
      );
    }
  };

  // Reset Guardian Baseline
  const handleRestAtInn = () => {
    setGameState(DEFAULT_STATE);
    setAvatarMood('normal');
    setFloatingNotification({
      id: Date.now(),
      text: 'Progress Reset',
      subtext: 'Returned to Baseline',
      type: 'heal',
    });
    setTimeout(() => setFloatingNotification(null), 1600);

    if (onShowToast) {
      onShowToast('info', 'Guardian state reset to initial baseline.', 'Reset Complete');
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
              <div
                className="avatar-mystic-pedestal"
                style={{
                  transform: `scale(${0.9 + Math.min(0.25, gameState.streakDays * 0.015)})`,
                }}
                aria-hidden="true"
              >
                <div className="pedestal-ring ring-outer" />
                <div className="pedestal-ring ring-inner" />
                <div className="pedestal-glow-spot" />
              </div>

              {/* Financial Guardian Boy Avatar (Scales smoothly with streak) */}
              <div
                className="vector-avatar-wrapper boy-avatar-wrapper"
                style={{ transform: `scale(${avatarScale})` }}
              >
                <div className="guardian-boy-frame">
                  {/* Glowing Character Backlight */}
                  <div className="boy-backlight" aria-hidden="true" />

                  {/* Character Illustration */}
                  <img
                    src={guardianBoyImg}
                    alt="RPG Financial Guardian Boy"
                    className="guardian-boy-avatar-img"
                  />

                  {/* Grounding Shadow */}
                  <div className="boy-ground-shadow" aria-hidden="true" />
                </div>
              </div>

              {/* Character State Capsule Tag */}
              <div className="avatar-mood-badge">
                <span className={`mood-dot mood-dot-${avatarMood}`} />
                <span className="mood-text">
                  {avatarMood === 'happy' && 'Disciplined Resolve Fortified • Momentum Surging'}
                  {avatarMood === 'hurt' && 'Budget Armor Absorbed Impact • Caution Advised'}
                  {avatarMood === 'levelup' && 'Level Up! Health & Vitality Fortified'}
                  {avatarMood === 'normal' && `Guarding Capital • ${rankName}`}
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
                  Maintain daily spending discipline to fortify your financial health and protect your savings.
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

            {/* Simplified 3 Core Guardian Attributes */}
            <div className="guardian-stats-row">
              <div className="guardian-stat-item">
                <Shield size={15} className="stat-icon icon-armor" />
                <div className="stat-meta">
                  <span className="stat-title">Budget Armor</span>
                  <span className="stat-value font-mono">{budgetArmor}%</span>
                </div>
              </div>

              <div className="guardian-stat-item">
                <Sparkles size={15} className="stat-icon icon-ward" />
                <div className="stat-meta">
                  <span className="stat-title">Impulse Ward</span>
                  <span className="stat-value font-mono">{impulseWard.tier}</span>
                </div>
              </div>

              <div className="guardian-stat-item">
                <TrendingUp size={15} className="stat-icon icon-buff" />
                <div className="stat-meta">
                  <span className="stat-title">Savings Boost</span>
                  <span className="stat-value font-mono">+{savingsBuff}%</span>
                </div>
              </div>
            </div>

            {/* Simple Direct Actions */}
            <div className="guardian-actions-section">
              <div className="actions-primary-row">
                {/* 1. Good Day Button */}
                <button
                  type="button"
                  id="btn-simulate-good-day"
                  className="btn-guardian-primary btn-good-day"
                  onClick={handleSimulateGoodDay}
                >
                  <CheckCircle2 size={17} className="btn-action-icon" />
                  <div className="btn-label-stack">
                    <span className="main-action-text">Log Within Budget</span>
                    <span className="sub-action-text">
                      +{goodDayXpGain} XP • +5 HP • +1 Day Streak
                    </span>
                  </div>
                </button>

                {/* 2. Overspend Button */}
                <button
                  type="button"
                  id="btn-simulate-overspend"
                  className="btn-guardian-primary btn-overspend"
                  onClick={handleSimulateOverspend}
                >
                  <AlertTriangle size={17} className="btn-action-icon" />
                  <div className="btn-label-stack">
                    <span className="main-action-text">Log Overspend</span>
                    <span className="sub-action-text">
                      Armor Mitigates Damage
                    </span>
                  </div>
                </button>
              </div>

              <div className="guardian-actions-subbar">
                <span className="subbar-hint">
                  Your guardian tracks your discipline across every budget cycle.
                </span>
                <button
                  type="button"
                  className="btn-reset-simple"
                  onClick={handleRestAtInn}
                  title="Reset guardian baseline"
                >
                  <RefreshCw size={11} />
                  <span>Reset Progress</span>
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
