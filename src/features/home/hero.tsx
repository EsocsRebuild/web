import { ArrowRight, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { SplitHeadline } from "@/components/motion/split-headline";
import { Button } from "@/components/ui/button";
import { Carousel } from "@/components/ui/carousel";
import type { Organisation } from "@/data/schema/content";
import { routes } from "@/lib/routes";

/**
 * The hook. The church's own banners carry their own lettering, so they sit in a
 * carousel beside the headline rather than under text that would fight them.
 */
export function HomeHero({ org }: { org: Organisation }) {
  const years = new Date().getFullYear() - org.founded;
  const slides = org.heroSlides.map((slide, i) => (
    <figure
      key={slide.title}
      className="relative aspect-[16/9] w-full overflow-hidden rounded-panel bg-black/40"
    >
      <Image
        src={slide.image.url}
        alt={slide.image.alt}
        fill
        priority={i === 0}
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="object-contain"
      />
      <figcaption className="sr-only">{slide.title}</figcaption>
    </figure>
  ));

  return (
    <section
      aria-labelledby="home-title"
      className="dark relative isolate overflow-hidden bg-inverse text-foreground"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-80"
        style={{
          backgroundImage:
            "radial-gradient(60% 80% at 100% 0%, color-mix(in oklch, var(--color-gold-500) 22%, transparent), transparent 60%), radial-gradient(50% 70% at 0% 100%, color-mix(in oklch, var(--color-royal-500) 35%, transparent), transparent 65%)",
        }}
      />
      <div className="mx-auto grid max-w-wide items-center gap-10 px-gutter py-12 sm:py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:py-20">
        <div className="grid gap-6">
          <p className="text-overline font-semibold text-highlight uppercase">
            The Eternal Sacred Order of the Cherubim &amp; Seraphim · Since {org.founded}
          </p>
          <SplitHeadline
            text={`${years} years, sustained by God's endless mercies.`}
            className="font-display text-display-xl font-extrabold text-balance [font-stretch:108%]"
          />
          <p className="max-w-xl text-lg leading-8 text-muted-foreground">
            A worldwide Order of houses of prayer, founded by {org.founder}. Find your church, follow its
            life, and walk with the family this week.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" variant="accent" leftIcon={<MapPin />}>
              <Link href={routes.find()}>Find a church near you</Link>
            </Button>
            <Button asChild size="lg" variant="overlay" rightIcon={<ArrowRight />}>
              <Link href={routes.unit("esocs")}>Who we are</Link>
            </Button>
          </div>
        </div>
        {slides.length > 0 && <Carousel label="Featured" slides={slides} autoplay={6500} controls="below" />}
      </div>
    </section>
  );
}
