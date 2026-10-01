import "server-only";

import { cache } from "react";

import { createHttpContentRepository } from "./adapters/http-content/repository";
import { createSeedContentRepository } from "./adapters/seed/repository";
import type { ContentRepository } from "./repositories";

/**
 * The content source for Server Components. If an API base URL is configured,
 * it uses the HTTP content adapter; otherwise, it falls back to the seed adapter.
 */
export const getContent = cache((): ContentRepository => {
  const useHttp =
    Boolean(process.env.API_BASE_URL) ||
    Boolean(process.env.NEXT_PUBLIC_API_BASE_URL) ||
    process.env.USE_HTTP_CONTENT === "true";

  return useHttp ? createHttpContentRepository() : createSeedContentRepository();
});
