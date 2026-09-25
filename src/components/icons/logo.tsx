import Link from "next/link";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

// Placeholder mark. Replace with the official crest (SVG, using currentColor).
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-8", className)}>
      <circle cx="16" cy="16" r="15" fill="none" stroke="currentColor" strokeOpacity="0.35" />
      <path d="M15 6h2v6.5h6v2h-6V26h-2V14.5H9v-2h6z" fill="currentColor" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("inline-flex min-h-11 items-center gap-2.5", className)}
      aria-label={`${siteConfig.name} home`}
    >
      <LogoMark />
      <span className="font-display text-2xl leading-none font-extrabold tracking-tight">
        {siteConfig.name}
      </span>
    </Link>
  );
}
