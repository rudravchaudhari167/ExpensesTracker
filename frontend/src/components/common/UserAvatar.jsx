import React, { useMemo } from 'react';
import { createAvatar } from '@originkit/avatars';

/**
 * UserAvatar - Ultra-high-performance OriginKit Vector Avatar.
 * Uses createAvatar to render pure vector SVG with 0 WebGL overhead,
 * ensuring 60-120fps buttery smooth performance on mobile and desktop.
 */
export function UserAvatar({
  size = 40,
  name = 'Momo#7',
  user,
  overrides = { face: 0.0417, pose: 0.375 },
  className = '',
}) {
  const avatarName = (user && user.id) ? user.id : name;

  const dataUri = useMemo(() => {
    try {
      const svg = createAvatar('mallows', avatarName, overrides);
      return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    } catch (err) {
      console.warn('Failed to generate avatar SVG:', err);
      return '';
    }
  }, [avatarName, JSON.stringify(overrides)]);

  return (
    <span
      className={className}
      style={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        userSelect: 'none',
      }}
      role="img"
      aria-label="User Avatar"
    >
      <img
        src={dataUri}
        alt="User Avatar"
        width={size}
        height={size}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          objectFit: 'contain',
        }}
        loading="lazy"
        draggable={false}
      />
    </span>
  );
}

export default UserAvatar;
