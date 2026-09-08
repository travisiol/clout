"use client";

import { usePathname } from "next/navigation";

/**
 * The photographed sky that every page hangs from.
 *
 * It sits behind the header rather than inside the content column, and fades
 * into the flat page colour before the first panel starts — the clouds are
 * meant to be the light source for the glass below them, not a wallpaper you
 * keep noticing. The home page needs a much taller band because its hero
 * bubbles float in the sky itself; everywhere else the band stops just under
 * the page title.
 */
export function SkyBackdrop() {
  const pathname = usePathname();
  const tall = pathname === "/";

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 top-0 overflow-hidden ${
        tall
          ? "h-[720px] md:h-[640px]"
          : "h-[360px] md:h-[440px] desk:h-[480px]"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/brand/sky-clouds.jpg"
        alt=""
        width={2170}
        height={725}
        fetchPriority="high"
        decoding="async"
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: "center 38%" }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(246,251,255,0.55) 0%, rgba(246,251,255,0.38) 30%, rgba(240,248,255,0.45) 62%, rgba(238,247,254,0.92) 88%, #eef7fe 100%)",
        }}
      />
    </div>
  );
}
