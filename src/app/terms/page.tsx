import type { Metadata } from "next";
import Link from "next/link";
import { ScrollText, Sparkles, MessageSquare, AlertTriangle, ShieldCheck, Flame } from "lucide-react";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Terms of Sacred Engagement · The Decorum Covenant",
  description:
    "The liturgical guidelines and terms of sacred engagement governing fellowship, interactions, and community participation on the Eternal Sacred Order platform.",
};

export default function TermsPage() {
  return (
    <main className="relative min-h-dvh bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-prose px-gutter">
        {/* Header Badge */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-mono text-xs font-semibold text-amber-600 uppercase dark:text-amber-400">
            <ScrollText className="size-3.5" />
            The Decorum Covenant
          </span>
          <span className="text-xs text-muted-foreground">· Mount Zion Sanctuary Code</span>
        </div>

        <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
          Terms of Sacred Engagement
        </h1>

        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          This digital sanctuary is dedicated to the glory of God, the edification of the body of Christ, and
          the sacred heritage of The Eternal Sacred Order of the Cherubim and Seraphim. By entering and
          engaging with this platform, you commit to walking in holy fellowship, reverence, and mutual honor.
        </p>

        <div className="mt-10 space-y-12 text-foreground">
          {/* Article 1: Sacred Decorum */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <Sparkles className="size-5 text-amber-500" />
              <h2 className="font-display text-xl font-bold sm:text-2xl">
                1. Christian Decorum & Reverential Speech
              </h2>
            </div>
            <p className="leading-relaxed text-muted-foreground">
              All communications, comments, and fellowship interactions on this platform must reflect
              apostolic dignity:
            </p>
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              <li>
                <strong className="text-foreground">Edification:</strong> Words shared must comfort, build up
                faith, and encourage brethren (&ldquo;Let no corrupt communication proceed out of your mouth,
                but that which is good to the use of edifying&rdquo;, Ephesians 4:29).
              </li>
              <li>
                <strong className="text-foreground">Spiritual Respect:</strong> Respect is accorded to the
                Holy Order&rsquo;s sacred hymns, liturgical regalia, ranks, spiritual leaders, and the
                succession of Baba Aladuras since 1925.
              </li>
            </ul>
          </section>

          {/* Article 2: Prohibition of Secular Social Tropes */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <AlertTriangle className="size-5 text-amber-500" />
              <h2 className="font-display text-xl font-bold sm:text-2xl">
                2. Prohibition of Secular Trolling, Spam & Partisanship
              </h2>
            </div>
            <p className="leading-relaxed text-muted-foreground">
              This platform is not a secular chat room or partisan forum. The following behaviors are strictly
              prohibited and will result in immediate suspension:
            </p>
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              <li>
                <strong className="text-foreground">Theological Defamation:</strong> Malicious controversy,
                heretical mocking, blasphemy, or disparaging attacks against the sacred doctrines of the
                Order.
              </li>
              <li>
                <strong className="text-foreground">Partisan Politics & Commercial Solicitation:</strong>{" "}
                Using prayer walls, the Sacred Stream, or comment threads for secular political campaigns,
                commercial solicitation, cryptocurrency promotions, or personal merchandising.
              </li>
              <li>
                <strong className="text-foreground">Unwholesome Content:</strong> Any vulgar, indecent,
                hateful, or defamatory media.
              </li>
            </ul>
          </section>

          {/* Article 3: Liturgical Engagements */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <Flame className="size-5 text-amber-500" />
              <h2 className="font-display text-xl font-bold sm:text-2xl">
                3. The Meaning of &ldquo;Amen&rdquo;, Intercession & Fellowship Shares
              </h2>
            </div>
            <p className="leading-relaxed text-muted-foreground">
              Interactive features on the Sacred Stream and live services are liturgical actions of faith:
            </p>
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              <li>
                <strong className="text-foreground">Proclaiming &ldquo;Amen&rdquo;:</strong> Signifies genuine
                spiritual affirmation with the preached word or sacred canticle.
              </li>
              <li>
                <strong className="text-foreground">Standing in Agreement (&ldquo;Pray With&rdquo;):</strong>{" "}
                Constitutes an active spiritual pledge to remember the afflicted brother or sister in prayer.
              </li>
              <li>
                <strong className="text-foreground">Fellowship Sharing:</strong> Content shared must retain
                canonical ecclesiastical attribution and scriptural references.
              </li>
            </ul>
          </section>

          {/* Article 4: Pastoral Moderation */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <ShieldCheck className="size-5 text-amber-500" />
              <h2 className="font-display text-xl font-bold sm:text-2xl">
                4. Pastoral Moderation & Ecclesiastical Authority
              </h2>
            </div>
            <p className="leading-relaxed text-muted-foreground">
              Pastoral moderators appointed by the Holy Order reserve the spiritual and administrative
              authority to review, approve, moderate, or remove any public comment, prayer post, or media item
              that violates the sanctity of the sanctuary.
            </p>
          </section>

          {/* Article 5: Intellectual & Liturgical Property */}
          <section className="space-y-4 border-t border-border pt-8">
            <div className="flex items-center gap-3 text-primary">
              <MessageSquare className="size-5 text-amber-500" />
              <h2 className="font-display text-xl font-bold sm:text-2xl">
                5. Sacred Insignia, Hymns & Content Rights
              </h2>
            </div>
            <p className="leading-relaxed text-muted-foreground">
              The official crest, centenary insignia, recorded canticles, and liturgical publications are the
              protected spiritual property of The Eternal Sacred Order of the Cherubim and Seraphim. Members
              are encouraged to share links to edify others, but reproduction for unauthorized commercial sale
              is prohibited.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              For questions regarding the Decorum Covenant, consult with your Parish Pastor or visit{" "}
              <Link href={routes.privacy()} className="text-amber-500 underline underline-offset-4">
                Privacy & Pastoral Safeguarding
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
