# ESOCS Platform: UI and Interaction Plan

This is a **church social platform**, not a brochure site. The model is Facebook Pages built for a
church hierarchy: every part of the Holy Order has its own page with a feed, and members follow,
react, comment, RSVP and share.

The same structure has to work for the whole Order and for a single branch. A branch headquarters
gets the full platform (feed, about, leaders, events, photos, sub-branches) simply by being a page
in the tree.

Companion to [PLAN.md](./PLAN.md), which covers scope, data and roadmap.

---

## 1. Platform model

```
                         ESOCS Worldwide  (holy-order page)
                                   │
   ┌───────────────┬───────────────┼───────────────┬──────────────────┐
Headquarters      CMC 1…12       Directorates      Sections (Women, Youth…)
(Seat of Baba     │                (Finance, Media…)
 Aladura, Abuja   │
 Annex, London…)  Provinces / Special Areas
                   │
                  Districts
                   │
                  Branches (houses of prayer)
```

| Concept    | What it is                                                                                                                       |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Page**   | Any unit in the tree: HQ, CMC, province, district, branch, directorate or section. All pages share one template.                 |
| **Post**   | Anything published by or about a page: news, pastoral message, dedication, photo album, event, milestone.                        |
| **Feed**   | Posts in date order. Home shows the whole Order (later: pages you follow). A page shows its own posts plus posts tagged with it. |
| **Member** | A person with an account (phase 2): home branch, followed pages, saved posts, RSVPs, prayer requests.                            |
| **Leader** | A person holding a role on a page (chairman, shepherd, director). Baba Aladuras have full profiles.                              |
| **Editor** | A member who can post on behalf of a page and its sub-pages (for example a province media officer).                              |

## 2. App shell

**Desktop (≥1280 px)** uses a three-column layout, like a modern social product:

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ [✝ ESOCS]  [ Search pages, people, posts…  ]   Home  Directory  Events  Sections   ◐ [Give] │ ← sticky top bar
├──────────────────────────────────────────────────────────────────────────────────────┤
│ ▸ WATCHWORD · Sustained by God's Endless Mercies — Lam 3:21 · 2026 THEME … ▸▸▸       │ ← marquee
├───────────────┬──────────────────────────────────────────────┬───────────────────────┤
│ LEFT RAIL     │ CENTRE (max 680)                              │ RIGHT RAIL            │
│ ESOCS Worldw. │  Stories row: HQ · CMCs · Women · Youth ○○○○ │ Watchword card        │
│ Headquarters  │  Filter chips: All News Messages Dedications │ Upcoming (calendar)   │
│ CMCs          │  ┌──────────────────────────────────────────┐ │ Pages to follow  [+]  │
│ Provinces     │  │ (avatar) Page name · kind · 3 days ago   │ │ Core values           │
│ Branches      │  │ Title                                    │ │ Contact · hotline     │
│ ─────         │  │ Body (clamped, "See more")               │ │ Footer links ©        │
│ Women         │  │ [ media grid 1/2/3/4+ ]                  │ │                       │
│ Youth         │  │ Tagged: Rumuomasi Province               │ │                       │
│ Directorates  │  │ 🙏 Amen  ♥ Love  ✦ Praise │ 💬 │ ↗ │ 🔖     │ │                       │
│ ─────         │  └──────────────────────────────────────────┘ │                       │
│ Baba Aladuras │  … infinite list (paged)                      │                       │
│ Events · Give │                                               │                       │
└───────────────┴──────────────────────────────────────────────┴───────────────────────┘
```

- **1024–1279 px:** the left rail and centre stay, and the right rail moves below the feed.
- **640–1023 px:** the centre column only; the left rail becomes a drawer.
- **Below 640 px (mobile):** a compact top bar (logo, search icon, theme), full-width cards and a
  **bottom tab bar** (Home · Directory · Events · Sections · Give) with safe-area padding.

The marquee is CSS-driven, pauses on hover and focus, is announced once to screen readers, and
becomes a static list under `prefers-reduced-motion`.

## 3. Screens

### 3.1 Home feed: `/`

- **Stories row:** circular avatars of key pages (HQs, Women, Youth, CMCs), scrolling
  horizontally with snap points.
- **Filter chips:** All · News · Messages · Dedications · Photos · Events. The filter is stored in
  the URL (`?type=`), so it can be shared and survives a refresh.
- **Post cards**, in date order. The media grid adapts to the photo count (1 full, 2 split, 3 as
  1 + 2, 4+ as a 2×2 with a "+N" overlay).
- **States:** skeleton cards while loading; an empty state per filter; an error card with retry.

### 3.2 Page (any unit): `/church/[slug]`

```
┌──────────────────────────────────────────────────────────────┐
│                    COVER (21:9 desktop, 16:9 mobile)          │
│  ┌────┐                                                       │
│  │ AV │  Page name                          [Follow] [Share] │
│  └────┘  Province · Rumuomasi · Est. 2018   [Directions]     │
│          ESOCS Worldwide › CMC 9 › Rumuomasi Province          │ ← hierarchy breadcrumb
├──────────────────────────────────────────────────────────────┤
│ Posts   About   Branches (12)   Leaders   Photos   Events     │ ← route tabs, animated indicator
├───────────────────────────────────┬──────────────────────────┤
│ Tab content                        │ Intro card (address,     │
│                                    │ leaders, phone, map)     │
└───────────────────────────────────┴──────────────────────────┘
```

Tabs are real routes (`/church/[slug]/about`, `/branches`, `/leaders`, `/photos`, `/events`), so
each one is linkable, crawlable and cached. A tab only appears when it has content.

The same template serves each kind of page, with a different emphasis:

| Kind                   | Emphasis                                                                                |
| ---------------------- | --------------------------------------------------------------------------------------- |
| Holy Order             | Baba Aladura's message, full Advisory Board, the whole network                          |
| Headquarters           | Address and directions, leadership, services, the HQ's own feed                         |
| CMC                    | Chairman / vice-chairman / secretary, provinces in the CMC                              |
| Province               | Chairman, districts and branches, dedications, events                                   |
| Branch                 | Address, shepherd, service times, photos, local events                                  |
| Section (Women, Youth) | Mission and remit, leaders (Mothers, coordinators), programmes, its own feed and events |
| Directorate            | Remit, director, members, updates                                                       |

### 3.3 Directory: `/directory`

A search field plus **kind chips** (All · Headquarters · CMCs · Provinces · Special Areas · Branches
· Directorates · Sections), with the filters stored in the URL. Results appear in a responsive
card grid showing avatar, name, kind, parent and locality. The map view (MapLibre) comes in phase
4, once coordinates exist.

### 3.4 Post: `/posts/[id]`

The full post, with its media in a lightbox-ready grid, tagged pages, reactions, and a **comment
thread** with a composer and replies in phase 2. It has a share sheet (the Web Share API, falling
back to copy link) and "More from this page" underneath.

### 3.5 Events and calendar: `/events`

Upcoming and Past sections. Church calendar observances (Lent, Palm Sunday, Good Friday, Easter,
ESOCS Mother's Day, ESOCS Father's Day, Christmas) are **computed**, not typed in by hand. Each
event has an RSVP (Going / Interested) and "Add to calendar" (ICS, in phase 6).

### 3.6 Sections hub: `/sections`

Large, image-led tiles for Women, Youth (MZYS) and every directorate, each linking to its page.

### 3.7 Leaders: `/leaders`, `/leaders/[slug]`

A succession timeline from the founder (1925) to the current Baba Aladura. Each profile has a
portrait, tenure, a biography in readable measure, and previous/next navigation along the
succession.

### 3.8 Search: `/search?q=`

Results grouped into Pages, People and Posts, with keyboard navigation. The top-bar search field
submits here, and later gets a command-palette style overlay (⌘K).

### 3.9 Phase 2 (needs accounts and a backend)

| Screen             | Purpose                                                         |
| ------------------ | --------------------------------------------------------------- |
| Sign in / join     | Email or phone OTP; choose your home branch during onboarding   |
| Member profile     | Home branch, followed pages, saved posts, RSVPs                 |
| Notifications      | New posts from followed pages, replies, event reminders         |
| Composer (editors) | Post as a page: text, photos, event, album; schedule; tag pages |
| Moderation queue   | Review comments and reports; approval before publishing         |
| Prayer requests    | Private submission, prayer-team inbox                           |

## 4. Interaction model

| Interaction | Behaviour                                                                                                                   |
| ----------- | --------------------------------------------------------------------------------------------------------------------------- |
| React       | **Amen 🙏 · Love ♥ · Praise ✦**, one per member per post. Optimistic, with a spring "pop" when chosen. Tap again to remove. |
| Comment     | Threaded one level deep. Optimistic insert; pending and failed states; editing and deleting your own.                       |
| Share       | Web Share API on mobile; copy link on desktop, confirmed with a toast.                                                      |
| Save        | Bookmark a post to your profile.                                                                                            |
| Follow      | Follow any page; followed pages rank higher in Home.                                                                        |
| RSVP        | Going / Interested per event, with attendee count and a reminder.                                                           |
| Directions  | Opens the device's maps app for the page's address.                                                                         |

**Counts are never invented.** Until member accounts exist, interactions are kept **on the
device**. The code sits behind one `engagement` store, and swapping that store for server actions
is the phase 2 change. Components show real counts only.

## 5. Component inventory

Shell:

- `AppHeader`
- `SearchField`
- `PrimaryNav`
- `BottomNav`
- `LeftRail`
- `RightRail`
- `Marquee`

Feed:

- `StoriesRow`
- `FeedFilters`
- `PostCard`
- `PostMedia`
- `PostActions`
- `ReactionButton`
- `CommentThread` (phase 2)

Page:

- `UnitHeader`
- `UnitTabs`
- `IntroCard`
- `UnitCard`
- `LeaderCard`
- `HierarchyTrail`
- `FollowButton`
- `ShareButton`

Content:

- `EventRow`
- `DateBadge`
- `PhotoGrid`
- `ProfileHero`
- `SuccessionTimeline`
- `EmptyState`
- `Reveal` (motion)

## 6. Motion

- **Feed cards:** fade in and rise 12 px as they enter the viewport, once each, staggered by
  40 ms, with an emphasised ease.
- **Tabs:** a shared-layout indicator slides between tabs (`layoutId`).
- **Reactions:** a spring scale "pop" on the chosen reaction; counts tick up.
- **Follow:** a label cross-fade from Follow to Following, with a tick.
- **Cover images:** a subtle scale-down on first paint.
- **Marquee:** runs at a constant pixel speed at every width, with edge-fade masks.
- **Rules:** animate `transform` and `opacity` only. Everything is off under reduced motion.
  Animation code loads through `LazyMotion`, which keeps it small.

## 7. Accessibility and responsiveness

- Tested at 320, 360, 768, 1024, 1280 and 1440 px, with no horizontal scroll at any width. Touch
  targets are at least 44 px.
- The page structure uses landmarks: a top-bar `header`, `nav` for the rails and bottom tabs,
  `main` for the feed, and `aside` for the right rail.
- Feed cards are `article` elements with a heading. Reactions are toggle buttons with
  `aria-pressed`.
- Route tabs are a `nav` whose active link has `aria-current="page"`. They are links rather than
  ARIA tabs, because each one is a separate page.
- Focus is always visible. The skip link targets the feed. Colour contrast meets AA in both themes.

## 8. Build status (25 September 2026)

Everything below is built on the legacy data and passes lint, types, unit tests and the
production build. It is awaiting the owner's review; boxes in the plan are ticked only after
sign-off.

| Area                                                                                            | Status                                   |
| ----------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Shell: top bar, search palette (`/`, ⌘K), bottom bar, More menu, rails, marquee, footer         | Built                                    |
| Home: hero, find strip, stories row, numbers, feed + filters, rails, Women/Youth, history, give | Built                                    |
| Pages for every unit kind with route tabs (Posts, About, Branches, Leaders, Photos, Events)     | Built (154 pages)                        |
| Women and Youth story pages                                                                     | Built                                    |
| Find a Church (instant search, filters in URL), How we're organised, Sections                   | Built                                    |
| History (scroll-linked eras), Baba Aladuras + profiles, Tours, Ordinations, Glossary            | Built                                    |
| Events, event detail with RSVP and .ics, month calendar                                         | Built                                    |
| News index and categories, post page with reactions, comments, save, share                      | Built                                    |
| Media hub, albums with lightbox, videos, radio                                                  | Built                                    |
| Sign-in (code), onboarding, profile, saved, following, notifications, settings                  | Built on the device-local social adapter |
| Give, Prayer (private form), Contact, Search                                                    | Built                                    |
| Map view                                                                                        | Waiting for branch coordinates           |
| Real accounts, comments and prayer delivery                                                     | Waiting for the Payload backend          |

Images are served from this app (`public/media/legacy`, generated by
`scripts/legacy/optimise-media.mjs`), not from the slow legacy host.
