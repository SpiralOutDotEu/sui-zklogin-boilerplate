import React from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface TransactionDetailsProps {
  /** Network name */
  network: string;
  /** Sender address */
  fromAddress: string;
  /** Recipient address */
  toAddress: string;
  /** Transaction amount */
  amount: string;
  /** Authentication method */
  authMethod: string;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STYLES = {
  container: 'bg-white/5 rounded-xl p-6',
  title: 'text-lg font-semibold text-white mb-3',
  details: 'space-y-2 text-sm',
  detailRow: 'flex justify-between',
  label: 'text-white/60',
  value: 'text-white',
  valueMono: 'font-mono text-white text-xs break-all',
  valueSuccess: 'text-green-400',
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * TransactionDetails Component
 *
 * Displays transaction information in a structured format.
 * Used in transaction forms and result displays.
 *
 * @param props - Component props
 * @returns JSX element
 */
export default function TransactionDetails({
  network,
  fromAddress,
  toAddress,
  amount,
  authMethod,
  className = '',
}: TransactionDetailsProps) {
  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`${STYLES.container} ${className}`}>
      <h3 className={STYLES.title}>Transaction Details</h3>
      <div className={STYLES.details}>
        <div className={STYLES.detailRow}>
          <span className={STYLES.label}>Network:</span>
          <span className={STYLES.value}>{network}</span>
        </div>
        <div className={STYLES.detailRow}>
          <span className={STYLES.label}>From:</span>
          <span className={STYLES.valueMono}>{fromAddress}</span>
        </div>
        <div className={STYLES.detailRow}>
          <span className={STYLES.label}>To:</span>
          <span className={STYLES.valueMono}>{toAddress}</span>
        </div>
        <div className={STYLES.detailRow}>
          <span className={STYLES.label}>Amount:</span>
          <span className={STYLES.value}>{amount}</span>
        </div>
        <div className={STYLES.detailRow}>
          <span className={STYLES.label}>Authentication:</span>
          <span className={`${STYLES.value} ${STYLES.valueSuccess}`}>{authMethod}</span>
        </div>
      </div>
    </div>
  );
}
