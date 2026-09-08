"use client";

import { useEffect, useState } from "react";
import type { Holder, ShareToken, Trade } from "@/lib/market-types";
import {
  formatPrice,
  formatShares,
  formatSignedUsd,
  formatUsd,
  shortAddress,
  timeAgo,
  toneFor,
} from "@/lib/format";
import { explorerAddress, explorerTx } from "@/lib/chain";

/**
 * Who holds it, and what just happened.
 *
 * The tags are the point of this table. "Bundler", "Sniper", "Insider" and
 * "Fresh" are the shapes a launch goes wrong in, and putting them next to the
 * supply percentage is the difference between a holder list and a warning.
 * The bonding curve is tagged too, so nobody reads the largest line as a whale.
 */
export function HoldersPanel({ token }: { token: ShareToken }) {
  const [tab, setTab] = useState<"holders" | "trades">("holders");
  const [holders, setHolders] = useState<Holder[] | null>(null);
  const [trades, setTrades] = useState<Trade[] | null>(null);
  const [top10, setTop10] = useState<number | null>(null);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [h, t] = await Promise.all([
          fetch(`/api/token/${token.address}/holders?limit=50`).then((r) => r.json()),
          fetch(`/api/token/${token.address}/trades?limit=50`).then((r) => r.json()),
        ]);
        if (cancelled) return;
        setHolders(h.holders ?? []);
        setTrades(t.trades ?? []);
        setTop10(typeof h.top10Pct === "number" ? h.top10Pct : null);
        setNote(h.detail ?? t.detail ?? null);
      } catch {
        if (!cancelled) {
          setHolders([]);
          setTrades([]);
          setNote("Could not reach the indexer.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token.address]);

  return (
    <section className="shadow-panel overflow-hidden rounded-2xl border border-white/85 bg-white/85 backdrop-blur-md">
      <div className="border-hairline flex flex-wrap items-center gap-3 border-b p-4">
        <div className="glass-field flex h-9 items-center rounded-full p-1">
          <button
            type="button"
            aria-pressed={tab === "holders"}
            onClick={() => setTab("holders")}
            className={`h-7 rounded-full px-4 text-[13px] transition-colors ${
              tab === "holders"
                ? "segment-active font-bold"
                : "text-secondary hover:text-ink font-medium"
            }`}
          >
            Shareholders{holders ? ` (${holders.length})` : ""}
          </button>
          <button
            type="button"
            aria-pressed={tab === "trades"}
            onClick={() => setTab("trades")}
            className={`h-7 rounded-full px-4 text-[13px] transition-colors ${
              tab === "trades"
                ? "segment-active font-bold"
                : "text-secondary hover:text-ink font-medium"
            }`}
          >
            Trades
          </button>
        </div>
        {tab === "holders" && top10 != null && (
          <p className="text-secondary ml-auto text-[12.5px]">
            Top 10 holding{" "}
            <span className="tnum text-ink font-bold">{top10.toFixed(2)}%</span>
          </p>
        )}
      </div>

      <div className="max-h-[520px] overflow-auto">
        {tab === "holders" ? (
          <table className="w-full min-w-[560px] border-separate border-spacing-0 text-left">
            <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur">
              <tr className="text-muted border-hairline border-b text-[11px] font-semibold tracking-[0.04em] uppercase">
                <th scope="col" className="py-2.5 pr-3 pl-4">Holder</th>
                <th scope="col" className="py-2.5 pr-3 text-right">Shares</th>
                <th scope="col" className="py-2.5 pr-3 text-right">PnL</th>
                <th scope="col" className="py-2.5 pr-3 text-right">Avg. entry</th>
                <th scope="col" className="py-2.5 pr-4 text-right">Supply</th>
              </tr>
            </thead>
            <tbody>
              {(holders ?? []).map((holder) => (
                <tr key={holder.address} className="border-hairline hover:bg-pearl border-b last:border-b-0">
                  <td className="py-2.5 pr-3 pl-4">
                    <a
                      href={explorerAddress(holder.address)}
                      target="_blank"
                      rel="noreferrer"
                      className="tnum text-ink text-[13px] font-semibold hover:text-blue-text"
                    >
                      {shortAddress(holder.address)}
                    </a>
                    {holder.tags.length > 0 && (
                      <span className="mt-1 flex flex-wrap gap-1">
                        {holder.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`rounded-chip px-1.5 py-px text-[10px] font-semibold ${tagTone(tag)}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </span>
                    )}
                  </td>
                  <td className="tnum text-ink py-2.5 pr-3 text-right text-[13px] font-semibold">
                    {formatShares(holder.shares)}
                  </td>
                  <td
                    className={`tnum py-2.5 pr-3 text-right text-[13px] font-semibold ${
                      holder.pnlUsd != null ? toneFor(holder.pnlUsd) : "text-muted"
                    }`}
                  >
                    {holder.pnlUsd != null ? formatSignedUsd(holder.pnlUsd) : "—"}
                  </td>
                  <td className="tnum text-secondary py-2.5 pr-3 text-right text-[13px]">
                    {holder.avgEntry != null ? formatPrice(holder.avgEntry) : "—"}
                  </td>
                  <td className="tnum text-ink py-2.5 pr-4 text-right text-[13px] font-semibold">
                    {holder.supplyPct.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full min-w-[560px] border-separate border-spacing-0 text-left">
            <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur">
              <tr className="text-muted border-hairline border-b text-[11px] font-semibold tracking-[0.04em] uppercase">
                <th scope="col" className="py-2.5 pr-3 pl-4">When</th>
                <th scope="col" className="py-2.5 pr-3">Side</th>
                <th scope="col" className="py-2.5 pr-3">Trader</th>
                <th scope="col" className="py-2.5 pr-3 text-right">Shares</th>
                <th scope="col" className="py-2.5 pr-3 text-right">Price</th>
                <th scope="col" className="py-2.5 pr-4 text-right">Value</th>
              </tr>
            </thead>
            <tbody>
              {(trades ?? []).map((trade) => (
                <tr key={trade.hash} className="border-hairline hover:bg-pearl border-b last:border-b-0">
                  <td className="text-secondary py-2.5 pr-3 pl-4 text-[12.5px] whitespace-nowrap">
                    <a
                      href={explorerTx(trade.hash)}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-blue-text"
                    >
                      {timeAgo(trade.at)}
                    </a>
                  </td>
                  <td className="py-2.5 pr-3">
                    <span
                      className={`rounded-chip px-1.5 py-px text-[11px] font-bold ${
                        trade.side === "buy"
                          ? "bg-positive/10 text-positive"
                          : "bg-negative/10 text-negative"
                      }`}
                    >
                      {trade.side === "buy" ? "Buy" : "Sell"}
                    </span>
                  </td>
                  <td className="tnum text-secondary py-2.5 pr-3 text-[12.5px]">
                    {shortAddress(trade.address)}
                  </td>
                  <td className="tnum text-ink py-2.5 pr-3 text-right text-[13px] font-semibold">
                    {formatShares(trade.shares)}
                  </td>
                  <td className="tnum text-secondary py-2.5 pr-3 text-right text-[13px]">
                    {formatPrice(trade.priceUsd)}
                  </td>
                  <td className="tnum text-ink py-2.5 pr-4 text-right text-[13px] font-semibold">
                    {formatUsd(trade.usd)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {((tab === "holders" && holders?.length === 0) ||
          (tab === "trades" && trades?.length === 0)) && (
          <p className="text-secondary p-8 text-center text-[13.5px] leading-5">
            {note ?? "Nothing here yet."}
          </p>
        )}
      </div>
    </section>
  );
}

/** Red for the tags that mean "be careful", grey for the ones that are facts. */
function tagTone(tag: string): string {
  if (tag === "Bonding curve" || tag === "Pool") return "bg-blue-soft text-blue-text";
  if (tag === "Sniper" || tag === "Insider" || tag === "Bundler")
    return "bg-negative/10 text-negative";
  if (tag === "Dev") return "bg-warning/10 text-warning";
  return "bg-rank-neutral text-secondary";
}
