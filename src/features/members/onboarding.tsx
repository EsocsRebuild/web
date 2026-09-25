"use client";

import { Check, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { KindBadge } from "@/components/patterns/kind-badge";
import { UnitAvatar } from "@/components/patterns/unit-avatar";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";
import { getSocial } from "@/data/social";
import { filterUnits, type FinderUnit } from "@/features/find/find-explorer";
import { FollowButton } from "@/features/social/actions";
import { reportSocialError } from "@/features/social/provider";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

import { MemberGate } from "./member-gate";

/** "Welcome home": choose a home church, follow what matters, land on your Home. */
export function Onboarding({ churches, suggestions }: { churches: FinderUnit[]; suggestions: FinderUnit[] }) {
  const router = useRouter();
  const [step, setStep] = React.useState<1 | 2>(1);
  const [q, setQ] = React.useState("");
  const [chosen, setChosen] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const results = React.useMemo(
    () => filterUnits(churches, { q, kind: null, country: null }).slice(0, 12),
    [churches, q],
  );
  const chosenUnit = churches.find((c) => c.slug === chosen);

  return (
    <MemberGate reason="Sign in to choose your home church.">
      {(member) => (
        <div className="grid gap-8">
          <ol className="flex gap-2" aria-label="Steps">
            {["Your church", "Follow"].map((label, i) => (
              <li
                key={label}
                aria-current={step === i + 1 ? "step" : undefined}
                className={cn(
                  "flex items-center gap-2 text-sm font-semibold",
                  step === i + 1 ? "text-foreground" : "text-subtle-foreground",
                )}
              >
                <span
                  className={cn(
                    "inline-flex size-7 items-center justify-center rounded-full border text-xs",
                    step > i + 1
                      ? "border-success bg-success text-white"
                      : step === i + 1
                        ? "border-foreground"
                        : "border-border",
                  )}
                >
                  {step > i + 1 ? <Check className="size-4" /> : i + 1}
                </span>
                {label}
                {i === 0 && <span aria-hidden className="mx-1 h-px w-8 bg-border" />}
              </li>
            ))}
          </ol>

          {step === 1 ? (
            <section aria-labelledby="choose-heading" className="grid gap-5">
              <div className="grid gap-2">
                <h2 id="choose-heading" className="font-display text-display-sm font-extrabold">
                  Welcome, {member.displayName}. Where do you worship?
                </h2>
                <p className="text-muted-foreground">
                  Your home church appears first everywhere, with its news and events.
                </p>
              </div>
              <div className="relative">
                <label htmlFor="onboarding-q" className="sr-only">
                  Search for your church
                </label>
                <Search
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-subtle-foreground"
                />
                <input
                  id="onboarding-q"
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Town, province or church name"
                  className="h-12 w-full rounded-pill border border-input bg-surface pr-4 pl-12 text-base outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                />
              </div>
              <ul role="radiogroup" aria-label="Your church" className="grid gap-2 sm:grid-cols-2">
                {results.map((c) => {
                  const selected = chosen === c.slug;
                  return (
                    <li key={c.slug}>
                      <button
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setChosen(c.slug)}
                        className={cn(
                          "flex w-full cursor-pointer items-center gap-3 rounded-card border p-3 text-left transition-colors",
                          selected
                            ? "border-foreground bg-surface-muted"
                            : "border-border bg-surface hover:border-border-strong",
                        )}
                      >
                        <UnitAvatar name={c.name} kind={c.kind} size="sm" />
                        <span className="grid min-w-0 flex-1 gap-1">
                          <span className="truncate text-sm font-semibold">{c.name}</span>
                          <span className="flex items-center gap-2 text-xs text-muted-foreground">
                            <KindBadge kind={c.kind} />
                            <span className="truncate">{c.locality ?? c.parentName}</span>
                          </span>
                        </span>
                        {selected && <Check aria-hidden className="size-5 shrink-0" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="cursor-pointer text-sm font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  I&apos;ll choose later
                </button>
                <Button
                  size="lg"
                  disabled={!chosen}
                  loading={saving}
                  onClick={async () => {
                    setSaving(true);
                    try {
                      await getSocial().updateProfile({ homeUnitSlug: chosen });
                      await getSocial().setFollowing(chosen!, true);
                      toast.success(`${chosenUnit?.name} is now your church`);
                      setStep(2);
                    } catch (error) {
                      reportSocialError(error);
                    } finally {
                      setSaving(false);
                    }
                  }}
                >
                  Continue
                </Button>
              </div>
            </section>
          ) : (
            <section aria-labelledby="follow-heading" className="grid gap-5">
              <div className="grid gap-2">
                <h2 id="follow-heading" className="font-display text-display-sm font-extrabold">
                  Follow what matters to you
                </h2>
                <p className="text-muted-foreground">
                  Their posts appear first in your Home feed. You can change this any time.
                </p>
              </div>
              <ul className="grid gap-3">
                {suggestions.map((s) => (
                  <li
                    key={s.slug}
                    className="flex items-center gap-3 rounded-card border border-border bg-surface p-3"
                  >
                    <UnitAvatar name={s.name} kind={s.kind} size="md" />
                    <span className="grid min-w-0 flex-1">
                      <span className="truncate font-semibold">{s.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {s.locality ?? s.parentName ?? "The Holy Order"}
                      </span>
                    </span>
                    <FollowButton slug={s.slug} name={s.name} size="sm" />
                  </li>
                ))}
              </ul>
              <div className="flex justify-end">
                <Button
                  size="lg"
                  onClick={() =>
                    router.push(member.homeUnitSlug ? routes.unit(member.homeUnitSlug) : routes.home())
                  }
                >
                  {member.homeUnitSlug ? "Go to my church" : "Go to Home"}
                </Button>
              </div>
            </section>
          )}
        </div>
      )}
    </MemberGate>
  );
}
