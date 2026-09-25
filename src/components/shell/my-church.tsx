"use client";

import { Church, Plus } from "lucide-react";
import Link from "next/link";

import { useSocial } from "@/features/social/provider";
import { routes } from "@/lib/routes";

/** "My Church" pinned at the top of the rail once a member picks a home church. */
export function MyChurchShortcut() {
  const { member, requestSignIn } = useSocial();

  if (member?.homeUnitSlug) {
    return (
      <Link
        href={routes.unit(member.homeUnitSlug)}
        className="flex min-h-12 items-center gap-3 rounded-card bg-accent-soft px-3 text-sm font-bold text-accent-soft-foreground"
      >
        <Church aria-hidden className="size-5" />
        My Church
      </Link>
    );
  }

  const className =
    "flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-card border border-dashed border-border-strong px-3 text-left text-sm font-semibold text-muted-foreground hover:text-foreground";

  return member ? (
    <Link href={routes.onboarding()} className={className}>
      <Plus aria-hidden className="size-5" /> Choose your church
    </Link>
  ) : (
    <button
      type="button"
      className={className}
      onClick={() => requestSignIn("Sign in to pin your home church here.")}
    >
      <Plus aria-hidden className="size-5" /> Choose your church
    </button>
  );
}
