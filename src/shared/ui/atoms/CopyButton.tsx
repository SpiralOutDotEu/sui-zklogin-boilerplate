import React, { useState } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface CopyButtonProps {
  /** Text to copy to clipboard */
  text: string;
  /** Button label */
  label?: string;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Callback when copy is successful */
  onCopy?: () => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STYLES = {
  button: 'flex items-center gap-2 transition-colors rounded',
  buttonPrimary: 'px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs',
  buttonSecondary: 'px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-sm',
  buttonGhost: 'px-2 py-1 text-white/60 hover:text-white text-xs',
  buttonSm: 'px-2 py-1 text-xs',
  buttonMd: 'px-3 py-1 text-sm',
  buttonLg: 'px-4 py-2 text-base',
  icon: 'transition-transform',
  iconCopied: 'scale-110',
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * CopyButton Component
 *
 * A button that copies text to clipboard and provides visual feedback.
 * Used throughout the application for copying addresses, hashes, etc.
 *
 * @param props - Component props
 * @returns JSX element
 */
export default function CopyButton({
  text,
  label = 'Copy',
  variant = 'primary',
  size = 'md',
  className = '',
  onCopy,
}: CopyButtonProps) {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================

  const [copied, setCopied] = useState(false);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopy?.();

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Copy failed - user will see the error state
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  const buttonVariantClass =
    STYLES[`button${variant.charAt(0).toUpperCase() + variant.slice(1)}` as keyof typeof STYLES];
  const buttonSizeClass =
    STYLES[`button${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof STYLES];
  const iconClass = `${STYLES.icon} ${copied ? STYLES.iconCopied : ''}`;

  return (
    <button
      onClick={handleCopy}
      className={`${STYLES.button} ${buttonVariantClass} ${buttonSizeClass} ${className}`}
      title={copied ? 'Copied!' : `Copy ${text}`}
    >
      <span className={iconClass}>{copied ? '✓' : '📋'}</span>
      <span>{copied ? 'Copied!' : label}</span>
    </button>
  );
}
