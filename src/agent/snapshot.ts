import { getMarketData, getMonOpenInterest } from "../lib/coingecko";
import { getChainTVL, getChainTVLHistory, getStablecoins, getStablecoinHistory, getDexVolume } from "../lib/defillama";
import { getMonadNews } from "../lib/news";
import type { MorningStats, NewsHeadline } from "./types";

function pctChange(current: number, prev: number): number | null {
  if (!prev || prev === 0) return null;
  return +(((current - prev) / prev) * 100).toFixed(2);
}

export async function fetchMorningStats(): Promise<MorningStats> {
  const endDate = new Date().toISOString().slice(0, 10);

  const [market, tvlNow, tvlHistory, stablesNow, stablesHistory, dex, oi] = await Promise.all([
    getMarketData(),
    getChainTVL(),
    getChainTVLHistory(),
    getStablecoins(),
    getStablecoinHistory(),
    getDexVolume(),
    getMonOpenInterest(),
  ]);

  const tvlPrev = tvlHistory.length >= 2 ? tvlHistory[tvlHistory.length - 2].tvl : null;
  const stablesTotal = stablesNow.totalCirculating || null;
  const stablesPrev = stablesHistory.length >= 2 ? stablesHistory[stablesHistory.length - 2].totalUSD : null;

  return {
    date: endDate,
    price: market?.price ?? null,
    priceChange24hPct: market?.change24h != null ? +market.change24h.toFixed(2) : null,
    tvl: tvlNow,
    tvlChange24hPct: tvlNow && tvlPrev ? pctChange(tvlNow, tvlPrev) : null,
    stablecoinTotal: stablesTotal,
    stablecoinChange24hPct: stablesTotal && stablesPrev ? pctChange(stablesTotal, stablesPrev) : null,
    dexVolume: dex.dailyVolume,
    dexVolumeChange24hPct: dex.change1d != null ? +dex.change1d.toFixed(2) : null,
    openInterest: oi,
  };
}

export async function fetchEveningNews(limit: number = 5): Promise<NewsHeadline[]> {
  const items = await getMonadNews(30);
  const cutoff = Date.now() - 48 * 60 * 60 * 1000;

  const filtered = items
    .filter((it) => it.title.toLowerCase().includes("monad"))
    .map((it) => {
      const publishedAt = parsePubDate(it.time);
      return { title: it.title, source: it.source, url: it.url, publishedAt };
    })
    .filter((it) => it.publishedAt === 0 || it.publishedAt >= cutoff)
    .sort((a, b) => b.publishedAt - a.publishedAt);

  return filtered.slice(0, limit);
}

function parsePubDate(formatted: string): number {
  const match = formatted.match(/^([A-Z]{3})\s+(\d+)\s+(\d{2}):(\d{2})$/);
  if (!match) return 0;
  const months: Record<string, number> = {
    JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
    JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11,
  };
  const now = new Date();
  const mon = months[match[1]];
  const day = parseInt(match[2], 10);
  const h = parseInt(match[3], 10);
  const m = parseInt(match[4], 10);
  if (mon == null) return 0;
  const year = now.getUTCFullYear();
  let ts = Date.UTC(year, mon, day, h, m);
  if (ts > now.getTime() + 3600_000) ts = Date.UTC(year - 1, mon, day, h, m);
  return ts;
}
