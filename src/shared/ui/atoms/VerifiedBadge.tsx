import React from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface VerifiedBadgeProps {
  /** Badge text */
  text?: string;
  /** Badge variant */
  variant?: 'success' | 'warning' | 'info' | 'error';
  /** Badge size */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Whether to show checkmark icon */
  showIcon?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STYLES = {
  badge: 'inline-flex items-center gap-1 rounded font-medium',
  badgeSm: 'px-2 py-1 text-xs',
  badgeMd: 'px-3 py-1 text-sm',
  badgeLg: 'px-4 py-2 text-base',
  badgeSuccess: 'bg-green-500/20 text-green-300 border border-green-500/30',
  badgeWarning: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
  badgeInfo: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  badgeError: 'bg-red-500/20 text-red-300 border border-red-500/30',
  icon: 'text-xs',
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * VerifiedBadge Component
 *
 * A status badge that indicates verification or status.
 * Used throughout the application for showing verified states.
 *
 * @param props - Component props
 * @returns JSX element
 */
export default function VerifiedBadge({
  text = 'Verified',
  variant = 'success',
  size = 'sm',
  className = '',
  showIcon = true,
}: VerifiedBadgeProps) {
  // ============================================================================
  // RENDER
  // ============================================================================

  const sizeClass =
    STYLES[`badge${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof STYLES];
  const variantClass =
    STYLES[`badge${variant.charAt(0).toUpperCase() + variant.slice(1)}` as keyof typeof STYLES];

  return (
    <span className={`${STYLES.badge} ${sizeClass} ${variantClass} ${className}`}>
      {showIcon && <span className={STYLES.icon}>✓</span>}
      <span>{text}</span>
    </span>
  );
}
