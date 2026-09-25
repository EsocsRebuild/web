import { Newspaper } from "lucide-react";

import { SectionHeading } from "@/components/patterns/section-heading";
import { EmptyState } from "@/components/patterns/states";
import { getContent } from "@/data/content";
import { FeedList } from "@/features/feed/feed-list";
import { getFeedPage } from "@/features/feed/resolve";
import { HolyOrderOverview, LocalOverview, SectionOverview } from "@/features/units/overviews";
import { getUnitContext } from "@/features/units/unit-context";

export default async function UnitHomePage({ params }: PageProps<"/church/[slug]">) {
  const { unit, children } = getUnitContext((await params).slug);
  const content = getContent();
  // A branch's own dedication is told in its story above, so the feed doesn't repeat it.
  const excludeIds = content
    .listPostsForUnit(unit.slug)
    .filter((p) => p.kind === "dedication" && p.tags[0] === unit.slug)
    .map((p) => p.id);
  const feed = getFeedPage({ unitSlug: unit.slug, includeDescendants: true, excludeIds, limit: 10 });
  const albumSizes = Object.fromEntries(content.listGalleries().map((g) => [g.slug, g.photos.length]));

  return (
    <div className="grid gap-12">
      {unit.kind === "holy-order" ? (
        <HolyOrderOverview />
      ) : unit.kind === "section" ? (
        <SectionOverview unit={unit} />
      ) : (
        <LocalOverview unit={unit} childUnits={children} />
      )}

      <section aria-labelledby="unit-feed-heading" className="grid gap-5">
        <SectionHeading
          id="unit-feed-heading"
          title={unit.kind === "holy-order" ? "Life across the Order" : "News and updates"}
          size="md"
        />
        {feed.items.length ? (
          <FeedList
            key={unit.slug}
            initial={feed}
            unitSlug={unit.slug}
            includeDescendants
            excludeIds={excludeIds}
            albumSizes={albumSizes}
          />
        ) : (
          <EmptyState icon={Newspaper} title={`${unit.name}'s first post will appear here`}>
            News, messages and photos from {unit.name} will appear here once the media team publishes them.
            Follow this page to see them in your feed.
          </EmptyState>
        )}
      </section>
    </div>
  );
}
