import { AlertColor } from "@mui/material";
import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../app/store";
import { AlgorandClient } from "@algorandfoundation/algokit-utils";
import { getNetworkConfig } from "@/utils/network";

export interface AppState {
  // wallet select modal
  isWalletModalOpen: boolean;

  // notification
  notification: {
    open: boolean;
    type: AlertColor | undefined;
    message: string;
  };

  // sign transaction modal
  isSignTxnOpen: boolean;

  // which network?
  network: "mainnet" | "testnet" | "localnet" | "betanet";

  lastKnownRound: number;

  // connection status
  isConnected: boolean;
  
  // network health
  networkHealth: {
    algod: boolean;
    indexer: boolean;
    lastChecked: number;
  };
}

const initialState: AppState = {
  isWalletModalOpen: false,

  notification: { open: false, type: undefined, message: "" },

  isSignTxnOpen: false,

  network: "mainnet",

  lastKnownRound: 0,

  isConnected: false,

  networkHealth: {
    algod: false,
    indexer: false,
    lastChecked: 0,
  },
};

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setNetwork: (state, action) => {
      state.network = action.payload;
    },
    setIsWalletModalOpen: (state, action) => {
      state.isWalletModalOpen = action.payload;
    },
    setIsSignTxnOpen: (state, action) => {
      state.isSignTxnOpen = action.payload;
    },
    addNotification: (state, action) => {
      state.notification = {
        open: true,
        ...action.payload,
      };
    },
    clearNotification: (state) => {
      state.notification = { open: false, type: undefined, message: "" };
    },
    setLastKnownRound: (state, action) => {
      state.lastKnownRound = action.payload;
    },
    setIsConnected: (state, action) => {
      state.isConnected = action.payload;
    },
    setNetworkHealth: (state, action) => {
      state.networkHealth = {
        ...action.payload,
        lastChecked: Date.now(),
      };
    },
  },
});

export const selectNetwork = (state: RootState) => state.app.network;

export const selectIsWalletModalOpen = (state: RootState) =>
  state.app.isWalletModalOpen;

export const selectIsSignTxnOpen = (state: RootState) =>
  state.app.isSignTxnOpen;

export const selectNotification = (state: RootState) => state.app.notification;

export const selectLastKnownRound = (state: RootState) =>
  state.app.lastKnownRound;

export const selectIsConnected = (state: RootState) => state.app.isConnected;

export const selectNetworkHealth = (state: RootState) => state.app.networkHealth;

/**
 * Enhanced network clients selector with modern SDK support
 */
export const selectNetworkClients = (state: RootState) => {
  const network = state.app.network;
  const config = getNetworkConfig();

  // Create AlgorandClient instance
  const algorandClient = AlgorandClient.fromConfig({
    algodConfig: config.algodConfig,
    indexerConfig: config.indexerConfig,
  });

  return {
    algorandClient,
    algod: algorandClient.client.algod,
    indexer: algorandClient.client.indexer,
    network,
  };
};

// Convenience function for notifications
export const showNotification = (notification: { type: AlertColor; message: string }) => 
  addNotification(notification);

export const {
  setNetwork,
  setIsWalletModalOpen,
  setIsSignTxnOpen,
  addNotification,
  clearNotification,
  setLastKnownRound,
  setIsConnected,
  setNetworkHealth,
} = appSlice.actions;

export default appSlice.reducer;