"use client";

import Link from "next/link";
import type { Trader } from "@/lib/market-types";
import { Avatar } from "@/components/ui/Avatar";
import { StarIcon } from "@/components/ui/icons";
import {
  formatCount,
  formatPct,
  formatPrice,
  formatSignedUsd,
  formatUsd,
  toneFor,
} from "@/lib/format";

/**
 * The same trader as a row, for people comparing rather than browsing.
 *
 * It is a real <table>, not a grid of divs: the columns are a comparison and
 * screen readers should be able to say which one a number is in. The first
 * row is tinted, which is the only place the leader is marked here — a badge
 * on every row would flatten the ranking it is meant to show.
 */
export function TraderRow({
  trader,
  watched,
  onToggleWatch,
  onTrade,
}: {
  trader: Trader;
  watched: boolean;
  onToggleWatch: (id: string) => void;
  onTrade: (trader: Trader, side: "buy" | "sell") => void;
}) {
  const token = trader.token;
  const leader = trader.rank === 1;

  return (
    <tr
      className={`border-hairline border-b transition-colors last:border-b-0 ${
        leader ? "bg-first-row" : "hover:bg-pearl"
      }`}
    >
      <td className="tnum text-secondary py-3 pr-2 pl-3 text-[13px] font-semibold">
        {trader.rank}
      </td>
      <td className="py-3 pr-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-pressed={watched}
            aria-label={`${watched ? "Remove" : "Add"} ${trader.name} ${
              watched ? "from" : "to"
            } watchlist`}
            onClick={() => onToggleWatch(trader.id)}
            className={`hover:bg-rank-neutral flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors ${
              watched ? "text-blue-text" : "text-muted"
            }`}
          >
            <StarIcon size={15} filled={watched} />
          </button>
          <span className="inline-flex shrink-0 rounded-full border-2 border-white shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
            <Avatar
              src={trader.profilePictureLink}
              name={trader.name}
              size={36}
              sizes="64px"
            />
          </span>
          <span className="min-w-0">
            <span className="text-ink block truncate text-[14px] leading-5 font-bold">
              {token ? (
                <Link href={`/token/${token.address}`} className="hover:text-blue-text">
                  {trader.name}
                </Link>
              ) : (
                trader.name
              )}
            </span>
            <span className="text-muted block truncate text-[12px] leading-4">
              @{trader.handle}
              {trader.clan && ` · ${trader.clan.name}`}
            </span>
          </span>
        </div>
      </td>
      <td className="tnum text-ink hidden py-3 pr-3 text-right text-[13px] font-semibold md:table-cell">
        {formatUsd(trader.topHoldings.reduce((s, h) => s + h.value, 0))}
      </td>
      <td className="tnum hidden py-3 pr-3 text-right text-[13px] desk:table-cell">
        <span className="text-ink font-semibold">{formatCount(trader.followers)}</span>
      </td>
      <td className="tnum hidden py-3 pr-3 text-right text-[13px] desk:table-cell">
        <span className="text-ink font-semibold">{formatCount(trader.numTrades)}</span>
      </td>
      <td className="tnum py-3 pr-3 text-right text-[13px]">
        <span className={token ? "text-ink font-semibold" : "text-muted"}>
          {token ? formatUsd(token.marketCapUsd) : "—"}
        </span>
      </td>
      <td className="tnum py-3 pr-3 text-right text-[13px] font-semibold">
        <span
          className={
            token?.change24hPct != null ? toneFor(token.change24hPct) : "text-muted"
          }
        >
          {token?.change24hPct != null ? formatPct(token.change24hPct) : "—"}
        </span>
      </td>
      <td
        className={`tnum py-3 pr-3 text-right text-[13px] font-bold ${toneFor(trader.pnl24h)}`}
      >
        {formatSignedUsd(trader.pnl24h)}
      </td>
      <td className="tnum text-secondary hidden py-3 pr-3 text-right text-[13px] md:table-cell">
        {token ? formatPrice(token.priceUsd) : "—"}
      </td>
      <td className="py-3 pr-3">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onTrade(trader, "buy")}
            className="btn-primary inline-flex h-[34px] w-[78px] items-center justify-center rounded-full text-[13px] font-semibold"
          >
            {token ? "Buy" : "Launch"}
          </button>
          <button
            type="button"
            disabled={!token}
            onClick={() => onTrade(trader, "sell")}
            className="btn-glass inline-flex h-[34px] w-[74px] items-center justify-center rounded-full text-[13px] font-semibold disabled:cursor-not-allowed"
          >
            Sell
          </button>
        </div>
      </td>
    </tr>
  );
}
