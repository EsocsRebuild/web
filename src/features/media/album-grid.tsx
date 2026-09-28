"use client";

import dynamic from "next/dynamic";
import * as React from "react";

import { SmartImage } from "@/components/media/smart-image";
import { MoreControl, useAutoMore } from "@/components/patterns/progressive";
import type { LightboxImage } from "@/components/ui/lightbox";

// The photo viewer and its carousel load on the first tap of a photo.
const loadLightbox = () => import("@/components/ui/lightbox").then((m) => m.Lightbox);
const Lightbox = dynamic(loadLightbox, { ssr: false });

/** Photos render in batches: enough to fill a large screen, then more as the reader scrolls. */
const BATCH = 24;

/** Every photo in an album, opening the viewer at the one tapped. */
export function AlbumGrid({ title, photos }: { title: string; photos: LightboxImage[] }) {
  const [open, setOpen] = React.useState<number | null>(null);
  const [shown, setShown] = React.useState(Math.min(BATCH, photos.length));
  const [announce, setAnnounce] = React.useState("");
  const remaining = photos.length - shown;

  const more = () => {
    const next = Math.min(shown + BATCH, photos.length);
    setShown(next);
    setAnnounce(`${next - shown} more photos shown, ${next} of ${photos.length}.`);
  };
  const { sentinel } = useAutoMore({ onMore: more, enabled: remaining > 0 });

  return (
    <>
      <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
        {photos.slice(0, shown).map((p, i) => (
          <li key={p.url}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              onPointerEnter={() => void loadLightbox()}
              className="group/photo relative block aspect-square w-full cursor-zoom-in overflow-hidden rounded-control bg-surface-sunken"
              aria-label={`Open photo ${i + 1} of ${photos.length}`}
            >
              <SmartImage
                image={p}
                fill
                frame={{ width: 1, height: 1 }}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                quality={60}
                className="object-cover transition-transform duration-500 group-hover/photo:scale-[1.04]"
              />
            </button>
          </li>
        ))}
      </ul>
      {remaining > 0 ? (
        <MoreControl
          sentinel={sentinel}
          remaining={remaining}
          label="Show more photos"
          onMore={more}
          announce={announce}
        />
      ) : (
        <p aria-live="polite" className="sr-only">
          {announce}
        </p>
      )}
      {open !== null && <Lightbox images={photos} index={open} onClose={() => setOpen(null)} title={title} />}
    </>
  );
}
