import {
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  useMediaQuery,
  useTheme,
  Typography,
} from "@mui/material";
import React from "react";

import CloseIcon from "@mui/icons-material/Close";

export interface Props {
  open: boolean;
  onClose: () => void;
}

export const AboutDialog = ({ open, onClose }: Props) => {
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
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        How does the lottery work?
        <CloseIcon onClick={onClose} />
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Typography variant="h6" sx={{ mb: 1 }} color="text.primary">
          When is lotto held?
        </Typography>
        <Typography
          variant="body1"
          paragraph
          sx={{ ml: 1 }}
          color="text.primary"
        >
          • There are two drawings held each week; Tuesdays and Fridays.
        </Typography>
        <Typography
          variant="body1"
          paragraph
          sx={{ ml: 1 }}
          color="text.primary"
        >
          • Ideally these are around 17:00 UTC, but the time varies as block
          times on algorand are variable.
        </Typography>
        <Typography variant="h6" sx={{ mb: 1 }} color="text.primary">
          How do I play the lotto?
        </Typography>
        <Typography
          variant="body1"
          paragraph
          sx={{ ml: 1 }}
          color="text.primary"
        >
          • Any user of the labs site who has a connected wallet can buy a
          maximum of 98 tickets that contain 5 unique numbers between 1-50. You
          can either pick your numbers or have them randomly generated using the
          “I'm feel lucky” button.
        </Typography>
        <Typography variant="h6" sx={{ mb: 1 }} color="text.primary">
          How are my tickets secured?
        </Typography>
        <Typography
          variant="body1"
          paragraph
          sx={{ ml: 1 }}
          color="text.primary"
        >
          • All entries will be validated by the smart contract before being
          accepted.
        </Typography>
        <Typography variant="h6" sx={{ mb: 1 }} color="text.primary">
          What is the payout?
        </Typography>
        <Typography
          variant="body1"
          paragraph
          sx={{ ml: 1 }}
          color="text.primary"
        >
          • For each entry matching 2 numbers, you will receive 300 chips.
        </Typography>
        <Typography
          variant="body1"
          paragraph
          sx={{ ml: 1 }}
          color="text.primary"
        >
          • For each entry matching 3 numbers, you will receive 1000 chips.
        </Typography>
        <Typography
          variant="body1"
          paragraph
          sx={{ ml: 1 }}
          color="text.primary"
        >
          • For each entry matching 4 numbers, you will receive 25,000 chips.
        </Typography>
        <Typography
          variant="body1"
          paragraph
          sx={{ ml: 1 }}
          color="text.primary"
        >
          • If you have an entry matching 5 numbers, you will receive the entire
          remaining jackpot.
        </Typography>
        <Typography variant="h6" sx={{ mb: 1 }} color="text.primary">
          What happens if nobody wins?
        </Typography>
        <Typography
          variant="body1"
          paragraph
          sx={{ ml: 1 }}
          color="text.primary"
        >
          • If nobody wins, the entire remaining prize pool will rollover into
          the next lottery.
        </Typography>
        <Typography
          variant="body1"
          paragraph
          sx={{ ml: 1 }}
          color="text.primary"
        >
          • 20% of each ticket sale is retained as fee's by the lottery manager.
        </Typography>
        <Typography variant="h6" sx={{ mb: 1 }} color="text.primary">
          How is the lottery created?
        </Typography>
        <Typography
          variant="body1"
          paragraph
          sx={{ ml: 1 }}
          color="text.primary"
        >
          • For each lottery the manager creates it fresh including; ASA, price,
          start and end rounds. Additional value can be added to the prize pool
          by anyone, but it's usually the manager who will do this.
        </Typography>
        <Typography variant="h6" sx={{ mb: 1 }} color="text.primary">
          How is the lottery drawn?
        </Typography>
        <Typography
          variant="body1"
          paragraph
          sx={{ ml: 1 }}
          color="text.primary"
        >
          • When the draw round is reached the lottery will be called by an
          external service, reading data from the randomness beacon and using
          this to generate 5 unique numbers using the PCG algorithm. (this can
          be verified external by anyone to ensure fair outcome)
        </Typography>
      </DialogContent>
    </Dialog>
  );
};
