"use client";

import * as React from "react";

/** One observer shared by every Reveal on the page. */
let observer: IntersectionObserver | null = null;

function sharedObserver() {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        (entry.target as HTMLElement).dataset.reveal = "shown";
        observer?.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px" },
  );
  return observer;
}

/**
 * Rises into place as it scrolls into view, once. Each element arms itself only
 * after it has hydrated, so the server HTML and the first client render always
 * match. Anything already on screen, or seen with reduced motion, simply stays put.
 */
export function Reveal({
  as: Comp = "div",
  delay,
  className,
  style,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & { as?: React.ElementType; delay?: number }) {
  const ref = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    el.dataset.reveal = "pending";
    const io = sharedObserver();
    io.observe(el);
    return () => io.unobserve(el);
  }, []);

  return (
    <Comp
      ref={ref}
      data-reveal=""
      className={className}
      style={delay ? ({ ...style, "--reveal-delay": `${delay}ms` } as React.CSSProperties) : style}
      {...props}
    >
      {children}
    </Comp>
  );
}
