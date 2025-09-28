import React, { useState } from 'react';
import { Button, LoadingSpinner, Panel } from '@/shared/ui/atoms';
import { TransactionDetails, TransactionResult } from '@/shared/ui/molecules';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface TestTransactionFormProps {
  /** User account address */
  address: string;
  /** Whether transaction is being sent */
  isSending: boolean;
  /** Transaction result */
  txResult?: {
    digest: string;
    status: 'success' | 'error';
    error?: string;
  } | null;
  /** Callback when transaction is initiated */
  onSendTransaction: () => void;
  /** Balance card component to display under the header */
  balanceCard?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STYLES = {
  container: 'space-y-8',
  header: 'text-center space-y-4',
  title: 'text-4xl font-bold gradient-text',
  subtitle: 'text-white/70',
  cardContent: 'text-center',
  iconContainer:
    'w-24 h-24 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-8',
  icon: 'text-white text-4xl',
  titleSection: 'space-y-2 mb-2',
  cardTitle: 'text-2xl font-bold text-white',
  cardDescription: 'text-white/60',
  disclaimer: 'text-xs text-white/50 mb-8',
  debugSection: 'mt-6 pt-6 border-t border-white/10',
  debugToggle: 'text-xs text-white/50 hover:text-white/70 transition-colors',
  debugContent: 'mt-3 space-y-3',
  debugItem: 'bg-white/5 rounded-lg p-3',
  debugLabel: 'text-xs text-white/60 mb-1',
  debugValue: 'font-mono text-white text-xs break-all',
  clearSaltButton:
    'px-3 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded text-red-300 text-xs transition-colors',
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * TestTransactionForm Component
 *
 * Complete interface for testing zkLogin transactions.
 * Combines transaction details, execution, and result display.
 *
 * @param props - Component props
 * @returns JSX element
 */
export default function TestTransactionForm({
  address,
  isSending,
  txResult,
  onSendTransaction,
  balanceCard,
  className = '',
}: TestTransactionFormProps) {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================

  const [_showDebug, _setShowDebug] = useState(false);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`${STYLES.container} ${className}`}>
      {/* Header */}
      <div className={STYLES.header}>
        <h1 className={STYLES.title}>Test Transaction</h1>
        <p className={STYLES.subtitle}>Send 0.0001 SUI to yourself to test your zkLogin wallet</p>
      </div>

      {/* Balance Card */}
      {balanceCard && <div className='mb-8'>{balanceCard}</div>}

      {/* Main Card */}
      <Panel variant='glass' size='lg'>
        <div className={STYLES.cardContent}>
          {/* Icon */}
          <div className={STYLES.iconContainer}>
            <span className={STYLES.icon}>🧪</span>
          </div>

          {/* Title and Description */}
          <div className={STYLES.titleSection}>
            <h2 className={STYLES.cardTitle}>Test Your Wallet</h2>
            <p className={STYLES.cardDescription}>
              This will send 0.0001 SUI from your account to itself. This is a safe way to test that
              your zkLogin wallet can sign and send transactions.
            </p>
          </div>

          {/* Transaction Details */}
          <TransactionDetails
            network='Sui Devnet'
            fromAddress={address}
            toAddress={address}
            amount='0.0001 SUI'
            authMethod='zkLogin'
            className='mb-8'
          />

          {/* Transaction Result */}
          {txResult && (
            <TransactionResult
              txHash={txResult.digest}
              status={txResult.status}
              errorMessage={txResult.error}
              successMessage='Your test transaction has been sent successfully on the Sui blockchain.'
              explorerUrl={`https://suiscan.xyz/devnet/tx/${txResult.digest}`}
              className='mb-8'
            />
          )}

          {/* Send Button */}
          {!txResult && (
            <div className='mb-8 flex justify-center'>
              <Button onClick={onSendTransaction} disabled={isSending} variant='hero'>
                {isSending ? (
                  <div className='flex items-center gap-3'>
                    <LoadingSpinner size='sm' variant='white' />
                    <span>Sending Transaction...</span>
                  </div>
                ) : (
                  <div className='flex items-center gap-3'>
                    <span className='text-xl'>🧪</span>
                    <span>Send Test Transaction</span>
                  </div>
                )}
              </Button>
            </div>
          )}

          {/* Disclaimer */}
          <div className={STYLES.disclaimer}>
            This is a test transaction. 0.0001 SUI will be sent from your account to itself.
          </div>
        </div>
      </Panel>
    </div>
  );
}
