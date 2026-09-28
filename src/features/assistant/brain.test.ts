import { describe, expect, it } from "vitest";

import type { SearchEntry } from "@/features/search/index-builder";

import { detectTopic, meaningfulWords, respond, searchIndex, topicReply } from "./brain";

const index: SearchEntry[] = [
  {
    kind: "page",
    title: "Ibadan Province",
    subtitle: "Province · Ibadan",
    href: "/church/ibadan-province",
    keywords: "Oyo",
  },
  {
    kind: "page",
    title: "Covenant House of Prayer",
    subtitle: "House of Prayer · Ibadan",
    href: "/church/covenant",
    keywords: "",
  },
  {
    kind: "page",
    title: "London Cathedral",
    subtitle: "Headquarters · London",
    href: "/church/london-cathedral",
    keywords: "United Kingdom",
  },
  {
    kind: "person",
    title: "Elder Moses Orimolade Tunolase",
    subtitle: "Founder · 1925 – 1933",
    href: "/leaders/moses",
    keywords: "Baba Aladura",
  },
  {
    kind: "person",
    title: "Elder (Dr.) David Bob-Manuel",
    subtitle: "Baba Aladura & Prelate · 2017 – present",
    href: "/leaders/bob-manuel",
    keywords: "Baba Aladura",
  },
  {
    kind: "event",
    title: "Christmas Day",
    subtitle: "25 December 2026",
    href: "/events/christmas-2026",
    keywords: "birth of our Lord",
  },
  {
    kind: "event",
    title: "Easter Sunday",
    subtitle: "28 March 2027",
    href: "/events/easter-2027",
    keywords: "resurrection",
  },
  {
    kind: "post",
    title: "Dedication of Covenant House of Prayer",
    subtitle: "Dedication · 3 June 2023",
    href: "/posts/covenant",
    keywords: "Ibadan Province",
  },
];

const ctx = {
  phones: [
    { label: "General enquiries", number: "+2348082563457", display: "+234 808 256 3457" },
    { label: "Counselling hotline", number: "+2349167678828", display: "+234 916 767 8828" },
  ],
  headquarters: { name: "National Headquarters", address: "9/11 Pearse Street, Surulere, Lagos" },
};

describe("understanding", () => {
  it("keeps only the words that carry meaning", () => {
    expect(meaningfulWords("Where is the nearest church in Ibadán?")).toEqual(["ibadan"]);
  });

  it("recognises what people ask about", () => {
    expect(detectTopic("I need someone to pray with me")).toBe("prayer");
    expect(detectTopic("How can I give an offering?")).toBe("give");
    expect(detectTopic("Can I buy a hymn book?")).toBe("store");
    expect(detectTopic("When is the next service?")).toBe("events");
    expect(detectTopic("I want to talk to a person")).toBe("contact");
    expect(detectTopic("Ibadan")).toBeNull();
  });
});

describe("searching the site's own index", () => {
  it("needs every word to match, titles first", () => {
    expect(searchIndex(index, "ibadan", { kinds: ["page"] }).map((e) => e.title)).toEqual([
      "Ibadan Province",
      "Covenant House of Prayer",
    ]);
    expect(searchIndex(index, "ibadan london")).toEqual([]);
  });

  it("matches the start of a word, but not tiny fragments", () => {
    expect(searchIndex(index, "lond").map((e) => e.title)).toEqual(["London Cathedral"]);
    expect(searchIndex(index, "lo")).toEqual([]);
  });
});

describe("replies", () => {
  it("finds churches for a town, with a way to see them all", () => {
    const reply = respond("Is there a church in Ibadan?", index, ctx);
    expect(reply.links.map((l) => l.href)).toEqual([
      "/church/ibadan-province",
      "/church/covenant",
      "/find?q=ibadan",
    ]);
  });

  it("answers a specific date question with that event", () => {
    expect(respond("When is Easter?", index, ctx).links.map((l) => l.href)).toEqual(["/events/easter-2027"]);
  });

  it("lists upcoming events and the full calendar", () => {
    const reply = topicReply("events", index, ctx);
    expect(reply.links.map((l) => l.label)).toEqual([
      "Christmas Day",
      "Easter Sunday",
      "The full church calendar",
    ]);
  });

  it("hands over to people with the church's real numbers", () => {
    const reply = respond("I want to talk to someone", index, ctx);
    expect(reply.text).toMatch(/automated guide/);
    expect(reply.links.filter((l) => l.kind === "phone").map((l) => l.href)).toEqual([
      "tel:+2348082563457",
      "tel:+2349167678828",
    ]);
  });

  it("offers the counselling hotline with prayer requests", () => {
    const reply = respond("Please pray for me", index, ctx);
    expect(reply.links.map((l) => l.href)).toEqual(["/prayer", "tel:+2349167678828"]);
  });

  it("names the current Baba Aladura", () => {
    expect(topicReply("leaders", index, ctx).links[0].href).toBe("/leaders/bob-manuel");
  });

  it("says plainly when it cannot help, and never invents an answer", () => {
    const reply = respond("zzqx", index, ctx);
    expect(reply.links).toEqual([]);
    expect(reply.suggestions).toContain("contact");
  });

  it("asks for patience while the directory loads", () => {
    expect(respond("Ibadan", null, ctx).text).toMatch(/loading/);
  });
});
