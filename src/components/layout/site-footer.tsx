import Link from "next/link";

import { Logo } from "@/components/icons/logo";
import { socialIcons } from "@/components/icons/social-icons";
import { footerNav, siteConfig } from "@/config/site";

import { Container } from "./container";

export function SiteFooter() {
  const { contact, socials } = siteConfig;
  const year = new Date().getFullYear();

  return (
    <footer className="dark bg-inverse pb-[env(safe-area-inset-bottom)] text-foreground">
      <Container size="wide" className="py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col gap-5 lg:col-span-4">
            <Logo />
            <address className="text-sm leading-6 text-muted-foreground not-italic">
              {contact.address.line1}
              <br />
              {contact.address.city}, {contact.address.country}
              <br />
              <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="hover:text-foreground">
                {contact.phone}
              </a>
              <br />
              <a href={`mailto:${contact.email}`} className="hover:text-foreground">
                {contact.email}
              </a>
            </address>
          </div>

          <div className="lg:col-span-3">
            <h2 className="text-sm font-semibold">Service times</h2>
            <dl className="mt-4 grid gap-3 text-sm">
              {siteConfig.services.map((s) => (
                <div key={s.name} className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">
                    {s.day}, {s.name}
                  </dt>
                  <dd className="tabular-nums">{s.time}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-2 lg:col-span-5 lg:pl-8">
            {footerNav.map((group) => (
              <nav key={group.title} aria-label={group.title}>
                <h2 className="text-sm font-semibold">{group.title}</h2>
                <ul className="mt-4 grid gap-2.5">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="text-sm text-muted-foreground hover:text-foreground">
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col-reverse gap-6 border-t border-border pt-8 text-xs text-subtle-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.fullName}
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <ul className="-mr-2.5 flex">
              {Object.entries(socials).map(([key, href]) => {
                const Icon = socialIcons[key as keyof typeof socialIcons];
                return (
                  <li key={key}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={key}
                      className="inline-flex size-10 items-center justify-center text-muted-foreground hover:text-foreground"
                    >
                      <Icon className="size-4" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </Container>
    </footer>
  );
}
