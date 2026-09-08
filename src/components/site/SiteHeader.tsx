"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";
import { BrandMark } from "./BrandMark";
import { XIcon, WalletIcon } from "@/components/ui/icons";
import { useWallet } from "@/components/wallet/WalletProvider";
import { shortAddress } from "@/lib/format";

const NAV = [
  { href: "/", label: "Markets" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/portfolio", label: "Portfolio" },
] as const;

/**
 * The header floats on the sky rather than sitting on a bar: no background,
 * no border, only the glass of the two buttons. The active tab is marked with
 * a thick blue underline rather than a filled pill, because a pill here would
 * be a fourth piece of glass competing with the two that are actually
 * pressable.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const { address, openDialog, disconnect } = useWallet();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="mx-auto w-full max-w-[var(--page-max)]">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6 md:gap-0 md:py-5 desk:px-[112px]">
        <Link
          href="/"
          aria-label={`${site.name} home`}
          className="inline-flex shrink-0 items-center rounded-full"
        >
          <span className="md:hidden">
            <BrandMark size={36} />
          </span>
          <span className="hidden md:block">
            <BrandMark size={48} />
          </span>
        </Link>

        <div className="hidden md:ml-10 md:block">
          <nav aria-label="Primary" className="flex items-center gap-[34px]">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`relative flex h-11 items-center text-[16px] leading-[22px] font-semibold whitespace-nowrap transition-colors duration-150 hover:text-blue-text ${
                  isActive(item.href) ? "text-ink" : "text-ink-soft/85"
                }`}
              >
                {item.label}
                {isActive(item.href) && (
                  <span
                    aria-hidden="true"
                    className="bg-blue absolute -bottom-0.5 left-0 h-1 w-16 max-w-full rounded-full"
                  />
                )}
              </Link>
            ))}
          </nav>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 md:gap-3">
          <a
            href={site.xUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`Follow ${site.name} on X`}
            title="Follow us on X"
            className="btn-glass text-ink-soft flex h-[42px] items-center gap-2 rounded-full px-3 text-sm font-semibold whitespace-nowrap md:px-4"
          >
            <XIcon size={15} />
            <span className="hidden sm:inline">Follow us on X</span>
          </a>
          <button
            type="button"
            aria-label={address ? "Disconnect wallet" : "Connect wallet"}
            onClick={address ? disconnect : openDialog}
            className="btn-primary flex h-[42px] shrink-0 items-center gap-2 rounded-full px-3 text-sm font-semibold transition-colors duration-150 disabled:opacity-60 sm:px-5"
          >
            <WalletIcon size={17} />
            <span className="hidden whitespace-nowrap sm:inline">
              {address ? shortAddress(address, 6) : "Connect wallet"}
            </span>
          </button>
        </div>
      </div>

      <div className="border-hairline border-b px-4 pb-1 sm:px-6 md:hidden">
        <nav aria-label="Primary" className="flex items-center gap-6">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`relative flex h-10 items-center text-[15px] font-semibold whitespace-nowrap transition-colors duration-150 hover:text-blue-text ${
                isActive(item.href) ? "text-ink" : "text-ink-soft/85"
              }`}
            >
              {item.label}
              {isActive(item.href) && (
                <span
                  aria-hidden="true"
                  className="bg-blue absolute bottom-0 left-0 h-1 w-10 rounded-full"
                />
              )}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
