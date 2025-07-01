// Adapter hook that switches between real wallet and mock wallet based on environment
import { useWallet } from '@txnlab/use-wallet-react';
import { useMockWalletContext } from '@/components/MockWalletProvider';

const IS_MOCK_MODE = import.meta.env.VITE_MOCK_WALLET_MODE === 'true';

export const useWalletAdapter = () => {
  const realWallet = useWallet();
  const mockWallet = useMockWalletContext();

  if (IS_MOCK_MODE) {
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

  return realWallet;
};