"use client";

import * as React from "react";

/** Marks the splash as finished, so later hero animations no longer wait for it. */
export function SplashController() {
  React.useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Matches the exit timing in globals.css; if reduced motion, complete promptly.
    const id = window.setTimeout(
      () => {
        root.dataset.splash = "seen";
      },
      reduce ? 50 : 1800,
    );
    return () => window.clearTimeout(id);
  }, []);
  return null;
}
