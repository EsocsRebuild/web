import type { Metadata } from "next";

import { NewsIndex } from "@/features/feed/news-index";

export const metadata: Metadata = {
  title: "News & stories",
  description: "Messages, dedications, milestones and photographs from across the Order.",
};

export default function NewsPage() {
  return <NewsIndex kind={null} />;
}
