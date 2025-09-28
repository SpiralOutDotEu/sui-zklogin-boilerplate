import React from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Color variant */
  variant?: 'primary' | 'secondary' | 'white' | 'gray';
  /** Additional CSS classes */
  className?: string;
  /** Text to display next to spinner */
  text?: string;
  /** Whether to show text inline or below */
  textPosition?: 'inline' | 'below';
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STYLES = {
  container: 'flex items-center',
  containerBelow: 'flex flex-col items-center gap-2',
  spinner: 'border-2 rounded-full animate-spin',
  spinnerSm: 'w-4 h-4',
  spinnerMd: 'w-6 h-6',
  spinnerLg: 'w-8 h-8',
  spinnerXl: 'w-12 h-12',
  spinnerPrimary: 'border-white/30 border-t-white',
  spinnerSecondary: 'border-blue-300 border-t-blue-600',
  spinnerWhite: 'border-white/30 border-t-white',
  spinnerGray: 'border-gray-300 border-t-gray-600',
  text: 'text-sm',
  textPrimary: 'text-white',
  textSecondary: 'text-blue-600',
  textWhite: 'text-white',
  textGray: 'text-gray-600',
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * LoadingSpinner Component
 *
 * A customizable loading spinner with different sizes and colors.
 * Used throughout the application for loading states.
 *
 * @param props - Component props
 * @returns JSX element
 */
export default function LoadingSpinner({
  size = 'md',
  variant = 'primary',
  className = '',
  text,
  textPosition = 'inline',
}: LoadingSpinnerProps) {
  // ============================================================================
  // RENDER
  // ============================================================================

  const sizeClass =
    STYLES[`spinner${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof STYLES];
  const colorClass =
    STYLES[`spinner${variant.charAt(0).toUpperCase() + variant.slice(1)}` as keyof typeof STYLES];
  const textColorClass =
    STYLES[`text${variant.charAt(0).toUpperCase() + variant.slice(1)}` as keyof typeof STYLES];
  const containerClass = textPosition === 'below' ? STYLES.containerBelow : STYLES.container;

  const spinner = (
    <div className={`${STYLES.spinner} ${sizeClass} ${colorClass} ${className}`}></div>
  );

  if (!text) {
    return spinner;
  }

  return (
    <div className={containerClass}>
      {textPosition === 'inline' && spinner}
      <span className={`${STYLES.text} ${textColorClass}`}>{text}</span>
      {textPosition === 'below' && spinner}
    </div>
  );
}
