import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function ServiceTimes({ className }: { className?: string }) {
  return (
    <dl className={cn("grid divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0", className)}>
      {siteConfig.services.map((s) => (
        <div
          key={s.name}
          className="flex items-baseline justify-between gap-4 py-5 first:pt-0 last:pb-0 md:flex-col md:gap-1 md:px-8 md:py-0 md:first:pl-0 md:last:pr-0"
        >
          <dt>
            <span className="block text-sm font-semibold">{s.name}</span>
            <span className="block text-sm text-muted-foreground">{s.day}s</span>
          </dt>
          <dd className="font-display text-3xl font-bold tabular-nums md:order-first md:text-4xl">
            {s.time}
          </dd>
        </div>
      ))}
    </dl>
  );
}
