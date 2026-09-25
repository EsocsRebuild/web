import { describe, expect, it, vi } from "vitest";

import { isSocialError } from "../../errors";
import { createMockSocialRepository, DEMO_CODE } from "./repository";

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
  };
}

const create = (overrides: Parameters<typeof createMockSocialRepository>[0] = {}) =>
  createMockSocialRepository({
    latency: [0, 0],
    allowDemoSignIn: true,
    storage: memoryStorage(),
    ...overrides,
  });

async function signedIn(repo = create()) {
  await repo.requestCode("ada@example.org");
  await repo.verifyCode("ada@example.org", DEMO_CODE, "Ada");
  return repo;
}

async function expectCode(promise: Promise<unknown>, code: Parameters<typeof isSocialError>[1]) {
  const error = await promise.then(
    () => null,
    (e: unknown) => e,
  );
  expect(isSocialError(error, code), `expected SocialError(${code}), got ${String(error)}`).toBe(true);
}

describe("sign-in", () => {
  it("is unavailable unless demo sign-in is allowed", async () => {
    const repo = create({ allowDemoSignIn: false });
    await expectCode(repo.requestCode("ada@example.org"), "unavailable");
  });

  it("validates the contact and the code", async () => {
    const repo = create();
    await expectCode(repo.requestCode("not a contact"), "validation");
    await repo.requestCode("+234 808 256 3457");
    await expectCode(repo.verifyCode("+234 808 256 3457", "123456"), "invalid-code");
    const member = await repo.verifyCode("+234 808 256 3457", DEMO_CODE, "Ada");
    expect(member.displayName).toBe("Ada");
    expect(await repo.getSession()).toEqual(member);
  });

  it("welcomes a new member once", async () => {
    const repo = await signedIn();
    await repo.signOut();
    await repo.requestCode("ada@example.org");
    await repo.verifyCode("ada@example.org", DEMO_CODE);
    expect((await repo.listNotifications()).filter((n) => n.kind === "welcome")).toHaveLength(1);
  });
});

describe("member-only actions", () => {
  it("require a session", async () => {
    const repo = create();
    await expectCode(repo.setReaction("post-1", "amen"), "unauthenticated");
    await expectCode(repo.addComment("post-1", "Amen"), "unauthenticated");
    await expectCode(repo.setFollowing("women", true), "unauthenticated");
    await expectCode(repo.setSaved("post-1", true), "unauthenticated");
    await expectCode(repo.setRsvp("easter-sunday-2027", "going"), "unauthenticated");
  });
});

describe("reactions", () => {
  it("counts only real reactions and allows one per member", async () => {
    const repo = await signedIn();
    expect((await repo.getReactions("post-1")).counts).toEqual({ amen: 0, love: 0, praise: 0 });
    await repo.setReaction("post-1", "amen");
    const changed = await repo.setReaction("post-1", "praise");
    expect(changed).toEqual({ counts: { amen: 0, love: 0, praise: 1 }, mine: "praise" });
    expect((await repo.setReaction("post-1", null)).counts.praise).toBe(0);
  });
});

describe("comments", () => {
  it("threads replies one level deep", async () => {
    const repo = await signedIn();
    const top = await repo.addComment("post-1", "Glory to God");
    const reply = await repo.addComment("post-1", "Amen", top.id);
    const nested = await repo.addComment("post-1", "Amen again", reply.id);
    expect(nested.parentId).toBe(top.id);
    expect(await repo.listComments("post-1")).toHaveLength(3);
  });

  it("rejects empty or oversized comments", async () => {
    const repo = await signedIn();
    await expectCode(repo.addComment("post-1", "   "), "validation");
    await expectCode(repo.addComment("post-1", "x".repeat(2001)), "validation");
  });

  it("edits and deletes only your own comments, removing replies with them", async () => {
    const repo = await signedIn();
    const top = await repo.addComment("post-1", "First");
    await repo.addComment("post-1", "Reply", top.id);
    const edited = await repo.editComment(top.id, "First, edited");
    expect(edited.editedAt).not.toBeNull();
    await repo.deleteComment(top.id);
    expect(await repo.listComments("post-1")).toEqual([]);
    await expectCode(repo.deleteComment("missing"), "not-found");
  });
});

describe("follow, save, RSVP and notifications", () => {
  it("toggles idempotently", async () => {
    const repo = await signedIn();
    await repo.setFollowing("women", true);
    await repo.setFollowing("women", true);
    expect(await repo.listFollowing()).toEqual(["women"]);
    await repo.setSaved("post-1", true);
    await repo.setSaved("post-1", false);
    expect(await repo.listSaved()).toEqual([]);
    await repo.setRsvp("easter-sunday-2027", "going");
    expect(await repo.getRsvp("easter-sunday-2027")).toBe("going");
    await repo.markNotificationsRead();
    expect((await repo.listNotifications()).every((n) => n.read)).toBe(true);
  });

  it("hides member data after sign-out", async () => {
    const repo = await signedIn();
    await repo.setFollowing("women", true);
    await repo.signOut();
    expect(await repo.listFollowing()).toEqual([]);
    expect(await repo.getRsvp("easter-sunday-2027")).toBeNull();
  });
});

describe("prayer requests", () => {
  it("accepts a request without signing in, and validates it", async () => {
    const repo = create();
    await repo.submitPrayerRequest({ request: "Please pray for my family." });
    await expectCode(repo.submitPrayerRequest({ request: " " }), "validation");
  });

  it("is unavailable where the demo is off", async () => {
    await expectCode(
      create({ allowDemoSignIn: false }).submitPrayerRequest({ request: "Pray for me" }),
      "unavailable",
    );
  });
});

describe("persistence and reliability", () => {
  it("restores state from storage", async () => {
    const storage = memoryStorage();
    const first = await signedIn(create({ storage }));
    await first.setFollowing("youth", true);
    const second = create({ storage });
    expect(await second.listFollowing()).toEqual(["youth"]);
  });

  it("survives corrupt storage", async () => {
    const storage = memoryStorage();
    storage.setItem("esocs:social:v1", "{not json");
    expect(await create({ storage }).getSession()).toBeNull();
  });

  it("fails with a retryable network error at the configured rate", async () => {
    const repo = create({ failureRate: 1 });
    await expectCode(repo.getSession(), "network");
  });

  it("notifies subscribers on change and stops after unsubscribe", async () => {
    const repo = await signedIn();
    const listener = vi.fn();
    const unsubscribe = repo.subscribe(listener);
    await repo.setSaved("post-1", true);
    unsubscribe();
    await repo.setSaved("post-2", true);
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
