import React from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface GlassBackgroundProps {
  /** Background variant */
  variant?: 'default' | 'gradient' | 'minimal';
  /** Additional CSS classes */
  className?: string;
  /** Children to render over the background */
  children?: React.ReactNode;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_VARIANT = 'default' as const;
const DEFAULT_CLASSNAME = '' as const;

const STYLES = {
  container: 'fixed inset-0 -z-10',
  default: 'min-h-screen',
  gradient: 'min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900',
  minimal: 'min-h-screen bg-gray-900',
  effects: 'absolute inset-0',
  orb1: 'absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow',
  orb2: 'absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow delay-1000',
  orb3: 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse-slow delay-500',
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * GlassBackground Component
 *
 * Reusable glass background component with animated floating orbs:
 * - default: Animated floating orbs with glass morphism effects
 * - gradient: Simple gradient background
 * - minimal: Clean dark background
 *
 * @param props - Component props
 * @returns JSX element
 */
export default function GlassBackground({
  variant = DEFAULT_VARIANT,
  className = DEFAULT_CLASSNAME,
  children,
}: GlassBackgroundProps) {
  // ============================================================================
  // RENDER
  // ============================================================================

  const containerClasses = `${STYLES.container} ${STYLES[variant]} ${className}`;

  return (
    <div className={containerClasses}>
      {variant === 'default' && (
        <div className={STYLES.effects}>
          <div className={STYLES.orb1} />
          <div className={STYLES.orb2} />
          <div className={STYLES.orb3} />
        </div>
      )}
      {children}
    </div>
  );
}
