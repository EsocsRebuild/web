"use client";

import { createMockSocialRepository } from "./adapters/mock-social/repository";
import type { SocialRepository } from "./repositories";

let instance: SocialRepository | null = null;

function browserStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * The social source for Client Components. Device-local until the Payload backend
 * lands; demo sign-in (code 000000) is available outside production only, so a
 * production build shows "Member accounts are coming soon" instead of a fake login.
 */
export function getSocial(): SocialRepository {
  if (instance) return instance;
  const isProduction = process.env.NODE_ENV === "production";
  const failureRate = isProduction ? 0 : Number(process.env.NEXT_PUBLIC_SOCIAL_FAILURE_RATE ?? 0);
  instance = createMockSocialRepository({
    storage: typeof window === "undefined" ? null : browserStorage(),
    allowDemoSignIn: !isProduction,
    failureRate: Number.isFinite(failureRate) ? failureRate : 0,
  });
  return instance;
}
