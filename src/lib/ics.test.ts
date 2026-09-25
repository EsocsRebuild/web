import { describe, expect, it } from "vitest";

import { toIcs } from "./ics";

const NOW = new Date("2026-09-25T10:30:00Z");

describe("toIcs", () => {
  it("writes an all-day event with an exclusive end date", () => {
    const ics = toIcs([{ uid: "easter-sunday-2027", title: "Easter Sunday", start: "2027-03-28" }], NOW);
    expect(ics).toContain("BEGIN:VCALENDAR\r\n");
    expect(ics).toContain("DTSTART;VALUE=DATE:20270328");
    expect(ics).toContain("DTEND;VALUE=DATE:20270329");
    expect(ics).toContain("UID:easter-sunday-2027@esocs.net");
    expect(ics).toContain("DTSTAMP:20260925T103000Z");
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
  });

  it("spans multi-day observances and crosses month ends", () => {
    const ics = toIcs([{ uid: "lent", title: "Lent", start: "2027-02-10", end: "2027-03-27" }], NOW);
    expect(ics).toContain("DTEND;VALUE=DATE:20270328");
    const yearEnd = toIcs([{ uid: "nye", title: "Watch night", start: "2026-12-31" }], NOW);
    expect(yearEnd).toContain("DTEND;VALUE=DATE:20270101");
  });

  it("escapes text and folds long lines", () => {
    const ics = toIcs(
      [
        {
          uid: "x",
          title: "Prayer; praise, and thanks",
          start: "2026-12-25",
          description: "Line one\nLine two ".repeat(10),
        },
      ],
      NOW,
    );
    expect(ics).toContain("SUMMARY:Prayer\\; praise\\, and thanks");
    for (const line of ics.split("\r\n"))
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
  });
});
