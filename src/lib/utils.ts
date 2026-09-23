import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Register custom font-size tokens so they don't collide with text-colour classes.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["display-2xl", "display-xl", "display-lg", "display-md", "display-sm", "overline"] },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path = "/") {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return new URL(path, base).toString();
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(value: string, max: number) {
  if (value.length <= max) return value;
  const cut = value.lastIndexOf(" ", max);
  return `${value.slice(0, cut > 0 ? cut : max).trimEnd()}…`;
}

const TITLES = /\b(most|rev|revd|dr|pastor|elder|bishop|apostle|evangelist|prophet|mother|mr|mrs|ms)\.?\s+/gi;

/** Two-letter initials, ignoring clerical and honorific titles. */
export function initials(name: string) {
  const words = name.replace(TITLES, "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return (first + last).toUpperCase();
}
