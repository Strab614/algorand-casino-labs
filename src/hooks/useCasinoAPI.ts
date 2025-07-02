import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { casinoAPIClient, type CasinoRefundQuote, type StakingCommitment, type CreateStakingCommitmentRequest, type UpdateStakingCommitmentRequest } from "@/api/casino/enhanced";
import { useNotification } from "./useNotification";
import { useWallet } from "@txnlab/use-wallet-react";

/**
 * Hook for casino leaderboard data
 */
export const useCasinoLeaderboard = () => {
  return useQuery({
    queryKey: ["casino", "leaderboard"],
    queryFn: () => casinoAPIClient.getCasinoLeaderboard(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
};

/**
 * Hook for casino refund quote
 */
export const useCasinoRefundQuote = (address?: string) => {
  return useQuery({
    queryKey: ["casino", "refund-quote", address],
    queryFn: () => casinoAPIClient.getCasinoRefundQuote(address!),
    enabled: !!address,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * Hook for submitting casino refund claim
 */
export const useCasinoRefundClaim = () => {
  const notification = useNotification();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { address: string; signedTransaction?: string }) => {
      return await casinoAPIClient.submitCasinoRefundClaim(
        params.address,
        params.signedTransaction || ""
      );
    },
    onSuccess: (data) => {
      notification.display({
        type: "success",
        message: `Refund claim submitted successfully. ID: ${data.id}`,
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["casino", "refund-quote"] });
    },
    onError: (error) => {
      notification.display({
        type: "error",
        message: `Failed to submit refund claim: ${error.message}`,
      });
    },
  });
};

/**
 * Hook for staking periods
 */
export const useStakingPeriods = () => {
  return useQuery({
    queryKey: ["staking", "periods"],
    queryFn: () => casinoAPIClient.getStakingPeriods(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

/**
 * Hook for staking commitments
 */
export const useStakingCommitments = (stakingPeriodId?: number) => {
  return useQuery({
    queryKey: ["staking", "commitments", stakingPeriodId],
    queryFn: () => casinoAPIClient.getStakingCommitments(stakingPeriodId!),
    enabled: !!stakingPeriodId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook for creating staking commitment
 */
export const useCreateStakingCommitment = () => {
  const notification = useNotification();
  const queryClient = useQueryClient();
  const { activeAddress } = useWallet();

  return useMutation({
    mutationFn: async (params: {
      commitment: CreateStakingCommitmentRequest;
      signedTransaction?: string;
    }) => {
      return await casinoAPIClient.createStakingCommitment(
        params.commitment,
        params.signedTransaction || ""
      );
    },
    onSuccess: (data) => {
      notification.display({
        type: "success",
        message: "Staking commitment created successfully!",
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: ["staking", "commitments", data.stakingPeriodId] 
      });
    },
    onError: (error) => {
      notification.display({
        type: "error",
        message: `Failed to create staking commitment: ${error.message}`,
      });
    },
  });
};

/**
 * Hook for updating staking commitment
 */
export const useUpdateStakingCommitment = () => {
  const notification = useNotification();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      commitmentId: number;
      updates: UpdateStakingCommitmentRequest;
      signedTransaction: string;
    }) => {
      return await casinoAPIClient.updateStakingCommitment(
        params.commitmentId,
        params.updates,
        params.signedTransaction
      );
    },
    onSuccess: (data) => {
      notification.display({
        type: "success",
        message: "Staking commitment updated successfully!",
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: ["staking", "commitments", data.stakingPeriodId] 
      });
    },
    onError: (error) => {
      notification.display({
        type: "error",
        message: `Failed to update staking commitment: ${error.message}`,
      });
    },
  });
};

/**
 * Hook for staking results
 */
export const useStakingResults = (stakingPeriodId?: number) => {
  return useQuery({
    queryKey: ["staking", "results", stakingPeriodId],
    queryFn: () => casinoAPIClient.getStakingResults(stakingPeriodId!),
    enabled: !!stakingPeriodId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * Hook for staking period profit
 */
export const useStakingPeriodProfit = (stakingPeriodId?: number) => {
  return useQuery({
    queryKey: ["staking", "period-profit", stakingPeriodId],
    queryFn: () => casinoAPIClient.getStakingPeriodProfit(stakingPeriodId!),
    enabled: !!stakingPeriodId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
};

/**
 * Hook for game statistics
 */
export const useGameStatistics = (gameType: string) => {
  return useQuery({
    queryKey: ["games", "statistics", gameType],
    queryFn: () => casinoAPIClient.getGameStatistics(gameType),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
};

/**
 * Hook for validating Algorand addresses
 */
export const useAddressValidation = () => {
  return {
    validate: async (address: string) => {
      return await casinoAPIClient.validateAddress(address);
    },
  };
};

/**
 * Hook for getting asset balance
 */
export const useAssetBalance = (address?: string, assetId?: number) => {
  return useQuery({
    queryKey: ["asset", "balance", address, assetId],
    queryFn: () => casinoAPIClient.getAssetBalance(address!, assetId!),
    enabled: !!address && !!assetId,
    staleTime: 1000 * 30, // 30 seconds
  });
};

/**
 * Hook for real-time game events
 */
export const useGameEvents = (gameType: string, onEvent?: (event: any) => void) => {
  const notification = useNotification();

  return useMutation({
    mutationFn: async () => {
      return await casinoAPIClient.subscribeToGameEvents(gameType, (event) => {
        onEvent?.(event);
        
        // Show notification for important events
        if (event.type === "game-completed" || event.type === "big-win") {
          notification.display({
            type: "info",
            message: `Game event: ${event.type}`,
          });
        }
      });
    },
  });
};