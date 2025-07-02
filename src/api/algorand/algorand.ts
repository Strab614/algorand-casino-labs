import { getAlgodConfigFromViteEnvironment } from "@/utils/network";
import * as algosdk from "algosdk";
import { AlgorandClient } from "@algorandfoundation/algokit-utils";

const algodConfig = getAlgodConfigFromViteEnvironment();

// Create AlgorandClient instance for modern SDK usage
export const algorandClient = AlgorandClient.fromConfig({
  algodConfig: {
    server: algodConfig.server,
    port: algodConfig.port,
    token: algodConfig.token as string,
  },
});

// Legacy algod client for backward compatibility
const algodClient = new algosdk.Algodv2(
  algodConfig.token as string,
  algodConfig.server,
  algodConfig.port
);

export type Asset = {
  "asset-id": number;
  amount: number;
  "is-frozen": boolean;
};

export type AccountInfo = {
  address: string;
  amount: number;
  assets: Asset[];
  "min-balance": number;
  "total-apps-opted-in": number;
  "total-assets-opted-in": number;
  "total-created-apps": number;
  "total-created-assets": number;
};

/**
 * Gets the current assets for a given address using modern SDK
 * @param address - The account address
 * @returns Promise containing assets and microAlgos
 */
export const getAccountBalances = async (
  address: string
): Promise<{ assets: Asset[]; microAlgos: number | bigint }> => {
  try {
    // Check if we're in mock mode
    const IS_MOCK_MODE = import.meta.env.VITE_MOCK_WALLET_MODE === 'true';
    
    if (IS_MOCK_MODE) {
      // Return mock data for testing
      return {
        assets: [
          { "asset-id": 388592191, amount: 10000, "is-frozen": false }, // CHIP
          { "asset-id": 0, amount: 1000000000, "is-frozen": false }, // ALGO
          { "asset-id": 552665159, amount: 1000000, "is-frozen": false }, // Liquidity token
          { "asset-id": 1002609713, amount: 1000000, "is-frozen": false }, // Liquidity token V2
          { "asset-id": 2562903034, amount: 1000000, "is-frozen": false }, // cALGO/chip
          { "asset-id": 2545480441, amount: 1000000, "is-frozen": false }, // tALGO/chip
          { "asset-id": 2536627349, amount: 1000000, "is-frozen": false }, // mALGO/chip
          { "asset-id": 2520645026, amount: 1000000, "is-frozen": false }, // xALGO/chip
          { "asset-id": 693545224, amount: 10, "is-frozen": false }, // 10 chip/day NFT
          { "asset-id": 797090353, amount: 1, "is-frozen": false }, // 1% Casino Refund NFT
          { "asset-id": 1032365802, amount: 1, "is-frozen": false }, // Autostake NFT
        ],
        microAlgos: 10000000000, // 10 ALGO
      };
    }
    
    // Use modern AlgorandClient
    const accountInfo = await algorandClient.account.getInformation(address);
    
    return { 
      assets: accountInfo.assets || [], 
      microAlgos: accountInfo.amount 
    };
  } catch (error) {
    console.error("Error fetching account balances:", error);
    
    // Fallback to legacy client
    try {
      const r = await algodClient.accountInformation(address).do();
      return { assets: r.assets, microAlgos: r.amount };
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError);
      
      // Return empty data as last resort
      return { assets: [], microAlgos: 0 };
    }
  }
};

/**
 * Gets the last round from the Algorand network using modern SDK
 * @returns the last round
 * @throws Error if the request fails
 */
export const getLastRound = async (): Promise<number> => {
  try {
    // Check if we're in mock mode
    const IS_MOCK_MODE = import.meta.env.VITE_MOCK_WALLET_MODE === 'true';
    
    if (IS_MOCK_MODE) {
      // Return mock data for testing
      return 30000000;
    }
    
    // Use modern AlgorandClient
    const status = await algorandClient.client.algod.status().do();
    return Number(status["last-round"]);
  } catch (error) {
    console.error("Error fetching last round:", error);
    
    // Fallback to legacy client
    try {
      const status = await algodClient.status().do();
      return Number(status["last-round"]);
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError);
      throw error; // Re-throw the original error
    }
  }
};