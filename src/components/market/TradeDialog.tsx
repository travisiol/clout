"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { Trader } from "@/lib/market-types";
import { TradePad } from "./TradePad";
import { CloseIcon } from "@/components/ui/icons";

/**
 * Trading without leaving the board.
 *
 * The same pad the token page runs, in a modal, so a Buy pressed on a card
 * does not cost you your place in a 150-row list. It keeps a link through to
 * the full market for everything the pad deliberately leaves out — chart,
 * holders, trades.
 */
export function TradeDialog({
  open,
  ethUsd,
  onClose,
  onSideChange,
}: {
  open: { trader: Trader; side: "buy" | "sell" } | null;
  ethUsd: number;
  onClose: () => void;
  onSideChange: (side: "buy" | "sell") => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  // The dialog keeps no state of its own: which side is selected lives with
  // whoever opened it, so there is nothing here to re-sync when `open`
  // changes — only the imperative open/close the <dialog> element needs.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="border-border bg-surface text-ink shadow-panel m-auto w-[min(420px,calc(100vw-32px))] rounded-2xl border p-0"
    >
      {open && (
        <div className="relative p-4">
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="btn-glass absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full"
          >
            <CloseIcon size={15} />
          </button>

          {open.trader.token ? (
            <>
              <TradePad
                trader={open.trader}
                ethUsd={ethUsd}
                side={open.side}
                onSideChange={onSideChange}
                compact
              />
              <Link
                href={`/token/${open.trader.token.address}`}
                className="text-blue-text mt-3 block text-center text-[12px] font-semibold hover:underline"
              >
                Open the full market →
              </Link>
            </>
          ) : (
            <div className="px-2 py-6 text-center">
              <p className="text-ink text-[16px] leading-6 font-extrabold">
                {open.trader.name} has no share yet
              </p>
              <p className="text-secondary mt-2 text-[13px] leading-5">
                Nobody has launched a curve for @{open.trader.handle}. The first
                launch mints the supply and opens the market; every trade after
                that pays them a {"1%"} fee.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="btn-glass mt-4 h-10 rounded-full px-5 text-sm font-semibold"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}
