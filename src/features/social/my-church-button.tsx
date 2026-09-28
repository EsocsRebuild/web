"use client";

import { Church, Check } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";
import { getSocial } from "@/data/social";

import { useMemberAction, useSocial } from "./provider";

/** Sets this page as the member's home church, pinned as "My Church" everywhere. */
export function MyChurchButton({ slug, name }: { slug: string; name: string }) {
  const { member } = useSocial();
  const run = useMemberAction();
  const [busy, setBusy] = React.useState(false);
  const isMine = member?.homeUnitSlug === slug;

  return (
    <Button
      type="button"
      variant={isMine ? "secondary" : "outline"}
      aria-pressed={isMine}
      loading={busy}
      leftIcon={isMine ? <Check /> : <Church />}
      onClick={async () => {
        setBusy(true);
        const ok = await run(`Sign in to make ${name} your church.`, () =>
          getSocial().updateProfile({ homeUnitSlug: isMine ? null : slug }),
        );
        setBusy(false);
        if (ok) toast.success(isMine ? "Removed as your church" : `${name} is now your church`);
      }}
    >
      {isMine ? "My church" : "Make this my church"}
    </Button>
  );
}
