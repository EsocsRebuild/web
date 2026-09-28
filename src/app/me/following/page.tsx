import type { Metadata } from "next";

import { MemberShell } from "@/features/members/member-shell";
import { FollowingPage } from "@/features/members/member-pages";
import { unitSummaries } from "@/features/members/summaries";

export const metadata: Metadata = { title: "Following", robots: { index: false } };

export default function Page() {
  return (
    <MemberShell eyebrow="Your account" title="Following">
      <FollowingPage units={unitSummaries()} />
    </MemberShell>
  );
}
