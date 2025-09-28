import React, { useState, useEffect } from 'react';
import { useZkLogin } from '@/features/auth';
import { AccountCard, Panel, SessionStatus, VerifiedBadge } from '@/shared/ui';
import { ProfileHeader, ProfileStats, OwnedObjectsList, SaltManagementPanel } from '../ui';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface SessionInfo {
  isValid: boolean;
  currentEpoch: number;
  maxEpoch: number;
  epochsRemaining: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STYLES = {
  container: 'space-y-12',
  notSignedIn: 'min-h-[60vh] flex items-center justify-center',
  notSignedInContent: 'text-center space-y-4',
  notSignedInIcon: 'w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto',
  notSignedInIconText: 'text-red-400 text-2xl',
  notSignedInTitle: 'text-2xl font-bold text-white',
  notSignedInSubtitle: 'text-white/60',
  accountHeader: 'flex items-center gap-4 mb-6',
  accountAvatar: 'ring-2 ring-white/20',
  accountTitle: 'text-2xl font-bold text-white',
  accountSubtitle: 'text-white/60 text-sm',
  infoGrid: 'grid md:grid-cols-2 gap-6',
  infoCard: 'bg-white/5 rounded-xl p-4',
  infoTitle: 'text-sm font-semibold text-white/80 mb-2',
  emailText: 'text-white/90 text-sm mb-2',
  verifiedBadge: 'px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs inline-block',
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Profile Component
 *
 * Simplified profile page using atomic design components.
 * Delegates complex UI to organisms and molecules.
 *
 * @returns JSX element
 */
export default function Profile() {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================

  const { account, decodedJwt, client, checkSessionValidity, loginWithProvider } = useZkLogin();
  const [balance, setBalance] = useState<string | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Fetch balance when account is available
  useEffect(() => {
    const fetchBalance = async (): Promise<void> => {
      if (!account?.address || !client) return;

      setBalanceLoading(true);
      try {
        const balanceData = await client.getBalance({
          owner: account.address,
        });
        // Convert from MIST to SUI (1 SUI = 1,000,000,000 MIST)
        const suiBalance = (Number(balanceData.totalBalance) / 1_000_000_000).toFixed(6);
        setBalance(suiBalance);
      } catch {
        setBalance('Error');
      } finally {
        setBalanceLoading(false);
      }
    };

    fetchBalance();
  }, [account?.address, client]);

  // Fetch session status on load/account change
  useEffect(() => {
    const run = async () => {
      await checkSession();
    };
    run();
  }, [account?.address]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const checkSession = async (): Promise<void> => {
    if (typeof checkSessionValidity !== 'function') {
      setSessionError('checkSessionValidity is not available');
      return;
    }

    setIsCheckingSession(true);
    setSessionError(null);

    try {
      const validation = await checkSessionValidity();
      if (validation.isValid) {
        // Type guard to ensure sessionInfo matches our interface
        const sessionInfo = validation.sessionInfo as SessionInfo | undefined;
        if (sessionInfo) {
          // Include the isValid property in the sessionInfo
          setSessionInfo({
            ...sessionInfo,
            isValid: validation.isValid,
          });
        } else {
          setSessionInfo(null);
        }
        setSessionError(null);
      } else {
        setSessionInfo(null);
        setSessionError(validation.error || 'Session validation failed');
      }
    } catch (error) {
      setSessionError('Session check failed: ' + (error as Error).message);
    } finally {
      setIsCheckingSession(false);
    }
  };

  const handleReLogin = async (): Promise<void> => {
    const currentUrl = window.location.pathname + window.location.search;
    await loginWithProvider('google', currentUrl);
  };

  const handleAddressCopied = (): void => {
    // Could add notification here if needed
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!account?.address) {
    return (
      <div className={STYLES.notSignedIn}>
        <div className={STYLES.notSignedInContent}>
          <div className={STYLES.notSignedInIcon}>
            <span className={STYLES.notSignedInIconText}>🔒</span>
          </div>
          <h2 className={STYLES.notSignedInTitle}>Please Sign In</h2>
          <p className={STYLES.notSignedInSubtitle}>Connect your wallet to access your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className={STYLES.container}>
      {/* Profile Header */}
      <ProfileHeader address={account.address} email={decodedJwt?.email} />

      {/* Profile Stats */}
      <ProfileStats />

      {/* Account Details */}
      <AccountCard
        address={account.address}
        balance={balance || undefined}
        balanceLoading={balanceLoading}
        onAddressCopied={handleAddressCopied}
      />

      {/* Additional Account Info */}
      <Panel variant='glass' size='md' className='mt-8'>
        <div className={STYLES.accountHeader}>
          <div className={STYLES.accountAvatar}>{/* Avatar would go here if needed */}</div>
          <div>
            <h2 className={STYLES.accountTitle}>Additional Information</h2>
            <p className={STYLES.accountSubtitle}>Account details and session status</p>
          </div>
        </div>

        <div className={STYLES.infoGrid}>
          {/* Email */}
          {decodedJwt?.email && (
            <div className={STYLES.infoCard}>
              <h3 className={STYLES.infoTitle}>Connected Email</h3>
              <div className={STYLES.emailText}>{decodedJwt.email}</div>
              <VerifiedBadge text='Verified' />
            </div>
          )}

          {/* Session Status */}
          <SessionStatus
            sessionInfo={sessionInfo}
            isChecking={isCheckingSession}
            error={sessionError || undefined}
            onRefresh={checkSession}
            onReLogin={handleReLogin}
          />
        </div>
      </Panel>

      {/* Salt Management Panel */}
      <SaltManagementPanel />

      {/* Owned Objects */}
      <OwnedObjectsList address={account.address} client={client} />
    </div>
  );
}
