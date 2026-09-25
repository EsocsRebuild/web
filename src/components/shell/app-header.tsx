"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/icons/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { isActive, primaryNav } from "@/config/navigation";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

import { useCommandPalette } from "./command-palette";
import { MoreMenuDesktop } from "./more-menu";
import { AccountControls } from "./account-controls";

export function AppHeader() {
  const pathname = usePathname();
  const { open: openSearch } = useCommandPalette();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 pt-[env(safe-area-inset-top)] backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-header max-w-wide items-center gap-3 px-gutter lg:gap-6">
        <Logo className="shrink-0" />

        <button
          type="button"
          onClick={openSearch}
          className="group hidden h-10 w-full max-w-72 cursor-pointer items-center gap-2.5 rounded-pill border border-border bg-surface-muted px-4 text-sm text-subtle-foreground transition-colors hover:border-border-strong md:flex xl:max-w-80"
        >
          <Search aria-hidden className="size-4" />
          <span className="flex-1 text-left">Search churches, people, news…</span>
          <kbd className="hidden rounded border border-border bg-surface px-1.5 font-sans text-[0.6875rem] text-muted-foreground lg:inline">
            /
          </kbd>
        </button>

        <nav aria-label="Main" className="hidden flex-1 justify-center lg:flex">
          <ul className="flex items-center gap-1">
            {primaryNav.map((item) => {
              const active = isActive(pathname, item);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative inline-flex h-11 items-center gap-2 rounded-control px-3.5 text-sm font-semibold transition-colors xl:px-4",
                      active
                        ? "text-foreground"
                        : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
                    )}
                  >
                    <item.icon aria-hidden className="size-[1.125rem]" />
                    {item.label}
                    {active && (
                      <span
                        aria-hidden
                        className="absolute inset-x-3 -bottom-[0.6875rem] h-0.5 rounded-pill bg-highlight"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
            <li>
              <MoreMenuDesktop />
            </li>
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={openSearch} aria-label="Search">
            <Search />
          </Button>
          <ThemeToggle />
          <AccountControls />
          <Button asChild variant="accent" size="sm" className="ml-1 hidden sm:inline-flex">
            <Link href={routes.give()}>Give</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
