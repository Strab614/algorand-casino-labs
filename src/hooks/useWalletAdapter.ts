import { useWallet } from '@txnlab/use-wallet-react';
import { useMockWalletContext } from '@/components/MockWalletProvider';

const IS_MOCK_MODE = import.meta.env.VITE_MOCK_WALLET_MODE === 'true';

export const useWalletAdapter = () => {
  // In mock mode, use the mock wallet context
  if (IS_MOCK_MODE) {
    const mockWallet = useMockWalletContext();
    return {
      activeAddress: mockWallet.activeAddress,
      transactionSigner: mockWallet.signTransactions,
      signTransactions: mockWallet.signTransactions,
      isConnected: mockWallet.isConnected,
      connect: mockWallet.connect,
      disconnect: mockWallet.disconnect,
      // Mock additional properties that might be needed
      activeWallet: mockWallet.isConnected ? { disconnect: mockWallet.disconnect } : null,
      wallets: [],
    };
  }

  // In real mode, use the real wallet hook
  try {
    return useWallet();
  } catch (error) {
    // If useWallet fails (likely because it's not within a WalletProvider),
    // return a mock implementation with empty values
    console.warn('useWallet failed, using mock implementation');
    return {
      activeAddress: null,
      transactionSigner: async () => [],
      signTransactions: async () => [],
      isConnected: false,
      connect: () => {},
      disconnect: () => {},
      activeWallet: null,
      wallets: [],
    };
  }
};