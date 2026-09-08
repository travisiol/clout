import type { MarketMetrics } from "@/lib/market-types";
import { formatUsd } from "@/lib/format";
import { GlassPanel } from "./GlassPanel";
import { site } from "@/lib/site";

const ICONS = [
  { src: "/assets/brand/stat-volume.png", focus: "20% 60%" },
  { src: "/assets/brand/stat-fees.png", focus: "55% 70%" },
  { src: "/assets/brand/stat-launched.png", focus: "88% 55%" },
] as const;

/**
 * Three numbers, in the order someone actually asks them: is anyone trading,
 * is anyone getting paid, and how much of the board is even live yet. The
 * third is a fraction on purpose — "9" alone would read as a small market
 * rather than an early one.
 */
export function StatsRow({ metrics }: { metrics: MarketMetrics }) {
  const stats = [
    {
      label: "24H volume",
      value: formatUsd(metrics.volume24hUsd),
      note: "across all KOL shares",
    },
    {
      label: "24H fees to KOLs",
      value: formatUsd(metrics.fees24hUsd),
      note: "paid out from trades",
    },
    {
      label: "Shares launched",
      value: String(metrics.launchedCount),
      note: `of ${metrics.totalTraders} KOLs`,
    },
  ];

  return (
    <ul className="grid gap-4 sm:grid-cols-3" aria-label={`${site.name} stats`}>
      {stats.map((stat, i) => (
        <li key={stat.label} className="rounded-2xl">
          <GlassPanel focus={ICONS[i].focus}>
            <div className="flex items-center gap-3.5 px-4 py-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ICONS[i].src}
                alt=""
                aria-hidden="true"
                width={56}
                height={56}
                draggable={false}
                decoding="async"
                className="h-14 w-14 shrink-0 select-none object-contain"
                style={{
                  filter:
                    "drop-shadow(0 4px 8px rgba(20,90,210,0.24)) drop-shadow(0 1px 1px rgba(255,255,255,0.6))",
                }}
              />
              <span className="min-w-0">
                <span className="text-ink-soft block text-[12px] leading-4 font-semibold">
                  {stat.label}
                </span>
                <span className="tnum text-ink mt-0.5 block text-[24px] leading-7 font-extrabold tracking-[-0.02em]">
                  {stat.value}
                </span>
                <span className="text-secondary block truncate text-[11px] leading-4">
                  {stat.note}
                </span>
              </span>
            </div>
          </GlassPanel>
        </li>
      ))}
    </ul>
  );
}
