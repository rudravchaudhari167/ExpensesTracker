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
  1: 'Novice Sproutling',
  2: 'Budget Apprentice',
  3: 'Coin Sentry',
  4: 'Budget Knight',
  5: 'Vault Warden',
  6: 'Wealth Paladin',
  7: 'Financial Sovereign',
};

// Child Character Growth Stages according to streak days
export const GROWTH_STAGES = [
  {
    maxStreak: 2,
    stage: 1,
    title: 'Sproutling Baby',
    subtitle: 'Child Stage 1: Innocent Seedling',
    ageLabel: 'Baby Child',
    icon: '🌱',
    badgeClass: 'stage-baby',
  },
  {
    maxStreak: 5,
    stage: 2,
    title: 'Toddler Explorer',
    subtitle: 'Child Stage 2: Curious Sprout',
    ageLabel: 'Toddler Child',
    icon: '🧒',
    badgeClass: 'stage-toddler',
  },
  {
    maxStreak: 9,
    stage: 3,
    title: 'Youth Knight',
    subtitle: 'Child Stage 3: Disciplined Kid',
    ageLabel: 'Youth Guardian',
    icon: '🛡️',
    badgeClass: 'stage-youth',
  },
  {
    maxStreak: 15,
    stage: 4,
    title: 'Champion Protector',
    subtitle: 'Child Stage 4: Adolescent Guardian',
    ageLabel: 'Heroic Youth',
    icon: '⚔️',
    badgeClass: 'stage-champion',
  },
  {
    maxStreak: Infinity,
    stage: 5,
    title: 'Ascended Titan',
    subtitle: 'Child Stage 5: Crowned Grand Guardian',
    ageLabel: 'Elder Spirit',
    icon: '👑',
    badgeClass: 'stage-titan',
  },
];

const DEFAULT_STATE = {
  level: 1,
  hp: 90,
  maxHp: 100,
  xp: 120,
  xpForNextLevel: 250,
  streakDays: 1, // Starts as 1 day so he is initially a cute child cartoon!
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

  // 4. Growth Stage based on Streak Days (starts as a child and grows with streak)
  const growthStage = useMemo(() => {
    const streak = Math.max(0, gameState.streakDays);
    return GROWTH_STAGES.find((s) => streak <= s.maxStreak) || GROWTH_STAGES[0];
  }, [gameState.streakDays]);

  // 5. Dynamic Child Cartoon Scale: Starts small (~0.70x at streak 0-1) and grows up to 1.32x as streak increases
  const childScale = useMemo(() => {
    const s = Math.max(0, gameState.streakDays);
    // Smooth growth formula: 0.70 at s=0, 0.78 at s=1, 0.90 at s=3, 1.02 at s=6, 1.18 at s=12, 1.32 at s=20+
    const scale = 0.70 + Math.min(0.62, Math.sqrt(s) * 0.138);
    return Number(scale.toFixed(2));
  }, [gameState.streakDays]);

  // Interactive Streak Controller: Quick one-click testing of all child growth stages!
  const handleSetStreak = (newStreak) => {
    const s = Math.max(0, newStreak);
    setGameState((prev) => ({
      ...prev,
      streakDays: s,
    }));

    const scale = Number((0.70 + Math.min(0.62, Math.sqrt(s) * 0.138)).toFixed(2));

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
      colors: ['#10B981', '#34D399', '#FBBF24'],
    });

    const notifId = Date.now();
    setFloatingNotification({
      id: notifId,
      text: `Streak: ${s} Days`,
      subtext: `Cartoon Child Size: ${Math.round(scale * 100)}% 🌱`,
      type: 'heal',
    });
    setTimeout(() => setFloatingNotification(null), 1800);

    if (onShowToast) {
      onShowToast(
        'info',
        `Streak set to ${s} days. Cartoon child size scaled to ${Math.round(scale * 100)}%!`,
        'Growth Updated 🌱'
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

    // Dynamic XP calculation using active Savings Buff!
    const baseBonusXp = 100;
    const buffBonusXp = Math.round(baseBonusXp * (savingsBuff / 100));
    const totalGainedXp = baseBonusXp + buffBonusXp;

    const nextStreak = gameState.streakDays + 1;
    const nextScale = Number((0.70 + Math.min(0.62, Math.sqrt(nextStreak) * 0.138)).toFixed(2));

    // Show floating notification with active buff & growth details
    const notifId = Date.now();
    setFloatingNotification({
      id: notifId,
      text: `Streak Day ${nextStreak}! (+${totalGainedXp} XP)`,
      subtext: `Cartoon Child Grew: ${Math.round(nextScale * 100)}% 🌱`,
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

              {/* Top Floating Growth Stage & Size Indicator */}
              <div className="avatar-growth-pill animate-fade-in">
                <span className="growth-icon">{growthStage.icon}</span>
                <div className="growth-pill-text">
                  <span className="growth-title">{growthStage.title}</span>
                  <span className="growth-sub font-mono">
                    Streak: {gameState.streakDays}d • Size: {Math.round(childScale * 100)}%
                  </span>
                </div>
              </div>

              {/* Ambient Circular Runic Dial & Pedestal (grows subtly with streak) */}
              <div
                className="avatar-mystic-pedestal"
                style={{
                  transform: `scale(${0.82 + Math.min(0.38, gameState.streakDays * 0.02)})`,
                }}
                aria-hidden="true"
              >
                <div className="pedestal-ring ring-outer" />
                <div className="pedestal-ring ring-inner" />
                <div className="pedestal-glow-spot" />
              </div>

              {/* Animated Cartoon Child Character (Dynamically scales with streak!) */}
              <div
                className="vector-avatar-wrapper"
                style={{ transform: `scale(${childScale})` }}
              >
                <svg
                  viewBox="0 0 240 240"
                  className="child-avatar-svg"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    {/* Warm Peach Child Skin */}
                    <linearGradient id="childSkinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#FFF1E6" />
                      <stop offset="60%" stopColor="#FED7AA" />
                      <stop offset="100%" stopColor="#FDBA74" />
                    </linearGradient>

                    {/* Anime Sprout Hair */}
                    <linearGradient id="childHairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4ADE80" />
                      <stop offset="40%" stopColor="#16A34A" />
                      <stop offset="100%" stopColor="#14532D" />
                    </linearGradient>

                    {/* Vibrant Overalls Green */}
                    <linearGradient id="overallGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#22C55E" />
                      <stop offset="70%" stopColor="#15803D" />
                      <stop offset="100%" stopColor="#14532D" />
                    </linearGradient>

                    {/* Golden Leaf Horns / Crown */}
                    <linearGradient id="goldenHornGrad" x1="0%" y1="0%" x2="100%" y2="100%">
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
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Ethereal Aura Rings (Radiates more brightly with higher streak) */}
                  <g className="avatar-halo-orbit">
                    <circle
                      cx="120"
                      cy="120"
                      r="88"
                      fill="none"
                      stroke="#A7F3D0"
                      strokeWidth="1.5"
                      strokeDasharray="6 8"
                      opacity={0.4 + Math.min(0.5, gameState.streakDays * 0.03)}
                    />
                    <circle
                      cx="120"
                      cy="120"
                      r="104"
                      fill="none"
                      stroke="#FDE68A"
                      strokeWidth="1.2"
                      strokeDasharray="4 12"
                      opacity={0.3 + Math.min(0.5, gameState.streakDays * 0.03)}
                    />
                  </g>

                  {/* Cartoon Child Character */}
                  <g className="cartoon-child-group">
                    {/* Dynamic Ground Shadow */}
                    <ellipse
                      cx="120"
                      cy="216"
                      rx={36 + Math.min(22, gameState.streakDays * 1.3)}
                      ry="8"
                      fill="rgba(40, 40, 32, 0.12)"
                    />

                    {/* Cute Toddler Leather Boots */}
                    <g className="child-boots">
                      {/* Left Boot */}
                      <path
                        d="M96 196 Q92 214 100 215 Q112 215 112 204 Q112 196 102 196 Z"
                        fill="#854D0E"
                      />
                      <circle cx="104" cy="204" r="2.2" fill="#FBBF24" />

                      {/* Right Boot */}
                      <path
                        d="M128 196 Q128 214 140 215 Q148 215 144 204 Q144 196 134 196 Z"
                        fill="#854D0E"
                      />
                      <circle cx="136" cy="204" r="2.2" fill="#FBBF24" />
                    </g>

                    {/* Chubby Toddler Legs */}
                    <rect x="98" y="174" width="14" height="26" rx="7" fill="#15803D" />
                    <rect x="128" y="174" width="14" height="26" rx="7" fill="#15803D" />

                    {/* Chubby Child Overalls & Torso */}
                    <path
                      d="M94 136 C94 128, 146 128, 146 136 L150 182 C150 190, 90 190, 90 182 Z"
                      fill="url(#overallGrad)"
                      filter="drop-shadow(0 4px 8px rgba(20, 83, 45, 0.2))"
                    />

                    {/* Inner Pastel Cream Shirt */}
                    <path
                      d="M104 126 C104 122, 136 122, 136 126 L138 138 L102 138 Z"
                      fill="#FEF3C7"
                    />

                    {/* Overalls Straps & Brass Buttons */}
                    <line
                      x1="102"
                      y1="126"
                      x2="102"
                      y2="148"
                      stroke="#14532D"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                    <circle cx="102" cy="146" r="2.8" fill="#FBBF24" />

                    <line
                      x1="138"
                      y1="126"
                      x2="138"
                      y2="148"
                      stroke="#14532D"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                    <circle cx="138" cy="146" r="2.8" fill="#FBBF24" />

                    {/* Front Kangaroo Pocket with Gold Coin Peeking Out */}
                    <path
                      d="M106 154 L134 154 L130 170 L110 170 Z"
                      fill="#14532D"
                      opacity="0.85"
                    />
                    <circle cx="120" cy="155" r="3.5" fill="#FBBF24" />
                    <text
                      x="120"
                      y="157.5"
                      fontSize="4.5"
                      textAnchor="middle"
                      fill="#78350F"
                      fontWeight="bold"
                    >
                      ₹
                    </text>

                    {/* Discipline Core Gem on Chest */}
                    <polygon
                      points="120,132 126,140 120,148 114,140"
                      fill={avatarMood === 'hurt' ? 'url(#gemHurtGrad)' : 'url(#gemGrad)'}
                      filter="url(#softGlow)"
                      className="discipline-crystal-gem"
                    />

                    {/* Left Arm: Cute arm holding miniature leaf shield */}
                    <g className="child-left-arm">
                      <path
                        d="M92 136 Q74 150 82 166"
                        stroke="#15803D"
                        strokeWidth="10"
                        strokeLinecap="round"
                        fill="none"
                      />
                      <ellipse
                        cx="80"
                        cy="166"
                        rx="8"
                        ry="10.5"
                        fill="#FDE047"
                        stroke="#166534"
                        strokeWidth="1.8"
                      />
                      <path
                        d="M80 159 L80 173 M74 166 L86 166"
                        stroke="#166534"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                    </g>

                    {/* Right Arm: Enthusiastic Animated Waving Hand */}
                    <g className="child-waving-arm">
                      <path
                        d="M148 136 Q162 126 166 112"
                        stroke="#FEF3C7"
                        strokeWidth="9.5"
                        strokeLinecap="round"
                        fill="none"
                      />
                      <circle cx="166" cy="112" r="6" fill="#FED7AA" />
                      <circle cx="162" cy="108" r="2.5" fill="#FED7AA" />
                    </g>

                    {/* Round Chibi Child Head */}
                    <ellipse
                      cx="120"
                      cy="92"
                      rx="46"
                      ry="42"
                      fill="url(#childSkinGrad)"
                      filter="drop-shadow(0 4px 10px rgba(40,40,32,0.08))"
                    />

                    {/* Cute Baby Ears */}
                    <ellipse cx="74" cy="94" rx="5" ry="7" fill="#FED7AA" />
                    <ellipse cx="166" cy="94" rx="5" ry="7" fill="#FED7AA" />

                    {/* Rosy Blushing Cheeks (Pulsing soft pink) */}
                    <ellipse
                      cx="90"
                      cy="102"
                      rx="8.5"
                      ry="5.5"
                      fill="#FDA4AF"
                      opacity="0.75"
                      className="child-cheeks"
                    />
                    <ellipse
                      cx="150"
                      cy="102"
                      rx="8.5"
                      ry="5.5"
                      fill="#FDA4AF"
                      opacity="0.75"
                      className="child-cheeks"
                    />

                    {/* Soft Anime Toddler Bangs / Hair Fringe */}
                    <path
                      d="M74 84 C74 54, 166 54, 166 84 C166 88, 158 80, 148 85 C138 90, 132 80, 120 83 C108 80, 102 90, 92 85 C82 80, 74 88, 74 84 Z"
                      fill="url(#childHairGrad)"
                    />

                    {/* Adaptive Sprout on Head (grows more leaves/horns as streak increases) */}
                    <g className="child-head-sprout">
                      {/* Bouncy Central Sprout Stem */}
                      <path
                        d="M120 54 Q120 36 124 26"
                        stroke="#22C55E"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        fill="none"
                      />
                      {/* Primary Baby Sprout Leaf */}
                      <path
                        d="M124 26 C116 16, 134 8, 142 16 C148 22, 138 30, 124 26 Z"
                        fill="#4ADE80"
                        className="child-sprout-leaf"
                      />

                      {/* Secondary Sprout Leaf (Unlocked at streak >= 3) */}
                      {gameState.streakDays >= 3 && (
                        <path
                          d="M123 28 C131 18, 113 10, 105 18 C99 24, 109 32, 123 28 Z"
                          fill="#86EFAC"
                          className="child-sprout-leaf-secondary"
                        />
                      )}

                      {/* Budding Golden Antlers (Unlocked at streak >= 7) */}
                      {gameState.streakDays >= 7 && (
                        <g className="child-golden-antlers">
                          <path
                            d="M96 66 C80 44, 60 38, 54 48 C48 56, 56 74, 88 74 Z"
                            fill="url(#goldenHornGrad)"
                            className="left-leaf"
                          />
                          <path
                            d="M144 66 C160 44, 180 38, 186 48 C192 56, 184 74, 152 74 Z"
                            fill="url(#goldenHornGrad)"
                            className="right-leaf"
                          />
                        </g>
                      )}

                      {/* Celestial Titan Crown (Unlocked at streak >= 14) */}
                      {gameState.streakDays >= 14 && (
                        <g className="child-titan-crown">
                          <polygon points="120,6 125,18 115,18" fill="#F59E0B" />
                          <polygon points="106,12 112,22 102,22" fill="#FBBF24" />
                          <polygon points="134,12 138,22 128,22" fill="#FBBF24" />
                          <circle cx="120" cy="18" r="2.8" fill="#FEF08A" />
                        </g>
                      )}
                    </g>

                    {/* Tiny Child Button Nose */}
                    <path
                      d="M120 100 Q121 102 120 103"
                      stroke="#D97706"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      fill="none"
                    />

                    {/* Dynamic Facial Expressions */}
                    {avatarMood === 'happy' ? (
                      /* Joyous Giggling Child Face (^ ^) */
                      <g className="face-happy animate-bounce-short">
                        <path
                          d="M95 94 Q103 85 111 94"
                          stroke="#14532D"
                          strokeWidth="3.4"
                          strokeLinecap="round"
                          fill="none"
                        />
                        <path
                          d="M129 94 Q137 85 145 94"
                          stroke="#14532D"
                          strokeWidth="3.4"
                          strokeLinecap="round"
                          fill="none"
                        />
                        {/* Open Joyous Smile showing tiny tooth */}
                        <path
                          d="M112 108 Q120 120 128 108 Z"
                          fill="#BE123C"
                        />
                        <path
                          d="M115 108 Q120 111 125 108"
                          fill="#FFFFFF"
                        />
                      </g>
                    ) : avatarMood === 'hurt' ? (
                      /* Hurt Wincing Child Face (> <) with Sweatdrop */
                      <g className="face-hurt">
                        <path
                          d="M96 90 L106 96 L96 102"
                          stroke="#991B1B"
                          strokeWidth="3.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                        <path
                          d="M144 90 L134 96 L144 102"
                          stroke="#991B1B"
                          strokeWidth="3.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                        <path
                          d="M114 112 Q120 106 126 112"
                          stroke="#991B1B"
                          strokeWidth="2.8"
                          strokeLinecap="round"
                          fill="none"
                        />
                        <circle cx="152" cy="94" r="3" fill="#67E8F9" />
                      </g>
                    ) : (
                      /* Normal Curious Sparkling Cartoon Child Eyes */
                      <g className="child-eyes-normal">
                        {/* Left Eye */}
                        <ellipse cx="102" cy="94" rx="8" ry="10.5" fill="#14532D" />
                        <ellipse cx="102" cy="95" rx="6.8" ry="8.8" fill="#15803D" />
                        <circle cx="100" cy="90" r="3.2" fill="#FFFFFF" />
                        <circle cx="105" cy="98" r="1.6" fill="#FFFFFF" />

                        {/* Right Eye */}
                        <ellipse cx="138" cy="94" rx="8" ry="10.5" fill="#14532D" />
                        <ellipse cx="138" cy="95" rx="6.8" ry="8.8" fill="#15803D" />
                        <circle cx="136" cy="90" r="3.2" fill="#FFFFFF" />
                        <circle cx="141" cy="98" r="1.6" fill="#FFFFFF" />

                        {/* Sweet Child Smile */}
                        <path
                          d="M115 108 Q120 114 125 108"
                          stroke="#15803D"
                          strokeWidth="2.4"
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
                  {avatarMood === 'happy' && 'Child Spirit Joyfully Cheering & Growing!'}
                  {avatarMood === 'hurt' && 'Child Spirit Startled by Overspend!'}
                  {avatarMood === 'levelup' && 'Ascending in Size & Discipline Rank!'}
                  {avatarMood === 'normal' && `Guarding Budget as ${growthStage.title}`}
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
                  {growthStage.title} ({growthStage.ageLabel}) • Growth Size: {Math.round(childScale * 100)}%
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

            {/* Mock Demonstration Control Buttons & Streak Growth Tester */}
            <div className="avatar-actions-dock">
              <div className="dock-header">
                <span className="dock-title">Demonstration Actions</span>
                <button
                  type="button"
                  className="btn-rest-inn"
                  onClick={handleRestAtInn}
                  title="Reset state to default child demonstration settings"
                >
                  <RefreshCw size={12} />
                  <span>Reset / Rest</span>
                </button>
              </div>

              {/* Primary Action Buttons */}
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
                    <span className="main-action-text">Simulate Good Day (+1 Streak & Grow)</span>
                    <span className="sub-action-text">
                      +{100 + Math.round(100 * (savingsBuff / 100))} XP • +5 HP • Streak +1 Day
                    </span>
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
                    <span className="sub-action-text">
                      Armor Mitigates Damage • Strains Shield
                    </span>
                  </div>
                </button>
              </div>

              {/* Streak Growth Controller Dock */}
              <div className="streak-growth-dock">
                <div className="streak-growth-header">
                  <span className="streak-growth-title">
                    STREAK & SIZE TESTER (Watch Cartoon Child Grow)
                  </span>
                  <span className="streak-current-readout font-mono">
                    Day {gameState.streakDays} • Size: {Math.round(childScale * 100)}%
                  </span>
                </div>

                <div className="streak-presets-grid">
                  <button
                    type="button"
                    className={`btn-streak-preset ${gameState.streakDays <= 2 ? 'active-preset' : ''}`}
                    onClick={() => handleSetStreak(0)}
                    title="Set to Day 0 (Baby Child - Size 70%)"
                  >
                    <span>🌱 Baby (0d)</span>
                  </button>

                  <button
                    type="button"
                    className={`btn-streak-preset ${gameState.streakDays >= 3 && gameState.streakDays <= 5 ? 'active-preset' : ''}`}
                    onClick={() => handleSetStreak(3)}
                    title="Set to Day 3 (Toddler Child - Size 85%)"
                  >
                    <span>🧒 Toddler (3d)</span>
                  </button>

                  <button
                    type="button"
                    className={`btn-streak-preset ${gameState.streakDays >= 6 && gameState.streakDays <= 9 ? 'active-preset' : ''}`}
                    onClick={() => handleSetStreak(7)}
                    title="Set to Day 7 (Youth Knight - Size 102%)"
                  >
                    <span>🛡️ Youth (7d)</span>
                  </button>

                  <button
                    type="button"
                    className={`btn-streak-preset ${gameState.streakDays >= 10 && gameState.streakDays <= 15 ? 'active-preset' : ''}`}
                    onClick={() => handleSetStreak(14)}
                    title="Set to Day 14 (Champion - Size 120%)"
                  >
                    <span>⚔️ Champ (14d)</span>
                  </button>

                  <button
                    type="button"
                    className={`btn-streak-preset ${gameState.streakDays >= 16 ? 'active-preset' : ''}`}
                    onClick={() => handleSetStreak(21)}
                    title="Set to Day 21+ (Titan - Size 132%)"
                  >
                    <span>👑 Titan (21d)</span>
                  </button>
                </div>

                <div className="streak-stepper-row">
                  <button
                    type="button"
                    className="btn-stepper btn-stepper-minus"
                    onClick={() => handleSetStreak(Math.max(0, gameState.streakDays - 1))}
                    title="Decrease Streak by 1 Day (Shrink Cartoon Size)"
                  >
                    <Minus size={13} />
                    <span>-1 Day (Shrink)</span>
                  </button>

                  <button
                    type="button"
                    className="btn-stepper btn-stepper-plus"
                    onClick={() => handleSetStreak(gameState.streakDays + 1)}
                    title="Increase Streak by 1 Day (Grow Cartoon Size)"
                  >
                    <Plus size={13} />
                    <span>+1 Day (Grow Size)</span>
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
