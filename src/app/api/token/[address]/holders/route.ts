import type { NextRequest } from "next/server";
import { getTraderByToken } from "@/lib/market";
import { sampleHolders } from "@/lib/seed";

type Ctx = { params: Promise<{ address: string }> };

/**
 * The shareholder table.
 *
 * The bonding curve is always the first row and always holds the unsold
 * float — that is not a whale, it is the market maker, and labelling it as
 * one is the difference between a readable table and a scare.
 *
 * A live token needs a balance index; an RPC cannot enumerate holders, so the
 * route says that plainly instead of returning an empty list that would read
 * as "nobody holds this".
 */
export async function GET(request: NextRequest, ctx: Ctx) {
  const { address } = await ctx.params;
  const limit = Math.min(200, Math.max(1, Number(request.nextUrl.searchParams.get("limit")) || 50));

  const found = await getTraderByToken(address);
  if (!found) {
    return Response.json({ error: "unknown token" }, { status: 404 });
  }

  const token = found.trader.token!;
  if (token.source === "sample") {
    const holders = sampleHolders(token, limit);
    const top10 = holders.slice(0, 10).reduce((sum, h) => sum + h.supplyPct, 0);
    return Response.json(
      { holders, top10Pct: top10, count: holders.length, source: "sample" },
      { headers: { "cache-control": "public, max-age=15" } },
    );
  }

  return Response.json(
    {
      error: "no balance index configured",
      detail:
        "Set INDEXER_URL to a service that tracks Transfer events for this token; an RPC node cannot enumerate holders.",
      holders: [],
      source: "chain",
    },
    { status: 501 },
  );
}
