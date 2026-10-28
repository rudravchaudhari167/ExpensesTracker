import React from 'react';
import { Sparkles } from 'lucide-react';
import { getCurrentMonthFormatted } from '../../utils/date';
import './HeroBanner.css';

export function HeroBanner({ totalTransactions = 0, balance = 0, currency = 'USD' }) {
  const currentMonth = getCurrentMonthFormatted();

  return (
    <div className="hero-banner-container card-surface animate-fade-in">
      <div className="hero-banner-content">
        <div className="hero-tag-wrapper">
          <span className="hero-tag-pill">
            <Sparkles size={13} className="hero-tag-icon" />
            <span>Pennywise Editorial</span>
          </span>
          <span className="hero-month-pill">{currentMonth}</span>
        </div>

        <h2 className="hero-title font-serif">
          Keep your finances in a steady, intentional rhythm.
        </h2>

        <p className="hero-subtitle">
          {totalTransactions === 0
            ? 'Your ledger is clean and ready. Use the "+ Add transaction" button in the header to start mapping your spending rhythm.'
            : `Tracking ${totalTransactions} verified entries against your Spring Boot & MySQL ledger.`}
        </p>
      </div>

      <div className="hero-banner-graphic" aria-hidden="true">
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="hero-rhythm-svg">
          <path
            d="M10 120 C 40 140, 70 60, 100 90 C 130 120, 160 30, 190 50"
            stroke="#E87952"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M10 120 C 40 140, 70 60, 100 90 C 130 120, 160 30, 190 50 L 190 160 L 10 160 Z"
            fill="url(#rhythm-gradient)"
            opacity="0.15"
          />
          <circle cx="100" cy="90" r="6" fill="#B95337" />
          <circle cx="190" cy="50" r="7" fill="#E87952" />
          <defs>
            <linearGradient id="rhythm-gradient" x1="100" y1="30" x2="100" y2="160" gradientUnits="userSpaceOnUse">
              <stop stopColor="#E87952" />
              <stop offset="1" stopColor="#E87952" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

export default HeroBanner;
