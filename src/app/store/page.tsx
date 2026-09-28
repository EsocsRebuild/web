import type { Metadata } from "next";

import { StoreFront } from "@/features/store/store-front";

export const metadata: Metadata = {
  title: "Store",
  description: "Hymn books, the Holy Bible, white garments and keepsakes of the centenary.",
  // A preview with sample stock until the store launches: kept out of search results.
  robots: { index: false },
};

export default function StorePage() {
  return <StoreFront category={null} />;
}
