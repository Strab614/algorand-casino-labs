import AsaIcon from "@/components/AsaIcon";
import { formattedAssetAmount, blockTimeAgo } from "@/utils/utils";
import { Paper, Box, Typography, Divider } from "@mui/material";
import * as algokit from "@algorandfoundation/algokit-utils";
import { fmtRouletteBet } from "../utils";
import { RouletteGame } from "../types";
import AmericanRouletteTable from "./AmericanRouletteTable";

interface RouletteGameViewProps {
  lastKnownRound?: number;
  game: RouletteGame;
}

export const RouletteGameView = ({
  game,
  lastKnownRound,
}: RouletteGameViewProps) => {
  return (
    <Paper>
      <Box component="div" sx={{ p: 2 }}>
        <Typography variant="h5">Roulette Game</Typography>
      </Box>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Box component="div" display="flex">
          <Typography sx={{ pr: 1 }}>
            Box cost: {algokit.microAlgos(game.mbrAmountCovered).algos}
          </Typography>
          <AsaIcon asaId={0} />
        </Box>

        <Box component="div" display="flex">
          <Typography sx={{ pr: 1 }}>
            Total bet: {formattedAssetAmount(388592191, game.totalBetAmount)}
          </Typography>
          <AsaIcon asaId={388592191} />
        </Box>
        <Typography>
          Reveal Round: {game.revealRound.toString()}{" "}
          {blockTimeAgo(Number(lastKnownRound), Number(game.revealRound) + 8)}
        </Typography>
        {game.bets.map((bet, i) => {
          const s = fmtRouletteBet(Number(bet.type), Number(bet.n));
          return (
            <Box key={s.name + i} component="div">
              <Typography>
                [**{s.name}**] bet {Number(bet.amount)} on {s.bet}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};
