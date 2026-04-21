import type { MorningStats, NewsHeadline } from "./types";

export function composeMorningTweet(s: MorningStats): string | null {
  if (s.price == null && s.tvl == null && s.stablecoinTotal == null) return null;

  const lines: string[] = [`Monad | ${formatDate(s.date)}`, ``];

  if (s.price != null) {
    lines.push(`MON: ${fmtPrice(s.price)}${pct(s.priceChange24hPct)}`);
  }
  if (s.tvl != null) {
    lines.push(`TVL: ${fmtUSD(s.tvl)}${pct(s.tvlChange24hPct)}`);
  }
  if (s.stablecoinTotal != null) {
    lines.push(`Stables: ${fmtUSD(s.stablecoinTotal)}${pct(s.stablecoinChange24hPct)}`);
  }
  if (s.dexVolume != null) {
    lines.push(`DEX vol: ${fmtUSD(s.dexVolume)}${pct(s.dexVolumeChange24hPct)}`);
  }
  if (s.openInterest != null) {
    lines.push(`Open Interest: ${fmtUSD(s.openInterest)}`);
  }

  return lines.join("\n");
}

export function composeNewsDigest(items: NewsHeadline[]): string | null {
  if (items.length === 0) return null;
  const header = `Monad news | ${formatDate(new Date().toISOString().slice(0, 10))}`;
  const body = items.map((it, i) => `${i + 1}. ${it.title} (${it.source})\n${it.url}`).join("\n\n");
  return `${header}\n\n${body}`;
}

function pct(v: number | null): string {
  if (v == null) return "";
  const sign = v >= 0 ? "+" : "";
  return ` (${sign}${v.toFixed(1)}%)`;
}

function fmtPrice(n: number): string {
  if (n >= 1) return `$${n.toFixed(2)}`;
  if (n >= 0.01) return `$${n.toFixed(4)}`;
  return `$${n.toFixed(6)}`;
}

function fmtUSD(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  const mon = d.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  return `${mon} ${d.getUTCDate()}`;
}
