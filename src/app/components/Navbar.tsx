import { Link, useLocation } from 'react-router-dom';
import { useZkLogin } from '@/features/auth';
import { ConnectWalletButton, UserWalletButton } from '@/shared/ui';
// import DropdownMenu from "./DropdownMenu";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface NavigationItem {
  to: string;
  label: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const NAVIGATION_ITEMS: NavigationItem[] = [
  { to: '/profile', label: 'Profile' },
  { to: '/test_tx', label: 'Test TX' },
  { to: '/gallery', label: 'UI Gallery' },
];

const STYLES = {
  header: 'glass-effect border-b border-white/10 sticky top-0 z-50',
  container: 'max-w-7xl mx-auto px-6 py-4 flex items-center justify-between',
  logo: 'flex items-center gap-3 group',
  logoIcon:
    'w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center glow-effect',
  logoText: 'font-bold text-xl gradient-text group-hover:scale-105 transition-transform',
  logoLetter: 'text-white font-bold text-lg',
  desktopNav: 'hidden md:flex gap-2 ml-8',
  navLink:
    'px-4 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 border border-transparent hover:border-white/20 nav-link',
  navLinkActive:
    'px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-white/10 border border-white/30 nav-link-active',
  navLinkText: 'relative',
  rightSide: 'flex items-center gap-3',
  desktopAuth: 'hidden md:flex items-center gap-3',
  mobileMenu: 'md:hidden',
  loadingContainer: 'flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5',
  loadingContainerMobile: 'flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5',
  spinner: 'w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin',
  spinnerMobile: 'w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin',
  loadingText: 'text-sm text-white/70',
} as const;

const TEXT = {
  brand: 'Sui zkLogin',
  loading: 'Loading...',
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Navbar Component
 *
 * Main navigation component that handles authentication state display and navigation.
 * Uses consistent dropdown behavior across desktop and mobile with navigation
 * only shown on mobile screens for better UX.
 *
 * Features:
 * - Logo and brand name with hover effects
 * - Navigation links (Profile, Test TX) - desktop only
 * - Authentication state management with loading states
 * - Connect/Disconnect wallet functionality with dropdown
 * - Mobile navigation integrated in dropdown menu
 * - Responsive design with different layouts for desktop/mobile
 *
 * @returns JSX element containing the complete navigation bar
 */
export default function Navbar() {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================

  const { account, isRestoring, logout } = useZkLogin();
  const location = useLocation();

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderLoadingState = (isMobile = false): React.JSX.Element => (
    <div className={isMobile ? STYLES.loadingContainerMobile : STYLES.loadingContainer}>
      <div className={isMobile ? STYLES.spinnerMobile : STYLES.spinner}></div>
      <span className={STYLES.loadingText}>{TEXT.loading}</span>
    </div>
  );

  const renderAuthState = (isMobile = false): React.JSX.Element => {
    if (isRestoring) {
      return renderLoadingState(isMobile);
    }

    if (account?.address) {
      return (
        <UserWalletButton
          address={account.address}
          onDisconnect={logout}
          isMobile={isMobile}
          includeNavigation={isMobile}
          navigationItems={isMobile ? NAVIGATION_ITEMS : []}
        />
      );
    }

    return <ConnectWalletButton />;
  };

  const renderNavLink = (item: NavigationItem): React.JSX.Element => {
    const isActive = location.pathname === item.to;
    const linkClassName = isActive ? STYLES.navLinkActive : STYLES.navLink;

    return (
      <Link key={item.to} to={item.to} className={linkClassName}>
        <span className={STYLES.navLinkText}>{item.label}</span>
      </Link>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <header className={STYLES.header}>
      <div className={STYLES.container}>
        {/* Logo and Brand */}
        <Link to='/' className={STYLES.logo}>
          <div className={STYLES.logoIcon}>
            <span className={STYLES.logoLetter}>S</span>
          </div>
          <span className={STYLES.logoText}>{TEXT.brand}</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className={STYLES.desktopNav}>{NAVIGATION_ITEMS.map(renderNavLink)}</nav>

        {/* Right Side - Desktop Auth & Mobile Menu */}
        <div className={STYLES.rightSide}>
          {/* Desktop Authentication */}
          <div className={STYLES.desktopAuth}>{renderAuthState(false)}</div>

          {/* Mobile Menu */}
          <div className={STYLES.mobileMenu}>{renderAuthState(true)}</div>
        </div>
      </div>
    </header>
  );
}
