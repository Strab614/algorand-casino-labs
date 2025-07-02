import {
  ThemeProvider,
  createTheme,
  Container,
  CssBaseline,
} from "@mui/material";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import TopBar from "./app/TopBar";

import NFTBuyback from "./routes/nft-buy-back";
import CasinoRefund from "./routes/casino-refund";
import HouseStaking from "./routes/house-staking";
import Help from "./routes/help";
import LotteryLayout from "./routes/lottery/layout";
import LotteryIndex from "./routes/lottery";
import LotteryView from "./routes/lottery/view";
import CoinFlipIndex from "./routes/coin-flip";
import Leaderboard from "./routes/Leaderboard";

import {
  NetworkId,
  WalletId,
  WalletManager,
  WalletProvider,
} from "@txnlab/use-wallet-react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import React, { useEffect } from "react";
import { useAppDispatch } from "./app/hooks";
import { setLastKnownRound, setIsConnected, setNetworkHealth } from "./features/appSlice";
import { getLastRound } from "./api/algorand/algorand";
import { Notification } from "./app/Notification";
import { ConnectWalletModal } from "./components/ConnectWalletModal";
import SignTransactionModal from "./components/SignTransactionModal";
import { RouletteIndex } from "./routes/roulette";
import { MockWalletProvider } from "./components/MockWalletProvider";
import { validateNetworkConfig } from "./utils/network";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#edbc50",
      contrastText: "#fff",
    },
    secondary: {
      main: "#4158D0",
    },
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
    text: {
      primary: "#ffffff",
      secondary: "#b0b0b0",
    },
  },
  typography: {
    fontFamily: "Poppins, Arial, sans-serif",
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

// Enhanced WalletManager with latest configuration
const walletManager = new WalletManager({
  wallets: [
    WalletId.DEFLY,
    WalletId.PERA,
    WalletId.EXODUS,
    {
      id: WalletId.LUTE,
      options: { siteName: "Algorand Casino Labs" },
    },
    {
      id: WalletId.WALLETCONNECT,
      options: { 
        projectId: "a4c6c26e935692deeacd982fa7d4d844",
        metadata: {
          name: "Algorand Casino Labs",
          description: "Decentralized gaming platform on Algorand",
          url: "https://labs.algo-casino.com",
          icons: ["https://labs.algo-casino.com/logo192.png"],
        },
      },
    },
  ],
  network: NetworkId.MAINNET,
});

// Enhanced QueryClient with better defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && error.message.includes('4')) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

// Check if we're in mock mode
const IS_MOCK_MODE = import.meta.env.VITE_MOCK_WALLET_MODE === 'true';

function App() {
  const [isLoading, setIsLoading] = React.useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const checkNetworkHealth = async () => {
      setIsLoading(true);

      try {
        // Validate network configuration first
        const isConfigValid = validateNetworkConfig();
        if (!isConfigValid) {
          throw new Error("Invalid network configuration");
        }

        const lastRound = await getLastRound();
        dispatch(setLastKnownRound(lastRound));
        dispatch(setIsConnected(true));
        dispatch(setNetworkHealth({
          algod: true,
          indexer: true, // Assume indexer is healthy if algod is
        }));
      } catch (error) {
        console.error("Error fetching network status:", error);
        dispatch(setIsConnected(false));
        dispatch(setNetworkHealth({
          algod: false,
          indexer: false,
        }));
        
        // Set a mock round number for testing in mock mode
        if (IS_MOCK_MODE) {
          dispatch(setLastKnownRound(30000000));
          dispatch(setIsConnected(true));
        }
      }

      setIsLoading(false);
    };
    
    // Initial check
    checkNetworkHealth();

    // Set up periodic health checks
    const interval = setInterval(checkNetworkHealth, 30_000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [dispatch]);

  const AppContent = () => (
    <ThemeProvider theme={darkTheme}>
      <QueryClientProvider client={queryClient}>
        <CssBaseline />
        <Notification />
        <ConnectWalletModal />
        <SignTransactionModal />
        <BrowserRouter>
          <TopBar>
            <Routes>
              <Route path="/nftBuyback" element={<NFTBuyback />} />
              <Route path="/nftRefund" element={<CasinoRefund />} />
              <Route path="/house" element={<HouseStaking />} />
              <Route path="/leaderboard" element={<Leaderboard />} />

              <Route path="/lottery" element={<LotteryLayout />}>
                <Route path="" element={<LotteryIndex />} />
                <Route path=":appId" element={<LotteryView />} />
              </Route>

              <Route path="coinFlip" element={<CoinFlipIndex />} />
              <Route path="roulette" element={<RouletteIndex />} />

              <Route path="" element={<Navigate to="/lottery" />} />
              <Route path="/help" element={<Help />} />
              <Route
                path="*"
                element={
                  <Container sx={{ p: 2 }}>
                    <p>Whatever you are looking for, it is not here!</p>
                  </Container>
                }
              />
            </Routes>
          </TopBar>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );

  if (IS_MOCK_MODE) {
    return (
      <MockWalletProvider>
        <AppContent />
      </MockWalletProvider>
    );
  }

  return (
    <WalletProvider manager={walletManager}>
      <AppContent />
    </WalletProvider>
  );
}

export default App;