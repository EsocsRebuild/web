# ESOCS Web

Website for the Eternal Sacred Order of Cherubim & Seraphim.

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Radix UI.

## Getting started

```bash
nvm use
npm install
cp .env.example .env.local
npm run dev
```

| Script                        | Description                                                                                            |
| ----------------------------- | ------------------------------------------------------------------------------------------------------ |
| `npm run dev`                 | Development server on http://localhost:3000                                                            |
| `npm run build` / `npm start` | Production build and server                                                                            |
| `npm run validate`            | Lint, format check, type-check and unit tests                                                          |
| `npm test`                    | Unit tests (Vitest)                                                                                    |
| `npm run test:e2e`            | Production build and Playwright tests on phone, tablet and desktop, including axe accessibility checks |
| `npm run format`              | Format all files with Prettier                                                                         |

See [CONTRIBUTING.md](CONTRIBUTING.md) for branches, commit conventions, Git hooks and CI.

## Project structure

```
src/
  app/                 Routes, root layout, global styles
    design-system/     Internal component reference (dev only)
  components/
    layout/            Container, Section, SiteHeader, SiteFooter, MobileNav
    typography/        Heading, Text, Lead, Overline, SectionHeader
    ui/                Buttons, forms, cards, media, dialogs, menus, tabs, etc.
    blocks/            Church-specific sections: PageHero, ServiceTimes, EventCard, SermonCard, Scripture, CtaBanner
    theme/             Theme provider and toggle
    icons/             Logo and social icons
  config/site.ts       Church details, service times, navigation
  hooks/               Client hooks
  lib/                 Utilities, formatters, fonts, development fixtures
e2e/                   Playwright tests
```

## Design tokens

All tokens live in `src/app/globals.css`.

- **Palette:** `royal`, `gold` and `parchment` scales, 50–950.
- **Semantic colours:** `background`, `foreground`, `surface`, `surface-muted`, `muted-foreground`,
  `border`, `primary`, `accent`, `highlight`, `inverse`, and the status colours. Use these in components so
  light and dark themes work without extra classes.
- **Type:** Cormorant Garamond for display headings (`text-display-sm` to `text-display-2xl`, fluid),
  Manrope for everything else.
- **Layout:** `px-gutter`, `py-section`, `h-header`, `max-w-site`, `max-w-wide`.
- **Shape:** `rounded-control` for inputs and buttons, `rounded-card` for cards and media.

Any element with the `dark` class switches its subtree to dark tokens. `Section tone="inverse"`,
`Card variant="inverse"`, `PageHero` and the footer use this.

## Conventions

- Build pages from `PageHero` followed by `Section` components.
- When a page opens with a dark hero (anything marked `data-hero`, such as `PageHero`), the header becomes
  transparent over it automatically.
- `Heading` sets the document level with `as` and the visual size with `size`. One `h1` per page.
- Use `Button asChild` to style a Next.js `Link` as a button.
- Use `Media` for images. It keeps its aspect ratio and shows a neutral block until an image is supplied.
- Card lists use `snap-row` on small screens and a grid from `lg`.
- Inputs use a 16px font on mobile to prevent iOS zoom on focus.

## Before launch

- Fill in every `TODO` in `src/config/site.ts`, and set `heroImage`.
- Replace the placeholder mark in `src/components/icons/logo.tsx` with the official crest.
- Replace `src/lib/fixtures.ts` with real content from the CMS or API.
- Set `NEXT_PUBLIC_SITE_URL` in the hosting environment.
