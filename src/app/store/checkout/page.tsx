import type { Metadata } from "next";

import { PageIntro } from "@/components/patterns/page-intro";
import { getStore } from "@/data/store";
import { CheckoutForm } from "@/features/store/checkout-form";
import { StorePreviewNotice } from "@/features/store/store-front";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <div className="mx-auto grid max-w-wide gap-8 px-gutter py-10">
      <PageIntro eyebrow="Store" title="Checkout" />
      <StorePreviewNotice />
      <CheckoutForm catalogue={getStore().listProducts()} />
    </div>
  );
}
