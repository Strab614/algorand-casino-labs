import React, { useMemo, useState } from "react";
import {
  BET_TYPE_COLOR,
  BET_TYPE_COLUMN,
  BET_TYPE_DOZEN,
  BET_TYPE_EIGHTEEN,
  BET_TYPE_ODDS_OR_EVEN,
  BET_TYPE_NUMBER,
  RouletteBet,
} from "../types";
import { BetInput } from "@/components/BetInput";

import { Badge, Box, Button, Stack, TextField } from "@mui/material";

const betSound = new Audio("/audio/roulette/bet.wav");
const clearSound = new Audio("/audio/roulette/unbet.wav");
const noneSound = new Audio("/audio/roulette/none.wav");
const startSound = new Audio("/audio/roulette/start.wav");
// First, let's organize the outside bets by rows
const outsideBetsRows: { type: number; name: string; n: number }[][] = [
  [
    { type: BET_TYPE_DOZEN, name: "1st 12", n: 0 },
    { type: BET_TYPE_DOZEN, name: "2nd 12", n: 1 },
    { type: BET_TYPE_DOZEN, name: "3rd 12", n: 2 },
  ],
  [
    { type: BET_TYPE_EIGHTEEN, name: "0-18", n: 0 },
    { type: BET_TYPE_ODDS_OR_EVEN, name: "Even", n: 1 },
    { type: BET_TYPE_COLOR, name: "Red", n: 0 },
    { type: BET_TYPE_COLOR, name: "Black", n: 1 },

    { type: BET_TYPE_ODDS_OR_EVEN, name: "Odd", n: 0 },
    { type: BET_TYPE_EIGHTEEN, name: "19-36", n: 1 },
  ],
];

const redNumbers = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);

export interface AmericanRouletteTableProps {
  existingBets?: RouletteBet[];
  readOnly?: boolean;
  onPlay: (bet: RouletteBet[]) => void;
}

const AmericanRouletteTable: React.FC<AmericanRouletteTableProps> = ({
  existingBets = [],
  readOnly,
  onPlay,
}) => {
  const [bets, setBets] = useState<RouletteBet[]>(existingBets);
  const [currentBetAmount, setCurrentBetAmount] = useState<number>(100);

  const toggleBet = (type: number, value: number) => {
    // user should not be able to place bets if the game is read only
    if (readOnly) {
      noneSound.play();
      return;
    }

    setBets((prev) => {
      const existingBetIndex = prev.findIndex(
        (b) => Number(b.n) === value && Number(b.type) === type
      );
      if (existingBetIndex >= 0) {
        clearSound.play();
        return prev.filter((_, index) => index !== existingBetIndex);
      } else {
        betSound.play();
      }

      const r = [
        ...prev,
        {
          type: type,
          n: value,
          amount: BigInt(currentBetAmount),
        },
      ];

      return r;
    });
  };

  const getTotalBetAmount = useMemo(() => {
    return bets.reduce((acc, bet) => acc + Number(bet.amount), 0);
  }, [bets]);

  const getBetAmount = (type: number, value: string | number) =>
    Number(
      bets.find((bet) => Number(bet.type) === type && Number(bet.n) === value)
        ?.amount || 0
    );

  const getNumberColor = (num: number | string): string => {
    if (num === "0" || num === "00") return "#2e7d32"; // Green
    if (typeof num === "number")
      return redNumbers.has(num) ? "#f44336" : "#000";
    return "#777";
  };

  const numberGrid = () => {
    // Create the rows in American Roulette table order
    const rows: number[][] = [
      [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
      [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
      [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
    ];

    return (
      <div style={{ display: "flex", justifyContent: "center", gap: 2 }}>
        {/* 0 / 00 Column */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            //justifyContent: "space-around",
            gap: 4,

            marginRight: 2,
          }}
        >
          {["00", "0"].map((val) => {
            return (
              <Badge
                key={val}
                badgeContent={getBetAmount(
                  BET_TYPE_NUMBER,
                  Number(val === "00" ? 37 : 0)
                )}
                color="primary"
                max={1000}
              >
                <Button
                  onClick={() =>
                    toggleBet(BET_TYPE_NUMBER, val === "00" ? 37 : 0)
                  }
                  variant="outlined"
                  sx={{
                    height: { xs: 30, sm: 45, md: 60 },
                    minWidth: 0,
                    width: { xs: 20, sm: 30, md: 40 },
                    minHeight: 0,
                    fontSize: { xs: 10, sm: 12, md: 14 },
                  }}
                >
                  {val}
                </Button>
              </Badge>
            );
          })}
        </div>

        {/* Main number grid */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            marginBottom: 1,
          }}
        >
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} style={{ display: "flex", gap: 2 }}>
              {row.map((num) => {
                return (
                  <Badge
                    key={num}
                    badgeContent={getBetAmount(BET_TYPE_NUMBER, num)}
                    color="primary"
                    max={1000}
                  >
                    <Button
                      size="small"
                      onClick={() => toggleBet(BET_TYPE_NUMBER, num)}
                      variant="contained"
                      sx={{
                        height: { xs: 20, sm: 30, md: 40 },
                        minWidth: 0,
                        width: { xs: 20, sm: 30, md: 40 },
                        minHeight: 0,
                        backgroundColor: getNumberColor(num),
                        fontSize: { xs: 10, sm: 12, md: 14 },
                      }}
                    >
                      {num}
                    </Button>
                  </Badge>
                );
              })}
            </div>
          ))}

          {/* Outside Bets */}
          {outsideBetsRows.map((row, rowIndex) => (
            <div
              key={"row" + rowIndex}
              style={{
                display: "flex",
                gap: 2,
                marginTop: 2,
              }}
            >
              {row.map((bet, i) => {
                return (
                  <Badge
                    key={"rowBet" + i}
                    badgeContent={getBetAmount(bet.type, bet.n)}
                    color="primary"
                    max={1000}
                    sx={{ flex: 1 }}
                  >
                    <Button
                      size="small"
                      key={bet.name}
                      onClick={() => toggleBet(bet.type, bet.n)}
                      variant={
                        bet.type === BET_TYPE_COLOR ? "contained" : "outlined"
                      }
                      sx={{
                        height: { xs: 20, sm: 30, md: 40 },
                        minWidth: 0,
                        width: "100%",
                        backgroundColor:
                          bet.type === BET_TYPE_COLOR
                            ? bet.n === 0
                              ? "#f44336" // Red
                              : "black" // Black
                            : "inherit",
                        fontSize: {
                          xs: 10,
                          sm: 12,
                          md: 14,
                        },
                        padding: {
                          xs: 0,
                        },
                      }}
                    >
                      {bet.name}
                    </Button>
                  </Badge>
                );
              })}
            </div>
          ))}
        </div>

        {/* Column Bets */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            marginLeft: 2,
          }}
        >
          {[0, 1, 2].map((val) => {
            return (
              <Badge
                key={"column" + val}
                badgeContent={getBetAmount(BET_TYPE_COLUMN, val)}
                color="primary"
                max={1000}
              >
                <Button
                  onClick={() => toggleBet(BET_TYPE_COLUMN, val)}
                  variant="outlined"
                  sx={{
                    height: { xs: 20, sm: 30, md: 40 },
                    minWidth: 0,
                    width: { xs: 20, sm: 30, md: 40 },
                    minHeight: 0,
                    fontSize: { xs: 10, sm: 12, md: 14 },
                  }}
                >
                  2:1
                </Button>
              </Badge>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Box
      component="div"
      display="flex"
      flexDirection="column"
      alignItems="center"
      // width="100%"
    >
      {/* Horizontal Table */}
      {numberGrid()}

      {/* <div style={{ marginTop: 10 }}></div>
      {/* Debug Output */}
      {/* <div style={{ marginTop: 10, fontSize: 14 }}>
        <strong>Selected Bets:</strong>
        {bets.map((bet) => {
          const r = fmtRouletteBet(Number(bet.type), Number(bet.n));

          return (
            <Typography variant="body1" key={`${bet.type}-${bet.n}`}>
              {r.name} {r.bet} {Number(bet.amount)} chip
            </Typography>
          );
        })}
      </div> */}

      <Stack
        direction={"row"}
        spacing={1}
        sx={{ marginBottom: 2, marginTop: 8 }}
      >
        <Button
          size="small"
          variant="contained"
          sx={{ bgcolor: "#272727" }}
          disabled
        >
          Repeat
        </Button>
        <Button
          size="small"
          variant="contained"
          sx={{ bgcolor: "#272727" }}
          disabled
        >
          Double
        </Button>
        <Button
          size="small"
          variant="contained"
          sx={{ bgcolor: "#272727" }}
          disabled={readOnly || bets.length <= 0}
          onClick={() => {
            // play unbet sound
            clearSound.play();
            setBets([]);
          }}
        >
          Clear
        </Button>
      </Stack>

      <Box
        component="div"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 1,
        }}
      >
        <BetInput
          disabled={readOnly}
          minBet={100}
          maxBet={1000}
          step={10}
          value={currentBetAmount}
          onChange={(e) => setCurrentBetAmount(Math.max(1, e) || 0)}
        />

        <TextField
          label="Total bet"
          size="small"
          variant="outlined"
          value={getTotalBetAmount}
          inputProps={{ style: { textAlign: "center" } }}
          sx={{ width: 80 }}
        />

        <Box component={"div"}>
          <Button
            variant="contained"
            disabled={readOnly || bets.length <= 0}
            //disabled={!canFlip || loading}
            onClick={() => {
              onPlay(bets);
              // play start sound
              startSound.play();
            }}
          >
            Play
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AmericanRouletteTable;
