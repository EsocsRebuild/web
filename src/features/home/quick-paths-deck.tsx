"use client";

import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  HandHeart,
  MapPin,
  PlayCircle,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

interface QuickPathItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  badge: string;
  mobileSub: string;
}

const PRIMARY_PATH: QuickPathItem = {
  href: routes.find(),
  icon: MapPin,
  title: "Find a House of Prayer",
  body: "Provinces, headquarters & branches near you worldwide.",
  badge: "Worldwide Parishes",
  mobileSub: "Locate houses of prayer & directions",
};

const SECONDARY_PATHS: QuickPathItem[] = [
  {
    href: routes.events(),
    icon: CalendarDays,
    title: "Events & Feasts",
    body: "Services, programmes and the sacred church calendar.",
    badge: "Calendar",
    mobileSub: "Services & programmes",
  },
  {
    href: routes.stream(),
    icon: PlayCircle,
    title: "Sacred Stream",
    body: "Live Sunday services, video messages, and celestial hymns.",
    badge: "Live Worship",
    mobileSub: "Broadcast & hymns",
  },
  {
    href: routes.store(),
    icon: ShoppingBag,
    title: "Sacred Store",
    body: "Hymn books, white prayer garments, and centenary keepsakes.",
    badge: "Treasury",
    mobileSub: "Hymnals & garments",
  },
  {
    href: routes.give(),
    icon: HandHeart,
    title: "Seed of Love",
    body: "Support the evangelical missions and centenary projects of the Order.",
    badge: "Offering",
    mobileSub: "Support the Order",
  },
];

const ALL_PATHS: QuickPathItem[] = [PRIMARY_PATH, ...SECONDARY_PATHS];

export function QuickPathsDeck() {
  const PrimaryIcon = PRIMARY_PATH.icon;

  return (
    <nav
      aria-label="Sanctuary quick pathways"
      className="relative z-20 mx-auto -mt-10 max-w-wide px-gutter sm:-mt-12"
    >
      {/* Mobile Presentation (< 640px) */}
      <div className="grid gap-3 sm:hidden">
        {/* Primary Anchor: Find a Church */}
        <Link
          href={PRIMARY_PATH.href}
          className="group bg-surface-raised flex items-center justify-between gap-4 rounded-panel border border-gold-500/40 p-4 shadow-md transition-all hover:border-gold-500 hover:shadow-lg"
        >
          <div className="flex items-center gap-3.5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gold-500/15 text-accent">
              <PrimaryIcon className="size-5" />
            </span>
            <div>
              <span className="text-[0.6875rem] font-bold tracking-wider text-accent uppercase">
                {PRIMARY_PATH.badge}
              </span>
              <h3 className="text-sm font-bold text-foreground">{PRIMARY_PATH.title}</h3>
              <p className="text-xs text-muted-foreground">{PRIMARY_PATH.mobileSub}</p>
            </div>
          </div>
          <ArrowRight className="size-4 shrink-0 text-accent transition-transform group-hover:translate-x-1" />
        </Link>

        {/* 2x2 Grid for Secondary Pathways */}
        <div className="grid grid-cols-2 gap-2.5">
          {SECONDARY_PATHS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group bg-surface-raised flex flex-col justify-between rounded-card border border-border p-3.5 shadow-sm transition-all hover:border-accent/50"
              >
                <div className="flex items-center justify-between">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-surface-sunken text-foreground/80 group-hover:text-accent">
                    <Icon className="size-4" />
                  </span>
                  <span className="text-[0.625rem] font-semibold text-muted-foreground">{item.badge}</span>
                </div>
                <div className="mt-3">
                  <span className="text-xs font-bold text-foreground group-hover:text-accent">
                    {item.title}
                  </span>
                  <p className="line-clamp-1 text-[0.6875rem] text-muted-foreground">{item.mobileSub}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Desktop & Tablet Presentation (>= 640px): 5-column architectural plinths */}
      <div className="hidden grid-cols-5 gap-3 sm:grid lg:gap-4">
        {ALL_PATHS.map((item, idx) => {
          const Icon = item.icon;
          const isPrimary = idx === 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex flex-col justify-between rounded-panel border p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md",
                isPrimary
                  ? "bg-surface-raised border-gold-500/40 hover:border-gold-500"
                  : "bg-surface-raised/80 hover:bg-surface-raised border-border/90 hover:border-border",
              )}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "flex size-10 items-center justify-center rounded-xl transition-colors",
                      isPrimary
                        ? "bg-gold-500/15 text-accent"
                        : "bg-surface-sunken text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent",
                    )}
                  >
                    <Icon className="size-5" />
                  </span>
                  <ArrowUpRight
                    className={cn(
                      "size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
                      isPrimary ? "text-accent" : "text-muted-foreground group-hover:text-accent",
                    )}
                  />
                </div>

                <div className="mt-4">
                  <span className="text-[0.6875rem] font-bold tracking-wider text-accent uppercase">
                    {item.badge}
                  </span>
                  <h3 className="mt-1 text-sm font-bold text-foreground group-hover:text-accent">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </div>
              </div>

              <div className="mt-4 border-t border-border/60 pt-3">
                <span className="inline-flex items-center gap-1 text-[0.6875rem] font-semibold text-muted-foreground group-hover:text-foreground">
                  <span>Enter</span>
                  <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
