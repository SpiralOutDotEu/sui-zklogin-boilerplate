import React from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface StatusIndicatorProps {
  /** Status type determining color and animation */
  status: 'success' | 'error' | 'warning' | 'info' | 'loading';
  /** Text to display next to the indicator */
  text: string;
  /** Additional CSS classes */
  className?: string;
  /** Size of the indicator dot */
  size?: 'sm' | 'md' | 'lg';
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STYLES = {
  container: 'flex items-center gap-2',
  dot: 'rounded-full',
  dotSm: 'w-2 h-2',
  dotMd: 'w-3 h-3',
  dotLg: 'w-4 h-4',
  dotSuccess: 'bg-green-500',
  dotError: 'bg-red-500',
  dotWarning: 'bg-yellow-500',
  dotInfo: 'bg-blue-500',
  dotLoading: 'bg-gray-500 animate-pulse',
  text: 'text-xs',
  textSuccess: 'text-green-400',
  textError: 'text-red-400',
  textWarning: 'text-yellow-400',
  textInfo: 'text-blue-400',
  textLoading: 'text-gray-400',
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * StatusIndicator Component
 *
 * A visual indicator that shows status with a colored dot and text.
 * Used throughout the application for consistent status display.
 *
 * @param props - Component props
 * @returns JSX element
 */
export default function StatusIndicator({
  status,
  text,
  className = '',
  size = 'md',
}: StatusIndicatorProps) {
  // ============================================================================
  // RENDER
  // ============================================================================

  const dotSizeClass =
    STYLES[`dot${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof STYLES];
  const dotColorClass =
    STYLES[`dot${status.charAt(0).toUpperCase() + status.slice(1)}` as keyof typeof STYLES];
  const textColorClass =
    STYLES[`text${status.charAt(0).toUpperCase() + status.slice(1)}` as keyof typeof STYLES];

  return (
    <div className={`${STYLES.container} ${className}`}>
      <div className={`${STYLES.dot} ${dotSizeClass} ${dotColorClass}`}></div>
      <span className={`${STYLES.text} ${textColorClass}`}>{text}</span>
    </div>
  );
}
