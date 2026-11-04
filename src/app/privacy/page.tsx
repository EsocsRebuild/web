import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Lock, Eye, HeartHandshake, Baby, FileCheck } from "lucide-react";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Privacy & Pastoral Safeguarding Policy · The Sacred Trust",
  description:
    "How The Eternal Sacred Order of the Cherubim and Seraphim safeguards member records, confidential pastoral prayer requests, child & youth media, and sacred registries.",
};

export default function PrivacyPage() {
  return (
    <main className="relative min-h-dvh bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-prose px-gutter">
        {/* Header Badge */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-mono text-xs font-semibold text-amber-600 uppercase dark:text-amber-400">
            <Shield className="size-3.5" />
            The Sacred Trust
          </span>
          <span className="text-xs text-muted-foreground">· Effective October 2026</span>
        </div>

        <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
          Privacy & Pastoral Safeguarding Policy
        </h1>

        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          The Eternal Sacred Order of the Cherubim and Seraphim (&ldquo;the Holy Order&rdquo;) is committed to
          stewarding all member data, spiritual communications, and ecclesiastical registries with the highest
          degree of sanctity, pastoral confidentiality, and modern legal protection.
        </p>

        <div className="mt-10 space-y-12 text-foreground">
          {/* Section 1: Pastoral Confidentiality */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <Lock className="size-5 text-amber-500" />
              <h2 className="font-display text-xl font-bold sm:text-2xl">
                1. Sacred Pastoral Confidentiality & Prayer Requests
              </h2>
            </div>
            <p className="leading-relaxed text-muted-foreground">
              When you submit a pastoral prayer request or spiritual inquiry through this platform, your words
              are treated under the sacred seal of pastoral privilege.
            </p>
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              <li>
                <strong className="text-foreground">Confidential Pastoral Requests:</strong> Routed
                exclusively to ordained Pastors and the designated intercessory prayer ministry of your
                selected province or parish. They are never published or made available to the public.
              </li>
              <li>
                <strong className="text-foreground">Global Fellowship Wall:</strong> Only requests you
                explicitly opt to share on the public prayer wall are visible to brethren, and they are
                anonymized by default (e.g. &ldquo;A sister in London Province&rdquo;) unless you provide
                explicit consent.
              </li>
            </ul>
          </section>

          {/* Section 2: Child & Youth Protection */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <Baby className="size-5 text-amber-500" />
              <h2 className="font-display text-xl font-bold sm:text-2xl">
                2. Child & Youth Safeguarding (Media Consent)
              </h2>
            </div>
            <p className="leading-relaxed text-muted-foreground">
              In strict compliance with international child protection standards and the Holy Order&rsquo;s
              safeguarding charter, the media of minors (including Sunday School presentations, Youth Chorale
              recitals, and ordination celebrations) is subject to strict verification:
            </p>
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              <li>
                No video clip, photograph, or audio recording featuring recognizable minors is published to
                the Sacred Stream or public galleries without verified parental or legal guardian consent
                registered in the Holy Order Admin Portal.
              </li>
              <li>
                Parents or guardians hold the perpetual right to request the immediate redaction or deletion
                of any published youth media.
              </li>
            </ul>
          </section>

          {/* Section 3: Financial & Giving Privacy */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <HeartHandshake className="size-5 text-amber-500" />
              <h2 className="font-display text-xl font-bold sm:text-2xl">
                3. Stewardship of Tithes, Offerings & Donor Data
              </h2>
            </div>
            <p className="leading-relaxed text-muted-foreground">
              In accordance with biblical precept (&ldquo;let not your left hand know what your right hand is
              doing&rdquo;, Matthew 6:3), financial contributions through the platform are strictly
              confidential:
            </p>
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              <li>
                Payment card details are tokenized by PCI-DSS Level 1 certified gateways; the Holy Order never
                stores raw payment card credentials.
              </li>
              <li>
                All public campaign progress meters display aggregate totals only. Donor names are displayed
                only when the donor explicitly elects to be recognized; otherwise, giving remains
                &ldquo;Anonymous in Faith&rdquo;.
              </li>
              <li>We never sell, rent, or commercialize church giving records or contact directories.</li>
            </ul>
          </section>

          {/* Section 4: Ecclesiastical Registries */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <FileCheck className="size-5 text-amber-500" />
              <h2 className="font-display text-xl font-bold sm:text-2xl">
                4. Ecclesiastical Registry & Ordination Records
              </h2>
            </div>
            <p className="leading-relaxed text-muted-foreground">
              Records of Baptism, Confirmation, Band Membership, and Sacred Ordinations are preserved as
              permanent ecclesiastical records of the Holy Order worldwide. Access to clergy certification is
              governed by hierarchical province and CMC jurisdictional permissions.
            </p>
          </section>

          {/* Section 5: Legal Rights & Contact */}
          <section className="space-y-4 border-t border-border pt-8">
            <div className="flex items-center gap-3 text-primary">
              <Eye className="size-5 text-amber-500" />
              <h2 className="font-display text-xl font-bold sm:text-2xl">
                5. Your Rights & Ecclesiastical Data Officer
              </h2>
            </div>
            <p className="leading-relaxed text-muted-foreground">
              Under NDPR, GDPR, and international data regulations, you have the right to inspect, correct, or
              request the deletion of your personal account data at any time through your{" "}
              <Link href={routes.settings()} className="text-amber-500 underline underline-offset-4">
                Account Settings
              </Link>
              .
            </p>
            <p className="text-sm text-muted-foreground">
              For ecclesiastical privacy inquiries, contact the Secretariat of the Holy Order at:{" "}
              <span className="font-mono text-foreground">secretariat@esocs.org</span> or visit the{" "}
              <Link href={routes.contact()} className="text-amber-500 underline underline-offset-4">
                Contact Sanctuary
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
