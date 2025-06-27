import { Box, TextField, InputAdornment, IconButton } from "@mui/material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

const clickSound = new Audio("audio/click.wav");

export interface Props {
  minBet: number;
  maxBet: number;
  step: number; // how much to increment/decrement
  value: number;
  onChange: (bet: number) => void;
  disabled?: boolean;
}

export const BetInput = ({
  minBet,
  maxBet,
  step,
  value,
  onChange,
  disabled,
}: Props) => {
  return (
    <Box
      component={"div"}
      sx={{
        //px: 2,
        // pb: 1,
        display: "flex",
        justifyContent: "center",
        alignContent: "center",
        // width: "100%",
        // gap: 1,
      }}
    >
      <TextField
        disabled={disabled}
        size="small"
        label="Bet"
        variant="outlined"
        value={value.toString()}
        sx={{ textAlign: "center" }}
        onChange={(e) => {
          const re = /^(\d)*(\.)?([0-9]{1})?$/gm;

          if (!re.test(e.target.value) || isNaN(parseFloat(e.target.value))) {
            return;
          }

          onChange(parseInt(e.target.value, 10));
        }}
        InputProps={{
          inputProps: {
            style: { textAlign: "center" },
          },
          startAdornment: (
            <InputAdornment position="start">
              <IconButton
                disabled={disabled}
                color="primary"
                onClick={() => {
                  onChange(minBet);
                }}
              >
                <ArrowDownwardIcon fontSize="small" />
              </IconButton>
              <IconButton
                disabled={disabled}
                color="primary"
                onClick={() => {
                  const newBet = Math.max(minBet, value - step);

                  onChange(newBet);

                  // play click sound
                  clickSound.play();
                }}
              >
                <RemoveIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                disabled={disabled}
                color="primary"
                onClick={() => {
                  const newBet = Math.min(maxBet, value + step);

                  onChange(newBet);

                  // play click sound
                  clickSound.play();
                }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
              <IconButton
                disabled={disabled}
                color="primary"
                onClick={() => {
                  onChange(maxBet);
                }}
              >
                <ArrowUpwardIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
};
