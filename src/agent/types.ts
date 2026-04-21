export interface MorningStats {
  date: string;
  price: number | null;
  priceChange24hPct: number | null;
  tvl: number | null;
  tvlChange24hPct: number | null;
  stablecoinTotal: number | null;
  stablecoinChange24hPct: number | null;
  dexVolume: number | null;
  dexVolumeChange24hPct: number | null;
  openInterest: number | null;
}

export interface NewsHeadline {
  title: string;
  source: string;
  url: string;
  publishedAt: number;
}

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  dryRun: boolean;
}
