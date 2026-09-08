import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/**
 * The favicon.
 *
 * The balloon renderer needs a canvas, so it cannot run here — this is the
 * same mark reduced to what survives at 16 pixels: the letter, the dot, and
 * one highlight. Anything more detailed becomes mud at tab size.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(160deg, #8ab4ff 0%, #3f7ff5 52%, #4a3fb0 100%)",
          borderRadius: 16,
          color: "#ffffff",
          fontSize: 46,
          fontWeight: 900,
          letterSpacing: "-0.06em",
          boxShadow: "inset 0 3px 0 rgba(255,255,255,0.55)",
        }}
      >
        c.
      </div>
    ),
    size,
  );
}
