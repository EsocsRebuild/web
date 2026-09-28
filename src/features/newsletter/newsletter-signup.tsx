"use client";

import { MailCheck, Send } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { isSocialError } from "@/data/errors";
import { getSocial } from "@/data/social";

type Status = "idle" | "sending" | "done" | "unavailable";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * "Subscribe to our newsletter": a first name and an email address. It checks the
 * address before sending, keeps what was typed when anything goes wrong, and says
 * plainly when sign-up is not open yet rather than pretending to subscribe.
 */
export function NewsletterSignup() {
  const [status, setStatus] = React.useState<Status>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [email, setEmail] = React.useState("");
  const [name, setName] = React.useState("");

  if (status === "done") {
    return (
      <div
        role="status"
        className="flex items-start gap-4 rounded-panel border border-white/10 bg-white/5 p-6"
      >
        <MailCheck aria-hidden className="mt-0.5 size-7 shrink-0 text-gold-300" />
        <div className="grid gap-1">
          <p className="font-display text-lg font-bold">You’re subscribed{name ? `, ${name}` : ""}.</p>
          <p className="text-sm leading-6 text-muted-foreground">
            News from across the Order will reach {email} as it happens.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      noValidate
      aria-label="Newsletter sign-up"
      className="grid gap-3"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!EMAIL.test(email.trim())) {
          setError("Please enter a valid email address, like name@example.com.");
          return;
        }
        setError(null);
        setStatus("sending");
        try {
          await getSocial().subscribeToNewsletter({ email, name });
          setStatus("done");
        } catch (err) {
          if (isSocialError(err, "unavailable")) setStatus("unavailable");
          else {
            setStatus("idle");
            setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
          }
        }
      }}
    >
      <div className="grid gap-3 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)_auto] sm:items-start">
        <Field label="First name" htmlFor="newsletter-name" className="[&_label]:sr-only">
          <Input
            id="newsletter-name"
            name="name"
            autoComplete="given-name"
            placeholder="First name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border-white/15 bg-white/5 text-white placeholder:text-white/55"
          />
        </Field>
        <Field
          label="Email address"
          htmlFor="newsletter-email"
          error={error}
          required
          className="[&_label]:sr-only"
        >
          <Input
            id="newsletter-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!error || undefined}
            aria-describedby={error ? "newsletter-email-msg" : undefined}
            className="border-white/15 bg-white/5 text-white placeholder:text-white/55"
            required
          />
        </Field>
        <Button type="submit" loading={status === "sending"} leftIcon={<Send />}>
          Subscribe
        </Button>
      </div>
      {status === "unavailable" ? (
        <p role="alert" className="text-sm leading-6 text-gold-200">
          Newsletter sign-up opens soon. Your details are still here; until then, follow the church on the
          channels below.
        </p>
      ) : (
        <p className="text-xs leading-5 text-muted-foreground">
          We use your email only for church news. Unsubscribe at any time.
        </p>
      )}
    </form>
  );
}
