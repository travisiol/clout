import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Which trader owns which share.
 *
 * There is no way to derive this from the chain: a curve does not know the X
 * handle it was launched for. So it is an explicit registry — a JSON file, or
 * the same JSON in an env var for hosts with a read-only filesystem — and an
 * empty one is a perfectly valid state. Every trader then shows "Launch",
 * which is the truth on a market where nothing has been launched yet.
 *
 * Shape: { "<handle>": { "token": "0x…", "curve": "0x…", "launchedAt"?, "launchTx"? } }
 */
export type ShareEntry = {
  handle: string;
  token: `0x${string}`;
  curve: `0x${string}`;
  symbol?: string;
  launchedAt?: string;
  launchTx?: string;
};

type RawEntry = Omit<ShareEntry, "handle" | "token" | "curve"> & {
  token: string;
  curve: string;
};

let cache: Map<string, ShareEntry> | null = null;

function parse(json: string): Map<string, ShareEntry> {
  const out = new Map<string, ShareEntry>();
  let raw: Record<string, RawEntry>;
  try {
    raw = JSON.parse(json) as Record<string, RawEntry>;
  } catch {
    return out;
  }
  for (const [handle, entry] of Object.entries(raw)) {
    if (!entry?.token || !entry?.curve) continue;
    out.set(handle.toLowerCase(), {
      ...entry,
      handle: handle.toLowerCase(),
      token: entry.token as `0x${string}`,
      curve: entry.curve as `0x${string}`,
    });
  }
  return out;
}

export async function readShareRegistry(): Promise<Map<string, ShareEntry>> {
  if (cache) return cache;

  const inline = process.env.SHARE_REGISTRY_JSON;
  if (inline) {
    cache = parse(inline);
    return cache;
  }

  try {
    const file = path.join(process.cwd(), "data", "shares.json");
    cache = parse(await readFile(file, "utf8"));
  } catch {
    // no registry on disk: nothing is launched, which is a valid market
    cache = new Map();
  }
  return cache;
}
