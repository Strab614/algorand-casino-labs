import {
  getAlgodConfigFromViteEnvironment,
  getIndexerConfigFromViteEnvironment,
} from "@/utils/network";
import algosdk, {
  decodeAddress,
  makeEmptyTransactionSigner,
  TransactionSigner,
} from "algosdk";
import { RouletteClient } from "../clients/RouletteClient";
import { AlgorandClient } from "@algorandfoundation/algokit-utils";
import {
  RouletteBet,
  RouletteGame,
  RouletteGameCompleted,
  RouletteGameCompletedHash,
} from "../types";
import { tupleArrayToRouletteBets } from "../utils";

const ALGORAND_ZERO_ADDRESS_STRING =
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ";

// api to interact with roulette contract
const algodConfig = getAlgodConfigFromViteEnvironment();
const indexerConfig = getIndexerConfigFromViteEnvironment();

const algorand = AlgorandClient.fromConfig({
  algodConfig,
  indexerConfig,
});

export interface RouletteGlobalState {
  manager: string;
  betAsset: bigint | number;
  minBet: bigint | number;
  maxBet: bigint | number;
  prizePool: bigint | number;
  fees: bigint | number;
}

const makeRouletteClient = (
  appId: bigint,
  activeAddress: string,
  transactionSigner: TransactionSigner
): RouletteClient => {
  const client = new RouletteClient({
    algorand,
    appId: appId,
    defaultSigner: transactionSigner,
    defaultSender: activeAddress,
  });

  return client;
};

export const getRouletteLogs = async (
  appId: bigint
): Promise<RouletteGameCompleted[] | null> => {
  const { indexer } = algorand.client;

  let nextToken: string = "";
  const combined: [] = [];

  while (nextToken !== undefined) {
    const r = await indexer
      .lookupApplicationLogs(Number(appId))
      .nextToken(nextToken)
      .do();

    nextToken = r["next-token"];
    // add to array
    if (r["log-data"] !== undefined) {
      combined.push(...(r["log-data"] as unknown as [])); // TODO: fix this type
    }
  }

  const retVal = [];

  for (const logData of combined) {
    const txid = logData["txid"];

    for (const log of logData["logs"] as []) {
      const b = Buffer.from(log, "base64");
      const prefix = b.slice(0, 4).toString("hex");

      if (prefix === RouletteGameCompletedHash) {
        const t = algosdk.ABIType.from(
          "(uint64,address,uint64,(uint8,uint8,uint64)[],uint8,uint64)"
        ).decode(b.slice(4)) as [
          bigint,
          string,
          bigint,
          [number, number, bigint][],
          number,
          bigint
        ];

        const completedGame: RouletteGameCompleted = {
          round: BigInt(t[0]),
          address: t[1],
          totalBetAmount: BigInt(t[2]),
          bets: tupleArrayToRouletteBets(t[3]),
          winningNumber: Number(t[4]),
          profitAmount: BigInt(t[5]),
        };
        retVal.push(completedGame);
      }
    }
  }

  return retVal;
};

export const getRouletteGlobalState = async (
  appId: bigint
): Promise<RouletteGlobalState> => {
  // just make a mock client, we don't need to sign anything to get global state
  const client = makeRouletteClient(
    appId,
    ALGORAND_ZERO_ADDRESS_STRING,
    makeEmptyTransactionSigner()
  );

  const gs = await client.state.global.getAll();

  return {
    manager: gs._manager!,
    betAsset: gs.betAsset!,
    minBet: gs.minBet!,
    maxBet: gs.maxBet!,
    prizePool: gs.prizePool!,
    fees: gs.fees!,
  };
};

/**
 * This function will look up the box for the user and return the game in progress (if exists)
 * @param appId Coin Flip app id
 * @param address the address of the user we want to check
 * @returns the game in progress or null if no game is in progress
 */
export const getRouletteGameByAddress = async (
  appId: bigint,
  address: string
): Promise<RouletteGame | null> => {
  let b = undefined;

  try {
    // read from box
    b = await algorand.app.getBoxValue(appId, decodeAddress(address).publicKey);
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (
        error.name === "URLTokenBaseHTTPError" &&
        (error as unknown as { status: number }).status === 404
      ) {
        // box does not exist, this is expected if no game in progress
        return null;
      } else {
        // some other error, throw to parent
        throw error;
      }
    }
  }

  const r = algosdk.ABITupleType.from(
    "(uint64,uint64,(uint8,uint8,uint64)[],uint64)"
  );

  const k = r.decode(b!) as [
    number,
    number,
    [number, number, bigint][],
    number
  ];

  const game: RouletteGame = {
    mbrAmountCovered: BigInt(k[0]),
    totalBetAmount: BigInt(k[1]),
    bets: tupleArrayToRouletteBets(k[2]),
    revealRound: BigInt(k[3]),
  };

  return game;
};

export const createRouletteGame = async (
  appId: bigint,
  activeAddress: string,
  transactionSigner: TransactionSigner,
  bets: RouletteBet[]
): Promise<bigint> => {
  const client = makeRouletteClient(appId, activeAddress, transactionSigner);

  // convert bets to tuple type
  type TupleType = [number, number, number | bigint];

  const list: TupleType[] = [];

  bets.forEach((bet) => {
    const t: TupleType = [bet.type, bet.n, bet.amount];
    list.push(t);
  });

  // get mbr cost increase (readonly simulate call)
  const cost = await client.getMbrCost({ args: { bets: list } });

  const appAddress = client.appAddress;

  // txn to cover mbr increase
  const mbr = client.algorand.createTransaction.payment({
    sender: activeAddress,
    receiver: appAddress,
    amount: cost.microAlgo(),
  });

  const totalBetAmount = bets.reduce((sum, bet) => sum + Number(bet.amount), 0);

  const betAsset = await client.state.global.betAsset();
  if (betAsset === undefined) {
    throw new Error("betAsset global state is not set");
  }

  // axfer to cover bet costs
  const payment = client.algorand.createTransaction.assetTransfer({
    sender: activeAddress,
    receiver: appAddress,
    amount: BigInt(totalBetAmount),
    assetId: betAsset,
  });

  // the bet is on colors, 0 = red, bet = 10
  const r = await client.send.createGame({
    args: { mbrFee: mbr, payment: payment, bets: list },
    populateAppCallResources: true,
    extraFee: (0.001).algo(),
  });

  return r.return!;
};

export const completeRouletteGame = async (
  appId: bigint,
  activeAddress: string,
  transactionSigner: TransactionSigner
) => {
  const client = makeRouletteClient(appId, activeAddress, transactionSigner);

  await client.send.completeGame({
    args: {
      address: activeAddress,
    },
    populateAppCallResources: true,
    extraFee: (0.004).algo(),
  });
};

export const cancelRouletteGame = async (
  appId: bigint,
  activeAddress: string,
  transactionSigner: TransactionSigner
) => {
  const client = makeRouletteClient(appId, activeAddress, transactionSigner);

  await client.send.cancelGame({
    args: {
      address: activeAddress,
    },
    populateAppCallResources: true,

    extraFee: (0.003).algo(),
  });
};
// manager routes

export const addPrizePool = async (
  appId: bigint,
  activeAddress: string,
  transactionSigner: TransactionSigner,
  amount: bigint
) => {
  const client = makeRouletteClient(appId, activeAddress, transactionSigner);

  const appAddress = client.appAddress;

  const betAsset = await client.state.global.betAsset();
  if (betAsset === undefined) {
    throw new Error("betAsset global state is not set");
  }

  const payment = client.algorand.createTransaction.assetTransfer({
    sender: activeAddress,
    receiver: appAddress,
    assetId: betAsset,
    amount: amount,
  });

  await client.send.addPrizePool({
    args: { axfer: payment },
    staticFee: (0.002).algo(),
  });
};

export const deleteRoulette = async (
  appId: bigint,
  activeAddress: string,
  transactionSigner: TransactionSigner
) => {
  const client = makeRouletteClient(appId, activeAddress, transactionSigner);

  // will send 2 inner txns to the manager address with ALGO and remaining bet asset
  await client.send.delete.deleteApplication({
    args: [],
    populateAppCallResources: true,
    staticFee: (0.003).algos(),
  });
};