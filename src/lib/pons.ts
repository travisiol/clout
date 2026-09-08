import "server-only";
import { createPublicClient, formatEther, http, type PublicClient } from "viem";
import { CHAIN, CURVE, CURVE_ABI, ERC20_ABI } from "./chain";
import type { ShareToken } from "./market-types";
import type { ShareEntry } from "./registry";

/**
 * Reading a share off its bonding curve.
 *
 * The curve carries a virtual quote reserve (1.68 ETH) on top of whatever has
 * actually been raised, so the spot price is `quoteReserve / baseReserve` from
 * `getReserves()` — not the raise divided by the supply. Getting that wrong
 * prices every share several times too high, and the error is invisible
 * because the number still looks plausible.
 *
 * Fees are reported as what has accrued *on the curve*: pons sweeps them to
 * the escrow on its own schedule, so "paid out" and "accrued" are different
 * numbers and this file only claims the one it can see.
 */

let client: PublicClient | null = null;

function rpc(): PublicClient {
  if (!client) {
    client = createPublicClient({
      chain: {
        id: CHAIN.id,
        name: CHAIN.name,
        nativeCurrency: CHAIN.nativeCurrency,
        rpcUrls: { default: { http: [CHAIN.rpcUrl] } },
      },
      transport: http(CHAIN.rpcUrl, { timeout: 8_000 }),
    }) as PublicClient;
  }
  return client;
}

export async function readCurveState(
  entry: ShareEntry,
  ethUsd: number,
): Promise<ShareToken | null> {
  try {
    const c = rpc();
    const [reserves, realQuote, graduated, feeBalance, symbol, supply] =
      await Promise.all([
        c.readContract({
          address: entry.curve,
          abi: CURVE_ABI,
          functionName: "getReserves",
        }),
        c.readContract({
          address: entry.curve,
          abi: CURVE_ABI,
          functionName: "realQuoteReserve",
        }),
        c.readContract({
          address: entry.curve,
          abi: CURVE_ABI,
          functionName: "graduated",
        }),
        c.readContract({
          address: entry.curve,
          abi: CURVE_ABI,
          functionName: "quoteFeeBalance",
        }),
        c
          .readContract({
            address: entry.token,
            abi: ERC20_ABI,
            functionName: "symbol",
          })
          .catch(() => entry.symbol ?? entry.handle.slice(0, 8).toUpperCase()),
        c.readContract({
          address: entry.token,
          abi: ERC20_ABI,
          functionName: "totalSupply",
        }),
      ]);

    const [quoteReserve, baseReserve] = reserves as readonly [bigint, bigint];
    if (baseReserve === 0n) return null;

    const priceEth =
      Number(formatEther(quoteReserve)) / Number(formatEther(baseReserve));
    const priceUsd = priceEth * ethUsd;
    const raisedEth = Number(formatEther(realQuote as bigint));
    const supplyHuman = Number(formatEther(supply as bigint));

    return {
      address: entry.token,
      symbol: symbol as string,
      curve: entry.curve,
      phase: (graduated as boolean) ? "graduated" : "curve",
      priceEth,
      priceUsd,
      // 24h series needs an indexer; until one is wired the card shows a dash
      // rather than a zero, which would read as "flat" instead of "unknown".
      change24hPct: null,
      volume24hUsd: 0,
      fees24hUsd: Number(formatEther(feeBalance as bigint)) * ethUsd,
      holdersCount: 0,
      marketCapUsd: priceUsd * supplyHuman,
      raisedEth,
      graduationThresholdEth: CURVE.graduationThresholdEth,
      progressPct: Math.min(
        100,
        (raisedEth / CURVE.graduationThresholdEth) * 100,
      ),
      feeBps: CURVE.feeBps,
      creatorTaxBps: 0,
      launchTx: entry.launchTx ?? null,
      launchedAt: entry.launchedAt ?? null,
      source: "chain",
    };
  } catch {
    // RPC unreachable or the address is not a curve: leave the share unpriced
    return null;
  }
}
