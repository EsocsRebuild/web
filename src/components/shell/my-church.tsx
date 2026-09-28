"use client";

import { Church, Plus } from "lucide-react";
import Link from "next/link";

import { useSocial } from "@/features/social/provider";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/** "My Church" on Home once a member picks a home church; an invitation to choose one until then. */
export function MyChurchShortcut({ className }: { className?: string }) {
  const { member, requestSignIn } = useSocial();

  if (member?.homeUnitSlug) {
    return (
      <Link
        href={routes.unit(member.homeUnitSlug)}
        className={cn(
          "inline-flex min-h-11 items-center gap-2 rounded-pill bg-accent-soft px-4 text-sm font-semibold text-accent-soft-foreground hover:bg-accent-soft/70",
          className,
        )}
      >
        <Church aria-hidden className="size-4" />
        My Church
      </Link>
    );
  }

  const base =
    "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-pill border border-dashed border-border-strong px-4 text-sm font-semibold text-muted-foreground hover:text-foreground";

  return member ? (
    <Link href={routes.onboarding()} className={cn(base, className)}>
      <Plus aria-hidden className="size-4" /> Choose your church
    </Link>
  ) : (
    <button
      type="button"
      className={cn(base, className)}
      onClick={() => requestSignIn("Sign in to keep your home church one tap away.")}
    >
      <Plus aria-hidden className="size-4" /> Choose your church
    </button>
  );
}
