"use client";

import { usePathname, useSearchParams } from "next/navigation";
import * as React from "react";

import { cn } from "@/lib/utils";
import styles from "./transit-architecture.module.scss";

/**
 * RouteFilament: A high-precision sacred gold transit indicator at the viewport apex.
 *
 * Provides immediate feedback on route transit, preventing users from feeling lost or
 * wondering if their click registered, while eliminating jarring navigation disorientation.
 */
export function RouteFilament() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [progress, setProgress] = React.useState<number>(0);
  const [visible, setVisible] = React.useState<boolean>(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Complete and hide on route resolution
  React.useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout> | null = null;
    const startTimer = setTimeout(() => {
      setProgress(100);
      hideTimer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 280);
    }, 16);

    return () => {
      clearTimeout(startTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [pathname, searchParams]);

  // Intercept internal link clicks to trigger instant visual feedback
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        target.target === "_blank" ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      // Check if it's the exact same URL
      const currentUrl = window.location.pathname + window.location.search;
      if (href === currentUrl) return;

      // Start transit animation immediately
      if (timerRef.current) clearTimeout(timerRef.current);
      setVisible(true);
      setProgress(25);

      timerRef.current = setTimeout(() => {
        setProgress((prev) => (prev < 75 ? 75 : prev));
      }, 150);
    };

    window.addEventListener("click", handleClick, { capture: true });
    return () => {
      window.removeEventListener("click", handleClick, { capture: true });
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[9999] h-[2.5px] overflow-hidden"
    >
      <div
        className={cn(
          "h-full transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
          styles.routeFilamentBeam,
        )}
        style={{
          width: `${progress}%`,
          opacity: visible ? 1 : 0,
        }}
      />
    </div>
  );
}
