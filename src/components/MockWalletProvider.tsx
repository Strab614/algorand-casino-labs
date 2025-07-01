import React, { createContext, useContext, ReactNode } from 'react';
import { useMockWallet, MockWalletState } from '@/hooks/useMockWallet';

const MockWalletContext = createContext<MockWalletState | null>(null);

interface MockWalletProviderProps {
  children: ReactNode;
}

export const MockWalletProvider: React.FC<MockWalletProviderProps> = ({ children }) => {
  const mockWallet = useMockWallet();

  return (
    <MockWalletContext.Provider value={mockWallet}>
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