const BASE = "https://api.llama.fi";
const STABLECOINS_BASE = "https://stablecoins.llama.fi";

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

export interface ProtocolTVL {
  name: string;
  category: string;
  tvl: number;
  change7d: number | null;
  url: string | null;
}

export async function getProtocolsTVL(): Promise<ProtocolTVL[]> {
  try {
    const res = await fetch(`${BASE}/protocols`, { next: { revalidate: 120 }, cache: "no-store" });
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
        url: p.url ?? null,
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
}

export async function getFeesData(): Promise<FeesData> {
  try {
    const res = await fetch(`${BASE}/overview/fees/Monad?dataType=dailyFees`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) return { dailyFees: null, dailyRevenue: null, totalFees30d: null };
    const data = await res.json();
    return {
      dailyFees: data.total24h ?? null,
      dailyRevenue: data.totalRevenue24h ?? null,
      totalFees30d: data.total30d ?? null,
    };
  } catch {
    return { dailyFees: null, dailyRevenue: null, totalFees30d: null };
  }
}

// ─── DEX Volume ──────────────────────────────────────────────

export interface DexVolumeData {
  dailyVolume: number | null;
  weeklyVolume: number | null;
}

export async function getDexVolume(): Promise<DexVolumeData> {
  try {
    const res = await fetch(`${BASE}/overview/dexs/Monad`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) return { dailyVolume: null, weeklyVolume: null };
    const data = await res.json();
    return {
      dailyVolume: data.total24h ?? null,
      weeklyVolume: data.total7d ?? null,
    };
  } catch {
    return { dailyVolume: null, weeklyVolume: null };
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
