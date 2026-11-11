"use client";

import { ArrowUpRight, MessageCircle, Play, Share2, Sparkles } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import {
  FacebookIcon,
  InstagramIcon,
  TiktokIcon,
  WhatsappIcon,
  XIcon,
  YoutubeIcon,
} from "@/components/icons/social-icons";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

interface SocialChannel {
  id: string;
  name: string;
  handle: string;
  href: string;
  tagline: string;
  stats: string;
  statsLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  bgGlow: string;
  badge: string;
  category: string;
}

const SOCIAL_CHANNELS: SocialChannel[] = [
  {
    id: "youtube",
    name: "YouTube",
    handle: "@esocschurch",
    href: siteConfig.socials.youtube,
    tagline: "Live Sunday divine services, apostolic preaching, and heavenly Seraphic anthems in 4K.",
    stats: "50K+",
    statsLabel: "Subscribers",
    icon: YoutubeIcon,
    accentColor: "text-red-500",
    bgGlow: "from-red-600/15 via-red-950/5 to-transparent",
    badge: "Official Broadcast",
    category: "Live Worship",
  },
  {
    id: "whatsapp",
    name: "WhatsApp Community",
    handle: "ESOCS Dawn Manna Channel",
    href: siteConfig.socials.whatsapp,
    tagline:
      "Receive daily dawn devotionals, sacred prayer points, and emergency pastoral bulletins directly.",
    stats: "25K+",
    statsLabel: "Daily Readers",
    icon: WhatsappIcon,
    accentColor: "text-emerald-500",
    bgGlow: "from-emerald-600/15 via-emerald-950/5 to-transparent",
    badge: "Direct Broadcast",
    category: "Daily Devotion",
  },
  {
    id: "tiktok",
    name: "TikTok",
    handle: "@esocschurch",
    href: siteConfig.socials.tiktok,
    tagline:
      "Inspiring Seraphic percussion, youth choir clips, daily scripture bites, and centenary highlights.",
    stats: "120K+",
    statsLabel: "Engagements",
    icon: TiktokIcon,
    accentColor: "text-cyan-400",
    bgGlow: "from-cyan-600/15 via-cyan-950/5 to-transparent",
    badge: "Youth & Praise",
    category: "Short Praise",
  },
  {
    id: "facebook",
    name: "Facebook",
    handle: "The ESOCS Church",
    href: siteConfig.socials.facebook,
    tagline:
      "Connect with brethren across hundreds of provincial branches, share testimonies, and follow events.",
    stats: "85K+",
    statsLabel: "Community",
    icon: FacebookIcon,
    accentColor: "text-blue-500",
    bgGlow: "from-blue-600/15 via-blue-950/5 to-transparent",
    badge: "Global Network",
    category: "Fellowship",
  },
];

export function SocialConnectBand() {
  const [hoveredCard, setHoveredCard] = React.useState<string | null>(null);

  return (
    <section
      id="connect-socials"
      aria-labelledby="social-connect-heading"
      className="relative isolate overflow-hidden bg-background py-24 sm:py-32 lg:py-40"
    >
      {/* Liturgical Radiant Ambient Glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-30 dark:opacity-40"
      >
        <div className="absolute top-1/3 -left-1/4 size-140 rounded-full bg-[radial-gradient(circle,rgba(120,19,36,0.18)_0%,transparent_70%)] blur-3xl" />
        <div className="absolute -right-1/4 bottom-10 size-160 rounded-full bg-[radial-gradient(circle,rgba(217,119,6,0.12)_0%,transparent_70%)] blur-3xl" />
      </div>

      <div className="mx-auto max-w-wide px-gutter">
        {/* Section Header with Refined Whitespace */}
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-bold tracking-widest text-muted-foreground uppercase shadow-xs">
              <Share2 className="size-3.5 text-crimson-800 dark:text-gold-400" />
              Connect With Us
            </span>

            <h2
              id="social-connect-heading"
              className="mt-5 font-display text-[clamp(2.25rem,1.8rem+2vw,3.75rem)] leading-[1.08] font-extrabold tracking-tight text-foreground"
            >
              Walk with the family{" "}
              <span className="font-serif font-normal text-crimson-800 italic dark:text-gold-400">
                everywhere you are.
              </span>
            </h2>

            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Beyond Sunday Divine Service, our sanctuary extends into your daily feed. Join thousands of
              worshippers worldwide for live services, daily manna, Seraphic hymnody, and community prayer.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={siteConfig.socials.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-pill bg-crimson-800 px-6 text-sm font-semibold text-white shadow-sm transition-all hover:bg-crimson-900 hover:shadow-md dark:bg-gold-500 dark:text-neutral-950 dark:hover:bg-gold-400"
            >
              <Play className="size-4 fill-current text-gold-300 dark:text-neutral-950" />
              Subscribe on YouTube
            </Link>
            <Link
              href={siteConfig.socials.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:bg-surface-raised inline-flex h-12 items-center justify-center gap-2 rounded-pill border border-border/80 bg-surface px-6 text-sm font-semibold text-foreground transition-all hover:border-gold-500/50"
            >
              <MessageCircle className="size-4 text-emerald-500" />
              Join WhatsApp Broadcast
            </Link>
          </div>
        </div>

        {/* Commanding Social Grid with Motion Lift & Luminous Cards */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SOCIAL_CHANNELS.map((channel) => {
            const Icon = channel.icon;
            const isHovered = hoveredCard === channel.id;

            return (
              <Link
                key={channel.id}
                href={channel.href}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setHoveredCard(channel.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className={cn(
                  "group relative flex flex-col justify-between overflow-hidden rounded-panel border p-8 transition-all duration-300",
                  isHovered
                    ? "-translate-y-2 border-crimson-800/40 bg-surface shadow-xl ring-1 ring-crimson-800/20 dark:border-gold-500/40 dark:ring-gold-500/20"
                    : "border-border/80 bg-surface/80 shadow-xs hover:border-border hover:bg-surface",
                )}
              >
                {/* Dynamic Gradient Atmospheric Sheen */}
                <div
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute -inset-px -z-10 rounded-panel bg-gradient-to-b opacity-0 transition-opacity duration-300",
                    channel.bgGlow,
                    isHovered && "opacity-100",
                  )}
                />

                <div>
                  <div className="flex items-center justify-between">
                    <span className="bg-surface-raised rounded-full border border-border/80 px-3 py-1 text-[0.6875rem] font-bold tracking-wider text-muted-foreground uppercase">
                      {channel.badge}
                    </span>
                    <span className="bg-surface-raised flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors group-hover:text-foreground">
                      <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>

                  {/* Icon & Platform Brand */}
                  <div className="mt-7 flex items-center gap-3.5">
                    <div className="bg-surface-raised flex size-13 items-center justify-center rounded-2xl border border-border/80 shadow-xs transition-transform duration-300 group-hover:scale-110">
                      <Icon className={cn("size-6.5 transition-colors", channel.accentColor)} />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold tracking-tight text-foreground">
                        {channel.name}
                      </h3>
                      <p className="font-mono text-xs font-medium text-muted-foreground">{channel.handle}</p>
                    </div>
                  </div>

                  <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{channel.tagline}</p>
                </div>

                {/* Footer Metric and Action */}
                <div className="mt-8 flex items-center justify-between border-t border-border/70 pt-5">
                  <div>
                    <span className="block font-display text-lg font-extrabold text-foreground">
                      {channel.stats}
                    </span>
                    <span className="text-[0.6875rem] font-semibold text-muted-foreground uppercase">
                      {channel.statsLabel}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-crimson-800 transition-colors group-hover:text-crimson-900 dark:text-gold-400 dark:group-hover:text-gold-300">
                    <span>Connect</span>
                    <ArrowUpRight className="size-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Secondary Social Hub: Instagram & X (Twitter) */}
        <div className="mt-8 flex flex-col items-center justify-between gap-6 rounded-panel border border-border/80 bg-surface/60 p-6 sm:flex-row sm:px-10">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <Sparkles className="size-5 shrink-0 text-gold-500" />
            <p className="text-sm text-muted-foreground">
              Also follow our official handles on <strong className="text-foreground">Instagram</strong> and{" "}
              <strong className="text-foreground">X (Twitter)</strong> for official press statements and photo
              archives.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <Link
              href={siteConfig.socials.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:bg-surface-raised inline-flex items-center gap-2 rounded-pill border border-border bg-surface px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:border-crimson-700/50"
            >
              <InstagramIcon className="size-4 text-pink-500" />
              <span>Instagram</span>
            </Link>
            <Link
              href={siteConfig.socials.x}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:bg-surface-raised inline-flex items-center gap-2 rounded-pill border border-border bg-surface px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:border-crimson-700/50"
            >
              <XIcon className="size-3.5 text-foreground" />
              <span>X (Twitter)</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
