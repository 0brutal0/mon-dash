import { NextResponse } from "next/server";
import { getMonadNewsFeed, getNewsFeed } from "@/lib/data";

export const revalidate = 900;

export async function GET() {
  const [general, monad] = await Promise.all([
    getNewsFeed(),
    getMonadNewsFeed(),
  ]);

  return NextResponse.json(
    {
      timestamp: new Date().toISOString(),
      general,
      monad,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
      },
    }
  );
}
