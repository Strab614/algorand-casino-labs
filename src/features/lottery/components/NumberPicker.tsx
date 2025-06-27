import { Box, Button, Grid, LinearProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { SingleLotteryNumber } from ".";
import { LotteryNumbers } from "../types";

export interface Props {
  currentNumbers?: LotteryNumbers;
  howMany: number; // how many numbers do we need?
  min: number; // minimum value
  max: number; // max value
  onConfirm: (numbers: LotteryNumbers) => void; // function called when confirm is clicked
}

const NumberPicker = ({
  howMany,
  min,
  max,
  onConfirm,
  currentNumbers,
}: Props) => {
  const [numSelected, setNumSelected] = useState<number>(
    currentNumbers?.length ? currentNumbers.length : 0
  );
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);

  useEffect(() => {
    if (currentNumbers && selectedNumbers.length <= 0) {
      setSelectedNumbers([
        currentNumbers[0],
        currentNumbers[1],
        currentNumbers[2],
        currentNumbers[3],
        currentNumbers[4],
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const numberElements = () => {
    const els = [];

    for (let i = min; i <= max; i += 1) {
      const index = selectedNumbers.findIndex((v) => v === i);

      els.push(
        <Grid item xs={2}>
          <Button
            disabled={numSelected === 5 && index === -1}
            onClick={() => {
              //  console.log(index);
              if (index !== -1) {
                const c = selectedNumbers;

                // remove this element from array
                c.splice(index, 1);

                setSelectedNumbers(c);

                setNumSelected(numSelected - 1);
              } else {
                const c = selectedNumbers;

                c.push(i);

                setSelectedNumbers(c);

                setNumSelected(numSelected + 1);
              }
            }}
          >
            <SingleLotteryNumber n={i} matches={selectedNumbers.includes(i)} />
          </Button>
        </Grid>
      );
    }

    return els;
  };
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Typography>Numbers</Typography>
        <Typography>
          {numSelected} of {howMany}
        </Typography>
      </Box>

      <LinearProgress
        variant="determinate"
        value={(numSelected / howMany) * 100}
        sx={{ height: 10, width: "100%", my: 1 }}
      />
      <Grid container spacing={0} maxWidth={"md"}>
        {numberElements()}
      </Grid>

      <Button
        sx={{ visibility: numSelected <= 0 ? "hidden" : "visible", mb: 1 }}
        disabled={numSelected <= 0}
        onClick={() => {
          setSelectedNumbers([]);
          setNumSelected(0);
        }}
      >
        Clear all
      </Button>

      <Button
        variant="contained"
        size="large"
        sx={{ maxWidth: 150 }}
        disabled={numSelected < 5}
        onClick={() => {
          const c = selectedNumbers;
          if (c) {
            // sort by smallest first

            c.sort((a, b) => a - b);
            // notify caller
            if (c.length === 5) {
              onConfirm([c[0], c[1], c[2], c[3], c[4]]);
            }
          }
        }}
      >
        Confirm
      </Button>
    </Box>
  );
};

export default NumberPicker;
