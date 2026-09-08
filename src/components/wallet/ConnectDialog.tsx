"use client";

import { useEffect, useRef } from "react";
import { site } from "@/lib/site";
import { useWallet } from "./WalletProvider";
import { BrandMark } from "@/components/site/BrandMark";
import { CloseIcon, ExternalLinkIcon } from "@/components/ui/icons";

const WALLETS = [
  { name: "MetaMask", href: "https://metamask.io/download/" },
  { name: "Phantom", href: "https://phantom.app/download" },
  { name: "Coinbase Wallet", href: "https://www.coinbase.com/wallet/downloads" },
  { name: "Rabby", href: "https://rabby.io/" },
] as const;

/**
 * A real <dialog>, so the browser handles the backdrop, the focus trap and
 * Escape — three things a div reimplements badly. The sky band across its top
 * is the same photograph the page uses, cropped tight, which is what ties a
 * modal that appears over anything back to the site behind it.
 */
export function ConnectDialog() {
  const { dialogOpen, closeDialog, connect, connecting, hasInjected } = useWallet();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (dialogOpen && !el.open) el.showModal();
    if (!dialogOpen && el.open) el.close();
  }, [dialogOpen]);

  return (
    <dialog
      ref={ref}
      onClose={closeDialog}
      onClick={(e) => {
        // clicking the backdrop lands on the dialog element itself
        if (e.target === ref.current) closeDialog();
      }}
      className="text-ink m-auto w-[min(380px,calc(100vw-40px))] overflow-visible border-0 bg-transparent p-0"
    >
      <div className="relative">
        <button
          type="button"
          aria-label="Close"
          onClick={closeDialog}
          className="btn-glass absolute -top-3 -right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full"
        >
          <CloseIcon size={16} />
        </button>

        <div className="shadow-panel relative overflow-hidden rounded-[28px] border border-white/80 bg-white">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-[150px] overflow-hidden"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/brand/sky-clouds.jpg"
              alt=""
              draggable={false}
              className="h-full w-full object-cover object-[70%_45%]"
            />
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, rgba(45,143,255,0.35) 0%, rgba(8,117,249,0.28) 40%, rgba(255,255,255,0.8) 80%, #fff 100%)",
              }}
            />
          </div>

          <div className="relative px-5 pt-6 pb-5">
            <div className="flex flex-col items-center text-center">
              <BrandMark size={64} />
              <p className="text-ink mt-3 text-[18px] leading-6 font-extrabold tracking-[-0.01em]">
                Connect a wallet
              </p>
              <p className="text-secondary mt-0.5 text-[12px] leading-4">
                You stay signed in on this device until you disconnect.
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={connect}
                disabled={!hasInjected || connecting}
                className="btn-glass flex h-14 items-center gap-3 rounded-full pr-4 pl-2 text-left disabled:cursor-not-allowed"
              >
                <span className="bg-blue flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white">
                  I
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-ink truncate text-[14px] leading-5 font-semibold">
                    Injected
                  </span>
                  <span className="text-muted text-[11px] leading-4">
                    {hasInjected ? "Detected in browser" : "No wallet detected"}
                  </span>
                </span>
                <span className="text-blue-text text-[12px] font-bold">
                  {connecting ? "Waiting…" : "Connect"}
                </span>
              </button>
            </div>

            <div className="border-hairline mt-4 border-t pt-3">
              <p className="text-muted text-center text-[10.5px] font-semibold tracking-[0.08em] uppercase">
                Don&apos;t have a wallet?
              </p>
              <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                {WALLETS.map((w) => (
                  <a
                    key={w.name}
                    href={w.href}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-glass text-ink inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold"
                  >
                    {w.name}
                    <ExternalLinkIcon size={11} className="text-muted" />
                  </a>
                ))}
              </div>
            </div>

            <p className="text-muted mt-4 text-center text-[10.5px] leading-4">
              Robinhood Chain · trades settle via pons
            </p>
            <span className="sr-only">{site.name}</span>
          </div>
        </div>
      </div>
    </dialog>
  );
}
