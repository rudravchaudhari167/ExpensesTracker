import React from 'react';
import '@originkit/avatars/element';
import './HeroBanner.css';

export function HeroBanner({ totalTransactions = 0, balance = 0, currency = 'INR' }) {
  return (
    <div className="pennywise-hero-card">
      <div className="hero-text-side">
        <h2 className="hero-main-title">Welcome back!</h2>
        <p className="hero-main-subtitle">
          Track your expenses, stay on budget, and make every rupee count. 🌿
        </p>
      </div>

      <div className="hero-character-side" aria-hidden="true">
        {/* Soft background glow */}
        <div className="character-aura-glow" />

        {/* Playful Doodles & Sparkles */}
        <span className="hero-sparkle sparkle-1">✦</span>
        <span className="hero-sparkle sparkle-2">★</span>
        <span className="hero-sparkle sparkle-3">✦</span>
        <span className="hero-doodle-loop doodle-left">
          <svg width="40" height="30" viewBox="0 0 40 30" fill="none">
            <path d="M5 25C15 28 25 10 15 5C5 0 2 15 20 20C32 23 38 18 36 10" stroke="#E58448" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          </svg>
        </span>
        <span className="hero-doodle-loop doodle-right">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path d="M10 5L12 12L19 14L12 16L10 23L8 16L1 14L8 12Z" fill="#F8C76A" opacity="0.8" />
          </svg>
        </span>

        {/* OriginKit Interactive 3D Avatar */}
        <div className="character-img-wrapper">
          <originkit-avatar
            type="mallows"
            name="Momo"
            overrides='{"type":0.8333,"face":0.4583,"eyes":0.5,"pose":0.375,"color:tint":11818080,"color:colour":12775128}'
            size="96"
          ></originkit-avatar>
        </div>
      </div>
    </div>
  );
}

export default HeroBanner;
