import type { Metadata } from "next";

import { PageIntro } from "@/components/patterns/page-intro";
import { getStore } from "@/data/store";
import { BagView } from "@/features/store/bag-view";
import { StorePreviewNotice } from "@/features/store/store-front";

export const metadata: Metadata = { title: "Your bag", robots: { index: false } };

export default function BagPage() {
  return (
    <div className="mx-auto grid max-w-wide gap-8 px-gutter py-10">
      <PageIntro eyebrow="Store" title="Your bag" />
      <StorePreviewNotice />
      <BagView catalogue={getStore().listProducts()} />
    </div>
  );
}
