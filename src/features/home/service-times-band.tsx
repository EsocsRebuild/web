"use client";

import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  HeartHandshake,
  MapPin,
  Music,
  Radio,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

interface GatheringItem {
  id: string;
  badge: string;
  title: string;
  dayTime: string;
  tagline: string;
  description: string;
  highlights: string[];
  ctaLabel: string;
  ctaHref: string;
}

const WEEKLY_SERVICES: GatheringItem[] = [
  {
    id: "sunday-divine",
    badge: "Principal Sunday Liturgy",
    title: "Sunday Divine Worship",
    dayTime: "Every Sunday · 9:00 AM – 1:00 PM",
    tagline: "The Holy Liturgy, Celestial Hymns & Apostolic Word",
    description:
      "Our main weekly celebration. We gather united in consecrated white garments to lift our voices in sacred Seraphic anthems, receive apostolic exposition from the scriptures, and break bread in holy communion.",
    highlights: ["Solemn Holy Communion", "Dedicated Children's Church", "First-Time Guest Hospitality"],
    ctaLabel: "Plan Sunday Visit",
    ctaHref: routes.find(),
  },
  {
    id: "midweek-intercession",
    badge: "Midweek Prayer & Power",
    title: "Wednesday Intercession & Bible Study",
    dayTime: "Every Wednesday · 5:00 PM – 7:00 PM",
    tagline: "Spiritual Deliverance, Scripture Exegesis & Answered Prayers",
    description:
      "A midweek sanctuary haven to pause the busyness of life, dig deep into practical biblical doctrine, and join in fervent intercessory prayer for families, careers, health, and our nations.",
    highlights: ["In-Depth Bible Exegesis", "Personal Prayer Ministration", "Faith Testimonies"],
    ctaLabel: "View Bible Study",
    ctaHref: routes.events(),
  },
  {
    id: "friday-vigil",
    badge: "Night of Answers",
    title: "Spiritual Watchnight Vigil",
    dayTime: "1st & 3rd Fridays · 10:00 PM – Dawn",
    tagline: "Prophetic Worship, Trumpet Chants & Breakthrough",
    description:
      "A sacred night of watchfulness, vibrant celestial percussion, trumpet praise, and earnest prayer before the throne of grace. An atmosphere of deep faith and spiritual breakthrough.",
    highlights: ["All-Night Spiritual Warfare", "Celestial Trumpet Chants", "Pastoral Anointing Altar"],
    ctaLabel: "View Vigil Dates",
    ctaHref: routes.events(),
  },
];

const GUEST_TIPS = [
  {
    icon: Sparkles,
    title: "Holy Ground & Reverence",
    verse: "Exodus 3:5",
    description:
      "In reverence to the holiness of God's presence, we remove our footwear before entering the sanctuary prayer floor.",
  },
  {
    icon: ShieldCheck,
    title: "The White Prayer Garment",
    verse: "Revelation 19:8",
    description:
      "We worship in white prayer gowns (Soutane) symbolizing righteousness and equality. Visiting for the first time? Come in modest everyday clothing; clean guest gowns are provided.",
  },
  {
    icon: Music,
    title: "Celestial Choral Praise",
    verse: "Psalm 150",
    description:
      "Expect sacred hymnody, vibrant brass, rhythmic bells, and celestial chants that uplift the spirit and usher worshippers into divine communion.",
  },
  {
    icon: HeartHandshake,
    title: "A Warm Family Welcome",
    verse: "Hebrews 13:2",
    description:
      "From the moment you arrive, our pastoral stewards will greet you, guide you to your seat, and ensure you feel right at home with the ESOCS family.",
  },
];

export function ServiceTimesBand() {
  const [selectedService, setSelectedService] = React.useState<string>("sunday-divine");

  return (
    <section
      id="service-times"
      aria-labelledby="worship-times-heading"
      className="relative isolate overflow-hidden bg-background py-24 sm:py-32 lg:py-40"
    >
      <div className="mx-auto max-w-wide px-gutter">
        {/* Section Header with Generous Whitespace */}
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-crimson-700/30 bg-crimson-800/10 px-4 py-1.5 text-xs font-bold tracking-widest text-crimson-700 uppercase shadow-xs dark:text-crimson-300">
              <Calendar className="size-3.5" />
              Worship With Us This Week
            </span>

            <h2
              id="worship-times-heading"
              className="mt-5 font-display text-[clamp(2.25rem,1.8rem+2vw,3.75rem)] leading-[1.08] font-extrabold tracking-tight text-foreground"
            >
              Gathering in His presence,{" "}
              <span className="font-serif font-normal text-crimson-700 italic dark:text-crimson-400">
                week after week.
              </span>
            </h2>

            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Whether you are discovering Mount Zion for the first time or looking for a home branch to
              fellowship, our doors and hearts are open across hundreds of parishes worldwide.
            </p>
          </div>

          {/* Action Pathways with Deep Red / Royal Styling */}
          <div className="flex flex-wrap items-center gap-3.5">
            <Link
              href={routes.find()}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-pill bg-crimson-800 px-6 text-sm font-semibold text-white shadow-md transition-all hover:bg-crimson-900 hover:shadow-lg dark:bg-crimson-700 dark:hover:bg-crimson-600"
            >
              <MapPin className="size-4" />
              Find Your Nearest Parish
            </Link>
            <Link
              href={routes.stream()}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-pill border border-border bg-surface px-6 text-sm font-semibold text-foreground transition-colors hover:border-crimson-700 hover:text-crimson-700 dark:hover:border-crimson-400 dark:hover:text-crimson-400"
            >
              <Radio className="size-4 text-crimson-700 dark:text-crimson-400" />
              Join Live Broadcast
            </Link>
          </div>
        </div>

        {/* Weekly Services Cards Grid with High Whitespace */}
        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {WEEKLY_SERVICES.map((service) => {
            const isSelected = selectedService === service.id;
            return (
              <div
                key={service.id}
                onMouseEnter={() => setSelectedService(service.id)}
                className={cn(
                  "relative flex flex-col justify-between rounded-panel border p-8 transition-all duration-300 sm:p-10",
                  isSelected
                    ? "-translate-y-1 border-crimson-700/60 bg-surface shadow-xl ring-2 ring-crimson-700/20"
                    : "border-border/80 bg-surface/70 shadow-xs hover:border-border hover:bg-surface",
                )}
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full border border-crimson-700/20 bg-crimson-800/10 px-3.5 py-1 text-xs font-bold tracking-wider text-crimson-800 uppercase dark:text-crimson-300">
                      {service.badge}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                      <Clock className="size-3.5 text-crimson-700 dark:text-crimson-400" />
                      Live in Person
                    </span>
                  </div>

                  <h3 className="mt-6 font-display text-2xl font-bold tracking-tight text-foreground sm:text-[1.65rem]">
                    {service.title}
                  </h3>

                  <p className="mt-2.5 font-mono text-sm font-bold text-crimson-700 dark:text-crimson-400">
                    {service.dayTime}
                  </p>

                  <p className="mt-4 text-sm leading-snug font-medium text-foreground/90">
                    {service.tagline}
                  </p>

                  <p className="mt-3.5 text-sm leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>

                  <div className="mt-8 border-t border-border/80 pt-6">
                    <p className="text-[0.6875rem] font-bold tracking-widest text-muted-foreground uppercase">
                      Service Highlights
                    </p>
                    <ul className="mt-3.5 space-y-2.5">
                      {service.highlights.map((highlight) => (
                        <li key={highlight} className="flex items-center gap-3 text-xs text-foreground/85">
                          <CheckCircle2 className="size-4 shrink-0 text-crimson-700 dark:text-crimson-400" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-10 pt-4">
                  <Link
                    href={service.ctaHref}
                    className="group/link inline-flex items-center gap-2 text-sm font-bold text-crimson-700 hover:text-crimson-800 dark:text-crimson-400 dark:hover:text-crimson-300"
                  >
                    <span>{service.ctaLabel}</span>
                    <ArrowRight className="size-4 transition-transform group-hover/link:translate-x-1.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* First-Time Guest Guide: "What to Expect at Mount Zion" */}
        <div className="mt-20 rounded-panel border border-border/80 bg-surface p-8 shadow-sm sm:p-12 lg:p-16">
          <div className="max-w-2xl">
            <span className="text-xs font-bold tracking-widest text-crimson-700 uppercase dark:text-crimson-400">
              First-Time Guest Guide
            </span>
            <h3 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              What to expect when you visit.
            </h3>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              The Cherubim and Seraphim sanctuary is a place of deep apostolic reverence, heavenly praise, and
              genuine Christian hospitality. Here is how we worship:
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {GUEST_TIPS.map((tip) => {
              const Icon = tip.icon;
              return (
                <div
                  key={tip.title}
                  className="bg-surface-raised rounded-card border border-border/70 p-6 transition-colors hover:border-crimson-700/40"
                >
                  <div className="inline-flex size-11 items-center justify-center rounded-xl bg-crimson-800/10 text-crimson-700 dark:text-crimson-400">
                    <Icon className="size-5" />
                  </div>
                  <div className="mt-5 flex items-baseline justify-between gap-2">
                    <h4 className="text-base font-bold text-foreground">{tip.title}</h4>
                    <span className="font-serif text-xs font-medium text-crimson-700 italic dark:text-crimson-400">
                      {tip.verse}
                    </span>
                  </div>
                  <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    {tip.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/70 pt-8 sm:flex-row">
            <p className="text-xs text-muted-foreground sm:text-sm">
              Have specific questions about your first visit or need pastoral prayer?
            </p>
            <Link
              href={routes.contact()}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-crimson-700 hover:text-crimson-800 sm:text-sm dark:text-crimson-400 dark:hover:text-crimson-300"
            >
              <span>Speak with our Pastoral Care Team</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
