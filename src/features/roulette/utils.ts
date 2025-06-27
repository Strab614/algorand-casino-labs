import {
  BET_TYPE_COLOR,
  BET_TYPE_COLUMN,
  BET_TYPE_DOZEN,
  BET_TYPE_EIGHTEEN,
  BET_TYPE_ODDS_OR_EVEN,
  BET_TYPE_NUMBER,
  RouletteBet,
} from "./types";

/*
 * Convert raw representation of RouletteBet[] into a JS object
 */
export const tupleArrayToRouletteBets = (
  tuple: [number, number, bigint | number][]
): RouletteBet[] => {
  return tuple.map((tuple) => ({
    type: tuple[0],
    n: tuple[1],
    amount: tuple[2],
  }));
};

export const fmtRouletteBet = (type: number, n: number) => {
  switch (type) {
    case BET_TYPE_COLOR:
      return {
        type: BET_TYPE_COLOR,
        name: "Color",
        bet: n === 0 ? "Red" : "Black",
      };
    case BET_TYPE_COLUMN:
      return {
        type: BET_TYPE_COLUMN,
        name: "Column",
        bet: n === 0 ? "1st" : n === 1 ? "2nd" : "3rd",
      };

    case BET_TYPE_DOZEN:
      return {
        type: BET_TYPE_DOZEN,
        name: "Dozen",
        bet: n === 0 ? "1st" : n === 1 ? "2nd" : "3rd",
      };

    case BET_TYPE_EIGHTEEN:
      return {
        type: BET_TYPE_EIGHTEEN,
        name: "Eighteen",
        bet: n === 0 ? "1st" : "2nd",
      };

    case BET_TYPE_ODDS_OR_EVEN:
      return {
        type: BET_TYPE_ODDS_OR_EVEN,
        name: "Odds or Even",
        bet: n === 0 ? "Odds" : "Evens",
      };
    case BET_TYPE_NUMBER:
      return {
        type: BET_TYPE_NUMBER,
        name: "Number",
        bet: n === 0 ? "0" : n === 37 ? "00" : n.toString(),
      };
    default:
      return {
        type: -1,
        name: "Unknown",
        bet: n.toString(),
      };
  }
};
