"use client";

import { createMockOrderRepository } from "./adapters/mock-orders/repository";
import type { OrderRepository } from "./repositories";
import type { Product } from "./schema/store";

function browserStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * Ordering for Client Components. Device-local until the admin app is connected;
 * production builds refuse orders with "the store opens soon" rather than taking
 * one that nobody will fulfil. The admin app's adapter replaces this function body.
 */
export function getOrders(catalogue: Product[]): OrderRepository {
  return createMockOrderRepository({
    catalogue,
    allowOrders: process.env.NODE_ENV !== "production",
    storage: typeof window === "undefined" ? null : browserStorage(),
  });
}
