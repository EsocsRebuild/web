import { beforeEach, describe, expect, it, vi } from "vitest";

import { createApiClient } from "@/lib/api-client";
import { isSocialError } from "../../errors";
import { createHttpSocialRepository } from "./repository";

describe("HttpSocialRepository", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("subscribes to newsletter via POST /public/newsletter", async () => {
    const postSpy = vi.fn().mockResolvedValue({ data: { success: true } });
    const mockClient = { post: postSpy } as unknown as ReturnType<typeof createApiClient>;

    const repo = createHttpSocialRepository({ client: mockClient, storage: null });
    await repo.subscribeToNewsletter({ email: "test@example.com", name: "Brother John" });

    expect(postSpy).toHaveBeenCalledWith("/public/newsletter", {
      email: "test@example.com",
      name: "Brother John",
    });
  });

  it("rejects invalid email address before sending newsletter request", async () => {
    const postSpy = vi.fn();
    const mockClient = { post: postSpy } as unknown as ReturnType<typeof createApiClient>;

    const repo = createHttpSocialRepository({ client: mockClient, storage: null });

    try {
      await repo.subscribeToNewsletter({ email: "not-an-email" });
      expect.fail("Expected validation error");
    } catch (err) {
      expect(isSocialError(err, "validation")).toBe(true);
      expect(postSpy).not.toHaveBeenCalled();
    }
  });

  it("submits prayer request via POST /public/prayer-requests", async () => {
    const postSpy = vi.fn().mockResolvedValue({ data: { id: "req-1" } });
    const mockClient = { post: postSpy } as unknown as ReturnType<typeof createApiClient>;

    const repo = createHttpSocialRepository({ client: mockClient, storage: null });
    await repo.submitPrayerRequest({
      name: "Sister Mary",
      contact: "mary@example.com",
      request: "Please pray for travelling mercies and peace in our home.",
    });

    expect(postSpy).toHaveBeenCalledWith("/public/prayer-requests", {
      name: "Sister Mary",
      email: "mary@example.com",
      phoneNumber: null,
      request: "Please pray for travelling mercies and peace in our home.",
      isAnonymous: false,
      shareOnPrayerWall: true,
    });
  });

  it("supports demo sign in when outside production", async () => {
    const mockClient = {
      post: vi.fn().mockRejectedValue(new Error("API not up")),
    } as unknown as ReturnType<typeof createApiClient>;

    const repo = createHttpSocialRepository({ client: mockClient, storage: null, allowDemoSignIn: true });

    await repo.requestCode("member@example.com");
    const member = await repo.verifyCode("member@example.com", "000000", "Faithful Member");

    expect(member.contact).toBe("member@example.com");
    expect(member.displayName).toBe("Faithful Member");

    const session = await repo.getSession();
    expect(session?.displayName).toBe("Faithful Member");

    await repo.signOut();
    expect(await repo.getSession()).toBeNull();
  });
});
