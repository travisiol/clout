import type { NextRequest } from "next/server";
import { getMarket } from "@/lib/market";
import { CURVE } from "@/lib/chain";

/**
 * What a trade would get you, quoted off the curve's own reserves.
 *
 * A constant-product curve gives an exact answer, so this is arithmetic
 * rather than an estimate: `out = base * in / (quote + in)` after the fee,
 * and the price impact falls straight out of comparing the average fill to
 * the spot price. The pad shows both, because on a curve this shallow the
 * impact is frequently the largest cost of the trade.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const traderId = params.get("traderId");
  const side = params.get("side") === "sell" ? "sell" : "buy";
  const amount = Number(params.get("amount"));

  if (!traderId) {
    return Response.json({ error: "traderId is required" }, { status: 400 });
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return Response.json({ error: "amount must be positive" }, { status: 400 });
  }

  const market = await getMarket("24h", 200);
  const trader = market.traders.find((t) => t.id === traderId);
  if (!trader) {
    return Response.json({ error: "unknown trader" }, { status: 404 });
  }
  const token = trader.token;
  if (!token) {
    return Response.json(
      { error: "this trader has no share on chain yet" },
      { status: 409 },
    );
  }

  // Reconstruct the reserves the curve is holding from its spot price and
  // raise: virtual quote plus what was raised, over the base still on sale.
  const VIRTUAL_QUOTE = 1.68;
  const quoteReserve = VIRTUAL_QUOTE + token.raisedEth;
  const baseReserve = quoteReserve / token.priceEth;
  const feeRate = token.feeBps / 10_000;

  let sharesOut = 0;
  let ethOut = 0;
  let averagePrice = 0;

  if (side === "buy") {
    const net = amount * (1 - feeRate);
    sharesOut = (baseReserve * net) / (quoteReserve + net);
    averagePrice = sharesOut > 0 ? (amount * market.ethUsd) / sharesOut : 0;
  } else {
    const gross = (quoteReserve * amount) / (baseReserve + amount);
    ethOut = gross * (1 - feeRate);
    averagePrice = amount > 0 ? (ethOut * market.ethUsd) / amount : 0;
  }

  const spotUsd = token.priceUsd;
  const impactPct = spotUsd > 0 ? ((averagePrice - spotUsd) / spotUsd) * 100 : 0;

  return Response.json(
    {
      side,
      token: token.address,
      symbol: token.symbol,
      spotPriceUsd: spotUsd,
      averagePriceUsd: averagePrice,
      impactPct,
      feeBps: token.feeBps,
      protocolFeeShareBps: CURVE.protocolFeeShareBps,
      ethUsd: market.ethUsd,
      ...(side === "buy"
        ? { amountInEth: amount, sharesOut }
        : { sharesIn: amount, ethOut }),
      source: token.source,
    },
    { headers: { "cache-control": "no-store" } },
  );
}
