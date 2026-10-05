"use client";

import { CircleCheck, Lock, MapPin, Truck } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { EmptyState } from "@/components/patterns/states";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { siteConfig } from "@/config/site";
import { isCommerceError } from "@/data/errors";
import { getOrders } from "@/data/orders";
import { lineKey, priceBag } from "@/data/pricing";
import {
  orderDraftSchema,
  type FulfilmentMethod,
  type OrderConfirmation,
  type OrderDraft,
  type Product,
} from "@/data/schema/store";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

import { bag, useBagLines, useHydrated } from "./bag-store";
import { BagLoading, OrderSummary } from "./bag-view";
import { formatMoney } from "./money";
import { ProductArt } from "./product-art";

const STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT Abuja",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

type Status = "idle" | "sending" | "unavailable";
type Errors = Record<string, string>;

function Section({ step, title, children }: { step: number; title: string; children: React.ReactNode }) {
  return (
    <section
      aria-labelledby={`checkout-step-${step}`}
      className="grid gap-5 rounded-panel border border-border bg-surface p-5 sm:p-6"
    >
      <h2 id={`checkout-step-${step}`} className="flex items-center gap-3 font-display text-lg font-bold">
        <span
          aria-hidden
          className="inline-flex size-7 items-center justify-center rounded-full bg-royal-900 text-sm text-gold-100"
        >
          {step}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

/**
 * Checkout in three plain steps: who you are, how you receive it, and a review.
 * No card details are taken here; the store confirms the order and how to pay.
 * Every field is validated inline and nothing typed is lost on an error.
 */
export function CheckoutForm({ catalogue }: { catalogue: Product[] }) {
  const lines = useBagLines();
  const hydrated = useHydrated();
  const bySlug = React.useMemo(() => new Map(catalogue.map((p) => [p.slug, p])), [catalogue]);
  const priced = priceBag(lines, bySlug);
  const orderable = priced.lines.filter((l) => l.available);

  const [fulfilment, setFulfilment] = React.useState<FulfilmentMethod>("collect");
  const [errors, setErrors] = React.useState<Errors>({});
  const [status, setStatus] = React.useState<Status>("idle");
  const [problem, setProblem] = React.useState<string | null>(null);
  const [confirmation, setConfirmation] = React.useState<OrderConfirmation | null>(null);

  if (confirmation) {
    return (
      <div
        role="status"
        className="mx-auto grid max-w-xl justify-items-center gap-4 rounded-panel border border-border bg-surface p-8 text-center sm:p-12"
      >
        <CircleCheck aria-hidden className="size-12 text-success" />
        <h2 className="font-display text-display-sm font-extrabold">Thank you, your order is placed</h2>
        <p className="text-muted-foreground">
          Your reference is{" "}
          <strong className="font-semibold text-foreground tabular">{confirmation.reference}</strong> for{" "}
          {formatMoney(confirmation.total)}. The store team will contact you to confirm collection or delivery
          and how to pay.
        </p>
        <Button asChild variant="outline">
          <Link href={routes.store()}>Back to the store</Link>
        </Button>
      </div>
    );
  }

  if (!hydrated) return <BagLoading />;

  if (!orderable.length) {
    return (
      <EmptyState
        title="There’s nothing to check out yet"
        action={
          <Button asChild>
            <Link href={routes.store()}>Browse the store</Link>
          </Button>
        }
      >
        <p className="text-sm text-muted-foreground">Add something to your bag, then come back here.</p>
      </EmptyState>
    );
  }

  /** Error wiring for a control: `path` is the order field, `id` the control (Field names its message `${id}-msg`). */
  const field = (path: string, id: string) => ({
    "data-field": path,
    "aria-invalid": errors[path] ? true : undefined,
    "aria-describedby": errors[path] ? `${id}-msg` : undefined,
  });

  const submit = async (form: HTMLFormElement) => {
    const data = new FormData(form);
    const get = (k: string) => String(data.get(k) ?? "");
    const draft: OrderDraft = {
      lines: orderable.map((l) => l.line),
      contact: { name: get("name"), email: get("email"), phone: get("phone") },
      fulfilment,
      address:
        fulfilment === "deliver" ? { line1: get("line1"), city: get("city"), state: get("state") } : null,
      note: get("note") || undefined,
    };
    const parsed = orderDraftSchema.safeParse(draft);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) next[issue.path.join(".")] ??= issue.message;
      setErrors(next);
      const first = Object.keys(next)[0];
      form.querySelector<HTMLElement>(`[data-field="${first}"]`)?.focus();
      return;
    }
    setErrors({});
    setProblem(null);
    setStatus("sending");
    try {
      const result = await getOrders(catalogue).placeOrder(parsed.data);
      bag.clear();
      setConfirmation(result);
    } catch (err) {
      if (isCommerceError(err, "unavailable")) setStatus("unavailable");
      else {
        setStatus("idle");
        if (isCommerceError(err, "validation")) setErrors(err.fields);
        setProblem(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      }
    }
  };

  const hq = siteConfig.contact.headquarters;
  const option = (value: FulfilmentMethod, Icon: typeof MapPin, title: string, body: string) => {
    const id = `fulfilment-${value}`;
    return (
      <label
        htmlFor={id}
        className={cn(
          "flex cursor-pointer items-start gap-3 rounded-card border p-4 transition-colors has-focus-visible:ring-2 has-focus-visible:ring-ring/40",
          fulfilment === value
            ? "border-foreground bg-surface-muted"
            : "border-border-strong hover:border-foreground",
        )}
      >
        <input
          id={id}
          type="radio"
          name="fulfilment"
          value={value}
          checked={fulfilment === value}
          onChange={() => setFulfilment(value)}
          className="mt-1 size-4 accent-royal-700"
        />
        <span className="grid gap-1">
          <span className="flex items-center gap-2 font-semibold">
            <Icon aria-hidden className="size-4 text-accent" />
            {title}
          </span>
          <span className="text-sm leading-6 text-muted-foreground">{body}</span>
        </span>
      </label>
    );
  };

  return (
    <form
      noValidate
      className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-10"
      onSubmit={(e) => {
        e.preventDefault();
        void submit(e.currentTarget);
      }}
    >
      <div className="grid gap-6">
        <Section step={1} title="Your details">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Full name"
              htmlFor="name"
              error={errors["contact.name"]}
              required
              className="sm:col-span-2"
            >
              <Input id="name" name="name" autoComplete="name" {...field("contact.name", "name")} />
            </Field>
            <Field label="Email" htmlFor="email" error={errors["contact.email"]} required>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                {...field("contact.email", "email")}
              />
            </Field>
            <Field
              label="Phone"
              htmlFor="phone"
              error={errors["contact.phone"]}
              required
              hint="For the store to confirm your order."
            >
              <Input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+234"
                {...field("contact.phone", "phone")}
              />
            </Field>
          </div>
        </Section>

        <Section step={2} title="Collection or delivery">
          <fieldset className="grid gap-3">
            <legend className="sr-only">How would you like to receive your order?</legend>
            {option("collect", MapPin, `Collect from the ${hq.name}`, hq.address)}
            {option(
              "deliver",
              Truck,
              "Deliver to my address",
              "Delivery within Nigeria, arranged by the store team.",
            )}
          </fieldset>
          {fulfilment === "deliver" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Street address"
                htmlFor="line1"
                error={errors["address.line1"]}
                required
                className="sm:col-span-2"
              >
                <Input
                  id="line1"
                  name="line1"
                  autoComplete="street-address"
                  {...field("address.line1", "line1")}
                />
              </Field>
              <Field label="Town or city" htmlFor="city" error={errors["address.city"]} required>
                <Input
                  id="city"
                  name="city"
                  autoComplete="address-level2"
                  {...field("address.city", "city")}
                />
              </Field>
              <Field label="State" htmlFor="state" error={errors["address.state"]} required>
                <select
                  id="state"
                  name="state"
                  defaultValue=""
                  autoComplete="address-level1"
                  {...field("address.state", "state")}
                  className="h-11 w-full cursor-pointer rounded-control border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25 aria-invalid:border-danger"
                >
                  <option value="" disabled>
                    Choose a state
                  </option>
                  {STATES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
            </div>
          )}
          <Field label="Note for the store (optional)" htmlFor="note">
            <Textarea id="note" name="note" rows={3} maxLength={500} />
          </Field>
        </Section>

        <Section step={3} title="Payment">
          <p className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
            <Lock aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
            No payment is taken on this page and no card details are asked for. The store team confirms your
            order and tells you how to pay.
          </p>
        </Section>
      </div>

      <OrderSummary
        subtotal={formatMoney(priced.subtotal)}
        count={priced.count}
        className="lg:sticky lg:top-[calc(var(--spacing-header)+1.5rem)]"
      >
        <ul aria-label="In your order" className="grid gap-3">
          {orderable.map(({ line, product, option: chosen, total }) => (
            <li key={lineKey(line)} className="flex items-center gap-3 text-sm">
              <ProductArt product={product} sizes="48px" className="size-12 shrink-0 rounded-control" />
              <span className="grid min-w-0 flex-1">
                <span className="font-semibold text-pretty">{product.name}</span>
                <span className="text-xs text-muted-foreground">
                  {chosen ? `${chosen.label} · ` : ""}Qty {line.quantity}
                </span>
              </span>
              <span className="font-semibold tabular">{formatMoney(total)}</span>
            </li>
          ))}
        </ul>
        {status === "unavailable" && (
          <div role="alert" className="grid gap-1 rounded-card bg-warning-soft p-3 text-sm leading-6">
            <p className="font-semibold">Online orders open when the church store launches.</p>
            <p className="text-muted-foreground">Your bag is kept on this device, ready for when it does.</p>
          </div>
        )}
        {problem && (
          <p role="alert" className="rounded-card bg-danger-soft p-3 text-sm">
            {problem}
          </p>
        )}
        <Button type="submit" size="lg" fullWidth loading={status === "sending"}>
          Place order
        </Button>
        <Link
          href={routes.bag()}
          className="text-center text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          Back to your bag
        </Link>
      </OrderSummary>
    </form>
  );
}
