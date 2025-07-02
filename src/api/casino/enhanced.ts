import { AlgorandClient } from "@algorandfoundation/algokit-utils";
import * as algosdk from "algosdk";
import { getNetworkConfig } from "@/utils/network";

// Enhanced Casino API client with modern SDK integration
export class CasinoAPIClient {
  private algorandClient: AlgorandClient;
  private baseUrl: string;
  private config: ReturnType<typeof getNetworkConfig>;

  constructor(baseUrl: string = "https://api.algo-casino.com") {
    this.baseUrl = baseUrl;
    this.config = getNetworkConfig();
    this.algorandClient = AlgorandClient.fromConfig({
      algodConfig: this.config.algodConfig,
      indexerConfig: this.config.indexerConfig,
    });
  }

  // Authentication utilities
  private async createAuthTransaction(address: string): Promise<string> {
    const suggestedParams = await this.algorandClient.client.algod.getTransactionParams().do();
    
    const note = new TextEncoder().encode("https://labs.algo-casino.com");
    
    const txn = algosdk.makeAssetTransferTxnWithSuggestedParams(
      address,
      address,
      undefined,
      undefined,
      0,
      note,
      388592191, // CHIP asset ID
      suggestedParams,
      undefined
    );

    return algosdk.encodeUnsignedTransaction(txn);
  }

  // Casino Leaderboard API
  async getCasinoLeaderboard(): Promise<CasinoLeaderboardResponse> {
    const response = await fetch(`${this.baseUrl}/casino/top`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
    }
    
    return await response.json();
  }

  // Casino Refund API
  async getCasinoRefundQuote(address: string): Promise<CasinoRefundQuote> {
    const response = await fetch(`${this.baseUrl}/casino/check`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ address }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to get refund quote");
    }

    return await response.json();
  }

  async requestCasinoRefund(address: string): Promise<CasinoRefundResult> {
    const response = await fetch(`${this.baseUrl}/casino/refund`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ address }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to request refund");
    }

    return await response.json();
  }

  async submitCasinoRefundClaim(
    address: string,
    signedTransaction: string
  ): Promise<CasinoRefundClaim> {
    const authTx = await this.createAuthTransaction(address);

    const response = await fetch(`${this.baseUrl}/casino/claim`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transaction: signedTransaction || authTx,
        pubkey: address,
        address,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to submit claim");
    }

    return await response.json();
  }

  // House Staking API
  async getStakingPeriods(): Promise<StakingPeriod[]> {
    const response = await fetch(`${this.baseUrl}/stakingPeriods`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch staking periods: ${response.statusText}`);
    }
    
    return await response.json();
  }

  async getStakingCommitments(stakingPeriodId: number): Promise<StakingCommitment[]> {
    const response = await fetch(
      `${this.baseUrl}/stakingCommitments?stakingPeriodId=${stakingPeriodId}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch staking commitments: ${response.statusText}`);
    }
    
    return await response.json();
  }

  async createStakingCommitment(
    commitment: CreateStakingCommitmentRequest,
    signedTransaction: string
  ): Promise<StakingCommitment> {
    const authTx = await this.createAuthTransaction(commitment.algorandAddress);

    const response = await fetch(`${this.baseUrl}/stakingCommitments`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...commitment,
        transaction: signedTransaction || authTx,
        pubkey: commitment.algorandAddress,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create staking commitment");
    }

    return await response.json();
  }

  async updateStakingCommitment(
    commitmentId: number,
    updates: UpdateStakingCommitmentRequest,
    signedTransaction: string
  ): Promise<StakingCommitment> {
    const response = await fetch(`${this.baseUrl}/stakingCommitments/${commitmentId}`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...updates,
        transaction: signedTransaction,
        pubkey: updates.address,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update staking commitment");
    }

    return await response.json();
  }

  async getStakingResults(stakingPeriodId: number): Promise<StakingResults> {
    const response = await fetch(
      `${this.baseUrl}/stakingResults?stakingPeriodId=${stakingPeriodId}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch staking results: ${response.statusText}`);
    }
    
    return await response.json();
  }

  async getStakingPeriodProfit(stakingPeriodId: number): Promise<{ profit: number }> {
    const response = await fetch(
      `${this.baseUrl}/stakingPeriods/${stakingPeriodId}/profit`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch staking period profit: ${response.statusText}`);
    }
    
    return await response.json();
  }

  // Game Statistics API
  async getGameStatistics(gameType: string): Promise<GameStatistics> {
    const response = await fetch(`${this.baseUrl}/games/${gameType}/stats`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch game statistics: ${response.statusText}`);
    }
    
    return await response.json();
  }

  // Real-time Events API (WebSocket/Pusher integration)
  async subscribeToGameEvents(gameType: string, callback: (event: GameEvent) => void) {
    // This would integrate with Pusher for real-time events
    // Implementation depends on the specific event structure from the API
    console.log(`Subscribing to ${gameType} events...`);
  }

  // Utility methods
  async validateAddress(address: string): Promise<boolean> {
    try {
      algosdk.decodeAddress(address);
      return true;
    } catch {
      return false;
    }
  }

  async getAssetBalance(address: string, assetId: number): Promise<number> {
    const accountInfo = await this.algorandClient.account.getInformation(address);
    const asset = accountInfo.assets?.find(a => a["asset-id"] === assetId);
    return asset?.amount || 0;
  }
}

// Type definitions for API responses
export interface CasinoLeaderboardResponse {
  lastUpdatedAt: string;
  entries: {
    rank: number;
    userId: number;
    name: string;
    betCount: number;
    betTotal: number;
  }[];
}

export interface CasinoRefundQuote {
  type: number; // 0 == 1%, 1 == 10%
  betCount: number;
  winCount: number;
  betTotal: number;
  profitTotal: number;
  profitMax: number;
}

export interface CasinoRefundResult {
  refundAmount: number;
  transactionId?: string;
}

export interface CasinoRefundClaim {
  id: number;
  address: string;
  refundType: number;
  refundAmount: number;
  status: number;
  created_at: string;
  profile: CasinoRefundQuote;
}

export interface StakingPeriod {
  id: number;
  registrationBegin: Date;
  registrationEnd: Date;
  commitmentBegin: Date;
  commitmentEnd: Date;
  chipRatio: number;
}

export interface StakingCommitment {
  id: number;
  stakingPeriodId: number;
  algorandAddress: string;
  createdAt: Date;
  chipCommitment: number;
  liquidityCommitment: number;
  liquidityCommitmentV2: number;
  cAlgoCommitment: number;
  tAlgoCommitment: number;
  mAlgoCommitment: number;
  xAlgoCommitment: number;
  eligible: boolean;
}

export interface CreateStakingCommitmentRequest {
  algorandAddress: string;
  stakingPeriodId: number;
  chipCommitment: number;
  liquidityCommitment: number;
  liquidityCommitmentV2: number;
  cAlgoCommitment: number;
  tAlgoCommitment: number;
  mAlgoCommitment: number;
  xAlgoCommitment: number;
}

export interface UpdateStakingCommitmentRequest {
  address: string;
  chipCommitment: number;
  liquidityCommitment: number;
  liquidityCommitmentV2: number;
  cAlgoCommitment: number;
  tAlgoCommitment: number;
  mAlgoCommitment: number;
  xAlgoCommitment: number;
}

export interface StakingResults {
  id: number;
  stakingPeriodId: number;
  profit: number;
  results: {
    address: string;
    percent: number;
    reward: number;
  }[];
}

export interface GameStatistics {
  totalGames: number;
  totalVolume: number;
  totalWinnings: number;
  averageBet: number;
  popularBets: string[];
}

export interface GameEvent {
  type: string;
  gameId: string;
  playerId: string;
  data: any;
  timestamp: number;
}

// Export singleton instance
export const casinoAPIClient = new CasinoAPIClient();