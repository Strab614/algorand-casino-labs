import { sha512_256 } from "js-sha512";

// bet types
export const BET_TYPE_COLOR = 0; // 0 === red 1 === black
export const BET_TYPE_COLUMN = 1;
export const BET_TYPE_DOZEN = 2;
export const BET_TYPE_EIGHTEEN = 3;
export const BET_TYPE_ODDS_OR_EVEN = 4; // 0 === odd 1 === even
export const BET_TYPE_NUMBER = 5;

export type RouletteBet = {
  type: number;
  n: number;
  amount: bigint | number;
};

export type RouletteGame = {
  mbrAmountCovered: bigint;
  totalBetAmount: bigint;
  bets: RouletteBet[];
  revealRound: bigint;
};

export type RouletteGameCompleted = {
  /* when did this happen */
  round: bigint;
  /* who was playing */
  address: string;
  /* how much did the player bet */
  totalBetAmount: bigint;
  /* bets made by the player */
  bets: RouletteBet[];
  /* what was the winning number */
  winningNumber: number;
  /* how much did the user win? 0 if lost */
  profitAmount: bigint;
};

export const RouletteGameCompletedHash = sha512_256(
  "RouletteGameCompleted(uint64,address,uint64,(uint8,uint8,uint64)[],uint8,uint64)"
).slice(0, 8);

/**
 * Roulette numbers in the order they appear on the wheel.
 */
export const RouletteNumbers: number[] = [
  0, 28, 9, 26, 30, 11, 7, 20, 32, 17, 5, 22, 34, 15, 3, 24, 36, 13, 1, 37, 27,
  10, 25, 29, 12, 8, 19, 31, 18, 6, 21, 33, 16, 4, 23, 35, 14, 2,
];

/**
 * Roulette wheel animation state.
 */
export type RouletteWheelAnimation = {
  isWorking: boolean;
  ballAngle: number;
  ballPosition: number; // distance from the center of the wheel - 120 = on number, 223 = top
  ballScale: number; // scale of the ball
  ballSpeed: number;
  animationStage: number;
  wheelSpeed: number;
  wheelAngle: number;
  gameTime: number;
  animationTime: number;
  ballNum: number;
  ballIdx: number;
  ballAngleOri: number;
  ballBreakDist: number;
  ballBreakAccl: number;
  ballBreakTime: number;
};
