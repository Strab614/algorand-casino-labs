/// <reference types="vite/client" />

interface ViteTypeOptions {
  // By adding this line, you can make the type of ImportMetaEnv strict
  // to disallow unknown keys.
  strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
  // coin flip
  readonly VITE_COIN_FLIP_APP_ID: number;
  // lottery manager/creator
  readonly VITE_LOTTERY_MANAGER_ADDRESS: string;
  // roulette
  readonly VITE_ROULETTE_APP_ID: number;
  // pusher
  readonly VITE_PUSHER_APP_KEY: string;
  readonly VITE_PUSHER_APP_CLUSTER: string;
  // algod
  readonly VITE_ALGOD_NETWORK: string;
  readonly VITE_ALGOD_SERVER: string;
  readonly VITE_ALGOD_PORT: string;
  readonly VITE_ALGOD_TOKEN: string;
  // indexer
  readonly VITE_INDEXER_NETWORK: string;
  readonly VITE_INDEXER_SERVER: string;
  readonly VITE_INDEXER_PORT: string;
  readonly VITE_INDEXER_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
