import React, { useEffect, createContext, useContext } from 'react';
import { useZkLoginStore as useZkLoginStoreInternal } from '@/features/auth/store';
import { useCrossTabSync } from '@/features/auth/hooks';
import { client as sharedClient } from '@/shared/lib';
import type { ZkLoginContext } from '@/features/auth/types';

const ZkLoginCtx = createContext<ZkLoginContext | null>(null);

/**
 * ZkLoginProvider - React Context Provider for zkLogin
 *
 * This is the main React Context Provider that wraps the entire application
 * and provides zkLogin functionality to all child components. It acts as a
 * bridge between React components and the Zustand store.
 *
 * 🎯 KEY RESPONSIBILITIES:
 * - Manages zkLogin state through Zustand store
 * - Handles session restoration on app startup
 * - Enables cross-tab synchronization
 * - Provides clean API for components to use zkLogin
 * - Integrates with all 11 zkLogin steps
 *
 * 🏗️ ARCHITECTURE:
 * - Wraps Zustand store with React Context
 * - Provides Sui client for blockchain operations
 * - Handles session restoration and error states
 * - Enables cross-tab synchronization
 *
 * 🔐 ZKLOGIN INTEGRATION:
 * - Provides access to all zkLogin functionality
 * - Handles OAuth flow initiation and completion
 * - Manages zkLogin sessions for transaction signing
 * - Provides user account and authentication state
 *
 * @example
 * ```typescript
 * function App() {
 *   return (
 *     <ZkLoginProvider>
 *       <YourAppComponents />
 *     </ZkLoginProvider>
 *   );
 * }
 * ```
 */
export function ZkLoginProvider({ children }: { children: React.ReactNode }) {
  const {
    account,
    decodedJwt,
    isRestoring,
    salt,
    status,
    error,
    loginWithProvider,
    completeLogin,
    ensureZkSession,
    logout,
    clearSalt,
    clearError,
    checkSessionValidity,
    ensureValidSession,
  } = useZkLoginStoreInternal();

  const client = sharedClient;

  // Enable cross-tab synchronization for seamless experience across browser tabs
  useCrossTabSync();

  // ============================================================================
  // SESSION RESTORATION - ZKLOGIN STEPS 10-11
  // ============================================================================

  /**
   * Session Restoration on App Startup
   *
   * This effect handles session restoration when the app loads. It checks if
   * there's persisted zkLogin data and attempts to restore the session for
   * transaction signing.
   *
   * 🔐 ZKLOGIN INTEGRATION:
   * - Checks for persisted account and JWT data
   * - Attempts to restore zkLogin session (steps 10-11)
   * - Handles restoration failures gracefully
   * - Sets loading state for UI feedback
   *
   * 🏗️ IMPLEMENTATION:
   * - Runs on component mount and when dependencies change
   * - Uses ensureZkSession to restore cryptographic material
   * - Provides small delay for store hydration
   * - Cleans up timers to prevent memory leaks
   */
  useEffect(() => {
    const restoreSession = async () => {
      // Check if we have persisted data to restore from previous session
      // This includes account address, JWT, and salt from the store
      const hasPersistedData = account || decodedJwt;
      if (hasPersistedData) {
        // Try to restore the zkLogin session from stored data
        // This will restore ephemeral keypair, ZK proof, and create signature function
        try {
          const session = await ensureZkSession();
          if (session) {
            // Session restored successfully - user can now transact
            // The session contains all necessary data for zkLogin transactions
          } else {
            // Session restoration failed - user needs to login again
            // This can happen if ephemeral keypair expired or data is corrupted
          }
        } catch {
          // Session restoration failed - user will need to login again
          // This can happen if ephemeral keypair expired or data is corrupted
        }
      }

      // Session restoration is handled internally by the store
      // No need to manually set isRestoring state
    };

    restoreSession();
  }, [account, decodedJwt, ensureZkSession]);

  // Create context value with all zkLogin functionality
  const value: ZkLoginContext = {
    client,
    account,
    decodedJwt,
    isRestoring,
    salt,
    status,
    error,
    loginWithProvider,
    completeLogin,
    ensureZkSession,
    logout,
    clearSalt,
    clearError,
    checkSessionValidity,
    ensureValidSession,
  };

  return <ZkLoginCtx.Provider value={value}>{children}</ZkLoginCtx.Provider>;
}

/**
 * useZkLogin Hook - Access zkLogin Functionality
 *
 * Custom hook to access zkLogin functionality from any component.
 * This hook provides a clean API for components to interact with the
 * zkLogin system without directly accessing the store or services.
 *
 * 🔐 ZKLOGIN INTEGRATION:
 * - Provides access to all 11 zkLogin steps
 * - Handles OAuth flow initiation and completion
 * - Manages zkLogin sessions for transaction signing
 * - Provides user account and authentication state
 *
 * 🏗️ USAGE PATTERNS:
 * - Authentication: loginWithProvider, completeLogin, logout
 * - Transaction signing: ensureZkSession
 * - State access: account, decodedJwt, isRestoring
 * - Utility functions: clearSalt
 *
 * @returns ZkLoginContext - Complete zkLogin functionality and state
 * @throws Error if used outside of ZkLoginProvider
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { account, loginWithProvider, ensureZkSession } = useZkLogin();
 *
 *   const handleLogin = () => loginWithProvider('google');
 *   const handleTransaction = async () => {
 *     const session = await ensureZkSession();
 *     // Use session for transaction signing
 *   };
 *
 *   return (
 *     <div>
 *       {account ? `Welcome ${account.address}` : 'Please login'}
 *       <button onClick={handleLogin}>Login</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useZkLogin() {
  const context = useContext(ZkLoginCtx);
  if (!context) {
    throw new Error('useZkLogin must be used within a ZkLoginProvider');
  }
  return context;
}

// Hook that provides access to the store with only public interface
export function useZkLoginStore() {
  const store = useZkLoginStoreInternal();
  // Return only the public interface, hiding internal methods
  return {
    account: store.account,
    decodedJwt: store.decodedJwt,
    isRestoring: store.isRestoring,
    salt: store.salt,
    status: store.status,
    error: store.error,
    loginWithProvider: store.loginWithProvider,
    completeLogin: store.completeLogin,
    ensureZkSession: store.ensureZkSession,
    logout: store.logout,
    clearSalt: store.clearSalt,
    clearError: store.clearError,
    checkSessionValidity: store.checkSessionValidity,
    ensureValidSession: store.ensureValidSession,
  };
}
