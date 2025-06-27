import { sha512_256 } from "js-sha512";

export type LotteryNumbers = [number, number, number, number, number];

export const MAX_ENTRIES = 98; // max number of entries per user
export const MIN_NUMBER = 1;
export const MAX_NUMBER = 50;
export const BOX_TRUE_COST = 60100;

export interface LotteryGlobalState {
  manager: string;
  name: string;
  beaconAppId: number | bigint;
  assetId: number | bigint;
  endRound: number | bigint;
  drawRound: number | bigint;
  ticketPrice: number | bigint;
  feePercent: number | bigint;
  totalFees: number | bigint;
  prizePool: number | bigint;
  totalSold: number | bigint;
  winningNumbers?: LotteryNumbers;
}

export type LotteryEvent = {
  type:
    | "PrizePoolAdded"
    | "BuyTicket"
    | "Refund"
    | "Draw"
    | "WinnerPaid"
    | "Delete";
  txid: string;
  data: string | { address: string; tickets: LotteryNumbers[] };
};

const PrizePoolAddedEvent = "PrizePoolAddedEvent(uint64,address,uint64)";
const BuyTicketEvent = "BuyTicketEvent(address,uint16[5][])";
const RefundEvent = "RefundEvent(address,uint64)";
const DrawEvent = "DrawEvent(uint16[5],byte[])";
const WinnerPaidEvent = "WinnerPaidEvent(uint64,address)";
const DeleteEvent = "DeleteEvent(uint64,uint64)";

// hashes of the first 4 bytes
export const PrizePoolAddedEventHash = sha512_256(PrizePoolAddedEvent).slice(
  0,
  8
);
export const BuyTicketEventHash = sha512_256(BuyTicketEvent).slice(0, 8);
export const RefundEventHash = sha512_256(RefundEvent).slice(0, 8);
export const DrawEventHash = sha512_256(DrawEvent).slice(0, 8);
export const WinnerPaidEventHash = sha512_256(WinnerPaidEvent).slice(0, 8);
export const DeleteEventHash = sha512_256(DeleteEvent).slice(0, 8);
