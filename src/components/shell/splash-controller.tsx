"use client";

import * as React from "react";

/** Marks the splash as finished, so later hero animations no longer wait for it. */
export function SplashController() {
  React.useEffect(() => {
    const root = document.documentElement;
    // Matches the exit timing in globals.css; a timer is robust if animations are skipped.
    const id = window.setTimeout(() => {
      root.dataset.splash = "seen";
    }, 2400);
    return () => window.clearTimeout(id);
  }, []);
  return null;
}
