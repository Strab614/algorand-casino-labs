import { useMemo } from "react";

import { Stack, Grid, Typography } from "@mui/material";

import {
  LotteryPrizeStructure,
  LotteryListCard,
} from "../../features/lottery/components";
import { DeletedListCard } from "../../features/lottery/components/DeletedListCard";
import { parseLotteryGlobalState } from "../../features/lottery/utils";
import { useLottery } from "./layout";
import Loading from "../../components/Loading";
import { WhatIsThis } from "@/components/WhatIsThis";

const LotteryIndex = () => {
  const { applications, currentRound, isLoading } = useLottery();

  const currentLotteries = useMemo(() => {
    return applications.filter(
      (v) => !v["deleted"] && v["created-at-round"] >= currentRound - 201600 * 2
    );
  }, [applications, currentRound]);

  const deletedLotteries = useMemo(() => {
    return applications.filter(
      (v) =>
        v["deleted"] && v["deleted-at-round"] - v["created-at-round"] > 10000
    );
  }, [applications]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Stack spacing={2} sx={{ pb: 2 }}>
      <Grid container spacing={1}>
        <Grid item sm={12} sx={{ width: "100%" }}>
          <WhatIsThis>
            <Typography variant="body1" paragraph color="text.primary">
              Lottery is a newly implemented functionality on the labs site. It
              utilises smart contracts deployed on the Algorand blockchain.
              These contracts allow you to interact with a lottery in a provably
              fair transparent way.
            </Typography>
          </WhatIsThis>
        </Grid>
        <Grid item sm={12}>
          <Typography variant="h5" textAlign={"left"} sx={{ my: 1 }}>
            Prize Structure
          </Typography>
          <LotteryPrizeStructure />
        </Grid>
        <Grid item sm={12}>
          <Typography variant="h5" textAlign={"left"} sx={{ my: 1 }}>
            Current Lotteries
          </Typography>
        </Grid>
        {currentLotteries.map((x: any) => {
          const gs = parseLotteryGlobalState(x.params["global-state"]);

          return (
            <Grid item sm={12} md={6} key={x.id}>
              <LotteryListCard
                appId={x.id}
                assetId={gs.assetId as number}
                name={gs.name}
                ticketPrice={gs.ticketPrice as number}
                currentRound={currentRound}
                drawRound={gs.drawRound as number}
                endRound={gs.endRound as number}
                prizePool={gs.prizePool as number}
                winningNumbers={gs.winningNumbers}
              />
            </Grid>
          );
        })}
        <Grid item sm={12}>
          <Typography variant="h5" textAlign={"left"} sx={{ my: 1 }}>
            Previous Lotteries
          </Typography>
        </Grid>
        {currentRound &&
          deletedLotteries.map((x: any) => {
            return (
              <Grid item sm={12} md={6} key={x.id}>
                <DeletedListCard
                  appId={x.id}
                  currentRound={currentRound}
                  createdAt={x["created-at-round"]}
                  deletedAt={x["deleted-at-round"]}
                  creator={x.params.creator}
                />
              </Grid>
            );
          })}
      </Grid>
    </Stack>
  );
};

export default LotteryIndex;
