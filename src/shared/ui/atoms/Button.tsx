import React from 'react';
import Icon from './Icon';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'hero';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Loading state */
  loading?: boolean;
  /** Full width */
  fullWidth?: boolean;
  /** Children content */
  children: React.ReactNode;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const VARIANTS = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  ghost: 'bg-transparent hover:bg-gray-100 text-white border border-gray-300 hover:border-gray-400',
  hero: 'px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold transition-all duration-200 glow-effect hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed',
} as const;

const SIZES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Button Component - Atomic Design
 *
 * A reusable button component with consistent styling and behavior.
 *
 * @param props - Button props
 * @returns JSX element
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  // Hero variant has its own complete styling, so we don't apply base classes or size classes
  const isHeroVariant = variant === 'hero';

  const variantClasses = VARIANTS[variant];
  const sizeClasses = isHeroVariant ? '' : SIZES[size];
  const widthClasses = fullWidth ? 'w-full' : '';
  const disabledClasses = disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  const classes = isHeroVariant
    ? `${variantClasses} ${widthClasses} ${className}`.trim()
    : `${baseClasses} ${variantClasses} ${sizeClasses} ${widthClasses} ${disabledClasses} ${className}`.trim();

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading && <Icon name='spinner' size='sm' className='-ml-1 mr-2' />}
      {children}
    </button>
  );
}
