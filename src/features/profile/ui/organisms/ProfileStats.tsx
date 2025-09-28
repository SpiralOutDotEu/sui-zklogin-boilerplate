import React from 'react';
import { Panel, StatusIndicator } from '@/shared/ui/atoms';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ProfileStatsProps {
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STYLES = {
  container: 'grid md:grid-cols-3 gap-6',
  statHeader: 'flex items-center justify-between mb-4',
  statTitle: 'text-lg font-semibold text-white',
  statusIndicator: 'flex items-center gap-2',
  statusDot: 'w-3 h-3 rounded-full',
  statusDotGreen: 'bg-green-500',
  statusDotBlue: 'bg-blue-500',
  statusDotPurple: 'bg-purple-500',
  statusText: 'text-xs',
  statusTextGreen: 'text-green-400',
  statusTextBlue: 'text-blue-400',
  statusTextPurple: 'text-purple-400',
  statDescription: 'text-white/60 text-sm',
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * ProfileStats Component
 *
 * Displays profile statistics and status information.
 * Shows wallet status, network, and account type.
 *
 * @param props - Component props
 * @returns JSX element
 */
export default function ProfileStats({ className = '' }: ProfileStatsProps) {
  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`${STYLES.container} ${className}`}>
      {/* Wallet Status */}
      <Panel variant='glass' size='md'>
        <div className={STYLES.statHeader}>
          <h3 className={STYLES.statTitle}>Wallet Status</h3>
          <StatusIndicator status='success' text='Synced' size='sm' />
        </div>
        <p className={STYLES.statDescription}>Connected via zkLogin • Cross-tab sync enabled</p>
      </Panel>

      {/* Network */}
      <Panel variant='glass' size='md'>
        <div className={STYLES.statHeader}>
          <h3 className={STYLES.statTitle}>Network</h3>
          <div className={`${STYLES.statusDot} ${STYLES.statusDotBlue}`}></div>
        </div>
        <p className={STYLES.statDescription}>Sui Devnet</p>
      </Panel>

      {/* Account Type */}
      <Panel variant='glass' size='md'>
        <div className={STYLES.statHeader}>
          <h3 className={STYLES.statTitle}>Account Type</h3>
          <div className={`${STYLES.statusDot} ${STYLES.statusDotPurple}`}></div>
        </div>
        <p className={STYLES.statDescription}>Zero-Knowledge</p>
      </Panel>
    </div>
  );
}
