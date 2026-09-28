import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getStore } from "@/data/store";
import { StoreFront } from "@/features/store/store-front";

export const dynamicParams = false;

export function generateStaticParams() {
  return getStore()
    .listCategories()
    .map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/store/category/[category]">): Promise<Metadata> {
  const category = getStore().getCategory((await params).category);
  return category
    ? { title: `${category.name} · Store`, description: category.description, robots: { index: false } }
    : {};
}

export default async function StoreCategoryPage({ params }: PageProps<"/store/category/[category]">) {
  const category = getStore().getCategory((await params).category);
  if (!category) notFound();
  return <StoreFront category={category} />;
}
