"use client";

import { ArrowRight, Church, MapPin, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { useCommandPalette } from "@/components/shell/command-palette";
import { Button } from "@/components/ui/button";
import { useSocial } from "@/features/social/provider";
import { routes } from "@/lib/routes";

export type ChurchNames = Record<string, { name: string; locality: string | null }>;

/**
 * The first thing in the index: the member's own church, one tap away, or an
 * invitation to find one. Finding a church never asks anyone to sign in first;
 * saving it to a profile is the optional second step.
 */
export function YourChurchCard({ churches, reach }: { churches: ChurchNames; reach: string }) {
  const { member, requestSignIn } = useSocial();

  // Still reading the session: hold the card's space so nothing below it jumps.
  if (member === undefined) {
    return <div aria-hidden className="h-[25rem] animate-pulse rounded-panel bg-surface-muted" />;
  }

  const home = member?.homeUnitSlug ? churches[member.homeUnitSlug] : undefined;

  if (member?.homeUnitSlug && home) {
    return (
      <div className="grid gap-1 rounded-panel border border-border bg-surface p-2">
        <Link
          href={routes.unit(member.homeUnitSlug)}
          className="group/home flex items-center gap-3 rounded-card p-2 transition-colors hover:bg-surface-muted"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-royal-900 text-gold-100">
            <Church aria-hidden className="size-5" />
          </span>
          <span className="grid min-w-0 flex-1">
            <span className="text-overline font-semibold text-subtle-foreground uppercase">Your church</span>
            <span className="text-[0.9375rem] leading-snug font-bold">{home.name}</span>
            {home.locality && <span className="text-xs text-muted-foreground">{home.locality}</span>}
          </span>
          <ArrowRight
            aria-hidden
            className="size-4 shrink-0 text-subtle-foreground transition-transform group-hover/home:translate-x-0.5 group-hover/home:text-foreground"
          />
        </Link>
        <Link
          href={routes.onboarding()}
          className="justify-self-start rounded-control px-2 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          Change church
        </Link>
      </div>
    );
  }

  return (
    <section
      aria-labelledby="find-your-church"
      className="dark relative isolate overflow-hidden rounded-panel border border-white/10 bg-inverse text-foreground"
    >
      <div className="relative h-32 min-h-32 w-full overflow-hidden">
        <Image
          src="/brand/hero-mount-zion.webp"
          alt=""
          fill
          sizes="264px"
          className="object-cover object-[center_30%]"
        />
        <span
          aria-hidden
          className="absolute inset-0 bg-linear-to-b from-transparent via-inverse/15 to-inverse"
        />
        <span className="absolute bottom-3 left-4 inline-flex items-center gap-1.5 rounded-pill bg-black/35 px-2.5 py-1 text-[0.6875rem] font-semibold text-white backdrop-blur-sm">
          <Church aria-hidden className="size-3.5 text-highlight" />
          {reach}
        </span>
      </div>

      <div className="grid gap-4 px-4 pt-1 pb-4">
        <div className="grid gap-1.5">
          <h2
            id="find-your-church"
            className="font-display text-xl leading-tight font-extrabold text-balance"
          >
            Find your church
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            See the services, news and leaders of the house of prayer near you.
          </p>
        </div>

        {/* A plain form: type a town or a church, press Find. Works before any script loads. */}
        <form action={routes.find()} method="get" role="search" className="grid gap-2">
          <label htmlFor="find-your-church-q" className="sr-only">
            Town or church name
          </label>
          <div className="relative">
            <MapPin
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              id="find-your-church-q"
              name="q"
              type="search"
              autoComplete="off"
              enterKeyHint="search"
              placeholder="Your town or church"
              className="h-12 w-full rounded-control border border-white/15 bg-white/[0.07] pr-3 pl-9 text-[0.9375rem] text-foreground placeholder:text-muted-foreground focus:border-highlight focus:outline-none"
            />
          </div>
          <Button type="submit" variant="gold" size="md" fullWidth rightIcon={<ArrowRight aria-hidden />}>
            Find my church
          </Button>
        </form>

        <div className="grid gap-0.5 border-t border-white/10 pt-3 text-center">
          <span className="text-xs text-muted-foreground">Already a member?</span>
          {member ? (
            <Link href={routes.onboarding()} className="text-sm font-semibold text-highlight hover:underline">
              Save your home church
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => requestSignIn("Sign in to keep your home church one tap away.")}
              className="cursor-pointer text-sm font-semibold text-highlight hover:underline"
            >
              Sign in to save your church
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

/** The way out when the index doesn't have it: search everything. */
export function RailSearch() {
  const { open, preload } = useCommandPalette();
  return (
    <button
      type="button"
      onClick={open}
      onPointerEnter={preload}
      onFocus={preload}
      className="flex min-h-11 w-full cursor-pointer items-center gap-2.5 rounded-control border border-dashed border-border-strong px-3 text-left text-sm text-muted-foreground transition-colors hover:border-solid hover:bg-surface-muted hover:text-foreground"
    >
      <Search aria-hidden className="size-4 shrink-0" />
      <span className="flex-1">Can’t find it? Search</span>
      <kbd className="rounded-[4px] border border-border px-1.5 font-sans text-[0.6875rem] font-semibold">
        /
      </kbd>
    </button>
  );
}
