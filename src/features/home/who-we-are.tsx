"use client";

import { ArrowRight, BookOpen, Compass, HeartHandshake, Shield } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { SmartImage } from "@/components/media/smart-image";
import type { ImageRef, Organisation } from "@/data/schema/content";
import { routes } from "@/lib/routes";

import styles from "./home-architecture.module.scss";

interface WhoWeAreProps {
  org: Organisation;
  photo: { image: ImageRef; caption: string } | null;
}

type TabKey = "foundation" | "vision" | "pillars";

const VALUE_DESCRIPTIONS: Record<string, string> = {
  F: "Unshakable trust in the efficacy of prayers and God's living Word.",
  L: "The bond of perfectness; unconditional Christ-like love and fellowship.",
  O: "Spiritual discipline, liturgical reverence, and harmony in holy worship.",
  S: "Selfless uplifting of our neighbours, the vulnerable, and all communities.",
  H: "Purity of heart and righteous conduct dedicated to the living God.",
};

export function WhoWeAre({ org, photo }: WhoWeAreProps) {
  const [activeTab, setActiveTab] = React.useState<TabKey>("foundation");

  return (
    <section aria-labelledby="who-we-are-heading" className={styles.sectionWrapper}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.headerRow}>
          <p className={styles.eyebrowBadge}>
            <span className={styles.badgeDot} />
            Who We Are · Established {org.founded}
          </p>
          <h2 id="who-we-are-heading" className={styles.mainHeading}>
            One Order of prayer, <span className={styles.accentItalic}>since {org.founded}.</span>
          </h2>
        </div>

        {/* Tab Switcher / Perspective Selector */}
        <div role="tablist" aria-label="Perspectives on the Holy Order" className={styles.tabsNav}>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "foundation"}
            aria-controls="panel-foundation"
            id="tab-foundation"
            onClick={() => setActiveTab("foundation")}
            data-active={activeTab === "foundation"}
            className={styles.tabButton}
          >
            <Compass className="size-4" />
            <span>The Foundation</span>
            <span className={styles.tabDot} />
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "vision"}
            aria-controls="panel-vision"
            id="tab-vision"
            onClick={() => setActiveTab("vision")}
            data-active={activeTab === "vision"}
            className={styles.tabButton}
          >
            <Shield className="size-4" />
            <span>Vision & Mandate</span>
            <span className={styles.tabDot} />
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "pillars"}
            aria-controls="panel-pillars"
            id="tab-pillars"
            onClick={() => setActiveTab("pillars")}
            data-active={activeTab === "pillars"}
            className={styles.tabButton}
          >
            <HeartHandshake className="size-4" />
            <span>FLOSH Pillars</span>
            <span className={styles.tabDot} />
          </button>
        </div>

        {/* Dual-Panel Layout */}
        <div className={styles.layoutGrid}>
          {/* Left Narrative Panel */}
          <div className={styles.narrativePanel}>
            {/* Perspective 1: The Foundation */}
            {activeTab === "foundation" && (
              <div
                role="tabpanel"
                id="panel-foundation"
                aria-labelledby="tab-foundation"
                className={styles.foundationDeck}
              >
                <p className={styles.leadNarrative}>
                  The Cherubim and Seraphim Church is a Pentecostal Christian Organisation founded in Nigeria
                  in 1925 by <strong>Saint Moses Orimolade Tunolase</strong>, an Itinerant Evangelist who
                  believed in the efficacy of prayers and the power of divine healing in the name of our{" "}
                  <strong>LORD JESUS CHRIST</strong>.
                </p>
                <p className={styles.leadNarrative}>
                  His Evangelical mission was characterized by a Great Revival – turning people away from idol
                  worshipping to the worship of the true and living God. Orimolade’s uncommon anointing of
                  effective prayers earned him the sobriquet <strong>“Baba Aladura”</strong>.
                </p>

                <div className={styles.milestonesRow}>
                  <div className={styles.milestoneCard}>
                    <span className={styles.milestoneNumber}>1925</span>
                    <span className={styles.milestoneLabel}>Sacred Genesis</span>
                  </div>
                  <div className={styles.milestoneCard}>
                    <span className={styles.milestoneNumber}>100th</span>
                    <span className={styles.milestoneLabel}>Centenary Faith</span>
                  </div>
                  <div className={styles.milestoneCard}>
                    <span className={styles.milestoneNumber}>Global</span>
                    <span className={styles.milestoneLabel}>Houses of Prayer</span>
                  </div>
                </div>
              </div>
            )}

            {/* Perspective 2: Vision & Mandate */}
            {activeTab === "vision" && (
              <div
                role="tabpanel"
                id="panel-vision"
                aria-labelledby="tab-vision"
                className={styles.visionDeck}
              >
                <figure className={styles.visionPlinth}>
                  <p className={styles.plinthEyebrow}>Our Apostolic Vision</p>
                  <blockquote className={styles.visionQuote}>&ldquo;{org.vision}&rdquo;</blockquote>
                  <figcaption className={styles.visionScripture}>
                    Mark 16:15 &middot; &ldquo;Go ye into all the world, and preach the gospel to every
                    creature.&rdquo;
                  </figcaption>
                </figure>

                <div className={styles.missionPlinth}>
                  <p className={styles.plinthEyebrow}>Our Divine Mission</p>
                  <p className={styles.missionText}>
                    {org.mission} the whole world to the practice of spiritual Christian devotion in the
                    beauty of holiness.
                  </p>
                </div>
              </div>
            )}

            {/* Perspective 3: FLOSH Pillars */}
            {activeTab === "pillars" && (
              <div
                role="tabpanel"
                id="panel-pillars"
                aria-labelledby="tab-pillars"
                className={styles.floshDeck}
              >
                <div className={styles.floshGrid}>
                  {org.coreValues.map((v) => (
                    <div key={v.letter} className={styles.floshCard}>
                      <span aria-hidden className={styles.floshMonogram}>
                        {v.letter}
                      </span>
                      <div className={styles.floshContent}>
                        <span className={styles.floshTitle}>{v.value}</span>
                        <span className={styles.floshDesc}>
                          {VALUE_DESCRIPTIONS[v.letter] ?? "Rooted in scripture and living faith."}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action CTAs */}
            <div className={styles.actionRow}>
              <Link href={routes.unit("esocs")} className={styles.primaryCta}>
                <span>About the Holy Order</span>
                <ArrowRight className={styles.ctaArrow + " size-4"} />
              </Link>
              <Link href={routes.history()} className={styles.secondaryCta}>
                <BookOpen className="size-4" />
                <span>Our Centenary History</span>
              </Link>
            </div>
          </div>

          {/* Right Visual Monument */}
          {photo && (
            <div className={styles.monumentFrame}>
              <div className={styles.imageWrap}>
                <SmartImage
                  image={photo.image}
                  fill
                  frame={{ width: 16, height: 11 }}
                  sizes="(min-width: 1280px) 560px, (min-width: 1024px) 460px, 100vw"
                  className="parallax-media object-cover object-[center_25%]"
                />
                <div className={styles.monumentOverlay}>
                  <span className={styles.monumentTag}>Centenary Monument · 1925–2025</span>
                  <p className={styles.monumentCaption}>{photo.caption}</p>
                  <div className={styles.monumentFilament} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
