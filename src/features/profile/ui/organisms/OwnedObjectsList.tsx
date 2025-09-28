import React, { useState, useEffect } from 'react';
import { LoadingSpinner, Panel } from '@/shared/ui/atoms';
import { getConfig } from '@/config';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface OwnedObject {
  data?: {
    objectId: string;
    [key: string]: unknown;
  };
}

interface OwnedObjectsListProps {
  /** User account address */
  address: string;
  /** Sui client instance */
  client: import('@mysten/sui/client').SuiClient;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STYLES = {
  title: 'text-2xl font-bold text-white mb-6',
  list: 'space-y-3',
  objectItem: 'bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors',
  objectContent: 'flex items-center justify-between',
  objectId: 'font-mono text-sm flex-1 min-w-0',
  objectLink: 'text-blue-400 hover:text-blue-300 underline break-all',
  noObjects: 'text-center py-8 text-white/60',
  loadingContainer: 'text-center py-8 text-white/60',
  loadingSpinner: 'flex items-center justify-center gap-2',
  errorContainer: 'text-center py-8 text-white/60',
  errorText: 'text-red-400',
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * OwnedObjectsList Component
 *
 * Displays a list of objects owned by the user on the Sui blockchain.
 * Fetches and displays objects with explorer links.
 *
 * @param props - Component props
 * @returns JSX element
 */
export default function OwnedObjectsList({
  address,
  client,
  className = '',
}: OwnedObjectsListProps) {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================

  const [objects, setObjects] = useState<OwnedObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    const fetchObjects = async (): Promise<void> => {
      if (!address || !client) return;

      setLoading(true);
      setError(null);

      try {
        const data = await client.getOwnedObjects({
          owner: address,
        });
        setObjects(data.data || []);
      } catch {
        setError('Failed to load objects');
      } finally {
        setLoading(false);
      }
    };

    fetchObjects();
  }, [address, client]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const getExplorerUrl = (objectId: string): string => {
    const configResult = getConfig();
    if (!configResult.ok) {
      return `https://suiscan.xyz/devnet/object/${objectId}`;
    }
    const baseUrl = configResult.data.explorerObjectBaseUrl || 'https://suiscan.xyz/devnet/object';
    return `${baseUrl}/${objectId}`;
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return (
      <div className={`${STYLES.container} ${className}`}>
        <h2 className={STYLES.title}>Your Objects</h2>
        <div className={STYLES.loadingContainer}>
          <div className={STYLES.loadingSpinner}>
            <LoadingSpinner size='sm' variant='white' />
            <span>Loading your objects...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${STYLES.container} ${className}`}>
        <h2 className={STYLES.title}>Your Objects</h2>
        <div className={STYLES.errorContainer}>
          <span className={STYLES.errorText}>❌ {error}</span>
        </div>
      </div>
    );
  }

  if (objects.length === 0) {
    return (
      <div className={`${STYLES.container} ${className}`}>
        <h2 className={STYLES.title}>Your Objects</h2>
        <div className={STYLES.noObjects}>
          <span>📦 No objects found</span>
          <p className='text-sm mt-2'>Your owned objects will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <Panel variant='glass' size='lg' className={className}>
      <h2 className={STYLES.title}>Your Objects</h2>
      <div className={STYLES.list}>
        {objects.map(object => (
          <div key={object.data?.objectId} className={STYLES.objectItem}>
            <div className={STYLES.objectContent}>
              <div className={STYLES.objectId}>{object.data?.objectId}</div>
              <a
                href={getExplorerUrl(object.data?.objectId || '')}
                target='_blank'
                rel='noopener noreferrer'
                className={STYLES.objectLink}
              >
                View in Explorer →
              </a>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
