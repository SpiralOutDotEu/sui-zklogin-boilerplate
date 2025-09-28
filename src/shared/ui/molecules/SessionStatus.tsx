import React from 'react';
import { StatusIndicator, LoadingSpinner } from '../atoms';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface SessionInfo {
  /** Whether session is valid */
  isValid: boolean;
  /** Current epoch */
  currentEpoch: number;
  /** Maximum epoch */
  maxEpoch: number;
  /** Epochs remaining */
  epochsRemaining: number;
}

interface SessionStatusProps {
  /** Session information */
  sessionInfo?: SessionInfo | null;
  /** Whether session check is in progress */
  isChecking?: boolean;
  /** Error message if session check failed */
  error?: string | null;
  /** Callback to refresh session */
  onRefresh?: () => void;
  /** Callback to re-login */
  onReLogin?: () => void;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STYLES = {
  container: 'bg-white/5 rounded-xl p-4',
  header: 'flex items-center justify-between mb-3',
  title: 'text-sm font-semibold text-white/80',
  refreshButton:
    'px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  content: 'space-y-2 text-sm',
  detailRow: 'flex justify-between',
  label: 'text-white/60',
  value: 'text-white font-mono',
  valueSuccess: 'text-green-400',
  valueError: 'text-red-400',
  errorContainer: 'bg-red-500/10 border border-red-500/30 rounded p-2 mb-2',
  errorText: 'text-red-200 text-xs mb-2',
  errorActions: 'flex gap-2',
  errorButton: 'flex-1 px-3 py-2 rounded text-xs transition-colors',
  reLoginButton: 'bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300',
  refreshButtonError: 'bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300',
  expiredContainer: 'bg-red-500/10 border border-red-500/30 rounded p-2',
  expiredHeader: 'flex items-center gap-2 mb-2',
  expiredText: 'text-red-200 text-xs',
  expiredActions: 'flex gap-2',
  expiredButton: 'flex-1 px-3 py-2 rounded text-xs transition-colors',
  noSession: 'text-center py-1',
  noSessionText: 'text-white/60 text-xs',
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * SessionStatus Component
 *
 * Displays zkLogin session status with validation information.
 * Used in profile pages to show session health and expiration.
 *
 * @param props - Component props
 * @returns JSX element
 */
export default function SessionStatus({
  sessionInfo,
  isChecking = false,
  error,
  onRefresh,
  onReLogin,
  className = '',
}: SessionStatusProps) {
  // ============================================================================
  // RENDER
  // ============================================================================

  const isSessionValid = sessionInfo?.isValid ?? false;
  const isSessionExpired = sessionInfo && sessionInfo.epochsRemaining < 0;

  return (
    <div className={`${STYLES.container} ${className}`}>
      <div className={STYLES.header}>
        <h3 className={STYLES.title}>Session Status</h3>
        <button
          onClick={onRefresh}
          disabled={isChecking}
          className={STYLES.refreshButton}
          title='Refresh session status'
        >
          {isChecking ? (
            <span className='inline-flex items-center gap-2'>
              <LoadingSpinner size='sm' variant='white' />
              <span>Checking...</span>
            </span>
          ) : (
            <span className='flex items-center gap-1'>
              <span aria-hidden>↻</span>
              <span>Refresh</span>
            </span>
          )}
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className={STYLES.errorContainer}>
          <span className={STYLES.errorText}>{error}</span>
          <div className={STYLES.errorActions}>
            <button onClick={onReLogin} className={`${STYLES.errorButton} ${STYLES.reLoginButton}`}>
              Re-login
            </button>
            <button
              onClick={onRefresh}
              disabled={isChecking}
              className={`${STYLES.errorButton} ${STYLES.refreshButtonError} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isChecking ? (
                <span className='inline-flex items-center gap-1'>
                  <LoadingSpinner size='sm' variant='white' />
                  <span>Checking...</span>
                </span>
              ) : (
                'Refresh'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Session Info */}
      {sessionInfo ? (
        <div className={STYLES.content}>
          <div className={STYLES.detailRow}>
            <span className={STYLES.label}>Status:</span>
            <StatusIndicator
              status={isSessionValid ? 'success' : 'error'}
              text={isSessionValid ? '✓ Valid' : '✗ Invalid'}
            />
          </div>
          <div className={STYLES.detailRow}>
            <span className={STYLES.label}>Current Epoch:</span>
            <span className={STYLES.value}>{sessionInfo.currentEpoch}</span>
          </div>
          <div className={STYLES.detailRow}>
            <span className={STYLES.label}>Max Epoch:</span>
            <span className={STYLES.value}>{sessionInfo.maxEpoch}</span>
          </div>
          <div className={STYLES.detailRow}>
            <span className={STYLES.label}>Epochs Remaining:</span>
            <span
              className={`${STYLES.value} ${isSessionValid ? STYLES.valueSuccess : STYLES.valueError}`}
            >
              {sessionInfo.epochsRemaining}
            </span>
          </div>

          {/* Session Expired Warning */}
          {isSessionExpired && (
            <div className={STYLES.expiredContainer}>
              <div className={STYLES.expiredHeader}>
                <span className='text-red-400'>❌</span>
                <span className={STYLES.expiredText}>
                  Session has expired. Please re-login to continue.
                </span>
              </div>
              <div className={STYLES.expiredActions}>
                <button
                  onClick={onReLogin}
                  className={`${STYLES.expiredButton} ${STYLES.reLoginButton}`}
                >
                  Re-login
                </button>
                <button
                  onClick={onRefresh}
                  disabled={isChecking}
                  className={`${STYLES.expiredButton} ${STYLES.refreshButtonError} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isChecking ? (
                    <span className='inline-flex items-center gap-1'>
                      <LoadingSpinner size='sm' variant='white' />
                      <span>Checking...</span>
                    </span>
                  ) : (
                    'Refresh Session'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className={STYLES.noSession}>
          <p className={STYLES.noSessionText}>Session status not available</p>
        </div>
      )}
    </div>
  );
}
