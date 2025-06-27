import { AlertColor } from "@mui/material";
import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../app/store";
import { Algodv2, Indexer } from "algosdk";

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
  network: "mainnet" | "testnet" | "localnet";

  lastKnownRound: number;
}

const initialState: AppState = {
  isWalletModalOpen: false,

  notification: { open: false, type: undefined, message: "" },

  isSignTxnOpen: false,

  network: "mainnet", // should be mainnet

  lastKnownRound: 0,
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
  },
});

export const selectNetwork = (state: RootState) => state.app.network;

export const selectIsWalletModalOpen = (state: RootState) =>
  state.app.isWalletModalOpen;

export const selectIsSignTxnOpen = (state: RootState) =>
  state.app.isSignTxnOpen;

export const selectNotification = (state: RootState) => state.app.notification;

export const selectNetworkClients = (state: RootState) => {
  const network = state.app.network;

  return network === "testnet"
    ? {
        algod: new Algodv2("", "https://testnet-api.algonode.cloud", ""),
        indexer: new Indexer("", "https://testnet-idx.algonode.cloud", ""),
      }
    : network === "mainnet"
    ? {
        algod: new Algodv2("", "https://mainnet-api.algonode.cloud", ""),
        indexer: new Indexer("", "https://mainnet-idx.algonode.cloud", ""),
      }
    : {
        algod: new Algodv2("", "https://betanet-api.algonode.cloud", ""),
        indexer: new Indexer("", "https://betanet-idx.algonode.cloud", ""),
      };
};

export const selectLastKnownRound = (state: RootState) =>
  state.app.lastKnownRound;

export const {
  setNetwork,
  setIsWalletModalOpen,
  setIsSignTxnOpen,
  addNotification,
  clearNotification,
  setLastKnownRound,
} = appSlice.actions;

export default appSlice.reducer;
