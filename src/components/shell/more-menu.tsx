"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { isActive, moreNav } from "@/config/navigation";
import { cn } from "@/lib/utils";

export function MoreGroups({ onNavigate, columns }: { onNavigate: () => void; columns?: boolean }) {
  const pathname = usePathname();
  return (
    <div className={cn("grid gap-6", columns && "sm:grid-cols-2")}>
      {moreNav.map((group) => (
        <section key={group.title} aria-labelledby={`more-${group.title}`}>
          <h3
            id={`more-${group.title}`}
            className="px-2 pb-1.5 text-overline font-semibold text-subtle-foreground uppercase"
          >
            {group.title}
          </h3>
          <ul className="grid">
            {group.items.map((item) => {
              const active = isActive(pathname, item);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className="flex min-h-11 items-start gap-3 rounded-control px-2 py-2 hover:bg-surface-muted aria-[current=page]:bg-surface-muted"
                  >
                    <item.icon
                      aria-hidden
                      className="mt-0.5 size-[1.125rem] shrink-0 text-muted-foreground"
                    />
                    <span className="grid gap-0.5">
                      <span className="text-sm font-semibold">{item.label}</span>
                      {item.description && (
                        <span className="text-xs text-muted-foreground">{item.description}</span>
                      )}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

export function MoreMenuDesktop() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const active = moreNav.some((g) => g.items.some((i) => isActive(pathname, i)));
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-pill px-4 text-sm font-semibold transition-colors",
          active || open
            ? "text-foreground"
            : "text-foreground/70 hover:bg-foreground/[0.07] hover:text-foreground",
        )}
      >
        More
        <ChevronDown aria-hidden className={cn("size-4 transition-transform", open && "rotate-180")} />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[34rem] p-4">
        <MoreGroups columns onNavigate={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
