import React from 'react';
import { Avatar } from '@originkit/avatars/react';

/**
 * UserAvatar - Live OriginKit Avatar displayed in the top right corner of every page.
 * Uses the mallows style with custom face and pose overrides.
 */
export function UserAvatar({
  size = 40,
  name = 'Momo#7',
  user,
  overrides = { face: 0.0417, pose: 0.375 },
}) {
  const avatarName = (user && user.id) ? user.id : name;

  return (
    <Avatar
      style="mallows"
      name={avatarName}
      overrides={overrides}
      size={size}
    />
  );
}

export default UserAvatar;
