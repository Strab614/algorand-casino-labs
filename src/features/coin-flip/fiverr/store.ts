/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";

export interface SceneStore {
  flipCoinFn: () => void;
  fallCoin: boolean;
  canFlip: boolean;
  init: boolean;
  outcome: "heads" | "tails" | null;

  setFlipCoinFn: (val: () => void) => void;
  setFallCoin: (val: boolean) => void;
  setCanFlip: (val: boolean) => void;
  setInit: (val: boolean) => void;
  setOutcome: (val: "heads" | "tails" | null) => void;
}

const useSceneStore = create<SceneStore>()((set) => ({
  flipCoinFn: () => {},
  fallCoin: true,
  canFlip: true,
  init: false,
  outcome: null,

  setFlipCoinFn: (val: any) => set({ flipCoinFn: val }),
  setFallCoin: (val: any) => set({ fallCoin: val }),
  setCanFlip: (val: any) => set({ canFlip: val }),
  setInit: (val: any) => set({ init: val }),
  setOutcome: (val: any) => set({ outcome: val }),
}));

export default useSceneStore;
