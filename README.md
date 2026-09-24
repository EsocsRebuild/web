# ESOCS Web

Website for the Eternal Sacred Order of Cherubim & Seraphim.

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Radix UI.

## Getting started

```bash
nvm use
npm install          # also points Git at .githooks
cp .env.example .env.local
npm run dev          # http://localhost:3000
```

| Script              | Purpose                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------ |
| `npm run dev`       | Development server                                                                         |
| `npm run build`     | Production build                                                                           |
| `npm run lint`      | ESLint, zero warnings allowed                                                              |
| `npm run format`    | Prettier (with Tailwind class sorting)                                                     |
| `npm run typecheck` | Route type generation and `tsc`                                                            |
| `npm run test`      | Unit and component tests (Vitest, Testing Library)                                         |
| `npm run test:e2e`  | Production build, then Playwright on phone, tablet, desktop, plus axe accessibility checks |
| `npm run validate`  | Everything CI runs before the build                                                        |

Contribution workflow, branch naming, commit conventions and hooks are described in
[CONTRIBUTING.md](CONTRIBUTING.md).

## Project structure

```
src/
  app/                 Routes, root layout, global styles
    globals.css        Design tokens and base styles
    design-system/     Internal component reference (dev only)
  components/
    layout/            Container, Section, SiteHeader, SiteFooter, MobileNav, SkipLink
    typography/        Heading, Text, Lead, Overline, SectionHeader
    ui/                Button, Badge, Card, Media, Alert, Avatar, form controls,
                       Dialog, Sheet, Accordion, Tabs, Tooltip, DropdownMenu, Toaster
    blocks/            PageHero, ServiceTimes, EventCard, SermonCard, Scripture, CtaBanner
    theme/             Providers, ThemeToggle
    icons/             Logo, social icons
  config/site.ts       Church details, service times, navigation
  hooks/               useScrolled, useMediaQuery, useMounted
  lib/                 Utilities, formatters, fonts, development fixtures
e2e/                   Playwright specs
.githooks/             Git hooks (pre-commit, commit-msg, pre-push) and their policy
scripts/githooks.mjs   Installs the hooks (runs on npm install)
.github/               CI, CodeQL, dependency review, release automation, templates
```

## Design tokens

All tokens live in `src/app/globals.css`.

- **Colour.** Components use semantic tokens (`bg-background`, `bg-surface`, `text-foreground`,
  `text-muted-foreground`, `bg-primary`, `bg-accent`, `text-highlight`, `border-border`, `bg-inverse`), never
  raw palette values. Light and dark themes redefine the same tokens.
- **Type.** Archivo (bold, variable width) for display headings (`text-display-sm` to `text-display-2xl`, fluid between
  360px and 1440px viewports). DM Sans for body and interface text.
- **Layout.** `px-gutter` for horizontal page padding, `py-section` for vertical rhythm, `max-w-site` and
  `max-w-wide` for content width, `h-header` for the header height.
- **Shape.** `rounded-control` for buttons and inputs, `rounded-card` for cards and media.

## Conventions

- Build pages from `Section` and `Container`. Use `Heading` with `as` for the outline level and `size` for
  appearance; one `h1` per page.
- A page that opens with a dark band (`PageHero`, or any first section with `data-hero`) gets a transparent
  header automatically. See the `.site-header` rules in `globals.css`.
- `Section tone="inverse"`, `Card variant="inverse"` and `CtaBanner` apply the `dark` class, so their
  contents use dark tokens in either theme.
- Use `Button asChild` to render a Next.js `Link` as a button.
- Define component variants with `cva` and merge classes with `cn()`.
- Images go through `Media` or `next/image`. `Media` keeps its aspect ratio when no image is set.

## Before launch

- Confirm every `TODO` in `src/config/site.ts`.
- Replace `LogoMark` in `src/components/icons/logo.tsx` with the official crest.
- Supply photography and set `siteConfig.heroImage`.
- Replace `src/lib/fixtures.ts` with the real content source.

The design-system route returns 404 in production unless `ENABLE_DESIGN_SYSTEM=true`.
