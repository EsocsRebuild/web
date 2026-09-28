"use client";

import * as React from "react";

import { MAX_QUANTITY, lineKey, type BagLine } from "@/data/pricing";

/**
 * The shopping bag, kept on this device (localStorage) and shared by every
 * component through one external store, so the header count, the product page
 * and the bag page never disagree. Prices are never stored: the bag holds only
 * references and quantities, and is priced against the current catalogue.
 */

const KEY = "esocs:bag:v1";
const EMPTY: BagLine[] = [];

let lines: BagLine[] | null = null;
const listeners = new Set<() => void>();

function read(): BagLine[] {
  if (lines) return lines;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as unknown;
    lines = Array.isArray(parsed)
      ? parsed.filter(
          (l): l is BagLine =>
            typeof l?.productSlug === "string" &&
            (l.optionId === null || typeof l.optionId === "string") &&
            Number.isInteger(l.quantity) &&
            l.quantity > 0,
        )
      : [];
  } catch {
    lines = [];
  }
  return lines;
}

function write(next: BagLine[]) {
  lines = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage blocked: the bag still works for this visit.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    lines = null;
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const clamp = (n: number) => Math.min(Math.max(1, Math.floor(n)), MAX_QUANTITY);

export const bag = {
  add(line: BagLine) {
    const current = read();
    const key = lineKey(line);
    const existing = current.find((l) => lineKey(l) === key);
    write(
      existing
        ? current.map((l) => (lineKey(l) === key ? { ...l, quantity: clamp(l.quantity + line.quantity) } : l))
        : [...current, { ...line, quantity: clamp(line.quantity) }],
    );
  },
  setQuantity(key: string, quantity: number) {
    write(read().map((l) => (lineKey(l) === key ? { ...l, quantity: clamp(quantity) } : l)));
  },
  remove(key: string) {
    write(read().filter((l) => lineKey(l) !== key));
  },
  clear() {
    write([]);
  },
};

/** The bag's lines; empty on the server and on the first render. */
export function useBagLines(): BagLine[] {
  return React.useSyncExternalStore(subscribe, read, () => EMPTY);
}

/** Number of items in the bag, for the header. */
export function useBagCount(): number {
  return useBagLines().reduce((sum, l) => sum + l.quantity, 0);
}

const noop = () => () => {};

/** False on the server and during hydration; true once the bag can be read. */
export function useHydrated(): boolean {
  return React.useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
