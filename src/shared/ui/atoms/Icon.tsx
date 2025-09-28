import React from 'react';
import {
  // Heroicons from react-icons
  HiChevronDown,
  HiDocumentDuplicate,
  HiCheck,
  HiLogout,
  HiX,
  HiExclamationCircle,
  HiInformationCircle,
} from 'react-icons/hi';
import {
  // Lucide React from react-icons
  LuCopy,
  LuCheck,
  LuChevronDown,
  LuLogOut,
  LuLoader,
  LuX,
  LuTriangle,
  LuInfo,
  LuCoins,
} from 'react-icons/lu';
import {
  // Material Design from react-icons
  MdContentCopy,
  MdCheck,
  MdExpandMore,
  MdLogout,
  MdRefresh,
  MdClose,
  MdWarning,
  MdInfo,
} from 'react-icons/md';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface IconProps {
  /** Icon name */
  name: string;
  /** Icon size */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Additional CSS classes */
  className?: string;
  /** Icon color */
  color?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SIZES = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
} as const;

// Icon mapping using react-icons
const ICON_MAP: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  // Common icons
  'chevron-down': HiChevronDown,
  'chevron-down-lucide': LuChevronDown,
  'chevron-down-md': MdExpandMore,
  copy: LuCopy,
  'copy-hero': HiDocumentDuplicate,
  'copy-md': MdContentCopy,
  check: LuCheck,
  'check-hero': HiCheck,
  'check-md': MdCheck,
  disconnect: LuLogOut,
  'disconnect-hero': HiLogout,
  'disconnect-md': MdLogout,
  spinner: LuLoader,
  'spinner-md': MdRefresh,
  // Notification icons
  close: LuX,
  'close-hero': HiX,
  'close-md': MdClose,
  warning: LuTriangle,
  'warning-hero': HiExclamationCircle,
  'warning-md': MdWarning,
  info: LuInfo,
  'info-hero': HiInformationCircle,
  'info-md': MdInfo,
  // Faucet icons
  coins: LuCoins,
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Icon Component - Atomic Design
 *
 * A reusable icon component using react-icons with consistent sizing and styling.
 * Supports multiple icon libraries: Heroicons, Lucide React, Material Design.
 *
 * @param props - Icon props
 * @returns JSX element
 */
export default function Icon({
  name,
  size = 'md',
  className = '',
  color = 'currentColor',
  ...props
}: IconProps) {
  const sizeClasses = SIZES[size];
  const classes = `${sizeClasses} ${className}`.trim();

  const IconComponent = ICON_MAP[name];

  return <IconComponent className={classes} color={color} {...props} />;
}
