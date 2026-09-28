import Image from "next/image";

import { Crest } from "@/components/icons/logo";
import type { ImageRef, UnitKind } from "@/data/schema/content";
import { UNIT_KIND } from "@/lib/kinds";
import { cn, initials } from "@/lib/utils";

const SIZES = { xs: 28, sm: 36, md: 44, lg: 64, xl: 112 } as const;

/**
 * A page's seal: a round navy medallion like the Order's crest, ringed in the
 * colour of its kind so a province, a CMC and a section read apart at a glance.
 * People are shown by portrait, never by seal. The Holy Order bears the crest.
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
  const ringed = px >= 36;
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 rounded-full",
        ringed && "bg-background p-[2px]",
        className,
      )}
      style={{
        width: px,
        height: px,
        border: ringed ? `${px >= 64 ? 2 : 1.5}px solid ${UNIT_KIND[kind].colour}` : undefined,
      }}
    >
      <span
        className={cn(
          "relative flex size-full items-center justify-center overflow-hidden rounded-full font-display font-bold tracking-tight",
          kind === "holy-order" && !image ? "bg-white" : "bg-royal-900 text-gold-100",
        )}
        style={{ fontSize: Math.round(px * 0.32) }}
      >
        {image ? (
          <Image src={image.url} alt="" fill sizes={`${px}px`} className="object-cover" />
        ) : kind === "holy-order" ? (
          <Crest size={px} className="size-full" />
        ) : (
          <span aria-hidden>{initials(name.replace(/^(CMC)\s+(\d+)/, "C $2")) || "•"}</span>
        )}
      </span>
    </span>
  );
}
