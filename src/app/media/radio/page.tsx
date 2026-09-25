import { ExternalLink, Radio } from "lucide-react";
import type { Metadata } from "next";

import { PageIntro } from "@/components/patterns/page-intro";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "ESOCS Online Radio",
  description: "Listen to ESOCS Online Radio, wherever you are.",
};

export default function RadioPage() {
  return (
    <div className="mx-auto grid max-w-4xl gap-10 px-gutter py-10">
      <PageIntro
        eyebrow="Radio"
        title="ESOCS Online Radio"
        description="Worship, prayer and teaching, streaming online."
      />
      <div className="grid gap-5 rounded-panel border border-border bg-surface p-8 sm:p-12">
        <span className="relative inline-flex size-16 items-center justify-center rounded-full bg-accent-soft">
          <Radio aria-hidden className="size-8 text-highlight" />
          <span
            aria-hidden
            className="absolute inset-0 animate-ping rounded-full bg-accent/20 motion-reduce:hidden"
          />
        </span>
        <p className="max-w-xl text-muted-foreground">
          The radio plays on the station&apos;s own website. A player on this page will follow once the
          station confirms it can be embedded.
        </p>
        <div>
          <Button asChild size="lg" variant="accent" rightIcon={<ExternalLink />}>
            <a href={siteConfig.radio} target="_blank" rel="noopener noreferrer">
              Listen live
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
