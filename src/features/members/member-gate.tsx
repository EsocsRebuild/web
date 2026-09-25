"use client";

import { UserRound } from "lucide-react";
import * as React from "react";

import { EmptyState } from "@/components/patterns/states";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Member } from "@/data/schema/social";
import { useSocial } from "@/features/social/provider";

/** Renders its children for a signed-in member; otherwise a loading or sign-in state. */
export function MemberGate({
  reason,
  children,
}: {
  reason: string;
  children: (member: Member) => React.ReactNode;
}) {
  const { member, requestSignIn } = useSocial();

  if (member === undefined) {
    return (
      <div className="grid gap-4" aria-busy="true" aria-label="Loading your account">
        <Skeleton className="h-24 rounded-panel" />
        <Skeleton className="h-16 rounded-card" />
        <Skeleton className="h-16 rounded-card" />
      </div>
    );
  }

  if (!member) {
    return (
      <EmptyState
        icon={UserRound}
        title="Sign in to see this"
        action={<Button onClick={() => requestSignIn(reason)}>Sign in</Button>}
      >
        {reason}
      </EmptyState>
    );
  }

  return <>{children(member)}</>;
}
