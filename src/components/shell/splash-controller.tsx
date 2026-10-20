"use client";

import * as React from "react";

/**
 * Manages the cinematic splash lifecycle:
 * - Plays the 2.8s sacred cinematic reveal
 * - Allows instant skip by tapping/clicking anywhere on the screen
 * - Responds to Escape, Enter, or Space keys for instant skip
 * - Honors prefers-reduced-motion for instant skip
 * - Sets data-splash="seen" on root element when complete
 */
export function SplashController() {
  React.useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const dismiss = () => {
      root.dataset.splash = "seen";
    };

    // Auto-dismiss after the cinematic experience completes (2.8s)
    const timer = window.setTimeout(dismiss, reduce ? 50 : 2800);

    // Instant click-to-enter anywhere on the splash screen
    const splashEl = document.querySelector(".app-splash");
    splashEl?.addEventListener("click", dismiss);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === " " || e.key === "Enter") {
        dismiss();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(timer);
      splashEl?.removeEventListener("click", dismiss);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return null;
}
