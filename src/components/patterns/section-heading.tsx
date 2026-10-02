import { ArrowRight } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { cn } from "@/lib/utils";

/** A section's title with an optional "see all" link, used on every story beat. */
export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  href,
  linkLabel = "See all",
  as: Heading = "h2",
  size = "md",
  className,
}: {
  id?: string;
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  href?: string;
  linkLabel?: string;
  as?: "h2" | "h3";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-x-6 gap-y-2", className)}>
      <div className="grid max-w-2xl min-w-0 flex-1 gap-1.5">
        {eyebrow && <p className="text-overline font-semibold text-highlight uppercase">{eyebrow}</p>}
        <Heading
          id={id}
          className={cn(
            "font-display font-extrabold tracking-tight text-balance",
            size === "sm" && "text-base leading-snug font-bold sm:text-lg",
            size === "md" && "text-display-sm leading-tight",
            size === "lg" && "text-[clamp(1.5rem,1.25rem+1.5vw,2.75rem)] leading-[1.15] tracking-tight",
          )}
        >
          {title}
        </Heading>
        {description && <p className="text-sm leading-6 text-muted-foreground">{description}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="group/link inline-flex min-h-11 shrink-0 items-center gap-1.5 text-sm font-semibold whitespace-nowrap text-accent hover:text-accent-hover"
        >
          {linkLabel}
          <ArrowRight aria-hidden className="size-4 transition-transform group-hover/link:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
