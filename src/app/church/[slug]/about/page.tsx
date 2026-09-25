import { SectionHeading } from "@/components/patterns/section-heading";
import { getContent } from "@/data/content";
import { formatLongDate } from "@/lib/format";
import { COUNTRY_NAME, UNIT_KIND } from "@/lib/kinds";
import { getUnitContext } from "@/features/units/unit-context";

export default async function UnitAboutPage({ params }: PageProps<"/church/[slug]">) {
  const { unit, parent, children } = getUnitContext((await params).slug);
  const org = unit.kind === "holy-order" ? getContent().getOrganisation() : null;

  const facts = [
    { term: "Kind", value: UNIT_KIND[unit.kind].label },
    parent && { term: "Part of", value: parent.slug === "esocs" ? "ESOCS Worldwide" : parent.name },
    unit.address && { term: "Address", value: unit.address },
    !unit.address && unit.locality && { term: "Location", value: unit.locality },
    unit.country && { term: "Country", value: COUNTRY_NAME[unit.country] ?? unit.country },
    unit.established && {
      term: unit.kind === "holy-order" ? "Founded" : "Dedicated",
      value: formatLongDate(unit.established),
    },
    children.length > 0 && { term: "Pages within", value: String(children.length) },
  ].filter(Boolean) as { term: string; value: string }[];

  return (
    <div className="grid gap-10">
      <section aria-labelledby="about-heading" className="grid gap-4">
        <SectionHeading id="about-heading" title={`About ${unit.slug === "esocs" ? "ESOCS" : unit.name}`} />
        {unit.about.length ? (
          <div className="grid max-w-prose gap-4 text-[1.0625rem] leading-8 text-foreground/85">
            {unit.about.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        ) : (
          <p className="max-w-prose text-muted-foreground">
            The story of {unit.name} is being written. If you worship here, the media team would love to hear
            about its history.
          </p>
        )}
      </section>

      {org && (
        <section aria-labelledby="beliefs-heading" className="grid gap-4">
          <SectionHeading id="beliefs-heading" title="Vision and values" size="sm" />
          <dl className="grid max-w-prose gap-4">
            <div>
              <dt className="text-overline font-semibold text-highlight uppercase">Vision</dt>
              <dd className="mt-1 text-lg">{org.vision}</dd>
            </div>
            {org.mission && (
              <div>
                <dt className="text-overline font-semibold text-highlight uppercase">Mission</dt>
                <dd className="mt-1 text-lg">{org.mission}</dd>
              </div>
            )}
            <div>
              <dt className="text-overline font-semibold text-highlight uppercase">Core values</dt>
              <dd className="mt-1 text-lg">{org.coreValues.map((v) => v.value).join(" · ")}</dd>
            </div>
            <div>
              <dt className="text-overline font-semibold text-highlight uppercase">Watchword</dt>
              <dd className="mt-1 text-lg">
                {org.watchword.text} ({org.watchword.reference})
              </dd>
            </div>
          </dl>
        </section>
      )}

      <section aria-labelledby="facts-heading" className="grid gap-4">
        <SectionHeading id="facts-heading" title="Details" size="sm" />
        <dl className="grid max-w-2xl divide-y divide-border rounded-card border border-border bg-surface">
          {facts.map((f) => (
            <div key={f.term} className="grid gap-1 px-5 py-3.5 sm:grid-cols-[10rem_1fr]">
              <dt className="text-sm text-muted-foreground">{f.term}</dt>
              <dd className="font-semibold">{f.value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
