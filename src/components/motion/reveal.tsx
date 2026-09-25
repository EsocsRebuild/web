"use client";

import { usePathname } from "next/navigation";
import * as React from "react";

/**
 * One observer for the whole app. Elements marked `data-reveal` that start below
 * the fold are hidden, then rise into place as they scroll into view. Anything
 * already on screen is left alone, so there is no flash and nothing is hidden
 * without JavaScript. Honours reduced motion.
 */
export function RevealController() {
  const pathname = usePathname();

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          el.dataset.reveal = "shown";
          observer.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );

    const prepare = (root: ParentNode) => {
      const fold = window.innerHeight;
      root.querySelectorAll<HTMLElement>("[data-reveal='']").forEach((el) => {
        if (el.getBoundingClientRect().top < fold) {
          el.dataset.reveal = "static";
          return;
        }
        el.dataset.reveal = "pending";
        observer.observe(el);
      });
    };

    prepare(document);
    const mutations = new MutationObserver(() => prepare(document));
    mutations.observe(document.body, { childList: true, subtree: true });
    return () => {
      mutations.disconnect();
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}

/** Marks children for reveal. `delay` staggers siblings (ms). */
export function Reveal({
  as: Comp = "div",
  delay,
  className,
  style,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & { as?: React.ElementType; delay?: number }) {
  return (
    <Comp
      data-reveal=""
      className={className}
      style={delay ? ({ ...style, "--reveal-delay": `${delay}ms` } as React.CSSProperties) : style}
      {...props}
    >
      {children}
    </Comp>
  );
}
