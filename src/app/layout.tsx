import type { Metadata, Viewport } from "next";

import { SkipLink } from "@/components/layout/skip-link";
import { AppSplash, SPLASH_SCRIPT } from "@/components/shell/app-splash";
import { AppHeader } from "@/components/shell/app-header";
import { BottomNav } from "@/components/shell/bottom-nav";
import { SiteFooter } from "@/components/shell/site-footer";
import { Providers } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { siteConfig } from "@/config/site";
import { SignInDialog } from "@/features/social/sign-in-dialog";
import { fontVariables } from "@/lib/fonts";
import { absoluteUrl } from "@/lib/utils";

import "./globals.css";

// Upcoming events and the announcement ticker depend on today's date.
export const revalidate = 3600;

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl()),
  title: {
    default: siteConfig.fullName,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    siteName: siteConfig.fullName,
    title: siteConfig.fullName,
    description: siteConfig.description,
    url: absoluteUrl(),
    locale: siteConfig.locale.replace("-", "_"),
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfaf7" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1224" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        {/* Must run before first paint so a returning visitor never sees the splash flash. */}
        <script dangerouslySetInnerHTML={{ __html: SPLASH_SCRIPT }} />
        {/* The splash paints these first; fetch them before anything else. */}
        <link rel="preload" as="image" href="/brand/splash-bg.webp" fetchPriority="high" />
        <link rel="preload" as="image" href="/brand/esocs-crest-192.webp" fetchPriority="high" />
      </head>
      <body className="flex min-h-dvh flex-col">
        <AppSplash />
        <Providers>
          <SkipLink />
          <AppHeader />
          <main id="main" tabIndex={-1} className="flex-1 outline-none">
            {children}
          </main>
          <SiteFooter />
          <BottomNav />
          <SignInDialog />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
