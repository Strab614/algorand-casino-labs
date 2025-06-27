import { Box, Divider, Grid, Link, Typography } from "@mui/material";
import Chart from "react-apexcharts";

import AsaIcon from "../../../components/AsaIcon";
import { ellipseAddress, formattedAssetAmount } from "../../../utils/utils";
import { CoinFlipGlobalState } from "../types";

// currently the props are just the CoinFlipGlobalState object
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Props extends CoinFlipGlobalState {}

export const CoinFlipStats = ({
  assetId,
  manager,
  minBet,
  maxBet,
  prizePool,
  fees,
  totalGames,
  totalCancelled,
  totalHeads,
  totalWagered,
  totalWon,
}: Props) => {
  // pie chart
  const d = {
    series: [Number(totalHeads), Number(totalGames) - Number(totalHeads)],
    options: {
      chart: {
        fontFamily: "Poppins",
      },
      legend: {
        labels: {
          colors: ["white", "white"],
        },
      },
      labels: ["Heads", "Tails"],
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {},
            legend: {
              position: "bottom",
            },
          },
        },
      ],
    },
  };

  return (
    <Grid container columnSpacing={2} rowSpacing={1} direction={"row-reverse"}>
      <Grid item xs={12} md={6}>
        <Box sx={{ maxWidth: "md", height: "100%" }}>
          <Box
            sx={{
              py: 1,
            }}
          >
            <Typography variant="h6" color="text.primary">
              Result
            </Typography>
          </Box>
          <Divider />

          <Chart
            series={d.series}
            options={d.options}
            width={"100%"}
            height={"100%"}
            type="pie"
          />
        </Box>
      </Grid>
      <Grid item xs={12} md={6}>
        <Box sx={{ maxWidth: "sm", height: "100%" }}>
          <Box
            sx={{
              py: 1,
            }}
          >
            <Typography variant="h6" color="text.primary">
              Overview
            </Typography>
          </Box>
          <Divider />
          <Box sx={{ px: 0 }}>
            <Box
              display="flex"
              flexDirection="row"
              justifyContent="space-between"
              paddingY={1}
            >
              <Typography variant="subtitle1" color="text.secondary">
                Manager
              </Typography>

              <Link
                variant="subtitle1"
                color="text.secondary"
                target="_blank"
                rel="noopener"
                href={`https://allo.info/account/${manager}`}
              >
                {ellipseAddress(manager)}
              </Link>
            </Box>
            <Divider />
            <Box
              display="flex"
              flexDirection="row"
              justifyContent="space-between"
              paddingY={1}
            >
              <Typography variant="subtitle1" color="text.secondary">
                Bet Limits
              </Typography>

              <Typography variant="subtitle1" color="text.secondary">
                {formattedAssetAmount(assetId, minBet)} -{" "}
                {formattedAssetAmount(assetId, maxBet)}
              </Typography>
            </Box>
            <Divider />
            <Box
              display="flex"
              flexDirection="row"
              justifyContent="space-between"
              paddingY={1}
            >
              <Typography variant="subtitle1" color="text.secondary">
                Prize Pool
              </Typography>

              <Typography
                variant="subtitle1"
                color="text.secondary"
                sx={{ display: "flex" }}
              >
                {formattedAssetAmount(assetId, prizePool)}
                <Box
                  style={{
                    display: "flex",
                    alignItems: "center",
                    paddingLeft: 2,
                  }}
                >
                  <AsaIcon asaId={assetId} />
                </Box>
              </Typography>
            </Box>
            <Divider />
            <Box
              display="flex"
              flexDirection="row"
              justifyContent="space-between"
              paddingY={1}
            >
              <Typography variant="subtitle1" color="text.secondary">
                Fees
              </Typography>

              <Typography
                variant="subtitle1"
                color="text.secondary"
                sx={{ display: "flex" }}
              >
                {formattedAssetAmount(assetId, fees)}
                <Box
                  style={{
                    display: "flex",
                    alignItems: "center",
                    paddingLeft: 2,
                  }}
                >
                  <AsaIcon asaId={assetId} />
                </Box>
              </Typography>
            </Box>
            <Divider />
            <Box
              display="flex"
              flexDirection="row"
              justifyContent="space-between"
              paddingY={1}
            >
              <Typography variant="subtitle1" color="text.secondary">
                Complete
              </Typography>

              <Typography variant="subtitle1" color="text.secondary">
                {Number(totalGames)}
              </Typography>
            </Box>
            <Divider />
            <Box
              display="flex"
              flexDirection="row"
              justifyContent="space-between"
              paddingY={1}
            >
              <Typography variant="subtitle1" color="text.secondary">
                Cancelled
              </Typography>

              <Typography variant="subtitle1" color="text.secondary">
                {Number(totalCancelled)}
              </Typography>
            </Box>
            <Divider />
            <Box
              display="flex"
              flexDirection="row"
              justifyContent="space-between"
              paddingY={1}
            >
              <Typography variant="subtitle1" color="text.secondary">
                Wagered
              </Typography>

              <Typography
                variant="subtitle1"
                color="text.secondary"
                sx={{ display: "flex" }}
              >
                {formattedAssetAmount(assetId, totalWagered)}
                <Box
                  style={{
                    display: "flex",
                    alignItems: "center",
                    paddingLeft: 2,
                  }}
                >
                  <AsaIcon asaId={assetId} />
                </Box>
              </Typography>
            </Box>
            <Divider />
            <Box
              display="flex"
              flexDirection="row"
              justifyContent="space-between"
              paddingY={1}
            >
              <Typography variant="subtitle1" color="text.secondary">
                Winnings
              </Typography>

              <Typography
                variant="subtitle1"
                color="text.secondary"
                sx={{ display: "flex" }}
              >
                {formattedAssetAmount(assetId, totalWon)}
                <Box
                  style={{
                    display: "flex",
                    alignItems: "center",
                    paddingLeft: 2,
                  }}
                >
                  <AsaIcon asaId={assetId} />
                </Box>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};
