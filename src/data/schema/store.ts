import { z } from "zod";

import { imageSchema } from "./content";

/**
 * The store's contract. The admin app will own this data; until it is connected
 * the seed catalogue (clearly marked as sample stock) implements the same shapes.
 * Money is always in minor units (kobo) to avoid rounding, with its currency.
 */

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const text = z.string().trim().min(1);

export const moneySchema = z.object({
  /** Minor units: ₦5,000 is 500000. */
  amount: z.number().int().nonnegative(),
  currency: z.literal("NGN"),
});

export const stockStatuses = ["in-stock", "low-stock", "sold-out"] as const;
export const stockSchema = z.enum(stockStatuses);

/** Drawn when a product has no photograph yet, so the shelf never shows an empty box. */
export const productArts = [
  "hymnal",
  "bible",
  "prayer-book",
  "gown",
  "head-cover",
  "candle",
  "mug",
  "tote",
  "pin",
  "diary",
  "brochure",
  "calendar",
] as const;

export const productCategorySchema = z.object({
  slug,
  name: text,
  description: text,
});

export const productOptionSchema = z.object({
  id: slug,
  label: text,
  stock: stockSchema,
});

export const productSchema = z
  .object({
    slug,
    name: text,
    categorySlug: slug,
    /** One line for the shelf. */
    summary: text,
    description: z.array(text).min(1),
    price: moneySchema,
    /** Was-price, shown struck through when the item is reduced. */
    compareAt: moneySchema.nullable(),
    images: z.array(imageSchema),
    art: z.enum(productArts),
    /** e.g. "Size" with S–XXL. A product without options is bought as it is. */
    option: z.object({ name: text, values: z.array(productOptionSchema).min(1) }).nullable(),
    stock: stockSchema,
    badge: z.enum(["New", "Limited edition", "Centenary"]).nullable(),
    featured: z.boolean(),
    details: z.array(z.object({ label: text, value: text })),
  })
  .refine((p) => !p.compareAt || p.compareAt.amount > p.price.amount, {
    message: "A was-price must be higher than the price",
    path: ["compareAt"],
  });

export const fulfilmentMethods = ["collect", "deliver"] as const;

/** What the checkout sends: product references only; the server re-prices every line. */
export const orderDraftSchema = z
  .object({
    lines: z
      .array(
        z.object({
          productSlug: slug,
          optionId: slug.nullable(),
          quantity: z.number().int().min(1).max(20),
        }),
      )
      .min(1, "Your bag is empty."),
    contact: z.object({
      name: z.string().trim().min(2, "Please enter your full name."),
      email: z.email("Please enter a valid email address."),
      phone: z
        .string()
        .trim()
        .regex(/^\+?\d[\d\s-]{7,}$/, "Please enter a phone number we can call."),
    }),
    fulfilment: z.enum(fulfilmentMethods),
    address: z
      .object({
        line1: z.string().trim(),
        city: z.string().trim(),
        state: z.string().trim(),
      })
      .nullable(),
    note: z.string().trim().max(500).optional(),
  })
  .superRefine((order, ctx) => {
    if (order.fulfilment !== "deliver") return;
    const a = order.address;
    if (!a?.line1)
      ctx.addIssue({
        code: "custom",
        path: ["address", "line1"],
        message: "Please enter the street address.",
      });
    if (!a?.city)
      ctx.addIssue({ code: "custom", path: ["address", "city"], message: "Please enter the town or city." });
    if (!a?.state)
      ctx.addIssue({ code: "custom", path: ["address", "state"], message: "Please choose the state." });
  });

export type Money = z.infer<typeof moneySchema>;
export type StockStatus = z.infer<typeof stockSchema>;
export type ProductArt = (typeof productArts)[number];
export type ProductCategory = z.infer<typeof productCategorySchema>;
export type ProductOption = z.infer<typeof productOptionSchema>;
export type Product = z.infer<typeof productSchema>;
export type FulfilmentMethod = (typeof fulfilmentMethods)[number];
export type OrderDraft = z.infer<typeof orderDraftSchema>;

export interface OrderConfirmation {
  reference: string;
  total: Money;
}
