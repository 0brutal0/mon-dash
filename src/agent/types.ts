// Snapshot of dashboard data used for delta calculations and tweet composition

export interface DashSnapshot {
  timestamp: string;
  price: number;
  change24h: number;
  marketCap: string;
  tvl: string;
  tvlByCategory: { name: string; value: string; pct: number }[];
  topProtocols: { name: string; tvl: string; pct: number }[];
  stablecoinTotal: string;
  stablecoinAssets: { name: string; amount: string; pct: number }[];
  validatorCount: number;
  nakamotoCoefficient: number;
  dailyTx: string;
  activeAddrsDaily: string;
  bridgeNetFlow: string;
  bridgeDirection: string;
}

export interface TweetEvent {
  type:
    | "daily_recap"
    | "tvl_milestone"
    | "bridge_spike"
    | "new_validator"
    | "stablecoin_milestone"
    | "weekly_thread"
    | "notable_move";
  priority: number; // 1 = high, 3 = low
  content: string;
  thread?: string[]; // for multi-tweet threads
}

export interface AgentConfig {
  apiBaseUrl: string;
  snapshotPath: string;
  twitterApiKey?: string;
  twitterApiSecret?: string;
  twitterAccessToken?: string;
  twitterAccessSecret?: string;
  dryRun: boolean;
}
