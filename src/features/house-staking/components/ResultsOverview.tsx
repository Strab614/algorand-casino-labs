import React from "react";
import { Stack, Typography, Paper, CardContent } from "@mui/material";

import AsaIcon from "@/components/AsaIcon";

export const StakingResultsOverview = ({
  profit,
  totalStakers,
  totalRewards,
}: {
  profit: number;
  totalStakers: number;
  totalRewards: number;
}) => {
  return (
    <Stack direction="row" justifyContent="space-around" spacing={2} sx={{ mb: 1 }}>
      <Paper sx={{ backgroundColor: "secondary.dark", flex: 1 }}>
        <CardContent>
          <Stack>
            <Typography variant="subtitle2" color="text.primary">
              Total Profit
            </Typography>
            <div style={{ display: "flex", flex: 1, alignItems: "center" }}>
              <Typography variant="body2" color="text.primary" fontSize={16}>
                {profit}
              </Typography>
              <AsaIcon asaId={388592191} size={24} />
            </div>
          </Stack>
        </CardContent>
      </Paper>
      <Paper sx={{ backgroundColor: "secondary.dark", flex: 1 }}>
        <CardContent>
          <Stack>
            <Typography variant="subtitle2" color="text.primary">
              Total Eligible
            </Typography>
            <Typography variant="body2" color="text.primary" fontSize={16}>
              {totalStakers}
            </Typography>
          </Stack>
        </CardContent>
      </Paper>
      <Paper sx={{ backgroundColor: "secondary.dark", flex: 1 }}>
        <CardContent>
          <Stack>
            <Typography variant="subtitle2" color="text.primary">
              Total Rewards
            </Typography>
            <Typography variant="body2" color="text.primary" fontSize={16}>
              {totalRewards.toFixed(1)}
            </Typography>
          </Stack>
        </CardContent>
      </Paper>
    </Stack>
  );
};
