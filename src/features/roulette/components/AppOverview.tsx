import { ellipseAddress } from "@/utils/utils";
import { Box, Divider, Typography, useTheme } from "@mui/material";
import { RouletteGlobalState } from "../api/roulette";

export interface AppOverviewProps {
  appId: bigint;
  globalState: RouletteGlobalState;
}

export const AppOverview = ({ appId, globalState }: AppOverviewProps) => {
  const theme = useTheme();

  return (
    <Box
      component={"div"}
      sx={{
        p: 1,
        background: theme.palette.grey[700],
        borderRadius: 1,
        width: "100%",
      }}
    >
      <Typography variant="h6">Roulette AppID: {appId.toString()}</Typography>
      <Divider />
      <Typography>Manager: {ellipseAddress(globalState.manager)}</Typography>
      <Typography>Bet Asset: {Number(globalState.betAsset)}</Typography>
      <Typography>Min Bet: {Number(globalState.minBet)}</Typography>
      <Typography>Max Bet: {Number(globalState.maxBet)}</Typography>
      <Typography>Prize Pool: {Number(globalState.prizePool)}</Typography>
      <Typography>Fees: {Number(globalState.fees)}</Typography>
    </Box>
  );
};
