export type SocialErrorCode =
  /** Member accounts are not switched on in this environment. */
  | "unavailable"
  /** The request did not complete; safe to retry. */
  | "network"
  | "unauthenticated"
  | "invalid-code"
  | "not-found"
  | "forbidden"
  | "validation";

export class SocialError extends Error {
  constructor(
    readonly code: SocialErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "SocialError";
  }
}

export const isSocialError = (error: unknown, code?: SocialErrorCode): error is SocialError =>
  error instanceof SocialError && (!code || error.code === code);
