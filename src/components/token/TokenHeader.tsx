"use client";

import Link from "next/link";
import { useState } from "react";
import type { Trader } from "@/lib/market-types";
import { Avatar } from "@/components/ui/Avatar";
import { ArrowLeftIcon, CopyIcon } from "@/components/ui/icons";
import {
  formatCount,
  formatPct,
  formatPrice,
  formatUsd,
  shortAddress,
  toneFor,
} from "@/lib/format";

/**
 * The masthead for one share.
 *
 * Two halves that answer two different questions: who is this, and what is
 * their share doing. The four figures on the right are the only numbers on
 * this page set large, so the eye lands on them before the chart — the chart
 * is for people who already decided the price was interesting.
 */
export function TokenHeader({ trader }: { trader: Trader }) {
  const token = trader.token!;
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(token.address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      // clipboard denied; the address is still selectable on screen
    }
  };

  return (
    <section className="shadow-panel rounded-2xl border border-white/85 bg-white/85 p-4 backdrop-blur-md md:p-5">
      <div className="flex flex-col gap-5 desk:flex-row desk:items-center">
        <Link
          href="/"
          aria-label="Back to the market"
          className="btn-glass text-ink-soft hidden h-10 w-10 shrink-0 items-center justify-center rounded-full desk:inline-flex"
        >
          <ArrowLeftIcon size={17} />
        </Link>

        <div className="flex min-w-0 flex-1 items-start gap-4">
          <span className="glass-bubble hidden shrink-0 sm:inline-flex" style={{ width: 92, height: 92 }}>
            <span style={{ left: 9, top: 9 }} className="absolute">
              <Avatar
                src={trader.profilePictureLink}
                name={trader.name}
                size={74}
                sizes="128px"
              />
            </span>
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-ink text-[28px] leading-8 font-black tracking-[-0.03em] md:text-[32px]">
                {trader.name}
              </h1>
              <span className="text-secondary text-[14px]">@{trader.handle}</span>
              <span className="bg-blue-soft text-blue-text rounded-full px-2 py-0.5 text-[11.5px] font-bold">
                ${token.symbol}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[11.5px] font-bold ${
                  token.phase === "graduated"
                    ? "bg-positive/10 text-positive"
                    : "bg-rank-neutral text-secondary"
                }`}
              >
                {token.phase === "graduated" ? "Graduated" : "Bonding"}
              </span>
            </div>

            {trader.bio && (
              <p className="text-secondary mt-2 max-w-[520px] text-[13.5px] leading-5">
                {trader.bio}
              </p>
            )}

            <p className="tnum text-muted mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px]">
              <span>
                <span className="text-ink font-semibold">
                  {formatCount(trader.followers)}
                </span>{" "}
                followers
              </span>
              <span>·</span>
              <span>
                <span className="text-ink font-semibold">
                  {formatCount(trader.numTrades)}
                </span>{" "}
                trades
              </span>
              {trader.clan && (
                <>
                  <span>·</span>
                  <span>{trader.clan.name}</span>
                </>
              )}
              <span>·</span>
              <button
                type="button"
                onClick={copy}
                title="Copy share address"
                className="hover:text-blue-text inline-flex items-center gap-1"
              >
                {shortAddress(token.address)}
                <CopyIcon size={12} />
                {copied && <span className="text-positive">copied</span>}
              </button>
            </p>
          </div>
        </div>

        <dl className="tnum border-hairline grid shrink-0 grid-cols-2 gap-x-8 gap-y-3 border-t pt-4 desk:grid-cols-4 desk:border-t-0 desk:border-l desk:pt-0 desk:pl-8">
          {[
            ["Market cap", formatUsd(token.marketCapUsd), "text-ink"],
            ["Share price", formatPrice(token.priceUsd), "text-ink"],
            [
              "24h change",
              token.change24hPct != null ? formatPct(token.change24hPct) : "—",
              token.change24hPct != null ? toneFor(token.change24hPct) : "text-muted",
            ],
            ["24h volume", formatUsd(token.volume24hUsd), "text-ink"],
          ].map(([label, value, tone]) => (
            <div key={label}>
              <dt className="text-muted text-[11.5px] leading-4">{label}</dt>
              <dd
                className={`mt-0.5 text-[21px] leading-7 font-extrabold tracking-[-0.02em] ${tone}`}
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
