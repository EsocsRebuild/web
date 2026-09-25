"use client";

import * as React from "react";

/** Marks the splash as seen once it has lifted, for the rest of this visit. */
export function SplashController() {
  React.useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.splash === "seen") return;
    const done = () => {
      root.dataset.splash = "seen";
      try {
        sessionStorage.setItem("esocs:splash", "1");
      } catch {
        // Storage blocked: the splash simply plays again next load.
      }
    };
    // Matches the exit timing in globals.css; a timer is robust if animations are skipped.
    const id = window.setTimeout(done, 2400);
    return () => window.clearTimeout(id);
  }, []);
  return null;
}
