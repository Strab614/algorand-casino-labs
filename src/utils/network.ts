import { NetworkId } from "@txnlab/use-wallet-react";

import { AlgoClientConfig } from "@algorandfoundation/algokit-utils/types/network-client";

export interface AlgoViteClientConfig extends AlgoClientConfig {
  /** String representing current Algorand Network type (testnet/mainnet and etc) */
  network: string;
}

export function getAlgodConfigFromViteEnvironment(): AlgoViteClientConfig {
  if (!import.meta.env.VITE_ALGOD_SERVER) {
    throw new Error(
      "Attempt to get default algod configuration without specifying VITE_ALGOD_SERVER in the environment variables"
    );
  }

  return {
    server: import.meta.env.VITE_ALGOD_SERVER,
    port: import.meta.env.VITE_ALGOD_PORT,
    token: import.meta.env.VITE_ALGOD_TOKEN,
    network: import.meta.env.VITE_ALGOD_NETWORK,
  };
}

export function getIndexerConfigFromViteEnvironment(): AlgoViteClientConfig {
  if (!import.meta.env.VITE_INDEXER_SERVER) {
    throw new Error(
      "Attempt to get default algod configuration without specifying VITE_INDEXER_SERVER in the environment variables"
    );
  }

  return {
    server: import.meta.env.VITE_INDEXER_SERVER,
    port: import.meta.env.VITE_INDEXER_PORT,
    token: import.meta.env.VITE_INDEXER_TOKEN,
    network: import.meta.env.VITE_ALGOD_NETWORK,
  };
}

export function getAlgodNetwork(): NetworkId {
  const config = getAlgodConfigFromViteEnvironment();

  switch (config.network) {
    case "mainnet":
      return NetworkId.MAINNET;
    case "testnet":
      return NetworkId.TESTNET;
    case "betanet":
      return NetworkId.BETANET;
    case "localnet":
      return NetworkId.LOCALNET;
    default:
      throw new Error(`Unknown network: ${config.network}`);
  }
}
