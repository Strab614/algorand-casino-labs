import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  DialogActions,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { CoinFlipGlobalState } from "../types";
import { CoinFlipStats } from "./CoinFlipStats";

export interface StatsDialogProps {
  open: boolean;
  onClose: () => void;
  stats: CoinFlipGlobalState;
}

export const StatsDialog = ({ open, onClose, stats }: StatsDialogProps) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      fullScreen={fullScreen}
    >
      <DialogTitle>Coin Flip Statistics</DialogTitle>
      <DialogContent dividers={true}>
        <CoinFlipStats {...stats} />
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
