import type { Metadata } from "next";

import { MemberShell } from "@/features/members/member-shell";
import { NotificationsPage } from "@/features/members/member-pages";

export const metadata: Metadata = { title: "Notifications", robots: { index: false } };

export default function Page() {
  return (
    <MemberShell eyebrow="Your account" title="Notifications">
      <NotificationsPage />
    </MemberShell>
  );
}
