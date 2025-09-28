import React, { useState, useEffect } from 'react';
import { useZkLogin, type ZkSession } from '@/features/auth';
import { Transaction } from '@mysten/sui/transactions';
import type { SuiClient } from '@mysten/sui/client';
import { FaucetSection } from '@/shared/ui';
import { TestTransactionForm } from '../ui';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface TxResult {
  digest: string;
  status: 'success' | 'error';
  error?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STYLES = {
  notSignedIn: 'min-h-[60vh] flex items-center justify-center',
  notSignedInContent: 'text-center space-y-4',
  notSignedInIcon: 'w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto',
  notSignedInIconText: 'text-red-400 text-2xl',
  notSignedInTitle: 'text-2xl font-bold text-white',
  notSignedInSubtitle: 'text-white/60',
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

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
async function executeTestTx(session: ZkSession, client: SuiClient): Promise<TxResult> {
  try {
    const txb = new Transaction();
    txb.setSender(session.address);

    // Split 0.0001 SUI (100000 MIST) from gas and transfer to self
    // This is a safe test transaction that doesn't affect the user's balance
    const [coin] = txb.splitCoins(txb.gas, [txb.pure.u64(100000)]); // 0.0001 SUI = 100000 MIST
    txb.transferObjects([coin], txb.pure.address(session.address));

    // Sign the transaction using the session's signTransaction method
    const { bytes, signature: userSignature } = await session.signTransaction(txb, client);

    // Create zkLogin signature combining ephemeral signature with ZK proof
    const zkLoginSignature = session.getSignature(userSignature);

    // Execute the transaction on the blockchain
    const result = await client.executeTransactionBlock({
      transactionBlock: bytes,
      signature: zkLoginSignature,
    });

    return {
      digest: result.digest,
      status: 'success',
    };
  } catch (error) {
    return {
      digest: '',
      status: 'error',
      error: (error as Error).message,
    };
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * TestTx Component
 *
 * Simplified test transaction page using atomic design components.
 * Delegates complex UI to TestTransactionForm organism.
 *
 * @returns JSX element
 */
export default function TestTx() {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================

  const { account, ensureValidSession, client } = useZkLogin();
  const [isSending, setIsSending] = useState(false);
  const [txResult, setTxResult] = useState<TxResult | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

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
        const suiBalance = (Number(balanceData.totalBalance) / 1_000_000_000).toFixed(6);
        setBalance(suiBalance);
      } catch {
        setBalance('Error');
      } finally {
        setBalanceLoading(false);
      }
    };

    fetchBalance();
  }, [account?.address, client]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleSendTransaction = async (): Promise<void> => {
    if (typeof ensureValidSession !== 'function') {
      setTxResult({
        digest: '',
        status: 'error',
        error: 'ensureValidSession is not available',
      });
      return;
    }

    setIsSending(true);
    setTxResult(null);

    try {
      // Get or create valid zkLogin session for transaction signing
      // This will automatically handle session expiration and trigger re-login if needed
      const session = await ensureValidSession();
      if (!session) {
        setTxResult({
          digest: '',
          status: 'error',
          error: 'Session expired. Please complete the login process.',
        });
        return;
      }

      // Execute the test transaction
      const result = await executeTestTx(session as ZkSession, client);
      setTxResult(result);
    } catch (error) {
      setTxResult({
        digest: '',
        status: 'error',
        error: 'Transaction failed: ' + (error as Error).message,
      });
    } finally {
      setIsSending(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!account?.address) {
    return (
      <div className={STYLES.notSignedIn}>
        <div className={STYLES.notSignedInContent}>
          <div className={STYLES.notSignedInIcon}>
            <span className={STYLES.notSignedInIconText}>🔒</span>
          </div>
          <h2 className={STYLES.notSignedInTitle}>Please Sign In</h2>
          <p className={STYLES.notSignedInSubtitle}>Connect your wallet to test transactions</p>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto space-y-8'>
      <TestTransactionForm
        address={account.address}
        isSending={isSending}
        txResult={txResult}
        onSendTransaction={handleSendTransaction}
        balanceCard={
          <FaucetSection
            address={account.address}
            client={client}
            title='Account Balance'
            onBalanceUpdate={newBalance => setBalance(newBalance)}
          />
        }
      />
    </div>
  );
}
