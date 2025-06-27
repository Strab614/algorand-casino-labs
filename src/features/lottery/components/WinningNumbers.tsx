import { Avatar, Box, Divider, Paper, Stack, Typography } from "@mui/material";
import { LotteryNumbers } from "../types";

export interface Props {
  winningNumbers: LotteryNumbers;
}

export const WinningNumbers = ({ winningNumbers }: Props) => {
  return (
    <Paper
      elevation={3}
      sx={{
        minWidth: "sm",
        backgroundColor: "#4158D0",
        backgroundImage:
          "linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)",
      }}
    >
      <Box
        sx={{
          py: 1,
          px: 2,
        }}
      >
        <Typography variant="h6" color="text.primary">
          Winning Numbers
        </Typography>
      </Box>
      <Divider />
      <Typography
        padding={2}
        variant="body2"
        fontFamily="monospace"
        fontWeight={500}
        display={"flex"}
        justifyContent={"center"}
      >
        <Stack direction="row" spacing={1}>
          <Avatar
            alt={winningNumbers[0].toString()}
            sx={{ border: "4px solid gold", color: "white" }}
          >
            {winningNumbers[0]}
          </Avatar>
          <Avatar
            alt={winningNumbers[1].toString()}
            sx={{ border: "4px solid gold", color: "white" }}
          >
            {winningNumbers[1]}
          </Avatar>
          <Avatar
            alt={winningNumbers[2].toString()}
            sx={{ border: "4px solid gold", color: "white" }}
          >
            {winningNumbers[2]}
          </Avatar>
          <Avatar
            alt={winningNumbers[3].toString()}
            sx={{ border: "4px solid gold", color: "white" }}
          >
            {winningNumbers[3]}
          </Avatar>
          <Avatar
            alt={winningNumbers[4].toString()}
            sx={{ border: "4px solid gold", color: "white" }}
          >
            {winningNumbers[4]}
          </Avatar>
        </Stack>
      </Typography>
    </Paper>
  );
};
