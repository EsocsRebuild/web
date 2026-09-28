import { describe, expect, it } from "vitest";

import { cn, initials, slugify } from "./utils";

describe("cn", () => {
  it("resolves conflicting Tailwind classes, last one wins", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("keeps custom display sizes alongside text colours", () => {
    expect(cn("text-display-lg", "text-foreground")).toBe("text-display-lg text-foreground");
  });

  it("drops falsy values", () => {
    expect(cn("a", false, undefined, "b")).toBe("a b");
  });
});

describe("slugify", () => {
  it("creates URL-safe slugs", () => {
    expect(slugify("Harvest Thanksgiving & Praise!")).toBe("harvest-thanksgiving-praise");
  });

  it("strips diacritics", () => {
    expect(slugify("Adúràá")).toBe("aduraa");
  });
});

describe("initials", () => {
  it("ignores clerical titles", () => {
    expect(initials("Most Rev. Samuel Ade")).toBe("SA");
  });

  it("handles single names", () => {
    expect(initials("Grace")).toBe("G");
  });

  it("handles empty input", () => {
    expect(initials("")).toBe("");
  });
});
