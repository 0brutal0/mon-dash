const BASE = "https://api.wormholescan.io/api/v1";

// Monad's Wormhole chain ID — need to verify, using placeholder
// Wormhole assigns each chain a numeric ID

export interface BridgeVolume {
  sourceChain: string;
  volume: number;
  txCount: number;
}

export async function getWormholeBridgeStats(): Promise<{
  totalVolume: number;
  byChain: BridgeVolume[];
} | null> {
  try {
    // Get recent transactions to/from Monad
    const res = await fetch(
      `${BASE}/last-txs?timeSpan=7d`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    const data = await res.json();

    // The Wormholescan API structure may vary — extract what we can
    if (!Array.isArray(data)) return null;

    // Filter for Monad-related entries
    let totalVolume = 0;
    const chainMap = new Map<string, { volume: number; txCount: number }>();

    for (const tx of data) {
      const isToMonad = tx.destinationChain?.name?.toLowerCase() === "monad";
      const isFromMonad = tx.sourceChain?.name?.toLowerCase() === "monad";
      if (!isToMonad && !isFromMonad) continue;

      const otherChain = isToMonad
        ? tx.sourceChain?.name ?? "Unknown"
        : tx.destinationChain?.name ?? "Unknown";
      const vol = parseFloat(tx.usdAmount ?? "0");
      totalVolume += vol;

      const existing = chainMap.get(otherChain);
      if (existing) {
        existing.volume += vol;
        existing.txCount += 1;
      } else {
        chainMap.set(otherChain, { volume: vol, txCount: 1 });
      }
    }

    const byChain = Array.from(chainMap.entries())
      .map(([name, data]) => ({
        sourceChain: name,
        volume: data.volume,
        txCount: data.txCount,
      }))
      .sort((a, b) => b.volume - a.volume);

    return { totalVolume, byChain };
  } catch {
    return null;
  }
}
