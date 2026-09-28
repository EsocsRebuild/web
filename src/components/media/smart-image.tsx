import Image, { type ImageProps } from "next/image";

import type { ImageRef } from "@/data/schema/content";
import { coverFactor, scaleSizes, type Aspect } from "@/lib/image-sizes";

type Source = Pick<ImageRef, "url" | "alt" | "width" | "height" | "placeholder">;

/**
 * Every photograph goes through here, so image loading follows one policy:
 *
 * - Lazy by default. Only a page's main image (its largest above the fold) is
 *   given `priority`, which loads it eagerly and at high priority.
 * - A blurred preview of the photo itself shows while it loads (when one exists),
 *   so it fades into its own colours instead of popping into an empty frame.
 * - Crop-aware sizes: pass the frame's shape as `frame` for a cover-fitted photo,
 *   and the `sizes` hint is scaled so the browser fetches a file wide enough for
 *   the width the photo is really drawn at.
 * - Decoding off the main thread.
 */
export function SmartImage({
  image,
  frame,
  sizes,
  priority,
  fill,
  ...props
}: Omit<ImageProps, "src" | "alt" | "placeholder" | "blurDataURL" | "width" | "height" | "loading"> & {
  image: Source;
  /** The shape of the frame the photo is cover-fitted into, e.g. { width: 3, height: 4 }. */
  frame?: Aspect;
}) {
  const scaled = sizes ? scaleSizes(sizes, coverFactor(image, frame)) : undefined;
  const dimensions =
    fill || !image.width || !image.height
      ? { fill: true as const }
      : { width: image.width, height: image.height };
  return (
    <Image
      src={image.url}
      alt={image.alt}
      {...dimensions}
      sizes={scaled}
      priority={priority}
      loading={priority ? undefined : "lazy"}
      decoding="async"
      placeholder={image.placeholder ? "blur" : "empty"}
      blurDataURL={image.placeholder}
      {...props}
    />
  );
}
