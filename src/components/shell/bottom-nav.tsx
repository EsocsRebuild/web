"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { bottomNav, isActive, moreIcon as MoreIcon, moreNav } from "@/config/navigation";
import { cn } from "@/lib/utils";

// The sheet and its drawer library load on the first tap of More, warmed on touch.
const loadDrawer = () => import("./more-menu-drawer");
const MoreMenuDrawer = dynamic(loadDrawer, { ssr: false });

/** Thumb-reach navigation for phones: the same five destinations as the top bar. */
export function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = React.useState(false);
  const [moreUsed, setMoreUsed] = React.useState(false);

  // Mount the sheet closed first, then open it, so it slides up the first time too.
  const openMore = async () => {
    setMoreUsed(true);
    await loadDrawer();
    requestAnimationFrame(() => setMoreOpen(true));
  };
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
          {bottomNav.map((link) => {
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
              onClick={() => void openMore()}
              onPointerDown={() => void loadDrawer()}
              onFocus={() => void loadDrawer()}
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
      {moreUsed && <MoreMenuDrawer open={moreOpen} onOpenChange={setMoreOpen} />}
    </>
  );
}
