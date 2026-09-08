/**
 * Number formatting for the market.
 *
 * Two rules run through all of it. Big money is abbreviated to three
 * significant figures ($12.3K, $5.25M) because the reader is comparing
 * magnitudes, not auditing. Share prices are *not* abbreviated and never
 * rounded to a fixed number of decimals: a share can be worth $0.0000123, and
 * a price that shows as $0.00 is worse than no price at all — so the decimal
 * count follows the magnitude down.
 */

const ABBREV: [number, string][] = [
  [1e12, "T"],
  [1e9, "B"],
  [1e6, "M"],
  [1e3, "K"],
];

/** 1234 → "1.23K"; 12345 → "12.3K"; 123456 → "123K". Three significant digits. */
export function abbreviate(value: number, digits = 3): string {
  const abs = Math.abs(value);
  for (const [size, suffix] of ABBREV) {
    if (abs >= size) {
      const scaled = value / size;
      const decimals = Math.max(0, digits - String(Math.trunc(Math.abs(scaled))).length);
      return trimZeros(scaled.toFixed(decimals)) + suffix;
    }
  }
  return trimZeros(value.toFixed(abs < 1 && abs > 0 ? 2 : 0));
}

function trimZeros(s: string): string {
  return s.includes(".") ? s.replace(/\.?0+$/, "") : s;
}

/** Money as a magnitude: $26.4K, $5.25M, $208. */
export function formatUsd(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  if (abs >= 1000) return `${sign}$${abbreviate(abs)}`;
  if (abs >= 1) return `${sign}$${abs.toFixed(abs >= 100 ? 0 : abs >= 10 ? 1 : 2).replace(/\.?0+$/, "")}`;
  if (abs === 0) return "$0";
  return `${sign}${formatPrice(abs)}`;
}

/** Signed money, for anything that is a gain or a loss: +$5.25M, -$1,204. */
export function formatSignedUsd(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  const abs = Math.abs(value);
  if (abs >= 1e6 || abs >= 1000) return `${sign}$${abbreviate(abs)}`;
  return `${sign}$${Math.round(abs).toLocaleString("en-US")}`;
}

/**
 * A share price, in full. Below a cent the decimal count grows to keep three
 * significant figures, so $0.0000123 survives instead of collapsing to zero.
 */
export function formatPrice(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value) || value === 0) return "—";
  const abs = Math.abs(value);
  if (abs >= 1) return `$${abs.toLocaleString("en-US", { maximumFractionDigits: 4 })}`;
  const leadingZeros = Math.max(0, Math.floor(-Math.log10(abs)));
  const decimals = Math.min(18, leadingZeros + 3);
  return `$${abs.toFixed(decimals).replace(/0+$/, "")}`;
}

/** +198.30% / -4.12% / +0.00% — always two decimals, always signed. */
export function formatPct(value: number | null | undefined, decimals = 2): string {
  if (value == null || !Number.isFinite(value)) return "—";
  const sign = value > 0 ? "+" : value < 0 ? "-" : "+";
  return `${sign}${Math.abs(value).toFixed(decimals)}%`;
}

/** Counts: 543.8K followers, 3.1K trades. */
export function formatCount(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  if (Math.abs(value) < 1000) return String(Math.round(value));
  return abbreviate(value);
}

/** Share amounts, which run to nine figures. */
export function formatShares(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  if (Math.abs(value) < 1000) return trimZeros(value.toFixed(2));
  return abbreviate(value);
}

/** 0x1234…abcd */
export function shortAddress(address: string | null | undefined, lead = 6): string {
  if (!address) return "—";
  if (address.length <= lead + 6) return address;
  return `${address.slice(0, lead)}…${address.slice(-4)}`;
}

/** A colour class for a signed value. Zero is ink, not green. */
export function toneFor(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value) || value === 0) return "text-ink";
  return value > 0 ? "text-positive" : "text-negative";
}

const RELATIVE = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export function timeAgo(iso: string | number | null | undefined): string {
  if (iso == null) return "—";
  const then = typeof iso === "number" ? iso : Date.parse(iso);
  if (!Number.isFinite(then)) return "—";
  const seconds = Math.round((then - Date.now()) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 60) return RELATIVE.format(Math.round(seconds), "second");
  if (abs < 3600) return RELATIVE.format(Math.round(seconds / 60), "minute");
  if (abs < 86400) return RELATIVE.format(Math.round(seconds / 3600), "hour");
  return RELATIVE.format(Math.round(seconds / 86400), "day");
}

/**
 * A stable colour for an avatar that has not loaded, keyed off the handle so
 * the same trader always gets the same one. The pairs are picked to stay
 * legible against the light page rather than to be pretty on their own.
 */
const AVATAR_COLORS: [string, string][] = [
  ["#E867B5", "#2A0A1E"],
  ["#2FB7A6", "#04201C"],
  ["#F5C542", "#2B1D00"],
  ["#6C7BF7", "#0B0F33"],
  ["#F0733E", "#2A0F02"],
  ["#4FA8F5", "#031B33"],
  ["#9C6BF0", "#1A0733"],
  ["#4BC46B", "#03210E"],
];

export function avatarColor(seed: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
