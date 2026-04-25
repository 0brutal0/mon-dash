import { NextResponse } from "next/server";
import { getLatestBlock, estimateTPS, getGasPrice } from "@/lib/rpc";
import { formatNumber, weiToGwei } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function GET() {
  const [block, tps, gasPrice] = await Promise.all([
    getLatestBlock(),
    estimateTPS(),
    getGasPrice(),
  ]);

  return NextResponse.json({
    blockHeight: block ? `#${formatNumber(block.blockNumber)}` : null,
    tps: tps ? formatNumber(tps) : null,
    gasPrice: gasPrice ? weiToGwei(gasPrice) + " gwei" : null,
    timestamp: Date.now(),
  });
}
