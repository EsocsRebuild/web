"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { Marquee } from "@/components/motion/marquee";
import { cn } from "@/lib/utils";

import styles from "@/features/home/home-architecture.module.scss";

export interface AnnouncementItem {
  id: string;
  category: "watchword" | "event" | "latest" | "worldwide";
  label: string;
  title: string;
  subtitle?: string;
  href?: string;
}

export function AnnouncementsClient({
  items,
  variant = "bar",
}: {
  items: AnnouncementItem[];
  variant?: "bar" | "hero";
}) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);
  const total = items.length;

  // Auto-advance announcement on mobile every 4.5 seconds
  React.useEffect(() => {
    if (total <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 4500);
    return () => clearInterval(timer);
  }, [total, isPaused]);

  if (total === 0) return null;

  const current = items[currentIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  // Build desktop marquee elements
  const desktopNodes = items.map((item) => {
    const node = (
      <span className="inline-flex items-center gap-2.5">
        <span className={styles.categoryPill}>{item.label}</span>
        <span className="text-[0.8125rem] text-foreground/90 transition-colors hover:text-white">
          <strong className="font-semibold text-white">{item.title}</strong>
          {item.subtitle ? <span className="text-foreground/70"> · {item.subtitle}</span> : null}
        </span>
      </span>
    );

    if (item.href) {
      return (
        <Link key={item.id} href={item.href} className="group/item inline-flex items-center">
          {node}
        </Link>
      );
    }

    return <span key={item.id}>{node}</span>;
  });

  const mobileContentInner = (
    <>
      <span className={styles.categoryPill}>{current.label}</span>
      <span className={styles.mobileText}>
        <strong>{current.title}</strong>
        {current.subtitle ? ` · ${current.subtitle}` : ""}
      </span>
    </>
  );

  return (
    <div
      data-variant={variant}
      className={cn("dark", styles.announcementBar)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Mobile Ribbon: Single high-intent item with quick tactile cycling */}
      <div className={styles.mobileRibbon} role="region" aria-label="Announcements Bulletin">
        {current.href ? (
          <Link href={current.href} className={styles.mobileContent}>
            {mobileContentInner}
          </Link>
        ) : (
          <div className={styles.mobileContent}>{mobileContentInner}</div>
        )}

        <div className={styles.mobileNavButtons}>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous announcement"
            className={styles.navButton}
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next announcement"
            className={styles.navButton}
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Desktop Continuous Marquee */}
      <div className={styles.desktopMarquee}>
        <Marquee label="Church Announcements" items={desktopNodes} className="py-2.5" pxPerSecond={42} />
      </div>
    </div>
  );
}
