import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useZkLogin } from '@/features/auth';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

// No props needed for this component

// ============================================================================
// CONSTANTS
// ============================================================================

const PROVIDER = 'google' as const;

const STYLES = {
  button:
    'w-full px-6 py-3 rounded-lg text-white text-base font-medium transition-all duration-200',
  buttonEnabled:
    'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 glow-effect hover:scale-105',
  buttonDisabled: 'bg-gray-500 cursor-not-allowed opacity-70',
  loadingContainer: 'flex items-center justify-center gap-2',
  spinner: 'w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin',
} as const;

const TEXT = {
  connect: 'Connect Wallet',
  connecting: 'Connecting...',
  tooltipConnecting: 'Connecting...',
  tooltipConnect: 'Sign in with Google (zkLogin)',
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * ConnectWalletButton Component
 *
 * Handles the wallet connection flow with Google OAuth zkLogin integration.
 * Provides visual feedback during the connection process and prevents multiple clicks.
 *
 * Features:
 * - Google OAuth integration with zkLogin authentication
 * - Return URL preservation for seamless user experience
 * - Loading state with spinner animation
 * - Error handling with console logging
 * - Disabled state during connection to prevent multiple requests
 *
 * @returns JSX element containing the connect wallet button
 */
export default function ConnectWalletButton() {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================

  const { loginWithProvider } = useZkLogin();
  const location = useLocation();
  const [isConnecting, setIsConnecting] = useState(false);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleConnect = async (): Promise<void> => {
    if (isConnecting) return; // Prevent multiple clicks

    try {
      setIsConnecting(true);
      // Determine return URL - redirect to /profile if coming from root page
      const returnTo = location.pathname === '/' ? '/profile' : location.pathname + location.search;

      // Initiate zkLogin flow with Google OAuth
      await loginWithProvider(PROVIDER, returnTo);
    } catch {
      // Login failed - error handling is done by the auth system
    } finally {
      setIsConnecting(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  const buttonClassName = `${STYLES.button} ${
    isConnecting ? STYLES.buttonDisabled : STYLES.buttonEnabled
  }`;

  const buttonTitle = isConnecting ? TEXT.tooltipConnecting : TEXT.tooltipConnect;

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className={buttonClassName}
      title={buttonTitle}
    >
      {isConnecting ? (
        <div className={STYLES.loadingContainer}>
          <div className={STYLES.spinner}></div>
          <span>{TEXT.connecting}</span>
        </div>
      ) : (
        TEXT.connect
      )}
    </button>
  );
}
