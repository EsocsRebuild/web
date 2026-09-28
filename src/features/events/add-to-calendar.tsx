"use client";

import { CalendarPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";
import { toIcs, type CalendarEntry } from "@/lib/ics";

/** Downloads an .ics file that Google, Apple and Outlook calendars all accept. */
export function AddToCalendar({
  entry,
  fileName,
  label = "Add to calendar",
}: {
  entry: Omit<CalendarEntry, "url"> & { path: string };
  fileName: string;
  label?: string;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      fullWidth
      leftIcon={<CalendarPlus />}
      onClick={() => {
        const { path, ...rest } = entry;
        const ics = toIcs([{ ...rest, url: new URL(path, window.location.origin).toString() }]);
        const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
        const a = document.createElement("a");
        a.href = url;
        a.download = `${fileName}.ics`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        toast.success("Calendar file downloaded. Open it to add the event.");
      }}
    >
      {label}
    </Button>
  );
}
