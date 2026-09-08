"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Trader } from "@/lib/market-types";
import { Avatar } from "@/components/ui/Avatar";
import { StarIcon } from "@/components/ui/icons";
import {
  avatarColor,
  formatCount,
  formatPct,
  formatPrice,
  formatSignedUsd,
  formatUsd,
  toneFor,
} from "@/lib/format";

/**
 * One trader, as a card.
 *
 * The card's halo is keyed to the trader, not to the market: the same colour
 * runs from the blurred avatar wash at the top through the ring around the
 * face to the border, so a wall of forty of these is scannable by colour
 * before you read a single name. Rank 1 is the exception — it takes the brand
 * blue, because on this board the leader is the product.
 *
 * The whole card navigates, but Buy and Sell must not: they are inside the
 * clickable surface and stop propagation, which is why they are buttons here
 * rather than links.
 */
export function TraderCard({
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
  const router = useRouter();
  const token = trader.token;
  const isLeader = trader.rank === 1;
  const accent = isLeader ? "8, 117, 249" : rgbOf(trader.handle);
  const href = token ? `/token/${token.address}` : null;

  const holdingsValue = trader.topHoldings.reduce((sum, h) => sum + h.value, 0);

  return (
    <li
      className={`relative flex flex-col overflow-hidden rounded-2xl border bg-white transition-shadow ${
        href ? "cursor-pointer" : ""
      }`}
      style={{
        borderColor: `rgba(${accent}, 0.4)`,
        boxShadow: `0 10px 26px rgba(${accent}, 0.16), inset 0 1px 0 rgba(255,255,255,0.8)`,
      }}
      onClick={() => href && router.push(href)}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[210px] overflow-hidden"
      >
        {trader.profilePictureLink ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={trader.profilePictureLink}
            alt=""
            draggable={false}
            className="h-full w-full scale-[1.35] object-cover object-top opacity-95 blur-md"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{ background: `rgb(${accent})`, opacity: 0.5 }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(${accent}, 0.28) 0%, rgba(223, 241, 255, 0.2) 34%, rgba(255,255,255,0.7) 60%, rgba(255,255,255,0.97) 100%)`,
          }}
        />
      </div>

      <div className="relative flex flex-col p-5">
        <div className="flex items-center justify-between">
          <span
            style={{ width: 31, height: 31, fontSize: 14 }}
            className={`tnum inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${
              isLeader
                ? "bg-[linear-gradient(180deg,#3A96FF_0%,#0875F9_55%,#0068EA_100%)] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.55),0_2px_4px_rgba(3,101,227,0.2)]"
                : "border-hairline bg-rank-neutral text-ink border"
            }`}
          >
            {trader.rank}
          </span>
          <button
            type="button"
            aria-pressed={watched}
            aria-label={`${watched ? "Remove" : "Add"} ${trader.name} ${
              watched ? "from" : "to"
            } watchlist`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleWatch(trader.id);
            }}
            className={`btn-glass hover:bg-rank-neutral flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
              watched ? "text-blue-text" : "text-ink-soft"
            }`}
          >
            <StarIcon size={18} filled={watched} />
          </button>
        </div>

        <div className="mt-2 flex justify-center">
          <span
            className="rounded-full p-[3px]"
            style={{
              background: `linear-gradient(135deg, rgba(255,255,255,0.95), rgba(${accent}, 0.85))`,
              boxShadow: `0 8px 20px rgba(${accent}, 0.35)`,
            }}
          >
            <span
              className="inline-flex shrink-0 rounded-full border-2 border-white shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
              style={{ width: 84, height: 84 }}
            >
              <Avatar
                src={trader.profilePictureLink}
                name={trader.name}
                size={82}
                sizes="96px"
              />
            </span>
          </span>
        </div>

        <div className="mt-3 text-center">
          <div className="text-ink flex items-center justify-center gap-1 text-[16px] leading-5 font-extrabold tracking-[-0.01em] uppercase">
            <span className="truncate" title={trader.name}>
              {trader.name}
            </span>
          </div>
          <div className="text-secondary truncate text-[13px] leading-[18px]">
            @{trader.handle}
            {trader.clan && <span className="text-muted"> · {trader.clan.name}</span>}
          </div>
          {trader.bio && (
            <p
              className="text-secondary mx-auto mt-1.5 line-clamp-2 max-w-[260px] text-[12px] leading-4"
              title={trader.bio}
            >
              {trader.bio}
            </p>
          )}
          <p className="tnum text-muted mt-1.5 text-[11px] leading-4">
            <span className="text-ink font-semibold">
              {formatCount(trader.followers)}
            </span>{" "}
            followers ·{" "}
            <span className="text-ink font-semibold">
              {formatCount(trader.numTrades)}
            </span>{" "}
            trades
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-white/80 bg-white/60 px-3 py-2 backdrop-blur-md">
          <span className="text-muted text-[11px] leading-4">Top holdings</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="flex -space-x-2">
              {trader.topHoldings.slice(0, 3).map((holding, i) => (
                <span
                  key={`${holding.tokenAddress}-${i}`}
                  title={`${formatUsd(holding.value)} · PnL ${formatSignedUsd(holding.pnl)}`}
                  className="relative inline-flex"
                >
                  {holding.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={holding.imageUrl}
                      alt=""
                      width={22}
                      height={22}
                      loading="lazy"
                      style={{ width: 22, height: 22 }}
                      className="rounded-full border-2 border-white bg-white object-cover"
                    />
                  ) : (
                    <span
                      style={{
                        width: 22,
                        height: 22,
                        background: `rgb(${rgbOf(holding.tokenAddress || String(i))})`,
                      }}
                      className="rounded-full border-2 border-white"
                    />
                  )}
                </span>
              ))}
            </span>
            <span className="tnum text-ink text-[12px] font-semibold">
              {formatUsd(holdingsValue)}
            </span>
          </span>
        </div>

        <dl className="tnum mt-4 grid grid-cols-3 gap-2 rounded-xl border border-white/80 bg-white/75 p-3 text-center text-[15px] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-md">
          <div>
            <dt className="text-muted text-[11px] leading-4">Market cap</dt>
            <dd
              className={`mt-0.5 font-bold ${token ? "text-ink" : "text-muted font-normal"}`}
            >
              {token ? formatUsd(token.marketCapUsd) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted text-[11px] leading-4">24h change</dt>
            <dd
              className={`mt-0.5 font-bold ${
                token?.change24hPct != null
                  ? toneFor(token.change24hPct)
                  : "text-muted font-normal"
              }`}
            >
              {token?.change24hPct != null
                ? formatPct(token.change24hPct, 1)
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted text-[11px] leading-4">Daily PnL</dt>
            <dd className={`mt-0.5 font-bold ${toneFor(trader.pnl24h)}`}>
              {formatSignedUsd(trader.pnl24h)}
            </dd>
          </div>
        </dl>

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className="text-muted text-[13px]">
            {token ? (
              <span className="tnum text-ink font-semibold">
                {formatPrice(token.priceUsd)}
              </span>
            ) : (
              "—"
            )}
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTrade(trader, "buy");
              }}
              className="btn-primary inline-flex h-[38px] w-[108px] items-center justify-center rounded-full text-sm leading-5 font-semibold"
            >
              {token ? "Buy" : "Launch"}
            </button>
            <button
              type="button"
              disabled={!token}
              onClick={(e) => {
                e.stopPropagation();
                onTrade(trader, "sell");
              }}
              className="btn-glass inline-flex h-[38px] w-[105px] items-center justify-center rounded-full text-sm leading-5 font-semibold disabled:cursor-not-allowed"
            >
              Sell
            </button>
          </div>
        </div>

        {href && (
          <Link href={href} className="sr-only">
            Open {trader.name} market
          </Link>
        )}
      </div>
    </li>
  );
}

/** The card halo, keyed to the trader so it never changes between renders. */
function rgbOf(seed: string): string {
  const [hex] = avatarColor(seed);
  const n = Number.parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}
