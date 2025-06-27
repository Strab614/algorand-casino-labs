import { Container, Typography, Box, Skeleton, useTheme } from "@mui/material";

import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import AsaIcon from "@/components/AsaIcon";

import { useQuery } from "@tanstack/react-query";
import {
  CasinoLeaderboardResponse,
  getCasinoLeaderboard,
} from "@/api/casino/casino";
import { useNotification } from "@/hooks/useNotification";
import { Header } from "@/app/Header";

const columns: GridColDef[] = [
  {
    field: "rank",
    headerName: "Rank",
  },
  {
    field: "name",
    headerName: "Name",
    flex: 1,
  },
  {
    field: "betCount",
    headerName: "Bet Count",
    type: "number",
    flex: 1,
  },
  {
    field: "betTotal",
    headerName: "Chips Bet",
    type: "number",
    flex: 1,
    renderCell: (params: GridRenderCellParams) => {
      return (
        <>
          {params.row.betTotal.toLocaleString()}
          <Box component="div" sx={{ pl: 0.5 }}>
            <AsaIcon asaId={388592191} size={12} />
          </Box>
        </>
      );
    },
  },
  {
    field: "bonus",
    headerName: "Bonus",
    type: "number",
    flex: 1,
    renderCell: (params: GridRenderCellParams) => {
      const calcBonus = () => {
        switch (params.row.rank) {
          case 1:
            return 500;
          case 2:
            return 250;
          case 3:
            return 125;
          case 4:
            return 75;
          case 5:
            return 50;
          default:
            return 0;
        }
      };
      return (
        <>
          {calcBonus()}
          <Box component="div" sx={{ pl: 0.5 }}>
            <AsaIcon asaId={0} size={12} />
          </Box>
        </>
      );
    },
  },
];

const LeaderboardResult = ({
  result,
}: {
  result: CasinoLeaderboardResponse;
}) => {
  const now = new Date(result.lastUpdatedAt);

  const dateOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false, // Use 24-hour format
  };

  const formattedDate = now.toLocaleDateString(undefined, dateOptions);
  const formattedTime = now.toLocaleTimeString(undefined, timeOptions);

  return (
    <>
      <Typography variant="h6" color="text.primary" sx={{ mb: 2 }}>
        Last Updated At: {formattedDate} {formattedTime}
      </Typography>
      <Box component="div" sx={{ width: "100%" }}>
        <DataGrid
          sx={{
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#272727",
            },
            "& .MuiDataGrid-panelFooter": {
              backgroundColor: "red",
            },
          }}
          autoHeight
          rows={result.entries}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          disableSelectionOnClick
          getRowId={(row) => row.userId}
        />
      </Box>
    </>
  );
};

const Leaderboard = () => {
  const theme = useTheme();
  const notification = useNotification();

  const { isLoading, isError, data, error } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => getCasinoLeaderboard(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isError) {
    notification.display({
      type: "error",
      message: `Error fetching leaderboard data: ${error.message}`,
    });
  }

  return (
    <Container sx={{ my: 2 }}>
      <Header
        title="Casino Leaderboard"
        whatIsThisContent={
          <Box component="div">
            <Typography variant="body1" paragraph color="text.primary">
              Here you can see the top 10 players on the casino site by amount
              wagered over the last 7 days. Each Monday a pot of 1000 ALGO will
              be distributed amongst the top 5 by amount wagered. This will be
              sent to your address, there is no need to claim.
            </Typography>
            <Typography variant="body1" paragraph color="text.primary">
              1st - 500 2nd - 250 3rd - 125 4th - 75 5th - 50
            </Typography>
          </Box>
        }
      />

      {isLoading || !data ? (
        <>
          <Skeleton
            variant="text"
            sx={{ fontSize: theme.typography.h6.fontSize, mb: 2 }}
          />
          <Skeleton variant="rectangular" sx={{ height: 600, width: "100%" }} />
        </>
      ) : (
        <LeaderboardResult result={data} />
      )}
    </Container>
  );
};

export default Leaderboard;
