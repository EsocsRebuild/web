# P1 · Information Architecture and Wayfinding

Status: **proposed; awaiting tree test (gate G1)**. The labels and hierarchy here are
recommendations. They are fixed only after the tree test in §7 reaches its thresholds.

---

## 1. Global navigation

Five top-level destinations. The same five appear in the desktop top bar and the mobile bottom bar,
so what people learn on one device carries over to the other. The tree test compares two variants
of the fourth slot:

| Slot | Variant A (recommended) | Variant B     | Why                                                                                                 |
| ---- | ----------------------- | ------------- | --------------------------------------------------------------------------------------------------- |
| 1    | **Home**                | Home          | The living feed: messages, news, dedications, albums                                                |
| 2    | **Find a Church**       | Find a Church | The most common task (J1). A plain verb phrase is clearer than "Directory" or "Locations"           |
| 3    | **Events**              | Events        | Time-based: upcoming, the church calendar, pastoral tours                                           |
| 4    | **Media**               | News          | A: photos, videos and radio are a destination in their own right. B: the platform is publishing-led |
| 5    | **More**                | More          | Everything else, grouped by purpose (below)                                                         |

**Always visible, outside the five:**

- Search: a field on desktop, an icon on mobile, plus the `/` and ⌘K shortcuts.
- Give: a top-bar button on desktop, and the first item under More on mobile.
- Notifications and profile (signed in) or Sign in (signed out).

**On desktop, the left rail** keeps one-tap shortcuts:

- My Church (after onboarding)
- Women, Youth
- Headquarters, CMCs
- Leaders, History

On desktop, J7 (Women / Youth) therefore takes one tap. On mobile it takes two (More → Women).

### The "More" menu (grouped, in this order)

| Group                      | Items                                                                                  |
| -------------------------- | -------------------------------------------------------------------------------------- |
| **About ESOCS**            | Who we are · History · Baba Aladuras · Advisory Board · Ordinations & ranks · Glossary |
| **Our church family**      | Women · Youth · Directorates · How we're organised                                     |
| **Get involved**           | Give · Prayer request · Contact us                                                     |
| **Media** (Variant B only) | Albums · Videos · Radio                                                                |
| **News** (Variant A only)  | News & stories                                                                         |

**The member menu** (profile avatar) holds: My Church, Saved, Following, Notifications, Settings
and Sign out.

## 2. Sitemap and URLs

| URL                                                                    | Template                            | Reached from                                   |
| ---------------------------------------------------------------------- | ----------------------------------- | ---------------------------------------------- |
| `/`                                                                    | Home                                | Logo, Home                                     |
| `/find`                                                                | Find a Church (search · list · map) | Find a Church, Home search strip               |
| `/structure`                                                           | How we're organised (org tree)      | Find a Church, More                            |
| `/church/[slug]` + `/about` `/branches` `/leaders` `/photos` `/events` | Page (every unit kind)              | Find a Church, cards, hierarchy trails, search |
| `/about` → `/church/esocs`                                             | Who we are (the Holy Order's page)  | More › About ESOCS                             |
| `/women`, `/youth` → `/church/women`, `/church/youth`                  | Section pages                       | Left rail, More                                |
| `/sections`                                                            | Women, Youth and directorates       | More › Our church family                       |
| `/news`, `/news/category/[slug]`                                       | News index                          | Media or News, the Home filter                 |
| `/posts/[id]`                                                          | Post                                | Feed cards, pages, search                      |
| `/events`                                                              | Events                              | Events                                         |
| `/events/[slug]`                                                       | Event                               | Event cards, calendar                          |
| `/calendar`                                                            | Church calendar (month view)        | Events                                         |
| `/tours`, `/tours/[slug]`                                              | Pastoral tours                      | Events, the Home banner                        |
| `/leaders`, `/leaders/[slug]`                                          | Succession, Leader profile          | More › Baba Aladuras, the Holy Order page      |
| `/history`                                                             | History timeline                    | More › History, the Home history teaser        |
| `/ordinations`                                                         | Ordinations & ranks                 | More                                           |
| `/glossary`                                                            | Glossary                            | More, inline term tooltips                     |
| `/media`, `/media/albums/[slug]`, `/media/videos`, `/media/radio`      | Media hub, Album, Videos, Radio     | Media                                          |
| `/search`                                                              | Search results                      | The search field (Enter)                       |
| `/give`, `/prayer`, `/contact`                                         | Give, Prayer, Contact               | Top bar Give, More                             |
| `/sign-in`, `/onboarding`                                              | Sign in, Onboarding                 | Any member action, Sign in                     |
| `/me`, `/me/saved`, `/me/following`, `/notifications`, `/settings`     | Member area                         | Profile menu, the bell                         |

All URLs are built by `src/lib/routes.ts`. If the tree test changes a label or URL, it changes
there once.

## 3. Page anatomy (every page, same order)

```
① Identity hero     name, kind badge, place in the church (hierarchy trail), cover
② Action row        one primary action (Directions / Follow / RSVP / Give) + Share
③ Chapters          tabs for Pages (Posts · About · Branches · Leaders · Photos · Events)
                    or in-page chapter links for long reads (History, Leader)
④ Content           the story beats for the template (see 02-storyboards)
⑤ Continue          "Continue the story" bridges: 2–3 cards to the next chapter
```

The **hierarchy trail** appears on every Page, e.g. `ESOCS › CMC 9 › Diobu Province › Diobu
Provincial Headquarters`. The last crumb has a menu listing its siblings ("Other houses of prayer
in Diobu Province").

## 4. Bridges: "Continue the story"

| From                      | Bridges to                                                                  |
| ------------------------- | --------------------------------------------------------------------------- |
| Branch                    | Its province · the nearest other branches in the province · upcoming events |
| Province / special area   | Its CMC (or the Holy Order) · largest branches · recent dedications         |
| CMC                       | Its provinces · the Advisory Board                                          |
| Headquarters              | The other headquarters · Leaders · History                                  |
| Holy Order ("Who we are") | History · Baba Aladuras · Find a Church                                     |
| Women / Youth             | The other section · events · Directorates                                   |
| Directorate               | The other directorates · the Advisory Board                                 |
| Leader profile            | Previous and next in the succession · History era                           |
| History                   | Leaders · Find a Church                                                     |
| Post                      | Its page · related posts · tagged pages                                     |
| Event                     | Its host page · the calendar · related events                               |
| Tour                      | Pages visited · the previous or next tour                                   |
| Album                     | Its page · other albums                                                     |
| Give / Prayer             | Contact · Find a Church                                                     |

Dead ends are not allowed. Every template ends with at least two bridges.

## 5. Legacy redirects (esocs.net → new URLs)

These are permanent redirects, implemented in `src/config/redirects.ts`. Old detail pages used
WordPress post IDs, confirmed from the legacy JavaScript bundle.

| Old                                          | New                                                                     |
| -------------------------------------------- | ----------------------------------------------------------------------- |
| `/about`                                     | `/church/esocs`                                                         |
| `/about/history`                             | `/history`                                                              |
| `/about/advisory-board`                      | `/church/esocs/leaders`                                                 |
| `/about/esocs-directorate`                   | `/sections`                                                             |
| `/about/provinces`                           | `/find?kind=province`                                                   |
| `/about/CMCs`, `/about/cmcs`                 | `/find?kind=cmc`                                                        |
| `/about/calendar`                            | `/calendar`                                                             |
| `/pastors`                                   | `/leaders`                                                              |
| `/pastors/{409,414,416,419,546,672,673,722}` | `/leaders/[slug]` (exact mapping)                                       |
| `/news/{333,393}`                            | `/posts/news-[slug]`                                                    |
| `/gallery`                                   | `/media`                                                                |
| `/gallery/{861,867,1364,1461,1536}`          | `/media/albums/[slug]`                                                  |
| `/events/{841…877}`                          | `/calendar` (legacy event dates were wrong; the calendar computes them) |
| `/giving`                                    | `/give`                                                                 |
| `/contact-us`                                | `/contact`                                                              |
| `/service-times`                             | `/find`                                                                 |
| `/videos`                                    | `/media/videos`                                                         |

## 6. Labels and language

- Plain words over internal jargon: "Find a Church", "How we're organised", "Prayer request".
- Church terms keep their proper names (Baba Aladura, CMC, Mother Cherub). They are explained by
  an **inline glossary term** (dotted underline with a tooltip or bottom sheet) and on
  `/glossary` (see `03-glossary.md`).
- Names from the records are shown in proper case, with titles kept exactly (`displayCase` in
  `src/lib/text.ts`).
- Dates are written in full ("16 August 2018"). Relative times ("3 days ago") appear only in feeds.

## 7. Tree test kit (gate G1)

**Method.** An unmoderated tree test using any tree-testing tool (for example Optimal Workshop
Treejack), or moderated with the printed tree.

- **Participants:** at least 8 people: 2 older members (60+), 2 youth (MZYS), 2 from the women's
  fellowship, 1 diaspora member, 1 newcomer.
- **Design:** each participant sees one variant. Tasks are shown in random order, and the tree
  shows labels only.

**The tree** (Variant A; for B, swap Media and News as shown in §1):

```
Home
Find a Church
  ├ Search by town or name
  ├ Map
  └ How we're organised
Events
  ├ Upcoming events
  ├ Church calendar
  └ Pastoral tours
Media
  ├ News & stories
  ├ Albums
  ├ Videos
  └ Radio
More
  ├ About ESOCS ─ Who we are · History · Baba Aladuras · Advisory Board · Ordinations & ranks · Glossary
  ├ Our church family ─ Women · Youth · Directorates
  └ Get involved ─ Give · Prayer request · Contact us
```

| #   | Task (read to participant)                                               | Correct answer(s)                                   | Journey |
| --- | ------------------------------------------------------------------------ | --------------------------------------------------- | ------- |
| T1  | "You've moved to Port Harcourt. Find an ESOCS house of prayer near you." | Find a Church › Search / Map                        | J1      |
| T2  | "Find out who leads the whole church today."                             | More › About ESOCS › Baba Aladuras / Who we are     | J3      |
| T3  | "When is ESOCS Mother's Day this year?"                                  | Events › Church calendar                            | J5      |
| T4  | "Find photos from the 100th anniversary celebration."                    | Media › Albums                                      | —       |
| T5  | "Which provinces belong to CMC 9?"                                       | Find a Church › How we're organised                 | J6      |
| T6  | "Learn about the Mount Zion Youth Society."                              | More › Our church family › Youth                    | J7      |
| T7  | "Send a private prayer request."                                         | More › Get involved › Prayer request                | J10     |
| T8  | "Where has the Baba Aladura visited this year?"                          | Events › Pastoral tours                             | J8      |
| T9  | "Read the Baba Aladura's New Year message."                              | Home, or Media › News & stories                     | J3      |
| T10 | "Find how to give to the church."                                        | More › Get involved › Give (the Give button counts) | J9      |

**Thresholds:**

- Each task needs **at least 80% success** and at least 60% "directness" (no backtracking).
- A label that fails is renamed or moved, and the test is re-run on the failing tasks.
- The better-performing variant is adopted for slot 4.

## 8. Decisions needed from the owner

1. Approve the five-slot model and the two variants to test.
2. Recruit the 8+ participants (the mix above).
3. Confirm Tours under **Events**, and Ordinations under **About ESOCS**.
4. Answer the glossary questions marked "needs definition" in `03-glossary.md`.
