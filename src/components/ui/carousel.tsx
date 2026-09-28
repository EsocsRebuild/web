"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

type Api = ReturnType<typeof useEmblaCarousel>[1];

interface CarouselProps {
  /** Accessible name for the carousel region, e.g. "Featured". */
  label: string;
  slides: React.ReactNode[];
  /** Milliseconds between slides; omit for no autoplay. Never autoplays under reduced motion. */
  autoplay?: number;
  loop?: boolean;
  className?: string;
  /** Classes for each slide's wrapper (sets width, e.g. "basis-full"). */
  slideClassName?: string;
  controls?: "overlay" | "below" | "none";
  startIndex?: number;
  onSelect?: (index: number) => void;
}

function useAutoplay(api: Api, delay: number | undefined, paused: boolean) {
  React.useEffect(() => {
    if (!api || !delay || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") api.scrollNext();
    }, delay);
    return () => window.clearInterval(id);
  }, [api, delay, paused]);
}

export function Carousel({
  label,
  slides,
  autoplay,
  loop = true,
  className,
  slideClassName = "basis-full",
  controls = "overlay",
  startIndex = 0,
  onSelect,
}: CarouselProps) {
  const [viewport, api] = useEmblaCarousel({ loop, startIndex, align: "start" });
  const [index, setIndex] = React.useState(startIndex);
  const [hovered, setHovered] = React.useState(false);
  const [userPaused, setUserPaused] = React.useState(false);

  React.useEffect(() => {
    if (!api) return;
    const update = () => {
      const i = api.selectedScrollSnap();
      setIndex(i);
      onSelect?.(i);
    };
    update();
    api.on("select", update).on("reInit", update);
    return () => {
      api.off("select", update).off("reInit", update);
    };
  }, [api, onSelect]);

  useAutoplay(api, autoplay, hovered || userPaused);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      api?.scrollPrev();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      api?.scrollNext();
    }
  };

  const count = slides.length;
  const controlButton =
    "inline-flex size-10 cursor-pointer items-center justify-center rounded-full border transition-colors disabled:opacity-40 [&_svg]:size-5";

  return (
    <section
      aria-roledescription="carousel"
      aria-label={label}
      className={cn("relative", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={() => setHovered(false)}
      onKeyDown={onKeyDown}
    >
      <div ref={viewport} className="overflow-hidden">
        <div className="flex touch-pan-y">
          {slides.map((slide, i) => (
            <div
              key={i}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={i !== index || undefined}
              className={cn("min-w-0 shrink-0 grow-0", slideClassName)}
            >
              {slide}
            </div>
          ))}
        </div>
      </div>

      <p className="sr-only" aria-live={autoplay && !userPaused ? "off" : "polite"}>
        Slide {index + 1} of {count}
      </p>

      {controls !== "none" && count > 1 && (
        <div
          className={cn(
            "flex items-center gap-3",
            controls === "overlay"
              ? "dark absolute right-4 bottom-4 text-foreground sm:right-6 sm:bottom-6"
              : "mt-4 justify-between text-foreground",
          )}
        >
          <div className="flex items-center gap-1.5" aria-hidden>
            {slides.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-pill bg-current transition-all duration-300",
                  i === index ? "w-6 opacity-100" : "w-1.5 opacity-40",
                )}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {autoplay && (
              <button
                type="button"
                onClick={() => setUserPaused((p) => !p)}
                className={cn(controlButton, "border-current/30 hover:bg-current/10")}
                aria-label={userPaused ? "Play slideshow" : "Pause slideshow"}
              >
                {userPaused ? <Play /> : <Pause />}
              </button>
            )}
            <button
              type="button"
              onClick={() => api?.scrollPrev()}
              className={cn(controlButton, "border-current/30 hover:bg-current/10")}
              aria-label="Previous slide"
            >
              <ChevronLeft />
            </button>
            <button
              type="button"
              onClick={() => api?.scrollNext()}
              className={cn(controlButton, "border-current/30 hover:bg-current/10")}
              aria-label="Next slide"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
