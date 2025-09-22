import { StateStorage } from 'zustand/middleware';

/**
 * Cookie Storage Utilities for zkLogin
 * 
 * This module provides secure cookie-based storage for zkLogin data.
 * It implements two storage strategies:
 * 1. Session cookies - for ephemeral data (expires when browser closes)
 * 2. Persistent cookies - for user salt (expires in 30 days)
 * 
 * Security features:
 * - Secure flag for HTTPS
 * - SameSite=strict for CSRF protection
 * - Proper encoding/decoding of values
 */

/**
 * Synchronously get a cookie value by name
 * 
 * @param name - Cookie name to retrieve
 * @returns Cookie value or null if not found
 */
const getCookieSync = (name: string): string | null => {
    try {
        const value = document.cookie
            .split('; ')
            .find(row => row.startsWith(`${name}=`))
            ?.split('=')[1];
        return value ? decodeURIComponent(value) : null;
    } catch (error) {
        console.warn(`Failed to get cookie ${name}:`, error);
        return null;
    }
};

/**
 * Synchronously set a cookie with security options
 * 
 * @param name - Cookie name
 * @param value - Cookie value
 * @param options - Cookie options (secure, sameSite, path, expires)
 */
const setCookieSync = (name: string, value: string, options: {
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
    path?: string;
    expires?: number;
} = {}) => {
    try {
        let cookieString = `${name}=${encodeURIComponent(value)}`;

        if (options.path) {
            cookieString += `; path=${options.path}`;
        }

        if (options.secure) {
            cookieString += '; secure';
        }

        if (options.sameSite) {
            cookieString += `; samesite=${options.sameSite}`;
        }

        if (options.expires) {
            const date = new Date();
            date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            cookieString += `; expires=${date.toUTCString()}`;
        }

        document.cookie = cookieString;
    } catch (error) {
        console.warn(`Failed to set cookie ${name}:`, error);
    }
};

/**
 * Synchronously remove a cookie
 * 
 * @param name - Cookie name to remove
 * @param path - Cookie path (defaults to '/')
 */
const removeCookieSync = (name: string, path: string = '/') => {
    try {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
    } catch (error) {
        console.warn(`Failed to remove cookie ${name}:`, error);
    }
};

/**
 * Session Cookie Storage
 * 
 * Used for ephemeral zkLogin data that should expire when the browser closes.
 * This includes:
 * - Ephemeral keypair (temporary signing key)
 * - JWT token (OAuth credential)
 * - ZK proof (cryptographic proof)
 * - Max epoch (session expiration)
 * 
 * Security: No persistent storage of sensitive session data
 */
const sessionCookieStorage: StateStorage = {
    getItem: (name: string): string | null => {
        return getCookieSync(name);
    },
    setItem: (name: string, value: string): void => {
        // Session cookie (no expires means it expires when browser closes)
        setCookieSync(name, value, {
            secure: window.location.protocol === 'https:', // Only send over HTTPS in production
            sameSite: 'strict', // CSRF protection
            path: '/' // Available to entire site
        });
    },
    removeItem: (name: string): void => {
        removeCookieSync(name, '/');
    }
};

/**
 * Persistent Cookie Storage
 * 
 * Used for user salt that should persist across browser sessions.
 * The salt is crucial for address derivation and should be consistent
 * for the same user across different sessions and devices.
 * 
 * Security: Salt is not sensitive by itself but should be consistent
 */
const persistentCookieStorage: StateStorage = {
    getItem: (name: string): string | null => {
        return getCookieSync(name);
    },
    setItem: (name: string, value: string): void => {
        // Persistent cookie that expires in 30 days
        setCookieSync(name, value, {
            expires: 30, // 30 days
            secure: window.location.protocol === 'https:', // Only send over HTTPS in production
            sameSite: 'strict', // CSRF protection
            path: '/' // Available to entire site
        });
    },
    removeItem: (name: string): void => {
        removeCookieSync(name, '/');
    }
};

export { sessionCookieStorage, persistentCookieStorage };
