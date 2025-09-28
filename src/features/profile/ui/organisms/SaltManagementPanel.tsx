import React, { useState, useEffect } from 'react';
import { Panel, Input, Button, CopyButton } from '@/shared/ui';
import { useZkLogin } from '@/features/auth';
import { sessionCookieStorage } from '@/shared/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface SaltManagementPanelProps {
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STYLES = {
  container: 'space-y-4',
  header: 'flex items-center gap-3 mb-4',
  headerIcon: 'w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center',
  headerIconText: 'text-yellow-400 text-sm',
  headerContent: 'flex-1',
  headerTitle: 'text-lg font-bold text-white',
  headerSubtitle: 'text-white/60 text-xs',
  warningBox: 'bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4',
  warningTitle: 'text-yellow-400 font-semibold text-xs mb-1',
  warningText: 'text-yellow-300/80 text-xs leading-relaxed',
  saltContainer: 'space-y-3',
  inputGroup: 'space-y-2',
  inputLabel: 'text-sm font-medium text-white/80',
  inputHelper: 'text-xs text-white/60',
  inputActions: 'flex items-center gap-2',
  buttonGroup: 'flex items-center gap-2',
  buttonWarning: 'text-xs text-red-400 mt-1',
} as const;

const TEXT = {
  title: 'Salt Management',
  subtitle: 'Demo-only address customization',
  warningTitle: '⚠️ Demo Only - Not for Production',
  warningText:
    "Change your zkLogin address by modifying the salt value. Without the correct salt, it's impossible to retrieve your address.",
  saltLabel: 'Salt Value',
  saltHelper: 'This salt is used to derive your address',
  saltPlaceholder: 'Enter salt value...',
  editButton: 'Edit',
  cancelButton: 'Cancel',
  changeAddressButton: 'Change Address',
  changeAddressWarning: 'This will generate a new address and clear your current session',
  copyButton: 'Copy',
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * SaltManagementPanel Component
 *
 * A panel that allows users to view and modify their salt value for address generation.
 * This is a demo-only feature that shows how salt affects address derivation.
 *
 * @param props - Component props
 * @returns JSX element
 */
export default function SaltManagementPanel({ className = '' }: SaltManagementPanelProps) {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================

  const { salt, completeLogin, decodedJwt, status } = useZkLogin();
  const [saltInput, setSaltInput] = useState(salt || '');
  const [isChangingAddress, setIsChangingAddress] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Update saltInput when salt prop changes
  useEffect(() => {
    if (salt && !isEditing) {
      setSaltInput(salt);
    }
  }, [salt, isEditing]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleChangeAddress = async (): Promise<void> => {
    if (!saltInput.trim()) {
      return;
    }

    if (!decodedJwt) {
      return;
    }

    setIsChangingAddress(true);

    try {
      // Store the custom salt in the cookie storage
      // This will be picked up by DemoSaltService.getOrCreateSalt()
      sessionCookieStorage.setItem('zk_user_salt', saltInput.trim());

      // Get the JWT token from session storage
      const jwtToken = sessionCookieStorage.getItem('zk_jwt_token') as string;

      if (!jwtToken) {
        return;
      }

      // Call completeLogin with the existing JWT token
      // This will use the new salt we just set
      await completeLogin(jwtToken, window.location.pathname);

      // Exit editing mode
      setIsEditing(false);
    } catch {
      // Error handling could be improved with proper error reporting
    } finally {
      setIsChangingAddress(false);
    }
  };

  const handleEditClick = (): void => {
    setIsEditing(true);
    setSaltInput(salt || '');
  };

  const handleCancelEdit = (): void => {
    setIsEditing(false);
    setSaltInput(salt || '');
  };

  const handleSaltCopied = (): void => {
    // Could add notification here if needed
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Panel variant='glass' size='md' className={`${STYLES.container} ${className}`}>
      {/* Header */}
      <div className={STYLES.header}>
        <div className={STYLES.headerIcon}>
          <span className={STYLES.headerIconText}>🧂</span>
        </div>
        <div className={STYLES.headerContent}>
          <h2 className={STYLES.headerTitle}>{TEXT.title}</h2>
          <p className={STYLES.headerSubtitle}>{TEXT.subtitle}</p>
        </div>
      </div>

      {/* Warning Box */}
      <div className={STYLES.warningBox}>
        <h3 className={STYLES.warningTitle}>{TEXT.warningTitle}</h3>
        <p className={STYLES.warningText}>{TEXT.warningText}</p>
      </div>

      {/* Salt Input Section */}
      <div className={STYLES.saltContainer}>
        <div className={STYLES.inputGroup}>
          <label className={STYLES.inputLabel}>{TEXT.saltLabel}</label>
          <div className={STYLES.inputActions}>
            <Input
              value={saltInput}
              onChange={e => setSaltInput(e.target.value)}
              placeholder={TEXT.saltPlaceholder}
              fullWidth
              size='sm'
              readOnly={!isEditing}
              className={!isEditing ? 'bg-white/5 cursor-default' : ''}
            />
            {!isEditing ? (
              <>
                <Button onClick={handleEditClick} variant='secondary' size='sm'>
                  {TEXT.editButton}
                </Button>
                <CopyButton
                  text={salt || ''}
                  label={TEXT.copyButton}
                  variant='ghost'
                  size='sm'
                  onCopy={handleSaltCopied}
                />
              </>
            ) : (
              <>
                <Button onClick={handleCancelEdit} variant='ghost' size='sm'>
                  {TEXT.cancelButton}
                </Button>
                <Button
                  onClick={handleChangeAddress}
                  disabled={!saltInput.trim() || isChangingAddress || status === 'loading'}
                  loading={isChangingAddress}
                  variant='primary'
                  size='sm'
                >
                  {TEXT.changeAddressButton}
                </Button>
              </>
            )}
          </div>
          <p className={STYLES.inputHelper}>{TEXT.saltHelper}</p>
          {isEditing && saltInput.trim() && (
            <p className={STYLES.buttonWarning}>{TEXT.changeAddressWarning}</p>
          )}
        </div>
      </div>
    </Panel>
  );
}
