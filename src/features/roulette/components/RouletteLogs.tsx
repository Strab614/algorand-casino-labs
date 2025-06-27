import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { getRouletteLogs } from "../api/roulette";
import { blockTimeAgo, ellipseAddress } from "@/utils/utils";
import { useAppSelector } from "@/app/hooks";
import { selectLastKnownRound } from "@/features/appSlice";

interface RouletteLogsProps {
  appId: bigint;
}

export const RouletteLogs = ({ appId }: RouletteLogsProps) => {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["roulette", "logs", Number(appId)],
    queryFn: () => getRouletteLogs(appId),
    staleTime: 1000 * 60,
  });

  const lastKnownRound = useAppSelector(selectLastKnownRound);

  return (
    <Card>
      <CardHeader
        title={
          <div style={{ display: "flex" }}>
            <Typography variant="h5" color="text.primary">
              Roulette Logs
            </Typography>
          </div>
        }
        action={
          <Box
            component={"div"}
            display="flex"
            alignItems="center"
            justifyContent={"center"}
            flexDirection={"column"}
          >
            <IconButton
              size="small"
              aria-label="comment"
              onClick={() => refetch()}
            >
              <RefreshIcon />
            </IconButton>
          </Box>
        }
        sx={{
          backgroundColor: "#272727",
        }}
      />
      <Divider />
      <CardContent sx={{ padding: 0, maxHeight: 400, overflowY: "auto" }}>
        {isLoading || isRefetching ? (
          <div>Loading...</div>
        ) : (
          <>
            {data?.map((log) => (
              <div key={log.round.toString()}>
                <p>
                  {log.round.toString()}{" "}
                  {blockTimeAgo(lastKnownRound, Number(log.round))}
                </p>
                <p>
                  {ellipseAddress(log.address)} bet{" "}
                  {log.totalBetAmount.toString()} and won{" "}
                  {log.profitAmount.toString()} Winning Number:{" "}
                  {log.winningNumber}
                </p>
                <p>Bets: {log.bets.length}</p>
                <Divider />
              </div>
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
};
