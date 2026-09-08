import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTraderByToken } from "@/lib/market";
import { TokenHeader } from "@/components/token/TokenHeader";
import { PriceChart } from "@/components/token/PriceChart";
import { BondingProgress } from "@/components/token/BondingProgress";
import { HoldersPanel } from "@/components/token/HoldersPanel";
import { TokenSidebar } from "@/components/token/TokenSidebar";
import { sampleHolders } from "@/lib/seed";

export const revalidate = 15;

type Props = { params: Promise<{ address: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { address } = await params;
  const found = await getTraderByToken(address);
  if (!found) return { title: "Unknown share" };
  const { trader } = found;
  return {
    title: `${trader.name} shares ($${trader.token!.symbol})`,
    description: `Buy and sell ${trader.name} (@${trader.handle}) shares. Trading fees pay the trader.`,
  };
}

export default async function TokenPage({ params }: Props) {
  const { address } = await params;
  const found = await getTraderByToken(address);
  if (!found?.trader.token) notFound();

  const { trader, ethUsd } = found;
  const token = trader.token!;

  // Shareholder counts are cheap enough to compute here for a sample market,
  // so the panel above the fold is not waiting on a client fetch.
  const holders = token.source === "sample" ? sampleHolders(token) : [];
  const top10 = holders.length
    ? holders.slice(0, 10).reduce((sum, h) => sum + h.supplyPct, 0)
    : null;

  return (
    <main className="relative mx-auto w-full max-w-[var(--page-max)] flex-1 px-4 pb-16 sm:px-6 desk:px-20">
      <div className="pt-6 md:pt-8">
        <TokenHeader trader={trader} />
      </div>

      <div className="mt-4 grid gap-4 desk:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-4">
          <PriceChart token={token} />
          <BondingProgress
            token={token}
            shareholders={holders.length || token.holdersCount}
            top10Pct={top10}
          />
          <HoldersPanel token={token} />
        </div>

        <TokenSidebar trader={trader} ethUsd={ethUsd} />
      </div>
    </main>
  );
}
