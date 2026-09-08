/** The shape `/api/market` speaks, shared by the server route and every view. */

export type TopHolding = {
  tokenAddress: string;
  imageUrl: string | null;
  networkId: number;
  humanAmount: number;
  price: number;
  value: number;
  pnl: number;
};

export type Clan = { name: string; icon: string | null };

/** A share, once its curve exists on chain. Null until a trader is launched. */
export type ShareToken = {
  address: string;
  symbol: string;
  /** The bonding curve contract; the pair address once graduated. */
  curve: string;
  phase: "curve" | "graduated";
  priceEth: number;
  priceUsd: number;
  change24hPct: number | null;
  volume24hUsd: number;
  fees24hUsd: number;
  holdersCount: number;
  marketCapUsd: number;
  raisedEth: number;
  graduationThresholdEth: number;
  progressPct: number;
  feeBps: number;
  creatorTaxBps: number;
  launchTx: string | null;
  launchedAt: string | null;
  /** Where the price came from, so the UI never implies a read it did not do. */
  source: "chain" | "sample";
};

export type Trader = {
  id: string;
  rank: number;
  name: string;
  handle: string;
  profilePictureLink: string | null;
  evmAddress: string | null;
  pnl24h: number;
  pnl7d?: number;
  pnl30d?: number;
  followers: number;
  numTrades: number;
  totalVolume: number;
  clan: Clan | null;
  bio: string | null;
  following: number;
  verified: boolean;
  twitter: string | null;
  coverPhotoLink: string | null;
  totalHoldings: number;
  topHoldings: TopHolding[];
  token: ShareToken | null;
};

export type MarketMetrics = {
  volume24hUsd: number;
  fees24hUsd: number;
  launchedCount: number;
  graduatedCount: number;
  totalTraders: number;
};

export type MarketPayload = {
  traders: Trader[];
  ethUsd: number;
  metrics: MarketMetrics;
  /**
   * "fomo" once FOMO_API_KEY is set and the upstream answered; "seed" when the
   * roster is the bundled sample. The market header says which, because a
   * sample roster that looks live is the one thing this page must never be.
   */
  source: "fomo" | "seed";
  window: MarketWindow;
};

export type MarketWindow = "24h" | "7d" | "30d";

export type Candle = {
  /** Unix seconds at the open of the bucket. */
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
};

export type HolderTag =
  | "Bonding curve"
  | "Pool"
  | "Dev"
  | "Sniper"
  | "Bundler"
  | "Insider"
  | "Fresh"
  | "freshTrader30d";

export type Holder = {
  address: string;
  shares: number;
  supplyPct: number;
  pnlUsd: number | null;
  avgEntry: number | null;
  tags: HolderTag[];
};

export type Trade = {
  hash: string;
  side: "buy" | "sell";
  address: string;
  shares: number;
  quoteEth: number;
  usd: number;
  priceUsd: number;
  at: string;
};
