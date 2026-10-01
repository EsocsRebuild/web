import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClientError, createApiClient, isApiClientError } from "./api-client";

describe("ApiClient", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("appends X-Tenant header and unwrap enveloped responses", async () => {
    const mockData = { id: "test", name: "Test Unit" };
    const mockMeta = { page: 1, pageSize: 20, total: 1 };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ data: mockData, meta: mockMeta }),
    } as unknown as Response);

    const client = createApiClient({ baseUrl: "https://api.example.com", tenantSlug: "esocs" });
    const response = await client.get("/units/test", { params: { active: true, tags: ["a", "b"] } });

    expect(response.data).toEqual(mockData);
    expect(response.meta).toEqual(mockMeta);

    const [calledUrl, calledInit] = (global.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(calledUrl).toBe("https://api.example.com/units/test?active=true&tags=a&tags=b");
    const headers = calledInit.headers as Headers;
    expect(headers.get("X-Tenant")).toBe("esocs");
    expect(headers.get("Accept")).toBe("application/json");
  });

  it("injects Bearer token when provided in options or config", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ data: { id: "me" } }),
    } as unknown as Response);

    const clientWithToken = createApiClient({
      baseUrl: "https://api.example.com",
      getToken: () => "my-secret-token",
    });

    await clientWithToken.get("/me");
    const [, init1] = (global.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect((init1.headers as Headers).get("Authorization")).toBe("Bearer my-secret-token");

    // Option overrides getToken
    await clientWithToken.get("/me", { token: "override-token" });
    const [, init2] = (global.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[1];
    expect((init2.headers as Headers).get("Authorization")).toBe("Bearer override-token");
  });

  it("handles 204 No Content gracefully", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      headers: new Headers(),
    } as unknown as Response);

    const client = createApiClient();
    const res = await client.delete("/items/1");
    expect(res.data).toBeNull();
  });

  it("parses and throws backend standard error { error: { code, message, fields, reason } }", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      statusText: "Unprocessable Entity",
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({
        error: {
          code: "VALIDATION",
          message: "Please check the highlighted fields.",
          fields: { email: ["Invalid email address"] },
          reason: "contact.invalid_email",
        },
      }),
    } as unknown as Response);

    const client = createApiClient();

    try {
      await client.post("/subscribe", { email: "invalid" });
      expect.fail("Expected client.post to throw ApiClientError");
    } catch (err) {
      expect(isApiClientError(err)).toBe(true);
      const apiErr = err as ApiClientError;
      expect(apiErr.status).toBe(422);
      expect(apiErr.code).toBe("VALIDATION");
      expect(apiErr.isValidation).toBe(true);
      expect(apiErr.fields.email).toEqual(["Invalid email address"]);
      expect(apiErr.reason).toBe("contact.invalid_email");
    }
  });

  it("parses and throws RFC 9457 problem details", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
      headers: new Headers({ "content-type": "application/problem+json" }),
      json: async () => ({
        type: "https://tools.ietf.org/html/rfc9110#section-15.5.5",
        title: "Not Found",
        status: 404,
        code: "NOT_FOUND",
        detail: "Unit with slug 'invalid-slug' not found",
      }),
    } as unknown as Response);

    const client = createApiClient();

    try {
      await client.get("/units/invalid-slug");
      expect.fail("Expected client.get to throw ApiClientError");
    } catch (err) {
      expect(isApiClientError(err)).toBe(true);
      const apiErr = err as ApiClientError;
      expect(apiErr.status).toBe(404);
      expect(apiErr.isNotFound).toBe(true);
      expect(apiErr.message).toBe("Unit with slug 'invalid-slug' not found");
    }
  });

  it("handles network failure and wraps in ApiClientError", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Connection refused"));

    const client = createApiClient();

    try {
      await client.get("/health");
      expect.fail("Expected client.get to throw ApiClientError");
    } catch (err) {
      expect(isApiClientError(err)).toBe(true);
      const apiErr = err as ApiClientError;
      expect(apiErr.status).toBe(0);
      expect(apiErr.code).toBe("NETWORK_ERROR");
      expect(apiErr.message).toBe("Connection refused");
    }
  });

  it("provides getData shorthand helper", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ data: [{ id: "1" }, { id: "2" }] }),
    } as unknown as Response);

    const client = createApiClient();
    const data = await client.getData<Array<{ id: string }>>("/items");
    expect(data).toHaveLength(2);
    expect(data[0].id).toBe("1");
  });
});
