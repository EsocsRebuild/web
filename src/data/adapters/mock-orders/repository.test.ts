import { describe, expect, it } from "vitest";

import { isCommerceError } from "../../errors";
import type { OrderDraft } from "../../schema/store";
import { createSeedStoreRepository } from "../seed-store/repository";

import { createMockOrderRepository } from "./repository";

const catalogue = createSeedStoreRepository().listProducts();

const draft = (overrides: Partial<OrderDraft> = {}): OrderDraft => ({
  lines: [{ productSlug: "esocs-hymn-book-english", optionId: null, quantity: 2 }],
  contact: { name: "Ada Obi", email: "ada@example.org", phone: "+234 808 000 0000" },
  fulfilment: "collect",
  address: null,
  ...overrides,
});

const create = (allowOrders = true) =>
  createMockOrderRepository({ catalogue, allowOrders, latency: [0, 0], now: () => new Date(0) });

async function codeOf(promise: Promise<unknown>) {
  try {
    await promise;
  } catch (error) {
    return isCommerceError(error) ? error.code : "other";
  }
  return "resolved";
}

describe("mock orders", () => {
  it("confirms a valid order with a reference and the re-priced total", async () => {
    const confirmation = await create().placeOrder(draft());
    expect(confirmation.reference).toMatch(/^ESOCS-/);
    expect(confirmation.total.amount).toBe(2 * 5000 * 100);
  });

  it("needs an address for delivery, and reports the fields", async () => {
    try {
      await create().placeOrder(draft({ fulfilment: "deliver", address: null }));
      throw new Error("expected a validation error");
    } catch (error) {
      expect(isCommerceError(error, "validation")).toBe(true);
      if (isCommerceError(error)) expect(Object.keys(error.fields)).toContain("address.line1");
    }
  });

  it("refuses sold-out items", async () => {
    expect(
      await codeOf(
        create().placeOrder(
          draft({ lines: [{ productSlug: "crest-lapel-pin", optionId: null, quantity: 1 }] }),
        ),
      ),
    ).toBe("sold-out");
  });

  it("refuses every order where orders are not open (production)", async () => {
    expect(await codeOf(create(false).placeOrder(draft()))).toBe("unavailable");
  });
});
