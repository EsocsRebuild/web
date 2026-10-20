"use client";

import * as React from "react";

/**
 * Manages the cinematic splash lifecycle:
 * - Extended 3.6s delay for rich cinematic ambiance
 * - Instant skip on tap/click anywhere
 * - Instant skip on Escape, Enter, or Space keys
 * - Instant skip for prefers-reduced-motion
 */
export function SplashController() {
  React.useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const dismiss = () => {
      root.dataset.splash = "seen";
    };

    // Extended 6.2s delay for rich cinematic experience
    const timer = window.setTimeout(dismiss, reduce ? 50 : 6200);

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
