import type {
  Candle,
  Holder,
  MarketWindow,
  ShareToken,
  Trade,
  Trader,
} from "./market-types";

/**
 * The sample roster.
 *
 * Every handle here is invented. That is deliberate: a demo that lists real
 * traders' names and PnL implies those traders are involved with this market,
 * and none of them are. The moment FOMO_API_KEY is set the real leaderboard
 * replaces all of it, and `/api/market` reports `source: "fomo"` so the UI can
 * drop the "sample roster" chip.
 *
 * Everything below is derived from a seeded PRNG rather than hand-typed, so
 * the numbers move the way a leaderboard does — a long tail of small PnL under
 * a handful of very large ones — and stay identical between the server render
 * and the client.
 */

const NAMES = [
  "Vaultkeeper", "Nine Lives", "sunset liquidity", "COLD OPEN", "Marrow",
  "paperhandsanon", "Tessellate", "Bright Angle", "Quiet Alpha", "hexpigeon",
  "Ferrous", "Lantern", "MOONWATER", "delta neutral dad", "Saltbox",
  "Curio", "Thin Ice", "verdigris", "Nightjar", "SIGNAL FIRE",
  "Kestrel", "long only larry", "Obsidian Kid", "Fathom", "wickhunter",
  "Pale Horse", "Tinder Box", "gm capital", "Ravel", "COPPER TAPE",
  "Slate", "milk money", "Hollowpoint", "Bellwether", "vespertine",
  "Grain", "Undertow", "PYRITE", "the exit liquidity", "Cinder",
  "Halyard", "roundtrip rick", "Gossamer", "Ash Wednesday", "keelhaul",
  "Marginal", "Tallow", "BLUE HOUR", "candle merchant", "Rook",
  "Vellum", "seven fifty", "Ironwood", "Palisade", "downonly dan",
  "Cormorant", "Static", "TITHE", "riverbend", "Fen",
  "Auger", "sell the news", "Basalt", "Wren", "OVERHANG",
  "Tundra", "prints only", "Chandler", "Loam", "Sable",
  "Mercer", "top blast", "Pumice", "Wick", "SEDIMENT",
  "Tally", "green candle guy", "Ferrule", "Ossuary", "quiet size",
  "Bramble", "Lodestar", "GALLOWS", "the third leg", "Anvil",
  "Kelp", "size on size", "Cairn", "Tidewater", "MOTH",
  "Fettle", "orderflow orphan", "Skiff", "Bristle", "Cove",
  "Umber", "no stops nate", "Gantry", "Ledger", "PLUMB",
  "Trellis", "sweep the book", "Nimbus", "Foxglove", "Ambergris",
  "Quarry", "one more entry", "Harrow", "Vantage", "STILT",
  "Peat", "flat by friday", "Wexler", "Balustrade", "Culvert",
  "Sixth Man", "size adjusted", "Thimble", "Mordant", "GRIST",
  "Pinion", "the whole float", "Cask", "Verge", "Alluvium",
  "Spindle", "back in size", "Latch", "Threnody", "OXBOW",
  "Furlong", "range bound rob", "Kiln", "Salvo", "Weir",
  "Tempest", "bid the offer", "Cassowary", "Ferrier", "SCRIP",
  "Brine", "always chopping", "Meridian", "Copse", "Yardarm",
  "Groyne", "last one in", "Fescue", "Bellows", "TERMINUS",
];

const CLANS = [
  "Nightshift", "Blue Hour Group", "The Ledger Club", "Salt & Iron",
  "Terminal Velocity", "Quiet Size", "Fathom House", null, null, null,
];

const BIOS = [
  "buying the thing that already went up",
  "risk is a rumour",
  "if it prints it prints",
  "small size, long horizon",
  "onchain since it was embarrassing",
  "I only trade what I can explain in one sentence",
  "the chart is the thesis",
  "flat is a position",
  "no calls, no groups, no telegram",
  "up only until it isn't",
  null,
  null,
];

/** xorshift32 — deterministic, and identical on server and client. */
function rng(seed: number) {
  let s = seed | 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 1_000_000) / 1_000_000;
  };
}

export function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function handleFor(name: string, index: number): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  return base.length >= 4 ? base.slice(0, 14) : `${base}${index}`;
}

/** A 20-byte address that reads as a sample at a glance. */
function sampleAddress(prefix: string, seed: number): string {
  const r = rng(seed);
  let hex = "";
  for (let i = 0; i < 40 - prefix.length; i++) {
    hex += Math.floor(r() * 16).toString(16);
  }
  return `0x${prefix}${hex}`;
}

/** How many of the roster have a share on the curve. */
const LAUNCHED = 9;
export const SEED_ETH_USD = 2489.68;

function sampleToken(trader: { handle: string }): ShareToken {
  const seed = hashString(trader.handle);
  const r = rng(seed);
  const raisedEth = 0.08 + r() * 1.6;
  const graduation = 4.2;
  // The curve carries 1.68 ETH of virtual quote reserve, so price is not the
  // raise divided by supply — it comes off the reserves the way the curve
  // prices it.
  const virtual = 1.68;
  const supply = 1e9;
  const baseReserve = supply * (virtual / (virtual + raisedEth));
  const priceEth = (virtual + raisedEth) / baseReserve;
  const priceUsd = priceEth * SEED_ETH_USD;
  const change = (r() - 0.32) * 60;

  return {
    address: sampleAddress("5eed", seed),
    symbol: trader.handle.slice(0, 8).toUpperCase(),
    curve: sampleAddress("c0de", seed ^ 0x9e37),
    phase: "curve",
    priceEth,
    priceUsd,
    change24hPct: Number(change.toFixed(2)),
    volume24hUsd: 400 + r() * 15_000,
    fees24hUsd: 2 + r() * 120,
    holdersCount: 6 + Math.floor(r() * 60),
    marketCapUsd: priceUsd * supply,
    raisedEth,
    graduationThresholdEth: graduation,
    progressPct: (raisedEth / graduation) * 100,
    feeBps: 100,
    creatorTaxBps: 0,
    launchTx: sampleAddress("7a17", seed ^ 0x51ed) + sampleAddress("", seed).slice(2, 26),
    launchedAt: new Date(Date.now() - (1 + r() * 40) * 3_600_000).toISOString(),
    source: "sample",
  };
}

let cached: Trader[] | null = null;

export function seedTraders(): Trader[] {
  if (cached) return cached;

  const traders = NAMES.map((name, index) => {
    const handle = handleFor(name, index);
    const seed = hashString(handle);
    const r = rng(seed);

    // A leaderboard is a power law: a handful of very large days over a long
    // tail. Squaring a uniform draw and scaling by rank gets that curve.
    const decay = Math.pow(1 - index / (NAMES.length + 12), 5.2);
    const pnl24h = Math.round(5_400_000 * decay * (0.55 + r() * 0.75));

    const clan = CLANS[Math.floor(r() * CLANS.length)];
    const bio = BIOS[Math.floor(r() * BIOS.length)];
    const holdingsCount = 3 + Math.floor(r() * 190);

    const topHoldings = Array.from({ length: 3 }, (_, k) => {
      const value = (pnl24h || 20_000) * (0.9 - k * 0.28) * (0.4 + r());
      return {
        tokenAddress: sampleAddress("70ce", seed ^ (k + 1)),
        imageUrl: null,
        networkId: 4663,
        humanAmount: value / (0.02 + r()),
        price: 0.02 + r(),
        value,
        pnl: value * (0.3 + r() * 0.7),
      };
    });

    return {
      id: `seed-${handle}`,
      rank: index + 1,
      name,
      handle,
      profilePictureLink: null,
      evmAddress: sampleAddress("a11ce", seed ^ 0x1234).slice(0, 42),
      pnl24h,
      pnl7d: Math.round(pnl24h * (2.1 + r() * 2.4)),
      pnl30d: Math.round(pnl24h * (5.4 + r() * 6.2)),
      followers: Math.round(600 + Math.pow(r(), 2.4) * 540_000),
      numTrades: Math.round(60 + Math.pow(r(), 1.8) * 3_100),
      totalVolume: Math.round(120_000 + Math.pow(r(), 2) * 9_800_000),
      clan: clan ? { name: clan, icon: null } : null,
      bio,
      following: Math.round(r() * 400),
      verified: r() > 0.86,
      twitter: null,
      coverPhotoLink: null,
      totalHoldings: holdingsCount,
      topHoldings,
      token: index < LAUNCHED ? sampleToken({ handle }) : null,
    } satisfies Trader;
  });

  cached = traders;
  return traders;
}

export function seedTraderByToken(address: string): Trader | null {
  const target = address.toLowerCase();
  return (
    seedTraders().find((t) => t.token?.address.toLowerCase() === target) ?? null
  );
}

/** Rank the roster for a window; the roster's own order is the 24h ranking. */
export function rankFor(traders: Trader[], window: MarketWindow): Trader[] {
  const key = window === "7d" ? "pnl7d" : window === "30d" ? "pnl30d" : "pnl24h";
  return [...traders]
    .sort((a, b) => (b[key] ?? b.pnl24h) - (a[key] ?? a.pnl24h))
    .map((t, i) => ({ ...t, rank: i + 1 }));
}

/* ------------------------------------------------------------------ *
 * Sample market history
 *
 * A curve's price is a function of how much quote is in it, so the candles
 * are generated as a walk in *reserves* and priced off the curve rather than
 * as a random walk in price. That is why the sample charts still look like a
 * bonding curve — steep early, flatter as the reserve grows — instead of a
 * generic squiggle.
 * ------------------------------------------------------------------ */

export function sampleCandles(token: ShareToken, count = 180): Candle[] {
  const r = rng(hashString(token.address));
  const virtual = 1.68;
  const supply = 1e9;
  const priceAt = (raised: number) => {
    const base = supply * (virtual / (virtual + raised));
    return ((virtual + raised) / base) * SEED_ETH_USD;
  };

  const bucket = 60; // one minute
  const now = Math.floor(Date.now() / 1000);
  const start = now - count * bucket;

  let raised = Math.max(0.02, token.raisedEth * 0.12);
  const out: Candle[] = [];
  for (let i = 0; i < count; i++) {
    const open = priceAt(raised);
    // Net flow per bucket: mostly small, occasionally a real buy.
    const drift = (token.raisedEth - raised) / Math.max(1, count - i);
    const noise = (r() - 0.46) * token.raisedEth * 0.06;
    const burst = r() > 0.965 ? token.raisedEth * 0.09 : 0;
    raised = Math.max(0.01, raised + drift + noise + burst);
    const close = priceAt(raised);
    const wick = Math.abs(close - open) * (0.4 + r());
    out.push({
      t: start + i * bucket,
      o: open,
      h: Math.max(open, close) + wick,
      l: Math.max(1e-12, Math.min(open, close) - wick * 0.7),
      c: close,
      v: Math.round((Math.abs(close - open) / Math.max(close, 1e-12)) * 40_000 + r() * 600),
    });
  }
  return out;
}

export function sampleHolders(token: ShareToken, limit = 50): Holder[] {
  const r = rng(hashString(token.address) ^ 0x484f);
  const supply = 1e9;
  const out: Holder[] = [];

  // The curve itself always holds the unsold float, and always first.
  const curveShare = 0.42 + r() * 0.2;
  out.push({
    address: token.curve,
    shares: supply * curveShare,
    supplyPct: curveShare * 100,
    pnlUsd: null,
    avgEntry: null,
    tags: ["Bonding curve"],
  });

  let remaining = 1 - curveShare;
  const count = Math.min(limit - 1, token.holdersCount);
  for (let i = 0; i < count; i++) {
    const take = remaining * (i === count - 1 ? 1 : 0.08 + r() * 0.22);
    remaining -= take;
    const entry = token.priceUsd * (0.3 + r() * 1.8);
    const tags: Holder["tags"] = [];
    if (r() > 0.7) tags.push("freshTrader30d");
    if (r() > 0.82) tags.push("Bundler");
    if (r() > 0.9) tags.push("Insider");
    if (i === 1 && r() > 0.5) tags.push("Dev");
    out.push({
      address: sampleAddress("", hashString(token.address) ^ (i + 7)),
      shares: supply * take,
      supplyPct: take * 100,
      pnlUsd: supply * take * (token.priceUsd - entry),
      avgEntry: entry,
      tags,
    });
  }
  return out;
}

export function sampleTrades(token: ShareToken, limit = 50): Trade[] {
  const r = rng(hashString(token.address) ^ 0x7472);
  const now = Date.now();
  return Array.from({ length: limit }, (_, i) => {
    const side = r() > 0.38 ? "buy" : "sell";
    const quoteEth = 0.002 + Math.pow(r(), 2.2) * 0.4;
    const usd = quoteEth * SEED_ETH_USD;
    const price = token.priceUsd * (0.86 + r() * 0.3);
    return {
      hash: sampleAddress("", hashString(token.address) ^ (i + 101)),
      side,
      address: sampleAddress("", hashString(token.address) ^ (i + 1_009)),
      shares: usd / price,
      quoteEth,
      usd,
      priceUsd: price,
      at: new Date(now - i * (40_000 + r() * 900_000)).toISOString(),
    } satisfies Trade;
  });
}
