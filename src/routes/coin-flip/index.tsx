import { useEffect, useState } from "react";

import CoinFlipPage from "@/features/coin-flip/fiverr/CoinFlipPage";
import {
  AboutDialog,
  CoinFlipSpeedDial,
} from "@/features/coin-flip/components";
import { Box } from "@mui/material";
import { StatsDialog } from "@/features/coin-flip/components/StatsDialog";
import { syncCoinFlipGame } from "@/features/coin-flip/utils";
import { useAppSelector } from "@/app/hooks";
import { selectNetworkClients } from "@/features/appSlice";
import { CoinFlipGame, CoinFlipGlobalState } from "@/features/coin-flip/types";
import { ManagerDialog } from "@/features/coin-flip/components/ManagerDialog";
import { useWalletAdapter } from "@/hooks/useWalletAdapter";

const CoinFlipIndex = () => {
  const [isAboutDialogOpen, setIsAboutDialogOpen] = useState(false);
  const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false);
  const [isManagerDialogOpen, setIsManagerDialogOpen] = useState(false);

  const { activeAddress, transactionSigner } = useWalletAdapter();
  const { algod } = useAppSelector(selectNetworkClients);
  const [globalState, setGlobalState] = useState<CoinFlipGlobalState | null>(
    null
  );
  const [game, setGame] = useState<CoinFlipGame | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const sync = async () => {
    console.log("syncing");
  };

  useEffect(() => {
    (async () => {
      if (activeAddress && !globalState) {
        setIsLoading(true);

        // just get a global state with a dummy account
        const r = await syncCoinFlipGame(
          Number(import.meta.env.VITE_COIN_FLIP_APP_ID),
          activeAddress,
          transactionSigner,
          algod
        );

        if (r.game) {
          setGame(r.game);
        }

        setGlobalState(r.globalState);

        setIsLoading(false);
      }
    })();
  }, [activeAddress, algod]);

  return (
    <Box component="div" width="100%">
      <AboutDialog
        open={isAboutDialogOpen}
        onClose={() => setIsAboutDialogOpen(false)}
      />
      <StatsDialog
        open={isStatsDialogOpen}
        onClose={() => setIsStatsDialogOpen(false)}
        stats={globalState!}
      />
      <ManagerDialog
        open={isManagerDialogOpen}
        onClose={() => setIsManagerDialogOpen(false)}
      />
      <CoinFlipPage
        appId={Number(import.meta.env.VITE_COIN_FLIP_APP_ID)}
        globalState={globalState as CoinFlipGlobalState}
        game={game ? game : undefined}
        loading={isLoading}
        sync={sync}
      />
      <CoinFlipSpeedDial
        onInfoClick={() => setIsAboutDialogOpen(!isAboutDialogOpen)}
        onStatsClick={() => setIsStatsDialogOpen(!isStatsDialogOpen)}
        // only show manage button if the active address is the manager
        onManageClick={
          activeAddress === globalState?.manager
            ? () => setIsManagerDialogOpen(!isManagerDialogOpen)
            : undefined
        }
      />
    </Box>
  );
};

export default CoinFlipIndex;