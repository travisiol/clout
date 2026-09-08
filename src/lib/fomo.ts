import type { MarketWindow, TopHolding, Trader } from "./market-types";

/**
 * The upstream leaderboard.
 *
 * PnL, followers, trade counts and holdings all come from FOMO — this site
 * does not compute a track record, it reads one, which is the only honest way
 * to rank strangers by performance. Every data endpoint there needs a key
 * (`authorization: Bearer …`), so with no key configured this module reports
 * that plainly and the caller falls back to the sample roster rather than
 * inventing numbers that look real.
 */

const BASE = process.env.FOMO_API_BASE ?? "https://api.fomoapi.io";

export function fomoConfigured(): boolean {
  return Boolean(process.env.FOMO_API_KEY);
}

type FomoTrader = {
  rank?: number;
  handle?: string;
  displayName?: string;
  name?: string;
  bio?: string | null;
  avatar?: string | null;
  profilePictureLink?: string | null;
  pnlUsd?: number;
  pnl?: number;
  volumeUsd?: number;
  trades?: number;
  followers?: number;
  following?: number;
  holdings?: number;
  verified?: boolean;
  clan?: { name?: string; icon?: string | null } | null;
  wallets?: { evm?: string | null; solana?: string | null };
  topTokens?: {
    address?: string;
    tokenAddress?: string;
    imageUrl?: string | null;
    image?: string | null;
    networkId?: number;
    amount?: number;
    humanAmount?: number;
    price?: number;
    value?: number;
    valueUsd?: number;
    pnl?: number;
    pnlUsd?: number;
  }[];
};

type FomoLeaderboard = {
  window?: string;
  source?: string;
  capturedAt?: string;
  count?: number;
  traders?: FomoTrader[];
};

function mapHolding(raw: NonNullable<FomoTrader["topTokens"]>[number]): TopHolding {
  return {
    tokenAddress: raw.tokenAddress ?? raw.address ?? "",
    imageUrl: raw.imageUrl ?? raw.image ?? null,
    networkId: raw.networkId ?? 0,
    humanAmount: raw.humanAmount ?? raw.amount ?? 0,
    price: raw.price ?? 0,
    value: raw.value ?? raw.valueUsd ?? 0,
    pnl: raw.pnl ?? raw.pnlUsd ?? 0,
  };
}

/**
 * Fetch and normalise one window of the leaderboard. Returns null — never a
 * half-built list — if the key is missing or the upstream refuses, so the
 * caller can decide between falling back and surfacing the failure.
 */
export async function fetchFomoLeaderboard(
  window: MarketWindow,
  limit = 150,
): Promise<Trader[] | null> {
  const key = process.env.FOMO_API_KEY;
  if (!key) return null;

  let payload: FomoLeaderboard;
  try {
    const res = await fetch(
      `${BASE}/v2/leaderboard/${window}?limit=${Math.min(150, limit)}`,
      {
        headers: { authorization: `Bearer ${key}` },
        // The leaderboard moves continuously; a minute of cache keeps the
        // credit bucket alive without the page ever showing a stale rank.
        next: { revalidate: 60 },
      },
    );
    if (!res.ok) return null;
    payload = (await res.json()) as FomoLeaderboard;
  } catch {
    return null;
  }

  const rows = payload.traders;
  if (!Array.isArray(rows) || rows.length === 0) return null;

  return rows.map((raw, i) => {
    const handle = raw.handle ?? `trader${i + 1}`;
    return {
      id: `fomo-${handle}`,
      rank: raw.rank ?? i + 1,
      name: raw.displayName ?? raw.name ?? handle,
      handle,
      profilePictureLink: raw.profilePictureLink ?? raw.avatar ?? null,
      evmAddress: raw.wallets?.evm ?? null,
      pnl24h: raw.pnlUsd ?? raw.pnl ?? 0,
      followers: raw.followers ?? 0,
      numTrades: raw.trades ?? 0,
      totalVolume: raw.volumeUsd ?? 0,
      clan: raw.clan?.name
        ? { name: raw.clan.name, icon: raw.clan.icon ?? null }
        : null,
      bio: raw.bio ?? null,
      following: raw.following ?? 0,
      verified: Boolean(raw.verified),
      twitter: handle,
      coverPhotoLink: null,
      totalHoldings: raw.holdings ?? raw.topTokens?.length ?? 0,
      topHoldings: (raw.topTokens ?? []).slice(0, 3).map(mapHolding),
      token: null,
    } satisfies Trader;
  });
}
