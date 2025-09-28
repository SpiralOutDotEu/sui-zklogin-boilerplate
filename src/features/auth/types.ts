// Auth feature types
import type { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import type { SuiClient } from '@mysten/sui/client';
import type { Result, AppError } from '@/shared/lib';
import type { ZkLoginService } from './services/zkLoginService';

// Internal store state (includes all internal properties)
export interface ZkLoginStoreState {
    // State properties
    account: { address: string } | null;
    decodedJwt: JwtPayload | null;
    isRestoring: boolean;
    salt: string | null;
    status: 'idle' | 'loading' | 'success' | 'error';
    error: string | null;
    zkLoginService: ZkLoginService;

    // Internal setters
    setAccount: (account: { address: string } | null) => void;
    setDecodedJwt: (jwt: JwtPayload | null) => void;
    setIsRestoring: (restoring: boolean) => void;
    setSalt: (salt: string | null) => void;
    setStatus: (status: 'idle' | 'loading' | 'success' | 'error') => void;
    setError: (error: string | null) => void;

    // Public API methods
    loginWithProvider: (provider: "google", returnTo?: string) => Promise<void>;
    completeLogin: (jwt: string | null, returnTo: string) => Promise<void>;
    ensureZkSession: () => Promise<ZkSession | null>;
    logout: () => void;
    clearSalt: () => void;
    clearError: () => void;
    checkSessionValidity: () => Promise<{ isValid: boolean; sessionInfo?: unknown; error?: string }>;
    ensureValidSession: (returnTo?: string) => Promise<ZkSession | null>;
}

// Public interface (what components see)
export interface ZkLoginState {
    account: { address: string } | null;
    decodedJwt: JwtPayload | null;
    isRestoring: boolean;
    salt: string | null;
    status: 'idle' | 'loading' | 'success' | 'error';
    error: string | null;
    client: import('@mysten/sui/client').SuiClient;
    loginWithProvider: (provider: "google", returnTo?: string) => Promise<void>;
    completeLogin: (jwt: string | null, returnTo: string) => Promise<void>;
    ensureZkSession: () => Promise<ZkSession | null>;
    logout: () => void;
    clearSalt: () => void;
    clearError: () => void;
    checkSessionValidity: () => Promise<{ isValid: boolean; sessionInfo?: unknown; error?: string }>;
    ensureValidSession: (returnTo?: string) => Promise<ZkSession | null>;
}

export interface JwtPayload {
    iss: string;
    aud: string;
    sub: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
    picture?: string;
    iat: number;
    exp: number;
    [key: string]: unknown;
}

export interface GoogleJwtPayload extends JwtPayload {
    email: string;
    email_verified: boolean;
    name: string;
    picture: string;
}

export interface ZkSession {
    ephemeralKeyPair: Ed25519Keypair;
    maxEpoch: number;
    currentEpoch: number;
    jwtRandomness: string;
    jwtToken: string;
    proof: string;
    userAddress: string;
    address: string; // Alias for userAddress
    getSignature: (userSignature: string) => string;
    signTransaction: (transaction: import('@mysten/sui/transactions').Transaction, client: import('@mysten/sui/client').SuiClient) => Promise<{ bytes: Uint8Array; signature: string }>;
}

export interface SaltService {
    getOrCreateSalt: (jwt: string) => Promise<Result<string, AppError>>;
    clearSalt: () => void;
}

export interface ZkLoginContext extends ZkLoginState {
    client: SuiClient;
}
