/**
 * Minimal iCalendar (RFC 5545) for all-day church events, so "Add to calendar"
 * works in Google, Apple and Outlook calendars without a third-party service.
 */

export interface CalendarEntry {
  uid: string;
  title: string;
  description?: string;
  /** Inclusive ISO dates (YYYY-MM-DD). */
  start: string;
  end?: string;
  url?: string;
  location?: string;
}

const compact = (iso: string) => iso.replace(/-/g, "");

/** All-day DTEND is exclusive in iCalendar: the day after the last day. */
function dayAfter(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/** Escapes text per RFC 5545 §3.3.11. */
function text(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Folds lines longer than 75 octets (§3.1). */
function fold(line: string) {
  const out: string[] = [];
  let rest = line;
  while (new TextEncoder().encode(rest).length > 75) {
    let cut = 75;
    while (new TextEncoder().encode(rest.slice(0, cut)).length > 75) cut--;
    out.push(rest.slice(0, cut));
    rest = ` ${rest.slice(cut)}`;
  }
  out.push(rest);
  return out.join("\r\n");
}

export function toIcs(entries: CalendarEntry[], now: Date = new Date()): string {
  const stamp = now
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ESOCS//Church Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];
  for (const e of entries) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.uid}@esocs.net`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${compact(e.start)}`,
      `DTEND;VALUE=DATE:${compact(dayAfter(e.end ?? e.start))}`,
      `SUMMARY:${text(e.title)}`,
      ...(e.description ? [`DESCRIPTION:${text(e.description)}`] : []),
      ...(e.location ? [`LOCATION:${text(e.location)}`] : []),
      ...(e.url ? [`URL:${e.url}`] : []),
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}
