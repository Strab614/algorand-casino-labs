// Mock wallet hook for testing without real wallet connection
import { useState, useCallback } from 'react';

export interface MockWalletState {
  activeAddress: string | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  signTransactions: (txns: Uint8Array[]) => Promise<Uint8Array[]>;
}

export const useMockWallet = (): MockWalletState => {
  const [isConnected, setIsConnected] = useState(false);
  const [activeAddress, setActiveAddress] = useState<string | null>(null);

  // Mock Algorand address for testing
  const mockAddress = "TESTMOCKADDRESS7777777777777777777777777777777777777777";

  const connect = useCallback(() => {
    setIsConnected(true);
    setActiveAddress(mockAddress);
  }, []);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    setActiveAddress(null);
  }, []);

  const signTransactions = useCallback(async (txns: Uint8Array[]): Promise<Uint8Array[]> => {
    // Mock transaction signing - just return the unsigned transactions
    // In a real implementation, this would sign the transactions
    console.log('Mock wallet: Signing transactions', txns.length);
    return txns;
  }, []);

  return {
    activeAddress,
    isConnected,
    connect,
    disconnect,
    signTransactions,
  };
};