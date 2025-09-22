import type { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import type { SuiClient } from '@mysten/sui/client';

/**
 * TypeScript Type Definitions for zkLogin
 * 
 * This file contains all the type definitions used throughout the zkLogin implementation.
 * These types ensure type safety and provide clear interfaces for the zkLogin flow.
 * 
 * Organization:
 * - Domain Types: Core business entities (JWT, Account, Session)
 * - Service Types: Service contracts and configurations
 * - Store Types: State management types
 * - Context Types: React context types
 */

/**
 * Generic JWT Payload Type
 * 
 * Represents the decoded payload of a JWT token from any OAuth provider.
 * All fields are optional to handle different OAuth providers' JWT structures.
 */
export type JwtPayload = {
  iss?: string        // Issuer - identifies the OAuth provider (e.g., Google)
  sub?: string        // Subject - unique user identifier within the provider
  aud?: string | string[]  // Audience - identifies the application (your app)
  email?: string      // User's email address (if provided by OAuth scope)
  exp?: number        // Expiration timestamp
  iat?: number        // Issued at timestamp
  nonce?: string      // Nonce - links JWT to specific ephemeral keypair
}

/**
 * Google OAuth JWT Payload Type
 * 
 * More specific type for Google OAuth JWTs with required fields.
 * Used when we know the JWT comes from Google and expect certain fields to be present.
 */
export type GoogleJwtPayload = {
  iss: string         // Google's issuer identifier
  sub: string         // Google's unique user ID
  aud: string | string[]  // Your app's client ID
  email?: string      // User's Gmail address
  exp: number         // Expiration timestamp
  iat: number         // Issued at timestamp
  nonce: string       // Nonce linking to ephemeral keypair
}

/**
 * User Account Type
 * 
 * Represents a zkLogin user account with their derived Sui address.
 * The address is derived from JWT + salt, not from a traditional public key.
 */
export type Account = {
  address: string     // zkLogin-derived Sui address
}

/**
 * ZkLogin Session Type
 * 
 * Represents an active zkLogin session that can be used for transaction signing.
 * This session contains all the necessary data to sign transactions with zkLogin.
 */
export type ZkSession = {
  address: string                           // User's zkLogin address
  maxEpoch: number                         // Maximum epoch until session expires
  currentEpoch: number                     // Current Sui epoch for validation
  ephemeralKeypair: Ed25519Keypair         // Temporary keypair for signing
  getSignature: (userSignature: string) => string  // Function to create zkLogin signature
}

// ============================================================================
// SERVICE TYPES
// ============================================================================

/**
 * Salt Service Interface
 * 
 * Defines the contract for salt management services.
 * This allows for different implementations (client-side demo vs backend service).
 */
export interface SaltService {
  getOrCreateSalt(jwtPayload: any): Promise<string>;
  clearSalt(): void;
}

/**
 * ZkLogin Service Configuration
 * 
 * Configuration object for the ZkLogin service.
 * Contains all necessary URLs and settings for OAuth and ZK proof generation.
 */
export interface ZkLoginServiceConfig {
  googleClientId: string;
  redirectUrl: string;
  proverUrl: string;
  useBackendSaltService?: boolean;
  saltServiceUrl?: string;
}

/**
 * Login Initiation Result
 * 
 * Result of initiating the OAuth login process.
 * Contains either a redirect URL or an error message.
 */
export interface LoginResult {
  success: boolean;
  error?: string;
  redirectUrl?: string;
}

/**
 * Login Completion Result
 * 
 * Result of completing the OAuth login process.
 * Contains account information and decoded JWT on success.
 */
export interface CompleteLoginResult {
  success: boolean;
  error?: string;
  account?: Account;
  decodedJwt?: JwtPayload;
}

/**
 * ZkLogin Session Creation Result
 * 
 * Result of creating a zkLogin session for transaction signing.
 * Contains the session object on success.
 */
export interface ZkSessionResult {
  success: boolean;
  session?: ZkSession;
  error?: string;
}

// ============================================================================
// STORE TYPES
// ============================================================================

/**
 * ZkLogin Store State Interface
 * 
 * Defines the shape of the Zustand store state.
 * Contains all the state variables and actions for zkLogin functionality.
 */
export interface ZkLoginState {
  // Account state
  account: Account | null;
  decodedJwt: JwtPayload | null;
  isRestoring: boolean;
  salt: string | null;

  // Service instance
  zkLoginService: any; // ZkLoginService instance

  // Basic setters
  setAccount: (account: Account | null) => void;
  setDecodedJwt: (jwt: JwtPayload | null) => void;
  setIsRestoring: (restoring: boolean) => void;
  setSalt: (salt: string | null) => void;

  // Actions (delegate to service)
  loginWithProvider: (provider: "google", returnTo?: string) => Promise<void>;
  completeLogin: (idToken: string | null, returnTo: string) => Promise<void>;
  ensureZkSession: () => Promise<ZkSession | null>;
  logout: () => void;
  clearSalt: () => void;

  // Session validation and management
  checkSessionValidity: () => Promise<{ isValid: boolean, error?: string, sessionInfo?: any }>;
  ensureValidSession: (returnTo?: string) => Promise<ZkSession | null>;
}

// ============================================================================
// CONTEXT TYPES
// ============================================================================

/**
 * ZkLogin Context Type
 * 
 * Defines the shape of the React context for zkLogin.
 * Provides zkLogin state and functionality to components.
 */
export type ZkLoginContext = {
  // Account state
  account: Account | null;
  decodedJwt: JwtPayload | null;
  isRestoring: boolean;
  salt: string | null;

  // Sui client
  client: SuiClient;

  // Actions
  loginWithProvider: (provider: "google", returnTo?: string) => Promise<void>;
  completeLogin: (idToken: string | null, returnTo: string) => Promise<void>;
  ensureZkSession: () => Promise<ZkSession | null>;
  logout: () => void;
  clearSalt: () => void;

  // Session validation and management
  checkSessionValidity: () => Promise<{ isValid: boolean, error?: string, sessionInfo?: any }>;
  ensureValidSession: (returnTo?: string) => Promise<ZkSession | null>;
};
