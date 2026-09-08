import "server-only";
import type {
  MarketPayload,
  MarketWindow,
  ShareToken,
  Trader,
} from "./market-types";
import { fetchFomoLeaderboard } from "./fomo";
import { rankFor, SEED_ETH_USD, seedTraders } from "./seed";
import { readShareRegistry } from "./registry";
import { readCurveState } from "./pons";

/**
 * Assembling the market.
 *
 * Two sources meet here and they are kept strictly apart: FOMO ranks the
 * traders, the chain prices their shares. Neither one is allowed to invent
 * the other — a trader with no share on chain gets `token: null` and shows a
 * "Launch" button rather than a fabricated market cap, which is exactly the
 * state most of the roster is in on any given day.
 */

const WINDOWS: MarketWindow[] = ["24h", "7d", "30d"];

export function parseWindow(value: string | null): MarketWindow {
  return WINDOWS.includes(value as MarketWindow) ? (value as MarketWindow) : "24h";
}

async function ethUsdPrice(): Promise<number> {
  const fixed = Number(process.env.ETH_USD_OVERRIDE);
  if (Number.isFinite(fixed) && fixed > 0) return fixed;
  try {
    const res = await fetch(
      "https://api.coinbase.com/v2/prices/ETH-USD/spot",
      { next: { revalidate: 120 } },
    );
    if (res.ok) {
      const json = (await res.json()) as { data?: { amount?: string } };
      const amount = Number(json.data?.amount);
      if (Number.isFinite(amount) && amount > 0) return amount;
    }
  } catch {
    // no quote available — fall through to the seed constant so the page can
    // still render, rather than showing every USD figure as a dash
  }
  return SEED_ETH_USD;
}

/**
 * Attach on-chain share data to whichever traders have a registered curve.
 * Reads are issued in parallel and a failure on one curve only blanks that
 * one share.
 */
async function attachTokens(
  traders: Trader[],
  ethUsd: number,
): Promise<Trader[]> {
  const registry = await readShareRegistry();
  if (registry.size === 0) return traders;

  const entries = traders
    .map((t, i) => ({ i, entry: registry.get(t.handle.toLowerCase()) }))
    .filter((x): x is { i: number; entry: NonNullable<typeof x.entry> } =>
      Boolean(x.entry),
    );

  const states = await Promise.all(
    entries.map(({ entry }) => readCurveState(entry, ethUsd)),
  );

  const out = [...traders];
  entries.forEach(({ i }, k) => {
    const token = states[k];
    if (token) out[i] = { ...out[i], token };
  });
  return out;
}

function metricsFor(traders: Trader[]) {
  const launched = traders.filter((t): t is Trader & { token: ShareToken } =>
    Boolean(t.token),
  );
  return {
    volume24hUsd: launched.reduce((sum, t) => sum + t.token.volume24hUsd, 0),
    fees24hUsd: launched.reduce((sum, t) => sum + t.token.fees24hUsd, 0),
    launchedCount: launched.length,
    graduatedCount: launched.filter((t) => t.token.phase === "graduated").length,
    totalTraders: traders.length,
  };
}

export async function getMarket(
  window: MarketWindow = "24h",
  limit = 200,
): Promise<MarketPayload> {
  const ethUsd = await ethUsdPrice();
  const live = await fetchFomoLeaderboard(window, Math.min(150, limit));

  if (live) {
    const traders = await attachTokens(live, ethUsd);
    return {
      traders: traders.slice(0, limit),
      ethUsd,
      metrics: metricsFor(traders),
      source: "fomo",
      window,
    };
  }

  // No key, or the upstream is down: the bundled sample roster, which carries
  // its own sample curves so the whole interface stays walkable.
  const seeded = rankFor(seedTraders(), window);
  const traders = await attachTokens(seeded, ethUsd);
  return {
    traders: traders.slice(0, limit),
    ethUsd,
    metrics: metricsFor(traders),
    source: "seed",
    window,
  };
}

export async function getTraderByToken(
  address: string,
): Promise<{ trader: Trader; ethUsd: number; source: "fomo" | "seed" } | null> {
  const market = await getMarket("24h", 200);
  const target = address.toLowerCase();
  const trader = market.traders.find(
    (t) => t.token?.address.toLowerCase() === target,
  );
  if (!trader) return null;
  return { trader, ethUsd: market.ethUsd, source: market.source };
}
