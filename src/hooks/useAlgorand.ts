import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { enhancedAlgorandClient } from "@/api/algorand/enhanced";
import { useAppSelector, useAppDispatch } from "@/app/hooks";
import { selectLastKnownRound, setLastKnownRound, setPerformanceMetrics } from "@/features/appSlice";
import { useNotification } from "./useNotification";

/**
 * Hook for account information
 */
export const useAccountInfo = (address?: string) => {
  return useQuery({
    queryKey: ["account", address],
    queryFn: () => enhancedAlgorandClient.getAccountInfo(address!),
    enabled: !!address,
    staleTime: 1000 * 30, // 30 seconds
  });
};

/**
 * Hook for account balance
 */
export const useAccountBalance = (address?: string) => {
  return useQuery({
    queryKey: ["balance", address],
    queryFn: () => enhancedAlgorandClient.getAccountBalance(address!),
    enabled: !!address,
    staleTime: 1000 * 30, // 30 seconds
  });
};

/**
 * Hook for account assets
 */
export const useAccountAssets = (address?: string) => {
  return useQuery({
    queryKey: ["assets", address],
    queryFn: () => enhancedAlgorandClient.getAccountAssets(address!),
    enabled: !!address,
    staleTime: 1000 * 60, // 1 minute
  });
};

/**
 * Hook for asset information
 */
export const useAssetInfo = (assetId?: number | bigint) => {
  return useQuery({
    queryKey: ["asset", assetId],
    queryFn: () => enhancedAlgorandClient.getAssetInfo(assetId!),
    enabled: !!assetId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook for application information
 */
export const useApplicationInfo = (appId?: number | bigint) => {
  return useQuery({
    queryKey: ["application", appId],
    queryFn: () => enhancedAlgorandClient.getApplicationInfo(appId!),
    enabled: !!appId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook for network status
 */
export const useNetworkStatus = () => {
  const dispatch = useAppDispatch();
  
  return useQuery({
    queryKey: ["network-status"],
    queryFn: async () => {
      const status = await enhancedAlgorandClient.getNetworkStatus();
      const lastRound = Number(status["last-round"]);
      dispatch(setLastKnownRound(lastRound));
      return status;
    },
    refetchInterval: 1000 * 30, // 30 seconds
    staleTime: 1000 * 15, // 15 seconds
  });
};

/**
 * Hook for performance metrics
 */
export const usePerformanceMetrics = () => {
  const dispatch = useAppDispatch();
  
  return useQuery({
    queryKey: ["performance-metrics"],
    queryFn: async () => {
      const metrics = await enhancedAlgorandClient.getPerformanceMetrics();
      dispatch(setPerformanceMetrics(metrics));
      return metrics;
    },
    refetchInterval: 1000 * 60, // 1 minute
    staleTime: 1000 * 30, // 30 seconds
  });
};

/**
 * Hook for transaction search
 */
export const useTransactionSearch = (params: {
  address?: string;
  assetId?: number;
  appId?: number;
  limit?: number;
  minRound?: number;
  maxRound?: number;
}) => {
  return useQuery({
    queryKey: ["transactions", params],
    queryFn: () => enhancedAlgorandClient.searchTransactions(params),
    enabled: !!(params.address || params.assetId || params.appId),
    staleTime: 1000 * 60, // 1 minute
  });
};

/**
 * Hook for submitting transactions
 */
export const useSubmitTransaction = () => {
  const queryClient = useQueryClient();
  const notification = useNotification();
  
  return useMutation({
    mutationFn: async (signedTxn: Uint8Array) => {
      const txId = await enhancedAlgorandClient.submitTransaction(signedTxn);
      await enhancedAlgorandClient.waitForConfirmation(txId);
      return txId;
    },
    onSuccess: (txId) => {
      notification.display({
        type: "success",
        message: `Transaction confirmed: ${txId.slice(0, 8)}...`,
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["account"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
    onError: (error) => {
      notification.display({
        type: "error",
        message: `Transaction failed: ${error.message}`,
      });
    },
  });
};

/**
 * Hook for creating payment transactions
 */
export const useCreatePayment = () => {
  return useMutation({
    mutationFn: async (params: {
      from: string;
      to: string;
      amount: number | bigint;
      note?: string;
    }) => {
      return await enhancedAlgorandClient.createPaymentTransaction(
        params.from,
        params.to,
        params.amount,
        params.note
      );
    },
  });
};

/**
 * Hook for creating asset transfer transactions
 */
export const useCreateAssetTransfer = () => {
  return useMutation({
    mutationFn: async (params: {
      from: string;
      to: string;
      assetId: number | bigint;
      amount: number | bigint;
      note?: string;
    }) => {
      return await enhancedAlgorandClient.createAssetTransferTransaction(
        params.from,
        params.to,
        params.assetId,
        params.amount,
        params.note
      );
    },
  });
};

/**
 * Hook for real-time round updates
 */
export const useRoundUpdates = () => {
  const lastKnownRound = useAppSelector(selectLastKnownRound);
  const dispatch = useAppDispatch();
  
  const { data: networkStatus } = useNetworkStatus();
  
  return {
    currentRound: lastKnownRound,
    isUpdating: !networkStatus,
    lastUpdate: networkStatus?.["time-since-last-round"] || 0,
  };
};

/**
 * Hook for validating Algorand addresses
 */
export const useAddressValidation = () => {
  return {
    isValid: (address: string) => enhancedAlgorandClient.isValidAddress(address),
    validate: (address: string) => {
      if (!address) return { isValid: false, error: "Address is required" };
      if (!enhancedAlgorandClient.isValidAddress(address)) {
        return { isValid: false, error: "Invalid Algorand address" };
      }
      return { isValid: true, error: null };
    },
  };
};