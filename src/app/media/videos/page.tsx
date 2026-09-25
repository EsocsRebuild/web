import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";

import { YoutubeIcon } from "@/components/icons/social-icons";

import { PageIntro } from "@/components/patterns/page-intro";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Videos",
  description: "Services, messages and celebrations on the ESOCS YouTube channel.",
};

export default function VideosPage() {
  return (
    <div className="mx-auto grid max-w-4xl gap-10 px-gutter py-10">
      <PageIntro
        eyebrow="Videos"
        title="Watch the Order"
        description="Services, messages and celebrations are published on the ESOCS YouTube channel."
      />
      <div className="dark grid gap-5 rounded-panel bg-inverse p-8 text-foreground sm:p-12">
        <YoutubeIcon aria-hidden className="size-12 text-danger" />
        <p className="font-display text-display-sm font-extrabold">@esocschurch on YouTube</p>
        <p className="max-w-xl text-muted-foreground">
          The video library will appear here, sorted by service and series, as soon as it is connected to the
          channel.
        </p>
        <div>
          <Button asChild size="lg" variant="accent" rightIcon={<ExternalLink />}>
            <a href={siteConfig.socials.youtube} target="_blank" rel="noopener noreferrer">
              Open the channel
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
