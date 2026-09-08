import { site } from "@/lib/site";
import { XIcon } from "@/components/ui/icons";
import { BalloonArt } from "./BalloonArt";

/**
 * The footer is two things: the smallest possible disclaimer, and the wordmark
 * at the largest possible size.
 *
 * The wordmark is bled off both edges and then faded out top and bottom into
 * the page colour, so it reads as a shape the page ends on rather than a logo
 * someone parked there. It is decorative — aria-hidden — because the brand is
 * already announced in the header.
 */
export function SiteFooter() {
  return (
    <footer className="relative mt-8 w-full overflow-hidden">
      <div className="mx-auto w-full max-w-[var(--page-max)] px-4 sm:px-6 desk:px-20">
        <div className="border-hairline flex flex-col gap-4 border-t py-5 md:flex-row md:items-center md:justify-between md:gap-10">
          <a
            href={site.xUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`Follow ${site.name} on X`}
            className="text-ink inline-flex shrink-0 items-center gap-2.5 self-start rounded-full text-[14px] leading-5 font-semibold transition-colors duration-150 hover:text-blue-text"
          >
            <span className="btn-glass text-ink inline-flex h-9 w-9 items-center justify-center rounded-full">
              <XIcon size={15} />
            </span>
            Follow us
          </a>
          <div className="max-w-[560px] md:text-right">
            <p className="text-ink-soft text-[11px] leading-4 font-semibold">
              Not affiliated with any KOL, Fomo, Robinhood or pons. Trade at
              your own risk. DYOR.
            </p>
            <p className="text-muted mt-1 text-[10px] leading-[14px]">
              {site.name} lists KOL shares as they trade on chain. Nothing here
              is financial advice, and every trade can go to zero. Prices from
              Robinhood Chain via pons · PnL from Fomo.
            </p>
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none relative mt-2 w-full select-none"
      >
        <BalloonArt
          text={site.wordmark}
          className="w-full [&>.balloon-fallback]:text-[12vw]"
          imgClassName="block h-auto w-full [filter:drop-shadow(0_6px_14px_rgba(20,90,210,0.18))]"
          fallbackClassName="w-full text-center leading-none"
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(180deg, #f0f8ff 0%, rgba(240,248,255,0.85) 22%, rgba(240,248,255,0.35) 55%, rgba(240,248,255,0) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(0deg, #f0f8ff 0%, rgba(240,248,255,0.9) 18%, rgba(240,248,255,0) 45%)",
          }}
        />
      </div>
    </footer>
  );
}
