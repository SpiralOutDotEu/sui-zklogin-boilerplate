import { BackgroundType, createAvatar } from "@dicebear/core";
import { identicon } from "@dicebear/collection";
import { useMemo } from "react";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface AvatarProps {
  /** The wallet address to generate avatar for */
  address: string;
  /** Size of the avatar in pixels (default: 32) */
  size?: number;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_SIZE = 32;
const DEFAULT_CLASSNAME = "";

const AVATAR_CONFIG = {
  backgroundColor: [
    "#1e1b4b", // Deep purple (matches app theme)
    "#312e81", // Darker purple
    "#1e3a8a", // Deep blue
    "#1e40af", // Blue
    "#3730a3", // Indigo
    "#4c1d95", // Purple
  ] as string[],
  scale: 85,
} as const;

const STYLES = {
  container: "inline-block rounded-full overflow-hidden ring-2 ring-white/10",
  image: "w-full h-full object-cover",
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const generateAltText = (address: string): string => {
  return `Avatar for ${address.slice(0, 6)}...${address.slice(-4)}`;
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Avatar Component
 *
 * Generates a unique, deterministic avatar for a given address using @dicebear/identicon.
 * The same address will always generate the same avatar, ensuring consistency.
 * Styled to blend seamlessly with the app's dark theme and glass morphism effects.
 *
 * @param props - Component props
 * @returns JSX element containing the generated avatar
 */
export default function Avatar({
  address,
  size = DEFAULT_SIZE,
  className = DEFAULT_CLASSNAME,
}: AvatarProps) {
  const avatarSvg = useMemo(() => {
    const avatar = createAvatar(identicon, {
      seed: address,
      size: size,
      backgroundType:["solid"] as BackgroundType[],
      backgroundColor: AVATAR_CONFIG.backgroundColor,
      scale: AVATAR_CONFIG.scale,
    });
    return avatar.toDataUri();
  }, [address, size]);

  return (
    <div
      className={`${STYLES.container} ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={avatarSvg}
        alt={generateAltText(address)}
        className={STYLES.image}
      />
    </div>
  );
}
