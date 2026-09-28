/**
 * Church calendar observances computed from rules, so dates never need to be
 * typed in by hand. ESOCS-specific rules come from the history of the Holy Order:
 * Mother's Day is the fourth Sunday after Ash Wednesday and Father's Day the third
 * Sunday of June (both instituted on 8 April 2021).
 *
 * All dates are calendar dates as `YYYY-MM-DD`, computed in UTC to avoid DST drift.
 */

export interface Observance {
  slug: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
}

const DAY = 86_400_000;

const iso = (d: Date) => d.toISOString().slice(0, 10);
const utc = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d));
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * DAY);

/** Western (Gregorian) Easter Sunday, by the anonymous Gregorian algorithm. */
export function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return utc(year, month, day);
}

/** The nth occurrence (1-based) of a weekday (0 = Sunday) in a month. */
export function nthWeekdayOfMonth(year: number, month: number, weekday: number, n: number): Date {
  const first = utc(year, month, 1);
  const offset = (weekday - first.getUTCDay() + 7) % 7;
  return addDays(first, offset + (n - 1) * 7);
}

export function observancesForYear(year: number): Observance[] {
  const easter = easterSunday(year);
  const ashWednesday = addDays(easter, -46);

  return [
    {
      slug: `ash-wednesday-${year}`,
      title: "Ash Wednesday · Lent begins",
      description: "The start of the forty-day Lenten season of prayer and fasting.",
      date: iso(ashWednesday),
      endDate: iso(addDays(easter, -1)),
    },
    {
      slug: `mothers-day-${year}`,
      title: "ESOCS Mother's Day",
      description: "Observed on the fourth Sunday after Ash Wednesday.",
      date: iso(addDays(ashWednesday, 4 + 21)),
    },
    {
      slug: `palm-sunday-${year}`,
      title: "Palm Sunday",
      description: "The triumphal entry into Jerusalem; the start of Holy Week.",
      date: iso(addDays(easter, -7)),
    },
    {
      slug: `good-friday-${year}`,
      title: "Good Friday",
      description: "Remembrance of the crucifixion of our Lord Jesus Christ.",
      date: iso(addDays(easter, -2)),
    },
    {
      slug: `easter-sunday-${year}`,
      title: "Easter Sunday",
      description: "Celebration of the resurrection of our Lord Jesus Christ.",
      date: iso(easter),
    },
    {
      slug: `fathers-day-${year}`,
      title: "ESOCS Father's Day",
      description: "Observed on the third Sunday of June.",
      date: iso(nthWeekdayOfMonth(year, 6, 0, 3)),
    },
    {
      slug: `christmas-${year}`,
      title: "Christmas Day",
      description: "Celebration of the birth of our Lord Jesus Christ.",
      date: iso(utc(year, 12, 25)),
    },
  ];
}

/** Observances whose (end) date falls on or after `from`, soonest first. */
export function upcomingObservances(from: Date, limit = 6): Observance[] {
  const today = iso(from);
  const year = from.getUTCFullYear();
  return [year, year + 1]
    .flatMap(observancesForYear)
    .filter((o) => (o.endDate ?? o.date) >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit);
}
