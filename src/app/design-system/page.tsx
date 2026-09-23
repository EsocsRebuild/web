import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CtaBanner } from "@/components/blocks/cta-banner";
import { EventCard } from "@/components/blocks/event-card";
import { PageHero } from "@/components/blocks/page-hero";
import { Scripture } from "@/components/blocks/scripture";
import { SermonCard } from "@/components/blocks/sermon-card";
import { ServiceTimes } from "@/components/blocks/service-times";
import { Section } from "@/components/layout/section";
import { Heading } from "@/components/typography/heading";
import { Overline } from "@/components/typography/overline";
import { SectionHeader } from "@/components/typography/section-header";
import { Lead, Text } from "@/components/typography/text";
import { Alert } from "@/components/ui/alert";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ArrowLink, TextLink } from "@/components/ui/link";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { fixtureEvents, fixtureSermons } from "@/lib/fixtures";

import {
  AccordionDemo,
  LoadingButtonDemo,
  OverlayDemos,
  SearchDemo,
  TabsDemo,
} from "./_components/interactive-demos";

export const metadata: Metadata = { title: "Design system", robots: { index: false, follow: false } };

// Internal reference page. Hidden in production unless explicitly enabled.
const enabled = process.env.NODE_ENV !== "production" || process.env.ENABLE_DESIGN_SYSTEM === "true";

const scales = ["royal", "gold", "parchment"] as const;
const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
// First step in each scale that needs a light label for AA contrast.
const lightLabelFrom = { royal: 500, gold: 700, parchment: 500 } as const;

const semantic = [
  ["background", "bg-background"],
  ["surface", "bg-surface"],
  ["surface-muted", "bg-surface-muted"],
  ["surface-sunken", "bg-surface-sunken"],
  ["primary", "bg-primary"],
  ["accent", "bg-accent"],
  ["accent-soft", "bg-accent-soft"],
  ["inverse", "bg-inverse"],
  ["success", "bg-success"],
  ["warning", "bg-warning"],
  ["danger", "bg-danger"],
  ["info", "bg-info"],
] as const;

const buttonVariants = ["primary", "accent", "secondary", "outline", "ghost", "danger", "link"] as const;

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-6 border-t border-border py-10 md:py-12 lg:grid-cols-[12rem_1fr] lg:gap-12">
      <h2 className="text-sm font-semibold">{title}</h2>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

export default function DesignSystemPage() {
  if (!enabled) notFound();

  return (
    <>
      <PageHero
        overline="Internal"
        title="Design system"
        description="Tokens and components used across the site. Use the theme control in the header to check dark mode."
      />

      <Section container="wide" spacing="sm">
        <Block title="Palette">
          <div className="grid gap-5">
            {scales.map((scale) => (
              <div key={scale}>
                <p className="mb-2 text-sm font-medium capitalize">{scale}</p>
                <div className="grid grid-cols-6 overflow-hidden rounded-control border border-border sm:grid-cols-11">
                  {steps.map((step) => (
                    <div
                      key={step}
                      className="h-12 sm:h-14"
                      style={{ background: `var(--color-${scale}-${step})` }}
                    >
                      <span
                        className={`block p-1.5 font-mono text-[0.625rem] ${step >= lightLabelFrom[scale] ? "text-white" : "text-black"}`}
                      >
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Block>

        <Block title="Semantic colours">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {semantic.map(([name, cls]) => (
              <div key={name} className="overflow-hidden rounded-control border border-border">
                <div className={`h-12 ${cls}`} />
                <p className="bg-surface px-3 py-2 font-mono text-xs">{name}</p>
              </div>
            ))}
          </div>
        </Block>

        <Block title="Typography">
          <div className="grid gap-6">
            <Heading as="p" size="2xl">
              Display 2XL
            </Heading>
            <Heading as="p" size="xl">
              Display XL
            </Heading>
            <Heading as="p" size="lg">
              Display LG
            </Heading>
            <Heading as="p" size="md">
              Display MD
            </Heading>
            <Heading as="p" size="sm">
              Display SM
            </Heading>
            <Heading as="p" size="title">
              Title, sans serif
            </Heading>
            <Heading as="p" size="subtitle">
              Subtitle, sans serif
            </Heading>
            <Overline>Overline</Overline>
            <Lead>Lead paragraph. Introduces a page or section.</Lead>
            <Text>
              Body text with an <TextLink href="#">inline link</TextLink>. Standalone links use the{" "}
              <ArrowLink href="#">arrow link</ArrowLink>.
            </Text>
            <Text size="sm" tone="muted">
              Small muted text for metadata and captions.
            </Text>
          </div>
        </Block>

        <Block title="Rich text">
          <div className="rich-text">
            <h2>Our heritage</h2>
            <p>
              HTML from the CMS is styled with the <code>rich-text</code> class. It covers{" "}
              <strong>headings</strong>, <a href="#">links</a>, lists and quotations.
            </p>
            <ul>
              <li>Prayer and fasting</li>
              <li>Holiness and service</li>
            </ul>
            <blockquote>Pray without ceasing. (1 Thessalonians 5:17)</blockquote>
          </div>
        </Block>

        <Block title="Buttons">
          <div className="grid gap-6">
            <div className="flex flex-wrap items-center gap-3">
              {buttonVariants.map((v) => (
                <Button key={v} variant={v} className="capitalize">
                  {v}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <Button size="icon-sm" variant="outline" aria-label="Share">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </Button>
              <LoadingButtonDemo />
              <Button disabled>Disabled</Button>
            </div>
            <div className="dark flex flex-wrap gap-3 rounded-card bg-inverse p-6">
              <Button variant="accent">Accent</Button>
              <Button variant="primary">Primary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="overlay">Overlay</Button>
            </div>
          </div>
        </Block>

        <Block title="Badges">
          <div className="flex flex-wrap gap-2">
            <Badge>Neutral</Badge>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="accent">Accent</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger" dot>
              Live
            </Badge>
            <Badge variant="info">Info</Badge>
          </div>
        </Block>

        <Block title="Forms">
          <form className="grid max-w-2xl gap-5 sm:grid-cols-2">
            <Field label="First name" htmlFor="ds-first" required>
              <Input id="ds-first" autoComplete="given-name" required />
            </Field>
            <Field label="Email" htmlFor="ds-email" error="Enter a valid email address.">
              <Input
                id="ds-email"
                type="email"
                defaultValue="name@"
                aria-invalid
                aria-describedby="ds-email-msg"
              />
            </Field>
            <Field
              label="Ministry"
              htmlFor="ds-ministry"
              hint="Where would you like to serve?"
              className="sm:col-span-2"
            >
              <Select id="ds-ministry" defaultValue="" aria-describedby="ds-ministry-msg">
                <option value="" disabled>
                  Select a ministry
                </option>
                <option>Choir</option>
                <option>Youth</option>
                <option>Ushering</option>
              </Select>
            </Field>
            <Field label="Message" htmlFor="ds-msg" className="sm:col-span-2">
              <Textarea id="ds-msg" />
            </Field>
            <div className="sm:col-span-2">
              <SearchDemo />
            </div>
            <Checkbox
              label="Weekly bulletin"
              description="Service updates by email, once a week."
              defaultChecked
            />
            <Switch label="Event reminders" defaultChecked />
          </form>
        </Block>

        <Block title="Alerts">
          <div className="grid max-w-2xl gap-3">
            <Alert variant="info" title="Live stream">
              Sunday Worship is streamed on YouTube.
            </Alert>
            <Alert variant="success" title="Donation received">
              A receipt has been sent to your email.
            </Alert>
            <Alert variant="warning" title="Venue change">
              Bible Study moves to the Youth Hall this week.
            </Alert>
            <Alert variant="danger" title="Payment failed">
              Check your card details and try again.
            </Alert>
          </div>
        </Block>

        <Block title="Cards">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Default</CardTitle>
                <CardDescription>Surface with a hairline border.</CardDescription>
              </CardHeader>
              <CardContent />
              <CardFooter>
                <ArrowLink href="#">Details</ArrowLink>
              </CardFooter>
            </Card>
            <Card variant="muted">
              <CardHeader>
                <CardTitle>Muted</CardTitle>
                <CardDescription>For grouped secondary content.</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
            <Card variant="inverse">
              <CardHeader>
                <CardTitle>Inverse</CardTitle>
                <CardDescription>Dark in both themes.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="accent" size="sm">
                  Action
                </Button>
              </CardContent>
            </Card>
          </div>
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <EventCard {...fixtureEvents[0]} />
            <SermonCard {...fixtureSermons[0]} />
          </div>
        </Block>

        <Block title="Service times">
          <ServiceTimes />
        </Block>

        <Block title="Avatars">
          <div className="flex flex-wrap items-center gap-4">
            <Avatar name="Ada Obi" size="sm" />
            <Avatar name="Tunde Ola" size="md" />
            <Avatar name="Ngozi Eze" size="lg" />
            <Avatar name="Rev. Samuel Ade" size="xl" />
            <AvatarGroup>
              <Avatar name="Ada Obi" />
              <Avatar name="Tunde Ola" />
              <Avatar name="Ngozi Eze" />
            </AvatarGroup>
          </div>
        </Block>

        <Block title="Tabs">
          <TabsDemo />
        </Block>

        <Block title="Accordion">
          <AccordionDemo />
        </Block>

        <Block title="Overlays">
          <OverlayDemos />
        </Block>

        <Block title="Loading">
          <div className="flex items-center gap-4">
            <Spinner className="size-5" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="size-10 rounded-full" />
          </div>
        </Block>

        <Block title="Separators">
          <div className="grid gap-8">
            <Separator />
            <Separator variant="ornament" />
          </div>
        </Block>
      </Section>

      <Section tone="inverse" container="narrow">
        <Scripture reference="Colossians 3:23" version="KJV">
          And whatsoever ye do, do it heartily, as to the Lord, and not unto men.
        </Scripture>
      </Section>

      <Section tone="muted">
        <SectionHeader
          overline="Section header"
          title="Left aligned with actions"
          description="Optional overline, description and actions."
          actions={<Button variant="outline">Action</Button>}
        />
        <SectionHeader
          align="center"
          title="Centred"
          description="For editorial sections."
          className="mb-0 md:mb-0"
        />
      </Section>

      <Section>
        <CtaBanner
          title="Call to action"
          description="Used at the end of key pages."
          actions={
            <Button variant="accent" size="lg">
              Primary action
            </Button>
          }
        />
      </Section>
    </>
  );
}
