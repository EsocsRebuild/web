import type { Metadata } from "next";

import { getContent } from "@/data/content";
import { MemberShell } from "@/features/members/member-shell";
import { Onboarding } from "@/features/members/onboarding";
import { homeChurchOptions } from "@/features/members/summaries";

export const metadata: Metadata = { title: "Welcome", robots: { index: false } };

export default function Page() {
  const content = getContent();
  const suggestions = ["women", "youth", "esocs", "mount-zion-general-headquarters"]
    .map((s) => content.getUnit(s))
    .filter((u) => u !== null)
    .map((u) => ({
      slug: u.slug,
      name: u.slug === "esocs" ? "ESOCS Worldwide" : u.name,
      kind: u.kind,
      locality: u.locality,
      address: u.address,
      country: u.country,
      parentName: u.tagline,
    }));
  return (
    <MemberShell eyebrow="Welcome home" title="Set up your church">
      <Onboarding churches={homeChurchOptions()} suggestions={suggestions} />
    </MemberShell>
  );
}
