import "server-only";

import { cache } from "react";

import { createSeedContentRepository } from "./adapters/seed/repository";
import type { ContentRepository } from "./repositories";

/**
 * The content source for Server Components. Today it is the validated legacy seed;
 * the Payload adapter replaces this one line.
 */
export const getContent = cache((): ContentRepository => createSeedContentRepository());
