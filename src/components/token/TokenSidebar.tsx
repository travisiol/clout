"use client";

import { useState } from "react";
import type { Trader } from "@/lib/market-types";
import { TradePad } from "@/components/market/TradePad";
import { site } from "@/lib/site";
import { ExternalLinkIcon } from "@/components/ui/icons";
import { formatSignedUsd, formatUsd, shortAddress, toneFor } from "@/lib/format";
import { explorerAddress } from "@/lib/chain";

/**
 * Everything you can act on, in one column: the pad, then the small print the
 * pad implies — who gets the fee, where the market lives, and what the trader
 * themselves is holding.
 *
 * The holdings list is here rather than under the chart on purpose. The chart
 * says what this share has done; the holdings say what the person behind it is
 * actually doing with their money, which is the reason to hold it.
 */
export function TokenSidebar({
  trader,
  ethUsd,
}: {
  trader: Trader;
  ethUsd: number;
}) {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const token = trader.token!;

  return (
    <div className="flex flex-col gap-4">
      <div className="shadow-panel rounded-2xl border border-white/85 bg-white/85 p-4 backdrop-blur-md">
        <TradePad
          trader={trader}
          ethUsd={ethUsd}
          side={side}
          onSideChange={setSide}
        />
      </div>

      <section className="shadow-panel rounded-2xl border border-white/85 bg-white/85 p-4 backdrop-blur-md">
        <h2 className="text-ink text-[15px] leading-5 font-extrabold">
          About this market
        </h2>
        <p className="text-secondary mt-2 text-[13px] leading-5">
          Trader shares for {trader.name} (@{trader.handle}). Trading fees pay
          the trader. Launched via {site.name} on pons.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={explorerAddress(token.address)}
            target="_blank"
            rel="noreferrer"
            className="btn-glass text-ink inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold"
          >
            {shortAddress(token.address)}
            <ExternalLinkIcon size={11} className="text-muted" />
          </a>
          <a
            href={`https://x.com/${trader.handle}`}
            target="_blank"
            rel="noreferrer"
            className="btn-glass text-ink inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold"
          >
            View on X
            <ExternalLinkIcon size={11} className="text-muted" />
          </a>
        </div>
      </section>

      {trader.topHoldings.length > 0 && (
        <section className="shadow-panel rounded-2xl border border-white/85 bg-white/85 p-4 backdrop-blur-md">
          <h2 className="text-ink text-[15px] leading-5 font-extrabold">
            {trader.name}&apos;s top holdings
            <span className="text-muted ml-1.5 text-[12px] font-medium">
              · {trader.totalHoldings} positions
            </span>
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {trader.topHoldings.map((holding, i) => (
              <li
                key={`${holding.tokenAddress}-${i}`}
                className="border-hairline flex items-center gap-3 rounded-xl border bg-white/70 px-3 py-2"
              >
                {holding.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={holding.imageUrl}
                    alt=""
                    width={26}
                    height={26}
                    className="h-[26px] w-[26px] rounded-full border border-white bg-white object-cover"
                  />
                ) : (
                  <span className="bg-rank-neutral h-[26px] w-[26px] rounded-full" />
                )}
                <span className="tnum text-secondary min-w-0 flex-1 truncate text-[12.5px]">
                  {shortAddress(holding.tokenAddress, 6)}
                </span>
                <span className="text-right">
                  <span className="tnum text-ink block text-[13px] font-bold">
                    {formatUsd(holding.value)}
                  </span>
                  <span
                    className={`tnum block text-[11.5px] font-semibold ${toneFor(holding.pnl)}`}
                  >
                    {formatSignedUsd(holding.pnl)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
