import React from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface PanelProps {
  /** Panel content */
  children: React.ReactNode;
  /** Panel variant */
  variant?: 'glass' | 'solid' | 'outline';
  /** Panel size */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Panel padding */
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /** Panel border radius */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  /** Additional CSS classes */
  className?: string;
  /** Panel background opacity */
  opacity?: 'low' | 'medium' | 'high';
  /** Panel border style */
  border?: 'none' | 'subtle' | 'visible' | 'strong';
  /** Panel hover effects */
  hover?: boolean;
  /** Panel click handler */
  onClick?: () => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_VARIANT = 'glass' as const;
const DEFAULT_SIZE = 'md' as const;
const DEFAULT_PADDING = 'md' as const;
const DEFAULT_ROUNDED = '2xl' as const;
const DEFAULT_OPACITY = 'medium' as const;
const DEFAULT_BORDER = 'subtle' as const;
const DEFAULT_HOVER = false as const;
const DEFAULT_CLASSNAME = '' as const;

const STYLES = {
  // Base panel styles
  panel: 'transition-all duration-200',

  // Variants
  glass: 'glass-effect',
  solid: 'bg-white/20',
  outline: 'bg-transparent border-2 border-white/30',

  // Sizes
  sm: 'p-3',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-12',

  // Padding overrides
  paddingNone: 'p-0',
  paddingSm: 'p-3',
  paddingMd: 'p-6',
  paddingLg: 'p-8',
  paddingXl: 'p-12',

  // Border radius
  roundedNone: 'rounded-none',
  roundedSm: 'rounded-sm',
  roundedMd: 'rounded-md',
  roundedLg: 'rounded-lg',
  roundedXl: 'rounded-xl',
  rounded2xl: 'rounded-2xl',
  rounded3xl: 'rounded-3xl',

  // Opacity variants
  opacityLow: 'bg-white/5',
  opacityMedium: 'bg-white/10',
  opacityHigh: 'bg-white/20',

  // Border styles
  borderNone: 'border-0',
  borderSubtle: 'border border-white/20',
  borderVisible: 'border border-white/40',
  borderStrong: 'border-2 border-white/60',

  // Hover effects
  hover: 'hover:bg-white/15 hover:scale-[1.02] hover:shadow-lg',
  clickable: 'cursor-pointer',
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Panel Component
 *
 * A reusable panel component with glass morphism effects and consistent styling.
 * Provides various variants, sizes, and styling options for creating consistent
 * UI panels across the application.
 *
 * @param props - Component props
 * @returns JSX element
 */
export default function Panel({
  children,
  variant = DEFAULT_VARIANT,
  size = DEFAULT_SIZE,
  padding = DEFAULT_PADDING,
  rounded = DEFAULT_ROUNDED,
  className = DEFAULT_CLASSNAME,
  opacity = DEFAULT_OPACITY,
  border = DEFAULT_BORDER,
  hover = DEFAULT_HOVER,
  onClick,
}: PanelProps) {
  // ============================================================================
  // STYLE COMPUTATION
  // ============================================================================

  const getVariantClass = (): string => {
    switch (variant) {
      case 'glass':
        return STYLES.glass;
      case 'solid':
        return opacity === 'low'
          ? STYLES.opacityLow
          : opacity === 'high'
            ? STYLES.opacityHigh
            : STYLES.opacityMedium;
      case 'outline':
        return STYLES.outline;
      default:
        return STYLES.glass;
    }
  };

  const getSizeClass = (): string => {
    if (padding !== 'md') {
      switch (padding) {
        case 'none':
          return STYLES.paddingNone;
        case 'sm':
          return STYLES.paddingSm;
        case 'lg':
          return STYLES.paddingLg;
        case 'xl':
          return STYLES.paddingXl;
        default:
          return STYLES.paddingMd;
      }
    }

    switch (size) {
      case 'sm':
        return STYLES.sm;
      case 'lg':
        return STYLES.lg;
      case 'xl':
        return STYLES.xl;
      default:
        return STYLES.md;
    }
  };

  const getRoundedClass = (): string => {
    switch (rounded) {
      case 'none':
        return STYLES.roundedNone;
      case 'sm':
        return STYLES.roundedSm;
      case 'md':
        return STYLES.roundedMd;
      case 'lg':
        return STYLES.roundedLg;
      case 'xl':
        return STYLES.roundedXl;
      case '3xl':
        return STYLES.rounded3xl;
      default:
        return STYLES.rounded2xl;
    }
  };

  const getBorderClass = (): string => {
    if (variant === 'outline') return '';

    switch (border) {
      case 'none':
        return STYLES.borderNone;
      case 'visible':
        return STYLES.borderVisible;
      case 'strong':
        return STYLES.borderStrong;
      default:
        return STYLES.borderSubtle;
    }
  };

  const getHoverClass = (): string => {
    if (!hover) return '';
    return `${STYLES.hover} ${onClick ? STYLES.clickable : ''}`;
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  const panelClasses = [
    STYLES.panel,
    getVariantClass(),
    getSizeClass(),
    getRoundedClass(),
    getBorderClass(),
    getHoverClass(),
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={panelClasses} onClick={onClick}>
      {children}
    </div>
  );
}
