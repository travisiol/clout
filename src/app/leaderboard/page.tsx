import type { Metadata } from "next";
import { getMarket } from "@/lib/market";
import { PodiumCard } from "@/components/leaderboard/PodiumCard";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";

export const revalidate = 15;

export const metadata: Metadata = {
  title: "Leaderboard",
  description:
    "Every KOL ranked by trading PnL, with holdings, trades, Fomo volume and the market cap of their shares.",
};

export default async function LeaderboardPage() {
  const market = await getMarket("24h", 200);
  const [first, second, third] = market.traders;

  return (
    <main className="relative mx-auto w-full max-w-[var(--page-max)] flex-1 px-4 pb-16 sm:px-6 desk:px-20">
      <div className="pt-6 pb-2 md:pt-8">
        <div className="grid gap-4">
          {first && <PodiumCard trader={first} wide />}
          <div className="grid gap-4 md:grid-cols-2">
            {second && <PodiumCard trader={second} />}
            {third && <PodiumCard trader={third} />}
          </div>
        </div>
      </div>

      <h1 className="sr-only">Leaderboard</h1>
      <LeaderboardTable initial={market} />
    </main>
  );
}
