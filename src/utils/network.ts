import { NetworkId } from "@txnlab/use-wallet-react";
import { AlgoClientConfig } from "@algorandfoundation/algokit-utils/types/network-client";

export interface AlgoViteClientConfig extends AlgoClientConfig {
  /** String representing current Algorand Network type (testnet/mainnet and etc) */
  network: string;
}

/**
 * Gets Algod configuration from Vite environment variables
 * Updated for latest SDK compatibility
 */
export function getAlgodConfigFromViteEnvironment(): AlgoViteClientConfig {
  if (!import.meta.env.VITE_ALGOD_SERVER) {
    throw new Error(
      "Attempt to get default algod configuration without specifying VITE_ALGOD_SERVER in the environment variables"
    );
  }

  return {
    server: import.meta.env.VITE_ALGOD_SERVER,
    port: import.meta.env.VITE_ALGOD_PORT || "",
    token: import.meta.env.VITE_ALGOD_TOKEN || "",
    network: import.meta.env.VITE_ALGOD_NETWORK || "mainnet",
  };
}

/**
 * Gets Indexer configuration from Vite environment variables
 * Updated for latest SDK compatibility
 */
export function getIndexerConfigFromViteEnvironment(): AlgoViteClientConfig {
  if (!import.meta.env.VITE_INDEXER_SERVER) {
    throw new Error(
      "Attempt to get default indexer configuration without specifying VITE_INDEXER_SERVER in the environment variables"
    );
  }

  return {
    server: import.meta.env.VITE_INDEXER_SERVER,
    port: import.meta.env.VITE_INDEXER_PORT || "",
    token: import.meta.env.VITE_INDEXER_TOKEN || "",
    network: import.meta.env.VITE_INDEXER_NETWORK || import.meta.env.VITE_ALGOD_NETWORK || "mainnet",
  };
}

/**
 * Gets the network ID for wallet connections
 * Enhanced with better error handling
 */
export function getAlgodNetwork(): NetworkId {
  const config = getAlgodConfigFromViteEnvironment();

  switch (config.network.toLowerCase()) {
    case "mainnet":
      return NetworkId.MAINNET;
    case "testnet":
      return NetworkId.TESTNET;
    case "betanet":
      return NetworkId.BETANET;
    case "localnet":
      return NetworkId.LOCALNET;
    default:
      console.warn(`Unknown network: ${config.network}, defaulting to mainnet`);
      return NetworkId.MAINNET;
  }
}

/**
 * Gets the network configuration for AlgorandClient
 * New utility for modern SDK usage
 */
export function getNetworkConfig() {
  const algodConfig = getAlgodConfigFromViteEnvironment();
  const indexerConfig = getIndexerConfigFromViteEnvironment();

  return {
    algodConfig: {
      server: algodConfig.server,
      port: algodConfig.port,
      token: algodConfig.token,
    },
    indexerConfig: {
      server: indexerConfig.server,
      port: indexerConfig.port,
      token: indexerConfig.token,
    },
    network: algodConfig.network,
  };
}

/**
 * Validates network configuration
 * New utility to ensure proper setup
 */
export function validateNetworkConfig(): boolean {
  try {
    const algodConfig = getAlgodConfigFromViteEnvironment();
    const indexerConfig = getIndexerConfigFromViteEnvironment();

    const requiredFields = [
      algodConfig.server,
      indexerConfig.server,
    ];

    return requiredFields.every(field => field && field.trim() !== "");
  } catch (error) {
    console.error("Network configuration validation failed:", error);
    return false;
  }
}

/**
 * Gets the appropriate explorer URL for the current network
 * New utility for better user experience
 */
export function getExplorerUrl(type: "tx" | "account" | "asset" | "app", id: string): string {
  const network = getAlgodConfigFromViteEnvironment().network.toLowerCase();
  
  const baseUrls = {
    mainnet: "https://allo.info",
    testnet: "https://testnet.allo.info",
    betanet: "https://betanet.allo.info",
    localnet: "http://localhost:8080", // Assuming local explorer
  };

  const baseUrl = baseUrls[network as keyof typeof baseUrls] || baseUrls.mainnet;

  switch (type) {
    case "tx":
      return `${baseUrl}/tx/${id}`;
    case "account":
      return `${baseUrl}/account/${id}`;
    case "asset":
      return `${baseUrl}/asset/${id}`;
    case "app":
      return `${baseUrl}/application/${id}`;
    default:
      return baseUrl;
  }
}