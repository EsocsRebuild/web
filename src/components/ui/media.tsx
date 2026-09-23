import Image, { type ImageProps } from "next/image";

import { cn } from "@/lib/utils";

export interface MediaProps extends Omit<ImageProps, "src" | "alt" | "fill"> {
  src?: string | null;
  alt: string;
  /** Tailwind aspect class, e.g. "aspect-video". */
  aspect?: string;
  /** Zoom slightly when an ancestor `group/card` is hovered. */
  zoomOnCardHover?: boolean;
  className?: string;
}

/**
 * Responsive image frame. Renders a neutral block when `src` is missing so
 * layouts hold their shape before content is loaded from the CMS.
 */
export function Media({ src, alt, aspect = "aspect-[3/2]", zoomOnCardHover, className, sizes = "100vw", ...props }: MediaProps) {
  return (
    <div className={cn("relative overflow-hidden bg-surface-sunken", aspect, className)}>
      {src && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className={cn(
            "object-cover",
            zoomOnCardHover && "transition-transform duration-500 ease-standard group-hover/card:scale-[1.03]",
          )}
          {...props}
        />
      )}
    </div>
  );
}
