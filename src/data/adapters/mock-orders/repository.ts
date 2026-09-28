import { CommerceError } from "../../errors";
import { priceBag } from "../../pricing";
import type { OrderRepository } from "../../repositories";
import { orderDraftSchema, type OrderConfirmation, type OrderDraft, type Product } from "../../schema/store";

/**
 * Device-local ordering, so every checkout state (invalid, sold out, network
 * failure, confirmed, not yet open) is designed and tested before the admin app
 * is connected. It validates and re-prices exactly as the server will. Orders are
 * refused with "unavailable" where `allowOrders` is off, which is every
 * production build: nobody can be charged, or believe they have ordered, before
 * the store opens.
 */
export interface MockOrderOptions {
  catalogue: Product[];
  allowOrders?: boolean;
  storage?: Pick<Storage, "getItem" | "setItem"> | null;
  storageKey?: string;
  latency?: [min: number, max: number];
  failureRate?: number;
  now?: () => Date;
  random?: () => number;
}

export function createMockOrderRepository(options: MockOrderOptions): OrderRepository {
  const {
    catalogue,
    allowOrders = false,
    storage = null,
    storageKey = "esocs:orders:v1",
    latency = [300, 700],
    failureRate = 0,
    now = () => new Date(),
    random = Math.random,
  } = options;
  const bySlug = new Map(catalogue.map((p) => [p.slug, p]));

  return {
    async placeOrder(draft: OrderDraft): Promise<OrderConfirmation> {
      const [min, max] = latency;
      if (max > 0) await new Promise((r) => setTimeout(r, min + random() * (max - min)));

      const parsed = orderDraftSchema.safeParse(draft);
      if (!parsed.success) {
        const fields = Object.fromEntries(parsed.error.issues.map((i) => [i.path.join("."), i.message]));
        throw new CommerceError(
          "validation",
          parsed.error.issues[0]?.message ?? "Please check your details.",
          fields,
        );
      }
      if (!allowOrders) {
        throw new CommerceError("unavailable", "Online orders open when the church store launches.");
      }
      if (random() < failureRate) {
        throw new CommerceError("network", "We couldn't reach the store. Please try again.");
      }

      const bag = priceBag(parsed.data.lines, bySlug);
      const unavailable = bag.lines.filter((l) => !l.available);
      if (unavailable.length || bag.lines.length !== parsed.data.lines.length) {
        throw new CommerceError(
          "sold-out",
          `${unavailable.map((l) => l.product.name).join(", ") || "An item"} is no longer available.`,
        );
      }

      const reference = `ESOCS-${now().getTime().toString(36).toUpperCase().slice(-6)}`;
      try {
        const saved = JSON.parse(storage?.getItem(storageKey) ?? "[]") as unknown[];
        storage?.setItem(
          storageKey,
          JSON.stringify([
            ...saved,
            { reference, at: now().toISOString(), order: parsed.data, total: bag.subtotal },
          ]),
        );
      } catch {
        // Storage blocked: the confirmation still stands for this session.
      }
      return { reference, total: bag.subtotal };
    },
  };
}
