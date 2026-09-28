import placeholders from "@/data/generated/image-placeholders.json";

const map = placeholders as Record<string, string>;

/**
 * The blurred preview for an image this app serves, by its public path
 * (built by `npm run images:placeholders`). Undefined for anything else.
 */
export function placeholderFor(url: string): string | undefined {
  return map[url];
}
