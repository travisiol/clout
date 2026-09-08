import { getTraderByToken } from "@/lib/market";
import { sampleCandles } from "@/lib/seed";

type Ctx = { params: Promise<{ address: string }> };

/**
 * Price history for one share.
 *
 * A sample share gets a curve-priced walk generated from its own address, so
 * the chart is stable across reloads. A real one needs an indexer over the
 * curve's Buy/Sell events — until `INDEXER_URL` is wired the route says so
 * with a 501 rather than drawing a flat line that would read as "no trades".
 */
export async function GET(_request: Request, ctx: Ctx) {
  const { address } = await ctx.params;
  const found = await getTraderByToken(address);
  if (!found) {
    return Response.json({ error: "unknown token" }, { status: 404 });
  }

  const token = found.trader.token!;
  if (token.source === "sample") {
    return Response.json(
      { candles: sampleCandles(token), source: "sample" },
      { headers: { "cache-control": "public, max-age=10" } },
    );
  }

  return Response.json(
    {
      error: "no indexer configured",
      detail:
        "Set INDEXER_URL to a service that reads CurveBuy/CurveSell events from the pons curve; candles cannot be derived from a point-in-time RPC read.",
      candles: [],
      source: "chain",
    },
    { status: 501 },
  );
}
