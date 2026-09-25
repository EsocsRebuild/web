import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

export interface Bridge {
  href: string;
  eyebrow: string;
  title: string;
  description?: string;
}

/** "Continue the story": every page ends by handing the reader to the next chapter. */
export function Bridges({ items, className }: { items: Bridge[]; className?: string }) {
  if (!items.length) return null;
  return (
    <section aria-labelledby="continue-heading" className={cn("grid gap-4", className)}>
      <h2 id="continue-heading" className="text-overline font-semibold text-subtle-foreground uppercase">
        Continue the story
      </h2>
      <ul
        className={cn(
          "grid gap-3",
          items.length > 1 && "sm:grid-cols-2",
          items.length > 2 && "lg:grid-cols-3",
        )}
      >
        {items.map((item, i) => (
          <Reveal as="li" key={item.href} delay={i * 60}>
            <Link
              href={item.href}
              className="group/bridge flex h-full flex-col gap-1.5 rounded-card border border-border bg-surface p-5 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-lift"
            >
              <span className="flex items-center justify-between gap-3 text-overline font-semibold text-highlight uppercase">
                {item.eyebrow}
                <ArrowUpRight
                  aria-hidden
                  className="size-4 text-muted-foreground transition-transform group-hover/bridge:translate-x-0.5 group-hover/bridge:-translate-y-0.5"
                />
              </span>
              <span className="font-display text-lg leading-snug font-bold">{item.title}</span>
              {item.description && (
                <span className="text-sm leading-6 text-muted-foreground">{item.description}</span>
              )}
            </Link>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
