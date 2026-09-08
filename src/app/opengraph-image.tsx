import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${site.name} · ${site.tagline}`;

/**
 * The share card.
 *
 * It says the one thing that makes someone click — the mechanism, not the
 * brand — over the same sky the site is built on. The type is set in whatever
 * the renderer has rather than a loaded face: at this size the headline
 * carries it, and shipping a webfont into every card render is not worth the
 * two hundred milliseconds.
 */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background:
            "linear-gradient(160deg, #dcecff 0%, #eef7fe 46%, #f6faff 100%)",
          color: "#07133c",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 18,
              background:
                "linear-gradient(160deg, #8ab4ff 0%, #3f7ff5 52%, #4a3fb0 100%)",
              color: "#fff",
              fontSize: 42,
              fontWeight: 900,
            }}
          >
            c.
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, color: "#10224a" }}>
            {site.name}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 92,
              lineHeight: 1,
              fontWeight: 900,
              letterSpacing: "-0.045em",
            }}
          >
            Trade the traders.
          </div>
          <div
            style={{
              fontSize: 92,
              lineHeight: 1.05,
              fontWeight: 900,
              letterSpacing: "-0.045em",
              color: "#0767f8",
            }}
          >
            Back the best.
          </div>
        </div>

        <div style={{ fontSize: 30, color: "#42557a", maxWidth: 900 }}>
          Losers burn. Winners get buybacks. Every hour.
        </div>
      </div>
    ),
    size,
  );
}
