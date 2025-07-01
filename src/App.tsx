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
import { setLastKnownRound } from "./features/appSlice";
import { getLastRound } from "./api/algorand/algorand";
import { Notification } from "./app/Notification";
import { ConnectWalletModal } from "./components/ConnectWalletModal";
import SignTransactionModal from "./components/SignTransactionModal";
import { RouletteIndex } from "./routes/roulette";
import { MockWalletProvider } from "./components/MockWalletProvider";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#edbc50",
      contrastText: "#fff",
    },
    text: {},
  },
  typography: {
    fontFamily: "Poppins",
  },
});

// Create a WalletManager instance
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
      options: { projectId: "a4c6c26e935692deeacd982fa7d4d844" },
    },
  ],
  network: NetworkId.MAINNET,
});

// Create a client
const queryClient = new QueryClient();

// Check if we're in mock mode
const IS_MOCK_MODE = import.meta.env.VITE_MOCK_WALLET_MODE === 'true';

function App() {
  const [isLoading, setIsLoading] = React.useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const getAlgodStatus = async () => {
      setIsLoading(true);

      try {
        const lastRound = await getLastRound();
        dispatch(setLastKnownRound(lastRound));
      } catch (error) {
        console.error("Error fetching last round:", error);
        // Set a mock round number for testing
        if (IS_MOCK_MODE) {
          dispatch(setLastKnownRound(30000000));
        }
      }

      setIsLoading(false);
    };
    
    (async () => {
      await getAlgodStatus();
    })();

    const interval = setInterval(async () => {
      await getAlgodStatus();
    }, 10_000);

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