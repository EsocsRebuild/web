import "server-only";

import { cache } from "react";

import { createSeedStoreRepository } from "./adapters/seed-store/repository";
import type { StoreRepository } from "./repositories";

/**
 * The store catalogue for Server Components. Today it is the sample seed; the
 * admin app's adapter replaces this one line.
 */
export const getStore = cache((): StoreRepository => createSeedStoreRepository());
