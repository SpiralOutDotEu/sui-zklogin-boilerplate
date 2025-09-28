import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import {
    jwtToAddress,
    genAddressSeed,
    getZkLoginSignature,
    getExtendedEphemeralPublicKey,
    generateNonce,
    generateRandomness
} from '@mysten/sui/zklogin';
import { jwtDecode } from 'jwt-decode';
import type {
    JwtPayload,
    GoogleJwtPayload,
    SaltService,
    ZkSession
} from '@/features/auth/types';
import { Result, ok, err, isErr } from '@/shared/lib';
import { createAppError, type AppError } from '@/shared/lib';
import { httpClient } from '@/shared/lib';
import { getConfig, type Config } from '@/config';
import { client as sharedClient } from '@/shared/lib';
import { sessionCookieStorage } from '@/shared/utils';
import { createSaltService } from './saltService';

/**
 * ZkLogin Service - Core Business Logic Handler
 * 
 * This service encapsulates all zkLogin business logic, following the Service Layer pattern.
 * It provides a clean, testable API that separates concerns from UI and state management.
 * 
 * 🎯 RESPONSIBILITIES:
 * - OAuth flow management (Google authentication)
 * - Cryptographic operations (keypairs, nonces, signatures)
 * - API communication with ZK prover service
 * - Salt management via dependency injection
 * - Session creation for transaction signing
 * - Error handling with structured results
 * 
 * 🏗️ ARCHITECTURE:
 * - Uses dependency injection for salt service
 * - Returns structured results instead of throwing exceptions
 * - Environment-based configuration
 * - Follows single responsibility principle
 * 
 * 🔐 ZKLOGIN FLOW INTEGRATION:
 * This service implements steps 1-11 of the zkLogin process:
 * 1-5: OAuth initiation and ephemeral key generation
 * 6-8: JWT processing and address derivation
 * 9: ZK proof generation
 * 10-11: Session creation for transaction signing
 * 
 * @example
 * ```typescript
 * const service = new ZkLoginService(config);
 * const result = await service.initiateLogin('/dashboard');
 * if (result.success) {
 *   window.location.href = result.redirectUrl;
 * }
 * ```
 */

export class ZkLoginService {
    private saltService: SaltService;
    private config: Config;

    constructor() {
        const configResult = getConfig();
        if (!configResult.ok) {
            throw new Error(`Configuration failed: ${configResult.error.message}`);
        }
        this.config = configResult.data;

        this.saltService = createSaltService(
            this.config.useBackendSaltService,
            this.config.saltServiceUrl
        );
    }

    /**
     * Initiate OAuth Login with Google - ZKLOGIN STEPS 1-5
     * 
     * This method starts the zkLogin authentication flow by generating ephemeral
     * cryptographic material and redirecting the user to Google OAuth.
     * 
     * 🔐 ZKLOGIN STEPS IMPLEMENTED:
     * 1. Generate ephemeral Ed25519 keypair for transaction signing
     * 2. Get current Sui epoch and set keypair validity (2 epochs from now)
     * 3. Generate cryptographically secure randomness for nonce
     * 4. Create nonce linking ephemeral keypair to OAuth request
     * 5. Build Google OAuth URL with nonce and redirect user
     * 
     * 🔒 SECURITY CONSIDERATIONS:
     * - Ephemeral keypair is temporary and tied to session
     * - Nonce prevents replay attacks and links JWT to specific keypair
     * - Randomness ensures nonce uniqueness
     * - Session data stored in secure cookies (expires on browser close)
     * 
     * @param returnTo - URL to redirect user to after successful authentication
     * @returns Promise<LoginResult> - Success with redirect URL or error details
     * 
     * @example
     * ```typescript
     * const result = await zkLoginService.initiateLogin('/dashboard');
     * if (result.success) {
     *   window.location.href = result.redirectUrl; // Redirect to Google
     * } else {
     *   console.error('Login failed:', result.error);
     * }
     * ```
     */
    async initiateLogin(returnTo?: string): Promise<Result<{ redirectUrl: string }, AppError>> {
        try {
            // ZKLOGIN STEP 1: Generate ephemeral keypair for transaction signing
            // This is a temporary Ed25519 keypair that will be used to sign transactions
            // It's different from traditional wallets as it's ephemeral and tied to the session
            const ephemeralKeypair = new Ed25519Keypair();

            // ZKLOGIN STEP 2: Get current epoch from Sui blockchain
            // The ephemeral keypair has a limited lifespan tied to Sui epochs
            // We set it to be valid for 2 epochs from now to provide reasonable session time
            const { epoch } = await sharedClient.getLatestSuiSystemState();
            const currentEpochAtLogin = Number(epoch);
            const maxEpoch = currentEpochAtLogin + 2; // Valid for 2 epochs from now

            // ZKLOGIN STEP 3: Generate randomness for nonce creation
            // This randomness is used to create a unique nonce that prevents replay attacks
            const randomness = generateRandomness();

            // ZKLOGIN STEP 4: Generate nonce for OAuth flow
            // The nonce contains the ephemeral public key, max epoch, and randomness
            // This ensures the JWT can only be used with this specific ephemeral keypair
            const nonce = generateNonce(ephemeralKeypair.getPublicKey(), maxEpoch, BigInt(randomness));

            // Store ephemeral session data in session cookies (expires when browser closes)
            // This ensures the data is available across page refreshes but not persistent
            sessionCookieStorage.setItem("zk_ephemeral_keypair", ephemeralKeypair.getSecretKey());
            sessionCookieStorage.setItem("zk_max_epoch", String(maxEpoch));
            sessionCookieStorage.setItem("zk_jwt_randomness", randomness);

            // ZKLOGIN STEP 5: Build OAuth URL and redirect
            // The nonce is embedded in the OAuth request to link the JWT to this ephemeral keypair
            const redirectUrl = this.buildGoogleAuthUrl(nonce, returnTo);

            return ok({ redirectUrl });
        } catch (error) {
            const appError = createAppError('ZkLogin', 'Failed to initiate login process', {
                cause: error,
                details: { step: 'initiateLogin' }
            });
            return err(appError);
        }
    }

    /**
     * Complete OAuth Login Process - ZKLOGIN STEPS 6-9
     * 
     * This method completes the zkLogin authentication flow by processing the JWT
     * returned from Google OAuth, deriving the user's zkLogin address, and generating
     * the necessary ZK proof for transaction signing.
     * 
     * 🔐 ZKLOGIN STEPS IMPLEMENTED:
     * 6. Decode and validate JWT from OAuth provider
     * 7. Get or create user salt for address derivation (via salt service)
     * 8. Derive zkLogin address from JWT + salt
     * 9. Generate ZK proof from prover service
     * 
     * 🔒 SECURITY CONSIDERATIONS:
     * - JWT contains user identity and nonce for verification
     * - Salt unlinks OAuth identity from blockchain address
     * - ZK proof proves ownership without revealing credentials
     * - All sensitive data stored in secure session cookies
     * 
     * 🏗️ DEPENDENCIES:
     * - SaltService: For salt management (demo or backend)
     * - ZK Prover Service: For proof generation
     * - Session Cookie Storage: For temporary data persistence
     * 
     * @param idToken - JWT token returned from Google OAuth
     * @param returnTo - URL to redirect user to after completion
     * @returns Promise<CompleteLoginResult> - Success with account/JWT or error details
     * 
     * @example
     * ```typescript
     * const result = await zkLoginService.completeLogin(idToken, '/dashboard');
     * if (result.success) {
     *   console.log('User address:', result.account?.address);
     *   console.log('User email:', result.decodedJwt?.email);
     * } else {
     *   console.error('Login completion failed:', result.error);
     * }
     * ```
     */
    async completeLogin(idToken: string, _returnTo: string): Promise<Result<{ account: { address: string }; decodedJwt: JwtPayload }, AppError>> {
        try {
            // ZKLOGIN STEP 6: Decode and validate JWT from OAuth provider
            // The JWT contains user identity information and the nonce we generated
            // This links the OAuth response to our specific ephemeral keypair
            const decoded = jwtDecode(idToken) as JwtPayload;

            // Store JWT token in session cookies for later use in transaction signing
            // This token will be used to create zkLogin signatures
            sessionCookieStorage.setItem("zk_jwt_token", idToken);

            // ZKLOGIN STEP 7: Get or create user salt for address derivation
            // The salt is crucial for privacy - it unlinks the OAuth identity from the blockchain address
            // This is handled by the injected salt service (demo or backend)
            const saltResult = await this.saltService.getOrCreateSalt(idToken);

            if (isErr(saltResult)) {
                // Return error 
                const appError = createAppError('SaltService', `Salt service error: ${saltResult.error.message}. Please try again.`, {
                    cause: saltResult.error,
                    details: { step: 'completeLogin' }
                });
                return err(appError);
            }

            const salt = saltResult.data;

            // ZKLOGIN STEP 8: Derive zkLogin address from JWT and salt
            // This creates a unique Sui address that's not linked to the user's OAuth identity
            // The same JWT + salt combination will always produce the same address
            const address = jwtToAddress(idToken, salt);

            // ZKLOGIN STEP 9: Generate or retrieve ZK proof
            // The ZK proof proves that the user owns the OAuth credential without revealing it
            // This is required for all zkLogin transactions
            const proofResult = await this.generateZkProof(idToken, salt);
            if (isErr(proofResult)) {
                return err(proofResult.error);
            }

            // Store zkLogin address and ZK proof in session cookies for transaction signing
            // These will be used later when the user wants to send transactions
            sessionCookieStorage.setItem("zk_user_address", address);
            sessionCookieStorage.setItem("zk_proof_data", JSON.stringify(proofResult.data));

            return ok({
                account: { address },
                decodedJwt: decoded
            });
        } catch (error) {
            const appError = createAppError('ZkLogin', 'Failed to complete login process', {
                cause: error,
                details: { step: 'completeLogin' }
            });
            return err(appError);
        }
    }

    /**
     * Create ZkLogin Session for Transaction Signing - ZKLOGIN STEPS 10-11
     * 
     * This method creates a complete zkLogin session that can be used for transaction
     * signing. It restores all necessary cryptographic material from session storage
     * and creates a signature function that combines ephemeral signatures with ZK proofs.
     * 
     * 🔐 ZKLOGIN STEPS IMPLEMENTED:
     * 10. Restore session data from cookies (ephemeral keypair, proof, etc.)
     * 11. Create signature function for zkLogin transaction signing
     * 
     * 🔒 SECURITY CONSIDERATIONS:
     * - All session data is restored from secure session cookies
     * - JWT is validated before creating signature function
     * - Signature function combines ephemeral signature with ZK proof
     * - Session expires when ephemeral keypair expires (2 epochs)
     * - Epoch validation prevents use of expired sessions
     * 
     * 🏗️ SESSION COMPONENTS:
     * - address: User's zkLogin address
     * - userAddress: Alias for address
     * - maxEpoch: Maximum epoch until session expires
     * - currentEpoch: Current Sui epoch for validation
     * - ephemeralKeyPair: Temporary keypair for signing
     * - jwtRandomness: Randomness used in JWT nonce
     * - jwtToken: JWT token from OAuth provider
     * - proof: ZK proof data for transaction signing
     * - getSignature: Function that creates zkLogin signatures
     * 
     * @returns Promise<Result<ZkSession, AppError>> - Success with session or error details
     * 
     * @example
     * ```typescript
     * const result = await zkLoginService.createSession();
     * if (result.ok) {
     *   const session = result.data;
     *   // Use session for transaction signing
     *   const txb = new Transaction();
     *   const { bytes, signature } = await txb.sign({ signer: session.ephemeralKeyPair });
     *   const zkLoginSignature = session.getSignature(signature);
     * }
     * ```
     */
    async createSession(): Promise<Result<ZkSession, AppError>> {
        try {
            // ZKLOGIN STEP 10: Restore session data from cookies
            // This handles page refreshes and cross-tab synchronization
            // All ephemeral data should be available from the OAuth flow
            const ephemeralKeypair = this.restoreEphemeralKeypair();
            const maxEpoch = this.restoreMaxEpoch();
            const randomness = this.restoreRandomness();
            const salt = this.restoreSalt();
            const proof = this.restoreProof();
            const jwtToken = sessionCookieStorage.getItem("zk_jwt_token") as string | null;
            const address = sessionCookieStorage.getItem("zk_user_address") as string | null;

            // Validate that all required session data is available
            if (!ephemeralKeypair || !maxEpoch || !randomness || !salt || !proof || !jwtToken || !address) {
                const appError = createAppError('ZkLogin', 'Incomplete session data - user needs to login again', {
                    details: {
                        step: 'createSession',
                        missing: {
                            ephemeralKeypair: !!ephemeralKeypair,
                            maxEpoch: !!maxEpoch,
                            randomness: !!randomness,
                            salt: !!salt,
                            proof: !!proof,
                            jwtToken: !!jwtToken,
                            address: !!address
                        }
                    }
                });
                return err(appError);
            }

            // EPOCH VALIDATION: Check if session has expired
            // This prevents the "ZKLogin expired at epoch X, current epoch Y" error
            const currentEpoch = await this.getCurrentEpoch();
            if (currentEpoch > maxEpoch) {
                // Session has expired - clear session data and return error
                this.clearSession();
                const appError = createAppError('ZkLogin', `Session expired: zkLogin expired at epoch ${maxEpoch}, current epoch ${currentEpoch}. Please login again.`, {
                    details: {
                        step: 'createSession',
                        maxEpoch,
                        currentEpoch
                    }
                });
                return err(appError);
            }

            // ZKLOGIN STEP 11: Create signature function for transaction signing
            // This function combines the ephemeral signature with the ZK proof to create a zkLogin signature
            const getSignature = (userSignature: string) => {
                // Decode JWT to extract required fields for address seed generation
                const decodedJwt = jwtDecode(jwtToken) as GoogleJwtPayload;

                // Validate required JWT fields
                if (!decodedJwt.sub || !decodedJwt.aud) {
                    throw new Error("Invalid JWT: missing required fields (sub, aud)");
                }

                // Handle aud field which can be string or string array
                const audValue = Array.isArray(decodedJwt.aud) ? decodedJwt.aud[0] : decodedJwt.aud;
                const saltBigInt = BigInt(salt);

                // Generate address seed for zkLogin signature
                // This ensures the signature is tied to the specific user and salt
                const addressSeed = genAddressSeed(
                    saltBigInt,
                    "sub",
                    decodedJwt.sub,
                    audValue
                ).toString();

                // Create the final zkLogin signature combining ephemeral signature and ZK proof
                const zkLoginSignature = getZkLoginSignature({
                    inputs: {
                        ...(proof as {
                            proofPoints: {
                                a: Iterable<string> & { length: number };
                                b: Iterable<Iterable<string> & { length: number }> & { length: number };
                                c: Iterable<string> & { length: number };
                            };
                            issBase64Details: {
                                value: string;
                                indexMod4: number;
                            };
                            headerBase64: string;
                        }),
                        addressSeed,
                    },
                    maxEpoch,
                    userSignature,
                });

                return zkLoginSignature;
            };

            // Create signTransaction method for easy transaction signing
            const signTransaction = async (transaction: import('@mysten/sui/transactions').Transaction, client: import('@mysten/sui/client').SuiClient) => {
                const { bytes, signature: userSignature } = await transaction.sign({
                    client,
                    signer: ephemeralKeypair,
                });
                return {
                    bytes: bytes as unknown as Uint8Array,
                    signature: userSignature
                };
            };

            return ok({
                address,
                userAddress: address, // Alias for userAddress
                maxEpoch,
                currentEpoch,
                ephemeralKeyPair: ephemeralKeypair, // Correct property name
                jwtRandomness: randomness.toString(),
                jwtToken,
                proof: JSON.stringify(proof),
                getSignature,
                signTransaction
            });
        } catch (error) {
            const appError = createAppError('ZkLogin', 'Failed to create session', {
                cause: error,
                details: { step: 'createSession' }
            });
            return err(appError);
        }
    }

    /**
     * Clear all session data
     */
    clearSession(): void {
        // Clear all zkLogin session cookies
        sessionCookieStorage.removeItem("zk_ephemeral_keypair");
        sessionCookieStorage.removeItem("zk_max_epoch");
        sessionCookieStorage.removeItem("zk_jwt_randomness");
        sessionCookieStorage.removeItem("zk_proof_data");
        sessionCookieStorage.removeItem("zk_jwt_token");
        sessionCookieStorage.removeItem("zk_user_address");
    }

    /**
     * Clear user salt (generates new address)
     */
    clearSalt(): void {
        this.saltService.clearSalt();
    }

    /**
     * Clear all zkLogin data (session + salt)
     * This clears the core zkLogin data but not Zustand persistence
     */
    clearAll(): void {
        // Clear session cookies
        this.clearSession();

        // Clear salt (session cookie only)
        this.clearSalt();
    }

    // Private helper methods

    /**
     * Get Current Sui Epoch
     * 
     * Fetches the current epoch from the Sui blockchain.
     * This is used to validate if a zkLogin session has expired.
     * 
     * @returns Promise<number> - Current Sui epoch
     */
    private async getCurrentEpoch(): Promise<number> {
        try {
            const { epoch } = await sharedClient.getLatestSuiSystemState();
            const currentEpoch = Number(epoch);
            return currentEpoch;
        } catch {
            // Return a high epoch number to force session expiration if we can't fetch current epoch
            return Number.MAX_SAFE_INTEGER;
        }
    }

    private buildGoogleAuthUrl(nonce: string, returnTo?: string): string {
        const state = encodeURIComponent(returnTo || "/");
        const params = new URLSearchParams({
            client_id: this.config.googleClientId,
            redirect_uri: this.config.redirectUrl,
            response_type: "id_token",
            scope: "openid email",
            nonce: nonce,
            state: state,
            prompt: "select_account",
        });
        return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    }


    private async generateZkProof(idToken: string, salt: string): Promise<Result<unknown, AppError>> {
        try {
            // Restore ephemeral data
            const ephemeralKeypair = this.restoreEphemeralKeypair();
            const maxEpoch = this.restoreMaxEpoch();
            const randomness = this.restoreRandomness();

            if (!ephemeralKeypair || !maxEpoch || !randomness) {
                const appError = createAppError('ZkLogin', 'Missing ephemeral session data', {
                    details: { step: 'generateZkProof' }
                });
                return err(appError);
            }

            const extended = getExtendedEphemeralPublicKey(ephemeralKeypair.getPublicKey());
            const nonce = generateNonce(ephemeralKeypair.getPublicKey(), maxEpoch, randomness);

            // Verify JWT nonce matches our expected nonce
            const decoded = jwtDecode(idToken) as JwtPayload;
            const jwtNonce = decoded.nonce;

            if (jwtNonce !== nonce) {
                const appError = createAppError('ZkLogin', 'JWT nonce does not match expected nonce', {
                    details: {
                        step: 'generateZkProof',
                        jwtNonce,
                        expectedNonce: nonce
                    }
                });
                return err(appError);
            }

            const body = {
                jwt: idToken,
                extendedEphemeralPublicKey: extended.toString(),
                maxEpoch: String(maxEpoch),
                jwtRandomness: randomness.toString(),
                salt: salt.toString(),
                keyClaimName: "sub",
            };

            const result = await httpClient.post<unknown>(this.config.proverUrl, body);

            if (isErr(result)) {
                const appError = createAppError('ZkLogin', 'Failed to generate ZK proof from prover service', {
                    cause: result.error,
                    details: { step: 'generateZkProof', proverUrl: this.config.proverUrl }
                });
                return err(appError);
            }

            return ok(result.data);
        } catch (error) {
            const appError = createAppError('ZkLogin', 'Failed to generate ZK proof', {
                cause: error,
                details: { step: 'generateZkProof' }
            });
            return err(appError);
        }
    }

    private restoreEphemeralKeypair(): Ed25519Keypair | null {
        const privateKey = sessionCookieStorage.getItem("zk_ephemeral_keypair");
        return privateKey ? Ed25519Keypair.fromSecretKey(privateKey as string) : null;
    }

    private restoreMaxEpoch(): number | null {
        const epoch = sessionCookieStorage.getItem("zk_max_epoch");
        return epoch ? Number(epoch) : null;
    }

    private restoreRandomness(): bigint | null {
        const randomness = sessionCookieStorage.getItem("zk_jwt_randomness");
        return randomness ? BigInt(randomness as string) : null;
    }

    private restoreSalt(): string | null {
        return sessionCookieStorage.getItem("zk_user_salt") as string | null;
    }

    private restoreProof(): unknown | null {
        const proof = sessionCookieStorage.getItem("zk_proof_data");
        return proof ? JSON.parse(proof as string) : null;
    }
}

// Factory function to create service instance
export function createZkLoginService(): ZkLoginService {
    return new ZkLoginService();
}
