"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Candle, ShareToken } from "@/lib/market-types";
import { formatUsd } from "@/lib/format";
import { MaximizeIcon } from "@/components/ui/icons";

const SUPPLY = 1e9;

/**
 * The price chart, drawn as SVG.
 *
 * Candles rather than a line because this is a curve: the wick is where the
 * order was, the body is where it settled, and on a market this thin the two
 * are frequently far apart. The y-axis is quantised to a handful of round
 * numbers and drawn as hairlines behind the candles — a chart on this page
 * competes with a lot of glass, so the grid has to stay under it.
 *
 * MCap is the same series multiplied by supply, not a second fetch: on a
 * fixed-supply curve the two are the same shape, and switching between them
 * should not cost a request.
 */
export function PriceChart({ token }: { token: ShareToken }) {
  const [candles, setCandles] = useState<Candle[] | null>(null);
  const [mode, setMode] = useState<"price" | "mcap">("mcap");
  const [failed, setFailed] = useState<string | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/token/${token.address}/candles`);
        const body = (await res.json()) as { candles?: Candle[]; detail?: string };
        if (cancelled) return;
        if (!res.ok) {
          setFailed(body.detail ?? "No price history available for this share.");
          setCandles([]);
          return;
        }
        setCandles(body.candles ?? []);
      } catch {
        if (!cancelled) {
          setFailed("Could not load price history.");
          setCandles([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token.address]);

  const scale = mode === "mcap" ? SUPPLY : 1;

  const geometry = useMemo(() => {
    if (!candles || candles.length === 0) return null;
    const width = 1000;
    const height = 340;
    const padRight = 62;
    const padBottom = 54;
    const plotW = width - padRight;
    const plotH = height - padBottom;

    const highs = candles.map((c) => c.h * scale);
    const lows = candles.map((c) => c.l * scale);
    const max = Math.max(...highs);
    const min = Math.min(...lows);
    const span = max - min || max || 1;
    const top = max + span * 0.08;
    const bottom = Math.max(0, min - span * 0.08);

    const x = (i: number) => (i / candles.length) * plotW;
    const y = (v: number) => plotH - ((v - bottom) / (top - bottom || 1)) * plotH;
    const step = plotW / candles.length;

    const ticks = Array.from({ length: 6 }, (_, i) => bottom + ((top - bottom) * i) / 5);
    const maxVol = Math.max(...candles.map((c) => c.v), 1);

    return { width, height, plotW, plotH, x, y, step, ticks, maxVol, top, bottom };
  }, [candles, scale]);

  const shown = hover != null && candles ? candles[hover] : candles?.at(-1);

  if (candles === null) {
    return (
      <div className="shadow-panel h-[420px] animate-pulse rounded-2xl border border-white/85 bg-white/70" />
    );
  }

  return (
    <section className="shadow-panel overflow-hidden rounded-2xl border border-white/85 bg-white/85 backdrop-blur-md">
      <div className="border-hairline flex flex-wrap items-center gap-3 border-b p-4">
        <h2 className="text-ink text-[16px] leading-6 font-extrabold tracking-[-0.01em]">
          Market overview
        </h2>
        <div className="glass-field flex h-8 items-center rounded-full p-0.5">
          {(["price", "mcap"] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              className={`h-7 rounded-full px-3 text-[12.5px] transition-colors ${
                mode === m
                  ? "segment-active font-bold"
                  : "text-secondary hover:text-ink font-medium"
              }`}
            >
              {m === "price" ? "Price" : "MCap"}
            </button>
          ))}
        </div>
        <span className="text-muted inline-flex items-center gap-1.5 text-[12px]">
          <span className="bg-muted h-1.5 w-1.5 rounded-full" />
          {token.source === "sample" ? "Sample series" : "Polling"}
        </span>

        {shown && (
          <p className="tnum text-secondary ml-auto text-[12px] whitespace-nowrap">
            O <span className="text-ink font-semibold">{formatUsd(shown.o * scale)}</span>{" "}
            H <span className="text-ink font-semibold">{formatUsd(shown.h * scale)}</span>{" "}
            L <span className="text-ink font-semibold">{formatUsd(shown.l * scale)}</span>{" "}
            C <span className="text-ink font-semibold">{formatUsd(shown.c * scale)}</span>{" "}
            <span className="text-muted">Vol {formatUsd(shown.v)}</span>
          </p>
        )}
        <span className="segment-active tnum ml-2 inline-flex h-7 items-center rounded-full px-3 text-[12px] font-bold">
          1m
        </span>
        <button
          type="button"
          aria-label="Fullscreen chart"
          onClick={() => svgRef.current?.requestFullscreen?.()}
          className="btn-glass text-secondary flex h-7 w-7 items-center justify-center rounded-full"
        >
          <MaximizeIcon size={13} />
        </button>
      </div>

      {failed || !geometry ? (
        <p className="text-secondary p-10 text-center text-[13.5px] leading-5">
          {failed ?? "No trades yet on this curve."}
        </p>
      ) : (
        <svg
          ref={svgRef}
          viewBox={`0 0 ${geometry.width} ${geometry.height}`}
          className="block h-[340px] w-full bg-white"
          role="img"
          aria-label={`${token.symbol} ${mode === "mcap" ? "market cap" : "price"} history`}
          onMouseLeave={() => setHover(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = (e.clientX - rect.left) / rect.width;
            const i = Math.floor((ratio * geometry.width) / geometry.step);
            setHover(i >= 0 && candles && i < candles.length ? i : null);
          }}
        >
          {geometry.ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={0}
                x2={geometry.plotW}
                y1={geometry.y(tick)}
                y2={geometry.y(tick)}
                stroke="#e6eefa"
                strokeWidth={1}
              />
              <text
                x={geometry.plotW + 8}
                y={geometry.y(tick) + 4}
                fill="#8190a9"
                fontSize={11}
                fontFamily="var(--font-sans)"
              >
                {formatUsd(tick)}
              </text>
            </g>
          ))}

          {candles.map((candle, i) => {
            const up = candle.c >= candle.o;
            const colour = up ? "#12a04c" : "#e04a5c";
            const cx = geometry.x(i) + geometry.step / 2;
            const bodyTop = geometry.y(Math.max(candle.o, candle.c) * scale);
            const bodyBottom = geometry.y(Math.min(candle.o, candle.c) * scale);
            const w = Math.max(1.2, geometry.step * 0.62);
            return (
              <g key={candle.t} opacity={hover == null || hover === i ? 1 : 0.72}>
                <line
                  x1={cx}
                  x2={cx}
                  y1={geometry.y(candle.h * scale)}
                  y2={geometry.y(candle.l * scale)}
                  stroke={colour}
                  strokeWidth={1}
                />
                <rect
                  x={cx - w / 2}
                  y={bodyTop}
                  width={w}
                  height={Math.max(1, bodyBottom - bodyTop)}
                  fill={colour}
                />
                <rect
                  x={cx - w / 2}
                  y={geometry.plotH + 8 + (36 - (candle.v / geometry.maxVol) * 36)}
                  width={w}
                  height={Math.max(1, (candle.v / geometry.maxVol) * 36)}
                  fill={colour}
                  opacity={0.42}
                />
              </g>
            );
          })}

          {shown && (
            <line
              x1={0}
              x2={geometry.plotW}
              y1={geometry.y(shown.c * scale)}
              y2={geometry.y(shown.c * scale)}
              stroke="#0875f9"
              strokeDasharray="3 3"
              strokeWidth={1}
            />
          )}
        </svg>
      )}
    </section>
  );
}
