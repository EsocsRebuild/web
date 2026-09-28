import Link from "next/link";

import { SmartImage } from "@/components/media/smart-image";
import type { ImageRef } from "@/data/schema/content";
import { cn } from "@/lib/utils";

/**
 * A post's photographs as one compact spread, so an album never swallows the feed:
 * 1 full width · 2 side by side · 3 or more as a lead photo with two beside it,
 * the last carrying "+N" for the rest of the album.
 */
export function PostMedia({
  images,
  href,
  total,
  title,
}: {
  images: ImageRef[];
  href: string;
  /** Full album size, for the "+N" tile. */
  total?: number;
  title: string;
}) {
  if (!images.length) return null;
  const shown = images.slice(0, 3);
  const extra = (total ?? images.length) - shown.length;
  const spread = shown.length === 3;

  return (
    <Link
      href={href}
      aria-label={`View ${total ?? images.length} photos: ${title}`}
      className={cn(
        "grid gap-1 overflow-hidden rounded-card",
        shown.length === 1 && "aspect-[16/9]",
        shown.length === 2 && "aspect-[2/1] grid-cols-2",
        spread && "aspect-[3/2] grid-cols-3 grid-rows-2 sm:aspect-[16/9]",
      )}
    >
      {shown.map((img, i) => (
        <span
          key={img.url}
          className={cn(
            "relative block overflow-hidden bg-surface-sunken",
            spread && i === 0 && "col-span-2 row-span-2",
          )}
        >
          <SmartImage
            image={img}
            fill
            // Square tiles in spreads and pairs; a 16:9 frame for a single photo.
            frame={shown.length === 1 ? { width: 16, height: 9 } : { width: 1, height: 1 }}
            quality={shown.length === 1 ? undefined : 60}
            sizes={
              spread && i > 0
                ? "(min-width: 1024px) 300px, 33vw"
                : spread
                  ? "(min-width: 1024px) 600px, 67vw"
                  : shown.length === 2
                    ? "(min-width: 1024px) 450px, 50vw"
                    : "(min-width: 1024px) 900px, 100vw"
            }
            className="object-cover transition-transform duration-500 ease-out hover:scale-[1.03]"
          />
          {i === shown.length - 1 && extra > 0 && (
            <span className="absolute inset-0 flex items-center justify-center bg-royal-950/60 font-display text-2xl font-bold text-white">
              +{extra}
            </span>
          )}
        </span>
      ))}
    </Link>
  );
}
