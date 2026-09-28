import { describe, expect, it } from "vitest";

import { coverFactor, scaleSizes } from "./image-sizes";

describe("coverFactor", () => {
  it("is the extra width a landscape photo needs in a taller frame", () => {
    // 3:2 photo in a 3:4 portrait frame is drawn twice the frame's width.
    expect(coverFactor({ width: 1500, height: 1000 }, { width: 3, height: 4 })).toBe(2);
  });

  it("is 1 when the photo is not cropped at the sides, or its size is unknown", () => {
    expect(coverFactor({ width: 1000, height: 1500 }, { width: 16, height: 9 })).toBe(1);
    expect(coverFactor({ width: null, height: 10 }, { width: 1, height: 1 })).toBe(1);
    expect(coverFactor({ width: 1500, height: 1000 }, undefined)).toBe(1);
  });

  it("never asks for more than three times the frame", () => {
    expect(coverFactor({ width: 5000, height: 500 }, { width: 1, height: 1 })).toBe(3);
  });
});

describe("scaleSizes", () => {
  it("scales the sizes and leaves the media conditions alone", () => {
    expect(scaleSizes("(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw", 2)).toBe(
      "(min-width: 1280px) 50vw, (min-width: 640px) 100vw, 200vw",
    );
    expect(scaleSizes("(min-width: 1024px) 560px, 100vw", 1.5)).toBe("(min-width: 1024px) 840px, 150vw");
  });

  it("rounds up, and returns the hint untouched when nothing is cropped", () => {
    expect(scaleSizes("33vw", 1.1)).toBe("37vw");
    expect(scaleSizes("100vw", 1)).toBe("100vw");
  });
});
