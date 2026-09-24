# ESOCS Web Platform: Build Plan

The Eternal Sacred Order of the Cherubim & Seraphim is a worldwide church. It is organised as
CMCs, then provinces and special areas, then districts, then branches (houses of prayer). It also
has directorates, societies, a century of history and an active leadership calendar. The website
has to reflect that structure. It is a content platform with a directory, a publishing system and
a calendar, not a brochure.

This document is the source of truth for scope, architecture and order of work. Update it as
decisions are made. Tick items only when they meet the [Definition of Done](#8-definition-of-done).

---

## 1. What the old site is

www.esocs.net is a SvelteKit front end over a **headless WordPress** at
`super-vault.esocs.net`, using Advanced Custom Fields and 14 custom post types. Its problems:

- **The structure is flat.** Every content type is a disconnected list, with no relationships
  between provinces, CMCs, branches, people, events or news.
- **The directory pages are empty.** "Provinces" and "CMCs" appear in the nav, but their pages have
  no content in the CMS or the code.
- **It is full of placeholder content.** Lorem ipsum appears in banners, "Sermons", "Online
  Church" and service times. Every bank account number is a dummy (`98765432`).
- **Content is locked in HTML blobs.** The Advisory Board and Directorates are pasted HTML tables
  with inline `<style>` tags. History is one 54,000-character field.
- **Key data lives in code.** Addresses and phone numbers are hardcoded in the JS bundle.
- **There is no alt text** on any of the 436 media files.
- **It is thin.** It has 2 news items, 6 events and 5 galleries.

## 2. Legacy data: captured and audited

Everything public has been exported into the repo by `scripts/legacy/export-wordpress.mjs`. The
script is re-runnable and needs Node 22+ with a working CA store.

| File (`data/legacy/…`)     | Records  | Contents                                                                         |
| -------------------------- | -------- | -------------------------------------------------------------------------------- |
| `raw/*.json`               | 13 types | Untouched API records (archive; old IDs kept for redirects)                      |
| `media.json`               | 436      | Every upload: URL, size, dimensions (≈300 MB; originals in `media/`, gitignored) |
| `seed/organisation.json`   | —        | Vision, mission, core values (FLOSH), watchword, socials, New Year message       |
| `seed/baba-aladuras.json`  | 9        | Founder + 8 Baba Aladuras, tenures, full biographies, portraits                  |
| `seed/history.json`        | 9 eras   | History split per leader, 1925 to date                                           |
| `seed/advisory-board.json` | 44       | Name + portfolio                                                                 |
| `seed/cmcs.json`           | 12       | CMC 1–12 with chairman / vice-chairman / secretary where known                   |
| `seed/directorates.json`   | 12       | Name, director, full remit                                                       |
| `seed/provinces.json`      | 35       | Provinces & special areas **created since 2017 only**, not the full list         |
| `seed/dedications.json`    | 48       | Dated cathedral / pro-cathedral dedications with province (tour seed data)       |
| `seed/milestones.json`     | 41 + 4   | Achievements per Baba Aladura; property acquisitions                             |
| `seed/contacts.json`       | 6 + 2    | HQ addresses (Lagos ×2, Abuja, London, New York, Houston), phone lines           |
| `seed/events.json`         | 6        | 2026 Lent → Easter events                                                        |
| `seed/news.json`           | 2        | Centenary launch items                                                           |
| `seed/galleries.json`      | 5 / 321  | Albums with photos resolved to URLs + dimensions                                 |
| `seed/hero-slides.json`    | 3        | 2026 theme, 2026 banner, Baba Aladura                                            |
| `seed/page-banners.json`   | 12       | Banner image per page                                                            |
| `seed/service-times.json`  | 1        | Sunday sessions (flagged: needs verification)                                    |
| `seed/bank-accounts.json`  | 4        | Banks + logos (**account numbers are placeholders; never publish**)              |

### Data problems found (must be resolved with the church before launch)

- [ ] **Event dates are wrong.** Legacy Easter Sunday is 2026-03-05 (actual: 5 April 2026). Good
      Friday is 03-03 (actual: 3 Apr) and Palm Sunday is 02-28 (actual: 29 Mar). Mother's Day is
      02-15, but the ESOCS rule (4th Sunday after Ash Wednesday) gives 15 Mar 2026. **Fix: the new
      liturgical calendar computes movable feasts itself (see P6-1).**
- [ ] Every event uses the same image (media #715).
- [ ] Bank account numbers are dummies. The real accounts need written confirmation from the
      Directorate of Finance.
- [ ] The mission statement is cut off in the CMS: "…practice of spiritual Christian life and".
- [ ] The Ebute-Metta HQ address conflicts: "75 Ibadan Street (East)" on the contact page, but
      "75 Odunfa Street" in the history.
- [ ] Directorates don't match: the history lists 11 (including Engineering, Hospital & Medicals,
      Lands), while the directorates page lists 12 with different names.
- [ ] Advisory Board numbering has gaps and duplicates. Row 6 (Chairman, CMC 11) has no name.
- [ ] The current Baba Aladura (Dr. D. D. L. Bob-Manuel) has no portrait or profile record. He
      only appears inside the history text.
- [ ] No media file has alt text (436 of 436).
- [ ] One news record has a slug copied from an unrelated Access Bank article.

### Content that does not exist anywhere online, and must come from the church

- [ ] **The full list of provinces and special areas**, with their CMC, chairman, address and
      headquarters.
- [ ] **Districts and branches** (houses of prayer): name, address, shepherd-in-charge, service
      times, phone number, coordinates.
- [ ] Names and descriptions of the CMCs (and what "CMC" stands for, for the glossary).
- [ ] Societies and bands: Mount Zion Youth Society (MZYS) and its Campus Fellowship, women's
      associations, choirs, men's and children's groups. Each needs leaders and a description.
- [ ] The rank / ordination ladder, and past ordination lists.
- [ ] The Baba Aladura's tour schedule: upcoming and past itineraries.
- [ ] Sermon and video archive policy (YouTube channel `@esocschurch`, ESOCS Radio).
- [ ] Theme and watchword of the year, for past years (for an archive).
- [ ] The brand logo in SVG format, and brand colours if any are official.

---

## 3. Information architecture

```
/                                   Home
/about                              Who we are · vision · mission · core values · beliefs
/about/history                      Interactive timeline 1925 → today
/about/founder                      St. Moses Orimolade Tunolase
/about/baba-aladuras                Succession of Baba Aladuras
/about/baba-aladuras/[slug]           Profile, tenure, biography, milestones
/about/prelate                      Current Baba Aladura & Prelate, messages
/about/advisory-board               Board directory
/about/directorates                 All directorates
/about/directorates/[slug]            Remit, director, news, events
/about/ranks                        Ranks & orders of the Holy Order (glossary)

/structure                          How the church is organised (CMC → Province → District → Branch)
/structure/cmcs                     All CMCs
/structure/cmcs/[slug]                Leadership, provinces, news, events
/structure/provinces                Provinces & special areas, filterable
/structure/provinces/[slug]           Chairman, districts, branches, map, events, news
/structure/headquarters             Seat of Baba Aladura · National HQ · Abuja Annex · international HQs

/locations                          Find a house of prayer: search, map, "near me"
/locations/[slug]                     Branch page: address, map, service times, shepherd, contact, photos

/societies                          Bands, societies & associations
/societies/youth                      Mount Zion Youth Society · Campus Fellowship
/societies/women                      Mothers · women's associations · Directorate of Women's Affairs
/societies/[slug]                     Any other society (men, choir, children, visioners …)

/news                               News & stories (blog: categories, tags, authors, pagination)
/news/[slug]
/news/category/[slug]               Announcements · Tours · Ordinations · Dedications · Centenary …
/tours                              Baba Aladura's pastoral tours: upcoming + archive
/tours/[slug]                         Itinerary, map route, per-stop gallery and reports
/ordinations                        Ordination ceremonies & lists by year
/events                             Upcoming events: list / month / map views, filters
/events/[slug]                        Details, add-to-calendar, registration
/calendar                           Liturgical & church calendar (computed movable feasts)

/media                              Media hub
/media/sermons                        Sermons: video/audio, series, speaker
/media/galleries                      Photo albums
/media/galleries/[slug]
/media/radio                          ESOCS Online Radio (live player)
/media/publications                   Daily Devotional · Churchman's pamphlet · themes of the year

/give                               Seeds of Love: verified accounts, online giving
/contact                            HQ contacts, counselling hotline, forms
/prayer                             Prayer request (private)
/search                             Site-wide search
/centenary                          1925–2025 centenary archive
```

Every old URL (`/about/history`, `/pastors/[id]`, `/news/[id]`, `/events/[id]`, `/gallery/[id]`,
`/giving`, `/contact-us`, `/service-times`, `/videos`) gets a permanent redirect. Old IDs are kept
in `data/legacy/raw` to build the map.

## 4. Architecture

| Concern       | Decision                                                                                                                                                                                                                                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Framework     | Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4 (already in place)                                                                                                                                                                                                                           |
| Rendering     | Server Components by default. Static + ISR for content, on-demand revalidation from CMS webhooks. Client components only for interaction.                                                                                                                                                                    |
| CMS           | **Recommended: Payload CMS 3, embedded in this Next app, on Postgres.** It handles relational data (CMC → province → branch), role-scoped editors, drafts, versions, scheduled publishing and typed data, with no per-seat fees. Fallback: Sanity. _Needs a compatibility spike with Next 16.3 (task P0-3)._ |
| Database      | Managed Postgres (Neon or Supabase), with PostGIS or lat/lng columns for the directory                                                                                                                                                                                                                       |
| Media         | Object storage (Cloudflare R2 / S3) behind `next/image`. Legacy originals are migrated there. Alt text is required on upload.                                                                                                                                                                                |
| Video/audio   | YouTube Data API sync of `@esocschurch` into Sermons. ESOCS Radio stream embed.                                                                                                                                                                                                                              |
| Maps          | MapLibre GL + vector tiles; geocoding at save time, so there is no geocoding cost per visitor                                                                                                                                                                                                                |
| Search        | Postgres full-text search to start (branches, news, events, people); move to Meilisearch if relevance needs it                                                                                                                                                                                               |
| Forms         | Server Actions + Zod validation + Cloudflare Turnstile. Email via Resend/Postmark. Prayer requests stored privately, never public.                                                                                                                                                                           |
| Giving        | Verified bank transfers first. Online: Paystack (NGN) + Stripe (GBP/USD/CAD); _decision needed_                                                                                                                                                                                                              |
| Motion        | `motion` (Framer Motion successor) for orchestrated reveals and layout transitions. CSS scroll-driven animations where supported. Everything respects `prefers-reduced-motion`.                                                                                                                              |
| SEO           | Generated sitemap and RSS. JSON-LD (Organization, Church, Place, Event, Person, Article). Per-page OG images via `next/og`.                                                                                                                                                                                  |
| Quality       | Vitest, Testing Library, Playwright e2e, axe on every template, Lighthouse CI budgets in CI                                                                                                                                                                                                                  |
| Observability | Sentry (errors), privacy-friendly analytics (Plausible or Vercel Analytics), uptime checks                                                                                                                                                                                                                   |
| Hosting       | Vercel (or equivalent) with preview deployments per PR                                                                                                                                                                                                                                                       |

### Performance budgets (enforced in CI)

Most visitors are on mid-range Android phones on mobile data, so these limits hold on every
template:

- LCP ≤ 2.0 s and CLS ≤ 0.05 on simulated 4G for a mid-tier device; INP ≤ 200 ms
- JavaScript on content pages ≤ 150 KB gzipped (the map and gallery lightbox load lazily)
- Hero images are AVIF/WebP with responsive `sizes`, and never over 200 KB at mobile widths
- Fonts: 2 variable families, self-hosted, subset, `font-display: swap`

## 5. Content model

Every collection has a slug, SEO fields, `publishedAt`, a draft/publish status and a version history.

- **OrgUnit**: `kind` (holy-order | cmc | province | special-area | district | branch |
  headquarters), `parent` (OrgUnit), `name`, `number` (CMC number), `leaders[]` (Person + role),
  `address`, `geo`, `serviceTimes[]`, `phones[]`, `email`, `photos[]`, `established`.
  One self-referencing tree drives the whole directory, so any depth works.
- **Person**: `honorific`, `names`, `rank` (Rank), `portrait`, `bio` (rich text), `roles[]`
  (OrgUnit / Directorate / Board + title + from/to). This covers Baba Aladuras, board members,
  directors, chairmen and shepherds.
- **Rank**: the ladder of the Holy Order (for example Apostle General, Senior Apostle General,
  Deputy Baba Aladura, Mother Cherub/Seraph/Captain, Mother-in-Israel), with order and description.
- **Directorate**: `name`, `remit`, `director` (Person), `members[]`.
- **Society**: `name`, `kind` (youth | women | men | choir | children | other), `leaders[]`,
  `description`, `orgUnits[]`.
- **Post** (news/blog): `title`, `excerpt`, `body` (blocks), `hero`, `category`, `tags[]`,
  `authors[]`, `orgUnits[]`, `societies[]`, `related[]`.
- **Event**: `title`, `start`/`end` (timezone-aware), `allDay`, `recurrence`, `venue` (OrgUnit or
  address), `types[]`, `orgUnits[]`, `registration`, `hero`, `status`.
- **Tour**: `title`, `leader` (Person), `stops[]` (OrgUnit + date + purpose + report Post +
  gallery), `status`.
- **Ordination**: `date`, `venue`, `ordinands[]` (Person + rank conferred), `gallery`.
- **Sermon**: `title`, `speaker`, `series`, `date`, `youtubeId` / `audio`, `scripture`.
- **Gallery**: `title`, `date`, `cover`, `photos[]` (alt required), `orgUnit`, `event`.
- **Publication**: `kind` (devotional | pamphlet | theme-of-year | watchword), `period`, `body`/`file`.
- **LiturgicalRule**: fixed or computed dates (Easter-relative, "4th Sunday after Ash Wednesday",
  "3rd Sunday of June", "Saturday before St. Moses Orimolade Memorial").
- **Globals**: site settings, navigation, announcement marquee items, giving accounts (verified
  flag), contacts, socials.

**Roles.** Super admin (Directorate of Media & Publicity). Editor (HQ content). Unit editor
(scoped to one OrgUnit subtree: a province editor can manage only that province's branches, events
and news). Reviewer (approves before publishing). Every change is recorded in an audit log.

## 6. Design direction

- **Typography.** Archivo (variable weight and width) for display: headlines run extra-bold,
  tightly tracked and optionally expanded. DM Sans (optical sizing) for body and interface text.
  _Done._
- **Colour.** Royal navy, gold and parchment tokens are already in place. They will be checked
  against official brand colours when these are supplied. AA contrast is enforced.
- **Layout language.** Editorial and confident: full-bleed imagery, large type, strong grids and
  dense but calm information for directory pages. It should read as a leading global institution,
  not a template.
- **Motion system.** A small, consistent vocabulary:
  - Reveal on scroll (fade and 12px rise, staggered 40 ms), triggered once per element
  - Hero: slow Ken Burns on imagery, and a split-line headline reveal
  - Shared-element transitions between list cards and detail pages (View Transitions API with a fallback)
  - Counters for statistics (provinces, branches, years), eased and triggered in view
  - History timeline: scroll-linked progress rail
  - Only `transform` and `opacity` are animated, and everything is disabled under `prefers-reduced-motion`
- **Marquee.** A CMS-driven ticker for announcements, upcoming events and the watchword. It is
  pure CSS: a duplicated track animated with `translate3d`, speed set in pixels per second so it
  looks the same at every width, and edge-fade masks. It pauses on hover and focus, is fully
  keyboard and screen-reader accessible (the real list is exposed once and the duplicate is
  `aria-hidden`), and becomes a static list under reduced motion. A second variant is an image
  marquee for partner and centenary logos.

---

## 7. Roadmap and to-do list

### Phase 0: Foundations and decisions

- [x] P0-1 Capture all legacy data (JSON, seeds, media manifest, media originals locally)
- [x] P0-2 Replace typography with Archivo + DM Sans. Remove editor/agent clutter (`.vscode`,
      `AGENTS.md`, `CLAUDE.md`; `agentRules: false` stops Next regenerating them)
- [ ] P0-3 CMS spike: Payload 3 on Next 16.3 (admin, Postgres, R2 storage, typed local API). Go/no-go.
- [ ] P0-4 Provision Postgres, object storage, preview environments, secrets management
- [ ] P0-5 Record architecture decisions (ADRs) in `docs/adr/`
- [ ] P0-6 Send the church the content request (the lists in §2) and agree owners and deadlines
- [ ] P0-7 Replace the skeleton's placeholder `siteConfig`, nav and fixtures with real data sources

### Phase 1: Content platform

- [ ] P1-1 Collections: OrgUnit, Person, Rank, Directorate, Society, Post, Event, Tour, Ordination,
      Sermon, Gallery, Publication, LiturgicalRule, Globals
- [ ] P1-2 Roles and unit-scoped permissions, draft/review/publish workflow, versions, audit log
- [ ] P1-3 Import legacy seeds (idempotent script) + media migration to storage with alt-text backfill
- [ ] P1-4 Webhook → on-demand revalidation by tag; preview mode for drafts
- [ ] P1-5 Rich-text block set (image, gallery, quote/scripture, table, embed, call-out, people grid)
- [ ] P1-6 Legacy URL redirect map (old WP IDs → new slugs)

### Phase 2: Design system v2 and motion

- [ ] P2-1 Update tokens (brand colours once confirmed), spacing and elevation; dark mode parity
- [ ] P2-2 Motion primitives: `Reveal`, `Stagger`, `SplitHeadline`, `Counter`, `ParallaxMedia`, all reduced-motion aware
- [ ] P2-3 `Marquee` (text + logo variants) with accessibility and reduced-motion tests
- [ ] P2-4 Navigation: mega-menu (desktop), full-screen animated menu (mobile), announcement bar
- [ ] P2-5 Blocks: hero variants, stats band, leader cards, timeline, directory list/map, event list/month, post cards, gallery grid and lightbox
- [ ] P2-6 Update the `/design-system` page as living docs (hidden from production and from the sitemap)

### Phase 3: Core pages

- [ ] P3-1 Home: hero slider, announcement marquee, welcome message, watchword, upcoming events, latest news, "find a house of prayer", tours, giving, stats
- [ ] P3-2 About suite: overview, founder, Baba Aladuras list and profiles, prelate, advisory board, directorates, ranks
- [ ] P3-3 History: interactive timeline 1925 → today (eras, dedications, milestones)
- [ ] P3-4 Contact (HQs with maps, hotline, form) and prayer request (private storage + notifications)
- [ ] P3-5 Give: verified accounts with copy-to-clipboard; online giving if approved

### Phase 4: Church structure and locations (directory)

- [ ] P4-1 Structure overview (org chart CMC → province → district → branch)
- [ ] P4-2 CMC index and pages
- [ ] P4-3 Province and special-area index (filters: CMC, country, state) and pages
- [ ] P4-4 Locations finder: search, filters, map clustering, "near me" (with consent), directions links
- [ ] P4-5 Branch pages: service times, shepherd, contact, photos, events, JSON-LD `Church`/`Place`
- [ ] P4-6 International presence (UK, USA, Canada, Ghana …)
- [ ] P4-7 "Suggest a correction" form routed to the unit editor

### Phase 5: Publishing (blog architecture)

- [ ] P5-1 News index with categories, tags, authors, pagination, featured posts
- [ ] P5-2 Post template: reading time, share, related posts, unit/society tagging
- [ ] P5-3 RSS/Atom feeds (site-wide and per category) and OG images per post
- [ ] P5-4 Tours: index, tour pages with itinerary map and per-stop reports/galleries
- [ ] P5-5 Ordinations: index by year, ceremony pages
- [ ] P5-6 Societies: youth (MZYS, Campus Fellowship) and women's sections, each with its own news and events feed

### Phase 6: Events, calendar and media

- [ ] P6-1 Liturgical calendar engine (Easter computus + ESOCS rules), with unit tests for each rule across 20 years
- [ ] P6-2 Events: list / month / map views, filters by unit and type, add-to-calendar (ICS), registration
- [ ] P6-3 Calendar page and subscribable ICS feed
- [ ] P6-4 Sermons: YouTube sync job, series, speakers, scripture index
- [ ] P6-5 Galleries: albums, lightbox, lazy loading, download policy
- [ ] P6-6 ESOCS Radio live player; Publications (devotional, themes of the year)
- [ ] P6-7 Centenary archive

### Phase 7: Search, SEO and hardening

- [ ] P7-1 Site-wide search (people, places, posts, events) with instant results
- [ ] P7-2 JSON-LD on every template; sitemap index; canonical URLs; hreflang if localised
- [ ] P7-3 Accessibility audit (WCAG 2.2 AA): keyboard, screen reader, contrast, motion
- [ ] P7-4 Performance pass against budgets on real devices; image and font audit
- [ ] P7-5 Security: CSP, rate limits on forms, dependency audit, admin 2FA, backups and restore drill
- [ ] P7-6 Error monitoring, analytics, uptime alerts

### Phase 8: Launch

- [ ] P8-1 Content freeze and final import; editor training for HQ and province editors
- [ ] P8-2 UAT with the Directorate of Media & Publicity
- [ ] P8-3 DNS cutover, redirects verified, Search Console, old site archived
- [ ] P8-4 Post-launch: 2-week hypercare, then a monthly content and performance review

---

## 8. Definition of done

A task is done only when all of these are true:

1. Its data comes from the CMS or a typed source. No hardcoded content, lorem ipsum or dummy numbers.
2. It is responsive from 320 px to 1920 px, with no horizontal scroll, and tested at 360, 768, 1280 and 1440 px.
3. It has keyboard support, visible focus, correct semantics, passes axe with zero violations, and respects reduced motion.
4. It meets the performance budgets in §4 in Lighthouse CI.
5. It has unit tests for logic, a Playwright test for the user flow and an axe check for the template.
6. `npm run validate` and `npm run build` pass; the change is reviewed in a PR with a preview link.
7. It has loading, empty and error states.

## 9. Decisions needed

1. **CMS**: Payload (recommended) or Sanity, or keep WordPress as a headless source.
2. **Online giving**: bank transfer only, or Paystack + Stripe.
3. **Languages**: English only at launch, or also Yoruba and Igbo.
4. **Domain**: keep `esocs.net`; confirm who controls DNS.
5. **Editors**: which provinces and societies get their own editor accounts at launch.
6. **Hosting and budget**: Vercel Pro + Neon + R2, or an alternative.
