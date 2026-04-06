const BASE = "https://api.coingecko.com/api/v3";

export interface MarketData {
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  fdv: number;
  totalSupply: number;
  circulatingSupply: number;
  high24h: number;
  low24h: number;
}

export interface ChartPoint {
  timestamp: number;
  price: number;
}

export async function getMarketData(): Promise<MarketData | null> {
  try {
    const res = await fetch(
      `${BASE}/coins/monad?localization=false&tickers=false&community_data=false&developer_data=false`,
      { next: { revalidate: 30 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const md = data.market_data;
    return {
      price: md.current_price?.usd ?? 0,
      change24h: md.price_change_percentage_24h ?? 0,
      marketCap: md.market_cap?.usd ?? 0,
      volume24h: md.total_volume?.usd ?? 0,
      fdv: md.fully_diluted_valuation?.usd ?? 0,
      totalSupply: md.total_supply ?? 0,
      circulatingSupply: md.circulating_supply ?? 0,
      high24h: md.high_24h?.usd ?? 0,
      low24h: md.low_24h?.usd ?? 0,
    };
  } catch {
    return null;
  }
}

export async function getPriceChart(days: number = 7): Promise<ChartPoint[]> {
  try {
    const res = await fetch(
      `${BASE}/coins/monad/market_chart?vs_currency=usd&days=${days}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.prices ?? []).map(([timestamp, price]: [number, number]) => ({
      timestamp,
      price,
    }));
  } catch {
    return [];
  }
}

export interface CompetitorData {
  name: string;
  price: number;
  marketCap: number;
  volume24h: number;
}

export async function getCompetitorPrices(): Promise<Record<string, CompetitorData>> {
  try {
    const ids = "solana,sui,aptos";
    const res = await fetch(
      `${BASE}/simple/price?ids=${ids}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true`,
      { next: { revalidate: 120 } }
    );
    if (!res.ok) return {};
    const data = await res.json();
    const result: Record<string, CompetitorData> = {};
    for (const [id, values] of Object.entries(data)) {
      const v = values as Record<string, number>;
      result[id] = {
        name: id,
        price: v.usd ?? 0,
        marketCap: v.usd_market_cap ?? 0,
        volume24h: v.usd_24h_vol ?? 0,
      };
    }
    return result;
  } catch {
    return {};
  }
}
