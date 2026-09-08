"use client";

import { useEffect, useId, useRef } from "react";
import { drawBalloonWord } from "@/lib/balloon";

/** Bump when the renderer's output changes, or browsers keep serving the old look. */
const CACHE_VERSION = 3;

/**
 * Brand lettering, inflated for real — see lib/balloon.ts for the how.
 *
 * The reference for this look is a foil balloon: a tube with a circular
 * cross-section and a hard weld along its spine, not a blurred letter. That
 * is why it is an exact distance field rather than a CSS filter, and why it
 * is worth a few hundred milliseconds of arithmetic on first paint. The
 * result never changes, so it is kept as a data URL in localStorage and every
 * later visit just decodes it.
 *
 * The swap from fallback to rendered image runs through a `data-ready`
 * attribute driven by CSS, not an imperative `style.opacity`: React owns the
 * image's style prop and would wipe an imperative write on its next render,
 * leaving the image transparent *and* the fallback hidden.
 */
export function BalloonArt({
  text,
  className = "",
  imgClassName = "",
  fallbackClassName = "",
  fontSize,
}: {
  text: string;
  className?: string;
  imgClassName?: string;
  fallbackClassName?: string;
  /** Render resolution in device pixels for one em. Small marks need less. */
  fontSize?: number;
}) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const reactId = useId();

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    let cancelled = false;
    const cacheKey = `clout:balloon:${CACHE_VERSION}:${fontSize ?? 0}:${text}`;

    // `load`, not `decode()`: decode rejects often enough on a data URL
    // assigned before the first paint, and a rejection there strands the
    // fallback on screen.
    const reveal = (src: string) =>
      new Promise<void>((resolve) => {
        const show = () => {
          if (!cancelled && wrapRef.current) wrapRef.current.dataset.ready = "1";
          resolve();
        };
        img.onload = show;
        img.onerror = () => resolve();
        img.src = src;
        if (img.complete && img.naturalWidth > 0) show();
      });

    (async () => {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          await reveal(cached);
          return;
        }
      } catch {
        // private mode or storage disabled — just render it
      }

      const declared = getComputedStyle(document.documentElement)
        .getPropertyValue("--font-balloon")
        .trim();
      const family = [declared, '"Baloo 2"', '"Arial Rounded MT Bold"', "sans-serif"]
        .filter(Boolean)
        .join(", ");

      try {
        // Measuring before the webfont lands would inflate the fallback face.
        // Only this face: `fonts.ready` would also wait on every Inter subset,
        // which has nothing to do with the wordmark.
        await document.fonts.load(`800 320px ${family}`);
      } catch {
        // no font loading API, or the load failed — draw with what we have
      }
      if (cancelled) return;

      const canvas = document.createElement("canvas");
      const ok = await drawBalloonWord(canvas, text, {
        fontFamily: family,
        ...(fontSize ? { fontSize } : {}),
      });
      if (!ok || cancelled) return;

      const url = canvas.toDataURL("image/webp", 0.95);
      await reveal(url);

      try {
        localStorage.setItem(cacheKey, url);
      } catch {
        // over quota — it still shows, it just re-renders next time
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [text, fontSize, reactId]);

  return (
    <span
      ref={wrapRef}
      className={`balloon-swap grid [&>*]:col-start-1 [&>*]:row-start-1 ${className}`}
    >
      <span
        aria-hidden="true"
        className={`balloon-fallback self-center justify-self-center font-black text-blue ${fallbackClassName}`}
        style={{ fontFamily: "var(--font-balloon), var(--font-display)" }}
      >
        {text}
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        alt={text}
        draggable={false}
        className={`balloon-img h-auto w-full select-none ${imgClassName}`}
      />
    </span>
  );
}
