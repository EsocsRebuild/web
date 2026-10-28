import type { Metadata } from "next";
import { getContent } from "@/data/content";
import { StreamViewport } from "@/features/stream/stream-viewport";

export const metadata: Metadata = {
  title: "Sacred Stream · Word, Canticles & Prophetic Guidance in Motion",
  description:
    "An infinite holy sanctuary of sermon clips, bilingual canticles, prophetic exhortations, and verified testimonies from the Eternal Sacred Order of the Cherubim & Seraphim worldwide.",
};

export default async function SacredStreamPage() {
  const content = getContent();
  const streamItems = content.listStreamItems ? content.listStreamItems() : [];

  return (
    <main className="relative min-h-dvh bg-[#040814]">
      <StreamViewport initialItems={streamItems} />
    </main>
  );
}
