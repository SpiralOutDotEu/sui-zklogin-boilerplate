import React from 'react';
import { Avatar, CopyButton } from '../atoms';
import { BalanceCard } from './BalanceCard';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface AccountCardProps {
  /** Account address */
  address: string;
  /** Account balance */
  balance?: string;
  /** Whether balance is loading */
  balanceLoading?: boolean;
  /** Account title */
  title?: string;
  /** Account subtitle */
  subtitle?: string;
  /** Avatar size */
  avatarSize?: number;
  /** Additional CSS classes */
  className?: string;
  /** Callback when address is copied */
  onAddressCopied?: () => void;
  /** Callback when faucet request completes (success or error) */
  onFaucetComplete?: (success: boolean) => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STYLES = {
  container: 'bg-white/5 rounded-xl p-4',
  header: 'flex items-center gap-4 mb-6',
  avatar: 'ring-2 ring-white/20',
  titleContainer: 'flex-1',
  title: 'text-2xl font-bold text-white',
  subtitle: 'text-white/60 text-sm',
  infoGrid: 'grid md:grid-cols-2 gap-6',
  infoCard: 'bg-white/5 rounded-xl p-4',
  infoTitle: 'text-sm font-semibold text-white/80 mb-2',
  addressText: 'font-mono text-white/90 text-xs break-all mb-3',
  balanceText: 'text-white/90 font-mono text-lg mb-3',
  loadingContainer: 'flex items-center gap-2',
  errorText: 'text-red-400 text-sm',
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * AccountCard Component
 *
 * Displays account information including address, balance, and avatar.
 * Used in profile pages and account displays.
 *
 * @param props - Component props
 * @returns JSX element
 */
export default function AccountCard({
  address,
  balance,
  balanceLoading = false,
  title = 'Account Information',
  subtitle = 'Your unique zkLogin identity',
  avatarSize = 48,
  className = '',
  onAddressCopied,
  onFaucetComplete,
}: AccountCardProps) {
  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`${STYLES.container} ${className}`}>
      <div className={STYLES.header}>
        <Avatar address={address} size={avatarSize} className={STYLES.avatar} />
        <div className={STYLES.titleContainer}>
          <h2 className={STYLES.title}>{title}</h2>
          <p className={STYLES.subtitle}>{subtitle}</p>
        </div>
      </div>

      <div className={STYLES.infoGrid}>
        {/* Wallet Address */}
        <div className={STYLES.infoCard}>
          <h3 className={STYLES.infoTitle}>Wallet Address</h3>
          <div className={STYLES.addressText}>{address}</div>
          <CopyButton
            text={address}
            label='Copy'
            variant='primary'
            size='sm'
            onCopy={onAddressCopied}
          />
        </div>

        {/* Balance with Faucet */}
        <BalanceCard
          address={address}
          balance={balance}
          balanceLoading={balanceLoading}
          title='Balance'
          onFaucetComplete={onFaucetComplete}
        />
      </div>
    </div>
  );
}
