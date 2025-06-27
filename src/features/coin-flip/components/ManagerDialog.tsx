import { useState } from "react";
import { addPrizePool, deleteCoinFlipApp, getFees } from "../utils";
import { useWallet } from "@txnlab/use-wallet-react";

import {
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useTheme,
  Box,
  Typography,
  TextField,
  Divider,
} from "@mui/material";
import { useNotification } from "@/hooks/useNotification";
import { getAlgodConfigFromViteEnvironment } from "@/utils/network";
import { Algodv2 } from "algosdk";

export interface ManagerDialogProps {
  open: boolean;
  onClose: () => void;
}

const appId = Number(import.meta.env.VITE_COIN_FLIP_APP_ID);

const algodConfig = getAlgodConfigFromViteEnvironment();
const algod = new Algodv2(
  algodConfig.token as string,
  algodConfig.server,
  algodConfig.port
);

export const ManagerDialog = ({ open, onClose }: ManagerDialogProps) => {
  const { activeAddress, transactionSigner } = useWallet();

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  const [amountToAdd, setAmountToAdd] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const notification = useNotification();
  // claim manager fees
  const onGetFeesClick = async () => {
    console.log("getFees");

    if (activeAddress) {
      setIsLoading(true);

      try {
        // make the app call
        await getFees(appId, transactionSigner, activeAddress, algod);
        // alert user of success
        notification.display({
          type: "success",
          message: "getFees() succeeded!",
        });
      } catch (error) {
        // log for debugging
        console.error("getFees() failed", error);
        // alert user
        notification.display({
          type: "error",
          message: "getFees() failed!",
        });
      }

      setIsLoading(false);
    }
  };

  // add to prize pool
  const onAddPrizePoolClick = async () => {
    if (activeAddress) {
      setIsLoading(true);

      try {
        // make the app call
        const newPrizePool = await addPrizePool(
          appId,
          transactionSigner,
          activeAddress,
          amountToAdd,
          algod
        );
        // alert user of success
        notification.display({
          type: "success",
          message: `addPrizePool() succeeded! new balance: ${newPrizePool}`,
        });
      } catch (error) {
        // log for debugging
        console.error("addPrizePool() failed", error);
        // alert user
        notification.display({
          type: "error",
          message: "addPrizePool() failed!",
        });
      }

      setIsLoading(false);
    }
  };

  // delete the application
  const onDeleteClick = async () => {
    if (activeAddress) {
      setIsLoading(true);

      try {
        // make the app call
        await deleteCoinFlipApp(appId, transactionSigner, activeAddress, algod);

        // alert user of success
        notification.display({
          type: "success",
          message: "deleteApplication() succeeded!",
        });
      } catch (error) {
        // log for debugging
        console.error("deleteApplication() failed", error);
        // alert user
        notification.display({
          type: "error",
          message: "deleteApplication() failed!",
        });
      }

      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      fullScreen={fullScreen}
    >
      <DialogTitle>Coin Flip Management</DialogTitle>
      <DialogContent
        dividers={true}
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-evenly",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Box component={"div"}>
          <Typography variant="h6" color="text.primary">
            Add Prize Pool
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Typography sx={{ mb: 1 }}>
            This will allow the manager to add to the prize pool. The amount
            must be the raw amount to be added of the asset that is already
            pre-determined by the coin flip app.
          </Typography>

          <TextField
            id="outlined-number"
            label="Number"
            type="number"
            InputLabelProps={{
              shrink: true,
            }}
            value={amountToAdd}
            onChange={(e) => {
              setAmountToAdd(Number((e.target as HTMLInputElement).value));
            }}
          />
          <Button
            variant="contained"
            color="primary"
            sx={{ maxWidth: 120, ml: 1 }}
            onClick={onAddPrizePoolClick}
            disabled={isLoading}
          >
            Add
          </Button>
        </Box>
        <Box component={"div"}>
          <Typography variant="h6" color="text.primary">
            Claim Fees
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Typography sx={{ mb: 1 }}>
            This will allow the manager to claim the pending fees stored in the
            application. This will fail if there are no pending fees to claim.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ maxWidth: 120 }}
            onClick={onGetFeesClick}
            disabled={isLoading}
          >
            Get Fees
          </Button>
        </Box>
        <Box component={"div"}>
          <Typography variant="h6" color="text.primary">
            Delete Application
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Typography sx={{ mb: 1 }}>
            This will allow the manager to delete the application, claiming any
            fees, prize pool (can be determined in the logs) and remaining ALGOs
            in the process. This is a one way operatio and cannot be undone.
            This operation will fail if there are any pending games in progress.
          </Typography>
          <Button
            variant="contained"
            color="error"
            sx={{ maxWidth: 120 }}
            onClick={onDeleteClick}
            disabled={isLoading}
          >
            Delete
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
