import { Box, Typography, Stack, Button } from "@mui/material";
import { TransactionSigner } from "algosdk";
import { deleteRoulette } from "../api/roulette";

export const RouletteManager = ({
  appId,
  activeAddress,
  transactionSigner,
}: {
  appId: bigint;
  activeAddress: string;
  transactionSigner: TransactionSigner;
}) => {
  return (
    <Box
      component={"div"}
      sx={{
        p: 1,
        background: "gainsboro",
        borderRadius: 1,
      }}
    >
      <Typography>You are the manager of this smart contract.</Typography>
      <Stack spacing={1}>
        <Box component="div">
          <Button variant="contained">Add Prize Pool</Button>
        </Box>
        <Box component="div">
          <Button
            variant="contained"
            onClick={async () => {
              await deleteRoulette(appId, activeAddress, transactionSigner);
            }}
          >
            Delete
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};
