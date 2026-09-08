"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { MarketPayload, Trader } from "@/lib/market-types";
import { useWallet } from "@/components/wallet/WalletProvider";
import { Avatar } from "@/components/ui/Avatar";
import { WalletIcon } from "@/components/ui/icons";
import { CHAIN, ERC20_ABI } from "@/lib/chain";
import {
  formatPct,
  formatPrice,
  formatShares,
  formatUsd,
  shortAddress,
  toneFor,
} from "@/lib/format";

type Position = { trader: Trader; shares: number; valueUsd: number };

/**
 * The portfolio.
 *
 * Disconnected, it is a single invitation rather than a grid of empty
 * skeletons — a wall of zeroes reads as a broken page, and there is nothing
 * to show anyone who has not connected.
 *
 * Connected, positions are read straight from the token contracts with
 * `balanceOf` rather than from an index: it is one call per launched share,
 * it needs no backend, and it cannot be stale or wrong. What it cannot give
 * you is cost basis — that needs trade history — so this page shows value and
 * says nothing about entry, instead of guessing at a PnL.
 */
export function PortfolioPanel({ market }: { market: MarketPayload }) {
  const { address, openDialog, provider, chainId } = useWallet();
  const [positions, setPositions] = useState<Position[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // No setState on the disconnected path: `shown` below derives from
    // `address`, so disconnecting clears the table without this effect having
    // to write state it does not own.
    if (!address || !provider) return;
    let cancelled = false;

    (async () => {
      const launched = market.traders.filter((t) => t.token);
      if (launched.length === 0) {
        setPositions([]);
        return;
      }
      try {
        const { encodeFunctionData, decodeFunctionResult, formatEther } =
          await import("viem");
        const data = encodeFunctionData({
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [address],
        });

        const held: Position[] = [];
        for (const trader of launched) {
          const token = trader.token!;
          if (token.source === "sample") continue;
          const raw = (await provider.request({
            method: "eth_call",
            params: [{ to: token.address, data }, "latest"],
          })) as `0x${string}`;
          const [balance] = decodeFunctionResult({
            abi: ERC20_ABI,
            functionName: "balanceOf",
            data: raw,
          }) as unknown as [bigint];
          const shares = Number(formatEther(balance));
          if (shares > 0) {
            held.push({ trader, shares, valueUsd: shares * token.priceUsd });
          }
        }
        if (!cancelled) setPositions(held);
      } catch (e) {
        if (!cancelled) {
          setPositions([]);
          setError(
            e instanceof Error ? e.message : "Could not read balances from the chain.",
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [address, provider, market.traders]);

  // A stale list from a previous account must never survive a disconnect.
  const shown = address ? positions : null;

  if (!address) {
    return (
      <section className="shadow-panel relative overflow-hidden rounded-2xl border border-white/85 bg-white/85 backdrop-blur-md">
        <div className="grid items-center gap-6 p-6 md:p-8 desk:grid-cols-[minmax(0,1fr)_420px] desk:p-10">
          <div>
            <p className="text-muted text-[11px] font-bold tracking-[0.16em] uppercase">
              Portfolio
            </p>
            <h2 className="font-display text-ink mt-2 text-[34px] leading-[1.05] font-black tracking-[-0.035em] md:text-[42px]">
              Your next move
              <br />
              starts here.
            </h2>
            <p className="text-secondary mt-3 max-w-[420px] text-[15px] leading-6">
              Connect your wallet to view your KOL shares, track your PnL, and
              revisit every trade.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-6">
              <button
                type="button"
                onClick={openDialog}
                className="btn-primary inline-flex h-12 items-center gap-2.5 rounded-full px-6 text-[16px] font-semibold"
              >
                <WalletIcon size={18} />
                Connect wallet
              </button>
              <Link
                href="/"
                className="text-ink-soft decoration-blue text-[15px] font-medium underline decoration-[1.5px] underline-offset-[5px] hover:text-blue-text"
              >
                Explore KOLs →
              </Link>
            </div>
          </div>
          <WalletVignette />
        </div>
      </section>
    );
  }

  return (
    <section className="shadow-panel overflow-hidden rounded-2xl border border-white/85 bg-white/85 backdrop-blur-md">
      <div className="border-hairline flex flex-wrap items-center justify-between gap-3 border-b p-4">
        <div>
          <p className="text-muted text-[11px] font-bold tracking-[0.16em] uppercase">
            Connected
          </p>
          <p className="tnum text-ink text-[15px] font-bold">
            {shortAddress(address, 8)}
          </p>
        </div>
        {chainId != null && chainId !== CHAIN.id && (
          <p className="text-warning text-[12px] font-semibold">
            Wrong network — switch to {CHAIN.name} to trade.
          </p>
        )}
      </div>

      {shown === null ? (
        <p className="text-secondary p-8 text-center text-[14px]">
          Reading your balances…
        </p>
      ) : shown.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-ink text-[16px] font-bold">No KOL shares yet</p>
          <p className="text-secondary mt-1.5 text-[13.5px] leading-5">
            {error ??
              "Nothing in this wallet holds a share on this market. Back a trader and it will show up here."}
          </p>
          <Link
            href="/"
            className="btn-primary mt-4 inline-flex h-10 items-center rounded-full px-5 text-sm font-semibold"
          >
            Explore KOLs
          </Link>
        </div>
      ) : (
        <table className="w-full border-separate border-spacing-0 text-left">
          <thead>
            <tr className="text-muted border-hairline border-b text-[11px] font-semibold tracking-[0.04em] uppercase">
              <th scope="col" className="py-2.5 pr-3 pl-4">KOL</th>
              <th scope="col" className="py-2.5 pr-3 text-right">Shares</th>
              <th scope="col" className="py-2.5 pr-3 text-right">Price</th>
              <th scope="col" className="py-2.5 pr-3 text-right">24h</th>
              <th scope="col" className="py-2.5 pr-4 text-right">Value</th>
            </tr>
          </thead>
          <tbody>
            {shown.map(({ trader, shares, valueUsd }) => (
              <tr key={trader.id} className="border-hairline hover:bg-pearl border-b last:border-b-0">
                <td className="py-3 pr-3 pl-4">
                  <Link
                    href={`/token/${trader.token!.address}`}
                    className="flex items-center gap-3"
                  >
                    <Avatar
                      src={trader.profilePictureLink}
                      name={trader.name}
                      size={32}
                      className="border-2 border-white"
                      sizes="64px"
                    />
                    <span className="min-w-0">
                      <span className="text-ink block truncate text-[14px] font-bold">
                        {trader.name}
                      </span>
                      <span className="text-muted block truncate text-[12px]">
                        ${trader.token!.symbol}
                      </span>
                    </span>
                  </Link>
                </td>
                <td className="tnum text-ink py-3 pr-3 text-right text-[13px] font-semibold">
                  {formatShares(shares)}
                </td>
                <td className="tnum text-secondary py-3 pr-3 text-right text-[13px]">
                  {formatPrice(trader.token!.priceUsd)}
                </td>
                <td
                  className={`tnum py-3 pr-3 text-right text-[13px] font-semibold ${
                    trader.token!.change24hPct != null
                      ? toneFor(trader.token!.change24hPct)
                      : "text-muted"
                  }`}
                >
                  {trader.token!.change24hPct != null
                    ? formatPct(trader.token!.change24hPct)
                    : "—"}
                </td>
                <td className="tnum text-ink py-3 pr-4 text-right text-[14px] font-bold">
                  {formatUsd(valueUsd)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

/**
 * The empty-state illustration: a glass card among bubbles, drawn rather than
 * shipped as a PNG so it stays sharp and recolours with the palette.
 */
function WalletVignette() {
  return (
    <div aria-hidden="true" className="relative hidden h-[240px] desk:block [perspective:900px]">
      <span className="glass-orb absolute" style={{ left: 96, top: 6, width: 58, height: 58 }} />
      <span className="glass-orb absolute" style={{ left: 178, top: 30, width: 88, height: 88 }} />
      <span className="glass-orb absolute" style={{ left: 288, top: 12, width: 44, height: 44 }} />
      <span className="glass-orb absolute" style={{ left: 62, top: 88, width: 22, height: 22 }} />
      <span className="glass-orb absolute" style={{ left: 336, top: 92, width: 30, height: 30 }} />
      <div
        className="absolute rounded-[26px] border border-white/70"
        style={{
          left: 74,
          top: 104,
          width: 296,
          height: 126,
          transform: "rotateX(14deg) rotateY(-16deg) rotateZ(-4deg)",
          transformStyle: "preserve-3d",
          background:
            "linear-gradient(150deg, rgba(146,196,255,0.92) 0%, rgba(56,136,250,0.82) 46%, rgba(126,190,255,0.7) 100%)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -2px 8px rgba(0,60,160,0.25), 0 22px 38px rgba(28,101,201,0.3)",
        }}
      >
        <span
          className="absolute rounded-full border-2 border-white/75"
          style={{ right: 28, bottom: 24, width: 52, height: 34 }}
        />
        <span
          className="absolute rounded-full bg-white/85"
          style={{ right: 45, bottom: 33, width: 14, height: 14 }}
        />
        <span
          className="absolute rounded-[26px]"
          style={{
            inset: 1,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0) 52%)",
          }}
        />
      </div>
    </div>
  );
}
