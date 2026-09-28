"use client";

import type { SocialRepository } from "./repositories";

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
 *
 * Loaded on demand: the adapter and the schemas it validates with are fetched the
 * first time anything asks for them (or when warmed with `preloadSocial`), so they
 * never weigh on a page's first load. Every method is asynchronous already, so the
 * stand-in returned here simply waits for the real one.
 */
let loading: Promise<SocialRepository> | null = null;

function load(): Promise<SocialRepository> {
  loading ??= import("./adapters/mock-social/repository").then(({ createMockSocialRepository }) => {
    const isProduction = process.env.NODE_ENV === "production";
    const failureRate = isProduction ? 0 : Number(process.env.NEXT_PUBLIC_SOCIAL_FAILURE_RATE ?? 0);
    return createMockSocialRepository({
      storage: typeof window === "undefined" ? null : browserStorage(),
      allowDemoSignIn: !isProduction,
      failureRate: Number.isFinite(failureRate) ? failureRate : 0,
    });
  });
  return loading;
}

let facade: SocialRepository | null = null;

export function getSocial(): SocialRepository {
  facade ??= new Proxy({} as SocialRepository, {
    get(_, name: string) {
      if (name === "subscribe") {
        return (listener: () => void) => {
          let off: () => void = () => {};
          let cancelled = false;
          void load().then((repo) => {
            if (!cancelled) off = repo.subscribe(listener);
          });
          return () => {
            cancelled = true;
            off();
          };
        };
      }
      return (...args: unknown[]) =>
        load().then((repo) =>
          (repo[name as keyof SocialRepository] as (...a: unknown[]) => unknown)(...args),
        );
    },
  });
  return facade;
}
