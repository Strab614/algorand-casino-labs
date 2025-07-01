import { useEffect, useState } from "react";

import { Container, Box, Typography, IconButton } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import { Outlet, useOutletContext } from "react-router-dom";
import { AboutDialog } from "../../features/lottery/components";
import { useAppSelector } from "../../app/hooks";
import { selectLastKnownRound } from "../../features/appSlice";
import {
  getAlgodConfigFromViteEnvironment,
  getIndexerConfigFromViteEnvironment,
} from "@/utils/network";
import { Algodv2, Indexer } from "algosdk";

const algodConfig = getAlgodConfigFromViteEnvironment();
const algod = new Algodv2(
  algodConfig.token as string,
  algodConfig.server,
  algodConfig.port
);

const indexerConfig = getIndexerConfigFromViteEnvironment();
const indexer = new Indexer(
  indexerConfig.token as string,
  indexerConfig.server,
  indexerConfig.port
);

type ContextType = {
  isLoading: boolean;
  manager: string;
  applications: [];
  currentRound: number;
};

// on 31/01/2024 the XAW address was used to list on algogems unexpectedly.
const blacklistedAlgogemsApps = [
  2735518328, 2735524952, 2735520191, 2735523084,
];

const LotteryLayout = () => {
  const manager = import.meta.env.VITE_LOTTERY_MANAGER_ADDRESS;

  const [isLoading, setIsLoading] = useState(false);
  const [applications, setApplications] = useState<[]>([]);

  const [isAboutDialogOpen, setIsAboutDialogOpen] = useState(false);

  const lastKnownRound = useAppSelector(selectLastKnownRound);

  useEffect(() => {
    if (algod && indexer && manager && manager.trim() !== "") {
      const doit = async () => {
        setIsLoading(true);

        try {
          const r = await indexer
            .lookupAccountCreatedApplications(manager)
            .includeAll(true)
            .limit(1000)
            .do();

          // sort by created-at-round descending
          const sorted = r["applications"].sort((a: any, b: any) => {
            return b["created-at-round"] - a["created-at-round"];
          });

          const filtered = sorted.filter((v: any) => {
            return !blacklistedAlgogemsApps.includes(v.id);
          });

          setApplications(filtered);
        } catch (error) {
          console.error("Error fetching lottery applications:", error);
          setApplications([]);
        }

        setIsLoading(false);
      };

      doit();
    } else {
      // If manager address is not set, clear applications and stop loading
      setApplications([]);
      setIsLoading(false);
    }
  }, [algod, indexer, manager]);

  return (
    <Container sx={{ my: 2, pb: 2 }}>
      <AboutDialog
        open={isAboutDialogOpen}
        onClose={() => setIsAboutDialogOpen(false)}
      />
      <Box
        component="div"
        sx={{
          paddingBottom: 1,
          display: "flex",
          flex: 1,
          alignItems: "center",
        }}
      >
        <Typography variant="h4" color="text.primary">
          Lottery
        </Typography>
        <IconButton
          aria-label="info"
          size="large"
          color="primary"
          onClick={() => setIsAboutDialogOpen(true)}
          sx={{ height: "100%" }}
        >
          <InfoOutlinedIcon fontSize="inherit" />
        </IconButton>
      </Box>
      <Outlet
        context={{
          isLoading,
          manager,
          applications,
          currentRound: lastKnownRound,
        }}
      />
    </Container>
  );
};

export default LotteryLayout;

export const useLottery = () => {
  return useOutletContext<ContextType>();
};