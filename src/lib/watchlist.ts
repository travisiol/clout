"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * The watchlist, kept in localStorage.
 *
 * It is read through `useSyncExternalStore` rather than an effect that calls
 * setState: React 19 rejects that pattern, and the store version of it also
 * gets the server snapshot right — an empty set — so the first client render
 * matches the HTML and the stars do not flash on.
 */

const KEY = "clout:watchlist";

let snapshot: ReadonlySet<string> = new Set();
let serialised = "";
const listeners = new Set<() => void>();

function load(): ReadonlySet<string> {
  if (typeof window === "undefined") return snapshot;
  let raw = "";
  try {
    raw = localStorage.getItem(KEY) ?? "";
  } catch {
    return snapshot;
  }
  if (raw === serialised) return snapshot;
  serialised = raw;
  try {
    const parsed = JSON.parse(raw || "[]") as string[];
    snapshot = new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    snapshot = new Set();
  }
  return snapshot;
}

function persist(next: Set<string>) {
  snapshot = next;
  serialised = JSON.stringify([...next]);
  try {
    localStorage.setItem(KEY, serialised);
  } catch {
    // storage blocked; the list still works for this session
  }
  listeners.forEach((l) => l());
}

const EMPTY: ReadonlySet<string> = new Set();

export function useWatchlist() {
  const watchlist = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      // another tab can change it under us
      const onStorage = (e: StorageEvent) => {
        if (e.key === KEY) {
          serialised = "";
          load();
          listener();
        }
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", onStorage);
      };
    },
    load,
    () => EMPTY,
  );

  const toggle = useCallback((id: string) => {
    const next = new Set(load());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    persist(next);
  }, []);

  return { watchlist, toggle };
}
