import {
  Award,
  BookHeart,
  BookImage,
  CalendarDays,
  Coffee,
  Flame,
  Music,
  NotebookPen,
  Ribbon,
  ScrollText,
  Shirt,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";

import { LogoMark } from "@/components/icons/logo";
import type { Product, ProductArt as Art } from "@/data/schema/store";
import { cn } from "@/lib/utils";

import { shelfTheme } from "./store-theme";

const ICON: Record<Art, LucideIcon> = {
  hymnal: Music,
  bible: BookHeart,
  "prayer-book": ScrollText,
  gown: Shirt,
  "head-cover": Ribbon,
  candle: Flame,
  mug: Coffee,
  tote: ShoppingBag,
  pin: Award,
  diary: NotebookPen,
  brochure: BookImage,
  calendar: CalendarDays,
};

/**
 * A product's picture: its photograph when the store has one, otherwise a
 * designed plate in its shelf's colours (see store-theme), so the shelf never
 * shows an empty box and a book, a garment and a keepsake read apart at a glance.
 */
export function ProductArt({
  product,
  sizes = "(min-width: 1024px) 300px, 50vw",
  priority,
  className,
}: {
  product: Pick<Product, "name" | "art" | "images" | "categorySlug">;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  const photo = product.images[0];
  if (photo) {
    return (
      <span className={cn("relative block overflow-hidden bg-surface-sunken", className)}>
        <Image
          src={photo.url}
          alt={photo.alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      </span>
    );
  }
  const Icon = ICON[product.art];
  const theme = shelfTheme(product.categorySlug);
  return (
    <span
      aria-hidden
      className={cn("relative isolate flex items-center justify-center overflow-hidden", className)}
      style={{
        backgroundColor: theme.plate,
        backgroundImage: `radial-gradient(65% 55% at 50% 42%, ${theme.glow}, transparent 72%)`,
      }}
    >
      <span className="absolute -right-[14%] -bottom-[18%] -z-10 size-[66%]" style={{ color: theme.crest }}>
        <LogoMark className="size-full" />
      </span>
      <span
        className="flex aspect-square w-[40%] items-center justify-center rounded-full border"
        style={{
          borderColor: theme.ring,
          boxShadow: `0 0 0 7px color-mix(in oklch, ${theme.plate} 55%, transparent), 0 0 0 8px ${theme.ring}`,
        }}
      >
        <Icon className="size-[44%]" strokeWidth={1.3} style={{ color: theme.ink }} />
      </span>
      <span
        className="absolute inset-x-[18%] bottom-0 h-px"
        style={{ backgroundImage: `linear-gradient(to right, transparent, ${theme.ring}, transparent)` }}
      />
    </span>
  );
}
