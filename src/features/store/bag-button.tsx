"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";

import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

import { useBagCount } from "./bag-store";

/** The bag in the header, with a count once something is in it. */
export function BagButton({ className }: { className?: string }) {
  const count = useBagCount();
  return (
    <Link
      href={routes.bag()}
      aria-label={count ? `Your bag, ${count} ${count === 1 ? "item" : "items"}` : "Your bag"}
      className={cn(
        "relative inline-flex size-10 items-center justify-center rounded-pill text-foreground/80 transition-colors hover:bg-foreground/[0.07] hover:text-foreground",
        className,
      )}
    >
      <ShoppingBag aria-hidden className="size-[1.125rem]" />
      {count > 0 && (
        <span
          aria-hidden
          className="absolute top-0.5 right-0.5 inline-flex min-w-4.5 items-center justify-center rounded-pill bg-gold-400 px-1 text-[0.625rem] leading-4.5 font-bold text-royal-950 tabular"
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
