import { NextRequest, NextResponse } from "next/server";
import { getPriceChart } from "@/lib/coingecko";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") ?? "7", 10);
  const validDays = [1, 7, 30, 365].includes(days) ? days : 7;

  const chart = await getPriceChart(validDays);
  return NextResponse.json(chart, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
    },
  });
}
