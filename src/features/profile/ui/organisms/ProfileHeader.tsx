import React from 'react';
import { Avatar } from '@/shared/ui/atoms';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ProfileHeaderProps {
  /** User account address */
  address: string;
  /** User email from JWT */
  email?: string;
  /** Avatar size */
  avatarSize?: number;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STYLES = {
  container: 'text-center space-y-4',
  headerContent: 'flex items-center justify-center gap-4 mb-4',
  avatar: 'ring-4 ring-white/20',
  titleContainer: 'text-left',
  title: 'text-4xl font-bold gradient-text',
  subtitle: 'text-white/70 text-sm',
  description: 'text-white/70',
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * ProfileHeader Component
 *
 * Displays profile header with avatar, title, and user information.
 * Used in profile pages to show user identity.
 *
 * @param props - Component props
 * @returns JSX element
 */
export default function ProfileHeader({
  address,
  email,
  avatarSize = 64,
  className = '',
}: ProfileHeaderProps) {
  // ============================================================================
  // RENDER
  // ============================================================================

  const displayName = email?.split('@')[0] || 'User';

  return (
    <div className={`${STYLES.container} ${className}`}>
      <div className={STYLES.headerContent}>
        <Avatar address={address} size={avatarSize} variant='square' className={STYLES.avatar} />
        <div className={STYLES.titleContainer}>
          <h1 className={STYLES.title}>Profile</h1>
          <p className={STYLES.subtitle}>Welcome back, {displayName}</p>
        </div>
      </div>
      <p className={STYLES.description}>Manage your Sui zkLogin account and assets</p>
    </div>
  );
}
