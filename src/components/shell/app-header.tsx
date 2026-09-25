"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { Logo } from "@/components/icons/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { isActive, primaryNav, type NavLink } from "@/config/navigation";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

import { AccountControls } from "./account-controls";
import { useCommandPalette } from "./command-palette";
import { MoreMenuDesktop } from "./more-menu";

/** True once the page has scrolled past `offset` pixels. */
function useScrolled(offset: number) {
  return React.useSyncExternalStore(
    (onChange) => {
      window.addEventListener("scroll", onChange, { passive: true });
      return () => window.removeEventListener("scroll", onChange);
    },
    () => window.scrollY > offset,
    () => false,
  );
}

function NavItem({ item, pathname }: { item: NavLink; pathname: string }) {
  const active = isActive(pathname, item);
  return (
    <li>
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "relative inline-flex h-10 items-center rounded-pill px-4 text-sm font-semibold whitespace-nowrap transition-colors duration-200",
          active ? "text-foreground" : "text-foreground/70 hover:bg-foreground/[0.07] hover:text-foreground",
        )}
      >
        {item.label}
        {active && (
          <span aria-hidden className="absolute inset-x-4 bottom-1.5 h-0.5 rounded-pill bg-highlight" />
        )}
      </Link>
    </li>
  );
}

/**
 * A symmetrical header: the crest and wordmark at the centre, the navigation on
 * either side. Transparent over the page (and light over the home film), it
 * condenses into a floating glass capsule once the page scrolls.
 */
export function AppHeader() {
  const pathname = usePathname();
  const scrolled = useScrolled(24);
  const { open: openSearch } = useCommandPalette();
  const overHero = pathname === "/" && !scrolled;

  // Home is reached through the crest, so the centre-split nav carries the other four.
  const links = primaryNav.filter((n) => n.href !== routes.home());
  const leftLinks = links.slice(0, 2);
  const rightLinks = links.slice(2);

  return (
    <header
      data-site-header
      className={cn(
        "fixed inset-x-0 top-0 z-40 px-gutter pt-[env(safe-area-inset-top)] transition-[padding] duration-500",
        scrolled && "sm:pt-[calc(env(safe-area-inset-top)+0.75rem)]",
        overHero && "dark",
      )}
    >
      <div
        className={cn(
          "mx-auto grid h-header grid-cols-[1fr_auto_1fr] items-center gap-3 text-foreground",
          "transition-[max-width,height,background-color,border-color,box-shadow,border-radius,padding] duration-500 ease-[var(--ease-out-expo)]",
          scrolled
            ? "h-16 max-w-[66rem] rounded-b-panel border border-border/70 bg-background/80 px-3 shadow-[0_18px_50px_-20px_oklch(0.2_0.06_265/0.45)] backdrop-blur-xl backdrop-saturate-150 sm:rounded-pill sm:px-4"
            : "max-w-wide border border-transparent bg-transparent px-0",
        )}
      >
        {/* Left: search, then the first half of the navigation, leaning in to the crest. */}
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={openSearch}
            aria-label="Search"
            className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-pill border border-foreground/15 px-3 text-sm text-foreground/75 transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            <Search aria-hidden className="size-4" />
            <span className={cn("hidden", !scrolled && "2xl:inline")}>Search</span>
            <kbd
              className={cn(
                "hidden rounded-md border border-foreground/15 px-1.5 font-sans text-[0.6875rem] font-semibold",
                !scrolled && "xl:inline",
              )}
            >
              ⌘K
            </kbd>
          </button>
          <nav aria-label="Main" className="ml-auto hidden lg:block">
            <ul className="flex items-center gap-0.5">
              {leftLinks.map((item) => (
                <NavItem key={item.href} item={item} pathname={pathname} />
              ))}
            </ul>
          </nav>
        </div>

        {/* Centre: the crest and wordmark. */}
        <Logo compact={scrolled} className="justify-self-center px-2" />

        {/* Right: the second half of the navigation, then account and Give. */}
        <div className="flex min-w-0 items-center gap-1.5">
          <nav aria-label="More destinations" className="hidden lg:block">
            <ul className="flex items-center gap-0.5">
              {rightLinks.map((item) => (
                <NavItem key={item.href} item={item} pathname={pathname} />
              ))}
              <li>
                <MoreMenuDesktop />
              </li>
            </ul>
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle className="rounded-pill" />
            <AccountControls />
            <Link
              href={routes.give()}
              className="ml-1 hidden h-10 items-center rounded-pill bg-accent px-5 text-sm font-semibold text-accent-foreground transition-[background-color,transform] hover:-translate-y-px hover:bg-accent-hover sm:inline-flex"
            >
              Give
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
