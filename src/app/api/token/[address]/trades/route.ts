import type { NextRequest } from "next/server";
import { getTraderByToken } from "@/lib/market";
import { sampleTrades } from "@/lib/seed";

type Ctx = { params: Promise<{ address: string }> };

/** Recent fills on one share's curve, newest first. */
export async function GET(request: NextRequest, ctx: Ctx) {
  const { address } = await ctx.params;
  const limit = Math.min(200, Math.max(1, Number(request.nextUrl.searchParams.get("limit")) || 50));

  const found = await getTraderByToken(address);
  if (!found) {
    return Response.json({ error: "unknown token" }, { status: 404 });
  }

  const token = found.trader.token!;
  if (token.source === "sample") {
    const trades = sampleTrades(token, limit);
    return Response.json(
      {
        trades,
        buys: trades.filter((t) => t.side === "buy").length,
        sells: trades.filter((t) => t.side === "sell").length,
        source: "sample",
      },
      { headers: { "cache-control": "public, max-age=10" } },
    );
  }

  return Response.json(
    {
      error: "no indexer configured",
      detail:
        "Set INDEXER_URL to a service that reads CurveBuy/CurveSell events from the pons curve.",
      trades: [],
      source: "chain",
    },
    { status: 501 },
  );
}
