import { describe, expect, it, vi } from "vitest";

import { createApiClient } from "@/lib/api-client";
import { createHttpContentRepository } from "./repository";

describe("HttpContentRepository", () => {
  it("initializes with seed data and allows querying units", () => {
    const repo = createHttpContentRepository();
    const root = repo.getUnit("esocs");
    expect(root).not.toBeNull();
    expect(root?.name).toContain("Cherubim & Seraphim");

    const units = repo.listUnits({ kind: "holy-order" });
    expect(units).toHaveLength(1);
  });

  it("syncs units from backend API when available", async () => {
    const mockUnits = [
      {
        slug: "new-branch",
        kind: "branch",
        name: "New Jerusalem Branch",
        parentSlug: "esocs",
        locality: "Lagos",
      },
    ];

    const getSpy = vi.fn().mockImplementation((path: string) => {
      if (path === "/public/units") {
        return Promise.resolve({ data: mockUnits });
      }
      return Promise.reject(new Error("Not found"));
    });

    const mockClient = { get: getSpy } as unknown as ReturnType<typeof createApiClient>;
    const repo = createHttpContentRepository({ client: mockClient });

    await repo.syncUnits();

    const unit = repo.getUnit("new-branch");
    expect(unit).not.toBeNull();
    expect(unit?.name).toBe("New Jerusalem Branch");
    expect(unit?.locality).toBe("Lagos");
  });

  it("syncs posts from backend API and reflects in feed", async () => {
    const mockPosts = [
      {
        id: "post-1",
        slug: "easter-message-2026",
        title: "Easter Message 2026",
        category: "news",
        publishedAt: "2026-04-05",
        body: ["Christ is risen."],
      },
    ];

    const getSpy = vi.fn().mockImplementation((path: string) => {
      if (path === "/public/content/posts") {
        return Promise.resolve({ data: mockPosts });
      }
      return Promise.reject(new Error("Not found"));
    });

    const mockClient = { get: getSpy } as unknown as ReturnType<typeof createApiClient>;
    const repo = createHttpContentRepository({ client: mockClient });

    await repo.syncPosts();

    const post = repo.getPost("easter-message-2026");
    expect(post).not.toBeNull();
    expect(post?.title).toBe("Easter Message 2026");

    const feed = repo.getFeed({ kind: "news" });
    expect(feed.items.some((p) => p.id === "easter-message-2026")).toBe(true);
  });

  it("gracefully tolerates API network failures during sync", async () => {
    const getSpy = vi.fn().mockRejectedValue(new Error("Network connection refused"));
    const mockClient = { get: getSpy } as unknown as ReturnType<typeof createApiClient>;

    const repo = createHttpContentRepository({ client: mockClient });
    await expect(repo.refresh()).resolves.toBeUndefined();

    // Still retains seed data
    expect(repo.getUnit("esocs")).not.toBeNull();
  });
});
