import type { Metadata } from "next";

import { MemberShell } from "@/features/members/member-shell";
import { SavedPage } from "@/features/members/member-pages";
import { postSummaries } from "@/features/members/summaries";

export const metadata: Metadata = { title: "Saved", robots: { index: false } };

export default function Page() {
  return (
    <MemberShell eyebrow="Your account" title="Saved">
      <SavedPage posts={postSummaries()} />
    </MemberShell>
  );
}
