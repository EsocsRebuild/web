import type { Metadata } from "next";

import { PageIntro } from "@/components/patterns/page-intro";
import { PrayerForm } from "@/features/prayer/prayer-form";

export const metadata: Metadata = {
  title: "Prayer request",
  description: "Send a private prayer request to the prayer team.",
};

export default function PrayerPage() {
  return (
    <div className="mx-auto grid max-w-3xl gap-10 px-gutter py-10">
      <PageIntro
        eyebrow="Prayer request"
        title="We will pray with you"
        description="Share what is on your heart. The prayer team reads every request in confidence."
      />
      <PrayerForm />
    </div>
  );
}
