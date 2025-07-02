import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import * as algosdk from "algosdk";
import { algorandClient } from "@/api/algorand/algorand";

TimeAgo.addDefaultLocale(en);

// Create formatter (English).
const timeAgo = new TimeAgo("en-US");

export function ellipseAddress(address = "", width = 4): string {
  return `${address.slice(0, width)}...${address.slice(-width)}`;
}

export function getTimestampInSeconds() {
  return Math.floor(Date.now() / 1000);
}

export async function copyTextToClipboard(text: string) {
  if ("clipboard" in navigator) {
    return await navigator.clipboard.writeText(text);
  } else {
    return document.execCommand("copy", true, text);
  }
}

// Enhanced asset formatting with better decimal handling
export function formattedAssetAmount(
  assetId: bigint | number,
  amount: bigint | number
): string {
  let ret = Number(amount).toString();

  switch (Number(assetId)) {
    case 0: // ALGO
      ret = algosdk.microalgosToAlgos(Number(amount)).toLocaleString("en", {
        maximumFractionDigits: 6,
        minimumFractionDigits: 0,
      });
      break;
    case 388592191: // CHIP
      ret = (Number(amount) / 10).toLocaleString("en", {
        maximumFractionDigits: 1,
        minimumFractionDigits: 0,
      });
      break;
    default:
      // For unknown assets, try to get decimals from asset info
      ret = Number(amount).toLocaleString("en", {
        maximumFractionDigits: 6,
        minimumFractionDigits: 0,
      });
      break;
  }

  return ret;
}

// Enhanced asset utilities
export function algoToMicroAlgo(algo: number): number {
  return algosdk.algosToMicroalgos(algo);
}

export function microAlgoToAlgo(microAlgo: number): number {
  return algosdk.microalgosToAlgos(microAlgo);
}

type Asset = {
  "asset-id": number;
  amount: number;
  "is-frozen": boolean;
  decimals?: number;
};

/**
 * Enhanced getAssets function using modern SDK
 */
export const getAssets = async (
  address: string,
  algod?: algosdk.Algodv2
): Promise<Asset[]> => {
  try {
    // Use modern AlgorandClient if available
    const accountInfo = await algorandClient.account.getInformation(address);
    return (accountInfo.assets || []) as Asset[];
  } catch (error) {
    // Fallback to legacy client if provided
    if (algod) {
      const r = await algod.accountInformation(address).do();
      return r.assets as Asset[];
    }
    throw error;
  }
};

/**
 * Enhanced asset information retrieval
 */
export const getAssetInfo = async (assetId: number) => {
  try {
    return await algorandClient.asset.getById(BigInt(assetId));
  } catch (error) {
    console.error(`Failed to get asset info for ${assetId}:`, error);
    return null;
  }
};

export const blockTimeAgo = (curr: number, prev: number): string => {
  const blockTime = 2.9; // Average block time in seconds
  const timeDiff = (curr - prev) * blockTime * 1000;
  return timeAgo.format(Date.now() - timeDiff);
};

/**
 * Enhanced NFD lookup with caching
 */
const nfdCache = new Map<string, string | null>();

export const lookupNFDByAddress = async (address: string): Promise<string | undefined> => {
  // Check cache first
  if (nfdCache.has(address)) {
    const cached = nfdCache.get(address);
    return cached || undefined;
  }

  try {
    const r = await fetch(
      `https://api.nf.domains/nfd/lookup?address=${address}&view=tiny`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (!r.ok) {
      throw new Error(`HTTP ${r.status}`);
    }

    const res = await r.json();
    const name = res[address]?.name;
    
    // Cache the result
    nfdCache.set(address, name || null);
    
    return name;
  } catch (error) {
    console.warn(`Failed to lookup NFD for ${address}:`, error);
    nfdCache.set(address, null);
    return undefined;
  }
};

// Utility to decode arc4 strings (they are prefixed with a 2 byte length)
export function decodeArc4String(b: Uint8Array): string {
  return new algosdk.ABIStringType().decode(b);
}

/**
 * Enhanced transaction utilities
 */
export const formatTransactionId = (txId: string): string => {
  return ellipseAddress(txId, 8);
};

export const getTransactionUrl = (txId: string, network: string = "mainnet"): string => {
  const baseUrls = {
    mainnet: "https://allo.info",
    testnet: "https://testnet.allo.info",
    betanet: "https://betanet.allo.info",
  };
  
  const baseUrl = baseUrls[network as keyof typeof baseUrls] || baseUrls.mainnet;
  return `${baseUrl}/tx/${txId}`;
};

export const getAccountUrl = (address: string, network: string = "mainnet"): string => {
  const baseUrls = {
    mainnet: "https://allo.info",
    testnet: "https://testnet.allo.info", 
    betanet: "https://betanet.allo.info",
  };
  
  const baseUrl = baseUrls[network as keyof typeof baseUrls] || baseUrls.mainnet;
  return `${baseUrl}/account/${address}`;
};

/**
 * Validation utilities
 */
export const isValidAlgorandAddress = (address: string): boolean => {
  try {
    algosdk.decodeAddress(address);
    return true;
  } catch {
    return false;
  }
};

export const isValidAssetId = (assetId: string | number): boolean => {
  const id = Number(assetId);
  return Number.isInteger(id) && id >= 0;
};

export const isValidAppId = (appId: string | number): boolean => {
  const id = Number(appId);
  return Number.isInteger(id) && id > 0;
};

/**
 * Format utilities for better UX
 */
export const formatNumber = (num: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(num);
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${formatNumber(value, decimals)}%`;
};

/**
 * Error handling utilities
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
};

export const isNetworkError = (error: unknown): boolean => {
  const message = getErrorMessage(error).toLowerCase();
  return message.includes('network') || 
         message.includes('fetch') || 
         message.includes('connection') ||
         message.includes('timeout');
};