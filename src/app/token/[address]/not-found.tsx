import Link from "next/link";

export default function TokenNotFound() {
  return (
    <main className="relative mx-auto w-full max-w-[var(--page-max)] flex-1 px-4 pb-16 sm:px-6 desk:px-20">
      <div className="shadow-panel mt-10 rounded-2xl border border-white/85 bg-white/85 p-10 text-center backdrop-blur-md">
        <h1 className="font-display text-ink text-[30px] leading-9 font-black tracking-[-0.03em]">
          No share at that address
        </h1>
        <p className="text-secondary mx-auto mt-3 max-w-[440px] text-[15px] leading-6">
          Either this trader has not been launched yet, or the curve lives on a
          chain this market does not read. The board has everything that is
          live.
        </p>
        <Link
          href="/"
          className="btn-primary mt-6 inline-flex h-11 items-center rounded-full px-6 text-[15px] font-semibold"
        >
          Back to the market
        </Link>
      </div>
    </main>
  );
}
