"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Trader } from "@/lib/market-types";
import { Avatar } from "@/components/ui/Avatar";
import { formatSignedUsd } from "@/lib/format";

/**
 * The podium: the three best days on the board, blown into glass.
 *
 * The layout is fixed at 730×336 and scaled to fit, rather than reflowed —
 * these three bubbles are one composition (the middle one is larger and rides
 * higher, the outer two sit level) and rebuilding that with flexbox at each
 * breakpoint would lose the arrangement that makes it read as a podium. A
 * ResizeObserver keeps the scale at exactly the container's width so it never
 * overflows and never leaves a gap.
 */

const STAGE_W = 730;
const STAGE_H = 336;

const SLOTS = [
  { left: 10, top: 76, size: 210, ring: 19, captionLeft: 25, captionTop: 174, captionW: 160 },
  { left: 240, top: 16, size: 250, ring: 20, captionLeft: 15, captionTop: 214, captionW: 220 },
  { left: 510, top: 76, size: 210, ring: 19, captionLeft: 25, captionTop: 174, captionW: 160 },
] as const;

/** The podium reads middle-first: rank 2, rank 1, rank 3. */
const ORDER = [1, 0, 2] as const;

export function HeroBubbles({
  traders,
  originRight = false,
}: {
  traders: Trader[];
  originRight?: boolean;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      setScale(Math.min(1, width / STAGE_W));
    });
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  const top3 = ORDER.map((i) => traders[i]).filter(Boolean);
  if (top3.length === 0) return <div style={{ height: STAGE_H }} />;

  return (
    <div ref={hostRef} className="relative" style={{ height: STAGE_H * scale }}>
      <div
        style={{
          width: STAGE_W,
          height: STAGE_H,
          transform: `scale(${scale})`,
          transformOrigin: originRight ? "top right" : "top left",
          position: "absolute",
          top: 0,
          ...(originRight ? { right: 0 } : { left: 0 }),
        }}
      >
        <div className="relative h-full w-full">
          <span
            aria-hidden="true"
            className="glass-orb absolute"
            style={{ left: -64, top: 30, width: 39, height: 39 }}
          />
          <span
            aria-hidden="true"
            className="glass-orb absolute"
            style={{ left: 702, top: -4, width: 55, height: 55 }}
          />

          {ORDER.map((traderIndex, slotIndex) => {
            const trader = traders[traderIndex];
            if (!trader) return null;
            const slot = SLOTS[slotIndex];
            const avatar = slot.size - slot.ring * 2;

            const body = (
              <>
                <div className="absolute inset-0">
                  <div
                    className="glass-bubble absolute inset-0"
                    style={{ width: slot.size, height: slot.size }}
                  >
                    <span
                      className="inline-flex shrink-0 rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)]"
                      style={{
                        width: avatar,
                        height: avatar,
                        left: slot.ring,
                        top: slot.ring,
                      }}
                    >
                      <Avatar
                        src={trader.profilePictureLink}
                        name={trader.name}
                        size={avatar - 2}
                        sizes="256px"
                      />
                    </span>
                  </div>
                </div>
                <span
                  aria-hidden="true"
                  className="glass-caption absolute z-10 flex flex-col items-center rounded-[29px] px-2.5 py-2.5 text-center"
                  style={{
                    left: slot.captionLeft,
                    top: slot.captionTop,
                    width: slot.captionW,
                  }}
                >
                  <span
                    className="text-ink w-full truncate text-[16px] leading-5 font-extrabold tracking-[-0.01em] uppercase"
                    title={trader.name}
                  >
                    {trader.name}
                  </span>
                  <span className="tnum text-positive text-[23px] leading-7 font-bold">
                    {formatSignedUsd(trader.pnl24h)}
                  </span>
                  <span className="text-muted text-[10px] leading-[13px] font-medium tracking-[0.02em] uppercase">
                    Daily PnL
                  </span>
                </span>
              </>
            );

            const style = {
              left: slot.left,
              top: slot.top,
              width: slot.size,
              height: slot.size,
            };
            const label = `${trader.name}, daily PnL ${formatSignedUsd(trader.pnl24h)}`;

            return trader.token ? (
              <Link
                key={trader.id}
                href={`/token/${trader.token.address}`}
                aria-label={label}
                className="group focus-visible:shadow-focus absolute rounded-full"
                style={style}
              >
                {body}
              </Link>
            ) : (
              <span key={trader.id} aria-label={label} className="absolute rounded-full" style={style}>
                {body}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
