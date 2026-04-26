const BASE = "https://api.llama.fi";
const STABLECOINS_BASE = "https://stablecoins.llama.fi";

export interface HistoricalValue {
  timestamp: number;
  value: number;
}

function getLastHistoricalValues(data: unknown, count = 30): HistoricalValue[] {
  const chart = (data as { totalDataChart?: unknown }).totalDataChart;
  if (!Array.isArray(chart)) return [];

  return chart
    .filter(
      (point): point is [number, number] =>
        Array.isArray(point) &&
        typeof point[0] === "number" &&
        typeof point[1] === "number" &&
        Number.isFinite(point[0]) &&
        Number.isFinite(point[1])
    )
    .map(([timestamp, value]) => ({ timestamp, value }))
    .slice(-count);
}

function cleanProtocolUrl(url?: string | null) {
  if (!url) return null;

  let cleaned = url.trim().replace(/\/(?:referral|r)(?:\/[^/?#]*)*\/?(?=([?#]|$))/i, "");

  try {
    const parsed = new URL(cleaned);
    for (const key of Array.from(parsed.searchParams.keys())) {
      if (/^referral(?:_code)?$/i.test(key)) {
        parsed.searchParams.delete(key);
      }
    }
    cleaned = parsed.toString();
  } catch {
    // Keep the path-only cleanup for malformed upstream URLs.
  }

  return cleaned || null;
}

// ─── TVL ─────────────────────────────────────────────────────

export interface ChainTVL {
  total: number;
}

export async function getChainTVL(): Promise<number | null> {
  try {
    const res = await fetch(`${BASE}/v2/chains`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const chains = await res.json();
    const monad = chains.find(
      (c: { name: string }) => c.name.toLowerCase() === "monad"
    );
    return monad?.tvl ?? null;
  } catch {
    return null;
  }
}

export interface TVLHistoryPoint {
  date: number;
  tvl: number;
}

export async function getChainTVLHistory(): Promise<TVLHistoryPoint[]> {
  try {
    const res = await fetch(`${BASE}/v2/historicalChainTvl/Monad`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((d: { date: number; tvl: number }) => ({ date: d.date, tvl: d.tvl }));
  } catch {
    return [];
  }
}

export interface ProtocolTVL {
  name: string;
  category: string;
  tvl: number;
  change7d: number | null;
  url: string | null;
}

export async function getProtocolsTVL(): Promise<ProtocolTVL[]> {
  try {
    const res = await fetch(`${BASE}/protocols`, { cache: "no-store" });
    if (!res.ok) return [];
    const protocols = await res.json();
    return protocols
      .filter((p: { chains?: string[] }) =>
        p.chains?.some((c: string) => c.toLowerCase() === "monad")
      )
      .map((p: { name: string; category: string; chainTvls?: Record<string, number>; change_7d?: number; url?: string }) => ({
        name: p.name,
        category: p.category ?? "Other",
        tvl: p.chainTvls?.["Monad"] ?? 0,
        change7d: p.change_7d ?? null,
        url: cleanProtocolUrl(p.url),
      }))
      .filter((p: ProtocolTVL) => p.tvl > 0)
      .sort((a: ProtocolTVL, b: ProtocolTVL) => b.tvl - a.tvl);
  } catch {
    return [];
  }
}

// ─── Fees & Revenue ──────────────────────────────────────────

export interface FeesData {
  dailyFees: number | null;
  dailyRevenue: number | null;
  totalFees30d: number | null;
  feesTrend30d: HistoricalValue[];
}

export async function getFeesData(): Promise<FeesData> {
  try {
    const res = await fetch(`${BASE}/overview/fees/Monad?dataType=dailyFees`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) return { dailyFees: null, dailyRevenue: null, totalFees30d: null, feesTrend30d: [] };
    const data = await res.json();
    return {
      dailyFees: data.total24h ?? null,
      dailyRevenue: data.totalRevenue24h ?? null,
      totalFees30d: data.total30d ?? null,
      feesTrend30d: getLastHistoricalValues(data),
    };
  } catch {
    return { dailyFees: null, dailyRevenue: null, totalFees30d: null, feesTrend30d: [] };
  }
}

// ─── DEX Volume ──────────────────────────────────────────────

export interface DexVolumeData {
  dailyVolume: number | null;
  weeklyVolume: number | null;
  change1d: number | null;
  volumeTrend30d: HistoricalValue[];
}

export async function getDexVolume(): Promise<DexVolumeData> {
  try {
    const res = await fetch(`${BASE}/overview/dexs/Monad`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) return { dailyVolume: null, weeklyVolume: null, change1d: null, volumeTrend30d: [] };
    const data = await res.json();
    return {
      dailyVolume: data.total24h ?? null,
      weeklyVolume: data.total7d ?? null,
      change1d: data.change_1d ?? null,
      volumeTrend30d: getLastHistoricalValues(data),
    };
  } catch {
    return { dailyVolume: null, weeklyVolume: null, change1d: null, volumeTrend30d: [] };
  }
}

// ─── Stablecoins ─────────────────────────────────────────────

export interface StablecoinAsset {
  id: string;
  name: string;
  symbol: string;
  circulating: number;
}

export interface StablecoinData {
  totalCirculating: number;
  assets: StablecoinAsset[];
}

export async function getStablecoins(): Promise<StablecoinData> {
  try {
    const res = await fetch(`${STABLECOINS_BASE}/stablecoins?includePrices=true`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return { totalCirculating: 0, assets: [] };
    const data = await res.json();
    const coins = data.peggedAssets ?? [];

    const assets: StablecoinAsset[] = [];
    let total = 0;

    for (const c of coins) {
      const monad = c.chainCirculating?.Monad;
      if (!monad) continue;
      const circ = monad.current?.peggedUSD ?? 0;
      if (circ < 100000) continue; // skip dust
      assets.push({ id: String(c.id), name: c.name, symbol: c.symbol, circulating: circ });
      total += circ;
    }

    assets.sort((a, b) => b.circulating - a.circulating);
    return { totalCirculating: total, assets };
  } catch {
    return { totalCirculating: 0, assets: [] };
  }
}

// ─── Stablecoin History (all-time chart) ────────────────────

export interface StablecoinHistoryPoint {
  date: number;
  totalUSD: number;
}

export async function getStablecoinHistory(): Promise<StablecoinHistoryPoint[]> {
  try {
    const res = await fetch(`${STABLECOINS_BASE}/stablecoincharts/Monad`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((d: { date: string; totalCirculatingUSD?: { peggedUSD?: number } }) => ({
      date: parseInt(d.date),
      totalUSD: d.totalCirculatingUSD?.peggedUSD ?? 0,
    }));
  } catch {
    return [];
  }
}

// ─── Per-Stablecoin 30d Change ──────────────────────────────

export interface StablecoinChange {
  id: string;
  current: number;
  prev30d: number;
  changePct: number;
  bridged: number;
  minted: number;
}

export async function getStablecoinChanges(assetIds: string[]): Promise<StablecoinChange[]> {
  try {
    const results = await Promise.all(
      assetIds.map(async (id) => {
        const res = await fetch(
          `${STABLECOINS_BASE}/stablecoincharts/Monad?stablecoin=${id}`,
          { next: { revalidate: 3600 } }
        );
        if (!res.ok) return null;
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) return null;

        const last = data[data.length - 1];
        const prev = data.length >= 30 ? data[data.length - 30] : data[0];

        const current = last.totalCirculatingUSD?.peggedUSD ?? 0;
        const prev30d = prev.totalCirculatingUSD?.peggedUSD ?? 0;
        const changePct = prev30d > 0 ? ((current - prev30d) / prev30d) * 100 : 0;
        const bridged = last.totalBridgedToUSD?.peggedUSD ?? 0;
        const minted = last.totalMintedUSD?.peggedUSD ?? 0;

        return { id, current, prev30d, changePct, bridged, minted } as StablecoinChange;
      })
    );
    return results.filter((r): r is StablecoinChange => r !== null);
  } catch {
    return [];
  }
}
