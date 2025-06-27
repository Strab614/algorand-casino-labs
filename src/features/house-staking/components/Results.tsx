import { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import { ellipseAddress } from "@/utils/utils";
import { DataGrid, GridValueGetterParams } from "@mui/x-data-grid";
import { StakingResultsOverview } from "./ResultsOverview";
import { useAppDispatch } from "@/app/hooks";
import { IStakingResults } from "../types";
import { useNotification } from "@/hooks/useNotification";

const houseStakingResultsColumns = [
  {
    field: "address",
    headerName: "Address",
    flex: 1,
    valueGetter: (params: GridValueGetterParams) =>
      `${ellipseAddress(params.row.address)}`,
  },
  {
    field: "percent",
    headerName: "Percent",
    type: "number",
    flex: 1,
    valueGetter: (params: GridValueGetterParams) => params.row.percent,
  },
  {
    field: "reward",
    headerName: "Reward",
    type: "number",
    flex: 1,
    valueGetter: (params: GridValueGetterParams) =>
      (params.row.reward / 100).toFixed(1),
  },
];

export const StakingResults = ({
  stakingPeriodId,
}: {
  stakingPeriodId: number;
}) => {
  const [result, setResult] = useState<IStakingResults>();
  const dispatch = useAppDispatch();
  const notification = useNotification();
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `https://api.algo-casino.com/stakingResults?stakingPeriodId=${stakingPeriodId}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const buf = await response.json();

      if (!response.ok) {
        notification.display({ type: "error", message: buf.message });
        return;
      }

      setResult(buf[0]);
    };

    if (stakingPeriodId) {
      fetchData();
    }
  }, [dispatch, stakingPeriodId]);

  if (!result || !result.results) {
    return null;
  }

  return (
    <>
      <StakingResultsOverview
        totalStakers={result.results.length}
        profit={result.profit * 2}
        totalRewards={result.profit}
      />

      <div style={{ width: "100%" }}>
        <Typography variant="h6" color="text.primary" sx={{ mb: 2 }}>
          House Staking Period #{result.stakingPeriodId} Rewards{" "}
          {result.stakingPeriodId >= 5 ? "(Live)" : "(Dryrun)"}
        </Typography>

        <DataGrid
          sx={{
            mt: 2,
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#272727",
            },
            "& .MuiDataGrid-panelFooter": {
              backgroundColor: "red",
            },
          }}
          autoHeight
          rows={result.results}
          columns={houseStakingResultsColumns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          getRowId={(r) => r.address}
        />
      </div>
    </>
  );
};
