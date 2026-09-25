import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionHeading } from "@/components/patterns/section-heading";
import { formatLongDate } from "@/lib/format";
import { routes } from "@/lib/routes";
import { getUnitContext, hasTab } from "@/features/units/unit-context";

export default async function UnitPhotosPage({ params }: PageProps<"/church/[slug]">) {
  const ctx = getUnitContext((await params).slug);
  if (!hasTab(ctx, "photos")) notFound();

  return (
    <div className="grid gap-6">
      <SectionHeading title="Photos" />
      <ul className="grid gap-4 sm:grid-cols-2">
        {ctx.galleries.map((g) => (
          <li key={g.slug}>
            <Link href={routes.album(g.slug)} className="group/album grid gap-2">
              <span className="relative block aspect-[4/3] overflow-hidden rounded-card bg-surface-sunken">
                <Image
                  src={g.cover.url}
                  alt={g.cover.alt}
                  fill
                  sizes="(min-width: 640px) 340px, 100vw"
                  className="object-cover transition-transform duration-500 group-hover/album:scale-[1.03]"
                />
                <span className="absolute right-2 bottom-2 rounded-pill bg-black/65 px-2 py-0.5 text-xs font-bold text-white tabular">
                  {g.photos.length} photos
                </span>
              </span>
              <span className="font-semibold group-hover/album:text-highlight">{g.title}</span>
              <span className="text-xs text-muted-foreground">{formatLongDate(g.date)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
