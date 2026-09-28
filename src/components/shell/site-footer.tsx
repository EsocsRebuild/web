import Link from "next/link";

import { Logo } from "@/components/icons/logo";
import { socialIcons } from "@/components/icons/social-icons";
import { bottomNav, moreNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { NewsletterSignup } from "@/features/newsletter/newsletter-signup";

export function SiteFooter() {
  const { contact, socials } = siteConfig;
  const groups = [{ title: "Explore", items: bottomNav.slice(1) }, ...moreNav];

  return (
    <footer className="dark mt-16 bg-inverse pb-[calc(var(--spacing-bottom-nav)+env(safe-area-inset-bottom))] text-foreground lg:pb-0">
      <section
        aria-labelledby="newsletter-heading"
        className="relative isolate overflow-hidden border-b border-white/10"
      >
        <div
          aria-hidden
          className="parallax-layer absolute inset-x-0 -inset-y-20 -z-10"
          style={
            {
              "--parallax-shift": "12%",
              backgroundImage:
                "radial-gradient(40% 70% at 12% 50%, color-mix(in oklch, var(--color-royal-600) 35%, transparent), transparent 70%), radial-gradient(30% 60% at 95% 0%, color-mix(in oklch, var(--color-gold-500) 14%, transparent), transparent 70%)",
            } as React.CSSProperties
          }
        />
        <div className="mx-auto grid max-w-wide gap-6 px-gutter py-12 sm:py-14 lg:grid-cols-[1fr_1.25fr] lg:items-center lg:gap-12">
          <div className="grid gap-2">
            <p className="text-overline font-semibold text-highlight uppercase">Newsletter</p>
            <h2 id="newsletter-heading" className="font-display text-display-sm font-extrabold text-balance">
              Subscribe to our newsletter
            </h2>
            <p className="max-w-md text-[0.9375rem] leading-7 text-muted-foreground">
              Stay updated with the latest happenings in the church: messages, events, tours and news from
              across the Order.
            </p>
          </div>
          <NewsletterSignup />
        </div>
      </section>
      <div className="mx-auto grid max-w-wide gap-12 px-gutter py-14 lg:grid-cols-12 lg:gap-8">
        <div className="grid content-start gap-5 lg:col-span-4">
          <Logo size="lg" />
          <p className="max-w-sm text-sm leading-6 text-muted-foreground">
            {siteConfig.fullName}. Founded in {siteConfig.founded}. Sustained by God&apos;s endless mercies.
          </p>
          <address className="grid gap-1 text-sm leading-6 text-muted-foreground not-italic">
            <span className="font-semibold text-foreground">{contact.headquarters.name}</span>
            <span>{contact.headquarters.address}</span>
            {contact.phones.map((p) => (
              <a key={p.number} href={`tel:${p.number}`} className="hover:text-foreground">
                {p.label}: {p.display}
              </a>
            ))}
          </address>
          <ul className="-ml-2.5 flex">
            {Object.entries(socials).map(([key, href]) => {
              const Icon = socialIcons[key as keyof typeof socialIcons];
              return (
                <li key={key}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`ESOCS on ${key === "x" ? "X" : key[0].toUpperCase() + key.slice(1)}`}
                    className="inline-flex size-11 items-center justify-center rounded-control text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                  >
                    <Icon className="size-4.5" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8 lg:grid-cols-5">
          {groups.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="text-sm font-semibold">{group.title}</h2>
              <ul className="mt-4 grid gap-2.5">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-sm text-muted-foreground hover:text-foreground">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-wide px-gutter py-6 text-xs text-subtle-foreground">
          © {new Date().getFullYear()} {siteConfig.fullName}
        </p>
      </div>
    </footer>
  );
}
