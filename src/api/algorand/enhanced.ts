import { AlgorandClient } from "@algorandfoundation/algokit-utils";
import { 
  algosdk, 
  Account, 
  Transaction,
  SuggestedParams,
  makePaymentTxnWithSuggestedParams,
  makeAssetTransferTxnWithSuggestedParams,
  makeApplicationCallTxnFromObject,
  waitForConfirmation,
  microalgosToAlgos,
  algosToMicroalgos,
} from "algosdk";
import { getNetworkConfig } from "@/utils/network";

// Enhanced Algorand client with modern SDK features
class EnhancedAlgorandClient {
  private client: AlgorandClient;
  private config: ReturnType<typeof getNetworkConfig>;

  constructor() {
    this.config = getNetworkConfig();
    this.client = AlgorandClient.fromConfig({
      algodConfig: this.config.algodConfig,
      indexerConfig: this.config.indexerConfig,
    });
  }

  // Account operations
  async getAccountInfo(address: string) {
    return await this.client.account.getInformation(address);
  }

  async getAccountAssets(address: string) {
    const info = await this.getAccountInfo(address);
    return info.assets || [];
  }

  async getAccountBalance(address: string) {
    const info = await this.getAccountInfo(address);
    return {
      algo: microalgosToAlgos(info.amount),
      microAlgo: info.amount,
    };
  }

  // Asset operations
  async getAssetInfo(assetId: number | bigint) {
    return await this.client.asset.getById(BigInt(assetId));
  }

  async getAssetHoldings(assetId: number | bigint, limit: number = 100) {
    return await this.client.client.indexer
      .lookupAssetBalances(Number(assetId))
      .limit(limit)
      .do();
  }

  // Application operations
  async getApplicationInfo(appId: number | bigint) {
    return await this.client.app.getById(BigInt(appId));
  }

  async getApplicationGlobalState(appId: number | bigint) {
    const app = await this.getApplicationInfo(appId);
    return app.params?.["global-state"] || [];
  }

  async getApplicationLocalState(appId: number | bigint, address: string) {
    const account = await this.getAccountInfo(address);
    const localState = account["apps-local-state"]?.find(
      (app) => app.id === Number(appId)
    );
    return localState?.["key-value"] || [];
  }

  // Transaction operations
  async getSuggestedParams(): Promise<SuggestedParams> {
    return await this.client.client.algod.getTransactionParams().do();
  }

  async createPaymentTransaction(
    from: string,
    to: string,
    amount: number | bigint,
    note?: string
  ): Promise<Transaction> {
    const suggestedParams = await this.getSuggestedParams();
    
    return makePaymentTxnWithSuggestedParams(
      from,
      to,
      Number(amount),
      undefined,
      note ? new TextEncoder().encode(note) : undefined,
      suggestedParams
    );
  }

  async createAssetTransferTransaction(
    from: string,
    to: string,
    assetId: number | bigint,
    amount: number | bigint,
    note?: string
  ): Promise<Transaction> {
    const suggestedParams = await this.getSuggestedParams();
    
    return makeAssetTransferTxnWithSuggestedParams(
      from,
      to,
      undefined,
      undefined,
      Number(amount),
      note ? new TextEncoder().encode(note) : undefined,
      Number(assetId),
      suggestedParams
    );
  }

  async createApplicationCallTransaction(
    from: string,
    appId: number | bigint,
    onComplete: number = 0,
    appArgs?: Uint8Array[],
    accounts?: string[],
    foreignApps?: number[],
    foreignAssets?: number[],
    note?: string
  ): Promise<Transaction> {
    const suggestedParams = await this.getSuggestedParams();
    
    return makeApplicationCallTxnFromObject({
      from,
      appIndex: Number(appId),
      onComplete,
      appArgs,
      accounts,
      foreignApps,
      foreignAssets,
      note: note ? new TextEncoder().encode(note) : undefined,
      suggestedParams,
    });
  }

  async submitTransaction(signedTxn: Uint8Array): Promise<string> {
    const { txId } = await this.client.client.algod.sendRawTransaction(signedTxn).do();
    return txId;
  }

  async waitForConfirmation(txId: string, maxRounds: number = 4) {
    return await waitForConfirmation(this.client.client.algod, txId, maxRounds);
  }

  // Network operations
  async getNetworkStatus() {
    return await this.client.client.algod.status().do();
  }

  async getLastRound(): Promise<number> {
    const status = await this.getNetworkStatus();
    return Number(status["last-round"]);
  }

  async getGenesisInfo() {
    return await this.client.client.algod.genesis().do();
  }

  // Enhanced search operations
  async searchTransactions(params: {
    address?: string;
    assetId?: number;
    appId?: number;
    limit?: number;
    minRound?: number;
    maxRound?: number;
  }) {
    let query = this.client.client.indexer.searchForTransactions();
    
    if (params.address) query = query.address(params.address);
    if (params.assetId) query = query.assetID(params.assetId);
    if (params.appId) query = query.applicationID(params.appId);
    if (params.limit) query = query.limit(params.limit);
    if (params.minRound) query = query.minRound(params.minRound);
    if (params.maxRound) query = query.maxRound(params.maxRound);
    
    return await query.do();
  }

  async searchApplications(params: {
    creator?: string;
    includeAll?: boolean;
    limit?: number;
  }) {
    let query = this.client.client.indexer.searchForApplications();
    
    if (params.creator) query = query.creator(params.creator);
    if (params.includeAll) query = query.includeAll(params.includeAll);
    if (params.limit) query = query.limit(params.limit);
    
    return await query.do();
  }

  // Utility methods
  convertToMicroAlgos(algos: number): number {
    return algosToMicroalgos(algos);
  }

  convertToAlgos(microAlgos: number): number {
    return microalgosToAlgos(microAlgos);
  }

  isValidAddress(address: string): boolean {
    try {
      algosdk.decodeAddress(address);
      return true;
    } catch {
      return false;
    }
  }

  // Performance monitoring
  async getPerformanceMetrics() {
    try {
      const status = await this.getNetworkStatus();
      const currentRound = Number(status["last-round"]);
      
      // Calculate TPS (simplified)
      const blockTime = 2.9; // Average block time
      const tps = Math.round(1000 / (blockTime * 1000)); // Simplified calculation
      
      return {
        currentRound,
        avgBlockTime: blockTime,
        tps,
        networkTime: status["time-since-last-round"],
      };
    } catch (error) {
      console.error("Failed to get performance metrics:", error);
      return {
        currentRound: 0,
        avgBlockTime: 2.9,
        tps: 0,
        networkTime: 0,
      };
    }
  }

  // Get the underlying client for advanced operations
  getClient(): AlgorandClient {
    return this.client;
  }
}

// Export singleton instance
export const enhancedAlgorandClient = new EnhancedAlgorandClient();

// Export types for better TypeScript support
export type {
  Account,
  Transaction,
  SuggestedParams,
};

export {
  algosdk,
  makePaymentTxnWithSuggestedParams,
  makeAssetTransferTxnWithSuggestedParams,
  makeApplicationCallTxnFromObject,
  waitForConfirmation,
  microalgosToAlgos,
  algosToMicroalgos,
};