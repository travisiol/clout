"use client";

import { BalloonArt } from "./BalloonArt";
import { site } from "@/lib/site";

/**
 * The app mark: the brand initial and its dot, inflated.
 *
 * It is tipped in Y and X so it reads as an object sitting in the page rather
 * than a flat logo, and rights itself on hover — the only motion in the
 * header, and the reason the wrapper carries a perspective. The two drop
 * shadows are the same pair the glass panels use: a cool blue cast for weight
 * and a one-pixel white one for the lit edge.
 */
export function BrandMark({ size = 48 }: { size?: number }) {
  return (
    <span
      className="group/mark inline-flex shrink-0 select-none [perspective:520px]"
      /* the fallback letter inherits this size until the render lands */
      style={{ width: size, height: size, fontSize: Math.round(size * 0.82) }}
    >
      <BalloonArt
        text={site.mark}
        fontSize={260}
        className="ease-brand h-full w-full transition-transform duration-300 [transform-style:preserve-3d] motion-safe:[transform:rotateY(-16deg)_rotateX(7deg)] motion-safe:group-hover/mark:[transform:rotateY(0deg)_rotateX(0deg)]"
        imgClassName="h-full w-full object-contain [filter:drop-shadow(0_4px_8px_rgba(20,90,210,0.28))_drop-shadow(0_1px_1px_rgba(255,255,255,0.6))]"
        fallbackClassName="self-center justify-self-center text-[1em] leading-none"
      />
    </span>
  );
}
