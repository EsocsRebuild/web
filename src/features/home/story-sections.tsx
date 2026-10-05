import Link from "next/link";

import { SmartImage } from "@/components/media/smart-image";
import { Button } from "@/components/ui/button";
import type { Organisation } from "@/data/schema/content";
import { routes } from "@/lib/routes";

/** Seeds of Love: the church's own appeal. */
export function GiveAppeal({ appeal }: { appeal: Organisation["givingAppeal"] }) {
  return (
    <section
      aria-labelledby="give-heading"
      className="dark relative isolate overflow-hidden rounded-panel bg-inverse text-foreground"
    >
      {appeal.image && (
        <SmartImage
          image={{ ...appeal.image, alt: "" }}
          fill
          sizes="(min-width: 1280px) 1200px, 100vw"
          className="-z-20 object-cover opacity-40"
        />
      )}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-linear-to-r from-inverse via-inverse/85 to-inverse/30"
      />
      <div className="grid max-w-2xl gap-4 p-8 sm:p-12">
        <p className="text-overline font-semibold text-highlight uppercase">Give</p>
        <h2
          id="give-heading"
          className="font-display text-[clamp(1.5rem,1.25rem+1.5vw,2.75rem)] leading-[1.15] font-extrabold tracking-tight text-balance text-white"
        >
          {appeal.title}
        </h2>
        <p className="text-lg leading-8 text-muted-foreground">{appeal.body}</p>
        <div>
          <Button asChild size="lg" variant="gold">
            <Link href={routes.give()}>Plant a seed of love</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
