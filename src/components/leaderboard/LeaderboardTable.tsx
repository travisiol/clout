"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { MarketPayload, MarketWindow, Trader } from "@/lib/market-types";
import { Avatar } from "@/components/ui/Avatar";
import { SearchIcon } from "@/components/ui/icons";
import {
  formatCount,
  formatPct,
  formatSignedUsd,
  formatUsd,
  toneFor,
} from "@/lib/format";

const WINDOWS: MarketWindow[] = ["24h", "7d", "30d"];
const PAGE_SIZE = 8;

/**
 * The full board.
 *
 * Where the market page sells a trader, this one audits them: nine columns of
 * the same width for everyone, no cards, no colour except on the numbers that
 * are signed. "Launched" is a filter rather than a separate page because the
 * question it answers — who can I actually trade right now — is a subset of
 * the ranking, not a different ranking.
 */
export function LeaderboardTable({ initial }: { initial: MarketPayload }) {
  const [market, setMarket] = useState(initial);
  const [window_, setWindow] = useState<MarketWindow>(initial.window);
  const [launchedOnly, setLaunchedOnly] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    if (window_ === initial.window) return;
    (async () => {
      try {
        const res = await fetch(`/api/market?limit=200&window=${window_}`);
        if (!res.ok) return;
        const next = (await res.json()) as MarketPayload;
        if (!cancelled) setMarket(next);
      } catch {
        // keep the last good board
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [window_, initial.window]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list: Trader[] = market.traders;
    if (launchedOnly) list = list.filter((t) => t.token);
    if (q) {
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) || t.handle.toLowerCase().includes(q),
      );
    }
    return list;
  }, [market.traders, launchedOnly, query]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const slice = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <section className="shadow-panel mt-6 rounded-2xl border border-white/85 bg-white/80 backdrop-blur-md">
      <div className="border-hairline flex flex-wrap items-center gap-3 border-b p-4">
        <div role="group" aria-label="Filter" className="flex items-center gap-2">
          <button
            type="button"
            aria-pressed={!launchedOnly}
            onClick={() => {
              setLaunchedOnly(false);
              setPage(1);
            }}
            className={`inline-flex h-[34px] items-center rounded-full px-4 text-[13px] font-semibold ${
              !launchedOnly ? "btn-primary" : "btn-glass text-secondary"
            }`}
          >
            All KOLs
          </button>
          <button
            type="button"
            aria-pressed={launchedOnly}
            onClick={() => {
              setLaunchedOnly(true);
              setPage(1);
            }}
            className={`inline-flex h-[34px] items-center rounded-full px-4 text-[13px] font-semibold ${
              launchedOnly ? "btn-primary" : "btn-glass text-secondary"
            }`}
          >
            Launched
          </button>
        </div>

        <p className="text-secondary text-[13px]">
          Ranked by {window_.toUpperCase()} trading PnL
        </p>

        <div className="ml-auto flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-[240px]">
            <SearchIcon
              size={16}
              className="text-secondary pointer-events-none absolute top-1/2 left-3.5 z-10 -translate-y-1/2"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search KOLs..."
              aria-label="Search KOLs"
              className="glass-field text-ink placeholder:text-muted focus:shadow-focus h-9 w-full rounded-full pr-3 pl-9 text-[13px] outline-none [&::-webkit-search-cancel-button]:hidden"
            />
          </div>
          <div
            role="group"
            aria-label="Time range"
            className="glass-field flex h-9 items-center rounded-full p-1"
          >
            {WINDOWS.map((w) => (
              <button
                key={w}
                type="button"
                aria-pressed={window_ === w}
                onClick={() => {
                  setWindow(w);
                  setPage(1);
                }}
                className={`tnum h-7 rounded-full px-3 text-[13px] transition-colors ${
                  window_ === w
                    ? "segment-active font-bold"
                    : "text-secondary hover:text-ink font-medium"
                }`}
              >
                {w.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-separate border-spacing-0 text-left">
          <caption className="sr-only">
            KOL leaderboard: top holdings, competition PnL, followers, trades,
            Fomo volume, share market cap and 24h share price change.
          </caption>
          <thead>
            <tr className="text-muted border-hairline border-b text-[11px] font-semibold tracking-[0.04em] uppercase">
              <th scope="col" className="py-2.5 pr-2 pl-4">#</th>
              <th scope="col" className="py-2.5 pr-3">KOL</th>
              <th scope="col" className="py-2.5 pr-3 text-right">Top holdings</th>
              <th scope="col" className="py-2.5 pr-3 text-right">Competition PnL</th>
              <th scope="col" className="py-2.5 pr-3 text-right">Followers</th>
              <th scope="col" className="py-2.5 pr-3 text-right">Trades</th>
              <th scope="col" className="py-2.5 pr-3 text-right">Fomo volume</th>
              <th scope="col" className="py-2.5 pr-3 text-right">Share market cap</th>
              <th scope="col" className="py-2.5 pr-3 text-right">24h change</th>
              <th scope="col" className="py-2.5 pr-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((trader) => (
              <tr
                key={trader.id}
                className={`border-hairline border-b last:border-b-0 ${
                  trader.rank === 1 ? "bg-first-row" : "hover:bg-pearl"
                }`}
              >
                <td className="tnum text-secondary py-3 pr-2 pl-4 text-[13px] font-semibold">
                  {trader.rank}
                </td>
                <td className="py-3 pr-3">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={trader.profilePictureLink}
                      name={trader.name}
                      size={34}
                      className="border-2 border-white"
                      sizes="64px"
                    />
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5">
                        <span className="text-ink truncate text-[14px] leading-5 font-bold">
                          {trader.token ? (
                            <Link
                              href={`/token/${trader.token.address}`}
                              className="hover:text-blue-text"
                            >
                              {trader.name}
                            </Link>
                          ) : (
                            trader.name
                          )}
                        </span>
                        {trader.token && (
                          <span className="bg-blue-soft text-blue-text shrink-0 rounded-full px-1.5 py-px text-[10px] font-bold">
                            ${trader.token.symbol}
                          </span>
                        )}
                      </span>
                      <span className="text-muted block truncate text-[12px] leading-4">
                        @{trader.handle}
                        {trader.clan && ` · ${trader.clan.name}`}
                      </span>
                    </span>
                  </div>
                </td>
                <td className="tnum text-ink py-3 pr-3 text-right text-[13px] font-semibold">
                  {formatUsd(trader.topHoldings.reduce((s, h) => s + h.value, 0))}
                </td>
                <td
                  className={`tnum py-3 pr-3 text-right text-[13px] font-bold ${toneFor(trader.pnl24h)}`}
                >
                  {formatSignedUsd(trader.pnl24h)}
                </td>
                <td className="tnum text-secondary py-3 pr-3 text-right text-[13px]">
                  {formatCount(trader.followers)}
                </td>
                <td className="tnum text-secondary py-3 pr-3 text-right text-[13px]">
                  {formatCount(trader.numTrades)}
                </td>
                <td className="tnum text-secondary py-3 pr-3 text-right text-[13px]">
                  {formatUsd(trader.totalVolume)}
                </td>
                <td className="tnum py-3 pr-3 text-right text-[13px]">
                  <span className={trader.token ? "text-ink font-semibold" : "text-muted"}>
                    {trader.token ? formatUsd(trader.token.marketCapUsd) : "—"}
                  </span>
                </td>
                <td className="tnum py-3 pr-3 text-right text-[13px] font-semibold">
                  <span
                    className={
                      trader.token?.change24hPct != null
                        ? toneFor(trader.token.change24hPct)
                        : "text-muted"
                    }
                  >
                    {trader.token?.change24hPct != null
                      ? formatPct(trader.token.change24hPct)
                      : "—"}
                  </span>
                </td>
                <td className="py-3 pr-4 text-right">
                  {trader.token ? (
                    <Link
                      href={`/token/${trader.token.address}`}
                      className="btn-primary inline-flex h-[32px] items-center rounded-full px-4 text-[13px] font-semibold"
                    >
                      Trade
                    </Link>
                  ) : (
                    <span className="text-muted text-[13px]">Not launched</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <nav
        aria-label="Pagination"
        className="border-hairline flex flex-wrap items-center justify-between gap-3 border-t p-4"
      >
        <p className="tnum text-secondary text-[13px]">
          Showing {rows.length === 0 ? 0 : (current - 1) * PAGE_SIZE + 1}–
          {Math.min(current * PAGE_SIZE, rows.length)} of {rows.length} KOLs
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={current <= 1}
            onClick={() => setPage(current - 1)}
            className="btn-glass h-9 rounded-full px-4 text-[13px] font-semibold disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="tnum text-secondary px-1 text-[13px]">
            Page {current} of {pageCount}
          </span>
          <button
            type="button"
            disabled={current >= pageCount}
            onClick={() => setPage(current + 1)}
            className="btn-glass h-9 rounded-full px-4 text-[13px] font-semibold disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </nav>
    </section>
  );
}
