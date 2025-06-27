import algosdk, {
  ABITupleType,
  ABIType,
  ABIValue,
  encodeAddress,
} from "algosdk";
import {
  BuyTicketEventHash,
  DeleteEventHash,
  DrawEventHash,
  LotteryEvent,
  LotteryGlobalState,
  LotteryNumbers,
  PrizePoolAddedEventHash,
  RefundEventHash,
  WinnerPaidEventHash,
} from "./types";

import { decodeArc4String, ellipseAddress } from "../../utils/utils";

export function hasUniqueValues(arr: any) {
  return (
    arr.filter(
      (value: any, index: any, self: string | any[]) =>
        self.indexOf(value) === index
    ).length === arr.length
  );
}
export const decodeLotteryNumbers = (tuple: Uint8Array): LotteryNumbers[] => {
  const buyTicketCodec = algosdk.ABIType.from("uint16[5][]");

  const v = buyTicketCodec.decode(tuple).valueOf() as LotteryNumbers[];

  let bln: LotteryNumbers[] = [];

  for (let i = 0; i < v.length; i += 1) {
    // converted back to uint32 from BigInt
    bln.push([
      Number(v[i][0]),
      Number(v[i][1]),
      Number(v[i][2]),
      Number(v[i][3]),
      Number(v[i][4]),
    ]);
  }

  return bln;
};

export const parseLotteryGlobalState = (
  rawGlobalState: {
    key: string;
    value: {
      bytes: string;
      type: number | bigint;
      uint: number | bigint;
    };
  }[]
) => {
  let ret: LotteryGlobalState = {} as LotteryGlobalState;

  rawGlobalState.forEach((item) => {
    const key = Buffer.from(item.key, "base64").toString();

    switch (key) {
      case "ma": // manager
        ret.manager = encodeAddress(
          Buffer.from(item.value.bytes, "base64")
        ).toString();
        break;
      case "na": // name
        ret.name = decodeArc4String(Buffer.from(item.value.bytes, "base64"));
        break;
      case "be": // beacon
        ret.beaconAppId = item.value.uint;
        break;
      case "as": // asset
        ret.assetId = item.value.uint;
        break;
      case "er": // end round
        ret.endRound = item.value.uint;
        break;
      case "dr": // draw round
        ret.drawRound = item.value.uint;
        break;
      case "tp": // ticket price
        ret.ticketPrice = item.value.uint;
        break;
      case "fp": // fee percent
        ret.feePercent = item.value.uint;
        break;
      case "pp": // prize pool
        ret.prizePool = item.value.uint;
        break;
      case "tf": // total fees
        ret.totalFees = item.value.uint;
        break;
      case "ts": // total sold tickets
        ret.totalSold = item.value.uint;
        break;
      case "wn": // winning numbers
        const r: [] | ABIValue = ABITupleType.from("uint16[5]").decode(
          Buffer.from(item.value.bytes, "base64")
        );
        ret.winningNumbers = sortLotteryNumbers(r as LotteryNumbers);
        break;
    }
  });

  return ret;
};

export function sortLotteryNumbers(numbers: LotteryNumbers): LotteryNumbers {
  const arr = [
    Number(numbers[0]),
    Number(numbers[1]),
    Number(numbers[2]),
    Number(numbers[3]),
    Number(numbers[4]),
  ];

  const r = arr.sort((a, b) => {
    return a - b;
  });

  return [r[0], r[1], r[2], r[3], r[4]];
}

export interface LotteryWinner {
  address: string; // how much won
  amount: number | bigint; // raw amount won
}

export interface LotteryLogsFormatted {
  events: LotteryEvent[]; // all events, in ascending order
  winningNumbers: LotteryNumbers; // winning numbers
  ticketsSold: number | bigint; // how many tickets sold
  totalFees: number | bigint; // how much fees did the manager make?
  startPrizePool: number | bigint;
  finalPrizePool: number | bigint;
  winners: LotteryWinner[];
}

export const parseRawLogs = (logs: []): LotteryLogsFormatted => {
  let nv: LotteryEvent[] = [];
  let ticketsSold = 0;
  let totalFees = 0;
  let startPrizePool = 0;
  let finalPrizePool = 0;
  let winningNumbers: LotteryNumbers;
  let winners: LotteryWinner[] = [];

  logs.forEach((el) => {
    const { logs: ll, txid } = el;

    const b = Buffer.from(ll[0], "base64");

    const prefix = b.slice(0, 4).toString("hex");

    switch (prefix) {
      case PrizePoolAddedEventHash:
        // eslint-disable-next-line no-case-declarations
        const prizePoolAddedCodec = algosdk.ABIType.from(
          "(uint64,address,uint64)"
        );

        // eslint-disable-next-line no-case-declarations
        const prizePoolAddedEvent = prizePoolAddedCodec.decode(
          b.slice(4)
        ) as string[];

        // eslint-disable-next-line no-case-declarations
        const amount: bigint = BigInt(prizePoolAddedEvent[0]);
        // eslint-disable-next-line no-case-declarations
        const address = prizePoolAddedEvent[1];
        // eslint-disable-next-line no-case-declarations
        //const total: bigint = BigInt(prizePoolAddedEvent[2]);

        nv.push({
          type: "PrizePoolAdded",
          data: `${ellipseAddress(address)} added ${(
            Number(amount) / 10
          ).toFixed(1)}`,
          txid,
        });

        startPrizePool += Number(amount) / 10;
        break;
      case BuyTicketEventHash:
        // eslint-disable-next-line no-case-declarations
        const buyTicketCodec = algosdk.ABIType.from("(address,uint16[5][])");

        // eslint-disable-next-line no-case-declarations
        const vv = buyTicketCodec.decode(b.slice(4)).valueOf() as string[];

        // eslint-disable-next-line no-case-declarations
        const buyerAddress = vv[0];

        // eslint-disable-next-line no-case-declarations
        const v = vv[1];

        // eslint-disable-next-line no-case-declarations
        const { length } = v;

        // eslint-disable-next-line no-case-declarations
        const bln: LotteryNumbers[] = [];

        for (let i = 0; i < length; i += 1) {
          bln.push([
            parseInt(v[i][0], 10),
            parseInt(v[i][1], 10),
            parseInt(v[i][2], 10),
            parseInt(v[i][3], 10),
            parseInt(v[i][4], 10),
          ]);
        }
        nv.push({
          type: "BuyTicket",
          data: { address: buyerAddress, tickets: bln },
          txid,
        });

        ticketsSold += bln.length;

        break;
      case RefundEventHash:
        // eslint-disable-next-line no-case-declarations
        const refundCodec = algosdk.ABIType.from("(address,uint64)");

        // eslint-disable-next-line no-case-declarations
        const refundEvent = refundCodec.decode(b.slice(4)) as string[];

        // eslint-disable-next-line no-case-declarations
        const refundAmount: bigint = BigInt(refundEvent[1]);
        // eslint-disable-next-line no-case-declarations
        const refundAddress = refundEvent[0];

        nv.push({
          type: "Refund",
          data: `${ellipseAddress(refundAddress)} amount: ${(
            Number(refundAmount) / 10
          ).toFixed(1)}`,
          txid,
        });

        break;
      case DrawEventHash:
        // eslint-disable-next-line no-case-declarations
        const drawCodec = algosdk.ABIType.from("(uint16[5],byte[])");

        // eslint-disable-next-line no-case-declarations
        const drawEvent = drawCodec.decode(b.slice(4)) as string[];

        // eslint-disable-next-line no-case-declarations
        const ln: LotteryNumbers = [
          parseInt(drawEvent[0][0], 10),
          parseInt(drawEvent[0][1], 10),
          parseInt(drawEvent[0][2], 10),
          parseInt(drawEvent[0][3], 10),
          parseInt(drawEvent[0][4], 10),
        ];

        nv.push({
          type: "Draw",
          data: `${sortLotteryNumbers(ln)}`,
          txid,
        });

        winningNumbers = sortLotteryNumbers(ln);
        break;
      case WinnerPaidEventHash:
        // eslint-disable-next-line no-case-declarations
        const winnerPaidCodec = algosdk.ABIType.from("(uint64,address)");

        // eslint-disable-next-line no-case-declarations
        const winnerPaidEvent = winnerPaidCodec.decode(b.slice(4)) as string[];

        nv.push({
          type: "WinnerPaid",
          data: `${ellipseAddress(winnerPaidEvent[1].toString())} won ${(
            Number(winnerPaidEvent[0]) / 10
          ).toFixed(1)}`,
          txid,
        });

        winners.push({
          address: winnerPaidEvent[1].toString(),
          amount: Number(winnerPaidEvent[0]) / 10,
        });
        break;
      case DeleteEventHash:
        // eslint-disable-next-line no-case-declarations
        const deleteCodec = algosdk.ABIType.from("(uint64,uint64)");

        // eslint-disable-next-line no-case-declarations
        const deleteEvent = deleteCodec.decode(b.slice(4)) as string[];

        nv.push({
          type: "Delete",
          data: `fees: ${(Number(deleteEvent[0]) / 10).toFixed(
            1
          )} prizePool: ${(Number(deleteEvent[1]) / 10).toFixed(1)}`,
          txid,
        });

        totalFees = Number(deleteEvent[0]);
        finalPrizePool = Number(deleteEvent[1]);
        break;
      default:
        // unknown event type
        break;
    }
  });

  return {
    events: nv,
    ticketsSold: ticketsSold,
    totalFees: totalFees,
    startPrizePool: startPrizePool,
    finalPrizePool: finalPrizePool,
    winningNumbers: winningNumbers!!,
    winners: winners,
  };
};

// get a users tickets from a given lottery, can be deleted as will use the ARC-28 logs
export const getEntryFromAppId = async (
  lotteryAppId: number,
  address: string,
  indexer: algosdk.Indexer
): Promise<LotteryNumbers[] | undefined> => {
  let nextToken = "";
  let logData: [] = [];

  while (nextToken !== undefined) {
    try {
      const r = await indexer
        .lookupApplicationLogs(lotteryAppId)
        .nextToken(nextToken)
        .sender(address)
        .do();

      nextToken = r["next-token"];

      const ld: [] = r["log-data"];

      if (ld) {
        logData.push(...ld);
      }
    } catch (error: any) {
      alert(error.message);
    }
  }

  const r = parseRawLogs(logData);

  let t: LotteryNumbers[] | undefined = undefined;

  r.events.forEach((item: LotteryEvent) => {
    if (item.type === "BuyTicket") {
      const { tickets } = item.data as {
        address: string;
        tickets: LotteryNumbers[];
      };

      if ((t !== undefined && t.length < tickets.length) || t === undefined) {
        t = tickets;
      }
    }
  });

  return t;
};
