import { Box, IconButton, Stack, TextField } from "@mui/material";
import { useState, useEffect } from "react";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import { LotteryNumbers } from "../types";
import { UniqueRandomNumber } from "@ts-pro/unique-random-number";

const MIN_NUMBER = 1;
const MAX_NUMBER = 50;

const random = new UniqueRandomNumber(MIN_NUMBER, MAX_NUMBER);

export interface Props {
  onChange: (numbers: LotteryNumbers) => void;
}

export const LotteryNumbersSelect = ({ onChange }: Props) => {
  const [isLoading, setIsLoading] = useState(true);

  const [numbers, setNumbers] = useState<LotteryNumbers>();

  const shuffle = async () => {
    setIsLoading(true);

    setNumbers([
      random.get(),
      random.get(),
      random.get(),
      random.get(),
      random.get(),
    ]);

    setIsLoading(false);
  };

  useEffect(() => {
    shuffle();

    setIsLoading(false);
  }, []);

  return (
    <Box component="div" sx={{ p: 1, maxWidth: "sm" }}>
      {isLoading || !numbers ? (
        <p>Loading...</p>
      ) : (
        <Stack direction="row" spacing={1} justifyContent="space-between">
          <TextField
            required
            InputProps={{ sx: { borderRadius: 8 } }}
            sx={{
              width: 50,
              "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                {
                  display: "none",
                },
              "& input[type=number]": {
                MozAppearance: "textfield",
              },
            }}
            id="num1"
            size="small"
            value={numbers[0]}
            type="number"
            variant="outlined"
            inputProps={{ maxLength: 2 }}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              const curr = numbers;

              curr[0] = parseInt(event.target.value, 10);

              if (curr[0] < MIN_NUMBER || curr[0] > MAX_NUMBER) {
                curr[0] = parseInt(event.target.defaultValue, 10);
              } else if (isNaN(curr[0])) {
                return;
              }
              setNumbers(curr);
              onChange(numbers);
            }}
          />
          <TextField
            required
            InputProps={{ sx: { borderRadius: 8 } }}
            sx={{
              width: 50,
              "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                {
                  display: "none",
                },
              "& input[type=number]": {
                MozAppearance: "textfield",
              },
            }}
            id="num2"
            size="small"
            type="number"
            variant="outlined"
            value={numbers[1]}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              const curr = numbers;

              curr[1] = parseInt(event.target.value, 10);

              if (curr[1] < MIN_NUMBER || curr[1] > MAX_NUMBER) {
                curr[1] = parseInt(event.target.defaultValue, 10);
              } else if (isNaN(curr[1])) {
                return;
              }

              setNumbers(curr);
              onChange(numbers);
            }}
          />
          <TextField
            required
            InputProps={{ sx: { borderRadius: 8 } }}
            sx={{
              width: 50,
              "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                {
                  display: "none",
                },
              "& input[type=number]": {
                MozAppearance: "textfield",
              },
            }}
            id="num3"
            size="small"
            type="number"
            variant="outlined"
            value={numbers[2]}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              const curr = numbers;

              curr[2] = parseInt(event.target.value, 10);

              if (curr[2] < MIN_NUMBER || curr[2] > MAX_NUMBER) {
                curr[2] = parseInt(event.target.defaultValue, 10);
              } else if (isNaN(curr[2])) {
                return;
              }
              setNumbers(curr);
              onChange(numbers);
            }}
          />
          <TextField
            required
            InputProps={{ sx: { borderRadius: 8 } }}
            sx={{
              width: 50,
              "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                {
                  display: "none",
                },
              "& input[type=number]": {
                MozAppearance: "textfield",
              },
            }}
            id="num4"
            size="small"
            type="number"
            variant="outlined"
            value={numbers[3]}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              const curr = numbers;

              curr[3] = parseInt(event.target.value, 10);

              if (curr[3] < MIN_NUMBER || curr[3] > MAX_NUMBER) {
                curr[3] = parseInt(event.target.defaultValue, 10);
              } else if (isNaN(curr[3])) {
                return;
              }
              setNumbers(curr);

              onChange(numbers);
            }}
          />
          <TextField
            required
            InputProps={{ sx: { borderRadius: 8 } }}
            sx={{
              width: 50,
              "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                {
                  display: "none",
                },
              "& input[type=number]": {
                MozAppearance: "textfield",
              },
            }}
            id="num5"
            size="small"
            type="number"
            variant="outlined"
            value={numbers[4]}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              const curr = numbers;

              curr[4] = parseInt(event.target.value, 10);

              if (curr[4] < MIN_NUMBER || curr[4] > MAX_NUMBER) {
                curr[4] = parseInt(event.target.defaultValue, 10);
              } else if (isNaN(curr[4])) {
                return;
              }
              setNumbers(curr);
              onChange(numbers);
            }}
          />
          <Box
            component="div"
            sx={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <IconButton aria-label="shuffle">
              <ShuffleIcon onClick={shuffle} />
            </IconButton>
          </Box>
        </Stack>
      )}
    </Box>
  );
};
