import { z } from 'zod';

/**
 * Configuration Schema with Zod Validation
 * 
 * This centralized configuration system provides:
 * - Type-safe environment variable validation
 * - Runtime configuration validation
 * - Dynamic redirect URL generation
 * - Clear error messages for missing/invalid config
 * 
 * @example
 * ```typescript
 * import { config } from './config';
 * console.log(config.googleClientId); // Type-safe access
 * ```
 */

// ============================================================================
// CONFIGURATION SCHEMA
// ============================================================================

const configSchema = z.object({
    // OAuth Configuration
    googleClientId: z.string().min(1, 'Google Client ID is required'),

    // Dynamic redirect URL generation
    redirectUrl: z.url('Invalid redirect URL format'),

    // ZK Prover Service
    proverUrl: z.url('Invalid prover URL format').default('https://prover-dev.mystenlabs.com/v1'),

    // Salt Service Configuration
    useBackendSaltService: z.boolean().default(false),
    saltServiceUrl: z.url('Invalid salt service URL').optional(),

    // Sui Blockchain Configuration
    suiRpcUrl: z.url('Invalid Sui RPC URL').default('https://fullnode.devnet.sui.io:443'),

    // Explorer Configuration
    explorerObjectBaseUrl: z.url('Invalid explorer URL').optional(),

    // Development Configuration
    isDevelopment: z.boolean().default(import.meta.env.DEV),
    logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate dynamic redirect URL based on current domain
 * 
 * This function automatically constructs the redirect URL using the current
 * domain and appends '/auth/callback'. This allows the same configuration
 * to work across different environments (localhost, staging, production).
 * 
 * @param baseUrl - Optional base URL override (defaults to current origin)
 * @returns Complete redirect URL with /auth/callback path
 * 
 * @example
 * ```typescript
 * // In development: http://localhost:5173/auth/callback
 * // In production: https://yourapp.com/auth/callback
 * const redirectUrl = generateRedirectUrl();
 * ```
 */
const generateRedirectUrl = (baseUrl?: string): string => {
    const origin = baseUrl || window.location.origin;
    return `${origin}/auth/callback`;
};

/**
 * Get environment variable with fallback
 * 
 * @param key - Environment variable key
 * @param fallback - Fallback value if not set
 * @returns Environment variable value or fallback
 */
const getEnvVar = (key: string, fallback?: string): string | undefined => {
    return import.meta.env[key] || fallback;
};

// ============================================================================
// CONFIGURATION PARSING
// ============================================================================

/**
 * Parse and validate configuration from environment variables
 * 
 * This function:
 * 1. Reads environment variables
 * 2. Generates dynamic redirect URL if not provided
 * 3. Validates all configuration values using Zod schema
 * 4. Throws descriptive errors for invalid configuration
 * 
 * @returns Validated configuration object
 * @throws Error if configuration validation fails
 */
const parseConfig = () => {
    try {
        // Get redirect URL from env or generate dynamically
        const envRedirectUrl = getEnvVar('VITE_REDIRECT_URL');
        const redirectUrl = envRedirectUrl || generateRedirectUrl();

        // Parse configuration
        const rawConfig = {
            googleClientId: getEnvVar('VITE_GOOGLE_CLIENT_ID'),
            redirectUrl,
            proverUrl: getEnvVar('VITE_ZK_PROVER_URL'),
            useBackendSaltService: getEnvVar('VITE_USE_BACKEND_SALT_SERVICE') === 'true',
            saltServiceUrl: getEnvVar('VITE_SALT_SERVICE_URL'),
            suiRpcUrl: getEnvVar('VITE_SUI_RPC_URL'),
            explorerObjectBaseUrl: getEnvVar('VITE_EXPLORER_OBJECT_BASE_URL'),
            isDevelopment: import.meta.env.DEV,
            logLevel: getEnvVar('VITE_LOG_LEVEL', 'info') as 'debug' | 'info' | 'warn' | 'error',
        };

        // Validate configuration
        return configSchema.parse(rawConfig);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.issues.map((err: z.core.$ZodIssue) =>
                `${err.path.join('.')}: ${err.message}`
            ).join('\n');

            throw new Error(`Configuration validation failed:\n${errorMessages}`);
        }
        throw error;
    }
};

// ============================================================================
// EXPORTED CONFIGURATION
// ============================================================================

/**
 * Validated application configuration
 * 
 * This object contains all validated configuration values with full type safety.
 * Access configuration values directly from this object throughout the application.
 * 
 * @example
 * ```typescript
 * import { config } from './config';
 * 
 * // Type-safe access
 * const clientId = config.googleClientId;
 * const redirectUrl = config.redirectUrl;
 * 
 * // Conditional logic based on environment
 * if (config.isDevelopment) {
 *   console.log('Running in development mode');
 * }
 * ```
 */
export const config = parseConfig();

/**
 * Configuration type for TypeScript inference
 * 
 * This type is automatically inferred from the Zod schema and provides
 * full type safety for configuration values throughout the application.
 */
export type Config = z.infer<typeof configSchema>;

// ============================================================================
// CONFIGURATION VALIDATION HELPERS
// ============================================================================

/**
 * Check if configuration is valid for production deployment
 * 
 * @returns Object with validation results and missing requirements
 */
export const validateProductionConfig = () => {
    const issues: string[] = [];

    if (!config.googleClientId) {
        issues.push('Google Client ID is required for production');
    }

    if (config.useBackendSaltService && !config.saltServiceUrl) {
        issues.push('Salt Service URL is required when using backend salt service');
    }

    if (config.isDevelopment) {
        issues.push('Application is running in development mode');
    }

    return {
        isValid: issues.length === 0,
        issues,
        config: config as Config,
    };
};

/**
 * Get configuration summary for debugging
 * 
 * @returns Safe configuration summary (excludes sensitive data)
 */
export const getConfigSummary = () => {
    return {
        redirectUrl: config.redirectUrl,
        proverUrl: config.proverUrl,
        useBackendSaltService: config.useBackendSaltService,
        saltServiceUrl: config.saltServiceUrl ? '***configured***' : 'not configured',
        suiRpcUrl: config.suiRpcUrl,
        isDevelopment: config.isDevelopment,
        logLevel: config.logLevel,
    };
};
