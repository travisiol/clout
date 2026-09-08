import Link from "next/link";
import type { Trader } from "@/lib/market-types";
import { Avatar } from "@/components/ui/Avatar";
import {
  avatarColor,
  formatCount,
  formatPct,
  formatSignedUsd,
  formatUsd,
  toneFor,
} from "@/lib/format";

/**
 * A podium place.
 *
 * The colour wash is the trader's own, so the top three do not all look like
 * the same card with a different face in it — and the winner gets the full
 * width because a podium where all three are equal is a list.
 *
 * The lower strip is deliberately dull: four grey numbers under one loud one.
 * Competition PnL is the ranking; holdings, trades, volume and followers are
 * how you decide whether to believe it.
 */
export function PodiumCard({
  trader,
  wide = false,
}: {
  trader: Trader;
  wide?: boolean;
}) {
  const [accentHex] = avatarColor(trader.name);
  const token = trader.token;

  return (
    <article
      className="relative overflow-hidden rounded-2xl border bg-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_26px_rgba(28,101,201,0.12)] backdrop-blur-md"
      style={{ borderColor: `${accentHex}66` }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[130px]"
        style={{
          backgroundImage: `linear-gradient(135deg, ${accentHex}59 0%, rgba(255,255,255,0.35) 55%, rgba(255,255,255,0.9) 100%)`,
        }}
      />

      <div className={`relative flex items-center gap-4 p-4 ${wide ? "md:p-5" : ""}`}>
        <span className="inline-flex shrink-0 rounded-full border-[3px] border-white shadow-[0_8px_20px_rgba(28,101,201,0.25)]">
          <Avatar
            src={trader.profilePictureLink}
            name={trader.name}
            size={wide ? 62 : 52}
            sizes="128px"
          />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-ink truncate text-[17px] leading-6 font-extrabold tracking-[-0.01em]">
              {token ? (
                <Link href={`/token/${token.address}`} className="hover:text-blue-text">
                  {trader.name}
                </Link>
              ) : (
                trader.name
              )}
            </h3>
            {token && (
              <span className="bg-blue-soft text-blue-text rounded-full px-2 py-0.5 text-[11px] leading-4 font-bold">
                ${token.symbol}
              </span>
            )}
          </div>
          <p className="text-secondary truncate text-[13px] leading-5">
            @{trader.handle}
            {trader.clan && ` · ${trader.clan.name}`}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-muted text-[10px] leading-4 font-semibold tracking-[0.08em] uppercase">
            Competition PnL
          </p>
          <p
            className={`tnum text-[26px] leading-8 font-black tracking-[-0.02em] ${toneFor(trader.pnl24h)}`}
          >
            {formatSignedUsd(trader.pnl24h)}
          </p>
          <p className="tnum text-muted text-[12px] leading-4">
            {token ? (
              <>
                {formatUsd(token.marketCapUsd)} mcap{" "}
                <span
                  className={
                    token.change24hPct != null ? toneFor(token.change24hPct) : ""
                  }
                >
                  {token.change24hPct != null ? formatPct(token.change24hPct) : "—"}
                </span>
              </>
            ) : (
              "not launched"
            )}
          </p>
        </div>
      </div>

      <dl className="tnum relative m-3 mt-0 grid grid-cols-4 gap-2 rounded-xl border border-white/80 bg-white/80 px-3 py-2.5 text-center">
        {[
          ["Holdings", formatCount(trader.totalHoldings)],
          ["Trades", formatCount(trader.numTrades)],
          ["Fomo volume", formatUsd(trader.totalVolume)],
          ["Followers", formatCount(trader.followers)],
        ].map(([label, value]) => (
          <div key={label}>
            <dd className="text-ink text-[15px] leading-5 font-bold">{value}</dd>
            <dt className="text-muted text-[10.5px] leading-4">{label}</dt>
          </div>
        ))}
      </dl>
    </article>
  );
}
