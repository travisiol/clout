import type { NextRequest } from "next/server";
import { getMarket, parseWindow } from "@/lib/market";

/**
 * The whole market in one response: every ranked trader, whichever of them
 * have a share on chain, and the three headline metrics. The client polls
 * this rather than opening a socket — the leaderboard settles by the minute,
 * and one cached document is cheaper than a stream nobody watches.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const limit = Math.min(200, Math.max(1, Number(params.get("limit")) || 200));
  const window = parseWindow(params.get("window"));

  try {
    const market = await getMarket(window, limit);
    return Response.json(market, {
      headers: { "cache-control": "public, max-age=15, stale-while-revalidate=45" },
    });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "market unavailable",
      },
      { status: 502 },
    );
  }
}
