import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Counter } from "@/components/motion/counter";
import { Marquee } from "@/components/motion/marquee";
import { SplitHeadline } from "@/components/motion/split-headline";
import { Section } from "@/components/layout/section";
import { Bridges } from "@/components/patterns/bridges";
import { LeaderCard, UnitCard } from "@/components/patterns/cards";
import { Cover } from "@/components/patterns/cover";
import { DateBadge } from "@/components/patterns/date-badge";
import { GlossaryTerm } from "@/components/patterns/glossary-term";
import { KindBadge } from "@/components/patterns/kind-badge";
import { PageIntro } from "@/components/patterns/page-intro";
import { EmptyState } from "@/components/patterns/states";
import { Timeline } from "@/components/patterns/timeline";
import { UnitAvatar } from "@/components/patterns/unit-avatar";
import { unitKinds } from "@/data/schema/content";
import { getContent } from "@/data/content";
import { FeedFilters } from "@/features/feed/feed-filters";
import { PostCard } from "@/features/feed/post-card";
import { resolvePost } from "@/features/feed/resolve";
import { FollowButton, ReactionBar, RsvpControl, SaveButton, ShareButton } from "@/features/social/actions";
import { UNIT_KIND } from "@/lib/kinds";
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

import {
  AccordionDemo,
  ErrorDemo,
  LoadingButtonDemo,
  OtpDemo,
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
  const content = getContent();
  const branch = content.getUnit("oroigwe-pro-cathedral")!;
  const nextEvent = content.listEvents()[0];
  const dedications = content
    .listPostsForUnit("rumuomasi-province")
    .filter((p) => p.kind === "dedication")
    .slice(0, 3)
    .reverse();
  const albumPost = resolvePost(content.getFeed({ kind: "album", limit: 1 }).items[0]);
  const album = content.getGallery(albumPost.post.gallerySlug ?? "");

  return (
    <>
      <div className="mx-auto max-w-wide px-gutter pt-10">
        <PageIntro
          eyebrow="Internal"
          title="Design system"
          description="Tokens, primitives, patterns and motion used across the platform, shown with real church data. Use the theme control in the header to check dark mode."
        />
      </div>

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
        </Block>

        <Block title="Kinds of page">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {unitKinds.map((kind) => (
              <li
                key={kind}
                className="flex items-center gap-3 rounded-card border border-border bg-surface p-3"
              >
                <UnitAvatar name={UNIT_KIND[kind].label} kind={kind} size="md" />
                <KindBadge kind={kind} />
              </li>
            ))}
          </ul>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {(["province", "branch", "section"] as const).map((kind) => (
              <Cover key={kind} image={null} kind={kind} className="aspect-[16/9] rounded-card" />
            ))}
          </div>
        </Block>

        <Block title="Page patterns">
          <div className="grid gap-8">
            <div className="grid gap-3 md:grid-cols-2">
              <UnitCard unit={branch} parentName="Rumuomasi Province" />
              <LeaderCard leader={{ name: "Mother Cherub Janet Otubu", role: "Director, Women's Affairs" }} />
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <DateBadge date={nextEvent.date} />
              <DateBadge date={nextEvent.date} size="sm" />
              <p className="text-sm">
                Inline term: the <GlossaryTerm id="cmc">CMC</GlossaryTerm> groups provinces.
              </p>
            </div>
            <Timeline entries={dedications.map((d) => ({ key: d.id, date: d.date, title: d.title }))} />
            <EmptyState title="Rumuomasi Province's first post will appear here" compact>
              Empty states tell the story of what is coming, never apologise.
            </EmptyState>
            <ErrorDemo />
            <Bridges
              items={[
                { href: "/history", eyebrow: "Our story", title: "1925 to today" },
                { href: "/find", eyebrow: "Near you", title: "Find a house of prayer" },
              ]}
            />
          </div>
        </Block>

        <Block title="Feed">
          <div className="grid max-w-2xl gap-5">
            <FeedFilters
              basePath="/design-system"
              active={null}
              available={["message", "news", "dedication", "album", "milestone"]}
            />
            <PostCard item={albumPost} albumSize={album?.photos.length} />
          </div>
        </Block>

        <Block title="Social controls">
          <div className="grid max-w-xl gap-5">
            <div className="flex flex-wrap items-center gap-3">
              <FollowButton slug="women" name="Women" />
              <ShareButton title="Women" path="/church/women" />
              <SaveButton postId={albumPost.post.id} title={albumPost.post.title} />
            </div>
            <ReactionBar postId={albumPost.post.id} title={albumPost.post.title} />
            <RsvpControl eventSlug={nextEvent.slug} title={nextEvent.title} />
          </div>
        </Block>

        <Block title="One-time code">
          <OtpDemo />
        </Block>

        <Block title="Motion">
          <div className="grid gap-8">
            <SplitHeadline
              as="p"
              text="Sustained by God's endless mercies"
              className="font-display text-display-md font-extrabold"
            />
            <div className="flex gap-10">
              <span className="grid">
                <Counter value={101} className="font-display text-4xl font-extrabold" />
                <span className="text-sm text-muted-foreground">Counter</span>
              </span>
            </div>
            <div className="dark rounded-card bg-inverse py-3 text-foreground">
              <Marquee
                label="Marquee demo"
                items={[
                  "Watchword · Sustained by God's Endless Mercies",
                  "Coming up · Christmas Day",
                  "Find a house of prayer near you",
                ]}
              />
            </div>
          </div>
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
    </>
  );
}
