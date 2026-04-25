import { NextResponse } from "next/server";
import { getTickerData } from "@/lib/data";

export const revalidate = 30;

export async function GET() {
  const ticker = await getTickerData({ includeOpenInterest: false });

  return NextResponse.json(
    {
      timestamp: new Date().toISOString(),
      ticker,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    }
  );
}
