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
  Award,
  ChevronRight,
  TrendingUp,
  X,
  Info,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Minus,
} from 'lucide-react';
import confetti from 'canvas-confetti';
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

// Adult Financial Prestige Tiers based on streak days
export const PRESTIGE_TIERS = [
  {
    maxStreak: 2,
    stage: 1,
    title: 'The Aspirant',
    subtitle: 'Foundation Phase • Establishing Spending Discipline',
    prestigeLabel: 'Disciplined Vanguard',
    icon: '⚡',
    badgeClass: 'tier-aspirant',
  },
  {
    maxStreak: 5,
    stage: 2,
    title: 'The Tactician',
    subtitle: 'Momentum Phase • Systematic Budget Control',
    prestigeLabel: 'Strategic Planner',
    icon: '🎯',
    badgeClass: 'tier-tactician',
  },
  {
    maxStreak: 9,
    stage: 3,
    title: 'The Vanguard',
    subtitle: 'Fortress Phase • Ironclad Impulse Resistance',
    prestigeLabel: 'Asset Guardian',
    icon: '🛡️',
    badgeClass: 'tier-vanguard',
  },
  {
    maxStreak: 15,
    stage: 4,
    title: 'The Sentinel',
    subtitle: 'Mastery Phase • High-Yield Discipline Multipliers',
    prestigeLabel: 'Wealth Paladin',
    icon: '⚔️',
    badgeClass: 'tier-sentinel',
  },
  {
    maxStreak: Infinity,
    stage: 5,
    title: 'The Sovereign',
    subtitle: 'Apex Command • Financial Autonomy & Mastery',
    prestigeLabel: 'Financial Sovereign',
    icon: '👑',
    badgeClass: 'tier-sovereign',
  },
];

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

  // Selected Attribute Inspector State: null | 'armor' | 'ward' | 'buff'
  const [activeAttribute, setActiveAttribute] = useState(null);

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

  // 4. Prestige Tier based on Streak Days
  const currentTier = useMemo(() => {
    const streak = Math.max(0, gameState.streakDays);
    return PRESTIGE_TIERS.find((s) => streak <= s.maxStreak) || PRESTIGE_TIERS[0];
  }, [gameState.streakDays]);

  // 5. Mature Presence & Command Scale (dignified 0.96x to 1.14x, not shrunken)
  const avatarScale = useMemo(() => {
    const s = Math.max(0, gameState.streakDays);
    const scale = 0.96 + Math.min(0.16, Math.sqrt(s) * 0.035);
    return Number(scale.toFixed(2));
  }, [gameState.streakDays]);

  // Interactive Streak Controller: Quick one-click testing of discipline tiers
  const handleSetStreak = (newStreak) => {
    const s = Math.max(0, newStreak);
    setGameState((prev) => ({
      ...prev,
      streakDays: s,
    }));

    const tier = PRESTIGE_TIERS.find((t) => s <= t.maxStreak) || PRESTIGE_TIERS[0];

    // Particle burst
    const sparkles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: 30 + Math.random() * 40,
      y: 25 + Math.random() * 50,
      size: 14 + Math.random() * 16,
      delay: Math.random() * 0.2,
    }));
    setSparkleParticles(sparkles);
    setTimeout(() => setSparkleParticles([]), 1400);

    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.65 },
      colors: ['#E87952', '#059669', '#FBBF24'],
    });

    const notifId = Date.now();
    setFloatingNotification({
      id: notifId,
      text: `Streak: ${s} Days`,
      subtext: `${tier.title} Tier Active`,
      type: 'heal',
    });
    setTimeout(() => setFloatingNotification(null), 1800);

    if (onShowToast) {
      onShowToast(
        'info',
        `Discipline streak updated to ${s} days. Active tier: ${tier.title}.`,
        'Discipline Updated ⚔️'
      );
    }
  };

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
    const nextTier = PRESTIGE_TIERS.find((t) => nextStreak <= t.maxStreak) || PRESTIGE_TIERS[PRESTIGE_TIERS.length - 1];

    // Show floating notification with active buff & discipline details
    const notifId = Date.now();
    setFloatingNotification({
      id: notifId,
      text: `+${totalGainedXp} XP • +5 HP`,
      subtext: `Streak: ${nextStreak} Days (${nextTier.title})`,
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

  // Interactive Action on Budget Armor chip
  const handleFortifyArmor = () => {
    setGameState((prev) => ({
      ...prev,
      hp: Math.min(prev.maxHp, prev.hp + 15),
    }));

    confetti({
      particleCount: 20,
      spread: 40,
      origin: { y: 0.6 },
      colors: ['#38BDF8', '#60A5FA', '#93C5FD'],
    });

    const notifId = Date.now();
    setFloatingNotification({
      id: notifId,
      text: '+15 HP Buffer',
      subtext: 'Armor Fortified!',
      type: 'heal',
    });
    setTimeout(() => setFloatingNotification(null), 1800);

    if (onShowToast) {
      onShowToast('success', 'Budget Armor fortified! Vitality buffer restored by +15 HP.', 'Armor Upgraded 🛡️');
    }
  };

  // Interactive Action on Impulse Ward chip
  const handleCastWard = () => {
    setGameState((prev) => ({
      ...prev,
      streakDays: prev.streakDays + 1,
    }));

    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.6 },
      colors: ['#F59E0B', '#FBBF24', '#FEF08A'],
    });

    const notifId = Date.now();
    setFloatingNotification({
      id: notifId,
      text: '+1 Streak Shield',
      subtext: 'Impulse Ward Charged!',
      type: 'heal',
    });
    setTimeout(() => setFloatingNotification(null), 1800);

    if (onShowToast) {
      onShowToast('success', `Active Impulse Ward reinforced! Gained +1 day mental protection.`, 'Ward Activated ✨');
    }
  };

  // Interactive Action on Savings Buff chip
  const handleSurgeBuff = () => {
    const surgeXp = 50;
    setGameState((prev) => {
      const addedXp = prev.xp + surgeXp;
      const levelUpResult = checkLevelUp(addedXp, prev.level, prev.maxHp);
      if (levelUpResult) {
        return {
          ...prev,
          ...levelUpResult,
        };
      }
      return {
        ...prev,
        xp: addedXp,
      };
    });

    const notifId = Date.now();
    setFloatingNotification({
      id: notifId,
      text: '+50 Surge XP',
      subtext: 'Savings Multiplier Triggered!',
      type: 'good',
    });
    setTimeout(() => setFloatingNotification(null), 1800);

    if (onShowToast) {
      onShowToast('success', 'Savings Buff surged! Gained +50 instant discipline experience.', 'Buff Surged ⚡');
    }
  };

  // Reset / Rest at Inn
  const handleRestAtInn = () => {
    setGameState(DEFAULT_STATE);
    setAvatarMood('normal');
    setActiveAttribute(null);
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

              {/* Top Floating Prestige Tier & Streak Indicator */}
              <div className="avatar-prestige-pill animate-fade-in">
                <span className="prestige-icon">{currentTier.icon}</span>
                <div className="prestige-pill-text">
                  <span className="prestige-title">{currentTier.title}</span>
                  <span className="prestige-sub font-mono">
                    Streak: {gameState.streakDays}d • {currentTier.prestigeLabel}
                  </span>
                </div>
              </div>

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

              {/* Dignified Male Financial Guardian (Dynamically scales subtly with prestige) */}
              <div
                className="vector-avatar-wrapper"
                style={{ transform: `scale(${avatarScale})` }}
              >
                <svg
                  viewBox="0 0 240 240"
                  className="man-avatar-svg"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    {/* Natural Healthy Skin Tone */}
                    <linearGradient id="manSkinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#FFF2E8" />
                      <stop offset="55%" stopColor="#FED7AA" />
                      <stop offset="100%" stopColor="#FDBA74" />
                    </linearGradient>

                    {/* Neck Shadow Tone */}
                    <linearGradient id="manSkinShadowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#FED7AA" />
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.4" />
                    </linearGradient>

                    {/* Styled Dark Textured Hair */}
                    <linearGradient id="manHairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#334155" />
                      <stop offset="40%" stopColor="#1E293B" />
                      <stop offset="100%" stopColor="#0F172A" />
                    </linearGradient>

                    {/* Tailored Deep Charcoal Suit Coat */}
                    <linearGradient id="manCoatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2E384D" />
                      <stop offset="50%" stopColor="#1E2638" />
                      <stop offset="100%" stopColor="#0F1420" />
                    </linearGradient>

                    {/* Signature Spendl Terracotta Silk Lapels */}
                    <linearGradient id="manLapelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#EA580C" />
                      <stop offset="60%" stopColor="#C2410C" />
                      <stop offset="100%" stopColor="#9A3412" />
                    </linearGradient>

                    {/* Emerald Cravat / Necktie */}
                    <linearGradient id="manTieGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="60%" stopColor="#059669" />
                      <stop offset="100%" stopColor="#047857" />
                    </linearGradient>

                    {/* Brushed Gold Accents & Brooch */}
                    <linearGradient id="crestGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FDE047" />
                      <stop offset="50%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#D97706" />
                    </linearGradient>

                    {/* Vanguard Shoulder Pauldron Gradient */}
                    <linearGradient id="pauldronGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FDE68A" />
                      <stop offset="40%" stopColor="#D97706" />
                      <stop offset="100%" stopColor="#1E293B" />
                    </linearGradient>

                    {/* Soft Filter Glow */}
                    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Refined Geometric HUD Rings (Concentric Discipline Orbit) */}
                  <g className="avatar-halo-orbit">
                    <circle
                      cx="120"
                      cy="120"
                      r="96"
                      fill="none"
                      stroke="#CBD5E1"
                      strokeWidth="1.2"
                      strokeDasharray="4 8"
                      opacity={0.35 + Math.min(0.4, gameState.streakDays * 0.02)}
                    />
                    <circle
                      cx="120"
                      cy="120"
                      r="108"
                      fill="none"
                      stroke="#FBBF24"
                      strokeWidth="1"
                      strokeDasharray="2 12"
                      opacity={0.25 + Math.min(0.45, gameState.streakDays * 0.02)}
                    />
                    {/* Cardinal Compass Tick Marks */}
                    <line x1="120" y1="12" x2="120" y2="18" stroke="#F59E0B" strokeWidth="1.5" />
                    <line x1="120" y1="222" x2="120" y2="228" stroke="#F59E0B" strokeWidth="1.5" />
                    <line x1="12" y1="120" x2="18" y2="120" stroke="#F59E0B" strokeWidth="1.5" />
                    <line x1="222" y1="120" x2="228" y2="120" stroke="#F59E0B" strokeWidth="1.5" />
                  </g>

                  {/* Sovereign Celestial Astral Halo (Unlocked at Streak >= 14) */}
                  {gameState.streakDays >= 14 && (
                    <g className="man-sovereign-halo" opacity="0.85">
                      <circle
                        cx="120"
                        cy="76"
                        r="52"
                        fill="none"
                        stroke="#F59E0B"
                        strokeWidth="1"
                        strokeDasharray="3 5"
                      />
                      <polygon
                        points="120,18 123,28 120,25 117,28"
                        fill="#F59E0B"
                      />
                      <polygon
                        points="178,76 168,79 171,76 168,73"
                        fill="#F59E0B"
                      />
                      <polygon
                        points="62,76 72,79 69,76 72,73"
                        fill="#F59E0B"
                      />
                    </g>
                  )}

                  {/* Character Illustration Group */}
                  <g className="male-guardian-group">
                    {/* Realistic Ground Pedestal Shadow */}
                    <ellipse
                      cx="120"
                      cy="222"
                      rx="48"
                      ry="8"
                      fill="rgba(30, 41, 59, 0.16)"
                    />

                    {/* Polished Oxford Dress Shoes */}
                    <g className="man-shoes">
                      <path
                        d="M98 217 Q94 223 99 224 L114 224 Q116 220 115 217 Z"
                        fill="#0B0F19"
                      />
                      <path
                        d="M125 217 Q124 220 126 224 L141 224 Q146 222 142 217 Z"
                        fill="#0B0F19"
                      />
                      <line x1="99" y1="223" x2="114" y2="223" stroke="#334155" strokeWidth="0.8" />
                      <line x1="126" y1="223" x2="141" y2="223" stroke="#334155" strokeWidth="0.8" />
                    </g>

                    {/* Tailored Dress Trousers */}
                    <g className="man-trousers">
                      {/* Left Leg */}
                      <path
                        d="M98 178 L100 218 L114 218 L117 178 Z"
                        fill="#18202F"
                      />
                      <line x1="107" y1="184" x2="107" y2="216" stroke="#0F172A" strokeWidth="1" />
                      {/* Right Leg */}
                      <path
                        d="M123 178 L126 218 L140 218 L142 178 Z"
                        fill="#18202F"
                      />
                      <line x1="133" y1="184" x2="133" y2="216" stroke="#0F172A" strokeWidth="1" />
                    </g>

                    {/* Tailored Coat Torso */}
                    <path
                      d="M80 122 C80 114, 160 114, 160 122 L152 188 C152 192, 88 192, 88 188 Z"
                      fill="url(#manCoatGrad)"
                      filter="drop-shadow(0 6px 14px rgba(15, 23, 42, 0.22))"
                    />

                    {/* Crisp Cream Inner Shirt Collar */}
                    <path
                      d="M108 98 L120 118 L132 98 L126 95 L114 95 Z"
                      fill="#FAF8F5"
                    />

                    {/* Emerald Cravat / Necktie */}
                    <path
                      d="M117 110 L123 110 L125 136 L120 142 L115 136 Z"
                      fill="url(#manTieGrad)"
                    />
                    {/* Gold Tie Clip */}
                    <rect x="117" y="122" width="6" height="2" rx="0.8" fill="#F59E0B" />

                    {/* Signature Terracotta Silk Peak Lapels */}
                    <path
                      d="M106 98 L84 126 L108 158 L118 122 Z"
                      fill="url(#manLapelGrad)"
                    />
                    <path
                      d="M134 98 L156 126 L124 162 L122 122 Z"
                      fill="url(#manLapelGrad)"
                    />

                    {/* Double-Breasted Brushed Gold Buttons */}
                    <circle cx="112" cy="140" r="2.2" fill="url(#crestGoldGrad)" />
                    <circle cx="128" cy="140" r="2.2" fill="url(#crestGoldGrad)" />
                    <circle cx="113" cy="156" r="2.2" fill="url(#crestGoldGrad)" />
                    <circle cx="127" cy="156" r="2.2" fill="url(#crestGoldGrad)" />
                    <circle cx="114" cy="172" r="2.2" fill="url(#crestGoldGrad)" />
                    <circle cx="126" cy="172" r="2.2" fill="url(#crestGoldGrad)" />

                    {/* Breast Pocket with Pocket Square & Gold Guardian Brooch */}
                    <path d="M93 134 L102 134 L99 128 Z" fill="#FAF8F5" />
                    <line x1="91" y1="134" x2="104" y2="134" stroke="#9A3412" strokeWidth="1.5" />

                    {/* Financial Guardian Medallion Brooch */}
                    <g className="guardian-medallion-crest">
                      <path
                        d="M94 140 L101 140 L101 146 Q101 151 97.5 153 Q94 151 94 146 Z"
                        fill="url(#crestGoldGrad)"
                        filter="url(#softGlow)"
                      />
                      <circle
                        cx="97.5"
                        cy="145"
                        r="1.8"
                        fill={avatarMood === 'hurt' ? '#EF4444' : '#10B981'}
                      />
                    </g>

                    {/* Left Arm: Tailored sleeve resting at side with gold cufflink */}
                    <g className="man-left-arm">
                      <path
                        d="M82 122 Q72 144 76 172"
                        stroke="url(#manCoatGrad)"
                        strokeWidth="11"
                        strokeLinecap="round"
                        fill="none"
                      />
                      {/* Shirt Cuff & Gold Cufflink */}
                      <line x1="73" y1="168" x2="79" y2="169" stroke="#FAF8F5" strokeWidth="2.5" />
                      <circle cx="76" cy="168.5" r="1.4" fill="#F59E0B" />
                      {/* Poised Male Hand */}
                      <ellipse cx="76" cy="177" rx="4.2" ry="5.8" fill="url(#manSkinGrad)" />
                    </g>

                    {/* Right Arm: Poised Executive Hand on Coat Lapel */}
                    <g className="man-lapel-hand">
                      <path
                        d="M158 122 Q164 144 148 158 Q138 160 128 150"
                        stroke="url(#manCoatGrad)"
                        strokeWidth="11"
                        strokeLinecap="round"
                        fill="none"
                      />
                      {/* White Shirt Cuff peeking out */}
                      <line x1="126" y1="148" x2="130" y2="153" stroke="#FAF8F5" strokeWidth="2.5" />
                      {/* Masculine Hand resting on Lapel */}
                      <path
                        d="M125 146 Q122 142 125 139 Q130 140 131 145 Q129 150 125 146 Z"
                        fill="url(#manSkinGrad)"
                      />
                    </g>

                    {/* Prestige Tier 2+ Accents: Gold Collar Cord (Streak >= 3) */}
                    {gameState.streakDays >= 3 && (
                      <path
                        d="M106 102 Q112 110 118 108"
                        stroke="#F59E0B"
                        strokeWidth="1.2"
                        strokeDasharray="2 1.5"
                        fill="none"
                      />
                    )}

                    {/* Prestige Tier 3+ Accents: Vanguard Gold Pauldrons (Streak >= 7) */}
                    {gameState.streakDays >= 7 && (
                      <g className="man-vanguard-pauldrons">
                        <path
                          d="M78 120 Q84 114 94 119 L92 125 Q84 122 78 125 Z"
                          fill="url(#pauldronGrad)"
                          stroke="#F59E0B"
                          strokeWidth="0.8"
                        />
                        <path
                          d="M162 120 Q156 114 146 119 L148 125 Q156 122 162 125 Z"
                          fill="url(#pauldronGrad)"
                          stroke="#F59E0B"
                          strokeWidth="0.8"
                        />
                      </g>
                    )}

                    {/* Defined Masculine Neck & Collar Shadow */}
                    <path
                      d="M112 94 L112 108 Q120 112 128 108 L128 94 Z"
                      fill="url(#manSkinShadowGrad)"
                    />
                    <line x1="120" y1="99" x2="120" y2="103" stroke="#E2A984" strokeWidth="1.2" />

                    {/* Defined Male Jawline & Face Structure */}
                    <path
                      d="M102 68 Q100 84 111 94 Q120 97 129 94 Q140 84 138 68 Q120 64 102 68 Z"
                      fill="url(#manSkinGrad)"
                    />

                    {/* Refined Male Ears */}
                    <path
                      d="M101 70 Q98 75 100 80 Q102 83 104 82 Z"
                      fill="url(#manSkinGrad)"
                    />
                    <path
                      d="M139 70 Q142 75 140 80 Q138 83 136 82 Z"
                      fill="url(#manSkinGrad)"
                    />

                    {/* Modern Styled Textured Dark Haircut (Fade sides, styled swept fringe) */}
                    <g className="man-styled-hair">
                      <path
                        d="M99 68 C96 50, 108 42, 120 42 C132 42, 144 50, 141 68 C138 66, 134 66, 132 62 C127 56, 121 60, 117 59 C111 58, 105 63, 102 65 C100 66, 99 67, 99 68 Z"
                        fill="url(#manHairGrad)"
                      />
                      {/* Subtle Hair Highlights */}
                      <path
                        d="M114 45 Q124 49 133 45"
                        stroke="#475569"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        fill="none"
                      />
                      <path
                        d="M108 51 Q119 53 128 49"
                        stroke="#475569"
                        strokeWidth="1.1"
                        strokeLinecap="round"
                        fill="none"
                      />
                    </g>

                    {/* Confident Masculine Eyebrows */}
                    {avatarMood === 'hurt' ? (
                      <g className="brows-hurt">
                        <line x1="105" y1="73" x2="116" y2="70" stroke="#991B1B" strokeWidth="2.2" strokeLinecap="round" />
                        <line x1="124" y1="70" x2="135" y2="73" stroke="#991B1B" strokeWidth="2.2" strokeLinecap="round" />
                      </g>
                    ) : (
                      <g className="brows-normal">
                        <path d="M106 70 Q111 68 116 70" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" fill="none" />
                        <path d="M124 70 Q129 68 134 70" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" fill="none" />
                      </g>
                    )}

                    {/* Clean Straight Masculine Nose */}
                    <path
                      d="M120 72 L120 81 L118 83 L122 83"
                      stroke="#D97706"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                      opacity="0.65"
                    />

                    {/* Sharp Focused Almond Eyes (Adult Male) */}
                    {avatarMood === 'happy' ? (
                      /* Confident Victorious Smirk & Sharp Eye Glint */
                      <g className="eyes-happy">
                        <path d="M107 75.5 Q111 73.5 115 75.5" stroke="#047857" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                        <path d="M125 75.5 Q129 73.5 133 75.5" stroke="#047857" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                        <circle cx="116.5" cy="74.5" r="1" fill="#10B981" />
                        <circle cx="123.5" cy="74.5" r="1" fill="#10B981" />
                      </g>
                    ) : avatarMood === 'hurt' ? (
                      /* Focused Stern Stoic Gaze Under Stress */
                      <g className="eyes-hurt">
                        <path d="M107 75 Q111 74 115 75" stroke="#991B1B" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                        <path d="M125 75 Q129 74 133 75" stroke="#991B1B" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                      </g>
                    ) : (
                      /* Focused Vigilant Eyes */
                      <g className="eyes-focused">
                        {/* Left Eye */}
                        <path d="M107 75 Q111 73 115 75 Q111 78 107 75 Z" fill="#FFFFFF" />
                        <circle cx="111.5" cy="75.2" r="2.1" fill="#0F766E" />
                        <circle cx="111.5" cy="75.2" r="1.1" fill="#042F2E" />
                        <circle cx="112.2" cy="74.5" r="0.6" fill="#FFFFFF" />
                        <path d="M106.5 74.8 Q111 72.8 115.5 74.8" stroke="#1E293B" strokeWidth="1.2" fill="none" />

                        {/* Right Eye */}
                        <path d="M125 75 Q129 73 133 75 Q129 78 125 75 Z" fill="#FFFFFF" />
                        <circle cx="128.5" cy="75.2" r="2.1" fill="#0F766E" />
                        <circle cx="128.5" cy="75.2" r="1.1" fill="#042F2E" />
                        <circle cx="129.2" cy="74.5" r="0.6" fill="#FFFFFF" />
                        <path d="M124.5 74.8 Q129 72.8 133.5 74.8" stroke="#1E293B" strokeWidth="1.2" fill="none" />
                      </g>
                    )}

                    {/* Resolute Composed Mouth */}
                    {avatarMood === 'happy' ? (
                      <path
                        d="M115 86 Q120 90 125 85"
                        stroke="#15803D"
                        strokeWidth="1.9"
                        strokeLinecap="round"
                        fill="none"
                      />
                    ) : avatarMood === 'hurt' ? (
                      <line
                        x1="116"
                        y1="88"
                        x2="124"
                        y2="88"
                        stroke="#991B1B"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    ) : (
                      <path
                        d="M116 87 Q120 89 124 87"
                        stroke="#9A3412"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        fill="none"
                      />
                    )}
                  </g>
                </svg>
              </div>

              {/* Character State Capsule Tag */}
              <div className="avatar-mood-badge">
                <span className={`mood-dot mood-dot-${avatarMood}`} />
                <span className="mood-text">
                  {avatarMood === 'happy' && 'Disciplined Resolve Fortified • Momentum Surging'}
                  {avatarMood === 'hurt' && 'Budget Armor Absorbed Impact • Caution Advised'}
                  {avatarMood === 'levelup' && 'Prestige Ascended • Sentinel Tier Unlocked!'}
                  {avatarMood === 'normal' && `Guarding Capital as ${currentTier.title}`}
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
                  {currentTier.title} • {currentTier.subtitle}
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

            {/* RPG Interactive Attribute Chips (Budget Armor, Impulse Ward, Savings Buff) */}
            <div className="rpg-attributes-wrapper">
              <div className="rpg-attributes-header">
                <span className="attr-section-caption">ACTIVE ATTRIBUTES & WARDS (Click to Inspect / Use)</span>
              </div>

              <div className="rpg-attributes-grid">
                {/* 1. Budget Armor Chip */}
                <button
                  type="button"
                  id="chip-budget-armor"
                  className={`rpg-attr-chip ${activeAttribute === 'armor' ? 'active-chip' : ''}`}
                  onClick={() => setActiveAttribute(activeAttribute === 'armor' ? null : 'armor')}
                  title="Click to inspect and reinforce Budget Armor"
                >
                  <Shield size={14} className="attr-icon icon-armor" />
                  <span className="attr-label">Budget Armor:</span>
                  <span className="attr-val font-mono">{budgetArmor}%</span>
                  <span className="attr-hint-dot" />
                </button>

                {/* 2. Impulse Ward Chip */}
                <button
                  type="button"
                  id="chip-impulse-ward"
                  className={`rpg-attr-chip ${activeAttribute === 'ward' ? 'active-chip' : ''}`}
                  onClick={() => setActiveAttribute(activeAttribute === 'ward' ? null : 'ward')}
                  title="Click to inspect and cast Impulse Ward"
                >
                  <Sparkles size={14} className="attr-icon icon-ward" />
                  <span className="attr-label">Impulse Ward:</span>
                  <span className="attr-val font-mono">{impulseWard.tier}</span>
                  <span className="attr-hint-dot" />
                </button>

                {/* 3. Savings Buff Chip */}
                <button
                  type="button"
                  id="chip-savings-buff"
                  className={`rpg-attr-chip ${activeAttribute === 'buff' ? 'active-chip' : ''}`}
                  onClick={() => setActiveAttribute(activeAttribute === 'buff' ? null : 'buff')}
                  title="Click to inspect and surge Savings Buff"
                >
                  <TrendingUp size={14} className="attr-icon icon-buff" />
                  <span className="attr-label">Savings Buff:</span>
                  <span className="attr-val font-mono">+{savingsBuff}%</span>
                  <span className="attr-hint-dot" />
                </button>
              </div>

              {/* Dynamic Interactive Detail Inspector Card */}
              {activeAttribute && (
                <div className="attribute-detail-card animate-fade-in">
                  {/* Budget Armor Detail */}
                  {activeAttribute === 'armor' && (
                    <div className="attr-detail-content">
                      <div className="detail-top-row">
                        <div className="detail-title-group">
                          <ShieldCheck size={18} className="detail-icon icon-armor" />
                          <div>
                            <h4 className="detail-title font-serif">Budget Armor ({budgetArmor}%)</h4>
                            <span className="detail-sub">
                              Damage Mitigation • Scales with Health & Level
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn-close-detail"
                          onClick={() => setActiveAttribute(null)}
                          title="Close"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <p className="detail-description">
                        Budget Armor acts as your financial buffer. When an unexpected expense occurs,
                        it absorbs up to <strong>{Math.round(budgetArmor * 0.45)}%</strong> of raw damage.
                        Current strength: <strong>{gameState.hp} HP</strong> / Level {gameState.level}.
                      </p>

                      <div className="detail-action-bar">
                        <div className="detail-stat-pill">
                          <span>Absorbs ~{Math.round(budgetArmor * 0.45)}% Overspend Damage</span>
                        </div>
                        <button
                          type="button"
                          className="btn-attr-action btn-armor-action"
                          onClick={handleFortifyArmor}
                        >
                          <Shield size={14} />
                          <span>Fortify Armor (+15 HP)</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Impulse Ward Detail */}
                  {activeAttribute === 'ward' && (
                    <div className="attr-detail-content">
                      <div className="detail-top-row">
                        <div className="detail-title-group">
                          <Sparkles size={18} className="detail-icon icon-ward" />
                          <div>
                            <h4 className="detail-title font-serif">
                              Impulse Ward ({impulseWard.tier}: {impulseWard.name})
                            </h4>
                            <span className="detail-sub">
                              {impulseWard.cooldown} • {impulseWard.mitigation}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn-close-detail"
                          onClick={() => setActiveAttribute(null)}
                          title="Close"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <p className="detail-description">
                        {impulseWard.description} Automatically shields your willpower during online browsing.
                        Higher budget streaks level up your ward tier!
                      </p>

                      <div className="detail-action-bar">
                        <div className="detail-stat-pill">
                          <span>Streak: {gameState.streakDays} Days • Active Cooldown: {impulseWard.cooldown}</span>
                        </div>
                        <button
                          type="button"
                          className="btn-attr-action btn-ward-action"
                          onClick={handleCastWard}
                        >
                          <Sparkles size={14} />
                          <span>Cast Ward (+1 Streak Day)</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Savings Buff Detail */}
                  {activeAttribute === 'buff' && (
                    <div className="attr-detail-content">
                      <div className="detail-top-row">
                        <div className="detail-title-group">
                          <TrendingUp size={18} className="detail-icon icon-buff" />
                          <div>
                            <h4 className="detail-title font-serif">Savings Buff (+{savingsBuff}%)</h4>
                            <span className="detail-sub">
                              Discipline Experience & Rewards Multiplier
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn-close-detail"
                          onClick={() => setActiveAttribute(null)}
                          title="Close"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <p className="detail-description">
                        Active on all budget accomplishments. Every "Good Day" logged earns an extra{' '}
                        <strong>+{savingsBuff}% XP</strong> bonus, speeding up your journey to the next Guardian rank.
                      </p>

                      <div className="detail-action-bar">
                        <div className="detail-stat-pill">
                          <span>Multiplier: {(1 + savingsBuff / 100).toFixed(2)}x on Good Days</span>
                        </div>
                        <button
                          type="button"
                          className="btn-attr-action btn-buff-action"
                          onClick={handleSurgeBuff}
                        >
                          <Zap size={14} />
                          <span>Surge Buff (+50 Bonus XP)</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mock Demonstration Control Buttons & Discipline Benchmark */}
            <div className="avatar-actions-dock">
              <div className="dock-header">
                <span className="dock-title">Demonstration Actions</span>
                <button
                  type="button"
                  className="btn-rest-inn"
                  onClick={handleRestAtInn}
                  title="Reset state to default guardian demonstration settings"
                >
                  <RefreshCw size={12} />
                  <span>Reset Strategy</span>
                </button>
              </div>

              {/* Primary Action Buttons */}
              <div className="dock-buttons-row">
                {/* 1. Disciplined Day Button */}
                <button
                  type="button"
                  id="btn-simulate-good-day"
                  className="btn-rpg-action btn-good-day"
                  onClick={handleSimulateGoodDay}
                >
                  <Sparkles size={16} className="btn-action-icon" />
                  <div className="btn-label-stack">
                    <span className="main-action-text">Simulate Disciplined Day (Under Budget)</span>
                    <span className="sub-action-text">
                      +{100 + Math.round(100 * (savingsBuff / 100))} XP • +5 HP • Streak +1 Day
                    </span>
                  </div>
                </button>

                {/* 2. Stress Test Overspend Button */}
                <button
                  type="button"
                  id="btn-simulate-overspend"
                  className="btn-rpg-action btn-overspend"
                  onClick={handleSimulateOverspend}
                >
                  <AlertTriangle size={16} className="btn-action-icon" />
                  <div className="btn-label-stack">
                    <span className="main-action-text">Stress Test Budget (Overspend)</span>
                    <span className="sub-action-text">
                      Armor Mitigates Damage • Vitality Strained
                    </span>
                  </div>
                </button>
              </div>

              {/* Discipline & Prestige Benchmark Controller */}
              <div className="streak-growth-dock">
                <div className="streak-growth-header">
                  <span className="streak-growth-title">
                    DISCIPLINE & PRESTIGE BENCHMARK
                  </span>
                  <span className="streak-current-readout font-mono">
                    Day {gameState.streakDays} • Tier: {currentTier.title}
                  </span>
                </div>

                <div className="streak-presets-grid">
                  <button
                    type="button"
                    className={`btn-streak-preset ${gameState.streakDays <= 2 ? 'active-preset' : ''}`}
                    onClick={() => handleSetStreak(1)}
                    title="Set to Day 1 (The Aspirant)"
                  >
                    <span>⚡ Aspirant (1d)</span>
                  </button>

                  <button
                    type="button"
                    className={`btn-streak-preset ${gameState.streakDays >= 3 && gameState.streakDays <= 5 ? 'active-preset' : ''}`}
                    onClick={() => handleSetStreak(4)}
                    title="Set to Day 4 (The Tactician)"
                  >
                    <span>🎯 Tactician (4d)</span>
                  </button>

                  <button
                    type="button"
                    className={`btn-streak-preset ${gameState.streakDays >= 6 && gameState.streakDays <= 9 ? 'active-preset' : ''}`}
                    onClick={() => handleSetStreak(7)}
                    title="Set to Day 7 (The Vanguard)"
                  >
                    <span>🛡️ Vanguard (7d)</span>
                  </button>

                  <button
                    type="button"
                    className={`btn-streak-preset ${gameState.streakDays >= 10 && gameState.streakDays <= 15 ? 'active-preset' : ''}`}
                    onClick={() => handleSetStreak(14)}
                    title="Set to Day 14 (The Sentinel)"
                  >
                    <span>⚔️ Sentinel (14d)</span>
                  </button>

                  <button
                    type="button"
                    className={`btn-streak-preset ${gameState.streakDays >= 16 ? 'active-preset' : ''}`}
                    onClick={() => handleSetStreak(21)}
                    title="Set to Day 21+ (The Sovereign)"
                  >
                    <span>👑 Sovereign (21d+)</span>
                  </button>
                </div>

                <div className="streak-stepper-row">
                  <button
                    type="button"
                    className="btn-stepper btn-stepper-minus"
                    onClick={() => handleSetStreak(Math.max(0, gameState.streakDays - 1))}
                    title="Decrease Streak by 1 Day"
                  >
                    <Minus size={13} />
                    <span>-1 Day</span>
                  </button>

                  <button
                    type="button"
                    className="btn-stepper btn-stepper-plus"
                    onClick={() => handleSetStreak(gameState.streakDays + 1)}
                    title="Increase Streak by 1 Day"
                  >
                    <Plus size={13} />
                    <span>+1 Day</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FinancialAvatarWidget;
