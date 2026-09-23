import { siteConfig } from "@/config/site";

const locale = siteConfig.locale;
const timeZone = siteConfig.timeZone;

type DateInput = Date | string | number;
const toDate = (d: DateInput) => (d instanceof Date ? d : new Date(d));

/** e.g. "Sunday, 5 October 2026" */
export function formatDate(date: DateInput, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone,
    ...options,
  }).format(toDate(date));
}

/** e.g. "5 Oct" */
export function formatShortDate(date: DateInput) {
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", timeZone }).format(toDate(date));
}

/** Date parts for calendar badges, e.g. { day: "05", month: "OCT", weekday: "Sun" }. */
export function dateParts(date: DateInput) {
  const d = toDate(date);
  const get = (o: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, { ...o, timeZone }).format(d);
  return {
    day: get({ day: "2-digit" }),
    month: get({ month: "short" }).toUpperCase(),
    weekday: get({ weekday: "short" }),
  };
}

/** e.g. "9:00 am" */
export function formatTime(date: DateInput) {
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone,
  }).format(toDate(date));
}

/** e.g. "in 3 days", "2 hours ago" */
export function formatRelative(date: DateInput, now: Date = new Date()) {
  const diff = toDate(date).getTime() - now.getTime();
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31_536_000_000],
    ["month", 2_592_000_000],
    ["week", 604_800_000],
    ["day", 86_400_000],
    ["hour", 3_600_000],
    ["minute", 60_000],
  ];
  for (const [unit, ms] of units) {
    if (Math.abs(diff) >= ms) return rtf.format(Math.round(diff / ms), unit);
  }
  return rtf.format(Math.round(diff / 1000), "second");
}

/** e.g. "₦25,000". Defaults to the site currency. */
export function formatCurrency(amount: number, currency = siteConfig.currency) {
  return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }).format(
    amount,
  );
}

/** e.g. "12.4K" */
export function formatCompact(n: number) {
  return new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

/** Seconds to "42 min" or "1 hr 5 min". */
export function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return h ? `${h} hr ${m} min` : `${m} min`;
}
