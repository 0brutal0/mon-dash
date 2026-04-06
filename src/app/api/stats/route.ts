import { NextResponse } from "next/server";
import {
  getTickerData,
  getSupplyData,
  getNetworkData,
  getTVLData,
  getFeesRevenue,
  getStablecoinData,
  getValidatorsData,
  getTxActivityData,
  getBridgeFlowsData,
  getEconomyData,
} from "@/lib/data";

export const revalidate = 300; // cache for 5 minutes

export async function GET() {
  const [
    ticker,
    supply,
    network,
    tvl,
    fees,
    stablecoins,
    validators,
    txActivity,
    bridgeFlows,
    economy,
  ] = await Promise.all([
    getTickerData(),
    getSupplyData(),
    getNetworkData(),
    getTVLData(),
    getFeesRevenue(),
    getStablecoinData(),
    getValidatorsData(),
    getTxActivityData(),
    getBridgeFlowsData(),
    getEconomyData(),
  ]);

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    ticker,
    supply,
    network,
    tvl: {
      total: tvl.total,
      byCategory: tvl.byCategory,
      protocolCount: tvl.protocols.length,
      topProtocols: tvl.protocols.slice(0, 10).map((p) => ({
        name: p.name,
        category: p.category,
        tvl: p.tvl,
        pct: p.pct,
      })),
    },
    fees,
    stablecoins: {
      total: stablecoins.total,
      assets: stablecoins.assets,
    },
    validators: {
      count: validators.validators.length,
      meta: validators.meta,
      top10: validators.validators.slice(0, 10).map((v) => ({
        rank: v.rank,
        name: v.name,
        stake: v.stake,
        comm: v.comm,
      })),
    },
    txActivity,
    bridgeFlows,
    economy,
  });
}
