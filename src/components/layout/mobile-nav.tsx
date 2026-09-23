"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { socialIcons } from "@/components/icons/social-icons";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { mainNav, siteConfig } from "@/config/site";

export function MobileNav({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  // Close the menu after navigation.
  const [lastPath, setLastPath] = React.useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent>
        <div className="flex h-header shrink-0 items-center px-gutter">
          <SheetTitle className="font-display text-2xl font-semibold">{siteConfig.name}</SheetTitle>
          <SheetDescription className="sr-only">Site navigation</SheetDescription>
        </div>

        <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-gutter">
          <Accordion type="single" collapsible>
            {mainNav.map((item) =>
              item.children ? (
                <AccordionItem key={item.href} value={item.href}>
                  <AccordionTrigger className="text-lg">{item.title}</AccordionTrigger>
                  <AccordionContent className="pb-3">
                    <ul>
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className="flex min-h-11 items-center text-base text-muted-foreground hover:text-foreground"
                          >
                            {child.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex min-h-14 items-center border-b border-border text-lg font-semibold hover:text-highlight"
                >
                  {item.title}
                </Link>
              ),
            )}
          </Accordion>
        </nav>

        <div className="grid gap-4 border-t border-border px-gutter py-6">
          <Button asChild variant="accent" size="lg" fullWidth>
            <Link href="/give">Give</Link>
          </Button>
          <ul className="flex justify-center gap-1">
            {Object.entries(siteConfig.socials).map(([key, href]) => {
              const Icon = socialIcons[key as keyof typeof socialIcons];
              return (
                <li key={key}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={key}
                    className="inline-flex size-11 items-center justify-center rounded-control text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                  >
                    <Icon className="size-4.5" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  );
}
