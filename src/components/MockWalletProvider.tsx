import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';

// Mock wallet state interface
export interface MockWalletState {
  activeAddress: string | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  signTransactions: (txns: Uint8Array[]) => Promise<Uint8Array[]>;
}

// Create context with null as initial value
const MockWalletContext = createContext<MockWalletState | null>(null);

interface MockWalletProviderProps {
  children: ReactNode;
}

export const MockWalletProvider: React.FC<MockWalletProviderProps> = ({ children }) => {
  // Mock Algorand address for testing
  const mockAddress = "TESTMOCKADDRESS7777777777777777777777777777777777777777";
  
  const [isConnected, setIsConnected] = useState(false);
  const [activeAddress, setActiveAddress] = useState<string | null>(null);

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
    console.log('Mock wallet: Signing transactions', txns.length);
    return txns;
  }, []);

  const mockWalletState: MockWalletState = {
    activeAddress,
    isConnected,
    connect,
    disconnect,
    signTransactions,
  };

  return (
    <MockWalletContext.Provider value={mockWalletState}>
      {children}
    </MockWalletContext.Provider>
  );
};

export const useMockWalletContext = (): MockWalletState => {
  const context = useContext(MockWalletContext);
  if (!context) {
    throw new Error('useMockWalletContext must be used within MockWalletProvider');
  }
  return context;
};