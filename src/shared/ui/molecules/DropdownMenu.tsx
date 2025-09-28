import {
  useState,
  useRef,
  useEffect,
  ReactNode,
  createContext,
  useContext,
} from "react";
import { Link } from "react-router-dom";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface NavigationItem {
  to: string;
  label: string;
}

interface DropdownMenuProps {
  /** The trigger element that opens/closes the dropdown */
  trigger: ReactNode;
  /** Content to display inside the dropdown */
  children: ReactNode;
  /** Position of the dropdown relative to trigger (default: "right") */
  position?: "left" | "right";
  /** Width class for the dropdown (default: "w-64") */
  width?: string;
  /** Additional CSS classes for the container */
  className?: string;
  /** Whether to use mobile-optimized layout */
  isMobile?: boolean;
  /** Whether to include navigation items in the dropdown */
  includeNavigation?: boolean;
  /** Array of navigation items to display */
  navigationItems?: NavigationItem[];
  /** Callback when dropdown open state changes */
  onToggle?: (isOpen: boolean) => void;
}

interface DropdownContextType {
  closeDropdown: () => void;
  isOpen: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_POSITION = "right" as const;
const DEFAULT_WIDTH = "w-64" as const;
const DEFAULT_CLASSNAME = "" as const;
const DEFAULT_IS_MOBILE = false as const;
const DEFAULT_INCLUDE_NAVIGATION = false as const;
const DEFAULT_NAVIGATION_ITEMS: NavigationItem[] = [];

const STYLES = {
  container: "relative",
  trigger: "cursor-pointer",
  dropdown:
    "bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50 overflow-hidden overflow-y-auto",
  dropdownMobile: "fixed inset-x-4 top-20 max-h-[calc(100vh-6rem)] w-auto",
  navigation: "p-2 border-b border-gray-700",
  navigationTitle: "text-sm text-white/60 font-medium mb-3 px-2",
  navigationItems: "space-y-1",
  navigationLink:
    "block px-3 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200",
  content: "p-2",
  contentWithNavigation: "p-2",
} as const;

const POSITION_CLASSES = {
  left: "left-0",
  right: "right-0",
} as const;

// ============================================================================
// CONTEXT
// ============================================================================

const DropdownContext = createContext<DropdownContextType | null>(null);

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook to access dropdown context
 *
 * @returns Dropdown context with closeDropdown function and isOpen state
 * @throws Error if used outside of DropdownMenu component
 */
export const useDropdown = (): DropdownContextType => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error("useDropdown must be used within a DropdownMenu");
  }
  return context;
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * DropdownMenu Component
 *
 * A clean, reusable dropdown menu component with consistent behavior across screen sizes.
 * Provides toggle functionality, outside click detection, and optional navigation integration.
 *
 * Features:
 * - Toggle behavior: Click trigger to open/close dropdown
 * - Click outside to close dropdown
 * - Navigation only shown on mobile (when includeNavigation=true)
 * - Children can control dropdown closing via useDropdown hook
 * - Copy address actions show feedback but don't close dropdown
 * - All other actions (disconnect, navigation) close dropdown when clicked
 * - Wallet button can be clicked again to close the dropdown
 *
 * @param props - Component props
 * @returns JSX element containing the dropdown menu
 */
export default function DropdownMenu({
  trigger,
  children,
  position = DEFAULT_POSITION,
  width = DEFAULT_WIDTH,
  className = DEFAULT_CLASSNAME,
  isMobile = DEFAULT_IS_MOBILE,
  includeNavigation = DEFAULT_INCLUDE_NAVIGATION,
  navigationItems = DEFAULT_NAVIGATION_ITEMS,
  onToggle,
}: DropdownMenuProps) {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const closeDropdown = (): void => {
    setIsOpen(false);
    onToggle?.(false);
  };

  const toggleDropdown = (): void => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    onToggle?.(newIsOpen);
  };

  const handleTriggerClick = (event: React.MouseEvent): void => {
    event.preventDefault();
    event.stopPropagation();
    toggleDropdown();
  };

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const positionClass = POSITION_CLASSES[position];

  const dropdownClasses = isMobile
    ? STYLES.dropdownMobile
    : `absolute ${positionClass} mt-2 ${width}`;

  const contentClassName = includeNavigation
    ? STYLES.contentWithNavigation
    : STYLES.content;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`${STYLES.container} ${className}`}>
      {/* Trigger */}
      <div
        ref={triggerRef}
        onClick={handleTriggerClick}
        className={STYLES.trigger}
      >
        {trigger}
      </div>

      {/* Dropdown Content */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={`${dropdownClasses} ${STYLES.dropdown}`}
        >
          <DropdownContext.Provider value={{ closeDropdown, isOpen }}>
            {includeNavigation && navigationItems.length > 0 && (
              <div className={STYLES.navigation}>
                <div className={STYLES.navigationTitle}>Navigation</div>
                <div className={STYLES.navigationItems}>
                  {navigationItems.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={STYLES.navigationLink}
                      onClick={closeDropdown}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            <div className={contentClassName}>{children}</div>
          </DropdownContext.Provider>
        </div>
      )}
    </div>
  );
}
