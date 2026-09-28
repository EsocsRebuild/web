import { notFound } from "next/navigation";

import { SectionHeading } from "@/components/patterns/section-heading";
import { EventRows } from "@/features/events/event-rows";
import { getUnitContext, hasTab, staticParamsForTab } from "@/features/units/unit-context";

export const dynamicParams = false;

export function generateStaticParams() {
  return staticParamsForTab("events");
}

export default async function UnitEventsPage({ params }: PageProps<"/church/[slug]">) {
  const ctx = getUnitContext((await params).slug);
  if (!hasTab(ctx, "events")) notFound();
  return (
    <div className="grid gap-6">
      <SectionHeading title="Events" description="Coming up in the next twelve months." />
      <EventRows events={ctx.events} />
    </div>
  );
}
