import { sessionCookieStorage } from '@/shared/utils';
import type { SaltService } from '@/features/auth/types';
import { Result, ok, err } from '@/shared/lib';
import { createAppError, type AppError } from '@/shared/lib';

/**
 * Demo Salt Service - Client-Side Salt Generation
 * 
 * This service generates and manages user salts client-side for demo purposes.
 * It provides a simple implementation that stores salts in persistent cookies.
 * 
 * ⚠️  DEMO ONLY - NOT FOR PRODUCTION:
 * - Generates random salts client-side
 * - Stores salts in browser cookies
 * - No server-side validation or security
 * - Addresses may change if cookies are cleared
 * 
 * 🔒 PRODUCTION REQUIREMENTS:
 * - Move to secure backend service
 * - Implement proper salt rotation
 * - Add audit logging and monitoring
 * - Ensure consistent addresses across devices
 * 
 * 🏗️ IMPLEMENTATION DETAILS:
 * - Uses crypto.getRandomValues() for secure randomness
 * - Converts 16 random bytes to BigInt for salt
 * - Stores in persistent cookies (30-day expiration)
 * - Implements SaltService interface for easy switching
 * 
 * @example
 * ```typescript
 * const saltService = new DemoSaltService();
 * const salt = await saltService.getOrCreateSalt(jwtPayload);
 * console.log('User salt:', salt);
 * ```
 */
export class DemoSaltService implements SaltService {
    private readonly SALT_KEY = "zk_user_salt";

    /**
     * Get or Create User Salt - ZKLOGIN STEP 7 (Demo Implementation)
     * 
     * This method retrieves an existing salt from persistent storage or generates
     * a new one if none exists. In production, this should call a secure backend
     * service that ensures consistent addresses across devices.
     * 
     * 🔐 ZKLOGIN INTEGRATION:
     * - Called during step 7 of the zkLogin process
     * - Salt is used to derive the user's zkLogin address
     * - Same salt + JWT = same address (consistency)
     * 
     * 🔒 SECURITY CONSIDERATIONS:
     * - Salt should be unique per user
     * - Salt should be consistent across devices (in production)
     * - Salt should be unpredictable and random
     * - Salt should be stored securely (not in localStorage)
     * 
     * @param jwtToken - JWT token from OAuth provider (used for user identification)
     * @returns Promise<Result<string, AppError>> - User's salt for address derivation
     * 
     * @example
     * ```typescript
     * const result = await saltService.getOrCreateSalt(jwtToken);
     * if (result.ok) {
     *   const salt = result.data;
     *   const address = jwtToAddress(jwtToken, salt);
     * } else {
     *   console.error(result.error.message);
     * }
     * ```
     */

    async getOrCreateSalt(_jwtToken: string): Promise<Result<string, AppError>> {
        try {
            // Try to retrieve existing salt from session storage
            let salt = sessionCookieStorage.getItem(this.SALT_KEY);

            if (!salt) {
                // DEMO ONLY: Generate random salt client-side
                // In production, this should call a secure backend salt service
                // The salt should be consistent for the same user across devices

                try {
                    // Generate 16 random bytes using cryptographically secure random number generator
                    const rand = crypto.getRandomValues(new Uint8Array(16));

                    // Convert random bytes to BigInt (16-byte integer)
                    // This creates a 128-bit salt value
                    let big = 0n;
                    for (let i = 0; i < 16; i++) {
                        big = big * 256n + BigInt(rand[i]);
                    }
                    salt = big.toString();

                    // Store salt in session cookies (expires when browser closes)
                    // This ensures the salt is only available during the current session
                    sessionCookieStorage.setItem(this.SALT_KEY, salt);
                } catch (cryptoError) {
                    const error = createAppError('SaltService', 'Failed to generate salt', {
                        cause: cryptoError,
                        details: 'Crypto.getRandomValues failed'
                    });
                    return err(error);
                }
            }

            return ok(salt as string);
        } catch (error) {
            const appError = createAppError('SaltService', 'Failed to get or create salt', {
                cause: error,
                details: 'Unexpected error in salt service'
            });
            return err(appError);
        }
    }

    clearSalt(): void {
        sessionCookieStorage.removeItem(this.SALT_KEY);
    }
}

/**
 * Backend Salt Service - Production-Ready Salt Management
 * 
 * This service provides production-ready salt management by calling a secure
 * backend service. It ensures consistent addresses across devices and sessions
 * while providing proper security, audit logging, and salt rotation.
 * 
 * 🔒 PRODUCTION FEATURES:
 * - Server-side salt generation and validation
 * - Consistent addresses across devices
 * - Audit logging and monitoring
 * - Salt rotation and security policies
 * - Rate limiting and abuse prevention
 * 
 * 🏗️ IMPLEMENTATION DETAILS:
 * - Calls backend API for salt management
 * - Caches salt locally for performance
 * - Handles network errors gracefully
 * - Implements proper error handling
 * 
 * @example
 * ```typescript
 * const saltService = new BackendSaltService('https://api.yourapp.com');
 * const salt = await saltService.getOrCreateSalt(jwtPayload);
 * ```
 */
export class BackendSaltService implements SaltService {
    private readonly saltServiceUrl: string;

    constructor(saltServiceUrl: string) {
        this.saltServiceUrl = saltServiceUrl;
    }


    async getOrCreateSalt(jwtToken: string): Promise<Result<string, AppError>> {
        try {
            // Call the API to authenticate and get salt
            // Note: jwtToken should be the raw JWT token when using BackendSaltService
            const response = await fetch(`${this.saltServiceUrl}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ jwtToken: jwtToken }),
            });

            if (!response.ok) {
                const txt = await response.text();
                let errorMessage = `Authentication failed (${response.status})`;

                // Provide more specific error messages based on status code
                if (response.status === 401) {
                    errorMessage = "Invalid authentication token. Please login again.";
                } else if (response.status === 500) {
                    errorMessage = "Backend service error. Please try again or contact support.";
                } else if (response.status === 0 || response.status >= 500) {
                    errorMessage = "Backend service is unavailable. Please check your connection and try again.";
                } else {
                    errorMessage = `Authentication failed: ${txt}`;
                }

                const error = createAppError('SaltService', errorMessage, {
                    status: response.status,
                    cause: new Error(`Salt service error: ${response.status} ${txt}`),
                    details: { responseText: txt }
                });
                return err(error);
            }

            const authData = await response.json();

            // Validate response structure
            if (!authData.salt) {
                const error = createAppError('SaltService', 'Invalid response from backend: missing salt', {
                    cause: new Error('Missing salt in response'),
                    details: { response: authData }
                });
                return err(error);
            }

            const salt = String(authData.salt);

            // Cache the salt in session storage for performance
            sessionCookieStorage.setItem("zk_user_salt", salt);

            return ok(salt);
        } catch (error) {
            // Handle different types of errors
            if (error instanceof TypeError && error.message.includes('fetch')) {
                // Network error - backend is unreachable
                const appError = createAppError('Network', "Cannot connect to backend service. Please check your internet connection and try again.", {
                    cause: error,
                    details: 'Backend service unreachable'
                });
                return err(appError);
            } else if (error instanceof Error) {
                // Re-throw with the specific error message
                const appError = createAppError('SaltService', error.message, {
                    cause: error,
                    details: 'Backend salt service error'
                });
                return err(appError);
            } else {
                // Unknown error
                const appError = createAppError('SaltService', "Failed to get user salt from backend service. Please try again or contact support.", {
                    cause: error,
                    details: 'Unknown error in salt service'
                });
                return err(appError);
            }
        }
    }

    clearSalt(): void {
        sessionCookieStorage.removeItem("zk_user_salt");
    }
}

/**
 * Factory function to create the appropriate salt service
 * 
 * @param useBackend - Whether to use backend service (production) or demo service
 * @param saltServiceUrl - Backend URL for salt service (if using backend)
 * @returns Salt service instance
 */
export function createSaltService(useBackend: boolean = false, saltServiceUrl?: string): SaltService {
    if (useBackend && saltServiceUrl) {
        return new BackendSaltService(saltServiceUrl);
    }
    return new DemoSaltService();
}
