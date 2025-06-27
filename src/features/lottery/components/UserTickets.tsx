import { Paper, Box, Typography, Divider, Stack } from "@mui/material";
import { SingleLotteryNumber } from "./SingleLotteryNumber";
import { LotteryNumbers } from "../types";

export interface Props {
  userEntry: LotteryNumbers[];
  winningNumbers?: LotteryNumbers;
}

// to display users entry
export const UserTickets = ({ userEntry, winningNumbers }: Props) => {
  return (
    <Paper
      elevation={3}
      sx={{
        maxWidth: "sm",
        backgroundColor: "#4158D0",
        // backgroundImage:
        //s  "linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)",
      }}
    >
      <Box
        sx={{
          py: 1,
          px: 2,
          display: "flex",
          flex: 1,
          alignItems: "center",
        }}
      >
        <Typography variant="h6" color="text.primary">
          My Tickets ({userEntry.length})
        </Typography>
      </Box>
      <Divider />
      <Stack sx={{ p: 2, maxHeight: 300, overflow: "auto" }} spacing={1}>
        {userEntry.map((v, i) => (
          <Typography
            key={i}
            variant="body2"
            fontFamily="monospace"
            fontWeight={500}
            display={"flex"}
            justifyContent={"center"}
          >
            <Stack direction={"row"} spacing={1}>
              <SingleLotteryNumber
                n={v[0]}
                matches={winningNumbers?.includes(v[0])}
              />
              <SingleLotteryNumber
                n={v[1]}
                matches={winningNumbers?.includes(v[1])}
              />
              <SingleLotteryNumber
                n={v[2]}
                matches={winningNumbers?.includes(v[2])}
              />
              <SingleLotteryNumber
                n={v[3]}
                matches={winningNumbers?.includes(v[3])}
              />
              <SingleLotteryNumber
                n={v[4]}
                matches={winningNumbers?.includes(v[4])}
              />
            </Stack>
          </Typography>
        ))}
      </Stack>
    </Paper>
  );
};
