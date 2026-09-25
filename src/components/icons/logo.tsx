import Image from "next/image";
import Link from "next/link";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/** Line cross used as a quiet watermark on designed covers. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-8", className)}>
      <circle cx="16" cy="16" r="15" fill="none" stroke="currentColor" strokeOpacity="0.35" />
      <path d="M15 6h2v6.5h6v2h-6V26h-2V14.5H9v-2h6z" fill="currentColor" />
    </svg>
  );
}

/** The official crest of the Eternal Sacred Order of the Cherubim & Seraphim. */
export function Crest({
  size = 44,
  className,
  priority,
}: {
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/brand/esocs-crest.png"
      alt=""
      width={size}
      height={size}
      priority={priority}
      className={cn("shrink-0 rounded-full", className)}
    />
  );
}

/**
 * Crest and stacked wordmark: "The ESOCS" in the display face over "Church" in
 * the serif italic. `size="lg"` for the footer and other generous placements.
 */
export function Logo({
  className,
  size = "md",
  compact = false,
}: {
  className?: string;
  size?: "md" | "lg";
  /** Crest only: the wordmark folds away (used by the condensed header). */
  compact?: boolean;
}) {
  const lg = size === "lg";
  return (
    <Link
      href="/"
      aria-label={`${siteConfig.brandName}, home`}
      className={cn("group/logo inline-flex min-h-11 items-center gap-3", className)}
    >
      <Crest
        size={lg ? 56 : compact ? 38 : 44}
        priority
        className="shadow-[0_2px_10px_-2px_oklch(0.2_0.06_265/0.35)] ring-2 ring-white/70 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/logo:-rotate-12"
      />
      <span
        aria-hidden
        className={cn(
          "grid overflow-hidden leading-none whitespace-nowrap transition-[max-width,opacity] duration-500 ease-[var(--ease-out-expo)]",
          compact ? "max-w-0 opacity-0" : "max-w-40 opacity-100",
        )}
      >
        <span
          className={cn(
            "font-display font-extrabold tracking-[-0.02em] [font-stretch:92%]",
            lg ? "text-2xl" : "text-[1.1875rem]",
          )}
        >
          The ESOCS
        </span>
        <span
          className={cn(
            "-mt-0.5 font-serif text-highlight italic",
            lg ? "text-[1.75rem]" : "text-[1.375rem]",
          )}
        >
          Church
        </span>
      </span>
    </Link>
  );
}
