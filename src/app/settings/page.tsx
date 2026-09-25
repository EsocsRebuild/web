import type { Metadata } from "next";

import { MemberShell } from "@/features/members/member-shell";
import { SettingsPage } from "@/features/members/member-pages";
import { unitSummaries } from "@/features/members/summaries";

export const metadata: Metadata = { title: "Settings", robots: { index: false } };

export default function Page() {
  return (
    <MemberShell eyebrow="Your account" title="Settings">
      <SettingsPage units={unitSummaries()} />
    </MemberShell>
  );
}
