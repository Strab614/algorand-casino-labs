import React from "react";
import { useAppDispatch } from "../app/hooks";
import {
  Alert,
  Box,
  Button,
  AlertTitle,
  Typography,
  Divider,
  Card,
  CardContent,
  CardHeader,
} from "@mui/material";
import { setIsWalletModalOpen } from "../features/appSlice";
import AsaIcon from "./AsaIcon";

const WalletNotConnected = () => {
  const dispatch = useAppDispatch();

  const onConnectNow = async () => {
    dispatch(setIsWalletModalOpen(true));
  };

  return (
    <Card sx={{ minWidth: "sm", maxWidth: "sm" }}>
      <CardHeader
        avatar={<AsaIcon asaId={388592191} />}
        title={
          <Typography variant="h6" color="text.primary">
            Wallet not connected
          </Typography>
        }
        sx={{
          backgroundColor: "#272727",
        }}
      />
      <Divider />
      <CardContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-around",
            alignItems: "center",
            backgroundColor: "#1e1e1e",
            width: "355px",
            height: "100%",
            borderRadius: "4px",
          }}
        >
          <Alert variant="filled" severity="error">
            <AlertTitle>Error</AlertTitle>
            You must connect your wallet first to proceed.
          </Alert>
          <Divider sx={{ py: 2 }} />
          <Button
            size="small"
            variant="contained"
            onClick={() => onConnectNow()}
          >
            Connect now
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export { WalletNotConnected };
