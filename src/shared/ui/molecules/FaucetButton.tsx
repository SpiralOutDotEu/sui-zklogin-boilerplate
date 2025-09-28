/**
 * FaucetButton Component
 *
 * A molecule component that handles requesting test tokens from the Sui devnet faucet.
 * Provides user feedback through the notification system and loading states.
 * Part of the atomic design system - handles the complete faucet interaction flow.
 */

import React, { useState } from 'react';
import { useNotifications } from '@/app/providers';
import { Button, Icon } from '@/shared/ui';
import { createAppError, type AppError, type Result, ok, err } from '@/shared/lib';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface FaucetButtonProps {
  /** User's Sui address to receive tokens */
  address: string;
  /** Optional custom button text */
  buttonText?: string;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'hero';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Full width button */
  fullWidth?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Callback when faucet request completes (success or error) */
  onComplete?: (success: boolean) => void;
}

interface FaucetResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SUI_DEVNET_FAUCET_URL = 'https://faucet.devnet.sui.io/v2/gas';

const STYLES = {
  container: 'inline-flex items-center',
  button: 'inline-flex items-center gap-2',
} as const;

const TEXT = {
  defaultButtonText: 'Request Test SUI',
  loadingText: 'Requesting...',
  successTitle: 'Faucet Request Successful',
  successMessage: 'Test SUI tokens have been sent to your address',
  errorTitle: 'Faucet Request Failed',
  errorMessage: 'Failed to request test tokens from faucet',
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Request test tokens from Sui devnet faucet
 *
 * @param address - User's Sui address to receive tokens
 * @returns Result containing success status or error
 */
async function requestFaucetTokens(address: string): Promise<Result<FaucetResponse, AppError>> {
  try {
    const response = await fetch(SUI_DEVNET_FAUCET_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        FixedAmountRequest: {
          recipient: address,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      const error = createAppError(
        'Network',
        `Faucet request failed: ${response.status} ${response.statusText}`,
        {
          cause: new Error(errorText),
          status: response.status,
          details: { address, responseText: errorText },
        }
      );
      return err(error);
    }

    const _data = await response.json();
    return ok({
      success: true,
      message: 'Test SUI tokens sent successfully',
    });
  } catch (error) {
    const appError = createAppError('Network', 'Failed to request test tokens from faucet', {
      cause: error,
      details: { address },
    });
    return err(appError);
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * FaucetButton Component
 *
 * A molecule component that handles requesting test tokens from the Sui devnet faucet.
 * Provides user feedback through the notification system and loading states.
 *
 * @param props - Component props
 * @returns JSX element
 */
export function FaucetButton({
  address,
  buttonText = TEXT.defaultButtonText,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  onComplete,
}: FaucetButtonProps) {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================

  const { showSuccess, showError } = useNotifications();
  const [isRequesting, setIsRequesting] = useState(false);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleFaucetRequest = async (): Promise<void> => {
    if (!address) {
      showError(createAppError('Validation', 'Address is required to request faucet tokens'));
      return;
    }

    setIsRequesting(true);

    try {
      const result = await requestFaucetTokens(address);

      if (result.ok) {
        showSuccess(TEXT.successTitle, TEXT.successMessage);
        onComplete?.(true);
      } else {
        showError(result.error);
        onComplete?.(false);
      }
    } catch (error) {
      const appError = createAppError('Unknown', 'Unexpected error during faucet request', {
        cause: error,
        details: { address },
      });
      showError(appError);
      onComplete?.(false);
    } finally {
      setIsRequesting(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={STYLES.container}>
      <Button
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        loading={isRequesting}
        disabled={!address || isRequesting}
        onClick={handleFaucetRequest}
        className={variant === 'hero' ? className : `${STYLES.button} ${className}`}
      >
        <div className='flex items-center gap-2'>
          <Icon name='coins' size='sm' />
          <span>{isRequesting ? TEXT.loadingText : buttonText}</span>
        </div>
      </Button>
    </div>
  );
}

export default FaucetButton;
