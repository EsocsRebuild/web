"use client";

import { ChevronDown } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const EASE_MS = 450;

/**
 * Long text shown as its first few lines, then "Read more" to open the rest in
 * place and "Show less" to return it to exactly how it started. Nothing is ever
 * cut with "…": the last visible line fades out, and the button appears only when
 * there really is more to read. The whole text is always in the page, so search
 * engines and screen readers get all of it.
 *
 * Whether there is more is always measured against the fixed collapsed height
 * (`lines` × the text's line height), never against the box's current size, so an
 * animation in progress can never make it lose its place.
 */
export function ReadMore({
  children,
  lines = 4,
  className,
  contentClassName,
  moreLabel = "Read more",
  lessLabel = "Show less",
  tone = "default",
  trailing,
}: {
  children: React.ReactNode;
  lines?: number;
  className?: string;
  contentClassName?: string;
  moreLabel?: string;
  lessLabel?: string;
  /** "inverse" for text on dark photography or navy panels. */
  tone?: "default" | "inverse";
  /** Actions to sit on the same row as the Read more button (e.g. Follow, Explore). */
  trailing?: React.ReactNode;
}) {
  const id = React.useId();
  const wrapper = React.useRef<HTMLDivElement>(null);
  const content = React.useRef<HTMLDivElement>(null);
  const openRef = React.useRef(false);
  const [open, setOpen] = React.useState(false);
  // Until measured, assume there is more, so the first paint is already collapsed.
  const [overflows, setOverflows] = React.useState(true);
  const [maxHeight, setMaxHeight] = React.useState<string | undefined>(`${lines}lh`);

  /** The collapsed height in pixels, from the text's own line height. */
  const collapsedPx = React.useCallback(() => {
    const el = content.current;
    if (!el) return 0;
    const cs = getComputedStyle(el);
    const lineHeight = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.5;
    return lineHeight * lines;
  }, [lines]);

  React.useLayoutEffect(() => {
    const el = content.current;
    if (!el) return;
    const measure = () => {
      const more = el.scrollHeight > collapsedPx() + 2;
      setOverflows(more);
      // Collapsed text that no longer needs a limit (e.g. a wider screen) shows in full;
      // collapsed text that now does gets it back. Open text is left alone.
      if (!openRef.current) setMaxHeight(more ? `${collapsedPx()}px` : undefined);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [collapsedPx]);

  const expand = () => {
    const el = content.current;
    if (!el) return;
    openRef.current = true;
    setOpen(true);
    // Animate from the collapsed height to the full height, then release the limit
    // (at once when motion is reduced, as there is no transition to wait for).
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setMaxHeight(reduce ? undefined : `${el.scrollHeight}px`);
  };

  const collapse = () => {
    const el = content.current;
    const box = wrapper.current;
    if (!el || !box) return;
    openRef.current = false;
    // Pin the current full height first, so the browser has a start point to animate from.
    setMaxHeight(`${el.scrollHeight}px`);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setOpen(false);
        setMaxHeight(`${collapsedPx()}px`);
      }),
    );
    // If the start of the text has scrolled away, bring it back into view.
    const top = box.getBoundingClientRect().top;
    const header = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 96;
    if (top < header) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollBy({ top: top - header, behavior: reduce ? "auto" : "smooth" });
    }
  };

  const clamped = !open && overflows;
  const fade = "linear-gradient(to bottom, #000 calc(100% - 1.6lh), transparent)";

  return (
    <div ref={wrapper} className={cn("grid justify-items-start gap-2", className)}>
      <div
        id={id}
        ref={content}
        className={cn(
          "w-full overflow-hidden transition-[max-height] ease-out-expo motion-reduce:transition-none",
          contentClassName,
        )}
        style={{
          maxHeight,
          transitionDuration: `${EASE_MS}ms`,
          maskImage: clamped ? fade : undefined,
          WebkitMaskImage: clamped ? fade : undefined,
        }}
        onTransitionEnd={(e) => {
          // Once fully open, drop the limit so the text reflows freely on resize.
          if (e.target === e.currentTarget && openRef.current) setMaxHeight(undefined);
        }}
      >
        {children}
      </div>
      {(overflows || trailing) && (
        <div className="flex w-full flex-wrap items-center gap-x-4 gap-y-2">
          {overflows && (
            <button
              type="button"
              aria-expanded={open}
              aria-controls={id}
              onClick={open ? collapse : expand}
              className={cn(
                "relative z-10 inline-flex min-h-10 cursor-pointer items-center gap-1 rounded-control text-sm font-semibold transition-colors",
                tone === "inverse"
                  ? "text-gold-200 hover:text-gold-100"
                  : "text-accent hover:text-accent-hover",
              )}
            >
              {open ? lessLabel : moreLabel}
              <ChevronDown
                aria-hidden
                className={cn("size-4 transition-transform duration-300", open && "rotate-180")}
              />
            </button>
          )}
          {trailing}
        </div>
      )}
    </div>
  );
}
