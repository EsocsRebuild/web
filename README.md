# ESOCS — Web

Premium frontend for the Eternal Sacred Order of Cherubim & Seraphim.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Radix UI · Motion · next-themes

```bash
cp .env.example .env.local
npm install
npm run dev        # http://localhost:3000
npm run build      # production build + type-check
npm run lint
npx prettier --write .
```

Open **`/design-system`** to see every token and component live, in light and dark.

## Structure

```
src/
├─ app/
│  ├─ globals.css          ← design tokens, themes, base styles, utilities
│  ├─ layout.tsx           ← fonts, providers, header/footer, metadata
│  ├─ page.tsx             ← home page (reference composition)
│  ├─ design-system/       ← living style guide
│  └─ error / loading / not-found / robots / sitemap / manifest
├─ components/
│  ├─ layout/              Container, Section, SiteHeader, SiteFooter, MobileNav, SkipLink
│  ├─ typography/          Heading, Text, Lead, Eyebrow, SectionHeader
│  ├─ ui/                  Button, Badge, Card, Alert, Avatar, Input, Textarea, Select,
│  │                       Checkbox, Switch, Field, Label, Dialog, Sheet, Accordion, Tabs,
│  │                       Tooltip, DropdownMenu, Toaster, Separator, Skeleton, Spinner, Links
│  ├─ blocks/              PageHero, Scripture, EventCard, SermonCard, CtaBanner, ServiceTimes
│  ├─ motion/              Reveal, Stagger, StaggerItem
│  ├─ theme/               Providers, ThemeToggle
│  └─ icons/               Logo, social icons
├─ config/site.ts          ← church name, contacts, service times, navigation (edit TODOs)
├─ hooks/                  useScrolled, useMediaQuery, useMounted
└─ lib/                    cn & helpers, date/currency formatters, fonts, placeholder data
```

## Design tokens

Defined once in `src/app/globals.css`:

| Layer | Examples | Use for |
| --- | --- | --- |
| Brand palette | `royal-50…950`, `gold-…`, `parchment-…` | Rare, deliberate brand moments |
| **Semantic** | `bg-background`, `bg-surface`, `text-foreground`, `text-muted-foreground`, `bg-primary`, `bg-accent`, `text-highlight`, `border-border`, `bg-danger` | **Default choice for all UI** — adapts to light/dark automatically |
| Type | `text-display-2xl…sm`, `text-eyebrow`, `font-display`, `font-sans` | Fluid headings (clamp-based) |
| Layout | `px-gutter`, `py-section`, `h-header`, `max-w-site`, `max-w-wide` | Consistent rhythm |
| Effects | `shadow-soft/card/elevated/glow`, `rounded-card`, `ease-out-expo` | Depth & motion |
| Utilities | `bg-sanctuary`, `bg-grain`, `bg-dots`, `text-gold-gradient`, `divider-fade`, `prose-sacred` | Signature textures |

**Fonts:** Cormorant Garamond (display) + Manrope (body), self-hosted via `next/font`.

## Building a page

```tsx
import { PageHero } from "@/components/blocks/page-hero";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/typography/section-header";

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="About" title="Our Story" description="…" />
      <Section>
        <SectionHeader eyebrow="Heritage" title="Founded in prayer" />
        {/* content */}
      </Section>
      <Section tone="inverse" container="narrow">…</Section>
    </>
  );
}
```

### Conventions

- **Always use semantic colours**, not raw palette or hex values, so dark mode works for free.
- `<Section tone="inverse">`, `<Card variant="inverse">` and `CtaBanner` add a `.dark` class so everything inside them automatically uses dark tokens, even in light mode.
- Pages that open with a dark hero must be added to `OVERLAY_ROUTES` in `components/layout/site-header.tsx` so the header starts transparent.
- `Heading` separates semantics (`as="h1"`) from appearance (`size="xl"`). Keep one `h1` per page.
- Use `Button asChild` to style a `next/link` as a button.
- Style variants with `cva`, and merge classes with `cn()` from `@/lib/utils`.
- Replace `LogoMark` in `components/icons/logo.tsx` with the official crest.
- Delete `lib/placeholder-data.ts` once real content (CMS/API) is connected.
