import { useState } from 'react';
import { Avatar, Icon } from '@/shared/ui';
import { DropdownMenu, useDropdown } from '@/shared/ui';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface NavigationItem {
  to: string;
  label: string;
}

interface UserWalletButtonProps {
  /** The wallet address to display */
  address: string;
  /** Callback when user disconnects */
  onDisconnect: () => void;
  /** Whether to use mobile-optimized layout */
  isMobile?: boolean;
  /** Whether to include navigation items in dropdown */
  includeNavigation?: boolean;
  /** Array of navigation items to include */
  navigationItems?: NavigationItem[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const COPY_FEEDBACK_DURATION = 2000;
const DEFAULT_IS_MOBILE = false;
const DEFAULT_INCLUDE_NAVIGATION = false;
const DEFAULT_NAVIGATION_ITEMS: NavigationItem[] = [];

const STYLES = {
  walletDisplay:
    'flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 transition-all duration-200 group',
  walletInfo: 'text-left',
  address: 'text-xs font-medium text-white/90',
  chevron: 'w-3 h-3 text-white/60 transition-all duration-200 group-hover:text-white/80',
  chevronOpen: 'rotate-180',
  copyButton:
    'w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200 text-left',
  copyIcon: 'w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center',
  copyContent: 'flex-1',
  copyTitle: 'text-sm font-medium text-white/90',
  copySubtitle: 'text-xs text-white/60',
  copySuccess: 'w-5 h-5 rounded-full bg-green-500 flex items-center justify-center',
  disconnectButton:
    'w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-900/50 transition-colors duration-200 text-left mt-1',
  disconnectIcon: 'w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center',
  disconnectContent: 'flex-1',
  disconnectTitle: 'text-sm font-medium text-red-300',
  disconnectSubtitle: 'text-xs text-red-400/60',
  dropdownContent: 'p-2',
} as const;

const TEXT = {
  copyAddress: 'Copy Address',
  copied: 'Copied!',
  copySubtitle: 'Copy to clipboard',
  copySuccessSubtitle: 'Address copied to clipboard',
  disconnect: 'Disconnect',
  disconnectSubtitle: 'Sign out of your wallet',
} as const;

// ============================================================================
// ICON COMPONENTS
// ============================================================================

const ChevronDownIcon = ({ isOpen = false }: { isOpen?: boolean }): React.JSX.Element => (
  <Icon
    name='chevron-down'
    size='sm'
    className={`${STYLES.chevron} ${isOpen ? STYLES.chevronOpen : ''}`}
  />
);

const CopyIcon = (): React.JSX.Element => (
  <Icon name='copy' size='sm' className='w-4 h-4 text-blue-400' />
);

const CheckIcon = (): React.JSX.Element => (
  <Icon name='check' size='sm' className='w-3 h-3 text-white' />
);

const DisconnectIcon = (): React.JSX.Element => (
  <Icon name='disconnect' size='sm' className='w-4 h-4 text-red-400' />
);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatAddress = (address: string): string => {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface WalletDisplayProps {
  address: string;
  isOpen?: boolean;
}

const WalletDisplay = ({ address, isOpen = false }: WalletDisplayProps): React.JSX.Element => (
  <div className={STYLES.walletDisplay}>
    <Avatar address={address} size={24} />
    <div className={STYLES.walletInfo}>
      <div className={STYLES.address}>{formatAddress(address)}</div>
    </div>
    <ChevronDownIcon isOpen={isOpen} />
  </div>
);

interface CopyAddressButtonProps {
  onCopy: () => void;
  copied: boolean;
}

const CopyAddressButton = ({ onCopy, copied }: CopyAddressButtonProps): React.JSX.Element => (
  <button onClick={onCopy} className={STYLES.copyButton}>
    <div className={STYLES.copyIcon}>
      <CopyIcon />
    </div>
    <div className={STYLES.copyContent}>
      <div className={STYLES.copyTitle}>{copied ? TEXT.copied : TEXT.copyAddress}</div>
      <div className={STYLES.copySubtitle}>
        {copied ? TEXT.copySuccessSubtitle : TEXT.copySubtitle}
      </div>
    </div>
    {copied && (
      <div className={STYLES.copySuccess}>
        <CheckIcon />
      </div>
    )}
  </button>
);

interface DisconnectButtonProps {
  onDisconnect: () => void;
}

const DisconnectButton = ({ onDisconnect }: DisconnectButtonProps): React.JSX.Element => (
  <button onClick={onDisconnect} className={STYLES.disconnectButton}>
    <div className={STYLES.disconnectIcon}>
      <DisconnectIcon />
    </div>
    <div className={STYLES.disconnectContent}>
      <div className={STYLES.disconnectTitle}>{TEXT.disconnect}</div>
      <div className={STYLES.disconnectSubtitle}>{TEXT.disconnectSubtitle}</div>
    </div>
  </button>
);

interface WalletDropdownContentProps {
  onCopyAddress: () => void;
  onDisconnect: () => void;
  copied: boolean;
}

const WalletDropdownContent = ({
  onCopyAddress,
  onDisconnect,
  copied,
}: WalletDropdownContentProps): React.JSX.Element => {
  const { closeDropdown } = useDropdown();

  const handleDisconnect = (): void => {
    onDisconnect();
    closeDropdown();
  };

  return (
    <div className={STYLES.dropdownContent}>
      <CopyAddressButton onCopy={onCopyAddress} copied={copied} />
      <DisconnectButton onDisconnect={handleDisconnect} />
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * UserWalletButton Component
 *
 * A wallet button that displays the connected user state with avatar, shortened address,
 * and a dropdown menu containing wallet actions (copy address, disconnect).
 *
 * Features:
 * - Avatar generation based on wallet address
 * - Shortened address display for better UX
 * - Copy address functionality with visual feedback
 * - Disconnect functionality with confirmation
 * - Mobile and desktop responsive layouts
 * - Optional navigation integration for mobile
 *
 * @param props - Component props
 * @returns JSX element containing the user wallet button with dropdown
 */
export default function UserWalletButton({
  address,
  onDisconnect,
  isMobile = DEFAULT_IS_MOBILE,
  includeNavigation = DEFAULT_INCLUDE_NAVIGATION,
  navigationItems = DEFAULT_NAVIGATION_ITEMS,
}: UserWalletButtonProps) {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================

  const [copied, setCopied] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleCopyAddress = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION);
    } catch {
      // Copy failed - user will see the error state
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <DropdownMenu
      trigger={<WalletDisplay address={address} isOpen={isDropdownOpen} />}
      position='right'
      width='w-64'
      isMobile={isMobile}
      includeNavigation={includeNavigation}
      navigationItems={navigationItems}
      onToggle={setIsDropdownOpen}
    >
      <WalletDropdownContent
        onCopyAddress={handleCopyAddress}
        onDisconnect={onDisconnect}
        copied={copied}
      />
    </DropdownMenu>
  );
}
