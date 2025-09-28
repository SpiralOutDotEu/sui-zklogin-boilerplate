/**
 * BalanceCard Component
 *
 * A molecule component that displays account balance with integrated faucet functionality.
 * Shows current SUI balance, loading states, and provides a faucet button for requesting test tokens.
 * Part of the atomic design system - handles complete balance display and management.
 */

import React from 'react';
import { FaucetButton } from './FaucetButton';
import { Panel } from '@/shared/ui';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface BalanceCardProps {
  /** User's Sui address */
  address: string;
  /** Current balance in SUI (as string) */
  balance?: string | null;
  /** Whether balance is currently loading */
  balanceLoading?: boolean;
  /** Callback when faucet request completes (success or error) */
  onFaucetComplete?: (success: boolean) => void;
  /** Custom title for the balance section */
  title?: string;
  /** Whether to show the faucet button */
  showFaucet?: boolean;
  /** Panel variant */
  variant?: 'glass' | 'solid' | 'outline';
  /** Panel size */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STYLES = {
  container: 'bg-white/5 rounded-xl p-4',
  content: 'flex items-center justify-between',
  balanceSection: 'flex-1',
  title: 'text-sm font-semibold text-white/80 mb-2',
  balanceDisplay: 'text-white/90 font-mono text-lg mb-3',
  balanceLoading: 'flex items-center gap-2',
  balanceError: 'text-red-400 text-sm',
  balanceEmpty: 'text-white/60 text-sm',
  faucetSection: 'ml-4',
} as const;

const TEXT = {
  defaultTitle: 'Account Balance',
  loadingText: 'Loading...',
  errorText: 'Error',
  emptyText: '-- SUI',
  balanceSuffix: ' SUI',
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * BalanceCard Component
 *
 * A molecule component that displays account balance with integrated faucet functionality.
 * Shows current SUI balance, loading states, and provides a faucet button for requesting test tokens.
 *
 * @param props - Component props
 * @returns JSX element
 */
export function BalanceCard({
  address,
  balance,
  balanceLoading = false,
  onFaucetComplete,
  title = TEXT.defaultTitle,
  showFaucet = true,
  variant = 'glass',
  size = 'md',
  className = '',
}: BalanceCardProps) {
  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderBalance = () => {
    if (balanceLoading) {
      return (
        <div className={STYLES.balanceLoading}>
          <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
          <span className='text-sm'>{TEXT.loadingText}</span>
        </div>
      );
    }

    if (balance === 'Error' || balance === null) {
      return <span className={STYLES.balanceError}>{TEXT.errorText}</span>;
    }

    if (!balance || balance === '0.000000') {
      return <span className={STYLES.balanceEmpty}>{TEXT.emptyText}</span>;
    }

    return (
      <span className={STYLES.balanceDisplay}>
        {balance}
        {TEXT.balanceSuffix}
      </span>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`${STYLES.container} ${className}`}>
      <div className={STYLES.content}>
        <div className={STYLES.balanceSection}>
          <h3 className={STYLES.title}>{title}</h3>
          <div className={STYLES.balanceDisplay}>{renderBalance()}</div>
        </div>

        {showFaucet && (
          <div className={STYLES.faucetSection}>
            <FaucetButton
              address={address}
              variant='hero'
              size='sm'
              buttonText='Get Test SUI'
              onComplete={onFaucetComplete}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default BalanceCard;
