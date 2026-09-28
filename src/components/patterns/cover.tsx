import { SmartImage } from "@/components/media/smart-image";
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
        <SmartImage
          image={image}
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
      className={cn("relative overflow-hidden bg-royal-950", className)}
      style={{
        backgroundImage: `radial-gradient(70% 120% at 88% 0%, color-mix(in oklch, ${colour} 55%, transparent), transparent 70%),
          radial-gradient(60% 90% at 0% 100%, color-mix(in oklch, var(--color-royal-700) 45%, transparent), transparent 70%)`,
      }}
    >
      <LogoMark className="absolute -right-[3%] -bottom-[22%] size-[70%] max-h-none text-white opacity-[0.07]" />
      <span className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-gold-400/60 to-transparent" />
    </div>
  );
}
