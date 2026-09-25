"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { isActive, moreIcon as MoreIcon, moreNav, primaryNav } from "@/config/navigation";
import { cn } from "@/lib/utils";

import { MoreMenuDrawer } from "./more-menu";

/** Thumb-reach navigation for phones: the same five destinations as the top bar. */
export function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = React.useState(false);
  const moreActive = moreNav.some((g) => g.items.some((i) => isActive(pathname, i)));
  const item =
    "relative flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-[0.6875rem] font-semibold transition-colors";

  return (
    <>
      <nav
        data-bottom-nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
      >
        <ul className="mx-auto flex max-w-lg">
          {primaryNav.map((link) => {
            const active = isActive(pathname, link);
            return (
              <li key={link.href} className="flex flex-1">
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(item, active ? "text-foreground" : "text-muted-foreground")}
                >
                  {active && (
                    <span aria-hidden className="absolute top-0 h-0.5 w-8 rounded-pill bg-highlight" />
                  )}
                  <link.icon aria-hidden className={cn("size-[1.375rem]", active && "stroke-[2.25]")} />
                  {link.label === "Find a Church" ? "Find" : link.label}
                </Link>
              </li>
            );
          })}
          <li className="flex flex-1">
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              aria-haspopup="dialog"
              className={cn(item, "cursor-pointer", moreActive ? "text-foreground" : "text-muted-foreground")}
            >
              {moreActive && (
                <span aria-hidden className="absolute top-0 h-0.5 w-8 rounded-pill bg-highlight" />
              )}
              <MoreIcon aria-hidden className="size-[1.375rem]" />
              More
            </button>
          </li>
        </ul>
      </nav>
      <MoreMenuDrawer open={moreOpen} onOpenChange={setMoreOpen} />
    </>
  );
}
