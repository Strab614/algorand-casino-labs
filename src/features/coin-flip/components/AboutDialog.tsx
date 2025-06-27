import {
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  useMediaQuery,
  useTheme,
  Typography,
} from "@mui/material";

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
        How does coin flip work?
        <CloseIcon onClick={onClose} />
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Typography variant="h6" sx={{ mb: 1 }} color="text.primary">
          What is this?
        </Typography>
        <Typography
          variant="body1"
          paragraph
          sx={{ ml: 1 }}
          color="text.primary"
        >
          • Coin Flip is a decentralised app that allows users to play the
          classic game of chance; heads or tails. If you win the payout is 190%
          of your original bet. (the house takes 10% as a fee).
        </Typography>
        <Typography variant="h6" sx={{ mb: 1 }} color="text.primary">
          How is result fair?
        </Typography>
        <Typography
          variant="body1"
          paragraph
          sx={{ ml: 1 }}
          color="text.primary"
        >
          • The randomness beacon output at a future commited round is used to
          determine the result. This is completely provable and impossible to
          control the result.
        </Typography>
        <Typography variant="h6" sx={{ mb: 1 }} color="text.primary">
          How to play?
        </Typography>
        <Typography
          variant="body1"
          paragraph
          sx={{ ml: 1 }}
          color="text.primary"
        >
          • Choose an outcome, choose your bet amount then click play. You can
          then sign the transactions and await the result of the game.
        </Typography>
      </DialogContent>
    </Dialog>
  );
};
