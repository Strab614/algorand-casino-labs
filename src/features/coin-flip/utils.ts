/* eslint-disable @typescript-eslint/no-extra-non-null-assertion */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import algosdk, { decodeAddress, TransactionSigner } from "algosdk";
import {
  AddPrizePoolEventHash,
  BOX_STORAGE_COST,
  CancelGameEventHash,
  CoinFlipGame,
  CoinFlipGameCompleteGameEvent,
  CoinFlipGameCreateGameEvent,
  CoinFlipGameEvent,
  CoinFlipGlobalState,
  CoinFlipLogsFormatted,
  CoinFlipOutcome,
  CompleteGameEventHash,
  CreateEventHash,
  CreateGameEventHash,
} from "./types";
import { decodeArc4String, ellipseAddress } from "../../utils/utils";
import { CoinFlipClient } from "./clients/CoinFlipClient";
import * as algokit from "@algorandfoundation/algokit-utils";

/**
 * Allows someone to add to the prize pool of the coin flip app
 * @param appId
 * @param transactionSigner
 * @param address
 * @param amount
 * @param algod
 * @returns the new total prize pool
 * @throws error if something went wrong
 */
export const addPrizePool = async (
  appId: number | bigint, // which coin flip app
  transactionSigner: TransactionSigner, // signer instance
  address: string, // active address
  amount: number | bigint, // how much to add
  algod: algosdk.Algodv2
): Promise<bigint | number> => {
  const userClient = new CoinFlipClient(
    {
      sender: {
        addr: address,
        signer: transactionSigner,
      },
      resolveBy: "id",
      id: appId,
    },
    algod
  );

  const { appAddress } = await userClient.appClient.getAppReference();

  const { assetId } = await userClient.getGlobalState();
  if (assetId === undefined) {
    throw new Error("Asset ID not found in global state");
  }

  const axfer = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: appAddress,
    amount: amount,
    assetIndex: assetId.asNumber(),
    suggestedParams: await algod.getTransactionParams().do(),
  });

  const r = await userClient.addPrizePool(
    {
      axfer: axfer,
    },
    { sendParams: { fee: algokit.algos(0.002) } }
  );

  return Number(r.return);
};

// allow manager to claim the current fees for the app
export const getFees = async (
  appId: number | bigint,
  transactionSigner: TransactionSigner,
  address: string,
  algod: algosdk.Algodv2
): Promise<void> => {
  const userClient = new CoinFlipClient(
    {
      sender: {
        addr: address,
        signer: transactionSigner,
      },
      resolveBy: "id",
      id: appId,
    },
    algod
  );

  const { assetId } = await userClient.getGlobalState();
  if (assetId === undefined) {
    throw new Error("Asset ID not found in global state");
  }

  await userClient.getFees(
    {},
    {
      assets: [assetId.asNumber()],
      sendParams: { fee: algokit.algos(0.002) },
    }
  );
};

/**
 * This function will delete the coin flip app (only manager can do this)
 * @param appId Coin Flip app id
 * @param transactionSigner the transaction signer to use
 * @param address the address of caller
 * @param algod
 */
export const deleteCoinFlipApp = async (
  appId: number | bigint,
  transactionSigner: TransactionSigner,
  address: string,
  algod: algosdk.Algodv2
): Promise<void> => {
  const userClient = new CoinFlipClient(
    {
      sender: {
        addr: address,
        signer: transactionSigner,
      },
      resolveBy: "id",
      id: appId,
    },
    algod
  );

  // delete app covering the 2 inner txns and the app call
  await userClient.delete.deleteApplication(
    {},
    { sendParams: { fee: algokit.algos(0.003) } }
  );
};

/**
 * This function will look up the box for the user and return the game in progress (if exists)
 * @param appId Coin Flip app id
 * @param address the address of the user we want to check
 * @param algod active algod instance
 * @returns the game in progress or undefined if no game is in progress
 */
export const getCoinFlipGameByAddress = async (
  appId: number,
  address: string,
  algod: algosdk.Algodv2
): Promise<CoinFlipGame | undefined> => {
  let b = undefined;

  try {
    // read from box
    b = await algod
      .getApplicationBoxByName(appId, decodeAddress(address).publicKey)
      .do();
  } catch {
    // failed, check if just does not exist first...
    return undefined;
  }

  const r = algosdk.ABITupleType.from("(uint64,uint64,uint64)");

  const k = r.decode(b.value) as string[];
  // parse box value into CoinFlipGame

  const cfg: CoinFlipGame = {
    wager: Number(k[0]),
    heads: Number(k[1]),
    commitmentRound: Number(k[2]),
  };

  return cfg;
};

/**
 * This function will create a new game for the user
 * @param appId Coin Flip app id
 * @param address the address of the user we want to check
 * @param transactionSigner the transaction signer to use
 * @param assetId asset id of the asset to wager
 * @param wager the wager amount
 * @param prediction the prediction of the user (heads or tails)
 * @param algod active algod instance
 * @returns the future round whengame can be completed
 */
export const createCoinFlipGame = async (
  appId: number | bigint,
  address: string,
  transactionSigner: TransactionSigner,
  assetId: number | bigint,
  wager: number | bigint,
  prediction: CoinFlipOutcome,
  algod: algosdk.Algodv2
): Promise<bigint | number> => {
  const userClient = new CoinFlipClient(
    {
      sender: {
        addr: address,
        signer: transactionSigner,
      },
      resolveBy: "id",
      id: appId,
    },
    algod
  );

  const { appAddress } = await userClient.appClient.getAppReference();

  const boxFeeTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: appAddress,
    amount: algokit.algos(BOX_STORAGE_COST).microAlgos,
    suggestedParams: await algokit.getTransactionParams(undefined, algod),
  });

  const axfer = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: appAddress,
    amount: Number(wager) * 10, // TODO: fix, this will only work with assets with 1 decimal place correctly
    assetIndex: Number(assetId),
    suggestedParams: await algokit.getTransactionParams(undefined, algod),
  });

  const commitmentRound = await userClient.createGame(
    { boxFeeTxn, axfer, heads: prediction === "heads" ? 1 : 0 },
    {
      sendParams: { fee: algokit.algos(0.003) },
      boxes: [
        {
          appIndex: 0,
          name: algosdk.decodeAddress(address).publicKey,
        },
      ],
    }
  );

  return Number(commitmentRound.return);
};

/**
 * This function will cancel a users game and refund them
 * @param appId Coin Flip app id
 * @param assetId asset id of the asset to wager
 * @param address the address of the user we want to check
 * @param transactionSigner the transaction signer to use
 * @param algod active algod instance
 * @throws error if something went wrong
 * @returns void
 */
export const cancelCoinFlipGame = async (
  appId: number | bigint,
  assetId: number | bigint,
  address: string,
  transactionSigner: TransactionSigner,
  algod: algosdk.Algodv2
): Promise<void> => {
  const userClient = new CoinFlipClient(
    {
      sender: {
        addr: address,
        signer: transactionSigner,
      },
      resolveBy: "id",
      id: appId,
    },
    algod
  );

  await userClient.cancelGame(
    { address: address },
    {
      sendParams: { fee: algokit.algos(0.003) },
      boxes: [
        {
          appIndex: 0,
          name: algosdk.decodeAddress(address).publicKey,
        },
      ],
      assets: [Number(assetId)],
    }
  );
};

/**
 * Sync the game for the user, this will read the box and return the game in progress (if exists) and global state
 * @param appId Coin Flip app id
 * @param address the address we want to check
 * @param transactionSigner the transaction signer to use
 * @param algod active algod instance
 * @returns the game in progress or undefined if no game is in progress, along with the global state of the app
 */
export const syncCoinFlipGame = async (
  appId: number,
  address: string,
  transactionSigner: TransactionSigner,
  algod: algosdk.Algodv2
): Promise<{
  /* optional game in progress for the user */
  game?: CoinFlipGame;
  globalState: CoinFlipGlobalState;
}> => {
  const userClient = new CoinFlipClient(
    {
      sender: {
        addr: address,
        signer: transactionSigner,
      },
      resolveBy: "id",
      id: appId,
    },
    algod
  );

  // exception is handled by this func, will just return undefined if non existing/error
  const c = await getCoinFlipGameByAddress(appId, address, algod);

  const gs = await userClient.getGlobalState();

  return {
    game: c,
    globalState: {
      manager: algosdk.encodeAddress(gs.manager?.asByteArray()!!),
      name: decodeArc4String(gs.name?.asByteArray()!!),
      assetId: gs.assetId?.asBigInt()!!,
      beaconAppId: gs.beaconAppId?.asBigInt()!!,
      feePercent: gs.feePercent?.asNumber()!!,
      minBet: gs.minBet?.asBigInt()!!,
      maxBet: gs.maxBet?.asBigInt()!!,
      prizePool: gs.prizePool?.asBigInt()!!,
      fees: gs.fees?.asBigInt()!!,
      totalGames: gs.totalGames?.asBigInt()!!,
      totalCancelled: gs.totalCancelled?.asBigInt()!!,
      totalHeads: gs.totalHeads?.asBigInt()!!,
      totalWagered: gs.totalWagered?.asBigInt()!!,
      totalWon: gs.totalWon?.asBigInt()!!,
    },
  };
};

export const parseRawLogs = (logs: []): CoinFlipLogsFormatted => {
  // eslint-disable-next-line prefer-const
  let nv: CoinFlipGameEvent[] = [];

  logs.reverse();

  logs.forEach((el) => {
    const { logs: ll, txid } = el;

    const b = Buffer.from(ll[0], "base64");

    const prefix = b.slice(0, 4).toString("hex");

    switch (prefix) {
      case CreateEventHash:
        console.log("CreateEvent");
        break;
      case AddPrizePoolEventHash:
        // eslint-disable-next-line no-case-declarations
        const prizePoolAddedCodec = algosdk.ABIType.from(
          "(address,uint64,uint64)"
        );

        // eslint-disable-next-line no-case-declarations
        const prizePoolAddedEvent = prizePoolAddedCodec.decode(
          b.slice(4)
        ) as string[];

        // eslint-disable-next-line no-case-declarations
        const address = prizePoolAddedEvent[0];
        // eslint-disable-next-line no-case-declarations
        const amount: bigint = BigInt(prizePoolAddedEvent[1]);
        // eslint-disable-next-line no-case-declarations
        const total: bigint = BigInt(prizePoolAddedEvent[2]);

        nv.push({
          type: "AddPrizePool",
          data: `${ellipseAddress(address)} added ${(
            Number(amount) / 10
          ).toFixed(1)} total: ${(Number(total) / 10).toFixed(1)}`,
          txid,
        });

        //startPrizePool += Number(amount) / 10;
        break;
      case CreateGameEventHash: {
        const buyTicketCodec = algosdk.ABIType.from(
          "(address,uint64,uint64,uint64)"
        );

        const vv = buyTicketCodec.decode(b.slice(4)).valueOf() as string[];
        const buyerAddress = vv[0];
        const wager = Number(vv[1]);

        const commitmentRound = Number(vv[2]);
        nv.push({
          type: "CreateGame",
          data: {
            address: buyerAddress,
            wager: wager,
            commitmentRound: commitmentRound,
            heads: Number(vv[3]),
          } as CoinFlipGameCreateGameEvent,
          txid,
        });
        break;
      }
      case CancelGameEventHash:
        //CancelGameEvent = "CancelGameEvent(address,uint64)";
        // eslint-disable-next-line no-case-declarations
        const refundCodec = algosdk.ABIType.from("(address,uint64)");

        // eslint-disable-next-line no-case-declarations
        const refundEvent = refundCodec.decode(b.slice(4)) as string[];

        // eslint-disable-next-line no-case-declarations
        const refundAmount: bigint = BigInt(refundEvent[1]);
        // eslint-disable-next-line no-case-declarations
        const refundAddress = refundEvent[0];

        nv.push({
          type: "CancelGame",
          data: `${ellipseAddress(refundAddress)} amount: ${(
            Number(refundAmount) / 10
          ).toFixed(1)}`,
          txid,
        });

        break;
      case CompleteGameEventHash: {
        const drawCodec = algosdk.ABIType.from(
          "(address,uint64,uint64,byte[])"
        );

        const drawEvent = drawCodec.decode(b.slice(4)) as string[];

        const ca = drawEvent[0];
        const cw = Number(drawEvent[1]);
        const won = Number(drawEvent[2]);
        const randomness = drawEvent[3];

        nv.push({
          type: "CompleteGame",
          data: {
            address: ca,
            bet: cw,
            won: won,
            randomness: randomness.toString(),
          } as unknown as CoinFlipGameCompleteGameEvent,
          txid,
        });

        break;
      }
      default:
        // unknown event type
        break;
    }
  });

  return {
    events: nv,
  };
};
