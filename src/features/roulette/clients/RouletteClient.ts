import { AlgorandClient } from "@algorandfoundation/algokit-utils";
import * as algosdk from "algosdk";

/**
 * Enhanced Roulette Client for Algorand Casino Roulette
 * Integrates with the latest Algorand SDK and AlgoKit Utils
 */
export class RouletteClient {
  private algorandClient: AlgorandClient;
  private appId: bigint;
  private defaultSender?: string;
  private defaultSigner?: algosdk.TransactionSigner;

  constructor(config: {
    algorand: AlgorandClient;
    appId: bigint;
    defaultSender?: string;
    defaultSigner?: algosdk.TransactionSigner;
  }) {
    this.algorandClient = config.algorand;
    this.appId = config.appId;
    this.defaultSender = config.defaultSender;
    this.defaultSigner = config.defaultSigner;
  }

  get appAddress(): string {
    return algosdk.getApplicationAddress(this.appId);
  }

  // State management
  get state() {
    return {
      global: {
        getAll: async () => {
          const app = await this.algorandClient.app.getById(this.appId);
          const globalState = app.params?.["global-state"] || [];
          
          const stateMap: Record<string, any> = {};
          globalState.forEach((item: any) => {
            const key = Buffer.from(item.key, 'base64').toString();
            let value;
            
            if (item.value.type === 1) {
              // Bytes
              value = Buffer.from(item.value.bytes, 'base64');
            } else {
              // Uint
              value = item.value.uint;
            }
            
            stateMap[key] = value;
          });
          
          return {
            _manager: stateMap.manager ? algosdk.encodeAddress(stateMap.manager) : undefined,
            betAsset: stateMap.betAsset,
            minBet: stateMap.minBet,
            maxBet: stateMap.maxBet,
            prizePool: stateMap.prizePool,
            fees: stateMap.fees,
          };
        },
        
        betAsset: async () => {
          const state = await this.state.global.getAll();
          return state.betAsset;
        },
      },
    };
  }

  // Transaction methods
  get send() {
    return {
      createGame: async (params: {
        args: {
          mbrFee: algosdk.Transaction;
          payment: algosdk.Transaction;
          bets: [number, number, number | bigint][];
        };
        populateAppCallResources?: boolean;
        extraFee?: { microAlgo: () => number };
      }) => {
        const suggestedParams = await this.algorandClient.client.algod.getTransactionParams().do();
        
        // Encode bets as app args
        const betsEncoded = this.encodeBets(params.args.bets);
        
        const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
          from: this.defaultSender!,
          appIndex: Number(this.appId),
          onComplete: algosdk.OnApplicationComplete.NoOpOC,
          appArgs: [new TextEncoder().encode("create_game"), betsEncoded],
          foreignAssets: [Number(await this.state.global.betAsset())],
          suggestedParams: {
            ...suggestedParams,
            fee: params.extraFee ? params.extraFee.microAlgo() : suggestedParams.fee,
          },
        });

        // Group transactions
        const txns = [params.args.mbrFee, params.args.payment, appCallTxn];
        algosdk.assignGroupID(txns);

        // Sign and submit
        if (this.defaultSigner) {
          const signedTxns = await this.defaultSigner(
            txns.map(txn => algosdk.encodeUnsignedTransaction(txn)),
            []
          );
          
          const result = await this.algorandClient.client.algod.sendRawTransaction(signedTxns).do();
          await algosdk.waitForConfirmation(this.algorandClient.client.algod, result.txId, 4);
          
          return { return: BigInt(Date.now()) }; // Mock return value
        }
        
        throw new Error("No signer provided");
      },

      completeGame: async (params: {
        args: { address: string };
        populateAppCallResources?: boolean;
        extraFee?: { microAlgo: () => number };
      }) => {
        const suggestedParams = await this.algorandClient.client.algod.getTransactionParams().do();
        
        const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
          from: this.defaultSender!,
          appIndex: Number(this.appId),
          onComplete: algosdk.OnApplicationComplete.NoOpOC,
          appArgs: [
            new TextEncoder().encode("complete_game"),
            algosdk.decodeAddress(params.args.address).publicKey,
          ],
          accounts: [params.args.address],
          foreignAssets: [Number(await this.state.global.betAsset())],
          suggestedParams: {
            ...suggestedParams,
            fee: params.extraFee ? params.extraFee.microAlgo() : suggestedParams.fee,
          },
        });

        if (this.defaultSigner) {
          const signedTxn = await this.defaultSigner(
            [algosdk.encodeUnsignedTransaction(appCallTxn)],
            []
          );
          
          const result = await this.algorandClient.client.algod.sendRawTransaction(signedTxn).do();
          await algosdk.waitForConfirmation(this.algorandClient.client.algod, result.txId, 4);
          
          return result;
        }
        
        throw new Error("No signer provided");
      },

      cancelGame: async (params: {
        args: { address: string };
        populateAppCallResources?: boolean;
        extraFee?: { microAlgo: () => number };
      }) => {
        const suggestedParams = await this.algorandClient.client.algod.getTransactionParams().do();
        
        const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
          from: this.defaultSender!,
          appIndex: Number(this.appId),
          onComplete: algosdk.OnApplicationComplete.NoOpOC,
          appArgs: [
            new TextEncoder().encode("cancel_game"),
            algosdk.decodeAddress(params.args.address).publicKey,
          ],
          accounts: [params.args.address],
          foreignAssets: [Number(await this.state.global.betAsset())],
          suggestedParams: {
            ...suggestedParams,
            fee: params.extraFee ? params.extraFee.microAlgo() : suggestedParams.fee,
          },
        });

        if (this.defaultSigner) {
          const signedTxn = await this.defaultSigner(
            [algosdk.encodeUnsignedTransaction(appCallTxn)],
            []
          );
          
          const result = await this.algorandClient.client.algod.sendRawTransaction(signedTxn).do();
          await algosdk.waitForConfirmation(this.algorandClient.client.algod, result.txId, 4);
          
          return result;
        }
        
        throw new Error("No signer provided");
      },

      addPrizePool: async (params: {
        args: { axfer: algosdk.Transaction };
        staticFee?: { microAlgo: () => number };
      }) => {
        const suggestedParams = await this.algorandClient.client.algod.getTransactionParams().do();
        
        const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
          from: this.defaultSender!,
          appIndex: Number(this.appId),
          onComplete: algosdk.OnApplicationComplete.NoOpOC,
          appArgs: [new TextEncoder().encode("add_prize_pool")],
          foreignAssets: [Number(await this.state.global.betAsset())],
          suggestedParams: {
            ...suggestedParams,
            fee: params.staticFee ? params.staticFee.microAlgo() : suggestedParams.fee,
          },
        });

        // Group transactions
        const txns = [params.args.axfer, appCallTxn];
        algosdk.assignGroupID(txns);

        if (this.defaultSigner) {
          const signedTxns = await this.defaultSigner(
            txns.map(txn => algosdk.encodeUnsignedTransaction(txn)),
            []
          );
          
          const result = await this.algorandClient.client.algod.sendRawTransaction(signedTxns).do();
          await algosdk.waitForConfirmation(this.algorandClient.client.algod, result.txId, 4);
          
          return result;
        }
        
        throw new Error("No signer provided");
      },

      delete: {
        deleteApplication: async (params: {
          args: any[];
          populateAppCallResources?: boolean;
          staticFee?: { algos: () => { microAlgo: () => number } };
        }) => {
          const suggestedParams = await this.algorandClient.client.algod.getTransactionParams().do();
          
          const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
            from: this.defaultSender!,
            appIndex: Number(this.appId),
            onComplete: algosdk.OnApplicationComplete.DeleteApplicationOC,
            appArgs: [new TextEncoder().encode("delete_application")],
            foreignAssets: [Number(await this.state.global.betAsset())],
            suggestedParams: {
              ...suggestedParams,
              fee: params.staticFee ? params.staticFee.algos().microAlgo() : suggestedParams.fee,
            },
          });

          if (this.defaultSigner) {
            const signedTxn = await this.defaultSigner(
              [algosdk.encodeUnsignedTransaction(appCallTxn)],
              []
            );
            
            const result = await this.algorandClient.client.algod.sendRawTransaction(signedTxn).do();
            await algosdk.waitForConfirmation(this.algorandClient.client.algod, result.txId, 4);
            
            return result;
          }
          
          throw new Error("No signer provided");
        },
      },
    };
  }

  // Utility methods
  async getMbrCost(params: { args: { bets: [number, number, number | bigint][] } }) {
    // Calculate MBR cost based on number of bets
    const baseCost = 100000; // 0.1 ALGO base cost
    const perBetCost = 10000; // 0.01 ALGO per bet
    const totalCost = baseCost + (params.args.bets.length * perBetCost);
    
    return {
      microAlgo: () => totalCost,
    };
  }

  private encodeBets(bets: [number, number, number | bigint][]): Uint8Array {
    // Encode bets as ABI tuple array
    const tupleType = algosdk.ABITupleType.from("(uint8,uint8,uint64)[]");
    const encodedBets = bets.map(([type, n, amount]) => [type, n, Number(amount)]);
    return tupleType.encode(encodedBets);
  }

  // Create transaction methods
  get algorand() {
    return {
      createTransaction: {
        payment: (params: {
          sender: string;
          receiver: string;
          amount: bigint;
        }) => {
          return this.algorandClient.createTransaction.payment({
            sender: params.sender,
            receiver: params.receiver,
            amount: params.amount,
          });
        },

        assetTransfer: (params: {
          sender: string;
          receiver: string;
          amount: bigint;
          assetId: bigint;
        }) => {
          return this.algorandClient.createTransaction.assetTransfer({
            sender: params.sender,
            receiver: params.receiver,
            amount: params.amount,
            assetId: params.assetId,
          });
        },
      },
    };
  }
}

export default RouletteClient;