import { Close } from "@mui/icons-material";
import {
  Box,
  Dialog,
  DialogTitle,
  Divider,
  DialogContent,
  Button,
  Alert,
  AlertTitle,
} from "@mui/material";
import { UniqueRandomNumber } from "@ts-pro/unique-random-number";
import { useState, useEffect } from "react";
import { LotteryNumbers, MAX_ENTRIES, MAX_NUMBER, MIN_NUMBER } from "../types";
import NumberPicker from "./NumberPicker";
import { SingleLotteryNumber } from "./SingleLotteryNumber";

import InfoIcon from "@mui/icons-material/Info";

export interface Props {
  onChange: (entry: LotteryNumbers[]) => void;
  existingEntry?: LotteryNumbers[]; // if user has already entered the current lottery
  previousEntry?: LotteryNumbers[]; // users entry from the previous lottery
}

export const LotteryEntrySelect = ({
  existingEntry,
  previousEntry,
  onChange,
}: Props) => {
  const [amount, setAmount] = useState(0);
  const [lotteryNumbers, setLotteryNumbers] = useState<LotteryNumbers[]>([]);
  const [numIndex, setNumIndex] = useState(0);

  const [isNumberPickerOpen, setIsNumberPickerOpen] = useState(false);

  const add = (index: number, value: LotteryNumbers) => {
    //console.log(`add() index: ${index} | amount: ${amount}`);

    if (amount <= MAX_ENTRIES) {
      const c = amount;

      setAmount(c + 1);

      const curr = lotteryNumbers;

      if (index >= 0 && curr[index]) {
        curr[index] = value;
      } else {
        curr.push(value);
      }

      setLotteryNumbers(curr);

      onChange(lotteryNumbers);
    } else {
      // max ticket entries reached
      alert("you can only have a maximum of 98 tickets");
    }
  };

  const remove = (index: number) => {
    //console.log(`remove() index: ${index} | amount: ${amount}`);

    if (amount >= 1) {
      const c = amount;

      setAmount(c - 1);
      const curr = lotteryNumbers;

      // remove this entry
      curr.splice(index, 1);

      setLotteryNumbers(curr);

      onChange(curr);
    }
  };

  const onUsePreviousEntryClick = () => {
    if (previousEntry) {
      setLotteryNumbers([...previousEntry]);
      setAmount(previousEntry.length);
      setNumIndex(previousEntry.length - 1);

      // notify parent
      onChange([...previousEntry]);
    }
  };

  useEffect(() => {
    if (existingEntry && existingEntry.length > 0) {
      setAmount(existingEntry.length);
      setLotteryNumbers([...existingEntry]);
      setNumIndex(existingEntry.length - 1);
    } else if (previousEntry && lotteryNumbers.length <= 0) {
      // disabled while improved
      // setLotteryNumbers([...previousEntry]);
      // setAmount(previousEntry.length);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingEntry]);

  return (
    <Box width={"100%"} maxWidth={"sm"}>
      <Dialog
        open={isNumberPickerOpen}
        onClose={() => setIsNumberPickerOpen(false)}
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Pick 5 Numbers
          <Close onClick={() => setIsNumberPickerOpen(false)} />
        </DialogTitle>
        <Divider />
        <DialogContent>
          <NumberPicker
            min={1}
            max={50}
            howMany={5}
            currentNumbers={lotteryNumbers[numIndex]}
            onConfirm={(numbers: LotteryNumbers) => {
              setIsNumberPickerOpen(false);
              add(numIndex, numbers);
            }}
          />
        </DialogContent>
      </Dialog>
      {previousEntry && lotteryNumbers.length <= 0 && (
        <Box>
          <Alert
            icon={<InfoIcon fontSize="inherit" />}
            severity="info"
            variant="filled"
          >
            <AlertTitle>You have a previous entry</AlertTitle>
            You have entered in the previous lottery. The numbers you chose can
            optionally be reused for this current lottery.
            <Button
              variant="contained"
              size="small"
              sx={{ display: "block", marginTop: 1 }}
              onClick={onUsePreviousEntryClick}
            >
              OK
            </Button>
          </Alert>
        </Box>
      )}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
        }}
      >
        {lotteryNumbers?.map((value, index) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
            key={index}
          >
            <SingleLotteryNumber n={value[0]} />
            <SingleLotteryNumber n={value[1]} />
            <SingleLotteryNumber n={value[2]} />
            <SingleLotteryNumber n={value[3]} />
            <SingleLotteryNumber n={value[4]} />

            <Box>
              <Button
                onClick={() => {
                  setNumIndex(index);
                  setIsNumberPickerOpen(true);
                }}
                disabled={existingEntry && index < existingEntry.length}
              >
                Edit
              </Button>
              <Button
                onClick={() => remove(index)}
                disabled={existingEntry && index < existingEntry.length}
              >
                Delete
              </Button>
            </Box>
          </Box>
        ))}
      </Box>
      <Box
        sx={{
          mt: 1,
          display: "flex",
          gap: 1.2,
          // justifyContent: "center",
          flexDirection: "row",
          justifyContent: "start",
          alignItems: "center",
        }}
      >
        {amount < MAX_ENTRIES && (
          <>
            <SingleLotteryNumber />
            <Button
              variant="contained"
              onClick={() => {
                setNumIndex(amount);
                setIsNumberPickerOpen(true);
              }}
            >
              Pick Numbers
            </Button>
            <SingleLotteryNumber />

            <Box
              sx={{
                display: "flex",
                justifyContent: "start",
                alignContent: "center",
                flexDirection: "row",
              }}
            >
              <Button
                fullWidth
                onClick={() => {
                  const random = new UniqueRandomNumber(MIN_NUMBER, MAX_NUMBER);

                  const l = lotteryNumbers.length;

                  const rs = [
                    random.get()!,
                    random.get()!,
                    random.get()!,
                    random.get()!,
                    random.get()!,
                  ];

                  rs.sort(function (a, b) {
                    return a - b;
                  });

                  add(l, rs as LotteryNumbers);
                }}
              >
                Feeling Lucky?
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};
