/**
 * Responsive image arithmetic for photographs drawn with `object-fit: cover`.
 *
 * A `sizes` hint describes the frame's width, but a wide photograph cropped into a
 * tall frame is drawn wider than the frame (its height fills the frame, its sides
 * are cut). The browser must then fetch a file wide enough for the drawn width, or
 * the photo looks soft. These helpers scale the hint by exactly that crop factor.
 */

export interface Aspect {
  width: number;
  height: number;
}

/** How much wider than its frame a cover-fitted image is drawn (1 when it is not cropped at the sides). */
export function coverFactor(
  image: { width?: number | null; height?: number | null } | null | undefined,
  frame: Aspect | undefined,
) {
  if (!frame || !image?.width || !image.height) return 1;
  const factor = image.width / image.height / (frame.width / frame.height);
  return Math.min(3, Math.max(1, factor));
}

/**
 * Multiplies every size in a `sizes` string by `factor`, leaving the media
 * conditions alone: "(min-width: 640px) 50vw, 100vw" × 1.5 →
 * "(min-width: 640px) 75vw, 150vw".
 */
export function scaleSizes(sizes: string, factor: number) {
  if (factor === 1) return sizes;
  return sizes
    .split(",")
    .map((part) => {
      const trimmed = part.trim();
      const match = /^(\(.*\)\s+)?(\d+(?:\.\d+)?)(vw|px)$/.exec(trimmed);
      if (!match) return trimmed;
      const [, condition = "", value, unit] = match;
      return `${condition}${Math.ceil(Number(value) * factor)}${unit}`;
    })
    .join(", ");
}
