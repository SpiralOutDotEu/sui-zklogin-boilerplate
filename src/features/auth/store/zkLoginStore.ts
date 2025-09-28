import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ZkSession, ZkLoginStoreState, JwtPayload } from '@/features/auth/types';
import { createZkLoginService } from '@/features/auth/services';
import { sessionCookieStorage } from '@/shared/utils';
import { isOk } from '@/shared/lib';
import { createAppError } from '@/shared/lib';
import { client } from '@/shared/lib';

/**
 * ZkLogin Store - State Management with Service Layer Integration
 * 
 * This Zustand store provides a thin layer over the ZkLoginService, handling
 * only state management and persistence while delegating business logic to services.
 * 
 * 🏗️ ARCHITECTURE:
 * - Thin layer that delegates to ZkLoginService
 * - Handles state persistence and cross-tab synchronization
 * - No business logic - pure state management
 * - Service-oriented design with dependency injection
 * 
 * 🔐 ZKLOGIN INTEGRATION:
 * - Manages zkLogin state across the entire application
 * - Handles session restoration and cross-tab sync
 * - Provides clean API for React components
 * - Integrates with all 11 zkLogin steps
 * 
 * 🍪 COOKIE STORAGE STRATEGY:
 * 
 * Session Cookies (expire when browser closes):
 * - zk_ephemeral_keypair: Ed25519 private key for transaction signing
 * - zk_max_epoch: Maximum epoch until ephemeral key expires
 * - zk_jwt_randomness: Randomness used in nonce generation
 * - zk_jwt_token: OAuth JWT token from provider
 * - zk_proof_data: ZK proof data for transaction verification
 * - zk_user_address: Derived zkLogin Sui address
 * 
 * Persistent Cookies (expire in 30 days):
 * - zk_user_salt: User salt for address derivation (persists across sessions)
 * 
 * 🔒 SECURITY:
 * - All cookies use secure, sameSite=strict settings for CSRF protection
 * - Ephemeral data expires with browser session
 * - Salt persists for consistent addresses
 * - Cross-tab synchronization for seamless UX
 * 
 * @example
 * ```typescript
 * const { account, loginWithProvider, ensureZkSession } = useZkLoginStore();
 * await loginWithProvider('google', '/dashboard');
 * const session = await ensureZkSession();
 * ```
 */

// Custom storage that triggers cross-tab updates using session cookies
const createCrossTabStorage = () => ({
    getItem: (name: string) => {
        const str = sessionCookieStorage.getItem(name) as string | null;
        if (!str) return null;
        return JSON.parse(str);
    },
    setItem: (name: string, value: unknown) => {
        sessionCookieStorage.setItem(name, JSON.stringify(value));
        // Trigger storage event for other tabs
        window.dispatchEvent(new StorageEvent('storage', {
            key: name,
            newValue: JSON.stringify(value),
            storageArea: sessionStorage // Use sessionStorage for event compatibility
        }));
    },
    removeItem: (name: string) => {
        sessionCookieStorage.removeItem(name);
        // Trigger storage event for other tabs
        window.dispatchEvent(new StorageEvent('storage', {
            key: name,
            newValue: null,
            storageArea: sessionStorage // Use sessionStorage for event compatibility
        }));
    },
});


export const useZkLoginStore = create<ZkLoginStoreState>()(
    persist(
        (set, get) => {
            return {
                // Initial state
                account: null,
                decodedJwt: null,
                isRestoring: false,
                salt: null,
                status: 'idle' as const,
                error: null,
                client,
                zkLoginService: createZkLoginService(),

                // Basic setters
                setAccount: (account) => set({ account }),
                setDecodedJwt: (jwt) => set({ decodedJwt: jwt }),
                setIsRestoring: (restoring) => set({ isRestoring: restoring }),
                setSalt: (salt) => set({ salt }),
                setStatus: (status) => set({ status }),
                setError: (error) => set({ error }),
                clearError: () => set({ error: null }),

                // ============================================================================
                // ZKLOGIN ACTIONS - DELEGATE TO SERVICE LAYER
                // ============================================================================

                /**
                 * Initiate OAuth Login - ZKLOGIN STEPS 1-5
                 * 
                 * This action delegates to ZkLoginService to start the OAuth flow.
                 * It handles the complete OAuth initiation process including ephemeral
                 * keypair generation, nonce creation, and Google OAuth redirect.
                 * 
                 * @param provider - OAuth provider (currently only "google" supported)
                 * @param returnTo - URL to return to after successful authentication
                 * 
                 * @example
                 * ```typescript
                 * await loginWithProvider('google', '/dashboard');
                 * ```
                 */
                loginWithProvider: async (provider: "google", returnTo?: string) => {
                    set({ status: 'loading', error: null });

                    const { zkLoginService } = get();
                    const result = await zkLoginService.initiateLogin(returnTo);

                    if (isOk(result)) {
                        set({ status: 'success' });
                        window.location.href = (result.data as { redirectUrl: string }).redirectUrl;
                    } else {
                        set({ status: 'error', error: result.error.message || 'Operation failed' });
                        // Don't throw - let UI handle the error state
                    }
                },

                /**
                 * Complete OAuth Login - ZKLOGIN STEPS 6-9
                 * 
                 * This action delegates to ZkLoginService to complete the OAuth flow.
                 * It processes the JWT token, derives the zkLogin address, and generates
                 * the ZK proof. Updates the store state with the authentication results.
                 * 
                 * @param idToken - JWT token returned from OAuth provider
                 * @param returnTo - URL to return to after completion
                 * 
                 * @example
                 * ```typescript
                 * await completeLogin(idToken, '/dashboard');
                 * ```
                 */
                completeLogin: async (idToken: string | null, returnTo: string) => {
                    set({ status: 'loading', error: null });

                    if (!idToken) {
                        const appError = createAppError('OAuth', 'No ID token provided', {
                            details: { step: 'completeLogin' }
                        });
                        set({ status: 'error', error: appError.message });
                        return;
                    }

                    const { zkLoginService } = get();
                    const result = await zkLoginService.completeLogin(idToken, returnTo);

                    if (isOk(result)) {
                        // Get salt from session storage for state tracking
                        // This ensures the store state is consistent with the salt service
                        const salt = sessionCookieStorage.getItem("zk_user_salt") as string | null;
                        const { account, decodedJwt } = result.data as { account: { address: string }; decodedJwt: JwtPayload };
                        set({
                            account,
                            decodedJwt,
                            salt: salt,
                            status: 'success',
                            error: null,
                        });
                    } else {
                        set({ status: 'error', error: result.error.message || 'Operation failed' });
                        // Don't throw - let UI handle the error state
                    }
                },

                /**
                 * Ensure ZkLogin Session - ZKLOGIN STEPS 10-11
                 * 
                 * This action delegates to ZkLoginService to create a zkLogin session
                 * for transaction signing. It restores all necessary cryptographic
                 * material and creates a signature function for zkLogin transactions.
                 * 
                 * 🔒 SESSION EXPIRATION HANDLING:
                 * - Automatically detects expired sessions based on epoch validation
                 * - Clears expired session data to prevent stale state
                 * - Provides clear error messages for user feedback
                 * - Handles both missing session data and epoch expiration
                 * 
                 * @returns Promise<ZkSession | null> - Session for transaction signing or null if failed
                 * 
                 * @example
                 * ```typescript
                 * const session = await ensureZkSession();
                 * if (session) {
                 *   // Use session for transaction signing
                 *   const txb = new Transaction();
                 *   const { bytes, signature } = await txb.sign({ signer: session.ephemeralKeypair });
                 *   const zkLoginSignature = session.getSignature(signature);
                 * } else {
                 *   // Session expired or failed - user needs to login again
                 *   console.log("Please login again to continue");
                 * }
                 * ```
                 */
                ensureZkSession: async (): Promise<ZkSession | null> => {
                    set({ status: 'loading', error: null });

                    const { zkLoginService } = get();
                    const result = await zkLoginService.createSession();

                    if (isOk(result)) {
                        set({ status: 'success', error: null });
                        // The result.data is already a complete ZkSession object
                        return result.data as ZkSession;
                    } else {
                        // Handle different types of session failures
                        if (result.error.kind === 'ZkLogin' && result.error.message.includes("Session expired")) {
                            // Session expired due to epoch - clear all session data
                            set({
                                account: null,
                                decodedJwt: null,
                                salt: null,
                                status: 'error',
                                error: result.error.message || 'Session expired',
                            });
                        } else {
                            // Other session creation failures (missing data, etc.)
                            set({ status: 'error', error: result.error.message || 'Operation failed' });
                        }
                        return null;
                    }
                },

                /**
                 * Logout User - Clear All Session Data
                 * 
                 * This action clears all zkLogin session data and signs out the user.
                 * It delegates to the service to clear session cookies and resets
                 * the store state to initial values.
                 * 
                 * @example
                 * ```typescript
                 * logout(); // Clear session and sign out
                 * ```
                 */
                logout: () => {
                    const { zkLoginService } = get();
                    zkLoginService.clearAll(); // Clear all zkLogin data

                    // Clear Zustand persistence storage
                    sessionCookieStorage.removeItem("zklogin-storage");

                    // Reset store state
                    set({
                        account: null,
                        decodedJwt: null,
                        salt: null,
                        status: 'idle',
                        error: null,
                    });

                    // Force clear the cookie by setting it to empty and expiring it
                    document.cookie = "zklogin-storage=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
                },

                /**
                 * Clear User Salt - Generate New Address
                 * 
                 * This action clears the user's salt, which will cause a new zkLogin
                 * address to be generated on the next login. It also clears the current
                 * session since the address will change.
                 * 
                 * ⚠️ WARNING: This will change the user's address!
                 * 
                 * @example
                 * ```typescript
                 * clearSalt(); // Generate new address on next login
                 * ```
                 */
                clearSalt: () => {
                    const { zkLoginService } = get();
                    zkLoginService.clearSalt();
                    // Also clear the current session since the address will change
                    get().logout();
                },

                /**
                 * Check Session Validity - Validate Current Session
                 * 
                 * This action checks if the current session is valid and not expired.
                 * It provides detailed information about session status for debugging
                 * and user feedback purposes.
                 * 
                 * @returns Promise<{isValid: boolean, error?: string, sessionInfo?: any}> - Session validation result
                 * 
                 * @example
                 * ```typescript
                 * const validation = await checkSessionValidity();
                 * if (!validation.isValid) {
                 *   console.log("Session issue:", validation.error);
                 *   // Handle session expiration or other issues
                 * }
                 * ```
                 */
                checkSessionValidity: async () => {
                    const { zkLoginService } = get();
                    const result = await zkLoginService.createSession();

                    if (isOk(result)) {
                        const sessionData = result.data as {
                            address: string;
                            maxEpoch: number;
                            currentEpoch: number;
                        };

                        // Calculate epochs remaining: maxEpoch (from login time) - currentEpoch (from blockchain now)
                        const epochsRemaining = sessionData.maxEpoch - sessionData.currentEpoch;
                        const isValid = epochsRemaining > 0;

                        return {
                            isValid,
                            sessionInfo: {
                                address: sessionData.address,
                                maxEpoch: sessionData.maxEpoch,
                                currentEpoch: sessionData.currentEpoch,
                                epochsRemaining
                            }
                        };
                    } else {
                        return {
                            isValid: false,
                            error: result.error.message || "Session validation failed"
                        };
                    }
                },

                /**
                 * Ensure Valid Session - Auto Re-login on Expiration
                 * 
                 * This action ensures a valid session exists, automatically triggering
                 * re-login if the current session has expired. It provides a seamless
                 * user experience by handling session expiration transparently.
                 * 
                 * @param returnTo - URL to return to after re-login (defaults to current URL)
                 * @returns Promise<ZkSession | null> - Valid session or null if re-login needed
                 * 
                 * @example
                 * ```typescript
                 * const session = await ensureValidSession('/dashboard');
                 * if (session) {
                 *   // Use session for transaction signing
                 * } else {
                 *   // User needs to complete OAuth flow
                 * }
                 * ```
                 */
                ensureValidSession: async (returnTo?: string): Promise<ZkSession | null> => {
                    const { ensureZkSession, loginWithProvider } = get();

                    // First try to get existing session
                    const session = await ensureZkSession();

                    if (session) {
                        return session;
                    }

                    // Session is invalid or expired - trigger re-login
                    // Use current URL as return destination if none specified
                    const currentUrl = returnTo || window.location.pathname + window.location.search;
                    await loginWithProvider("google", currentUrl);
                    return null; // Will redirect to OAuth, so return null
                },
            };
        },
        {
            name: 'zklogin-storage',
            storage: createJSONStorage(() => createCrossTabStorage()),
            partialize: (state) => ({
                account: state.account,
                decodedJwt: state.decodedJwt,
                salt: state.salt,
            }),
        }
    )
);