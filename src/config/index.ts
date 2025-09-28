import { z } from 'zod';
import { createAppError, type AppError, type Result, ok, err } from '@/shared/lib';

/**
 * Configuration Schema with Zod Validation
 * 
 * This centralized configuration system provides:
 * - Type-safe environment variable validation
 * - Runtime configuration validation
 * - Dynamic redirect URL generation (domain-agnostic)
 * - Clear error messages for missing/invalid config
 * 
 * The redirect URL is automatically generated from the current domain,
 * making the app work on any domain without hardcoded URLs.
 * 
 * @example
 * ```typescript
 * import { getConfig } from './config';
 * const configResult = getConfig();
 * if (configResult.ok) {
 *   console.log(configResult.data.googleClientId); // Type-safe access
 *   console.log(configResult.data.redirectUrl); // Auto-generated: http://localhost:5173/auth/callback
 * }
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
 * @returns Result containing the redirect URL or an error
 * 
 * @example
 * ```typescript
 * const result = generateRedirectUrl();
 * if (result.ok) {
 *   console.log(result.data); // http://localhost:5173/auth/callback
 * } else {
 *   console.error(result.error.message);
 * }
 * ```
 */
const generateRedirectUrl = (baseUrl?: string): Result<string, AppError> => {
    try {
        // Use provided baseUrl or get current domain from browser
        const origin = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');

        // Check if we have a valid origin
        if (!origin) {
            const error = createAppError('Validation', 'Cannot generate redirect URL: window.location.origin is not available', {
                details: {
                    context: 'generateRedirectUrl',
                    reason: 'Browser environment not available',
                    suggestion: 'This function must be called in a browser environment'
                }
            });
            return err(error);
        }

        const redirectUrl = `${origin}/auth/callback`;
        return ok(redirectUrl);
    } catch (error) {
        const appError = createAppError('Validation', 'Failed to generate redirect URL', {
            cause: error,
            details: { context: 'generateRedirectUrl' }
        });
        return err(appError);
    }
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
 * 2. Generates dynamic redirect URL
 * 3. Validates all configuration values using Zod schema
 * 4. Returns Result for consistent error handling
 * 
 * @returns Result containing validated configuration or error
 */
const parseConfig = (): Result<Config, AppError> => {
    try {
        // Generate redirect URL dynamically from current domain
        // This makes the app work on any domain without hardcoded URLs
        const redirectUrlResult = generateRedirectUrl();
        if (!redirectUrlResult.ok) {
            return err(redirectUrlResult.error);
        }
        const redirectUrl = redirectUrlResult.data;

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
        const validatedConfig = configSchema.parse(rawConfig);
        return ok(validatedConfig);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.issues.map((err: z.core.$ZodIssue) =>
                `${err.path.join('.')}: ${err.message}`
            ).join('\n');

            const appError = createAppError('Validation', 'Configuration validation failed', {
                cause: error,
                details: {
                    context: 'parseConfig',
                    validationErrors: errorMessages,
                    suggestion: 'Check environment variables and configuration values'
                }
            });
            return err(appError);
        }

        // Handle other errors (like AppError from generateRedirectUrl)
        if (error && typeof error === 'object' && 'kind' in error) {
            return err(error as AppError);
        }

        // Handle unknown errors
        const appError = createAppError('Unknown', 'Failed to parse configuration', {
            cause: error,
            details: { context: 'parseConfig' }
        });
        return err(appError);
    }
};

// ============================================================================
// EXPORTED CONFIGURATION
// ============================================================================

/**
 * Configuration provider with error handling
 * 
 * This function safely loads and validates configuration, providing
 * graceful error handling instead of crashing the app at startup.
 * 
 * @returns Result containing validated configuration or error
 * 
 * @example
 * ```typescript
 * import { getConfig } from './config';
 * 
 * const configResult = getConfig();
 * if (configResult.ok) {
 *   const config = configResult.data;
 *   console.log(config.googleClientId);
 * } else {
 *   console.error('Config error:', configResult.error.message);
 * }
 * ```
 */
export const getConfig = (): Result<Config, AppError> => {
    return parseConfig();
};


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
 * @returns Result with validation results and missing requirements
 */
export const validateProductionConfig = (): Result<{ isValid: boolean; issues: string[]; config: Config }, AppError> => {
    const configResult = getConfig();
    if (!configResult.ok) {
        return err(configResult.error);
    }

    const config = configResult.data;
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

    return ok({
        isValid: issues.length === 0,
        issues,
        config,
    });
};

/**
 * Get configuration summary for debugging
 * 
 * @returns Result with safe configuration summary (excludes sensitive data)
 */
export const getConfigSummary = (): Result<{
    redirectUrl: string;
    proverUrl: string;
    useBackendSaltService: boolean;
    saltServiceUrl: string;
    suiRpcUrl: string;
    isDevelopment: boolean;
    logLevel: string;
}, AppError> => {
    const configResult = getConfig();
    if (!configResult.ok) {
        return err(configResult.error);
    }

    const config = configResult.data;
    return ok({
        redirectUrl: config.redirectUrl,
        proverUrl: config.proverUrl,
        useBackendSaltService: config.useBackendSaltService,
        saltServiceUrl: config.saltServiceUrl ? '***configured***' : 'not configured',
        suiRpcUrl: config.suiRpcUrl,
        isDevelopment: config.isDevelopment,
        logLevel: config.logLevel,
    });
};
