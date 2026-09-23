import Image from "next/image";
import Link from "next/link";

import { CtaBanner } from "@/components/blocks/cta-banner";
import { EventCard } from "@/components/blocks/event-card";
import { Scripture } from "@/components/blocks/scripture";
import { SermonCard } from "@/components/blocks/sermon-card";
import { ServiceTimes } from "@/components/blocks/service-times";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Heading } from "@/components/typography/heading";
import { Overline } from "@/components/typography/overline";
import { SectionHeader } from "@/components/typography/section-header";
import { Lead, Text } from "@/components/typography/text";
import { Button } from "@/components/ui/button";
import { ArrowLink } from "@/components/ui/link";
import { Media } from "@/components/ui/media";
import { siteConfig } from "@/config/site";
import { fixtureEvents, fixtureSermons } from "@/lib/fixtures";

const firstVisit = [
  { term: "Service length", detail: "Sunday worship runs for about two hours." },
  { term: "What to wear", detail: "Members worship in white garments. Visitors may come as they are." },
  { term: "Children", detail: "Sunday school runs during the main service for ages 3 to 12." },
  { term: "Getting here", detail: "Parking is available on site. Ushers will meet you at the entrance." },
];

const cardRow = "snap-row lg:m-0 lg:grid-flow-row lg:grid-cols-3 lg:gap-8 lg:overflow-visible lg:p-0";

export default function HomePage() {
  const sunday = siteConfig.services[0];
  const { address } = siteConfig.contact;

  return (
    <>
      <section data-hero className="dark relative isolate flex min-h-[min(88svh,52rem)] items-end bg-inverse pt-header text-foreground">
        {siteConfig.heroImage && (
          <>
            <Image src={siteConfig.heroImage} alt="" fill priority sizes="100vw" className="-z-20 object-cover" />
            <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-inverse via-inverse/60 to-inverse/20" />
          </>
        )}
        <Container size="wide" className="pt-16 pb-14 md:pb-20">
          <div className="flex max-w-4xl flex-col gap-6">
            <Overline>{siteConfig.fullName}</Overline>
            <Heading as="h1" size="2xl">
              Worship with us this Sunday
            </Heading>
            <Lead>
              {sunday.name} begins at {sunday.time} at {address.line1}, {address.city}. Everyone is welcome.
            </Lead>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" variant="accent">
                <Link href="/visit">Plan your visit</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/sermons">Watch sermons</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <Section tone="surface" spacing="sm" className="border-b border-border">
        <ServiceTimes />
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-20">
          <div className="flex flex-col gap-5">
            <Overline>New here</Overline>
            <Heading size="lg">What to expect on your first visit</Heading>
            <Text size="lg" tone="muted">
              Our services follow the Cherubim &amp; Seraphim order of worship, with hymns, prayer, scripture
              readings and a sermon.
            </Text>
            <dl className="mt-4 grid gap-x-8 gap-y-6 sm:grid-cols-2">
              {firstVisit.map((item) => (
                <div key={item.term} className="border-t border-border pt-4">
                  <dt className="font-semibold">{item.term}</dt>
                  <dd className="mt-1 text-sm leading-6 text-muted-foreground">{item.detail}</dd>
                </div>
              ))}
            </dl>
            <ArrowLink href="/visit" className="mt-2">
              Plan your visit
            </ArrowLink>
          </div>
          <Media src={null} alt="Congregation at Sunday worship" aspect="aspect-[4/3] lg:aspect-auto" className="rounded-card lg:h-full" />
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeader
          title="Upcoming events"
          actions={<ArrowLink href="/events">All events</ArrowLink>}
        />
        <ul className={cardRow}>
          {fixtureEvents.map((event) => (
            <li key={event.href}>
              <EventCard {...event} />
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <SectionHeader
          title="Recent sermons"
          actions={<ArrowLink href="/sermons">Sermon archive</ArrowLink>}
        />
        <ul className={cardRow}>
          {fixtureSermons.map((sermon) => (
            <li key={sermon.href}>
              <SermonCard {...sermon} />
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="inverse" container="narrow">
        <Scripture reference="Psalm 122:1" version="KJV">
          I was glad when they said unto me, Let us go into the house of the Lord.
        </Scripture>
      </Section>

      <Section>
        <CtaBanner
          title="Support the ministry"
          description="Tithes and offerings can be given securely online, by bank transfer or in person."
          actions={
            <>
              <Button asChild size="lg" variant="accent">
                <Link href="/give">Give online</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/give#other-ways">Other ways to give</Link>
              </Button>
            </>
          }
        />
      </Section>
    </>
  );
}
