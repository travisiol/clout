import type { CSSProperties } from "react";

/**
 * The panel every large surface on the site is made of: the cloud photograph,
 * blurred and washed white until only its luminance survives, under a lit
 * inner edge. Blurring a photograph rather than laying down a gradient is what
 * gives these panels their uneven light — a gradient is perfectly smooth, and
 * a sky is not.
 *
 * `focus` moves the crop so that three panels in a row don't show the same
 * cloud three times.
 */
export function GlassPanel({
  children,
  focus = "50% 45%",
  className = "",
  style,
}: {
  children: React.ReactNode;
  focus?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_0_0_1px_rgba(150,190,240,0.35),0_8px_20px_rgba(28,101,201,0.12)] ${className}`}
      style={style}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/brand/sky-clouds.jpg"
          alt=""
          draggable={false}
          className="h-full w-full scale-110 object-cover"
          style={{ objectPosition: focus }}
        />
        <div className="absolute inset-0 bg-white/45 backdrop-blur-[10px] backdrop-saturate-150" />
        <div
          className="absolute inset-x-0 top-0 h-1/2"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(255,255,255,0.6), rgba(255,255,255,0.05))",
          }}
        />
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
