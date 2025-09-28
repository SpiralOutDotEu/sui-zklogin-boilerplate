import { useEffect } from 'react';
import { useZkLoginStore as useZkLoginStoreInternal } from '@/features/auth/store';

/**
 * useCrossTabSync Hook
 * 
 * This hook enables cross-tab synchronization for zkLogin state.
 * When a user logs in or out in one tab, all other tabs are automatically updated.
 * 
 * How it works:
 * 1. Listens for 'storage' events from other tabs
 * 2. When zkLogin state changes, updates the current tab's store
 * 3. Only syncs non-sensitive data (account, JWT, salt)
 * 4. Ephemeral data (keys, proofs) are not synced for security
 * 
 * This provides a seamless experience where users don't need to
 * re-authenticate when switching between tabs.
 */
export function useCrossTabSync() {
    const { setAccount, setDecodedJwt, setSalt } = useZkLoginStoreInternal();

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            // Only process zkLogin storage events
            if (e.key === 'zklogin-storage' && e.newValue) {
                try {
                    const newState = JSON.parse(e.newValue);

                    // Update the store with the new state from other tabs
                    // Only sync non-sensitive data for security
                    if (newState.state) {
                        if (newState.state.account) {
                            setAccount(newState.state.account);
                        }
                        if (newState.state.decodedJwt) {
                            setDecodedJwt(newState.state.decodedJwt);
                        }
                        if (newState.state.salt) {
                            setSalt(newState.state.salt);
                        }
                    }
                } catch {
                    // Ignore parsing errors for storage changes
                }
            }
        };

        // Listen for storage changes from other tabs
        window.addEventListener('storage', handleStorageChange);

        // Cleanup on unmount to prevent memory leaks
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [setAccount, setDecodedJwt, setSalt]);
}
