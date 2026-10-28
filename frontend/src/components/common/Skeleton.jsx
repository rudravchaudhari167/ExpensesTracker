import React from 'react';
import './Skeleton.css';

export function Skeleton({ width = '100%', height = '20px', borderRadius = 'var(--radius-sm)', className = '' }) {
  return (
    <div
      className={`skeleton-box animate-shimmer ${className}`}
      style={{ width, height, borderRadius }}
    />
  );
}

export function SummaryCardsSkeleton() {
  return (
    <div className="summary-cards-grid">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="card-surface summary-skeleton-card">
          <div className="skeleton-card-top">
            <Skeleton width="90px" height="16px" />
            <Skeleton width="36px" height="36px" borderRadius="50%" />
          </div>
          <Skeleton width="140px" height="36px" borderRadius="var(--radius-sm)" />
          <div style={{ marginTop: '14px' }}>
            <Skeleton width="70%" height="14px" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
