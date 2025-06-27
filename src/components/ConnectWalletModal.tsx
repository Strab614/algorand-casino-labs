import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Box,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useAppDispatch, useAppSelector } from "../app/hooks";

import {
  selectIsWalletModalOpen,
  setIsWalletModalOpen,
} from "../features/appSlice";
import { useWallet } from "@txnlab/use-wallet-react";

export function Connect() {
  const { wallets } = useWallet();

  return (
    <Stack spacing={1} sx={{ width: "100%" }} alignItems={"center"}>
      {wallets.map((wallet) => (
        <Box key={wallet.id}>
          {wallet.metadata.name.toLowerCase() === "walletconnect" && (
            <Divider sx={{ mt: 1, mb: 2 }} />
          )}
          <Stack direction={"row"}>
            {wallet.isConnected ? (
              <>
                <Button
                  variant="contained"
                  onClick={() => wallet.disconnect()}
                  disabled={!wallet.isConnected}
                  color="error"
                  sx={{
                    width: "300px",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <img
                    width={24}
                    height={24}
                    alt=""
                    src={wallet.metadata.icon}
                    style={{ borderRadius: 2, marginRight: 4 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    {wallet.metadata.name}{" "}
                    {wallet.isActive ? "[Disconnect]" : ""}
                  </Box>
                </Button>

                {!wallet.isActive && (
                  <Button
                    variant="contained"
                    onClick={() => wallet.setActive()}
                    disabled={!wallet.isConnected}
                  >
                    Set Active
                  </Button>
                )}
              </>
            ) : (
              <Button
                variant="contained"
                onClick={() => wallet.connect()}
                disabled={wallet.isConnected}
                sx={{
                  width: "300px",
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <img
                  width={24}
                  height={24}
                  alt=""
                  src={wallet.metadata.icon}
                  style={{ borderRadius: 4, marginRight: 4 }}
                />
                <Box sx={{ flex: 1 }}>
                  {wallet.metadata.name} {wallet.isActive ? "[active]" : ""}
                </Box>
              </Button>
            )}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}

export const ConnectWalletModal = () => {
  const isWalletModalOpen = useAppSelector(selectIsWalletModalOpen);
  const dispatch = useAppDispatch();

  return (
    <Dialog
      open={isWalletModalOpen}
      onClose={() => dispatch(setIsWalletModalOpen(false))}
      maxWidth="sm"
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Connect your wallet
        <IconButton onClick={() => dispatch(setIsWalletModalOpen(false))}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers={true}>
        <Connect />
      </DialogContent>
    </Dialog>
  );
};
