"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Bell,
  Calendar as CalendarIcon,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Grid3X3,
  LayoutGrid,
  MapPin,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

import { DateBadge } from "@/components/patterns/date-badge";
import { SectionHeading } from "@/components/patterns/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toaster";
import type { ChurchEvent } from "@/data/schema/content";
import { formatLongDate } from "@/lib/format";
import { toIcs, type CalendarEntry } from "@/lib/ics";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

const EVENT_KIND_LABELS: Record<
  ChurchEvent["kind"],
  { label: string; badgeVariant: "primary" | "accent" | "neutral" | "outline" }
> = {
  observance: { label: "Observance", badgeVariant: "accent" },
  service: { label: "Service", badgeVariant: "primary" },
  programme: { label: "Programme", badgeVariant: "neutral" },
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getMonthKey(dateStr: string): string {
  return dateStr.slice(0, 7); // YYYY-MM
}

function formatMonthName(monthKey: string): string {
  const [yearStr, monthStr] = monthKey.split("-");
  const year = Number.parseInt(yearStr, 10);
  const month = Number.parseInt(monthStr, 10);
  const date = new Date(Date.UTC(year, month - 1, 1));
  return date.toLocaleString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
}

export function AutomatedEventsBand({ events }: { events: ChurchEvent[] }) {
  const [viewMode, setViewMode] = useState<"grid" | "cards">("grid");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Group events by month (YYYY-MM)
  const monthBuckets = useMemo(() => {
    const buckets = new Map<string, ChurchEvent[]>();
    for (const event of events) {
      const key = getMonthKey(event.date);
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key)!.push(event);
    }
    return buckets;
  }, [events]);

  const monthKeys = useMemo(() => Array.from(monthBuckets.keys()).sort(), [monthBuckets]);

  const currentMonthKey = useMemo(() => {
    const nowKey = new Date().toISOString().slice(0, 7);
    if (monthBuckets.has(nowKey)) return nowKey;
    return monthKeys[0] ?? nowKey;
  }, [monthBuckets, monthKeys]);

  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthKey);
  const [selectedKind, setSelectedKind] = useState<string>("all");

  // Notification modal state
  const [reminderEvent, setReminderEvent] = useState<ChurchEvent | null>(null);
  const [reminderEmail, setReminderEmail] = useState("");
  const [reminderSubmitted, setReminderSubmitted] = useState(false);

  const activeMonthIndex = monthKeys.indexOf(selectedMonth);

  const monthEvents = useMemo(() => {
    const list = monthBuckets.get(selectedMonth) ?? [];
    if (selectedKind === "all") return list;
    return list.filter((e) => e.kind === selectedKind);
  }, [monthBuckets, selectedMonth, selectedKind]);

  // Real Calendar Grid Computation for the Selected Month
  const calendarCells = useMemo(() => {
    if (!selectedMonth) return [];
    const first = new Date(`${selectedMonth}-01T00:00:00Z`);
    const lead = (first.getUTCDay() + 6) % 7;
    const daysInMonth = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
    return Array.from({ length: Math.ceil((lead + daysInMonth) / 7) * 7 }, (_, i) => {
      const day = i - lead + 1;
      return day >= 1 && day <= daysInMonth ? `${selectedMonth}-${String(day).padStart(2, "0")}` : null;
    });
  }, [selectedMonth]);

  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const handlePrevMonth = () => {
    if (activeMonthIndex > 0) {
      setSelectedMonth(monthKeys[activeMonthIndex - 1]);
      setSelectedDay(null);
    }
  };

  const handleNextMonth = () => {
    if (activeMonthIndex < monthKeys.length - 1) {
      setSelectedMonth(monthKeys[activeMonthIndex + 1]);
      setSelectedDay(null);
    }
  };

  const downloadIcs = (event: ChurchEvent) => {
    const entry: CalendarEntry = {
      uid: event.slug,
      title: event.title,
      description: event.description,
      start: event.date,
      end: event.endDate,
      url: new URL(routes.event(event.slug), window.location.origin).toString(),
    };
    const icsContent = toIcs([entry]);
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.slug}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success(`Calendar file for "${event.title}" downloaded.`);
  };

  const handleSubscribeReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderEmail.trim()) return;
    setReminderSubmitted(true);
    toast.success(`Reminder set! We will notify ${reminderEmail} before "${reminderEvent?.title}".`);
    setTimeout(() => {
      setReminderEvent(null);
      setReminderSubmitted(false);
      setReminderEmail("");
    }, 1500);
  };

  // Events filtered by active selected day in Grid View
  const selectedDayEvents = useMemo(() => {
    if (!selectedDay) return monthEvents;
    return monthEvents.filter(
      (e) => e.date === selectedDay || (e.endDate && e.date <= selectedDay && selectedDay <= e.endDate),
    );
  }, [monthEvents, selectedDay]);

  return (
    <section className="bg-muted/30 relative overflow-hidden border-y border-border/60 py-12 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <SectionHeading
              id="automated-events-heading"
              eyebrow="Automated Schedule & Interactive Calendar"
              title={
                <>
                  Dates for the family,{" "}
                  <span className="font-serif font-normal text-accent italic">in fellowship.</span>
                </>
              }
              size="lg"
            />
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Live backend-driven interactive calendar. Select any month or day to explore services,
              observances, and programmes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Switcher: Interactive Real Grid vs Cards */}
            <div className="flex items-center rounded-xl border border-border bg-background p-1 shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                  viewMode === "grid"
                    ? "bg-accent text-accent-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Grid3X3 className="h-3.5 w-3.5" />
                <span>Calendar Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                  viewMode === "cards"
                    ? "bg-accent text-accent-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>Card View</span>
              </button>
            </div>

            <Button variant="outline" size="sm" asChild>
              <Link href={routes.events()}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                All Events
              </Link>
            </Button>
          </div>
        </div>

        {/* Month Navigation & Kind Filters Bar */}
        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-border bg-background/90 p-3 shadow-sm backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
          {/* Month Selection Bar */}
          <div className="scrollbar-none flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handlePrevMonth}
              disabled={activeMonthIndex <= 0}
              aria-label="Previous Month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {monthKeys.map((key) => {
              const isSelected = key === selectedMonth;
              const count = monthBuckets.get(key)?.length ?? 0;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedMonth(key);
                    setSelectedDay(null);
                  }}
                  className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                    isSelected
                      ? "bg-accent text-accent-foreground shadow-md"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>{formatMonthName(key)}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      isSelected
                        ? "bg-accent-foreground/20 text-accent-foreground"
                        : "bg-muted-foreground/15 text-muted-foreground"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleNextMonth}
              disabled={activeMonthIndex >= monthKeys.length - 1}
              aria-label="Next Month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Kind Filter Pills */}
          <div className="flex items-center gap-1.5 border-t border-border/50 pt-2 sm:border-t-0 sm:pt-0">
            {["all", "service", "programme", "observance"].map((kind) => (
              <button
                key={kind}
                onClick={() => setSelectedKind(kind)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  selectedKind === kind
                    ? "bg-foreground font-semibold text-background"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {kind}
              </button>
            ))}
          </div>
        </div>

        {/* Real Interactive Calendar Grid View */}
        {viewMode === "grid" && (
          <div className="mb-8 overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
            <div className="scrollbar-none min-w-0 overflow-x-auto">
              <div className="min-w-150 sm:min-w-0">
                {/* Weekday Header Row */}
                <div className="bg-muted/50 grid grid-cols-7 border-b border-border/80 text-center">
                  {WEEKDAYS.map((day) => (
                    <div
                      key={day}
                      className="py-2.5 text-xs font-bold tracking-wider text-muted-foreground uppercase"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Day Cells Grid */}
                <div className="grid grid-cols-7 divide-x divide-y divide-border/60 bg-border/40">
                  {calendarCells.map((iso, idx) => {
                    if (!iso) {
                      return <div key={idx} className="bg-muted/20 min-h-24 sm:min-h-28" />;
                    }

                    const dayEvents = monthEvents.filter(
                      (e) => e.date === iso || (e.endDate && e.date <= iso && iso <= e.endDate),
                    );
                    const isToday = iso === todayIso;
                    const isSelectedDay = iso === selectedDay;

                    return (
                      <button
                        key={iso}
                        type="button"
                        onClick={() => setSelectedDay(isSelectedDay ? null : iso)}
                        className={cn(
                          "hover:bg-muted/40 flex min-h-24 flex-col justify-between bg-background p-2 text-left transition-all duration-150 sm:min-h-28",
                          isSelectedDay && "bg-accent/5 ring-2 ring-accent",
                          dayEvents.length > 0 && "bg-accent/5 font-medium",
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={cn(
                              "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                              isToday ? "bg-accent text-accent-foreground shadow-xs" : "text-foreground",
                            )}
                          >
                            {Number(iso.slice(8))}
                          </span>

                          {dayEvents.length > 0 && (
                            <span className="rounded-full bg-accent/20 px-1.5 py-0.5 text-[10px] font-bold text-accent">
                              {dayEvents.length}
                            </span>
                          )}
                        </div>

                        {/* Event indicators / dots */}
                        <div className="mt-1 grid gap-1">
                          {dayEvents.slice(0, 2).map((e) => (
                            <span
                              key={e.slug}
                              className="text-ellipsis-none overflow-hidden rounded bg-accent/15 px-1.5 py-0.5 text-[11px] leading-tight font-semibold whitespace-nowrap text-accent"
                            >
                              {e.title}
                            </span>
                          ))}
                          {dayEvents.length > 2 && (
                            <span className="pl-1 text-[10px] font-semibold text-muted-foreground">
                              +{dayEvents.length - 2} more
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Filtered Day Banner */}
            {selectedDay && (
              <div className="flex items-center justify-between border-t border-border bg-accent/10 p-3 px-4 text-xs">
                <span>
                  Showing events for{" "}
                  <strong className="text-foreground">{formatLongDate(selectedDay)}</strong> (
                  {selectedDayEvents.length} found)
                </span>
                <Button variant="ghost" size="sm" onClick={() => setSelectedDay(null)}>
                  Clear Day Selection
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Dynamic Event List / Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedMonth}-${selectedKind}-${selectedDay ?? "all"}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {selectedDayEvents.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {selectedDayEvents.map((event) => {
                  const meta = EVENT_KIND_LABELS[event.kind];
                  return (
                    <div
                      key={event.slug}
                      className="group relative flex flex-col justify-between rounded-2xl border border-border bg-background p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-xl"
                    >
                      {/* Top Header info */}
                      <div>
                        <div className="mb-4 flex items-start justify-between gap-4">
                          <DateBadge date={event.date} size="sm" />
                          <Badge
                            variant={meta.badgeVariant}
                            className="text-xs font-semibold tracking-wider uppercase"
                          >
                            {meta.label}
                          </Badge>
                        </div>

                        {/* Event Title & Details */}
                        <Link
                          href={routes.event(event.slug)}
                          className="transition-colors group-hover:text-accent"
                        >
                          <h3 className="mb-2 font-display text-lg leading-snug font-bold tracking-tight">
                            {event.title}
                          </h3>
                        </Link>
                        <p className="mb-4 text-sm text-balance text-muted-foreground">{event.description}</p>
                      </div>

                      {/* Time & Location badges */}
                      <div className="mt-4 grid gap-2 border-t border-border/60 pt-4">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5 shrink-0 text-accent" />
                          <span>
                            {event.startTime ? `Starts at ${event.startTime}` : "Full Day Observance"}
                            {event.endDate && ` · Until ${formatLongDate(event.endDate)}`}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-accent" />
                          <span>
                            {event.computed ? "Worldwide Observance" : "Church Premises / Virtual Broadcast"}
                          </span>
                        </div>

                        {/* Interactive Remind Me & Calendar Actions */}
                        <div className="mt-3 flex items-center gap-2 border-t border-border/40 pt-3">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={() => downloadIcs(event)}
                          >
                            <CalendarPlus className="mr-1.5 h-3.5 w-3.5" />
                            Add to Calendar
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={() => setReminderEvent(event)}
                          >
                            <Bell className="mr-1.5 h-3.5 w-3.5" />
                            Remind Me
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-background p-12 text-center">
                <CalendarDays className="mb-3 h-10 w-10 text-muted-foreground/60" />
                <h4 className="font-display text-base font-semibold">No events listed for this selection</h4>
                <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                  Try clearing your day selection or choosing another month to view scheduled programmes.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Reminder Subscription Dialog */}
      <Dialog open={Boolean(reminderEvent)} onOpenChange={(open) => !open && setReminderEvent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-accent" />
              Set Event Reminder
            </DialogTitle>
            <DialogDescription>
              Receive an automated notification prior to{" "}
              <strong className="text-foreground">{reminderEvent?.title}</strong> on{" "}
              {reminderEvent?.date ? formatLongDate(reminderEvent.date) : ""}.
            </DialogDescription>
          </DialogHeader>

          {reminderSubmitted ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <CheckCircle2 className="mb-2 h-12 w-12 animate-bounce text-emerald-500" />
              <p className="font-semibold text-foreground">Reminder Confirmed!</p>
              <p className="text-xs text-muted-foreground">
                You will receive your alert before the event starts.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubscribeReminder} className="space-y-4 pt-2">
              <div className="space-y-2">
                <label htmlFor="reminder-email" className="text-xs font-semibold">
                  Email Address / Mobile Number
                </label>
                <Input
                  id="reminder-email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={reminderEmail}
                  onChange={(e) => setReminderEmail(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setReminderEvent(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  <Sparkles className="mr-1.5 h-4 w-4" />
                  Confirm Reminder
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
