import { useState, useEffect } from "react";
import { useZkLogin } from "../state/ZkLoginProvider";
import Avatar from "../ui/Avatar";
import { config } from "../config";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface OwnedObject {
  data?: {
    objectId: string;
    [key: string]: any;
  };
}

// ============================================================================
// CONSTANTS
// ============================================================================

// Explorer URLs for different Sui entities
// Objects: https://suiscan.xyz/devnet/object/{objectId}
// Transactions: https://suiscan.xyz/devnet/tx/{txDigest}
// Addresses: https://suiscan.xyz/devnet/address/{address}
const EXPLORER_OBJECT_BASE_URL =
  config.explorerObjectBaseUrl || "https://suiscan.xyz/devnet/object";

const STYLES = {
  container: "space-y-12",
  header: "text-center space-y-4",
  headerContent: "flex items-center justify-center gap-4 mb-4",
  avatar: "ring-4 ring-white/20",
  titleContainer: "text-left",
  title: "text-4xl font-bold gradient-text",
  subtitle: "text-white/70 text-sm",
  description: "text-white/70",
  statsGrid: "grid md:grid-cols-3 gap-6",
  statCard: "glass-effect rounded-2xl p-6",
  statHeader: "flex items-center justify-between mb-4",
  statTitle: "text-lg font-semibold text-white",
  statusIndicator: "flex items-center gap-2",
  statusDot: "w-3 h-3 rounded-full animate-pulse",
  statusText: "text-xs",
  statusTextGreen: "text-green-400",
  statDescription: "text-white/60 text-sm",
  accountSection: "glass-effect rounded-2xl p-6 mt-8",
  accountHeader: "flex items-center gap-4 mb-6",
  accountAvatar: "ring-2 ring-white/20",
  accountTitle: "text-2xl font-bold text-white",
  accountSubtitle: "text-white/60 text-sm",
  infoGrid: "grid md:grid-cols-2 gap-6 mb-6",
  infoCard: "bg-white/5 rounded-xl p-4",
  infoTitle: "text-sm font-semibold text-white/80 mb-2",
  addressText: "font-mono text-white/90 text-xs break-all mb-3",
  copyButton:
    "px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-white text-xs transition-colors flex items-center gap-1",
  balanceText: "text-white/90 font-mono text-lg mb-3",
  loadingContainer: "flex items-center gap-2",
  spinner:
    "w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin",
  errorText: "text-red-400 text-sm",
  verifiedBadge:
    "px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs inline-block",
  securityGrid: "grid grid-cols-2 gap-2",
  securityItem: "flex items-center gap-2",
  securityIcon: "w-6 h-6 rounded flex items-center justify-center",
  securityText: "text-white/70 text-xs",
  ownedObjectsSection: "glass-effect rounded-2xl p-8 mt-8",
  ownedObjectsTitle: "text-2xl font-bold text-white mb-6",
  ownedObjectsList: "space-y-3",
  objectItem: "bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors",
  objectLink: "text-blue-400 hover:text-blue-300 underline break-all",
  objectId: "font-mono text-sm",
  noObjects: "text-center py-8 text-white/60",
  loadingObjects: "text-center py-8 text-white/60",
} as const;

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface OwnedObjectsProps {
  address: string;
  client: any;
}

const OwnedObjects = ({
  address,
  client,
}: OwnedObjectsProps): React.JSX.Element => {
  const [objects, setObjects] = useState<OwnedObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      } catch (err) {
        console.error("Failed to fetch owned objects:", err);
        setError("Failed to load objects");
      } finally {
        setLoading(false);
      }
    };

    fetchObjects();
  }, [address, client]);

  if (loading) {
    return (
      <div className={STYLES.loadingObjects}>
        <div className="flex items-center justify-center gap-2">
          <div className={STYLES.spinner}></div>
          <span>Loading your objects...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={STYLES.noObjects}>
        <span className="text-red-400">❌ {error}</span>
      </div>
    );
  }

  if (objects.length === 0) {
    return (
      <div className={STYLES.noObjects}>
        <span>📦 No objects found</span>
        <p className="text-sm mt-2">Your owned objects will appear here</p>
      </div>
    );
  }

  return (
    <div className={STYLES.ownedObjectsList}>
      {objects.map((object) => (
        <div key={object.data?.objectId} className={STYLES.objectItem}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className={STYLES.objectId}>{object.data?.objectId}</div>
            </div>
            <a
              href={`${EXPLORER_OBJECT_BASE_URL}/${object.data?.objectId}`}
              target="_blank"
              rel="noopener noreferrer"
              className={STYLES.objectLink}
            >
              View in Explorer →
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Profile Component
 *
 * Displays user profile information including account details, balance,
 * and owned objects on the Sui blockchain.
 *
 * Features:
 * - User avatar and personalized welcome message
 * - Account information with wallet address and balance
 * - Security features overview
 * - Owned objects list with explorer links
 * - Responsive design with glass morphism effects
 *
 * @returns JSX element containing the complete profile page
 */
export default function Profile() {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================

  const {
    account,
    decodedJwt,
    client,
    checkSessionValidity,
    loginWithProvider,
  } = useZkLogin();
  const [copied, setCopied] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Fetch balance when account is available
  useEffect(() => {
    const fetchBalance = async (): Promise<void> => {
      if (!account?.address || !client) return;

      setBalanceLoading(true);
      try {
        const balanceData = await client.getBalance({
          owner: account.address,
        });
        // Convert from MIST to SUI (1 SUI = 1,000,000,000 MIST)
        const suiBalance = (
          Number(balanceData.totalBalance) / 1_000_000_000
        ).toFixed(6);
        setBalance(suiBalance);
      } catch (error) {
        console.error("Failed to fetch balance:", error);
        setBalance("Error");
      } finally {
        setBalanceLoading(false);
      }
    };

    fetchBalance();
  }, [account?.address, client]);

  // Fetch session status on load/account change
  useEffect(() => {
    const run = async () => {
      await checkSession();
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account?.address]);

  // Check zkLogin session status
  const checkSession = async (): Promise<void> => {
    if (typeof checkSessionValidity !== "function") {
      console.error("checkSessionValidity is not a function");
      setSessionError("checkSessionValidity is not available");
      return;
    }

    setIsCheckingSession(true);
    setSessionError(null);

    try {
      const validation = await checkSessionValidity();
      if (validation.isValid) {
        setSessionInfo(validation.sessionInfo);
        setSessionError(null);
      } else {
        setSessionInfo(null);
        setSessionError(validation.error || "Session validation failed");
      }
    } catch (error) {
      console.error("Session check failed:", error);
      setSessionError("Session check failed: " + (error as Error).message);
    } finally {
      setIsCheckingSession(false);
    }
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const handleCopyAddress = (): void => {
    if (!account?.address) return;

    navigator.clipboard.writeText(account.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!account?.address) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <span className="text-red-400 text-2xl">🔒</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Please Sign In</h2>
          <p className="text-white/60">
            Connect your wallet to access your profile
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={STYLES.container}>
      {/* Header */}
      <div className={STYLES.header}>
        <div className={STYLES.headerContent}>
          <Avatar
            address={account.address}
            size={64}
            className={STYLES.avatar}
          />
          <div className={STYLES.titleContainer}>
            <h1 className={STYLES.title}>Profile</h1>
            <p className={STYLES.subtitle}>
              Welcome back, {decodedJwt?.email?.split("@")[0] || "User"}
            </p>
          </div>
        </div>
        <p className={STYLES.description}>
          Manage your Sui zkLogin account and assets
        </p>
      </div>

      {/* Stats Grid */}
      <div className={STYLES.statsGrid}>
        <div className={STYLES.statCard}>
          <div className={STYLES.statHeader}>
            <h3 className={STYLES.statTitle}>Wallet Status</h3>
            <div className={STYLES.statusIndicator}>
              <div className={`${STYLES.statusDot} bg-green-500`}></div>
              <span
                className={`${STYLES.statusText} ${STYLES.statusTextGreen}`}
              >
                Synced
              </span>
            </div>
          </div>
          <p className={STYLES.statDescription}>
            Connected via zkLogin • Cross-tab sync enabled
          </p>
        </div>

        <div className={STYLES.statCard}>
          <div className={STYLES.statHeader}>
            <h3 className={STYLES.statTitle}>Network</h3>
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          </div>
          <p className={STYLES.statDescription}>Sui Devnet</p>
        </div>

        <div className={STYLES.statCard}>
          <div className={STYLES.statHeader}>
            <h3 className={STYLES.statTitle}>Account Type</h3>
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          </div>
          <p className={STYLES.statDescription}>Zero-Knowledge</p>
        </div>
      </div>

      {/* Account Details */}
      <div className={STYLES.accountSection}>
        <div className={STYLES.accountHeader}>
          <Avatar
            address={account.address}
            size={48}
            className={STYLES.accountAvatar}
          />
          <div>
            <h2 className={STYLES.accountTitle}>Account Information</h2>
            <p className={STYLES.accountSubtitle}>
              Your unique zkLogin identity
            </p>
          </div>
        </div>

        {/* Main Info Grid */}
        <div className={STYLES.infoGrid}>
          {/* Wallet Address */}
          <div className={STYLES.infoCard}>
            <h3 className={STYLES.infoTitle}>Wallet Address</h3>
            <div className={STYLES.addressText}>{account.address}</div>
            <button onClick={handleCopyAddress} className={STYLES.copyButton}>
              <span>{copied ? "✓" : "📋"}</span>
              <span>{copied ? "Copied!" : "Copy"}</span>
            </button>
          </div>

          {/* Balance */}
          <div className={STYLES.infoCard}>
            <h3 className={STYLES.infoTitle}>Balance</h3>
            <div className={STYLES.balanceText}>
              {balanceLoading ? (
                <div className={STYLES.loadingContainer}>
                  <div className={STYLES.spinner}></div>
                  <span className="text-sm">Loading...</span>
                </div>
              ) : balance ? (
                `${balance} SUI`
              ) : (
                <span className={STYLES.errorText}>Unable to fetch</span>
              )}
            </div>
          </div>
        </div>

        {/* Email and Security in one row */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Email */}
          {decodedJwt?.email && (
            <div className={STYLES.infoCard}>
              <h3 className={STYLES.infoTitle}>Connected Email</h3>
              <div className="text-white/90 text-sm mb-2">
                {decodedJwt.email}
              </div>
              <div className={STYLES.verifiedBadge}>Verified</div>
            </div>
          )}

          {/* Session Status */}
          <div className={STYLES.infoCard}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={STYLES.infoTitle}>Session Status</h3>
              <button
                onClick={checkSession}
                disabled={isCheckingSession}
                title="Refresh session status"
                className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCheckingSession ? (
                  <span className="inline-flex items-center gap-2">
                    <span className={STYLES.spinner}></span>
                    <span>Checking...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <span aria-hidden>↻</span>
                    <span>Refresh</span>
                  </span>
                )}
              </button>
            </div>

            {sessionError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded p-2 mb-2">
                <span className="text-red-200 text-xs m-2">{sessionError}</span>
                <button
                  onClick={async () => {
                    // Trigger zkLogin process with current URL as return destination
                    const currentUrl =
                      window.location.pathname + window.location.search;
                    await loginWithProvider("google", currentUrl);
                  }}
                  className="flex-1 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded text-red-300 text-xs transition-colors"
                >
                  Re-login
                </button>
              </div>
            )}

            {sessionInfo ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Status:</span>
                  <span
                    className={`font-medium ${
                      sessionInfo.epochsRemaining >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {sessionInfo.epochsRemaining >= 0 ? "✓ Valid" : "✗ Expired"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Current Epoch:</span>
                  <span className="text-white font-mono">
                    {sessionInfo.currentEpoch}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Max Epoch:</span>
                  <span className="text-white font-mono">
                    {sessionInfo.maxEpoch}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Epochs Remaining:</span>
                  <span
                    className={`font-mono ${
                      sessionInfo.epochsRemaining >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {sessionInfo.epochsRemaining}
                  </span>
                </div>

                {/* Session expired error - only when current epoch > max epoch */}
                {sessionInfo.epochsRemaining < 0 && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded p-2">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-red-400">❌</span>
                      <span className="text-red-200 text-xs">
                        Session has expired. Please re-login to continue.
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          // Trigger zkLogin process with current URL as return destination
                          const currentUrl =
                            window.location.pathname + window.location.search;
                          await loginWithProvider("google", currentUrl);
                        }}
                        className="flex-1 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded text-red-300 text-xs transition-colors"
                      >
                        Re-login
                      </button>
                      <button
                        onClick={checkSession}
                        disabled={isCheckingSession}
                        className="flex-1 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded text-blue-300 text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isCheckingSession ? (
                          <span className="inline-flex items-center gap-1">
                            <span className="w-3 h-3 border border-blue-300 border-t-transparent rounded-full animate-spin"></span>
                            <span>Checking...</span>
                          </span>
                        ) : (
                          "Refresh Session"
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-1">
                <p className="text-white/60 text-xs">
                  Session status not available
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Owned Objects */}
      <div className={STYLES.ownedObjectsSection}>
        <h2 className={STYLES.ownedObjectsTitle}>Your Objects</h2>
        <OwnedObjects address={account.address} client={client} />
      </div>
    </div>
  );
}
