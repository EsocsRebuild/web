"use client";

import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  HandHeart,
  MapPin,
  PlayCircle,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { routes } from "@/lib/routes";

import styles from "./home-architecture.module.scss";

interface QuickPathItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  badge: string;
  mobileSub: string;
}

const PRIMARY_PATH: QuickPathItem = {
  href: routes.find(),
  icon: MapPin,
  title: "Find a House of Prayer",
  body: "Provinces, headquarters & branches near you worldwide.",
  badge: "Worldwide Parishes",
  mobileSub: "Locate houses of prayer & directions",
};

const SECONDARY_PATHS: QuickPathItem[] = [
  {
    href: routes.events(),
    icon: CalendarDays,
    title: "Events & Feasts",
    body: "Services, programmes and the sacred church calendar.",
    badge: "Calendar",
    mobileSub: "Services & programmes",
  },
  {
    href: routes.media(),
    icon: PlayCircle,
    title: "Watch & Listen",
    body: "Photo albums, video broadcasts and the radio ministry.",
    badge: "Media",
    mobileSub: "Radio, albums & video",
  },
  {
    href: routes.store(),
    icon: ShoppingBag,
    title: "Sacred Store",
    body: "Hymn books, white prayer garments and centenary keepsakes.",
    badge: "Treasury",
    mobileSub: "Hymnals & garments",
  },
  {
    href: routes.give(),
    icon: HandHeart,
    title: "Seed of Love",
    body: "Support the evangelical mission of the Order with a seed of faith.",
    badge: "Offering",
    mobileSub: "Support the Order",
  },
];

const ALL_PATHS: QuickPathItem[] = [PRIMARY_PATH, ...SECONDARY_PATHS];

export function QuickPathsDeck() {
  const PrimaryIcon = PRIMARY_PATH.icon;

  return (
    <nav aria-label="Essential Sacred Pathways" className={styles.quickPathsNav}>
      {/* 1. Mobile Experience (< 640px): Prominent Hero Beacon + 2x2 Tactile Card Grid */}
      <div className={styles.mobileDeck}>
        <Link href={PRIMARY_PATH.href} className={styles.beaconCard}>
          <div className={styles.beaconLeft}>
            <span className={styles.beaconIconWrap}>
              <PrimaryIcon className="size-5" />
            </span>
            <div className={styles.beaconDetails}>
              <span className={styles.beaconOverline}>
                <span className={styles.pulseDot} />
                {PRIMARY_PATH.badge}
              </span>
              <span className={styles.beaconTitle}>{PRIMARY_PATH.title}</span>
              <span className={styles.beaconSub}>{PRIMARY_PATH.mobileSub}</span>
            </div>
          </div>
          <span className={styles.beaconArrow}>
            <ArrowRight className="size-4" />
          </span>
        </Link>

        <div className={styles.mobileGrid}>
          {SECONDARY_PATHS.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={styles.mobileGridCard}>
                <div className={styles.cardTop}>
                  <span className={styles.cardIcon}>
                    <Icon className="size-4" />
                  </span>
                  <span className={styles.cardBadge}>{item.badge}</span>
                </div>
                <div className={styles.cardText}>
                  <span className={styles.cardTitle}>{item.title}</span>
                  <span className={styles.cardSub}>{item.mobileSub}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 2. Desktop Monolith Deck (>= 640px): 5-column balanced architectural plinths */}
      <div className={styles.desktopDeck}>
        {ALL_PATHS.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.href} className={styles.desktopCard}>
              <Link href={item.href} className={styles.desktopCardLink}>
                <div className={styles.desktopTop}>
                  <span className={styles.desktopIcon}>
                    <Icon className="size-5" />
                  </span>
                  <ArrowUpRight className={styles.desktopArrow + " size-4"} />
                </div>
                <div className={styles.desktopText}>
                  <span className={styles.desktopTitle}>{item.title}</span>
                  <span className={styles.desktopBody}>{item.body}</span>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
