import { sha512_256 } from "js-sha512";

export const BOX_STORAGE_COST = 0.0349;

export type CoinFlipGlobalState = {
  manager: string; // who can manage the contract
  name: string; // name of the instance
  assetId: number | bigint; // accepted bet asset
  beaconAppId: number | bigint; // id of the randomness beacon used
  // config
  feePercent: number | bigint;
  minBet: number | bigint;
  maxBet: number | bigint;
  fees: number | bigint;
  prizePool: number | bigint;
  // stats
  totalGames: number | bigint;
  totalCancelled: number | bigint;
  totalHeads: number | bigint;
  totalWagered: number | bigint;
  totalWon: number | bigint;
};

export type CoinFlipGame = {
  wager: number; // how much is wagered
  heads: number; // what does the user think the outcome will be? heads === 1
  commitmentRound: number; // round to read from the randomness beacon
};

export interface CoinFlipLogsFormatted {
  events: CoinFlipGameEvent[]; // all events, in ascending order
}

export interface CoinFlipGameEvent {
  type:
    | "Create"
    | "AddPrizePool"
    | "CreateGame"
    | "CancelGame"
    | "CompleteGame";
  txid: string;
  data: CoinFlipGameCreateGameEvent | CoinFlipGameCompleteGameEvent | string;
}

export interface CoinFlipGameCreateGameEvent {
  address: string;
  wager: number;
  commitmentRound: number;
  heads: number;
}

export interface CoinFlipGameCompleteGameEvent {
  address: string;
  bet: number;
  won: number;
  randomness: string;
}

const CreateEvent = "CreateEvent(string)";
const AddPrizePoolEvent = "AddPrizePoolEvent(address,uint64,uint64)";
const CreateGameEvent = "CreateGameEvent(address,uint64,uint64,uint64)";
const CancelGameEvent = "CancelGameEvent(address,uint64)";
const CompleteGameEvent = "CompleteGameEvent(address,uint64,uint64,byte[])";

export const CreateEventHash = sha512_256(CreateEvent).slice(0, 8);
export const AddPrizePoolEventHash = sha512_256(AddPrizePoolEvent).slice(0, 8);
export const CreateGameEventHash = sha512_256(CreateGameEvent).slice(0, 8);
export const CancelGameEventHash = sha512_256(CancelGameEvent).slice(0, 8);
export const CompleteGameEventHash = sha512_256(CompleteGameEvent).slice(0, 8);

export interface CoinFlipGameResult {
  wager: number;
  won: number;
  outcome: CoinFlipOutcome;
}
export type CoinFlipOutcome = "heads" | "tails";
