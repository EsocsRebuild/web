"use client";

import { ChevronDown, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/icons/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { mainNav } from "@/config/site";
import { useScrolled } from "@/hooks/use-scrolled";

import { Container } from "./container";
import { MobileNav } from "./mobile-nav";

export function SiteHeader() {
  const pathname = usePathname();
  const scrolled = useScrolled(16);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    // Transparent over a `data-hero` section until scrolled; see globals.css.
    <header
      data-scrolled={scrolled}
      className="site-header fixed inset-x-0 top-0 z-40 border-b border-border bg-background/95 pt-[env(safe-area-inset-top)] text-foreground backdrop-blur-md transition-colors duration-200"
    >
      <Container size="wide" className="flex h-header items-center justify-between gap-4">
        <Logo className="text-foreground" />

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center">
            {mainNav.map((item) => (
              <li key={item.href} className="group/nav relative">
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="inline-flex h-11 items-center gap-1 px-3.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:text-foreground xl:px-4"
                >
                  {item.title}
                  {item.children && <ChevronDown aria-hidden className="size-3.5" />}
                </Link>

                {item.children && (
                  <div className="invisible absolute top-full left-0 pt-2 opacity-0 transition-opacity duration-150 group-focus-within/nav:visible group-focus-within/nav:opacity-100 group-hover/nav:visible group-hover/nav:opacity-100">
                    <ul className="w-64 rounded-card border border-border bg-surface p-1.5 text-foreground shadow-overlay">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link href={child.href} className="block rounded-control px-3 py-2.5 hover:bg-surface-muted">
                            <span className="block text-sm font-medium">{child.title}</span>
                            {child.description && (
                              <span className="mt-0.5 block text-xs text-muted-foreground">{child.description}</span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1 text-foreground">
          <ThemeToggle />
          <Button asChild variant="accent" size="sm" className="ml-1 hidden sm:inline-flex">
            <Link href="/give">Give</Link>
          </Button>
          <MobileNav
            trigger={
              <Button variant="ghost" size="icon" className="-mr-2 lg:hidden" aria-label="Open menu">
                <Menu />
              </Button>
            }
          />
        </div>
      </Container>
    </header>
  );
}
