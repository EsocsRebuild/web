import Image from "next/image";
import Link from "next/link";

import type { ImageRef } from "@/data/schema/content";
import { cn } from "@/lib/utils";

/** Photo grid that adapts to the count: 1 full · 2 split · 3 as 1+2 · 4+ as 2×2 with "+N". */
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
  const shown = images.slice(0, 4);
  const extra = (total ?? images.length) - shown.length;
  const sizes = shown.length === 1 ? "(min-width: 768px) 680px, 100vw" : "(min-width: 768px) 340px, 50vw";

  return (
    <Link
      href={href}
      aria-label={`View ${total ?? images.length} photos: ${title}`}
      className={cn(
        "grid gap-1 overflow-hidden rounded-card",
        shown.length === 1 && "grid-cols-1",
        shown.length === 2 && "grid-cols-2",
        shown.length === 3 && "grid-cols-2 grid-rows-2",
        shown.length >= 4 && "grid-cols-2 grid-rows-2",
      )}
    >
      {shown.map((img, i) => (
        <span
          key={img.url}
          className={cn(
            "relative block overflow-hidden bg-surface-sunken",
            shown.length === 1 ? "aspect-[16/10]" : "aspect-square",
            shown.length === 3 && i === 0 && "row-span-2 aspect-auto",
          )}
        >
          <Image
            src={img.url}
            alt={img.alt}
            fill
            sizes={sizes}
            className="object-cover transition-transform duration-500 ease-out hover:scale-[1.03]"
          />
          {i === 3 && extra > 0 && (
            <span className="absolute inset-0 flex items-center justify-center bg-black/55 font-display text-3xl font-extrabold text-white">
              +{extra}
            </span>
          )}
        </span>
      ))}
    </Link>
  );
}
