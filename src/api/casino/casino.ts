import { IStakingResults as StakingResults } from "@/features/house-staking/types";

export interface CasinoLeaderboardResponse {
  lastUpdatedAt: string;
  entries: {
    rank: number;
    userId: number;
    name: string;
    betCount: number;
    betTotal: number;
  }[];
}

export const getCasinoLeaderboard =
  async (): Promise<CasinoLeaderboardResponse> => {
    const r = await fetch("https://api.algo-casino.com/casino/top");

    return (await r.json()) as CasinoLeaderboardResponse;
  };

export const getStakingResults = async (
  stakingPeriodId: number
): Promise<StakingResults> => {
  const r = await fetch(
    `https://api.algo-casino.com/stakingResults?stakingPeriodId=${stakingPeriodId}`
  );

  return (await r.json()) as StakingResults;
};

export const getCasinoRefundQuote = async (
  address: string
): Promise<number> => {
  const r = await fetch("https://api.algo-casino.com/casino/check", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ address: address }),
  });

  return (await r.json()) as number;
};

export const requestCasinoRefund = async (address: string): Promise<number> => {
  const r = await fetch("https://api.algo-casino.com/casino/refund", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ address: address }),
  });

  return (await r.json()) as number;
};
