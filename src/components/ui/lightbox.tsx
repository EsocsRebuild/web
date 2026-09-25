"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import * as React from "react";

import { cn } from "@/lib/utils";

export interface LightboxImage {
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
}

/**
 * Full-screen photo viewer: swipe, arrow keys, Escape to close, counter and
 * caption. Only the current slide and its neighbours load at full size.
 */
export function Lightbox({
  images,
  index,
  onIndexChange,
  onClose,
  title,
}: {
  images: LightboxImage[];
  /** Open at this index; null keeps it closed. */
  index: number | null;
  onIndexChange?: (index: number) => void;
  onClose: () => void;
  title: string;
}) {
  const open = index !== null;
  const [viewport, api] = useEmblaCarousel({ loop: false, startIndex: index ?? 0, duration: 22 });
  const [current, setCurrent] = React.useState(index ?? 0);

  React.useEffect(() => {
    if (open && api && index !== null) api.scrollTo(index, true);
  }, [open, api, index]);

  React.useEffect(() => {
    if (!api) return;
    const update = () => {
      const i = api.selectedScrollSnap();
      setCurrent(i);
      onIndexChange?.(i);
    };
    api.on("select", update);
    return () => {
      api.off("select", update);
    };
  }, [api, onIndexChange]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowLeft") api?.scrollPrev();
    if (event.key === "ArrowRight") api?.scrollNext();
  };

  const nav =
    "absolute top-1/2 z-10 hidden size-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20 disabled:opacity-30 sm:inline-flex [&_svg]:size-6";

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/92 data-[state=open]:animate-fade-in" />
        <DialogPrimitive.Content
          onKeyDown={onKeyDown}
          className="fixed inset-0 z-50 flex flex-col text-white outline-none"
          aria-describedby={undefined}
        >
          <div className="flex items-center justify-between gap-4 px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3 sm:px-6">
            <DialogPrimitive.Title className="min-w-0 truncate text-sm font-semibold">
              {title}
              <span className="ml-3 font-normal text-white/60 tabular">
                {current + 1} / {images.length}
              </span>
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full hover:bg-white/10"
              aria-label="Close photo viewer"
            >
              <X className="size-6" />
            </DialogPrimitive.Close>
          </div>

          <div ref={viewport} className="min-h-0 flex-1 overflow-hidden">
            <div className="flex h-full touch-pan-y">
              {images.map((img, i) => (
                <figure
                  key={img.url}
                  className="relative flex h-full min-w-0 shrink-0 grow-0 basis-full flex-col"
                >
                  <div className="relative min-h-0 flex-1">
                    {Math.abs(i - current) <= 1 && (
                      <Image
                        src={img.url}
                        alt={img.alt}
                        fill
                        sizes="100vw"
                        priority={i === current}
                        className="object-contain"
                      />
                    )}
                  </div>
                  <figcaption className="px-6 pt-3 pb-[calc(env(safe-area-inset-bottom)+1rem)] text-center text-sm text-white/75">
                    {img.alt}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>

          <button
            type="button"
            className={cn(nav, "left-4")}
            onClick={() => api?.scrollPrev()}
            disabled={current === 0}
            aria-label="Previous photo"
          >
            <ChevronLeft />
          </button>
          <button
            type="button"
            className={cn(nav, "right-4")}
            onClick={() => api?.scrollNext()}
            disabled={current === images.length - 1}
            aria-label="Next photo"
          >
            <ChevronRight />
          </button>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
