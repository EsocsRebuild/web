"use client";

import { HeartHandshake, Lock, Phone } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { siteConfig } from "@/config/site";
import { isSocialError } from "@/data/errors";
import { getSocial } from "@/data/social";

type Status = "idle" | "sending" | "sent" | "unavailable";

const MAX = 4000;

/** Private prayer request. Validates inline and never loses what someone wrote. */
export function PrayerForm() {
  const [status, setStatus] = React.useState<Status>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [request, setRequest] = React.useState("");
  const hotline =
    siteConfig.contact.phones.find((p) => /counsel/i.test(p.label)) ?? siteConfig.contact.phones[0];

  if (status === "sent") {
    return (
      <div role="status" className="grid justify-items-start gap-4 rounded-panel bg-success-soft p-8">
        <HeartHandshake aria-hidden className="size-10 text-success" />
        <h2 className="font-display text-display-sm font-extrabold">We&apos;re praying with you</h2>
        <p className="max-w-lg text-muted-foreground">
          Your request has been received and will be read only by the prayer team.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            setRequest("");
            setStatus("idle");
          }}
        >
          Send another request
        </Button>
      </div>
    );
  }

  return (
    <form
      noValidate
      className="grid gap-5"
      onSubmit={async (e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        if (request.trim().length < 3) {
          setError("Please write your prayer request.");
          return;
        }
        setError(null);
        setStatus("sending");
        try {
          await getSocial().submitPrayerRequest({
            name: String(data.get("name") ?? ""),
            contact: String(data.get("contact") ?? ""),
            request,
          });
          setStatus("sent");
        } catch (err) {
          if (isSocialError(err, "unavailable")) setStatus("unavailable");
          else {
            setStatus("idle");
            setError(isSocialError(err) ? err.message : "Your request wasn't sent. Please try again.");
          }
        }
      }}
    >
      <p className="flex items-start gap-2.5 rounded-card bg-surface-muted p-4 text-sm leading-6 text-muted-foreground">
        <Lock aria-hidden className="mt-0.5 size-4 shrink-0" />
        Your request is private. It is never published and is read only by the prayer team.
      </p>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" htmlFor="prayer-name" hint="Optional">
          <Input id="prayer-name" name="name" autoComplete="name" aria-describedby="prayer-name-msg" />
        </Field>
        <Field label="Email or phone" htmlFor="prayer-contact" hint="Optional, if you'd like a reply">
          <Input
            id="prayer-contact"
            name="contact"
            autoComplete="email"
            aria-describedby="prayer-contact-msg"
          />
        </Field>
      </div>
      <Field label="Your prayer request" htmlFor="prayer-request" error={error ?? undefined} required>
        <Textarea
          id="prayer-request"
          name="request"
          rows={7}
          maxLength={MAX}
          value={request}
          onChange={(e) => setRequest(e.target.value)}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? "prayer-request-msg" : undefined}
          required
        />
      </Field>
      {status === "unavailable" && (
        <div role="alert" className="grid gap-2 rounded-card bg-warning-soft p-4 text-sm">
          <p className="font-semibold">Online prayer requests are coming soon.</p>
          <p className="text-muted-foreground">
            Your words are still here. For now, please call the counselling hotline on{" "}
            <a href={`tel:${hotline.number}`} className="font-semibold text-foreground tabular">
              {hotline.display}
            </a>
            .
          </p>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-subtle-foreground tabular">
          {request.length > MAX - 500 ? `${MAX - request.length} characters left` : ""}
        </span>
        <Button type="submit" size="lg" loading={status === "sending"}>
          Send my request
        </Button>
      </div>
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Phone aria-hidden className="size-4" />
        Need to talk now? Call{" "}
        <a href={`tel:${hotline.number}`} className="font-semibold text-foreground tabular">
          {hotline.display}
        </a>
      </p>
    </form>
  );
}
