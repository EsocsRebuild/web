"use client";

import Image from "next/image";
import * as React from "react";

import { Lightbox, type LightboxImage } from "@/components/ui/lightbox";

/** Every photo in an album, opening the lightbox at the one tapped. */
export function AlbumGrid({ title, photos }: { title: string; photos: LightboxImage[] }) {
  const [open, setOpen] = React.useState<number | null>(null);

  return (
    <>
      <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((p, i) => (
          <li key={p.url}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              className="group/photo relative block aspect-square w-full cursor-zoom-in overflow-hidden rounded-control bg-surface-sunken"
              aria-label={`Open photo ${i + 1} of ${photos.length}`}
            >
              <Image
                src={p.url}
                alt={p.alt}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                loading={i < 8 ? "eager" : "lazy"}
                className="object-cover transition-transform duration-500 group-hover/photo:scale-[1.04]"
              />
            </button>
          </li>
        ))}
      </ul>
      <Lightbox images={photos} index={open} onClose={() => setOpen(null)} title={title} />
    </>
  );
}
