export interface StakingResultItem {
  address: string;
  percent: number;
  reward: number;
}

export interface IStakingResults {
  id: number;
  stakingPeriodId: number;
  profit: number;
  results: StakingResultItem[];
}

export interface StakingPeriod {
  id: number;
  registrationBegin: Date;
  registrationEnd: Date;

  commitmentBegin: Date;
  commitmentEnd: Date;

  chipRatio: number;
}

export interface StakingCommitment {
  id: number;
  stakingPeriodId: number;
  algorandAddress: string;
  createdAt: Date;
  chipCommitment: number;
  liquidityCommitment: number;
  liquidityCommitmentV2: number; // TM v2
  cAlgoCommitment: number;
  tAlgoCommitment: number;
  mAlgoCommitment: number;
  xAlgoCommitment: number;

  eligible: boolean;
}
