import "server-only";

import { cache } from "react";

import {
  createHttpContentRepository,
  type ExtendedHttpContentRepository,
} from "./adapters/http-content/repository";
import { createSeedContentRepository } from "./adapters/seed/repository";
import type { ContentRepository } from "./repositories";

let httpRepoInstance: ExtendedHttpContentRepository | null = null;

/**
 * The content source for Server Components. If an API base URL is configured,
 * it uses the HTTP content adapter; otherwise, it falls back to the seed adapter.
 */
export const getContent = cache((): ContentRepository => {
  const useHttp = process.env.USE_HTTP_CONTENT !== "false" && process.env.NODE_ENV !== "test";

  if (!useHttp) {
    return createSeedContentRepository();
  }

  if (!httpRepoInstance) {
    httpRepoInstance = createHttpContentRepository();
    httpRepoInstance.refresh().catch(() => {});
  }

  return httpRepoInstance;
});
