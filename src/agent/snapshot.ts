import { readFileSync, writeFileSync, existsSync } from "fs";
import type { DashSnapshot } from "./types";

export function loadSnapshot(path: string): DashSnapshot | null {
  try {
    if (!existsSync(path)) return null;
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch {
    return null;
  }
}

export function saveSnapshot(path: string, snapshot: DashSnapshot): void {
  writeFileSync(path, JSON.stringify(snapshot, null, 2));
}

export async function fetchSnapshot(apiBaseUrl: string): Promise<DashSnapshot> {
  const res = await fetch(`${apiBaseUrl}/api/stats`);
  if (!res.ok) throw new Error(`API returned ${res.status}`);
  const data = await res.json();

  return {
    timestamp: data.timestamp,
    price: parseFloat(data.ticker.price) || 0,
    change24h: data.ticker.change24h ?? 0,
    marketCap: data.ticker.marketCap ?? "",
    tvl: data.tvl.total,
    tvlByCategory: data.tvl.byCategory,
    topProtocols: data.tvl.topProtocols,
    stablecoinTotal: data.stablecoins.total,
    stablecoinAssets: data.stablecoins.assets,
    validatorCount: data.validators.count,
    nakamotoCoefficient: data.validators.meta.nakamotoCoefficient,
    dailyTx: data.txActivity.dailyTx,
    activeAddrsDaily: data.txActivity.activeAddrsDaily,
    bridgeNetFlow: data.bridgeFlows.netFlow7d,
    bridgeDirection: data.bridgeFlows.netFlowDirection,
  };
}
