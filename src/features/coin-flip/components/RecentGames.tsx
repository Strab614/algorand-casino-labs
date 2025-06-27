import {
  Typography,
  Box,
  Button,
  useTheme,
  Stack,
  Pagination,
} from "@mui/material";
import React, { useEffect, useState } from "react";

import {
  CoinFlipGameCompleteGameEvent,
  CoinFlipGameEvent,
  CoinFlipLogsFormatted,
} from "../types";
import { ellipseAddress, formattedAssetAmount } from "../../../utils/utils";
import AsaIcon from "../../../components/AsaIcon";

export interface Props {
  logs: CoinFlipLogsFormatted;
  assetId: number;
}

const RecentGame = ({ address, bet, won, txid, assetId }: any) => {
  const theme = useTheme();
  const isWinner = won >= bet;

  return (
    <Box
      sx={{
        border: `1px solid ${
          isWinner ? theme.palette.success.main : theme.palette.error.main
        }`,
        borderRadius: 1,
        backgroundColor: "#1e1e1e",
        mb: 1,
        p: 1,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <AsaIcon asaId={assetId} size={24} />
        <Typography fontFamily={"monospace"} variant="body2" paddingLeft={1}>
          {ellipseAddress(address)} bet {formattedAssetAmount(assetId, bet)} and{" "}
          {isWinner ? `won ${formattedAssetAmount(assetId, won)}` : "lost"}
        </Typography>
      </Box>
      <Button
        variant="contained"
        size="small"
        sx={{ color: "white" }}
        color={isWinner ? "success" : "error"}
        onClick={() => window.open(`https://allo.info/tx/${txid}`, "_blank")}
      >
        View
      </Button>
    </Box>
  );
};

export const RecentGames = ({ logs, assetId }: Props) => {
  const [recentGames, setRecentGames] = useState<CoinFlipGameEvent[]>();

  const [page, setPage] = React.useState(1);
  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  useEffect(() => {
    const filtered: CoinFlipGameEvent[] = logs.events.filter((event) => {
      return event.type === "CompleteGame";
    });

    setRecentGames(filtered);
  }, [logs.events]);

  const getLogsSection = (): CoinFlipGameEvent[] => {
    if (!recentGames) return [];

    let r = recentGames || [];
    r = recentGames.slice((page - 1) * 10, (page - 1) * 10 + 10);
    return r;
  };

  return (
    <Stack spacing={2} maxWidth={"xl"}>
      <Typography variant="h5" color="text.primary">
        Recent Games
      </Typography>

      {recentGames && (
        <>
          <Box>
            {getLogsSection().map((v: CoinFlipGameEvent, index) => {
              const completeGameEvent = v.data as CoinFlipGameCompleteGameEvent;

              return (
                <RecentGame
                  key={`recent-game-${index}`}
                  {...completeGameEvent}
                  assetId={assetId}
                  txid={v.txid}
                />
              );
            })}
          </Box>
          <Pagination
            count={Math.round(recentGames?.length!! / 10)}
            page={page}
            onChange={handleChange}
          />
        </>
      )}
    </Stack>
  );
};
