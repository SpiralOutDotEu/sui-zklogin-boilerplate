/**
 * FaucetSection Component
 *
 * An organism component that provides a complete faucet interface with balance display
 * and faucet button functionality. Can be used across different pages for consistent
 * faucet experience.
 * Part of the atomic design system - handles complete faucet interaction flow.
 */

import React, { useState, useEffect } from 'react';
import { FaucetButton } from '@/shared/ui/molecules';
import { Panel } from '@/shared/ui/atoms';
import type { SuiClient } from '@mysten/sui/client';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface FaucetSectionProps {
  /** User's Sui address */
  address: string;
  /** Sui client for balance fetching */
  client: SuiClient | null;
  /** Custom title for the section */
  title?: string;
  /** Panel variant */
  variant?: 'glass' | 'solid' | 'outline';
  /** Panel size */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Callback when balance is updated */
  onBalanceUpdate?: (balance: string) => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STYLES = {
  container: 'w-full',
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
  errorText: 'Unable to fetch',
  emptyText: '-- SUI',
  balanceSuffix: ' SUI',
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * FaucetSection Component
 *
 * An organism component that provides a complete faucet interface with balance display
 * and faucet button functionality. Handles balance fetching, faucet requests, and
 * automatic balance updates.
 *
 * @param props - Component props
 * @returns JSX element
 */
export function FaucetSection({
  address,
  client,
  title = TEXT.defaultTitle,
  variant = 'glass',
  size = 'md',
  className = '',
  onBalanceUpdate,
}: FaucetSectionProps) {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================

  const [balance, setBalance] = useState<string | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Fetch balance when address or client changes
  useEffect(() => {
    const fetchBalance = async (): Promise<void> => {
      if (!address || !client) return;

      setBalanceLoading(true);
      try {
        const balanceData = await client.getBalance({
          owner: address,
        });
        // Convert from MIST to SUI (1 SUI = 1,000,000,000 MIST)
        const suiBalance = (Number(balanceData.totalBalance) / 1_000_000_000).toFixed(6);
        setBalance(suiBalance);
        onBalanceUpdate?.(suiBalance);
      } catch {
        setBalance('Error');
      } finally {
        setBalanceLoading(false);
      }
    };

    fetchBalance();
  }, [address, client, onBalanceUpdate]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleFaucetComplete = (success: boolean): void => {
    if (success) {
      // Refresh balance after successful faucet request
      setTimeout(() => {
        const fetchBalance = async () => {
          if (!address || !client) return;
          setBalanceLoading(true);
          try {
            const balanceData = await client.getBalance({
              owner: address,
            });
            const suiBalance = (Number(balanceData.totalBalance) / 1_000_000_000).toFixed(6);
            setBalance(suiBalance);
            onBalanceUpdate?.(suiBalance);
          } catch {
            setBalance('Error');
          } finally {
            setBalanceLoading(false);
          }
        };
        fetchBalance();
      }, 2000); // Wait 2 seconds for the transaction to be processed
    }
  };

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
    <Panel variant={variant} size={size} className={`${STYLES.container} ${className}`}>
      <div className={STYLES.content}>
        <div className={STYLES.balanceSection}>
          <h3 className={STYLES.title}>{title}</h3>
          <div className={STYLES.balanceDisplay}>{renderBalance()}</div>
        </div>

        <div className={STYLES.faucetSection}>
          <FaucetButton
            address={address}
            variant='hero'
            buttonText='Get Test SUI'
            onComplete={handleFaucetComplete}
          />
        </div>
      </div>
    </Panel>
  );
}

export default FaucetSection;
