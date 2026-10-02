export interface PageMeta {
  page?: number;
  pageSize?: number;
  total?: number;
  totalCount?: number;
  hasMore?: boolean;
  nextCursor?: string | null;
  [key: string]: unknown;
}

export interface ApiResponse<T, M = PageMeta> {
  data: T;
  meta?: M;
}

export interface ApiClientConfig {
  baseUrl?: string;
  tenantSlug?: string;
  getToken?: () => string | null | undefined | Promise<string | null | undefined>;
  defaultHeaders?: Record<string, string>;
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  params?: Record<string, string | number | boolean | undefined | null | Array<string | number>>;
  token?: string | null;
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
}

export class ApiClientError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields: Record<string, string[]>;
  readonly reason?: string;
  readonly detail?: string;

  constructor(options: {
    status: number;
    code: string;
    message: string;
    fields?: Record<string, string[]>;
    reason?: string;
    detail?: string;
  }) {
    super(options.message);
    this.name = "ApiClientError";
    this.status = options.status;
    this.code = options.code;
    this.fields = options.fields ?? {};
    this.reason = options.reason;
    this.detail = options.detail;
  }

  get isNotFound(): boolean {
    return this.status === 404 || this.code === "NOT_FOUND";
  }

  get isUnauthorized(): boolean {
    return this.status === 401 || this.code === "UNAUTHENTICATED";
  }

  get isForbidden(): boolean {
    return this.status === 403 || this.code === "FORBIDDEN";
  }

  get isValidation(): boolean {
    return this.status === 400 || this.status === 422 || this.code === "VALIDATION";
  }

  get isConflict(): boolean {
    return this.status === 409 || this.code === "CONFLICT";
  }
}

export const isApiClientError = (error: unknown): error is ApiClientError => error instanceof ApiClientError;

function normalizeUrl(baseUrl: string, path: string, params?: RequestOptions["params"]): string {
  const base = baseUrl.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${base}${normalizedPath}`);

  if (params) {
    for (const [key, val] of Object.entries(params)) {
      if (val === undefined || val === null || val === "") continue;
      if (Array.isArray(val)) {
        for (const item of val) {
          if (item !== undefined && item !== null) {
            url.searchParams.append(key, String(item));
          }
        }
      } else {
        url.searchParams.set(key, String(val));
      }
    }
  }

  return url.toString();
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly tenantSlug: string;
  private readonly getToken?: () => string | null | undefined | Promise<string | null | undefined>;
  private readonly defaultHeaders: Record<string, string>;

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl =
      config.baseUrl ??
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      process.env.API_BASE_URL ??
      "http://localhost:5080/api/v1";
    this.tenantSlug =
      config.tenantSlug ?? process.env.NEXT_PUBLIC_TENANT_SLUG ?? process.env.TENANT_SLUG ?? "esocs";
    this.getToken = config.getToken;
    this.defaultHeaders = config.defaultHeaders ?? {};
  }

  async request<T, M = PageMeta>(
    path: string,
    method: string,
    body?: unknown,
    options: RequestOptions = {},
  ): Promise<ApiResponse<T, M>> {
    const { params, token, headers: customHeaders, next, cache, ...fetchInit } = options;
    const url = normalizeUrl(this.baseUrl, path, params);

    const headers = new Headers(this.defaultHeaders);
    headers.set("Accept", "application/json");
    headers.set("X-Tenant", this.tenantSlug);

    const resolvedToken = token !== undefined ? token : this.getToken ? await this.getToken() : null;
    if (resolvedToken) {
      headers.set("Authorization", `Bearer ${resolvedToken}`);
    }

    if (customHeaders) {
      const extra = new Headers(customHeaders);
      extra.forEach((value, key) => headers.set(key, value));
    }

    let serializedBody: BodyInit | undefined;
    if (body !== undefined && body !== null) {
      if (typeof body === "string" || body instanceof FormData || body instanceof Blob) {
        serializedBody = body as BodyInit;
      } else {
        headers.set("Content-Type", "application/json");
        serializedBody = JSON.stringify(body);
      }
    }

    const init: RequestInit & { next?: { revalidate?: number | false; tags?: string[] } } = {
      ...fetchInit,
      method,
      headers,
      body: serializedBody,
      cache,
      next,
    };

    let response: Response;
    try {
      response = await fetch(url, init);
    } catch (err) {
      throw new ApiClientError({
        status: 0,
        code: "NETWORK_ERROR",
        message: err instanceof Error ? err.message : "Network error occurred while calling the API",
      });
    }

    if (response.status === 204) {
      return { data: null as unknown as T };
    }

    const contentType = response.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json") || contentType.includes("problem+json");

    if (!response.ok) {
      if (isJson) {
        try {
          const json = await response.json();
          // Wire convention: { error: { code, message, fields, reason } }
          if (json?.error && typeof json.error === "object") {
            const err = json.error;
            throw new ApiClientError({
              status: response.status,
              code: err.code || "UNKNOWN_ERROR",
              message: err.message || response.statusText || "Request failed",
              fields: err.fields ?? {},
              reason: err.reason,
            });
          }
          // RFC 9457 Problem Details: { type, title, status, code, detail, errors }
          const title = json.title ?? json.message ?? response.statusText;
          const detail = json.detail;
          const code = json.code ?? (response.status === 404 ? "NOT_FOUND" : "API_ERROR");
          const fields: Record<string, string[]> = {};
          if (json.errors && typeof json.errors === "object") {
            for (const [key, val] of Object.entries(json.errors)) {
              fields[key] = Array.isArray(val) ? val.map(String) : [String(val)];
            }
          }
          throw new ApiClientError({
            status: response.status,
            code,
            message: detail || title || "Request failed",
            fields,
            detail,
          });
        } catch (parseOrThrowErr) {
          if (parseOrThrowErr instanceof ApiClientError) {
            throw parseOrThrowErr;
          }
        }
      }

      const text = await response.text().catch(() => "");
      throw new ApiClientError({
        status: response.status,
        code: response.status === 404 ? "NOT_FOUND" : "HTTP_ERROR",
        message: text || response.statusText || `Request failed with status ${response.status}`,
      });
    }

    if (!isJson) {
      return { data: (await response.text()) as unknown as T };
    }

    const payload = await response.json();
    if (payload && typeof payload === "object" && "data" in payload) {
      return {
        data: payload.data as T,
        meta: payload.meta as M | undefined,
      };
    }

    return {
      data: payload as T,
    };
  }

  async get<T, M = PageMeta>(path: string, options?: RequestOptions): Promise<ApiResponse<T, M>> {
    return this.request<T, M>(path, "GET", undefined, options);
  }

  async post<T, M = PageMeta>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<ApiResponse<T, M>> {
    return this.request<T, M>(path, "POST", body, options);
  }

  async put<T, M = PageMeta>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<ApiResponse<T, M>> {
    return this.request<T, M>(path, "PUT", body, options);
  }

  async patch<T, M = PageMeta>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<ApiResponse<T, M>> {
    return this.request<T, M>(path, "PATCH", body, options);
  }

  async delete<T, M = PageMeta>(path: string, options?: RequestOptions): Promise<ApiResponse<T, M>> {
    return this.request<T, M>(path, "DELETE", undefined, options);
  }

  async getData<T>(path: string, options?: RequestOptions): Promise<T> {
    const res = await this.get<T>(path, options);
    return res.data;
  }
}

export function createApiClient(config?: ApiClientConfig): ApiClient {
  return new ApiClient(config);
}

export const apiClient = new ApiClient();
