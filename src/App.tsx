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

const darkTheme = createTheme({
  palette: {
    // background: {
    //   default: "skyblue",
    // },
    mode: "dark",
    primary: {
      main: "#edbc50",
      contrastText: "#fff", //button text white instead of black
    },
    // secondary: {
    //   light: "#0066ff",
    //   main: "#0044ff",
    //   // dark: will be calculated from palette.secondary.main,
    //   contrastText: "#ffcc00",
    // },
    text: {
      //primary: "#fff",
    },
    // Used by `getContrastText()` to maximize the contrast between
    // the background and the text.
    // contrastThreshold: 3,
    // // Used by the functions below to shift a color's luminance by approximately
    // // two indexes within its tonal palette.
    // // E.g., shift from Red 500 to Red 300 or Red 700.
    // tonalOffset: 0.2,
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

function App() {
  const [isLoading, setIsLoading] = React.useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const getAlgodStatus = async () => {
      setIsLoading(true);

      const lastRound = await getLastRound();

      dispatch(setLastKnownRound(lastRound));

      setIsLoading(false);
    };
    (async () => {
      await getAlgodStatus();
    })();

    const interval = setInterval(async () => {
      await getAlgodStatus();
    }, 10_000);

    return () => clearInterval(interval);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ThemeProvider theme={darkTheme}>
      <WalletProvider manager={walletManager}>
        <QueryClientProvider client={queryClient}>
          <CssBaseline />
          {/* Notification Snackbar */}
          <Notification />
          {/* Wallet Connect Modal */}
          <ConnectWalletModal />
          {/* Sign Transaction Modal */}
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
            {/* <Footer /> */}
          </BrowserRouter>
        </QueryClientProvider>
      </WalletProvider>
    </ThemeProvider>
  );
}

export default App;
