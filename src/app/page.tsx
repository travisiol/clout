import Link from "next/link";
import { getMarket } from "@/lib/market";
import { HeroBubbles } from "@/components/market/HeroBubbles";
import { StatsRow } from "@/components/market/StatsRow";
import { MarketSection } from "@/components/market/MarketSection";
import { HowItWorks } from "@/components/market/HowItWorks";
import { ArrowRightIcon } from "@/components/ui/icons";

export const revalidate = 15;

export default async function MarketsPage() {
  const market = await getMarket("24h", 200);

  return (
    <main className="relative mx-auto w-full max-w-[var(--page-max)] flex-1 px-4 pb-16 sm:px-6 desk:px-20">
      <section aria-labelledby="hero-title" className="relative">
        <div className="grid gap-y-2 pt-6 pb-4 md:pt-8 md:pb-6 desk:grid-cols-[minmax(480px,44fr)_56fr] desk:items-center desk:gap-x-10 desk:py-8 desk:min-h-[440px]">
          <div className="max-w-[640px]">
            <h1
              id="hero-title"
              className="font-display text-[clamp(34px,8.6vw,44px)] leading-[0.98] font-black tracking-[-0.045em] md:text-[clamp(46px,3.8vw,58px)] md:leading-[0.94] desk:text-[64px] desk:leading-[60px] desk:tracking-[-3px]"
            >
              <span className="text-ink block">Trade the traders.</span>
              <span className="text-blue-text block">Back the best.</span>
            </h1>
            <p className="text-secondary mt-4 max-w-[520px] text-[16px] leading-6 md:text-[18px] md:leading-7 desk:mt-4 desk:text-[19px] desk:leading-[28px] desk:tracking-[-0.2px]">
              Back the traders who win. Every hour, the losers’ shares are sold
              and the proceeds buy back the winners’, so capital keeps flowing to
              the best.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 desk:mt-8">
              <Link
                href="#kol-market"
                className="btn-primary inline-flex h-12 items-center justify-center gap-3 rounded-full px-6 text-[18px] leading-6 font-semibold whitespace-nowrap desk:h-[54px] desk:min-w-[268px] desk:text-[20px]"
              >
                Explore the market
                <ArrowRightIcon size={23} />
              </Link>
              <Link
                href="#how-it-works"
                className="text-ink-soft decoration-blue text-[17px] leading-6 font-medium underline decoration-[1.5px] underline-offset-[5px] transition-colors hover:text-blue-text desk:text-[19px] desk:leading-[25px]"
              >
                How it works
              </Link>
            </div>
          </div>

          <div className="mt-8 desk:mt-0">
            <div className="desk:hidden">
              <HeroBubbles traders={market.traders} />
            </div>
            <div className="hidden desk:block">
              <HeroBubbles traders={market.traders} originRight />
            </div>
          </div>
        </div>
      </section>

      <section
        id="kol-market"
        aria-labelledby="kol-market-title"
        className="mt-10 scroll-mt-8 md:mt-12"
      >
        <StatsRow metrics={market.metrics} />
        <MarketSection initial={market} />
      </section>

      <HowItWorks />
    </main>
  );
}
