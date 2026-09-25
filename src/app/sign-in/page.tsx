import type { Metadata } from "next";
import { Suspense } from "react";

import { MemberShell } from "@/features/members/member-shell";
import { SignInPage } from "@/features/members/member-pages";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default function Page() {
  return (
    <MemberShell eyebrow="Members" title="Join your church family">
      <Suspense>
        <SignInPage />
      </Suspense>
    </MemberShell>
  );
}
