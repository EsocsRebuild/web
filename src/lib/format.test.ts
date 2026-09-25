import { describe, expect, it } from "vitest";

import { dateParts, formatDuration, formatTime } from "./format";

describe("formatDuration", () => {
  it("formats minutes", () => {
    expect(formatDuration(2820)).toBe("47 min");
  });

  it("formats hours and minutes", () => {
    expect(formatDuration(3900)).toBe("1 hr 5 min");
  });
});

describe("formatTime", () => {
  it("uses a 12-hour clock", () => {
    // 08:00 UTC is 09:00 in Africa/Lagos (UTC+1, no DST).
    expect(formatTime("2026-10-04T08:00:00Z")).toMatch(/^9:00\s?am$/i);
  });
});

describe("dateParts", () => {
  it("returns zero-padded day and upper-case month", () => {
    const parts = dateParts("2026-10-04T08:00:00Z");
    expect(parts.day).toBe("04");
    expect(parts.month).toBe("OCT");
    expect(parts.weekday).toBe("Sun");
  });
});
