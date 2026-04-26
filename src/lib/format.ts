/**
 * Format a number as a compact dollar string: $1.4B, $279M, $54K, etc.
 */
export function formatUSD(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return "—";
  if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

/**
 * Format a number with commas: 1,000,000
 */
export function formatNumber(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return "—";
  return value.toLocaleString("en-US");
}

/**
 * Format a percentage: +5.24%
 */
export function formatPct(value: number | null | undefined, showSign = true): string {
  if (value == null || isNaN(value)) return "—";
  const sign = showSign && value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

/**
 * Format a large token amount: 10.8B, 450M, etc.
 */
export function formatTokenAmount(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return "—";
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toFixed(0);
}

/**
 * Format wei to gwei
 */
export function weiToGwei(wei: bigint): string {
  return (Number(wei) / 1e9).toFixed(4);
}

/**
 * Short UTC date label ("Apr 21") for `daysAgo` days before now.
 */
export function dayLabel(daysAgo: number, now: Date = new Date()): string {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

/**
 * Short UTC date label ("Apr 21") from a Unix timestamp in seconds.
 */
export function unixDateLabel(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
