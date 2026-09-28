import type { Metadata } from "next";

import { ProfilePage } from "@/features/members/member-pages";
import { unitSummaries } from "@/features/members/summaries";

export const metadata: Metadata = { title: "My account", robots: { index: false } };

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-gutter py-10">
      <ProfilePage units={unitSummaries()} />
    </div>
  );
}
