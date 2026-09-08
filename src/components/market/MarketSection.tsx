"use client";

import { useEffect, useMemo, useState } from "react";
import type { MarketPayload, MarketWindow, Trader } from "@/lib/market-types";
import { useWatchlist } from "@/lib/watchlist";
import { TraderCard } from "./TraderCard";
import { TraderRow } from "./TraderRow";
import { TradeDialog } from "./TradeDialog";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  GridIcon,
  ListIcon,
  SearchIcon,
} from "@/components/ui/icons";

type Filter = "all" | "gainers" | "losers" | "watchlist";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All KOLs" },
  { id: "gainers", label: "Top gainers" },
  { id: "losers", label: "Top losers" },
  { id: "watchlist", label: "Watchlist" },
];

const WINDOWS: MarketWindow[] = ["24h", "7d", "30d"];
const PAGE_SIZE = 12;

/**
 * The market itself: search, four filters, two layouts, three windows.
 *
 * Filtering happens over the whole roster and pagination over the result, so
 * "top gainers, page 2" means the 13th-best gainer — not the gainers that
 * happened to fall on page 2 of the unfiltered list, which is the bug this
 * ordering exists to avoid.
 *
 * The list is refetched on a timer rather than pushed over a socket: the
 * leaderboard settles by the minute and one cached document costs less than a
 * connection nobody is watching.
 */
export function MarketSection({ initial }: { initial: MarketPayload }) {
  const [market, setMarket] = useState(initial);
  const [window_, setWindow] = useState<MarketWindow>(initial.window);
  const [filter, setFilter] = useState<Filter>("all");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [trade, setTrade] = useState<{ trader: Trader; side: "buy" | "sell" } | null>(
    null,
  );
  const { watchlist, toggle } = useWatchlist();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/market?limit=200&window=${window_}`);
        if (!res.ok) return;
        const next = (await res.json()) as MarketPayload;
        if (!cancelled) setMarket(next);
      } catch {
        // offline or the route is failing — keep showing the last good list
      }
    };
    // don't refetch the window we were handed on the server
    if (window_ !== initial.window) load();
    const timer = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [window_, initial.window]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = market.traders;

    if (q) {
      rows = rows.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.handle.toLowerCase().includes(q) ||
          t.token?.symbol.toLowerCase().includes(q),
      );
    }
    if (filter === "watchlist") rows = rows.filter((t) => watchlist.has(t.id));
    if (filter === "gainers") {
      rows = rows
        .filter((t) => (t.token?.change24hPct ?? 0) > 0)
        .sort((a, b) => (b.token?.change24hPct ?? 0) - (a.token?.change24hPct ?? 0));
    }
    if (filter === "losers") {
      rows = rows
        .filter((t) => (t.token?.change24hPct ?? 0) < 0)
        .sort((a, b) => (a.token?.change24hPct ?? 0) - (b.token?.change24hPct ?? 0));
    }
    return rows;
  }, [market.traders, query, filter, watchlist]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const slice = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const reset = <T,>(setter: (v: T) => void) => (value: T) => {
    setter(value);
    setPage(1);
  };

  return (
    <>
      <div className="mt-10">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-5 desk:flex-row desk:items-end desk:justify-between">
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <h2
                  id="kol-market-title"
                  className="font-display text-ink text-[32px] leading-none font-black tracking-[-0.04em] md:text-[42px] md:leading-[46px] md:tracking-[-1.8px]"
                >
                  The KOL market
                </h2>
                {market.source === "seed" && (
                  <span
                    className="glass-caption text-secondary inline-flex h-[26px] items-center rounded-full px-3 text-[11px] font-semibold"
                    title="Set FOMO_API_KEY to rank the real leaderboard"
                  >
                    Sample roster
                  </span>
                )}
              </div>
              <p className="text-secondary text-[17px] leading-[23px]">
                Find your conviction. Trade their performance.
              </p>
            </div>

            <div className="relative w-full desk:mb-0.5 desk:w-[428px]">
              <SearchIcon
                size={18}
                className="text-secondary pointer-events-none absolute top-1/2 left-4 z-10 -translate-y-1/2"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => reset(setQuery)(e.target.value)}
                placeholder="Search KOLs..."
                aria-label="Search KOLs"
                autoComplete="off"
                className="glass-field text-ink placeholder:text-muted focus:shadow-focus h-10 w-full rounded-full pr-10 pl-11 text-sm leading-5 outline-none [&::-webkit-search-cancel-button]:hidden"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div role="group" aria-label="Filter KOLs" className="flex flex-wrap items-center gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={filter === f.id}
                  onClick={() => reset(setFilter)(f.id)}
                  className={`inline-flex h-[38px] items-center gap-1.5 rounded-full border border-transparent px-4 text-sm leading-5 font-medium whitespace-nowrap transition-colors duration-150 ${
                    filter === f.id
                      ? "btn-primary"
                      : "btn-glass text-secondary hover:text-ink"
                  }`}
                >
                  {f.label}
                  {f.id === "watchlist" && watchlist.size > 0 && (
                    <span className="tnum text-[12px] opacity-80">{watchlist.size}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="hidden md:block">
                <div
                  role="group"
                  aria-label="Layout"
                  className="glass-field flex h-[39px] items-center rounded-full p-1"
                >
                  <button
                    type="button"
                    aria-pressed={layout === "list"}
                    aria-label="List view"
                    title="List view"
                    onClick={() => setLayout("list")}
                    className={`flex h-[30px] w-10 items-center justify-center rounded-full transition-colors duration-150 ${
                      layout === "list" ? "segment-active" : "text-secondary hover:text-ink"
                    }`}
                  >
                    <ListIcon size={16} />
                  </button>
                  <button
                    type="button"
                    aria-pressed={layout === "grid"}
                    aria-label="Grid view"
                    title="Grid view"
                    onClick={() => setLayout("grid")}
                    className={`flex h-[30px] w-10 items-center justify-center rounded-full transition-colors duration-150 ${
                      layout === "grid" ? "segment-active" : "text-secondary hover:text-ink"
                    }`}
                  >
                    <GridIcon size={16} />
                  </button>
                </div>
              </div>

              <div
                role="group"
                aria-label="Time range"
                className="glass-field flex h-[39px] w-[232px] items-center rounded-full p-1"
              >
                {WINDOWS.map((w, i) => (
                  <span key={w} className="contents">
                    {i > 0 && (
                      <span
                        aria-hidden="true"
                        className={`bg-hairline h-4 w-px shrink-0 ${
                          window_ === w || window_ === WINDOWS[i - 1] ? "opacity-0" : ""
                        }`}
                      />
                    )}
                    <button
                      type="button"
                      aria-pressed={window_ === w}
                      onClick={() => reset(setWindow)(w)}
                      className={`tnum h-[30px] flex-1 rounded-full text-sm leading-none transition-colors duration-150 ${
                        window_ === w
                          ? "segment-active font-bold"
                          : "text-secondary hover:text-ink font-medium"
                      }`}
                    >
                      {w.toUpperCase()}
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        {slice.length === 0 ? (
          <p className="text-secondary glass-caption rounded-2xl px-5 py-8 text-center text-[15px]">
            {filter === "watchlist"
              ? "Nothing on your watchlist yet. Star a KOL to keep an eye on them."
              : "No KOL matches that search."}
          </p>
        ) : layout === "grid" ? (
          <ul className="grid gap-5 md:grid-cols-2 desk:grid-cols-3 2xl:grid-cols-4">
            {slice.map((trader) => (
              <TraderCard
                key={trader.id}
                trader={trader}
                watched={watchlist.has(trader.id)}
                onToggleWatch={toggle}
                onTrade={(t, side) => setTrade({ trader: t, side })}
              />
            ))}
          </ul>
        ) : (
          <div className="shadow-panel overflow-x-auto rounded-2xl border border-white/85 bg-white/85 backdrop-blur-md">
            <table className="w-full border-separate border-spacing-0 text-left">
              <caption className="sr-only">
                KOL market: rank, top holdings, share market cap, 24h change and
                daily PnL.
              </caption>
              <thead>
                <tr className="text-muted border-hairline border-b text-[11px] font-semibold tracking-[0.04em] uppercase">
                  <th scope="col" className="py-2.5 pr-2 pl-3">#</th>
                  <th scope="col" className="py-2.5 pr-3">KOL</th>
                  <th scope="col" className="hidden py-2.5 pr-3 text-right md:table-cell">Top holdings</th>
                  <th scope="col" className="hidden py-2.5 pr-3 text-right desk:table-cell">Followers</th>
                  <th scope="col" className="hidden py-2.5 pr-3 text-right desk:table-cell">Trades</th>
                  <th scope="col" className="py-2.5 pr-3 text-right">Market cap</th>
                  <th scope="col" className="py-2.5 pr-3 text-right">24h</th>
                  <th scope="col" className="py-2.5 pr-3 text-right">Daily PnL</th>
                  <th scope="col" className="hidden py-2.5 pr-3 text-right md:table-cell">Price</th>
                  <th scope="col" className="py-2.5 pr-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {slice.map((trader) => (
                  <TraderRow
                    key={trader.id}
                    trader={trader}
                    watched={watchlist.has(trader.id)}
                    onToggleWatch={toggle}
                    onTrade={(t, side) => setTrade({ trader: t, side })}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        <nav
          aria-label="Pagination"
          className="mt-5 flex flex-wrap items-center justify-between gap-3"
        >
          <p className="tnum text-secondary text-[13px] leading-5">
            Showing {filtered.length === 0 ? 0 : (current - 1) * PAGE_SIZE + 1}–
            {Math.min(current * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Previous page"
              disabled={current <= 1}
              onClick={() => setPage(current - 1)}
              className="btn-glass inline-flex h-9 min-w-9 items-center justify-center rounded-full px-2.5 text-sm font-medium disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon size={16} />
            </button>
            {pageNumbers(current, pageCount).map((n, i) =>
              n === null ? (
                <span
                  key={`gap-${i}`}
                  aria-hidden="true"
                  className="text-muted w-6 text-center text-sm"
                >
                  …
                </span>
              ) : (
                <button
                  key={n}
                  type="button"
                  aria-label={`Page ${n}`}
                  aria-current={n === current ? "page" : undefined}
                  onClick={() => setPage(n)}
                  className={`tnum inline-flex h-9 min-w-9 items-center justify-center rounded-full px-2.5 text-sm font-medium ${
                    n === current ? "btn-primary" : "btn-glass"
                  }`}
                >
                  {n}
                </button>
              ),
            )}
            <button
              type="button"
              aria-label="Next page"
              disabled={current >= pageCount}
              onClick={() => setPage(current + 1)}
              className="btn-glass inline-flex h-9 min-w-9 items-center justify-center rounded-full px-2.5 text-sm font-medium disabled:cursor-not-allowed"
            >
              <ChevronRightIcon size={16} />
            </button>
          </div>
        </nav>
      </div>

      <TradeDialog
        open={trade}
        ethUsd={market.ethUsd}
        onClose={() => setTrade(null)}
        onSideChange={(side) => setTrade((prev) => (prev ? { ...prev, side } : prev))}
      />
    </>
  );
}

/** 1 2 3 4 … 13 — the ends always visible, the middle elided. */
function pageNumbers(current: number, total: number): (number | null)[] {
  if (total <= 6) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, total, current]);
  for (let d = 1; d <= 2; d++) {
    if (current - d > 1) pages.add(current - d);
    if (current + d < total) pages.add(current + d);
  }
  const sorted = [...pages].sort((a, b) => a - b);
  const out: (number | null)[] = [];
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) out.push(null);
    out.push(n);
  });
  return out;
}
