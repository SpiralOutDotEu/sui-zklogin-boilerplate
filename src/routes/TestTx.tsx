import { useState } from "react";
import { useZkLogin } from "../state/ZkLoginProvider";
import { Transaction } from "@mysten/sui/transactions";
import type { SuiClient } from "@mysten/sui/client";
import type { ZkSession } from "../types";

/**
 * Execute Test Transaction
 *
 * Sends a small amount of SUI (0.0001) from the user's account to itself.
 * This is a safe way to test that the zkLogin wallet can sign and send transactions.
 *
 * @param session - Active zkLogin session with signing capabilities
 * @param client - Sui blockchain client for RPC calls
 * @returns Transaction execution result
 */
async function executeTestTx(session: ZkSession, client: SuiClient) {
  const txb = new Transaction();
  txb.setSender(session.address);

  // Split 0.0001 SUI (100000 MIST) from gas and transfer to self
  // This is a safe test transaction that doesn't affect the user's balance
  const [coin] = txb.splitCoins(txb.gas, [txb.pure.u64(100000)]); // 0.0001 SUI = 100000 MIST
  txb.transferObjects([coin], txb.pure.address(session.address));

  // Sign the transaction with the ephemeral keypair
  const { bytes, signature: userSignature } = await txb.sign({
    client,
    signer: session.ephemeralKeypair,
  });

  // Create zkLogin signature combining ephemeral signature with ZK proof
  const zkLoginSignature = session.getSignature(userSignature);

  // Execute the transaction on the blockchain
  return client.executeTransactionBlock({
    transactionBlock: bytes,
    signature: zkLoginSignature,
  });
}

/**
 * TestTx Component
 *
 * This component provides a testing interface for zkLogin transactions.
 * It allows users to send a small test transaction to verify their wallet
 * is working correctly before using it for real transactions.
 *
 * Features:
 * - Safe test transaction (sends 0.0001 SUI to self)
 * - Real-time transaction status
 * - Transaction hash display with explorer link
 * - Debug information for troubleshooting
 */
export default function TestTx() {
  const { account, ensureZkSession, ensureValidSession, client, clearSalt } =
    useZkLogin();
  const [isSending, setIsSending] = useState(false);
  const [txDigest, setTxDigest] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [copied, setCopied] = useState(false);

  /**
   * Execute Test Transaction
   *
   * This function handles the complete flow of sending a test transaction:
   * 1. Ensure zkLogin session is available and valid
   * 2. Create and sign the transaction
   * 3. Submit to blockchain
   * 4. Display results
   */
  const run = async () => {
    if (typeof ensureValidSession !== "function") {
      console.error("ensureValidSession is not a function");
      setError("ensureValidSession is not available");
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      // Get or create valid zkLogin session for transaction signing
      // This will automatically handle session expiration and trigger re-login if needed
      const session = await ensureValidSession();
      if (!session) {
        console.log(
          "Session expired or invalid - user will be redirected to login"
        );
        setError("Session expired. Please complete the login process.");
        return;
      }

      // Execute the test transaction
      const res = await executeTestTx(session, client);
      setTxDigest(res.digest);
    } catch (error) {
      console.error("Transaction failed:", error);
      setError("Transaction failed: " + (error as Error).message);
    } finally {
      setIsSending(false);
    }
  };

  if (!account?.address) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <span className="text-red-400 text-2xl">🔒</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Please Sign In</h2>
          <p className="text-white/60">
            Connect your wallet to test transactions
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gradient-text">Test Transaction</h1>
        <p className="text-white/70">
          Send 0.0001 SUI to yourself to test your zkLogin wallet
        </p>
      </div>

      {/* Test Transaction Card */}
      <div className="glass-effect rounded-2xl p-8 mt-8">
        <div className="text-center">
          {/* Icon Section */}
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <span className="text-white text-4xl">🧪</span>
          </div>

          {/* Title and Description Section */}
          <div className="space-y-2 mb-2">
            <h2 className="text-2xl font-bold text-white">Test Your Wallet</h2>
            <p className="text-white/60">
              This will send 0.0001 SUI from your account to itself. This is a
              safe way to test that your zkLogin wallet can sign and send
              transactions.
            </p>
          </div>

          {/* Transaction Details Section */}
          <div className="bg-white/5 rounded-xl p-6 text-left mb-8">
            <h3 className="text-lg font-semibold text-white mb-3">
              Transaction Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Network:</span>
                <span className="text-white">Sui Devnet</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">From:</span>
                <span className="font-mono text-white text-xs break-all">
                  {account.address}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">To:</span>
                <span className="font-mono text-white text-xs break-all">
                  {account.address}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Amount:</span>
                <span className="text-white">0.0001 SUI</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Authentication:</span>
                <span className="text-green-400">zkLogin</span>
              </div>
            </div>
          </div>

          {/* Error State Section */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✗</span>
                </div>
                <h3 className="text-lg font-semibold text-red-300">
                  Transaction Failed
                </h3>
              </div>
              <p className="text-red-200/80 text-sm">{error}</p>
            </div>
          )}

          {/* Success State Section */}
          {txDigest ? (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <h3 className="text-lg font-semibold text-green-300">
                  Transaction Successful!
                </h3>
              </div>
              <p className="text-green-200/80 text-sm mb-4">
                Your test transaction has been sent successfully on the Sui
                blockchain.
              </p>

              {/* Transaction Hash Section */}
              <div className="bg-white/5 rounded-lg p-4 mb-4">
                <div className="text-xs text-white/60 font-medium mb-2">
                  Transaction Hash:
                </div>
                <div className="font-mono text-green-300 text-sm break-all bg-black/20 rounded p-2 mb-3">
                  {txDigest}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={`https://suiscan.xyz/devnet/tx/${txDigest}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-300 text-sm transition-colors text-center flex items-center justify-center gap-2"
                  >
                    <span>🔍</span>
                    <span>View on SuiScan</span>
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(txDigest);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <span>{copied ? "✓" : "📋"}</span>
                    <span>{copied ? "Copied!" : "Copy Hash"}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-8">
              <button
                onClick={run}
                disabled={isSending}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold transition-all duration-200 glow-effect hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Sending Transaction...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🧪</span>
                    <span>Send Test Transaction</span>
                  </div>
                )}
              </button>
            </div>
          )}

          {/* Disclaimer Section */}
          <div className="text-xs text-white/50 mb-8">
            This is a test transaction. 0.0001 SUI will be sent from your
            account to itself.
          </div>

          {/* Debug Section - For development and troubleshooting */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="text-xs text-white/50 hover:text-white/70 transition-colors"
            >
              {showDebug ? "Hide" : "Show"} Debug Info
            </button>

            {showDebug && (
              <div className="mt-3 space-y-3">
                {/* User Salt - Critical for address derivation */}
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-xs text-white/60 mb-1">
                    Current Salt:
                  </div>
                  <div className="font-mono text-white text-xs break-all">
                    {localStorage.getItem("zk:user_salt") || "Not set"}
                  </div>
                </div>

                {/* zkLogin Address - Derived from JWT + salt */}
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-xs text-white/60 mb-1">Address:</div>
                  <div className="font-mono text-white text-xs break-all">
                    {account?.address}
                  </div>
                </div>

                {/* Session Status - Check if zkLogin session is available */}
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-xs text-white/60 mb-1">
                    ensureZkSession:
                  </div>
                  <div className="font-mono text-white text-xs">
                    {typeof ensureZkSession === "function"
                      ? "Available"
                      : "Not available"}
                  </div>
                </div>

                {/* Sui Client Status */}
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-xs text-white/60 mb-1">Client:</div>
                  <div className="font-mono text-white text-xs">
                    {client ? "Available" : "Not available"}
                  </div>
                </div>

                {/* Clear Salt Button - Generates new address */}
                <button
                  onClick={() => {
                    if (
                      confirm(
                        "This will clear your salt and generate a new address. Continue?"
                      )
                    ) {
                      clearSalt();
                    }
                  }}
                  className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded text-red-300 text-xs transition-colors"
                >
                  Clear Salt (New Address)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
