import { GlassPanel } from "./GlassPanel";
import { ChartColumnIcon, FlameIcon, RefreshIcon } from "@/components/ui/icons";

const STEPS = [
  {
    n: "01",
    color: "#0767F8",
    Icon: ChartColumnIcon,
    title: "Daily PnL ranks KOLs",
    body: "Traders are ranked by their daily performance.",
  },
  {
    n: "02",
    color: "#D94355",
    Icon: FlameIcon,
    title: "Loser shares burn",
    body: "Shares linked to losing traders are removed from supply.",
  },
  {
    n: "03",
    color: "#087136",
    Icon: RefreshIcon,
    title: "Winners get buybacks",
    body: "Value from losing positions funds buybacks of winning traders’ shares.",
  },
] as const;

/**
 * The mechanism, in one panel and three steps.
 *
 * The pill under the paragraph is the whole product in five words, and it is
 * the only place on the page where red and green sit side by side — which is
 * exactly why it works: this market is a zero-sum transfer from the losing
 * half of the board to the winning half, and the colours say so before the
 * sentence does.
 */
export function HowItWorks() {
  return (
    <GlassPanel
      className="mt-12 scroll-mt-8"
      focus="50% 45%"
      style={undefined}
    >
      <div id="how-it-works" className="grid gap-8 p-6 md:p-8 desk:grid-cols-[43fr_57fr] desk:gap-12 desk:p-10">
        <div>
          <h2
            id="how-it-works-title"
            className="font-display text-ink text-[26px] leading-8 font-black tracking-[-0.03em] md:text-[30px] md:leading-9"
          >
            Daily performance moves the market.
          </h2>
          <p className="text-secondary mt-3 text-[15px] leading-6 md:text-[16px] md:leading-7">
            Each day, KOLs are ranked by their trading PnL. Losing traders’
            shares are burned, and value from those positions funds buybacks of
            winning traders’ shares.
          </p>
          <p className="text-ink mt-4 inline-flex h-10 items-center rounded-full border border-white/85 bg-[rgba(255,255,255,0.58)] px-4 text-[15px] leading-5 font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_0_0_1px_rgba(150,190,240,0.3),0_4px_12px_rgba(28,101,201,0.1)] backdrop-blur-md">
            <span className="text-negative">Losers burn.</span>
            <span className="text-muted mx-1.5">·</span>
            <span className="text-positive">Winners get buybacks.</span>
          </p>
        </div>

        <ol className="grid gap-4 sm:grid-cols-3">
          {STEPS.map(({ n, color, Icon, title, body }) => (
            <li
              key={n}
              className="flex flex-col gap-3 rounded-2xl border border-white/90 bg-[rgba(255,255,255,0.58)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(120,170,230,0.18),0_0_0_1px_rgba(150,190,240,0.3),0_6px_16px_rgba(28,101,201,0.1)] backdrop-blur-md md:p-5"
            >
              <div className="flex items-center justify-between">
                <span
                  className="btn-glass flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ color }}
                >
                  <Icon size={18} />
                </span>
                <span className="tnum text-muted text-[12px] font-bold tracking-[0.08em]">
                  {n}
                </span>
              </div>
              <div>
                <h3 className="text-ink text-[16px] leading-5 font-bold tracking-[-0.01em]">
                  {title}
                </h3>
                <p className="text-secondary mt-1.5 text-[13px] leading-5">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </GlassPanel>
  );
}
