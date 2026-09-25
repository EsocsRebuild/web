import { describe, expect, it } from "vitest";

import { easterSunday, nthWeekdayOfMonth, observancesForYear, upcomingObservances } from "./church-calendar";

const iso = (d: Date) => d.toISOString().slice(0, 10);

describe("easterSunday", () => {
  it.each([
    [2008, "2008-03-23"],
    [2019, "2019-04-21"],
    [2024, "2024-03-31"],
    [2025, "2025-04-20"],
    [2026, "2026-04-05"],
    [2027, "2027-03-28"],
    [2038, "2038-04-25"],
    [2285, "2285-03-22"],
  ])("%i → %s", (year, expected) => {
    expect(iso(easterSunday(year))).toBe(expected);
  });
});

describe("nthWeekdayOfMonth", () => {
  it("finds the third Sunday of June", () => {
    expect(iso(nthWeekdayOfMonth(2026, 6, 0, 3))).toBe("2026-06-21");
    expect(iso(nthWeekdayOfMonth(2027, 6, 0, 3))).toBe("2027-06-20");
  });

  it("handles a month that starts on the target weekday", () => {
    // 1 March 2026 is a Sunday.
    expect(iso(nthWeekdayOfMonth(2026, 3, 0, 1))).toBe("2026-03-01");
  });
});

describe("observancesForYear", () => {
  const byTitle = (year: number) => Object.fromEntries(observancesForYear(year).map((o) => [o.title, o]));

  it("computes Holy Week and Lent for 2026", () => {
    const o = byTitle(2026);
    expect(o["Ash Wednesday · Lent begins"].date).toBe("2026-02-18");
    expect(o["Ash Wednesday · Lent begins"].endDate).toBe("2026-04-04");
    expect(o["Palm Sunday"].date).toBe("2026-03-29");
    expect(o["Good Friday"].date).toBe("2026-04-03");
    expect(o["Easter Sunday"].date).toBe("2026-04-05");
  });

  it("puts ESOCS Mother's Day on the fourth Sunday after Ash Wednesday", () => {
    expect(byTitle(2026)["ESOCS Mother's Day"].date).toBe("2026-03-15");
    expect(byTitle(2027)["ESOCS Mother's Day"].date).toBe("2027-03-07");
    for (let year = 2020; year <= 2040; year++) {
      expect(new Date(byTitle(year)["ESOCS Mother's Day"].date).getUTCDay()).toBe(0);
    }
  });

  it("gives every observance a unique slug", () => {
    const slugs = [2026, 2027].flatMap(observancesForYear).map((o) => o.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe("upcomingObservances", () => {
  it("returns future observances in order, rolling into next year", () => {
    const list = upcomingObservances(new Date("2026-09-24T12:00:00Z"), 4);
    expect(list.map((o) => o.date)).toEqual(["2026-12-25", "2027-02-10", "2027-03-07", "2027-03-21"]);
  });

  it("keeps Lent while it is still running", () => {
    const list = upcomingObservances(new Date("2026-03-01T00:00:00Z"), 1);
    expect(list[0].title).toMatch(/Lent/);
  });
});
