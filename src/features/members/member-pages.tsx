"use client";

import { Bell, Bookmark, CheckCheck, Church, LogOut, Settings, UsersRound } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { EmptyState } from "@/components/patterns/states";
import { UnitAvatar } from "@/components/patterns/unit-avatar";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toaster";
import type { PostKind, UnitKind } from "@/data/schema/content";
import { getSocial } from "@/data/social";
import { FollowButton } from "@/features/social/actions";
import { reportSocialError, useSocial } from "@/features/social/provider";
import { formatLongDate, formatRelative } from "@/lib/format";
import { POST_KIND } from "@/lib/kinds";
import { routes } from "@/lib/routes";
import { cn, initials } from "@/lib/utils";

import { MemberGate } from "./member-gate";

export interface UnitSummary {
  slug: string;
  name: string;
  kind: UnitKind;
  locality: string | null;
}

export interface PostSummary {
  id: string;
  title: string;
  kind: PostKind;
  date: string | null;
  href: string;
}

// --- Profile ---------------------------------------------------------------------

export function ProfilePage({ units }: { units: UnitSummary[] }) {
  const { following, saved, notifications } = useSocial();
  return (
    <MemberGate reason="Sign in to see your church life in one place.">
      {(member) => {
        const home = units.find((u) => u.slug === member.homeUnitSlug);
        const unread = notifications.filter((n) => !n.read).length;
        const links = [
          {
            href: routes.saved(),
            icon: Bookmark,
            label: "Saved",
            detail: `${saved.size} ${saved.size === 1 ? "post" : "posts"}`,
          },
          {
            href: routes.following(),
            icon: UsersRound,
            label: "Following",
            detail: `${following.size} ${following.size === 1 ? "page" : "pages"}`,
          },
          {
            href: routes.notifications(),
            icon: Bell,
            label: "Notifications",
            detail: unread ? `${unread} unread` : "All caught up",
          },
          { href: routes.settings(), icon: Settings, label: "Settings", detail: "Name, church, appearance" },
        ];
        return (
          <div className="grid gap-8">
            <header className="flex items-center gap-4">
              <span className="inline-flex size-16 items-center justify-center rounded-full bg-primary font-display text-xl font-extrabold text-primary-foreground">
                {initials(member.displayName)}
              </span>
              <div className="grid">
                <h1 className="font-display text-display-sm font-extrabold">{member.displayName}</h1>
                <p className="text-sm text-muted-foreground">
                  {member.contact} · joined {formatLongDate(member.joinedAt)}
                </p>
              </div>
            </header>

            {home ? (
              <Link
                href={routes.unit(home.slug)}
                className="flex items-center gap-4 rounded-panel bg-accent-soft p-5"
              >
                <UnitAvatar name={home.name} kind={home.kind} size="lg" />
                <span className="grid">
                  <span className="text-overline font-semibold text-highlight uppercase">My Church</span>
                  <span className="font-display text-xl font-extrabold text-accent-soft-foreground">
                    {home.name}
                  </span>
                  {home.locality && <span className="text-sm text-muted-foreground">{home.locality}</span>}
                </span>
              </Link>
            ) : (
              <EmptyState
                compact
                icon={Church}
                title="You haven't chosen a home church"
                action={
                  <Button asChild>
                    <Link href={routes.onboarding()}>Choose my church</Link>
                  </Button>
                }
              >
                Your church&apos;s news and events will appear first everywhere.
              </EmptyState>
            )}

            <ul className="grid gap-3 sm:grid-cols-2">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="flex items-center gap-4 rounded-card border border-border bg-surface p-4 hover:border-border-strong"
                  >
                    <l.icon aria-hidden className="size-6 text-muted-foreground" />
                    <span className="grid">
                      <span className="font-semibold">{l.label}</span>
                      <span className="text-sm text-muted-foreground">{l.detail}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      }}
    </MemberGate>
  );
}

// --- Saved ---------------------------------------------------------------------

export function SavedPage({ posts }: { posts: PostSummary[] }) {
  const { saved } = useSocial();
  return (
    <MemberGate reason="Sign in to keep posts to read later.">
      {() => {
        const list = posts.filter((p) => saved.has(p.id));
        return list.length ? (
          <ul className="grid gap-3">
            {list.map((p) => (
              <li key={p.id}>
                <Link
                  href={p.href}
                  className="grid gap-1 rounded-card border border-border bg-surface p-4 hover:border-border-strong"
                >
                  <span className="text-xs text-muted-foreground">
                    {POST_KIND[p.kind].label}
                    {p.date && ` · ${formatLongDate(p.date)}`}
                  </span>
                  <span className="font-semibold">{p.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={Bookmark}
            title="Nothing saved yet"
            action={
              <Button asChild variant="outline">
                <Link href={routes.home()}>Browse the feed</Link>
              </Button>
            }
          >
            Tap Save on any post to keep it here.
          </EmptyState>
        );
      }}
    </MemberGate>
  );
}

// --- Following -----------------------------------------------------------------

export function FollowingPage({ units }: { units: UnitSummary[] }) {
  const { following } = useSocial();
  return (
    <MemberGate reason="Sign in to follow churches and sections.">
      {() => {
        const list = units.filter((u) => following.has(u.slug));
        return list.length ? (
          <ul className="grid gap-3">
            {list.map((u) => (
              <li
                key={u.slug}
                className="flex items-center gap-3 rounded-card border border-border bg-surface p-3"
              >
                <UnitAvatar name={u.name} kind={u.kind} size="md" />
                <Link href={routes.unit(u.slug)} className="grid min-w-0 flex-1 hover:text-highlight">
                  <span className="truncate font-semibold">{u.name}</span>
                  {u.locality && <span className="text-xs text-muted-foreground">{u.locality}</span>}
                </Link>
                <FollowButton slug={u.slug} name={u.name} size="sm" />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={UsersRound}
            title="You're not following any pages yet"
            action={
              <Button asChild variant="outline">
                <Link href={routes.find()}>Find a church</Link>
              </Button>
            }
          >
            Follow your church, your province, Women or Youth to see their posts first.
          </EmptyState>
        );
      }}
    </MemberGate>
  );
}

// --- Notifications -------------------------------------------------------------

export function NotificationsPage() {
  const { notifications } = useSocial();
  return (
    <MemberGate reason="Sign in to see replies, new posts from pages you follow and event reminders.">
      {() =>
        notifications.length ? (
          <div className="grid gap-4">
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<CheckCheck />}
                disabled={notifications.every((n) => n.read)}
                onClick={() => getSocial().markNotificationsRead().catch(reportSocialError)}
              >
                Mark all as read
              </Button>
            </div>
            <ul className="grid gap-2">
              {notifications.map((n) => (
                <li key={n.id}>
                  <Link
                    href={n.href}
                    onClick={() =>
                      getSocial()
                        .markNotificationsRead([n.id])
                        .catch(() => undefined)
                    }
                    className={cn(
                      "flex items-start gap-3 rounded-card border p-4 transition-colors",
                      n.read ? "border-border bg-surface" : "border-accent/50 bg-accent-soft",
                    )}
                  >
                    {!n.read && (
                      <span aria-label="Unread" className="mt-2 size-2 shrink-0 rounded-full bg-highlight" />
                    )}
                    <span className="grid gap-0.5">
                      <span className="font-semibold">{n.title}</span>
                      <time dateTime={n.createdAt} className="text-xs text-muted-foreground">
                        {formatRelative(n.createdAt)}
                      </time>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <EmptyState icon={Bell} title="No notifications yet">
            Replies to your comments, new posts from pages you follow and event reminders will appear here.
          </EmptyState>
        )
      }
    </MemberGate>
  );
}

// --- Settings ------------------------------------------------------------------

export function SettingsPage({ units }: { units: UnitSummary[] }) {
  const router = useRouter();
  return (
    <MemberGate reason="Sign in to change your settings.">
      {(member) => (
        <SettingsForm member={member} units={units} onSignedOut={() => router.push(routes.home())} />
      )}
    </MemberGate>
  );
}

function SettingsForm({
  member,
  units,
  onSignedOut,
}: {
  member: { displayName: string; homeUnitSlug: string | null };
  units: UnitSummary[];
  onSignedOut: () => void;
}) {
  const [name, setName] = React.useState(member.displayName);
  const [saving, setSaving] = React.useState(false);
  const home = units.find((u) => u.slug === member.homeUnitSlug);

  return (
    <div className="grid gap-8">
      <form
        className="grid max-w-md gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setSaving(true);
          try {
            await getSocial().updateProfile({ displayName: name });
            toast.success("Saved");
          } catch (error) {
            reportSocialError(error);
          } finally {
            setSaving(false);
          }
        }}
      >
        <Field label="Your name" htmlFor="settings-name" hint="Shown with your comments.">
          <Input
            id="settings-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            required
            aria-describedby="settings-name-msg"
          />
        </Field>
        <div>
          <Button
            type="submit"
            loading={saving}
            disabled={!name.trim() || name.trim() === member.displayName}
          >
            Save changes
          </Button>
        </div>
      </form>

      <section aria-labelledby="church-setting" className="grid max-w-md gap-2">
        <h2 id="church-setting" className="font-semibold">
          My church
        </h2>
        <p className="text-sm text-muted-foreground">{home ? home.name : "Not chosen yet"}</p>
        <div>
          <Button asChild variant="outline" size="sm">
            <Link href={routes.onboarding()}>{home ? "Change my church" : "Choose my church"}</Link>
          </Button>
        </div>
      </section>

      <section
        aria-labelledby="appearance-setting"
        className="flex max-w-md items-center justify-between gap-4"
      >
        <div>
          <h2 id="appearance-setting" className="font-semibold">
            Appearance
          </h2>
          <p className="text-sm text-muted-foreground">Light, dark or match your device.</p>
        </div>
        <ThemeToggle />
      </section>

      <div className="border-t border-border pt-6">
        <Button
          variant="outline"
          leftIcon={<LogOut />}
          onClick={async () => {
            await getSocial().signOut();
            toast.success("Signed out");
            onSignedOut();
          }}
        >
          Sign out
        </Button>
      </div>
    </div>
  );
}

// --- Sign in -------------------------------------------------------------------

export function SignInPage() {
  const { member, requestSignIn } = useSocial();
  const router = useRouter();
  const next = useSearchParams().get("next");
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : routes.me();

  React.useEffect(() => {
    if (member) router.replace(safeNext);
  }, [member, router, safeNext]);

  return (
    <div className="grid justify-items-start gap-5">
      <p className="max-w-lg text-lg leading-8 text-muted-foreground">
        Follow your church, respond to posts, keep what you read and RSVP to events. We&apos;ll send a code to
        your email or phone, so there is no password to remember.
      </p>
      <Button size="lg" onClick={() => requestSignIn()} disabled={member !== null && member !== undefined}>
        Sign in or join
      </Button>
    </div>
  );
}
