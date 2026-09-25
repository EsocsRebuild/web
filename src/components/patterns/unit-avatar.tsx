import Image from "next/image";

import { Crest } from "@/components/icons/logo";
import type { ImageRef, UnitKind } from "@/data/schema/content";
import { UNIT_KIND } from "@/lib/kinds";
import { cn, initials } from "@/lib/utils";

const SIZES = { xs: 28, sm: 36, md: 44, lg: 64, xl: 112 } as const;

/**
 * A page's avatar. Pages are rounded squares (people are circles) tinted by kind,
 * so a province never looks like a person. The Holy Order uses the crest.
 */
export function UnitAvatar({
  name,
  kind,
  image,
  size = "md",
  className,
}: {
  name: string;
  kind: UnitKind;
  image?: ImageRef | null;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const px = SIZES[size];
  const radius = px >= 64 ? "rounded-panel" : "rounded-control";
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden font-display font-extrabold text-white",
        radius,
        className,
      )}
      style={{
        width: px,
        height: px,
        fontSize: Math.round(px * 0.34),
        backgroundColor: UNIT_KIND[kind].colour,
      }}
    >
      {image ? (
        <Image src={image.url} alt="" fill sizes={`${px}px`} className="object-cover" />
      ) : kind === "holy-order" ? (
        <Crest size={px} className="size-full" />
      ) : (
        <span aria-hidden>{initials(name.replace(/^(CMC)\s+(\d+)/, "C $2")) || "•"}</span>
      )}
    </span>
  );
}
