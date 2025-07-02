import { getAlgodConfigFromViteEnvironment } from "@/utils/network";
import { Algodv2, Account, makePaymentTxnWithSuggestedParams, waitForConfirmation } from "algosdk";
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
const algodClient = new Algodv2(
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
    // Use modern AlgorandClient
    const accountInfo = await algorandClient.account.getInformation(address);
    
    return { 
      assets: accountInfo.assets || [], 
      microAlgos: accountInfo.amount 
    };
  } catch (error) {
    // Fallback to legacy client
    const r = await algodClient.accountInformation(address).do();
    return { assets: r.assets, microAlgos: r.amount };
  }
};

/**
 * Gets detailed account information
 * @param address - The account address
 * @returns Promise containing full account information
 */
export const getAccountInfo = async (address: string): Promise<AccountInfo> => {
  const accountInfo = await algorandClient.account.getInformation(address);
  
  return {
    address: accountInfo.address,
    amount: accountInfo.amount,
    assets: accountInfo.assets || [],
    "min-balance": accountInfo["min-balance"],
    "total-apps-opted-in": accountInfo["total-apps-opted-in"],
    "total-assets-opted-in": accountInfo["total-assets-opted-in"],
    "total-created-apps": accountInfo["total-created-apps"],
    "total-created-assets": accountInfo["total-created-assets"],
  };
};

/**
 * Gets the last round from the Algorand network using modern SDK
 * @returns the last round
 * @throws Error if the request fails
 */
export const getLastRound = async (): Promise<number> => {
  try {
    // Use modern AlgorandClient
    const status = await algorandClient.client.algod.status().do();
    return Number(status["last-round"]);
  } catch (error) {
    // Fallback to legacy client
    const status = await algodClient.status().do();
    return Number(status["last-round"]);
  }
};

/**
 * Gets network genesis information
 * @returns Promise containing genesis information
 */
export const getGenesisInformation = async () => {
  return await algorandClient.client.algod.genesis().do();
};

/**
 * Gets suggested transaction parameters
 * @returns Promise containing suggested parameters
 */
export const getSuggestedParams = async () => {
  return await algorandClient.client.algod.getTransactionParams().do();
};

/**
 * Waits for transaction confirmation
 * @param txId - Transaction ID to wait for
 * @param maxRounds - Maximum rounds to wait (default: 4)
 * @returns Promise containing confirmation details
 */
export const waitForTransaction = async (txId: string, maxRounds: number = 4) => {
  return await waitForConfirmation(algodClient, txId, maxRounds);
};

/**
 * Creates a payment transaction using modern SDK
 * @param from - Sender address
 * @param to - Receiver address  
 * @param amount - Amount in microAlgos
 * @param note - Optional note
 * @returns Promise containing the transaction
 */
export const createPaymentTransaction = async (
  from: string,
  to: string,
  amount: number | bigint,
  note?: string
) => {
  const suggestedParams = await getSuggestedParams();
  
  return makePaymentTxnWithSuggestedParams(
    from,
    to,
    Number(amount),
    undefined,
    note ? new TextEncoder().encode(note) : undefined,
    suggestedParams
  );
};

/**
 * Gets asset information
 * @param assetId - The asset ID
 * @returns Promise containing asset information
 */
export const getAssetInfo = async (assetId: number) => {
  return await algorandClient.asset.getById(BigInt(assetId));
};

/**
 * Gets application information
 * @param appId - The application ID
 * @returns Promise containing application information
 */
export const getApplicationInfo = async (appId: number) => {
  return await algorandClient.app.getById(BigInt(appId));
};

// Export both clients for flexibility
export { algodClient, algorandClient as modernClient };