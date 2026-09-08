import type { Metadata } from "next";
import Link from "next/link";
import { getMarket } from "@/lib/market";
import { PortfolioPanel } from "@/components/portfolio/PortfolioPanel";
import { ArrowRightIcon } from "@/components/ui/icons";

export const revalidate = 15;

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Your KOL shares, their value, and the traders behind them.",
};

export default async function PortfolioPage() {
  const market = await getMarket("24h", 200);

  return (
    <main className="relative mx-auto w-full max-w-[var(--page-max)] flex-1 px-4 pb-16 sm:px-6 desk:px-20">
      <div className="flex flex-wrap items-end justify-between gap-4 pt-6 pb-6 md:pt-8">
        <div>
          <h1 className="font-display text-ink text-[34px] leading-none font-black tracking-[-0.04em] md:text-[42px] md:leading-[46px] md:tracking-[-1.8px]">
            Your portfolio
          </h1>
          <p className="text-secondary mt-2 text-[17px] leading-[23px]">
            Your positions. Your performance.
          </p>
        </div>
        <Link
          href="/"
          className="btn-glass text-ink inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold"
        >
          Explore KOLs
          <ArrowRightIcon size={16} />
        </Link>
      </div>

      <PortfolioPanel market={market} />
    </main>
  );
}
