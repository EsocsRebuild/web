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
  (error instanceof SocialError ||
    (typeof error === "object" && error !== null && (error as { name?: string }).name === "SocialError")) &&
  (!code || (error as { code?: SocialErrorCode }).code === code);

export type CommerceErrorCode =
  /** Online orders are not switched on in this environment. */
  | "unavailable"
  | "validation"
  /** Something in the bag sold out after it was added. */
  | "sold-out"
  | "network";

export class CommerceError extends Error {
  constructor(
    readonly code: CommerceErrorCode,
    message: string,
    /** Field path → message, for validation errors. */
    readonly fields: Record<string, string> = {},
  ) {
    super(message);
    this.name = "CommerceError";
  }
}

export const isCommerceError = (error: unknown, code?: CommerceErrorCode): error is CommerceError =>
  (error instanceof CommerceError ||
    (typeof error === "object" && error !== null && (error as { name?: string }).name === "CommerceError")) &&
  (!code || (error as { code?: CommerceErrorCode }).code === code);
