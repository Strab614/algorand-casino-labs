import { Box, Typography, useTheme } from "@mui/material";

import { getAlgodNetwork } from "@/utils/network";
// import { useAppSelector } from "./hooks";
// import { selectLastKnownRound } from "@/features/appSlice";

const AlgorandNetwork = () => {
  const theme = useTheme();
  const currentNetwork = getAlgodNetwork();

  // const lastKnownRound = useAppSelector(selectLastKnownRound);
  return (
    <Box
      width="100%"
      display="flex"
      flexDirection="column"
      justifyContent={"center"}
      alignItems="center"
      // padding={1}
    >
      <Typography
        sx={{
          // color:
          background: theme.palette.primary.main,
          borderRadius: 1,
          // py: 1,
          px: 1,
        }}
      >
        {currentNetwork === "testnet" ? "TestNet" : "MainNet"}
      </Typography>
      {/* <Typography>
        {lastKnownRound
          ? `Last known round: ${lastKnownRound}`
          : "Loading last known round..."}
      </Typography> */}
    </Box>
  );
};

export default AlgorandNetwork;
