import type { ShareToken } from "@/lib/market-types";

/**
 * How close the curve is to graduating.
 *
 * The threshold is stated in ETH next to the bar rather than only as a
 * percentage, because "28%" of an unnamed number tells you nothing about how
 * much buying is left. Graduation is the moment the curve turns into a pool,
 * so it is the single most consequential number on the page after the price.
 */
export function BondingProgress({
  token,
  shareholders,
  top10Pct,
}: {
  token: ShareToken;
  shareholders: number;
  top10Pct: number | null;
}) {
  const pct = Math.max(0, Math.min(100, token.progressPct));

  return (
    <section className="shadow-panel grid gap-4 rounded-2xl border border-white/85 bg-white/85 p-4 backdrop-blur-md sm:grid-cols-3">
      <div className="sm:col-span-1">
        <p className="text-muted text-[11.5px] leading-4">Bonding progress</p>
        <p className="tnum text-ink mt-0.5 text-[21px] leading-7 font-extrabold tracking-[-0.02em]">
          {pct.toFixed(2)}%
        </p>
        <div className="bg-track mt-2 h-2 overflow-hidden rounded-full">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#4a94ff_0%,#0068f2_100%)]"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="tnum text-muted mt-1.5 text-[11.5px]">
          {token.raisedEth.toFixed(3)} of {token.graduationThresholdEth} ETH
        </p>
      </div>

      <div>
        <p className="text-muted text-[11.5px] leading-4">Shareholders</p>
        <p className="tnum text-ink mt-0.5 text-[21px] leading-7 font-extrabold tracking-[-0.02em]">
          {shareholders || token.holdersCount}
        </p>
      </div>

      <div>
        <p className="text-muted text-[11.5px] leading-4">Top 10 holding</p>
        <p className="tnum text-ink mt-0.5 text-[21px] leading-7 font-extrabold tracking-[-0.02em]">
          {top10Pct != null ? `${top10Pct.toFixed(2)}%` : "—"}
        </p>
      </div>
    </section>
  );
}
