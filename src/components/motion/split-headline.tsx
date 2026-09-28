import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * A headline whose words rise into place on first paint, one after another.
 * Server-rendered text; screen readers get the whole line once.
 */
export function SplitHeadline({
  as: Comp = "h1",
  text,
  className,
  stagger = 70,
  delay = 120,
}: {
  as?: "h1" | "h2" | "p";
  text: string;
  className?: string;
  stagger?: number;
  delay?: number;
}) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <Comp className={className} aria-label={text}>
      {words.map((word, i) => (
        <React.Fragment key={`${word}-${i}`}>
          <span
            aria-hidden
            className={cn("inline-block animate-word-in will-change-transform")}
            style={{ animationDelay: `${delay + i * stagger}ms` }}
          >
            {word}
          </span>
          {i < words.length - 1 && " "}
        </React.Fragment>
      ))}
    </Comp>
  );
}
