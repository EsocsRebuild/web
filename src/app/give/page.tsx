import { Landmark, Phone, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";

import { Bridges } from "@/components/patterns/bridges";
import { SectionHeading } from "@/components/patterns/section-heading";
import { siteConfig } from "@/config/site";
import { getContent } from "@/data/content";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Give",
  description:
    "Sowing Seeds of Love: give to the work of the Eternal Sacred Order of the Cherubim & Seraphim.",
};

export default function GivePage() {
  const content = getContent();
  const { givingAppeal } = content.getOrganisation();
  const graduates = content.getPost("milestone-first-esocs-empowerment-scheme-graduates-62-in-cmc-9");
  const hospital = content
    .getFeed({ limit: 1000 })
    .items.find((p) => p.title === "Foundation laid for the CMC 9 hospital");
  const general = siteConfig.contact.phones[0];

  return (
    <div className="grid gap-14 pb-4">
      <section
        aria-labelledby="give-title"
        className="dark relative isolate overflow-hidden bg-inverse text-foreground"
      >
        {givingAppeal.image && (
          <Image
            src={givingAppeal.image.url}
            alt=""
            fill
            priority
            sizes="100vw"
            className="-z-20 object-cover opacity-35"
          />
        )}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-r from-inverse via-inverse/85 to-inverse/40"
        />
        <div className="mx-auto grid max-w-wide gap-5 px-gutter py-16 sm:py-24">
          <p className="text-overline font-semibold text-highlight uppercase">Give</p>
          <h1 id="give-title" className="max-w-3xl font-display text-display-xl font-extrabold text-balance">
            {givingAppeal.title}
          </h1>
          <p className="max-w-xl text-lg leading-8 text-muted-foreground">{givingAppeal.body}</p>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-5xl gap-14 px-gutter">
        <section aria-labelledby="impact-heading" className="grid gap-5">
          <SectionHeading id="impact-heading" eyebrow="What giving makes possible" title="Seeds that grow" />
          <ul className="grid gap-4 md:grid-cols-3">
            <li className="grid content-start gap-2 rounded-card border border-border bg-surface p-5">
              <span className="font-display text-3xl font-extrabold tabular">62</span>
              <span className="font-semibold">graduates of the first ESOCS empowerment scheme</span>
              <span className="text-sm text-muted-foreground">
                Each received a starter pack and an interest-free loan (CMC 9,{" "}
                {graduates?.date ? new Date(graduates.date).getFullYear() : 2022}).
              </span>
            </li>
            <li className="grid content-start gap-2 rounded-card border border-border bg-surface p-5">
              <Landmark aria-hidden className="size-7 text-highlight" />
              <span className="font-semibold">Houses of prayer dedicated</span>
              <span className="text-sm text-muted-foreground">
                Cathedrals and houses of prayer dedicated across the provinces since 2017.
              </span>
            </li>
            <li className="grid content-start gap-2 rounded-card border border-border bg-surface p-5">
              <ShieldCheck aria-hidden className="size-7 text-highlight" />
              <span className="font-semibold">Care for the whole person</span>
              <span className="text-sm text-muted-foreground">
                {hospital
                  ? "The foundation of the CMC 9 hospital was laid in 2022."
                  : "Health, education and welfare across the Order."}
              </span>
            </li>
          </ul>
        </section>

        <section aria-labelledby="how-heading" className="grid gap-5">
          <SectionHeading id="how-heading" title="How to give" />
          <div className="grid gap-4 rounded-panel border border-border bg-surface p-6 sm:p-8">
            <p className="font-display text-xl font-extrabold">Bank details are being confirmed</p>
            <p className="max-w-2xl leading-7 text-muted-foreground">
              To protect your gift, account details will appear here only once the Directorate of Finance has
              verified them. Until then, please give through your house of prayer, or call the church office
              for the correct details.
            </p>
            <a
              href={`tel:${general.number}`}
              className="inline-flex w-fit items-center gap-2 rounded-pill bg-foreground px-5 py-3 font-semibold text-background tabular"
            >
              <Phone aria-hidden className="size-4" /> {general.display}
            </a>
          </div>
        </section>

        <Bridges
          items={[
            { href: routes.find(), eyebrow: "Give locally", title: "Find your house of prayer" },
            { href: routes.contact(), eyebrow: "Questions", title: "Contact the church" },
          ]}
        />
      </div>
    </div>
  );
}
