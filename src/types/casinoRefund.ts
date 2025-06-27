export interface NftClaim {
  id: number;
  address: string;
  refundType: number;
  refundAmount: number;
  status: number;
  created_at: string;
  profile: ApiQuote;
}

export interface ApiQuote {
  type: number; // 0 == 10%, 1 == 1%
  betCount: number; // how many bets
  winCount: number; // how many won?
  betTotal: number; // how much bet in total (chips)
  profitTotal: number; // how much profit(or loss) in total?
  profitMax: number; // maximum profit on a single bet
}
