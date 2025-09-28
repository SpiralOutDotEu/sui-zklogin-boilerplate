import React from 'react';
import { CopyButton } from '../atoms';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface TransactionResultProps {
  /** Transaction hash */
  txHash: string;
  /** Transaction status */
  status: 'success' | 'error' | 'pending';
  /** Error message (if status is error) */
  errorMessage?: string;
  /** Success message (if status is success) */
  successMessage?: string;
  /** Explorer URL for the transaction */
  explorerUrl?: string;
  /** Additional CSS classes */
  className?: string;
  /** Callback when hash is copied */
  onHashCopied?: () => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STYLES = {
  container: 'rounded-xl p-6 mb-8',
  containerSuccess: 'bg-green-500/10 border border-green-500/30',
  containerError: 'bg-red-500/10 border border-red-500/30',
  containerPending: 'bg-yellow-500/10 border border-yellow-500/30',
  header: 'flex items-center gap-3 mb-4',
  icon: 'w-8 h-8 rounded-full flex items-center justify-center',
  iconSuccess: 'bg-green-500',
  iconError: 'bg-red-500',
  iconPending: 'bg-yellow-500',
  iconText: 'text-white text-sm',
  title: 'text-lg font-semibold',
  titleSuccess: 'text-green-300',
  titleError: 'text-red-300',
  titlePending: 'text-yellow-300',
  message: 'text-sm mb-4',
  messageSuccess: 'text-green-200/80',
  messageError: 'text-red-200/80',
  messagePending: 'text-yellow-200/80',
  hashContainer: 'bg-white/5 rounded-lg p-4 mb-4',
  hashLabel: 'text-xs text-white/60 font-medium mb-2',
  hashValue: 'font-mono text-sm break-all bg-black/20 rounded p-2 mb-3',
  hashValueSuccess: 'text-green-300',
  hashValueError: 'text-red-300',
  hashValuePending: 'text-yellow-300',
  actions: 'flex flex-col sm:flex-row gap-3',
  explorerButton:
    'flex-1 px-4 py-3 rounded-lg text-sm transition-colors text-center flex items-center justify-center gap-2',
  explorerButtonSuccess:
    'bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300',
  explorerButtonError: 'bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300',
  explorerButtonPending:
    'bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-300',
  copyButton: 'flex-1',
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * TransactionResult Component
 *
 * Displays transaction execution results with status, hash, and actions.
 * Used in transaction forms to show success/error states.
 *
 * @param props - Component props
 * @returns JSX element
 */
export default function TransactionResult({
  txHash,
  status,
  errorMessage,
  successMessage,
  explorerUrl,
  className = '',
  onHashCopied,
}: TransactionResultProps) {
  // ============================================================================
  // RENDER
  // ============================================================================

  const containerClass =
    STYLES[`container${status.charAt(0).toUpperCase() + status.slice(1)}` as keyof typeof STYLES];
  const iconClass =
    STYLES[`icon${status.charAt(0).toUpperCase() + status.slice(1)}` as keyof typeof STYLES];
  const titleClass =
    STYLES[`title${status.charAt(0).toUpperCase() + status.slice(1)}` as keyof typeof STYLES];
  const messageClass =
    STYLES[`message${status.charAt(0).toUpperCase() + status.slice(1)}` as keyof typeof STYLES];
  const hashValueClass =
    STYLES[`hashValue${status.charAt(0).toUpperCase() + status.slice(1)}` as keyof typeof STYLES];
  const explorerButtonClass =
    STYLES[
      `explorerButton${status.charAt(0).toUpperCase() + status.slice(1)}` as keyof typeof STYLES
    ];

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'pending':
        return '⏳';
      default:
        return '?';
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'success':
        return 'Transaction Successful!';
      case 'error':
        return 'Transaction Failed';
      case 'pending':
        return 'Transaction Pending';
      default:
        return 'Transaction Status';
    }
  };

  const getStatusMessage = () => {
    if (status === 'success' && successMessage) return successMessage;
    if (status === 'error' && errorMessage) return errorMessage;
    if (status === 'pending') return 'Your transaction is being processed...';
    return '';
  };

  return (
    <div className={`${STYLES.container} ${containerClass} ${className}`}>
      <div className={STYLES.header}>
        <div className={`${STYLES.icon} ${iconClass}`}>
          <span className={STYLES.iconText}>{getStatusIcon()}</span>
        </div>
        <h3 className={`${STYLES.title} ${titleClass}`}>{getStatusTitle()}</h3>
      </div>

      {getStatusMessage() && (
        <p className={`${STYLES.message} ${messageClass}`}>{getStatusMessage()}</p>
      )}

      <div className={STYLES.hashContainer}>
        <div className={STYLES.hashLabel}>Transaction Hash:</div>
        <div className={`${STYLES.hashValue} ${hashValueClass}`}>{txHash}</div>
        <div className={STYLES.actions}>
          {explorerUrl && (
            <a
              href={explorerUrl}
              target='_blank'
              rel='noopener noreferrer'
              className={`${STYLES.explorerButton} ${explorerButtonClass}`}
            >
              <span>🔍</span>
              <span>View on Explorer</span>
            </a>
          )}
          <CopyButton
            text={txHash}
            label='Copy Hash'
            variant='secondary'
            size='sm'
            className={STYLES.copyButton}
            onCopy={onHashCopied}
          />
        </div>
      </div>
    </div>
  );
}
