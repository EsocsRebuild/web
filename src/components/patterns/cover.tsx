import Image from "next/image";

import { LogoMark } from "@/components/icons/logo";
import type { ImageRef, UnitKind } from "@/data/schema/content";
import { UNIT_KIND } from "@/lib/kinds";
import { cn } from "@/lib/utils";

/**
 * A page's cover photograph, or a designed cover in the kind's colour when the
 * church has not supplied one yet: never a grey placeholder box.
 */
export function Cover({
  image,
  kind,
  priority,
  className,
  kenBurns,
  sizes = "(min-width: 1280px) 1200px, 100vw",
}: {
  image: ImageRef | null;
  kind: UnitKind;
  priority?: boolean;
  className?: string;
  kenBurns?: boolean;
  sizes?: string;
}) {
  if (image) {
    return (
      <div className={cn("relative overflow-hidden bg-surface-sunken", className)}>
        <Image
          src={image.url}
          alt={image.alt}
          fill
          priority={priority}
          sizes={sizes}
          className={cn("object-cover", kenBurns && "animate-ken-burns motion-reduce:animate-none")}
        />
      </div>
    );
  }
  const colour = UNIT_KIND[kind].colour;
  return (
    <div
      aria-hidden
      className={cn("relative overflow-hidden", className)}
      style={{
        backgroundColor: colour,
        backgroundImage: `radial-gradient(120% 90% at 85% 10%, color-mix(in oklch, white 22%, transparent), transparent 55%),
          radial-gradient(80% 70% at 0% 100%, color-mix(in oklch, black 35%, transparent), transparent 60%),
          repeating-linear-gradient(135deg, color-mix(in oklch, white 6%, transparent) 0 1px, transparent 1px 22px)`,
      }}
    >
      <LogoMark className="absolute -right-[4%] -bottom-[18%] size-[62%] max-h-none text-white opacity-[0.09]" />
    </div>
  );
}
