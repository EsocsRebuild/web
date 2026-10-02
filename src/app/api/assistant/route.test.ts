import { describe, expect, it } from "vitest";

import { POST } from "./route";

describe("POST /api/assistant", () => {
  it("streams assistant response given a prompt", async () => {
    const req = new Request("http://localhost:3000/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "Where is the headquarters?" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const text = await res.text();
    expect(text.length).toBeGreaterThan(0);
  });

  it("handles messages array format from useChat", async () => {
    const req = new Request("http://localhost:3000/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: "How do I give?" }],
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const text = await res.text();
    expect(text.length).toBeGreaterThan(0);
  });
});
