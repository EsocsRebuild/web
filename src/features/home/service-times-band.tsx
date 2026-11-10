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
  accentColor: string;
}

const WEEKLY_SERVICES: GatheringItem[] = [
  {
    id: "sunday-divine",
    badge: "Principal Celebration",
    title: "Sunday Divine Worship",
    dayTime: "Every Sunday · 9:00 AM – 1:00 PM",
    tagline: "The Holy Liturgy, Celestial Hymns & Apostolic Word",
    description:
      "Our main weekly celebration. We gather united in consecrated white garments to lift our voices in sacred Seraphic anthems, receive apostolic exposition from the scriptures, and break bread in holy communion.",
    highlights: ["Solemn Holy Communion", "Dedicated Children's Church", "First-Time Guest Hospitality"],
    ctaLabel: "Find a Sunday Service",
    ctaHref: routes.find(),
    accentColor: "from-amber-400/20 to-amber-500/5",
  },
  {
    id: "midweek-intercession",
    badge: "Midweek Spiritual Strength",
    title: "Wednesday Intercession & Bible Study",
    dayTime: "Every Wednesday · 5:00 PM – 7:00 PM",
    tagline: "Spiritual Deliverance, Scripture Immersion & Answered Prayers",
    description:
      "A midweek sanctuary haven to pause the busyness of life, dig deep into practical biblical doctrine, and join in fervent intercessory prayer for families, careers, health, and our nations.",
    highlights: ["In-Depth Bible Exegesis", "Personal Prayer Ministration", "Faith Testimonies"],
    ctaLabel: "Explore Bible Study",
    ctaHref: routes.events(),
    accentColor: "from-sky-400/20 to-sky-500/5",
  },
  {
    id: "friday-vigil",
    badge: "Night of Answers",
    title: "Spiritual Watchnight Vigil",
    dayTime: "1st & 3rd Fridays · 10:00 PM – Dawn",
    tagline: "Prophetic Worship, Night Watch & Breakthrough",
    description:
      "A sacred night of watchfulness, vibrant celestial percussion, trumpet praise, and earnest prayer before the throne of grace. An atmosphere of deep faith and spiritual breakthrough.",
    highlights: ["All-Night Spiritual Warfare", "Celestial Trumpet Chants", "Pastoral Anointing Altar"],
    ctaLabel: "View Vigil Schedule",
    ctaHref: routes.events(),
    accentColor: "from-emerald-400/20 to-emerald-500/5",
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
      "We worship in white prayer gowns (Soutane / Kapa) symbolizing righteousness and equality. Visiting for the first time? Come in modest everyday clothing; guest gowns are provided.",
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
      className="relative isolate overflow-hidden border-y border-border/80 bg-surface py-20 sm:py-24"
    >
      {/* Subtle architectural watermarks */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-0 -z-10 h-96 w-96 rounded-full bg-gold-400/5 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 left-0 -z-10 h-96 w-96 rounded-full bg-royal-500/5 blur-3xl"
      />

      <div className="mx-auto max-w-wide px-gutter">
        {/* Section Header */}
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-3.5 py-1 text-xs font-semibold tracking-wider text-accent uppercase">
              <Calendar className="size-3.5" />
              Worship With Us This Week
            </span>
            <h2
              id="worship-times-heading"
              className="mt-4 font-display text-[clamp(2rem,1.6rem+1.8vw,3.25rem)] leading-[1.12] font-extrabold tracking-tight text-foreground"
            >
              Gathering in His presence,{" "}
              <span className="font-serif font-normal text-accent italic">week after week.</span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Whether you are discovering Mount Zion for the first time or looking for a home branch to
              fellowship, our doors and hearts are open across hundreds of parishes worldwide.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={routes.find()}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-pill bg-royal-900 px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-royal-800 hover:shadow-md dark:bg-gold-400 dark:text-royal-950 dark:hover:bg-gold-300"
            >
              <MapPin className="size-4" />
              Find Your Nearest Parish
            </Link>
            <Link
              href={routes.stream()}
              className="bg-surface-raised inline-flex h-11 items-center justify-center gap-2 rounded-pill border border-border px-5 text-sm font-semibold text-foreground transition-colors hover:border-accent hover:text-accent"
            >
              <Radio className="size-4 text-accent" />
              Join Live Broadcast
            </Link>
          </div>
        </div>

        {/* Gathering Services Grid */}
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {WEEKLY_SERVICES.map((service) => {
            const isSelected = selectedService === service.id;
            return (
              <div
                key={service.id}
                onMouseEnter={() => setSelectedService(service.id)}
                className={cn(
                  "relative flex flex-col justify-between rounded-panel border p-7 transition-all duration-300 sm:p-8",
                  isSelected
                    ? "bg-surface-raised -translate-y-1 border-accent/60 shadow-lg ring-1 ring-accent/30"
                    : "bg-surface-raised/60 hover:bg-surface-raised border-border/90 hover:border-border",
                )}
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full border border-border bg-surface-sunken px-3 py-1 text-xs font-semibold text-muted-foreground">
                      {service.badge}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-accent">
                      <Clock className="size-3.5" />
                      Live in Person
                    </span>
                  </div>

                  <h3 className="mt-5 font-display text-2xl font-bold tracking-tight text-foreground">
                    {service.title}
                  </h3>

                  <p className="mt-2 flex items-center gap-2 font-mono text-sm font-semibold text-accent">
                    <span>{service.dayTime}</span>
                  </p>

                  <p className="mt-4 text-sm font-medium text-foreground/90">{service.tagline}</p>

                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{service.description}</p>

                  <div className="mt-6 border-t border-border/80 pt-5">
                    <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      Service Highlights
                    </p>
                    <ul className="mt-3 space-y-2">
                      {service.highlights.map((highlight) => (
                        <li key={highlight} className="flex items-center gap-2.5 text-xs text-foreground/80">
                          <CheckCircle2 className="size-3.5 shrink-0 text-accent" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 pt-4">
                  <Link
                    href={service.ctaHref}
                    className="group/link inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent-hover"
                  >
                    <span>{service.ctaLabel}</span>
                    <ArrowRight className="size-4 transition-transform group-hover/link:translate-x-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* First-Time Guest Guide: "What to Expect at Mount Zion" */}
        <div className="mt-16 rounded-panel border border-border bg-surface-sunken/50 p-8 sm:p-10 lg:p-12">
          <div className="max-w-xl">
            <span className="text-xs font-bold tracking-widest text-accent uppercase">
              First-Time Guest Guide
            </span>
            <h3 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              What to expect when you visit.
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              The Cherubim and Seraphim sanctuary is a place of deep apostolic reverence, heavenly praise, and
              genuine Christian hospitality.
            </p>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {GUEST_TIPS.map((tip) => {
              const Icon = tip.icon;
              return (
                <div
                  key={tip.title}
                  className="rounded-card border border-border/70 bg-surface p-5 transition-colors hover:border-accent/40 sm:p-6"
                >
                  <div className="inline-flex size-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <Icon className="size-5" />
                  </div>
                  <div className="mt-4 flex items-baseline justify-between gap-2">
                    <h4 className="text-base font-bold text-foreground">{tip.title}</h4>
                    <span className="font-serif text-xs text-accent italic">{tip.verse}</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    {tip.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border/70 pt-6 sm:flex-row">
            <p className="text-xs text-muted-foreground sm:text-sm">
              Have specific questions about your first visit or need accessibility accommodations?
            </p>
            <Link
              href={routes.contact()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline sm:text-sm"
            >
              <span>Speak with our Welcome Ministry</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
