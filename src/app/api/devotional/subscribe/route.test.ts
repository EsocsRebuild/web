import { describe, expect, it } from "vitest";
import { POST, GET } from "./route";

describe("POST /api/devotional/subscribe", () => {
  it("rejects invalid email formats", async () => {
    const req = new Request("http://localhost/api/devotional/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "invalid-email" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.success).toBe(false);
  });

  it("subscribes valid emails successfully", async () => {
    const req = new Request("http://localhost/api/devotional/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "believer@mountzion.org", deliveryTime: "dawn" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.email).toBe("believer@mountzion.org");
    expect(data.deliveryTime).toBe("dawn");
  });

  it("returns active status on GET", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("active");
  });
});
