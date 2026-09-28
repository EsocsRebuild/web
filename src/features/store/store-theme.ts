import {
  BookOpen,
  Flame,
  HandHeart,
  MapPin,
  PhoneCall,
  Shirt,
  ShoppingBag,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

/**
 * How each shelf of the store looks, so a hymn book, a white garment, a candle and
 * a centenary keepsake read apart at a glance, before a word is read:
 * - Books & hymnals: the Order's navy and gold, like the hymn book's cover.
 * - Garments: white linen, as the garments are worn.
 * - Devotional: candle-lit wine for prayer at home.
 * - Centenary collection: gold, for a hundred years.
 */
export interface ShelfTheme {
  icon: LucideIcon;
  /** The picture plate behind a product's icon. */
  plate: string;
  /** The soft light behind the icon. */
  glow: string;
  /** The ring and icon on the plate. */
  ink: string;
  ring: string;
  /** Watermark crest on the plate. */
  crest: string;
  /** A one-line promise for the category, shown under its name. */
  promise: string;
}

const THEMES: Record<string, ShelfTheme> = {
  books: {
    icon: BookOpen,
    plate: "var(--color-royal-950)",
    glow: "color-mix(in oklch, var(--color-royal-500) 55%, transparent)",
    ink: "var(--color-gold-200)",
    ring: "color-mix(in oklch, var(--color-gold-300) 55%, transparent)",
    crest: "rgb(255 255 255 / 0.06)",
    promise: "For the pew and for home",
  },
  garments: {
    icon: Shirt,
    plate: "var(--color-parchment-100)",
    glow: "rgb(255 255 255 / 0.95)",
    ink: "var(--color-royal-800)",
    ring: "color-mix(in oklch, var(--color-gold-500) 45%, transparent)",
    crest: "color-mix(in oklch, var(--color-royal-900) 7%, transparent)",
    promise: "White garments, every size",
  },
  devotional: {
    icon: Flame,
    plate: "oklch(0.27 0.075 20)",
    glow: "color-mix(in oklch, var(--color-gold-400) 38%, transparent)",
    ink: "var(--color-gold-100)",
    ring: "color-mix(in oklch, var(--color-gold-300) 45%, transparent)",
    crest: "rgb(255 255 255 / 0.06)",
    promise: "For prayer at home",
  },
  centenary: {
    icon: Sparkles,
    plate: "var(--color-gold-300)",
    glow: "color-mix(in oklch, var(--color-gold-100) 85%, transparent)",
    ink: "var(--color-royal-900)",
    ring: "color-mix(in oklch, var(--color-royal-900) 35%, transparent)",
    crest: "color-mix(in oklch, var(--color-royal-950) 9%, transparent)",
    promise: "Keepsakes of 1925 to 2025",
  },
};

const FALLBACK: ShelfTheme = { ...THEMES.books!, icon: ShoppingBag, promise: "From the church store" };

export function shelfTheme(categorySlug: string | null | undefined): ShelfTheme {
  return (categorySlug && THEMES[categorySlug]) || FALLBACK;
}

/**
 * How buying works, said the same way everywhere in the store. There is no online
 * payment: the store team confirms each order and how to pay.
 */
export const ORDER_STEPS: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: HandHeart, title: "Choose", body: "Pick your items and add them to your bag." },
  { icon: PhoneCall, title: "We call you", body: "The store team confirms your order and how to pay." },
  {
    icon: MapPin,
    title: "Collect or delivery",
    body: "Collect at the National Headquarters, or we deliver.",
  },
];
