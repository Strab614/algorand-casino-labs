import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { enhancedRouletteAPI } from "@/features/roulette/api/enhanced";
import { RouletteBet } from "@/features/roulette/types";
import { useNotification } from "./useNotification";
import { useWallet } from "@txnlab/use-wallet-react";

/**
 * Hook for roulette global state
 */
export const useRouletteGlobalState = (appId: bigint) => {
  return useQuery({
    queryKey: ["roulette", "globalState", Number(appId)],
    queryFn: () => enhancedRouletteAPI.getRouletteGlobalState(appId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook for roulette game logs
 */
export const useRouletteLogs = (appId: bigint) => {
  return useQuery({
    queryKey: ["roulette", "logs", Number(appId)],
    queryFn: () => enhancedRouletteAPI.getRouletteLogs(appId),
    staleTime: 1000 * 60, // 1 minute
  });
};

/**
 * Hook for user's roulette game
 */
export const useRouletteGame = (appId: bigint, address?: string) => {
  return useQuery({
    queryKey: ["roulette", "game", Number(appId), address],
    queryFn: () => enhancedRouletteAPI.getRouletteGameByAddress(appId, address!),
    enabled: !!address,
    staleTime: 1000 * 30, // 30 seconds
  });
};

/**
 * Hook for creating roulette game
 */
export const useCreateRouletteGame = (appId: bigint) => {
  const notification = useNotification();
  const queryClient = useQueryClient();
  const { activeAddress, transactionSigner } = useWallet();

  return useMutation({
    mutationFn: async (bets: RouletteBet[]) => {
      if (!activeAddress || !transactionSigner) {
        throw new Error("Wallet not connected");
      }

      return await enhancedRouletteAPI.createRouletteGame(
        appId,
        activeAddress,
        transactionSigner,
        bets
      );
    },
    onSuccess: () => {
      notification.display({
        type: "success",
        message: "Roulette game created successfully!",
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["roulette", "game"] });
      queryClient.invalidateQueries({ queryKey: ["roulette", "globalState"] });
    },
    onError: (error) => {
      notification.display({
        type: "error",
        message: `Failed to create roulette game: ${error.message}`,
      });
    },
  });
};

/**
 * Hook for completing roulette game
 */
export const useCompleteRouletteGame = (appId: bigint) => {
  const notification = useNotification();
  const queryClient = useQueryClient();
  const { activeAddress, transactionSigner } = useWallet();

  return useMutation({
    mutationFn: async () => {
      if (!activeAddress || !transactionSigner) {
        throw new Error("Wallet not connected");
      }

      return await enhancedRouletteAPI.completeRouletteGame(
        appId,
        activeAddress,
        transactionSigner
      );
    },
    onSuccess: () => {
      notification.display({
        type: "success",
        message: "Roulette game completed!",
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["roulette", "game"] });
      queryClient.invalidateQueries({ queryKey: ["roulette", "logs"] });
      queryClient.invalidateQueries({ queryKey: ["roulette", "globalState"] });
    },
    onError: (error) => {
      notification.display({
        type: "error",
        message: `Failed to complete roulette game: ${error.message}`,
      });
    },
  });
};

/**
 * Hook for cancelling roulette game
 */
export const useCancelRouletteGame = (appId: bigint) => {
  const notification = useNotification();
  const queryClient = useQueryClient();
  const { activeAddress, transactionSigner } = useWallet();

  return useMutation({
    mutationFn: async () => {
      if (!activeAddress || !transactionSigner) {
        throw new Error("Wallet not connected");
      }

      return await enhancedRouletteAPI.cancelRouletteGame(
        appId,
        activeAddress,
        transactionSigner
      );
    },
    onSuccess: () => {
      notification.display({
        type: "success",
        message: "Roulette game cancelled!",
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["roulette", "game"] });
      queryClient.invalidateQueries({ queryKey: ["roulette", "globalState"] });
    },
    onError: (error) => {
      notification.display({
        type: "error",
        message: `Failed to cancel roulette game: ${error.message}`,
      });
    },
  });
};

/**
 * Hook for adding prize pool (manager only)
 */
export const useAddRoulettePrizePool = (appId: bigint) => {
  const notification = useNotification();
  const queryClient = useQueryClient();
  const { activeAddress, transactionSigner } = useWallet();

  return useMutation({
    mutationFn: async (amount: bigint) => {
      if (!activeAddress || !transactionSigner) {
        throw new Error("Wallet not connected");
      }

      return await enhancedRouletteAPI.addPrizePool(
        appId,
        activeAddress,
        transactionSigner,
        amount
      );
    },
    onSuccess: () => {
      notification.display({
        type: "success",
        message: "Prize pool added successfully!",
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["roulette", "globalState"] });
    },
    onError: (error) => {
      notification.display({
        type: "error",
        message: `Failed to add prize pool: ${error.message}`,
      });
    },
  });
};

/**
 * Hook for deleting roulette application (manager only)
 */
export const useDeleteRoulette = (appId: bigint) => {
  const notification = useNotification();
  const queryClient = useQueryClient();
  const { activeAddress, transactionSigner } = useWallet();

  return useMutation({
    mutationFn: async () => {
      if (!activeAddress || !transactionSigner) {
        throw new Error("Wallet not connected");
      }

      return await enhancedRouletteAPI.deleteRoulette(
        appId,
        activeAddress,
        transactionSigner
      );
    },
    onSuccess: () => {
      notification.display({
        type: "success",
        message: "Roulette application deleted successfully!",
      });
      
      // Invalidate all roulette queries
      queryClient.invalidateQueries({ queryKey: ["roulette"] });
    },
    onError: (error) => {
      notification.display({
        type: "error",
        message: `Failed to delete roulette application: ${error.message}`,
      });
    },
  });
};

/**
 * Hook for roulette metrics
 */
export const useRouletteMetrics = (appId: bigint) => {
  return useQuery({
    queryKey: ["roulette", "metrics", Number(appId)],
    queryFn: () => enhancedRouletteAPI.getRouletteMetrics(appId),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};