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
import { useNotification } from "@/hooks/useNotification";

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

// Default manager address for testing when environment variable is not set
const DEFAULT_MANAGER_ADDRESS = "ZZAF5ARA4MEC5PVDOP64JM5O5MQST63Q2KOY2FLYFLXXD3PFSNJJBYAFZM";

const LotteryLayout = () => {
  const notification = useNotification();
  // Use default manager address if environment variable is not set or invalid
  const manager = import.meta.env.VITE_LOTTERY_MANAGER_ADDRESS || DEFAULT_MANAGER_ADDRESS;

  const [isLoading, setIsLoading] = useState(false);
  const [applications, setApplications] = useState<[]>([]);

  const [isAboutDialogOpen, setIsAboutDialogOpen] = useState(false);

  const lastKnownRound = useAppSelector(selectLastKnownRound);

  useEffect(() => {
    if (algod && indexer && manager && manager.trim() !== "") {
      const doit = async () => {
        setIsLoading(true);

        try {
          // Check if we're in mock mode
          const IS_MOCK_MODE = import.meta.env.VITE_MOCK_WALLET_MODE === 'true';
          
          if (IS_MOCK_MODE) {
            // Return mock data for testing
            setApplications([
              {
                id: 12345678,
                "created-at-round": lastKnownRound - 1000,
                "deleted": false,
                params: {
                  creator: manager,
                  "global-state": [
                    {
                      key: "bmE=", // "na" in base64
                      value: { bytes: "TG90dGVyeSAjMQ==", type: 1 } // "Lottery #1" in base64
                    },
                    {
                      key: "bWE=", // "ma" in base64
                      value: { bytes: "WlpBRjVBUkE0TUVDNVBWRE9QNjRKTTVPNU1RU1Q2M1EyS09ZMkZMWUZMWFhEM1BGU05KSkJZQUZaTA==", type: 1 }
                    },
                    {
                      key: "YXM=", // "as" in base64
                      value: { uint: 388592191, type: 2 }
                    },
                    {
                      key: "dHA=", // "tp" in base64
                      value: { uint: 1000, type: 2 }
                    },
                    {
                      key: "cHA=", // "pp" in base64
                      value: { uint: 100000, type: 2 }
                    },
                    {
                      key: "ZXI=", // "er" in base64
                      value: { uint: lastKnownRound + 5000, type: 2 }
                    },
                    {
                      key: "ZHI=", // "dr" in base64
                      value: { uint: lastKnownRound + 10000, type: 2 }
                    },
                    {
                      key: "dHM=", // "ts" in base64
                      value: { uint: 50, type: 2 }
                    }
                  ]
                }
              }
            ] as []);
          } else {
            // Fetch real data
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
          }
        } catch (error) {
          console.error("Error fetching lottery applications:", error);
          notification.display({
            type: "error",
            message: `Error fetching lottery applications: ${error instanceof Error ? error.message : 'Unknown error'}`
          });
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
  }, [algod, indexer, manager, lastKnownRound, notification]);

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