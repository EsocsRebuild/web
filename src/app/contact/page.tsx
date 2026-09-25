import { MapPin, Navigation, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageIntro } from "@/components/patterns/page-intro";
import { SectionHeading } from "@/components/patterns/section-heading";
import { socialIcons } from "@/components/icons/social-icons";
import { siteConfig } from "@/config/site";
import { getContent } from "@/data/content";
import { COUNTRY_NAME } from "@/lib/kinds";
import { directionsUrl, routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Headquarters addresses, the general line and the counselling hotline.",
};

export default function ContactPage() {
  const content = getContent();
  const places = [
    ...content.listUnits({ kind: "headquarters" }),
    ...content.listUnits({ kind: "branch", country: "US" }),
  ].filter((u) => u.address);

  return (
    <div className="mx-auto grid max-w-5xl gap-12 px-gutter py-10">
      <PageIntro
        eyebrow="Contact us"
        title="We'd love to hear from you"
        description="Call the church office or the counselling hotline, or visit one of our headquarters."
      />

      <ul className="grid gap-4 sm:grid-cols-2">
        {siteConfig.contact.phones.map((p) => (
          <li key={p.number}>
            <a
              href={`tel:${p.number}`}
              className="flex items-center gap-4 rounded-panel border border-border bg-surface p-6 hover:border-border-strong"
            >
              <span className="inline-flex size-12 items-center justify-center rounded-full bg-accent-soft">
                <Phone aria-hidden className="size-5 text-highlight" />
              </span>
              <span className="grid">
                <span className="text-sm text-muted-foreground">{p.label}</span>
                <span className="font-display text-xl font-extrabold tabular">{p.display}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>

      <section aria-labelledby="places-heading" className="grid gap-5">
        <SectionHeading id="places-heading" title="Visit us" />
        <ul className="grid gap-4 md:grid-cols-2">
          {places.map((u) => (
            <li
              key={u.slug}
              className="grid content-start gap-3 rounded-card border border-border bg-surface p-5"
            >
              <Link
                href={routes.unit(u.slug)}
                className="font-display text-lg font-extrabold hover:text-highlight"
              >
                {u.name}
              </Link>
              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin aria-hidden className="mt-0.5 size-4 shrink-0" />
                {u.address}
                {u.country && u.country !== "NG" && `, ${COUNTRY_NAME[u.country]}`}
              </p>
              <a
                href={directionsUrl(
                  [u.address, u.country ? COUNTRY_NAME[u.country] : ""].filter(Boolean).join(", "),
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-highlight hover:underline"
              >
                <Navigation aria-hidden className="size-4" /> Directions
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="follow-heading" className="grid gap-4">
        <SectionHeading id="follow-heading" title="Follow ESOCS" size="sm" />
        <ul className="flex flex-wrap gap-2">
          {Object.entries(siteConfig.socials).map(([key, href]) => {
            const Icon = socialIcons[key as keyof typeof socialIcons];
            const name = key === "x" ? "X" : key[0].toUpperCase() + key.slice(1);
            return (
              <li key={key}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-border px-4 text-sm font-semibold hover:bg-surface-muted"
                >
                  <Icon className="size-4" /> {name === "Youtube" ? "YouTube" : name}
                </a>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
