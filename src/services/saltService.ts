import { persistentCookieStorage } from '../utils/cookieStorage';
import type { SaltService } from '../types';

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
     * @param jwtPayload - JWT payload from OAuth provider (used for user identification)
     * @returns Promise<string> - User's salt for address derivation
     * 
     * @example
     * ```typescript
     * const salt = await saltService.getOrCreateSalt(decodedJwt);
     * const address = jwtToAddress(jwtToken, salt);
     * ```
     */
    async getOrCreateSalt(jwtPayload: any): Promise<string> {
        // Try to retrieve existing salt from persistent storage
        let salt = persistentCookieStorage.getItem(this.SALT_KEY);

        if (!salt) {
            // DEMO ONLY: Generate random salt client-side
            // In production, this should call a secure backend salt service
            // The salt should be consistent for the same user across devices

            // Generate 16 random bytes using cryptographically secure random number generator
            const rand = crypto.getRandomValues(new Uint8Array(16));

            // Convert random bytes to BigInt (16-byte integer)
            // This creates a 128-bit salt value
            let big = 0n;
            for (let i = 0; i < 16; i++) {
                big = big * 256n + BigInt(rand[i]);
            }
            salt = big.toString();

            // Store salt in persistent cookies (30-day expiration)
            // This ensures the salt persists across browser sessions
            persistentCookieStorage.setItem(this.SALT_KEY, salt);
        }

        return salt as string;
    }

    clearSalt(): void {
        persistentCookieStorage.removeItem(this.SALT_KEY);
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

    async getOrCreateSalt(jwtPayload: any): Promise<string> {
        try {
            const response = await fetch(`${this.saltServiceUrl}/api/salt`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ jwt: jwtPayload }),
            });

            if (!response.ok) {
                throw new Error(`Salt service error: ${response.statusText}`);
            }

            const { salt } = await response.json();

            // Cache the salt locally for performance
            persistentCookieStorage.setItem("zk_user_salt", salt);

            return salt;
        } catch (error) {
            console.error("Error fetching salt from backend:", error);
            throw new Error("Failed to get user salt from backend service");
        }
    }

    clearSalt(): void {
        persistentCookieStorage.removeItem("zk_user_salt");
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
