import { AlgorandClient } from "@algorandfoundation/algokit-utils";
import * as algosdk from "algosdk";
import { getNetworkConfig } from "@/utils/network";
import { RouletteClient } from "../clients/RouletteClient";
import {
  RouletteBet,
  RouletteGame,
  RouletteGameCompleted,
  RouletteGameCompletedHash,
} from "../types";
import { tupleArrayToRouletteBets } from "../utils";

const ALGORAND_ZERO_ADDRESS_STRING =
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ";

/**
 * Enhanced Roulette API with modern Algorand SDK integration
 */
export class EnhancedRouletteAPI {
  private algorandClient: AlgorandClient;
  private config: ReturnType<typeof getNetworkConfig>;

  constructor() {
    this.config = getNetworkConfig();
    this.algorandClient = AlgorandClient.fromConfig({
      algodConfig: this.config.algodConfig,
      indexerConfig: this.config.indexerConfig,
    });
  }

  // Global state interface
  export interface RouletteGlobalState {
    manager: string;
    betAsset: bigint | number;
    minBet: bigint | number;
    maxBet: bigint | number;
    prizePool: bigint | number;
    fees: bigint | number;
  }

  /**
   * Create a RouletteClient instance
   */
  private makeRouletteClient(
    appId: bigint,
    activeAddress: string,
    transactionSigner: algosdk.TransactionSigner
  ): RouletteClient {
    return new RouletteClient({
      algorand: this.algorandClient,
      appId: appId,
      defaultSigner: transactionSigner,
      defaultSender: activeAddress,
    });
  }

  /**
   * Get roulette application global state
   */
  async getRouletteGlobalState(appId: bigint): Promise<RouletteGlobalState> {
    const client = this.makeRouletteClient(
      appId,
      ALGORAND_ZERO_ADDRESS_STRING,
      algosdk.makeEmptyTransactionSigner()
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
  }

  /**
   * Get roulette game logs
   */
  async getRouletteLogs(appId: bigint): Promise<RouletteGameCompleted[] | null> {
    let nextToken: string = "";
    const combined: any[] = [];

    while (nextToken !== undefined) {
      const r = await this.algorandClient.client.indexer
        .lookupApplicationLogs(Number(appId))
        .nextToken(nextToken)
        .do();

      nextToken = r["next-token"];
      if (r["log-data"] !== undefined) {
        combined.push(...r["log-data"]);
      }
    }

    const retVal: RouletteGameCompleted[] = [];

    for (const logData of combined) {
      const txid = logData["txid"];

      for (const log of logData["logs"]) {
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
  }

  /**
   * Get roulette game by address
   */
  async getRouletteGameByAddress(
    appId: bigint,
    address: string
  ): Promise<RouletteGame | null> {
    try {
      const boxValue = await this.algorandClient.app.getBoxValue(
        appId,
        algosdk.decodeAddress(address).publicKey
      );

      const r = algosdk.ABITupleType.from(
        "(uint64,uint64,(uint8,uint8,uint64)[],uint64)"
      );

      const k = r.decode(boxValue) as [
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
    } catch (error: any) {
      if (error.status === 404) {
        return null; // Box does not exist
      }
      throw error;
    }
  }

  /**
   * Create a roulette game
   */
  async createRouletteGame(
    appId: bigint,
    activeAddress: string,
    transactionSigner: algosdk.TransactionSigner,
    bets: RouletteBet[]
  ): Promise<bigint> {
    const client = this.makeRouletteClient(appId, activeAddress, transactionSigner);

    // Convert bets to tuple type
    type TupleType = [number, number, number | bigint];
    const list: TupleType[] = bets.map((bet) => [bet.type, bet.n, bet.amount]);

    // Get MBR cost
    const cost = await client.getMbrCost({ args: { bets: list } });

    // Create MBR payment transaction
    const mbr = client.algorand.createTransaction.payment({
      sender: activeAddress,
      receiver: client.appAddress,
      amount: BigInt(cost.microAlgo()),
    });

    const totalBetAmount = bets.reduce((sum, bet) => sum + Number(bet.amount), 0);
    const betAsset = await client.state.global.betAsset();

    if (betAsset === undefined) {
      throw new Error("betAsset global state is not set");
    }

    // Create asset transfer transaction
    const payment = client.algorand.createTransaction.assetTransfer({
      sender: activeAddress,
      receiver: client.appAddress,
      amount: BigInt(totalBetAmount),
      assetId: BigInt(betAsset),
    });

    // Submit the game creation
    const r = await client.send.createGame({
      args: { mbrFee: mbr, payment: payment, bets: list },
      populateAppCallResources: true,
      extraFee: { microAlgo: () => 1000 }, // 0.001 ALGO extra fee
    });

    return r.return!;
  }

  /**
   * Complete a roulette game
   */
  async completeRouletteGame(
    appId: bigint,
    activeAddress: string,
    transactionSigner: algosdk.TransactionSigner
  ) {
    const client = this.makeRouletteClient(appId, activeAddress, transactionSigner);

    await client.send.completeGame({
      args: { address: activeAddress },
      populateAppCallResources: true,
      extraFee: { microAlgo: () => 4000 }, // 0.004 ALGO extra fee
    });
  }

  /**
   * Cancel a roulette game
   */
  async cancelRouletteGame(
    appId: bigint,
    activeAddress: string,
    transactionSigner: algosdk.TransactionSigner
  ) {
    const client = this.makeRouletteClient(appId, activeAddress, transactionSigner);

    await client.send.cancelGame({
      args: { address: activeAddress },
      populateAppCallResources: true,
      extraFee: { microAlgo: () => 3000 }, // 0.003 ALGO extra fee
    });
  }

  /**
   * Add prize pool (manager only)
   */
  async addPrizePool(
    appId: bigint,
    activeAddress: string,
    transactionSigner: algosdk.TransactionSigner,
    amount: bigint
  ) {
    const client = this.makeRouletteClient(appId, activeAddress, transactionSigner);
    const betAsset = await client.state.global.betAsset();

    if (betAsset === undefined) {
      throw new Error("betAsset global state is not set");
    }

    const payment = client.algorand.createTransaction.assetTransfer({
      sender: activeAddress,
      receiver: client.appAddress,
      assetId: BigInt(betAsset),
      amount: amount,
    });

    await client.send.addPrizePool({
      args: { axfer: payment },
      staticFee: { microAlgo: () => 2000 }, // 0.002 ALGO fee
    });
  }

  /**
   * Delete roulette application (manager only)
   */
  async deleteRoulette(
    appId: bigint,
    activeAddress: string,
    transactionSigner: algosdk.TransactionSigner
  ) {
    const client = this.makeRouletteClient(appId, activeAddress, transactionSigner);

    await client.send.delete.deleteApplication({
      args: [],
      populateAppCallResources: true,
      staticFee: { algos: () => ({ microAlgo: () => 3000 }) }, // 0.003 ALGO fee
    });
  }

  /**
   * Get performance metrics for the roulette application
   */
  async getRouletteMetrics(appId: bigint) {
    const logs = await this.getRouletteLogs(appId);
    if (!logs) return null;

    const totalGames = logs.length;
    const totalVolume = logs.reduce((sum, game) => sum + Number(game.totalBetAmount), 0);
    const totalWinnings = logs.reduce((sum, game) => sum + Number(game.profitAmount), 0);
    const averageBet = totalGames > 0 ? totalVolume / totalGames : 0;

    return {
      totalGames,
      totalVolume,
      totalWinnings,
      averageBet,
      houseEdge: totalGames > 0 ? ((totalVolume - totalWinnings) / totalVolume) * 100 : 0,
    };
  }
}

// Export singleton instance
export const enhancedRouletteAPI = new EnhancedRouletteAPI();

// Re-export for backward compatibility
export const {
  getRouletteGlobalState,
  getRouletteLogs,
  getRouletteGameByAddress,
  createRouletteGame,
  completeRouletteGame,
  cancelRouletteGame,
  addPrizePool,
  deleteRoulette,
} = enhancedRouletteAPI;