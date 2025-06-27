import { Avatar, Box, Divider, Paper, Stack, Typography } from "@mui/material";
import React from "react";

const AVERAGE_BLOCK_TIME = 2.9; // 2.9 seconds is roughly the block time

export interface Props {
  currentRound: number;
  drawRound: number;
}

// convenience to convert
function convertTime(s: number): {
  seconds: number;
  minutes: number;
  hours: number;
  days: number;
} {
  // Time calculations for days, hours, minutes and seconds
  var days = Math.floor(s / (1000 * 60 * 60 * 24));
  var hours = Math.floor((s % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((s % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((s % (1000 * 60)) / 1000);

  return { seconds, hours, minutes, days };
}

export const Countdown = ({ currentRound, drawRound }: Props) => {
  const diff = drawRound - currentRound;
  const t =
    diff >= 0 ? convertTime(diff * AVERAGE_BLOCK_TIME * 1000) : convertTime(0);

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
          Draw Countdown
        </Typography>
      </Box>
      <Divider />
      <Stack
        direction="row"
        spacing={1}
        padding={2}
        justifyContent={"space-around"}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Avatar
            sx={{
              color: "white",
              border: `4px solid gold}`,
            }}
          >
            {t.days}
          </Avatar>
          <Typography
            paddingTop={1}
            textAlign={"center"}
            variant="body2"
            fontSize={16}
            fontWeight={400}
          >
            Days
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Avatar
            sx={{
              color: "white",
              border: `4px solid gold}`,
            }}
          >
            {t.hours}
          </Avatar>
          <Typography
            paddingTop={1}
            textAlign={"center"}
            variant="body2"
            fontSize={16}
            fontWeight={400}
          >
            Hours
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Avatar
            sx={{
              color: "white",
              border: `4px solid gold}`,
            }}
          >
            {t.minutes}
          </Avatar>
          <Typography
            paddingTop={1}
            textAlign={"center"}
            variant="body2"
            fontSize={16}
            fontWeight={400}
          >
            Mins
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Avatar
            sx={{
              color: "white",
              border: `4px solid gold}`,
            }}
          >
            {t.seconds}
          </Avatar>
          <Typography
            paddingTop={1}
            textAlign={"center"}
            variant="body2"
            fontSize={16}
            fontWeight={400}
          >
            Secs
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};
