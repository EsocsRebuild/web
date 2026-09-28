import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { postKinds, type PostKind } from "@/data/schema/content";
import { NewsIndex } from "@/features/feed/news-index";
import { POST_KIND } from "@/lib/kinds";

export const dynamicParams = false;

export function generateStaticParams() {
  return postKinds.map((kind) => ({ kind }));
}

export async function generateMetadata({ params }: PageProps<"/news/category/[kind]">): Promise<Metadata> {
  const kind = (await params).kind as PostKind;
  return { title: POST_KIND[kind]?.plural ?? "News" };
}

export default async function NewsCategoryPage({ params }: PageProps<"/news/category/[kind]">) {
  const kind = (await params).kind;
  if (!postKinds.includes(kind as PostKind)) notFound();
  return <NewsIndex kind={kind as PostKind} />;
}
