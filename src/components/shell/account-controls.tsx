"use client";

import { Bell, Bookmark, Church, LogOut, Settings, UsersRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toaster";
import { getSocial } from "@/data/social";
import { useSocial } from "@/features/social/provider";
import { routes } from "@/lib/routes";
import { initials } from "@/lib/utils";

export function AccountControls() {
  const { member, notifications, requestSignIn } = useSocial();
  const router = useRouter();

  if (member === undefined) return <Skeleton className="ml-1 size-9 rounded-full" />;

  if (!member) {
    return (
      <Button variant="ghost" size="sm" onClick={() => requestSignIn()} className="font-semibold">
        Sign in
      </Button>
    );
  }

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <>
      <Button asChild variant="ghost" size="icon" className="relative">
        <Link
          href={routes.notifications()}
          aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        >
          <Bell />
          {unread > 0 && (
            <span
              aria-hidden
              className="absolute top-1.5 right-1.5 inline-flex min-w-4.5 items-center justify-center rounded-pill bg-danger px-1 text-[0.625rem] leading-4.5 font-bold text-danger-foreground tabular"
            >
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Link>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="ml-1 inline-flex size-9 cursor-pointer items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
          aria-label={`Account menu for ${member.displayName}`}
        >
          {initials(member.displayName) || "•"}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuLabel className="grid gap-0.5 py-2">
            <span className="text-sm text-foreground">{member.displayName}</span>
            <span className="truncate font-normal">{member.contact}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() =>
              router.push(member.homeUnitSlug ? routes.unit(member.homeUnitSlug) : routes.onboarding())
            }
          >
            <Church /> {member.homeUnitSlug ? "My Church" : "Choose my church"}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => router.push(routes.saved())}>
            <Bookmark /> Saved
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => router.push(routes.following())}>
            <UsersRound /> Following
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => router.push(routes.settings())}>
            <Settings /> Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={async () => {
              await getSocial().signOut();
              toast.success("Signed out");
            }}
          >
            <LogOut /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
