const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ndash: "–",
  mdash: "—",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
  hellip: "…",
};

export function decodeEntities(value: string) {
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity: string) => {
    if (entity[0] === "#") {
      const hex = entity[1].toLowerCase() === "x";
      return String.fromCodePoint(parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10));
    }
    return ENTITIES[entity.toLowerCase()] ?? match;
  });
}

/**
 * Legacy CMS HTML to plain paragraphs. Keeps content renderable as text, so no
 * third-party markup ever reaches `dangerouslySetInnerHTML`.
 */
export function htmlToParagraphs(html: string | null | undefined): string[] {
  if (!html) return [];
  const text = html
    .replace(/<(style|script|button)[\s\S]*?<\/\1>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<br\s*\/?>|<\/(p|div|li|h\d)>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\r/g, "");
  // Only block boundaries and blank lines start a paragraph; the legacy text wraps
  // mid-sentence, so single line breaks are just spaces.
  return decodeEntities(text)
    .split(/\n[ \t]*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

const KEEP_UPPER = new Set([
  "CMC",
  "DBA",
  "SAG",
  "OON",
  "MFR",
  "UK",
  "USA",
  "HME",
  "MZYS",
  "MZGHQ",
  "JWF",
  "PH",
]);
const KEEP_LOWER = new Set(["of", "and", "the", "in", "on", "at", "for", "to"]);

/**
 * Converts ALL-CAPS names and titles from the legacy tables to readable case,
 * preserving initials ("W.O.C."), known acronyms and small joining words.
 */
export function displayCase(value: string) {
  return value
    .toLowerCase()
    .split(/(\s+|(?=[(/-])|(?<=[(/-]))/)
    .map((token, index) => {
      const upper = token.toUpperCase();
      const bare = upper.replace(/[^A-Z]/g, "");
      if (KEEP_UPPER.has(bare)) return upper;
      if (/^([a-z]\.)+[a-z]?\.?$/i.test(token)) return upper;
      if (index > 0 && KEEP_LOWER.has(token)) return token;
      // Capitalise only a leading letter (after any opening quote or bracket), so
      // "100th" and "children's" keep their lower-case letters and "'biodun" becomes "'Biodun".
      return token.replace(/^(['’"“(]*)([a-z])/, (_, lead: string, c: string) => lead + c.toUpperCase());
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

/** "2026-03-15" → Date at noon UTC, avoiding off-by-one days across time zones. */
export function dateFromIso(value: string) {
  return new Date(`${value.slice(0, 10)}T12:00:00Z`);
}
